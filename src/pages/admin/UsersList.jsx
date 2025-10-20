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
import { FaPlus } from "react-icons/fa";
import { BiEdit } from "react-icons/bi";
import AdminPlanCard from "../../components/AdminPlanCard"; // Giả sử bạn có component này

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Plans state
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  // SỬA 1: Cập nhật state của form plan
  const [planFormData, setPlanFormData] = useState({
    name: "",
    price: "", // (Đây là monthlyFee)
    features: "",
    billingType: "MONTHLY",
    pricePerKwh: "0", // Thêm trường mới
    pricePerMinute: "0", // Thêm trường mới
  });

  // Tách hàm fetchPlans ra
  const fetchPlans = async () => {
    try {
      setPlansLoading(true);
      const response = await plansAPI.getAll();
      console.log("📦 Plans API response:", response);

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

      // Transform to UI format
      const transformedPlans = plansData.map((plan, index) => ({
        id: plan.planId,
        name: plan.name,
        price: plan.monthlyFee || 0,
        // SỬA 2: Sửa billingType cho khớp API
        period: plan.billingType === "PAY_AS_YOU_GO" ? "lượt" : "tháng",
        features: plan.benefits
          ? plan.benefits.split(",").map((b) => b.trim())
          : [
              `${plan.pricePerKwh || 0}đ/kWh`,
              `${plan.pricePerMinute || 0}đ/phút`,
            ],
        isPopular: index === 1,
        billingType: plan.billingType,
        pricePerKwh: plan.pricePerKwh,
        pricePerMinute: plan.pricePerMinute,
      }));

      setPlans(transformedPlans);
    } catch (err) {
      console.error("❌ Error fetching plans:", err);
    } finally {
      setPlansLoading(false);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await usersAPI.getAll();
        setUsers(res?.data?.result || []);
      } catch (err) {
        console.error("Lỗi khi tải danh sách người dùng:", err);
        setError("Không thể tải danh sách người dùng");
        console.log(
          "localStorage authToken:",
          localStorage.getItem("authToken")
        );
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
      // Chế độ Edit
      setEditingPlan(plan);
      setPlanFormData({
        name: plan.name,
        price: plan.price.toString(), // (monthlyFee)
        features: Array.isArray(plan.features) ? plan.features.join("\n") : "",
        billingType: plan.billingType || "MONTHLY",
        pricePerKwh: plan.pricePerKwh?.toString() || "0",
        pricePerMinute: plan.pricePerMinute?.toString() || "0",
      });
    } else {
      // Chế độ Create (Reset form)
      setEditingPlan(null);
      setPlanFormData({
        name: "",
        price: "", // (monthlyFee)
        features: "",
        billingType: "MONTHLY",
        pricePerKwh: "0",
        pricePerMinute: "0",
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

  // SỬA 5: Cập nhật handleSubmit (gửi 6 trường + gọi lại fetchPlans)
  const handlePlanSubmit = async (e) => {
    e.preventDefault();

    try {
      // Gói dữ liệu gửi đi cho khớp API (Đầy đủ 6 trường)
      const planData = {
        name: planFormData.name,
        billingType: planFormData.billingType,
        monthlyFee: parseFloat(planFormData.price) || 0, // 'price' trong form là monthlyFee
        pricePerKwh: parseFloat(planFormData.pricePerKwh) || 0,
        pricePerMinute: parseFloat(planFormData.pricePerMinute) || 0,
        benefits: planFormData.features
          .split("\n")
          .filter((f) => f.trim())
          .join(","),
      };

      if (editingPlan) {
        console.log("Updating plan:", editingPlan.id, planData);
        // TODO: await plansAPI.update(editingPlan.id, planData);
        alert("Chức năng cập nhật gói sẽ được bổ sung");
      } else {
        console.log("Creating plan:", planData);
        await plansAPI.create(planData);
        alert("Tạo gói dịch vụ thành công!");
      }

      // Tải lại danh sách plans sau khi thêm/sửa
      fetchPlans();
      handleClosePlanModal();
    } catch (err) {
      console.error("Error saving plan:", err);
      alert("Có lỗi xảy ra khi lưu gói dịch vụ");
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
      case "premium":
        return (
          <Badge
            bg="secondary"
            text="light"
            className="px-3 py-2 rounded-pill"
            style={style}
          >
            Premium
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

  return (
    <Container className="py-4">
      <Row>
        <Col>
          <h2 className="fw-bold">Quản lý người dùng</h2>
          <p className="text-muted">Danh sách và thông tin người dùng</p>
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
                    <Spinner animation="border" variant="primary" />
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
            variant="primary"
            size="lg"
            onClick={() => handleShowPlanModal()}
            className="d-flex align-items-center gap-2 px-4"
          >
            <FaPlus /> Thêm gói mới
          </Button>
        </Col>
      </Row>

      {/* Plans Grid */}
      {plansLoading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
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
                <AdminPlanCard plan={plan} onEdit={handleShowPlanModal} />
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
                    placeholder="VD: Premium, VIP"
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
                    <option value="MONTHLY">Trả theo tháng</option>
                    {/* Sửa giá trị này cho khớp API */}
                    <option value="PAY_AS_YOU_GO">
                      Trả theo lượt (Pay As You Go)
                    </option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Phí hàng tháng (VNĐ) *</Form.Label>
                  <Form.Control
                    type="number"
                    name="price" // (sẽ được map sang monthlyFee)
                    value={planFormData.price}
                    onChange={handlePlanInputChange}
                    placeholder="VD: 150000"
                    required
                    min="0"
                  />
                  <Form.Text>Nhập 0 nếu là gói "Trả theo lượt".</Form.Text>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Giá mỗi kWh (VNĐ) *</Form.Label>
                  <Form.Control
                    type="number"
                    name="pricePerKwh"
                    value={planFormData.pricePerKwh}
                    onChange={handlePlanInputChange}
                    required
                    min="0"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Giá mỗi phút (VNĐ) *</Form.Label>
                  <Form.Control
                    type="number"
                    name="pricePerMinute"
                    value={planFormData.pricePerMinute}
                    onChange={handlePlanInputChange}
                    required
                    min="0"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Quyền lợi/Mô tả (mỗi dòng một ý) *</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                name="features" // (sẽ được map sang benefits)
                value={planFormData.features}
                onChange={handlePlanInputChange}
                placeholder="VD:&#10;Ưu đãi 10% giá sạc&#10;Hỗ trợ 24/7&#10;Không giới hạn số lượt sạc"
                required
              />
              <Form.Text className="text-muted">
                Dữ liệu này sẽ được lưu vào trường "benefits".
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
    </Container>
  );
};

export default UsersList;
