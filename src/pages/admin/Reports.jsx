import React from "react";
import { Container, Row, Col, Card, Table } from "react-bootstrap";

const Reports = () => {
  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1>Reports & Analytics</h1>
          <p className="lead">View system reports and analytics</p>
        </Col>
      </Row>

      <Row className="mb-4 g-3">
        <Col md={3}>
          <Card className="h-100 text-center">
            <Card.Body className="d-flex flex-column justify-content-center">
              <Card.Title className="mb-3">Total Revenue</Card.Title>
              <h2 className="mb-2">$12,450</h2>
              <Card.Text className="text-muted">This month</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="h-100 text-center">
            <Card.Body className="d-flex flex-column justify-content-center">
              <Card.Title className="mb-3">Sessions</Card.Title>
              <h2 className="mb-2">1,248</h2>
              <Card.Text className="text-muted">This month</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="h-100 text-center">
            <Card.Body className="d-flex flex-column justify-content-center">
              <Card.Title className="mb-3">Energy Consumed</Card.Title>
              <h2 className="mb-2">15,678 kWh</h2>
              <Card.Text className="text-muted">This month</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="h-100 text-center">
            <Card.Body className="d-flex flex-column justify-content-center">
              <Card.Title className="mb-3">Average Session</Card.Title>
              <h2 className="mb-2">2.5 hours</h2>
              <Card.Text className="text-muted">Duration</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5>Top Performing Stations</h5>
            </Card.Header>
            <Card.Body>
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Station</th>
                    <th>Sessions</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Station Alpha</td>
                    <td>245</td>
                    <td>$3,450</td>
                  </tr>
                  <tr>
                    <td>Station Beta</td>
                    <td>198</td>
                    <td>$2,890</td>
                  </tr>
                  <tr>
                    <td>Station Gamma</td>
                    <td>156</td>
                    <td>$2,234</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Header>
              <h5>Recent Activity</h5>
            </Card.Header>
            <Card.Body>
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Activity</th>
                    <th>User</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>10:30 AM</td>
                    <td>Session Started</td>
                    <td>John Doe</td>
                  </tr>
                  <tr>
                    <td>10:15 AM</td>
                    <td>Session Completed</td>
                    <td>Jane Smith</td>
                  </tr>
                  <tr>
                    <td>09:45 AM</td>
                    <td>New User Registered</td>
                    <td>Mike Johnson</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Reports;
