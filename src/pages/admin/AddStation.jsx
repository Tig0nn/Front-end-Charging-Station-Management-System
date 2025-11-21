import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
    contactPhone: "", // Thêm trường số điện thoại
    numberOfChargingPoints: "",
    powerOutput: "POWER_22KW", // Enum value
    staff: "", // Staff ID để gán
  });

  const [geocoding, setGeocoding] = useState({
    loading: false,
    latitude: null,
    longitude: null,
    error: null,
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

  // Hàm gọi Geocoding API để lấy latitude/longitude từ địa chỉ
  const getCoordinatesFromAddress = async (address) => {
    try {
      setGeocoding({
        loading: true,
        latitude: null,
        longitude: null,
        error: null,
      });

      // Sử dụng Nominatim API (OpenStreetMap) - Free và không cần API key
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address
        )}&limit=1`
      );

      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setGeocoding({
          loading: false,
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          error: null,
        });
        return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
      } else {
        setGeocoding({
          loading: false,
          latitude: null,
          longitude: null,
          error: "Không tìm thấy tọa độ cho địa chỉ này",
        });
        return null;
      }
    } catch (err) {
      console.error("Lỗi khi lấy tọa độ:", err);
      setGeocoding({
        loading: false,
        latitude: null,
        longitude: null,
        error: "Lỗi khi lấy tọa độ",
      });
      return null;
    }
  };

  //  Submit form tạo station
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Lấy tọa độ từ địa chỉ
    const coordinates = await getCoordinatesFromAddress(formData.address);

    if (!coordinates) {
      toast.error(
        "Không thể lấy tọa độ từ địa chỉ. Vui lòng kiểm tra lại địa chỉ."
      );
      return;
    }

    // Chuẩn bị payload theo API spec THỰC TẾ
    const payload = {
      name: formData.name,
      address: formData.address,
      numberOfChargingPoints: parseInt(formData.numberOfChargingPoints),
      powerOutput: formData.powerOutput,
      operatorName: formData.operatorName,
      contactPhone: formData.contactPhone,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      staffId: formData.staff || "",
    };

    try {
      console.log("📤 Đang gửi dữ liệu tạo station:", payload);
      const response = await stationsAPI.create(payload);
      console.log("✅ Response:", response);
      toast.success("Tạo trạm sạc mới thành công!");
      navigate("/admin/stations");
    } catch (err) {
      console.error("Lỗi khi tạo trạm:", err);
      console.error("Error response:", err.response?.data);
      const errorMsg = err.response?.data?.message || err.message;
      toast.error(`Không thể tạo trạm sạc: ${errorMsg}`);
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
      <ToastContainer position="top-right" autoClose={3000} />
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
                      {/* Hiển thị trạng thái Geocoding */}
                      {geocoding.loading && (
                        <Form.Text className="text-info">
                          🔍 Đang tìm kiếm tọa độ...
                        </Form.Text>
                      )}
                      {geocoding.latitude && geocoding.longitude && (
                        <Form.Text className="text-success">
                          ✅ Tọa độ: {geocoding.latitude.toFixed(6)},{" "}
                          {geocoding.longitude.toFixed(6)}
                        </Form.Text>
                      )}
                      {geocoding.error && (
                        <Form.Text className="text-danger">
                          {geocoding.error}
                        </Form.Text>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  {/*   Chủ sở hữu */}
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Chủ sở hữu *</Form.Label>
                      <Form.Control
                        type="text"
                        name="operatorName"
                        value={formData.operatorName}
                        onChange={handleChange}
                        placeholder="Nhập tên chủ sở hữu"
                        required
                      />
                    </Form.Group>
                  </Col>

                  {/*   Số điện thoại */}
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Số điện thoại *</Form.Label>
                      <Form.Control
                        type="tel"
                        name="contactPhone"
                        value={formData.contactPhone}
                        onChange={handleChange}
                        placeholder="Nhập số điện thoại (10 chữ số)"
                        required
                        pattern="[0-9]{10}"
                        title="Vui lòng nhập đúng 10 chữ số"
                      />
                      <Form.Text className="text-muted">
                        Ví dụ: 0901234567
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

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
