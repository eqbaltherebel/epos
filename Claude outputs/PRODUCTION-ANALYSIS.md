# Bihar AePDS / SMART-PDS — Production Reverse-Engineering (Living Document)

Source of truth: **https://epos.bihar.gov.in/**
Backend: **Spring** app under `/Epos_Spring/*`. Frontend: **React CRA SPA** (client-side routing; report drill-downs re-render in place at the same URL).

This document is built from live capture. Sections marked **[verified]** were observed
directly in production; **[needs HAR]** require the exact request payload, which the
browser tooling used here cannot dump for POST bodies (see "How to finalize" at the end).

---

## 1. Shared / structural APIs  [verified]

| Method | URL | Trigger | Response |
|---|---|---|---|
| GET | `/Epos_Spring/demo/getHeader/1` | app load | headings + base64 logos |
| GET | `/Epos_Spring/demo/getFooter/1` | app load | footer |
| GET | `/Epos_Spring/demo/getHome` | home | live stats, side menu, hit count |
| GET | `/Epos_Spring/demo/get_Public_Menus` | app load | top mega-menu (9 menus, ~70 report links) |
| GET | `/Epos_Spring/api/getRightSideMenu` | home | right accordion (colours from API) |
| GET | `/Epos_Spring/Common/getstatename` | filters | `[{state_name_en:"Bihar",state_code:"10"}]` |
| GET | `/Epos_Spring/Common/currentYear` / `currentMonth` | filters | number |
| GET | `/Epos_Spring/Common/putMonths` / `putYears` | month/year filters | list |
| GET | `/Epos_Spring/Common/getDistricts` | district filter | district list |

### Cascading dropdown pattern (Stock Details and most report filters)  [verified endpoints]
`Month → Year → District → AFSO (office) → FPS`, backed by `Common/putMonths`,
`Common/putYears`, `Common/getDistricts`, then office-by-district and FPS-by-office
(the office/FPS cascade endpoints are **[needs HAR]** for exact names/params).

---

## 2. Detailed Transactions — full drill-down  [verified]

Route: `/AbstractTransReport` (menu: sidebar "Detailed Transactions" / MIS).
Filter: single **Date** field (default today) + Submit / Back. Statewide (all 38 districts).

### Navigation chain (each level renders **below** the previous; URL stays `/AbstractTransReport`)

```
L1  Submit(date)      POST /Epos_Spring/api/DetailedTrans/details   -> 38 district rows + Total
        │  click District name (hyperlink)
        ▼
L2  district          POST /Epos_Spring/api/DetailedTrans/office    -> "Detailed Transactions For <District>"
        │  click Office name (hyperlink)                                office/block rows + Total
        ▼
L3  office            POST /Epos_Spring/api/DetailedTrans/fps        -> "Detailed Transactions For <Office>"
        │  click FPS ID (hyperlink)                                      FPS rows: FPS ID + dealer name
        ▼
L4  fps               POST /Epos_Spring/api/DetailedTrans/Rc         -> individual ration-card transactions
```

All four are **POST**, status 200. The clone was missing L2–L4 (the hyperlinks) — it
only rendered L1. That is the reported gap.

### Table columns (identical shape at L1/L2/L3; first column changes)

```
Sl.No | <District|Office|FPS ID> | Total Cards (A)
| Date : <date>  →  Trans[ Biometric, Aadhar OTP, Mobile OTP, Iris, Partial Offline, Total ]
                    Availed Cards[ Portability, Partial Offline, Online, Total ]
| <Month> (allotment month)  →  Trans[ Biometric, Aadhar OTP, Mobile OTP, Iris, Partial Offline, Total ]
                    Availed Cards[ Portability (B), Partial Offline (C), Online (D), Total (E=C+D) ]
| Total Availed % (E*100)/A | Partial % (C*100)/E
```
- L3 adds a **dealer/FPS name** column next to the FPS ID.
- Each level ends with a **Total** row and an **Export to Excel** button.
- Link columns: L1 **District name**, L2 **Office name**, L3 **FPS ID**.

### Sample data captured (date 2026-09-05)
- L1 Total row: Total Cards 20,274,952; Aug Availed Total 18,409,617; overall 90.80%.
- L2 (Araria) offices: Araria, Bhargama, Forbesganj, Jokihat, Kursakatta, Narpatganj, Palasi, Raniganj, Sikti.
- L3 (Forbesganj) = 250+ FPS shops, e.g. FPS `120900200111` "Mahanand Jha", `120900200108` "PACS KHABASPUR". FPS IDs are 12-digit.

### Request payloads + response fields  [verified — captured live via in-page fetch]

| Level | POST URL | Request body | Response envelope | Row key fields |
|---|---|---|---|---|
| L1 | `/api/DetailedTrans/details` | `{"date":"YYYY-MM-DD"}` | `{date,data[],header,MonthName,status}` | `dist_name_en`, `dist_code`, `total_cards`, `avail_*` metrics, `total_availed`, `partial` |
| L2 | `/api/DetailedTrans/office` | `{"date","distCode":"209"}` | same | `afso_name_en`, `afso_code`, `dist_name`, metrics |
| L3 | `/api/DetailedTrans/fps` | `{"date","distCode":"209","afsoCode":"01113"}` | same | `fps_id`, `del_name`, `afso_code`, `dist_code`, metrics |
| L4 | `/api/DetailedTrans/Rc` | `{"date","distCode":"209","afsoCode":"01113","fpsId":"120900200018"}` | `{data[],header,status}` | `txn_id`, `existing_rc_number`, `trans_status`, `scheme_short_name`, `scheme_id`, `receipt_id`, `amount`, `port_check`, `trans_time`, `login_time`, `commodities`, `auth_time` |

Metric field mapping (L1–L3 table columns):
- Date-wise Trans: `avail_bio_trans_today, avail_otp_trans_today, avail_motp_trans_today, avail_iris_trans_today, avail_poff_trans_today, avail_trans_today`
- Date-wise Availed: `avail_port_cards_today, avail_poff_cards_today, online_cards_today, avail_cards_today`
- Month Trans: `avail_bio_trans, avail_otp_trans, avail_motp_trans, avail_iris_trans, avail_poff_trans, avail_trans`
- Month Availed: `avail_port_cards (B), avail_poff_cards (C), online_cards (D), total_availed (E)`
- Total Availed % = `total_availed*100/total_cards`; Partial % = `partial` (= `avail_poff_cards*100/total_availed`)

**Implemented** in the clone as `features/report/detailed-transactions.component.ts` (routed at
`/AbstractTransReport`): full District→Office→FPS→RC drill-down, exact column groups, Total
rows, and Export-to-Excel, calling the real endpoints above through the proxy.

---

## 3. Report screen inventory (from get_Public_Menus)  [verified list; per-screen APIs pending]

9 menus, ~70 links. Each link routes to `/{link}` and renders a report. Filter shape and
result-endpoint per screen are captured screen-by-screen; the shared filter endpoints
(section 1) are reused widely. Key links:

- **MIS**: version_abstract, active_inactive, Port_Abst, EkycUpdatereport, AbstractFpsTransReport, Unconsolidate_Consolidated_Cb, NoOfLogindaysInt, Date_Wise_Ben_Ver_List, FpsWeighingReport
- **FPS**: dfso_fps_details (FPS Details — GET `api/fps/fpsSummary`), Stock_Register_Int, FPS_Trans_Abstract, FPSDayWiseInterface, FPS_Device_Mapping, ShopWiseCardandsaleDetails, FPS_Login_Int, DistributionExtensionEndDateReport, Non_Availed_Cards, Date_Wise_Stock_Details_int
- **Sales**: OnrcAllotedIntAfso, Scheme_Sale_Interface, Scheme_Sale_Type_Interface, Stock_Interface, ReliefSaleMonthWise, Sales_Int, Scheme_Sale_All_Int, Date_Wise_Sale_Int.jsp, Date_Wise_Sale_Allotment_Int, NFSA_Sales_Int, Sales_NFSA_Non_NFSA_Int, MonthlySchemeWiseCommodity, Portability_Sale, Portability_Drawl, TotalSale, Tagged_Scheme_SaleInt, scheme_wise_quantity_drawn, Entitlement_saleInt
- **UIDAI**: uid_error, Auth_Suc_Int, epos_error, UID_Auth_Interface, FPS_Auth_Interface
- **Allotment**: KeyReg_Allot_Interface, KeyRegCards_Interface, Scheme_Allot_Int, Scheme_Allot_All_Int
- **Annavitran**: AnnavitranState, AnnavitranSale, AnnavitranTransInt
- **RO Status**: Dist_Month_RO_Int, Dist_RO_Int, truck_ro_recive_m_y_int
- **Reports**: MobileNumberSeedingInt, Ben_Ver_District_ModifyUpdate, current_process_report
- **IAeSCM**: scm

---

## 4. Gap report — clone vs production (Detailed Transactions)

| Aspect | Production | Clone (before) | Fix |
|---|---|---|---|
| L1 district table | ✅ | ✅ populated | keep |
| District → office drill | hyperlink → POST office | **missing** | add drill (L2) |
| Office → FPS drill | hyperlink → POST fps | **missing** | add drill (L3) |
| FPS → RC transactions | hyperlink → POST Rc | **missing** | add drill (L4) |
| Export to Excel per level | ✅ | missing | add |
| Column groups (date + month) | ✅ | simplified | match exact columns |

---

## 5. How to finalize exactly (removes all guessing)

The browser inspector available in this environment returns request URL/method/status
but **not POST request/response bodies**, and JS execution is blocked on the production
origin. The precise way to lock every payload and response — and to scale this to all
~70 screens without guessing — is a **HAR export**:

1. On the machine that can reach the site, open Chrome DevTools → **Network**.
2. Tick **Preserve log**. Perform the flow (e.g. Detailed Transactions → click a
   district → an office → an FPS ID). For breadth, also click through the other menus.
3. Right-click the request list → **Save all as HAR with content** → save into
   `D:\Ration\epos\docs\` (or attach it here).

A HAR contains every request's full URL, headers, **payload**, and **response body** —
enough to reproduce production exactly. Alternatively, **Copy as cURL** for
`DetailedTrans/office`, `DetailedTrans/fps`, and `DetailedTrans/Rc` (same as the
`details` cURL already provided) is enough to finish the drill-down precisely.
