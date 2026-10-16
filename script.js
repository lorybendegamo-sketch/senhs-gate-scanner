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



/* =====================================================
RENDER ADVISER / ADMIN ATTENDANCE
===================================================== */
function renderAdviserAttendanceTable(
students
) {
attendanceTableBody.innerHTML = "";
if (
!students ||
students.length === 0
) {
attendanceTableBody.innerHTML =
'<tr>' +
'<td colspan="3" style="text-align:center;">' +
'No students found.' +
'</td>' +
'</tr>';
return;
}
students.forEach(
function(student) {
const row =
document.createElement("tr");
const nameCell =
document.createElement("td");
nameCell.textContent = student.name;
if (/T\/O since|DROPPED since/i.test(String(student.name || ""))) {
row.classList.add("attendance-row-inactive");
}
const amCell =
document.createElement("td");
const pmCell =
document.createElement("td");
/* =====================================
AM BUTTON
===================================== */
const amButton =
document.createElement("button");
amButton.type =
"button";
amButton.textContent =
student.AM === "PRESENT"
? "PRESENT"
: "ABSENT";
amButton.className =
student.AM === "PRESENT"
? "attendance-btn present"
: "attendance-btn absent";
amButton.addEventListener(
"click",
function() {
student.AM =
student.AM === "PRESENT"
? "ABSENT"
: "PRESENT";
amButton.textContent =
student.AM;
amButton.className =
student.AM === "PRESENT"
? "attendance-btn present"
: "attendance-btn absent";
/*
SAVE THIS AS UNSAVED MANUAL EDIT
*/
const lrn =
String(
student.lrn || ""
).trim();
if (lrn) {
if (
!pendingAttendanceEdits[lrn]
) {
pendingAttendanceEdits[lrn] =
{};
}
pendingAttendanceEdits[lrn].AM =
student.AM;
}
attendanceSaved =
false;
updateProceedButtonState();
}
);
/* =====================================
PM BUTTON
===================================== */
const pmButton =
document.createElement("button");
pmButton.type =
"button";
pmButton.textContent =
student.PM === "PRESENT"
? "PRESENT"
: "ABSENT";
pmButton.className =
student.PM === "PRESENT"
? "attendance-btn present"
: "attendance-btn absent";
pmButton.addEventListener(
"click",
function() {
student.PM =
student.PM === "PRESENT"
? "ABSENT"
: "PRESENT";
pmButton.textContent =
student.PM;
pmButton.className =
student.PM === "PRESENT"
? "attendance-btn present"
: "attendance-btn absent";
/*
SAVE THIS AS UNSAVED MANUAL EDIT
*/
const lrn =
String(
student.lrn || ""
).trim();
if (lrn) {
if (
!pendingAttendanceEdits[lrn]
) {
pendingAttendanceEdits[lrn] =
{};
}
pendingAttendanceEdits[lrn].PM =
student.PM;
}
attendanceSaved =
false;
updateProceedButtonState();
}
);
amCell.appendChild(
amButton
);
pmCell.appendChild(
pmButton
);
row.appendChild(
nameCell
);
row.appendChild(
amCell
);
row.appendChild(
pmCell
);
attendanceTableBody.appendChild(
row
);
}
);
}

/* =====================================================
ADMIN SECTION CHANGE
===================================================== */
attendanceSectionSelect.addEventListener(
"change",
async function () {
const selectedSection =
String(
attendanceSectionSelect.value || ""
).trim();
attendanceSection =
selectedSection;
if (!selectedSection) {
attendanceCurrentSection.textContent =
"Section: —";
attendanceTableBody.innerHTML =
"";
attendanceMessage.textContent =
"Select a section.";
proceedAttendanceBtn.disabled =
true;
return;
}
proceedAttendanceBtn.disabled =
false;
attendanceCurrentSection.textContent =
"Section: " +
selectedSection;
attendanceMessage.textContent =
"Loading attendance...";
await loadAdviserAttendance();
}
);

/* =====================================================
SAVE ATTENDANCE
===================================================== */
saveAttendanceBtn.addEventListener(
"click",
async function () {
if (
!attendanceAccessCode ||
!attendanceSection
) {
attendanceMessage.textContent =
"Please select a section.";
return;
}
if (
!attendanceStudents ||
attendanceStudents.length === 0
) {
attendanceMessage.textContent =
"No attendance data to save.";
return;
}
attendanceMessage.textContent =
"Saving attendance...";
saveAttendanceBtn.disabled =
true;
try {
const attendanceData =
JSON.stringify(
attendanceStudents
);
const requestUrl =
APPS_SCRIPT_URL +
"?action=saveAttendance" +
"&accessCode=" +
encodeURIComponent(
attendanceAccessCode
) +
"&requestedSection=" +
encodeURIComponent(
attendanceSection
) +
"&attendanceData=" +
encodeURIComponent(
attendanceData
);
const result =
await jsonpRequest(
requestUrl
);
if (
!result ||
!result.success
) {
throw new Error(
result &&
result.message
? result.message
: "Unable to save attendance."
);
}
attendanceMessage.textContent =
"Attendance saved successfully.";
attendanceSaved = true;
/*
Wala nang unsaved manual changes
dahil successful na ang SAVE.
*/
pendingAttendanceEdits = {};
proceedAttendanceBtn.disabled = false;
} catch (error) {
console.error(
"Save attendance error:",
error
);
attendanceMessage.textContent =
error.message ||
"Unable to save attendance.";
}
saveAttendanceBtn.disabled =
false;
}
);

/* =====================================================
PROCEED ATTENDANCE
===================================================== */
proceedAttendanceBtn.addEventListener(
"click",
async function () {
if (!attendanceSaved) {
attendanceMessage.textContent =
"Please SAVE the attendance first.";
return;
}

if (
!attendanceAccessCode ||
!attendanceSection
) {
attendanceMessage.textContent =
"Please select a section.";
return;
}
attendanceMessage.textContent =
"Saving attendance...";
proceedAttendanceBtn.disabled =
true;
try {
const requestUrl =
APPS_SCRIPT_URL +
"?action=proceedAttendance" +
"&accessCode=" +
encodeURIComponent(
attendanceAccessCode
) +
"&requestedSection=" +
encodeURIComponent(
attendanceSection
) +
"&proceededBy=" +
encodeURIComponent(
userName
);
const result =
await jsonpRequest(
requestUrl
);
if (
!result ||
!result.success
) {
throw new Error(
result &&
result.message
? result.message
: "Unable to proceed attendance."
);
}
attendanceMessage.textContent =
"Attendance proceeded successfully.";
} catch (error) {
console.error(
"Proceed attendance error:",
error
);
attendanceMessage.textContent =
error.message ||
"Unable to proceed attendance.";
proceedAttendanceBtn.disabled =
false;
return;
}
proceedAttendanceBtn.disabled =
false;
}
);

