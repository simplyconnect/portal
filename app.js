/* =====================================================================
   CONFIG — Apps Script deploy karne ke baad /exec URL yahan daalein
===================================================================== */
const LOGO_DATA_URI = 'data:image/png;base64,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';

const CONFIG = {
  API_URL: 'https://script.google.com/macros/s/AKfycbzRESiiJcGoxCPdkeNOHMBns4FAq6LLYTxHm_TrvGb_n1lD_Ug_YPe7OlMh8rWyZOJk/exec'
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
const PAYSLIP_REGISTRY = {}; // uid -> payroll row, PDF generate karne ke liye

function payslipHtml(r) {
  const uid = 'payslip_' + String(r['EMP ID']) + '_' + String(r['Month']).replace(/[^A-Za-z0-9]/g, '');
  PAYSLIP_REGISTRY[uid] = r;
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
    <div class="payslip-footer"><button class="btn-secondary" onclick="downloadPayslipPdf('${uid}')">&#11015; Download PDF</button></div>
  </div>`;
}

/**
 * PDF ko seedha jsPDF se "draw" karta hai (koi screenshot/html2canvas nahi) — is liye
 * logo aur layout hamesha sahi, sharp aur consistent aata hai, chahe browser/zoom kuch bhi ho.
 * Format aap ke diye hue "Earning Statement" reference se milta julta hai.
 */
function downloadPayslipPdf(uid) {
  const r = PAYSLIP_REGISTRY[uid];
  if (!r) { toast('Payslip data nahi mila', 'error'); return; }
  if (typeof window.jspdf === 'undefined') { toast('PDF library load nahi ho saki — internet connection check karein', 'error'); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 18;
  let y = 22;

  // Header: logo + company name (left), "Earning Statement" (right)
  try { doc.addImage(LOGO_DATA_URI, 'PNG', margin, y - 9, 16, 13); } catch (e) {}
  doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.setTextColor(30, 42, 56);
  doc.text('Simply Connect', margin + 20, y - 2);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(120, 130, 150);
  doc.text('HR & Payroll', margin + 20, y + 3);

  doc.setFont('helvetica', 'bold'); doc.setFontSize(17); doc.setTextColor(46, 95, 163);
  doc.text('Earning Statement', pageW - margin, y, { align: 'right' });

  y += 12;
  doc.setDrawColor(225, 227, 235); doc.setLineWidth(0.3);
  doc.line(margin, y, pageW - margin, y);
  y += 12;

  // Employee info box
  const boxH = 28;
  doc.setDrawColor(30, 42, 56); doc.setLineWidth(0.4);
  doc.rect(margin, y, 95, boxH);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(20, 22, 28);
  doc.text(String(r['Employee Name'] || ''), margin + 5, y + 9);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor(100, 106, 120);
  doc.text('Employee ID: EMP' + esc0(r['EMP ID']), margin + 5, y + 16);
  doc.text('Pay Period: ' + esc0(r['Month']), margin + 5, y + 22);

  y += boxH + 14;

  // Section header bar
  doc.setFillColor(30, 42, 56);
  doc.rect(margin, y, pageW - margin * 2, 9, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5); doc.setTextColor(255, 255, 255);
  doc.text('Pay Period Earnings — ' + esc0(r['Month']), margin + 3, y + 6.2);
  y += 9 + 10;

  const rows = [
    ['Basic Salary', money(r['Basic Salary'])],
    ['Allowances', money(r['Allowances'])],
    ['Overtime (' + (r['Overtime Hours'] || 0) + ' hrs @ ' + money(r['Overtime Rate'] || 0) + ')', money(r['Overtime Amount'])],
    ['Gross Salary', money(r['Gross Salary'])],
    ['Deductions', '(' + money(r['Deductions']) + ')']
  ];
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10.5); doc.setTextColor(40, 42, 48);
  rows.forEach(([label, amt], i) => {
    if (i === 3) { doc.setFont('helvetica', 'bold'); } else { doc.setFont('helvetica', 'normal'); }
    doc.text(label, margin + 2, y);
    doc.text(String(amt), pageW - margin - 2, y, { align: 'right' });
    y += 8.5;
  });

  y += 3;
  doc.setDrawColor(30, 42, 56); doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y);
  y += 10;

  doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(20, 22, 28);
  doc.text('Take Home Earnings', margin + 2, y);
  doc.setTextColor(219, 158, 0); doc.setFontSize(15);
  doc.text(money(r['Net Salary']), pageW - margin - 2, y, { align: 'right' });

  y += 22;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(160, 164, 175);
  doc.text('Generated by Simply Connect HR Portal on ' + new Date().toLocaleDateString('en-GB'), margin, y);

  const filename = (String(r['Employee Name'] || 'payslip').replace(/\s+/g, '_') + '_' + String(r['Month']).replace(/[^A-Za-z0-9]/g, '')) + '.pdf';
  doc.save(filename);
}
function esc0(v) { return v === undefined || v === null ? '' : String(v); }

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
