import React, { useEffect, useState } from "react";
import { Table, Card, Button, Badge, ProgressBar, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import { stationsAPI } from "../../lib/apiServices"; 

const StationsList = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  
  //  Gọi API lấy danh sách trạm sạc
  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoading(true);
        const res = await stationsAPI.getAll(1, 100);
        // Nếu backend trả về dạng {data: [...]}
        const data = res.data.result;
        setStations(data);
      } catch (err) {
        console.error(" Lỗi tải trạm sạc:", err);
        setError("Không thể tải danh sách trạm sạc.");
        setStations(fallbackStations);
      } finally {
        setLoading(false);
      }
    };
    fetchStations();
  }, []);

  //  Format tiền tệ
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);

  //  Badge trạng thái
  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge bg="success">Hoạt động</Badge>;
      case "maintenance":
        return <Badge bg="warning">Bảo trì</Badge>;
      case "inactive":
        return <Badge bg="danger">Ngưng hoạt động</Badge>;
      default:
        return <Badge bg="secondary">Không xác định</Badge>;
    }
  };

  // 🔹 Màu thanh tiến trình
  const getUtilizationColor = (utilization) => {
    if (utilization >= 80) return "success";
    if (utilization >= 60) return "info";
    if (utilization >= 40) return "warning";
    return "danger";
  };

  // 🔹 Đang tải
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <div className="mt-2 text-muted">Đang tải danh sách trạm...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h2 className="mb-1">Quản lý trạm sạc</h2>
          <p className="text-muted mb-0">
            Theo dõi và quản lý tất cả trạm sạc trong hệ thống
          </p>
        </div>
        <Button
          as={Link}
          to="/admin/stations/add"
          variant="primary"
          className="d-flex align-items-center gap-2"
        >
          <i className="bi bi-plus-lg"></i>
          Thêm trạm sạc
        </Button>
      </div>

      {/* Error */}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Bảng trạm sạc */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3">Tên trạm</th>
                  <th className="px-2 py-3 text-center">Trạng thái</th>
                  <th className="px-2 py-3 text-center">Điểm sạc</th>
                  <th className="px-2 py-3 text-end">Doanh thu</th>
                  <th className="px-2 py-3 text-center">Sử dụng</th>
                  <th className="px-2 py-3">Nhân viên</th>
                  <th className="px-4 py-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {stations.length > 0 ? (
                  stations.map((station) => (
                    <tr key={station.stationId} className="align-middle">
                      <td>
                        <div className="fw-semibold text-dark">{station.name}</div>
                        <div className="text-muted small">{"backend chưa có"}</div>
                      </td>

                      <td className="text-center">{getStatusBadge(station.status)}</td>

                      <td className="text-center small">
                        <div className="fw-semibold text-success">
                          Tổng: {"chưa làm" || 0}
                        </div>
                        <div className="mt-1">
                          Hoạt động: {"chưa làm" || 0}
                          {" / "}
                          Bảo trì: {"chưa làm" || 0}
                        </div>
                      </td>

                      <td className="text-end text-success">
                        {/*formatCurrency(station.revenue)*/}
                      </td>

                      <td className="text-center">
                        <ProgressBar
                          now={station.utilization || 0}
                          variant={getUtilizationColor("chưa làm" || 0)}
                          style={{ width: "80px", height: "6px" }}
                          className="mx-auto"
                        />
                        <small>{station.utilization || 0}%</small>
                      </td>

                      <td>{station.manager || "Chưa có"}</td>

                      <td className="text-center">
                        <div className="d-flex gap-1 justify-content-center">
                          <Button variant="outline-primary" size="sm" title="Chỉnh sửa">
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button variant="outline-secondary" size="sm" title="Cài đặt">
                            <i className="bi bi-gear"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-4">
                      Không có trạm sạc nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default StationsList;
