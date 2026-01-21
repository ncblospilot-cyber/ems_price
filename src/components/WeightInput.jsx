import React from "react"

export default function WeightInput({ weight, unit, onWeightChange, onUnitChange }) {
  return (
    <div className="row">
      <div className="field">
        <div className="label">Khối lượng</div>
        <input
          className="input"
          type="number"
          inputMode="decimal"
          min="0"
          value={weight}
          onChange={e => onWeightChange(e.target.value)}
          placeholder="Nhập số"
        />
      </div>
      <div className="field">
        <div className="label">Đơn vị</div>
        <select className="select" value={unit} onChange={e => onUnitChange(e.target.value)}>
          <option value="g">gram (g)</option>
          <option value="kg">kilogram (kg)</option>
        </select>
      </div>
    </div>
  )
}
