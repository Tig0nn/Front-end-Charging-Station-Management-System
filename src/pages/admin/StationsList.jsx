import React from "react";
import { Table, Card, Button, Badge, ProgressBar } from "react-bootstrap";
import { Link } from "react-router";
import "bootstrap-icons/font/bootstrap-icons.css";

const StationsList = () => {
  // Fallback data for immediate display
  const fallbackStations = [
    {
      id: 1,
      name: "Vincom Đồng Khởi",
      location: "72 Lê Thánh Tôn, Q.1, TP.HCM",
      totalChargers: 6,
      availableChargers: 4,
      offlineChargers: 1,
      maintenanceChargers: 1,
      status: "active",
      revenue: 2450000,
      utilization: 78,
      manager: "Trần Thị Bình",
    },
    {
      id: 2,
      name: "Landmark 81",
      location: "720A Điện Biên Phủ, Q.Bình Thạnh",
      totalChargers: 8,
      availableChargers: 7,
      offlineChargers: 0,
      maintenanceChargers: 1,
      status: "active",
      revenue: 3820000,
      utilization: 85,
      manager: "Nguyễn Văn Cường",
    },
    {
      id: 3,
      name: "AEON Mall Tân Phú",
      location: "30 Bờ Bao Tân Thắng, Q.Tân Phú",
      totalChargers: 4,
      availableChargers: 2,
      offlineChargers: 2,
      maintenanceChargers: 0,
      status: "maintenance",
      revenue: 1680000,
      utilization: 45,
      manager: "Phạm Thị Dung",
    },
  ];

  const stations = fallbackStations;
  const loading = false;
  const error = "";

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Get status badge
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

  // Get utilization color
  const getUtilizationColor = (utilization) => {
    if (utilization >= 80) return "success";
    if (utilization >= 60) return "info";
    if (utilization >= 40) return "warning";
    return "danger";
  };

  if (loading) {
    return (
      <div style={{ padding: "20px" }}>
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center">
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
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4">
          <div className="alert alert-danger">{error}</div>
        </div>
      )}

      {/* Stations Table */}
      <div className="mb-4">
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table className="mb-0" hover>
                <thead className="table-light">
                  <tr>
                    <th
                      className="px-4 py-3 fw-semibold"
                      style={{ width: "25%" }}
                    >
                      Tên trạm
                    </th>
                    <th
                      className="px-2 py-3 fw-semibold text-center"
                      style={{ width: "8%" }}
                    >
                      Trạng thái
                    </th>
                    <th
                      className="px-2 py-3 fw-semibold text-center"
                      style={{ width: "27%" }}
                    >
                      Điểm sạc
                    </th>
                    <th
                      className="px-2 py-3 fw-semibold text-end"
                      style={{ width: "12%" }}
                    >
                      Doanh thu
                    </th>
                    <th
                      className="px-1 py-3 fw-semibold text-center"
                      style={{ width: "15%" }}
                    >
                      Sử dụng
                    </th>
                    <th
                      className="px-2 py-3 fw-semibold"
                      style={{ width: "22%" }}
                    >
                      Nhân viên
                    </th>
                    <th
                      className="px-4 py-3 fw-semibold text-center"
                      style={{ width: "10%" }}
                    >
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stations.map((station) => (
                    <tr key={station.id} className="align-middle">
                      <td className="px-3 py-4">
                        <div className="fw-semibold text-dark">
                          {station.name}
                        </div>
                        <div className="text-muted small">
                          {station.location}
                        </div>
                      </td>

                      <td className="px-2 py-4 text-center">
                        {getStatusBadge(station.status)}
                      </td>

                      <td className="px-2 py-4 text-center">
                        <div className="small">
                          <div className="text-success fw-semibold">
                            Tổng: {station.totalChargers}
                          </div>
                          <div className="d-flex gap-1 justify-content-center mt-1">
                            <span className="text-success">
                              Hoạt động <br />
                              {station.availableChargers}
                            </span>
                            {station.offlineChargers > 0 && (
                              <>
                                <span className="text-muted">|</span>
                                <span className="text-danger">
                                  Offline <br />
                                  {station.offlineChargers}
                                </span>
                              </>
                            )}
                            {station.maintenanceChargers > 0 && (
                              <>
                                <span className="text-muted">|</span>
                                <span className="text-warning">
                                  Bảo trì <br />
                                  {station.maintenanceChargers}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-2 py-4 text-end">
                        <div className="fw-semibold text-success">
                          {formatCurrency(station.revenue)}
                        </div>
                      </td>

                      <td className="px-3 py-4">
                        <div className="text-center">
                          <div className="mb-1">
                            <ProgressBar
                              now={station.utilization}
                              variant={getUtilizationColor(station.utilization)}
                              style={{ width: "80px", height: "6px" }}
                              className="mx-auto"
                            />
                          </div>
                          <small className="fw-semibold text-dark">
                            {station.utilization}%
                          </small>
                        </div>
                      </td>

                      <td className="px-2 py-4">
                        <div className="text-dark">{station.manager}</div>
                      </td>

                      <td className="px-4 py-4 text-center">
                        <div className="d-flex gap-1 justify-content-center">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="d-flex align-items-center justify-content-center"
                            style={{ width: "32px", height: "32px" }}
                            title="Chỉnh sửa"
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            className="d-flex align-items-center justify-content-center"
                            style={{ width: "32px", height: "32px" }}
                            title="Cài đặt"
                          >
                            <i className="bi bi-gear"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Summary Stats */}
      <div className="row">
        <div className="col-lg-3 col-md-6 mb-3">
          <Card className="text-center border-0 shadow-sm h-100">
            <Card.Body>
              <div className="text-primary fs-2 mb-2">🏪</div>
              <h6 className="text-muted mb-1">Tổng trạm sạc</h6>
              <h3 className="text-primary mb-0">{stations.length}</h3>
            </Card.Body>
          </Card>
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <Card className="text-center border-0 shadow-sm h-100">
            <Card.Body>
              <div className="text-success fs-2 mb-2">⚡</div>
              <h6 className="text-muted mb-1">Điểm sạc hoạt động</h6>
              <h3 className="text-success mb-0">
                {stations.reduce(
                  (sum, station) => sum + station.availableChargers,
                  0
                )}
              </h3>
            </Card.Body>
          </Card>
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <Card className="text-center border-0 shadow-sm h-100">
            <Card.Body>
              <div className="text-info fs-2 mb-2">💰</div>
              <h6 className="text-muted mb-1">Tổng doanh thu</h6>
              <h3 className="text-info mb-0">
                {formatCurrency(
                  stations.reduce((sum, station) => sum + station.revenue, 0)
                )}
              </h3>
            </Card.Body>
          </Card>
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <Card className="text-center border-0 shadow-sm h-100">
            <Card.Body>
              <div className="text-warning fs-2 mb-2">📊</div>
              <h6 className="text-muted mb-1">Sử dụng trung bình</h6>
              <h3 className="text-warning mb-0">
                {Math.round(
                  stations.reduce(
                    (sum, station) => sum + station.utilization,
                    0
                  ) / stations.length
                )}
                %
              </h3>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StationsList;
