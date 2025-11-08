import React from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

const LoadingSpinner = ({
  size = "w-10 h-10",
  color = "text-emerald-500",
  className = "",
  center = true,
}) => {
  return (
    <div className={center ? "flex justify-center items-center" : ""}>
      <ArrowPathIcon
        className={`${size} ${color} animate-spin ${center ? "mx-auto" : ""} ${className}`}
      />
    </div>
  );
};

export default LoadingSpinner;
