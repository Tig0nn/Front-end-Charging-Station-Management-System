import React from "react";
import { MapIcon } from "@heroicons/react/24/solid";

const RouteInfoPanel = ({ routeInfo }) => {
  if (!routeInfo) return null;

  return (
    <div className="route-info-panel">
      <div className="route-info-item">
        <MapIcon className="icon-route" />
        <div>
          <div className="route-info-label">Khoảng cách</div>
          <div className="route-info-value">{routeInfo.distance} km</div>
        </div>
      </div>
      <div className="route-info-divider"></div>
      <div className="route-info-item">
        <span className="icon-route-emoji">⏱️</span>
        <div>
          <div className="route-info-label">Thời gian</div>
          <div className="route-info-value">{routeInfo.duration} phút</div>
        </div>
      </div>
    </div>
  );
};

export default RouteInfoPanel;
