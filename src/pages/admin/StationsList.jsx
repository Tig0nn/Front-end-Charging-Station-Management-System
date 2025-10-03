import React from "react";
import { Container, Row, Col, Table, Card, Button } from "react-bootstrap";
import { Link } from "react-router";

const StationsList = () => {
  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1>Charging Stations</h1>
              <p className="lead">Manage all charging stations</p>
            </div>
            <Button as={Link} to="/admin/stations/add" variant="primary">
              Add New Station
            </Button>
          </div>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5>All Stations</h5>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Power</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>Station Alpha</td>
                    <td>Downtown Plaza</td>
                    <td>
                      <span className="badge bg-success">Active</span>
                    </td>
                    <td>50kW</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                      >
                        Edit
                      </Button>
                      <Button variant="outline-danger" size="sm">
                        Delete
                      </Button>
                    </td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>Station Beta</td>
                    <td>Shopping Mall</td>
                    <td>
                      <span className="badge bg-success">Active</span>
                    </td>
                    <td>25kW</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                      >
                        Edit
                      </Button>
                      <Button variant="outline-danger" size="sm">
                        Delete
                      </Button>
                    </td>
                  </tr>
                  <tr>
                    <td>3</td>
                    <td>Station Gamma</td>
                    <td>Airport Terminal</td>
                    <td>
                      <span className="badge bg-warning">Maintenance</span>
                    </td>
                    <td>75kW</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                      >
                        Edit
                      </Button>
                      <Button variant="outline-danger" size="sm">
                        Delete
                      </Button>
                    </td>
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

export default StationsList;
