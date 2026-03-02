import React from "react";

export default function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-gray-300 rounded-md ${className}`}
    />
  );
}