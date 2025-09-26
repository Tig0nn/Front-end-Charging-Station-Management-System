import React from "react";
import "./SignUpForm.css";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';


function HandleClick(e) {
  e.preventDefault();
  alert("Form đã được submit!");
}

function SignUpForm() {
  return (
    <div className="Background">
    <img className="logo" src="src/image/logo.png"/>
    <div className="container">
      <Form className="form-container" onSubmit={HandleClick}>
        <div className="title">
          <h1>Đăng ký</h1>
        </div>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Tên tài khoản</Form.Label>
          <Form.Control className="placeholdertxt" type="username" placeholder="username123" />
        </Form.Group>
        

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Mật khẩu</Form.Label>
          <Form.Control className="placeholdertxt" type="password" placeholder="Mật khẩu phải ..." />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Xác nhận mật khẩu</Form.Label>
          <Form.Control className="placeholdertxt" type="password"/>
        </Form.Group>


        <Button variant="primary" type="submit">
          Đăng ký
        </Button>

        <div class="form-check">
          <input class="form-check-input" type="checkbox" />
          <label class="form-check-label">Tôi đồng ý với các điều khoản và dịch vụ.</label>
        </div>

        <div className="login">
          <label>Đã có tài khoản? </label><a href=""> Đăng nhập.</a>
        </div>
      </Form>
    </div></div>
  );
}

export default SignUpForm;
