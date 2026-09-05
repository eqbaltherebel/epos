/**
 * Bundled fallback copies of the site's NAVIGATION CHROME (menus, sidebars,
 * dropdown lists), captured from the live epos.bihar.gov.in responses.
 *
 * These are used ONLY when the corresponding live API call fails (e.g. the
 * government server is temporarily down or unreachable). They keep the whole
 * app navigable and every screen reachable/renderable at all times. Live report
 * *data* still comes from the real API when it is available — this is a
 * resilience fallback for the navigation shell, not a replacement for live data.
 */
import { PublicMenu, RightMenu, SideMenuItem } from './models/api.models';
import { Option } from './services/util';

const child = (lid: number, name: string, link: string): {
  lid: number; name: string; link: string; weight: number; title: string;
  status: string; name_hi: string | null; public_menu_new: string | null;
} => ({ lid, name, link, weight: 1, title: name, status: 'Y', name_hi: null, public_menu_new: null });

export const FALLBACK_PUBLIC_MENUS: PublicMenu[] = [
  {
    menu_id: 1, menu_name_eng: 'MIS', menu_name_hi: 'एमआईएस', menu_link: '#', menu_target: 'N',
    menu_list: [
      child(1, 'Software Version', 'version_abstract'),
      child(2, 'Active Inactive Shops', 'active_inactive'),
      child(27, 'Inter/Intra Portability', 'Port_Abst'),
      child(55, 'eKYC Update Report', 'EkycUpdatereport'),
      child(28, 'FPS Detailed Transactions', 'AbstractFpsTransReport'),
      child(48, 'Concealed and Reconciled Stock', 'Unconsolidate_Consolidated_Cb'),
      child(41, 'Login Days (v/s) Scheme Wise Sales', 'NoOfLogindaysInt'),
      child(49, 'Modify Aadhaar Details', 'Date_Wise_Ben_Ver_List'),
      child(58, 'FPS Weighing Status', 'FpsWeighingReport'),
    ],
  },
  {
    menu_id: 2, menu_name_eng: 'FPS', menu_name_hi: 'एफपीएस', menu_link: '#', menu_target: 'N',
    menu_list: [
      child(4, 'FPS Details', 'dfso_fps_details'),
      child(5, 'Stock Details', 'Stock_Register_Int'),
      child(6, 'FPS wise Transactions', 'FPS_Trans_Abstract'),
      child(7, 'Date Wise Trans Abstract', 'FPSDayWiseInterface'),
      child(8, 'Device & Dealer Details', 'FPS_Device_Mapping'),
      child(39, 'Shop Wise Cards and sale Details', 'ShopWiseCardandsaleDetails'),
      child(43, 'Activity', 'FPS_Login_Int'),
      child(34, 'Distribution Extension End Date', 'DistributionExtensionEndDateReport'),
      child(44, 'Non Availed Cards', 'Non_Availed_Cards'),
      child(30, 'Date Wise Stock Details', 'Date_Wise_Stock_Details_int'),
    ],
  },
  {
    menu_id: 3, menu_name_eng: 'Sales', menu_name_hi: 'बिक्री', menu_link: '#', menu_target: 'N',
    menu_list: [
      child(46, 'District / Mandal Wise Sale', 'OnrcAllotedIntAfso'),
      child(20, 'Scheme Wise Sales', 'Scheme_Sale_Interface'),
      child(51, 'Scheme Wise Sales(PDS or IMPDS)', 'Scheme_Sale_Type_Interface'),
      child(15, 'Stock Abstract', 'Stock_Interface'),
      child(24, 'Relief Transaction Details', 'ReliefSaleMonthWise'),
      child(26, 'Sales', 'Sales_Int'),
      child(35, 'Detailed Allotment & Sale', 'Scheme_Sale_All_Int'),
      child(38, 'Date Wise Sale (Distribution Month)', 'Date_Wise_Sale_Int.jsp'),
      child(3, 'Date Wise Sale (Allotment Month)', 'Date_Wise_Sale_Allotment_Int'),
      child(25, 'NFSA Sale', 'NFSA_Sales_Int'),
      child(36, 'Day wise Sale', 'Sales_NFSA_Non_NFSA_Int'),
      child(37, 'Sale (Distribution Month)', 'MonthlySchemeWiseCommodity'),
      child(54, 'Portability Sale Qty Details', 'Portability_Sale'),
      child(53, 'Unique RC and Sale Details', 'Portability_Drawl'),
      child(40, 'Total Sale', 'TotalSale'),
      child(10, 'Scheme Wise Sales(Rc Tagged To Fps)', 'Tagged_Scheme_SaleInt'),
      child(52, 'Scheme Wise Daily and Monthly Sales', 'scheme_wise_quantity_drawn'),
      child(56, 'Entitlement and Sale', 'Entitlement_saleInt'),
    ],
  },
  {
    menu_id: 4, menu_name_eng: 'UIDAI', menu_name_hi: 'यूआईडीएआई', menu_link: '#', menu_target: 'N',
    menu_list: [
      child(13, 'Error Codes', 'uid_error'),
      child(29, 'Auth Success Abstract', 'Auth_Suc_Int'),
      child(59, 'ePos Error Codes', 'epos_error'),
      child(9, 'Authentication', 'UID_Auth_Interface'),
      child(45, 'FPS Authentication', 'FPS_Auth_Interface'),
    ],
  },
  {
    menu_id: 5, menu_name_eng: 'Allotment', menu_name_hi: 'नियतन', menu_link: '#', menu_target: 'N',
    menu_list: [
      child(16, 'Commodity Allotment', 'KeyReg_Allot_Interface'),
      child(11, 'Key Register', 'KeyRegCards_Interface'),
      child(12, 'Scheme Wise Allotment', 'Scheme_Allot_Int'),
      child(21, 'Detailed Allotment', 'Scheme_Allot_All_Int'),
    ],
  },
  {
    menu_id: 6, menu_name_eng: 'Annavitran', menu_name_hi: 'Annavitran', menu_link: '#', menu_target: 'N',
    menu_list: [
      child(18, 'Abstract', 'AnnavitranState'),
      child(17, 'Sales', 'AnnavitranSale'),
      child(19, 'Transactions', 'AnnavitranTransInt'),
    ],
  },
  {
    menu_id: 7, menu_name_eng: 'RO Status', menu_name_hi: 'RO Status', menu_link: '#', menu_target: 'N',
    menu_list: [
      child(31, 'RO Status', 'Dist_Month_RO_Int'),
      child(32, 'RO Status By Date', 'Dist_RO_Int'),
      child(33, 'Stock Received Report (Received Month Wise)', 'truck_ro_recive_m_y_int'),
    ],
  },
  {
    menu_id: 8, menu_name_eng: 'Reports', menu_name_hi: 'Reports', menu_link: '#', menu_target: 'N',
    menu_list: [
      child(23, 'Mobile Number Seeding', 'MobileNumberSeedingInt'),
      child(22, 'Beneficiary Modify-Update', 'Ben_Ver_District_ModifyUpdate'),
      child(14, 'Current Process', 'current_process_report'),
    ],
  },
  {
    menu_id: 9, menu_name_eng: 'IAeSCM', menu_name_hi: 'IAeSCM', menu_link: 'scm', menu_target: 'N',
    menu_list: [],
  },
];

export const FALLBACK_SIDE_MENU: SideMenuItem[] = [
  { side_menu_id: 0, side_menu_name_eng: 'PMGKAY', side_menu_link: 'Pmgkay_Int', side_menu_status: 'Y', side_menu_new: '<img/>', side_menu_name_hi: 'PMKAY' },
  { side_menu_id: 1, side_menu_name_eng: 'Detailed Transactions', side_menu_link: 'AbstractTransReport', side_menu_status: 'Y', side_menu_new: '<img/>', side_menu_name_hi: 'विस्तृत लेनदेन' },
  { side_menu_id: 2, side_menu_name_eng: 'Portability Details', side_menu_link: 'Portability_Interface', side_menu_status: 'Y', side_menu_new: '', side_menu_name_hi: 'पोर्टेबिलिटी विवरण' },
  { side_menu_id: 3, side_menu_name_eng: 'FPS Stock Register', side_menu_link: 'FPS_Stock', side_menu_status: 'Y', side_menu_new: '', side_menu_name_hi: 'स्टॉक रजिस्टर' },
  { side_menu_id: 4, side_menu_name_eng: 'Beneficiary Details', side_menu_link: 'SRC_Trans_Int', side_menu_status: 'Y', side_menu_new: '', side_menu_name_hi: 'लाभार्थी विवरण' },
  { side_menu_id: 5, side_menu_name_eng: 'FPS Status', side_menu_link: 'FPS_Status', side_menu_status: 'Y', side_menu_new: '', side_menu_name_hi: 'एफपीएस स्थिति' },
  { side_menu_id: 6, side_menu_name_eng: 'FPS Transactions', side_menu_link: 'FPS_Trans_Int', side_menu_status: 'Y', side_menu_new: '<img/>', side_menu_name_hi: 'FPS Transactions' },
  { side_menu_id: 10, side_menu_name_eng: 'Offline FPS Transactions', side_menu_link: 'FPS_Offline_Trans_Abstract', side_menu_status: 'Y', side_menu_new: '<img/>', side_menu_name_hi: 'Offline FPS Transactions' },
  { side_menu_id: 11, side_menu_name_eng: '% Distribution Status', side_menu_link: 'per_status', side_menu_status: 'Y', side_menu_new: '<img/>', side_menu_name_hi: '% Distribution Status' },
  { side_menu_id: 12, side_menu_name_eng: 'Nominee Cards Abstract', side_menu_link: 'nominee_abstract', side_menu_status: 'Y', side_menu_new: '<img/>', side_menu_name_hi: 'नमन कार्ड सार' },
  { side_menu_id: 13, side_menu_name_eng: 'ONORC', side_menu_link: 'impds_interface', side_menu_status: 'Y', side_menu_new: '<img/>', side_menu_name_hi: 'ONORC' },
  { side_menu_id: 14, side_menu_name_eng: 'ON0RC eKYC', side_menu_link: 'ONRC_eKYC.jsp', side_menu_status: 'Y', side_menu_new: '<img/>', side_menu_name_hi: 'ON0RC eKYC' },
];

export const FALLBACK_RIGHT_MENU: RightMenu[] = [
  { side_menu_id: 1, side_menu_name_eng: 'Civil Supplies', side_menu_link: '0', side_menu_target: '0', side_menu_status: 'Y', side_menu_new: '#cc0066', side_menu_name_hi: 'नागरिक आपूर्तियाँ', items: [{ sno: 1, mid: 1, data: 'OLD Secretariat Building,\nPatna,\nBihar-800015', links: '', mail: '', tollfree: 'Civil Supplies', imgUrl: '' }] },
  { side_menu_id: 2, side_menu_name_eng: 'Helpline', side_menu_link: '0', side_menu_target: '0', side_menu_status: 'Y', side_menu_new: '#666666', side_menu_name_hi: 'हेल्पलाइन', items: [{ sno: 2, mid: 2, data: '', links: '', mail: '1800-3456-194;1967', tollfree: 'Helpline', imgUrl: '' }] },
  { side_menu_id: 4, side_menu_name_eng: 'Related Links', side_menu_link: '0', side_menu_target: '0', side_menu_status: 'Y', side_menu_new: '#476b6b', side_menu_name_hi: 'सम्बंधित लिंक्स', items: [
    { sno: 11, mid: 4, data: 'INDIA PORTAL', links: 'https://www.india.gov.in/', mail: '', tollfree: 'Related Links', imgUrl: '' },
    { sno: 13, mid: 4, data: 'Ration Card Management System', links: 'http://epds.bihar.gov.in/', mail: '', tollfree: 'Related Links', imgUrl: '' },
    { sno: 14, mid: 4, data: 'FPS Management System', links: 'http://epds.bihar.gov.in/FPS/', mail: '', tollfree: 'Related Links', imgUrl: '' },
  ] },
  { side_menu_id: 5, side_menu_name_eng: 'Price Chart', side_menu_link: '0', side_menu_target: '0', side_menu_status: 'Y', side_menu_new: 'orange', side_menu_name_hi: 'मूल्य चार्ट', items: [] },
  { side_menu_id: 6, side_menu_name_eng: 'Search Details', side_menu_link: '0', side_menu_target: '0', side_menu_status: 'Y', side_menu_new: '#993366', side_menu_name_hi: 'विवरण खोज', items: [
    { sno: 17, mid: 6, data: 'District / Office / FPS Codes', links: '', mail: '', tollfree: 'Search Details', imgUrl: '' },
    { sno: 19, mid: 6, data: 'Search FPS Details', links: '', mail: '', tollfree: 'Search Details', imgUrl: '' },
  ] },
];

export const FALLBACK_DISTRICTS: Option[] = [
  '--select--', 'Araria', 'Arwal', 'Aurangabad', 'Banka', 'Begusarai', 'Bhagalpur', 'Bhojpur',
  'Buxar', 'Darbhanga', 'Gaya', 'Gopalganj', 'Jamui', 'Jehanabad', 'Kaimur (Bhabua)', 'Katihar',
  'Khagaria', 'Kishanganj', 'Lakhisarai', 'Madhepura', 'Madhubani', 'Munger', 'Muzaffarpur',
  'Nalanda', 'Nawada', 'Pashchim Champaran', 'Patna', 'Purbi Champaran', 'Purnia', 'Rohtas',
  'Saharsa', 'Samastipur', 'Saran', 'Sheikhpura', 'Sheohar', 'Sitamarhi', 'Siwan', 'Supaul', 'Vaishali',
].map((d, i) => ({ value: String(i), label: d }));
