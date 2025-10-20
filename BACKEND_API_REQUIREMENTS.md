# 📡 Yêu cầu API Backend cho Trang Bản đồ Trạm sạc

## 📋 Tổng quan

Tài liệu này mô tả chi tiết các field mà Backend **BẮT BUỘC** phải trả về để Frontend có thể hiển thị đầy đủ tính năng bản đồ trạm sạc.

---

## 🗺️ API Endpoint: GET `/api/stations/overview`

### Request:

```http
GET /api/stations/overview?page=1&limit=10
Authorization: Bearer {token}
```

### Response Format:

```json
{
  "code": 0,
  "message": "Success",
  "result": [
    {
      // ... station data
    }
  ]
}
```

---

## ✅ REQUIRED FIELDS (Bắt buộc)

### 1. **Thông tin định danh**

#### `stationId` (String/Number) - **BẮT BUỘC**

- **Mục đích**: Unique identifier cho mỗi trạm
- **Sử dụng**:
  - React key trong list
  - So sánh station được chọn
- **Ví dụ**: `"ST001"`, `1`, `"550e8400-e29b-41d4-a716-446655440000"`

```javascript
// Sử dụng trong code
{
  filteredStations.map((station) => <div key={station.stationId}>...</div>);
}
```

#### `stationName` (String) - **BẮT BUỘC**

- **Mục đích**: Tên hiển thị của trạm
- **Sử dụng**: Hiển thị trong card, popup, header
- **Ví dụ**: `"Vincom Đồng Khởi"`, `"Landmark 81"`

```javascript
// Sử dụng trong code
<h3 className="station-name">{station.stationName}</h3>
```

---

### 2. **Tọa độ bản đồ** - **⭐ CỰC KỲ QUAN TRỌNG**

#### `latitude` (Number) - **BẮT BUỘC**

- **Mục đích**: Vĩ độ để hiển thị marker trên map
- **Định dạng**: Số thập phân (decimal degrees)
- **Range**: -90 đến 90
- **Ví dụ TP.HCM**: `10.762622` (Landmark 81), `10.777513` (Vincom Đồng Khởi)
- **⚠️ LƯU Ý**:
  - **KHÔNG có field này = KHÔNG hiển thị được marker**
  - **KHÔNG thể tính khoảng cách**
  - **KHÔNG thể chỉ đường**

```javascript
// Sử dụng trong code
<Marker position={[station.latitude, station.longitude]} />

// Kiểm tra trước khi hiển thị
{station.latitude && station.longitude && (
  <Marker ... />
)}

// Tính khoảng cách
calculateDistance(userLat, userLng, station.latitude, station.longitude)

// Chỉ đường
setRouteDestination([station.latitude, station.longitude])
```

#### `longitude` (Number) - **BẮT BUỘC**

- **Mục đích**: Kinh độ để hiển thị marker trên map
- **Định dạng**: Số thập phân (decimal degrees)
- **Range**: -180 đến 180
- **Ví dụ TP.HCM**: `106.660172` (Vincom Đồng Khởi), `106.702141` (Landmark 81)
- **⚠️ LƯU Ý**: Tương tự như `latitude`

**Ví dụ tọa độ một số địa điểm ở TP.HCM**:

```javascript
{
  "Vincom Đồng Khởi": { latitude: 10.777513, longitude: 106.703105 },
  "Landmark 81": { latitude: 10.794897, longitude: 106.721970 },
  "Bến Thành Market": { latitude: 10.772461, longitude: 106.698055 },
  "Bitexco Tower": { latitude: 10.771702, longitude: 106.704223 }
}
```

#### `address` (String) - **BẮT BUỘC**

- **Mục đích**: Địa chỉ đầy đủ của trạm
- **Sử dụng**: Hiển thị trong card, popup
- **Ví dụ**:
  - `"72 Lê Thánh Tôn, Q.1, TP.HCM"`
  - `"720A Điện Biên Phủ, Q.Bình Thạnh, TP.HCM"`

```javascript
// Sử dụng trong code
<p className="station-address">📍 {station.address}</p>
```

---

### 3. **Thông tin trạng thái và sạc**

#### `status` (String) - **BẮT BUỘC**

- **Mục đích**: Trạng thái hoạt động của trạm
- **Values**: `"Active"` hoặc `"Inactive"`
- **Sử dụng**:
  - Hiển thị badge màu xanh/đỏ
  - Filter trạm đang hoạt động
- **Ví dụ**: `"Active"`, `"Inactive"`

```javascript
// Sử dụng trong code
<span
  className={`status-badge ${
    station.status === "Active" ? "status-active" : "status-inactive"
  }`}
>
  {station.status === "Active" ? "Hoạt động" : "Đóng cửa"}
</span>
```

#### `totalChargers` (Number) - **NÊN CÓ**

- **Mục đích**: Tổng số cổng sạc tại trạm
- **Sử dụng**: Hiển thị thông tin cho user
- **Default nếu null**: `0`
- **Ví dụ**: `4`, `6`, `10`

```javascript
// Sử dụng trong code
<span>🔌 {station.totalChargers || 0} sạc</span>
```

#### `availableChargers` (Number) - **NÊN CÓ**

- **Mục đích**: Số cổng sạc còn trống
- **Sử dụng**:
  - Hiển thị cho user biết có chỗ trống không
  - Quyết định có cho sạc không
- **Default nếu null**: `0`
- **Ví dụ**: `2`, `0`, `6`

```javascript
// Sử dụng trong code
<span>⚡ {station.availableChargers || 0} trống</span>
```

---

### 4. **Thông tin liên hệ**

#### `hotline` (String) - **NÊN CÓ**

- **Mục đích**: Số điện thoại liên hệ trạm
- **Sử dụng**: Hiển thị trong popup, có thể click để gọi
- **Default nếu null**: `"N/A"`
- **Ví dụ**: `"1900-5678"`, `"028-1234-5678"`

```javascript
// Sử dụng trong code
<p>
  <strong>📞 Hotline:</strong> {station.hotline || "N/A"}
</p>
```

#### `email` (String) - **NÊN CÓ**

- **Mục đích**: Email liên hệ trạm
- **Sử dụng**: Hiển thị trong popup, có thể click để email
- **Default nếu null**: `"N/A"`
- **Ví dụ**: `"landmark@station.com"`

```javascript
// Sử dụng trong code
<p>
  <strong>📧 Email:</strong> {station.email || "N/A"}
</p>
```

---

## 📊 Ví dụ Response hoàn chỉnh

### ✅ Response TỐT (Đầy đủ fields):

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
    },
    {
      "stationId": "ST002",
      "stationName": "Landmark 81",
      "latitude": 10.794897,
      "longitude": 106.72197,
      "address": "720A Điện Biên Phủ, Q.Bình Thạnh, TP.HCM",
      "status": "Active",
      "totalChargers": 6,
      "availableChargers": 1,
      "hotline": "1900-5678",
      "email": "landmark@station.com"
    }
  ]
}
```

### ❌ Response KHÔNG TỐT (Thiếu latitude/longitude):

```json
{
  "code": 0,
  "message": "Success",
  "result": [
    {
      "stationId": "ST001",
      "stationName": "Vincom Đồng Khởi",
      // ❌ Thiếu latitude
      // ❌ Thiếu longitude
      "address": "72 Lê Thánh Tôn, Q.1, TP.HCM",
      "status": "Active"
    }
  ]
}
```

**Hậu quả khi thiếu latitude/longitude**:

- ❌ Marker KHÔNG hiển thị trên bản đồ
- ❌ KHÔNG tính được khoảng cách
- ❌ KHÔNG thể chỉ đường
- ❌ Nút "Chỉ đường" bị ẩn
- ⚠️ User chỉ thấy thông tin text, không thấy trên map

---

## 🔍 Cách Frontend xử lý

### 1. Kiểm tra tọa độ trước khi render Marker:

```javascript
{
  filteredStations.map((station) => {
    // ⭐ Kiểm tra bắt buộc
    if (!station.latitude || !station.longitude) return null;

    return (
      <Marker
        key={station.stationId}
        position={[station.latitude, station.longitude]}
        icon={stationIcon}
      >
        <Popup>...</Popup>
      </Marker>
    );
  });
}
```

### 2. Kiểm tra trước khi tính khoảng cách:

```javascript
{
  userLocation && station.latitude && station.longitude && (
    <p className="station-distance">
      📍 Cách bạn{" "}
      {calculateDistance(
        userLocation[0],
        userLocation[1],
        station.latitude,
        station.longitude
      )}{" "}
      km
    </p>
  );
}
```

### 3. Kiểm tra trước khi hiển thị nút "Chỉ đường":

```javascript
{
  userLocation && station.latitude && station.longitude && (
    <button onClick={() => handleShowDirections(station)}>🗺️ Chỉ đường</button>
  );
}
```

### 4. Kiểm tra khi click "Chỉ đường":

```javascript
const handleShowDirections = (station) => {
  if (!userLocation) {
    alert("Không thể xác định vị trí của bạn. Vui lòng bật GPS.");
    return;
  }

  if (!station.latitude || !station.longitude) {
    alert("Trạm sạc không có thông tin vị trí.");
    return;
  }

  setRouteDestination([station.latitude, station.longitude]);
  setShowRoute(true);
};
```

---

## 📝 Field Summary Table

| Field               | Type          | Required       | Default | Purpose                  |
| ------------------- | ------------- | -------------- | ------- | ------------------------ |
| `stationId`         | String/Number | ✅ YES         | -       | Unique identifier        |
| `stationName`       | String        | ✅ YES         | -       | Display name             |
| **`latitude`**      | **Number**    | **⭐ YES**     | -       | **Vĩ độ (map marker)**   |
| **`longitude`**     | **Number**    | **⭐ YES**     | -       | **Kinh độ (map marker)** |
| `address`           | String        | ✅ YES         | -       | Full address             |
| `status`            | String        | ✅ YES         | -       | "Active"/"Inactive"      |
| `totalChargers`     | Number        | 🟡 Should have | 0       | Total chargers           |
| `availableChargers` | Number        | 🟡 Should have | 0       | Available chargers       |
| `hotline`           | String        | 🟡 Should have | "N/A"   | Contact phone            |
| `email`             | String        | 🟡 Should have | "N/A"   | Contact email            |

---

## 🎯 Tính năng phụ thuộc vào latitude/longitude

### 1. ✅ Hiển thị Marker trên Map

```javascript
<Marker position={[station.latitude, station.longitude]} />
```

**Không có tọa độ** = Marker KHÔNG hiển thị

### 2. ✅ Tính khoảng cách

```javascript
calculateDistance(userLat, userLng, station.latitude, station.longitude);
```

**Không có tọa độ** = Không hiển thị khoảng cách

### 3. ✅ Chỉ đường (Routing)

```javascript
<RoutingControl
  start={userLocation}
  end={[station.latitude, station.longitude]}
/>
```

**Không có tọa độ** = Không thể chỉ đường

### 4. ✅ Click vào station card → Map center vào trạm

```javascript
setMapCenter([station.latitude, station.longitude]);
```

**Không có tọa độ** = Map không di chuyển

### 5. ✅ Sort theo khoảng cách gần nhất

```javascript
stations.sort((a, b) => {
  const distA = calculateDistance(userLat, userLng, a.latitude, a.longitude);
  const distB = calculateDistance(userLat, userLng, b.latitude, b.longitude);
  return distA - distB;
});
```

**Không có tọa độ** = Không sort được

---

## 🛠️ Cách lấy Latitude/Longitude

### Option 1: Google Maps

1. Mở Google Maps: https://maps.google.com
2. Click phải vào địa điểm
3. Chọn số đầu tiên (vĩ độ, kinh độ)
4. Copy: `10.777513, 106.703105`

### Option 2: OpenStreetMap

1. Mở https://www.openstreetmap.org
2. Tìm địa điểm
3. Click phải → "Show address"
4. Xem tọa độ ở URL hoặc sidebar

### Option 3: Geocoding API

Nếu chỉ có địa chỉ, sử dụng Geocoding API để convert:

```javascript
// Google Geocoding API
https://maps.googleapis.com/maps/api/geocode/json?address=72+Lê+Thánh+Tôn,+Q.1,+TP.HCM&key=YOUR_API_KEY

// OpenStreetMap Nominatim (FREE)
https://nominatim.openstreetmap.org/search?q=72+Lê+Thánh+Tôn,+Q.1,+TP.HCM&format=json
```

### Option 4: Database với PostGIS (Recommended)

```sql
-- Thêm column geometry
ALTER TABLE stations ADD COLUMN location GEOGRAPHY(POINT, 4326);

-- Update từ lat/lng
UPDATE stations
SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Query stations gần user (10km)
SELECT * FROM stations
WHERE ST_DWithin(
  location,
  ST_SetSRID(ST_MakePoint(106.703105, 10.777513), 4326)::geography,
  10000  -- 10km in meters
)
ORDER BY ST_Distance(
  location,
  ST_SetSRID(ST_MakePoint(106.703105, 10.777513), 4326)::geography
);
```

---

## ⚠️ Common Issues

### Issue 1: Tọa độ bị đảo ngược

```javascript
// ❌ SAI
position={[station.longitude, station.latitude]}

// ✅ ĐÚNG (Leaflet dùng [lat, lng])
position={[station.latitude, station.longitude]}
```

### Issue 2: Tọa độ là String thay vì Number

```javascript
// ❌ Backend trả: "10.777513"
"latitude": "10.777513"

// ✅ Backend nên trả: 10.777513
"latitude": 10.777513

// Frontend fix tạm:
position={[parseFloat(station.latitude), parseFloat(station.longitude)]}
```

### Issue 3: Tọa độ null hoặc 0

```javascript
// ❌ Tọa độ invalid
"latitude": null,
"longitude": 0

// Frontend check:
if (!station.latitude || !station.longitude) return null;
```

### Issue 4: Độ chính xác thấp

```javascript
// ❌ Chỉ 2 chữ số thập phân (sai lệch ~1km)
"latitude": 10.77
"longitude": 106.70

// ✅ Nên có 6-8 chữ số thập phân (sai lệch ~1m)
"latitude": 10.777513
"longitude": 106.703105
```

---

## 🧪 Test Data mẫu

Dùng để test nếu Backend chưa có data thật:

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
      "address": "72 Lê Thánh Tôn, Quận 1, TP.HCM",
      "status": "Active",
      "totalChargers": 4,
      "availableChargers": 2,
      "hotline": "1900-5678",
      "email": "vincom@station.com"
    },
    {
      "stationId": "ST002",
      "stationName": "Landmark 81",
      "latitude": 10.794897,
      "longitude": 106.72197,
      "address": "720A Điện Biên Phủ, Quận Bình Thạnh, TP.HCM",
      "status": "Active",
      "totalChargers": 6,
      "availableChargers": 1,
      "hotline": "1900-5678",
      "email": "landmark@station.com"
    },
    {
      "stationId": "ST003",
      "stationName": "Bitexco Financial Tower",
      "latitude": 10.771702,
      "longitude": 106.704223,
      "address": "2 Hải Triều, Quận 1, TP.HCM",
      "status": "Active",
      "totalChargers": 8,
      "availableChargers": 3,
      "hotline": "1900-5678",
      "email": "bitexco@station.com"
    },
    {
      "stationId": "ST004",
      "stationName": "Bến Thành Market",
      "latitude": 10.772461,
      "longitude": 106.698055,
      "address": "Lê Lợi, Quận 1, TP.HCM",
      "status": "Inactive",
      "totalChargers": 2,
      "availableChargers": 0,
      "hotline": "1900-5678",
      "email": "benthanh@station.com"
    }
  ]
}
```

---

## 📞 Contact Backend Team

### Yêu cầu gửi cho Backend:

1. ✅ Đảm bảo LUÔN có `latitude` và `longitude` (kiểu Number)
2. ✅ Độ chính xác tọa độ: 6-8 chữ số thập phân
3. ✅ Format: Decimal degrees (không phải DMS)
4. ✅ Test với data thật trước khi deploy
5. ✅ Handle null case: Trả `null` nếu không có tọa độ, đừng trả `0` hoặc `""`

### Questions for Backend:

- ❓ Database có sẵn columns `latitude`, `longitude` chưa?
- ❓ Data hiện tại có tọa độ chưa? Nếu chưa, cần import từ đâu?
- ❓ Có dùng Geocoding API để convert address → coordinates không?
- ❓ Có validation cho tọa độ không? (range, format)

---

**Tóm lại**:

- ⭐ **`latitude` và `longitude` là QUAN TRỌNG NHẤT**
- ❌ Không có 2 field này = Map không hoạt động
- ✅ Backend cần ưu tiên implement 2 field này trước tiên

---

**Ngày tạo**: 17/10/2025  
**Version**: 1.0.0  
**Tác giả**: Frontend Team  
**Liên hệ**: Gửi issue nếu cần thêm field hoặc thay đổi format
