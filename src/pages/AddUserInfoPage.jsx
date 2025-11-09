import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usersAPI } from "../lib/apiServices"; // dùng usersAPI cho update + get info
import { useAuth } from "../hooks/useAuth.jsx";

export default function AddUserInfoPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

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
    else if (last_name.trim().length < 2 || last_name.trim().length > 20)
      newErrors.last_name = "Họ giới hạn từ 2-20 kí tự.";

    if (!first_name.trim())
      newErrors.first_name = "Vui lòng điền đầy đủ họ tên.";
    else if (first_name.trim().length < 2 || first_name.trim().length > 10)
      newErrors.first_name = "Tên giới hạn từ 2-10 kí tự.";

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

      // Update driver info
      await usersAPI.updateDriverInfo({
        lastName: last_name.trim(),
        firstName: first_name.trim(),
        gender: Number(gender),
        dateOfBirth: dob,
        phone: phoneNum.trim(),
      });

      // Get fresh user info from API
      const prof = await usersAPI.getProfile();
      const updatedUser = prof?.data?.result;

      if (!updatedUser) {
        throw new Error("Không thể lấy thông tin người dùng sau khi cập nhật");
      }

      // Chuẩn hóa role để guard không chặn
      if (!updatedUser.role) {
        updatedUser.role = String("DRIVER").toUpperCase();
      }

      // ✅ Đảm bảo phone được lưu đúng
      if (!updatedUser.phone && phoneNum) {
        updatedUser.phone = phoneNum.trim();
      }

      console.log("💾 Saving user to localStorage:", updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Force reload để App.jsx check lại
      window.location.href = "/driver";
    } catch (err) {
      console.error("❌ Error:", err);
      alert(err?.response?.data?.message || err.message || "Đã có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 signup-page">
      <div className="w-[500px] bg-white rounded-xl shadow p-8">
        <div className="text-center mb-6">
          <h1 className="text-xl font-semibold text-gray-800">
            Vui lòng nhập thông tin
          </h1>
        </div>

        <form onSubmit={handleSubmitForm} className="space-y-5">
          {/* Họ và tên */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Họ và tên
            </label>
            <div className="flex gap-2">
              <input
                name="last_name"
                type="text"
                placeholder="Họ"
                onChange={handleChangeValue}
                onFocus={handleFocus}
                className={`w-full px-4 py-2 border rounded-lg placeholder-gray-400 focus:ring-2 focus:ring-[#2bf0b5] focus:outline-none ${
                  errors.last_name
                    ? "border-red-500 ring-1 ring-red-500"
                    : "border-gray-300"
                }`}
              />
              <input
                name="first_name"
                type="text"
                placeholder="Tên"
                onChange={handleChangeValue}
                onFocus={handleFocus}
                className={`w-full px-4 py-2 border rounded-lg placeholder-gray-400 focus:ring-2 focus:ring-[#2bf0b5] focus:outline-none ${
                  errors.first_name
                    ? "border-red-500 ring-1 ring-red-500"
                    : "border-gray-300"
                }`}
              />
            </div>
            {(errors.last_name || errors.first_name) && (
              <div className="text-red-500 text-sm mt-1">
                {errors.last_name || errors.first_name}
              </div>
            )}
          </div>

          {/* Giới tính */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giới tính
            </label>
            <div className="flex items-center gap-6 text-gray-700">
              <label className="!flex !items-center !gap-2 !text-sm">
                <input
                  type="radio"
                  name="gender"
                  value="0"
                  onChange={handleChangeValue}
                  className="w-4 h-4 appearance-none border border-gray-400 rounded-full checked:bg-[#2bf0b5] checked:border-[#2bf0b5] transition-all duration-150 mr-2"
                />
                Nam
              </label>
              <label className="!flex !items-center !gap-2 !text-sm">
                <input
                  type="radio"
                  name="gender"
                  value="1"
                  onChange={handleChangeValue}
                  className="w-4 h-4 appearance-none border border-gray-400 rounded-full checked:bg-[#2bf0b5] checked:border-[#2bf0b5] transition-all duration-150 mr-2"
                />
                Nữ
              </label>
            </div>
            {errors.gender && (
              <div className="text-red-500 text-sm mt-1">{errors.gender}</div>
            )}
          </div>

          {/* Ngày sinh */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngày tháng năm sinh
            </label>
            <input
              name="dob"
              type="date"
              onChange={handleChangeValue}
              onFocus={handleFocus}
              className={`w-full px-4 py-2 border rounded-lg text-gray-700 focus:ring-2 focus:ring-[#2bf0b5] focus:outline-none ${
                errors.dob
                  ? "border-red-500 ring-1 ring-red-500"
                  : "border-gray-300"
              }`}
            />
            {errors.dob && (
              <div className="text-red-500 text-sm mt-1">{errors.dob}</div>
            )}
          </div>

          {/* SĐT */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số điện thoại
            </label>
            <input
              name="phoneNum"
              type="text"
              placeholder="+84-XXX-XXX-XXX"
              onChange={handleChangeValue}
              onFocus={handleFocus}
              className={`w-full px-4 py-2 border rounded-lg placeholder-gray-400 focus:ring-2 focus:ring-[#2bf0b5] focus:outline-none ${
                errors.phoneNum
                  ? "border-red-500 ring-1 ring-red-500"
                  : "border-gray-300"
              }`}
            />
            {errors.phoneNum && (
              <div className="text-red-500 text-sm mt-1">{errors.phoneNum}</div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              id="agree-checkbox"
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-400"
            />
            <label
              htmlFor="agree-checkbox"
              className="text-sm text-gray-700 select-none"
            >
              Tôi xin cam đoan mọi thông tin trên đều chuẩn xác.
            </label>
          </div>

          {/* Nút gửi */}
          <button
            type="submit"
            disabled={!agree || isSubmitting}
            className={`w-full py-2.5 text-white font-semibold rounded-lg transition ${
              !agree || isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#2bf0b5] hover:bg-[#00ffc6] cursor-pointer"
            }`}
          >
            {isSubmitting ? "Đang xử lý..." : "Xác nhận"}
          </button>

          {/* Nút đăng xuất */}
          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 w-full py-2.5 text-white font-semibold rounded-lg bg-gradient-to-r from-[#e82a2a] to-[#f00707] hover:opacity-90 transition"
          >
            Đăng xuất
          </button>
        </form>
      </div>
    </div>
  );
}
