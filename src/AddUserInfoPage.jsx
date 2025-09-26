import React from "react";
import "./AddUserInfoPage.css";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';


function HandleClick(e) {
    e.preventDefault();
    alert("Form đã được submit!");
}

function AddUserInfoForm() {
    return (
        <div className="Background">
            <div className="container">
                <Form className="form-container" onSubmit={HandleClick}>
                    <div className="title">
                        <h1>Vui lòng nhập thông tin</h1>
                    </div>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Họ và tên</Form.Label>
                        <div className="fullname">
                        <Form.Control className="last-name" type="fullname" placeholder="Nguyễn Văn" />
                         <Form.Control className="first-name" type="fullname" placeholder="A" />
                        </div>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicGender">
                        <Form.Label>Giới tính</Form.Label>
                        <div>
                            <Form.Check className="form-radio" inline label="Nam" name="gender" type="radio" id="gender-nam" value="Nam" defaultChecked/*mặc định để là nam*//>
                            <Form.Check className="form-radio" inline label="Nữ"name="gender" type="radio" id="gender-nu" value="Nữ" />
                        </div>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Ngày tháng năm sinh</Form.Label>
                        <Form.Control className="placeholdertxt" lang="vi" type="date" />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicPassword">
                        <Form.Label>Số điện thoại</Form.Label>
                        <Form.Control className="placeholdertxt" type="phoneNumber" placeholder="+84-XXX-XXX-XXX" />
                    </Form.Group>


                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" />
                        <label class="form-check-label">Tôi xin cam đoan mọi thông tin trên đều chuẩn xác.</label>
                    </div>

                    <Button variant="primary" type="submit">
                        Xác nhận
                    </Button>
                </Form>
            </div></div>
    );
}

export default AddUserInfoForm;