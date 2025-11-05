import React, { useEffect, useState } from "react";
import { Container, Card, Table, Button, Badge } from "react-bootstrap";
import { staffAPI } from "../../lib/apiServices";
import { Modal } from "react-bootstrap";

const formatCurrency = (value) => {
  const rounded = Math.round((value || 0) / 100) * 100; // làm tròn đến 100
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0, // bỏ phần lẻ
  }).format(rounded);
};
const formatDateTime = (iso) => {
  try {
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return {
      date: `${dd}/${mm}/${yyyy}`,
      time: `${hh}:${mi}`
    };
  } catch {
    return iso;
  }
};

const StaffPaymentRequests = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);


  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const load = async () => {
    try {
      setError("");
      setLoading(true);
      const res = await staffAPI.getPendingPaymentRequests();
      console.log("Fetched pending payment requests:", res.data);
      const list = res?.data?.result || res?.data || [];
      setItems(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(
        e?.response?.data?.message ||
        e?.message ||
        "Không thể tải yêu cầu thanh toán"
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approveAndOpenModal = (req) => {
    setSelectedReq(req);
    setSubmitError("");
    setSubmitSuccess("");
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!selectedReq?.paymentId) return;
    try {
      setSubmitting(true);
      setSubmitError("");
      setSubmitSuccess("");

      await staffAPI.approvePendingPaymentRequest(selectedReq.paymentId);
      setSubmitSuccess("Đã xác nhận thanh toán!");

      // Load lại danh sách để xóa yêu cầu đã xử lý
      await load();
    } catch (err) {
      setSubmitError(err?.response?.data?.message || "Lỗi khi xác nhận thanh toán");
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <Container fluid className="p-4">

      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <Card.Title as="h5" className="mb-0">Yêu cầu thanh toán tiền mặt</Card.Title>
          </div>
          {loading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
              <div className="spinner-border text-primary" />
            </div>
          ) : error ? (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          ) : items.length === 0 ? (
            <div className="alert alert-info" role="alert">
              Hiện không có yêu cầu thanh toán nào.
            </div>
          ) : (
            <Table responsive hover className="align-middle">
              <thead className="table-light">
                <tr>
                  <th>Tài xế</th>
                  <th>Biển số</th>
                  <th>Trạm/Trụ sạc</th>
                  <th>Thời gian</th>
                  <th>Lượng điện đã sạc</th>
                  <th>Số tiền</th>
                  <th>Duyệt</th>
                </tr>
              </thead>
              <tbody>
                {items.map((r) => (
                  <tr key={r.requestId || r.id}>
                    <td>
                      {r.driverName || "-"}
                      {r.driverPhone ? (
                        <div className="text-muted small">{r.driverPhone}</div>
                      ) : null}
                    </td>
                    <td>{r.licensePlate || "-"}</td>
                    <td>
                      {r.stationName || "-"}
                      {r.chargingPointName ? (
                        <div className="text-muted small">
                          {r.chargingPointName}
                        </div>
                      ) : null}
                    </td>
                    <td>{formatDateTime(r.sessionStartTime).date}<br /><div className="text-muted small">{formatDateTime(r.sessionStartTime).time}</div></td>
                    <td>{(Number(r.energyKwh || 0)).toFixed(1)} kW</td>
                    <td>{formatCurrency(r.amount)}</td>
                    <td>
                      <Button variant="dark" size="sm" onClick={() => approveAndOpenModal(r)}>
                        Duyệt yêu cầu
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận thanh toán</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedReq && (
            <>
              <div className="d-flex justify-content">
                <div className="mr-60">
                  <p><strong>Tài xế:</strong> {selectedReq.driverName}</p>
                  <p><strong>Biển số:</strong> {selectedReq.licensePlate}</p>
                  <p><strong>Số điện thoại:</strong> {selectedReq.driverPhone}</p>
                </div>
                <div>
                  <p><strong>Trạm sạc:</strong> {selectedReq.stationName}</p>
                  <p><strong>Trụ sạc:</strong> {selectedReq.chargingPointName}</p>
                  <p><strong>Lượng điện đã sạc:</strong> {(Number(selectedReq.energyKwh || 0)).toFixed(1)} kW</p>
                </div>
              </div>
              <div className="text-xl font-bold mt-5">
                <p><strong>Số tiền:</strong> {formatCurrency(selectedReq.amount)}</p>
              </div>

              {submitError && <div className="alert alert-danger">{submitError}</div>}
              {submitSuccess && <div className="alert alert-success">{submitSuccess}</div>}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Đóng
          </Button>
          <Button variant="dark" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Đang xử lý..." : "Xác nhận"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default StaffPaymentRequests;
