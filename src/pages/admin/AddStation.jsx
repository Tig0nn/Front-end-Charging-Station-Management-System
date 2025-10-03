import React, { useState } from "react";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router";

const AddStation = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    power: "",
    type: "AC",
    status: "active",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted:", formData);
    navigate("/admin/stations");
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1>Add New Charging Station</h1>
          <p className="lead">Create a new charging station</p>
        </Col>
      </Row>

      <Row>
        <Col md={8}>
          <Card>
            <Card.Header>
              <h5>Station Information</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Station Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter station name"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Location</Form.Label>
                      <Form.Control
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="Enter location"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Power Rating</Form.Label>
                      <Form.Control
                        type="number"
                        name="power"
                        value={formData.power}
                        onChange={handleChange}
                        placeholder="kW"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Type</Form.Label>
                      <Form.Select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                      >
                        <option value="AC">AC</option>
                        <option value="DC">DC</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Status</Form.Label>
                      <Form.Select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="maintenance">Maintenance</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex gap-2">
                  <Button type="submit" variant="primary">
                    Create Station
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => navigate("/admin/stations")}
                  >
                    Cancel
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AddStation;
