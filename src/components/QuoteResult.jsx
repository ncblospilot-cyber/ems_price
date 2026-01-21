import React, { useState } from "react"
import { formatVnd } from "../modules/ems/format.js"

export default function QuoteResult({ result }) {
  const [open, setOpen] = useState(true)

  if (!result?.ok) {
    return (
      <div className="card">
        <h3>Kết quả</h3>
        <div className="sub">Chưa có kết quả.</div>
      </div>
    )
  }

  return (
    <div className="card">
      <h3>Kết quả</h3>

      <div className="kpi">
        <div>
          <div className="muted">Tổng cước</div>
          <div className="value">{formatVnd(result.total)}</div>
        </div>
        <div className="muted">{result.currency} · {result.meta.version}</div>
      </div>

      <table className="table">
        <tbody>
          <tr>
            <td>Cước (theo bảng)</td>
            <td>{formatVnd(result.basePrice)}</td>
          </tr>
          <tr>
            <td>Phụ phí vùng xa</td>
            <td>{formatVnd(result.remoteSurcharge)}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: 700 }}>Tổng</td>
            <td style={{ fontWeight: 800 }}>{formatVnd(result.total)}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ marginTop: 10 }}>
        <button className="btn" style={{ width: "100%" }} onClick={() => setOpen(v => !v)}>
          {open ? "Ẩn chi tiết tính" : "Xem chi tiết tính"}
        </button>
      </div>

      {open && (
        <div className="details">
          <div className="detailsGrid">
            <div className="detailsItem">
              <div>Region gửi</div>
              <div>{result.meta.fromRegion}</div>
            </div>
            <div className="detailsItem">
              <div>Region nhận</div>
              <div>{result.meta.toRegion}</div>
            </div>
            <div className="detailsItem">
              <div>Loại vùng</div>
              <div>{labelRouteType(result.meta.routeType)}</div>
            </div>
            <div className="detailsItem">
              <div>Khối lượng tính cước</div>
              <div>{result.meta.chargeableKg} kg (làm tròn lên)</div>
            </div>
            <div className="detailsItem">
              <div>Khối lượng nhập</div>
              <div>{result.meta.inputWeightG} g</div>
            </div>
            <div className="detailsItem">
              <div>Vùng xa</div>
              <div>{result.meta.remoteApplied ? "Có (+20%)" : "Không"}</div>
            </div>
          </div>

          <div style={{ marginTop: 10 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Breakdown</div>
            <table className="table">
              <tbody>
                {result.breakdown?.map((x, idx) => (
                  <tr key={idx}>
                    <td>{x.label} · {x.kg}kg</td>
                    <td>{formatVnd(x.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function labelRouteType(t) {
  if (t === "NOI_TINH") return "Nội tỉnh"
  if (t === "NOI_VUNG") return "Nội vùng"
  if (t === "CAN_VUNG") return "Cận vùng"
  if (t === "CACH_VUNG") return "Cách vùng"
  return t
}
