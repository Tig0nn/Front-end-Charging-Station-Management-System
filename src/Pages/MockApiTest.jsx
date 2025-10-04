import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Badge,
  Spinner,
} from "react-bootstrap";
import {
  authAPI,
  usersAPI,
  stationsAPI,
  reportsAPI,
  isMockMode,
} from "../lib/apiServices.js";

const MockApiTest = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});

  // Test function wrapper
  const testApi = async (testName, apiCall) => {
    setLoading((prev) => ({ ...prev, [testName]: true }));
    setErrors((prev) => ({ ...prev, [testName]: null }));

    try {
      console.log(`🧪 Testing ${testName}...`);
      const result = await apiCall();
      setResults((prev) => ({ ...prev, [testName]: result }));
      console.log(`✅ ${testName} successful:`, result);
    } catch (error) {
      console.error(`❌ ${testName} failed:`, error);
      setErrors((prev) => ({ ...prev, [testName]: error.message }));
    } finally {
      setLoading((prev) => ({ ...prev, [testName]: false }));
    }
  };

  // Test cases
  const tests = {
    "Login Test": () =>
      authAPI.login({
        email: "admin@chargingstation.com",
        password: "123456",
      }),

    "Get Users": () => usersAPI.getAll(1, 5),

    "Get User by ID": () => usersAPI.getById(1),

    "Get Stations": () => stationsAPI.getAll(1, 5),

    "Get Station by ID": () => stationsAPI.getById(1),

    "Get Dashboard Reports": () => reportsAPI.getDashboard(),

    "Get Revenue Data": () => reportsAPI.getRevenue("monthly"),

    "Create New User": () =>
      usersAPI.create({
        name: "Test User",
        email: "test@example.com",
        phone: "0987654321",
        role: "Customer",
      }),

    "Create New Station": () =>
      stationsAPI.create({
        name: "Test Station",
        location: "Test Location, TP.HCM",
        latitude: 10.7749,
        longitude: 106.701,
        totalChargers: 2,
        availableChargers: 2,
        powerOutput: "22kW",
        connectorTypes: ["Type 2"],
        pricing: 5000,
      }),
  };

  const renderResult = (testName) => {
    const result = results[testName];
    const error = errors[testName];
    const isLoading = loading[testName];

    if (isLoading) {
      return (
        <div className="d-flex align-items-center">
          <Spinner animation="border" size="sm" className="me-2" />
          <span>Testing...</span>
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="danger" className="mb-0 p-2 small">
          {error}
        </Alert>
      );
    }

    if (result) {
      return (
        <div>
          <Badge bg="success" className="mb-2">
            Success
          </Badge>
          <pre
            className="bg-light p-2 small rounded"
            style={{ maxHeight: "200px", overflow: "auto" }}
          >
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      );
    }

    return <div className="text-muted">Not tested yet</div>;
  };

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">🧪 Mock API Testing Dashboard</h4>
              <Badge bg={isMockMode() ? "warning" : "primary"} className="fs-6">
                {isMockMode() ? "🎭 Mock Mode" : "🌐 Live API"}
              </Badge>
            </Card.Header>
            <Card.Body>
              <Alert variant="info">
                <strong>📋 Hướng dẫn sử dụng Mock API:</strong>
                <ul className="mb-0 mt-2">
                  <li>
                    <strong>Mock Mode:</strong> Thiết lập{" "}
                    <code>VITE_USE_MOCK_API=true</code> trong file .env
                  </li>
                  <li>
                    <strong>Live API:</strong> Thiết lập{" "}
                    <code>VITE_USE_MOCK_API=false</code> trong file .env
                  </li>
                  <li>
                    <strong>Login Test:</strong> Email:
                    admin@chargingstation.com, Password: 123456
                  </li>
                  <li>
                    <strong>Dữ liệu Mock:</strong> 4 users, 4 stations, reports
                    data
                  </li>
                </ul>
              </Alert>

              <Row>
                {Object.entries(tests).map(([testName, testFunction]) => (
                  <Col md={6} lg={4} key={testName} className="mb-4">
                    <Card className="h-100">
                      <Card.Header>
                        <h6 className="mb-0">{testName}</h6>
                      </Card.Header>
                      <Card.Body>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => testApi(testName, testFunction)}
                          disabled={loading[testName]}
                          className="mb-3 w-100"
                        >
                          {loading[testName] ? "Testing..." : "Run Test"}
                        </Button>
                        {renderResult(testName)}
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default MockApiTest;
