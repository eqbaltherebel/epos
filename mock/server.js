/* Local mock of the SMART-PDS Spring backend, for OFFLINE UI testing only.
   Real data comes from the live server via proxy.conf.json in normal use. */
const http = require('http');
const fs = require('fs');
const path = require('path');

const DATA = path.join(__dirname, 'data');
const ASSETS = path.join(__dirname, 'assets');
const readJson = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8'));

const districtNames = ['Araria','Arwal','Aurangabad','Banka','Begusarai','Bhagalpur','Bhojpur','Buxar','Darbhanga','Gaya','Gopalganj','Jamui','Jehanabad','Kaimur (Bhabua)','Katihar','Khagaria','Kishanganj','Lakhisarai','Madhepura','Madhubani','Munger','Muzaffarpur','Nalanda','Nawada','Pashchim Champaran','Patna','Purbi Champaran','Purnia','Rohtas','Saharsa','Samastipur','Saran','Sheikhpura','Sheohar','Sitamarhi','Siwan','Supaul','Vaishali'];
const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const years = [2019,2020,2021,2022,2023,2024,2025,2026];

// ---- Detailed Transactions mock generators (field names match production) ----
function metric(extra, cards, bio, poff) {
  const availTrans = bio + poff;
  const totalAvailed = cards - Math.round(cards * 0.09);
  return Object.assign({
    total_cards: cards, avail_cards: totalAvailed, avail_trans: availTrans,
    avail_bio_trans: bio, avail_otp_trans: 0, avail_motp_trans: 0, avail_iris_trans: 0, avail_poff_trans: poff,
    avail_port_cards: Math.round(totalAvailed * 0.6), avail_poff_cards: poff, online_cards: totalAvailed - poff,
    total_availed: totalAvailed, partial: totalAvailed ? +(poff * 100 / totalAvailed).toFixed(2) : 0,
    avail_cards_today: null, avail_trans_today: null, avail_bio_trans_today: null, avail_poff_trans_today: null,
    avail_port_cards_today: null, avail_poff_cards_today: null, online_cards_today: null,
    avail_otp_trans_today: null, avail_motp_trans_today: null, avail_iris_trans_today: null,
  }, extra);
}
function districts() {
  return districtNames.map((nm, i) => metric({ dist_name_en: nm, dist_code: String(200 + i), month: 8, year: 2026 }, 700000 - i * 8000, 600000 - i * 7000, i % 4 === 0 ? 1375 : 0));
}
function offices(distCode) {
  const names = ['Araria','Bhargama','Forbesganj','Jokihat','Kursakatta','Narpatganj','Palasi','Raniganj','Sikti'];
  return names.map((nm, i) => metric({ dist_name: 'Araria', afso_name_en: nm, afso_code: String(1110 + i).padStart(5, '0') }, 120000 - i * 9000, 110000 - i * 8500, i === 4 ? 1375 : 0));
}
function fpsList(afsoCode) {
  const dealers = ['PACS KHABASPUR','Mahanand Jha','Amna Khtoon','MD ISLAM ANSARI','Jogendra panday','PACS KIRKICHIA','Md Najam','Naryan prasad yadav','Bachanand Das','DEVRAJ MANDAL','Shekh Fajir','Manoj Choudhary','Champa Davi','shasidhar chodhary','Hira Lal Thandar'];
  return dealers.map((dn, i) => metric({ dist_code: '209', afso_code: afsoCode, dist_name: 'Araria', afso_name_en: 'Forbesganj', del_name: dn, fps_id: '1209002001' + String(10 + i).padStart(2, '0') }, 700 - i * 20, 650 - i * 18, i % 5 === 0 ? 12 : 0));
}
function rcTxns(fpsId) {
  const schemes = ['PHH', 'AAY', 'PHH', 'PMGKAY'];
  return Array.from({ length: 9 }, (_, i) => ({
    txn_id: fpsId + '-' + (1000 + i), existing_rc_number: '2009' + fpsId.slice(-4) + String(1000 + i),
    trans_status: i % 7 === 0 ? 'Failed' : 'Success', scheme_short_name: schemes[i % schemes.length], scheme_id: (i % 4) + 1,
    receipt_id: 'RCP' + (500000 + i), amount: (i + 1) * 45, port_check: i % 3 === 0 ? 'Y' : 'N',
    trans_time: '2026-09-05 1' + i + ':2' + i + ':00', login_time: '2026-09-05 09:0' + i + ':00',
    commodities: 'Rice 4kg, Wheat 1kg', auth_time: '2026-09-05 1' + i + ':2' + i + ':05',
  }));
}

function send(res, code, body, type = 'application/json') {
  res.writeHead(code, { 'Content-Type': type, 'Access-Control-Allow-Origin': '*' });
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  let raw = '';
  req.on('data', (c) => (raw += c));
  req.on('end', () => {
    let body = {};
    try { body = raw ? JSON.parse(raw) : {}; } catch (e) {}
    try {
      // Detailed Transactions drill-down
      if (url === '/Epos_Spring/api/DetailedTrans/details') return send(res, 200, { date: body.date, data: districts(), header: '', MonthName: 'August', status: 200 });
      if (url === '/Epos_Spring/api/DetailedTrans/office') return send(res, 200, { date: body.date, data: offices(body.distCode), header: '', MonthName: 'August', status: 200 });
      if (url === '/Epos_Spring/api/DetailedTrans/fps') return send(res, 200, { date: body.date, data: fpsList(body.afsoCode), header: '', MonthName: 'August', status: 200 });
      if (url === '/Epos_Spring/api/DetailedTrans/Rc') return send(res, 200, { data: rcTxns(body.fpsId || '120900200111'), header: '', status: 200 });

      if (url === '/Epos_Spring/demo/getHeader/1') return send(res, 200, readJson('getHeader.json'));
      if (url === '/Epos_Spring/demo/getFooter/1') return send(res, 200, []);
      if (url === '/Epos_Spring/demo/getHome') return send(res, 200, readJson('getHome.json'));
      if (url === '/Epos_Spring/demo/get_Public_Menus') return send(res, 200, readJson('menus.json'));
      if (url === '/Epos_Spring/demo/get_Public_Side_Menus') return send(res, 200, readJson('getHome.json').data.side_menu);
      if (url === '/Epos_Spring/api/getRightSideMenu') return send(res, 200, readJson('rightMenu.json'));
      if (url === '/Epos_Spring/Common/getstatename') return send(res, 200, [{ state_name_en: 'Bihar', state_code: '10' }]);
      if (url === '/Epos_Spring/Common/currentYear') return send(res, 200, 2026);
      if (url === '/Epos_Spring/Common/currentMonth') return send(res, 200, 8);
      if (url === '/Epos_Spring/Common/putMonths') return send(res, 200, months);
      if (url === '/Epos_Spring/Common/putYears') return send(res, 200, years);
      if (url === '/Epos_Spring/Common/getDistricts') return send(res, 200, districtNames.map((d, i) => ({ district_code: 200 + i, district_name: d })));
      if (url === '/Epos_Spring/Common/getOffices') return send(res, 200, [{ office_code: 1, office_name: 'AFSO-1' }, { office_code: 2, office_name: 'AFSO-2' }]);
      if (url === '/Epos_Spring/Common/getFps') return send(res, 200, [{ fps_code: '1001', fps_name: 'FPS 1001' }]);
      if (url === '/Epos_Spring/api/fps/activeMonthYear') return send(res, 200, { month: 8, year: 2026 });
      if (url === '/Epos_Spring/api/fps/fpsSummary') return send(res, 200, districts().slice(0, 8).map((d, i) => ({ sno: i + 1, district: d.dist_name_en, total: d.total_cards })));

      if (url.startsWith('/static/media/')) return send(res, 200, fs.readFileSync(path.join(ASSETS, 'banner.jpg')), 'image/jpeg');
      if (url.startsWith('/awards/')) return send(res, 200, fs.readFileSync(path.join(ASSETS, 'award.png')), 'image/png');
      if (url === '/images/neww2.gif') return send(res, 200, fs.readFileSync(path.join(ASSETS, 'new.gif')), 'image/gif');
      if (url.startsWith('/images/')) return send(res, 200, fs.readFileSync(path.join(ASSETS, 'award.png')), 'image/png');

      send(res, 404, { status: 404, error: 'Not Found', path: url });
    } catch (e) {
      send(res, 500, { status: 500, error: 'Mock error', message: String(e) });
    }
  });
});

const PORT = process.env.MOCK_PORT || 3101;
server.listen(PORT, () => console.log(`Mock SMART-PDS backend on http://localhost:${PORT}`));
