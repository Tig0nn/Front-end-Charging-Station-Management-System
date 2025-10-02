import React from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Card,
  Button,
  Badge,
} from "react-bootstrap";

const UsersList = () => {
  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1>Users Management</h1>
              <p className="lead">Manage all registered users</p>
            </div>
            <Button variant="primary">Add New User</Button>
          </div>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5>All Users</h5>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Registration Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>John Doe</td>
                    <td>john.doe@email.com</td>
                    <td>+1234567890</td>
                    <td>
                      <Badge bg="success">Active</Badge>
                    </td>
                    <td>2024-01-15</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline-warning"
                        size="sm"
                        className="me-2"
                      >
                        Suspend
                      </Button>
                      <Button variant="outline-danger" size="sm">
                        Delete
                      </Button>
                    </td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>Jane Smith</td>
                    <td>jane.smith@email.com</td>
                    <td>+1234567891</td>
                    <td>
                      <Badge bg="success">Active</Badge>
                    </td>
                    <td>2024-02-20</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline-warning"
                        size="sm"
                        className="me-2"
                      >
                        Suspend
                      </Button>
                      <Button variant="outline-danger" size="sm">
                        Delete
                      </Button>
                    </td>
                  </tr>
                  <tr>
                    <td>3</td>
                    <td>Mike Johnson</td>
                    <td>mike.johnson@email.com</td>
                    <td>+1234567892</td>
                    <td>
                      <Badge bg="warning">Suspended</Badge>
                    </td>
                    <td>2024-03-01</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline-success"
                        size="sm"
                        className="me-2"
                      >
                        Activate
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

export default UsersList;
