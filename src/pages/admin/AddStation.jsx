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
    powerOutputKw: "22",
    numberOfChargingPoints: "",
    staffId: "",
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
    //  Chuyển đổi các trường số về kiểu number
    const payload = {
      ...formData,
      numberOfChargingPoints: Number(formData.numberOfChargingPoints),
      powerOutputKw: Number(formData.powerOutputKw),
    };
    try {
      console.log("Đang gửi dữ liệu:", payload);
      await stationsAPI.create(payload);
      alert("Tạo trạm sạc mới thành công!");
      navigate("/admin/stations");
    } catch (err) {
      console.error("Lỗi khi tạo trạm:", err);
      alert("Không thể tạo trạm sạc. Vui lòng thử lại.");
    }
  };

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
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Station Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter station name"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Address</Form.Label>
                      <Form.Control
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter address"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Operator Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="operatorName"
                    value={formData.operatorName}
                    onChange={handleChange}
                    placeholder="Enter operator name"
                    required
                  />
                </Form.Group>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Power Output</Form.Label>
                      <Form.Select
                        name="powerOutputKw"
                        value={formData.powerOutputKw}
                        onChange={handleChange}
                      >
                        <option value="22">22kW</option>
                        <option value="50">50kW</option>
                        <option value="120">120kW</option>
                        <option value="350">350kW</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Number of Charging Points</Form.Label>
                      <Form.Control
                        type="number"
                        name="numberOfChargingPoints"
                        value={formData.numberOfChargingPoints}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Form.Group className="mb-3">
                    <Form.Label>Assign Staff</Form.Label>
                    {loadingStaff ? (
                      <div>Đang tải danh sách nhân viên...</div>
                    ) : (
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
                          value={formData.staffId}
                          onChange={handleChange}
                          required
                        >
                          <option value="">
                            -- Chọn nhân viên phụ trách --
                          </option>
                          {searchStaff.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.fullName || s.name}
                            </option>
                          ))}
                        </Form.Select>
                      </>
                    )}
                  </Form.Group>
                </Row>

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
export {}
