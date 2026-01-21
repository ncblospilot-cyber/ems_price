# EMS Pricing Tool (FE-only)

Nguồn data: `pricing_hoa_toc_ems_v4.xlsx`
- `REGION_MAP` -> `src/data/ems/v4/provinces.json`
- `EMS_PRICE` -> `src/data/ems/v4/pricing.json`

## Run
```bash
npm i
npm run dev
```

## Build & Deploy
```bash
npm run build
```
Upload thư mục `dist/` lên static hosting (Nginx, S3, v.v.)

## Logic
- Tự xác định `Loại vùng`:
  - Nội tỉnh: cùng tỉnh
  - Nội vùng: khác tỉnh nhưng cùng region
  - Cách vùng: R1 <-> R2
  - Cận vùng: các trường hợp còn lại (R1<->R3, R3<->R2)
- Giá:
  - Base cho <= 5kg
  - Phần tăng thêm tính theo kg (làm tròn lên) theo các band: 5–30, 30–100, 100–200, 200–500
- Vùng xa: tăng 20% trên tổng cước
