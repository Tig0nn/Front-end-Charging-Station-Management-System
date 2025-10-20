# 🗺️ Hướng dẫn tích hợp chức năng Chỉ đường (Routing) với Leaflet

## 📋 Tổng quan

Tài liệu này mô tả việc tích hợp chức năng chỉ đường (routing) vào trang bản đồ sử dụng Leaflet Routing Machine với dữ liệu từ OpenStreetMap (OSRM).

## 🚀 Các bước đã thực hiện

### 1. Cài đặt thư viện

```bash
npm install leaflet-routing-machine --save
```

**Thư viện**: `leaflet-routing-machine` - Thư viện routing cho Leaflet

- Hỗ trợ nhiều routing service: OSRM, Mapbox, GraphHopper
- Tự động tính toán tuyến đường tối ưu
- Hiển thị hướng dẫn chi tiết

### 2. Tạo Component RoutingControl

**File**: `src/components/RoutingControl.jsx`

#### Tính năng:

- ✅ Tự động tính toán tuyến đường giữa 2 điểm
- ✅ Hiển thị đường đi trên bản đồ
- ✅ Tính toán khoảng cách (km) và thời gian (phút)
- ✅ Tự động zoom map để hiển thị toàn bộ tuyến đường
- ✅ Không tạo marker cho waypoints (sử dụng marker có sẵn)
- ✅ Cleanup khi component unmount

#### Code chính:

```javascript
const routingControl = L.Routing.control({
  waypoints: [L.latLng(start[0], start[1]), L.latLng(end[0], end[1])],
  routeWhileDragging: false,
  showAlternatives: true,
  lineOptions: {
    styles: [
      {
        color: "#3b82f6",
        opacity: 0.8,
        weight: 6,
      },
    ],
  },
  createMarker: function () {
    return null; // Không tạo marker
  },
  router: L.Routing.osrmv1({
    serviceUrl: "https://router.project-osrm.org/route/v1",
    language: "vi",
  }),
}).addTo(map);
```

#### Props:

- `start`: Tọa độ điểm bắt đầu `[lat, lng]`
- `end`: Tọa độ điểm kết thúc `[lat, lng]`
- `onRouteFound`: Callback khi tìm thấy route, trả về `{ distance, duration }`

### 3. Cập nhật MapPage Component

**File**: `src/Pages/driver/MapPage.jsx`

#### State mới:

```javascript
const [routeInfo, setRouteInfo] = useState(null); // Thông tin route (distance, duration)
const [showRoute, setShowRoute] = useState(false); // Hiển thị/ẩn route
const [routeDestination, setRouteDestination] = useState(null); // Điểm đến
```

#### Các hàm mới:

##### 1. handleShowDirections

```javascript
const handleShowDirections = (station) => {
  if (!userLocation) {
    alert("Không thể xác định vị trí của bạn. Vui lòng bật GPS.");
    return;
  }

  setRouteDestination([station.latitude, station.longitude]);
  setShowRoute(true);
  setSelectedStation(station);
};
```

- Kiểm tra vị trí người dùng
- Kiểm tra tọa độ trạm sạc
- Bật hiển thị route

##### 2. handleClearRoute

```javascript
const handleClearRoute = () => {
  setShowRoute(false);
  setRouteDestination(null);
  setRouteInfo(null);
};
```

- Xóa route khỏi bản đồ
- Reset state về ban đầu

##### 3. handleRouteFound

```javascript
const handleRouteFound = (info) => {
  setRouteInfo(info);
};
```

- Lưu thông tin route (khoảng cách, thời gian)
- Hiển thị trong Route Info Panel

## 🎨 UI Components

### 1. Nút "Chỉ đường" trong Station Card

```jsx
<button
  className="directions-button"
  onClick={(e) => {
    e.stopPropagation();
    handleShowDirections(station);
  }}
>
  🗺️ Chỉ đường
</button>
```

**Vị trí**: Dưới nút "Sạc" trong danh sách trạm bên trái
**Điều kiện**: Chỉ hiển thị khi có userLocation và tọa độ station

### 2. Nút "Chỉ đường" trong Popup

```jsx
<button className="popup-button" onClick={() => handleShowDirections(station)}>
  🗺️ Chỉ đường
</button>
```

**Vị trí**: Trong popup khi click vào marker trên bản đồ

### 3. Nút "Xóa đường đi" trong Map Controls

```jsx
{
  showRoute && (
    <button
      onClick={handleClearRoute}
      className="control-button"
      title="Xóa đường đi"
      style={{ backgroundColor: "#ef4444" }}
    >
      ❌
    </button>
  );
}
```

**Vị trí**: Góc dưới bên phải bản đồ (cùng với nút GPS và Refresh)
**Điều kiện**: Chỉ hiển thị khi đang có route

### 4. Route Info Panel

```jsx
{
  routeInfo && showRoute && (
    <div className="route-info-panel">
      <div>📍 Khoảng cách: {routeInfo.distance} km</div>
      <div>⏱️ Thời gian: {routeInfo.duration} phút</div>
    </div>
  );
}
```

**Vị trí**: Trên cùng giữa màn hình
**Hiển thị**: Khoảng cách và thời gian di chuyển ước tính

## 🛣️ Routing Service

### OSRM (OpenStreetMap Routing Machine)

- **URL**: `https://router.project-osrm.org/route/v1`
- **Miễn phí**: ✅
- **Ngôn ngữ**: Hỗ trợ tiếng Việt
- **Độ chính xác**: Cao (dữ liệu từ OpenStreetMap)

### Các service thay thế:

1. **Mapbox**: Yêu cầu API key, chất lượng cao
2. **GraphHopper**: Miễn phí có giới hạn
3. **Valhalla**: Open source, self-hosted

## 📊 Flow hoạt động

```
1. User click "Chỉ đường"
   ↓
2. Kiểm tra userLocation & stationLocation
   ↓
3. Set routeDestination & showRoute = true
   ↓
4. RoutingControl component render
   ↓
5. OSRM API tính toán route
   ↓
6. Hiển thị route trên map (màu xanh)
   ↓
7. onRouteFound callback → setRouteInfo
   ↓
8. Hiển thị Route Info Panel
   ↓
9. Auto zoom map để hiển thị toàn bộ route
```

## 🎯 Tính năng

### ✅ Đã hoàn thành:

- [x] Tích hợp Leaflet Routing Machine
- [x] Component RoutingControl
- [x] Tính toán tuyến đường tối ưu
- [x] Hiển thị khoảng cách và thời gian
- [x] Nút chỉ đường trong station card
- [x] Nút chỉ đường trong popup
- [x] Nút xóa route
- [x] Route info panel
- [x] Auto zoom khi có route
- [x] Hỗ trợ tiếng Việt

### 🔜 Có thể mở rộng:

- [ ] Hiển thị hướng dẫn từng bước (turn-by-turn)
- [ ] Chọn phương tiện (xe máy, ô tô, đi bộ)
- [ ] Tính toán nhiều route thay thế
- [ ] Lưu lịch sử route
- [ ] Chia sẻ route
- [ ] Voice navigation
- [ ] Tích hợp Google Maps Directions (nếu có API key)

## 🔧 Cấu hình

### Tuỳ chỉnh màu sắc route:

```javascript
lineOptions: {
  styles: [{
    color: "#3b82f6",    // Màu xanh dương
    opacity: 0.8,         // Độ trong suốt
    weight: 6,            // Độ dày đường
  }],
}
```

### Tuỳ chỉnh routing options:

```javascript
L.Routing.control({
  routeWhileDragging: false, // Không tính toán lại khi kéo
  showAlternatives: true, // Hiển thị route thay thế
  addWaypoints: false, // Không cho thêm waypoint
  fitSelectedRoutes: true, // Auto zoom
  show: false, // Ẩn control panel mặc định
});
```

## 📱 Responsive Design

Route Info Panel tự động responsive:

- **Desktop**: Hiển thị đầy đủ thông tin
- **Mobile**: Thu gọn, chỉ hiển thị số liệu chính

## ⚠️ Lưu ý

### 1. Yêu cầu GPS

- Cần bật GPS để xác định vị trí người dùng
- Nếu không có GPS, hiển thị thông báo lỗi

### 2. Dữ liệu trạm sạc

- Trạm sạc phải có `latitude` và `longitude`
- Nếu thiếu tọa độ, không thể tính route

### 3. OSRM Service

- Sử dụng public API, có thể bị giới hạn request
- Nên tự host OSRM server cho production

### 4. Performance

- Route được tính toán real-time
- Cleanup routing control khi unmount để tránh memory leak

## 🐛 Xử lý lỗi

### Không có vị trí người dùng:

```javascript
if (!userLocation) {
  alert("Không thể xác định vị trí của bạn. Vui lòng bật GPS.");
  return;
}
```

### Trạm không có tọa độ:

```javascript
if (!station.latitude || !station.longitude) {
  alert("Trạm sạc không có thông tin vị trí.");
  return;
}
```

### Routing API error:

```javascript
routingControl.on("routingerror", function (e) {
  console.error("Routing error:", e);
  alert("Không thể tính toán đường đi. Vui lòng thử lại.");
});
```

## 📝 Testing

### Test cases:

1. ✅ Click "Chỉ đường" từ station card
2. ✅ Click "Chỉ đường" từ popup
3. ✅ Hiển thị route trên map
4. ✅ Hiển thị khoảng cách và thời gian
5. ✅ Click "Xóa đường đi" để xóa route
6. ✅ Auto zoom map khi có route
7. ✅ Refresh map vẫn giữ route nếu chưa xóa
8. ✅ Xử lý lỗi khi không có GPS

## 📸 Screenshots

### Trước khi chỉ đường:

- Hiển thị danh sách trạm
- Hiển thị marker trên map
- Có nút "Chỉ đường"

### Sau khi chỉ đường:

- Hiển thị route (đường màu xanh)
- Route Info Panel ở trên cùng
- Nút "Xóa đường đi" màu đỏ
- Map auto zoom hiển thị toàn bộ route

## 🚀 Deployment

### Production checklist:

- [ ] Kiểm tra OSRM API limit
- [ ] Cân nhắc self-host OSRM server
- [ ] Optimize route calculation
- [ ] Add analytics tracking
- [ ] Test trên nhiều thiết bị
- [ ] Test với nhiều loại route (gần, xa, phức tạp)

## 📚 Tài liệu tham khảo

- [Leaflet Routing Machine Docs](https://www.liedman.net/leaflet-routing-machine/)
- [OSRM API Documentation](http://project-osrm.org/docs/v5.24.0/api/)
- [Leaflet Documentation](https://leafletjs.com/reference.html)

## 🤝 Support

Nếu gặp vấn đề:

1. Kiểm tra console log
2. Verify GPS đã bật
3. Kiểm tra network request đến OSRM
4. Verify tọa độ station hợp lệ

---

**Ngày tạo**: 17/10/2025  
**Version**: 1.0.0  
**Status**: ✅ Hoàn thành  
**Tech Stack**: React + Leaflet + Leaflet Routing Machine + OSRM
