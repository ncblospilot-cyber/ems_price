export function quoteEms(input, ctx) {
  const { fromProvince, toProvince, weight, unit = "g", isRemoteReceiver } = input

  const weightG = normalizeToGram(weight, unit)
  if (!(weightG > 0)) return fail("INVALID_WEIGHT")

  const chargeableKg = Math.ceil(weightG / 1000)
  if (chargeableKg > 500) return fail("OVER_500KG")

  const from = ctx.provinces[fromProvince]
  const to = ctx.provinces[toProvince]
  if (!from || !to) return fail("INVALID_PROVINCE")

  const routeType = resolveRouteType(fromProvince, toProvince, from.region, to.region)
  const breakdown = calcPriceByBands(chargeableKg, routeType, ctx.pricing)

  if (!breakdown) return fail("NO_RATE")

  const baseTotal = breakdown.total
  const remoteMultiplier = ctx.pricing.remoteMultiplier ?? 1.2
  const total = isRemoteReceiver ? roundMoney(baseTotal * remoteMultiplier) : baseTotal
  const remoteSurcharge = total - baseTotal

  return {
    ok: true,
    currency: ctx.pricing.currency || "VND",
    basePrice: baseTotal,
    remoteSurcharge,
    total,
    breakdown: breakdown.items,
    meta: {
      version: ctx.pricing.version,
      fromRegion: from.region,
      toRegion: to.region,
      routeType,
      chargeableKg,
      inputWeightG: weightG,
      remoteApplied: !!isRemoteReceiver
    }
  }
}

function normalizeToGram(weight, unit) {
  const x = Number(weight)
  if (!Number.isFinite(x)) return NaN
  if (unit === "kg") return Math.round(x * 1000)
  return Math.round(x)
}

function resolveRouteType(fromCode, toCode, fromRegion, toRegion) {
  if (fromCode === toCode) return "NOI_TINH"
  if (fromRegion === toRegion) return "NOI_VUNG"

  const a = fromRegion
  const b = toRegion
  // R1 = Bắc, R3 = Miền Trung, R2 = Miền Nam (theo REGION_MAP)
  // giả định: R1<->R3 và R3<->R2 là Cận vùng; R1<->R2 là Cách vùng
  const pair = [a, b].sort().join("-")
  if (pair === "R1-R2") return "CACH_VUNG"
  return "CAN_VUNG"
}

function calcPriceByBands(chargeableKg, routeType, pricing) {
  const rates = pricing.rates
  const bands = pricing.bands

  const baseTier = rates["BASE_UPTO_5KG"]?.[routeType]
  if (!Number.isFinite(baseTier)) return null

  let total = baseTier
  const items = [{ label: "Cước gốc (≤ 5kg)", kg: Math.min(chargeableKg, 5), unitPrice: baseTier, amount: baseTier }]

  let remaining = Math.max(0, chargeableKg - 5)

  // bands beyond 5kg
  const incBands = bands.filter(b => b.mode === "INCREMENT")
  for (const b of incBands) {
    if (remaining <= 0) break
    const bandKg = Math.max(0, Math.min(remaining, b.toKg - b.fromKg))
    if (bandKg <= 0) continue

    const unitPrice = rates[b.tier]?.[routeType]
    if (!Number.isFinite(unitPrice)) return null

    const amount = bandKg * unitPrice
    total += amount
    items.push({
      label: labelForTier(b.tier),
      kg: bandKg,
      unitPrice,
      amount
    })

    remaining -= bandKg
  }

  return { total: roundMoney(total), items }
}

function labelForTier(tier) {
  if (tier === "RATE_5_30") return "Phần tăng thêm (5–30kg)"
  if (tier === "RATE_30_100") return "Phần tăng thêm (30–100kg)"
  if (tier === "RATE_100_200") return "Phần tăng thêm (100–200kg)"
  if (tier === "RATE_200_500") return "Phần tăng thêm (200–500kg)"
  return tier
}

function roundMoney(v) {
  return Math.round(v)
}

function fail(code) {
  return { ok: false, code }
}
