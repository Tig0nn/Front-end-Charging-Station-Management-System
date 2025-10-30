import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Card, Table, Button, Badge } from "react-bootstrap";
import { staffAPI } from "../../lib/apiServices";

const fmt = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });
const formatCurrency = (n) => fmt.format(Number(n || 0));
const formatDateTime = (iso) => {
  try {
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
  } catch {
    return iso;
  }
};

const StaffPaymentRequests = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);

  const load = async () => {
    try {
      setError("");
      setLoading(true);
      const res = await staffAPI.getPendingPaymentRequests();
      console.log("Fetched pending payment requests:", res.data);
      const list = res?.data?.result || res?.data || [];
      setItems(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Không thể tải yêu cầu thanh toán");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approveAndGo = (req) => {
    // Điều hướng sang trang giao dịch để xác nhận, kèm dữ liệu yêu cầu
    navigate("/staff/transactions", {
      state: {
        fromPaymentRequest: true,
        paymentId: req?.paymentId,
        requestId: req?.requestId || req?.id,
        sessionId: req?.sessionId,
        amount: req?.amount,
        stationName: req?.stationName,
        chargingPointName: req?.chargingPointName,
        driverName: req?.driverName,
        driverPhone: req?.driverPhone,
        licensePlate: req?.licensePlate,
        energyKwh: req?.energyKwh,
        startTime: req?.sessionStartTime,
        endTime: req?.sessionEndTime,
      },
      replace: false,
    });
  };

  return (
    <Container fluid className="p-4">
      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <Card.Title as="h5" className="mb-0">Yêu cầu thanh toán</Card.Title>
            <div>
              <Button variant="outline-secondary" size="sm" onClick={load}>
                <i className="bi bi-arrow-repeat me-1" />Tải lại
              </Button>
            </div>
          </div>
          {loading ? (
            <div>Đang tải...</div>
          ) : error ? (
            <div className="alert alert-danger" role="alert">{error}</div>
          ) : items.length === 0 ? (
            <div className="alert alert-info" role="alert">Hiện không có yêu cầu thanh toán nào.</div>
          ) : (
            <Table responsive hover className="align-middle">
              <thead className="table-light">
                <tr>
                  <th>Mã yêu cầu</th>
                  <th>Tài xế</th>
                  <th>Biển số</th>
                  <th>Cách thức</th>
                  <th>Trạm/Điểm sạc</th>
                  <th>Bắt đầu</th>
                  <th>Năng lượng</th>
                  <th>Số tiền</th>
                  <th>Trạng thái</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((r) => (
                  <tr key={r.requestId || r.id}>
                    <td>{r.requestId || r.id}</td>
                    <td>
                      {r.driverName || "-"}
                      {r.driverPhone ? <div className="text-muted small">{r.driverPhone}</div> : null}
                    </td>
                    <td>{r.licensePlate || "-"}</td>
                    <td>"Booking"</td>
                    <td>
                      {r.stationName || "-"}
                      {r.chargingPointName ? <div className="text-muted small">{r.chargingPointName}</div> : null}
                    </td>
                    <td>{formatDateTime(r.sessionStartTime)}</td>
                    <td>{(Number(r.energyKwh || 0)).toFixed(1)} kWh</td>
                    <td>{formatCurrency(r.amount)}</td>
                    <td>
                      <Badge bg="warning" text="dark">{r.status || "PENDING"}</Badge>
                    </td>
                    <td className="text-end">
                      <Button variant="dark" size="sm" onClick={() => approveAndGo(r)}>
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
    </Container>
  );
};

export default StaffPaymentRequests;
