import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";

const Dashboard = () => {
  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1>Admin Dashboard</h1>
          <p className="lead">Manage charging stations and users</p>
        </Col>
      </Row>

      <Row className="g-3">
        <Col md={3}>
          <Card className="h-100 text-center">
            <Card.Body className="d-flex flex-column justify-content-center">
              <Card.Title className="mb-3">Total Stations</Card.Title>
              <h2 className="mb-2">25</h2>
              <Card.Text className="text-muted">
                Active charging stations
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="h-100 text-center">
            <Card.Body className="d-flex flex-column justify-content-center">
              <Card.Title className="mb-3">Active Users</Card.Title>
              <h2 className="mb-2">128</h2>
              <Card.Text className="text-muted">Registered users</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="h-100 text-center">
            <Card.Body className="d-flex flex-column justify-content-center">
              <Card.Title className="mb-3">Today's Sessions</Card.Title>
              <h2 className="mb-2">45</h2>
              <Card.Text className="text-muted">Charging sessions</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="h-100 text-center">
            <Card.Body className="d-flex flex-column justify-content-center">
              <Card.Title className="mb-3">Revenue</Card.Title>
              <h2 className="mb-2">$1,250</h2>
              <Card.Text className="text-muted">Today's revenue</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
