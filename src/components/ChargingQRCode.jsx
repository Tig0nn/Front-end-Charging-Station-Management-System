import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X } from "lucide-react";

/**
 * Component tạo QR Code để khởi động phiên sạc
 * Khi user scan QR sẽ mở trang với chargingPointId và vehicleId
 */
const ChargingQRCode = ({
  chargingPointId,
  chargingPointName,
  stationName,
  onClose,
}) => {
  const [showInstructions, setShowInstructions] = useState(true);

  // Tạo URL để start charging - URL này sẽ được scan bởi app
  // Format: /driver/start-charging?pointId={id}
  const baseUrl = window.location.origin;
  const qrData = `${baseUrl}/driver/start-charging?pointId=${chargingPointId}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Quét mã QR để sạc
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {stationName} - {chargingPointName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* QR Code */}
        <div className="p-8 flex flex-col items-center">
          <div className="bg-white p-4 rounded-xl shadow-lg">
            <QRCodeSVG
              value={qrData}
              size={256}
              level="H"
              includeMargin={true}
              imageSettings={{
                src: "/logo.png", // Có thể thêm logo vào giữa QR
                height: 40,
                width: 40,
                excavate: true,
              }}
            />
          </div>

          {/* Instructions */}
          {showInstructions && (
            <div className="mt-6 bg-blue-50 rounded-lg p-4 w-full">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-blue-600 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">
                    Hướng dẫn sử dụng:
                  </h4>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Mở ứng dụng và đăng nhập</li>
                    <li>Quét mã QR này bằng camera</li>
                    <li>Chọn xe và mức sạc mong muốn</li>
                    <li>Xác nhận để bắt đầu sạc</li>
                  </ol>
                </div>
                <button
                  onClick={() => setShowInstructions(false)}
                  className="flex-shrink-0 text-blue-400 hover:text-blue-600"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Charging Point Info */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">ID Trụ sạc</p>
            <p className="text-sm font-mono text-gray-700 mt-1">
              {chargingPointId}
            </p>
          </div>

          {/* Alternative: Direct Link */}
          <div className="mt-6 w-full">
            <p className="text-xs text-gray-500 text-center mb-2">
              Hoặc sao chép link:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={qrData}
                readOnly
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 font-mono"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(qrData);
                  alert("Đã sao chép link!");
                }}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                Copy
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-2xl">
          <p className="text-xs text-gray-500 text-center">
            Mã QR có hiệu lực cho đến khi trụ sạc được sử dụng
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChargingQRCode;
