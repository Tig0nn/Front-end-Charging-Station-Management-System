# 🔧 Sửa lỗi Routing - Nhấp nháy và Auto Zoom

## 🐛 Vấn đề ban đầu

### 1. Lỗi nhấp nháy (flickering)

**Nguyên nhân**:

- `useEffect` trong `RoutingControl` chạy lại liên tục vì `onRouteFound` thay đổi mỗi lần component cha re-render
- Mỗi lần `useEffect` chạy lại, routing control cũ bị xóa và tạo mới, gây hiện tượng nhấp nháy

### 2. Auto zoom không mong muốn

**Nguyên nhân**:

- `fitSelectedRoutes: true` (mặc định)
- Code thủ công gọi `map.fitBounds()` khi tìm thấy route
- Map tự động zoom mỗi khi có route, làm mất trải nghiệm người dùng

## ✅ Giải pháp đã áp dụng

### 1. Sửa lỗi nhấp nháy

#### a) Sử dụng `useRef` để lưu routing control

```javascript
const routingControlRef = useRef(null);
```

**Lý do**:

- `useRef` không gây re-render khi giá trị thay đổi
- Giữ reference đến routing control qua nhiều lần render

#### b) Kiểm tra và xóa routing control cũ trước khi tạo mới

```javascript
// Remove existing routing control if any
if (routingControlRef.current) {
  map.removeControl(routingControlRef.current);
  routingControlRef.current = null;
}
```

**Lý do**: Đảm bảo chỉ có 1 routing control tồn tại trên map

#### c) Loại bỏ `onRouteFound` khỏi dependencies

```javascript
}, [start, end, map]); // onRouteFound intentionally omitted
// eslint-disable-next-line react-hooks/exhaustive-deps
```

**Lý do**:

- `onRouteFound` thay đổi mỗi lần re-render gây chạy lại `useEffect`
- Sử dụng `useCallback` ở component cha để tạo stable reference

#### d) Tắt hiển thị route thay thế

```javascript
showAlternatives: false, // Tránh vẽ nhiều route gây nhấp nháy
```

#### e) Sử dụng `useCallback` trong MapPage

```javascript
const handleRouteFound = useCallback((info) => {
  setRouteInfo(info);
}, []);
```

**Lý do**: Tạo stable function reference, không thay đổi giữa các lần render

### 2. Tắt Auto Zoom

#### a) Tắt fitSelectedRoutes

```javascript
fitSelectedRoutes: false, // ⭐ Tắt auto zoom
```

**Lý do**: Ngăn Leaflet Routing Machine tự động zoom khi tìm thấy route

#### b) Xóa đoạn code fitBounds thủ công

```javascript
// ❌ Đã xóa:
routingControl.on("routesfound", function (e) {
  const routes = e.routes;
  const bounds = L.latLngBounds(routes[0].coordinates);
  map.fitBounds(bounds, { padding: [50, 50] });
});
```

**Lý do**: Người dùng có thể tự zoom/pan map theo ý muốn

#### c) Ẩn bảng hướng dẫn mặc định

```javascript
show: false, // Ẩn bảng hướng dẫn để UI gọn hơn
```

### 3. Cải thiện thêm

#### a) Đổi màu route sang xanh lá

```javascript
color: "#10b981", // Màu xanh lá (emerald-500) đẹp hơn
```

**Lý do**: Phù hợp với theme của app (nút "Chỉ đường" cũng màu xanh lá)

#### b) Cải thiện cleanup

```javascript
return () => {
  if (map && routingControlRef.current) {
    try {
      map.removeControl(routingControlRef.current);
    } catch {
      console.log("Routing control already removed");
    }
    routingControlRef.current = null;
  }
};
```

**Lý do**:

- Sử dụng try-catch để tránh lỗi khi control đã bị xóa
- Đặt ref về null sau khi xóa

## 📊 So sánh trước và sau

### Trước khi sửa:

- ❌ Route nhấp nháy liên tục
- ❌ Map tự động zoom mỗi khi tìm route
- ❌ Hiển thị nhiều route thay thế (rối mắt)
- ❌ Có bảng hướng dẫn mặc định (chiếm diện tích)
- ⚠️ Performance kém (re-render nhiều)

### Sau khi sửa:

- ✅ Route hiển thị ổn định, không nhấp nháy
- ✅ Map giữ nguyên vị trí zoom hiện tại
- ✅ Chỉ hiển thị 1 route tối ưu
- ✅ UI gọn gàng hơn
- ✅ Performance tốt hơn

## 🎯 Tính năng giữ nguyên

- ✅ Tính toán route từ vị trí hiện tại đến trạm sạc
- ✅ Hiển thị khoảng cách và thời gian
- ✅ Nút "Chỉ đường" và "Xóa đường đi"
- ✅ Route Info Panel
- ✅ Màu sắc đẹp mắt

## 🔄 Flow hoạt động mới

```
1. User click "Chỉ đường"
   ↓
2. handleShowDirections() được gọi
   ↓
3. setRouteDestination & setShowRoute(true)
   ↓
4. RoutingControl render
   ↓
5. useEffect chạy (chỉ khi start/end/map thay đổi)
   ↓
6. Kiểm tra và xóa routing control cũ (nếu có)
   ↓
7. Tạo routing control mới với routingControlRef
   ↓
8. OSRM API tính toán route
   ↓
9. Route hiển thị trên map (KHÔNG auto zoom)
   ↓
10. onRouteFound callback → cập nhật routeInfo
    ↓
11. Route Info Panel hiển thị
    ↓
12. Map giữ nguyên vị trí zoom hiện tại ⭐
```

## 💡 Best Practices đã áp dụng

### 1. Sử dụng `useRef` cho mutable values

```javascript
const routingControlRef = useRef(null);
```

- Không gây re-render
- Giữ giá trị qua nhiều lần render

### 2. Sử dụng `useCallback` cho event handlers

```javascript
const handleRouteFound = useCallback((info) => {
  setRouteInfo(info);
}, []);
```

- Tạo stable function reference
- Tránh re-render không cần thiết

### 3. Cleanup trong `useEffect`

```javascript
return () => {
  if (map && routingControlRef.current) {
    try {
      map.removeControl(routingControlRef.current);
    } catch {
      console.log("Routing control already removed");
    }
    routingControlRef.current = null;
  }
};
```

- Tránh memory leak
- Xóa routing control khi component unmount

### 4. Tối ưu dependencies trong `useEffect`

```javascript
}, [start, end, map]); // Chỉ những dependencies thực sự cần thiết
```

- Giảm số lần re-run
- Tăng performance

## 🧪 Testing

### Scenarios đã test:

1. ✅ Click "Chỉ đường" lần đầu → Route hiển thị ổn định
2. ✅ Click "Chỉ đường" nhiều lần → Không nhấp nháy
3. ✅ Click "Xóa đường đi" → Route biến mất sạch sẽ
4. ✅ Chọn trạm khác → Route cũ được thay thế (không nhấp nháy)
5. ✅ Zoom/Pan map thủ công → Hoạt động bình thường
6. ✅ Route Info Panel → Hiển thị đúng thông tin
7. ✅ Console → Không có error/warning

## ⚙️ Configuration mới

### RoutingControl options:

```javascript
{
  waypoints: [...],
  routeWhileDragging: false,
  showAlternatives: false,      // ⭐ Mới: Tắt route thay thế
  addWaypoints: false,
  fitSelectedRoutes: false,      // ⭐ Mới: Tắt auto zoom
  show: false,                   // ⭐ Mới: Ẩn bảng hướng dẫn
  lineOptions: {
    styles: [{
      color: "#10b981",          // ⭐ Mới: Màu xanh lá
      opacity: 0.8,
      weight: 6,
    }],
  },
  createMarker: () => null,
  router: L.Routing.osrmv1({
    serviceUrl: "https://router.project-osrm.org/route/v1",
    language: "vi",
  }),
}
```

## 📝 Files đã sửa

### 1. `src/components/RoutingControl.jsx`

**Thay đổi chính**:

- Import `useRef`
- Thêm `routingControlRef`
- Tắt `fitSelectedRoutes`
- Tắt `showAlternatives`
- Thêm `show: false`
- Đổi màu route
- Loại bỏ `onRouteFound` khỏi dependencies
- Cải thiện cleanup logic

### 2. `src/Pages/driver/MapPage.jsx`

**Thay đổi chính**:

- Import `useCallback`
- Wrap `handleRouteFound` với `useCallback`

## 🚀 Kết quả

- ✅ **Không còn nhấp nháy**: Route hiển thị ổn định
- ✅ **Tắt auto zoom**: User tự zoom/pan map
- ✅ **Performance tốt hơn**: Ít re-render hơn
- ✅ **UX tốt hơn**: Trải nghiệm mượt mà

## 📚 Kiến thức học được

### 1. Vấn đề với function dependencies trong useEffect

- Function được tạo mới mỗi lần render
- Gây chạy lại `useEffect` không cần thiết
- Giải pháp: `useCallback`

### 2. useRef vs useState

- `useState`: Gây re-render khi thay đổi
- `useRef`: Không gây re-render, phù hợp cho mutable values

### 3. Leaflet Routing Machine options

- `fitSelectedRoutes`: Control auto zoom
- `showAlternatives`: Hiển thị route thay thế
- `show`: Hiển thị/ẩn bảng hướng dẫn

### 4. Cleanup trong useEffect

- Quan trọng để tránh memory leak
- Cần xóa các controls/listeners trước khi unmount

---

**Ngày sửa**: 17/10/2025  
**Version**: 1.1.0  
**Status**: ✅ Fixed  
**Issues resolved**: Nhấp nháy route, Auto zoom không mong muốn
