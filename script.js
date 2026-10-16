// ✅ Logout Fix
document.getElementById("attendanceLogoutBtn").onclick = function() {
  document.getElementById("attendancePage").classList.remove("is-visible");
  document.getElementById("loginPage").classList.add("is-visible");
};

// ✅ NEXT button handler (Page 1 → Page 2)
document.getElementById("userNextBtn").onclick = function() {
  const enteredName = document.getElementById("userNameInput").value.trim();
  if (!enteredName) {
    document.getElementById("userMessage").textContent = "Please enter your name.";
    return;
  }
  userName = enteredName;
  document.getElementById("userMessage").textContent = "";
  document.getElementById("userPage").style.display = "none";
  document.getElementById("devicePage").style.display = "block";
};

// ✅ Continue button (Device Page → Attendance Page)
document.getElementById("continueBtn").onclick = function() {
  const deviceCode = document.getElementById("deviceCode").value.trim();
  if (!deviceCode) {
    document.getElementById("deviceMessage").textContent = "Please enter device code.";
    return;
  }
  document.getElementById("deviceMessage").textContent = "";
  document.getElementById("devicePage").style.display = "none";
  document.getElementById("attendancePage").classList.add("is-visible");
};

// ✅ Toggle show/hide device code
document.getElementById("toggleDeviceCode").onclick = function() {
  const input = document.getElementById("deviceCode");
  input.type = input.type === "password" ? "text" : "password";
};

// ✅ SCAN QR NOW handler
document.getElementById("scanQrNowBtn").onclick = function() {
  document.getElementById("attendancePage").classList.remove("is-visible");
  document.getElementById("scannerPage").classList.add("is-visible");
  startQrScanner();
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

// ✅ Section Attendance quick info
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

// ✅ Attendance Page buttons
document.getElementById("proceedAttendanceBtn").onclick = function() {
  alert("Proceeding with attendance…");
};
document.getElementById("saveAttendanceBtn").onclick = function() {
  alert("Attendance saved!");
};

// ✅ Downloads
document.getElementById("downloadDailyAttBtn").onclick = downloadDailyAttendanceExcel;
document.getElementById("downloadMAMBtn").onclick = downloadMAMExcel;
document.getElementById("downloadSYMSBtn").onclick = downloadSYMSExcel;

// ✅ Auto SMS toggle
document.getElementById("autoSmsToggleBtn").onclick = toggleAutoSmsStatus;

/* =====================================================
OPEN ADVISER / ADMIN ATTENDANCE
====================================================== */
async function openAttendancePage() {
  const mamReportPage = document.getElementById("mamPage");
  const symsReportPage = document.getElementById("smsPage");
  if (mamReportPage) mamReportPage.style.display = "none";
  if (symsReportPage) symsReportPage.style.display = "none";
  if (userPage) userPage.style.setProperty("display", "none", "important");
  if (devicePage) devicePage.style.setProperty("display", "none", "important");
  if (scannerPage) {
    scannerPage.style.setProperty("display", "none", "important");
    scannerPage.classList.remove("is-visible");
  }

  attendancePage.style.setProperty("display", "block", "important");
  attendancePage.classList.add("is-visible");

  attendanceRoleTitle.textContent =
    attendanceRole === "ADMIN" ? "ADMIN ATTENDANCE" : "ADVISER ATTENDANCE";

  updateAutoSmsButtonUI();
  loadAutoSmsStatus();

  if (attendanceRole === "ADMIN") {
    attendanceSectionWrapper.style.display = "block";
    attendanceSectionSelect.value = "";
    attendanceCurrentSection.textContent = "Section: —";
    attendanceTableBody.innerHTML = "";
    attendanceMessage.textContent = "Select a section.";
    proceedAttendanceBtn.disabled = true;
    return;
  }

  startDailyAttAutoRefresh();
}

/* =====================================================
AUTO REFRESH FUNCTIONS
====================================================== */
let dailyAttRefreshTimer = null;
function startDailyAttAutoRefresh() {
  if (dailyAttRefreshTimer) return;
  dailyAttRefreshTimer = setInterval(function () {
    const page = document.getElementById("attendancePage");
    if (!page) return;
    const visible =
      page.classList.contains("is-visible") ||
      window.getComputedStyle(page).display !== "none";
    if (!visible) return;
    if (typeof loadEditableTodayAttendance === "function") {
      loadEditableTodayAttendance();
    } else if (typeof refreshEditableAttendance === "function") {
      refreshEditableAttendance();
    }
  }, 3000);
}
function stopDailyAttAutoRefresh() {
  if (dailyAttRefreshTimer) {
    clearInterval(dailyAttRefreshTimer);
    dailyAttRefreshTimer = null;
  }
}

/* =====================================================
QR SCANNER INITIALIZATION
====================================================== */
function startQrScanner() {
  const html5QrCode = new Html5Qrcode("reader");
  const qrConfig = { fps: 10, qrbox: 250 };
  html5QrCode.start(
    { facingMode: "environment" },
    qrConfig,
    qrCodeMessage => {
      console.log("QR Code detected:", qrCodeMessage);
      try { loadAttendanceSummary(); } catch (e) {}
    },
    errorMessage => { console.warn("QR scan error:", errorMessage); }
  ).catch(err => { console.error("Unable to start QR scanner:", err); });
}

// ✅ MAM Page
document.getElementById("openMAMPageBtn").onclick = function() {
  document.getElementById("attendancePage").classList.remove("is-visible");
  document.getElementById("mamPage").style.display = "block";
};
document.getElementById("mamLogoutBtn").onclick = function() {
  document.getElementById("mamPage").style.display = "none";
  document.getElementById("loginPage").classList.add("is-visible");
};

// ✅ SYMS Page
document.getElementById("openSMSPageBtn").onclick = function() {
  document.getElementById("attendancePage").classList.remove("is-visible");
  document.getElementById("smsPage").style.display = "block";
};
document.getElementById("smsLogoutBtn").onclick = function() {
  document.getElementById("smsPage").style.display = "none";
  document.getElementById("loginPage").classList.add("is-visible");
};
