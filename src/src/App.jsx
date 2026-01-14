import React, { useMemo, useState } from "react"
import { SpeedInsights } from "@vercel/speed-insights/react"
import pricing from "./data/ems/v4/pricing.json"
import provinces from "./data/ems/v4/provinces.json"
import ProvinceSelect from "./components/ProvinceSelect.jsx"
import WeightInput from "./components/WeightInput.jsx"
import QuoteResult from "./components/QuoteResult.jsx"
import { quoteEms } from "./modules/ems/quoteEms.js"
import { errorMessage } from "./modules/ems/format.js"

export default function App() {
  const ctx = useMemo(() => ({ pricing, provinces }), [])
  const [fromProvince, setFromProvince] = useState("")
  const [toProvince, setToProvince] = useState("")
  const [weight, setWeight] = useState("")
  const [unit, setUnit] = useState("g")
  const [receiverType, setReceiverType] = useState("CENTER")
  const [result, setResult] = useState(null)
  const [err, setErr] = useState("")

  const canQuote = !!fromProvince && !!toProvince && String(weight).trim() !== ""

  function onQuote() {
    setErr("")
    const r = quoteEms(
      {
        fromProvince,
        toProvince,
        weight,
        unit,
        isRemoteReceiver: receiverType === "REMOTE"
      },
      ctx
    )
    if (!r.ok) {
      setResult(null)
      setErr(errorMessage(r.code))
      return
    }
    setResult(r)
  }

  return (
    <div className="container">
      <div className="header">
        <div className="title">EMS Pricing Tool</div>
        <div className="sub">FE-only · {pricing.version}</div>
      </div>

      <div className="grid">
        <div className="card">
          <h3>Nhập liệu</h3>

          <ProvinceSelect
            label="Tỉnh gửi"
            provinces={provinces}
            value={fromProvince}
            onChange={setFromProvince}
          />

          <ProvinceSelect
            label="Tỉnh nhận"
            provinces={provinces}
            value={toProvince}
            onChange={setToProvince}
          />

          <div className="field">
            <div className="label">Điểm nhận</div>
            <div className="radioRow">
              <label className="radio">
                <input
                  type="radio"
                  name="receiverType"
                  value="CENTER"
                  checked={receiverType === "CENTER"}
                  onChange={() => setReceiverType("CENTER")}
                />
                Vùng trung tâm
              </label>
              <label className="radio">
                <input
                  type="radio"
                  name="receiverType"
                  value="REMOTE"
                  checked={receiverType === "REMOTE"}
                  onChange={() => setReceiverType("REMOTE")}
                />
                Vùng xa (+20%)
              </label>
            </div>
          </div>

          <WeightInput
            weight={weight}
            unit={unit}
            onWeightChange={setWeight}
            onUnitChange={setUnit}
          />

          <button className="btn" style={{ width: "100%" }} disabled={!canQuote} onClick={onQuote}>
            Tính cước
          </button>

          {err && <div className="error">{err}</div>}

          <div className="sub" style={{ marginTop: 10 }}>
            Ghi chú: Khối lượng được làm tròn lên theo kg (ceil) vì bảng giá theo đơn vị 1kg.
          </div>
        </div>

        <QuoteResult result={result} />
      </div>
    </div>
  )
}
