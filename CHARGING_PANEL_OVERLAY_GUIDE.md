# 🔋 Charging Panel Overlay - Implementation Guide

## 📋 Tổng quan

Đã refactor charging flow để hiển thị **ngay trên MapPage** thay vì chuyển trang mới:

- ✅ **Charging Panel Overlay** - Modal/Panel hiển thị trên map
- ✅ **3 States**: Waiting → Charging → Invoice
- ✅ **No Navigation** - Không chuyển trang, vẫn ở MapPage
- ✅ **Invoice Display** - Hiển thị hóa đơn sau khi sạc xong

---

## 🎯 New User Flow

```
[MapPage - Bản đồ]
   ↓ Click "Sạc" trên station
[Modal chọn trụ sạc]
   ↓ Chọn trụ → Click "Bắt đầu"
[Panel Overlay: Đang chờ kết nối] ← Hiển thị trên map
   - Countdown 5 phút
   - [Hủy] | [Đã kết nối]
   ↓ Click "Đã kết nối"
[Panel Overlay: Đang sạc xe] ← Vẫn trên map
   - Progress bar
   - Real-time stats
   - [Dừng sạc]
   ↓ Click "Dừng sạc" hoặc pin đầy
[Panel Overlay: Hóa đơn] ← Invoice hiển thị
   - Thời gian bắt đầu/kết thúc
   - Điện năng (kWh)
   - Chi phí chi tiết
   - Phương thức thanh toán (MoMo)
   - [Xác nhận thanh toán]
   ↓
Quay về MapPage (panel đóng)
```

---

## 📁 Files Created/Modified

### 1. **ChargingPanel.jsx** (NEW)

Path: `src/components/ChargingPanel.jsx`

**Purpose**: Overlay panel hiển thị toàn bộ charging flow

**Features**:

- ✅ 3 states: `waiting`, `charging`, `invoice`
- ✅ Countdown timer (5 phút)
- ✅ Real-time battery charging (58% → 100%)
- ✅ Energy meter (kWh calculator)
- ✅ Cost calculator (price × kWh + VAT)
- ✅ Invoice display với full breakdown
- ✅ Payment method (MoMo)

**Props**:

```javascript
{
  station: Object,    // Station info
  charger: Object,    // Charger info
  onClose: Function,  // Close panel callback
  onComplete: Function // Complete charging callback
}
```

**State Flow**:

```javascript
"waiting"
  → handleConfirmConnection()
  → "charging"
  → handleStopCharging()
  → "invoice"
  → handleCloseInvoice()
  → Close panel
```

### 2. **ChargingPanel.css** (NEW)

Path: `src/components/ChargingPanel.css`

**Styles**:

- 🎨 Full-screen overlay (z-index: 10000)
- 🎨 Modal-style panel (max-width: 600px)
- 🎨 3 different layouts (waiting, charging, invoice)
- 🎨 Animations: fadeIn, slideUp, pulse, charging-pulse
- 🎨 Responsive design

### 3. **MapPage.jsx** (MODIFIED)

**Added States**:

```javascript
const [showChargingPanel, setShowChargingPanel] = useState(false);
const [activeCharger, setActiveCharger] = useState(null);
const [activeStation, setActiveStation] = useState(null);
```

**Added Handlers**:

```javascript
const handleStartCharging = (charger) => {
  setActiveCharger(charger);
  setActiveStation(stationForCharging);
  setShowChargingPanel(true);
};

const handleCloseChargingPanel = () => {
  setShowChargingPanel(false);
  setActiveCharger(null);
  setActiveStation(null);
};

const handleCompleteCharging = () => {
  // TODO: Add to history
};
```

**Added JSX**:

```jsx
{
  showChargingPanel && activeStation && activeCharger && (
    <ChargingPanel
      station={activeStation}
      charger={activeCharger}
      onClose={handleCloseChargingPanel}
      onComplete={handleCompleteCharging}
    />
  );
}
```

### 4. **ChargerSelectionModal.jsx** (RESTORED)

**Reverted Changes**:

- ❌ Removed `useNavigate` hook
- ❌ Removed navigation logic
- ✅ Restored `onStartCharging` prop
- ✅ Calls parent callback instead of navigate

---

## 🎨 UI Screens

### 1. Waiting State - "Đang chờ kết nối sủng sạc"

```
┌─────────────────────────────────────┐
│                   ✕                 │
│         ⏱️                          │
│   Đang chờ kết nối sủng sạc         │
│                                     │
│  ╔════════════════════════════╗    │
│  ║ Vincom Đồng Khởi - Trụ 1  ║    │
│  ║ 72 Lê Thánh Tôn, Q.1       ║    │
│  ║ Hệ thống đang tự động...   ║    │
│  ╚════════════════════════════╝    │
│                                     │
│  ╔════════════════════════════╗    │
│  ║ Thời gian còn lại:  4:58   ║    │
│  ╚════════════════════════════╝    │
│                                     │
│  [   Hủy   ]  [ Đã kết nối ✓ ]    │
└─────────────────────────────────────┘
```

### 2. Charging State - "Đang sạc xe"

```
┌─────────────────────────────────────┐
│  Đang sạc xe       [Hoàn đồng]     │
├─────────────────────────────────────┤
│  Vincom Đồng Khởi                   │
│  72 Lê Thánh Tôn, Q.1               │
│  [⚡ 50kW]  [🔌 CCS]                │
├─────────────────────────────────────┤
│  Pin hiện tại:                 58%  │
│  ████████████████░░░░░░░░░         │
│                                     │
│  ┌────────┬────────┬────────┐     │
│  │Bắt đầu │Thời gian│Điện năng│     │
│  │ 16:00  │  1:23  │19.8 kWh│     │
│  └────────┴────────┴────────┘     │
│                                     │
│  Đơn giá:           3,500đ/kWh     │
│  Tạm tính:             69,300đ     │
├─────────────────────────────────────┤
│         [   Dừng sạc   ]           │
└─────────────────────────────────────┘
```

### 3. Invoice State - "Hóa đơn"

```
┌─────────────────────────────────────┐
│   Vincom Đồng Khởi - Trụ 1         │
├─────────────────────────────────────┤
│   Bắt đầu          Kết thúc        │
│    16:00            16:01          │
├─────────────────────────────────────┤
│  Thời gian sạc:        1 phút       │
│  Điện năng:          19.8 kWh       │
├─────────────────────────────────────┤
│  Đơn giá:           3,500đ/kWh     │
│  Tạm tính:             69,300đ     │
│  VAT (10%):             6,930đ     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━     │
│  Tổng cộng:            76,230đ     │
├─────────────────────────────────────┤
│  Phương thức thanh toán             │
│  💳 Ví MoMo                         │
│  Thanh toán qua ví điện tử MoMo    │
├─────────────────────────────────────┤
│     [ Xác nhận thanh toán ]        │
└─────────────────────────────────────┘
```

---

## ⚙️ Technical Implementation

### ChargingPanel Component Structure:

```javascript
ChargingPanel
├─ Props: { station, charger, onClose, onComplete }
├─ States:
│  ├─ sessionState: "waiting" | "charging" | "invoice"
│  ├─ countdown: 300 (seconds)
│  ├─ batteryLevel: 58 (%)
│  ├─ chargingTime: 0 (seconds)
│  ├─ startTime: Date
│  ├─ endTime: Date | null
│  └─ energyDelivered: 0 (kWh)
├─ Effects:
│  ├─ Countdown timer (waiting state)
│  └─ Charging timer (charging state)
└─ Renders:
   ├─ Waiting State UI
   ├─ Charging State UI
   └─ Invoice State UI
```

### Energy & Cost Calculation:

**Energy Delivered**:

```javascript
// 50kW charger = 50kWh per hour
// Per second: 50 / 3600 = 0.0139 kWh/s
setEnergyDelivered((prev) => prev + 50 / 3600);
```

**Cost Calculation**:

```javascript
const calculateCosts = () => {
  const pricePerKwh = 3500; // 3,500đ per kWh
  const subtotal = Math.round(energyDelivered * pricePerKwh);
  const vat = Math.round(subtotal * 0.1); // 10% VAT
  const total = subtotal + vat;

  return { subtotal, vat, total, pricePerKwh };
};
```

**Example** (1 phút sạc):

```
Thời gian: 60 giây
Năng lượng: 60 × (50/3600) = 0.833 kWh
Tạm tính: 0.833 × 3,500 = 2,916đ
VAT: 2,916 × 0.1 = 292đ
Tổng: 3,208đ
```

### Timer Logic:

**Countdown (Waiting)**:

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

**Charging Timer**:

```javascript
useEffect(() => {
  if (sessionState === "charging") {
    const timer = setInterval(() => {
      setChargingTime((prev) => prev + 1);
      setBatteryLevel((prev) => Math.min(prev + 0.1, 100));
      setEnergyDelivered((prev) => prev + 50 / 3600);
    }, 1000);
    return () => clearInterval(timer);
  }
}, [sessionState]);
```

---

## 🔄 Data Flow

### MapPage → ChargingPanel:

```javascript
// MapPage
const handleStartCharging = (charger) => {
  setActiveCharger(charger);
  setActiveStation(stationForCharging);
  setShowChargingPanel(true);
};

// Pass to ChargingPanel
<ChargingPanel
  station={{
    stationId: "ST001",
    stationName: "Vincom Đồng Khởi",
    address: "72 Lê Thánh Tôn, Q.1",
    pricePerKwh: "3,500đ/kWh",
  }}
  charger={{
    chargerId: "CH001",
    chargerName: "Trụ 1",
    powerOutput: "50kW",
    connectorType: "CCS",
  }}
  onClose={handleCloseChargingPanel}
  onComplete={handleCompleteCharging}
/>;
```

### ChargingPanel → MapPage:

```javascript
// Close panel
onClose() → handleCloseChargingPanel()
  → setShowChargingPanel(false)
  → setActiveCharger(null)
  → setActiveStation(null)

// Complete charging
onComplete() → handleCompleteCharging()
  → TODO: Save to history
  → TODO: Update user stats
```

---

## 🎨 Styling Details

### Overlay Layout:

```css
.charging-panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### Panel Container:

```css
.charging-panel {
  background: white;
  border-radius: 20px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.4s ease;
}
```

### State-Specific Styles:

```css
.waiting-state {
  padding: 50px 40px 40px;
  text-align: center;
}

.charging-state {
  background: linear-gradient(135deg, #d4f1d4 0%, #e8f5e9 100%);
  padding: 30px;
}

.invoice-state {
  padding: 30px;
}
```

---

## 📱 Responsive Behavior

### Desktop (> 768px):

- Panel: max-width 600px, centered
- Stats grid: 3 columns
- Full padding

### Mobile (≤ 768px):

- Panel: 10px margin
- Stats grid: 1 column
- Reduced padding
- Buttons stack vertically
- Invoice times stack vertically

---

## 🚀 Usage Flow

### Complete User Journey:

1. **User mở MapPage**

   - Thấy bản đồ với stations
   - Click marker → popup hiện

2. **Click "Sạc" button**

   - Modal chọn trụ mở
   - Hiển thị danh sách chargers

3. **Chọn trụ → Click "Bắt đầu"**

   - Modal đóng
   - **ChargingPanel overlay mở** (waiting state)
   - Map vẫn hiển thị phía sau overlay

4. **Waiting State (5 phút)**

   - Countdown đếm ngược
   - Options: Hủy hoặc Đã kết nối

5. **Click "Đã kết nối"**

   - Chuyển sang **Charging State**
   - Progress bar bắt đầu tăng
   - Real-time stats update

6. **Đang sạc**

   - Battery: 58% → 100%
   - Energy delivered tính theo giây
   - Cost update real-time

7. **Click "Dừng sạc" hoặc Pin đầy**

   - Chuyển sang **Invoice State**
   - Hiển thị hóa đơn đầy đủ

8. **Invoice Screen**

   - Thời gian bắt đầu/kết thúc
   - Điện năng (kWh)
   - Chi phí breakdown (subtotal + VAT)
   - Tổng cộng
   - Phương thức thanh toán (MoMo)

9. **Click "Xác nhận thanh toán"**
   - Panel đóng
   - Quay về MapPage
   - TODO: Save to history

---

## ✅ Advantages

### So với trang riêng (ChargingSessionPage):

| Aspect      | Trang riêng       | Panel Overlay         |
| ----------- | ----------------- | --------------------- |
| Navigation  | Phải chuyển trang | Không cần chuyển      |
| Context     | Mất bản đồ        | Vẫn thấy map phía sau |
| UX          | Nhiều bước        | Mượt mà hơn           |
| State       | Lost khi back     | Giữ được map state    |
| Performance | Re-render toàn bộ | Chỉ render overlay    |

### Benefits:

1. ✅ **No page navigation** - Trải nghiệm liền mạch
2. ✅ **Context preservation** - Vẫn thấy map
3. ✅ **Better UX** - Modal/panel familiar pattern
4. ✅ **Faster** - Không reload page
5. ✅ **State management** - Dễ dàng hơn

---

## 🎯 Future Enhancements

### Backend Integration:

```javascript
// 1. Start charging session
POST /api/charging-sessions
Body: { stationId, chargerId, vehicleId, startTime }
Response: { sessionId, batteryStart }

// 2. Real-time updates (WebSocket/Polling)
GET /api/charging-sessions/{sessionId}/status
Response: { batteryLevel, energyDelivered, elapsed }

// 3. Stop charging
POST /api/charging-sessions/{sessionId}/stop
Body: { endTime, batteryEnd }
Response: { invoice: {...} }

// 4. Process payment
POST /api/payments
Body: { sessionId, amount, method: "momo" }
Response: { transactionId, status }
```

### Additional Features:

- [ ] **Real-time updates** via WebSocket
- [ ] **Multiple payment methods** (card, bank transfer)
- [ ] **QR code payment** integration
- [ ] **Receipt download** (PDF)
- [ ] **Email receipt** option
- [ ] **Charging history** link
- [ ] **Session sharing** feature
- [ ] **Emergency stop** với confirmation
- [ ] **Pause charging** feature
- [ ] **Notifications** khi charging complete

---

## 🐛 Error Handling

### Missing Data:

```javascript
if (!station || !charger) {
  console.error("Missing station or charger data");
  onClose();
  return null;
}
```

### Auto-cancel:

```javascript
if (countdown <= 0) {
  handleCancel(); // Navigate back
}
```

### Confirmation Dialogs:

- ✅ Cancel waiting (window.confirm)
- ❌ Stop charging (no confirm yet - TODO)

---

## 🧪 Testing Checklist

### Overlay Behavior:

- [ ] Panel mở đúng vị trí (centered)
- [ ] Background có overlay đen mờ
- [ ] Click close button → đóng panel
- [ ] Click outside → không đóng (intentional)

### Waiting State:

- [ ] Countdown chạy đúng (5:00 → 0:00)
- [ ] Thông tin station/charger hiển thị
- [ ] Hủy button → confirm → đóng
- [ ] Đã kết nối → chuyển state

### Charging State:

- [ ] Progress bar tăng smooth
- [ ] Battery % update real-time
- [ ] Charging time đếm đúng
- [ ] Energy (kWh) tính đúng
- [ ] Cost update real-time
- [ ] Dừng sạc → chuyển invoice

### Invoice State:

- [ ] Start/end time đúng
- [ ] Energy (kWh) match với charging
- [ ] Costs tính đúng (subtotal + VAT)
- [ ] Payment method hiển thị
- [ ] Xác nhận → đóng panel

### Responsive:

- [ ] Mobile view (panel full width)
- [ ] Stats grid stack vertical
- [ ] Buttons stack vertical
- [ ] Scroll khi content dài

---

## 📊 Summary

| Feature            | Status | Description                 |
| ------------------ | ------ | --------------------------- |
| Panel Overlay      | ✅     | Fixed overlay on MapPage    |
| Waiting State      | ✅     | Countdown, cancel, connect  |
| Charging State     | ✅     | Real-time progress & stats  |
| Invoice State      | ✅     | Full invoice with breakdown |
| Cost Calculator    | ✅     | Energy × price + VAT        |
| Payment Method     | ✅     | MoMo display (static)       |
| Animations         | ✅     | fadeIn, slideUp, pulse      |
| Responsive         | ✅     | Mobile, tablet, desktop     |
| Backend API        | 🔜     | TODO: Real integration      |
| Payment Processing | 🔜     | TODO: MoMo API              |

---

## 🔗 Related Files

- `src/components/ChargingPanel.jsx` - Main component
- `src/components/ChargingPanel.css` - Styles
- `src/Pages/driver/MapPage.jsx` - Parent container
- `src/components/ChargerSelectionModal.jsx` - Trigger component
- `src/Pages/driver/ChargingSessionPage.jsx` - OLD (unused now)

---

**Ngày cập nhật**: 19/10/2025  
**Version**: 2.0.0  
**Status**: ✅ Complete (Frontend)  
**Location**: Overlay on `/driver/map`
