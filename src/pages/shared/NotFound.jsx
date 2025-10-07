import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router";

const NotFound = () => {
  return (
    <Container>
      <Row
        className="justify-content-center text-center"
        style={{ minHeight: "50vh", alignItems: "center" }}
      >
        <Col md={6}>
          <h1 className="display-1">404</h1>
          <h2>Page Not Found</h2>
          <p className="lead">The page you are looking for doesn't exist.</p>
          <Button as={Link} to="/" variant="primary" size="lg">
            Go Home
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound;
