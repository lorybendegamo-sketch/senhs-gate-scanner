// ✅ Logout Fix
document.getElementById("attendanceLogoutBtn").onclick = function() {
  document.getElementById("attendancePage").classList.remove("is-visible");
  document.getElementById("loginPage").classList.add("is-visible");
};

// ✅ SCAN QR NOW handler
document.getElementById("scanQrNowBtn").onclick = function() {
  document.getElementById("attendancePage").classList.remove("is-visible");
  document.getElementById("scannerPage").classList.add("is-visible");
};

// ✅ Exit Scanner
document.getElementById("exitScannerBtn").onclick = function() {
  document.getElementById("scannerPage").classList.remove("is-visible");
  document.getElementById("attendancePage").classList.add("is-visible");
};

// ✅ Auto-refresh (Daily ATT, MAM, SYMS, Scanner Page)
setInterval(() => {
  loadAttendanceSummary();
  loadMonthlyAttendance();
  loadSYMS();
}, 5000);

// ✅ Section Attendance quick info (AM A, AM L, PM A, PM L)
function showSectionDetails(section, type) {
  fetch(`/exec?action=getAttendanceDetails&section=${section}&type=${type}`)
    .then(res => res.json())
    .then(data => {
      alert("Section " + section + " - " + type + ":\n" + JSON.stringify(data));
    });
}

// ✅ Placeholder functions (to be linked with AppScript)
function loadAttendanceSummary() { console.log("Refreshing Attendance Summary..."); }
function loadMonthlyAttendance() { console.log("Refreshing Monthly Attendance..."); }
function loadSYMS() { console.log("Refreshing SYMS..."); }


// Immediate refresh after successful QR scan
try {
  loadAttendanceSummary();
} catch (e) {}
