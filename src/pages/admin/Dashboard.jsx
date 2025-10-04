import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import RevenueChart from "../../components/charts/RevenueChart.jsx";

const Dashboard = () => {
  const [username, setUsername] = React.useState("");

  React.useEffect(() => {
    // Try common places for session user info: sessionStorage, localStorage, JWT token
    const rawUser =
      sessionStorage.getItem("user") ||
      localStorage.getItem("user") ||
      sessionStorage.getItem("username") ||
      localStorage.getItem("username");

    if (rawUser) {
      try {
        const parsed = JSON.parse(rawUser);
        setUsername(
          parsed?.name || parsed?.username || parsed?.fullName || parsed
        );
      } catch {
        setUsername(rawUser);
      }
      return;
    }

    // If you store a JWT token, try to decode it and read a name/username claim
    const token =
      sessionStorage.getItem("token") || localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUsername(payload?.name || payload?.username || payload?.sub || "");
      } catch {
        // ignore decode errors
      }
    }
  }, []);

  return (
    <Container>
      <Row className="mb-3">
        <Col>
          <h1>Tổng quan hệ thống</h1>
          <p className="lead">
            Quản trị trung tâm EV Charging — Xin chào
            {username ? `, ${username}` : ""}
          </p>
        </Col>
      </Row>

      <Row className="g-3">
        <Col md={4}>
          <Card className="h-100 text-center">
            <Card.Body className="d-flex flex-column justify-content-center">
              <Card.Title className="mb-3">Tổng trạm sạc</Card.Title>
              <h2 className="mb-2">25</h2>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="h-100 text-center">
            <Card.Body className="d-flex flex-column justify-content-center">
              <Card.Title className="mb-3">Điểm sạc hoạt động</Card.Title>
              <h2 className="mb-2">128</h2>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="h-100 text-center">
            <Card.Body className="d-flex flex-column justify-content-center">
              <Card.Title className="mb-3">Tổng người dùng</Card.Title>
              <h2 className="mb-2">45</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Revenue Chart Section */}
      <Row className="mt-4">
        <Col>
          <RevenueChart />
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
