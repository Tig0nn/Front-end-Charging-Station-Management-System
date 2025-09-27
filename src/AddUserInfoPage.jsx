import React, { Component } from 'react'
import "./AddUserInfoPage.css";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';




function HandleClick(e) {
    e.preventDefault();
    alert("Form đã được submit!");
}




export class AddUserInfoPage extends Component {
    constructor(){
        super();
        this.state = {
            form: {
                last_name:'',
                first_name:'',
                gender:'',
                dob:'',
                phoneNum:''
            }
        }
    }

    handleChangeValue=(e)=>{
        const userData = {...this.state.form};
        userData[e.target.name]=e.target.value;
        this.setState({form: userData});
    }

    handelSubmitForm=(e)=>{
        e.preventDefault();
        const {last_name, first_name, gender, dob, phoneNum} = this.state.form;
        console.log(last_name, first_name, gender, dob, phoneNum);
    }

    render() {
        return (
            <div className="Background">
                <div className="container">
                    <Form className="form-container" onSubmit={this.handelSubmitForm}>
                        <div className="title">
                            <h1>Vui lòng nhập thông tin</h1>
                        </div>
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>Họ và tên</Form.Label>
                            <div className="fullname">
                                <Form.Control onChange={this.handleChangeValue} name="last_name" className="last-name" type="text" placeholder="Họ" />
                                <Form.Control onChange={this.handleChangeValue} name="first_name" className="first-name" type="text" placeholder="Tên" />
                            </div>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicGender">
                            <Form.Label>Giới tính</Form.Label>
                            <div>
                                <Form.Check onChange={this.handleChangeValue} className="form-radio" inline label="Nam" name="gender" type="radio" id="gender-nam" value="0" />
                                <Form.Check onChange={this.handleChangeValue} className="form-radio" inline label="Nữ" name="gender" type="radio" id="gender-nu" value="1" />
                            </div>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>Ngày tháng năm sinh</Form.Label>
                            <Form.Control onChange={this.handleChangeValue} name="dob" className="placeholdertxt" lang="vi" type="date" />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>Số điện thoại</Form.Label>
                            <Form.Control onChange={this.handleChangeValue} name="phoneNum" className="placeholdertxt" type="text"  placeholder="+84-XXX-XXX-XXX" />
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
        )
    }
}

export default AddUserInfoPage