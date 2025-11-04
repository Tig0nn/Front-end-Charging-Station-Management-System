import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form, Alert, Tabs, Tab } from "react-bootstrap";
import { Camera, Link as LinkIcon, Upload } from "lucide-react";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";

/**
 * Modal để driver quét QR hoặc paste link để start charging
 * UPDATED: Hỗ trợ cả camera và upload file ảnh
 */
const QRScannerModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [linkInput, setLinkInput] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("scan");
  const scannerRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  // Initialize QR Scanner
  useEffect(() => {
    if (isOpen && activeTab === "scan" && !scannerRef.current) {
      // Create scanner instance
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader", // div id
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          supportedScanTypes: [0, 1], // 0=camera, 1=file
        },
        false // verbose logging
      );

      // Success callback
      const onScanSuccess = (decodedText) => {
        console.log(`QR Code detected: ${decodedText}`);
        handleQRScan(decodedText);

        // Stop scanner after successful scan
        if (scannerRef.current) {
          scannerRef.current.clear();
          scannerRef.current = null;
        }
      };

      // Error callback (optional)
      const onScanError = (errorMessage) => {
        // Ignore errors (too noisy)
        console.debug(errorMessage);
      };

      // Render scanner
      scannerRef.current.render(onScanSuccess, onScanError);
    }

    // Cleanup on unmount or tab change
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((err) => {
          console.error("Error clearing scanner:", err);
        });
        scannerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, activeTab]);

  const handleQRScan = (qrData) => {
    try {
      console.log("QR Data:", qrData);

      // Parse QR URL
      if (qrData.includes("/driver/map?")) {
        const url = new URL(qrData);
        const pointId = url.searchParams.get("pointId");
        const stationId = url.searchParams.get("stationId");

        if (pointId && stationId) {
          navigate(`/driver/map?pointId=${pointId}&stationId=${stationId}`);
          onClose();
        } else {
          setError("Mã QR không hợp lệ. Thiếu thông tin trạm sạc.");
          setActiveTab("paste"); // Switch to paste tab
        }
      } else {
        setError(
          "Mã QR không đúng định dạng. Vui lòng sử dụng QR từ trạm sạc."
        );
        setActiveTab("paste");
      }
    } catch (err) {
      setError("Không thể đọc mã QR. Vui lòng thử lại hoặc dán link.");
      console.error("QR parse error:", err);
      setActiveTab("paste");
    }
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const html5QrCode = new Html5Qrcode("qr-file-reader");

      const qrCodeText = await html5QrCode.scanFile(file, true);
      console.log("QR from file:", qrCodeText);

      handleQRScan(qrCodeText);

      // Cleanup
      html5QrCode.clear();
    } catch (err) {
      console.error("Error scanning file:", err);
      setError(
        "Không thể đọc mã QR từ ảnh. Vui lòng thử ảnh khác có chất lượng tốt hơn."
      );
    } finally {
      setUploading(false);
      // Reset input
      event.target.value = "";
    }
  };

  const handlePasteLink = () => {
    setError("");

    if (!linkInput.trim()) {
      setError("Vui lòng nhập link hoặc ID trụ sạc");
      return;
    }

    try {
      // Case 1: Full URL with pointId and stationId
      if (linkInput.includes("/driver/map?")) {
        const url = new URL(linkInput);
        const pointId = url.searchParams.get("pointId");
        const stationId = url.searchParams.get("stationId");

        if (pointId && stationId) {
          navigate(`/driver/map?pointId=${pointId}&stationId=${stationId}`);
          onClose();
        } else {
          setError("Link không hợp lệ. Thiếu thông tin trụ sạc.");
        }
      }
      // Case 2: Old format (for backward compatibility)
      else if (linkInput.includes("start-charging")) {
        const url = new URL(linkInput);
        const pointId = url.searchParams.get("pointId");

        if (pointId) {
          // Redirect to map with pointId only (will need manual station selection)
          navigate(`/driver/map?pointId=${pointId}`);
          onClose();
        } else {
          setError("Link không hợp lệ. Không tìm thấy ID trụ sạc.");
        }
      }
      // Case 3: Just pointId (UUID format) - not recommended
      else if (linkInput.length > 10) {
        alert("Vui lòng sử dụng link QR đầy đủ từ trạm sạc.");
        setError("Vui lòng paste toàn bộ link QR, không chỉ ID.");
      }
      // Case 4: Invalid
      else {
        setError("Link hoặc ID không hợp lệ");
      }
    } catch (err) {
      setError("Link không đúng định dạng");
      console.error("Parse error:", err);
    }
  };

  const handleClose = () => {
    // Clear scanner if exists
    if (scannerRef.current) {
      scannerRef.current.clear().catch((err) => {
        console.error("Error clearing scanner:", err);
      });
      scannerRef.current = null;
    }
    setError("");
    setLinkInput("");
    setActiveTab("scan");
    onClose();
  };

  return (
    <Modal show={isOpen} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <strong>Bắt đầu sạc bằng QR</strong>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-3"
        >
          {/* Tab 1: Scan Camera */}
          <Tab
            eventKey="scan"
            title={
              <span>
                <Camera size={16} className="me-2" />
                Quét QR
              </span>
            }
          >
            <div className="text-center">
              {/* QR Scanner Container */}
              <div id="qr-reader" style={{ width: "100%" }}></div>
              <small className="text-muted d-block mt-3">
                Hướng camera vào mã QR trên trụ sạc hoặc chọn file ảnh
              </small>
            </div>
          </Tab>

          {/* Tab 2: Upload File */}
          <Tab
            eventKey="upload"
            title={
              <span>
                <Upload size={16} className="me-2" />
                Tải ảnh lên
              </span>
            }
          >
            <div className="text-center">
              {/* Hidden file reader div */}
              <div id="qr-file-reader" style={{ display: "none" }}></div>

              <div className="mb-4">
                <Upload size={48} className="text-primary mb-3" />
                <h5>Chọn ảnh QR code</h5>
                <p className="text-muted">
                  Chọn file ảnh chứa mã QR đã tải xuống từ admin
                </p>
              </div>

              <Form.Group>
                <Form.Label
                  htmlFor="qr-file-input"
                  className="btn btn-primary w-100"
                  style={{ padding: "12px", cursor: "pointer" }}
                >
                  {uploading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Upload size={20} className="me-2" />
                      Chọn file ảnh
                    </>
                  )}
                </Form.Label>
                <Form.Control
                  id="qr-file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  style={{ display: "none" }}
                />
              </Form.Group>

              <Alert variant="info" className="mt-3 mb-0">
                <small>
                  <strong>💡 Lưu ý:</strong>
                  <ul className="mb-0 mt-1 ps-3 text-start">
                    <li>Chọn ảnh PNG hoặc JPG có chất lượng tốt</li>
                    <li>Đảm bảo mã QR rõ ràng, không bị mờ</li>
                    <li>Ảnh nên có độ phân giải tối thiểu 300x300px</li>
                  </ul>
                </small>
              </Alert>
            </div>
          </Tab>

          {/* Tab 3: Paste Link */}
          <Tab
            eventKey="paste"
            title={
              <span>
                <LinkIcon size={16} className="me-2" />
                Dán link
              </span>
            }
          >
            <Form.Group className="mb-3">
              <Form.Label>Link hoặc ID trụ sạc</Form.Label>
              <Form.Control
                type="text"
                placeholder="Paste link QR hoặc ID trụ sạc..."
                value={linkInput}
                onChange={(e) => {
                  setLinkInput(e.target.value);
                  setError("");
                }}
                style={{ padding: "12px" }}
              />
            </Form.Group>

            <Button
              variant="success"
              onClick={handlePasteLink}
              disabled={!linkInput.trim()}
              className="w-100 mb-3"
              style={{ padding: "12px" }}
            >
              Tiếp tục
            </Button>

            <Alert variant="info" className="mb-0">
              <small>
                <strong>Hướng dẫn:</strong>
                <ul className="mb-0 mt-1 ps-3">
                  <li>
                    Paste full link: <code>http://...</code>
                  </li>
                  <li>Hoặc chỉ paste ID trụ sạc</li>
                </ul>
              </small>
            </Alert>
          </Tab>
        </Tabs>

        {/* Error Display */}
        {error && (
          <Alert variant="danger" className="mt-3 mb-0">
            <small>{error}</small>
          </Alert>
        )}
      </Modal.Body>

      <Modal.Footer className="bg-light">
        <small className="text-muted text-center w-100">
          Mã QR được dán trên mỗi trụ sạc tại trạm
        </small>
      </Modal.Footer>
    </Modal>
  );
};

export default QRScannerModal;
