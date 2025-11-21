import React, { useState, useEffect } from "react";
import { usersAPI } from "../../lib/apiServices";
import {
  Container,
  Row,
  Col,
  Table,
  Card,
  Badge,
  Spinner,
} from "react-bootstrap";
import LoadingSpinner from "../../components/loading_spins/LoadingSpinner";

const StaffList = () => {
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStaffs();
  }, []);

  const fetchStaffs = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getStaff();
      console.log("📋 Staff data:", response.data);
      setStaffs(response.data.result || []);
      setError(null);
    } catch (err) {
      console.error("❌ Error fetching staff:", err);
      setError("Không thể tải danh sách nhân viên");
    } finally {
      setLoading(false);
    }
  };


  return (
    <Container className="py-4">
      <Row>
        <Col>
          <h2 className="fw-bold">Quản lý nhân viên</h2>
          <p className="text-muted">Danh sách và thông tin nhân viên</p>
        </Col>
      </Row>

      <Card className="shadow-sm border-0 rounded-3">
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <LoadingSpinner />
              <p className="mt-2 text-muted">Đang tải danh sách nhân viên...</p>
            </div>
          ) : error ? (
            <div className="text-center text-danger py-4">{error}</div>
          ) : staffs.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-inbox text-5xl mb-3"></i>
              <p>Không có nhân viên nào.</p>
            </div>
          ) : (
            <Table hover responsive className="align-middle mb-0">
              <thead className="border-bottom small text-uppercase text-muted">
                <tr>
                  <th>Tên</th>
                  <th>Liên hệ</th>
                  <th>Mã nhân viên</th>
                  <th>Trạm</th>
                </tr>
              </thead>
              <tbody>
                {staffs.map((staff) => (
                  <tr key={staff.staffId}>
                    <td className="fw-semibold">{staff.fullName || "—"}</td>
                    <td>
                      {staff.email || "—"}
                      <br />
                      <span className="text-muted small">
                        {staff.phone || "—"}
                      </span>
                    </td>
                    <td>{staff.employeeNo || "—"}</td>
                    <td>{staff.stationName || "—"}</td>
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

export default StaffList;
