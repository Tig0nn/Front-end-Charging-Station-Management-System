import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { staffAPI } from "../../lib/apiServices";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
} from "react-bootstrap";

// Bảng giao dịch gần đây sẽ dùng state recentTransactionsState, không dùng mock

const StaffTransactions = () => {
  const location = useLocation();
  const [chargingPoint, setChargingPoint] = useState("");
  const [amount, setAmount] = useState("");
  const [driverName, setDriverName] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [requestId, setRequestId] = useState("");
  const [paymentId, setPaymentId] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  // Prefill from navigation state (from payment request)
  useEffect(() => {
    const s = location.state;
    if (s?.fromPaymentRequest) {
      if (s.stationName) setChargingPoint(s.stationName);
      if (s.amount != null) setAmount(String(s.amount));
      if (s.driverName) setDriverName(s.driverName);
      // driverPhone hiện không hiển thị, có thể dùng sau nếu cần
      if (s.licensePlate) setLicensePlate(s.licensePlate);
      if (s.sessionId) setSessionId(s.sessionId);
      if (s.requestId) setRequestId(s.requestId);
      if (s.paymentId) setPaymentId(s.paymentId);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!requestId) return;
    try {
      setSubmitting(true);
      setSubmitError("");
      setSubmitSuccess("");

      let res;
      if (paymentId) {
        // PUT confirm/{paymentId}
        res = await staffAPI.approvePendingPaymentRequest(paymentId);
        console.log("Payment confirmed by paymentId:", res.data);
      } else {
        alert("Không thể xác nhận thanh toán.");
      }

      setSubmitSuccess("Đã xác nhận thanh toán");


      // reset field
      setChargingPoint("");
      setAmount("");
      setDriverName("");
      setLicensePlate("");
      setSessionId("");
      setRequestId("");
    } catch (err) {
      setSubmitError(err?.response?.data?.message || err?.message || "Không thể xác nhận thanh toán");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container fluid className="p-4">
      {/* Form Giao dịch tại chỗ */}
      <Card className="shadow-sm mb-4">
        <Card.Body className="p-4">
          <Card.Title as="h5">Giao dịch tại chỗ</Card.Title>
          <Card.Subtitle className="mb-4 text-muted">
            Quản lý thanh toán cho khách hàng tại trạm
          </Card.Subtitle>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="chargingPoint">
                  <Form.Label>Điểm sạc</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nhập/Chọn điểm sạc"
                    value={chargingPoint}
                    onChange={(e) => setChargingPoint(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="amount">
                  <Form.Label>Số tiền (VNĐ)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nhập số tiền"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3" controlId="licensePlate">
                  <Form.Label>Biển số xe</Form.Label>
                  <Form.Control type="text" value={licensePlate} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3" controlId="driverName">
                  <Form.Label>Tên người dùng</Form.Label>
                  <Form.Control type="text" value={driverName} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3" controlId="sessionId">
                  <Form.Label>Session ID</Form.Label>
                  <Form.Control type="text" value={sessionId} />
                </Form.Group>
              </Col>
            </Row>

            {submitError ? (
              <div className="alert alert-danger" role="alert">{submitError}</div>
            ) : null}
            {submitSuccess ? (
              <div className="alert alert-success" role="alert">{submitSuccess}</div>
            ) : null}

            <Button variant="dark" type="submit" className="w-100 py-2" onClick={handleSubmit} disabled={submitting || !requestId}>
              Xác nhận thanh toán
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default StaffTransactions;