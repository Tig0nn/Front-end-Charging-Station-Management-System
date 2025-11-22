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
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { stationsAPI, staffAPI } from "../../lib/apiServices";
import LoadingSpinner from "../../components/loading_spins/LoadingSpinner";

const StationsList = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State quản lý cập nhật trạm
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  // State quản lý search nhân viên
  const [searchText, setSearchText] = useState(""); // text nhập vào ô tìm kiếm
  const [searchStaff, setSearchStaff] = useState([]); // danh sách nhân viên hiển thị
  const [staffs, setStaffs] = useState([]); // toàn bộ danh sách nhân viên
  const [selectedStaffId, setSelectedStaffId] = useState(""); // nhân viên được chọn

  // Hàm tải lại danh sách trạm
  const fetchStations = async () => {
    try {
      setLoading(true);
      const res = await stationsAPI.getAllDetails();
      console.log("API raw response:", res.data);
      const data = res.data.result;
      console.log("Danh sách trạm sạc:", data);
      setStations(data);
    } catch (err) {
      console.error(" Lỗi tải trạm sạc:", err);
      toast.error("Không thể tải danh sách trạm sạc.");
    } finally {
      setLoading(false);
    }
  };
  // Khi bấm nút "Chỉnh sửa"
  const handleEditClick = (station) => {
    setEditingId(station.stationId);
    setEditData({ ...station });
    // Set nhân viên hiện tại nếu có
    setSelectedStaffId(station.staffId || "");
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
        // Thêm staffId nếu có chọn nhân viên
        staffId: selectedStaffId || null,
      };

      await stationsAPI.update(editingId, dataToSend);
      toast.success("Cập nhật trạm sạc thành công!");

      // Reload lại danh sách trạm và nhân viên để cập nhật trạng thái
      await fetchStations();

      // Reload lại danh sách staff để cập nhật stationId mới
      const res = await staffAPI.getAllStaffs();
      const allStaffs = res.data.result || [];
      setStaffs(allStaffs);

      setEditingId(null);
      setSelectedStaffId("");
      // setSearchText(""); // COMMENT: Không cần reset search text nữa
    } catch (err) {
      console.error("Lỗi khi cập nhật:", err);
      toast.error("Không thể cập nhật trạm sạc. Vui lòng thử lại.");
    }
  };
  // Khi bấm "Hủy"
  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
    setSelectedStaffId("");
    // setSearchText(""); // COMMENT: Không cần reset search text nữa
  };

  // Gọi api xóa trạm
  const handleDelete = async (stationId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa trạm sạc này không?"))
      return;

    try {
      await stationsAPI.delete(stationId);
      toast.success("Xóa trạm sạc thành công!");
      setStations((prev) => prev.filter((s) => s.stationId !== stationId));
    } catch (err) {
      console.error(" Lỗi khi xóa trạm:", err);
      toast.error("Không thể xóa trạm sạc. Vui lòng thử lại.");
    }
  };

  // Fetch danh sách nhân viên
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await staffAPI.getAllStaffs();
        const allStaffs = res.data.result || [];
        console.log("Danh sách nhân viên:", allStaffs);
        setStaffs(allStaffs);
        setSearchStaff(allStaffs); // mặc định hiển thị toàn bộ
      } catch (err) {
        console.error("Lỗi khi tải danh sách nhân viên:", err);
      }
    };
    fetchStaff();
  }, []); // ============ COMMENT CŨ: Lọc theo search text ============
  // useEffect(() => {
  //   if (searchText.trim() === "") {
  //     setSearchStaff(staffs); // hiển thị toàn bộ khi rỗng
  //   } else {
  //     const filtered = staffs.filter((s) =>
  //       (s.fullName || s.name || "")
  //         .toLowerCase()
  //         .includes(searchText.toLowerCase())
  //     );
  //     setSearchStaff(filtered);
  //   }
  // }, [searchText, staffs]);
  // ============ END COMMENT CŨ ============

  // ============ COMMENT CŨ: Lọc chỉ nhân viên chưa có trạm ============
  // useEffect(() => {
  //   if (!editingId) {
  //     setSearchStaff(staffs);
  //     return;
  //   }
  //   // Lọc: Chỉ hiển thị nhân viên chưa có trạm (stationId === null)
  //   // HOẶC đang được gán vào trạm đang edit
  //   const availableStaffs = staffs.filter((staff) => {
  //     return !staff.stationId || staff.stationId === editingId;
  //   });
  //   setSearchStaff(availableStaffs);
  // }, [staffs, editingId]);
  // ============ END COMMENT CŨ ============

  // ✅ MỚI: Hiển thị TẤT CẢ nhân viên (cho phép chuyển nhân viên giữa các trạm)
  useEffect(() => {
    setSearchStaff(staffs); // Hiển thị toàn bộ nhân viên
  }, [staffs]);

  //  Gọi API lấy danh sách trạm khi component mount
  useEffect(() => {
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
        <LoadingSpinner />
        <div className="mt-2 text-muted">Đang tải danh sách trạm...</div>
      </div>
    );
  }

  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />
      {/* Header */}
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h2 className="mb-1">Quản lý trạm sạc </h2>
          <p className="text-muted mb-0">
            Theo dõi và quản lý tất cả trạm sạc trong hệ thống
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button
            onClick={fetchStations}
            disabled={loading}
            className="d-flex align-items-center gap-2"
            style={{
              backgroundColor: "#22c55e",
              borderColor: "#22c55e",
              color: "white",
            }}
          >
            {loading ? (
              <>
                <Spinner as="span" animation="border" size="sm" />
                <span>Đang tải...</span>
              </>
            ) : (
              <>
                <i className="bi bi-arrow-clockwise"></i>
                <span>Làm mới</span>
              </>
            )}
          </Button>
          <Button
            as={Link}
            to="/admin/stations/add"
            variant="dark"
            className="d-flex align-items-center gap-2"
          >
            <i className="bi bi-plus-lg"></i>
            Thêm trạm sạc
          </Button>
        </div>
      </div>

      {/* Error */}
      {/* {error && <div className="alert alert-danger">{error}</div>} */}
      {/* Lỗi hiển thị bằng toast (react-hot-toast) */}

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
                            Tổng: {station.totalChargingPoints || 0}
                          </div>
                          <div className="mt-1">
                            Hoạt động: {station.activeChargingPoints || 0}{" "}
                            <br />
                            Bảo trì: {station.maintenanceChargingPoints ||
                              0}{" "}
                            <br /> Ngưng hoạt động:{" "}
                            {station.offlineChargingPoints || 0}
                          </div>
                        </>
                      </td>

                      <td className="text-end text-success">
                        {formatCurrency(station.revenue) || 0}
                      </td>

                      {/* Thanh tiến trình sử dụng */}
                      <td className="text-center">
                        <ProgressBar
                          now={station.usagePercent || 0}
                          variant={getUtilizationColor(
                            station.usagePercent || 0
                          )}
                          style={{ width: "80px", height: "6px" }}
                          className="mx-auto"
                        />
                        <small>{station.usagePercent || 0}%</small>
                      </td>

                      {/* Chức năng chọn nhân viên */}
                      <td className="text-center">
                        {editingId === station.stationId ? (
                          <>
                            {/* ============ COMMENT CŨ: Ô tìm kiếm nhân viên ============ */}
                            {/* <Form.Control
                              type="text"
                              placeholder="Tìm kiếm nhân viên..."
                              value={searchText}
                              onChange={(e) => setSearchText(e.target.value)}
                              className="mb-2"
                            /> */}
                            {/* ============ END COMMENT CŨ ============ */}{" "}
                            {/* ✅ GIỮ LẠI: Dropdown chọn nhân viên */}
                            <Form.Select
                              name="staffId"
                              value={selectedStaffId}
                              onChange={(e) =>
                                setSelectedStaffId(e.target.value)
                              }
                            >
                              <option value="">
                                -- Chọn nhân viên phụ trách --
                              </option>
                              {searchStaff.map((s) => {
                                // Kiểm tra nhân viên có đang quản lý trạm khác không
                                const isCurrentStation =
                                  s.stationId === editingId;
                                const hasOtherStation =
                                  s.stationId && s.stationId !== editingId;

                                let displayText = `${s.fullName}`;
                                if (s.employeeNo) {
                                  displayText += ` (${s.employeeNo})`;
                                }

                                if (isCurrentStation) {
                                  displayText += " - Đang quản lý trạm này";
                                } else if (hasOtherStation) {
                                  displayText += ` - Đang quản lý: ${
                                    s.stationName || "Trạm khác"
                                  }`;
                                }

                                return (
                                  <option key={s.staffId} value={s.staffId}>
                                    {displayText}
                                  </option>
                                );
                              })}
                            </Form.Select>
                            {searchStaff.length === 0 && (
                              <small className="text-muted d-block mt-1">
                                Không có nhân viên khả dụng
                              </small>
                            )}
                            {/* Cảnh báo khi chọn nhân viên đang quản lý trạm khác */}
                            {selectedStaffId &&
                              searchStaff.find(
                                (s) => s.staffId === selectedStaffId
                              )?.stationId &&
                              searchStaff.find(
                                (s) => s.staffId === selectedStaffId
                              )?.stationId !== editingId && (
                                <small className="text-warning d-block mt-1">
                                  <i className="bi bi-exclamation-triangle me-1"></i>
                                  Nhân viên này sẽ được chuyển từ trạm cũ sang
                                  trạm này
                                </small>
                              )}
                          </>
                        ) : (
                          <div>
                            {station.staffName || "Chưa có nhân viên"}
                            {station.employeeNo && (
                              <div className="text-muted small">
                                ({station.employeeNo})
                              </div>
                            )}
                          </div>
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
