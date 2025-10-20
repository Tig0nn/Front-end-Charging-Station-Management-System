# 🔋 Charging Session Flow - Implementation Guide

## 📋 Tổng quan

Đã implement flow hoàn chỉnh cho phiên sạc xe với 3 trạng thái:

1. **Waiting State** - Đang chờ kết nối sủng sạc (với countdown timer)
2. **Charging State** - Đang sạc xe (với progress bar & real-time stats)
3. **Completed State** - Hoàn thành sạc (summary screen)

---

## 🎯 User Flow

```
[Bản đồ]
   ↓ Click "Sạc" trên station
[Modal chọn trụ sạc]
   ↓ Chọn trụ → Click "Bắt đầu"
[Màn hình: Đang chờ kết nối]
   - Countdown 5 phút
   - Nút "Hủy" | "Đã kết nối"
   ↓ Click "Đã kết nối"
[Màn hình: Đang sạc xe]
   - Progress bar pin
   - Real-time stats
   - Nút "Dừng sạc"
   ↓ Click "Dừng sạc" hoặc pin đầy
[Màn hình: Hoàn thành]
   - Summary thông tin
   - Nút "Xem lịch sử"
```

---

## 📁 Files Modified/Created

### 1. **ChargingSessionPage.jsx** (NEW)

Path: `src/Pages/driver/ChargingSessionPage.jsx`

**Features:**

- ✅ 3 states: `waiting`, `charging`, `completed`
- ✅ Countdown timer (5 phút auto-cancel nếu không kết nối)
- ✅ Real-time battery charging simulation
- ✅ Charging time tracker
- ✅ Stop charging confirmation
- ✅ Navigate to history on complete

**State Management:**

```javascript
const [sessionState, setSessionState] = useState("waiting");
const [countdown, setCountdown] = useState(300); // 5 minutes
const [batteryLevel, setBatteryLevel] = useState(58); // Start at 58%
const [chargingTime, setChargingTime] = useState(0);
```

**Key Functions:**

- `handleConfirmConnection()` - Chuyển từ waiting → charging
- `handleStopCharging()` - Dừng sạc (confirmation)
- `handleCancel()` - Hủy phiên sạc
- `handleCompleteSession()` - Navigate to history

### 2. **ChargingSessionPage.css** (NEW)

Path: `src/Pages/driver/ChargingSessionPage.css`

**Styles:**

- 🎨 Gradient background (purple theme)
- 🎨 3 card layouts (waiting, charging, completed)
- 🎨 Animations: slideIn, pulse, bounceIn, charging-animation
- 🎨 Responsive design (mobile-friendly)
- 🎨 Professional color scheme

**Key Animations:**

```css
@keyframes charging-animation {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}
```

### 3. **ChargerSelectionModal.jsx** (MODIFIED)

**Changes:**

```javascript
// Before
onStartCharging(selectedCharger);
onClose();

// After
navigate("/driver/charging-session", {
  state: {
    station: station,
    charger: selectedCharger,
  },
});
onClose();
```

**Removed Props:**

- ❌ `onStartCharging` (no longer needed)

**Added:**

- ✅ `useNavigate()` hook
- ✅ Navigate với state (station + charger data)

### 4. **MapPage.jsx** (MODIFIED)

**Changes:**

```javascript
// Removed handleStartCharging function
// Removed onStartCharging prop from ChargerSelectionModal
```

### 5. **App.jsx** (MODIFIED)

**Route Update:**

```javascript
// Before
<Route path="/session" element={<ChargingSessionPage />} />

// After
<Route path="/charging-session" element={<ChargingSessionPage />} />
```

---

## 🎨 UI Screens

### 1. Waiting State - "Đang chờ kết nối sủng sạc"

```
┌─────────────────────────────────────────┐
│              ⏱️                         │
│   Đang chờ kết nối sủng sạc             │
│                                         │
│  ┌────────────────────────────────┐    │
│  │ Vincom Đồng Khởi - Trụ 1      │    │
│  │ 72 Lê Thánh Tôn, Q.1          │    │
│  │ Hệ thống đang tự động phát     │    │
│  │ hiện kết nối...                │    │
│  └────────────────────────────────┘    │
│                                         │
│  ┌────────────────────────────────┐    │
│  │ Thời gian còn lại:    4:58     │    │
│  └────────────────────────────────┘    │
│                                         │
│  [   Hủy   ]    [ Đã kết nối ✓ ]      │
└─────────────────────────────────────────┘
```

**Features:**

- ⏱️ Countdown timer (5:00 → 0:00)
- 🔴 Red timer số khi còn ít thời gian
- 🟡 Yellow warning background
- ⚠️ Auto-cancel nếu hết giờ
- 🔄 Animation pulse cho icon

### 2. Charging State - "Đang sạc xe"

```
┌─────────────────────────────────────────┐
│  Đang sạc xe          [Hoàn đồng]      │
├─────────────────────────────────────────┤
│  Vincom Đồng Khởi                       │
│  72 Lê Thánh Tôn, Q.1                   │
│  ⚡ 50kW    🔌 CCS                       │
├─────────────────────────────────────────┤
│  Pin hiện tại:                    58%   │
│  ████████████████░░░░░░░░              │
│                                         │
│  ┌─────────┬─────────┬─────────┐      │
│  │Bắt đầu  │ Thời gian│  Giá   │      │
│  │ 16:00   │  0:45    │3,500đ  │      │
│  └─────────┴─────────┴─────────┘      │
├─────────────────────────────────────────┤
│           [  Dừng sạc  ]               │
└─────────────────────────────────────────┘
```

**Features:**

- 📊 Real-time progress bar
- 🔋 Battery percentage (animated)
- ⏱️ Charging time counter
- 💰 Price display
- 🟢 Green gradient (charging theme)
- 🎯 "Dừng sạc" button (red, prominent)

### 3. Completed State - "Sạc hoàn tất"

```
┌─────────────────────────────────────────┐
│              ✅                         │
│        Sạc hoàn tất!                    │
│                                         │
│  ┌────────────────────────────────┐    │
│  │ Pin đạt:              100%     │    │
│  │ Thời gian sạc:        1:23     │    │
│  │ Trạm:    Vincom Đồng Khởi      │    │
│  └────────────────────────────────┘    │
│                                         │
│        [ Xem lịch sử ]                 │
└─────────────────────────────────────────┘
```

**Features:**

- ✅ Success icon (bouncing animation)
- 🟢 Green theme
- 📋 Summary statistics
- 🔵 Primary button to history

---

## ⚙️ Technical Details

### State Flow:

```javascript
sessionState: "waiting"
   ↓ (handleConfirmConnection)
sessionState: "charging"
   ↓ (handleStopCharging OR batteryLevel >= 100)
sessionState: "completed"
   ↓ (handleCompleteSession)
Navigate to /driver/history
```

### Timer Logic:

**Countdown Timer (Waiting State):**

```javascript
useEffect(() => {
  if (sessionState === "waiting" && countdown > 0) {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleCancel(); // Auto-cancel
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }
}, [sessionState, countdown, handleCancel]);
```

**Charging Timer (Charging State):**

```javascript
useEffect(() => {
  if (sessionState === "charging") {
    const timer = setInterval(() => {
      setChargingTime((prev) => prev + 1);
      setBatteryLevel((prev) => {
        if (prev >= 100) {
          setSessionState("completed");
          return 100;
        }
        return Math.min(prev + 0.1, 100); // +0.1% per second
      });
    }, 1000);
    return () => clearInterval(timer);
  }
}, [sessionState]);
```

### Battery Charging Rate:

- **0.1% per second** = 6% per minute = 360% per hour
- Simulation: 58% → 100% = 42% = ~7 minutes

### Data Passed via Navigate:

```javascript
navigate("/driver/charging-session", {
  state: {
    station: {
      stationId: "ST001",
      stationName: "Vincom Đồng Khởi",
      address: "72 Lê Thánh Tôn, Q.1",
      pricePerKwh: "3,500đ/kWh",
    },
    charger: {
      chargerId: "CH001",
      chargerName: "Trụ 1",
      powerOutput: "50kW",
      connectorType: "CCS",
      status: "Available",
    },
  },
});
```

---

## 🎨 Animations

### 1. **slideIn** - Card entrance

```css
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### 2. **pulse** - Timer icon

```css
@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}
```

### 3. **charging-animation** - Progress bar

```css
@keyframes charging-animation {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}
```

### 4. **bounceIn** - Success icon

```css
@keyframes bounceIn {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}
```

---

## 📱 Responsive Design

### Desktop (> 768px):

- Cards: max-width 500px-600px
- Grid: 3 columns for stats
- Full padding

### Mobile (≤ 768px):

- Cards: full width with reduced padding
- Grid: 1 column for stats
- Buttons: stack vertically
- Font sizes reduced

---

## 🚀 Usage Flow

### 1. User vào bản đồ (MapPage)

```
/driver/map
```

### 2. Click "Sạc" trên station marker

Modal hiện lên với danh sách trụ sạc

### 3. Chọn trụ → Click "Bắt đầu"

```javascript
// ChargerSelectionModal navigates to:
/driver/charging-session
// with state: { station, charger }
```

### 4. Màn "Đang chờ kết nối"

- Countdown 5 phút
- Options: [Hủy] hoặc [Đã kết nối]

### 5. Click "Đã kết nối"

```javascript
handleConfirmConnection()
  → setSessionState("charging")
```

### 6. Màn "Đang sạc xe"

- Progress bar tăng dần
- Timer đếm giây
- Click "Dừng sạc" hoặc chờ đầy pin

### 7. Màn "Hoàn thành"

```javascript
handleCompleteSession()
  → navigate("/driver/history")
```

---

## 🎯 Future Enhancements

### Backend Integration:

```javascript
// TODO: Replace simulation với real API calls

// 1. Start charging session
POST / api / charging - sessions;
Body: {
  stationId, chargerId, vehicleId;
}
Response: {
  sessionId, startTime, batteryLevel;
}

// 2. Update session status
PATCH / api / charging - sessions / { sessionId };
Body: {
  status: "connected" | "charging" | "stopped";
}

// 3. Get real-time charging data
GET / api / charging - sessions / { sessionId } / status;
Response: {
  batteryLevel, chargingTime, energyDelivered, cost;
}

// 4. Stop charging
POST / api / charging - sessions / { sessionId } / stop;
Response: {
  endTime, finalBattery, totalCost, energyDelivered;
}
```

### Additional Features:

- [ ] **Real-time notifications** (WebSocket)
- [ ] **Cost calculator** (real-time cost updates)
- [ ] **Energy delivered** (kWh meter)
- [ ] **Charging history** trong session
- [ ] **Emergency stop** button
- [ ] **Session sharing** (QR code)
- [ ] **Payment integration** khi stop
- [ ] **Rating system** sau khi hoàn thành

---

## 🐛 Error Handling

### No Station/Charger Data:

```javascript
if (!station || !charger) {
  return (
    <div className="charging-session-error">
      <p>⚠️ Không tìm thấy thông tin phiên sạc</p>
      <button onClick={() => navigate("/driver/map")}>Quay lại bản đồ</button>
    </div>
  );
}
```

### Auto-cancel on Timeout:

```javascript
if (countdown <= 0) {
  handleCancel(); // Navigate back to map
}
```

### Confirmation Dialogs:

- ✅ Cancel session (waiting state)
- ✅ Stop charging (charging state)

---

## ✅ Testing Checklist

### Waiting State:

- [ ] Countdown đếm ngược đúng (5:00 → 0:00)
- [ ] Hiển thị thông tin station và charger
- [ ] Nút "Hủy" → confirm → quay về map
- [ ] Nút "Đã kết nối" → chuyển sang charging state
- [ ] Auto-cancel khi hết giờ

### Charging State:

- [ ] Progress bar tăng dần
- [ ] Battery % hiển thị đúng
- [ ] Charging time đếm đúng
- [ ] Thông tin station/charger hiển thị
- [ ] Nút "Dừng sạc" → confirm → completed state
- [ ] Auto-complete khi pin = 100%

### Completed State:

- [ ] Hiển thị summary đúng
- [ ] Nút "Xem lịch sử" → navigate to /driver/history
- [ ] Success animation hoạt động

### Responsive:

- [ ] Mobile view (≤ 768px)
- [ ] Tablet view
- [ ] Desktop view

---

## 📊 Summary

| Feature             | Status | Description                            |
| ------------------- | ------ | -------------------------------------- |
| Waiting Screen      | ✅     | Countdown, auto-cancel, confirmation   |
| Charging Screen     | ✅     | Real-time progress, stats, stop button |
| Completed Screen    | ✅     | Summary, navigate to history           |
| Animations          | ✅     | slideIn, pulse, bounceIn, charging     |
| Responsive          | ✅     | Mobile, tablet, desktop                |
| Navigation          | ✅     | React Router with state                |
| Error Handling      | ✅     | No data fallback, confirmations        |
| Backend Integration | 🔜     | TODO: Real API calls                   |

---

**Ngày cập nhật**: 19/10/2025  
**Version**: 1.0.0  
**Status**: ✅ Frontend Complete (Backend integration pending)  
**Route**: `/driver/charging-session`
