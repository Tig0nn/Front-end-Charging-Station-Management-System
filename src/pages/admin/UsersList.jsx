import React, { useEffect, useState } from "react";
import { usersAPI } from "../../lib/apiServices.js";
import {
  Container,
  Row,
  Col,
  Table,
  Card,
  Button,
  Badge,
  Spinner,
} from "react-bootstrap";

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
  }, []);

  // Badge gói dịch vụ
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

  // Badge trạng thái
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

      {/* Thống kê gói dịch vụ */}
      <Row className="g-3">
        {[
          {
            title: "Gói Basic",
            desc: "Miễn phí",
            count: users.reduce((acc, user) => {
              if ((user.planName || "").toLowerCase() === "basic") acc++;
              return acc;
            }, 0),
            change: "+5.2%",
          },
          {
            title: "Gói Premium",
            desc: "199,000₫/tháng",
            count: users.reduce((acc, user) => {
              if ((user.planName || "").toLowerCase() === "premium") acc++;
              return acc;
            }, 0),
            change: "+12.8%",
          },
          {
            title: "Gói VIP",
            desc: "499,000₫/tháng",
            count: users.reduce((acc, user) => {
              if ((user.planName || "").toLowerCase() === "vip") acc++;
              return acc;
            }, 0),
            change: "+18.3%",
          },
        ].map((item, idx) => (
          <Col md={4} key={idx}>
            <Card className="rounded-3 border border-gray-300 shadow-sm hover:shadow-md transition-shadow">
              <Card.Body>
                <h5 className="fw-semibold mb-1">{item.title}</h5>
                <p className="text-muted mb-1">{item.desc}</p>
                <h2 className="fw-bold">
                  {item.count}{" "}
                  <span className="text-muted fs-6">người dùng</span>
                </h2>
                <p className="text-success small mb-0">
                  {item.change} so với tháng trước
                </p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default UsersList;
