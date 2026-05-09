/* ═══════════════════════════════════════════
   SMART CLINIC i18n — Shared Translation Core
   Default language: Arabic (ar)
   Branding words always in English.
═══════════════════════════════════════════ */
const translations = {
  ar: {
    /* ── PAGE META ── */
    pageTitle_index:  "العيادة الذكية — تسجيل",
    pageTitle_result: "Medical Result — العيادة الذكية",
    pageTitle_admin:  "Admin Dashboard — العيادة الذكية",

    /* ── NOTICE BAR ── */
    noticeText: "يفضل استخدام اللغة الإنجليزية للحصول على أفضل تجربة للنظام",

    /* ── LANG SWITCHER ── */
    langAr: "🇪🇬 العربية",
    langEn: "🇺🇸 English",

    /* ── INDEX ── */
    logoTitle:       "العيادة الذكية",
    logoSub:         "Smart Clinic System",
    queueLoading:    "يتم تحميل بيانات الطابور...",
    queuePeople:     (n) => `${n} شخص في الانتظار حالياً`,
    queueEmpty:      "لا يوجد انتظار — سيتم فحصك مباشرة",
    labelName:       "الاسم الكامل",
    placeholderName: "أدخل اسمك الكامل",
    labelPhone:      "رقم الهاتف",
    labelAge:        "العمر",
    placeholderAge:  "أدخل عمرك",
    btnRegister:     "تسجيل في الطابور",
    btnSending:      "جاري الإرسال",
    btnViewResult:   "عرض النتيجة الطبية",
    successTitle:    "تم التسجيل!",
    successMsg:      "لقد تم إضافتك إلى قائمة الانتظار بنجاح",
    queueLabel:      "ترتيبك في الانتظار",
    btnBack:         "↩ تسجيل مريض آخر",
    errFillAll:      "⚠️ يرجى ملء جميع الحقول بشكل صحيح",
    errName:         "⚠️ يرجى إدخال الاسم الكامل",
    errPhone:        "⚠️ رقم الهاتف يجب أن يكون 11 رقمًا",
    errAge:          "⚠️ العمر يجب أن يكون بين 1 و 120",
    errServer:       "⚠️ لا يمكن الاتصال بالخادم",
    errServerConn:   "❌ فشل الاتصال بالخادم",
    toastSuccess:    "✅ تم التسجيل بنجاح!",
    toastDuplicate:  "❌ المريض مسجل مسبقاً في الطابور",
    transitionText:  "جاري فتح النتائج الطبية...",
    transitionSub:   "يرجى الانتظار لحظة",

    /* ── RESULT PAGE ── */
    backBtn:         "← العودة للتسجيل",
    resultPageTitle: "النتائج الطبية",
    resultPageSub:   "يمكنك إدخال الاسم أو رقم الهاتف أو كليهما",
    labelSearchName: "الاسم الكامل",
    placeholderSName:"أدخل اسمك كما سجلت",
    labelSearchPhone:"رقم الهاتف",
    searchHint:      "يكفي إدخال الاسم أو رقم الهاتف أو كليهما",
    btnSearch:       "🔍 عرض النتيجة",
    btnSearching:    "جاري البحث...",
    toastFound:      "✅ تم العثور على نتيجتك",
    toastNotFound:   "❌ لا توجد نتيجة مطابقة",
    toastEnterOne:   "⚠️ أدخل الاسم أو رقم الهاتف",
    toastConnFail:   "❌ فشل الاتصال بالخادم",
    healthNorm:      "✅ حالة طبيعية",
    healthHigh:      "⚠️ نبض مرتفع",
    healthLow:       "💙 نبض منخفض",
    vitalBpm:        "BPM نبضات/دقيقة",
    vitalTemp:       "درجة الحرارة",
    vitalDuration:   "مدة القياس",
    pillAge:         "سنة",
    nfTitle:         "لا توجد نتيجة مطابقة",
    nfSub:           "تأكد من الاسم ورقم الهاتف الذي سجلت به،\nأو تواصل مع مسؤول العيادة.",

    /* ── ADMIN ── */
    adminLoginTitle: "لوحة التحكم المتقدمة",
    adminLoginSub:   "Smart Clinic Admin — أدخل كلمة المرور للمتابعة",
    loginPlaceholder:"كلمة المرور",
    btnLogin:        "🚀 دخول",
    loginErrWrong:   "❌ كلمة مرور غير صحيحة",
    loginErrEmpty:   "⚠️ أدخل كلمة المرور",
    loginErrConn:    "❌ تعذر الاتصال بالخادم",
    headerTitle:     "لوحة التحكم المتقدمة",
    headerSub:       "Smart Clinic Admin v4.0",
    deviceOnline:    "الجهاز متصل ✓",
    deviceOffline:   "الجهاز غير متصل",
    btnLogout:       "خروج",
    statWaiting:     "في الانتظار",
    statDone:        "تم الفحص",
    statResults:     "النتائج",
    statTotal:       "الإجمالي",
    liveNow:         "على الجهاز الآن",
    noPatientText:   "لا يوجد مريض حالي",
    noPatientSub:    "انتظار استدعاء التالي",
    btnNext:         "⏭️ استدعاء التالي",
    btnEditCur:      "✏️ تعديل بيانات المريض",
    yearLabel:       "سنة",
    queueTitle:      "📋 قائمة الانتظار",
    btnAddPatient:   "+ إضافة مريض",
    queueSearchPh:   "🔍 بحث في الطابور...",
    queueEmpty_:     "لا يوجد مرضى في الانتظار",
    queueNoSearch:   "لا نتائج للبحث",
    skippedLabel:    "تم التخطي",
    resultsTitle:    "🩺 سجل نتائج الفحص",
    btnClearAll:     "🗑️ مسح الكل",
    rSearchPh:       "🔍 بحث بالاسم...",
    allStatuses:     "كل الحالات",
    healthNormOpt:   "✓ طبيعي",
    healthHighOpt:   "↑ مرتفع",
    healthLowOpt:    "↓ منخفض",
    sortNewest:      "الأحدث أولاً",
    sortOldest:      "الأقدم أولاً",
    sortBpmH:        "BPM ↑",
    sortBpmL:        "BPM ↓",
    sortName:        "الاسم",
    thPatient:       "المريض",
    thAge:           "العمر",
    thBpm:           "النبض",
    thTemp:          "الحرارة",
    thHealth:        "الحالة",
    thDuration:      "المدة",
    thDate:          "التاريخ",
    thTime:          "الوقت",
    thNotes:         "ملاحظات",
    thActions:       "إجراءات",
    noResults:       "لا توجد نتائج",
    btnEdit:         "✏️ تعديل",
    btnDel:          "🗑️ حذف",
    resultsCount:    (n) => `${n} نتيجة`,
    /* modals */
    modalEditQueue:  "✏️ تعديل بيانات المريض",
    modalEditCur:    "✏️ تعديل المريض الحالي",
    modalAddPatient: "➕ إضافة مريض يدوياً",
    modalEditResult: "✏️ تعديل نتيجة الفحص",
    modalConfirm:    "تأكيد الحذف",
    modalConfirmMsg: "هل أنت متأكد؟ لا يمكن التراجع.",
    formFullName:    "الاسم الكامل",
    formPhone:       "رقم الهاتف",
    formAge:         "العمر",
    formBpm:         "النبض (BPM)",
    formTemp:        "الحرارة (°C)",
    formHealth:      "الحالة الصحية",
    formNotes:       "ملاحظات طبية",
    formNotesPh:     "أضف ملاحظات طبية...",
    healthNormForm:  "✓ طبيعي (60–100 BPM)",
    healthHighForm:  "↑ مرتفع (أكثر من 100)",
    healthLowForm:   "↓ منخفض (أقل من 60)",
    btnSave:         "💾 حفظ",
    btnSaveEdits:    "💾 حفظ التعديلات",
    btnAddToQueue:   "➕ إضافة للطابور",
    btnCancel:       "إلغاء",
    btnConfirm:      "✓ تأكيد",
    patientNamePh:   "اسم المريض",
    /* toasts admin */
    toastSessionExp: "❌ انتهت الجلسة — أعد تسجيل الدخول",
    toastCalledNext: (n) => `✅ تم استدعاء: ${n}`,
    toastQueueEmpty: "⚠️ الطابور فارغ",
    toastReordered:  "✅ تم إعادة ترتيب الطابور",
    toastReorderFail:"❌ فشل الترتيب",
    toastSkipped:    "⏭ تم تخطي المريض",
    toastError:      "❌ خطأ",
    toastSaved:      (n) => `✅ تم تعديل بيانات ${n}`,
    toastAdded:      (n) => `✅ تم إضافة ${n}`,
    toastDeleted:    "🗑️ تم حذف المريض",
    toastResultSaved:(n) => `✅ تم تعديل نتيجة ${n}`,
    toastResultDel:  "🗑️ تم حذف النتيجة",
    toastAllCleared: "🗑️ تم مسح جميع البيانات",
    toastSaveFail:   "❌ فشل الحفظ",
    toastAddFail:    "❌ فشل الإضافة",
    toastReqName:    "⚠️ الاسم مطلوب",
    toastPhone11:    "⚠️ رقم الهاتف 11 رقم",
    toastAgeRange:   "⚠️ العمر يجب بين 1 و 120",
    confirmDeleteQ:  (n) => `حذف "${n}"؟`,
    confirmDeleteQMsg:"لن يمكن التراجع عن هذا الإجراء",
    confirmDeleteR:  (n) => `حذف نتيجة "${n}"؟`,
    confirmDeleteRMsg:"سيتم حذف نتيجة الفحص نهائياً ولا يمكن التراجع.",
    confirmClearAll: "مسح جميع البيانات؟",
    confirmClearMsg: "سيتم مسح الطابور والمريض الحالي وجميع النتائج. لا يمكن التراجع.",
    healthNormLabel: "✓ طبيعي",
    healthHighLabel: "↑ مرتفع",
    healthLowLabel:  "↓ منخفض",
  },
  en: {
    /* ── PAGE META ── */
    pageTitle_index:  "Smart Clinic — Register",
    pageTitle_result: "Medical Result — Smart Clinic",
    pageTitle_admin:  "Admin Dashboard — Smart Clinic",

    /* ── NOTICE BAR ── */
    noticeText: "يفضل استخدام اللغة الإنجليزية للحصول على أفضل تجربة للنظام",

    /* ── LANG SWITCHER ── */
    langAr: "🇪🇬 العربية",
    langEn: "🇺🇸 English",

    /* ── INDEX ── */
    logoTitle:       "Smart Clinic",
    logoSub:         "Smart Clinic System",
    queueLoading:    "Loading Queue System...",
    queuePeople:     (n) => `${n} person(s) in the Queue System`,
    queueEmpty:      "No waiting — you will be seen immediately",
    labelName:       "Full Name",
    placeholderName: "Enter your full name",
    labelPhone:      "Phone Number",
    labelAge:        "Age",
    placeholderAge:  "Enter your age",
    btnRegister:     "Join Queue System",
    btnSending:      "Sending...",
    btnViewResult:   "View Medical Result",
    successTitle:    "Registered!",
    successMsg:      "You have been successfully added to the Queue System",
    queueLabel:      "Your position in the queue",
    btnBack:         "↩ Register Another Patient",
    errFillAll:      "⚠️ Please fill in all fields correctly",
    errName:         "⚠️ Please enter your full name",
    errPhone:        "⚠️ Phone number must be 11 digits",
    errAge:          "⚠️ Age must be between 1 and 120",
    errServer:       "⚠️ Unable to connect to server",
    errServerConn:   "❌ Failed to connect to server",
    toastSuccess:    "✅ Successfully registered!",
    toastDuplicate:  "❌ Patient already registered in queue",
    transitionText:  "Opening Medical Result...",
    transitionSub:   "Please wait a moment",

    /* ── RESULT PAGE ── */
    backBtn:         "← Back to Registration",
    resultPageTitle: "Medical Result",
    resultPageSub:   "You can enter the name, phone number, or both",
    labelSearchName: "Full Name",
    placeholderSName:"Enter your name as registered",
    labelSearchPhone:"Phone Number",
    searchHint:      "You can enter the name, phone number, or both",
    btnSearch:       "🔍 View Medical Result",
    btnSearching:    "Searching...",
    toastFound:      "✅ Medical Result found",
    toastNotFound:   "❌ No matching result found",
    toastEnterOne:   "⚠️ Enter name or phone number",
    toastConnFail:   "❌ Failed to connect to server",
    healthNorm:      "✅ Normal",
    healthHigh:      "⚠️ High BPM",
    healthLow:       "💙 Low BPM",
    vitalBpm:        "BPM Beats/min",
    vitalTemp:       "Temperature",
    vitalDuration:   "Duration",
    pillAge:         "yrs",
    nfTitle:         "No matching result",
    nfSub:           "Check the name and phone number you registered with,\nor contact the clinic administrator.",

    /* ── ADMIN ── */
    adminLoginTitle: "Admin Dashboard",
    adminLoginSub:   "Smart Clinic Admin — Enter password to continue",
    loginPlaceholder:"Password",
    btnLogin:        "🚀 Login",
    loginErrWrong:   "❌ Wrong password",
    loginErrEmpty:   "⚠️ Enter your password",
    loginErrConn:    "❌ Could not connect to server",
    headerTitle:     "Admin Dashboard",
    headerSub:       "Smart Clinic Admin v4.0",
    deviceOnline:    "Device Online ✓",
    deviceOffline:   "Device Offline",
    btnLogout:       "Logout",
    statWaiting:     "Waiting",
    statDone:        "Examined",
    statResults:     "Results",
    statTotal:       "Total",
    liveNow:         "On device now",
    noPatientText:   "No current patient",
    noPatientSub:    "Waiting for next call",
    btnNext:         "⏭️ Call Next",
    btnEditCur:      "✏️ Edit Patient Data",
    yearLabel:       "yrs",
    queueTitle:      "📋 Queue System",
    btnAddPatient:   "+ Add Patient",
    queueSearchPh:   "🔍 Search queue...",
    queueEmpty_:     "No patients in the queue",
    queueNoSearch:   "No search results",
    skippedLabel:    "Skipped",
    resultsTitle:    "🩺 Medical Result Records",
    btnClearAll:     "🗑️ Clear All",
    rSearchPh:       "🔍 Search by name...",
    allStatuses:     "All Statuses",
    healthNormOpt:   "✓ Normal",
    healthHighOpt:   "↑ High",
    healthLowOpt:    "↓ Low",
    sortNewest:      "Newest First",
    sortOldest:      "Oldest First",
    sortBpmH:        "BPM ↑",
    sortBpmL:        "BPM ↓",
    sortName:        "Name",
    thPatient:       "Patient",
    thAge:           "Age",
    thBpm:           "BPM",
    thTemp:          "Temp",
    thHealth:        "Status",
    thDuration:      "Duration",
    thDate:          "Date",
    thTime:          "Time",
    thNotes:         "Notes",
    thActions:       "Actions",
    noResults:       "No results found",
    btnEdit:         "✏️ Edit",
    btnDel:          "🗑️ Delete",
    resultsCount:    (n) => `${n} result(s)`,
    /* modals */
    modalEditQueue:  "✏️ Edit Patient Data",
    modalEditCur:    "✏️ Edit Current Patient",
    modalAddPatient: "➕ Add Patient Manually",
    modalEditResult: "✏️ Edit Medical Result",
    modalConfirm:    "Confirm Delete",
    modalConfirmMsg: "Are you sure? This cannot be undone.",
    formFullName:    "Full Name",
    formPhone:       "Phone Number",
    formAge:         "Age",
    formBpm:         "BPM",
    formTemp:        "Temperature (°C)",
    formHealth:      "Health Status",
    formNotes:       "Medical Notes",
    formNotesPh:     "Add medical notes...",
    healthNormForm:  "✓ Normal (60–100 BPM)",
    healthHighForm:  "↑ High (above 100)",
    healthLowForm:   "↓ Low (below 60)",
    btnSave:         "💾 Save",
    btnSaveEdits:    "💾 Save Changes",
    btnAddToQueue:   "➕ Add to Queue System",
    btnCancel:       "Cancel",
    btnConfirm:      "✓ Confirm",
    patientNamePh:   "Patient name",
    /* toasts admin */
    toastSessionExp: "❌ Session expired — please log in again",
    toastCalledNext: (n) => `✅ Called: ${n}`,
    toastQueueEmpty: "⚠️ Queue is empty",
    toastReordered:  "✅ Queue reordered",
    toastReorderFail:"❌ Reorder failed",
    toastSkipped:    "⏭ Patient skipped",
    toastError:      "❌ Error",
    toastSaved:      (n) => `✅ Updated data for ${n}`,
    toastAdded:      (n) => `✅ Added ${n}`,
    toastDeleted:    "🗑️ Patient deleted",
    toastResultSaved:(n) => `✅ Updated result for ${n}`,
    toastResultDel:  "🗑️ Result deleted",
    toastAllCleared: "🗑️ All data cleared",
    toastSaveFail:   "❌ Save failed",
    toastAddFail:    "❌ Add failed",
    toastReqName:    "⚠️ Name is required",
    toastPhone11:    "⚠️ Phone must be 11 digits",
    toastAgeRange:   "⚠️ Age must be between 1 and 120",
    confirmDeleteQ:  (n) => `Delete "${n}"?`,
    confirmDeleteQMsg:"This action cannot be undone.",
    confirmDeleteR:  (n) => `Delete result for "${n}"?`,
    confirmDeleteRMsg:"The Medical Result will be permanently deleted.",
    confirmClearAll: "Clear all data?",
    confirmClearMsg: "This will erase the queue, current patient, and all results. Cannot be undone.",
    healthNormLabel: "✓ Normal",
    healthHighLabel: "↑ High",
    healthLowLabel:  "↓ Low",
  }
};

/* ─── i18n engine ─── */
let _lang = localStorage.getItem("sc_lang") || "ar";

function t(key, ...args) {
  const val = (translations[_lang] || translations.ar)[key];
  if (val === undefined) return key;
  return typeof val === "function" ? val(...args) : val;
}

function setLanguage(lang, page) {
  _lang = lang;
  localStorage.setItem("sc_lang", lang);
  const html = document.documentElement;
  html.lang = lang;
  html.dir  = lang === "ar" ? "rtl" : "ltr";
  document.body.style.fontFamily = lang === "ar"
    ? "'Tajawal', sans-serif"
    : "'Tajawal', sans-serif"; // Tajawal supports both
  applyTranslations(page);
  updateNoticeBar(lang);
  updateLangSwitcher(lang);
}

function updateNoticeBar(lang) {
  const bar = document.getElementById("noticeBar");
  if (!bar) return;
  bar.style.display = lang === "ar" ? "" : "none";
}

function updateLangSwitcher(lang) {
  const arBtn = document.getElementById("langBtnAr");
  const enBtn = document.getElementById("langBtnEn");
  if (arBtn) arBtn.classList.toggle("active", lang === "ar");
  if (enBtn) enBtn.classList.toggle("active", lang === "en");
}

function initI18n(page, applyFn) {
  const html = document.documentElement;
  html.lang = _lang;
  html.dir  = _lang === "ar" ? "rtl" : "ltr";
  applyFn(_lang);
  updateNoticeBar(_lang);
  updateLangSwitcher(_lang);
}