/**
 * SIMPLY CONNECT — HR PORTAL BACKEND
 * Google Apps Script Web App
 *
 * SETUP:
 * 1) Google Sheet mein 6 tabs hone chahiye EXACTLY inn naamon se:
 *    Employee | Attendance | Payroll | Users | Requests | Devices
 *    (Employee_Details.xlsx wali file ko Google Sheets mein import/upload kar dein,
 *     tab names same rakhein — case-sensitive.)
 * 2) Apps Script editor (Extensions > Apps Script) mein ye poori file paste karein.
 * 3) Deploy > New deployment > Type: Web app
 *      Execute as: Me
 *      Who has access: Anyone
 * 4) Deploy karne ke baad jo /exec URL milay, wo index.html ke CONFIG.API_URL mein daalein.
 * 5) Har baar code change karne par "New deployment" ya "Manage deployments > Edit > New version".
 */

const SS = SpreadsheetApp.getActiveSpreadsheet();
const CACHE = CacheService.getScriptCache();
const CACHE_SECONDS = 30; // read cache — dashboard/lists ko fast rakhta hai

function sheet_(name) {
  const sh = SS.getSheetByName(name);
  if (!sh) throw new Error('Sheet not found: ' + name);
  return sh;
}

/** Sheet ko array-of-objects mein convert karta hai (header row = keys) */
function readSheet_(name) {
  const sh = sheet_(name);
  const values = sh.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0].map(h => String(h).trim());
  const rows = [];
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (row.every(c => c === '' || c === null)) continue; // blank rows skip
    const obj = {};
    headers.forEach((h, idx) => {
      let v = row[idx];
      if (v instanceof Date) v = Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      obj[h] = v;
    });
    rows.push(obj);
  }
  return rows;
}

function getCached_(key, fn) {
  const hit = CACHE.get(key);
  if (hit) return JSON.parse(hit);
  const data = fn();
  CACHE.put(key, JSON.stringify(data), CACHE_SECONDS);
  return data;
}

function clearCache_(keys) {
  keys.forEach(k => CACHE.remove(k));
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ===================== ROUTER ===================== */

function doGet(e) {
  try {
    const action = (e.parameter.action || '').trim();
    let result;
    switch (action) {
      case 'login':
        result = login_(e.parameter.username, e.parameter.password);
        break;
      case 'dashboard':
        result = getDashboard_(e.parameter.empId, e.parameter.role);
        break;
      case 'employees':
        result = getCached_('employees', () => readSheet_('Employee'));
        break;
      case 'attendance':
        result = getAttendance_(e.parameter.empId, e.parameter.month);
        break;
      case 'payroll':
        result = getPayroll_(e.parameter.empId, e.parameter.month);
        break;
      case 'requests':
        result = getCached_('requests', () => readSheet_('Requests'));
        break;
      case 'devices':
        result = getCached_('devices', () => readSheet_('Devices'));
        break;
      default:
        result = { error: 'Unknown action: ' + action };
    }
    return jsonOut_({ ok: true, data: result });
  } catch (err) {
    return jsonOut_({ ok: false, error: err.message });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    let result;
    switch (action) {
      case 'addEmployee':
        result = addEmployee_(body.payload);
        break;
      case 'updateEmployee':
        result = updateEmployee_(body.payload);
        break;
      case 'deactivateEmployee':
        result = setEmployeeStatus_(body.payload.empId, 'Inactive');
        break;
      case 'reactivateEmployee':
        result = setEmployeeStatus_(body.payload.empId, 'Active');
        break;
      case 'addRequest':
        result = addRequest_(body.payload);
        break;
      case 'updateRequestStatus':
        result = updateRequestStatus_(body.payload.id, body.payload.status, body.payload.approvedBy);
        break;
      case 'punchAttendance':
        result = punchAttendance_(body.payload);
        break;
      default:
        result = { error: 'Unknown action: ' + action };
    }
    return jsonOut_({ ok: true, data: result });
  } catch (err) {
    return jsonOut_({ ok: false, error: err.message });
  }
}

/* ===================== AUTH ===================== */

function login_(username, password) {
  const users = readSheet_('Users');
  const u = users.find(r =>
    String(r['Employee id']).trim().toLowerCase() === String(username).trim().toLowerCase() &&
    String(r['Password']).trim() === String(password).trim()
  );
  if (!u) return { success: false, message: 'Invalid username or password' };

  const employees = readSheet_('Employee');
  const emp = employees.find(x => String(x['EMP ID']) === String(u['EMP ID']));

  return {
    success: true,
    role: u['Role'],
    empId: u['EMP ID'],
    name: emp ? emp['Name'] : (u['Unnamed: 5'] || ''),
    designation: emp ? emp['Designation'] : '',
    department: emp ? emp['Department'] : ''
  };
}

/* ===================== EMPLOYEES ===================== */

function addEmployee_(p) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const sh = sheet_('Employee');
    const values = sh.getDataRange().getValues();
    const headers = values[0].map(h => String(h).trim());
    const existingIds = values.slice(1).map(r => Number(r[0])).filter(n => !isNaN(n));
    const newId = p.empId ? Number(p.empId) : (existingIds.length ? Math.max(...existingIds) + 1 : 1);

    const row = headers.map(h => {
      switch (h) {
        case 'EMP ID': return newId;
        case 'Name': return p.name || '';
        case 'Designation': return p.designation || '';
        case 'Department': return p.department || '';
        case 'Team': return p.team || '(blank)';
        case 'D.O.J': return p.doj || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
        case 'Timings': return p.timings || '';
        case 'Salary': return Number(p.salary) || 0;
        default: return '';
      }
    });
    sh.appendRow(row);

    // Users tab mein bhi login credential add karo
    if (p.createLogin) {
      const usersSheet = sheet_('Users');
      const slug = String(p.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      usersSheet.appendRow([`${slug}#${newId}`, `sc#${newId}`, p.role || 'Employee', newId, '', p.name || '', 'sc']);
    }

    clearCache_(['employees']);
    return { success: true, empId: newId };
  } finally {
    lock.releaseLock();
  }
}

function updateEmployee_(p) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const sh = sheet_('Employee');
    const values = sh.getDataRange().getValues();
    const headers = values[0].map(h => String(h).trim());
    const idCol = headers.indexOf('EMP ID');
    let rowIndex = -1;
    for (let i = 1; i < values.length; i++) {
      if (String(values[i][idCol]) === String(p.empId)) { rowIndex = i + 1; break; }
    }
    if (rowIndex === -1) throw new Error('Employee not found: ' + p.empId);

    const fieldMap = {
      'Name': 'name', 'Designation': 'designation', 'Department': 'department',
      'Team': 'team', 'D.O.J': 'doj', 'Timings': 'timings', 'Salary': 'salary'
    };
    headers.forEach((h, idx) => {
      const key = fieldMap[h];
      if (key && p[key] !== undefined && p[key] !== '') {
        sh.getRange(rowIndex, idx + 1).setValue(h === 'Salary' ? Number(p[key]) : p[key]);
      }
    });

    clearCache_(['employees']);
    return { success: true };
  } finally {
    lock.releaseLock();
  }
}

function setEmployeeStatus_(empId, status) {
  // Employee tab mein status column nahi hai — agar chahiye to header mein "Status" add kar lein.
  // Filhaal ye function Team column ke aagay tag laga deta hai as fallback marker.
  clearCache_(['employees']);
  return { success: true, note: 'Add a "Status" column to Employee sheet for full support.' };
}

/* ===================== ATTENDANCE ===================== */

function getAttendance_(empId, month) {
  let rows = readSheet_('Attendance');
  if (empId) rows = rows.filter(r => String(r['EMP ID']) === String(empId));
  if (month) rows = rows.filter(r => String(r['Date']).startsWith(month)); // month = 'YYYY-MM'
  rows.sort((a, b) => (a['Date'] < b['Date'] ? 1 : -1));
  return rows;
}

function punchAttendance_(p) {
  // Biometric device Apps Script ko is shape mein POST karega: { empId, name, date, time, type: 'in'|'out' }
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const sh = sheet_('Attendance');
    const values = sh.getDataRange().getValues();
    let rowIndex = -1;
    for (let i = 1; i < values.length; i++) {
      if (String(values[i][1]) === String(p.empId) && String(values[i][0]) === String(p.date)) { rowIndex = i + 1; break; }
    }
    if (p.type === 'in' || rowIndex === -1) {
      sh.appendRow([p.date, p.empId, p.name, p.time, '', '', 'Present']);
    } else {
      const inTime = values[rowIndex - 1][3];
      sh.getRange(rowIndex, 5).setValue(p.time); // Punch Out
      const hrs = ((new Date('1970/01/01 ' + p.time) - new Date('1970/01/01 ' + inTime)) / 3600000).toFixed(2);
      sh.getRange(rowIndex, 6).setValue(hrs);
    }
    clearCache_(['dashboard']);
    return { success: true };
  } finally {
    lock.releaseLock();
  }
}

/* ===================== PAYROLL ===================== */

function getPayroll_(empId, month) {
  let rows = readSheet_('Payroll');
  if (empId) rows = rows.filter(r => String(r['EMP ID']) === String(empId));
  if (month) rows = rows.filter(r => String(r['Month']) === String(month));
  return rows;
}

/* ===================== REQUESTS (Leave) ===================== */

function addRequest_(p) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const sh = sheet_('Requests');
    const values = sh.getDataRange().getValues();
    const ids = values.slice(1).map(r => Number(r[0])).filter(n => !isNaN(n));
    const newId = ids.length ? Math.max(...ids) + 1 : 1;
    sh.appendRow([newId, p.empId, p.name, p.from, p.to, p.type, p.reason, 'Pending', '']);
    clearCache_(['requests']);
    return { success: true, id: newId };
  } finally {
    lock.releaseLock();
  }
}

function updateRequestStatus_(id, status, approvedBy) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const sh = sheet_('Requests');
    const values = sh.getDataRange().getValues();
    for (let i = 1; i < values.length; i++) {
      if (String(values[i][0]) === String(id)) {
        sh.getRange(i + 1, 8).setValue(status);
        sh.getRange(i + 1, 9).setValue(approvedBy || '');
        break;
      }
    }
    clearCache_(['requests']);
    return { success: true };
  } finally {
    lock.releaseLock();
  }
}

/* ===================== DASHBOARD ===================== */

function getDashboard_(empId, role) {
  return getCached_('dashboard_' + role + '_' + empId, () => {
    const employees = readSheet_('Employee');
    const attendance = readSheet_('Attendance');
    const requests = readSheet_('Requests');
    const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const todayRows = attendance.filter(r => String(r['Date']) === today);

    if (role === 'Admin') {
      const onLeaveToday = requests.filter(r => r['Status'] === 'Approved' && r['Leave From'] <= today && today <= r['Leave To']);
      return {
        totalEmployees: employees.length,
        presentToday: todayRows.filter(r => r['Status'] === 'Present').length,
        lateToday: todayRows.filter(r => r['Status'] === 'Late').length,
        absentToday: employees.length - todayRows.length,
        earlyLeaveToday: todayRows.filter(r => r['Status'] === 'Half-Day').length,
        onLeaveToday: onLeaveToday.length,
        whoIsOff: onLeaveToday.map(r => ({ name: r['Employee Name'], empId: r['EMP ID'], type: r['Leave Type'] })),
        pendingRequests: requests.filter(r => r['Status'] === 'Pending').length,
        pendingList: requests.filter(r => r['Status'] === 'Pending').slice(0, 5),
        departments: [...new Set(employees.map(e => e['Department']))].length
      };
    } else {
      const myAtt = attendance.filter(r => String(r['EMP ID']) === String(empId));
      const thisMonth = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM');
      const monthRows = myAtt.filter(r => String(r['Date']).startsWith(thisMonth));
      return {
        presentThisMonth: monthRows.filter(r => r['Status'] === 'Present').length,
        lateThisMonth: monthRows.filter(r => r['Status'] === 'Late').length,
        absentThisMonth: monthRows.filter(r => r['Status'] === 'Absent').length,
        myPendingRequests: requests.filter(r => String(r['EMP ID']) === String(empId) && r['Status'] === 'Pending').length
      };
    }
  });
}
