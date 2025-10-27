import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router";
import { staffAPI, stationsAPI } from "../../lib/apiServices";

const AddStation = () => {
  const navigate = useNavigate();

  const [staffs, setStaffs] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [searchStaff, setSearchStaff] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    operatorName: "",
    numberOfChargingPoints: "",
    powerOutput: "POWER_22KW", // Enum value
    staff: "", // Staff ID để gán
  });

  //  Gọi API lấy danh sách staff khi component mount
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
      const name = (s.fullName || s.name || "").toLowerCase();
      return name.includes(searchText.toLowerCase());
    });
    setSearchStaff(filtered);
  }, [searchText, staffs]);

  //  Submit form tạo station
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Chuẩn bị payload theo API spec THỰC TẾ
    const payload = {
      name: formData.name,
      address: formData.address, // Backend sẽ tự convert sang latitude/longitude
      numberOfChargingPoints: parseInt(formData.numberOfChargingPoints),
      powerOutput: formData.powerOutput, // Enum: POWER_22KW, POWER_50KW, etc.
      operatorName: formData.operatorName,
      contactPhone: "0000000000", // Số điện thoại giả hợp lệ (10 chữ số)
      latitude: 0, // Tọa độ mặc định (TP.HCM)
      longitude: 0, // Tọa độ mặc định (TP.HCM)
      staffId: formData.staff || "", // Empty string nếu không chọn staff
    };

    try {
      console.log("📤 Đang gửi dữ liệu tạo station:", payload);
      const response = await stationsAPI.create(payload);
      console.log("✅ Response:", response);
      alert("Tạo trạm sạc mới thành công!");
      navigate("/admin/stations");
    } catch (err) {
      console.error("❌ Lỗi khi tạo trạm:", err);
      console.error("❌ Error response:", err.response?.data);
      const errorMsg = err.response?.data?.message || err.message;
      alert(`Không thể tạo trạm sạc: ${errorMsg}`);
    }
  };
  //  Xử lý thay đổi input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1>Add New Charging Station</h1>
          <p className="lead">Create a new charging station</p>
        </Col>
      </Row>

      <Row>
        <Col md={8}>
          <Card>
            <Card.Header>
              <h5>Station Information</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row>
                  {/**   Tên trạm và địa chỉ */}
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tên trạm</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Nhập tên trạm"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    {/**   Địa chỉ */}
                    <Form.Group className="mb-3">
                      <Form.Label>Địa chỉ</Form.Label>
                      <Form.Control
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Nhập địa chỉ"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                {/*   Chủ sở hữu */}
                <Form.Group className="mb-3">
                  <Form.Label>Chủ sở hữu</Form.Label>
                  <Form.Control
                    type="text"
                    name="operatorName"
                    value={formData.operatorName}
                    onChange={handleChange}
                    placeholder="Nhập tên chủ sở hữu"
                    required
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Công suất *</Form.Label>
                      <Form.Select
                        name="powerOutput"
                        value={formData.powerOutput}
                        onChange={handleChange}
                        required
                      >
                        <option value="POWER_22KW">22kW</option>
                        <option value="POWER_50KW">50kW</option>
                        <option value="POWER_120KW">120kW</option>
                        <option value="POWER_350KW">350kW</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Số điểm sạc *</Form.Label>
                      <Form.Control
                        type="number"
                        name="numberOfChargingPoints"
                        value={formData.numberOfChargingPoints}
                        onChange={handleChange}
                        placeholder="Nhập số điểm sạc"
                        required
                        min="1"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/**   Dropdown để chọn nhân viên */}
                <Form.Group className="mb-3">
                  <Form.Label>Gán nhân viên</Form.Label>
                  {loadingStaff ? (
                    <div>Đang tải danh sách nhân viên...</div>
                  ) : (
                    <>
                      {/* Search input để lọc nhân viên */}
                      <Form.Control
                        type="text"
                        placeholder="Tìm kiếm nhân viên..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="mb-2"
                      />
                      {/*   Dropdown để chọn nhân viên */}
                      <Form.Select
                        name="staff"
                        value={formData.staff}
                        onChange={handleChange}
                      >
                        <option value="">
                          -- Chọn nhân viên phụ trách (không bắt buộc) --
                        </option>
                        {searchStaff.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.fullName}
                          </option>
                        ))}
                      </Form.Select>
                    </>
                  )}
                </Form.Group>

                <div className="d-flex gap-2">
                  <Button type="submit" variant="primary">
                    Create Station
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => navigate("/admin/stations")}
                  >
                    Cancel
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AddStation;
