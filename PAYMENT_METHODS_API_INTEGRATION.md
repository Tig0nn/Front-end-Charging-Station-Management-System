# Tích hợp API Phương thức thanh toán

## 📋 Tổng quan

Tài liệu này mô tả việc tích hợp API thực để lấy danh sách phương thức thanh toán trong trang thanh toán.

## 🔄 Các thay đổi đã thực hiện

### 1. Cập nhật API Services (`src/lib/apiServices.js`)

#### Endpoint cũ:

```javascript
getPaymentMethods: () => api.get("/api/payments/methods");
```

#### Endpoint mới (theo backend):

```javascript
getPaymentMethods: () => api.get("/api/payment-methods");
```

**Lý do**: Đồng bộ với API backend thực tế theo tài liệu Swagger.

### 2. Cập nhật Payment Page (`src/Pages/driver/PaymentPage.jsx`)

#### State mới:

```javascript
const [paymentMethods, setPaymentMethods] = useState([]);
const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
```

#### Loại bỏ:

- ❌ `momoPaymentMethod` (hardcoded data)
- ❌ `isMomoSelected` (boolean state)

#### Thêm logic load payment methods:

```javascript
// Load payment methods from real backend API
const paymentMethodsResponse = await paymentsAPI.getPaymentMethods();
```

#### Chuyển đổi dữ liệu từ backend:

```javascript
const apiPaymentMethods = methods.map((method) => ({
  id: method.pmId,
  type: method.methodType, // CREDIT_CARD, DEBIT_CARD, EWALLET
  name: getPaymentMethodName(method.methodType, method.provider),
  provider: method.provider,
  maskedToken: method.maskedToken || "****",
  balance:
    method.methodType === "EWALLET" ? "Kết nối để thanh toán" : undefined,
}));
```

### 3. Cập nhật Payment Method Item Component (`src/components/PaymentMethodItem.jsx`)

#### Cải thiện logic hiển thị icon:

```javascript
const getIcon = () => {
  if (method.type === "EWALLET" || method.name.toLowerCase().includes("momo")) {
    return <FaWallet className="w-8 h-8 text-purple-600" />;
  }
  return <FaCreditCard className="w-8 h-8 text-blue-600" />;
};
```

#### Hiển thị thông tin:

- **Tên**: Hiển thị `method.name` từ backend
- **Token**: Hiển thị `**** {maskedToken}` hoặc thông tin balance
- **Loại**: Phân biệt EWALLET với CREDIT_CARD/DEBIT_CARD

## 📊 Cấu trúc dữ liệu Backend

### Request:

```
GET /api/payment-methods
Headers:
  Authorization: Bearer {token}
```

### Response:

```json
{
  "code": 0,
  "message": "string",
  "result": [
    {
      "pmId": "string",
      "methodType": "CREDIT_CARD" | "DEBIT_CARD" | "EWALLET",
      "provider": "string",
      "maskedToken": "string"
    }
  ]
}
```

## 🎨 UI/UX Improvements

### Trước đây:

- ✅ Chỉ hiển thị 1 phương thức thanh toán (MoMo) hardcoded
- ✅ Không linh hoạt, không thể thêm phương thức khác

### Bây giờ:

- ✅ Hiển thị tất cả phương thức thanh toán từ backend
- ✅ Hỗ trợ nhiều loại: Thẻ tín dụng, Thẻ ghi nợ, Ví điện tử
- ✅ Hiển thị masked token để bảo mật
- ✅ UI thân thiện khi chưa có phương thức thanh toán
- ✅ Có nút "Thêm phương thức thanh toán" (sẵn sàng cho tính năng tương lai)

## 🔒 Xử lý lỗi

### Khi không load được payment methods:

```javascript
try {
  const paymentMethodsResponse = await paymentsAPI.getPaymentMethods();
  // Process...
} catch (error) {
  console.error("⚠️ Error loading payment methods:", error);
  // Không block trang - user có thể chưa có payment method
}
```

### Khi chưa có payment methods:

- Hiển thị thông báo: "Chưa có phương thức thanh toán"
- Hiển thị nút: "+ Thêm phương thức thanh toán"
- Không cho phép subscribe plan cho đến khi có payment method

## 🚀 Tính năng đăng ký gói

### Flow mới:

1. **Chọn phương thức thanh toán** (bắt buộc)
2. **Chọn gói dịch vụ** (bắt buộc)
3. **Click "Nâng cấp"** trên gói
4. API call với `planId` và `paymentMethodId`

### Code:

```javascript
const handleSubscribe = async (plan) => {
  if (!selectedPaymentMethod) {
    alert("Vui lòng chọn phương thức thanh toán");
    return;
  }

  const subscriptionData = await plansAPI.subscribe(
    plan.id,
    selectedPaymentMethod.id // Gửi pmId từ backend
  );
};
```

## 📝 Mapping tên phương thức thanh toán

```javascript
const getPaymentMethodName = (methodType, provider) => {
  const typeMap = {
    CREDIT_CARD: "Thẻ tín dụng",
    DEBIT_CARD: "Thẻ ghi nợ",
    EWALLET: "Ví điện tử",
  };

  const baseName = typeMap[methodType] || methodType;
  return provider ? `${baseName} - ${provider}` : baseName;
};
```

### Ví dụ:

- `CREDIT_CARD` + `Visa` → "Thẻ tín dụng - Visa"
- `EWALLET` + `MoMo` → "Ví điện tử - MoMo"
- `DEBIT_CARD` + `null` → "Thẻ ghi nợ"

## ✅ Checklist hoàn thành

- [x] Cập nhật endpoint API từ `/api/payments/methods` → `/api/payment-methods`
- [x] Thêm state quản lý danh sách payment methods
- [x] Thêm state quản lý payment method được chọn
- [x] Load payment methods từ backend khi component mount
- [x] Chuyển đổi dữ liệu backend sang UI format
- [x] Xử lý trường hợp không có payment methods
- [x] Cập nhật UI hiển thị danh sách payment methods động
- [x] Cập nhật logic subscribe plan với payment method ID
- [x] Cải thiện component PaymentMethodItem
- [x] Xử lý lỗi gracefully

## 🎯 Kế hoạch tương lai

### 1. Thêm phương thức thanh toán

- API: `POST /api/payment-methods`
- Modal để nhập thông tin card/ewallet
- Tích hợp với provider (MoMo, VNPay, etc.)

### 2. Xóa phương thức thanh toán

- API: `DELETE /api/payment-methods/{pmId}`
- Confirm dialog trước khi xóa

### 3. Đặt phương thức mặc định

- API: `PATCH /api/payment-methods/{pmId}/default`
- Toggle default status

### 4. Lịch sử giao dịch

- API: `GET /api/payments/history`
- Hiển thị các giao dịch đã thực hiện

## 🐛 Debug & Testing

### Kiểm tra API response:

```javascript
console.log("💳 Payment methods API response:", paymentMethodsResponse);
console.log("✅ Converted payment methods:", apiPaymentMethods);
```

### Test cases:

1. ✅ User có payment methods → Hiển thị danh sách
2. ✅ User không có payment methods → Hiển thị thông báo
3. ✅ API error → Không block trang, log error
4. ✅ Chọn payment method → UI highlight
5. ✅ Subscribe với payment method → API call đúng

## 📞 Support

Nếu có lỗi, kiểm tra:

1. Backend API có đang chạy?
2. Token authentication có hợp lệ?
3. Endpoint `/api/payment-methods` có hoạt động?
4. Response format có đúng cấu trúc?

---

**Ngày cập nhật**: 17/10/2025  
**Version**: 1.0.0  
**Status**: ✅ Hoàn thành
