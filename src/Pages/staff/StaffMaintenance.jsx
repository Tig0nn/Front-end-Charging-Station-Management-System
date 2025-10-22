        import React from "react";
import { Container, Row, Col, Card, Button, Table } from "react-bootstrap";

// Dữ liệu mẫu 
const maintenanceSchedule = [
  { id: 1, station: "Điểm sạc #1", date: "2025-11-10", type: "Kiểm tra định kỳ", status: "Đã lên lịch" },
  { id: 2, station: "Điểm sạc #4", date: "2025-11-12", type: "Sửa chữa khẩn cấp", status: "Đang thực hiện" },
  { id: 3, station: "Điểm sạc #2", date: "2025-10-28", type: "Nâng cấp phần mềm", status: "Hoàn thành" },
];

const StaffMaintenance = () => {
  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h4 className="mb-0">Quản lý Bảo trì</h4>
              <p className="text-muted small">
                Theo dõi và lên lịch bảo trì cho các điểm sạc.
              </p>
            </div>
            <Button variant="success">
              <i className="bi bi-plus-lg me-2"></i> Lên lịch mới
            </Button>
          </div>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Lịch trình sắp tới</h5>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Điểm sạc</th>
                    <th>Ngày dự kiến</th>
                    <th>Loại bảo trì</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {maintenanceSchedule.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.station}</td>
                      <td>{item.date}</td>
                      <td>{item.type}</td>
                      <td>{item.status}</td>
                      <td>
                        <Button variant="outline-secondary" size="sm">
                          Xem chi tiết
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
            <Card.Footer className="text-center text-muted">
              Hiển thị {maintenanceSchedule.length} lịch trình.
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default StaffMaintenance;