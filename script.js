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

// Immediate refresh after successful QR scan
try {
  loadAttendanceSummary();
} catch (e) {}

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


/* =====================================================
OPEN ADVISER / ADMIN ATTENDANCE
====================================================== */
async function openAttendancePage() {
  // Hide other pages
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

  // Start auto-refresh when opening attendance page
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


// ✅ NEXT button handler (Page 1 → Page 2)
document.getElementById("userNextBtn").onclick = function() {
  const enteredName = document.getElementById("userNameInput").value.trim();

  if (!enteredName) {
    document.getElementById("userMessage").textContent = "Please enter your name.";
    return;
  }

  // Save name (optional)
  userName = enteredName;
  document.getElementById("userMessage").textContent = "";

  // Hide User Page, show Device Page
  document.getElementById("userPage").style.display = "none";
  document.getElementById("devicePage").style.display = "block";
};
