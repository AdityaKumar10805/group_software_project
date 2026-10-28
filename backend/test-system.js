const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting End-to-End System Tests...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName, extra = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${testName} ${extra}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${extra}`);
      failed++;
    }
  }

  // 1. Health
  const health = await request({ host: 'localhost', port: 5001, path: '/api/health', method: 'GET' });
  assert(health.status === 200 && health.body.status === 'ok', 'API Health Check');

  // 2. Admin Login
  const adminLogin = await request(
    {
      host: 'localhost',
      port: 5001,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'admin@smartqr.edu', password: 'admin123' }
  );
  assert(adminLogin.status === 200 && adminLogin.body.token, 'Admin Login Authentication');
  const adminToken = adminLogin.body?.token;

  // 3. Teacher Login
  const teacherLogin = await request(
    {
      host: 'localhost',
      port: 5001,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'priya@smartqr.edu', password: 'teacher123' }
  );
  assert(teacherLogin.status === 200 && teacherLogin.body.token, 'Teacher Login Authentication');
  const teacherToken = teacherLogin.body?.token;

  // 4. Get Current User (/api/auth/me)
  const me = await request({
    host: 'localhost',
    port: 5001,
    path: '/api/auth/me',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(me.status === 200 && me.body.user.role === 'admin', 'Auth Profile Verification');

  // 5. List Students
  const students = await request({
    host: 'localhost',
    port: 5001,
    path: '/api/students?limit=5',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(students.status === 200 && students.body.students.length > 0, 'Students List API', `(${students.body.count} students loaded)`);

  // 6. Verify Student QR
  const verifyStu = await request({
    host: 'localhost',
    port: 5001,
    path: '/api/students/verify/STU2024001',
    method: 'GET',
    headers: { Authorization: `Bearer ${teacherToken}` },
  });
  assert(verifyStu.status === 200 && verifyStu.body.verified === true, 'Student QR Verification (STU2024001)');

  // 7. Get Timetable Slots
  const timetable = await request({
    host: 'localhost',
    port: 5001,
    path: '/api/timetable',
    method: 'GET',
    headers: { Authorization: `Bearer ${teacherToken}` },
  });
  assert(timetable.status === 200 && Array.isArray(timetable.body?.timetable), 'Timetable Retrieval');
  const sampleSlot = timetable.body?.timetable?.[0];

  // 8. Timetable Current Slot API
  const currentSlot = await request({
    host: 'localhost',
    port: 5001,
    path: '/api/timetable/current',
    method: 'GET',
    headers: { Authorization: `Bearer ${teacherToken}` },
  });
  assert(currentSlot.status === 200 && currentSlot.body.currentTime, 'Current Lecture Detection');

  // 9. Clean up any existing attendance for test student today to guarantee idempotency
  const newStudentId = 'STU2024018';
  const existingList = await request({
    host: 'localhost',
    port: 5001,
    path: `/api/attendance?studentId=${newStudentId}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  if (existingList.body?.attendance?.length > 0) {
    for (const rec of existingList.body.attendance) {
      await request({
        host: 'localhost',
        port: 5001,
        path: `/api/attendance/${rec._id}`,
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
    }
  }

  // Record Attendance Scan
  const scanRes = await request(
    {
      host: 'localhost',
      port: 5001,
      path: '/api/attendance/scan',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${teacherToken}`,
      },
    },
    { studentId: newStudentId, timetableSlotId: sampleSlot._id }
  );
  assert(scanRes.status === 201 && scanRes.body.success === true, 'Attendance Scan Execution', `(${scanRes.body?.message || scanRes.status})`);
  const createdRecordId = scanRes.body?.attendance?.id;

  // 10. Duplicate Scan Check
  const duplicateRes = await request(
    {
      host: 'localhost',
      port: 5001,
      path: '/api/attendance/scan',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${teacherToken}`,
      },
    },
    { studentId: newStudentId, timetableSlotId: sampleSlot._id }
  );
  assert(duplicateRes.status === 409 && duplicateRes.body.duplicate === true, 'Duplicate Scan Prevention', `(${duplicateRes.body?.message})`);

  // Clean up created test record
  if (createdRecordId) {
    await request({
      host: 'localhost',
      port: 5001,
      path: `/api/attendance/${createdRecordId}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
  }

  // 11. Reports - Dashboard Stats
  const dashStats = await request({
    host: 'localhost',
    port: 5001,
    path: '/api/reports/dashboard',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(dashStats.status === 200 && dashStats.body.totalStudents > 0, 'Dashboard Analytics API');

  // 12. Reports - Subject Report
  const subReport = await request({
    host: 'localhost',
    port: 5001,
    path: '/api/reports/subject',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(subReport.status === 200 && Array.isArray(subReport.body.report), 'Subject Analytics Report');

  // 13. Reports - Student Report
  const stuReport = await request({
    host: 'localhost',
    port: 5001,
    path: '/api/reports/student',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(stuReport.status === 200 && Array.isArray(stuReport.body.report), 'Student Analytics Report');

  // 14. Attendance List & Filter
  const attList = await request({
    host: 'localhost',
    port: 5001,
    path: '/api/attendance?limit=10',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(attList.status === 200 && Array.isArray(attList.body.attendance), 'Attendance Records List');

  console.log(`\n========================================`);
  console.log(`🎯 Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
