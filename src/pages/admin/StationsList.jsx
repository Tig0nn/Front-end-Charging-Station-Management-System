/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Button,
  Badge,
  ProgressBar,
  Spinner,
  Form,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import { stationsAPI } from "../../lib/apiServices";
import { staffAPI } from "../../lib/apiServices";

const StationsList = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State quản lý cập nhật trạm
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  // State danh sách nhân viên
  const [searchText, setSearchText] = useState([]);
  // State tìm kiếm nhân viên
  const [searchStaff, setSearchStaff] = useState("");
  //quản lý danh sách nhân viên
  const [staffs, setStaffs] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(true);

  // Khi bấm nút "Chỉnh sửa"
  const handleEditClick = (station) => {
    setEditingId(station.stationId);
    setEditData({ ...station });
  };

  // Khi thay đổi dữ liệu trong ô input
  const handleChangeEdit = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  // Khi bấm "Lưu"
  const handleSave = async () => {
    try {
      const dataToSend = {
        ...editData,
        totalPoints: Number(editData.totalPoints || 0),
        activePoints: Number(editData.activePoints || 0),
        maintenancePoints: Number(editData.maintenancePoints || 0),
      };

      await stationsAPI.update(editingId, dataToSend);
      alert("Cập nhật thành công!");

      setStations((prev) =>
        prev.map((s) => (s.stationId === editingId ? dataToSend : s))
      );
      setEditingId(null);
    } catch (err) {
      console.error("Lỗi khi cập nhật:", err);
      alert("Không thể cập nhật trạm sạc!");
    }
  };

  // Khi bấm "Hủy"
  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  // Gọi api xóa trạm
  const handleDelete = async (stationId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa trạm sạc này không?"))
      return;

    try {
      await stationsAPI.delete(stationId);
      alert(" Xóa trạm sạc thành công!");
      setStations((prev) => prev.filter((s) => s.stationId !== stationId));
    } catch (err) {
      console.error(" Lỗi khi xóa trạm:", err);
      alert("Không thể xóa trạm sạc. Vui lòng thử lại!");
    }
  };

  // Fetch danh sách nhân viên
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await staffAPI.getAllStaffs();
        setStaffs(res.data.result || []);
        setSearchStaff(res.data.result || []);
      } catch (err) {
        console.error("Lỗi khi tải danh sách nhân viên:", err);
      } finally {
        setLoadingStaff(false);
      }
    };
    fetchStaff();
  }, []);

  //  Lọc danh sách staff khi searchText thay đổi
  useEffect(() => {
    const filtered = staffs.filter((s) => {
      const name = s.fullName || s.name || "";
      return name.includes(searchText);
    });
    setSearchStaff(filtered);
  }, [searchText, staffs]);

  //  Gọi API lấy danh sách trạm khi component mount
  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoading(true);
        const res = await stationsAPI.getOverview();
        console.log("API raw response:", res.data);
        // Nếu backend trả về dạng {data: [...]}
        const data = res.data.result;
        console.log("Danh sách trạm sạc:", data);
        setStations(data);
      } catch (err) {
        console.error(" Lỗi tải trạm sạc:", err);
        setError("Không thể tải danh sách trạm sạc.");
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
      case "OPERATIONAL":
        return <Badge bg="success">Hoạt động</Badge>;
      case "MAINTENANCE":
        return <Badge bg="warning">Bảo trì</Badge>;
      case "CLOSED":
        return <Badge bg="danger">Đóng cửa</Badge>;
      case "OUT_OF_SERVICE":
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

  //  Đang tải
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
          <h2 className="mb-1">Quản lý trạm sạc </h2>
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
                  <th className="px-2 py-3">Chủ</th>
                  <th className="px-2 py-3 text-center">Nhân viên</th>
                  <th className="px-4 py-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {/* nếu có trạm thì hiển thị  */}

                {stations.length > 0 ? (
                  stations.map((station) => (
                    <tr key={station.stationId} className="align-middle">
                      {/* Tên trạm và địa chỉ */}
                      <td className="px-4 align-middle">
                        {editingId === station.stationId ? (
                          <>
                            <Form.Control
                              type="text"
                              name="name"
                              value={editData.name || ""}
                              onChange={handleChangeEdit}
                              placeholder="Tên trạm"
                              className="mb-2"
                            />
                            <Form.Control
                              type="text"
                              name="address"
                              value={editData.address || ""}
                              onChange={handleChangeEdit}
                              placeholder="Vị trí / Địa chỉ"
                            />
                          </>
                        ) : (
                          <>
                            <div className="fw-semibold">{station.name}</div>
                            <div className="text-muted small">
                              <i className="bi bi-geo-alt me-1"></i>
                              {station.address || "Chưa có địa chỉ"}
                            </div>
                          </>
                        )}
                      </td>

                      {/* Trạng thái */}
                      <td className="text-center">
                        {editingId === station.stationId ? (
                          <Form.Select
                            name="status"
                            value={editData.status}
                            onChange={handleChangeEdit}
                          >
                            <option value="OPERATIONAL">Hoạt động</option>
                            <option value="MAINTENANCE">Bảo trì</option>
                            <option value="OUT_OF_SERVICE">
                              Ngưng hoạt động
                            </option>
                            <option value="CLOSED">Đóng cửa</option>
                          </Form.Select>
                        ) : (
                          getStatusBadge(station.status)
                        )}
                      </td>

                      {/* Thông tin điểm sạc */}
                      <td className="text-center small">
                        <>
                          <div className="fw-semibold text-success">
                            Tổng: {station.totalPoints || 0}
                          </div>
                          <div className="mt-1">
                            Hoạt động: {station.activePoints || 0} / Bảo trì:{" "}
                            {station.maintenancePoints || 0}
                          </div>
                        </>
                      </td>

                      <td className="text-end text-success">
                        {formatCurrency(station.revenue) || 0}
                      </td>

                      {/* Thanh tiến trình sử dụng */}
                      <td className="text-center">
                        <ProgressBar
                          now={station.utilization || 0}
                          variant={getUtilizationColor(
                            station.utilization || 0
                          )}
                          style={{ width: "80px", height: "6px" }}
                          className="mx-auto"
                        />
                        <small>{station.utilization || 0}%</small>
                      </td>

                      <td>
                        {editingId === station.stationId ? (
                          <Form.Control
                            type="text"
                            name="operatorName"
                            value={editData.operatorName || ""}
                            onChange={handleChangeEdit}
                          />
                        ) : (
                          station.operatorName || "Chưa có"
                        )}
                      </td>

                      {/* Chức năng tìm kiếm nhân viên */}
                      <td className="text-center">
                        {editingId === station.stationId ? (
                          <>
                            <Form.Control
                              type="text"
                              placeholder="Tìm kiếm nhân viên..."
                              value={searchText}
                              onChange={(e) => setSearchText(e.target.value)}
                              className="mb-2"
                            />
                            <Form.Select
                              name="staffId"
                              value={searchStaff.staffId}
                              onChange={(e) =>
                                setSearchStaff({
                                  ...searchStaff,
                                  staffId: e.target.value,
                                })
                              }
                              required
                            >
                              <option value="">
                                -- Chọn nhân viên phụ trách --
                              </option>
                              {searchStaff.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.fullName}
                                </option>
                              ))}
                            </Form.Select>
                          </>
                        ) : (
                          station.staffName || "Chưa có nhân viên"
                        )}
                      </td>

                      {/* Nút thao tác */}
                      <td className="text-center">
                        <div className="d-flex gap-1 justify-content-center">
                          {editingId === station.stationId ? (
                            <>
                              {/** Nút lưu */}
                              <Button
                                variant="success"
                                size="sm"
                                title="Lưu"
                                onClick={handleSave}
                              >
                                <i className="bi bi-check-lg"></i>
                              </Button>
                              {/** Nút hủy */}
                              <Button
                                variant="secondary"
                                size="sm"
                                title="Hủy"
                                onClick={handleCancel}
                              >
                                <i className="bi bi-x-lg"></i>
                              </Button>
                            </>
                          ) : (
                            <>
                              {/* Nút chỉnh sửa */}
                              <Button
                                variant="outline-primary"
                                size="sm"
                                title="Chỉnh sửa"
                                onClick={() => handleEditClick(station)}
                              >
                                <i className="bi bi-pencil"></i>
                              </Button>
                              {/* Nút xóa */}
                              <Button
                                variant="outline-danger"
                                size="sm"
                                title="Xóa"
                                onClick={() => handleDelete(station.stationId)}
                              >
                                <i className="bi bi-trash"></i>
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    {/* Nếu không có trạm nào */}
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
