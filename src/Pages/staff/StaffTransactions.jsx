import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  ButtonGroup,
} from "react-bootstrap";

// Dữ liệu mẫu cho các giao dịch gần đây
const recentTransactions = [
  {
    id: 1,
    time: "15:45",
    station: "Điểm sạc #2",
    customer: "Lê Văn Cường",
    duration: "35 phút",
    amount: "65.000đ",
    method: "Thẻ",
    methodIcon: "bi-credit-card",
  },
  {
    id: 2,
    time: "14:20",
    station: "Điểm sạc #1",
    customer: "Phạm Thị Dung",
    duration: "1h 15m",
    amount: "120.000đ",
    method: "Tiền mặt",
    methodIcon: "bi-cash-stack",
  },
  {
    id: 3,
    time: "13:30",
    station: "Điểm sạc #5",
    customer: "Hoàng Minh Tài",
    duration: "50 phút",
    amount: "95.000đ",
    method: "MoMo",
    methodIcon: "bi-phone",
  },
];

const StaffTransactions = () => {
  const [activeTab, setActiveTab] = useState("Giao dịch");

  return (
    <Container fluid className="p-4">
      {/* Tabs chuyển đổi */}
      <ButtonGroup className="mb-4">
        <Button
          variant={activeTab === "Điểm sạc" ? "dark" : "outline-secondary"}
          onClick={() => setActiveTab("Điểm sạc")}
        >
          <i className="bi bi-ev-station me-2"></i> Điểm sạc
        </Button>
        <Button
          variant={activeTab === "Giao dịch" ? "dark" : "outline-secondary"}
          onClick={() => setActiveTab("Giao dịch")}
        >
          <i className="bi bi-receipt me-2"></i> Giao dịch
        </Button>
        <Button
          variant={activeTab === "Sự cố" ? "dark" : "outline-secondary"}
          onClick={() => setActiveTab("Sự cố")}
        >
          <i className="bi bi-exclamation-triangle me-2"></i> Sự cố
        </Button>
      </ButtonGroup>

      {/* Form Giao dịch tại chỗ */}
      <Card className="shadow-sm mb-4">
        <Card.Body className="p-4">
          <Card.Title as="h5">Giao dịch tại chỗ</Card.Title>
          <Card.Subtitle className="mb-4 text-muted">
            Quản lý thanh toán cho khách hàng tại trạm
          </Card.Subtitle>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="chargingPoint">
                  <Form.Label>Điểm sạc</Form.Label>
                  <Form.Select>
                    <option>Chọn điểm sạc</option>
                    <option value="1">Điểm sạc #1</option>
                    <option value="2">Điểm sạc #2</option>
                    <option value="3">Điểm sạc #3</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="amount">
                  <Form.Label>Số tiền (VNĐ)</Form.Label>
                  <Form.Control type="text" placeholder="Nhập số tiền" />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4" controlId="notes">
              <Form.Label>Ghi chú</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ghi chú giao dịch (tùy chọn)"
              />
            </Form.Group>

            <Button variant="dark" type="submit" className="w-100 py-2">
              Xác nhận thanh toán
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {/* Bảng Giao dịch gần đây */}
      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <Card.Title as="h5" className="mb-3">Giao dịch gần đây</Card.Title>
          <Table responsive borderless hover className="align-middle">
            <thead className="table-light">
              <tr>
                <th>Thời gian</th>
                <th>Điểm sạc</th>
                <th>Khách hàng</th>
                <th>Thời gian sạc</th>
                <th>Số tiền</th>
                <th>PT Thanh toán</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((tx) => (
                <tr key={tx.id}>
                  <td>{tx.time}</td>
                  <td>{tx.station}</td>
                  <td>{tx.customer}</td>
                  <td>{tx.duration}</td>
                  <td>{tx.amount}</td>
                  <td>
                    <i className={`bi ${tx.methodIcon} me-2`}></i>
                    {tx.method}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default StaffTransactions;