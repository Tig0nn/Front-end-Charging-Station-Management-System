# 📋 Admin Plans Management - Tài liệu hướng dẫn

## 🎯 Tổng quan

Tính năng quản lý gói dịch vụ cho Admin, sử dụng component `AdminPlanCard` (biến thể của `PlanCard`) với các điểm khác biệt:

- ✅ Icon chỉnh sửa ở góc trên bên phải
- ✅ Nút "Add Plan" để tạo gói mới
- ✅ Hiển thị thống kê (số người dùng, doanh thu)
- ✅ Modal để thêm/sửa gói

---

## 📁 Files đã tạo/sửa

### 1. **Components mới**

#### `src/components/AdminPlanCard.jsx` ✨ MỚI

Component hiển thị gói dịch vụ cho Admin

```javascript
<AdminPlanCard plan={planData} onEdit={handleEdit} />
```

**Props**:

- `plan`: Object chứa thông tin gói
- `onEdit`: Function callback khi click edit icon

**Đặc điểm**:

- Icon edit ở góc trên bên phải (BiEdit)
- Hiển thị stats: số người dùng, doanh thu/tháng
- Không có nút "Nâng cấp"
- Hover effect

### 2. **Pages mới**

#### `src/Pages/admin/PlansManagement.jsx` ✨ MỚI

Trang quản lý gói dịch vụ

**Tính năng**:

- ✅ Hiển thị danh sách gói (Grid layout)
- ✅ Nút "Thêm gói mới" ở header
- ✅ Click icon edit để sửa gói
- ✅ Modal form thêm/sửa gói
- ✅ Statistics cards (tổng số gói, người dùng, doanh thu)
- ✅ Tích hợp API thực từ backend

**Route**: `/admin/plans`

---

## 🔧 Cấu trúc Component

### AdminPlanCard vs PlanCard

| Feature        | PlanCard (Driver)   | AdminPlanCard (Admin) |
| -------------- | ------------------- | --------------------- |
| Purpose        | Cho driver chọn gói | Cho admin quản lý     |
| Edit Icon      | ❌                  | ✅ Top-right corner   |
| Upgrade Button | ✅                  | ❌                    |
| User Stats     | ❌                  | ✅ (số user, revenue) |
| Click Action   | Select & upgrade    | -                     |
| Hover Effect   | Border + shadow     | Border + shadow       |

---

## 🎨 UI Layout

### PlansManagement Page Structure:

```
┌─────────────────────────────────────────────────┐
│ Header                                          │
│ ┌─────────────────────────────┬───────────────┐│
│ │ Quản lý gói dịch vụ         │ [+ Thêm gói] ││
│ │ Tạo và chỉnh sửa...         │               ││
│ └─────────────────────────────┴───────────────┘│
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Plans Grid (3 columns)                          │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│ │ [✏️]    │ │ [✏️]    │ │ [✏️]    │           │
│ │ Basic   │ │ Premium │ │ VIP     │           │
│ │ Free    │ │ 150k/m  │ │ 499k/m  │           │
│ │ ✓ ...   │ │ ✓ ...   │ │ ✓ ...   │           │
│ │ Users:10│ │ Users:50│ │ Users:20│           │
│ │ Rev: 0đ │ │ Rev: 7.5M│ │ Rev: 10M│           │
│ └─────────┘ └─────────┘ └─────────┘           │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Statistics Cards (4 columns)                    │
│ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐       │
│ │Total  │ │Total  │ │Revenue│ │Most   │       │
│ │Plans  │ │Users  │ │/month │ │Popular│       │
│ └───────┘ └───────┘ └───────┘ └───────┘       │
└─────────────────────────────────────────────────┘
```

---

## 🔄 User Flow

### 1. Thêm gói mới:

```
Click [+ Thêm gói mới]
  ↓
Modal mở (form trống)
  ↓
Điền thông tin:
  - Tên gói
  - Giá
  - Chu kỳ (tháng/năm/lượt)
  - Loại gói (MONTHLY/PAY_PER_USE/VIP)
  - Tính năng (mỗi dòng 1 feature)
  - Checkbox: Gói phổ biến
  ↓
Click [Tạo mới]
  ↓
API Call: POST /api/plans
  ↓
Success → Refresh danh sách
```

### 2. Sửa gói:

```
Click icon [✏️] trên card
  ↓
Modal mở (form có data)
  ↓
Sửa thông tin
  ↓
Click [Cập nhật]
  ↓
API Call: PATCH /api/plans/{id}
  ↓
Success → Refresh danh sách
```

---

## 📊 Data Structure

### Plan Object:

```javascript
{
  id: "ST001",
  name: "Premium",
  price: 150000,
  period: "tháng",
  features: [
    "Ưu đãi 10% giá sạc",
    "Hỗ trợ 24/7",
    "Không giới hạn số lượt"
  ],
  isPopular: true,
  billingType: "MONTHLY",
  pricePerKwh: 3500,
  pricePerMinute: 500,
  userCount: 50, // Số người dùng hiện tại
}
```

### Form Data:

```javascript
{
  name: "Premium",
  price: "150000",
  period: "tháng",
  features: "Ưu đãi 10% giá sạc\nHỗ trợ 24/7\nKhông giới hạn số lượt",
  isPopular: true,
  billingType: "MONTHLY"
}
```

---

## 🔌 API Integration

### 1. Get All Plans:

```javascript
const response = await plansAPI.getAll();
// GET /api/plans
```

### 2. Create Plan:

```javascript
const planData = {
  name: "Premium",
  monthlyFee: 150000,
  benefits: "Feature 1,Feature 2,Feature 3",
  billingType: "MONTHLY",
};
await plansAPI.create(planData);
// POST /api/plans
```

### 3. Update Plan (TODO):

```javascript
await plansAPI.update(planId, planData);
// PATCH /api/plans/{id}
```

---

## 🎨 Styling

### AdminPlanCard Styles:

```css
- Card: white bg, border, rounded-2xl
- Hover: shadow-lg, blue border
- Edit Icon: top-right, gray → blue on hover
- Stats Footer: border-top, 2 rows (users & revenue)
```

### Modal Styles:

```css
- Size: lg (large)
- Centered
- Form: 2 columns for name/price
- Textarea: 5 rows for features
- Buttons: Cancel (secondary) + Submit (primary)
```

---

## 🚀 Features

### ✅ Đã hoàn thành:

- [x] Component AdminPlanCard với edit icon
- [x] Page PlansManagement với Add button
- [x] Modal form thêm/sửa gói
- [x] Grid layout responsive (3 columns)
- [x] Statistics cards
- [x] API integration cho GET & CREATE
- [x] Routing `/admin/plans`
- [x] Sidebar menu item

### 🔜 TODO:

- [ ] API Update plan (backend cần implement)
- [ ] API Delete plan
- [ ] Confirmation dialog khi delete
- [ ] Pagination nếu có nhiều gói
- [ ] Search/Filter plans
- [ ] Sort by (price, users, revenue)
- [ ] View plan details (modal with charts)
- [ ] Assign plan to user (from UsersList)

---

## 📱 Responsive

### Breakpoints:

- **Desktop (lg)**: 3 columns grid
- **Tablet (md)**: 2 columns grid
- **Mobile (xs)**: 1 column

### Statistics cards:

- **Desktop**: 4 columns (row)
- **Tablet**: 2 columns
- **Mobile**: 1 column (stack)

---

## 🧪 Testing

### Test Cases:

1. ✅ Load plans list successfully
2. ✅ Display empty state when no plans
3. ✅ Open modal when click "Thêm gói mới"
4. ✅ Open modal with data when click edit icon
5. ✅ Form validation (required fields)
6. ✅ Submit create plan successfully
7. ✅ Calculate revenue correctly
8. ✅ Responsive on mobile/tablet

---

## 🔧 Backend Requirements

### Endpoint cần có:

#### 1. GET /api/plans

```json
{
  "code": 0,
  "message": "Success",
  "result": [
    {
      "planId": "P001",
      "name": "Premium",
      "monthlyFee": 150000,
      "benefits": "Feature 1,Feature 2,Feature 3",
      "billingType": "MONTHLY",
      "pricePerKwh": 3500,
      "pricePerMinute": 500
    }
  ]
}
```

#### 2. POST /api/plans

```json
// Request
{
  "name": "Premium",
  "monthlyFee": 150000,
  "benefits": "Feature 1,Feature 2,Feature 3",
  "billingType": "MONTHLY"
}

// Response
{
  "code": 0,
  "message": "Plan created successfully",
  "result": {
    "planId": "P001",
    ...
  }
}
```

#### 3. PATCH /api/plans/{id} (TODO)

```json
// Request
{
  "name": "Premium Plus",
  "monthlyFee": 199000,
  ...
}

// Response
{
  "code": 0,
  "message": "Plan updated successfully"
}
```

#### 4. GET /api/plans/{id}/users (Optional)

Lấy số lượng user đang dùng gói này

---

## 💡 Tips

### 1. Thêm features:

- Nhập mỗi feature trên 1 dòng
- Features sẽ được join bằng dấu phẩy khi gửi API
- Frontend tự động split bằng `\n` và `split(",")`

### 2. Pricing:

- Nhập số không có dấu phẩy: `150000`
- Frontend tự động format: `150,000đ`
- Backend nhận số nguyên

### 3. User Count:

- Hiện tại là mock data random
- Cần endpoint backend để lấy số thực

### 4. Edit Icon Position:

- Absolute position: top-3, right-3
- Không ảnh hưởng layout card
- Hover: blue bg + blue text

---

## 🎯 Use Cases

### Admin muốn tạo gói mới:

1. Vào `/admin/plans`
2. Click "Thêm gói mới"
3. Điền form
4. Submit
5. Gói mới xuất hiện trong grid

### Admin muốn sửa giá gói:

1. Click icon ✏️ trên card
2. Sửa giá
3. Click "Cập nhật"
4. Giá mới được cập nhật

### Admin muốn xem thống kê:

1. Xem statistics cards ở dưới
2. Tổng số gói, users, revenue
3. Gói phổ biến nhất

---

## 📞 Support

### Nếu gặp lỗi:

1. Check console logs
2. Verify API endpoint
3. Check network tab
4. Xem response format có đúng không

### Contact:

- Frontend Team: Hỗ trợ UI/UX
- Backend Team: Hỗ trợ API

---

**Ngày tạo**: 17/10/2025  
**Version**: 1.0.0  
**Status**: ✅ Hoàn thành cơ bản  
**Next Steps**: Implement Update & Delete API
