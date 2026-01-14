import React, { useEffect, useMemo, useRef, useState } from "react"

// Searchable dropdown for provinces with Unicode-aware matching (removes diacritics)
export default function ProvinceSelect({ label, provinces, value, onChange, placeholder = "Gõ để tìm..." }) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(-1)
  const rootRef = useRef(null)
  const inputRef = useRef(null)

  // Build sorted entries from provinces prop
  const entries = useMemo(() => {
    return Object.entries(provinces || {})
      .map(([code, p]) => ({ code, name: p.name, region: p.region }))
      .sort((a, b) => a.name.localeCompare(b.name, "vi"))
  }, [provinces])

  // derive currently selected name from value
  useEffect(() => {
    if (!value) return setQuery("")
    const sel = entries.find(e => e.code === value)
    if (sel) setQuery(sel.name)
  }, [value, entries])

  // normalize string for Unicode-insensitive search (remove diacritics and toLowerCase)
  const normalize = s => (s || "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()
  // fallback for environments that don't support \p{Diacritic}
  // (we try the Unicode property first above; if it errors, try a BMP-range fallback)
  function safeNormalize(s) {
    try {
      return normalize(s)
    } catch (err) {
      return (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    }
  }

  // filtered suggestions
  const list = useMemo(() => {
    const q = safeNormalize(query.trim())
    if (!q) return entries
    return entries.filter(x => {
      const hay = safeNormalize(x.name + " " + x.code + " " + (x.region || ""))
      return hay.includes(q)
    })
  }, [entries, query])

  // click outside to close
  useEffect(() => {
    function onDoc(e) {
      if (!rootRef.current) return
      if (!rootRef.current.contains(e.target)) {
        setOpen(false)
        setHighlight(-1)
      }
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [])

  function handleSelect(item) {
    setQuery(item.name)
    setOpen(false)
    setHighlight(-1)
    onChange && onChange(item.code)
  }

  function onKeyDown(e) {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true)
      setHighlight(0)
      return
    }
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlight(h => Math.min(h + 1, Math.max(0, list.length - 1)))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlight(h => Math.max(h - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (highlight >= 0 && highlight < list.length) {
        handleSelect(list[highlight])
      } else if (list.length === 1) {
        handleSelect(list[0])
      }
    } else if (e.key === "Escape") {
      setOpen(false)
      setHighlight(-1)
    }
  }

  return (
    <div className="field" ref={rootRef} style={{ position: "relative" }}>
      <div className="label">{label}</div>
      <input
        ref={inputRef}
        className="input"
        value={query}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onChange={e => {
          setQuery(e.target.value)
          setOpen(true)
          setHighlight(-1)
        }}
        onKeyDown={onKeyDown}
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls="province-suggestions"
      />

      {open && (
        <ul
          id="province-suggestions"
          role="listbox"
          className="dropdown-list"
          style={{
            position: "absolute",
            zIndex: 40,
            left: 0,
            width: "100%",
            top: "calc(100% + 6px)",
            maxHeight: 180,
            overflow: "auto",
            background: "white",
            border: "1px solid #e6e6e6",
            boxShadow: "0 6px 18px rgba(23,35,56,0.08)",
            borderRadius: 4,
            padding: 0,
            listStyle: "none",
          }}
        >
          {list.slice(0, 200).map((x, i) => (
            <li
              key={x.code}
              role="option"
              aria-selected={highlight === i}
              onMouseDown={e => {
                // mousedown so input doesn't lose focus before click
                e.preventDefault()
                handleSelect(x)
              }}
              onMouseEnter={() => setHighlight(i)}
              style={{
                padding: "6px 8px",
                background: highlight === i ? "#f0f6ff" : "white",
                cursor: "pointer",
                borderBottom: "1px solid #f4f4f4",
                fontSize: 13,
                lineHeight: "1.2",
              }}
            >
              <div style={{ fontWeight: 600 }}>{x.name} <span style={{ color: "#666", fontWeight: 400, fontSize: 12 }}>({x.code})</span></div>
              <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>{x.region}</div>
            </li>
          ))}
          {list.length === 0 && (
            <li style={{ padding: 10, color: "#666" }}>Không tìm thấy kết quả</li>
          )}
        </ul>
      )}

      {/* Hidden native select for accessibility / form integration */}
      <select
        className="select"
        value={value || ""}
        onChange={e => onChange && onChange(e.target.value)}
        style={{ display: "none" }}
        aria-hidden={true}
      >
        <option value="">Chọn tỉnh/thành…</option>
        {entries.map(x => (
          <option key={x.code} value={x.code}>{x.name}</option>
        ))}
      </select>
    </div>
  )
}
