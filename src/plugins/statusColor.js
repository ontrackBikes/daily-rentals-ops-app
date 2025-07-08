const statusMap = {
  // 🔸 Customer main status
  customer: [
    { name: "Active", value: "active", color: "success" },
    { name: "Inactive", value: "inactive", color: "grey" },
  ],

  // 🔸 Vehicle status
  vehicle: [
    { name: "Available", value: "available", color: "success" },
    { name: "On Hold", value: "on_hold", color: "warning" },
    { name: "Rented", value: "rented", color: "info" },
    { name: "Maintenance", value: "maintenance", color: "error" },
    { name: "Hidden", value: "hidden", color: "grey" },
  ],

  // 🔸 Booking status
  booking: [
    { name: "Upcoming", value: "upcoming", color: "info" },
    { name: "New", value: "new", color: "indigo" },
    { name: "Extend", value: "extend", color: "primary" },
    { name: "Exchange", value: "exchange", color: "purple" },
  ],

  // 🔸 Payment status
  payment: [
    { name: "Pending", value: "pending", color: "warning" },
    { name: "Partial Paid", value: "partial_paid", color: "warning" },
    { name: "Paid", value: "paid", color: "success" },
    { name: "Failed", value: "failed", color: "error" },
    { name: "Refunded", value: "refunded", color: "info" },
  ],

  // Default fallback
  default: [{ name: "Unknown", value: "unknown", color: "grey" }],
};

const StatusService = {
  getColor(status, type = "default") {
    const options = statusMap[type] || statusMap.default;
    const match = options.find((item) => item.value === status?.toLowerCase());
    return match?.color || "grey";
  },
};

export default StatusService;
