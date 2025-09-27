import React, { Component } from 'react'
import "./AddUserInfoPage.css";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';



export class AddUserInfoPage extends Component {
    constructor() {
        super();
        this.state = {
            form: {
                last_name: '',
                first_name: '',
                gender: '',
                dob: '',
                phoneNum: ''
            },
            agree: false, //trạng thái checkbox
            errors: {}
        }
    }

    handleAgree = (e) => {
        this.setState({ agree: e.target.checked });//giá trị true/false của checkbox
    }


    handleChangeValue = (e) => {
        const userData = { ...this.state.form };
        userData[e.target.name] = e.target.value;
        this.setState({ form: userData });
    }

    // Khi focus vào input → xóa lỗi của field đó
    handleFocus = (e) => {
        const fieldName = e.target.name;
        const errors = { ...this.state.errors };
        if (errors[fieldName]) {
            delete errors[fieldName];
            this.setState({ errors });
        }
    };

    handelSubmitForm = (e) => {
        e.preventDefault();
        const { last_name, first_name, gender, dob, phoneNum } = this.state.form;
        if (!this.state.agree) {
            alert('Bạn phải xác nhận thông tin trước khi gửi.');
            return;
        }
        const errors = {};//chứa tất cả lỗi

        if (!last_name.trim()) {// check họ và tên có trống không
            errors.last_name = 'Vui lòng điền đầy đủ họ tên.';
        } else if (last_name.trim().length < 1 || last_name.trim().length > 20) {
            errors.last_name = 'Họ giới hạn từ 1-20 kí tự.'
        }

        if (!first_name.trim()) {
            errors.first_name = 'Vui lòng điền đầy đủ họ tên.';
        } else if (first_name.trim().length < 1 || first_name.trim().length > 10) {
            errors.first_name = 'Tên giới hạn từ 1-10 kí tự.';
        }

        if (!gender) {
            errors.gender = 'Vui lòng chọn giới tính';
        }

        if (!dob) {
            errors.dob = 'Vui lòng chọn ngày sinh';
        }

        if (!phoneNum || phoneNum.trim() === '') {
            errors.phoneNum = 'Số điện thoại không được để trống';
        } else if (!/^\+84-\d{3}-\d{3}-\d{3}$/.test(phoneNum)) {
            errors.phoneNum = 'Số điện thoại phải theo định dạng +84-XXX-XXX-XXX';
        }

        this.setState({ errors });

        console.log(last_name, first_name, gender, dob, phoneNum);//check thông tin trên console
    }

    render() {
        const { errors } = this.state;
        console.log(errors);
        return (
            <div className="Background">
                <div className="container">
                    <Form className="form-container" onSubmit={this.handelSubmitForm}>
                        <div className="title">
                            <h1>Vui lòng nhập thông tin</h1>
                        </div>
                        <Form.Group className="mb-3" controlId="form-user-fullname">
                            <Form.Label>Họ và tên</Form.Label>
                            <div className="fullname">
                                <Form.Control onFocus={this.handleFocus} onChange={this.handleChangeValue} style={{
                                    borderColor: errors.last_name ? 'red' : '',
                                    outline: errors.last_name ? 'none' : '',
                                    boxShadow: errors.last_name ? '0 0 6px rgba(255, 0, 0, 1)' : ''
                                }} name="last_name" className="last-name" type="text" placeholder="Họ" />
                                <Form.Control style={{
                                    borderColor: errors.first_name ? 'red' : '',
                                    outline: errors.first_name ? 'none' : '',
                                    boxShadow: errors.first_name ? '0 0 6px rgba(255, 0, 0, 1)' : ''
                                }} onFocus={this.handleFocus} onChange={this.handleChangeValue} name="first_name" className="first-name" type="text" placeholder="Tên" />
                            </div>
                            {/* Hiển thị lỗi */}
                            {(errors.last_name || errors.first_name) && (
                                <div style={{ color: 'red', marginTop: '4px' }}>
                                    {(errors.last_name || errors.first_name)}
                                </div>
                            )}

                        </Form.Group>

                        <Form.Group className="mb-3" controlId="form-user-gender">
                            <Form.Label>Giới tính</Form.Label>
                            <div>
                                <Form.Check onFocus={this.handleFocus} onChange={this.handleChangeValue} className="form-radio" inline label="Nam" name="gender" type="radio" id="gender-nam" value="0" />
                                <Form.Check onFocus={this.handleFocus} onChange={this.handleChangeValue} className="form-radio" inline label="Nữ" name="gender" type="radio" id="gender-nu" value="1" />
                            </div>
                            {/* Hiển thị lỗi */}
                            {(errors.gender) && (
                                <div style={{ color: 'red', marginTop: '4px' }}>
                                    {(errors.gender)}
                                </div>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="form-user-dob">
                            <Form.Label>Ngày tháng năm sinh</Form.Label>
                            <Form.Control style={{
                                borderColor: errors.dob ? 'red' : '',
                                outline: errors.dob ? 'none' : '',
                                boxShadow: errors.dob ? '0 0 6px rgba(255, 0, 0, 1)' : ''
                            }} onFocus={this.handleFocus} onChange={this.handleChangeValue} name="dob" className="placeholdertxt" lang="vi" type="date" />
                            {/* Hiển thị lỗi */}
                            {(errors.dob) && (
                                <div style={{ color: 'red', marginTop: '4px' }}>
                                    {(errors.dob)}
                                </div>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="form-user-phoneNum">
                            <Form.Label>Số điện thoại</Form.Label>
                            <Form.Control style={{
                                borderColor: errors.phoneNum ? 'red' : '',
                                outline: errors.phoneNum ? 'none' : '',
                                boxShadow: errors.phoneNum ? '0 0 6px rgba(255, 0, 0, 1)' : ''
                            }} onFocus={this.handleFocus} onChange={this.handleChangeValue} name="phoneNum" className="placeholdertxt" type="text" placeholder="+84-XXX-XXX-XXX" />
                            {/* Hiển thị lỗi */}
                            {(errors.phoneNum) && (
                                <div style={{ color: 'red', marginTop: '4px' }}>
                                    {(errors.phoneNum)}
                                </div>
                            )}
                        </Form.Group>


                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" onChange={this.handleAgree} />
                            <label className="form-check-label">Tôi xin cam đoan mọi thông tin trên đều chuẩn xác.</label>
                        </div>

                        <Button variant="primary" type="submit">
                            Xác nhận
                        </Button>
                    </Form>
                    <Button variant="logout" type="submit">
                        Đăng xuất
                    </Button>
                </div></div>
        )
    }
}

export default AddUserInfoPage