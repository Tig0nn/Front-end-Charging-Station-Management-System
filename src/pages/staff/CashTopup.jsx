import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Table,
  Badge,
} from "react-bootstrap";
import { usersAPI, walletAPI } from "../../lib/apiServices";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/loading_spins/LoadingSpinner";

const CashTopup = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(true);

  const [formData, setFormData] = useState({
    targetUserIdentifier: "",
    amount: "",
    description: "",
  });

  const [validationError, setValidationError] = useState("");
  const [recentTransactions, setRecentTransactions] = useState([]);

  // Fetch danh sách users khi component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await usersAPI.getDriver();
      setUsers(response?.data?.result || []);
    } catch (err) {
      console.error(" Error fetching users:", err);
    } finally {
      setUsersLoading(false);
    }
  };

  // Validate email/phone với danh sách users
  const validateUserIdentifier = (identifier) => {
    if (!identifier) {
      setValidationError("");
      return false;
    }

    const foundUser = users.find(
      (user) =>
        user.email?.toLowerCase() === identifier.toLowerCase() ||
        user.phone === identifier
    );

    if (!foundUser) {
      setValidationError(
        ` Không tìm thấy người dùng với email: ${identifier}`
      );
      return false;
    }

    setValidationError(` Tìm thấy: ${foundUser.fullName} (${foundUser.email})`);
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate khi nhập email/phone
    if (name === "targetUserIdentifier") {
      validateUserIdentifier(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    if (!formData.targetUserIdentifier) {
      toast.error("Vui lòng nhập email");
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("Số tiền phải lớn hơn 0");
      return;
    }

    // Validate user tồn tại
    if (!validateUserIdentifier(formData.targetUserIdentifier)) {
      toast.error("Email không hợp lệ");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        targetUserIdentifier: formData.targetUserIdentifier.trim(),
        amount: parseFloat(formData.amount),
        description: formData.description || `Nạp tiền mặt tại trạm`,
      };

      console.log(" Sending cash topup request:", payload);

      const response = await walletAPI.cashTopup(payload);

      console.log(" Cash topup response:", response);

      if (response.data.code === 1000) {
        const transaction = response.data.result;

        toast.success(
          ` Nạp ${transaction.amount.toLocaleString("vi-VN")}₫ thành công!`
        );

        // Thêm vào lịch sử giao dịch
        setRecentTransactions((prev) => [transaction, ...prev.slice(0, 9)]);

        // Reset form
        setFormData({
          targetUserIdentifier: "",
          amount: "",
          description: "",
        });
        setValidationError("");
      }
    } catch (err) {
      console.error(" Error cash topup:", err);
      const errorMsg = err.response?.data?.message || err.message;
      toast.error(`Lỗi nạp tiền: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      COMPLETED: { bg: "success", text: "Hoàn thành" },
      PENDING: { bg: "warning", text: "Đang xử lý" },
      FAILED: { bg: "danger", text: "Thất bại" },
    };
    const config = statusMap[status] || { bg: "secondary", text: status };
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };
  return (
    <Container fluid className="py-4">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          {/* Main Card */}
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Body className="p-5">
              {/* Header */}
              <div className="text-center mb-4">
                <h3 className="fw-bold mb-2">Nạp tiền mặt</h3>
                <p className="text-muted mb-0">
                  Nạp tiền mặt vào ví người dùng
                </p>
              </div>

              <Form onSubmit={handleSubmit}>
                {/* Email Input */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold text-secondary small mb-2">
                    Email người dùng
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="targetUserIdentifier"
                    value={formData.targetUserIdentifier}
                    onChange={handleInputChange}
                    placeholder="Nhập email"
                    disabled={loading || usersLoading}
                    required
                    style={{
                      height: "50px",
                      fontSize: "15px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                    }}
                  />
                  {validationError && (
                    <div
                      className={`mt-2 small ${
                        validationError.includes("Tìm thấy")
                          ? "text-success"
                          : "text-danger"
                      }`}
                    >
                      {validationError}
                    </div>
                  )}
                </Form.Group>

                {/* Amount Input */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold text-secondary small mb-2">
                    Số tiền nạp (VND)
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="Nhập số tiền"
                    disabled={loading}
                    required
                    style={{
                      height: "56px",
                      fontSize: "16px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      fontWeight: "500",
                    }}
                  />
                </Form.Group>                {/* Quick Amount Buttons */}
                <div className="mb-4">
                  <Row className="g-2">
                    {[50000, 100000, 200000, 500000, 1000000, 2000000].map(
                      (amount) => (
                        <Col xs={4} key={amount}>
                          <Button
                            variant="outline-secondary"
                            className="w-100"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                amount: amount.toString(),
                              }))
                            }
                            disabled={loading}
                            style={{
                              height: "48px",
                              fontSize: "14px",
                              fontWeight: "500",
                              border: "1px solid #e2e8f0",
                              borderRadius: "10px",
                              backgroundColor: "white",
                              color: "#475569",
                            }}
                          >
                            {amount.toLocaleString("vi-VN")}
                          </Button>
                        </Col>
                      )
                    )}
                  </Row>
                </div>

                {/* Description */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold text-secondary small mb-2">
                    Ghi chú (tùy chọn)
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Nhập ghi chú cho giao dịch"
                    disabled={loading}
                    style={{
                      fontSize: "15px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                    }}
                  />
                </Form.Group>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-100"
                  disabled={
                    loading ||
                    usersLoading ||
                    !formData.targetUserIdentifier ||
                    !formData.amount
                  }
                  style={{
                    height: "56px",
                    fontSize: "16px",
                    fontWeight: "600",
                    backgroundColor: "#22c55e",
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: loading
                      ? "none"
                      : "0 4px 12px rgba(34, 197, 94, 0.3)",
                  }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle-fill me-2"></i>
                      Xác nhận nạp tiền
                    </>
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>

          {/* Recent Transactions */}
          {recentTransactions.length > 0 && (
            <Card className="shadow-sm border-0 rounded-4 mt-4">
              <Card.Body className="p-4">
                <h6 className="fw-bold mb-3">
                  <i className="bi bi-clock-history me-2"></i>
                  Giao dịch gần đây
                </h6>
                <div className="list-group list-group-flush">
                  {recentTransactions.slice(0, 5).map((tx, idx) => (
                    <div
                      key={tx.id || idx}
                      className="list-group-item border-0 px-0 py-3"
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <div className="fw-semibold mb-1">
                            +{tx.amount.toLocaleString("vi-VN")}₫
                          </div>
                          <small className="text-muted">
                            {formatDate(tx.timestamp)}
                          </small>
                        </div>
                        {getStatusBadge(tx.status)}
                      </div>
                      {tx.description && (
                        <small className="text-muted d-block mt-1">
                          {tx.description}
                        </small>
                      )}
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Loading State */}
          {usersLoading && (
            <Alert
              variant="info"
              className="mt-3 border-0 rounded-3"
              style={{ backgroundColor: "#f0f9ff" }}
            >
              <div className="d-flex align-items-center">
                <LoadingSpinner size="sm" />
                <span className="ms-2">Đang tải danh sách người dùng...</span>
              </div>
            </Alert>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default CashTopup;
