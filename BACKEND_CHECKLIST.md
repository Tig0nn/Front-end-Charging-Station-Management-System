# ✅ Backend Checklist - Map Feature

## 🎯 Yêu cầu tối thiểu để Map hoạt động

### ⭐ CRITICAL (Không có = Map không hoạt động)

- [ ] `stationId` - String/Number - Unique ID
- [ ] `stationName` - String - Tên trạm
- [ ] **`latitude`** - **Number** - **Vĩ độ (6-8 số thập phân)**
- [ ] **`longitude`** - **Number** - **Kinh độ (6-8 số thập phân)**
- [ ] `address` - String - Địa chỉ đầy đủ
- [ ] `status` - String - "Active" hoặc "Inactive"

### 🟡 RECOMMENDED (Nên có)

- [ ] `totalChargers` - Number - Tổng số cổng sạc
- [ ] `availableChargers` - Number - Số cổng còn trống
- [ ] `hotline` - String - Số điện thoại
- [ ] `email` - String - Email liên hệ

---

## 📝 Ví dụ Response

```json
{
  "code": 0,
  "message": "Success",
  "result": [
    {
      "stationId": "ST001",
      "stationName": "Vincom Đồng Khởi",
      "latitude": 10.777513,
      "longitude": 106.703105,
      "address": "72 Lê Thánh Tôn, Q.1, TP.HCM",
      "status": "Active",
      "totalChargers": 4,
      "availableChargers": 2,
      "hotline": "1900-5678",
      "email": "vincom@station.com"
    }
  ]
}
```

---

## ⚠️ Lưu ý quan trọng

### 1. Tọa độ phải là Number, không phải String

```javascript
// ❌ SAI
"latitude": "10.777513"

// ✅ ĐÚNG
"latitude": 10.777513
```

### 2. Độ chính xác: 6-8 chữ số thập phân

```javascript
// ❌ SAI (sai lệch ~1km)
"latitude": 10.77

// ✅ ĐÚNG (chính xác ~1m)
"latitude": 10.777513
```

### 3. Thứ tự: latitude trước, longitude sau

```javascript
// Latitude = Vĩ độ (Y axis, North-South) ≈ 10.xxx (HCM)
// Longitude = Kinh độ (X axis, East-West) ≈ 106.xxx (HCM)
```

### 4. Null handling

```javascript
// Nếu không có tọa độ, trả null (không trả 0)
"latitude": null,
"longitude": null
```

---

## 🛠️ Lấy tọa độ như thế nào?

### Option 1: Google Maps (Manual)

1. Mở https://maps.google.com
2. Tìm địa chỉ trạm sạc
3. Click phải → Copy coordinates
4. Paste vào database: `10.777513, 106.703105`

### Option 2: Geocoding API (Automatic)

```javascript
// OpenStreetMap Nominatim (FREE)
//nominatim.openstreetmap.org/search?q=72+Lê+Thánh+Tôn,+Q.1,+TP.HCM&format=json

// Response
https: [
  {
    lat: "10.777513",
    lon: "106.703105",
  },
];
```

### Option 3: Database Script (Bulk)

```sql
-- 1. Thêm columns nếu chưa có
ALTER TABLE stations
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8);

-- 2. Update thủ công
UPDATE stations
SET latitude = 10.777513, longitude = 106.703105
WHERE station_id = 'ST001';

-- 3. Hoặc dùng Geocoding service
```

---

## 🧪 Test checklist

- [ ] API endpoint `/api/stations/overview` hoạt động
- [ ] Response có format đúng (code, message, result)
- [ ] Mỗi station có đủ required fields
- [ ] `latitude` và `longitude` là Number (không phải String)
- [ ] Tọa độ nằm trong range hợp lệ (VN: lat ~8-23, lng ~102-110)
- [ ] Test với Postman/Thunder Client
- [ ] Test với Frontend (check console logs)

---

## 📞 Hỗ trợ

Nếu cần hỗ trợ:

1. Đọc file `BACKEND_API_REQUIREMENTS.md` (chi tiết hơn)
2. Hỏi Frontend team về format
3. Test với mock data trước khi code

---

**Ưu tiên cao nhất**: `latitude` và `longitude` ⭐⭐⭐
