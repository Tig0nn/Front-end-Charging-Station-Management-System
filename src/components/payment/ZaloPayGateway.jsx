import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { zalopayAPI } from "../../lib/apiServices";

const ZaloPayGateway = ({ show, onHide, sessionId, amount }) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!sessionId) {
      alert("Không tìm thấy thông tin phiên sạc");
      return;
    }

    try {
      setLoading(true);
      console.log("🔄 Creating ZaloPay payment for session:", sessionId);
      console.log("💰 Amount:", amount);

      // Call API to create ZaloPay order
      const response = await zalopayAPI.createPayment(sessionId);
      console.log("✅ ZaloPay API response:", response);

      // Extract payment URL from response
      const paymentUrl = response?.data?.result || response?.result;

      if (paymentUrl) {
        console.log("🔗 Redirecting to ZaloPay:", paymentUrl);
        // Redirect to ZaloPay payment gateway
        window.open(paymentUrl, "_blank");
      } else {
        throw new Error("Không nhận được URL thanh toán từ ZaloPay");
      }
    } catch (error) {
      console.error("❌ Payment error:", error);
      console.error("Error details:", {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        message: error?.message,
      });

      let errorMsg = "Có lỗi xảy ra khi tạo thanh toán";

      // Check for specific error types
      if (error?.response?.status === 500) {
        errorMsg =
          "Lỗi máy chủ: Backend chưa implement endpoint ZaloPay hoặc có lỗi xử lý. Vui lòng liên hệ admin.";
      } else if (error?.response?.status === 404) {
        errorMsg =
          "Không tìm thấy endpoint thanh toán ZaloPay. Backend chưa được cấu hình đúng.";
      } else if (error?.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error?.message?.includes("static resource")) {
        errorMsg =
          "Backend đang tìm file tĩnh thay vì xử lý API. Vui lòng kiểm tra cấu hình Spring Boot routing.";
      }

      alert(`Lỗi thanh toán: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <img
            src="/zalopay/images/logo-zalopay.svg"
            alt="ZaloPay"
            style={{ height: "30px", marginRight: "10px" }}
          />
          Thanh toán qua ZaloPay
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="mb-4 text-center">
          <h5>
            Số tiền thanh toán:{" "}
            <span className="text-success">{formatCurrency(amount)}</span>
          </h5>
          {sessionId && (
            <p className="text-muted small">Mã phiên sạc: {sessionId}</p>
          )}
        </div>

        <div className="text-center py-4">
          <img
            src="/zalopay/images/logo-zalopay.svg"
            alt="ZaloPay"
            style={{ height: "60px", marginBottom: "20px" }}
          />
          <p className="text-muted">
            Bạn sẽ được chuyển đến trang thanh toán ZaloPay
            <br />
            Hỗ trợ: Ví ZaloPay, Thẻ ATM, Visa, Mastercard
          </p>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          Hủy
        </Button>
        <Button variant="primary" onClick={handlePayment} disabled={loading}>
          {loading ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              Đang xử lý...
            </>
          ) : (
            `Thanh toán ${formatCurrency(amount)}`
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ZaloPayGateway;
