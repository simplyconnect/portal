/* =====================================================================
   CONFIG — Apps Script deploy karne ke baad /exec URL yahan daalein
===================================================================== */
const CONFIG = {
  API_URL: 'https://script.google.com/macros/s/AKfycbz3lCrqywsf1QiZoFS9Vab5nTu1eQIwBulAIx1YwERc4WtqWH2cVA1VclBiNw80E2-NMg/exec'
};

/* =====================================================================
   STATE
===================================================================== */
let SESSION = null;
let CACHE = { employees:null, attendance:null, payroll:null, requests:null, devices:null };
let CURRENT_PROFILE_EMP = null;
let CAL_DATE = new Date();

/* =====================================================================
   API HELPERS
===================================================================== */
async function apiGet(action, params) {
  const url = new URL(CONFIG.API_URL);
  url.searchParams.set('action', action);
  Object.entries(params || {}).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v); });
  const res = await fetch(url.toString());
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Request failed');
  return json.data;
}
async function apiPost(action, payload) {
  const res = await fetch(CONFIG.API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, payload })
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Request failed');
  return json.data;
}
function toast(msg, type) {
  const t = document.createElement('div');
  t.className = 'toast' + (type ? ' ' + type : '');
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}
function initials(name) { return String(name || '').split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') || '--'; }
function esc(s) { return String(s === undefined || s === null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function money(n) { return 'Rs ' + Number(n || 0).toLocaleString(); }
/** Backend "HH:mm:ss" (24-hour) bhejta hai — Google Sheet jaisi hi 12-hour AM/PM shakal mein dikhane ke liye */
function formatTime12(t) {
  if (!t) return '—';
  const raw = String(t).trim();
  if (/[AaPp][Mm]\s*$/.test(raw)) return raw; // pehle se hi "5:15:00 PM" jaisi shakal mein hai — dobara process na karo
  const parts = raw.split(':');
  if (parts.length < 2) return raw;
  const h = Number(parts[0]);
  if (isNaN(h)) return raw;
  const m = parts[1], s = (parts[2] || '00').padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  let h12 = h % 12; if (h12 === 0) h12 = 12;
  return `${h12}:${m}:${s} ${ampm}`;
}
function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
function todayStr() { return new Date().toISOString().slice(0, 10); }
function avatarColor(name) {
  const palette = ['#F4B400,#F2994A', '#6A63E0,#8E88EF', '#2E7D32,#66BB6A', '#C0392B,#E17055', '#2E5FA3,#5B8DEF', '#B7791F,#F2C14E'];
  let h = 0; for (const c of String(name || '')) h = (h * 31 + c.charCodeAt(0)) % palette.length;
  return 'linear-gradient(135deg,' + palette[h] + ')';
}
function presenceColor(status) {
  if (status === 'Present') return 'var(--success)';
  if (status === 'Late') return 'var(--warn)';
  if (status === 'Absent') return 'var(--danger)';
  return '#C7CCD9';
}

/* =====================================================================
   DARK MODE TOGGLE (animated icon swap, remembers choice)
===================================================================== */
(function initTheme() {
  const toggle = document.getElementById('themeToggle');
  const moon = toggle.querySelector('.moon'), sun = toggle.querySelector('.sun');
  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    moon.classList.toggle('hidden', theme === 'dark');
    sun.classList.toggle('hidden', theme !== 'dark');
  }
  let saved = 'light';
  try { saved = localStorage.getItem('sc-theme') || 'light'; } catch (e) {}
  apply(saved);
  toggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const next = isDark ? 'light' : 'dark';
    apply(next);
    try { localStorage.setItem('sc-theme', next); } catch (e) {}
  });
})();

/* =====================================================================
   ROLE TOGGLE (Employee / Admin — animated sliding pill)
===================================================================== */
let SELECTED_ROLE = 'Employee';
(function initRoleToggle() {
  const wrap = document.getElementById('roleToggle');
  wrap.querySelectorAll('.role-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      SELECTED_ROLE = btn.dataset.role;
      wrap.dataset.active = SELECTED_ROLE;
      wrap.querySelectorAll('.role-btn').forEach(b => b.classList.toggle('active', b === btn));
      const isAdmin = SELECTED_ROLE === 'Admin';
      document.getElementById('loginUserLabel').firstChild.textContent = isAdmin ? 'Admin ID or email' : 'Employee ID or email';
      document.getElementById('loginUser').placeholder = isAdmin ? 'e.g. syedaliashar#234' : 'e.g. abdulsaboor#5';
      document.getElementById('loginError').style.display = 'none';
    });
  });
})();

/* =====================================================================
   LOGIN
===================================================================== */
document.getElementById('loginForm').addEventListener('submit', doLogin);
document.getElementById('loginBtn').addEventListener('click', doLogin);

async function doLogin() {
  const user = document.getElementById('loginUser').value.trim();
  const pass = document.getElementById('loginPass').value.trim();
  const errBox = document.getElementById('loginError');
  const btn = document.getElementById('loginBtn');
  errBox.style.display = 'none';

  if (!user || !pass) { errBox.textContent = 'Employee ID/email aur password dono darj karein.'; errBox.style.display = 'block'; return; }
  if (CONFIG.API_URL.includes('PASTE_YOUR')) { errBox.textContent = 'Backend abhi connect nahi hua — CONFIG.API_URL mein Apps Script URL daalein.'; errBox.style.display = 'block'; return; }

  btn.disabled = true; btn.textContent = 'Signing in…';
  try {
    const data = await apiGet('login', { username: user, password: pass, role: SELECTED_ROLE });
    if (!data.success) { errBox.textContent = data.message || 'Invalid login'; errBox.style.display = 'block'; return; }
    if (data.role !== SELECTED_ROLE) {
      errBox.textContent = `Ye ${data.role} account hai — "${data.role}" tab select kar ke dobara try karein.`;
      errBox.style.display = 'block';
      return;
    }
    SESSION = data;
    enterApp();
  } catch (e) {
    errBox.textContent = 'Connection error: ' + e.message;
    errBox.style.display = 'block';
  } finally {
    btn.disabled = false; btn.textContent = 'Sign in';
  }
}

function enterApp() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('appShell').classList.remove('hidden');
  document.getElementById('tbAvatar').textContent = initials(SESSION.name);
  document.getElementById('welcomeTitle').textContent = 'Welcome back, ' + (SESSION.name || SESSION.empId);

  const adminOnly = ['navEmployees', 'navDevices'];
  adminOnly.forEach(id => document.getElementById(id).classList.toggle('hidden', SESSION.role !== 'Admin'));
  document.getElementById('reqActionsHead').textContent = SESSION.role === 'Admin' ? 'Actions' : '';

  document.getElementById('setName').textContent = SESSION.name || '—';
  document.getElementById('setRole').textContent = SESSION.role || '—';
  document.getElementById('setEmpId').textContent = SESSION.empId || '—';
  document.getElementById('setDept').textContent = SESSION.department || '—';

  document.getElementById('dashFrom').value = todayStr();
  document.getElementById('dashTo').value = todayStr();
  // Attendance (full) page ko From/To khali chhodo — matlab "sab records dikhao"
  // (profile tab ki tarah), taaki purani/seed data bhi by-default dikhe. User chahe
  // to filter laga kar khud range choose kar sakta hai.
  document.getElementById('attFrom').value = '';
  document.getElementById('attTo').value = '';
  document.getElementById('payrollMonthFilter').value = todayStr().slice(0,7);

  renderCalendar();
  loadDashboard();
}

document.getElementById('logoutBtn').addEventListener('click', () => {
  SESSION = null; CACHE = { employees:null, attendance:null, payroll:null, requests:null, devices:null };
  document.getElementById('appShell').classList.add('hidden');
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('loginPass').value = '';
});

/* =====================================================================
   NAVIGATION (sidebar + tabbar share one router)
===================================================================== */
const pageMap = {
  dashboard: 'pageDashboard', employees: 'pageEmployees', attendance: 'pageAttendance',
  payroll: 'pagePayroll', requests: 'pageRequests', reports: 'pageReports',
  devices: 'pageDevices', settings: 'pageSettings', myprofile: 'pageEmployeeProfile'
};
function navigateTo(page) {
  Object.values(pageMap).forEach(id => document.getElementById(id).classList.add('hidden'));
  document.getElementById(pageMap[page] || 'pageDashboard').classList.remove('hidden');

  document.querySelectorAll('.nav-item[data-page]').forEach(b => b.classList.toggle('active', b.dataset.page === page));
  document.querySelectorAll('.tab[data-tab]').forEach(b => b.classList.toggle('active', b.dataset.tab === page));

  if (page === 'employees') loadEmployees();
  if (page === 'attendance') loadAttendancePage();
  if (page === 'payroll') loadPayroll();
  if (page === 'requests') loadRequests();
  if (page === 'reports') loadReports();
  if (page === 'devices') loadDevices();
  if (page === 'myprofile') openProfile(SESSION.empId);
}
document.querySelectorAll('.nav-item[data-page]').forEach(btn => btn.addEventListener('click', () => navigateTo(btn.dataset.page)));
document.querySelectorAll('.tab[data-tab]').forEach(btn => btn.addEventListener('click', () => navigateTo(btn.dataset.tab)));
document.getElementById('refreshBtn').addEventListener('click', () => {
  CACHE = { employees:null, attendance:null, payroll:null, requests:null, devices:null };
  loadDashboard();
  toast('Refreshed');
});

/* =====================================================================
   MINI CALENDAR (real month, generated client-side)
===================================================================== */
function renderCalendar() {
  const y = CAL_DATE.getFullYear(), m = CAL_DATE.getMonth();
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  document.getElementById('calTitle').textContent = 'Events — ' + monthNames[m];
  const grid = document.getElementById('calGrid');
  const firstDow = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const daysInPrev = new Date(y, m, 0).getDate();
  const today = new Date();
  let html = ['S','M','T','W','T','F','S'].map(d => `<div class="dow">${d}</div>`).join('');
  for (let i = firstDow - 1; i >= 0; i--) html += `<div class="day muted">${daysInPrev - i}</div>`;
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = d === today.getDate() && m === today.getMonth() && y === today.getFullYear();
    html += `<div class="day${isToday ? ' today' : ''}">${d}</div>`;
  }
  const remain = (7 - (firstDow + daysInMonth) % 7) % 7;
  for (let d = 1; d <= remain; d++) html += `<div class="day muted">${d}</div>`;
  grid.innerHTML = html;
}
document.getElementById('calPrev').addEventListener('click', () => { CAL_DATE.setMonth(CAL_DATE.getMonth() - 1); renderCalendar(); });
document.getElementById('calNext').addEventListener('click', () => { CAL_DATE.setMonth(CAL_DATE.getMonth() + 1); renderCalendar(); });

/* =====================================================================
   DASHBOARD
===================================================================== */
async function loadDashboard() {
  try {
    const [dash, employees] = await Promise.all([
      apiGet('dashboard', { empId: SESSION.empId, role: SESSION.role }),
      CACHE.employees ? Promise.resolve(CACHE.employees) : apiGet('employees')
    ]);
    CACHE.employees = employees;
    populateDeptFilters(employees);
    renderKpis(dash);
    renderPendingTasks(dash);
    renderWhoIsOff(dash);

    const att = await apiGet('attendance', SESSION.role === 'Admin' ? {} : { empId: SESSION.empId });

    if (SESSION.role === 'Admin' && dash.todayFull) {
      // Aaj ke liye data ho to wahi, warna backend ne khud sab se latest date (refDate)
      // ka poora synthesized snapshot bhej diya hai — usay asal rows ke sath merge karo.
      const others = att.filter(r => r['Date'] !== dash.refDate);
      CACHE.attendance = others.concat(dash.todayFull);
      // Dashboard ka apna filter bhi usi reference date par sync kar do, warna KPI aur
      // table ka data mismatch lagega (KPI kuch aur din ka, table khaali).
      document.getElementById('dashFrom').value = dash.refDate;
      document.getElementById('dashTo').value = dash.refDate;
      document.getElementById('dashTableTitle').textContent = dash.isToday
        ? 'Attendance — Today'
        : `Attendance — ${dash.refDate} (sab se recent data)`;
    } else {
      CACHE.attendance = att;
    }

    if (dash.latestRecord) {
      const rec = dash.latestRecord;
      const isToday = rec['Date'] === todayStr();
      document.getElementById('welcomeDate').textContent = isToday
        ? new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })
        : `Last recorded attendance: ${rec['Date']}`;
      document.getElementById('welcomeIn').textContent = formatTime12(rec['Punch In']);
      document.getElementById('welcomeOut').textContent = formatTime12(rec['Punch Out']);
      document.getElementById('welcomeHours').innerHTML = (rec['Working Hours'] || '0') + ' <span style="font-size:13px;font-weight:500;color:var(--muted);">hrs' + (isToday ? ' today' : '') + '</span>';
    } else {
      document.getElementById('welcomeDate').textContent = new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
    }
    applyDashboardFilters();
  } catch (e) { toast('Dashboard load failed: ' + e.message, 'error'); }
}
function renderKpis(d) {
  const row = document.getElementById('kpiRow');
  const note = document.getElementById('dashRefNote');
  let cards;
  if (SESSION.role === 'Admin') {
    cards = [
      { n: d.totalEmployees, l: 'Total employees', cls:'', ic:'&#128101;' },
      { n: d.presentToday, l: 'Present today', cls:'status-Present', ic:'&#10003;' },
      { n: d.absentToday, l: 'Absent', cls:'status-Absent', ic:'&#10005;' },
      { n: d.weekendToday || 0, l: 'Weekend off', cls:'', ic:'&#128197;' },
      { n: d.onLeaveToday || 0, l: 'On leave', cls:'status-Late', ic:'&#9971;' }
    ];
    if (d.isToday === false) {
      note.textContent = `Aaj ke liye attendance data maujood nahi — sab se recent data (${d.refDate}) dikhaya ja raha hai.`;
      note.classList.remove('hidden');
    } else {
      note.classList.add('hidden');
    }
  } else {
    cards = [
      { n: d.presentThisMonth, l: 'Present (Month)', cls:'status-Present', ic:'&#10003;' },
      { n: d.absentThisMonth, l: 'Absent (Month)', cls:'status-Absent', ic:'&#10005;' },
      { n: d.weekendThisMonth || 0, l: 'Weekend (Month)', cls:'', ic:'&#128197;' },
      { n: d.myPendingRequests, l: 'My pending requests', cls:'', ic:'&#128203;' }
    ];
    if (d.refMonth && d.refMonth !== todayStr().slice(0,7)) {
      note.textContent = `Is mahine ka data nahi mila — sab se recent mahine (${d.refMonth}) ka summary dikhaya ja raha hai.`;
      note.classList.remove('hidden');
    } else {
      note.classList.add('hidden');
    }
  }
  row.innerHTML = cards.map((c,i) => `<div class="kpi-card ${c.cls}" style="animation-delay:${i*0.04}s"><div class="kpi-icon">${c.ic}</div><div class="kpi-number">${c.n ?? 0}</div><div class="kpi-label">${c.l}</div></div>`).join('');
}
function renderPendingTasks(d) {
  const box = document.getElementById('pendingTasksBody');
  const list = SESSION.role === 'Admin' ? (d.pendingList || []) : [];
  if (!list.length) { box.innerHTML = '<div class="empty-mini"><div class="ic">&#9989;</div>No pending tasks</div>'; return; }
  box.innerHTML = list.map(r => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border);font-size:13px;">
      <div><strong>${esc(r['Employee Name'])}</strong><br><span style="color:var(--muted);font-size:12px;">${esc(r['Leave Type'])} · ${esc(r['Leave From'])} → ${esc(r['Leave To'])}</span></div>
      <span class="badge Pending">Pending</span>
    </div>`).join('');
}
function renderWhoIsOff(d) {
  const box = document.getElementById('whoOffBody');
  const list = d.whoIsOff || [];
  document.getElementById('whoOffSub').textContent = 'Approved leave today · ' + list.length + ' employee' + (list.length===1?'':'s');
  if (!list.length) { box.innerHTML = '<div class="empty-mini"><div class="ic">&#128100;</div>Everyone is in today</div>'; return; }
  box.innerHTML = '<div style="display:flex;flex-wrap:wrap;gap:10px;">' + list.map(p => `
    <div style="display:flex;align-items:center;gap:8px;background:var(--surface);border-radius:20px;padding:6px 12px 6px 6px;">
      <div class="emp-avatar" style="width:28px;height:28px;font-size:11px;background:${avatarColor(p.name)};">${initials(p.name)}</div>
      <span style="font-size:12.5px;font-weight:600;">${esc(p.name)}</span>
    </div>`).join('') + '</div>';
}
function populateDeptFilters(list) {
  const depts = [...new Set(list.map(e => e['Department']).filter(Boolean))].sort();
  ['dashDeptFilter','empDeptFilter','reportDeptFilter'].forEach(id => {
    const sel = document.getElementById(id);
    if (!sel || sel.dataset.filled) return;
    depts.forEach(d => { const o = document.createElement('option'); o.value = d; o.textContent = d; sel.appendChild(o); });
    sel.dataset.filled = '1';
  });
}
function applyDashboardFilters() {
  const from = document.getElementById('dashFrom').value;
  const to = document.getElementById('dashTo').value;
  const dept = document.getElementById('dashDeptFilter').value;
  const status = document.getElementById('dashStatusFilter').value;
  const empByDept = new Map((CACHE.employees||[]).map(e => [String(e['EMP ID']), e['Department']]));
  const rows = (CACHE.attendance || []).filter(r =>
    (!from || r['Date'] >= from) && (!to || r['Date'] <= to) &&
    (!dept || empByDept.get(String(r['EMP ID'])) === dept) &&
    (!status || r['Status'] === status)
  );
  document.getElementById('dashTableTitle').textContent = (from === to ? 'Attendance — ' + from : 'Attendance — ' + from + ' to ' + to);
  renderAttendanceTable('dashAttendanceBody', rows, true);
}
document.getElementById('dashApplyFilters').addEventListener('click', applyDashboardFilters);

function renderAttendanceTable(bodyId, rows, withDept) {
  const body = document.getElementById(bodyId);
  const empByDept = new Map((CACHE.employees||[]).map(e => [String(e['EMP ID']), e['Department']]));
  if (!rows.length) { body.innerHTML = `<tr><td colspan="8" class="empty-mini"><div class="ic">🗂</div>No attendance records for this range</td></tr>`; return; }
  body.innerHTML = rows.slice().sort((a,b) => (a['Date'] < b['Date'] ? 1 : -1)).map(r => `
    <tr><td>${esc(r['Date'])}</td><td>EMP${esc(r['EMP ID'])}</td><td>${esc(r['Employee Name'])}</td>
    ${withDept ? `<td>${esc(empByDept.get(String(r['EMP ID'])) || '—')}</td>` : ''}
    <td>${formatTime12(r['Punch In'])}</td><td>${formatTime12(r['Punch Out'])}</td><td>${esc(r['Working Hours'] || '0')}</td>
    <td><span class="badge ${esc(r['Status'])}">${esc(r['Status'])}</span></td></tr>`).join('');
}

/* =====================================================================
   EMPLOYEES (grid + Add/Edit)
===================================================================== */
async function loadEmployees() {
  const grid = document.getElementById('empGrid');
  if (!CACHE.employees) {
    grid.innerHTML = '<div class="empty-mini">Loading…</div>';
    try { CACHE.employees = await apiGet('employees'); }
    catch (e) { grid.innerHTML = `<div class="empty-mini">${esc(e.message)}</div>`; return; }
  }
  populateDeptFilters(CACHE.employees);
  renderEmployeeGrid(CACHE.employees);
}
function renderEmployeeGrid(list) {
  document.getElementById('empCount').textContent = list.length + ' employees';
  const grid = document.getElementById('empGrid');
  if (!list.length) { grid.innerHTML = '<div class="empty-mini">No employees found</div>'; return; }
  const todayAtt = new Map((CACHE.attendance||[]).filter(r => r['Date'] === todayStr()).map(r => [String(r['EMP ID']), r['Status']]));
  grid.innerHTML = list.map((e,i) => `
    <div class="emp-card" style="animation-delay:${Math.min(i*0.03,0.4)}s" onclick="openProfile('${e['EMP ID']}')">
      <div class="emp-avatar" style="background:${avatarColor(e['Name'])};">${initials(e['Name'])}<span class="presence" style="background:${presenceColor(todayAtt.get(String(e['EMP ID'])))};"></span></div>
      <div class="emp-name">${esc(e['Name'])}</div><div class="emp-role">${esc(e['Designation'])}</div>
      <div class="emp-dept-badge">${esc(e['Department'])}</div>
      <div class="emp-mini-contact">EMP${esc(e['EMP ID'])} · ${esc(e['Timings'] || '—')}</div>
    </div>`).join('');
}
function filterEmployeeGrid() {
  const q = document.getElementById('empSearch').value.toLowerCase();
  const dept = document.getElementById('empDeptFilter').value;
  const filtered = (CACHE.employees || []).filter(e =>
    (!dept || e['Department'] === dept) &&
    (!q || [e['Name'], e['EMP ID'], e['Designation']].some(v => String(v || '').toLowerCase().includes(q)))
  );
  renderEmployeeGrid(filtered);
}
document.getElementById('empSearch').addEventListener('input', debounce(filterEmployeeGrid, 200));
document.getElementById('empDeptFilter').addEventListener('change', filterEmployeeGrid);

const empModal = document.getElementById('empModalBackdrop');
document.getElementById('addEmpBtn').addEventListener('click', () => openEmpModal(null));
document.getElementById('empModalCancel').addEventListener('click', () => empModal.classList.add('hidden'));
function openEmpModal(emp) {
  document.getElementById('empModalTitle').textContent = emp ? 'Edit Employee' : 'Add Employee';
  document.getElementById('fEmpId').value = emp ? emp['EMP ID'] : '';
  document.getElementById('fEmpId').disabled = !!emp;
  document.getElementById('fName').value = emp ? emp['Name'] : '';
  document.getElementById('fDesignation').value = emp ? emp['Designation'] : '';
  document.getElementById('fDepartment').value = emp ? emp['Department'] : '';
  document.getElementById('fTeam').value = emp ? emp['Team'] : '';
  document.getElementById('fDoj').value = emp ? emp['D.O.J'] : '';
  document.getElementById('fTimings').value = emp ? emp['Timings'] : '';
  document.getElementById('fSalary').value = emp ? emp['Salary'] : '';
  document.getElementById('fCreateLogin').checked = false;
  document.getElementById('fCreateLogin').closest('.full').style.display = emp ? 'none' : 'block';
  empModal.dataset.mode = emp ? 'edit' : 'add';
  empModal.classList.remove('hidden');
}
document.getElementById('empModalSave').addEventListener('click', async () => {
  const payload = {
    empId: document.getElementById('fEmpId').value.trim(),
    name: document.getElementById('fName').value.trim(),
    designation: document.getElementById('fDesignation').value.trim(),
    department: document.getElementById('fDepartment').value.trim(),
    team: document.getElementById('fTeam').value.trim(),
    doj: document.getElementById('fDoj').value,
    timings: document.getElementById('fTimings').value.trim(),
    salary: document.getElementById('fSalary').value,
    createLogin: document.getElementById('fCreateLogin').checked
  };
  if (!payload.name) { toast('Name is required', 'error'); return; }
  const btn = document.getElementById('empModalSave');
  btn.disabled = true; btn.textContent = 'Saving…';
  try {
    if (empModal.dataset.mode === 'edit') await apiPost('updateEmployee', payload);
    else await apiPost('addEmployee', payload);
    toast('Saved successfully', 'success');
    empModal.classList.add('hidden');
    CACHE.employees = null;
    loadEmployees();
  } catch (e) { toast('Save failed: ' + e.message, 'error'); }
  finally { btn.disabled = false; btn.textContent = 'Save'; }
});

/* =====================================================================
   EMPLOYEE PROFILE
===================================================================== */
async function openProfile(empId) {
  CURRENT_PROFILE_EMP = String(empId);
  Object.values(pageMap).forEach(id => document.getElementById(id).classList.add('hidden'));
  document.getElementById('pageEmployeeProfile').classList.remove('hidden');
  document.querySelectorAll('.nav-item[data-page]').forEach(b => b.classList.toggle('active', b.dataset.page === 'employees'));
  document.querySelectorAll('.tab[data-tab]').forEach(b => b.classList.toggle('active', b.dataset.tab === 'myprofile' && String(empId) === String(SESSION.empId)));

  if (!CACHE.employees) CACHE.employees = await apiGet('employees');
  const emp = CACHE.employees.find(e => String(e['EMP ID']) === CURRENT_PROFILE_EMP);
  if (!emp) { toast('Employee not found', 'error'); return; }

  document.getElementById('profAvatar').style.background = avatarColor(emp['Name']);
  document.getElementById('profAvatar').textContent = initials(emp['Name']);
  document.getElementById('profName').textContent = emp['Name'];
  document.getElementById('profRoleLine').textContent = `${emp['Designation'] || ''} · ${emp['Department'] || ''} · EMP${emp['EMP ID']}`;
  document.getElementById('profJoined').textContent = 'Joined ' + (emp['D.O.J'] || '—');
  document.getElementById('profTenure').textContent = tenureLabel(emp['D.O.J']);
  const editBtn = document.getElementById('profEditBtn');
  if (SESSION.role === 'Admin') {
    editBtn.classList.remove('hidden');
    editBtn.onclick = () => openEmpModal(emp);
  } else {
    editBtn.classList.add('hidden'); // Employee khud apni profile edit nahi kar sakta — sirf Admin kar sakta hai
  }

  document.getElementById('profInfoGrid').innerHTML = [
    ['Employee ID', 'EMP' + emp['EMP ID']], ['Department', emp['Department']], ['Designation', emp['Designation']],
    ['Team', emp['Team']], ['Joining date', emp['D.O.J']], ['Timings', emp['Timings']], ['Salary', money(emp['Salary'])]
  ].map(([lbl,val]) => `<div class="info-item"><div class="lbl">${lbl}</div><div class="val">${esc(val)}</div></div>`).join('');

  const att = await apiGet('attendance', { empId: CURRENT_PROFILE_EMP });
  const thisMonth = todayStr().slice(0,7);
  const monthRows = att.filter(r => String(r['Date']).startsWith(thisMonth));
  const present = monthRows.filter(r => r['Status'] === 'Present').length;
  const absent = monthRows.filter(r => r['Status'] === 'Absent').length;
  const weekend = monthRows.filter(r => r['Status'] === 'Weekend').length;
  const rate = (present+absent) ? Math.round((present / (present+absent)) * 100) : 0;
  document.getElementById('profMiniStats').innerHTML = [
    [present,'Present (Month)'],[absent,'Absent (Month)'],[weekend,'Weekend (Month)'],[rate+'%','Attendance rate']
  ].map(([n,l]) => `<div class="mini-stat"><div class="n">${n}</div><div class="l">${l}</div></div>`).join('');

  const attBody = document.getElementById('profAttendanceBody');
  attBody.innerHTML = att.length ? att.slice().sort((a,b)=>a['Date']<b['Date']?1:-1).map(r => `
    <tr><td>${esc(r['Date'])}</td><td>${formatTime12(r['Punch In'])}</td><td>${formatTime12(r['Punch Out'])}</td><td>${esc(r['Working Hours']||'0')}</td>
    <td><span class="badge ${esc(r['Status'])}">${esc(r['Status'])}</span></td></tr>`).join('')
    : '<tr><td colspan="5" class="empty-mini">No attendance records yet</td></tr>';

  const pay = await apiGet('payroll', { empId: CURRENT_PROFILE_EMP });
  const payBox = document.getElementById('profPayrollBody');
  payBox.innerHTML = pay.length ? pay.map(p => payslipHtml(p)).join('<div style="height:14px;"></div>')
    : '<div class="empty-mini"><div class="ic">💰</div>No payroll records for this employee yet.</div>';
}
function tenureLabel(doj) {
  if (!doj) return '—';
  const d = new Date(doj); if (isNaN(d)) return '—';
  const months = Math.max(0, (Date.now() - d.getTime()) / (1000*60*60*24*30.44));
  const yrs = Math.floor(months/12), mo = Math.round(months%12);
  return yrs ? `${yrs} yr${yrs>1?'s':''} ${mo} mo tenure` : `${mo} mo tenure`;
}
document.getElementById('backToEmployeesBtn').addEventListener('click', () => navigateTo('employees'));
document.querySelectorAll('.profile-tabs button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.profile-tabs button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    ['overview','attendance','payroll'].forEach(t => document.getElementById('ptab' + t[0].toUpperCase()+t.slice(1)).classList.toggle('hidden', t !== btn.dataset.ptab));
  });
});

/* =====================================================================
   ATTENDANCE (full page)
===================================================================== */
async function loadAttendancePage() {
  const body = document.getElementById('attendanceBody');
  if (!CACHE.attendance) {
    body.innerHTML = '<tr><td colspan="7" class="empty-mini">Loading…</td></tr>';
    try { CACHE.attendance = await apiGet('attendance', SESSION.role === 'Admin' ? {} : { empId: SESSION.empId }); }
    catch (e) { body.innerHTML = `<tr><td colspan="7" class="empty-mini">${esc(e.message)}</td></tr>`; return; }
  }
  applyAttendanceFilters();
}
function applyAttendanceFilters() {
  const from = document.getElementById('attFrom').value;
  const to = document.getElementById('attTo').value;
  const q = document.getElementById('attSearch').value.toLowerCase();
  const status = document.getElementById('attStatusFilter').value;
  const rows = (CACHE.attendance || []).filter(r =>
    (!from || r['Date'] >= from) && (!to || r['Date'] <= to) &&
    (!status || r['Status'] === status) &&
    (!q || [r['Employee Name'], r['EMP ID']].some(v => String(v||'').toLowerCase().includes(q)))
  );
  renderAttendanceTable('attendanceBody', rows, false);
}
document.getElementById('attApplyFilters').addEventListener('click', applyAttendanceFilters);
document.getElementById('attSearch').addEventListener('input', debounce(applyAttendanceFilters, 200));

/* =====================================================================
   PAYROLL
===================================================================== */
async function loadPayroll() {
  const body = document.getElementById('payrollBody');
  if (!CACHE.payroll) {
    body.innerHTML = '<tr><td colspan="9" class="empty-mini">Loading…</td></tr>';
    try { CACHE.payroll = await apiGet('payroll', SESSION.role === 'Admin' ? {} : { empId: SESSION.empId }); }
    catch (e) { body.innerHTML = `<tr><td colspan="9" class="empty-mini">${esc(e.message)}</td></tr>`; return; }
  }
  renderPayrollKpis(CACHE.payroll);
  renderPayroll(CACHE.payroll);
}
function renderPayrollKpis(rows) {
  const gross = rows.reduce((s,r) => s + Number(r['Gross Salary']||0), 0);
  const ot = rows.reduce((s,r) => s + Number(r['Overtime Amount']||0), 0);
  const ded = rows.reduce((s,r) => s + Number(r['Deductions']||0), 0);
  const net = rows.reduce((s,r) => s + Number(r['Net Salary']||0), 0);
  const cards = [
    { n: rows.length, l:'Payslips', cls:'' },
    { n: money(gross), l:'Gross payroll', cls:'status-Present' },
    { n: money(ot), l:'Overtime pay', cls:'status-Present' },
    { n: money(ded), l:'Deductions', cls:'status-Absent' },
    { n: money(net), l:'Net payable', cls:'status-Late' }
  ];
  document.getElementById('payrollKpiRow').innerHTML = cards.map(c => `<div class="kpi-card ${c.cls}"><div class="kpi-number">${c.n}</div><div class="kpi-label">${c.l}</div></div>`).join('');
}
function renderPayroll(rows) {
  const body = document.getElementById('payrollBody');
  if (!rows.length) { body.innerHTML = '<tr><td colspan="9" class="empty-mini"><div class="ic">💰</div>No payroll records yet — this sheet is currently empty. Add monthly rows to the Payroll tab to see payslips here.</td></tr>'; return; }
  body.innerHTML = rows.map((r,i) => `
    <tr><td>EMP${esc(r['EMP ID'])}</td><td>${esc(r['Employee Name'])}</td>
    <td>${money(r['Basic Salary'])}</td><td>${money(r['Allowances'])}</td><td>${money(r['Overtime Amount'])}</td>
    <td>${money(r['Deductions'])}</td><td><strong>${money(r['Net Salary'])}</strong></td>
    <td><span class="badge ${r['Status']==='Paid'?'Paid':'Draft'}">${esc(r['Status']||'Draft')}</span></td>
    <td><button class="btn-secondary" onclick="showPayslip(${i})">View payslip</button></td></tr>`).join('');
}
function filterPayroll() {
  const q = document.getElementById('payrollSearch').value.toLowerCase();
  const month = document.getElementById('payrollMonthFilter').value;
  const filtered = (CACHE.payroll || []).filter(r =>
    (!month || String(r['Month']) === month) &&
    (!q || [r['Employee Name'], r['EMP ID']].some(v => String(v||'').toLowerCase().includes(q)))
  );
  renderPayrollKpis(filtered); renderPayroll(filtered);
}
document.getElementById('payrollSearch').addEventListener('input', debounce(filterPayroll, 200));
document.getElementById('payrollMonthFilter').addEventListener('change', filterPayroll);
function payslipHtml(r) {
  const uid = 'payslip_' + String(r['EMP ID']) + '_' + String(r['Month']).replace(/[^A-Za-z0-9]/g, '');
  return `<div class="payslip-card" id="${uid}">
    <div class="payslip-head">
      <img class="payslip-logo" src="assets/logo.png" alt="Simply Connect">
      <div class="ps-title-block"><div class="ps-period">Payslip · ${esc(r['Month'])}</div><h3>${esc(r['Employee Name'])}</h3></div>
      <div class="ps-net"><div class="lbl">Net pay</div><div class="amt">${money(r['Net Salary'])}</div></div>
    </div>
    <div class="payslip-body">
      <div class="ps-col"><h4>Earnings</h4>
        <div class="ps-line"><span>Basic salary</span><span>${money(r['Basic Salary'])}</span></div>
        <div class="ps-line"><span>Allowances</span><span>${money(r['Allowances'])}</span></div>
        <div class="ps-line"><span>Overtime (${esc(r['Overtime Hours']||0)} hrs)</span><span class="pos">+ ${money(r['Overtime Amount'])}</span></div>
        <div class="ps-line total"><span>Gross salary</span><span>${money(r['Gross Salary'])}</span></div>
      </div>
      <div class="ps-col"><h4>Deductions</h4>
        <div class="ps-line"><span>Total deductions</span><span class="neg">− ${money(r['Deductions'])}</span></div>
        <div class="ps-line total"><span>Net salary</span><span>${money(r['Net Salary'])}</span></div>
      </div>
    </div>
    <div class="payslip-footer"><button class="btn-secondary" data-pdf-btn onclick="downloadPayslipPdf('${uid}','${esc(r['Employee Name'])}_${esc(r['Month'])}')">&#11015; Download PDF</button></div>
  </div>`;
}
function downloadPayslipPdf(elId, filenameBase) {
  const el = document.getElementById(elId);
  if (!el) { toast('Payslip element nahi mila', 'error'); return; }
  if (typeof html2pdf === 'undefined') { toast('PDF library load nahi ho saki — internet connection check karein', 'error'); return; }
  const btn = el.querySelector('[data-pdf-btn]');
  if (btn) btn.style.visibility = 'hidden'; // button khud PDF mein nahi aana chahiye
  const filename = String(filenameBase || 'payslip').replace(/\s+/g, '_') + '.pdf';
  html2pdf().set({ margin: 10, filename, html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } })
    .from(el).save()
    .then(() => { if (btn) btn.style.visibility = ''; })
    .catch(() => { if (btn) btn.style.visibility = ''; toast('PDF banane mein masla aaya', 'error'); });
}
function showPayslip(i) {
  const box = document.getElementById('payslipDetail');
  box.innerHTML = payslipHtml(CACHE.payroll[i]);
  box.classList.remove('hidden');
  box.scrollIntoView({ behavior:'smooth', block:'nearest' });
}

/* =====================================================================
   REQUESTS
===================================================================== */
async function loadRequests() {
  const body = document.getElementById('requestsBody');
  if (!CACHE.requests) {
    body.innerHTML = '<tr><td colspan="7" class="empty-mini">Loading…</td></tr>';
    try { CACHE.requests = await apiGet('requests'); }
    catch (e) { body.innerHTML = `<tr><td colspan="7" class="empty-mini">${esc(e.message)}</td></tr>`; return; }
  }
  const rows = SESSION.role === 'Admin' ? CACHE.requests : CACHE.requests.filter(r => String(r['EMP ID']) === String(SESSION.empId));
  renderRequests(rows);
}
function renderRequests(rows) {
  const body = document.getElementById('requestsBody');
  if (!rows.length) { body.innerHTML = '<tr><td colspan="7" class="empty-mini"><div class="ic">📋</div>No leave requests yet</td></tr>'; return; }
  body.innerHTML = rows.map(r => `
    <tr><td>${esc(r['Employee Name'])}</td><td>${esc(r['Leave From'])}</td><td>${esc(r['Leave To'])}</td>
    <td>${esc(r['Leave Type'])}</td><td>${esc(r['Reason'])}</td>
    <td><span class="badge ${esc(r['Status'])}">${esc(r['Status'])}</span></td>
    <td>${SESSION.role === 'Admin' && r['Status'] === 'Pending' ? `
      <div class="row-actions">
        <button class="icon-btn" onclick="actOnRequest(${r['ID']},'Approved')" title="Approve">&#10003;</button>
        <button class="icon-btn" onclick="actOnRequest(${r['ID']},'Rejected')" title="Reject">&#10005;</button>
      </div>` : ''}</td></tr>`).join('');
}
async function actOnRequest(id, status) {
  try {
    await apiPost('updateRequestStatus', { id, status, approvedBy: SESSION.name });
    toast('Request ' + status.toLowerCase(), 'success');
    CACHE.requests = null; loadRequests();
  } catch (e) { toast('Failed: ' + e.message, 'error'); }
}
const reqModal = document.getElementById('reqModalBackdrop');
document.getElementById('addReqBtn').addEventListener('click', () => reqModal.classList.remove('hidden'));
document.getElementById('reqModalCancel').addEventListener('click', () => reqModal.classList.add('hidden'));
document.getElementById('reqModalSave').addEventListener('click', async () => {
  const payload = {
    empId: SESSION.empId, name: SESSION.name,
    from: document.getElementById('rFrom').value, to: document.getElementById('rTo').value,
    type: document.getElementById('rType').value, reason: document.getElementById('rReason').value.trim()
  };
  if (!payload.from || !payload.to) { toast('From/To dates required', 'error'); return; }
  const btn = document.getElementById('reqModalSave');
  btn.disabled = true; btn.textContent = 'Submitting…';
  try {
    await apiPost('addRequest', payload);
    toast('Leave request submitted', 'success');
    reqModal.classList.add('hidden');
    CACHE.requests = null; loadRequests();
  } catch (e) { toast('Failed: ' + e.message, 'error'); }
  finally { btn.disabled = false; btn.textContent = 'Submit'; }
});

/* =====================================================================
   REPORTS (monthly attendance summary per employee)
===================================================================== */
async function loadReports() {
  const body = document.getElementById('reportsBody');
  body.innerHTML = '<tr><td colspan="6" class="empty-mini">Loading…</td></tr>';
  try {
    if (!CACHE.employees) CACHE.employees = await apiGet('employees');
    if (!CACHE.attendance) CACHE.attendance = await apiGet('attendance', SESSION.role === 'Admin' ? {} : { empId: SESSION.empId });
  } catch (e) { body.innerHTML = `<tr><td colspan="6" class="empty-mini">${esc(e.message)}</td></tr>`; return; }
  populateDeptFilters(CACHE.employees);
  document.getElementById('reportsSub').textContent = 'Attendance summary for ' + todayStr().slice(0,7) + ', per employee.';
  renderReports();
}
function renderReports() {
  const q = (document.getElementById('reportSearch').value || '').toLowerCase();
  const dept = document.getElementById('reportDeptFilter').value;
  const thisMonth = todayStr().slice(0,7);
  const monthRows = (CACHE.attendance||[]).filter(r => String(r['Date']).startsWith(thisMonth));
  const emps = (SESSION.role === 'Admin' ? CACHE.employees : CACHE.employees.filter(e=>String(e['EMP ID'])===String(SESSION.empId)))
    .filter(e => (!dept || e['Department']===dept) && (!q || [e['Name'],e['EMP ID']].some(v=>String(v||'').toLowerCase().includes(q))));
  const body = document.getElementById('reportsBody');
  if (!emps.length) { body.innerHTML = '<tr><td colspan="6" class="empty-mini">No employees match</td></tr>'; return; }
  body.innerHTML = emps.map(e => {
    const rows = monthRows.filter(r => String(r['EMP ID']) === String(e['EMP ID']));
    const present = rows.filter(r=>r['Status']==='Present').length;
    const weekend = rows.filter(r=>r['Status']==='Weekend').length;
    const absent = rows.filter(r=>r['Status']==='Absent').length;
    const rate = (present+absent) ? Math.round((present/(present+absent))*100) : 0;
    return `<tr><td>${esc(e['Name'])} (EMP${esc(e['EMP ID'])})</td><td>${esc(e['Department'])}</td><td>${present}</td><td>${weekend}</td><td>${absent}</td><td>${rate}%</td></tr>`;
  }).join('');
}
document.getElementById('reportSearch').addEventListener('input', debounce(renderReports, 200));
document.getElementById('reportDeptFilter').addEventListener('change', renderReports);

/* =====================================================================
   DEVICES
===================================================================== */
async function loadDevices() {
  const body = document.getElementById('devicesBody');
  if (!CACHE.devices) {
    body.innerHTML = '<tr><td colspan="5" class="empty-mini">Loading…</td></tr>';
    try { CACHE.devices = await apiGet('devices'); }
    catch (e) { body.innerHTML = `<tr><td colspan="5" class="empty-mini">${esc(e.message)}</td></tr>`; return; }
  }
  if (!CACHE.devices.length) { body.innerHTML = '<tr><td colspan="5" class="empty-mini"><div class="ic">📡</div>No devices registered yet — add rows to the Devices sheet.</td></tr>'; return; }
  body.innerHTML = CACHE.devices.map(d => `
    <tr><td>${esc(d['Device Name'])}</td><td>${esc(d['Location'])}</td><td>${esc(d['IP Address'])}</td><td>${esc(d['Last Sync'])}</td>
    <td><span class="badge ${d['Online'] ? 'Online' : 'Offline'}">${d['Online'] ? 'Online' : 'Offline'}</span></td></tr>`).join('');
}
