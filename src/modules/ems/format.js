export function formatVnd(n) {
  const x = Number(n)
  if (!Number.isFinite(x)) return "-"
  return x.toLocaleString("vi-VN") + " ₫"
}

export function errorMessage(code) {
  if (code === "INVALID_WEIGHT") return "Khối lượng không hợp lệ."
  if (code === "INVALID_PROVINCE") return "Điểm gửi/nhận không hợp lệ."
  if (code === "OVER_500KG") return "Khối lượng > 500kg: báo giá theo case-by-case."
  if (code === "NO_RATE") return "Không tìm thấy bảng cước cho loại vùng này."
  return "Có lỗi xảy ra."
}
