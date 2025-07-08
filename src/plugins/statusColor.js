const statusMap = {
  // 🔸 Customer main status
  customer: [
    { name: "Active", value: "active", color: "success" },
    { name: "Inactive", value: "inactive", color: "error" },
  ],

  // 🔸 Vehicle status
  vehicle: [
    { name: "Available", value: "available", color: "success" },
    { name: "On Hold", value: "on_hold", color: "warning" },
    { name: "Rented", value: "rented", color: "info" },
    { name: "Maintenance", value: "maintenance", color: "error" },
    { name: "Hidden", value: "hidden", color: "dark" },
  ],

  // 🔸 Booking status
  booking: [
    { name: "Upcoming", value: "upcoming", color: "info" },
    { name: "Active", value: "active", color: "primary" },
    { name: "Completed", value: "completed", color: "success" },
    { name: "Cancelled", value: "cancelled", color: "error" },
  ],

  // 🔸 Payment status
  payment_status: [
    { name: "Pending", value: "pending", color: "warning" },
    { name: "Paid", value: "paid", color: "success" },
    { name: "Partial Paid", value: "partial_paid", color: "warning" },
    { name: "Unpaid", value: "unpaid", color: "error" },
    { name: "Over Paid", value: "over_paid", color: "info" },
    { name: "Captured", value: "captured", color: "primary" },
    { name: "Failed", value: "failed", color: "error" },
    { name: "Refunded", value: "refunded", color: "info" },
    { name: "Partial Refunded", value: "partial_refunded", color: "info" },
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
