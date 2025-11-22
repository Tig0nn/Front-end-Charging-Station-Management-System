import React, { useEffect, useState } from "react";
import { usersAPI, plansAPI } from "../../lib/apiServices.js";
import {
  Container,
  Row,
  Col,
  Table,
  Card,
  Button,
  Badge,
  Spinner,
  Modal,
  Form,
} from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaPlus, FaTrash } from "react-icons/fa";
import { BiEdit } from "react-icons/bi";
import PlanCard from "../../components/PlanCard"; // Sử dụng PlanCard thống nhất
import LoadingSpinner from "../../components/loading_spins/LoadingSpinner.jsx";

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Plans state
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  // User detail modal state
  const [showUserDetailModal, setShowUserDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // SỬA 1: Cập nhật state của form plan theo API spec
  const [planFormData, setPlanFormData] = useState({
    name: "",
    monthlyFee: "", // Phí hàng tháng
    pricePerKwh: "", // Giá mỗi kWh
    pricePerMinute: "", // Giá mỗi phút
    benefits: "", // Mô tả quyền lợi
    billingType: "MONTHLY_SUBSCRIPTION",
  });

  // Tách hàm fetchPlans ra
  const fetchPlans = async () => {
    try {
      setPlansLoading(true);
      const response = await plansAPI.getPlans();
      console.log("Plans API response:", response);

      let plansData = [];
      if (response.data?.result) {
        plansData = response.data.result;
      } else if (response.result) {
        plansData = response.result;
      } else if (Array.isArray(response.data)) {
        plansData = response.data;
      } else if (Array.isArray(response)) {
        plansData = response;
      }

      // Transform to UI format with full information
      const transformedPlans = plansData.map((plan) => {
        return {
          id: plan.planId || plan.id,
          name: plan.name,
          monthlyFee: plan.monthlyFee || 0,
          price: plan.monthlyFee || 0,
          period: plan.billingType === "PAY_AS_YOU_GO" ? "lượt" : "tháng",
          billingType: plan.billingType,
          pricePerKwh: plan.pricePerKwh || 0,
          pricePerMinute: plan.pricePerMinute || 0,
          // Backend CHỈ HỖ TRỢ field "benefits", không có "description"
          benefits: plan.benefits || "",
        };
      });

      setPlans(transformedPlans);
    } catch (err) {
      console.error(" Error fetching plans:", err);
    } finally {
      setPlansLoading(false);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await usersAPI.getDriver();
        console.log("Danh sách tài xế:", res.data);
        setUsers(res?.data?.result || []);
      } catch (err) {
        console.error("Lỗi khi tải danh sách tài xế:", err);
        setError("Không thể tải danh sách tài xế");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    fetchPlans();
  }, []);

  // SỬA 3: Cập nhật logic mở modal (thêm/sửa)
  const handleShowPlanModal = (plan = null) => {
    if (plan) {
      // Chế độ Edit - map đầy đủ từ backend
      setEditingPlan(plan);
      const formData = {
        name: plan.name,
        monthlyFee: (plan.monthlyFee || 0).toString(),
        pricePerKwh: (plan.pricePerKwh || 0).toString(),
        pricePerMinute: (plan.pricePerMinute || 0).toString(),
        benefits: plan.benefits || "",
        billingType: plan.billingType || "MONTHLY_SUBSCRIPTION",
      };
      setPlanFormData(formData);
    } else {
      // Chế độ Create (Reset form)
      setEditingPlan(null);
      setPlanFormData({
        name: "",
        monthlyFee: "0",
        pricePerKwh: "0",
        pricePerMinute: "0",
        benefits: "",
        billingType: "MONTHLY_SUBSCRIPTION",
      });
    }
    setShowPlanModal(true);
  };

  const handleClosePlanModal = () => {
    setShowPlanModal(false);
    setEditingPlan(null);
  };

  const handlePlanInputChange = (e) => {
    const { name, value } = e.target;
    // Bỏ logic checkbox
    setPlanFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // SỬA 5: GỬI ĐÚNG CẤU TRÚC BACKEND
  const handlePlanSubmit = async (e) => {
    e.preventDefault();

    try {
      // Prepare data - Khớp 100% với backend API
      const planData = {
        name: planFormData.name,
        billingType: planFormData.billingType,
        monthlyFee: parseFloat(planFormData.monthlyFee) || 0,
        pricePerKwh: parseFloat(planFormData.pricePerKwh) || 0,
        pricePerMinute: parseFloat(planFormData.pricePerMinute) || 0,
        benefits: planFormData.benefits || "",
      };

      if (editingPlan) {
        await plansAPI.update(editingPlan.id, planData);
        toast.success("Cập nhật gói dịch vụ thành công!");
      } else {
        await plansAPI.create(planData);
        toast.success("Tạo gói dịch vụ thành công!");
      }

      // Đóng modal TRƯỚC
      handleClosePlanModal();

      // Đợi 300ms để backend lưu xong
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Tải lại danh sách plans
      await fetchPlans();
    } catch (err) {
      console.error(" Error saving plan:", err);
      console.error(" Error response:", err.response?.data);
      const errorMsg =
        err.response?.data?.message || err.response?.data?.error || err.message;
      toast.error(`Có lỗi xảy ra khi lưu gói dịch vụ: ${errorMsg}`);
    }
  };

  // DELETE plan handler
  const handleDeletePlan = async (plan) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa gói "${plan.name}"?\n\nLưu ý: Không nên xóa gói đang có người đăng ký!`
      )
    ) {
      return;
    }

    try {
      await plansAPI.delete(plan.id);
      toast.success("Xóa gói dịch vụ thành công!");
      fetchPlans(); // Reload danh sách
    } catch (err) {
      console.error("Error deleting plan:", err);
      toast.error(
        "Có lỗi xảy ra khi xóa gói dịch vụ. Có thể gói này đang có người đăng ký."
      );
    }
  };

  // Badge gói dịch vụ (Giữ nguyên)
  const getPlanBadge = (plan) => {
    const style = { minWidth: "90px", textAlign: "center", fontWeight: 500 };
    if (!plan) {
      return (
        <Badge
          bg="secondary"
          text="light"
          className="px-3 py-2 rounded-pill"
          style={style}
        >
          Chưa có
        </Badge>
      );
    }
    switch (plan?.toLowerCase()) {
      case "vip":
        return (
          <Badge
            bg="dark"
            text="light"
            className="px-3 py-2 rounded-pill"
            style={style}
          >
            VIP
          </Badge>
        );
      case "pay_as_you_go":
        return (
          <Badge
            bg="secondary"
            text="light"
            className="px-3 py-2 rounded-pill"
            style={style}
          >
            Linh hoạt
          </Badge>
        );
      default:
        return (
          <Badge
            bg="light"
            text="dark"
            className="px-3 py-2 rounded-pill border"
            style={style}
          >
            Basic
          </Badge>
        );
    }
  };

  // Badge trạng thái (Giữ nguyên)
  const getStatusBadge = (status) => {
    const style = { minWidth: "90px", textAlign: "center", fontWeight: 500 };
    if (!status) {
      return (
        <Badge
          bg="secondary"
          text="light"
          className="px-3 py-2 rounded-pill"
          style={style}
        >
          Không rõ
        </Badge>
      );
    }
    const normalized = status?.toLowerCase();
    const isActive = normalized === "active" || normalized === "hoạt động";
    return (
      <Badge
        bg={isActive ? "success" : "secondary"}
        text="light"
        className="px-3 py-2 rounded-pill"
        style={style}
      >
        {status}
      </Badge>
    );
  };

  // Handle show user detail modal
  const handleShowUserDetail = (user) => {
    setSelectedUser(user);
    setShowUserDetailModal(true);
  };

  const handleCloseUserDetail = () => {
    setShowUserDetailModal(false);
    setSelectedUser(null);
  };

  return (
    <Container fluid className="p-0 mt-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <Row>
        <Col>
          <h2 className="fw-bold">Quản lý tài xế</h2>
          <p className="text-muted">Danh sách và thông tin tài xế</p>
        </Col>
      </Row>

      <Card className="shadow-sm border-0 rounded-3 mb-4">
        <Card.Body>
          <Table hover responsive className="align-middle mb-0">
            <thead className="border-bottom small text-uppercase text-muted">
              <tr>
                <th>Tên</th>
                <th>Liên hệ</th>
                <th>Ngày tham gia</th>
                <th>Gói dịch vụ</th>
                <th>Số phiên</th>
                <th>Tổng chi tiêu</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    <LoadingSpinner />
                    <p className="mt-2 text-muted">
                      Đang tải danh sách người dùng...
                    </p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="8" className="text-center text-danger py-4">
                    {error}
                  </td>
                </tr>
              ) : !Array.isArray(users) || users.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center text-muted py-4">
                    Không có người dùng nào.
                  </td>
                </tr>
              ) : (
                users.map((user, idx) => (
                  <tr key={user.email || idx}>
                    <td className="fw-semibold">{user.fullName || "—"}</td>
                    <td>
                      {user.email || "—"} <br />
                      <span className="text-muted small">
                        {user.phone || "—"}
                      </span>
                    </td>
                    <td>{user.joinDate || "—"}</td>
                    <td>{getPlanBadge(user.planName)}</td>
                    <td>{user.sessionCount ?? 0}</td>
                    <td>{(user.totalSpent ?? 0).toLocaleString("vi-VN")}₫</td>
                    <td>{getStatusBadge(user.status)}</td>
                    <td>
                      <Button
                        variant="light"
                        size="sm"
                        className="me-2 border text-dark"
                        onClick={() => handleShowUserDetail(user)}
                      >
                        Chi tiết
                      </Button>
                      <Button
                        variant="light"
                        size="sm"
                        className="border text-danger"
                      >
                        Khóa
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Plans Management Section */}
      <Row className="mb-3 align-items-center mt-5">
        <Col>
          <h2 className="fw-bold mb-2">Quản lý gói dịch vụ</h2>
          <p className="text-muted mb-0">Tạo và chỉnh sửa các gói dịch vụ</p>
        </Col>
        <Col xs="auto">
          <Button
            size="md"
            onClick={() => handleShowPlanModal()}
            className="d-flex align-items-center gap-2 px-4 border-0 text-white"
            style={{ backgroundColor: "#22c55e" }}
          >
            <FaPlus /> Thêm gói mới
          </Button>
        </Col>
      </Row>

      {/* Plans Grid */}
      {plansLoading ? (
        <div className="text-center py-5">
          <LoadingSpinner />
          <p className="mt-3 text-muted">Đang tải danh sách gói dịch vụ...</p>
        </div>
      ) : (
        <Row className="g-4 mb-4">
          {plans.length === 0 ? (
            <Col xs={12}>
              <div className="text-center py-5">
                <p className="text-muted">Chưa có gói dịch vụ nào</p>
                <Button variant="primary" onClick={() => handleShowPlanModal()}>
                  <FaPlus className="me-2" /> Tạo gói đầu tiên
                </Button>
              </div>
            </Col>
          ) : (
            plans.map((plan) => (
              <Col key={plan.id} xs={12} md={6} lg={4}>
                <div
                  className="position-relative h-100"
                  style={{ isolation: "isolate", minHeight: "400px" }}
                >
                  <PlanCard plan={plan} mode="admin" />
                  {/* Action buttons overlay cho admin */}
                  <div
                    className="position-absolute top-0 end-0 m-3 d-flex gap-2"
                    style={{ zIndex: 10 }}
                  >
                    {/* Edit button */}
                    <Button
                      variant="light"
                      size="sm"
                      className="rounded-circle shadow-sm border border-secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShowPlanModal(plan);
                      }}
                      style={{
                        width: "40px",
                        height: "40px",
                        padding: "0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <BiEdit size={20} />
                    </Button>
                    {/* Delete button */}
                    <Button
                      variant="danger"
                      size="sm"
                      className="rounded-circle shadow-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePlan(plan);
                      }}
                      style={{
                        width: "40px",
                        height: "40px",
                        padding: "0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <FaTrash size={16} />
                    </Button>
                  </div>
                </div>
              </Col>
            ))
          )}
        </Row>
      )}

      {/* SỬA 4: Cập nhật toàn bộ Modal Form (Bỏ checkbox, thêm 2 trường giá) */}
      <Modal
        show={showPlanModal}
        onHide={handleClosePlanModal}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingPlan ? "Chỉnh sửa gói dịch vụ" : "Thêm gói dịch vụ mới"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handlePlanSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tên gói *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={planFormData.name}
                    onChange={handlePlanInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Loại gói *</Form.Label>
                  <Form.Select
                    name="billingType"
                    value={planFormData.billingType}
                    onChange={handlePlanInputChange}
                  >
                    <option value="MONTHLY_SUBSCRIPTION">Theo tháng</option>
                    <option value="PAY_AS_YOU_GO">Trả theo lượt</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phí hàng tháng (VNĐ) *</Form.Label>
                  <Form.Control
                    type="number"
                    name="monthlyFee"
                    value={planFormData.monthlyFee}
                    onChange={handlePlanInputChange}
                    required
                    min="0"
                    step="0.01"
                  />
                  <Form.Text>Nhập 0 nếu là gói "Trả theo lượt".</Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Giá mỗi kWh (VNĐ) *</Form.Label>
                  <Form.Control
                    type="number"
                    name="pricePerKwh"
                    value={planFormData.pricePerKwh}
                    onChange={handlePlanInputChange}
                    required
                    min="0"
                    step="0.01"
                  />
                  <Form.Text>Giá điện mỗi kWh (VD: 3800)</Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Giá mỗi phút (VNĐ)</Form.Label>
                  <Form.Control
                    type="number"
                    name="pricePerMinute"
                    value={planFormData.pricePerMinute}
                    onChange={handlePlanInputChange}
                    min="0"
                    step="0.01"
                  />
                  <Form.Text>
                    Phí tính theo thời gian sạc (thường = 0)
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Mô tả và quyền lợi *</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                name="benefits"
                value={planFormData.benefits}
                onChange={handlePlanInputChange}
                required
              />
              <Form.Text className="text-muted">
                Nhập mô tả và các quyền lợi của gói. Dữ liệu sẽ hiển thị nguyên
                văn.
              </Form.Text>
            </Form.Group>

            {/* ĐÃ XÓA Ô CHECKBOX "ISPOPULAR" TẠI ĐÂY */}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClosePlanModal}>
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              {editingPlan ? "Cập nhật" : "Tạo mới"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* User Detail Modal */}
      <Modal
        show={showUserDetailModal}
        onHide={handleCloseUserDetail}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="border-bottom">
          <Modal.Title className="fw-bold">
            Thông tin chi tiết tài xế
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedUser && (
            <div>
              {/* Personal Information */}
              <div className="mb-4">
                <h5
                  className="fw-semibold mb-3 border-bottom pb-2"
                  style={{ color: "#22c55e" }}
                >
                  <i className="bi bi-person-circle me-2"></i>
                  Thông tin cá nhân
                </h5>
                <Row className="g-3">
                  <Col md={6}>
                    <div
                      className="border rounded p-3"
                      style={{ backgroundColor: "#f0fdf4" }}
                    >
                      <small className="text-muted d-block mb-1">
                        Họ và tên
                      </small>
                      <div className="fw-semibold">
                        {selectedUser.fullName || "—"}
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div
                      className="border rounded p-3"
                      style={{ backgroundColor: "#f0fdf4" }}
                    >
                      <small className="text-muted d-block mb-1">Email</small>
                      <div className="fw-semibold">
                        {selectedUser.email || "—"}
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div
                      className="border rounded p-3"
                      style={{ backgroundColor: "#f0fdf4" }}
                    >
                      <small className="text-muted d-block mb-1">
                        Số điện thoại
                      </small>
                      <div className="fw-semibold">
                        {selectedUser.phone || "—"}
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div
                      className="border rounded p-3"
                      style={{ backgroundColor: "#f0fdf4" }}
                    >
                      <small className="text-muted d-block mb-1">
                        Ngày tham gia
                      </small>
                      <div className="fw-semibold">
                        {selectedUser.joinDate || "—"}
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Subscription Information */}
              <div className="mb-4">
                <h5
                  className="fw-semibold mb-3 border-bottom pb-2"
                  style={{ color: "#22c55e" }}
                >
                  <i className="bi bi-star-fill me-2"></i>
                  Thông tin gói dịch vụ
                </h5>
                <Row className="g-3">
                  <Col md={6}>
                    <div
                      className="border rounded p-3"
                      style={{ backgroundColor: "#f0fdf4" }}
                    >
                      <small className="text-muted d-block mb-1">
                        Gói hiện tại
                      </small>
                      <div>{getPlanBadge(selectedUser.planName)}</div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div
                      className="border rounded p-3"
                      style={{ backgroundColor: "#f0fdf4" }}
                    >
                      <small className="text-muted d-block mb-1">
                        Trạng thái
                      </small>
                      <div>{getStatusBadge(selectedUser.status)}</div>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Usage Statistics */}
              <div className="mb-4">
                <h5
                  className="fw-semibold mb-3 border-bottom pb-2"
                  style={{ color: "#22c55e" }}
                >
                  <i className="bi bi-graph-up me-2"></i>
                  Thống kê sử dụng
                </h5>
                <Row className="g-3">
                  <Col md={6}>
                    <div
                      className="border rounded p-3"
                      style={{ backgroundColor: "#f0fdf4" }}
                    >
                      <small className="text-muted d-block mb-1">
                        Tổng số phiên sạc
                      </small>

                      <div
                        className="fw-semibold fs-4"
                        style={{ color: "#22c55e" }}
                      >
                        {selectedUser.sessionCount ?? 0}
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div
                      className="border rounded p-3"
                      style={{ backgroundColor: "#f0fdf4" }}
                    >
                      <small className="text-muted d-block mb-1">
                        Tổng chi tiêu
                      </small>

                      <div
                        className="fw-semibold fs-4"
                        style={{ color: "#22c55e" }}
                      >
                        {(selectedUser.totalSpent ?? 0).toLocaleString("vi-VN")}
                        ₫
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Additional Info */}
              {selectedUser.address && (
                <div className="mb-3">
                  <h5
                    className="fw-semibold mb-3 border-bottom pb-2"
                    style={{ color: "#22c55e" }}
                  >
                    <i className="bi bi-geo-alt-fill me-2"></i>
                    Địa chỉ
                  </h5>

                  <div
                    className="border rounded p-3"
                    style={{ backgroundColor: "#f0fdf4" }}
                  >
                    <div className="fw-semibold">{selectedUser.address}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-top">
          <Button variant="secondary" onClick={handleCloseUserDetail}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UsersList;
