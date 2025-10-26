import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./BackGround.css"; // import nền gradient
import { usersAPI } from "../lib/apiServices"; // dùng usersAPI cho update + get info
import { useAuth } from "../hooks/useAuth.jsx";
export default function AddUserInfoPage() {
  const { logout } = useAuth();
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  const [form, setForm] = useState({
    last_name: "",
    first_name: "",
    gender: "",
    dob: "",
    phoneNum: "",
  });

  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChangeValue = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleFocus = (e) => {
    const key = e.target.name;
    if (errors[key]) {
      const n = { ...errors };
      delete n[key];
      setErrors(n);
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    const { last_name, first_name, gender, dob, phoneNum } = form;
    const newErrors = {};

    if (!last_name.trim()) newErrors.last_name = "Vui lòng điền đầy đủ họ tên.";
    else if (last_name.trim().length < 1 || last_name.trim().length > 20)
      newErrors.last_name = "Họ giới hạn từ 1-20 kí tự.";

    if (!first_name.trim())
      newErrors.first_name = "Vui lòng điền đầy đủ họ tên.";
    else if (first_name.trim().length < 1 || first_name.trim().length > 10)
      newErrors.first_name = "Tên giới hạn từ 1-10 kí tự.";

    if (!gender) newErrors.gender = "Vui lòng chọn giới tính";
    if (!dob) newErrors.dob = "Vui lòng chọn ngày sinh";

    if (!phoneNum || phoneNum.trim() === "")
      newErrors.phoneNum = "Số điện thoại không được để trống";
    else if (!/^0\d{9}$/.test(phoneNum))
      newErrors.phoneNum = "Số điện thoại 10 số bắt đầu bằng số 0";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setIsSubmitting(true);
      await usersAPI.updateDriverInfo({
        lastName: last_name.trim(),
        firstName: first_name.trim(),
        gender: Number(gender),
        dateOfBirth: dob,
        phone: phoneNum.trim(),
      });

      const prof = await usersAPI.getDriverInfo().catch(() => null);
      const updatedUser = prof?.data?.result;

      // Chuẩn hóa role để guard không chặn
      if (!updatedUser.role)
        updatedUser.role = String("DRIVER").toUpperCase();
      localStorage.setItem("user", JSON.stringify(updatedUser));
      navigate("/driver");
    } catch (err) {
      alert(err?.response?.data?.message || err.message || "Đã có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  const baseInput =
    "!w-full !rounded-[10px] !border !border-[#333] !bg-[#253340] !text-white !px-4 !py-3 !text-[15px] " +
    "!transition-all !duration-200 !ease-out hover:!bg-[#2a3a46] " +
    "focus:!bg-[#1E2A36] focus:!outline-none focus:!ring-2 focus:!ring-[#2bf0b5] focus:!border-transparent " +
    // Ẩn placeholder, chỉ hiện khi focus
    "placeholder:!text-transparent focus:placeholder:!text-[#6bfbdc] " +
    // Phát quang khi focus
    "focus:!shadow-[0_0_10px_rgba(0,255,198,0.35),0_0_20px_rgba(0,255,198,0.25)]";

  return (
    <div className="background">
      <div className="!min-h-screen !w-full !flex !items-center !justify-center !px-4 !py-8">
        <form
          onSubmit={handleSubmitForm}
          className="!w-full !max-w-[420px] !bg-[#2C3E50] !rounded-[14px] !shadow-[0_10px_25px_rgba(0,0,0,0.4)] !p-6 sm:!p-8
                     motion-safe:!animate-[fade-in-up_0.35s_ease-out]" // form xuất hiện mượt
        >
          <div className="!mb-4">
            <h1 className="!text-center !font-bold !text-[25px] !text-[#00ffc6]">
              Vui lòng nhập thông tin
            </h1>
          </div>

          {/* Họ và tên */}
          <div className="!mb-5">
            <label className="!block !text-[#eaeaea] !font-semibold !mb-2">
              Họ và tên
            </label>
            <div className="!flex !w-full !gap-2">
              <input
                name="last_name"
                type="text"
                placeholder="Họ"
                onChange={handleChangeValue}
                onFocus={handleFocus}
                className={`${baseInput} !flex-[1.7] ${
                  errors.last_name
                    ? "!border-red-500 !ring-2 !ring-red-500"
                    : ""
                }`}
              />
              <input
                name="first_name"
                type="text"
                placeholder="Tên"
                onChange={handleChangeValue}
                onFocus={handleFocus}
                className={`${baseInput} !flex-1 ${
                  errors.first_name
                    ? "!border-red-500 !ring-2 !ring-red-500"
                    : ""
                }`}
              />
            </div>
            {(errors.last_name || errors.first_name) && (
              <div className="!mt-1 !text-red-500 !text-sm">
                {errors.last_name || errors.first_name}
              </div>
            )}
          </div>

          {/* Giới tính */}
          <div className="!mb-5">
            <label className="!block !text-[#eaeaea] !font-semibold !mb-2">
              Giới tính
            </label>
            <div className="!flex !items-center !gap-6">
              <label className="!inline-flex !items-center !gap-2 !text-white">
                <input
                  className="!w-5 !h-5 !accent-[#2bf0b5] !cursor-pointer !transition-all !duration-150 !ease-out
                             focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-[#2bf0b5]"
                  type="radio"
                  name="gender"
                  value="0"
                  onChange={handleChangeValue}
                  onFocus={handleFocus}
                />
                Nam
              </label>
              <label className="!inline-flex !items-center !gap-2 !text-white">
                <input
                  className="!w-5 !h-5 !accent-[#2bf0b5] !cursor-pointer !transition-all !duration-150 !ease-out
                             focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-[#2bf0b5]"
                  type="radio"
                  name="gender"
                  value="1"
                  onChange={handleChangeValue}
                  onFocus={handleFocus}
                />
                Nữ
              </label>
            </div>
            {errors.gender && (
              <div className="!mt-1 !text-red-500 !text-sm">
                {errors.gender}
              </div>
            )}
          </div>

          {/* Ngày sinh */}
          <div className="!mb-5">
            <label className="!block !text-[#eaeaea] !font-semibold !mb-2">
              Ngày tháng năm sinh
            </label>
            <input
              name="dob"
              type="date"
              lang="vi"
              onChange={handleChangeValue}
              onFocus={handleFocus}
              className={`${baseInput} ${
                errors.dob ? "!border-red-500 !ring-2 !ring-red-500" : ""
              }`}
            />
            {errors.dob && (
              <div className="!mt-1 !text-red-500 !text-sm">{errors.dob}</div>
            )}
          </div>

          {/* SĐT */}
          <div className="!mb-4">
            <label className="!block !text-[#eaeaea] !font-semibold !mb-2">
              Số điện thoại
            </label>
            <input
              name="phoneNum"
              type="text"
              placeholder="+84-XXX-XXX-XXX"
              onChange={handleChangeValue}
              onFocus={handleFocus}
              className={`${baseInput} ${
                errors.phoneNum ? "!border-red-500 !ring-2 !ring-red-500" : ""
              }`}
            />
            {errors.phoneNum && (
              <div className="!mt-1 !text-red-500 !text-sm">
                {errors.phoneNum}
              </div>
            )}
          </div>

          {/* Cam kết */}
          <label className="!flex !items-center !gap-2 !text-white !text-sm !mb-4">
            <input
              type="checkbox"
              className="!w-4 !h-4 !accent-[#2bf0b5] !cursor-pointer"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
            Tôi xin cam đoan mọi thông tin trên đều chuẩn xác.
          </label>

          {/* Nút gửi */}
          <button
            type="submit"
            disabled={!agree || isSubmitting}
            className="!w-full !rounded-[10px] !py-3 !font-semibold !text-black !bg-gradient-to-r !from-[#2bf0b5] !to-[#00ffc6]
                       !transition-all !duration-200 !ease-out hover:!translate-y-0.5 active:!translate-y-[1px]
                       hover:!shadow-[0_0_8px_#00ffc6,0_0_16px_#00ffc6,0_0_24px_#00ffc6]
                       focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-[#2bf0b5]
                       disabled:!opacity-70 disabled:!cursor-not-allowed"
          >
            {isSubmitting ? "Đang xử lý..." : "Xác nhận"}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="!mt-3 !w-full !rounded-[10px] !py-3 !font-semibold !text-white !bg-gradient-to-r !from-[#e82a2a] !to-[#f00707]
                       !transition-all !duration-200 !ease-out hover:!translate-y-0.5 active:!translate-y-[1px]
                       hover:!shadow-[0_0_8px_#f00707,0_0_16px_#f00707,0_0_24px_#f00707]
                       focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-[#f00707]"
          >
            Đăng xuất
          </button>
        </form>
      </div>
    </div>
  );
}
