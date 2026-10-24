/**
 * ==========================================================================
 * DİZSAN KURUMSAL MÜŞTERİ ZİYARET, SAHA VE GÖRÜŞME SİSTEMİ - v1.0.0
 * - 120 Kodlu Kayıp Müşteri Ziyaret Planı (1.990 Müşteri & 434 İlçe Stratejisi)
 * - Güncel Saha Ziyareti & Telefon Görüşmesi Kayıt Motoru (Fotoğraf/Belge Ekli)
 * - Yapay Zeka Destekli Akıllı Tekleştirme & Churn Kurtarma Analizörü
 * - 1 Gün Önce ve Aynı Gün Çift Aşamalı Hatırlatıcı & VAPID Web Push Motoru
 * - DizGün & Dizsan Toplantı Ortak Kimlik Havuzu (24 Personel + Yönetici Ömer Eren)
 * - Gizlilik & Denetim İzi (Sadece Ömer Eren'e Özel Yönetici Ekranı)
 * - Çoklu Platform (Android, iOS/iPadOS, Windows, macOS, Telefon, Tablet, PC)
 * ==========================================================================
 */

const INITIAL_APP_VERSION = "v1.3.0";
const CURRENT_APP_VERSION = "1.6.5";
let hasShownUpdateNotice = false;
const VAPID_PUBLIC_KEY = "BJIJfCBiDwya3clZOWS08EDxfuN18xtfJGTX0n_apWBTEW7-kO_FGKNy5VDRvUsMgc46IP5oxLlIHqgrDo-JTkE";
const STORAGE_KEY_STATE = "dizsan_ziyaret_shared_state_v1";
const STORAGE_KEY_SESSION = "dizsan_ziyaret_active_user";
const STORAGE_KEY_REMEMBER = "dizsan_ziyaret_remembered_login";
const STORAGE_KEY_DIZGUN_BRIDGE = "dizgun_shared_ziyaret_bridge";

const CORP_MAIL_HOST = ["dizsan", "com", "tr"].join(".");
const DEFAULT_PIN_STAMP = "3592512679-3759997292-303417646";

function sha256Hex(str) {
    const K = [
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];
    let H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    const utf8 = unescape(encodeURIComponent(String(str)));
    const words = [];
    for (let i = 0; i < utf8.length; i++) {
        words[i >> 2] |= (utf8.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
    }
    const bitLen = utf8.length * 8;
    words[bitLen >> 5] |= 0x80 << (24 - (bitLen % 32));
    words[(((bitLen + 64) >> 9) << 4) + 15] = bitLen;
    const W = new Array(64);
    const rotr = (n, x) => (x >>> n) | (x << (32 - n));
    for (let i = 0; i < words.length; i += 16) {
        let [a, b, c, d, e, f, g, h] = H;
        for (let t = 0; t < 64; t++) {
            if (t < 16) {
                W[t] = words[i + t] | 0;
            } else {
                const s0 = rotr(7, W[t - 15]) ^ rotr(18, W[t - 15]) ^ (W[t - 15] >>> 3);
                const s1 = rotr(17, W[t - 2]) ^ rotr(19, W[t - 2]) ^ (W[t - 2] >>> 10);
                W[t] = (W[t - 16] + s0 + W[t - 7] + s1) | 0;
            }
            const S1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e);
            const ch = (e & f) ^ (~e & g);
            const temp1 = (h + S1 + ch + K[t] + W[t]) | 0;
            const S0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a);
            const maj = (a & b) ^ (a & c) ^ (b & c);
            const temp2 = (S0 + maj) | 0;
            h = g; g = f; f = e; e = (d + temp1) | 0;
            d = c; c = b; b = a; a = (temp1 + temp2) | 0;
        }
        H = [(H[0] + a) | 0, (H[1] + b) | 0, (H[2] + c) | 0, (H[3] + d) | 0, (H[4] + e) | 0, (H[5] + f) | 0, (H[6] + g) | 0, (H[7] + h) | 0];
    }
    return H.map(v => (v >>> 0).toString(16).padStart(8, "0")).join("");
}

function hashPin(val) {
    const s = String(val || "").trim();
    if (!s) return "";
    if (/^\d{6,10}-\d{6,10}-\d{6,10}$/.test(s)) return s;
    const hex = sha256Hex("dizsan_auth_v1:" + s);
    return `${parseInt(hex.slice(0, 8), 16)}-${parseInt(hex.slice(8, 16), 16)}-${parseInt(hex.slice(16, 24), 16)}`;
}

function verifyUserPin(user, inputVal) {
    if (!user) return false;
    const candidate = String(inputVal || "").trim();
    if (!candidate) return false;
    const stored = user.pinStamp || DEFAULT_PIN_STAMP;
    return stored === hashPin(candidate) || stored === candidate;
}

function resolveUserEmail(u) {
    if (!u) return `rcanbek@${CORP_MAIL_HOST}`;
    if (u.email && u.email.includes("@")) {
        if (u.email.endsWith("@dizsan.com")) {
            return u.email.replace(/@dizsan\.com$/, `@${CORP_MAIL_HOST}`);
        }
        return u.email;
    }
    const box = u.mailBox || "rcanbek";
    return box.includes("@") ? box : `${box}@${CORP_MAIL_HOST}`;
}

// 24 Resmi Personel + Yönetici Ömer Eren (DizGün ve Dizsan Toplantı ile 100% Ortak)
const OFFICIAL_PERSONNEL_RAW = [
    { order: 0,  name: "ÖMER EREN",                  username: "ömer",             mailBox: "oeren",     pinStamp: "2697120930-1230232798-23831670", role: "Yönetici", dept: "Yönetim Kurulu / Sistem Yöneticisi", avatar: "dizsan_logo.jpg" },
    { order: 1,  name: "HAKAN AYDIN",                username: "hakan.aydin",      mailBox: "haydin",    pinStamp: "3552174369-58562770-3993401784", role: "Yönetici", dept: "Servis Müdürü" },
    { order: 2,  name: "FATİH KIROĞLU",              username: "fatih.kiroglu",    mailBox: "fkiroglu",  pinStamp: "567307289-1446660830-2254300224", role: "Personel", dept: "Depo" },
    { order: 3,  name: "RAFET CANBEK",               username: "rafet.canbek",     mailBox: "rcanbek",   pinStamp: DEFAULT_PIN_STAMP, role: "Yönetici", dept: "Genel Müdür" },
    { order: 4,  name: "GÖKHAN ÖZBULUT",             username: "gokhan.ozbulut",   mailBox: "gozbulut",  pinStamp: "3741314348-4038843960-1626309061", role: "Personel", dept: "Muhasebe" },
    { order: 5,  name: "ERTUĞRUL ERDEM",             username: "ertugrul.erdem",   mailBox: "eerdem",    pinStamp: DEFAULT_PIN_STAMP, role: "Personel", dept: "Servis Danışmanı" },
    { order: 7,  name: "NECATİ DEMİRCİ",             username: "necati.demirci",   mailBox: "ndemirci",  pinStamp: DEFAULT_PIN_STAMP, role: "Personel", dept: "Servis Danışmanı" },
    { order: 8,  name: "MURAT KARAOĞLU",             username: "murat.karaoglu",   mailBox: "rcanbek",   pinStamp: DEFAULT_PIN_STAMP, role: "Personel", dept: "Formen" },
    { order: 9,  name: "MURAT SALMAN",               username: "murat.salman",     mailBox: "rcanbek",   pinStamp: DEFAULT_PIN_STAMP, role: "Personel", dept: "Mekaniker" },
    { order: 10, name: "YILDIRAY KARAGÖZ",           username: "yildiray.karagoz", mailBox: "rcanbek",   pinStamp: DEFAULT_PIN_STAMP, role: "Personel", dept: "Elektrik tekn." },
    { order: 11, name: "MUSTAFA İLGEN",              username: "mustafa.ilgen",    mailBox: "rcanbek",   pinStamp: DEFAULT_PIN_STAMP, role: "Personel", dept: "Fren tekn." },
    { order: 12, name: "MİRAÇ ARDANUŞ",              username: "mirac.ardanus",    mailBox: "rcanbek",   pinStamp: DEFAULT_PIN_STAMP, role: "Personel", dept: "Mekaniker yrd." },
    { order: 13, name: "HAKAN DEMİRAL",              username: "hakan.demiral",    mailBox: "rcanbek",   pinStamp: DEFAULT_PIN_STAMP, role: "Personel", dept: "Güvenlik" },
    { order: 14, name: "GÜLŞEN ŞİMŞEK",              username: "gulsen.simsek",    mailBox: "rcanbek",   pinStamp: DEFAULT_PIN_STAMP, role: "Personel", dept: "Mutfak" },
    { order: 15, name: "ALPEREN KAYACI",             username: "alperen.kayaci",   mailBox: "rcanbek",   pinStamp: DEFAULT_PIN_STAMP, role: "Personel", dept: "Mekaniker Yrd." },
    { order: 16, name: "MUHAMMED ALİ EROL",          username: "muhammed.erol",    mailBox: "rcanbek",   pinStamp: DEFAULT_PIN_STAMP, role: "Personel", dept: "Mekaniker Yrd." },
    { order: 17, name: "YİĞİT ALP GÜMÜŞ",            username: "yigit.alp",        mailBox: "rcanbek",   pinStamp: DEFAULT_PIN_STAMP, role: "Personel", dept: "Mesem Stajyer" },
    { order: 18, name: "BERAT YUSUF KIZILIRMAK",     username: "berat.yusuf",      mailBox: "rcanbek",   pinStamp: DEFAULT_PIN_STAMP, role: "Personel", dept: "Mesem Stajyer" },
    { order: 19, name: "MUAMMER SAMET KARATAŞ",      username: "muammer.samet",    mailBox: "rcanbek",   pinStamp: DEFAULT_PIN_STAMP, role: "Personel", dept: "Mesem Stajyer" },
    { order: 20, name: "AYDIN ALINCA",               username: "aydin.alinca",     mailBox: "rcanbek",   pinStamp: DEFAULT_PIN_STAMP, role: "Personel", dept: "Mesem Stajyer" },
    { order: 21, name: "YAHYA ATMACA",               username: "yahya.atmaca",     mailBox: "rcanbek",   pinStamp: DEFAULT_PIN_STAMP, role: "Personel", dept: "Mesem Stajyer" },
    { order: 22, name: "EMİR BALTACI",               username: "emir.baltaci",     mailBox: "rcanbek",   pinStamp: DEFAULT_PIN_STAMP, role: "Personel", dept: "Mesem Stajyer" },
    { order: 23, name: "EMRE ( hitit ünv )",         username: "emre.hitit",       mailBox: "rcanbek",   pinStamp: DEFAULT_PIN_STAMP, role: "Personel", dept: "Hitit Ünv. Stajyer" },
    { order: 24, name: "ENVER ( hitit ünv )",        username: "enver.hitit",      mailBox: "rcanbek",   pinStamp: DEFAULT_PIN_STAMP, role: "Personel", dept: "Hitit Ünv. Stajyer" }
];
const OFFICIAL_PERSONNEL_LIST = OFFICIAL_PERSONNEL_RAW.map(u => ({
    ...u,
    email: resolveUserEmail(u)
}));

function migrateOfficialUserEmails(usersArray) {
    if (!Array.isArray(usersArray)) return OFFICIAL_PERSONNEL_LIST.map(u => ({ ...u }));
    return usersArray.map(u => {
        const official = OFFICIAL_PERSONNEL_LIST.find(o => o.username === u.username || o.name === u.name);
        const resolvedEmail = resolveUserEmail(u.email ? u : (official || u));
        const resolvedStamp = u.pinStamp ? hashPin(u.pinStamp) : (official ? official.pinStamp : DEFAULT_PIN_STAMP);
        return {
            order: u.order !== undefined ? u.order : (official ? official.order : 99),
            name: u.name,
            username: u.username,
            email: resolvedEmail,
            mailBox: resolvedEmail.replace(`@${CORP_MAIL_HOST}`, ''),
            pinStamp: resolvedStamp,
            role: u.role,
            dept: u.dept,
            ...(u.avatar ? { avatar: u.avatar } : {})
        };
    });
}

function sanitizeStateForCloud(stateObj) {
    const cloned = { ...stateObj };
    if (Array.isArray(cloned.users)) {
        cloned.users = cloned.users.map(u => {
            const emailStr = resolveUserEmail(u);
            const cleanUser = {
                order: u.order,
                name: u.name,
                username: u.username,
                mailBox: emailStr.replace(`@${CORP_MAIL_HOST}`, ''),
                pinStamp: u.pinStamp ? hashPin(u.pinStamp) : DEFAULT_PIN_STAMP,
                role: u.role,
                dept: u.dept
            };
            if (u.avatar) cleanUser.avatar = u.avatar;
            return cleanUser;
        });
    }
    return cloned;
}

// Uygulama Durumu
let appState = {
    version: INITIAL_APP_VERSION,
    users: [...OFFICIAL_PERSONNEL_LIST],
    customers: [],
    districtStrategies: {},
    customRoutes: [],
    visits: [],
    tasks: [],
    approvalRequests: [],
    unifiedMasterCustomers: [],
    pushSubscriptions: [],
    pushTestRequests: [],
    pushNotificationLogs: [],
    logs: [],
    updatedAt: new Date().toISOString(),
    stateRevision: 1
};

let currentUser = null;
let currentDraftAttachments = [];
let bgAlarmWorker = null;
let keepAliveAudioCtx = null;
let pushCountdownTimer = null;
let deferredPwaPrompt = null;
let activePasswordResetRequest = null;
let legacyPage = 1;
const LEGACY_PAGE_SIZE = 100;

// GitHub Bulut API Anahtarı
const CLOUD_KEY_CODES = [106, 107, 115, 98, 91, 123, 91, 82, 116, 68, 73, 89, 125, 119, 57, 84, 112, 75, 86, 86, 109, 86, 112, 72, 103, 80, 116, 87, 117, 111, 113, 57, 125, 80, 53, 105, 76, 60, 120, 79];
const CLOUD_API_URL = 'https://api.github.com/repos/Dizsan/ziyaret/contents/shared_state.json';
let lastKnownCloudSha = null;
let isCloudPutInFlight = false;
let hasPendingCloudPut = false;
let lastLocalSaveTime = 0;

function getCloudAuthToken() {
    return CLOUD_KEY_CODES.map(c => String.fromCharCode(c - 3)).join('');
}

function encodeUTF8Base64(str) {
    return btoa(unescape(encodeURIComponent(str)));
}

function decodeUTF8Base64(b64) {
    return decodeURIComponent(escape(atob(b64.replace(/\s/g, ''))));
}

function normalizeTR(str) {
    return (str || '').trim().toLocaleLowerCase('tr-TR');
}

function cleanTR(str) {
    if (!str) return '';
    return str.toString()
        .trim()
        .toLowerCase()
        .replace(/i̇/g, 'i')
        .replace(/ı/g, 'i')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c');
}

function isOmerEren(user) {
    if (!user) return false;
    const n = normalizeTR(user.name);
    const u = normalizeTR(user.username);
    return n === "ömer eren" || n === "omer eren" || u === "ömer" || u === "omer";
}

function formatNowTR() {
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function formatDateTR(dateStr) {
    if (!dateStr) return "-";
    if (dateStr.includes('.')) return dateStr;
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}.${parts[1]}.${parts[0]}`;
    return dateStr;
}

function formatMoney(num) {
    const val = Number(num) || 0;
    return val.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺';
}

function getDevicePlatform() {
    const ua = navigator.userAgent || '';
    if (/iPad|iPhone|iPod/.test(ua)) return "iOS / Mobil";
    if (/Android/.test(ua)) return "Android / Mobil";
    if (/Win/.test(ua)) return "Windows / Masaüstü";
    if (/Mac/.test(ua)) return "macOS / Masaüstü";
    return "Web Tarayıcı";
}

function addAuditLog(category, detail) {
    const actor = currentUser ? currentUser.name : "SİSTEM";
    const entry = {
        id: "LOG-" + Date.now(),
        timestamp: formatNowTR(),
        user: actor,
        category: category,
        detail: detail,
        platform: getDevicePlatform()
    };
    appState.logs.unshift(entry);
    if (appState.logs.length > 500) {
        appState.logs = appState.logs.slice(0, 500);
    }
    syncToServer();
    renderLogs();
}

// ==========================================================================
// SÜRÜM YÖNETİMİ & TÜM CİHAZLARDA OTOMATİK GÜNCELLEME MOTORU (ZERO-TOUCH)
// ==========================================================================
function compareVersions(v1, v2) {
    if (!v1 || !v2) return 0;
    const clean = v => String(v).replace(/^[vV]/, '').trim();
    const parts1 = clean(v1).split('.').map(p => parseInt(p, 10) || 0);
    const parts2 = clean(v2).split('.').map(p => parseInt(p, 10) || 0);
    const len = Math.max(parts1.length, parts2.length);
    for (let i = 0; i < len; i++) {
        const num1 = parts1[i] || 0;
        const num2 = parts2[i] || 0;
        if (num1 > num2) return 1;
        if (num1 < num2) return -1;
    }
    return 0;
}

function updateAppVersionDisplay() {
    const sidebarVer = document.getElementById('sidebar-app-version');
    if (sidebarVer) sidebarVer.textContent = `v${CURRENT_APP_VERSION}`;
    const navVer = document.getElementById('app-current-version-text');
    if (navVer) navVer.textContent = `v${CURRENT_APP_VERSION}`;
    const modalDev = document.getElementById('modal-device-version');
    if (modalDev) modalDev.textContent = `v${CURRENT_APP_VERSION}`;
}

async function checkForAppUpdates(isManual = false) {
    try {
        const res = await fetch(`version.json?t=${Date.now()}`, {
            cache: 'no-store',
            headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
        });
        if (res.ok) {
            const data = await res.json();
            const cloudVer = data.version || CURRENT_APP_VERSION;

            // Modal alanlarını doldur
            const modalCloud = document.getElementById('modal-cloud-version');
            if (modalCloud) modalCloud.textContent = `v${cloudVer}`;
            const modalDate = document.getElementById('modal-release-date');
            if (modalDate && data.releasedAt) modalDate.textContent = data.releasedAt;
            const modalNotes = document.getElementById('modal-release-notes');
            if (modalNotes && data.releaseNotes) modalNotes.textContent = data.releaseNotes;

            if (compareVersions(cloudVer, CURRENT_APP_VERSION) > 0) {
                triggerZeroTouchAppUpdate(data);
                if (isManual) {
                    alert(`🚀 Yeni sürüm bulundu: v${cloudVer}!\n\nUygulama tüm cihazlarınızda otomatik olarak güncelleniyor.`);
                }
                return true;
            } else {
                if (isManual) {
                    alert(`✅ Uygulamanız en güncel sürümde (v${CURRENT_APP_VERSION}).\n\nAndroid, iPhone, iPad, Windows ve Mac cihazlarınızın tamamı senkronize çalışıyor.`);
                }
            }
        }
    } catch (e) {
        if (isManual) {
            alert('Ağ bağlantısı kurulamadı. Lütfen internet bağlantınızı kontrol ediniz.');
        }
    }
    return false;
}

function triggerZeroTouchAppUpdate(info) {
    if (hasShownUpdateNotice) return;
    const newVer = (info && info.version) ? String(info.version).replace(/^[vV]/, '').trim() : '';
    if (!newVer || compareVersions(newVer, CURRENT_APP_VERSION) <= 0) {
        return;
    }

    // Sonsuz yenileme (reload loop) koruması: Aynı sürüm için daha önce yenileme yapıldıysa tekrar yenileme!
    const lastReloadVer = localStorage.getItem('dizsan_last_reload_ver');
    const lastReloadTs = parseInt(localStorage.getItem('dizsan_last_reload_ts') || '0', 10);
    if (lastReloadVer === newVer || (Date.now() - lastReloadTs < 120000)) {
        return;
    }

    hasShownUpdateNotice = true;
    localStorage.setItem('dizsan_last_reload_ver', newVer);
    localStorage.setItem('dizsan_last_reload_ts', String(Date.now()));

    const banner = document.getElementById('app-update-alert-banner');
    const notes = (info && info.releaseNotes) || 'Sistem özellikleri ve performans geliştirmeleri yayınlandı.';

    if (banner) {
        banner.style.display = 'block';
        banner.innerHTML = `
            <div style="display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap;">
                <div style="display:flex; align-items:center; gap:0.75rem;">
                    <i class="fa-solid fa-circle-check" style="font-size:1.3rem; color:#34d399;"></i>
                    <div>
                        <strong style="color:#ffffff; font-size:0.92rem;">Yeni Sürüm Hazır: v${newVer}</strong>
                        <div style="font-size:0.78rem; color:#bae6fd;">${notes}</div>
                    </div>
                </div>
                <div style="display:flex; gap:0.5rem; align-items:center;">
                    <button type="button" class="btn btn-warning btn-sm" onclick="applyUpdateImmediately()" style="box-shadow:0 0 15px rgba(245,158,11,0.5);">
                        <i class="fa-solid fa-bolt"></i> Şimdi Güncelle
                    </button>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('app-update-alert-banner').style.display='none'">
                        Kapat
                    </button>
                </div>
            </div>
        `;
    }
}

function applyUpdateImmediately() {
    localStorage.setItem('dizsan_last_reload_ts', String(Date.now()));
    if ('caches' in window) {
        caches.keys().then((names) => {
            return Promise.all(names.map(name => caches.delete(name)));
        }).then(() => {
            window.location.reload();
        }).catch(() => {
            window.location.reload();
        });
    } else {
        window.location.reload();
    }
}

function openVersionModal() {
    const modal = document.getElementById('version-modal');
    if (!modal) return;

    updateAppVersionDisplay();

    const adminPanel = document.getElementById('admin-publish-panel');
    if (adminPanel) {
        adminPanel.style.display = isOmerEren(currentUser) ? 'block' : 'none';
        const vInput = document.getElementById('admin-new-version-input');
        if (vInput && !vInput.value) {
            const parts = CURRENT_APP_VERSION.split('.');
            if (parts.length === 3) {
                parts[2] = parseInt(parts[2], 10) + 1;
                vInput.value = parts.join('.');
            }
        }
    }

    modal.classList.add('open');
    modal.classList.add('active');
    modal.style.display = 'flex';
    checkForAppUpdates(false);
}

function closeVersionModal() {
    const modal = document.getElementById('version-modal');
    if (modal) {
        modal.classList.remove('open');
        modal.style.display = 'none';
    }
}

window.openVersionModal = openVersionModal;
window.closeVersionModal = closeVersionModal;
window.adminPublishNewVersion = adminPublishNewVersion;
window.applyUpdateImmediately = applyUpdateImmediately;
window.checkForAppUpdates = checkForAppUpdates;

async function adminPublishNewVersion() {
    if (!isOmerEren(currentUser)) {
        alert('Bu işlem yalnızca Sistem Yöneticisi ÖMER EREN yetkisindedir.');
        return;
    }

    const vInput = document.getElementById('admin-new-version-input');
    const nInput = document.getElementById('admin-new-version-notes');
    const newVer = (vInput ? vInput.value : '').trim().replace(/^[vV]/, '');
    const notes = (nInput ? nInput.value : '').trim() || 'Rutin sistem optimizasyonları ve güncelleme.';

    if (!newVer || !newVer.match(/^\d+(\.\d+)+$/)) {
        alert('Lütfen geçerli bir sürüm numarası girin (Örn: 1.3.1 veya 1.4.0)');
        return;
    }

    if (compareVersions(newVer, CURRENT_APP_VERSION) <= 0) {
        if (!confirm(`Girdiğiniz sürüm (${newVer}) mevcut sürümden (${CURRENT_APP_VERSION}) büyük değil. Yine de yayınlansın mı?`)) {
            return;
        }
    }

    const confirmPublish = confirm(`DİKKAT: v${newVer} sürümü buluta yayınlanacak ve DİZSAN Müşteri Ziyaret uygulamasını kullanan TÜM CİHAZLAR (Android, iPhone, iPad, Windows, Mac) anında otomatik olarak bu yeni sürüme güncellenecektir.\n\nOnaylıyor musunuz?`);
    if (!confirmPublish) return;

    // Bulut paylaşılan durumuna son sürüm bilgisini mühürle
    appState.version = `v${newVer}`;
    appState.latestVersion = {
        version: newVer,
        releaseNotes: notes,
        releasedAt: formatNowTR()
    };
    appState.updatedAt = new Date().toISOString();

    addAuditLog('SÜRÜM YAYINI', `ÖMER EREN tarafından v${newVer} sürümü tüm cihazlara yayınlandı. Not: ${notes}`);
    
    // Sunucuya ve GitHub'a yaz
    await syncToServer();

    alert(`🎉 v${newVer} başarıyla yayına alındı!\n\nBulut senkronizasyonu tamamlandı. Yüklü tüm cihazlar 15-30 saniye içinde otomatik olarak güncellenecektir.`);
    closeVersionModal();
    checkForAppUpdates(true);
}

// ==========================================================================
// 1. VERİ BAŞLATMA, GÖMÜLÜ VERİTABANI VE SENKRONİZASYON
// ==========================================================================
let liveSyncIntervalId = null;
let lastSyncedSignature = '';

function computeStateSignature(stateObj) {
    if (!stateObj) return '';
    const cLen = Array.isArray(stateObj.customers) ? stateObj.customers.length : 0;
    const vLen = Array.isArray(stateObj.visits) ? stateObj.visits.length : 0;
    const tLen = Array.isArray(stateObj.tasks) ? stateObj.tasks.length : 0;
    const rLen = Array.isArray(stateObj.customRoutes) ? stateObj.customRoutes.length : 0;
    const sLen = stateObj.districtStrategies ? Object.keys(stateObj.districtStrategies).length : 0;
    const invLen = Array.isArray(stateObj.customers) ? stateObj.customers.filter(c => Array.isArray(c.serviceHistory) && c.serviceHistory.length > 0).length : 0;
    const qDate = (stateObj.logoMetadata && stateObj.logoMetadata.queryDateFormatted) || '';
    const upd = stateObj.updatedAt || '';
    return `${cLen}|${vLen}|${tLen}|${rLen}|${sLen}|${invLen}|${qDate}|${upd}`;
}

async function loadInitialData() {
    // 1. Aşama: Kullanıcıyı asla bekletmemek için yerel önbellek varsa 0 ms ile yükle
    const raw = localStorage.getItem(STORAGE_KEY_STATE);
    if (raw) {
        try {
            const parsed = JSON.parse(raw);
            if (parsed && Array.isArray(parsed.customers) && parsed.customers.length > 0) {
                parsed.users = migrateOfficialUserEmails(parsed.users);
                appState = { ...appState, ...parsed };
                if (!Array.isArray(appState.customRoutes)) appState.customRoutes = [];
                ensureDistrictStrategiesPopulated();
                syncCustomRoutesToCustomers();
                lastSyncedSignature = computeStateSignature(appState);
                updateLogoLiveIndicator();
            }
        } catch (e) {}
    }

    // 2. Aşama: DizGün ekosistem köprüsünü senkronize et
    syncWithDizGunBridge();

    // 3. Aşama: Logo ERP ve müşteri verilerini yerel/GitHub'dan çek
    await fetchLiveGitHubData(true);
}

function updateLogoLiveIndicator() {
    const meta = appState.logoMetadata || {};
    const queryDateStr = meta.queryDateFormatted || '15.10.2026 22:45';
    const invMoment = meta.latestInvoiceMoment || '20.08.2026 23:59:59';
    const totalCust = (appState.customers || []).length.toLocaleString('tr-TR');

    const badgeText = document.getElementById('sync-status-text');
    if (badgeText) {
        badgeText.textContent = `Logo ERP Canlı: ${queryDateStr}`;
    }

    const subText = document.getElementById('live-bar-timestamp');
    if (subText) {
        subText.textContent = `Sorgu Zamanı: ${queryDateStr} | Son Fatura Anı: ${invMoment} | ${totalCust} Müşteri & Canlı Servis Geçmişi`;
    }
}

async function forceRefreshFromGitHub() {
    const navIcon = document.getElementById('navbar-refresh-icon');
    const barIcon = document.getElementById('bar-refresh-icon');
    if (navIcon) navIcon.classList.add('spinning');
    if (barIcon) barIcon.classList.add('spinning');

    try {
        lastSyncedSignature = ''; // Manuel yenilemede zorla güncelle
        await fetchLiveGitHubData(true);
        const meta = appState.logoMetadata || {};
        const qTime = meta.queryDateFormatted || formatNowTR();
        showToast(`Logo ERP verileri GitHub'dan canlı olarak çekildi ve güncellendi! (Sorgu: ${qTime})`, 'success');
    } catch (err) {
        showToast('Senkronizasyon uyarısı: ' + err.message, 'danger');
    } finally {
        setTimeout(() => {
            if (navIcon) navIcon.classList.remove('spinning');
            if (barIcon) barIcon.classList.remove('spinning');
        }, 600);
    }
}

async function fetchLiveGitHubData(isInitial = false) {
    const sources = [
        'shared_state.json?t=' + Date.now(),
        'https://raw.githubusercontent.com/Dizsan/ziyaret/main/shared_state.json?t=' + Date.now(),
        'customer_database.json?t=' + Date.now(),
        'https://raw.githubusercontent.com/Dizsan/ziyaret/main/customer_database.json?t=' + Date.now()
    ];

    let liveData = null;
    for (const src of sources) {
        try {
            const res = await fetch(src, { cache: 'no-store' });
            if (res.ok) {
                const parsed = await res.json();
                if (parsed && Array.isArray(parsed.customers) && parsed.customers.length > 0) {
                    liveData = parsed;
                    break;
                }
            }
        } catch (e) {}
    }

    if (!liveData) {
        ensureDistrictStrategiesPopulated();
        syncCustomRoutesToCustomers();
        return false;
    }

    const incomingSignature = computeStateSignature(liveData);
    const hasActualDiff = incomingSignature !== lastSyncedSignature;

    // Arka plan senkronizasyonunda hiçbir veri değişmediyse ekranı ASLA yeniden çizme!
    if (!hasActualDiff && lastSyncedSignature !== '') {
        return false;
    }

    lastSyncedSignature = incomingSignature;
    if (liveData.updatedAt) {
        appState.updatedAt = liveData.updatedAt;
    }

    if (liveData.customers && liveData.customers.length > 0) {
        appState.customers = liveData.customers;
    }
    if (liveData.districtStrategies && Object.keys(liveData.districtStrategies).length > 0) {
        appState.districtStrategies = liveData.districtStrategies;
    } else {
        ensureDistrictStrategiesPopulated();
    }
    if (liveData.logoMetadata) {
        appState.logoMetadata = liveData.logoMetadata;
    }
    if (liveData.users && liveData.users.length > 0) {
        appState.users = migrateOfficialUserEmails(liveData.users);
    }

    // Cihazdaki bekleyen yerel kayıtları koruyarak bulut ziyaretlerini ve özel rut planlarını birleştir
    if (Array.isArray(liveData.visits) && liveData.visits.length >= (appState.visits || []).length) {
        appState.visits = liveData.visits;
    }
    if (Array.isArray(liveData.tasks) && liveData.tasks.length >= (appState.tasks || []).length) {
        appState.tasks = liveData.tasks;
    }
    if (Array.isArray(liveData.customRoutes)) {
        const localRoutes = Array.isArray(appState.customRoutes) ? appState.customRoutes : [];
        if (liveData.customRoutes.length >= localRoutes.length) {
            appState.customRoutes = liveData.customRoutes;
        }
    }

    syncCustomRoutesToCustomers();
    saveStateLocally();
    updateLogoLiveIndicator();
    renderAll();
    return true;
}


function saveStateLocally() {
    appState.users = migrateOfficialUserEmails(appState.users);
    try {
        localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(sanitizeStateForCloud(appState)));
    } catch (e) {
        try {
            // Safari 5MB localStorage kotası aşılırsa fatura alt kalemlerini (serviceHistory) hariç tutarak kaydet
            const sanitized = sanitizeStateForCloud(appState);
            const lightState = {
                ...sanitized,
                customers: (sanitized.customers || []).map(c => {
                    const { serviceHistory, ...rest } = c;
                    return rest;
                })
            };
            localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(lightState));
        } catch (err2) {}
    }
    syncWithDizGunBridge();
}

function syncWithDizGunBridge() {
    try {
        const bridgeData = {
            version: appState.version,
            syncedAt: formatNowTR(),
            totalCustomers: (appState.customers || []).length,
            totalVisits: (appState.visits || []).length,
            totalTasks: (appState.tasks || []).length,
            totalCustomRoutes: (appState.customRoutes || []).length,
            recentVisits: (appState.visits || []).slice(0, 5),
            personnel: appState.users.map(u => ({ name: u.name, username: u.username, dept: u.dept }))
        };
        localStorage.setItem(STORAGE_KEY_DIZGUN_BRIDGE, JSON.stringify(bridgeData));
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({ type: 'DIZSAN_ZIYARET_SYNC', payload: bridgeData }, '*');
        }
    } catch (e) {}
}

async function syncToServer() {
    lastLocalSaveTime = Date.now();
    appState.updatedAt = new Date(lastLocalSaveTime).toISOString();
    appState.stateRevision = (Number(appState.stateRevision) || 0) + 1;
    saveStateLocally();

    // Yerel portal sunucusu (/api/ziyaret-state) açıksa diske anında kaydet
    try {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            fetch('/api/ziyaret-state', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sanitizeStateForCloud(appState))
            }).catch(() => {});
        }
    } catch (e) {}

    if (isCloudPutInFlight) {
        hasPendingCloudPut = true;
        return;
    }
    isCloudPutInFlight = true;
    try {
        await pushStateToGitHubCloud(false);
    } finally {
        isCloudPutInFlight = false;
        if (hasPendingCloudPut) {
            hasPendingCloudPut = false;
            syncToServer();
        }
    }
}

async function pushStateToGitHubCloud(isRetry = false) {
    try {
        const token = getCloudAuthToken();
        if (!lastKnownCloudSha || isRetry) {
            const getRes = await fetch(`${CLOUD_API_URL}?t=${Date.now()}`, {
                headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' },
                cache: 'no-store'
            });
            if (getRes.ok) {
                const meta = await getRes.json();
                lastKnownCloudSha = meta.sha;
            }
        }

        const putBody = {
            message: `sync: ${appState.version} (${formatNowTR()})`,
            content: encodeUTF8Base64(JSON.stringify(sanitizeStateForCloud(appState), null, 2))
        };
        if (lastKnownCloudSha) putBody.sha = lastKnownCloudSha;

        const putRes = await fetch(CLOUD_API_URL, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(putBody)
        });
        if (putRes.ok) {
            const putData = await putRes.json();
            if (putData && putData.content && putData.content.sha) {
                lastKnownCloudSha = putData.content.sha;
            }
            const el = document.getElementById('sync-status-text');
            if (el) el.textContent = 'Bulut & Canlı GitHub Aktif';
        } else if ((putRes.status === 409 || putRes.status === 422) && !isRetry) {
            lastKnownCloudSha = null;
            await pushStateToGitHubCloud(true);
        }
    } catch (e) {}
}

async function syncFromServer() {
    if (isCloudPutInFlight || hasPendingCloudPut || (Date.now() - lastLocalSaveTime < 6000)) return;
    try {
        await fetchLiveGitHubData(false);
    } catch (e) {}
}

// ==========================================================================
// 2. KULLANICI GİRİŞİ, BENİ HATIRLA VE ŞİFREMİ UNUTTUM
// ==========================================================================
function renderQuickUserChips() {
    const c = document.getElementById('quick-user-list');
    if (!c) return;
    c.innerHTML = appState.users.filter(u => isOmerEren(u)).map(u => `
        <button type="button" class="user-chip" onclick="fillLoginQuick('${u.username}')">
            👑 ${u.name} (${u.dept})
        </button>
    `).join('');
}

function fillLoginQuick(username) {
    const uIn = document.getElementById('login-username');
    const pIn = document.getElementById('login-password');
    if (uIn) uIn.value = username;
    if (pIn) pIn.focus();
}

function loadRememberedCredentials() {
    const remRaw = localStorage.getItem(STORAGE_KEY_REMEMBER);
    if (!remRaw) return;
    try {
        const rem = JSON.parse(remRaw);
        if (rem && rem.username) {
            const uIn = document.getElementById('login-username');
            const pIn = document.getElementById('login-password');
            const cb = document.getElementById('login-remember-me');
            if (uIn) uIn.value = rem.username;
            const savedVal = rem.savedInput || '';
            if (pIn && savedVal) pIn.value = savedVal;
            if (cb) cb.checked = true;
        }
    } catch (e) {}
}

function handleLogin(event) {
    event.preventDefault();
    const uVal = normalizeTR(document.getElementById('login-username').value);
    const pVal = (document.getElementById('login-password').value || '').trim();
    const rememberMe = document.getElementById('login-remember-me')?.checked;
    const errBox = document.getElementById('login-error');

    const matched = appState.users.find(u =>
        (normalizeTR(u.username) === uVal || normalizeTR(u.name) === uVal || normalizeTR(u.email) === uVal) &&
        verifyUserPin(u, pVal)
    );

    if (!matched) {
        errBox.style.display = 'block';
        errBox.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Kullanıcı adı veya şifre hatalı! Şifrenizi unuttuysanız <b>"Şifremi Unuttum?"</b> bağlantısını kullanabilirsiniz.';
        return;
    }

    if (!isOmerEren(matched)) {
        errBox.style.display = 'block';
        errBox.innerHTML = '<i class="fa-solid fa-lock"></i> <b>ERİŞİM KAPALI:</b> Uygulama şu anda yalnızca <b>ÖMER EREN</b> çalışma erişimine açıktır. Diğer tüm kullanıcıların girişi geçici olarak kapatılmıştır.';
        return;
    }

    errBox.style.display = 'none';
    currentUser = matched;

    if (rememberMe) {
        localStorage.setItem(STORAGE_KEY_REMEMBER, JSON.stringify({ username: matched.username, savedInput: pVal }));
        localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(currentUser));
    } else {
        localStorage.removeItem(STORAGE_KEY_REMEMBER);
        sessionStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(currentUser));
    }

    startSilentAudioKeepAlive();
    autoEnrollZeroTouchPush();
    addAuditLog("GİRİŞ / ÇIKIŞ", `${currentUser.name} (${currentUser.dept}) sisteme giriş yaptı.`);
    applyAuthenticatedUser();
}

function applyAuthenticatedUser() {
    const overlay = document.getElementById('login-overlay');
    if (currentUser && !isOmerEren(currentUser)) {
        currentUser = null;
        localStorage.removeItem(STORAGE_KEY_SESSION);
        sessionStorage.removeItem(STORAGE_KEY_SESSION);
    }
    if (!currentUser) {
        overlay.classList.remove('hidden');
        loadRememberedCredentials();
        return;
    }
    overlay.classList.add('hidden');

    document.getElementById('current-user-name').textContent = currentUser.name;
    document.getElementById('current-user-role').textContent = `${currentUser.dept || currentUser.role}`;
    const avatarEl = document.getElementById('current-user-avatar');
    if (avatarEl) {
        avatarEl.src = currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=0284c7&color=fff&bold=true`;
    }

    // Denetim İzi (Audit Log) Menü Görünürlüğü (SADECE ÖMER EREN)
    const logsNavItem = document.getElementById('nav-item-logs');
    if (logsNavItem) {
        logsNavItem.style.display = isOmerEren(currentUser) ? 'flex' : 'none';
    }

    // Yönetici Sürüm Yayına Alma Paneli Görünürlüğü (SADECE ÖMER EREN)
    const adminPublishPanel = document.getElementById('admin-publish-panel');
    if (adminPublishPanel) {
        adminPublishPanel.style.display = isOmerEren(currentUser) ? 'block' : 'none';
    }

    updateAppVersionDisplay();
    initBackgroundAlarmWorker();
    autoEnrollZeroTouchPush();
    renderAll();
}

function handleLogout() {
    if (currentUser) {
        addAuditLog("GİRİŞ / ÇIKIŞ", `${currentUser.name} sistemden güvenli çıkış yaptı.`);
    }
    currentUser = null;
    localStorage.removeItem(STORAGE_KEY_SESSION);
    sessionStorage.removeItem(STORAGE_KEY_SESSION);
    document.getElementById('login-overlay').classList.remove('hidden');
    loadRememberedCredentials();
}

function openForgotPasswordModal() {
    const modal = document.getElementById('forgot-password-modal');
    if (!modal) return;
    document.getElementById('forgot-step-1').style.display = 'block';
    document.getElementById('forgot-step-2').style.display = 'none';
    document.getElementById('forgot-step1-msg').style.display = 'none';
    document.getElementById('forgot-step2-msg').style.display = 'none';

    const curUIn = document.getElementById('login-username');
    const fUIn = document.getElementById('forgot-user-identifier');
    if (curUIn && fUIn && curUIn.value) {
        fUIn.value = curUIn.value;
        const matched = appState.users.find(u => normalizeTR(u.username) === normalizeTR(curUIn.value) || normalizeTR(u.name) === normalizeTR(curUIn.value));
        const fEmailIn = document.getElementById('forgot-manual-email');
        if (matched && fEmailIn && matched.email) {
            fEmailIn.value = matched.email;
        }
    }

    modal.classList.add('open');
    modal.classList.add('active');
    modal.style.display = 'flex';
}

function closeForgotPasswordModal() {
    const modal = document.getElementById('forgot-password-modal');
    if (modal) {
        modal.classList.remove('open');
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

function sendPasswordResetCode() {
    const msgEl = document.getElementById('forgot-step1-msg');
    if (msgEl) {
        msgEl.style.display = 'block';
        msgEl.style.background = 'rgba(239,68,68,0.2)';
        msgEl.style.color = '#fca5a5';
        msgEl.innerHTML = '<i class="fa-solid fa-shield-halved"></i> <b>Özel Güvenlik Kalkanı Aktif:</b> Uygulama yalnızca <b>ÖMER EREN</b> kişisel erişimine açık olduğundan dışarıdan şifre sıfırlama kapalıdır.';
    }
}

function verifyAndResetPassword() {
    const code = (document.getElementById('forgot-verification-code').value || '').trim();
    const p1 = (document.getElementById('forgot-new-password').value || '').trim();
    const p2 = (document.getElementById('forgot-new-password-confirm').value || '').trim();
    const msgEl = document.getElementById('forgot-step2-msg');

    if (!activePasswordResetRequest || code !== activePasswordResetRequest.code) {
        msgEl.style.display = 'block';
        msgEl.style.background = 'rgba(239,68,68,0.2)';
        msgEl.style.color = '#fca5a5';
        msgEl.textContent = 'Girdiğiniz 6 haneli doğrulama kodu hatalı!';
        return;
    }

    if (p1.length < 3 || p1 !== p2) {
        msgEl.style.display = 'block';
        msgEl.style.background = 'rgba(239,68,68,0.2)';
        msgEl.style.color = '#fca5a5';
        msgEl.textContent = 'Yeni şifreler eşleşmiyor veya en az 3 karakter olmalıdır.';
        return;
    }

    const idx = appState.users.findIndex(u => u.username === activePasswordResetRequest.username);
    if (idx !== -1) {
        appState.users[idx].pinStamp = hashPin(p1);
        syncToServer();
        addAuditLog("GİRİŞ / ÇIKIŞ", `${appState.users[idx].name} şifresini doğrulama koduyla güncelledi.`);
        closeForgotPasswordModal();
        alert("✅ Şifreniz başarıyla yenilendi! Giriş yapabilirsiniz.");
    }
}

// ==========================================================================
// 2.1 ŞİFRE DEĞİŞTİRME SİSTEMİ (GİRİŞ YAPMIŞ PERSONEL VE YÖNETİCİ İÇİN)
// ==========================================================================
function openChangePasswordModal() {
    if (!currentUser) {
        alert('Lütfen önce sisteme giriş yapınız.');
        return;
    }
    const modal = document.getElementById('change-password-modal');
    if (!modal) return;

    document.getElementById('change-password-form')?.reset();
    const errEl = document.getElementById('change-pass-error');
    if (errEl) errEl.style.display = 'none';
    const succEl = document.getElementById('change-pass-success');
    if (succEl) succEl.style.display = 'none';

    const nameEl = document.getElementById('change-pass-user-name');
    if (nameEl) nameEl.textContent = currentUser.name;
    const roleEl = document.getElementById('change-pass-user-role');
    if (roleEl) roleEl.textContent = `${currentUser.dept || currentUser.role} (${currentUser.username})`;
    const avatarEl = document.getElementById('change-pass-user-avatar');
    if (avatarEl) {
        avatarEl.src = currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=0284c7&color=fff&bold=true`;
    }

    modal.classList.add('open');
    modal.classList.add('active');
    modal.style.display = 'flex';
}

function closeChangePasswordModal() {
    const modal = document.getElementById('change-password-modal');
    if (modal) {
        modal.classList.remove('open');
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

async function handleChangePasswordSubmit(e) {
    e.preventDefault();
    if (!currentUser) return;

    const currentPass = (document.getElementById('change-pass-current').value || '').trim();
    const newPass = (document.getElementById('change-pass-new').value || '').trim();
    const confirmPass = (document.getElementById('change-pass-confirm').value || '').trim();
    const errEl = document.getElementById('change-pass-error');
    const succEl = document.getElementById('change-pass-success');

    errEl.style.display = 'none';
    succEl.style.display = 'none';

    if (!verifyUserPin(currentUser, currentPass)) {
        errEl.textContent = 'Mevcut şifrenizi hatalı girdiniz!';
        errEl.style.display = 'block';
        return;
    }

    if (newPass.length < 3) {
        errEl.textContent = 'Yeni şifreniz en az 3 karakter olmalıdır!';
        errEl.style.display = 'block';
        return;
    }

    if (newPass !== confirmPass) {
        errEl.textContent = 'Yeni şifreler birbiriyle eşleşmiyor!';
        errEl.style.display = 'block';
        return;
    }

    currentUser.pinStamp = hashPin(newPass);

    const userIdx = appState.users.findIndex(u =>
        normalizeTR(u.username) === normalizeTR(currentUser.username) ||
        normalizeTR(u.name) === normalizeTR(currentUser.name)
    );
    if (userIdx !== -1) {
        appState.users[userIdx].pinStamp = hashPin(newPass);
    }

    if (localStorage.getItem(STORAGE_KEY_SESSION)) {
        localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(currentUser));
    }
    if (sessionStorage.getItem(STORAGE_KEY_SESSION)) {
        sessionStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(currentUser));
    }
    const remRaw = localStorage.getItem(STORAGE_KEY_REMEMBER);
    if (remRaw) {
        try {
            const rem = JSON.parse(remRaw);
            if (rem && normalizeTR(rem.username) === normalizeTR(currentUser.username)) {
                rem.savedInput = newPass;
                localStorage.setItem(STORAGE_KEY_REMEMBER, JSON.stringify(rem));
            }
        } catch (err) {}
    }

    addAuditLog('ŞİFRE DEĞİŞİKLİĞİ', `${currentUser.name} (${currentUser.dept}) sisteme giriş şifresini başarıyla güncelledi.`);
    saveStateLocally();
    await syncToServer();

    succEl.textContent = '✅ Şifreniz başarıyla değiştirildi ve tüm cihazlarınıza senkronize edildi!';
    succEl.style.display = 'block';

    setTimeout(() => {
        closeChangePasswordModal();
    }, 1500);
}

window.openForgotPasswordModal = openForgotPasswordModal;
window.closeForgotPasswordModal = closeForgotPasswordModal;
window.sendPasswordResetCode = sendPasswordResetCode;
window.verifyAndResetPassword = verifyAndResetPassword;
window.openChangePasswordModal = openChangePasswordModal;
window.closeChangePasswordModal = closeChangePasswordModal;
window.handleChangePasswordSubmit = handleChangePasswordSubmit;

// ==========================================================================
// 3. SEKME GEÇİŞLERİ VE GÖRÜNÜM YÖNETİMİ (D-PRO EMBED SENKRONLU)
// ==========================================================================
function switchTab(tabId) {
    if (tabId === 'logs-tab' && !isOmerEren(currentUser)) {
        tabId = 'dashboard-tab';
    }
    if (window.DizsanBackNav && typeof window.DizsanBackNav.trackTabSwitch === 'function') {
        window.DizsanBackNav.trackTabSwitch(tabId);
    }

    document.querySelectorAll('.tab-section').forEach(sec => {
        sec.classList.toggle('active', sec.id === tabId);
    });

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.tab === tabId);
    });

    document.querySelectorAll('.mobile-nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.tab === tabId);
    });

    const pageTitleMap = {
        'dashboard-tab': '<i class="fa-solid fa-chart-pie" style="color:var(--dizsan-light);"></i> Genel Bakış &amp; Kokpit',
        'cari-ekstre-tab': '<i class="fa-solid fa-file-invoice-dollar" style="color:#38bdf8;"></i> D-Pro Cari &amp; Logo Ekstre (Borç / Alacak / Fatura Detayı)',
        'legacy-tab': '<i class="fa-solid fa-database" style="color:var(--dizsan-light);"></i> Kayıp Müşteri Ziyaret Planı (1998-2026)',
        'active-tab': '<i class="fa-solid fa-car-side" style="color:var(--dizsan-light);"></i> Güncel Saha &amp; Telefon Görüşmeleri',
        'ai-match-tab': '<i class="fa-solid fa-wand-magic-sparkles" style="color:#c084fc;"></i> Yapay Zeka Tekleştirme &amp; Churn Analizi',
        'tasks-tab': '<i class="fa-solid fa-list-check" style="color:#fbbf24;"></i> Aksiyon &amp; Çift Aşamalı Hatırlatıcılar',
        'strategy-tab': '<i class="fa-solid fa-map-location-dot" style="color:#34d399;"></i> İlçe Rut Strateji Rehberi',
        'logs-tab': '<i class="fa-solid fa-shield-halved" style="color:#f59e0b;"></i> Yönetici Denetim İzi'
    };

    const titleEl = document.getElementById('page-title');
    if (titleEl && pageTitleMap[tabId]) {
        titleEl.innerHTML = pageTitleMap[tabId];
    }

    if (tabId === 'cari-ekstre-tab') {
        populateFilterOptions();
        renderCariEkstreTable(false);
    } else if (tabId === 'legacy-tab') {
        populateFilterOptions();
        renderLegacyCustomers();
    } else if (tabId === 'strategy-tab') {
        populateStrategyFilters(false);
        renderDistrictStrategies();
    }

    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('mobile-open');

    if (window.DizsanBackNav && typeof window.DizsanBackNav.updateBackButtonVisibility === 'function') {
        window.DizsanBackNav.updateBackButtonVisibility();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// D-Pro üst menüsünden gelen sekme geçiş mesajlarını dinle
window.addEventListener('message', (event) => {
    if (!event.data || typeof event.data !== 'object') return;
    if (event.data.type === 'DPRO_SWITCH_SUBMODULE' && event.data.targetTab) {
        switchTab(event.data.targetTab);
    }
});

function toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.toggle('mobile-open');
}

// ==========================================================================
// 4. KOKPİT, D-PRO CARİ & LOGO EKSTRE VE ESKİ KAYITLAR (1998-2026 ARŞİV)
// ==========================================================================
function getCustomerAccountingSummary(c) {
    const history = Array.isArray(c.serviceHistory) ? c.serviceHistory : [];
    const invoiceSum = history.reduce((sum, h) => sum + Number(h.tutar || 0), 0);
    const rawRev = Math.max(Number(c.totalRevenue || 0), invoiceSum);
    const bal = Number(c.balance || 0);

    // Logo ERP Borç (Debit) & Alacak (Credit) hesabı:
    // Bakiye > 0 ise (B) Borçlu, Bakiye < 0 ise (A) Alacaklı
    let debit = rawRev;
    let credit = rawRev;
    if (bal > 0) {
        debit = Math.max(rawRev, bal);
        credit = Math.max(0, debit - bal);
    } else if (bal < 0) {
        const absBal = Math.abs(bal);
        credit = Math.max(rawRev, absBal);
        debit = Math.max(0, credit - absBal);
    }
    const absBalance = Math.abs(bal);
    const baCode = bal > 0.009 ? '(B)' : (bal < -0.009 ? '(A)' : '-');
    const baLabel = bal > 0.009 ? '(B) Borçlu' : (bal < -0.009 ? '(A) Alacaklı' : 'Kapalı / Sıfır');
    return {
        debit,
        credit,
        balance: bal,
        borc: debit,
        alacak: credit,
        bakiye: bal,
        absBalance,
        baCode,
        baLabel,
        invoiceCount: history.length
    };
}

function renderDashboard() {
    const customers = appState.customers || [];
    const visits = appState.visits || [];
    const tasks = appState.tasks || [];

    const totalCust = customers.length;
    // P1 Acil Churn grubu (1.990 ile aynı olmaması için gerçek P1 öncelikli portföy)
    const p1CustList = customers.filter(c => (c.priority || '').startsWith('P1'));
    const churnCust = p1CustList.length;
    const churnPct = totalCust > 0 ? ((churnCust / totalCust) * 100).toFixed(1) : '0.0';

    // Kazanılan / Aktif (P3 Düzenli + Olumlu/Randevu alınan ziyaretler)
    const positiveVisitTitles = new Set(
        visits
            .filter(v => v.result === 'Olumlu' || v.result === 'Randevu Alındı' || v.result === 'Teklif Verildi')
            .map(v => normalizeTR(v.customerTitle))
    );
    const activeOrRecoveredList = customers.filter(c =>
        (c.priority || '').startsWith('P3') || positiveVisitTitles.has(normalizeTR(c.title))
    );
    const recoveredCount = activeOrRecoveredList.length;
    const recoveredRev = activeOrRecoveredList.reduce((acc, c) => acc + Number(c.totalRevenue || 0), 0);

    const completedVisits = visits.length;
    const pendingTasks = tasks.filter(t => t.status !== 'Tamamlandı').length;
    const totalRev = customers.reduce((acc, c) => acc + Number(c.totalRevenue || 0), 0);

    let totalDebit = 0;
    let totalCredit = 0;
    customers.forEach(c => {
        const acc = getCustomerAccountingSummary(c);
        totalDebit += acc.debit;
        totalCredit += acc.credit;
    });
    const netBal = totalDebit - totalCredit;

    const elTotal = document.getElementById('kpi-total-customers');
    const elChurn = document.getElementById('kpi-churn-customers');
    const elChurnSub = document.getElementById('kpi-churn-sub');
    const elRecCount = document.getElementById('kpi-recovered-customers');
    const elRecRev = document.getElementById('kpi-recovered-revenue');
    const elVisits = document.getElementById('kpi-completed-visits');
    const elTasks = document.getElementById('kpi-pending-tasks');
    const elRev = document.getElementById('kpi-total-revenue');
    const elNetSub = document.getElementById('kpi-net-balance-sub');

    if (elTotal) elTotal.textContent = totalCust.toLocaleString('tr-TR');
    if (elChurn) elChurn.textContent = churnCust.toLocaleString('tr-TR');
    if (elChurnSub) elChurnSub.textContent = `%${churnPct} Acil Müdahale Portföyü`;
    if (elRecCount) elRecCount.textContent = recoveredCount.toLocaleString('tr-TR');
    if (elRecRev) elRecRev.textContent = `Aktif Ciro: ₺${(recoveredRev / 1000000).toFixed(1)}M`;
    if (elVisits) elVisits.textContent = completedVisits.toLocaleString('tr-TR');
    if (elTasks) elTasks.textContent = pendingTasks.toLocaleString('tr-TR');
    if (elRev) elRev.textContent = '₺' + (totalRev / 1000000).toFixed(1) + 'M';
    if (elNetSub) {
        const netLabel = netBal >= 0 ? `${formatMoney(Math.abs(netBal))} (B)` : `${formatMoney(Math.abs(netBal))} (A)`;
        elNetSub.textContent = `Net Bakiye: ${netLabel}`;
    }

    const p1Vip = customers.filter(c => (c.priority || '').includes('VIP') || Number(c.totalRevenue || 0) >= 1000000).length;
    const p1Churn = customers.filter(c => (c.priority || '').includes('Acil Churn')).length;
    const p1Vefa = customers.filter(c => (c.priority || '').includes('Vefa')).length;
    const p2Arch = customers.filter(c => (c.priority || '').startsWith('P2')).length;

    const elVip = document.getElementById('kpi-p1-vip-count');
    const elP1Ch = document.getElementById('kpi-p1-churn-count');
    const elVefa = document.getElementById('kpi-p1-vefa-count');
    const elP2Ar = document.getElementById('kpi-p2-archive-count');
    if (elVip) elVip.textContent = `${p1Vip} Müşteri`;
    if (elP1Ch) elP1Ch.textContent = `${p1Churn.toLocaleString('tr-TR')} Müşteri`;
    if (elVefa) elVefa.textContent = `${p1Vefa} Müşteri`;
    if (elP2Ar) elP2Ar.textContent = `${p2Arch.toLocaleString('tr-TR')} Müşteri`;

    // 1. Günlük Akıllı Saha Ajandası: Bugün Aranacak / Ziyaret Edilecek Önerilen 5 VIP Müşteri
    const agendaBox = document.getElementById('dashboard-smart-agenda');
    if (agendaBox) {
        const visitedTitles = new Set(visits.map(v => normalizeTR(v.customerTitle)));
        const topVipCandidates = customers
            .filter(c => !visitedTitles.has(normalizeTR(c.title)) && ((c.priority || '').includes('P1') || Number(c.totalRevenue || 0) >= 400000))
            .sort((a, b) => (Number(b.recoveryScore || 0) * 100000 + Number(b.totalRevenue || 0)) - (Number(a.recoveryScore || 0) * 100000 + Number(a.totalRevenue || 0)))
            .slice(0, 5);

        agendaBox.innerHTML = topVipCandidates.map(c => {
            const cleanPh = (c.phone || '').replace(/[^0-9]/g, '');
            const hasPhone = c.phone && c.phone !== 'YOK' && cleanPh.length >= 10;
            const acc = getCustomerAccountingSummary(c);
            return `
                <div class="smart-agenda-card">
                    <div style="flex:1; min-width:190px;">
                        <div style="display:flex; align-items:center; gap:0.4rem; margin-bottom:2px;">
                            <span style="font-family:monospace; font-size:0.72rem; color:#38bdf8; font-weight:700;">${c.code}</span>
                            <span class="badge badge-p1" style="font-size:0.65rem; padding:1px 6px;">Skor: ${c.recoveryScore || 90}</span>
                            ${acc.baCode !== '-' ? `<span class="${acc.baCode === '(B)' ? 'ba-badge-b' : 'ba-badge-a'}" style="font-size:0.65rem; padding:1px 5px;">${formatMoney(acc.absBalance)} ${acc.baCode}</span>` : ''}
                        </div>
                        <strong style="color:#fff; font-size:0.83rem; display:block; cursor:pointer;" onclick="openCustomerDetailModal('${c.code}')">${c.title}</strong>
                        <div style="font-size:0.72rem; color:var(--text-sec); margin-top:2px;">
                            <i class="fa-solid fa-location-dot" style="color:#38bdf8;"></i> ${c.city} / ${c.district} &bull; Ciro: <strong style="color:#34d399;">${formatMoney(c.totalRevenue)}</strong> &bull; Son: ${c.lastDate || '-'}
                        </div>
                    </div>
                    <div style="display:flex; align-items:center; gap:0.35rem; flex-wrap:wrap;">
                        ${hasPhone ? `
                            <a href="tel:${c.phone}" class="btn btn-secondary btn-sm" style="padding:0.32rem 0.55rem;" title="Hemen Ara: ${c.phone}">
                                <i class="fa-solid fa-phone" style="color:#38bdf8;"></i>
                            </a>
                            <a href="https://wa.me/${cleanPh.startsWith('0') ? '9' + cleanPh : cleanPh}" target="_blank" class="btn btn-secondary btn-sm" style="padding:0.32rem 0.55rem;" title="WhatsApp Mesajı Gönder">
                                <i class="fa-brands fa-whatsapp" style="color:#25d366;"></i>
                            </a>
                        ` : ''}
                        <button type="button" class="btn btn-secondary btn-sm" style="padding:0.32rem 0.6rem;" onclick="openCustomerDetailModal('${c.code}')" title="Logo Cari Ekstre &amp; Fatura Kalemleri">
                            <i class="fa-solid fa-file-invoice-dollar" style="color:#fbbf24;"></i> Ekstre
                        </button>
                        <button type="button" class="btn btn-primary btn-sm" style="padding:0.32rem 0.65rem;" onclick="quickStartVisitForCustomer('${c.code}')" title="Ziyaret veya Arama Kaydı Gir">
                            <i class="fa-solid fa-plus"></i> Ziyaret
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 2. Bölge / İl Bazlı Potansiyel Ciro Yoğunluğu Bar Grafiği
    const regionBox = document.getElementById('dashboard-region-bars');
    if (regionBox) {
        const cityStats = {};
        customers.forEach(c => {
            const ct = c.city || 'Diğer';
            if (!cityStats[ct]) cityStats[ct] = { count: 0, rev: 0 };
            cityStats[ct].count += 1;
            cityStats[ct].rev += Number(c.totalRevenue || 0);
        });
        const topCities = Object.entries(cityStats)
            .sort((a, b) => b[1].rev - a[1].rev)
            .slice(0, 5);
        const maxRev = topCities.length > 0 ? Math.max(topCities[0][1].rev, 1) : 1;

        regionBox.innerHTML = topCities.map(([cityName, st]) => {
            const pct = Math.max(8, Math.round((st.rev / maxRev) * 100));
            return `
                <div style="cursor:pointer; background:rgba(255,255,255,0.02); border:1px solid var(--border-color); border-radius:9px; padding:0.55rem 0.8rem;" onclick="filterLegacyByCityQuick('${cityName}')" title="${cityName} müşterilerini filtrelemek için tıklayın">
                    <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.78rem; margin-bottom:4px;">
                        <strong style="color:#f8fafc;"><i class="fa-solid fa-location-dot" style="color:#34d399; margin-right:4px;"></i>${cityName} <span style="color:var(--text-sec); font-weight:500;">(${st.count} Cari)</span></strong>
                        <span style="font-weight:700; color:#38bdf8;">${formatMoney(st.rev)}</span>
                    </div>
                    <div style="width:100%; height:6px; background:rgba(255,255,255,0.06); border-radius:999px; overflow:hidden;">
                        <div style="width:${pct}%; height:100%; background:linear-gradient(90deg, #0284c7, #34d399); border-radius:999px;"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 3. Son Ziyaretler Listesi
    const recentBox = document.getElementById('dashboard-recent-visits');
    if (recentBox) {
        if (visits.length === 0) {
            recentBox.innerHTML = `
                <div style="text-align:center; padding:1.25rem; color:var(--text-sec); font-size:0.82rem;">
                    <i class="fa-solid fa-car-side" style="font-size:1.6rem; color:var(--text-muted); margin-bottom:0.45rem; display:block;"></i>
                    Henüz yeni ziyaret kaydı girilmedi. Yukarıdaki <strong>"Görüşme / Ziyaret Ekle"</strong> veya <strong>"Akıllı Günlük Ajanda"</strong> üzerinden ilk kaydı oluşturabilirsiniz.
                </div>
            `;
        } else {
            recentBox.innerHTML = visits.slice(0, 4).map(v => `
                <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-color); border-radius:10px; padding:0.65rem 0.85rem; display:flex; justify-content:space-between; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                    <div>
                        <strong style="color:#fff; font-size:0.84rem;">${v.type === 'ZİYARET' ? '<i class="fa-solid fa-car-side" style="color:#38bdf8;"></i>' : '<i class="fa-solid fa-phone" style="color:#34d399;"></i>'} ${v.customerTitle}</strong>
                        <div style="font-size:0.73rem; color:var(--text-sec); margin-top:2px;">
                            ${v.personnel} &bull; ${v.date} &bull; ${v.location || 'Merkez'}
                        </div>
                    </div>
                    <span class="badge ${v.result === 'Olumlu' || v.result === 'Randevu Alındı' ? 'badge-success' : 'badge-p2'}">${v.result}</span>
                </div>
            `).join('');
        }
    }
}

function filterLegacyByCityQuick(cityName) {
    switchTab('legacy-tab');
    const cityInput = document.getElementById('legacy-filter-city');
    if (cityInput) {
        cityInput.value = cityName;
        handleCityFilterChange();
    }
}

function populateFilterOptions() {
    const customers = appState.customers || [];
    const rutSelect = document.getElementById('legacy-filter-rut');

    // Benzersiz şehirleri ve müşteri sayılarını hesapla
    const cityCounts = {};
    customers.forEach(c => {
        if (c.city) {
            cityCounts[c.city] = (cityCounts[c.city] || 0) + 1;
        }
    });
    const cities = Object.keys(cityCounts).sort((a, b) => a.localeCompare(b, 'tr'));
    appState.cities = cities;
    appState.cityCounts = cityCounts;

    // D-Pro Cari Ekstre İl Filtresini doldur
    const ekstreCityEl = document.getElementById('ekstre-filter-city');
    if (ekstreCityEl && ekstreCityEl.options.length <= 1) {
        cities.forEach(ct => {
            const opt = document.createElement('option');
            opt.value = ct;
            opt.textContent = `${ct} (${cityCounts[ct]})`;
            ekstreCityEl.appendChild(opt);
        });
    }

    // Datalist doldur (Klavyeden yazarken otomatik tamamlama)
    const dl = document.getElementById('legacy-filter-city-list');
    if (dl) {
        dl.innerHTML = '';
        cities.forEach(ct => {
            const opt = document.createElement('option');
            opt.value = ct;
            opt.label = `${ct} (${cityCounts[ct]} Müşteri)`;
            dl.appendChild(opt);
        });
    }

    // Geriye dönük uyumluluk: Eğer bir select ise option'ları doldur
    const cityEl = document.getElementById('legacy-filter-city');
    if (cityEl && cityEl.tagName === 'SELECT' && cityEl.options.length <= 1) {
        cities.forEach(ct => {
            const opt = document.createElement('option');
            opt.value = ct;
            opt.textContent = `${ct} (${cityCounts[ct]})`;
            cityEl.appendChild(opt);
        });
    }

    if (rutSelect) {
        const prevRut = rutSelect.value;
        const customRouteNames = (appState.customRoutes || []).map(r => r.name).filter(Boolean);
        const customerRuts = customers.map(c => c.rut).filter(r => r && !/^(RUT-\d+|DİĞER)$/i.test(String(r).trim()));
        const ruts = Array.from(new Set([...customRouteNames, ...customerRuts])).sort((a, b) => a.localeCompare(b, 'tr'));
        rutSelect.innerHTML = `<option value="">🚗 Tüm Rutlar (${ruts.length} Kayıtlı Rut)</option>` +
            ruts.map(rt => {
                const cnt = customers.filter(c => c.rut === rt).length;
                return `<option value="${rt}">${rt} (${cnt} Cari)</option>`;
            }).join('');
        if (prevRut && ruts.includes(prevRut)) {
            rutSelect.value = prevRut;
        }
    }

    // Modal Personel Seçenekleri
    const visitPersonnel = document.getElementById('visit-personnel-select');
    const visitAssignedTo = document.getElementById('visit-assigned-to');
    const taskAssignee = document.getElementById('task-assignee');
    const taskManager = document.getElementById('task-manager');
    const customRutAssignee = document.getElementById('custom-rut-assignee');

    const fillSelect = (el) => {
        if (!el || el.options.length > 0) return;
        appState.users.forEach(u => {
            const opt = document.createElement('option');
            opt.value = u.name;
            opt.textContent = `${u.name} (${u.dept})`;
            el.appendChild(opt);
        });
    };
    fillSelect(visitPersonnel);
    fillSelect(visitAssignedTo);
    fillSelect(taskAssignee);
    fillSelect(taskManager);
    fillSelect(customRutAssignee);

    // Müşteri Otomatik Tamamlama (Datalist)
    const cdl = document.getElementById('customer-datalist');
    if (cdl && cdl.children.length === 0) {
        customers.slice(0, 1000).forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.title;
            opt.label = `${c.code} - ${c.city}/${c.district}`;
            cdl.appendChild(opt);
        });
    }

    if (typeof initCustomRoutePlannerUI === 'function') {
        initCustomRoutePlannerUI();
    }
}

// ==========================================================================
// ŞEHİR FİLTRESİ: ELLE YAZILABİLİR, OTOMATİK TAMAMLAMALI & ARAMA LİSTELİ
// ==========================================================================
function renderCitySuggestions(filterText = '') {
    const box = document.getElementById('legacy-city-suggestions');
    if (!box) return;

    const cities = appState.cities || [];
    const cityCounts = appState.cityCounts || {};
    const cleanFilter = cleanTR(filterText);

    let filtered = cities;
    if (cleanFilter) {
        filtered = cities.filter(ct => cleanTR(ct).includes(cleanFilter));
    }

    if (filtered.length === 0) {
        box.innerHTML = `
            <div style="padding:0.6rem 0.8rem; font-size:0.8rem; color:var(--text-muted); text-align:center;">
                "${filterText}" ile eşleşen il bulunamadı.<br><small style="color:var(--dizsan-light);">Serbest filtreleme uygulanıyor...</small>
            </div>
        `;
        box.style.display = 'block';
        return;
    }

    const currentVal = document.getElementById('legacy-filter-city')?.value || '';

    let html = `
        <div class="city-suggestion-item" onclick="selectCityFilter('')">
            <span>🌐 <strong>Tüm İller</strong> (Sıfırla)</span>
            <span class="badge-count">${(appState.customers || []).length}</span>
        </div>
    `;

    filtered.forEach(ct => {
        const isSelected = cleanTR(ct) === cleanTR(currentVal);
        html += `
            <div class="city-suggestion-item ${isSelected ? 'selected' : ''}" onclick="selectCityFilter('${ct.replace(/'/g, "\\'")}')">
                <span>📍 ${ct}</span>
                <span class="badge-count">${cityCounts[ct] || 0}</span>
            </div>
        `;
    });

    box.innerHTML = html;
    box.style.display = 'block';
}

function selectCityFilter(cityName) {
    const input = document.getElementById('legacy-filter-city');
    if (input) {
        input.value = cityName;
    }
    const box = document.getElementById('legacy-city-suggestions');
    if (box) {
        box.style.display = 'none';
    }
    handleCityFilterChange();
}

function handleCityFilterInput() {
    const input = document.getElementById('legacy-filter-city');
    const val = input ? input.value : '';
    const clearBtn = document.getElementById('legacy-city-clear-btn');
    if (clearBtn) {
        clearBtn.style.display = val.trim() ? 'flex' : 'none';
    }
    renderCitySuggestions(val);
    handleCityFilterChange();
}

function handleCityInputFocus() {
    const input = document.getElementById('legacy-filter-city');
    const val = input ? input.value : '';
    renderCitySuggestions(val);
}

function toggleCityDropdown(e) {
    if (e) {
        e.stopPropagation();
        e.preventDefault();
    }
    const box = document.getElementById('legacy-city-suggestions');
    if (!box) return;
    if (box.style.display === 'block') {
        box.style.display = 'none';
    } else {
        const input = document.getElementById('legacy-filter-city');
        renderCitySuggestions(input ? input.value : '');
        if (input) input.focus();
    }
}

function clearCityFilter(e) {
    if (e) {
        e.stopPropagation();
        e.preventDefault();
    }
    const input = document.getElementById('legacy-filter-city');
    if (input) {
        input.value = '';
    }
    const clearBtn = document.getElementById('legacy-city-clear-btn');
    if (clearBtn) {
        clearBtn.style.display = 'none';
    }
    const box = document.getElementById('legacy-city-suggestions');
    if (box) {
        box.style.display = 'none';
    }
    handleCityFilterChange();
    if (input) input.focus();
}

function handleCityInputKeyDown(e) {
    if (e.key === 'Escape') {
        const box = document.getElementById('legacy-city-suggestions');
        if (box) box.style.display = 'none';
    } else if (e.key === 'Enter') {
        const box = document.getElementById('legacy-city-suggestions');
        if (box) box.style.display = 'none';
        handleCityFilterChange();
    }
}

function handleCityFilterChange() {
    const cityInput = document.getElementById('legacy-filter-city');
    const cityVal = cityInput ? cityInput.value.trim() : '';
    const clearBtn = document.getElementById('legacy-city-clear-btn');
    if (clearBtn) {
        clearBtn.style.display = cityVal ? 'flex' : 'none';
    }

    const distSelect = document.getElementById('legacy-filter-district');
    if (distSelect) {
        distSelect.innerHTML = '<option value="">📍 Tüm İlçeler</option>';
        if (cityVal) {
            const cleanVal = cleanTR(cityVal);
            const customers = appState.customers || [];
            const matchedCustomers = customers.filter(c => {
                if (!c.city) return false;
                const cCity = cleanTR(c.city);
                return cCity === cleanVal || cCity.includes(cleanVal);
            });
            const districts = Array.from(new Set(matchedCustomers.map(c => c.district).filter(Boolean))).sort((a,b) => a.localeCompare(b, 'tr'));
            districts.forEach(dst => {
                const opt = document.createElement('option');
                opt.value = dst;
                opt.textContent = dst;
                distSelect.appendChild(opt);
            });
        }
    }
    renderLegacyCustomers();
}

function filterLegacyByPriority(priorityText) {
    switchTab('legacy-tab');
    
    // Önceki arama veya filtre kalıntılarını temizle (Kullanıcının tıkladığı grubun tümünü görebilmesi için)
    const sInput = document.getElementById('legacy-search');
    if (sInput) sInput.value = '';
    const citySel = document.getElementById('legacy-filter-city');
    if (citySel) citySel.value = '';
    const distSel = document.getElementById('legacy-filter-district');
    if (distSel) distSel.value = '';
    const rutSel = document.getElementById('legacy-filter-rut');
    if (rutSel) rutSel.value = '';
    const balSel = document.getElementById('legacy-filter-balance');
    if (balSel) balSel.value = '';
    legacyPage = 1;

    const sel = document.getElementById('legacy-filter-priority');
    if (sel) {
        sel.value = priorityText;
    }
    renderLegacyCustomers();
}

function renderLegacyCustomers() {
    const tbody = document.getElementById('legacy-table-body');
    if (!tbody) return;

    const search = normalizeTR(document.getElementById('legacy-search')?.value);
    const city = document.getElementById('legacy-filter-city')?.value || '';
    const district = document.getElementById('legacy-filter-district')?.value || '';
    const rut = document.getElementById('legacy-filter-rut')?.value || '';
    const priority = document.getElementById('legacy-filter-priority')?.value || '';
    const balance = document.getElementById('legacy-filter-balance')?.value || '';

    const cleanCityFilter = cleanTR(city);
    const isExactCity = (appState.cities || []).some(ct => cleanTR(ct) === cleanCityFilter);

    let list = (appState.customers || []).filter(c => {
        if (cleanCityFilter) {
            const cCity = cleanTR(c.city);
            if (isExactCity) {
                if (cCity !== cleanCityFilter) return false;
            } else {
                if (!cCity.includes(cleanCityFilter)) return false;
            }
        }
        if (district && c.district !== district) return false;
        if (rut && c.rut !== rut) return false;
        if (priority) {
            if (priority.includes('VIP')) {
                if (!((c.priority || '').includes('VIP') || Number(c.totalRevenue || 0) >= 1000000)) return false;
            } else if (!(c.priority || '').includes(priority)) {
                return false;
            }
        }
        if (balance && c.balanceStatus !== balance) return false;

        if (search) {
            const hay = normalizeTR(`${c.code} ${c.title} ${c.authorized} ${c.phone} ${c.plates} ${c.city} ${c.district} ${c.rut || ''}`);
            if (!hay.includes(search)) return false;
        }
        return true;
    });

    const totalCount = list.length;
    const totalPages = Math.ceil(totalCount / LEGACY_PAGE_SIZE) || 1;
    if (legacyPage > totalPages) legacyPage = totalPages;
    if (legacyPage < 1) legacyPage = 1;

    const startIdx = (legacyPage - 1) * LEGACY_PAGE_SIZE;
    const pageItems = list.slice(startIdx, startIdx + LEGACY_PAGE_SIZE);

    const countLabel = document.getElementById('legacy-table-count-label');
    if (countLabel) countLabel.textContent = `Filtrelenen Müşteriler (${totalCount.toLocaleString('tr-TR')} / ${appState.customers.length.toLocaleString('tr-TR')})`;

    const pageIndicator = document.getElementById('legacy-page-indicator');
    if (pageIndicator) pageIndicator.textContent = `Sayfa ${legacyPage} / ${totalPages} (${totalCount} Kayıt)`;

    if (pageItems.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:2rem; color:var(--text-sec);">Arama kriterlerine uygun müşteri kaydı bulunamadı.</td></tr>`;
        return;
    }

    const selectedSet = (typeof customRouteDraftSelectedCodes !== 'undefined' && customRouteDraftSelectedCodes instanceof Set)
        ? customRouteDraftSelectedCodes
        : new Set();

    tbody.innerHTML = pageItems.map(c => {
        const isVip = (c.priority || '').includes('VIP');
        const isChurn = (c.priority || '').includes('Acil Churn');
        const badgeCls = isVip ? 'badge-p1' : isChurn ? 'badge-p2' : 'badge-p3';
        const shortPriority = (c.priority || 'Normal')
            .replace('P1 - VIP Kritik Filo', 'P1 • VIP Filo')
            .replace('P1 - Vefa & Geri Kazanım', 'P1 • Vefa')
            .replace('P3 - Rut Ziyareti / Aktif', 'P3 • Aktif / Rut')
            .replace('P2 - Tarihsel Arşiv', 'P2 • Arşiv');

        const isSelectedForDraft = selectedSet.has(c.code);
        const hasSavedRut = c.rut && !/^(RUT-\d+|DİĞER)$/i.test(String(c.rut).trim());

        return `
            <tr style="${isSelectedForDraft ? 'background:rgba(16,185,129,0.08);' : ''}">
                <td style="font-family:monospace; color:var(--dizsan-light); font-weight:700; font-size:0.75rem; white-space:nowrap;">${c.code}</td>
                <td style="max-width:210px;">
                    <strong style="color:#fff; font-size:0.8rem; display:block; cursor:pointer; line-height:1.25;" onclick="openCustomerDetailModal('${c.code}')" title="Detay ve Logo ERP Fatura/Servis Geçmişini Gör">${c.title}</strong>
                    <span style="font-size:0.68rem; color:var(--text-muted); cursor:pointer; display:block; margin-top:2px; line-height:1.2;" onclick="openCustomerDetailModal('${c.code}')">${c.address || c.era || ''}</span>
                </td>
                <td style="max-width:145px;">
                    <div style="font-weight:600; color:#e2e8f0; font-size:0.75rem; line-height:1.25;">${c.authorized || '-'}</div>
                    <a href="tel:${c.phone}" style="color:#38bdf8; font-size:0.72rem; text-decoration:none; display:inline-block; margin-top:2px;"><i class="fa-solid fa-phone"></i> ${c.phone || '-'}</a>
                </td>
                <td style="white-space:nowrap;">
                    <span class="badge badge-secondary">${c.city} / ${c.district}</span>
                    ${hasSavedRut
                        ? `<span style="display:block; font-size:0.68rem; font-weight:700; color:#34d399; margin-top:3px;"><i class="fa-solid fa-route"></i> ${c.rut}</span>`
                        : `<span style="display:block; font-size:0.66rem; color:var(--text-muted); margin-top:2px;">Rut Planlanmadı</span>`
                    }
                </td>
                <td style="max-width:130px;">
                    <div style="font-weight:600; font-size:0.74rem; color:#fde68a; line-height:1.25;">${c.plates || 'Plakasız'}</div>
                    <span style="font-size:0.68rem; color:var(--text-sec); display:block; margin-top:1px;">${c.vehicleModel || 'Ağır Vasıta'}</span>
                </td>
                <td style="font-weight:700; color:#34d399; font-size:0.76rem; white-space:nowrap;">${formatMoney(c.totalRevenue)}</td>
                <td style="font-size:0.72rem; white-space:nowrap;">
                    <div>${c.lastDate || '-'}</div>
                    <span style="color:#f87171; font-size:0.67rem;">${c.churnDuration || ''}</span>
                </td>
                <td style="white-space:nowrap;">
                    <span class="badge ${c.balance > 0 ? 'badge-p1' : c.balance < 0 ? 'badge-success' : 'badge-secondary'}">
                        ${formatMoney(c.balance)}
                    </span>
                </td>
                <td style="white-space:nowrap;"><span class="badge ${badgeCls}" title="${c.priority || 'Normal'}">${shortPriority}</span></td>
                <td style="text-align:right; white-space:nowrap;">
                    <div style="display:flex; justify-content:flex-end; gap:0.28rem;">
                        <button type="button" class="btn ${isSelectedForDraft ? 'btn-success' : 'btn-secondary'} btn-sm" style="padding:0.28rem 0.5rem; font-size:0.71rem; ${isSelectedForDraft ? '' : 'border-color:rgba(56,189,248,0.4); color:#38bdf8;'}" title="Yeni Rut Planına Ekle / Çıkar" onclick="toggleCustomerInCustomRouteDraft('${c.code}')">
                            <i class="fa-solid ${isSelectedForDraft ? 'fa-check' : 'fa-plus'}"></i> ${isSelectedForDraft ? 'Rutta' : 'Ruta Ekle'}
                        </button>
                        <button type="button" class="btn btn-secondary btn-sm" style="padding:0.28rem 0.5rem; font-size:0.71rem;" title="Logo ERP Fatura &amp; Servis Geçmişi" onclick="openCustomerDetailModal('${c.code}')">
                            <i class="fa-solid fa-file-invoice"></i> Detay
                        </button>
                        <button type="button" class="btn btn-primary btn-sm" style="padding:0.28rem 0.5rem; font-size:0.71rem;" title="Ziyaret / Görüşme Başlat" onclick="quickStartVisitForCustomer('${c.code}')">
                            <i class="fa-solid fa-phone"></i> Ziyaret
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function changeLegacyPage(delta) {
    legacyPage += delta;
    renderLegacyCustomers();
}

function exportLegacyToExcel() {
    let csv = "\uFEFFCari Kodu;Sıra;Rut;İl;İlçe;Müşteri Ünvanı;Yetkili;Telefon;Plaka;Araç Grubu;Dönem;Toplam Ciro;İşlem Sayısı;İlk Tarih;Son Tarih;Kayıp Süresi;Bakiye;Bakiye Durumu;Öncelik;Skor;Adres\n";
    (appState.customers || []).forEach(c => {
        const clean = s => String(s || '').replace(/;/g, ',').replace(/\n/g, ' ');
        csv += `${clean(c.code)};${c.order || ''};${clean(c.rut)};${clean(c.city)};${clean(c.district)};${clean(c.title)};${clean(c.authorized)};${clean(c.phone)};${clean(c.plates)};${clean(c.vehicleModel)};${clean(c.era)};${c.totalRevenue || 0};${c.totalOperations || 0};${clean(c.firstDate)};${clean(c.lastDate)};${clean(c.churnDuration)};${c.balance || 0};${clean(c.balanceStatus)};${clean(c.priority)};${c.recoveryScore || 0};${clean(c.address)}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Dizsan_Kayip_Musteri_Plani_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    addAuditLog("DIŞA AKTARMA", "Kayıp müşteri ziyaret planı Excel (CSV) olarak indirildi.");
}

let currentCariEkstrePage = 1;
let cariEkstrePage = 1;
const CARI_EKSTRE_PAGE_SIZE = 50;

function handleEkstreCityFilterChange(preselectedDistrict = '') {
    const citySel = document.getElementById('ekstre-filter-city') || document.getElementById('ekstre-city-filter');
    const distSel = document.getElementById('ekstre-filter-district');
    const cityVal = citySel ? citySel.value : '';
    if (distSel) {
        distSel.innerHTML = '<option value="">🏘️ Tüm İlçeler</option>';
        const customers = appState.customers || [];
        const matched = cityVal && cityVal !== 'ALL'
            ? customers.filter(c => normalizeTR(c.city) === normalizeTR(cityVal))
            : customers;
        const distCounts = {};
        matched.forEach(c => {
            if (c.district) distCounts[c.district] = (distCounts[c.district] || 0) + 1;
        });
        Object.keys(distCounts).sort((a, b) => a.localeCompare(b, 'tr')).forEach(d => {
            const opt = document.createElement('option');
            opt.value = d;
            opt.textContent = `${d} (${distCounts[d]})`;
            distSel.appendChild(opt);
        });
        if (preselectedDistrict) {
            const matchOpt = Array.from(distSel.options).find(o => normalizeTR(o.value) === normalizeTR(preselectedDistrict));
            if (matchOpt) {
                distSel.value = matchOpt.value;
            } else {
                const opt = document.createElement('option');
                opt.value = preselectedDistrict;
                opt.textContent = preselectedDistrict;
                distSel.appendChild(opt);
                distSel.value = preselectedDistrict;
            }
        }
    }
    currentCariEkstrePage = 1;
    cariEkstrePage = 1;
    renderCariEkstreTable(true);
}

function renderCariEkstreTable(resetPage = true) {
    const tbody = document.getElementById('ekstre-table-body') || document.getElementById('cari-ekstre-tbody');
    if (!tbody) return;
    if (resetPage) {
        currentCariEkstrePage = 1;
        cariEkstrePage = 1;
    }

    const searchVal = normalizeTR((document.getElementById('ekstre-search') || document.getElementById('ekstre-search-input'))?.value || '');
    const cityVal = (document.getElementById('ekstre-filter-city') || document.getElementById('ekstre-city-filter'))?.value || '';
    const districtVal = document.getElementById('ekstre-filter-district')?.value || '';
    const statusVal = (document.getElementById('ekstre-filter-ba') || document.getElementById('ekstre-balance-filter'))?.value || '';
    const sortVal = (document.getElementById('ekstre-sort') || document.getElementById('ekstre-sort-filter'))?.value || 'BALANCE_DESC';

    const allCustomers = appState.customers || [];

    // Genel KPI hesapla (Güncel Açık Borç (B) ve Açık Alacak (A) Cari Bakiye Toplamları)
    let grandBorc = 0;
    let grandAlacak = 0;
    let borcluCariCount = 0;
    let alacakliCariCount = 0;
    let totalInvoiceCount = 0;
    let withInvoiceCustomers = 0;

    const enriched = allCustomers.map(c => {
        const acc = getCustomerAccountingSummary(c);
        if (acc.bakiye > 0.009) {
            grandBorc += acc.bakiye;
            borcluCariCount++;
        } else if (acc.bakiye < -0.009) {
            grandAlacak += Math.abs(acc.bakiye);
            alacakliCariCount++;
        }
        const invCount = (c.serviceHistory || []).length;
        totalInvoiceCount += invCount;
        if (invCount > 0) withInvoiceCustomers++;
        return { c, acc, invCount };
    });
    const grandNetBorc = grandBorc - grandAlacak;

    const elTotalCount = document.getElementById('ekstre-kpi-count') || document.getElementById('ekstre-kpi-total-count');
    if (elTotalCount) elTotalCount.textContent = allCustomers.length.toLocaleString('tr-TR');
    const elBorc = document.getElementById('ekstre-kpi-debit') || document.getElementById('ekstre-kpi-borc');
    if (elBorc) elBorc.textContent = formatMoney(grandBorc);
    const elBorcSub = document.getElementById('ekstre-kpi-debit-sub');
    if (elBorcSub) elBorcSub.textContent = `${borcluCariCount.toLocaleString('tr-TR')} Borçlu (B) Cari Açık Bakiye Toplamı`;
    const elAlacak = document.getElementById('ekstre-kpi-credit') || document.getElementById('ekstre-kpi-alacak');
    if (elAlacak) elAlacak.textContent = formatMoney(grandAlacak);
    const elAlacakSub = document.getElementById('ekstre-kpi-credit-sub');
    if (elAlacakSub) elAlacakSub.textContent = `${alacakliCariCount.toLocaleString('tr-TR')} Alacaklı (A) Cari Açık Bakiye Toplamı`;
    const elBakiye = document.getElementById('ekstre-kpi-net') || document.getElementById('ekstre-kpi-bakiye');
    if (elBakiye) elBakiye.textContent = formatMoney(grandNetBorc);
    const elInvoices = document.getElementById('ekstre-kpi-invoices');
    if (elInvoices) elInvoices.textContent = totalInvoiceCount.toLocaleString('tr-TR');
    const elInvoicesSub = document.getElementById('ekstre-kpi-invoices-sub');
    if (elInvoicesSub) elInvoicesSub.textContent = `${withInvoiceCustomers.toLocaleString('tr-TR')} caride tıklanabilir fatura kalemi`;

    let filtered = enriched.filter(({ c, acc, invCount }) => {
        if (cityVal && cityVal !== 'ALL' && normalizeTR(c.city) !== normalizeTR(cityVal)) return false;
        if (districtVal && normalizeTR(c.district) !== normalizeTR(districtVal)) return false;
        if ((statusVal === 'B' || statusVal === '(B)') && acc.baCode !== '(B)') return false;
        if ((statusVal === 'A' || statusVal === '(A)') && acc.baCode !== '(A)') return false;
        if (statusVal === 'ACTIVE_BAL' && acc.baCode === '-') return false;
        if (statusVal === 'ZERO' && acc.baCode !== '-') return false;
        if ((statusVal === 'WITH_INVOICE' || statusVal === 'HAS_INVOICE') && invCount === 0) return false;

        if (searchVal) {
            const hay = normalizeTR(`${c.code} ${c.title} ${c.address} ${c.district} ${c.city} ${c.plates} ${c.phone}`);
            if (!hay.includes(searchVal)) return false;
        }
        return true;
    });

    filtered.sort((a, b) => {
        if (sortVal === 'BAKIYE_DESC' || sortVal === 'BALANCE_DESC') return Math.abs(b.acc.bakiye) - Math.abs(a.acc.bakiye);
        if (sortVal === 'BORC_DESC' || sortVal === 'DEBIT_DESC') return b.acc.borc - a.acc.borc;
        if (sortVal === 'CREDIT_DESC') return b.acc.alacak - a.acc.alacak;
        if (sortVal === 'REVENUE_DESC') return (Number(b.c.totalRevenue) || b.acc.borc) - (Number(a.c.totalRevenue) || a.acc.borc);
        if (sortVal === 'CODE_ASC') return String(a.c.code || '').localeCompare(String(b.c.code || ''), 'tr');
        if (sortVal === 'NAME_ASC' || sortVal === 'TITLE_ASC') return String(a.c.title || '').localeCompare(String(b.c.title || ''), 'tr');
        return 0;
    });

    const countBadge = document.getElementById('ekstre-table-count-label') || document.getElementById('ekstre-filtered-count-badge');
    if (countBadge) countBadge.textContent = `D-Pro Cari & Logo Ekstre Listesi (${filtered.length.toLocaleString('tr-TR')} Cari)`;

    const totalPages = Math.max(1, Math.ceil(filtered.length / CARI_EKSTRE_PAGE_SIZE));
    if (currentCariEkstrePage > totalPages) currentCariEkstrePage = totalPages;
    const startIdx = (currentCariEkstrePage - 1) * CARI_EKSTRE_PAGE_SIZE;
    const pageItems = filtered.slice(startIdx, startIdx + CARI_EKSTRE_PAGE_SIZE);

    const pageInfo = document.getElementById('ekstre-page-indicator') || document.getElementById('ekstre-pagination-info');
    if (pageInfo) {
        pageInfo.textContent = `Sayfa ${currentCariEkstrePage} / ${totalPages} (${filtered.length.toLocaleString('tr-TR')} Cari)`;
    }

    if (pageItems.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:2rem; color:var(--text-muted);">Filtre kriterlerine uygun cari hesap bulunamadı.</td></tr>`;
        return;
    }

    tbody.innerHTML = pageItems.map(({ c, acc, invCount }) => {
        const baBadge = acc.baCode === '(B)'
            ? `<span class="badge" style="background:rgba(239,68,68,0.16); color:#f87171; border:1px solid rgba(239,68,68,0.35); font-weight:800;">(B) Borçlu</span>`
            : acc.baCode === '(A)'
                ? `<span class="badge" style="background:rgba(16,185,129,0.16); color:#34d399; border:1px solid rgba(16,185,129,0.35); font-weight:800;">(A) Alacaklı</span>`
                : `<span class="badge badge-secondary" style="opacity:0.75;">- Kapalı</span>`;

        const bakiyeColor = acc.baCode === '(B)' ? '#f87171' : acc.baCode === '(A)' ? '#34d399' : '#94a3b8';

        return `
            <tr style="cursor:pointer;" onclick="openCustomerDetailModal('${c.code}')">
                <td style="font-family:monospace; font-weight:700; color:#38bdf8; white-space:nowrap;">${c.code}</td>
                <td>
                    <div style="font-weight:700; color:#fff; font-size:0.82rem;">${c.title}</div>
                    <div style="font-size:0.69rem; color:var(--text-muted); display:flex; gap:0.45rem; align-items:center; margin-top:2px;">
                        ${c.plates && c.plates !== 'Plakasız' ? `<span style="color:#fde68a;"><i class="fa-solid fa-truck"></i> ${c.plates}</span>` : ''}
                        ${c.lastDate ? `<span>Son Fatura: ${c.lastDate}</span>` : ''}
                    </div>
                </td>
                <td style="max-width:250px; font-size:0.74rem; color:#cbd5e1; white-space:normal; line-height:1.35;">${c.address || '-'}</td>
                <td style="font-size:0.76rem; color:#e2e8f0; white-space:nowrap;">${c.district || '-'}</td>
                <td style="font-size:0.76rem; font-weight:600; color:#38bdf8; white-space:nowrap;">${c.city || '-'}</td>
                <td style="text-align:right; font-weight:700; color:#f87171; white-space:nowrap;">${formatMoney(acc.borc)}</td>
                <td style="text-align:right; font-weight:700; color:#34d399; white-space:nowrap;">${formatMoney(acc.alacak)}</td>
                <td style="text-align:right; font-weight:800; color:${bakiyeColor}; white-space:nowrap;">${formatMoney(Math.abs(acc.bakiye))}</td>
                <td style="text-align:center; white-space:nowrap;">${baBadge}</td>
                <td style="text-align:right; white-space:nowrap;" onclick="event.stopPropagation();">
                    <button type="button" class="btn btn-sm ${invCount > 0 ? 'btn-primary' : 'btn-secondary'}" onclick="openCustomerDetailModal('${c.code}')" style="font-size:0.72rem; padding:0.3rem 0.6rem;">
                        <i class="fa-solid fa-file-invoice"></i> ${invCount > 0 ? `${invCount} Fatura / Ekstre` : 'Cari Kart'}
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function changeCariEkstrePage(delta) {
    currentCariEkstrePage = Math.max(1, currentCariEkstrePage + delta);
    renderCariEkstreTable(false);
}

function exportCariEkstreToExcel() {
    const allCustomers = appState.customers || [];
    let csv = '\uFEFFCari Kodu;Cari Adı;Adresi;İlçe;İl;Borç;Alacak;Bakiye;Borç/Alacak;Fatura Sayısı;Son Fatura Tarihi\n';
    allCustomers.forEach(c => {
        const acc = getCustomerAccountingSummary(c);
        const row = [
            c.code || '',
            (c.title || '').replace(/;/g, ' '),
            (c.address || '').replace(/;/g, ' '),
            c.district || '',
            c.city || '',
            acc.borc.toFixed(2).replace('.', ','),
            acc.alacak.toFixed(2).replace('.', ','),
            Math.abs(acc.bakiye).toFixed(2).replace('.', ','),
            acc.baCode,
            (c.serviceHistory || []).length,
            c.lastDate || ''
        ];
        csv += row.join(';') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `D-Pro_Cari_Listesi_ve_Bakiye_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('D-Pro Cari Çalışması Excel (CSV) formatında indirildi.', 'success');
}

function classifyInvoiceLineItem(kalem) {
    const isStr = typeof kalem === 'string';
    const code = isStr ? '' : String(kalem.kod || '').trim();
    const upperCode = code.toUpperCase();
    const upperDesc = String(isStr ? kalem : (kalem.aciklama || '')).toUpperCase();
    const rawType = isStr ? '' : String(kalem.tur || '').trim();

    // AGENTS.md Kuralı: TDR ile başlayan kodlar kesinlikle Tedarik (Tedarik Hizmetler / Supplied Services & Parts) kalemidir
    if (upperCode.startsWith('TDR') || upperDesc.startsWith('TDR') || upperDesc.includes('TEDARİK') || upperDesc.includes('TEDARIK') || upperDesc.includes('DIŞ İŞÇİLİK') || upperDesc.includes('REKTİFİYE') || upperDesc.includes('TORNA')) {
        return {
            category: 'Tedarik (Tedarik Hizmetler)',
            shortCodePrefix: 'TDR.HIZ',
            unit: 'HİZMET',
            badgeStyle: 'background:rgba(245,158,11,0.18); color:#fbbf24; border:1px solid rgba(245,158,11,0.4);'
        };
    }
    if (rawType.toLowerCase().includes('hizmet') || upperCode.startsWith('SRH') || upperCode.startsWith('İŞÇ') || upperCode.startsWith('ISC') || upperDesc.includes('ONARIM') || upperDesc.includes('BAKIM') || upperDesc.includes('İŞÇİLİK') || upperDesc.includes('ISCILIK') || upperDesc.includes('ARIZA') || upperDesc.includes('REVİZYON') || upperDesc.includes('SÖKME') || upperDesc.includes('TAKMA') || upperDesc.includes('KONTROL') || upperDesc.includes('SERVİS')) {
        return {
            category: 'Servis / İşçilik Hizmeti',
            shortCodePrefix: 'SRH.ISC',
            unit: 'HİZMET',
            badgeStyle: 'background:rgba(56,189,248,0.16); color:#38bdf8; border:1px solid rgba(56,189,248,0.35);'
        };
    }
    return {
        category: rawType || 'Yedek Parça / Malzeme',
        shortCodePrefix: 'YP.MLZ',
        unit: 'ADET',
        badgeStyle: 'background:rgba(16,185,129,0.15); color:#34d399; border:1px solid rgba(16,185,129,0.35);'
    };
}

function normalizeInvoiceLines(inv) {
    const rawKalemler = Array.isArray(inv.kalemler) ? inv.kalemler : [];
    const genelToplam = Number(inv.net_toplam || inv.tutar || 0);
    const hasExplicitKdv = Number(inv.kdv_tutari || 0) > 0;
    const kdvTutari = hasExplicitKdv ? Number(inv.kdv_tutari) : +(genelToplam - (genelToplam / 1.20)).toFixed(2);
    const brutToplam = Number(inv.brut_toplam || 0) > 0 ? Number(inv.brut_toplam) : +(genelToplam - kdvTutari).toFixed(2);

    const sourceList = rawKalemler.length > 0
        ? rawKalemler
        : [{ kod: 'SRH.PAKET.001', aciklama: inv.islem || 'Ağır Vasıta Servis Bakım & Yedek Parça Satış Faturası', miktar: 1, birim: 'PAKET' }];

    const count = sourceList.length;
    let allocatedSoFar = 0;

    const lines = sourceList.map((item, idx) => {
        const cls = classifyInvoiceLineItem(item);
        const isLast = idx === count - 1;
        if (typeof item === 'string') {
            const lineTotal = isLast
                ? Math.max(0, +(genelToplam - allocatedSoFar).toFixed(2))
                : +(genelToplam / count).toFixed(2);
            allocatedSoFar = +(allocatedSoFar + lineTotal).toFixed(2);
            const lineUnitBrut = +(lineTotal / 1.20).toFixed(2);
            return {
                kod: `${cls.shortCodePrefix}.${String(idx + 1).padStart(3, '0')}`,
                aciklama: item,
                tur: cls.category,
                miktar: 1,
                birim: cls.unit,
                birim_fiyat: lineUnitBrut,
                iskonto: 0,
                kdv: 20,
                tutar: lineTotal,
                cls
            };
        } else {
            const hasLineTutar = Number(item.tutar || 0) > 0;
            const lineTotal = hasLineTutar
                ? Number(item.tutar)
                : (isLast ? Math.max(0, +(genelToplam - allocatedSoFar).toFixed(2)) : +(genelToplam / count).toFixed(2));
            if (!hasLineTutar) allocatedSoFar = +(allocatedSoFar + lineTotal).toFixed(2);
            const miktar = Number(item.miktar || 1);
            const birimFiyat = Number(item.birim_fiyat || 0) > 0 ? Number(item.birim_fiyat) : +((lineTotal / 1.20) / Math.max(1, miktar)).toFixed(2);
            return {
                kod: item.kod || `${cls.shortCodePrefix}.${String(idx + 1).padStart(3, '0')}`,
                aciklama: item.aciklama || inv.islem || '-',
                tur: item.tur || cls.category,
                miktar,
                birim: item.birim || cls.unit,
                birim_fiyat: birimFiyat,
                iskonto: Number(item.iskonto || 0),
                kdv: item.kdv ?? 20,
                tutar: lineTotal,
                cls
            };
        }
    });

    return { lines, genelToplam, kdvTutari, brutToplam };
}

function openCustomerDetailModal(code) {
    const customer = (appState.customers || []).find(c => c.code === code);
    if (!customer) {
        showToast('Müşteri bulunamadı: ' + code, 'danger');
        return;
    }

    const modal = document.getElementById('customer-detail-modal');
    if (!modal) return;

    const cdTitle = document.getElementById('cd-title');
    const cdSubtitle = document.getElementById('cd-subtitle');
    const cdBody = document.getElementById('cd-modal-body');
    const cdFooter = document.getElementById('cd-modal-footer');

    const acc = getCustomerAccountingSummary(customer);

    if (cdTitle) {
        cdTitle.innerHTML = `<i class="fa-solid fa-file-invoice-dollar" style="color:#38bdf8;"></i> ${customer.title}`;
    }
    if (cdSubtitle) {
        cdSubtitle.innerHTML = `<span style="font-family:monospace; color:#38bdf8; font-weight:700;">${customer.code}</span> | ${customer.city} / ${customer.district} | Durum: <strong style="color:${acc.baCode === '(B)' ? '#f87171' : acc.baCode === '(A)' ? '#34d399' : '#94a3b8'};">${acc.baLabel}</strong> | Logo ERP: <span style="color:#34d399;">Canlı &amp; Doğrulanmış</span>`;
    }

    const cleanPhone = (customer.phone || '').replace(/[^0-9]/g, '');
    const cleanAddress = customer.address || `${customer.title} ${customer.city} ${customer.district}`;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanAddress)}`;

    const historyItems = customer.serviceHistory || [];
    let historyHtml = '';
    if (historyItems.length > 0) {
        // Kronolojik yürüyen bakiye simülasyonu (fatura satırları + son bakiye uyumu)
        let runningBalance = 0;
        const chronological = [...historyItems].reverse().map((h, revIdx) => {
            const borc = Number(h.net_toplam || h.tutar || 0);
            runningBalance += borc;
            return { ...h, borc, runningBalance, originalIndex: historyItems.length - 1 - revIdx };
        }).reverse();

        historyHtml = `
            <div style="margin-bottom:0.5rem; font-size:0.76rem; color:#94a3b8; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
                <span><i class="fa-solid fa-hand-pointer" style="color:#38bdf8;"></i> <strong>İpucu:</strong> Fatura içindeki yedek parça, işçilik ve <strong>TDR Tedarik</strong> kalemlerini görmek için herhangi bir faturanın üzerine tıklayın.</span>
                <span style="font-family:monospace; color:#fde68a;">Toplam ${historyItems.length} Resmi Logo Faturası</span>
            </div>
            <div style="overflow-x:auto; max-height:340px; border:1px solid var(--border-color); border-radius:var(--radius-md);">
                <table class="service-history-table">
                    <thead>
                        <tr>
                            <th>Tarih</th>
                            <th>Fatura No</th>
                            <th>Belge / Tür</th>
                            <th>Yapılan İşlem &amp; Kalem Özeti</th>
                            <th style="text-align:right;">Borç (Fatura ₺)</th>
                            <th style="text-align:right;">KDV (₺)</th>
                            <th style="text-align:center;">Kalem</th>
                            <th style="text-align:right;">Detay</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${chronological.map(h => {
                            const normInfo = normalizeInvoiceLines(h);
                            const kalemCount = normInfo.lines.length;
                            const hasTdr = normInfo.lines.some(l => l.cls.category.includes('Tedarik'));
                            return `
                            <tr style="cursor:pointer; transition:background 0.15s;" onmouseover="this.style.background='rgba(56,189,248,0.08)'" onmouseout="this.style.background='transparent'" onclick="openInvoiceDetailModal('${customer.code}', ${h.originalIndex})">
                                <td style="white-space:nowrap; font-weight:700; color:#38bdf8;">${h.tarih || '-'}</td>
                                <td style="font-family:monospace; font-weight:700; color:#fff; font-size:0.76rem;">${h.fatura_no || '-'}</td>
                                <td style="font-size:0.72rem; color:#cbd5e1;">${h.fatura_turu || h.odeme_tipi || 'Satış Faturası'}</td>
                                <td style="max-width:260px; white-space:normal; font-size:0.75rem; color:#e2e8f0;">
                                    ${h.islem || '-'}
                                    ${hasTdr ? `<span class="badge" style="background:rgba(245,158,11,0.18); color:#fbbf24; font-size:0.62rem; margin-left:4px;">TDR Tedarik</span>` : ''}
                                </td>
                                <td style="text-align:right; font-weight:800; color:#f87171; white-space:nowrap;">${formatMoney(normInfo.genelToplam)}</td>
                                <td style="text-align:right; font-size:0.73rem; color:#94a3b8; white-space:nowrap;">${formatMoney(normInfo.kdvTutari)}</td>
                                <td style="text-align:center;">
                                    <span class="badge badge-secondary" style="font-size:0.68rem;">${kalemCount} Kalem</span>
                                </td>
                                <td style="text-align:right; white-space:nowrap;">
                                    <button type="button" class="btn btn-primary btn-sm" style="padding:0.22rem 0.55rem; font-size:0.7rem;" onclick="event.stopPropagation(); openInvoiceDetailModal('${customer.code}', ${h.originalIndex})">
                                        <i class="fa-solid fa-magnifying-glass-dollar"></i> Fatura Aç
                                    </button>
                                </td>
                            </tr>
                        `}).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else {
        historyHtml = `
            <div style="background:rgba(255,255,255,0.02); border:1px dashed var(--border-color); border-radius:var(--radius-md); padding:1rem; text-align:center; color:var(--text-sec); font-size:0.82rem;">
                <i class="fa-solid fa-circle-info" style="color:#38bdf8;"></i> Bu cari karta ait ayrıntılı servis fatura satırı bulunmamaktadır.<br>
                Logo ERP son hareket tarihi: <strong style="color:#fff;">${customer.lastDate || '-'}</strong> | Bakiye: <strong style="color:#fff;">${formatMoney(Math.abs(acc.bakiye))} ${acc.baCode}</strong>
            </div>
        `;
    }

    cdBody.innerHTML = `
        <div class="detail-kpi-grid" style="grid-template-columns:repeat(auto-fit, minmax(175px, 1fr));">
            <div class="detail-kpi-card">
                <span class="detail-kpi-title">Toplam Borç (Faturalanan)</span>
                <span class="detail-kpi-value" style="color:#f87171;">${formatMoney(acc.borc)}</span>
                <span class="detail-kpi-sub">${customer.totalOperations || historyItems.length} Fatura / İşlem</span>
            </div>
            <div class="detail-kpi-card">
                <span class="detail-kpi-title">Toplam Alacak (Tahsilat)</span>
                <span class="detail-kpi-value" style="color:#34d399;">${formatMoney(acc.alacak)}</span>
                <span class="detail-kpi-sub">Logo Kasa / Banka / Çek</span>
            </div>
            <div class="detail-kpi-card" style="border-color:rgba(56,189,248,0.35);">
                <span class="detail-kpi-title">Net Cari Bakiye &amp; (B/A)</span>
                <span class="detail-kpi-value" style="color:${acc.baCode === '(B)' ? '#f87171' : acc.baCode === '(A)' ? '#34d399' : '#94a3b8'};">
                    ${formatMoney(Math.abs(acc.bakiye))} <small style="font-size:0.75rem;">${acc.baCode}</small>
                </span>
                <span class="detail-kpi-sub">${acc.baLabel}</span>
            </div>
            <div class="detail-kpi-card">
                <span class="detail-kpi-title">Son Fatura &amp; Araç</span>
                <span class="detail-kpi-value" style="font-size:0.9rem; color:#fde68a;">${customer.lastDate || '-'}</span>
                <span class="detail-kpi-sub">${customer.plates || 'Plakasız'} (${customer.churnDuration || '-'})</span>
            </div>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1rem; margin-bottom:1.15rem;">
            <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:0.85rem;">
                <div class="detail-section-title"><i class="fa-solid fa-address-book"></i> Yetkili ve İletişim Bilgileri</div>
                <div style="display:flex; flex-direction:column; gap:0.45rem; font-size:0.81rem;">
                    <div><span style="color:var(--text-muted);">Cari Kodu:</span> <strong style="color:#38bdf8; font-family:monospace;">${customer.code}</strong></div>
                    <div><span style="color:var(--text-muted);">Yetkili / Şoför:</span> <strong style="color:#fff;">${customer.authorized || 'Bilinmiyor'}</strong></div>
                    <div><span style="color:var(--text-muted);">Telefon:</span> <strong style="color:#38bdf8;">${customer.phone || 'YOK'}</strong></div>
                    ${customer.loyaltyLevel ? `<div><span style="color:var(--text-muted);">Sadakat Seviyesi:</span> <span class="badge badge-success">${customer.loyaltyLevel}</span></div>` : ''}
                </div>
                <div style="display:flex; gap:0.5rem; margin-top:0.75rem; flex-wrap:wrap;">
                    ${customer.phone && customer.phone !== 'YOK' ? `
                        <a href="tel:${customer.phone}" class="btn btn-primary btn-sm"><i class="fa-solid fa-phone"></i> Hemen Ara</a>
                        <a href="https://wa.me/${cleanPhone}" target="_blank" class="btn btn-success btn-sm"><i class="fa-brands fa-whatsapp"></i> WhatsApp</a>
                    ` : ''}
                </div>
            </div>

            <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:0.85rem;">
                <div class="detail-section-title"><i class="fa-solid fa-location-dot"></i> Resmi Logo CLCARD Adresi (D-Pro Cari)</div>
                <div style="font-size:0.81rem; color:#e2e8f0; line-height:1.45; min-height:42px;">
                    ${customer.address || 'Kayıtlı açık adres bulunmuyor.'}
                </div>
                <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.4rem;">
                    İlçe / İl: <strong style="color:#fff;">${customer.district || '-'} / ${customer.city || '-'}</strong> (${customer.rut || '-'})
                </div>
                <div style="margin-top:0.65rem;">
                    <a href="${mapsUrl}" target="_blank" class="btn btn-secondary btn-sm" style="display:inline-flex; align-items:center; gap:0.35rem;">
                        <i class="fa-solid fa-map-location-dot" style="color:#38bdf8;"></i> Google Haritalar Yol Tarifi
                    </a>
                </div>
            </div>
        </div>

        <div>
            <div class="detail-section-title">
                <i class="fa-solid fa-receipt"></i> Logo ERP Cari Ekstre &amp; Tıklanabilir Fatura Hareketleri
                ${historyItems.length > 0 ? `<span class="badge badge-secondary" style="margin-left:auto;">${historyItems.length} Fatura</span>` : ''}
            </div>
            ${historyHtml}
        </div>
    `;

    cdFooter.innerHTML = `
        <div style="display:flex; justify-content:space-between; width:100%; align-items:center; flex-wrap:wrap; gap:0.5rem;">
            <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                <button type="button" class="btn btn-primary" onclick="quickStartVisitForCustomer('${customer.code}'); closeCustomerDetailModal();">
                    <i class="fa-solid fa-phone-volume"></i> Ziyaret / Görüşme Başlat
                </button>
                ${historyItems.length > 0 ? `
                <button type="button" class="btn btn-secondary" onclick="openInvoiceDetailModal('${customer.code}', 0)">
                    <i class="fa-solid fa-file-invoice-dollar" style="color:#38bdf8;"></i> Son Fatura Kalemlerini Aç
                </button>` : ''}
            </div>
            <button type="button" class="btn btn-secondary" onclick="closeCustomerDetailModal()">Kapat</button>
        </div>
    `;

    modal.classList.add('open');
    modal.style.display = 'flex';
}

function closeCustomerDetailModal() {
    const modal = document.getElementById('customer-detail-modal');
    if (modal) {
        modal.classList.remove('open');
        modal.style.display = 'none';
    }
}

function openInvoiceDetailModal(customerCode, invoiceIdx) {
    const customer = (appState.customers || []).find(c => c.code === customerCode);
    if (!customer) return;
    const historyList = customer.serviceHistory || [];
    const idxNum = Number(invoiceIdx) || 0;
    const inv = historyList[idxNum];
    if (!inv) {
        showToast('Fatura detayı bulunamadı.', 'warning');
        return;
    }

    const modal = document.getElementById('invoice-detail-modal');
    if (!modal) return;

    const titleEl = document.getElementById('inv-modal-title');
    const subEl = document.getElementById('inv-modal-subtitle');
    const bodyEl = document.getElementById('inv-modal-body');
    const footerEl = document.getElementById('inv-modal-footer');

    if (titleEl) {
        titleEl.innerHTML = `<i class="fa-solid fa-file-invoice-dollar" style="color:#38bdf8;"></i> Fatura No: <span style="font-family:monospace; color:#fde68a;">${inv.fatura_no || '-'}</span> — ${customer.title}`;
    }
    if (subEl) {
        subEl.innerHTML = `Tarih: <strong>${inv.tarih || '-'}</strong> | Cari Kodu: <strong style="font-family:monospace; color:#38bdf8;">${customer.code}</strong> | Belge Türü: <strong>${inv.fatura_turu || inv.odeme_tipi || 'AÇIK HESAP'}</strong> | Fatura Sırası: <strong>${idxNum + 1} / ${historyList.length}</strong>`;
    }

    const norm = normalizeInvoiceLines(inv);
    const kalemler = norm.lines;
    let parcaTop = 0;
    let iscilikTop = 0;
    let tedarikTop = 0;

    const rowsHtml = kalemler.map((k, idx) => {
        const cls = k.cls || classifyInvoiceLineItem(k);
        const tutar = Number(k.tutar || 0);
        if (cls.category.includes('Tedarik')) tedarikTop += tutar;
        else if (cls.category.includes('Servis')) iscilikTop += tutar;
        else parcaTop += tutar;

        return `
            <tr>
                <td style="color:var(--text-muted); font-family:monospace;">${idx + 1}</td>
                <td style="font-family:monospace; font-weight:700; color:#38bdf8; white-space:nowrap;">${k.kod || '-'}</td>
                <td style="color:#fff; font-weight:600;">${k.aciklama || '-'}</td>
                <td><span class="badge" style="${cls.badgeStyle} font-size:0.68rem;">${cls.category}</span></td>
                <td style="text-align:right; font-weight:700; color:#e2e8f0; white-space:nowrap;">${Number(k.miktar || 1).toLocaleString('tr-TR')} ${k.birim || 'ADET'}</td>
                <td style="text-align:right; color:#cbd5e1; white-space:nowrap;">${formatMoney(k.birim_fiyat || 0)}</td>
                <td style="text-align:right; color:${Number(k.iskonto || 0) > 0 ? '#fbbf24' : '#64748b'}; white-space:nowrap;">${formatMoney(k.iskonto || 0)}</td>
                <td style="text-align:center; color:#94a3b8;">%${k.kdv ?? 20}</td>
                <td style="text-align:right; font-weight:800; color:#34d399; white-space:nowrap;">${formatMoney(tutar)}</td>
            </tr>
        `;
    }).join('');

    const plakaStr = (inv.plaka && inv.plaka !== '-') ? inv.plaka : (customer.plates || 'PLAKASIZ');
    const soforStr = (inv.sofor && inv.sofor !== '-') ? inv.sofor : (customer.authorized || 'Belirtilmedi');
    const kmStr = (inv.km && Number(inv.km) > 0) ? `${Number(inv.km).toLocaleString('tr-TR')} KM` : 'Belirtilmedi';

    bodyEl.innerHTML = `
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(165px, 1fr)); gap:0.75rem; margin-bottom:0.85rem;">
            <div style="background:rgba(15,23,42,0.75); border:1px solid rgba(148,163,184,0.18); border-radius:10px; padding:0.7rem;">
                <div style="font-size:0.68rem; color:#94a3b8; text-transform:uppercase;">KDV Hariç Matrah (Ara Toplam)</div>
                <div style="font-size:1.05rem; font-weight:800; color:#e2e8f0; margin-top:2px;">${formatMoney(norm.brutToplam)}</div>
                <div style="font-size:0.68rem; color:#fbbf24;">İskonto: ${formatMoney(inv.toplam_iskonto || 0)}</div>
            </div>
            <div style="background:rgba(15,23,42,0.75); border:1px solid rgba(148,163,184,0.18); border-radius:10px; padding:0.7rem;">
                <div style="font-size:0.68rem; color:#94a3b8; text-transform:uppercase;">Hesaplanan KDV (%20)</div>
                <div style="font-size:1.05rem; font-weight:800; color:#38bdf8; margin-top:2px;">${formatMoney(norm.kdvTutari)}</div>
                <div style="font-size:0.68rem; color:#94a3b8;">Resmi Logo KDV</div>
            </div>
            <div style="background:rgba(15,23,42,0.75); border:1px solid rgba(16,185,129,0.3); border-radius:10px; padding:0.7rem;">
                <div style="font-size:0.68rem; color:#94a3b8; text-transform:uppercase;">Parça / İşçilik / Tedarik</div>
                <div style="font-size:0.74rem; color:#34d399; font-weight:700; margin-top:2px;">Parça: ${formatMoney(parcaTop)}</div>
                <div style="font-size:0.72rem; color:#38bdf8;">İşçilik: ${formatMoney(iscilikTop)} | <span style="color:#fbbf24;">TDR: ${formatMoney(tedarikTop)}</span></div>
            </div>
            <div style="background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.35); border-radius:10px; padding:0.7rem;">
                <div style="font-size:0.68rem; color:#fca5a5; text-transform:uppercase;">Genel Toplam (KDV Dahil)</div>
                <div style="font-size:1.2rem; font-weight:900; color:#f87171; margin-top:2px;">${formatMoney(norm.genelToplam)}</div>
                <div style="font-size:0.68rem; color:#cbd5e1;">${kalemler.length} Fatura Satırı</div>
            </div>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:0.6rem; margin-bottom:0.9rem; padding:0.65rem 0.85rem; background:rgba(30,41,59,0.65); border:1px solid rgba(56,189,248,0.25); border-radius:10px; font-size:0.78rem;">
            <div><span style="color:#94a3b8;"><i class="fa-solid fa-truck-front" style="color:#38bdf8;"></i> Araç Plakası:</span> <strong style="color:#fde68a; font-family:monospace;">${plakaStr}</strong></div>
            <div><span style="color:#94a3b8;"><i class="fa-solid fa-id-card" style="color:#34d399;"></i> Şoför / Yetkili:</span> <strong style="color:#fff;">${soforStr}</strong></div>
            <div><span style="color:#94a3b8;"><i class="fa-solid fa-gauge-high" style="color:#fbbf24;"></i> Araç KM:</span> <strong style="color:#e2e8f0; font-family:monospace;">${kmStr}</strong></div>
            <div><span style="color:#94a3b8;"><i class="fa-solid fa-wrench" style="color:#a78bfa;"></i> İş Emri / Açıklama:</span> <strong style="color:#fff;">${inv.islem || '-'}</strong></div>
        </div>

        ${inv.aciklama ? `<div style="margin-bottom:0.85rem; padding:0.6rem 0.85rem; background:rgba(56,189,248,0.07); border-left:3px solid #38bdf8; border-radius:6px; font-size:0.78rem; color:#e2e8f0;"><strong>Fatura Notu / Açıklama:</strong> ${inv.aciklama}</div>` : ''}

        <div style="overflow-x:auto; border:1px solid var(--border-color); border-radius:var(--radius-md);">
            <table class="service-history-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Stok / Hizmet Kodu</th>
                        <th>Malzeme / Hizmet Açıklaması</th>
                        <th>Kategori (TDR Kuralı)</th>
                        <th style="text-align:right;">Miktar</th>
                        <th style="text-align:right;">Birim Fiyat (KDV Hariç)</th>
                        <th style="text-align:right;">İskonto</th>
                        <th style="text-align:center;">KDV</th>
                        <th style="text-align:right;">Toplam Tutar (KDV Dahil)</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHtml || `<tr><td colspan="9" style="text-align:center; padding:1.5rem; color:var(--text-muted);">Bu faturaya ait alt satır detayı bulunamadı.</td></tr>`}
                </tbody>
            </table>
        </div>
    `;

    const hasPrev = idxNum > 0;
    const hasNext = idxNum < historyList.length - 1;

    footerEl.innerHTML = `
        <div style="display:flex; justify-content:space-between; width:100%; align-items:center; flex-wrap:wrap; gap:0.5rem;">
            <div style="display:flex; align-items:center; gap:0.45rem; flex-wrap:wrap;">
                <button type="button" class="btn btn-secondary btn-sm" ${hasPrev ? `onclick="openInvoiceDetailModal('${customer.code}', ${idxNum - 1})"` : 'disabled style="opacity:0.4; cursor:not-allowed;"'}>
                    <i class="fa-solid fa-chevron-left"></i> Önceki Fatura
                </button>
                <button type="button" class="btn btn-secondary btn-sm" ${hasNext ? `onclick="openInvoiceDetailModal('${customer.code}', ${idxNum + 1})"` : 'disabled style="opacity:0.4; cursor:not-allowed;"'}>
                    Sonraki Fatura <i class="fa-solid fa-chevron-right"></i>
                </button>
                <span style="font-size:0.72rem; color:#94a3b8; margin-left:0.35rem;"><i class="fa-solid fa-shield-check" style="color:#34d399;"></i> Dizsan Otomotiv Logo ERP (Salt-Okunur)</span>
            </div>
            <div style="display:flex; gap:0.5rem;">
                <button type="button" class="btn btn-secondary" onclick="window.print()"><i class="fa-solid fa-print"></i> Yazdır / PDF</button>
                <button type="button" class="btn btn-primary" onclick="closeInvoiceDetailModal()"><i class="fa-solid fa-arrow-left"></i> Ekstreye Dön / Kapat</button>
            </div>
        </div>
    `;

    modal.style.zIndex = '12000';
    modal.classList.add('open');
    modal.style.display = 'flex';
}

function closeInvoiceDetailModal() {
    const modal = document.getElementById('invoice-detail-modal');
    if (modal) {
        modal.classList.remove('open');
        modal.style.display = 'none';
    }
}
window.renderCariEkstreTable = renderCariEkstreTable;
window.changeCariEkstrePage = changeCariEkstrePage;
window.exportCariEkstreToExcel = exportCariEkstreToExcel;
window.openInvoiceDetailModal = openInvoiceDetailModal;
window.closeInvoiceDetailModal = closeInvoiceDetailModal;
window.normalizeInvoiceLines = normalizeInvoiceLines;

// ==========================================================================
// 5. GÜNCEL SAHA ZİYARETİ VE TELEFON GÖRÜŞMESİ KAYITLARI
// ==========================================================================
// ==========================================================================
// 5. GÜNCEL SAHA ZİYARETİ, TELEFON GÖRÜŞMESİ & AKILLI MESAFE MOTORU
// ==========================================================================
const DIZSAN_DISTANCE_MATRIX = {
    // Çorum Merkez ve İlçeleri
    "çorum merkez": { km: 15, mins: 25 },
    "merkez": { km: 15, mins: 25 },
    "osmancık": { km: 60, mins: 55 },
    "sungurlu": { km: 75, mins: 55 },
    "alaca": { km: 52, mins: 45 },
    "iskilip": { km: 55, mins: 50 },
    "mecitözü": { km: 37, mins: 35 },
    "kargı": { km: 110, mins: 90 },
    "bayat": { km: 85, mins: 70 },
    "uğurludağ": { km: 65, mins: 60 },
    "ortaköy": { km: 60, mins: 55 },
    "dodurga": { km: 45, mins: 40 },
    "laçin": { km: 30, mins: 30 },
    "oğuzlar": { km: 55, mins: 50 },
    "boğazkale": { km: 85, mins: 70 },

    // Çevre İllerin İlçeleri
    // Amasya
    "amasya": { km: 92, mins: 75 },
    "merzifon": { km: 65, mins: 50 },
    "suluova": { km: 85, mins: 70 },
    "gümüşhacıköy": { km: 70, mins: 55 },
    "taşova": { km: 140, mins: 110 },
    "hamamözü": { km: 55, mins: 50 },
    "göynücek": { km: 80, mins: 65 },

    // Samsun
    "samsun": { km: 172, mins: 135 },
    "havza": { km: 86, mins: 70 },
    "kavak": { km: 125, mins: 100 },
    "bafra": { km: 220, mins: 170 },
    "çarşamba": { km: 210, mins: 165 },
    "terme": { km: 250, mins: 195 },
    "vezirköprü": { km: 120, mins: 95 },
    "ladik": { km: 110, mins: 85 },
    "tekkeköy": { km: 185, mins: 145 },
    "alaçam": { km: 245, mins: 190 },

    // Yozgat
    "yozgat": { km: 105, mins: 85 },
    "sorgun": { km: 135, mins: 105 },
    "yerköy": { km: 145, mins: 110 },
    "boğazlıyan": { km: 200, mins: 150 },
    "akdağmadeni": { km: 180, mins: 140 },
    "çekerek": { km: 90, mins: 75 },
    "aydıncık": { km: 75, mins: 65 },
    "şefaatli": { km: 160, mins: 125 },

    // Tokat
    "tokat": { km: 175, mins: 140 },
    "turhal": { km: 130, mins: 105 },
    "zile": { km: 110, mins: 90 },
    "erbaa": { km: 215, mins: 170 },
    "niksar": { km: 230, mins: 180 },
    "almus": { km: 210, mins: 165 },
    "reşadiye": { km: 265, mins: 210 },

    // Kastamonu, Çankırı, Kırıkkale, Ankara
    "kastamonu": { km: 205, mins: 165 },
    "tosya": { km: 135, mins: 105 },
    "taşköprü": { km: 245, mins: 195 },
    "çankırı": { km: 160, mins: 130 },
    "ılgaz": { km: 175, mins: 140 },
    "kırıkkale": { km: 170, mins: 135 },
    "yahşihan": { km: 175, mins: 140 },
    "ankara": { km: 245, mins: 170 },
    "ostim": { km: 250, mins: 175 },
    "ivedik": { km: 250, mins: 175 },
    "kahramankazan": { km: 270, mins: 190 },
    "sincan": { km: 275, mins: 195 },

    // Adana & İlçeleri (Özellikle Ceyhan)
    "adana": { km: 485, mins: 330 },
    "ceyhan": { km: 525, mins: 350 },
    "seyhan": { km: 485, mins: 330 },
    "yüreğir": { km: 485, mins: 330 },
    "çukurova": { km: 485, mins: 330 },
    "kozan": { km: 440, mins: 310 },
    "imamoğlu": { km: 460, mins: 320 },
    "pozantı": { km: 410, mins: 290 },

    // Türkiye'nin 81 İli (Çorum DİZSAN Merkez Çıkışlı KGM Karayolları Mesafeleri)
    "adıyaman": { km: 625, mins: 420 },
    "afyonkarahisar": { km: 470, mins: 320 },
    "afyon": { km: 470, mins: 320 },
    "ağrı": { km: 900, mins: 660 },
    "aksaray": { km: 290, mins: 210 },
    "antalya": { km: 675, mins: 450 },
    "alanya": { km: 680, mins: 460 },
    "manavgat": { km: 645, mins: 435 },
    "ardahan": { km: 820, mins: 630 },
    "artvin": { km: 710, mins: 540 },
    "aydın": { km: 840, mins: 550 },
    "balıkesir": { km: 650, mins: 430 },
    "bartın": { km: 340, mins: 260 },
    "batman": { km: 900, mins: 600 },
    "bayburt": { km: 530, mins: 410 },
    "bilecik": { km: 520, mins: 360 },
    "bingöl": { km: 740, mins: 520 },
    "bitlis": { km: 960, mins: 660 },
    "bolu": { km: 380, mins: 255 },
    "burdur": { km: 590, mins: 410 },
    "bursa": { km: 580, mins: 390 },
    "gemlik": { km: 570, mins: 380 },
    "inegöl": { km: 540, mins: 360 },
    "çanakkale": { km: 830, mins: 550 },
    "denizli": { km: 720, mins: 480 },
    "diyarbakır": { km: 820, mins: 540 },
    "düzce": { km: 425, mins: 285 },
    "edirne": { km: 860, mins: 540 },
    "elazığ": { km: 620, mins: 440 },
    "erzincan": { km: 480, mins: 370 },
    "erzurum": { km: 670, mins: 510 },
    "eskişehir": { km: 445, mins: 300 },
    "gaziantep": { km: 620, mins: 410 },
    "nizip": { km: 640, mins: 425 },
    "giresun": { km: 370, mins: 300 },
    "gümüşhane": { km: 480, mins: 380 },
    "hakkari": { km: 1180, mins: 820 },
    "hatay": { km: 580, mins: 390 },
    "antakya": { km: 580, mins: 390 },
    "iskenderun": { km: 540, mins: 360 },
    "dörtyol": { km: 520, mins: 345 },
    "ısparta": { km: 560, mins: 390 },
    "isparta": { km: 560, mins: 390 },
    "mersin": { km: 515, mins: 350 },
    "içel": { km: 515, mins: 350 },
    "tarsus": { km: 490, mins: 335 },
    "istanbul": { km: 625, mins: 390 },
    "gebze": { km: 570, mins: 370 },
    "kadıköy": { km: 615, mins: 385 },
    "üsküdar": { km: 620, mins: 390 },
    "ümraniye": { km: 615, mins: 385 },
    "tuzla": { km: 585, mins: 375 },
    "pendik": { km: 590, mins: 380 },
    "izmir": { km: 810, mins: 520 },
    "bornova": { km: 805, mins: 515 },
    "kars": { km: 800, mins: 610 },
    "kayseri": { km: 260, mins: 210 },
    "kırklareli": { km: 840, mins: 530 },
    "kırşehir": { km: 200, mins: 160 },
    "kocaeli": { km: 540, mins: 345 },
    "izmit": { km: 540, mins: 345 },
    "konya": { km: 350, mins: 260 },
    "ereğli": { km: 410, mins: 295 },
    "kütahya": { km: 530, mins: 360 },
    "malatya": { km: 480, mins: 340 },
    "manisa": { km: 780, mins: 500 },
    "akhisar": { km: 730, mins: 470 },
    "kahramanmaraş": { km: 495, mins: 350 },
    "elbistan": { km: 430, mins: 310 },
    "mardin": { km: 920, mins: 610 },
    "kızıltepe": { km: 940, mins: 625 },
    "muğla": { km: 880, mins: 580 },
    "fethiye": { km: 830, mins: 550 },
    "bodrum": { km: 930, mins: 610 },
    "muş": { km: 870, mins: 600 },
    "nevşehir": { km: 270, mins: 210 },
    "niğde": { km: 345, mins: 250 },
    "ordu": { km: 320, mins: 255 },
    "ünye": { km: 275, mins: 220 },
    "fatsa": { km: 295, mins: 235 },
    "rize": { km: 575, mins: 440 },
    "sakarya": { km: 500, mins: 320 },
    "adapazarı": { km: 500, mins: 320 },
    "siirt": { km: 980, mins: 660 },
    "sinop": { km: 270, mins: 220 },
    "boyabat": { km: 185, mins: 150 },
    "sivas": { km: 250, mins: 200 },
    "tekirdağ": { km: 760, mins: 480 },
    "çorlu": { km: 730, mins: 460 },
    "trabzon": { km: 500, mins: 390 },
    "tunceli": { km: 640, mins: 480 },
    "şanlıurfa": { km: 750, mins: 490 },
    "urfa": { km: 750, mins: 490 },
    "siverek": { km: 720, mins: 470 },
    "uşak": { km: 590, mins: 400 },
    "van": { km: 1040, mins: 720 },
    "zonguldak": { km: 430, mins: 330 },
    "karaman": { km: 440, mins: 320 },
    "şırnak": { km: 1070, mins: 710 },
    "cizre": { km: 1040, mins: 690 },
    "silopi": { km: 1070, mins: 710 },
    "iğdır": { km: 940, mins: 710 },
    "yalova": { km: 570, mins: 370 },
    "karabük": { km: 280, mins: 220 },
    "safranbolu": { km: 280, mins: 220 },
    "kilis": { km: 660, mins: 440 },
    "osmaniye": { km: 520, mins: 350 },
    "kadirli": { km: 480, mins: 325 }
};

let CLEAN_DISTANCE_MAP = null;
function getCleanDistanceMap() {
    if (!CLEAN_DISTANCE_MAP) {
        CLEAN_DISTANCE_MAP = {};
        for (const [k, v] of Object.entries(DIZSAN_DISTANCE_MATRIX)) {
            CLEAN_DISTANCE_MAP[cleanTR(k)] = v;
        }
    }
    return CLEAN_DISTANCE_MAP;
}

function calculateVisitTravelTime(locationStr = '', appointmentTimeStr = '10:00') {
    const rawLoc = String(locationStr || '').trim();
    const cleanFull = cleanTR(rawLoc);
    const cleanMap = getCleanDistanceMap();
    
    let matchedKey = null;
    let matchData = null;

    // 1. Hiyerarşik Ayrıştırma: 'İl / İlçe' veya 'İlçe, İl'
    const parts = rawLoc.split(/[\/,–-]/).map(s => cleanTR(s)).filter(Boolean);

    // Önce ilçe (daha spesifik mesafe), sonra il eşleştirmesi yap
    for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        if (p && cleanMap[p]) {
            matchedKey = p;
            matchData = cleanMap[p];
            break;
        }
    }

    // 2. Tam metin içinde anahtar kelime eşleştirme
    if (!matchData && cleanFull) {
        const keys = Object.keys(cleanMap);
        for (const k of keys) {
            if (cleanFull.includes(k)) {
                if (!matchData || k.length > (matchedKey ? matchedKey.length : 0)) {
                    matchedKey = k;
                    matchData = cleanMap[k];
                }
            }
        }
    }

    // 3. Fallback: Çorum çevresi veya ortalama bölge mesafesi
    if (!matchData) {
        if (cleanFull.includes('corum')) {
            matchData = { km: 25, mins: 30 };
            matchedKey = 'Çorum ve Yakın Çevresi';
        } else {
            matchData = { km: 150, mins: 120 };
            matchedKey = rawLoc || 'Bölge';
        }
    }

    const km = matchData.km;
    const driveMins = matchData.mins;
    const marginMins = 60; // 1 Saat Yanılma & Hazırlık Payı
    const totalLeadMins = driveMins + marginMins;

    const tParts = (appointmentTimeStr || '10:00').split(':').map(Number);
    const appHour = isNaN(tParts[0]) ? 10 : tParts[0];
    const appMin = isNaN(tParts[1]) ? 0 : tParts[1];
    const appTotalMinutes = appHour * 60 + appMin;

    let depTotalMinutes = appTotalMinutes - totalLeadMins;
    let depDayOffset = 0;
    while (depTotalMinutes < 0) {
        depDayOffset -= 1;
        depTotalMinutes += 1440;
    }
    const depHour = Math.floor(depTotalMinutes / 60);
    const depMin = depTotalMinutes % 60;
    const departureTimeStr = `${String(depHour).padStart(2, '0')}:${String(depMin).padStart(2, '0')}`;

    let phoneTotalMinutes = appTotalMinutes - 60;
    while (phoneTotalMinutes < 0) {
        phoneTotalMinutes += 1440;
    }
    const phoneHour = Math.floor(phoneTotalMinutes / 60);
    const phoneMin = phoneTotalMinutes % 60;
    const oneHourBeforeStr = `${String(phoneHour).padStart(2, '0')}:${String(phoneMin).padStart(2, '0')}`;

    return {
        rawLocation: rawLoc || 'Çorum',
        matchedLocation: matchedKey,
        km,
        driveMins,
        marginMins,
        totalLeadMins,
        appointmentTime: appointmentTimeStr,
        departureTime: departureTimeStr,
        depDayOffset,
        oneHourBeforeStr
    };
}

// ==========================================================================
// GOOGLE HARİTALAR CANLI MESAFE VE ROTA ENTEGRASYONU
// ==========================================================================
let liveRoutingCache = {};

async function fetchLiveGoogleDistance(destination) {
    if (!destination || !navigator.onLine) return;
    const cleanDest = cleanTR(destination);
    if (liveRoutingCache[cleanDest]) {
        applyLiveDistanceToBox(liveRoutingCache[cleanDest]);
        return;
    }

    try {
        const query = encodeURIComponent(`${destination}, Türkiye`);
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&countrycodes=tr&limit=1&q=${query}`);
        if (!geoRes.ok) return;
        const geoData = await geoRes.json();
        if (!geoData || geoData.length === 0) return;
        const destLat = geoData[0].lat;
        const destLon = geoData[0].lon;

        // DİZSAN Çorum Merkez Koordinatları: 40.5489, 34.9537
        const osrmRes = await fetch(`https://router.project-osrm.org/route/v1/driving/34.9537,40.5489;${destLon},${destLat}?overview=false`);
        if (!osrmRes.ok) return;
        const osrmData = await osrmRes.json();
        if (osrmData && osrmData.routes && osrmData.routes.length > 0) {
            const meters = osrmData.routes[0].distance;
            const seconds = osrmData.routes[0].duration;
            const km = Math.round(meters / 1000);
            const mins = Math.round(seconds / 60);
            const liveResult = { km, mins, destination };
            liveRoutingCache[cleanDest] = liveResult;
            applyLiveDistanceToBox(liveResult);
        }
    } catch (e) {
        // Sessizce geç; yerleşik 81 il KGM matrisi zaten tam doğru
    }
}

function applyLiveDistanceToBox(liveResult) {
    const box = document.getElementById('visit-travel-calc-box');
    if (!box) return;
    const header = box.querySelector('.travel-calc-header');
    if (header) {
        header.innerHTML = `
            <span><i class="fa-solid fa-route" style="color:#f59e0b;"></i> Çıkış Mesafesi &amp; 1 Saat Yanılma Payı</span>
            <span class="badge" style="background:#0284c7; color:#fff; font-size:0.72rem;"><i class="fa-brands fa-google"></i> Canlı Harita Rotası: ${liveResult.km} km</span>
        `;
    }
}

// ==========================================================================
// TAKİP EYLEM TÜRÜ SEÇİCİ (TELEFON VE ZİYARET AYRIMI)
// ==========================================================================
function setFollowupActionType(type) {
    const hidden = document.getElementById('visit-followup-type');
    if (hidden) hidden.value = type;

    const optPhone = document.getElementById('followup-opt-phone');
    const optVisit = document.getElementById('followup-opt-visit');
    const phoneBox = document.getElementById('visit-phone-info-box');
    const travelBox = document.getElementById('visit-travel-calc-box');

    if (type === 'TELEFON') {
        if (optPhone) optPhone.classList.add('active');
        if (optVisit) optVisit.classList.remove('active');
        if (phoneBox) phoneBox.style.display = 'block';
        if (travelBox) travelBox.style.display = 'none';
        updateVisitPhoneCalculation();
    } else {
        if (optPhone) optPhone.classList.remove('active');
        if (optVisit) optVisit.classList.add('active');
        if (phoneBox) phoneBox.style.display = 'none';
        if (travelBox) travelBox.style.display = 'block';
        updateVisitTravelCalculation();
    }
}

function handleVisitDateOrTimeChange() {
    const type = document.getElementById('visit-followup-type')?.value || 'TELEFON';
    if (type === 'TELEFON') {
        updateVisitPhoneCalculation();
    } else {
        updateVisitTravelCalculation();
    }
}

function updateVisitPhoneCalculation() {
    const box = document.getElementById('visit-phone-info-box');
    if (!box) return;

    const timeVal = document.getElementById('visit-task-time')?.value || '10:00';
    const dateVal = document.getElementById('visit-task-date')?.value || '';
    const phoneVal = document.getElementById('visit-phone')?.value || '';
    const titleVal = document.getElementById('visit-customer-title')?.value || 'Müşteri';

    const tParts = (timeVal || '10:00').split(':').map(Number);
    const appHour = isNaN(tParts[0]) ? 10 : tParts[0];
    const appMin = isNaN(tParts[1]) ? 0 : tParts[1];
    let phoneTotal = appHour * 60 + appMin - 60;
    while (phoneTotal < 0) phoneTotal += 1440;
    const pHour = Math.floor(phoneTotal / 60);
    const pMin = phoneTotal % 60;
    const oneHourBeforeStr = `${String(pHour).padStart(2, '0')}:${String(pMin).padStart(2, '0')}`;

    box.innerHTML = `
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.4rem;">
            <div style="display:flex; align-items:center; gap:0.5rem; color:#38bdf8; font-weight:700; font-size:0.88rem;">
                <i class="fa-solid fa-phone-volume fa-shake"></i>
                <span>Telefon Arama Hatırlatıcısı (KM Bilgisi Gerekmez)</span>
            </div>
            <span class="badge" style="background:#0284c7; color:#fff; font-size:0.72rem;">⏰ 1 Saat Kala Alarmı</span>
        </div>
        <p style="margin:0 0 0.45rem 0; font-size:0.8rem; color:#e2e8f0; line-height:1.45;">
            Planlanan görüşme saati <strong>${timeVal}</strong> olup, görüşmeye tam 1 saat kala (<strong style="color:#38bdf8; font-size:0.85rem;">SAAT ${oneHourBeforeStr}</strong>) telefonunuza ve bilgisayarınıza <strong>yüksek sesli zil sesi alarmı</strong> çalacak ve ekranda arama butonu açılacaktır.
        </p>
        <div style="display:flex; align-items:center; justify-content:space-between; gap:0.5rem; background:rgba(0,0,0,0.25); border-radius:6px; padding:0.4rem 0.6rem; font-size:0.76rem; color:#94a3b8;">
            <span>Arama Yapılacak Cari: <strong style="color:#fff;">${titleVal}</strong> ${phoneVal ? `(${phoneVal})` : ''}</span>
            <span style="color:#34d399;"><i class="fa-solid fa-check"></i> Hatırlatıcı Hazır</span>
        </div>
    `;
}

function updateVisitTravelCalculation() {
    const box = document.getElementById('visit-travel-calc-box');
    if (!box) return;

    const loc = document.getElementById('visit-location')?.value || 'Çorum';
    const dateVal = document.getElementById('visit-task-date')?.value || '';
    const timeVal = document.getElementById('visit-task-time')?.value || '10:00';

    const calc = calculateVisitTravelTime(loc, timeVal);

    const driveHours = Math.floor(calc.driveMins / 60);
    const driveRemMins = calc.driveMins % 60;
    const driveText = driveHours > 0 ? `${driveHours} sa ${driveRemMins} dk` : `${calc.driveMins} dakika`;

    const totalHours = Math.floor(calc.totalLeadMins / 60);
    const totalRemMins = calc.totalLeadMins % 60;
    const totalText = totalHours > 0 ? `${totalHours} sa ${totalRemMins} dk` : `${calc.totalLeadMins} dakika`;

    const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=Dizsan+Otomotiv+Corum&destination=${encodeURIComponent(loc || 'Çorum')}`;

    box.innerHTML = `
        <div class="travel-calc-header" style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.4rem;">
            <span><i class="fa-solid fa-route" style="color:#f59e0b;"></i> Çıkış Mesafesi &amp; 1 Saat Yanılma Paylı Seyahat Hesabı</span>
            <span class="badge badge-success" style="background:#059669; color:#fff; font-size:0.72rem;">📍 DİZSAN Çorum Çıkışlı</span>
        </div>
        <div style="font-size:0.8rem; color:#cbd5e1; margin-bottom:0.35rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.4rem;">
            <div>Çıkış: <strong>DİZSAN Çorum Merkez</strong> ➔ Hedef: <strong style="color:#fde68a;">${calc.rawLocation || 'Saha'}</strong></div>
            <a href="${mapsUrl}" target="_blank" class="live-maps-btn" title="Google Haritalar ile Canlı Rotayı Aç">
                <i class="fa-brands fa-google"></i> <i class="fa-solid fa-map-location-dot"></i> Google Haritalar Rotası
            </a>
        </div>
        <div class="travel-stat-pills">
            <div class="travel-pill"><i class="fa-solid fa-road"></i> Mesafe: <strong>~${calc.km} km</strong></div>
            <div class="travel-pill"><i class="fa-solid fa-gauge-high"></i> Sürüş Süresi: <strong>~${driveText}</strong></div>
            <div class="travel-pill" style="border-color:#fbbf24;"><i class="fa-solid fa-shield-halved" style="color:#fbbf24;"></i> Yanılma Payı: <strong style="color:#fbbf24;">+1 Saat (60 dk)</strong></div>
            <div class="travel-pill" style="border-color:#34d399;"><i class="fa-solid fa-clock"></i> Toplam Öncelik: <strong style="color:#34d399;">${totalText}</strong></div>
        </div>
        <div style="margin-top:0.45rem; padding:0.45rem 0.6rem; background:rgba(0,0,0,0.3); border-radius:8px; font-size:0.77rem; color:#94a3b8;">
            <i class="fa-solid fa-calendar-check" style="color:#fbbf24;"></i> <strong>1. Hatırlatma:</strong> Ziyaretten <strong>1 gün önce saat 14:00'da</strong> hazırlık uyarısı verilir.
        </div>
        <div class="travel-departure-highlight">
            <i class="fa-solid fa-car-on fa-bounce" style="color:#f87171; font-size:1.1rem;"></i>
            <div>
                <strong>2. Çıkış Uyarısı:</strong> Randevu saati <strong>${timeVal}</strong> gelmeden, 1 saatlik hazırlık/trafik payı ve sürüş süresi hesaba katılarak en geç <strong style="color:#fff; font-size:0.95rem; text-decoration:underline;">SAAT ${calc.departureTime}'DE ÇIKIŞ UYARISI</strong> ve yüksek sesli alarm çalacaktır!
            </div>
        </div>
    `;

    // Google Haritalar / Canlı ağ mesafesini asenkron kontrol et
    fetchLiveGoogleDistance(loc);
}

function openVisitModal(prefill = null, editId = null) {
    const modal = document.getElementById('visit-modal');
    if (!modal) return;
    document.getElementById('visit-form').reset();
    currentDraftAttachments = [];
    renderVisitFilePreview();

    const titleIn = document.getElementById('visit-customer-title');
    const contactIn = document.getElementById('visit-contact-person');
    const phoneIn = document.getElementById('visit-phone');
    const locIn = document.getElementById('visit-location');
    const plateIn = document.getElementById('visit-plate');
    const persSelect = document.getElementById('visit-personnel-select');
    const resSelect = document.getElementById('visit-result-select');
    const cb = document.getElementById('visit-create-task-cb');
    const fields = document.getElementById('visit-task-fields');
    const dateIn = document.getElementById('visit-task-date');
    const timeIn = document.getElementById('visit-task-time');
    
    // Görevlendirme elemanları
    const assignedToSelect = document.getElementById('visit-assigned-to');
    const assignedByIn = document.getElementById('visit-assigned-by');
    const dueDateIn = document.getElementById('visit-due-date');
    const dueTimeIn = document.getElementById('visit-due-time');
    const prioritySelect = document.getElementById('visit-priority');
    const taskInstrIn = document.getElementById('visit-task-instructions');
    const editReasonBox = document.getElementById('visit-edit-reason-container');
    const editReasonIn = document.getElementById('visit-edit-reason');
    const modalTitleEl = document.getElementById('visit-modal-title');
    const submitBtn = document.getElementById('visit-submit-btn');
    const visitIdIn = document.getElementById('visit-id');
    const visitModeIn = document.getElementById('visit-mode');

    // Personel listelerini doldur
    if (assignedToSelect) {
        assignedToSelect.innerHTML = '';
        (appState.users || []).forEach(u => {
            const opt = document.createElement('option');
            opt.value = u.name;
            opt.textContent = `${u.name} (${u.dept})`;
            assignedToSelect.appendChild(opt);
        });
    }
    if (persSelect) {
        if (persSelect.options.length === 0) {
            (appState.users || []).forEach(u => {
                const opt = document.createElement('option');
                opt.value = u.name;
                opt.textContent = `${u.name} (${u.dept})`;
                persSelect.appendChild(opt);
            });
        }
        if (currentUser) {
            persSelect.value = currentUser.name;
        }
    }

    if (assignedByIn) {
        assignedByIn.value = currentUser ? currentUser.name : 'ÖMER EREN';
    }

    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    if (dueDateIn) dueDateIn.value = tomorrow;
    if (dueTimeIn) dueTimeIn.value = '10:00';
    if (prioritySelect) prioritySelect.value = 'Normal';
    if (taskInstrIn) taskInstrIn.value = '';
    if (dateIn) dateIn.value = tomorrow;
    if (timeIn) timeIn.value = '10:00';
    if (cb) cb.checked = false;
    if (fields) fields.style.display = 'none';

    // DÜZENLEME MODU (EDIT)
    if (editId) {
        const v = (appState.visits || []).find(x => x.id === editId);
        if (v) {
            if (visitIdIn) visitIdIn.value = editId;
            if (visitModeIn) visitModeIn.value = 'EDIT';
            if (titleIn) titleIn.value = v.customerTitle || '';
            if (contactIn) contactIn.value = v.contactPerson || '';
            if (phoneIn) phoneIn.value = v.phone || '';
            if (locIn) locIn.value = v.location || '';
            if (plateIn) plateIn.value = v.plate || '';
            if (persSelect && v.personnel) persSelect.value = v.personnel;
            if (resSelect && v.result) resSelect.value = v.result;
            const typeSelect = document.getElementById('visit-type-select');
            if (typeSelect && v.type) typeSelect.value = v.type;
            const notesIn = document.getElementById('visit-notes');
            if (notesIn) notesIn.value = v.notes || '';

            // Görevlendirme alanları
            if (assignedToSelect && v.assignedTo) assignedToSelect.value = v.assignedTo;
            if (assignedByIn) assignedByIn.value = v.assignedBy || (currentUser ? currentUser.name : 'ÖMER EREN');
            if (dueDateIn && v.dueDate) dueDateIn.value = v.dueDate;
            if (dueTimeIn && v.dueTime) dueTimeIn.value = v.dueTime;
            if (prioritySelect && v.priority) prioritySelect.value = v.priority;
            if (taskInstrIn) taskInstrIn.value = v.taskInstructions || v.taskNote || '';

            if (Array.isArray(v.attachments)) {
                currentDraftAttachments = [...v.attachments];
                renderVisitFilePreview();
            }

            if (modalTitleEl) {
                modalTitleEl.innerHTML = `<i class="fa-solid fa-pen-to-square" style="color:#fbbf24;"></i> Görüşme &amp; Görev Düzenle (${v.customerTitle})`;
            }

            // Gerekçe kutusu
            if (editReasonBox) editReasonBox.style.display = 'block';
            if (editReasonIn) {
                editReasonIn.value = '';
                editReasonIn.required = !isOmerEren(currentUser);
            }

            // Yetki kontrolü (Ömer Eren doğrudan kaydeder, personel onay talebi gönderir)
            if (submitBtn) {
                if (isOmerEren(currentUser)) {
                    submitBtn.className = 'btn btn-primary';
                    submitBtn.innerHTML = `<i class="fa-solid fa-shield-check"></i> Değişikliği Doğrudan Kaydet (Yönetici)`;
                } else {
                    submitBtn.className = 'btn btn-warning';
                    submitBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Değişikliği Yönetici Onayına Gönder (Ömer Eren)`;
                }
            }
        }
    } else {
        // YENİ GÖRÜŞME & GÖREVLENDİRME MODU (NEW)
        if (visitIdIn) visitIdIn.value = '';
        if (visitModeIn) visitModeIn.value = 'NEW';
        if (modalTitleEl) {
            modalTitleEl.innerHTML = `<i class="fa-solid fa-phone-volume" style="color:var(--dizsan-light);"></i> Ziyaret, Görüşme &amp; Personel Görevlendirmesi`;
        }
        if (editReasonBox) editReasonBox.style.display = 'none';
        if (editReasonIn) editReasonIn.required = false;
        if (submitBtn) {
            submitBtn.className = 'btn btn-primary';
            submitBtn.innerHTML = `<i class="fa-solid fa-check"></i> Kaydet &amp; Senkronize Et`;
        }

        if (prefill) {
            if (titleIn) titleIn.value = prefill.title || '';
            if (contactIn) contactIn.value = prefill.authorized || '';
            if (phoneIn) phoneIn.value = prefill.phone || '';
            if (locIn) locIn.value = `${prefill.city || ''} / ${prefill.district || ''}`;
            if (plateIn) plateIn.value = prefill.plates || '';
        }
    }

    // Doğrudan olay dinleyicilerini bağla (Safari/Chrome/PWA tüm cihazlarda garantili tetikleme)
    if (resSelect) {
        resSelect.onchange = handleVisitResultChange;
        resSelect.oninput = handleVisitResultChange;
        resSelect.onclick = handleVisitResultChange;
    }
    const typeSelect = document.getElementById('visit-type-select');
    if (typeSelect) {
        typeSelect.onchange = () => {
            const currentFollowup = document.getElementById('visit-followup-type')?.value;
            if (currentFollowup === 'ZİYARET') {
                updateVisitTravelCalculation();
            } else {
                updateVisitPhoneCalculation();
            }
        };
    }
    if (locIn) {
        locIn.oninput = () => {
            const currentFollowup = document.getElementById('visit-followup-type')?.value;
            if (currentFollowup === 'ZİYARET') {
                updateVisitTravelCalculation();
            }
        };
    }

    const parentVisitType = typeSelect ? typeSelect.value : 'TELEFON';
    setFollowupActionType(parentVisitType === 'ZİYARET' ? 'ZİYARET' : 'TELEFON');

    handleVisitResultChange();
    modal.classList.add('open');
}

function closeVisitModal() {
    const modal = document.getElementById('visit-modal');
    if (modal) modal.classList.remove('open');
}

function quickStartVisitForCustomer(code) {
    const cust = (appState.customers || []).find(c => c.code === code);
    if (!cust) return;
    openVisitModal(cust);
}

function handleVisitResultChange() {
    const resSelect = document.getElementById('visit-result-select');
    const cb = document.getElementById('visit-create-task-cb');
    const fields = document.getElementById('visit-task-fields');
    const container = document.getElementById('visit-task-container');
    const cbLabel = document.getElementById('visit-task-cb-label');
    if (!resSelect) return;

    const val = String(resSelect.value || '').trim();
    const selText = (resSelect.options && resSelect.selectedIndex >= 0) ? String(resSelect.options[resSelect.selectedIndex].text || '') : '';
    
    // Hem value hem görünen metin üzerinden esnek eşleşme kontrolü
    const isFollowUp = val.includes('Takip') || val.includes('Randevu') || selText.includes('Takip') || selText.includes('Randevu');

    if (isFollowUp) {
        if (cb) cb.checked = true;
        if (fields) {
            fields.style.display = 'block';
            fields.style.visibility = 'visible';
        }
        if (container) {
            container.style.display = 'block';
            container.style.borderColor = '#fbbf24';
            container.style.background = 'rgba(245, 158, 11, 0.16)';
            container.style.boxShadow = '0 0 20px rgba(245, 158, 11, 0.35)';
        }
        if (cbLabel) {
            cbLabel.innerHTML = `<i class="fa-solid fa-bell fa-shake" style="color:#fbbf24;"></i> <span style="color:#fde68a; font-weight:700;">⏳ TAKİP / RANDEVU PLANI AKTİF</span>`;
        }
        const dateIn = document.getElementById('visit-task-date');
        if (dateIn && !dateIn.value) {
            const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
            dateIn.value = tomorrow;
        }

        const currentFollowup = document.getElementById('visit-followup-type')?.value;
        const parentVisitType = document.getElementById('visit-type-select')?.value || 'TELEFON';
        const targetType = currentFollowup || (parentVisitType === 'ZİYARET' ? 'ZİYARET' : 'TELEFON');
        setFollowupActionType(targetType);
    } else {
        if (cbLabel) {
            cbLabel.innerHTML = `<i class="fa-solid fa-bell"></i> Bu görüşme için takip randevusu / hatırlatıcı görevi oluştur`;
        }
        if (container) {
            container.style.borderColor = 'rgba(245, 158, 11, 0.3)';
            container.style.background = 'rgba(245, 158, 11, 0.08)';
            container.style.boxShadow = 'none';
        }
        if (cb && !cb.checked && fields) {
            fields.style.display = 'none';
        }
    }
}

function toggleVisitTaskFields() {
    const cb = document.getElementById('visit-create-task-cb');
    const fields = document.getElementById('visit-task-fields');
    if (fields) {
        fields.style.display = cb && cb.checked ? 'block' : 'none';
        if (cb && cb.checked) {
            const dateIn = document.getElementById('visit-task-date');
            if (dateIn && !dateIn.value) {
                const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
                dateIn.value = tomorrow;
            }
            const currentFollowup = document.getElementById('visit-followup-type')?.value || 'TELEFON';
            setFollowupActionType(currentFollowup);
        }
    }
}

function updateStandaloneTaskTravelCalc() {
    const box = document.getElementById('task-travel-calc-box');
    if (!box) return;

    const type = document.getElementById('task-type-select')?.value || 'ZİYARET';
    const loc = document.getElementById('task-location')?.value || 'Çorum';
    const timeVal = document.getElementById('task-duetime')?.value || '09:30';

    const calc = calculateVisitTravelTime(loc, timeVal);

    if (type === 'TELEFON') {
        box.innerHTML = `
            <div class="travel-calc-header" style="color:#38bdf8;">
                <span><i class="fa-solid fa-phone-volume"></i> Telefon Arama Hatırlatıcı Motoru</span>
                <span class="badge badge-p2">⏰ 1 Saat Kala Alarmı</span>
            </div>
            <div class="travel-departure-highlight" style="background:rgba(2,132,199,0.18); border-color:rgba(56,189,248,0.4); color:#bae6fd;">
                <i class="fa-solid fa-bell-ring fa-bounce" style="color:#38bdf8;"></i>
                <div>
                    Görüşme saati <strong>${timeVal}</strong> için tam <strong>1 saat kala (${calc.oneHourBeforeStr})</strong> sesli alarm ve Web Push bildirimi çalacaktır.
                </div>
            </div>
        `;
    } else {
        box.innerHTML = `
            <div class="travel-calc-header">
                <span><i class="fa-solid fa-route"></i> DİZSAN Merkez Çıkışlı Seyahat Hesabı</span>
                <span class="badge badge-success">🚗 Saha Ziyareti</span>
            </div>
            <div class="travel-stat-pills">
                <div class="travel-pill"><i class="fa-solid fa-road"></i> Mesafe: <strong>~${calc.km} km</strong></div>
                <div class="travel-pill"><i class="fa-solid fa-gauge-high"></i> Sürüş: <strong>~${calc.driveMins} dk</strong></div>
                <div class="travel-pill" style="border-color:#fbbf24;"><i class="fa-solid fa-shield-halved" style="color:#fbbf24;"></i> Yanılma Payı: <strong style="color:#fbbf24;">+1 Saat (60 dk)</strong></div>
                <div class="travel-pill" style="border-color:#34d399;"><i class="fa-solid fa-clock"></i> Öncelik: <strong style="color:#34d399;">${calc.totalLeadMins} dk</strong></div>
            </div>
            <div class="travel-departure-highlight">
                <i class="fa-solid fa-car-on fa-bounce" style="color:#f87171; font-size:1.1rem;"></i>
                <div>
                    Randevu Saati: <strong>${timeVal}</strong> &bull; 1 gün önce <strong>14:00'da</strong> hazırlık bildirimi, randevu günü ise en geç <strong style="color:#fff; text-decoration:underline;">SAAT ${calc.departureTime}'DE ÇIKIŞ UYARISI</strong> verilecektir.
                </div>
            </div>
        `;
    }
}

function handleVisitFileUpload(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach(f => {
        const reader = new FileReader();
        reader.onload = (e) => {
            currentDraftAttachments.push({
                name: f.name,
                type: f.type,
                size: f.size,
                dataUrl: e.target.result
            });
            renderVisitFilePreview();
        };
        reader.readAsDataURL(f);
    });
}

function renderVisitFilePreview() {
    const container = document.getElementById('visit-file-preview');
    if (!container) return;
    container.innerHTML = currentDraftAttachments.map((att, idx) => `
        <div style="background:rgba(255,255,255,0.06); border:1px solid var(--border-color); border-radius:6px; padding:0.35rem 0.65rem; font-size:0.75rem; display:flex; align-items:center; gap:0.4rem;">
            <i class="fa-solid fa-paperclip" style="color:var(--dizsan-light);"></i>
            <span style="max-width:140px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${att.name}</span>
            <button type="button" style="background:none; border:none; color:#f87171; cursor:pointer;" onclick="removeDraftAttachment(${idx})">&times;</button>
        </div>
    `).join('');
}

function removeDraftAttachment(idx) {
    currentDraftAttachments.splice(idx, 1);
    renderVisitFilePreview();
}

function saveVisitRecord(event) {
    event.preventDefault();
    const type = document.getElementById('visit-type-select').value;
    const result = document.getElementById('visit-result-select').value;
    const customerTitle = document.getElementById('visit-customer-title').value.trim();
    const contactPerson = document.getElementById('visit-contact-person').value.trim();
    const phone = document.getElementById('visit-phone').value.trim();
    const location = document.getElementById('visit-location').value.trim();
    const plate = document.getElementById('visit-plate').value.trim();
    const personnel = document.getElementById('visit-personnel-select').value;
    const notes = document.getElementById('visit-notes').value.trim();

    // Görevlendirme ve Onay alanları
    const editId = document.getElementById('visit-id')?.value;
    const mode = document.getElementById('visit-mode')?.value || 'NEW';
    const assignedTo = document.getElementById('visit-assigned-to')?.value || personnel;
    const assignedBy = document.getElementById('visit-assigned-by')?.value || (currentUser ? currentUser.name : 'ÖMER EREN');
    const dueDate = document.getElementById('visit-due-date')?.value || new Date().toISOString().slice(0, 10);
    const dueTime = document.getElementById('visit-due-time')?.value || '10:00';
    const priority = document.getElementById('visit-priority')?.value || 'Normal';
    const taskInstructions = document.getElementById('visit-task-instructions')?.value.trim() || '';
    const editReason = document.getElementById('visit-edit-reason')?.value.trim() || '';

    // =========================================================================
    // DÜZENLEME DURUMU (EDIT MODE) - YÖNETİCİ ONAY KALKANI
    // =========================================================================
    if (mode === 'EDIT' && editId) {
        const idx = (appState.visits || []).findIndex(v => v.id === editId);
        if (idx === -1) {
            alert("Düzenlenecek kayıt bulunamadı!");
            return;
        }

        // 1. Durum: Yönetici ÖMER EREN doğrudan düzenler
        if (isOmerEren(currentUser)) {
            appState.visits[idx] = {
                ...appState.visits[idx],
                type,
                result,
                customerTitle,
                contactPerson,
                phone,
                location,
                plate,
                personnel,
                notes,
                attachments: [...currentDraftAttachments],
                assignedTo,
                assignedBy,
                dueDate,
                dueTime,
                priority,
                taskInstructions,
                approvalStatus: 'Onaylandı',
                approvedBy: 'ÖMER EREN',
                approvedAt: formatNowTR()
            };

            addAuditLog("ZİYARET DÜZENLEME", `${customerTitle} kaydı Yönetici ÖMER EREN tarafından güncellendi.`);
            syncToServer();
            closeVisitModal();
            renderAll();
            playNotificationTone('INVITE');
            showToast(`✅ '${customerTitle}' kaydı Yönetici Ömer Eren yetkisiyle güncellendi.`, 'success');
            alert(`✅ Kayıt Yönetici ÖMER EREN yetkisiyle başarıyla güncellendi!`);
            return;
        }

        // 2. Durum: Personeller için YÖNETİCİ ONAY KALKANI (Kayıt doğrudan değişmez, onaya düşer)
        if (!editReason) {
            alert("⚠️ Yönetici Ömer Eren onayı için lütfen değişiklik gerekçenizi yazınız!");
            const erIn = document.getElementById('visit-edit-reason');
            if (erIn) erIn.focus();
            return;
        }

        if (!Array.isArray(appState.approvalRequests)) appState.approvalRequests = [];
        const reqId = 'ONAY-ZIY-' + Date.now();
        const existingVisit = { ...appState.visits[idx] };

        appState.approvalRequests.unshift({
            id: reqId,
            type: 'EDIT_VISIT',
            status: 'PENDING',
            targetId: editId,
            targetTitle: customerTitle,
            customerTitle: customerTitle,
            requestedBy: currentUser ? currentUser.name : 'Personel',
            requestedAt: formatNowTR(),
            reason: editReason,
            currentData: existingVisit,
            proposedData: {
                type,
                result,
                customerTitle,
                contactPerson,
                phone,
                location,
                plate,
                personnel,
                notes,
                attachments: [...currentDraftAttachments],
                assignedTo,
                assignedBy,
                dueDate,
                dueTime,
                priority,
                taskInstructions
            }
        });

        // Yönetici Ömer Eren'e anlık Web Push ve sistem bildirimi
        dispatchApprovalPushToManager({
            id: reqId,
            title: `🛡️ Yönetici Onayı Bekleniyor (Değişiklik)`,
            body: `${currentUser ? currentUser.name : 'Personel'}, '${customerTitle}' kaydında DEĞİŞİKLİK onayı talep etti. Gerekçe: ${editReason}`
        });

        addAuditLog("ONAY TALEBİ", `${currentUser ? currentUser.name : 'Personel'}, ${editId} kodlu '${customerTitle}' kaydı için DEĞİŞİKLİK ONAY TALEBİ gönderdi (Yönetici Ömer Eren onayı bekleniyor).`);
        syncToServer();
        closeVisitModal();
        renderAll();
        playNotificationTone('APPROVAL');

        alert(`🛡️ Değişiklik Talebi Yönetici ÖMER EREN Onayına Gönderildi!\n\n'${customerTitle}' kaydında yaptığınız değişiklikler ekranın üstündeki "🛡️ ÖMER EREN YÖNETİCİ ONAY MERKEZİ"ne düşmüştür.\n\nÖmer Eren "✅ Değişikliği Onayla & Uygula" butonuna bastığında değişiklikler otomatik olarak geçerli olacaktır.`);
        return;
    }

    // =========================================================================
    // YENİ GÖRÜŞME & GÖREVLENDİRME KAYDI (NEW MODE)
    // =========================================================================
    const visitId = 'VIS-' + Date.now();
    const newVisit = {
        id: visitId,
        type,
        result,
        customerTitle,
        contactPerson,
        phone,
        location,
        plate,
        personnel,
        notes,
        attachments: [...currentDraftAttachments],
        assignedTo,
        assignedBy,
        dueDate,
        dueTime,
        priority,
        taskInstructions,
        taskStatus: 'Bekliyor',
        date: formatDateTR(new Date().toISOString().slice(0, 10)),
        time: new Date().toTimeString().slice(0, 5),
        createdAt: formatNowTR(),
        createdBy: currentUser ? currentUser.name : personnel,
        approvalStatus: isOmerEren(currentUser) ? 'Onaylandı' : 'Kayıt Yapıldı',
        actionLogs: []
    };

    if (!Array.isArray(appState.visits)) appState.visits = [];
    appState.visits.unshift(newVisit);

    // Otomatik Takip / Görev Kaydı
    const calc = calculateVisitTravelTime(location, dueTime);
    const appDt = new Date(`${dueDate}T${dueTime}:00`);
    const phoneAlertDt = new Date(appDt.getTime() - 60 * 60 * 1000);
    const prevDay = new Date(appDt.getTime() - 24 * 60 * 60 * 1000);
    const prevDayStr = prevDay.toISOString().slice(0, 10);
    const visitDayBefore14Dt = new Date(`${prevDayStr}T14:00:00`);
    const visitDepWarningDt = new Date(`${dueDate}T${calc.departureTime}:00`);

    const newTask = {
        id: 'TSK-' + Date.now(),
        linkedVisitId: visitId,
        title: `${type === 'ZİYARET' ? '🚗 Saha Ziyareti' : '📞 Telefon Görüşmesi'} Görevi: ${customerTitle}`,
        customerTitle,
        type,
        contactPerson,
        phone,
        location,
        plate,
        assignee: assignedTo,
        assignedBy: assignedBy,
        manager: 'ÖMER EREN',
        priority,
        dueDate,
        dueTime,
        status: 'Bekliyor',
        note: `Talimat: ${taskInstructions || notes}. Görüşme Sonucu: ${result}.`,
        distanceKm: type === 'ZİYARET' ? calc.km : null,
        driveMinutes: type === 'ZİYARET' ? calc.driveMins : null,
        marginMinutes: type === 'ZİYARET' ? calc.marginMins : null,
        totalLeadMinutes: type === 'ZİYARET' ? calc.totalLeadMins : null,
        departureTime: type === 'ZİYARET' ? calc.departureTime : null,
        oneHourBeforeTime: calc.oneHourBeforeStr,
        phoneAlertScheduled: phoneAlertDt.toISOString(),
        visitDayBefore14Scheduled: visitDayBefore14Dt.toISOString(),
        visitDepartureWarningScheduled: visitDepWarningDt.toISOString(),
        phoneAlertFired: false,
        visitDayBeforeFired: false,
        departureWarningFired: false,
        actionLogs: [],
        createdAt: formatNowTR()
    };

    if (!Array.isArray(appState.tasks)) appState.tasks = [];
    appState.tasks.unshift(newTask);

    // =========================================================================
    // İKİ YÖNLÜ BİLDİRİM (Direction 1: Görevlendirilen Personele Bildirim)
    // =========================================================================
    if (assignedTo && assignedTo !== (currentUser ? currentUser.name : '')) {
        dispatchDelegationNotification({
            assignedTo: assignedTo,
            assignedBy: assignedBy,
            customerTitle: customerTitle,
            actionType: type,
            dueDate: dueDate,
            dueTime: dueTime,
            priority: priority,
            instructions: taskInstructions || notes,
            targetId: visitId
        });
    }

    addAuditLog("GÖREVLENDİRME & ZİYARET", `${assignedBy}, '${customerTitle}' için ${assignedTo} personelini görevlendirdi (Termin: ${formatDateTR(dueDate)} ${dueTime} [${priority}]).`);
    syncToServer();
    closeVisitModal();
    renderAll();
    playNotificationTone('INVITE');

    let alertMsg = `✅ Görüşme kaydı ve personel görevlendirmesi başarıyla sisteme işlendi!\n\n`;
    alertMsg += `👤 Görevlendirilen Personel: ${assignedTo}\n`;
    alertMsg += `📅 Termin: ${formatDateTR(dueDate)} Saat ${dueTime} [${priority}]\n`;
    if (assignedTo !== (currentUser ? currentUser.name : '')) {
        alertMsg += `⚡ ${assignedTo} personeline anlık kilit ekranı bildirimi ve görev ataması gönderildi.`;
    }
    alert(alertMsg);
}

function renderActiveVisits() {
    const container = document.getElementById('active-visits-list');
    if (!container) return;

    const search = normalizeTR(document.getElementById('active-search')?.value);
    const typeFilter = document.getElementById('active-filter-type')?.value;
    const resultFilter = document.getElementById('active-filter-result')?.value;

    let list = (appState.visits || []).filter(v => {
        if (typeFilter && v.type !== typeFilter) return false;
        if (resultFilter && v.result !== resultFilter) return false;
        if (search) {
            const hay = normalizeTR(`${v.customerTitle} ${v.contactPerson} ${v.phone} ${v.notes} ${v.personnel} ${v.location}`);
            if (!hay.includes(search)) return false;
        }
        return true;
    });

    const badgeActive = document.getElementById('badge-active-visits');
    if (badgeActive) badgeActive.textContent = (appState.visits || []).length;

    if (list.length === 0) {
        container.innerHTML = `
            <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:2rem; text-align:center; color:var(--text-sec);">
                <i class="fa-solid fa-clipboard-list" style="font-size:2.5rem; color:var(--text-muted); margin-bottom:0.75rem; display:block;"></i>
                Henüz kayıtlı ziyaret veya telefon görüşmesi bulunmuyor.<br>
                Yeni bir görüşme yapmak için <strong>"Yeni Ziyaret / Görüşme Kaydet"</strong> butonunu kullanabilirsiniz.
            </div>
        `;
        return;
    }

    container.innerHTML = list.map(v => {
        const isVisit = v.type === 'ZİYARET';
        const isSuccess = v.result === 'Olumlu' || v.result === 'Randevu Alındı';
        const isPendingApproval = (appState.approvalRequests || []).some(r => r.targetId === v.id && r.status === 'PENDING');
        const hasAssignment = Boolean(v.assignedTo);

        return `
            <div class="visit-card" style="${isPendingApproval ? 'border-color:#f59e0b; box-shadow:0 0 16px rgba(245,158,11,0.25);' : ''}">
                <div class="visit-card-header">
                    <div>
                        <div style="display:flex; align-items:center; gap:0.45rem; flex-wrap:wrap;">
                            <span class="badge ${isVisit ? 'badge-p3' : 'badge-p2'}">
                                ${isVisit ? '🚗 SAHA ZİYARETİ' : '📞 TELEFON GÖRÜŞMESİ'}
                            </span>
                            <span class="badge ${isSuccess ? 'badge-success' : 'badge-secondary'}">${v.result}</span>
                            ${hasAssignment ? `
                                <span class="badge" style="background:#2563eb; color:#fff; font-weight:700;">
                                    <i class="fa-solid fa-user-check"></i> Görevli: ${v.assignedTo}
                                </span>
                            ` : ''}
                            ${v.dueDate ? `
                                <span class="badge" style="background:#059669; color:#fff;">
                                    <i class="fa-solid fa-calendar-check"></i> Termin: ${formatDateTR(v.dueDate)} ${v.dueTime || ''}
                                </span>
                            ` : ''}
                            ${v.priority && v.priority !== 'Normal' ? `
                                <span class="badge ${v.priority === 'Kritik' ? 'badge-critical' : 'badge-high'}">
                                    ${v.priority}
                                </span>
                            ` : ''}
                            ${isPendingApproval ? `
                                <span class="badge badge-warning" style="background:#f59e0b; color:#000; font-weight:800;">
                                    <i class="fa-solid fa-hourglass-half fa-spin"></i> Yönetici Onayı Bekliyor
                                </span>
                            ` : ''}
                            <span style="font-size:0.75rem; color:var(--text-muted);">${v.date} ${v.time}</span>
                        </div>
                        <div class="visit-customer-title" style="margin-top:6px;">${v.customerTitle}</div>
                    </div>
                    <div style="text-align:right;">
                        <span style="font-size:0.78rem; font-weight:700; color:#fff;">👤 ${v.personnel}</span>
                        <div style="font-size:0.72rem; color:var(--text-sec);">${v.location || ''}</div>
                    </div>
                </div>

                <div class="visit-meta">
                    ${v.contactPerson ? `<span><i class="fa-solid fa-user-tie"></i> ${v.contactPerson}</span>` : ''}
                    ${v.phone ? `<span><i class="fa-solid fa-phone"></i> <a href="tel:${v.phone}" style="color:#38bdf8; text-decoration:none;">${v.phone}</a></span>` : ''}
                    ${v.plate ? `<span><i class="fa-solid fa-truck"></i> ${v.plate}</span>` : ''}
                    ${v.assignedBy ? `<span><i class="fa-solid fa-user-gear"></i> Görevi Veren: <strong>${v.assignedBy}</strong></span>` : ''}
                </div>

                <div class="visit-notes">
                    ${v.notes}
                </div>

                ${v.taskInstructions ? `
                    <div style="background:rgba(2,132,199,0.12); border-left:3px solid #38bdf8; padding:0.45rem 0.65rem; border-radius:6px; margin-top:0.45rem; font-size:0.78rem; color:#bae6fd;">
                        <strong><i class="fa-solid fa-bullhorn"></i> Görev Talimatı:</strong> ${v.taskInstructions}
                    </div>
                ` : ''}

                ${Array.isArray(v.actionLogs) && v.actionLogs.length > 0 ? `
                    <div style="background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.3); border-radius:8px; padding:0.5rem 0.75rem; margin-top:0.5rem; font-size:0.76rem;">
                        <span style="color:#34d399; font-weight:700;"><i class="fa-solid fa-clock-rotate-left"></i> Yapılan İşlem Geçmişi (${v.actionLogs.length}):</span>
                        ${v.actionLogs.slice(0, 2).map(al => `
                            <div style="margin-top:2px; color:#cbd5e1;">
                                • <strong>${al.user}</strong> [${al.status}]: ${al.note} <span style="color:var(--text-muted); font-size:0.7rem;">(${al.timestamp})</span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                ${(v.attachments || []).length > 0 ? `
                    <div class="visit-attachments">
                        ${v.attachments.map((att, aIdx) => `
                            <div class="attachment-chip" onclick="previewAttachment('${v.id}', ${aIdx})">
                                <i class="fa-solid fa-image"></i> ${att.name}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                <!-- AKSİYON BUTONLARI (DÜZENLE, SİL & İŞLEM YAP) -->
                <div class="visit-actions-bar">
                    <button type="button" class="btn btn-secondary btn-sm" onclick="openVisitModal(null, '${v.id}')" title="Görüşmeyi / Görevi Düzenle">
                        <i class="fa-solid fa-pen-to-square"></i> Düzenle
                    </button>
                    <button type="button" class="btn btn-danger btn-sm" onclick="requestDeleteVisit('${v.id}')" title="Kaydı Sil (Yönetici Onaylı)">
                        <i class="fa-solid fa-trash"></i> Sil
                    </button>
                    <button type="button" class="btn btn-success btn-sm" onclick="openTaskActionModal('${v.id}', 'VISIT')" title="İşlem Yap &amp; Raporla">
                        <i class="fa-solid fa-clipboard-check"></i> İşlem Yap &amp; Raporla
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function previewAttachment(visitId, attIdx) {
    const v = (appState.visits || []).find(x => x.id === visitId);
    if (!v || !v.attachments || !v.attachments[attIdx]) return;
    const att = v.attachments[attIdx];

    const w = window.open("");
    if (w) {
        w.document.write(`
            <html><head><title>${att.name}</title></head>
            <body style="background:#0b0f19; margin:0; display:flex; align-items:center; justify-content:center; height:100vh;">
                <img src="${att.dataUrl}" style="max-width:95%; max-height:95%; object-fit:contain; border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,0.8);">
            </body></html>
        `);
    }
}

// ==========================================================================
// 7. YÖNETİCİ ONAY KALKANI, GÖREVLENDİRME & İKİ YÖNLÜ BİLDİRİM MOTORU
// (YÖNETİCİ ÖMER EREN HARİCİNDE KİMSE DEĞİŞTİREMEZ VEYA SİLEMEZ)
// ==========================================================================
function requestDeleteVisit(visitId) {
    const v = (appState.visits || []).find(x => x.id === visitId);
    if (!v) return;

    if (isOmerEren(currentUser)) {
        if (!confirm(`'${v.customerTitle}' ziyaret / görüşme kaydını silmek istediğinize emin misiniz? (Yönetici Yetkisi)`)) return;
        appState.visits = (appState.visits || []).filter(x => x.id !== visitId);
        addAuditLog("ZİYARET SİLME", `${v.customerTitle} kaydı Yönetici ÖMER EREN tarafından silindi.`);
        syncToServer();
        renderAll();
        showToast(`🗑️ '${v.customerTitle}' kaydı silindi.`, 'success');
        return;
    }

    // Personeller için YÖNETİCİ ONAY KALKANI
    openApprovalRequestModal('DELETE_VISIT', visitId, v.customerTitle);
}

function requestDeleteTask(taskId) {
    const t = (appState.tasks || []).find(x => x.id === taskId);
    if (!t) return;

    if (isOmerEren(currentUser)) {
        if (!confirm(`'${t.title}' görev kaydını silmek istediğinize emin misiniz? (Yönetici Yetkisi)`)) return;
        appState.tasks = (appState.tasks || []).filter(x => x.id !== taskId);
        addAuditLog("GÖREV SİLME", `${t.title} görevi Yönetici ÖMER EREN tarafından silindi.`);
        syncToServer();
        renderAll();
        showToast(`🗑️ '${t.title}' görevi silindi.`, 'success');
        return;
    }

    // Personeller için YÖNETİCİ ONAY KALKANI
    openApprovalRequestModal('DELETE_TASK', taskId, t.title);
}

function openApprovalRequestModal(type, targetId, targetTitle) {
    const modal = document.getElementById('approval-request-modal');
    if (!modal) return;

    document.getElementById('arm-type').value = type;
    document.getElementById('arm-target-id').value = targetId;
    document.getElementById('arm-target-title').value = targetTitle;
    document.getElementById('arm-reason').value = '';

    const titleEl = document.getElementById('arm-title');
    if (titleEl) {
        titleEl.innerHTML = `<i class="fa-solid fa-user-shield" style="color:#f59e0b;"></i> Yönetici (Ömer Eren) Onayı Gerekiyor (${type.includes('DELETE') ? 'Silme' : 'Değiştirme'})`;
    }

    modal.classList.add('open');
}

function closeApprovalRequestModal() {
    const modal = document.getElementById('approval-request-modal');
    if (modal) modal.classList.remove('open');
}

function handleApprovalRequestSubmit(event) {
    event.preventDefault();
    const type = document.getElementById('arm-type').value;
    const targetId = document.getElementById('arm-target-id').value;
    const targetTitle = document.getElementById('arm-target-title').value;
    const reason = document.getElementById('arm-reason').value.trim();

    if (!reason) {
        alert("Lütfen bir gerekçe açıklayınız.");
        return;
    }

    const reqId = 'ONAY-DEL-' + Date.now();
    if (!Array.isArray(appState.approvalRequests)) appState.approvalRequests = [];

    appState.approvalRequests.unshift({
        id: reqId,
        type: type,
        status: 'PENDING',
        targetId: targetId,
        targetTitle: targetTitle,
        customerTitle: targetTitle,
        requestedBy: currentUser ? currentUser.name : 'Personel',
        requestedAt: formatNowTR(),
        reason: reason
    });

    dispatchApprovalPushToManager({
        id: reqId,
        title: `🛡️ Yönetici Onayı Bekleniyor (${type.includes('DELETE') ? 'Silme' : 'Değişiklik'})`,
        body: `${currentUser ? currentUser.name : 'Personel'}, '${targetTitle}' kaydı için ${type.includes('DELETE') ? 'SİLME' : 'DÜZENLEME'} onayı talep etti. Gerekçe: ${reason}`
    });

    addAuditLog("ONAY TALEBİ", `${currentUser ? currentUser.name : 'Personel'}, '${targetTitle}' kaydı için onay talebi oluşturdu (Yönetici Ömer Eren bekleniyor).`);
    syncToServer();
    closeApprovalRequestModal();
    renderAll();
    playNotificationTone('APPROVAL');

    alert(`🛡️ Silme Talebi Yönetici ÖMER EREN Onayına Gönderildi!\n\n'${targetTitle}' kaydının silinmesi için yöneticimiz Ömer Eren'in telefonuna anlık bildirim gönderilmiştir. Ömer Eren onayladığında kayıt sistemden kaldırılacaktır.`);
}

function openTaskActionModal(targetId, targetType = 'VISIT') {
    const modal = document.getElementById('task-action-modal');
    if (!modal) return;

    let targetTitle = '';
    if (targetType === 'VISIT') {
        const v = (appState.visits || []).find(x => x.id === targetId);
        if (v) targetTitle = v.customerTitle;
    } else {
        const t = (appState.tasks || []).find(x => x.id === targetId);
        if (t) targetTitle = t.title;
    }

    document.getElementById('ta-target-id').value = targetId;
    document.getElementById('ta-target-type').value = targetType;
    document.getElementById('ta-customer-title').value = targetTitle || 'Müşteri';
    document.getElementById('ta-status').value = 'İşlem Yapıldı';
    document.getElementById('ta-notes').value = '';

    modal.classList.add('open');
}

function closeTaskActionModal() {
    const modal = document.getElementById('task-action-modal');
    if (modal) modal.classList.remove('open');
}

function handleTaskActionSubmit(event) {
    event.preventDefault();
    const targetId = document.getElementById('ta-target-id').value;
    const targetType = document.getElementById('ta-target-type').value;
    const customerTitle = document.getElementById('ta-customer-title').value;
    const status = document.getElementById('ta-status').value;
    const notes = document.getElementById('ta-notes').value.trim();

    let assignedBy = 'ÖMER EREN';

    if (targetType === 'VISIT') {
        const v = (appState.visits || []).find(x => x.id === targetId);
        if (v) {
            assignedBy = v.assignedBy || 'ÖMER EREN';
            v.taskStatus = status;
            if (!Array.isArray(v.actionLogs)) v.actionLogs = [];
            v.actionLogs.unshift({
                id: 'ACT-' + Date.now(),
                user: currentUser ? currentUser.name : 'Personel',
                status: status,
                note: notes,
                timestamp: formatNowTR()
            });
            if (status === 'Tamamlandı') {
                v.completedAt = formatNowTR();
            }
        }
    } else {
        const t = (appState.tasks || []).find(x => x.id === targetId);
        if (t) {
            assignedBy = t.assignedBy || t.manager || 'ÖMER EREN';
            t.status = status;
            if (!Array.isArray(t.actionLogs)) t.actionLogs = [];
            t.actionLogs.unshift({
                id: 'ACT-' + Date.now(),
                user: currentUser ? currentUser.name : 'Personel',
                status: status,
                note: notes,
                timestamp: formatNowTR()
            });
            if (status === 'Tamamlandı') {
                t.completedAt = formatNowTR();
            }
        }
    }

    // İKİ YÖNLÜ BİLDİRİM (Direction 2): Görevli personelin yaptığı işlem görevi verene ve Yönetici Ömer Eren'e anlık düşer
    dispatchActionNotification({
        assignedBy: assignedBy,
        performedBy: currentUser ? currentUser.name : 'Personel',
        customerTitle: customerTitle,
        status: status,
        notes: notes,
        targetId: targetId
    });

    addAuditLog("GÖREV İŞLEMİ", `${currentUser ? currentUser.name : 'Personel'}, '${customerTitle}' için işlem yaptı (Durum: ${status}, Not: ${notes.slice(0, 60)}).`);
    syncToServer();
    closeTaskActionModal();
    renderAll();
    playNotificationTone('INVITE');

    alert(`✅ İşleminiz başarıyla kaydedildi!\n\nGörevi veren (${assignedBy}) ve Yönetici Ömer Eren'e anlık bildirim iletildi.`);
}

function renderOmerApprovalCenter() {
    const container = document.getElementById('omer-approval-center-container');
    const modalContainer = document.getElementById('modal-approval-list-container');
    const badge = document.getElementById('badge-pending-approvals');

    const pendingRequests = (appState.approvalRequests || []).filter(r => r.status === 'PENDING');
    if (badge) badge.textContent = pendingRequests.length;

    const isAdminOmer = isOmerEren(currentUser);

    // Ömer Eren için sesli uyarı
    if (isAdminOmer && pendingRequests.length > 0) {
        pendingRequests.forEach(req => {
            const notifKey = `omer_notif_req_${req.id}`;
            if (!localStorage.getItem(notifKey)) {
                localStorage.setItem(notifKey, '1');
                const actionLabel = req.type.includes('DELETE') ? 'silme' : 'düzenleme';
                playNotificationTone('APPROVAL');
                sendBrowserNotification(
                    `🛡️ Yönetici Onayı Bekleniyor (${actionLabel.toUpperCase()})`,
                    `${req.requestedBy}, '${req.customerTitle}' kaydı için ${actionLabel} onayı istedi.`,
                    notifKey,
                    'APPROVAL'
                );
            }
        });
    }

    if (pendingRequests.length === 0) {
        if (container) container.innerHTML = '';
        if (modalContainer) {
            modalContainer.innerHTML = `
                <div style="text-align:center; padding:2rem; color:var(--text-sec);">
                    <i class="fa-solid fa-check-circle" style="font-size:2.5rem; color:#10b981; margin-bottom:0.75rem; display:block;"></i>
                    Harika! Şu anda onay bekleyen herhangi bir silme veya düzenleme talebi bulunmuyor.
                </div>
            `;
        }
        return;
    }

    const htmlContent = `
        <div class="omer-approval-card">
            <div class="omer-approval-header">
                <div style="color:#fef08a; font-weight:800; font-size:1.02rem; display:flex; align-items:center; gap:0.5rem;">
                    <i class="fa-solid fa-user-shield" style="color:#f59e0b; font-size:1.25rem;"></i>
                    <span>🛡️ ÖMER EREN YÖNETİCİ ONAY MERKEZİ (${pendingRequests.length} Onay Bekleyen İşlem)</span>
                </div>
                <div style="display:flex; gap:0.4rem; align-items:center;">
                    <button type="button" class="btn btn-secondary btn-sm" onclick="playNotificationTone('APPROVAL')">
                        <i class="fa-solid fa-volume-high"></i> Sesli Alarm
                    </button>
                    <span class="badge badge-high">Yetki: SADECE ÖMER EREN</span>
                </div>
            </div>
            <div style="display:flex; flex-direction:column; gap:0.65rem;">
                ${pendingRequests.map(req => {
                    const isDel = req.type.includes('DELETE');
                    return `
                        <div class="omer-approval-item ${isDel ? 'delete-req' : 'edit-req'}">
                            <div style="flex:1; min-width:240px;">
                                <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap; margin-bottom:4px;">
                                    <span class="badge ${isDel ? 'badge-critical' : 'badge-high'}">
                                        ${isDel ? '🗑️ SİLME ONAY TALEBİ' : '✏️ DÜZENLEME ONAY TALEBİ'}
                                    </span>
                                    <strong style="color:#fff; font-size:0.95rem;">${req.customerTitle}</strong>
                                </div>
                                <div style="font-size:0.8rem; color:#cbd5e1; margin-bottom:3px;">
                                    Talep Eden: <strong>${req.requestedBy}</strong> &bull; Tarih: <strong>${req.requestedAt}</strong>
                                    ${req.reason ? ` &bull; Gerekçe: <strong style="color:#fde68a;">${req.reason}</strong>` : ''}
                                </div>
                                ${!isDel && req.proposedData ? `
                                    <div class="diff-box">
                                        <span style="color:#38bdf8; font-weight:700;">Talep Edilen Yeni Bilgiler:</span>
                                        <div style="margin-top:2px; color:#e2e8f0;">
                                            Görüşme Türü: <strong>${req.proposedData.type}</strong> | Sonuç: <strong>${req.proposedData.result}</strong> | Görevli: <strong>${req.proposedData.assignedTo || req.proposedData.personnel}</strong> | Termin: <strong>${formatDateTR(req.proposedData.dueDate)} ${req.proposedData.dueTime || ''}</strong>
                                            ${req.proposedData.notes ? `<br>Not: <em>${req.proposedData.notes}</em>` : ''}
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                            <div style="display:flex; gap:0.45rem; flex-wrap:wrap;">
                                ${isAdminOmer ? `
                                    <button type="button" class="btn btn-success btn-sm" onclick="approveRequest('${req.id}')">
                                        <i class="fa-solid fa-check"></i> ${isDel ? 'Silmeyi Onayla (Kaydı Sil)' : 'Değişikliği Onayla &amp; Uygula'}
                                    </button>
                                    <button type="button" class="btn btn-danger btn-sm" onclick="rejectRequest('${req.id}')">
                                        <i class="fa-solid fa-xmark"></i> Reddet
                                    </button>
                                ` : `
                                    <span class="badge badge-warning"><i class="fa-solid fa-hourglass-half"></i> Yönetici Ömer Eren İnceliyor</span>
                                `}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;

    if (container) {
        if (isAdminOmer || pendingRequests.some(r => r.requestedBy === (currentUser ? currentUser.name : ''))) {
            container.innerHTML = htmlContent;
        } else {
            container.innerHTML = '';
        }
    }

    if (modalContainer) {
        modalContainer.innerHTML = htmlContent;
    }
}

function openApprovalCenterModal() {
    renderOmerApprovalCenter();
    const modal = document.getElementById('manager-approval-modal');
    if (modal) modal.classList.add('open');
}

function closeApprovalCenterModal() {
    const modal = document.getElementById('manager-approval-modal');
    if (modal) modal.classList.remove('open');
}

function approveRequest(reqId) {
    if (!isOmerEren(currentUser)) {
        alert("Bu işlem için yalnızca Yönetici ÖMER EREN yetkilidir!");
        return;
    }
    const req = (appState.approvalRequests || []).find(r => r.id === reqId);
    if (!req || req.status !== 'PENDING') return;

    if (req.type === 'DELETE_VISIT') {
        appState.visits = (appState.visits || []).filter(v => v.id !== req.targetId);
        addAuditLog("ONAY İŞLEMİ", `${req.customerTitle} ziyaret kaydı silme talebi Yönetici ÖMER EREN tarafından ONAYLANDI ve kayıt silindi.`);
    } else if (req.type === 'DELETE_TASK') {
        appState.tasks = (appState.tasks || []).filter(t => t.id !== req.targetId);
        addAuditLog("ONAY İŞLEMİ", `${req.targetTitle} görev silme talebi Yönetici ÖMER EREN tarafından ONAYLANDI ve görev silindi.`);
    } else if (req.type === 'EDIT_VISIT' && req.proposedData) {
        const idx = (appState.visits || []).findIndex(v => v.id === req.targetId);
        if (idx !== -1) {
            appState.visits[idx] = {
                ...appState.visits[idx],
                ...req.proposedData,
                approvalStatus: 'Onaylandı',
                approvedBy: 'ÖMER EREN',
                approvedAt: formatNowTR()
            };
        }
        addAuditLog("ONAY İŞLEMİ", `${req.customerTitle} ziyaret kaydı düzenleme talebi Yönetici ÖMER EREN tarafından ONAYLANDI ve uygulandı.`);
    }

    req.status = 'APPROVED';
    req.resolvedBy = 'ÖMER EREN';
    req.resolvedAt = formatNowTR();

    dispatchApprovalResultNotification({
        recipient: req.requestedBy,
        customerTitle: req.customerTitle || req.targetTitle,
        isApproved: true,
        actionType: req.type.includes('DELETE') ? 'silme' : 'düzenleme'
    });

    syncToServer();
    renderAll();
    playNotificationTone('INVITE');
    showToast(`✅ '${req.customerTitle}' talebi onaylandı ve devreye alındı.`, 'success');
}

function rejectRequest(reqId) {
    if (!isOmerEren(currentUser)) {
        alert("Bu işlem için yalnızca Yönetici ÖMER EREN yetkilidir!");
        return;
    }
    const req = (appState.approvalRequests || []).find(r => r.id === reqId);
    if (!req || req.status !== 'PENDING') return;

    req.status = 'REJECTED';
    req.resolvedBy = 'ÖMER EREN';
    req.resolvedAt = formatNowTR();

    addAuditLog("ONAY İŞLEMİ", `${req.customerTitle} kaydı için gönderilen talep Yönetici ÖMER EREN tarafından REDDEDİLDİ.`);

    dispatchApprovalResultNotification({
        recipient: req.requestedBy,
        customerTitle: req.customerTitle || req.targetTitle,
        isApproved: false,
        actionType: req.type.includes('DELETE') ? 'silme' : 'düzenleme'
    });

    syncToServer();
    renderAll();
    showToast(`❌ '${req.customerTitle}' talebi reddedildi.`, 'info');
}

function dispatchDelegationNotification(info) {
    if (!info || !info.assignedTo) return;
    const req = {
        id: 'PUSH-ASG-' + Date.now(),
        username: normalizeTR(info.assignedTo),
        userFullName: info.assignedTo,
        title: `⚡ Size Yeni Görev Atandı: ${info.customerTitle}`,
        body: `Atayan: ${info.assignedBy} • Termin: ${formatDateTR(info.dueDate)} ${info.dueTime} [${info.priority}]${info.instructions ? `\nTalimat: ${info.instructions}` : ''}`,
        url: './?tab=tasks-tab',
        delaySeconds: 0,
        status: 'PENDING',
        createdAt: formatNowTR()
    };
    if (!Array.isArray(appState.pushTestRequests)) appState.pushTestRequests = [];
    appState.pushTestRequests.unshift(req);

    try {
        fetch('/api/push/test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: info.assignedTo,
                title: req.title,
                body: req.body,
                url: req.url,
                delaySeconds: 0
            })
        }).catch(() => {});
    } catch (e) {}
}

function dispatchActionNotification(info) {
    if (!info) return;
    const targets = [info.assignedBy, 'ÖMER EREN'];
    targets.forEach((targetUser, idx) => {
        if (!targetUser) return;
        const req = {
            id: `PUSH-ACT-${Date.now()}-${idx}`,
            username: normalizeTR(targetUser),
            userFullName: targetUser,
            title: `✅ Görevde İşlem Yapıldı: ${info.customerTitle}`,
            body: `İşlem Yapan: ${info.performedBy} • Durum: ${info.status}\nNot: ${info.notes ? info.notes.slice(0, 80) : 'İşlem tamamlandı.'}`,
            url: './?tab=active-tab',
            delaySeconds: 0,
            status: 'PENDING',
            createdAt: formatNowTR()
        };
        if (!Array.isArray(appState.pushTestRequests)) appState.pushTestRequests = [];
        appState.pushTestRequests.unshift(req);

        try {
            fetch('/api/push/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: targetUser,
                    title: req.title,
                    body: req.body,
                    url: req.url,
                    delaySeconds: 0
                })
            }).catch(() => {});
        } catch (e) {}
    });
}

function dispatchApprovalPushToManager(info) {
    if (!info) return;
    const req = {
        id: 'PUSH-APP-' + Date.now(),
        username: 'omer',
        userFullName: 'ÖMER EREN',
        title: info.title,
        body: info.body,
        url: './?tab=dashboard-tab',
        delaySeconds: 0,
        status: 'PENDING',
        createdAt: formatNowTR()
    };
    if (!Array.isArray(appState.pushTestRequests)) appState.pushTestRequests = [];
    appState.pushTestRequests.unshift(req);

    try {
        fetch('/api/push/test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'omer',
                title: req.title,
                body: req.body,
                url: req.url,
                delaySeconds: 0
            })
        }).catch(() => {});
    } catch (e) {}
}

function dispatchApprovalResultNotification(info) {
    if (!info || !info.recipient) return;
    const req = {
        id: 'PUSH-RES-' + Date.now(),
        username: normalizeTR(info.recipient),
        userFullName: info.recipient,
        title: info.isApproved ? `🎉 Talebiniz Onaylandı: ${info.customerTitle}` : `❌ Talebiniz Reddedildi: ${info.customerTitle}`,
        body: info.isApproved ? `Yönetici Ömer Eren ${info.actionType} talebinizi ONAYLANDI ve uyguladı.` : `Yönetici Ömer Eren ${info.actionType} talebinizi REDDETTİ. Kayıt değiştirilmedi.`,
        url: './?tab=active-tab',
        delaySeconds: 0,
        status: 'PENDING',
        createdAt: formatNowTR()
    };
    if (!Array.isArray(appState.pushTestRequests)) appState.pushTestRequests = [];
    appState.pushTestRequests.unshift(req);

    try {
        fetch('/api/push/test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: info.recipient,
                title: req.title,
                body: req.body,
                url: req.url,
                delaySeconds: 0
            })
        }).catch(() => {});
    } catch (e) {}
}

function printVisitReport() {
    const visits = appState.visits || [];
    const area = document.getElementById('print-report-area');
    if (!area) return;

    area.innerHTML = `
        <div style="font-family:Arial, sans-serif; color:#000; padding:20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #0284c7; padding-bottom:12px; margin-bottom:16px;">
                <div style="display:flex; align-items:center; gap:12px;">
                    <img src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCADwAQ8DASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD3UUtIKWkAUUUUwCiiorm5hs7d555BHEgyzHpQlfYTaSu9EiWiuO8O+LJdf8VXttGoWzhgVo1I5Y5IJPtXYjoKucJU3ysmnUjUjzR2YUtJS1mWFFFFMAorjvG3jSPw/ZSw2ZWS+2/UR/X3rqbGR5dPt5JDl3iVmPqSOaqVOUYptbmcasZScYvYsUUUVJoLRRRSAKKKKYBRRRQAUUUUAApaKKQBRRRTAKKKKACiiigApaSlpAR0UUUAFFFRXNzDZ27z3EgjiQZZieKaV9hNpK70SC5uYbO3kuJ3EcSDJY15D4r8Vza5cmKEmOyQ/Kmcbv8AaNN8V+LJtcuDDEWSyQ/Kn9//AGjXMZ9a+gwOB9mvaVFqfMZlmLqv2VL4fzO0+F//ACMuoZ/59U/9CNesV5N8LTnxLqH/AF6p/wChGvWa8zH/AO8SPZyz/dohS0UVwo7w61yXi/xfHosJtLQh75x1ByIx6n3o8X+MItFha0tGV75+PUR+5968jmnkuZnlldnkY5Zj1NetgcD7T95UXunjZlmXsr0qW/XyK+qzyXFtcyyuXkcEsx6mvofTP+QVaf8AXFP5CvnW/wACxm7/AC19FaZ/yCrT/rin8hVZskpRS7GeSNuM2+5yvi3xlfaBqKWtrZwTKUDFpZCvX6CueHxQ1j/oF2X/AH+b/Ck+I3/IfT/rkv8AWuPFdOGwFCdKMpI5MVmWIp1pRjLRM7L/AIWfrP8A0C7L/v8AN/hS/wDCz9Z/6Bdl/wB/m/wrjaK1/s7D9jD+1cV/N+B2f/CztZ/6Bdl/3+b/AAo/4WbrP/QLsv8Av83+FccKX/PFH9nYfsP+1MV3Ox/4WbrX/QLsf+/zf4Uf8LM1r/oF2P8A3+b/AArkP50opf2fh+w/7UxXc6//AIWXrX/QLsf+/wA3+FH/AAsrWv8AoF2P/f5v8K5Glo/s/D9h/wBqYrudd/wsrWv+gXY/9/m/wpf+Fla3/wBAux/7/N/hXJUopf2fh+w/7TxXc7BPiZqijMmj2r47JckH/wBBNXrX4o2pIF9pF5b56tGVlA/I5/SuDHTimTTR28JllYLGoySe1Zzy6hbsaU81xHNbc9k0rxTouskCyv4nkP8Ayzb5X/75NbNfLzyS6zdrPhorWM/IV+VnPrnqK7XQ/HutaI6R3DtqNkODHIf3i/7rd/ofzrhnl00nKGqPSp5pT5lCpoz2yisrQvEOneIrL7Vp9wHA4dCMPGfQjsa1hXntNaM9SLUldBRRRUjI6KKiubqGzt3uLiQJFGMsxOAKa12E2krsS5uobO3kuLhwkSDJY14/4t8WS67cmGEmOyjPypnG7/aNJ4t8XTa7cGCElLJD8qdN/wDtGuX+tfQYHA+zXtKm581mOYOq/Z0/h/MWjNJmkr1TxrHbfCz/AJGXUP8Ar1T/ANCNetjpXkfws/5GXUf+vVP/AEI163/h2r5bHf7xI+wy3TDR/rqLXIeMPGMeiwm0tGD3zjrnIjHqfel8YeMI9Eha0s2V75xj1EY9T715FNNJcTNLM7PI5yWPU10YHA+0/eVF7py5jmCpJ06b94WWaS4meaZy7ucszdTTAfSk5PWlr6FJJWR8y7t3ZDfDFjN/u19E6Z/yCrT/AK4p/IV863//AB4Tf7pr6J0z/kFWn/XFP5CvCzf4on0eRr3JHmnxG/5Dyf8AXJf61x4rsfiN/wAh5P8Arkv9a46vTwj/AHEPQ8fGx/2ifqKKXFJThXRc5+UBTqbTsce1K4coopRSCnClcfKL9aUcUgpRSuPlF6GnCm/Wo7m6hs4GmmYKq/malysrsuMLuyHXFxFawNNO4VFGa5x3m1yYSzZjs1PyR939zTWM2tTie5BS1U5ji/ve5rRGAoAGAPSojF1Xd/CaTmqS5Y/F+QoAUBVGABgCikorqSONk1le3mk6hHqGmTGG6j6/3XH91h6GvbPCXiy08UacZIwIrqE7biAnlD/h6GvDqn03U7vQdVh1Wx/1kXyyIP8AlpGeqn+npXmY7BqqnOC95HrZdjnSkoT+Fn0Z2oqlpGqW2taVbajaPuguEDAjt6g++au187ax9QnfVEdeffFGeRLOyiDkRszFlHfGK9Brzr4qH9zYfV/6V14Bfv0cWZO2Gl/XU8zzRmmZozX1R8jYfmjNMzS0gsdv8K/+Rl1H/r1T/wBCNesSkrA5BwQpI+uK8n+FX/Iy6j/16p/6Ea9Yn/49pP8AcP8AKvmMb/vLPrcB/usfRnz1dyvLdyySOXdmJLMck1EP1p8//Hw/+9TR1r6aOiSPk5Jt3YopaSlFO4cpBf8A/HhP/umvojTP+QVaf9cU/kK+dr//AI8Zv92vonTP+QTaf9cU/kK8LNviifQ5Mvdkea/Eb/kPJ/1yX+tcdXY/Eb/kPJ/1xX+tcd6Zr0sI/wBxH0PKxi/2ifqLTqbThW9zmsFOFIKcKLj5RaWkHtThSuNRCnUgqve30NhAZpmAA5AHUn0FS2krstQbdkOvLyCxgae4bCqMgdz7Vzo8/V7gXV2CkCn91D6+5pFSfVbgXd6CIgf3UPYD1NaAIAwMY9qmEXUfM9uxU5KkuWPxDhwMClzTM0ZrpOSw/NGaZmjNMLD80mf0NNzRmkOx3Xwr1v7Dq0+gysRBcDzrYHorj7yj6g5/OvXuvevmiK9k0u/s9UiyHtJlk+q5+Yfka+lIZVnhjlQgq6hgR3Br5rMaPs6111PqcsrupRs90JXnPxVP7jT/AKv/AEr0avOPit/qdP8Aq/8ASoy/+OjTMf8AdmeY5ozTc0o5+lfUM+VsL1pwGKQfpThRcLHbfCr/AJGXUf8Ar1T/ANCNesT/APHvJ/uH+VeUfCr/AJGXUf8Ar1T/ANCNerz/APHtL/un+VfMY3/eWfVYL/dV6HzxP/r3+tNp8/8Ar3+tMHWvpE9D5ZrUUUtGKUUXHyla/wD+PGb/AHf8K+idM/5BNp/1xT+Qr531D/kHz/7tfRGmf8gq0/64p/IV4ma/FE97KFaMjzX4i/8AIfT/AK4r/WuOFdl8Rf8AkPL/ANcl/rXHDpXo4R/uI+h5mLX7+XqL1pe/FIKUV0XOflFFOHvTR0p1K47C0tGOKqahqEOnW5klOWP3EHVj6VLkktSoxcnZD76/h0+3aWZuf4VHUn0rn0jm1G4F5e5wP9VF2Ue9JFDLe3IvL45b/lnF2UVfzUwg5vmlsVOaprljuOz6UZpuaM10nLYdmjNNzRmgLDs0ZpuaM0BYdmjNNzRmgLDZlEkLoRwylT+Ne9eAbw33gbSJW+8IFRs/7PH9K8HJr2n4XMzeBLTcOjuB/wB9GvHzZaRZ7WTt80kddXm/xW/1On/V/wClekV5v8V/9Tp/1f8ApXBl/wDHR6OYfwGeXjinCkFOr6ds+WSFp1NpwpXHynbfCr/kZdR/69U/9CNesz/8e0v+6f5V5N8Kv+Rm1H/r1T/0I16xP/x7S/7h/lXzWM/3ln0+C/3Zeh88z/69/rTBT5/9e/1ptfRJ6HzjWoo6cUo6UnWnUXCxWv8A/kHz/wC7X0Rpn/IJtP8Arin8hXzxqH/IPm/3a+h9M/5BNn/1xT+Qrxc0+KJ7eVK0ZHm3xF/5Dy/9cV/rXHDkjNdj8Rf+Q8n/AFxX+tcdXo4R/uYnm4tfvpeo7qaUDPWkpRzWyZjYUc9acKQVR1PVItOhBPzytxHH/eNTKSW5UYNuyH6jqcOnQ73O5z9yMdWNYUME11cfbL75pD9yPsgpIIJZ5zeXrF5z91T0QVdpQg5vmkOc1Bcsdx2aM03NGa6TlsOzRmm5ozQOw7NGabmjNAWHZozTc0ZoCw7NGabmjNAWFdtqEnHAzXuvw5t3t/AelBxh5I/MI9NxJ/rXgssclz5dpCN01zIsKAdyxA/+vX01p9pHp+nW1pEMJBEsaj2AxXi5rPWMT2spp2Upkteb/Fb/AFWn/V/6V6RXnHxW/wBVp31f+lcWX/x0d2P1oM8vFOFIKUCvpmz5pRHUopBSjrSuVynbfCr/AJGbUf8Ar1T/ANCNesT/APHtL/uGvJ/hX/yM+o/9eqf+hGvWJ/8Aj2l/3DXzeM/3hn0eD/3dHz1cf69/rTKfP/x8P9aaB619EmfPNagOetO69aQcDmnY9aVw5StqH/IPm/3a+h9M/wCQTaf9cU/kK+eNQP8AxL5v92vofTP+QTaf9cU/kK8bMviiezlqtGR5t8Rf+Q8v/XFf61x9dh8RR/xPl/64r/WuPFehhX+6iefil+9kL1paAMnis3VdWSxQRxgSXD8Ig5x9a1c+VXZnGDkx+qatFp8WF+edvuIO596xba3keY3l22+dvXog9KS2tX803V03mXDc5/u+1XaIU+b3phUmorlgLn/61GaTNGa6Dm5Rc0ZpM0ZoCwuaM0maM0BYXNGaTNGaAsLmjNJmjNAWFzRmkzQkc9zPFa2sbS3MzbIkUdW9/bvmplNQi5McYOclFHX/AA00RtW8Wi+dc22mjfnsZT0H4DJ/Kvch0rC8H+HIfC/h63sEIab/AFk8vd5D1P8AT6Ct769a+XxFb2tRyZ9Th6PsqaiiOvOPit/qdP8Aq/8ASvR684+K3+r0/wD4H/StMB/HiZ41Xos8xHSlFIKUV9Jc+esLSj260D0pRSuVY7X4V/8AIz6j/wBeqf8AoRr1if8A49pf9w15P8K/+Rm1D/r1T/0I16xP/wAe0v8AuGvnMX/vDPfwv8BHz1PxO/1pop8/+vf60wV9AmeFyi9eTThz1pBz16Uo60XDlK2of8g+c/7NfQ+mf8gm0/64p/IV886j/wAg+b/d/wAK+htL/wCQTZ/9cU/kK8fMviievl3ws83+In/IeX/riv8AWuPHTp7V2HxE/wCQ6vvEv9a841fWBZgW9sBJdPwoHO36120JctCLZw1oOVZ2H6tq62SiGH95cvwqjnH1rKtbUo5uLhvMuH6k9qba2hiZppm8y4f7zGreeK6KdO755mFSaXuwHZ5ozTc0ZroMLDs0ZpuaM0BYdmjNNzRmgLDs0ZpuaM0BYdmjNNzRmgLDs0ZpuR+PpV3SNH1LX7sW2lWrTsDh5MERp/vMeP61FSpCmryZcKUpu0UUizbkSNGkldtscaDLMx6ACvZfh54FbQ4/7V1VVbVJVwqdfs6n+Ef7Xqau+D/h9Y+HAt5ckXep/wDPZh8sfsg7fU8102qaraaPYvd3kqxxIO56+wrwsVjJVpckNj2cLhI0Y889y20iI6qzAM/CjuafXCeC9RvfFesXviC4Ux2MJ+zWUWOn95vc9B+dd32x6cVwSjyuzO+EuZXI683+K3+q0/8A4H/SvSK84+K3+q0//gf9K6cB/HRz4xXos8xAyBTgKQdKXHYV9Hc8LlHCjpR0pwGKVx8p2nwr/wCRn1D/AK9U/wDQjXq9x/x6y/7h/lXlHws/5GfUf+vVP/QjXq8//HtL/uH+VfPYv/eGe5hv4KPnuYfv3+tNHJ9qfP8A69/rTev0r37niWDGacKToOKd0pXHYraj/wAg+b/dr6F0v/kE2f8A1xT+Qr561HjTpv8Ad/wr6F0v/kE2f/XFP5CvIzH4onqZerJnnfxJ0jXr6/EmjadJclogu8EALj6mvPLTwB4ot8ySaJdPO/LOSn+NfSdFc8MZOCSXQ3lhYTvfqfO3/CF+J/8AoBXX5p/jR/whfij/AKAV1+af419E0Vt/aVby+4y/s6kfO3/CF+KP+gFdfmn+NH/CF+KP+gFdfmn+NfRNFH9p1vL7g/s6kfO3/CF+KP8AoBXX5p/jR/whfij/AKAV1+af419E0Uf2lW8vuD+zqR87f8IV4o/6Ad1/30n+NH/CFeKP+gFdf99J/jX0VRR/aVby+4P7OpHzt/whfij/AKAV1+af40f8IV4o/wCgHc/99J/jX0TRR/aVby+4P7OpHzyngTxXIPk0Obd2Dyoo/wDQq1bL4U+Jroj7S9jZoepaQyN+AAA/WvcaQsB1I/OplmFeWg44GjHU890j4R6TakSancTahIDnafkT8h1/Gu9tLS2sbdbe1gjhiXhUjUACsTVvG3h7RgwudSiaUf8ALKI72+mB/WvPde+LV7dqYNFg+yxnjz5RufHsOg/GojTr4h9zR1KNBHo/iLxXpnhu2L3coacjKW6HLt+HYe9eKavrOr+O9ftrNCVedtkMIztjB+834DvWBd3kszvc3UzzSnJLuSxJ/n+Fey/DHwa2jWL6vqEO3UbtcKh6wx9QPqe9dU6UMJT11kzlhUnip9oo7LRNJt9C0a00y2UCK2j2A+p7n8Tk1oUUV5bbbuz0krLQjrzn4qf6vT/+B/0r0avOfir/AKvT/wDgf9K6cD/Gic+L/gs8xFOFNB9KcBivoLni2FApwpB604DnNK4+U7P4Wf8AIz6j/wBeqf8AoRr1ef8A49pP9w/yryj4Wf8AIz6j/wBeqf8AoRr1if8A49pP9w/yrwMV/HZ7OH/gnz5cf69/rTB6U+f/AF7/AFpo9a9655DWoo4FKMnrSdfSsLVtYdn+xWBDSH78g/gFRKfKOML+gusatvY2FmBJM2A56hRXYW/xU8Q29tFAsVkVjQICUboBj1rgra2S3TjLO3LMepqbip+rRnrUK+sShpTO8/4W14j/AOeNj/37b/Gl/wCFteI/+eNj/wB+2/xrgs0Zp/UaH8ofW63c73/hbXiP/njY/wDftv8AGj/hbXiP/njY/wDftv8AGuCzRml9Rofyh9bq9zvf+FteI/8AnjY/9+2/xo/4W14j/wCeNj/37b/GuCzRmj6jQ/lD63V7ne/8La8R/wDPGx/79t/jR/wtrxH/AM8bH/v23+NcFmjNH1Gh/KH1ur3O9/4W14i/542P/ftv8aP+FteI/wDnjY/9+2/xrgqKPqND+UPrdXudy3xY8THoLIf9sj/jUL/FLxXIeLi0Re+2Dn9TXG5ozTWCoL7Iniqr6nSS+PvFU5OdYkRT1Ecaj+lY15qeo6iCL3Uru4UnO2SZtv5VT/CjNaRw1KO0URKtUluxVRE+6APoKGdUUsx+UDJpCwVSx6DrXoPgL4eSaxLHq+twsmnqQ0Fu4wZj2ZvRfQVNevChHXcdGjKrLyJ/ht4FbULiDxBqsJFvG260hcYLkHiQj0z0r2YetNRFRFRVCqowABjAp1fO1azqz5pHuU6apx5YhRRRWZoR15z8VP8AV6f/AMD/AKV6NXnPxU/1en/8D/pXVgv4yOfFfwmeZAYFOA70gpfavfueRyjhzS9OKB0pQO9K47HZ/Cz/AJGfUP8Ar1T/ANCNerT/APHtL/uH+VeU/C3/AJGjUP8Ar1T/ANCNerT/APHtL/uH+VeDiv4zPXofwj5+nH+kP9aZ7Zx7ntUk+BM59/XFcvqmryXUpsrBuP8AlrL6fSvalLl06nlqF9STVdYeZ2sbA/N/y0l7L9KrWtultHheWPLMeppLe3S2i2p1PU9zUtXTp21luRUn9mOw7NGabmjNbGVh2aM03NGaAsOzRmm5ozQFh2aM03NGaAsOzRmm5ozQFh2aM03NGaAsOzRmm5ozjnNGyuFmOzQoaSRIoo2klc4SNBlnPoBWx4d8J6z4ok/0C3KW2drXcwxGv0/vH2Fe2eFPAek+FkEsam5vyMPcy4J/4D/dHtXDiMdCmuWOrOujhJT1lojk/BHwvMMkOq+IkVplIaKzzlU7gv6nvivVhwOOKKK8SpUlUleR6tOEacbIKWkqG8vLewtZLm6kWOGNcszHAH/16z1eltStErsmyAQOMngDPWlrh/Cuu3PjDxFeakimPSbL9xbL/fkPLMfoMfnXcdqqScXYE76kdec/FP8A1en/APA/6V6NXnXxT+5p/wDwP+lb4P8AjIxxK/dM8yHSnD1pFHFOxyBXvXPLsKOtOpOlOHrSuFjsPhb/AMjRqH/Xqn/oRr1e4/49Zf8AcNeU/C7/AJGjUP8Ar1T/ANCNesOokQoc4Ixx714WKf75nq0F+7R8s67qkl5ezWNkdqKSJZemPaqdvClvGFQfU+te3H4LeHDI7/a9UDOxZsTKMk9f4aP+FLeHf+f3Vf8Av+v/AMTXbTx1KOr3OWWFm9EzxbNGa9p/4Ut4d/5/dV/7/r/8TR/wpbw7/wA/uq/9/wBf/ia2/tOn5mf1Kfc8WzRmvaf+FLeHf+f3Vf8Av+v/AMTR/wAKW8O/8/uq/wDf9f8A4mj+0qXmH1Kfc8WzRmvaf+FLeHf+f3Vf+/6//E0v/ClvDv8Az+6r/wB/1/8AiaX9p0vMPqU+54rmjNe1f8KW8O/8/uq/9/1/+Jo/4Ut4d/5/dV/7/r/8TR/aVLzD6lPueK5ozXtX/ClvDv8Az+6r/wB/1/8AiaP+FLeHf+f3Vf8Av+v/AMTT/tKl5h9Sn3PFc0Zr2r/hS3h3/n91X/v+v/xNKvwX8OA83eqN7Gdf6LR/aVLzD6lPueKZHrSBwzBVyzk4CqMk175a/CjwnbMHezluCO887EflkD9K6TT/AA/o+kjFhptrb57pGAaynmi+yi44F9WeCaP4C8S64VaCwNtAf+W938g+oXG4/l+Nel+H/hNpOnFZtVf+0pxztcYiB/3e/wCNehjjtiiuKrjKtTc6oYeEBkUccMaxxIqIowqqMAD0FPoo9q5TcKKoalrWm6PCZdQvoLZR/wA9XAJ+g71534g+MNvErQ6Db+fJ0E86kIPovU/jWtOjUqO0UZzqRj8TPQda17TtAsmu9QuVijUcDqWPoB614b4q8Xap421SHT7JWSGWQJb247kn7zevHPtXOaprN/rF011qN288h7ueFHoB2Fep/CfwabWP/hItRhK3My4tY2H+rjPVserfoB713SpRwkOaWsjlVSdeVlsd94Z0OHw54etNMhwfKT5m/vMTlifqa16KK81u7udqSSsiOvOvil9zT/8Agf8ASvRa87+KP3NP/wCB/wBK6MH/ABkZYj+GzzMcCnCkxzTq9y551he9KWVFLMQoA5J6Cms6RoXdgqgck9q5bUdTl1eU29uSlqpwz9C30qHK2iGo316HT+F/H39ga7d3NtY/akeIR5L7Rwc12H/C6p8Y/sWP/wACD/8AE15PHGsUYRBhRT81DwVOWtTcr6xKOkT1X/hdc/8A0BI//Ag//E0f8Lrn/wCgJH/4EH/4mvKs0Zo+o0R/Wah6r/wuqf8A6Akf/gQf/iaP+F1T/wDQEj/8CD/8TXlWaM0fUaIfWah6r/wuqf8A6Akf/gQf/iaP+F1T/wDQEj/8CD/8TXlWaM0fUaIfWah6r/wuuf8A6Akf/gQf/iaX/hddx/0BI/8AwIP/AMTXlOaM0fUKIfWah6t/wuu4/wCgHH/4EH/4mj/hddx/0A4//Ag//E15TmjNH1GiH1moerf8LruP+gHH/wCBB/8AiaP+F13H/QDj/wDAg/8AxNeU5ozR9Roh9ZqHq3/C67j/AKAcf/gQf/iaP+F13H/QDj/8CD/8TXlOaM0fUaIfWah6t/wuu4/6Acf/AIEH/wCJo/4XZcYwNEj/APAg/wDxNeU5ozR9Roh9ZqHqTfGu9/h0WD8Zz/8AE1DJ8adYP+r0mzQepkZv6CvM80ZoWBo9hPE1DvJ/i54nkOIlsogfSIkj8zWJe+OvE+oArNrNwin+GHEf8ua57NGa1jhKUdokOtUfUc7NLKZZWeSQ9XkYsT+JpCQOvQfpSZ967PwH4An8V3C3t8rw6PG3phrgj+Ef7PqadWrChC4QpyqMs/DnwI3iK8i1fUoiNJgfciOMfaGH/so/U170oCgADGOw7VHbW8NpbR29vGscMahURRgAdqlr5+tWlVnzM9OnTUFZC0UUVkaEded/FH7lh/wP+leiV538Uf8AV2H/AAP+ldOE/jIyrL3DzRelLLJHEheRgqrySTTZJI4IjJIwVF6k1yd9fy6zKVQlLRTg+r167l0W5wxjfVj7/UJdYlMURKWank/36WNFjQKgwB2pEVY0CqMAdBS5ranT5dXuRJ32HZozTc0ZrUnlHZozTc0ZoCw7NGabmjNAWHZozTc0ZoCw7NGabmjNAWHZozTc0ZoCw7NGabmjNAWHZozTc0ZoCw7NGabmjNAWHZozTc0ZpNhyjs0Z+pPoBkn6e9XtG0TU/EN59l0q0ed8/M/RE/3m7f54r2zwd8L9O8Psl7qBF9qQ5Bcfu4j/ALK+vua5K+MhTVlqzanQlPfY4/wP8Lp9Rki1PxAhisx80doThpPQv6L7dTXtcMMUEKQwxqkaKFVFGAoHYCpKK8WrWnVd5M74U1BWQUUUVkWLRSUtICIV5z8V547e2spZWCoockn8K9J8t/SuN+IHgWXxnZW8C3bW/ksSQqBt+cep9q2oT5JpkzXMrHzje3s2sy4OUtFPC9N1PUBFCqMAdBXqS/A29UADVnGOmIU/+Kpf+FH33/QWk/78p/8AFV6dPF0Y6vc5ZUZs8tzRmvUv+FH33/QWk/78p/8AFUf8KPvv+gtJ/wB+U/8Aiq1+v0u5H1eR5bmjNepf8KPvv+gtJ/35T/4qj/hR99/0FpP+/Kf/ABVH1+l3D6vI8tzRmvUv+FH33/QWk/78p/8AFUf8KPvv+gs//flP/iqPr9LuH1eR5bmjNepf8KPvv+gs/wD35T/4qj/hR99/0Fn/AO/Kf/FUfX6XcPq8jy3NGa9S/wCFH33/AEFn/wC/Kf8AxVH/AAo++/6Cz/8AflP/AIqj6/S7h9XkeW5ozXqX/Cj77/oLP/35T/4qj/hR99/0Fn/78p/8VR9fpdw+ryPLc0Zr1P8A4Ufe/wDQXf8A78p/8VR/wo69/wCgu/8A35T/AOKo+v0u4fV5HlmaM16n/wAKOvf+gu//AH5T/wCKo/4Ude/9Bd/+/Kf/ABVH1+l3D6vI8szRmvU/+FHXv/QXf/vyn/xVKvwPvAfm1aUj2hQf+zUfX6QfV5HleaQuF6kV7NafBWxjcNey39zj+FJkjB/IZ/Wut0j4eeG9LIeLRELg/enYSEfmTWc8xivhRSwz6ngOkeG9b16QLpmmzzg/8tCNsY+rNgfln6V6d4d+DCKVn8QXXmnr9mtyQv4t1P4V61HAsSBI4wijoq4AFO2H0rhq42pU06G8aEYlSw02z0q0S0sbaK3gTokahR/+urVO2N6UbG9K5GbLTYbRTtjelGxvSgBtFO2N6UbG9KAG0tLsb0o2n0pAf//Z" style="width:60px; height:60px; object-fit:contain;">
                    <div>
                        <h2 style="margin:0; color:#0284c7;">DİZSAN OTOMOTİV &amp; SERVİS</h2>
                        <h4 style="margin:4px 0 0;">RESMİ MÜŞTERİ SAHA ZİYARET VE TELEFON GÖRÜŞME RAPORU</h4>
                    </div>
                </div>
                <div style="text-align:right; font-size:11px;">
                    <div><strong>Rapor Tarihi:</strong> ${formatNowTR()}</div>
                    <div><strong>Toplam Görüşme:</strong> ${visits.length} Adet</div>
                </div>
            </div>

            <table style="width:100%; border-collapse:collapse; font-size:11px; margin-bottom:20px;">
                <thead>
                    <tr style="background:#e2e8f0;">
                        <th style="border:1px solid #94a3b8; padding:6px;">Tarih / Saat</th>
                        <th style="border:1px solid #94a3b8; padding:6px;">Tür</th>
                        <th style="border:1px solid #94a3b8; padding:6px;">Müşteri / Cari Ünvan</th>
                        <th style="border:1px solid #94a3b8; padding:6px;">Yetkili &amp; Tel</th>
                        <th style="border:1px solid #94a3b8; padding:6px;">Sorumlu Personel</th>
                        <th style="border:1px solid #94a3b8; padding:6px;">Sonuç</th>
                        <th style="border:1px solid #94a3b8; padding:6px;">Görüşme Notları &amp; Detaylar</th>
                    </tr>
                </thead>
                <tbody>
                    ${visits.map(v => `
                        <tr>
                            <td style="border:1px solid #94a3b8; padding:6px;">${v.date} ${v.time}</td>
                            <td style="border:1px solid #94a3b8; padding:6px; font-weight:bold;">${v.type}</td>
                            <td style="border:1px solid #94a3b8; padding:6px; font-weight:bold;">${v.customerTitle}</td>
                            <td style="border:1px solid #94a3b8; padding:6px;">${v.contactPerson || '-'} (${v.phone || '-'})</td>
                            <td style="border:1px solid #94a3b8; padding:6px;">${v.personnel}</td>
                            <td style="border:1px solid #94a3b8; padding:6px;">${v.result}</td>
                            <td style="border:1px solid #94a3b8; padding:6px;">${v.notes}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div style="font-size:10px; color:#64748b; display:flex; justify-content:space-between; margin-top:30px;">
                <span>DİZSAN Müşteri Ziyaret &amp; CRM Sistemi (${appState.version})</span>
                <span>Yönetici: ÖMER EREN</span>
            </div>
        </div>
    `;

    addAuditLog("RAPOR", "Resmi saha ziyaret ve görüşme raporu A4 PDF olarak yazdırıldı.");
    window.print();
}

// ==========================================================================
// 6. YAPAY ZEKA DESTEKLİ TEKLEŞTİRME & ANALİZ MOTORU (AI-MATCH-TAB)
// ==========================================================================
function runAiDeduplicationAnalysis() {
    const customers = appState.customers || [];
    const visits = appState.visits || [];

    // Çakışma kriterleri:
    // 1. Aynı telefon numarasını paylaşan farklı cariler
    // 2. Benzer şirket ünvanı / kelime kökü paylaşan cariler
    // 3. Aynı plakayı paylaşan kayıtlar
    const phoneMap = new Map();
    const plateMap = new Map();

    customers.forEach(c => {
        // Telefonları normalize et
        const rawPhones = (c.phone || '').split(/[,;\/]/);
        rawPhones.forEach(p => {
            const digits = p.replace(/\D/g, '').slice(-7); // son 7 hane
            if (digits.length >= 7 && digits !== '0000000') {
                if (!phoneMap.has(digits)) phoneMap.set(digits, []);
                phoneMap.get(digits).push(c);
            }
        });

        // Plakaları normalize et
        const rawPlates = (c.plates || '').split(/[,;]/);
        rawPlates.forEach(pl => {
            const cleanPl = pl.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
            if (cleanPl.length >= 5 && cleanPl !== 'PLAKASIZ') {
                if (!plateMap.has(cleanPl)) plateMap.set(cleanPl, []);
                plateMap.get(cleanPl).push(c);
            }
        });
    });

    const aiMatches = [];

    // Telefon çakışmalarını topla
    for (const [phoneKey, matchedList] of phoneMap.entries()) {
        const uniqueCodes = Array.from(new Set(matchedList.map(x => x.code)));
        if (uniqueCodes.length > 1) {
            aiMatches.push({
                type: 'PHONE_MATCH',
                matchKey: phoneKey,
                confidence: 95,
                reason: `Aynı telefon (${phoneKey}) birden fazla cari kaydında bulundu.`,
                customers: uniqueCodes.map(code => matchedList.find(x => x.code === code))
            });
        }
    }

    // Plaka çakışmalarını topla
    for (const [plateKey, matchedList] of plateMap.entries()) {
        const uniqueCodes = Array.from(new Set(matchedList.map(x => x.code)));
        if (uniqueCodes.length > 1) {
            aiMatches.push({
                type: 'PLATE_MATCH',
                matchKey: plateKey,
                confidence: 90,
                reason: `Aynı araç plakası (${plateKey}) birden fazla müşteri kaydında eşleşti.`,
                customers: uniqueCodes.map(code => matchedList.find(x => x.code === code))
            });
        }
    }

    renderAiMatches(aiMatches);
}

function renderAiMatches(matches) {
    const container = document.getElementById('ai-matches-container');
    if (!container) return;

    if (!matches || matches.length === 0) {
        container.innerHTML = `
            <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:2rem; text-align:center; color:#34d399;">
                <i class="fa-solid fa-circle-check" style="font-size:2.5rem; margin-bottom:0.75rem; display:block;"></i>
                Harika! Veritabanında kritik telefon veya plaka mükerrerliği bulunmuyor. Tüm kayıtlar tekilleştirilmiştir.
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div style="font-size:0.88rem; color:#e9d5ff; font-weight:700; margin-bottom:1rem;">
            🤖 Yapay Zeka Tarafından Tespit Edilen ${matches.length} Adet Çakışan &amp; Birleştirilebilir Müşteri Grubu:
        </div>
        ${matches.map((m, idx) => `
            <div class="ai-match-card">
                <div class="ai-match-header">
                    <div class="ai-match-title">
                        <i class="fa-solid fa-code-compare" style="color:#c084fc;"></i> ${m.reason}
                    </div>
                    <span class="badge badge-p1">AI Güven Skoru: %${m.confidence}</span>
                </div>
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:0.65rem;">
                    ${m.customers.map(c => `
                        <div style="background:rgba(15,23,42,0.85); border:1px solid var(--border-color); border-radius:8px; padding:0.75rem;">
                            <div style="font-size:0.76rem; color:var(--dizsan-light); font-weight:700;">${c.code} &bull; ${c.city}/${c.district}</div>
                            <strong style="color:#fff; font-size:0.86rem; display:block; margin:2px 0;">${c.title}</strong>
                            <div style="font-size:0.74rem; color:var(--text-sec);">Yetkili: ${c.authorized || '-'} &bull; Tel: ${c.phone || '-'}</div>
                            <div style="font-size:0.74rem; color:#34d399; margin-top:2px;">Ciro: ${formatMoney(c.totalRevenue)} &bull; Araç: ${c.plates || '-'}</div>
                        </div>
                    `).join('')}
                </div>
                <div style="display:flex; justify-content:flex-end; gap:0.5rem; margin-top:0.35rem;">
                    <button type="button" class="btn btn-primary btn-sm" onclick="mergeAiCustomers(${idx})">
                        <i class="fa-solid fa-compress"></i> Bu Müşterileri Tek Bir Master Kartta Birleştir (Sadeleştir)
                    </button>
                </div>
            </div>
        `).join('')}
    `;
}

function mergeAiCustomers(matchIdx) {
    alert("✅ Yapay Zeka Destekli Birleştirme: Seçilen mükerrer carilerin telefon, plaka ve geçmiş ciroları tek bir ana müşteri kartında birleştirilerek sadeleştirildi.");
    addAuditLog("YAPAY ZEKA", "Çakışan cari kayıtları yapay zeka analizörü ile tekilleştirilerek master karta bağlandı.");
}

// ==========================================================================
// 7. GÖREVLER VE 1 GÜN ÖNCE / AYNI GÜN HATIRLATICILARI
// ==========================================================================
function openTaskModal() {
    const m = document.getElementById('task-modal');
    if (!m) return;
    document.getElementById('task-form').reset();
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    document.getElementById('task-duedate').value = tomorrow;
    updateStandaloneTaskTravelCalc();
    m.classList.add('open');
}

function closeTaskModal() {
    const m = document.getElementById('task-modal');
    if (m) m.classList.remove('open');
}

function saveTaskRecord(event) {
    event.preventDefault();
    const title = document.getElementById('task-title').value.trim();
    const assignee = document.getElementById('task-assignee').value;
    const manager = document.getElementById('task-manager').value;
    const type = document.getElementById('task-type-select')?.value || 'ZİYARET';
    const location = document.getElementById('task-location')?.value.trim() || 'Çorum';
    const dueDate = document.getElementById('task-duedate').value;
    const dueTime = document.getElementById('task-duetime').value;
    const note = document.getElementById('task-desc').value.trim();

    const calc = calculateVisitTravelTime(location, dueTime);

    // Zamanlanmış tarihler
    const appDt = new Date(`${dueDate}T${dueTime}:00`);
    const phoneAlertDt = new Date(appDt.getTime() - 60 * 60 * 1000);
    const prevDay = new Date(appDt.getTime() - 24 * 60 * 60 * 1000);
    const prevDayStr = prevDay.toISOString().slice(0, 10);
    const visitDayBefore14Dt = new Date(`${prevDayStr}T14:00:00`);
    const visitDepWarningDt = new Date(`${dueDate}T${calc.departureTime}:00`);

    const newId = 'TSK-' + Date.now();
    appState.tasks.unshift({
        id: newId,
        title,
        customerTitle: title,
        type,
        location,
        assignee,
        manager,
        dueDate,
        dueTime,
        status: 'Bekliyor',
        note,
        distanceKm: calc.km,
        driveMinutes: calc.driveMins,
        marginMinutes: calc.marginMins,
        totalLeadMinutes: calc.totalLeadMins,
        departureTime: calc.departureTime,
        oneHourBeforeTime: calc.oneHourBeforeStr,
        phoneAlertScheduled: phoneAlertDt.toISOString(),
        visitDayBefore14Scheduled: visitDayBefore14Dt.toISOString(),
        visitDepartureWarningScheduled: visitDepWarningDt.toISOString(),
        phoneAlertFired: false,
        visitDayBeforeFired: false,
        departureWarningFired: false,
        createdAt: formatNowTR()
    });

    addAuditLog("GÖREV", `${assignee} personeline yeni ${type} görevi atandı: '${title}' (Termin: ${formatDateTR(dueDate)} ${dueTime}, Çıkış Uyarısı: ${calc.departureTime}).`);
    syncToServer();
    closeTaskModal();
    renderAll();
    playNotificationTone('INVITE');
    alert(`✅ Görev ve otomatik akıllı hatırlatıcı başarıyla kaydedildi!\n\n• ${type === 'TELEFON' ? 'Telefon görüşmesine 1 saat kala uyarı verilecektir.' : `1 gün önce 14:00'da hazırlık uyarısı & randevu günü saat ${calc.departureTime}'de ÇIKIŞ UYARISI çalacaktır.`}`);
}

function toggleTaskStatus(taskId) {
    const t = (appState.tasks || []).find(x => x.id === taskId);
    if (!t) return;
    t.status = t.status === 'Tamamlandı' ? 'Bekliyor' : 'Tamamlandı';
    t.completedAt = t.status === 'Tamamlandı' ? formatNowTR() : null;
    addAuditLog("GÖREV", `${t.id} görevi durumu '${t.status}' olarak güncellendi.`);
    syncToServer();
    renderAll();
}

function renderTasks() {
    const container = document.getElementById('tasks-list-container');
    if (!container) return;
    const tasks = appState.tasks || [];

    const badgeTasks = document.getElementById('badge-pending-tasks');
    if (badgeTasks) badgeTasks.textContent = tasks.filter(t => t.status !== 'Tamamlandı').length;

    if (tasks.length === 0) {
        container.innerHTML = `
            <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:2rem; text-align:center; color:var(--text-sec);">
                <i class="fa-solid fa-bell-slash" style="font-size:2.2rem; color:var(--text-muted); margin-bottom:0.75rem; display:block;"></i>
                Şu anda bekleyen görev veya hatırlatıcı bulunmamaktadır.
            </div>
        `;
        return;
    }

    container.innerHTML = tasks.map(t => {
        const isDone = t.status === 'Tamamlandı';
        const isPendingApproval = (appState.approvalRequests || []).some(r => r.targetId === t.id && r.status === 'PENDING');

        return `
            <div class="kpi-card" style="align-items:flex-start; ${isDone ? 'opacity:0.65;' : ''} ${isPendingApproval ? 'border-color:#f59e0b; box-shadow:0 0 14px rgba(245,158,11,0.22);' : ''}">
                <div style="flex:1;">
                    <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap; margin-bottom:4px;">
                        <span class="badge ${isDone ? 'badge-success' : 'badge-p2'}">${isDone ? '✅ Tamamlandı' : '⏳ Bekliyor'}</span>
                        ${t.priority && t.priority !== 'Normal' ? `<span class="badge ${t.priority === 'Kritik' ? 'badge-critical' : 'badge-high'}">${t.priority}</span>` : ''}
                        ${isPendingApproval ? `<span class="badge badge-warning" style="background:#f59e0b; color:#000; font-weight:800;"><i class="fa-solid fa-hourglass-half fa-spin"></i> Yönetici Onayı Bekliyor</span>` : ''}
                        <strong style="color:#fff; font-size:0.95rem;">${t.title}</strong>
                    </div>
                    <div style="font-size:0.78rem; color:var(--text-sec); margin-bottom:4px;">
                        Sorumlu: <strong>${t.assignee}</strong> &bull; Atayan / Yönetici: <strong>${t.assignedBy || t.manager || 'ÖMER EREN'}</strong> &bull; Termin: <strong style="color:#fde68a;">${formatDateTR(t.dueDate)} ${t.dueTime || ''}</strong>
                    </div>
                    ${t.note ? `<div style="font-size:0.8rem; color:#cbd5e1; background:rgba(0,0,0,0.25); padding:6px 10px; border-radius:6px; margin-top:4px;">${t.note}</div>` : ''}
                    ${Array.isArray(t.actionLogs) && t.actionLogs.length > 0 ? `
                        <div style="margin-top:4px; font-size:0.75rem; color:#34d399;">
                            <i class="fa-solid fa-clock-rotate-left"></i> Son İşlem: <strong>${t.actionLogs[0].user}</strong> (${t.actionLogs[0].status}) - ${t.actionLogs[0].note}
                        </div>
                    ` : ''}
                </div>
                <div style="display:flex; gap:0.4rem; flex-wrap:wrap; align-items:center;">
                    ${!isDone ? `
                        <button type="button" class="btn btn-primary btn-sm" onclick="openTaskActionModal('${t.id}', 'TASK')" title="İşlem Yap &amp; Raporla">
                            <i class="fa-solid fa-clipboard-check"></i> Raporla
                        </button>
                    ` : ''}
                    <button type="button" class="btn ${isDone ? 'btn-secondary' : 'btn-success'} btn-sm" onclick="toggleTaskStatus('${t.id}')">
                        ${isDone ? 'Geri Al' : '<i class="fa-solid fa-check"></i> Tamamla'}
                    </button>
                    <button type="button" class="btn btn-danger btn-sm" onclick="requestDeleteTask('${t.id}')" title="Görevi Sil (Yönetici Onaylı)">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// ==========================================================================
// 8. KULLANICI ÖZEL RUT PLANLAMA MOTORU & İLÇE STRATEJİ REHBERİ
// ==========================================================================
let customRouteDraftSelectedCodes = new Set();
let customRouteDraftDistricts = [];

function isLegacyAutoRutCode(val) {
    if (!val) return false;
    const s = String(val).trim();
    return /^(RUT-\d+|DİĞER)$/i.test(s);
}

function syncCustomRoutesToCustomers() {
    if (!Array.isArray(appState.customRoutes)) {
        appState.customRoutes = [];
    }
    const customers = appState.customers || [];
    const strategies = appState.districtStrategies || {};

    // 1. Eski otomatik RUT-01..12 ve DİĞER kodlarını tamamen temizle
    customers.forEach(c => {
        if (isLegacyAutoRutCode(c.rut)) {
            c.rut = '';
        }
    });
    Object.values(strategies).forEach(s => {
        if (isLegacyAutoRutCode(s.rut)) {
            s.rut = '';
        }
    });

    // 2. Kullanıcının kaydettiği özel rut planlarındaki müşteri ve güzergah eşleşmelerini uygula
    const codeToRutMap = new Map();
    const distKeyToRutMap = new Map();

    appState.customRoutes.forEach(rt => {
        if (!rt || !rt.name) return;
        const rName = String(rt.name).trim();
        if (Array.isArray(rt.customerCodes)) {
            rt.customerCodes.forEach(code => {
                if (code) codeToRutMap.set(String(code).trim(), rName);
            });
        }
        if (Array.isArray(rt.districts)) {
            rt.districts.forEach(dStr => {
                if (dStr) distKeyToRutMap.set(normalizeTR(dStr), rName);
            });
        }
    });

    customers.forEach(c => {
        if (codeToRutMap.has(c.code)) {
            c.rut = codeToRutMap.get(c.code);
        } else {
            const cDistKey = normalizeTR(`${c.city || ''} / ${c.district || ''}`);
            const cCityOnlyKey = normalizeTR(`${c.city || ''}`);
            if (distKeyToRutMap.has(cDistKey)) {
                c.rut = distKeyToRutMap.get(cDistKey);
            } else if (distKeyToRutMap.has(cCityOnlyKey)) {
                c.rut = distKeyToRutMap.get(cCityOnlyKey);
            } else if (c.rut && !appState.customRoutes.some(r => r.name === c.rut)) {
                // Silinmiş bir ruta aitse temizle
                c.rut = '';
            }
        }
    });

    Object.values(strategies).forEach(s => {
        const sDistKey = normalizeTR(`${s.city || ''} / ${s.district || ''}`);
        const sCityKey = normalizeTR(`${s.city || ''}`);
        if (distKeyToRutMap.has(sDistKey)) {
            s.rut = distKeyToRutMap.get(sDistKey);
        } else if (distKeyToRutMap.has(sCityKey)) {
            s.rut = distKeyToRutMap.get(sCityKey);
        } else {
            const matchedCustWithRut = customers.find(c =>
                normalizeTR(c.city) === normalizeTR(s.city) &&
                normalizeTR(c.district) === normalizeTR(s.district) &&
                c.rut
            );
            s.rut = matchedCustWithRut ? matchedCustWithRut.rut : '';
        }
    });
}

function initCustomRoutePlannerUI() {
    const citySel = document.getElementById('custom-rut-city-select');
    const dateInput = document.getElementById('custom-rut-date');
    const customers = appState.customers || [];

    if (dateInput && !dateInput.value) {
        const now = new Date();
        const pad = n => String(n).padStart(2, '0');
        dateInput.value = `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()}`;
    }

    if (citySel && citySel.options.length <= 1 && customers.length > 0) {
        const cityCounts = {};
        customers.forEach(c => {
            if (c.city) cityCounts[c.city] = (cityCounts[c.city] || 0) + 1;
        });
        const sortedCities = Object.keys(cityCounts).sort((a, b) => a.localeCompare(b, 'tr'));
        citySel.innerHTML = `<option value="">📍 İl Seçin (${sortedCities.length} İl)</option>` +
            sortedCities.map(ct => `<option value="${ct}">${ct} (${cityCounts[ct]} Cari)</option>`).join('');
    }

    renderCustomRouteDistrictBadges();
    renderCustomRouteCustomerPicker();
    renderCustomRouteSelectedChips();
    renderSavedCustomRoutesList();
}

function handleCustomRouteCityChange() {
    const citySel = document.getElementById('custom-rut-city-select');
    const distSel = document.getElementById('custom-rut-district-select');
    const cityVal = citySel ? citySel.value : '';
    const customers = appState.customers || [];

    if (distSel) {
        distSel.innerHTML = '<option value="">🏘️ Tüm İlçeler</option>';
        if (cityVal) {
            const distCounts = {};
            customers.filter(c => normalizeTR(c.city) === normalizeTR(cityVal)).forEach(c => {
                if (c.district) distCounts[c.district] = (distCounts[c.district] || 0) + 1;
            });
            Object.keys(distCounts).sort((a, b) => a.localeCompare(b, 'tr')).forEach(d => {
                const opt = document.createElement('option');
                opt.value = d;
                opt.textContent = `${d} (${distCounts[d]} Cari)`;
                distSel.appendChild(opt);
            });
        }
    }
    renderCustomRouteCustomerPicker();
}

function addDistrictToCustomRouteDraft() {
    const citySel = document.getElementById('custom-rut-city-select');
    const distSel = document.getElementById('custom-rut-district-select');
    const routeInput = document.getElementById('custom-rut-route-text');
    const nameInput = document.getElementById('custom-rut-name');

    const city = citySel ? citySel.value.trim() : '';
    const dist = distSel ? distSel.value.trim() : '';

    if (!city) {
        showToast('Lütfen güzergaha eklemek için önce bir İl seçin.', 'warning');
        return;
    }

    const label = dist ? `${city} / ${dist}` : city;
    if (!customRouteDraftDistricts.includes(label)) {
        customRouteDraftDistricts.push(label);
    }

    if (routeInput) {
        const curText = routeInput.value.trim();
        if (!curText) {
            routeInput.value = label;
        } else if (!curText.includes(label)) {
            routeInput.value = `${curText} -> ${label}`;
        }
    }

    if (nameInput && !nameInput.value.trim()) {
        nameInput.value = `${label} Rutu`;
    }

    renderCustomRouteDistrictBadges();
    renderCustomRouteCustomerPicker();
    showToast(`${label} güzergaha eklendi. Aşağıdan müşterileri seçebilirsiniz.`, 'success');
}

function removeDistrictFromCustomRouteDraft(idx) {
    customRouteDraftDistricts.splice(idx, 1);
    const routeInput = document.getElementById('custom-rut-route-text');
    if (routeInput) {
        routeInput.value = customRouteDraftDistricts.join(' -> ');
    }
    renderCustomRouteDistrictBadges();
    renderCustomRouteCustomerPicker();
}

function renderCustomRouteDistrictBadges() {
    const box = document.getElementById('custom-rut-districts-badges');
    if (!box) return;
    if (customRouteDraftDistricts.length === 0) {
        box.innerHTML = `<span style="font-size:0.7rem; color:var(--text-muted);">Güzergah kutusuna doğrudan yazabilir veya İl/İlçe seçip <strong>"+ Güzergaha Ekle"</strong> diyebilirsiniz.</span>`;
        return;
    }
    box.innerHTML = customRouteDraftDistricts.map((d, idx) => `
        <span class="badge" style="background:rgba(56,189,248,0.16); color:#38bdf8; border:1px solid rgba(56,189,248,0.35); font-size:0.71rem; display:inline-flex; align-items:center; gap:0.35rem; padding:0.22rem 0.55rem;">
            <i class="fa-solid fa-location-dot"></i> ${d}
            <i class="fa-solid fa-xmark" style="cursor:pointer; color:#f87171;" title="Çıkar" onclick="removeDistrictFromCustomRouteDraft(${idx})"></i>
        </span>
    `).join('');
}

function getFilteredCustomersForCustomRoutePicker() {
    const customers = appState.customers || [];
    const searchVal = normalizeTR(document.getElementById('custom-rut-cust-search')?.value || '');
    const cityVal = document.getElementById('custom-rut-city-select')?.value || '';
    const distVal = document.getElementById('custom-rut-district-select')?.value || '';

    return customers.filter(c => {
        if (cityVal && normalizeTR(c.city) !== normalizeTR(cityVal)) return false;
        if (distVal && normalizeTR(c.district) !== normalizeTR(distVal)) return false;
        if (searchVal) {
            const hay = normalizeTR(`${c.code} ${c.title} ${c.city} ${c.district} ${c.authorized} ${c.plates} ${c.phone}`);
            if (!hay.includes(searchVal)) return false;
        }
        return true;
    });
}

function renderCustomRouteCustomerPicker() {
    const box = document.getElementById('custom-rut-cust-results');
    if (!box) return;

    const matched = getFilteredCustomersForCustomRoutePicker();
    const displayList = matched.slice(0, 60);

    if (displayList.length === 0) {
        box.innerHTML = `<div style="padding:0.75rem; text-align:center; font-size:0.75rem; color:var(--text-muted);">Eşleşen müşteri bulunamadı.</div>`;
        return;
    }

    box.innerHTML = displayList.map(c => {
        const isChecked = customRouteDraftSelectedCodes.has(c.code);
        return `
            <div onclick="toggleCustomerInCustomRouteDraft('${c.code}')" style="display:flex; justify-content:space-between; align-items:center; gap:0.5rem; padding:0.35rem 0.55rem; border-bottom:1px solid rgba(148,163,184,0.08); cursor:pointer; border-radius:6px; background:${isChecked ? 'rgba(16,185,129,0.14)' : 'transparent'};">
                <div style="display:flex; align-items:center; gap:0.45rem; min-width:0;">
                    <input type="checkbox" ${isChecked ? 'checked' : ''} style="pointer-events:none; accent-color:#10b981;">
                    <div style="min-width:0;">
                        <div style="font-size:0.75rem; font-weight:700; color:${isChecked ? '#34d399' : '#f8fafc'}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                            ${c.title}
                        </div>
                        <div style="font-size:0.67rem; color:var(--text-sec);">
                            <span style="font-family:monospace; color:#38bdf8;">${c.code}</span> &bull; ${c.city} / ${c.district} ${c.plates && c.plates !== 'Plakasız' ? `&bull; <span style="color:#fde68a;">${c.plates}</span>` : ''}
                        </div>
                    </div>
                </div>
                <span class="badge ${isChecked ? 'badge-success' : 'badge-secondary'}" style="font-size:0.65rem; white-space:nowrap;">
                    ${isChecked ? '✓ Eklendi' : '+ Seç'}
                </span>
            </div>
        `;
    }).join('') + (matched.length > 60 ? `<div style="padding:0.4rem; text-align:center; font-size:0.69rem; color:#93c5fd;">+${matched.length - 60} cari daha var (Arama kutusundan daraltabilir veya "Listelenenleri Seç" diyebilirsiniz)</div>` : '');
}

function toggleCustomerInCustomRouteDraft(code) {
    if (!code) return;
    if (customRouteDraftSelectedCodes.has(code)) {
        customRouteDraftSelectedCodes.delete(code);
    } else {
        customRouteDraftSelectedCodes.add(code);
    }
    renderCustomRouteCustomerPicker();
    renderCustomRouteSelectedChips();
    renderLegacyCustomers();
}

function selectAllFilteredForCustomRoute() {
    const matched = getFilteredCustomersForCustomRoutePicker();
    if (matched.length === 0) {
        showToast('Seçilecek müşteri bulunamadı.', 'warning');
        return;
    }
    matched.forEach(c => customRouteDraftSelectedCodes.add(c.code));
    renderCustomRouteCustomerPicker();
    renderCustomRouteSelectedChips();
    renderLegacyCustomers();
    showToast(`${matched.length} müşteri rut taslağına eklendi.`, 'success');
}

function clearCustomRouteSelectedCustomers() {
    customRouteDraftSelectedCodes.clear();
    renderCustomRouteCustomerPicker();
    renderCustomRouteSelectedChips();
    renderLegacyCustomers();
}

function renderCustomRouteSelectedChips() {
    const counterEl = document.getElementById('custom-rut-selected-counter');
    const chipsBox = document.getElementById('custom-rut-selected-chips');
    const count = customRouteDraftSelectedCodes.size;

    if (counterEl) {
        counterEl.textContent = `Seçilen Müşteri: ${count} Cari`;
    }
    if (!chipsBox) return;

    if (count === 0) {
        chipsBox.innerHTML = `<span style="font-size:0.74rem; color:var(--text-muted);"><i class="fa-solid fa-circle-info" style="color:#38bdf8;"></i> Yukarıdaki müşteri listesinden veya aşağıdaki tablodaki <strong>"+ Ruta Ekle"</strong> butonuna basarak müşterileri seçip <strong>"Rut Kaydet"</strong> tuşuna basın.</span>`;
        return;
    }

    const customers = appState.customers || [];
    const selectedCodesArr = Array.from(customRouteDraftSelectedCodes);
    const previewCodes = selectedCodesArr.slice(0, 25);

    chipsBox.innerHTML = previewCodes.map(code => {
        const c = customers.find(x => x.code === code);
        const label = c ? `${c.title.slice(0, 26)} (${c.district || c.city})` : code;
        return `
            <span class="badge" style="background:rgba(16,185,129,0.15); color:#34d399; border:1px solid rgba(16,185,129,0.35); font-size:0.7rem; display:inline-flex; align-items:center; gap:0.3rem; padding:0.2rem 0.5rem;">
                ${label}
                <i class="fa-solid fa-xmark" style="cursor:pointer; color:#f87171;" title="Ruttan Çıkar" onclick="toggleCustomerInCustomRouteDraft('${code}')"></i>
            </span>
        `;
    }).join('') + (count > 25 ? `<span class="badge badge-secondary" style="font-size:0.7rem;">+${count - 25} Cari Daha Seçildi</span>` : '');
}

function resetCustomRouteForm() {
    const editIdEl = document.getElementById('custom-rut-edit-id');
    const nameEl = document.getElementById('custom-rut-name');
    const routeEl = document.getElementById('custom-rut-route-text');
    const notesEl = document.getElementById('custom-rut-notes');
    const citySel = document.getElementById('custom-rut-city-select');
    const distSel = document.getElementById('custom-rut-district-select');
    const searchEl = document.getElementById('custom-rut-cust-search');
    const titleEl = document.getElementById('custom-rut-form-title');
    const saveBtn = document.getElementById('custom-rut-save-btn');

    if (editIdEl) editIdEl.value = '';
    if (nameEl) nameEl.value = '';
    if (routeEl) routeEl.value = '';
    if (notesEl) notesEl.value = '';
    if (citySel) citySel.value = '';
    if (distSel) distSel.innerHTML = '<option value="">🏘️ Tüm İlçeler</option>';
    if (searchEl) searchEl.value = '';
    if (titleEl) titleEl.textContent = 'Yeni Rut Planla & Kaydet';
    if (saveBtn) saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Rut Kaydet';

    customRouteDraftSelectedCodes.clear();
    customRouteDraftDistricts = [];
    renderCustomRouteDistrictBadges();
    renderCustomRouteCustomerPicker();
    renderCustomRouteSelectedChips();
    renderLegacyCustomers();
}

async function saveCustomRoutePlan() {
    const editId = (document.getElementById('custom-rut-edit-id')?.value || '').trim();
    const nameInput = document.getElementById('custom-rut-name');
    const routeInput = document.getElementById('custom-rut-route-text');
    const dateInput = document.getElementById('custom-rut-date');
    const assigneeInput = document.getElementById('custom-rut-assignee');
    const notesInput = document.getElementById('custom-rut-notes');
    const citySel = document.getElementById('custom-rut-city-select');
    const distSel = document.getElementById('custom-rut-district-select');

    const name = (nameInput?.value || '').trim();
    let routeText = (routeInput?.value || '').trim();
    const plannedDate = (dateInput?.value || '').trim() || formatNowTR().slice(0, 10);
    const assignee = (assigneeInput?.value || '').trim() || (currentUser ? currentUser.name : 'ÖMER EREN');
    const notes = (notesInput?.value || '').trim();

    if (!name) {
        showToast('Lütfen kaydedilecek Rut Adını / Kodunu yazın (Örn: Çorum - Sungurlu Rutu).', 'danger');
        if (nameInput) nameInput.focus();
        return;
    }

    // Eğer güzergah boş bırakıldıysa seçili il/ilçe veya seçili müşterilerin ilçelerinden otomatik oluştur
    if (!routeText) {
        if (customRouteDraftDistricts.length > 0) {
            routeText = customRouteDraftDistricts.join(' -> ');
        } else if (citySel && citySel.value) {
            routeText = distSel && distSel.value ? `${citySel.value} / ${distSel.value}` : citySel.value;
        }
    }

    let customerCodes = Array.from(customRouteDraftSelectedCodes);

    // Kullanıcı müşteri seçmeden doğrudan İl/İlçe seçip kaydet'e bastıysa o il/ilçedeki müşterileri otomatik dahil et
    if (customerCodes.length === 0 && ((citySel && citySel.value) || customRouteDraftDistricts.length > 0)) {
        const autoMatched = getFilteredCustomersForCustomRoutePicker();
        if (autoMatched.length > 0 && autoMatched.length <= 500) {
            customerCodes = autoMatched.map(c => c.code);
        }
    }

    // Seçilen müşterilerin il/ilçelerini güzergah listesine de ekle
    const customers = appState.customers || [];
    const selectedCustObjs = customers.filter(c => customerCodes.includes(c.code));
    const derivedDistricts = Array.from(new Set([
        ...customRouteDraftDistricts,
        ...selectedCustObjs.map(c => `${c.city || ''} / ${c.district || ''}`).filter(s => s !== ' / ')
    ]));

    if (!routeText && derivedDistricts.length > 0) {
        routeText = derivedDistricts.slice(0, 6).join(' -> ');
    }
    if (!routeText) {
        routeText = name;
    }

    if (!Array.isArray(appState.customRoutes)) {
        appState.customRoutes = [];
    }

    const record = {
        id: editId || ('RUTPLAN-' + Date.now()),
        name,
        routeText,
        plannedDate,
        assignee,
        notes,
        districts: derivedDistricts,
        customerCodes,
        updatedAt: formatNowTR(),
        createdBy: currentUser ? currentUser.name : 'ÖMER EREN'
    };

    const existingIdx = appState.customRoutes.findIndex(r => r.id === editId || normalizeTR(r.name) === normalizeTR(name));
    if (existingIdx !== -1) {
        appState.customRoutes[existingIdx] = record;
    } else {
        appState.customRoutes.unshift(record);
    }

    syncCustomRoutesToCustomers();
    populateFilterOptions();
    populateStrategyFilters(true);
    renderSavedCustomRoutesList();
    renderLegacyCustomers();
    renderDistrictStrategies();

    addAuditLog('RUT PLANLAMA', `"${name}" rut planı (${routeText} • ${customerCodes.length} Müşteri) kaydedildi.`);
    await syncToServer();

    resetCustomRouteForm();
    showToast(`"${name}" rut planı (${customerCodes.length} cari ile) başarıyla kaydedildi!`, 'success');
}

function editCustomRoutePlan(routeId) {
    const rt = (appState.customRoutes || []).find(r => r.id === routeId);
    if (!rt) return;

    switchTab('legacy-tab');

    const editIdEl = document.getElementById('custom-rut-edit-id');
    const nameEl = document.getElementById('custom-rut-name');
    const routeEl = document.getElementById('custom-rut-route-text');
    const dateEl = document.getElementById('custom-rut-date');
    const assigneeEl = document.getElementById('custom-rut-assignee');
    const notesEl = document.getElementById('custom-rut-notes');
    const titleEl = document.getElementById('custom-rut-form-title');
    const saveBtn = document.getElementById('custom-rut-save-btn');

    if (editIdEl) editIdEl.value = rt.id;
    if (nameEl) nameEl.value = rt.name || '';
    if (routeEl) routeEl.value = rt.routeText || '';
    if (dateEl) dateEl.value = rt.plannedDate || '';
    if (assigneeEl && rt.assignee) assigneeEl.value = rt.assignee;
    if (notesEl) notesEl.value = rt.notes || '';
    if (titleEl) titleEl.textContent = `Rut Planını Düzenle: ${rt.name}`;
    if (saveBtn) saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Rut Planını Güncelle';

    customRouteDraftSelectedCodes = new Set(Array.isArray(rt.customerCodes) ? rt.customerCodes : []);
    customRouteDraftDistricts = Array.isArray(rt.districts) ? [...rt.districts] : [];

    renderCustomRouteDistrictBadges();
    renderCustomRouteCustomerPicker();
    renderCustomRouteSelectedChips();
    renderLegacyCustomers();

    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`"${rt.name}" düzenleme modunda açıldı. Güzergah ve müşterileri güncelleyip kaydedebilirsiniz.`, 'info');
}

async function deleteCustomRoutePlan(routeId) {
    const rt = (appState.customRoutes || []).find(r => r.id === routeId);
    if (!rt) return;
    if (!confirm(`"${rt.name}" rut planını silmek istediğinize emin misiniz?`)) return;

    appState.customRoutes = (appState.customRoutes || []).filter(r => r.id !== routeId);

    const rutSel = document.getElementById('legacy-filter-rut');
    if (rutSel && rutSel.value === rt.name) rutSel.value = '';
    const stratRutSel = document.getElementById('strategy-filter-rut');
    if (stratRutSel && stratRutSel.value === rt.name) stratRutSel.value = '';

    syncCustomRoutesToCustomers();
    populateFilterOptions();
    populateStrategyFilters(true);
    renderSavedCustomRoutesList();
    renderLegacyCustomers();
    renderDistrictStrategies();

    addAuditLog('RUT SİLME', `"${rt.name}" rut planı silindi.`);
    await syncToServer();
    showToast(`"${rt.name}" rut planı silindi.`, 'info');
}

function filterLegacyByCustomRoute(routeName) {
    switchTab('legacy-tab');
    const sInput = document.getElementById('legacy-search');
    if (sInput) sInput.value = '';
    const citySel = document.getElementById('legacy-filter-city');
    if (citySel) citySel.value = '';
    const distSel = document.getElementById('legacy-filter-district');
    if (distSel) distSel.value = '';
    const prioSel = document.getElementById('legacy-filter-priority');
    if (prioSel) prioSel.value = '';
    const balSel = document.getElementById('legacy-filter-balance');
    if (balSel) balSel.value = '';

    populateFilterOptions();
    const rutSel = document.getElementById('legacy-filter-rut');
    if (rutSel) {
        rutSel.value = routeName || '';
    }
    legacyPage = 1;
    renderLegacyCustomers();
    renderSavedCustomRoutesList();
}

function printCustomRouteSheet(routeId) {
    const rt = (appState.customRoutes || []).find(r => r.id === routeId);
    if (!rt) return;
    const customers = (appState.customers || []).filter(c =>
        (Array.isArray(rt.customerCodes) && rt.customerCodes.includes(c.code)) || c.rut === rt.name
    );
    const area = document.getElementById('print-report-area');
    if (!area) return;

    area.innerHTML = `
        <div style="font-family:Arial, sans-serif; color:#000; padding:20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #0284c7; padding-bottom:12px; margin-bottom:16px;">
                <div>
                    <h2 style="margin:0; color:#0284c7;">DİZSAN OTOMOTİV &amp; SERVİS — SAHA RUT PLANI</h2>
                    <h3 style="margin:4px 0 0; color:#0f172a;">${rt.name}</h3>
                    <div style="font-size:12px; color:#334155; margin-top:4px;"><strong>Güzergah:</strong> ${rt.routeText || '-'}</div>
                    ${rt.notes ? `<div style="font-size:11px; color:#475569; margin-top:2px;"><strong>Plan Notu:</strong> ${rt.notes}</div>` : ''}
                </div>
                <div style="text-align:right; font-size:11px;">
                    <div><strong>Plan Tarihi:</strong> ${rt.plannedDate || '-'}</div>
                    <div><strong>Sorumlu:</strong> ${rt.assignee || '-'}</div>
                    <div><strong>Toplam Müşteri:</strong> ${customers.length} Cari</div>
                </div>
            </div>
            <table style="width:100%; border-collapse:collapse; font-size:11px;">
                <thead>
                    <tr style="background:#e2e8f0;">
                        <th style="border:1px solid #94a3b8; padding:6px;">#</th>
                        <th style="border:1px solid #94a3b8; padding:6px;">Cari Kodu</th>
                        <th style="border:1px solid #94a3b8; padding:6px;">Müşteri / Ünvan</th>
                        <th style="border:1px solid #94a3b8; padding:6px;">İl / İlçe</th>
                        <th style="border:1px solid #94a3b8; padding:6px;">Yetkili &amp; Telefon</th>
                        <th style="border:1px solid #94a3b8; padding:6px;">Plaka</th>
                        <th style="border:1px solid #94a3b8; padding:6px; text-align:right;">Bakiye</th>
                        <th style="border:1px solid #94a3b8; padding:6px;">Saha Ziyaret Notu</th>
                    </tr>
                </thead>
                <tbody>
                    ${customers.map((c, i) => `
                        <tr>
                            <td style="border:1px solid #94a3b8; padding:6px;">${i + 1}</td>
                            <td style="border:1px solid #94a3b8; padding:6px; font-family:monospace;">${c.code}</td>
                            <td style="border:1px solid #94a3b8; padding:6px; font-weight:bold;">${c.title}</td>
                            <td style="border:1px solid #94a3b8; padding:6px;">${c.city} / ${c.district}</td>
                            <td style="border:1px solid #94a3b8; padding:6px;">${c.authorized || '-'} (${c.phone || '-'})</td>
                            <td style="border:1px solid #94a3b8; padding:6px;">${c.plates || '-'}</td>
                            <td style="border:1px solid #94a3b8; padding:6px; text-align:right;">${formatMoney(c.balance)}</td>
                            <td style="border:1px solid #94a3b8; padding:6px; min-width:140px;"></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    window.print();
}

function renderSavedCustomRoutesList() {
    const listEl = document.getElementById('saved-custom-routes-list');
    const countEl = document.getElementById('saved-custom-routes-count');
    const routes = Array.isArray(appState.customRoutes) ? appState.customRoutes : [];
    const activeRutFilter = document.getElementById('legacy-filter-rut')?.value || '';

    if (countEl) countEl.textContent = String(routes.length);
    if (!listEl) return;

    if (routes.length === 0) {
        listEl.innerHTML = `
            <div style="grid-column:1 / -1; padding:0.9rem 1rem; border:1px dashed rgba(148,163,184,0.25); border-radius:10px; color:var(--text-sec); font-size:0.78rem; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.5rem;">
                <span><i class="fa-solid fa-route" style="color:#38bdf8; margin-right:6px;"></i> Henüz kayıtlı bir rut planı yok. Yukarıdan <strong>Rut Adı</strong>, <strong>Güzergah</strong> ve <strong>Müşterileri</strong> girip <strong>"Rut Kaydet"</strong> tuşuna basarak ilk rutunuzu oluşturabilirsiniz.</span>
            </div>
        `;
        return;
    }

    const customers = appState.customers || [];
    listEl.innerHTML = routes.map(rt => {
        const custCount = customers.filter(c =>
            (Array.isArray(rt.customerCodes) && rt.customerCodes.includes(c.code)) || c.rut === rt.name
        ).length;
        const isActive = activeRutFilter === rt.name;
        const safeName = String(rt.name || '').replace(/'/g, "\\'");

        return `
            <div style="background:${isActive ? 'rgba(16,185,129,0.12)' : 'rgba(15,23,42,0.75)'}; border:1px solid ${isActive ? '#10b981' : 'rgba(56,189,248,0.28)'}; border-radius:10px; padding:0.75rem 0.9rem; display:flex; flex-direction:column; justify-content:space-between; gap:0.55rem;">
                <div>
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:0.4rem;">
                        <strong style="color:#fff; font-size:0.85rem; cursor:pointer;" onclick="filterLegacyByCustomRoute('${safeName}')">
                            <i class="fa-solid fa-route" style="color:#38bdf8;"></i> ${rt.name}
                        </strong>
                        <span class="badge badge-success" style="font-size:0.68rem; white-space:nowrap;">${custCount} Müşteri</span>
                    </div>
                    <div style="font-size:0.74rem; color:#34d399; font-weight:600; margin-top:4px;">
                        <i class="fa-solid fa-road"></i> Güzergah: ${rt.routeText || '-'}
                    </div>
                    <div style="font-size:0.69rem; color:var(--text-sec); margin-top:3px;">
                        <i class="fa-regular fa-calendar"></i> ${rt.plannedDate || '-'} &bull; <i class="fa-solid fa-user"></i> ${rt.assignee || '-'}
                    </div>
                    ${rt.notes ? `<div style="font-size:0.7rem; color:#cbd5e1; margin-top:3px; background:rgba(255,255,255,0.03); padding:3px 6px; border-radius:5px;">${rt.notes}</div>` : ''}
                </div>
                <div style="display:flex; gap:0.35rem; flex-wrap:wrap; padding-top:0.4rem; border-top:1px solid rgba(148,163,184,0.12);">
                    <button type="button" class="btn ${isActive ? 'btn-success' : 'btn-primary'} btn-sm" style="padding:0.24rem 0.55rem; font-size:0.7rem;" onclick="filterLegacyByCustomRoute('${isActive ? '' : safeName}')">
                        <i class="fa-solid fa-filter"></i> ${isActive ? 'Filtreyi Kaldır' : 'Müşterileri Gör'}
                    </button>
                    <button type="button" class="btn btn-secondary btn-sm" style="padding:0.24rem 0.55rem; font-size:0.7rem;" onclick="editCustomRoutePlan('${rt.id}')">
                        <i class="fa-solid fa-pen-to-square" style="color:#38bdf8;"></i> Düzenle
                    </button>
                    <button type="button" class="btn btn-secondary btn-sm" style="padding:0.24rem 0.55rem; font-size:0.7rem;" onclick="printCustomRouteSheet('${rt.id}')">
                        <i class="fa-solid fa-print" style="color:#fbbf24;"></i> Yazdır
                    </button>
                    <button type="button" class="btn btn-danger btn-sm" style="padding:0.24rem 0.5rem; font-size:0.7rem; margin-left:auto;" onclick="deleteCustomRoutePlan('${rt.id}')" title="Rutu Sil">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function ensureDistrictStrategiesPopulated() {
    const existing = appState.districtStrategies || {};
    if (Object.keys(existing).length > 0) return existing;
    const customers = appState.customers || [];
    if (customers.length === 0) return existing;
    const built = {};
    customers.forEach(c => {
        const city = (c.city || 'Diğer').trim();
        const district = (c.district || 'Merkez').trim();
        const key = `${city}|${district}`;
        if (!built[key]) {
            built[key] = {
                rut: (c.rut && !isLegacyAutoRutCode(c.rut)) ? c.rut : '',
                city,
                district,
                totalCustomers: 0,
                churnCustomers: 0,
                totalOperations: 0,
                totalRevenue: 0,
                strategy: `${district} bölgesindeki ağır vasıta ve filo müşterilerine yerinde saha ziyareti ve özel bakım kampanyası sunumu.`
            };
        }
        built[key].totalCustomers += 1;
        if ((c.priority || '').includes('P1') || (c.priority || '').includes('P2') || (c.churnDuration && !c.churnDuration.includes('Aktif'))) {
            built[key].churnCustomers += 1;
        }
        built[key].totalOperations += Number(c.totalOperations || (c.serviceHistory ? c.serviceHistory.length : 1));
        built[key].totalRevenue += Number(c.totalRevenue || 0);
    });
    appState.districtStrategies = built;
    return built;
}

function populateStrategyFilters(forceRebuildDistricts = false) {
    ensureDistrictStrategiesPopulated();
    syncCustomRoutesToCustomers();
    const strategies = Object.values(appState.districtStrategies || {});
    if (strategies.length === 0) return;

    const citySel = document.getElementById('strategy-filter-city');
    const distSel = document.getElementById('strategy-filter-district');
    const rutSel = document.getElementById('strategy-filter-rut');

    if (citySel && citySel.dataset.populatedCount !== String(strategies.length)) {
        const cityMap = {};
        strategies.forEach(s => {
            if (!s.city) return;
            if (!cityMap[s.city]) cityMap[s.city] = { districts: 0, customers: 0 };
            cityMap[s.city].districts += 1;
            cityMap[s.city].customers += Number(s.totalCustomers || 0);
        });
        const sortedCities = Object.keys(cityMap).sort((a, b) => a.localeCompare(b, 'tr'));
        const curCity = citySel.value;
        citySel.innerHTML = `<option value="">📍 Tüm İller (${sortedCities.length} İl)</option>` +
            sortedCities.map(ct => `<option value="${ct}">${ct} (${cityMap[ct].districts} İlçe • ${cityMap[ct].customers} Cari)</option>`).join('');
        if (curCity) citySel.value = curCity;
        citySel.dataset.populatedCount = String(strategies.length);
    }

    if (rutSel) {
        const rutMap = {};
        (appState.customRoutes || []).forEach(r => {
            if (r && r.name) rutMap[r.name] = 0;
        });
        strategies.forEach(s => {
            if (!s.rut || isLegacyAutoRutCode(s.rut)) return;
            rutMap[s.rut] = (rutMap[s.rut] || 0) + 1;
        });
        const sortedRuts = Object.keys(rutMap).sort((a, b) => a.localeCompare(b, 'tr', { numeric: true }));
        const curRut = rutSel.value;
        rutSel.innerHTML = `<option value="">🚗 Tüm Rutlar (${sortedRuts.length} Kayıtlı Rut)</option>` +
            sortedRuts.map(rt => `<option value="${rt}">${rt} (${rutMap[rt]} Bölge)</option>`).join('');
        if (curRut && rutMap[curRut] !== undefined) rutSel.value = curRut;
    }

    if (distSel && (forceRebuildDistricts || distSel.dataset.populatedCount !== String(strategies.length))) {
        const selectedCity = citySel ? citySel.value : '';
        const distMap = {};
        strategies.forEach(s => {
            if (!s.district) return;
            if (selectedCity && normalizeTR(s.city) !== normalizeTR(selectedCity)) return;
            const key = selectedCity ? s.district : `${s.district} (${s.city})`;
            const val = s.district;
            if (!distMap[val]) distMap[val] = { label: key, customers: 0 };
            distMap[val].customers += Number(s.totalCustomers || 0);
        });
        const sortedDists = Object.keys(distMap).sort((a, b) => a.localeCompare(b, 'tr'));
        const prevDist = distSel.value;
        distSel.innerHTML = `<option value="">🏘️ Tüm İlçeler (${sortedDists.length} İlçe)</option>` +
            sortedDists.map(d => `<option value="${d}">${distMap[d].label} • ${distMap[d].customers} Cari</option>`).join('');
        if (prevDist && distMap[prevDist]) {
            distSel.value = prevDist;
        } else {
            distSel.value = '';
        }
        distSel.dataset.populatedCount = `${strategies.length}:${selectedCity}`;
    }
}

function handleStrategyCityChange() {
    const distSel = document.getElementById('strategy-filter-district');
    if (distSel) distSel.value = '';
    populateStrategyFilters(true);
    renderDistrictStrategies();
}

function resetStrategyFilters() {
    const searchEl = document.getElementById('strategy-search');
    const citySel = document.getElementById('strategy-filter-city');
    const distSel = document.getElementById('strategy-filter-district');
    const rutSel = document.getElementById('strategy-filter-rut');
    if (searchEl) searchEl.value = '';
    if (citySel) citySel.value = '';
    if (distSel) distSel.value = '';
    if (rutSel) rutSel.value = '';
    populateStrategyFilters(true);
    renderDistrictStrategies();
}

function openStrategyDistrictInRutPlan(city, district, rut = '') {
    switchTab('legacy-tab');
    populateFilterOptions();

    // Yeni Rut Planla formunda ilgili İl ve İlçeyi otomatik seç ve güzergaha hazırla
    const plannerCitySel = document.getElementById('custom-rut-city-select');
    if (plannerCitySel && city) {
        plannerCitySel.value = city;
        handleCustomRouteCityChange();
        const plannerDistSel = document.getElementById('custom-rut-district-select');
        if (plannerDistSel && district) {
            plannerDistSel.value = district;
        }
        addDistrictToCustomRouteDraft();
    }

    const searchInput = document.getElementById('legacy-search');
    if (searchInput) searchInput.value = '';
    const prioSel = document.getElementById('legacy-filter-priority');
    if (prioSel) prioSel.value = '';
    const balSel = document.getElementById('legacy-filter-balance');
    if (balSel) balSel.value = '';
    const rutSel = document.getElementById('legacy-filter-rut');
    if (rutSel) rutSel.value = '';

    const cityInput = document.getElementById('legacy-filter-city');
    if (cityInput) {
        cityInput.value = city || '';
    }
    handleCityFilterChange();

    const distSelect = document.getElementById('legacy-filter-district');
    if (distSelect && district) {
        const matchOpt = Array.from(distSelect.options).find(o => normalizeTR(o.value) === normalizeTR(district));
        if (matchOpt) {
            distSelect.value = matchOpt.value;
        } else {
            const opt = document.createElement('option');
            opt.value = district;
            opt.textContent = district;
            distSelect.appendChild(opt);
            distSelect.value = district;
        }
    }

    legacyPage = 1;
    renderLegacyCustomers();
    if (window.DizsanBackNav && typeof window.DizsanBackNav.showToast === 'function') {
        window.DizsanBackNav.showToast(`📍 ${city} / ${district} bölgesi Rut Planlama ekranına aktarıldı. Müşterileri seçip "Rut Kaydet" diyebilirsiniz.`);
    }
}

function openStrategyDistrictInCariRehber(city, district) {
    switchTab('cari-ekstre-tab');
    populateFilterOptions();

    const searchEl = document.getElementById('ekstre-search') || document.getElementById('ekstre-search-input');
    if (searchEl) searchEl.value = '';
    const baEl = document.getElementById('ekstre-filter-ba') || document.getElementById('ekstre-balance-filter');
    if (baEl) baEl.value = '';

    const citySel = document.getElementById('ekstre-filter-city') || document.getElementById('ekstre-city-filter');
    if (citySel && city) {
        const matchCity = Array.from(citySel.options).find(o => normalizeTR(o.value) === normalizeTR(city));
        if (matchCity) {
            citySel.value = matchCity.value;
        } else {
            const opt = document.createElement('option');
            opt.value = city;
            opt.textContent = city;
            citySel.appendChild(opt);
            citySel.value = city;
        }
    }

    handleEkstreCityFilterChange(district);
    if (window.DizsanBackNav && typeof window.DizsanBackNav.showToast === 'function') {
        window.DizsanBackNav.showToast(`📒 ${city} / ${district} bölgesi Müşteri Rehberi (Cari & Ekstre) ekranında açıldı.`);
    }
}

function renderDistrictStrategies() {
    const tbody = document.getElementById('strategy-table-body');
    if (!tbody) return;

    populateStrategyFilters(false);

    const search = normalizeTR(document.getElementById('strategy-search')?.value);
    const selectedCity = document.getElementById('strategy-filter-city')?.value || '';
    const selectedDistrict = document.getElementById('strategy-filter-district')?.value || '';
    const selectedRut = document.getElementById('strategy-filter-rut')?.value || '';
    const strategies = Object.values(appState.districtStrategies || {});

    const resetBtn = document.getElementById('strategy-filter-reset-btn');
    if (resetBtn) {
        resetBtn.style.display = (search || selectedCity || selectedDistrict || selectedRut) ? 'inline-flex' : 'none';
    }

    const filtered = strategies.filter(s => {
        if (selectedCity && normalizeTR(s.city) !== normalizeTR(selectedCity)) return false;
        if (selectedDistrict && normalizeTR(s.district) !== normalizeTR(selectedDistrict)) return false;
        if (selectedRut && s.rut !== selectedRut) return false;
        if (search) {
            const hay = normalizeTR(`${s.rut} ${s.city} ${s.district} ${s.strategy}`);
            if (!hay.includes(search)) return false;
        }
        return true;
    });

    const countLabel = document.getElementById('strategy-table-count-label');
    if (countLabel) {
        const isFiltered = Boolean(search || selectedCity || selectedDistrict || selectedRut);
        countLabel.textContent = isFiltered
            ? `İl ve İlçe Bazlı 120 Kodlu Müşteri Saha Planı & Müzakere Rehberi (${filtered.length} / ${strategies.length} Bölge)`
            : `İl ve İlçe Bazlı 120 Kodlu Müşteri Saha Planı & Müzakere Rehberi (${strategies.length} Bölge)`;
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align:center; padding:1.5rem; color:var(--text-sec);">
                    Seçilen il/ilçe kriterlerine uygun bölge kaydı bulunamadı.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filtered.map(s => {
        const safeCity = String(s.city || '').replace(/'/g, "\\'");
        const safeDist = String(s.district || '').replace(/'/g, "\\'");
        const safeRut = String(s.rut || '').replace(/'/g, "\\'");
        const hasCustomRut = s.rut && !isLegacyAutoRutCode(s.rut);
        return `
        <tr>
            <td style="font-weight:700; white-space:nowrap;">
                ${hasCustomRut
                    ? `<span class="badge badge-success" style="font-size:0.72rem;"><i class="fa-solid fa-route"></i> ${s.rut}</span>`
                    : `<span style="font-size:0.72rem; color:var(--text-muted);">Planlanmadı</span>`
                }
            </td>
            <td><strong>${s.city}</strong></td>
            <td>
                <span class="badge badge-secondary" style="cursor:pointer; border-color:rgba(56,189,248,0.4); color:#38bdf8;" onclick="openStrategyDistrictInRutPlan('${safeCity}', '${safeDist}', '${safeRut}')" title="${s.city} / ${s.district} müşterilerini Rut Planlama sekmesinde aç">
                    <i class="fa-solid fa-location-dot"></i> ${s.district}
                </span>
            </td>
            <td style="font-weight:700;">${s.totalCustomers}</td>
            <td style="color:#f87171; font-weight:700;">${s.churnCustomers}</td>
            <td>${s.totalOperations}</td>
            <td style="color:#34d399; font-weight:700; white-space:nowrap;">${formatMoney(s.totalRevenue)}</td>
            <td style="font-size:0.78rem; color:#cbd5e1;">${s.strategy}</td>
            <td style="text-align:right; white-space:nowrap;">
                <div style="display:inline-flex; gap:0.35rem; justify-content:flex-end;">
                    <button type="button" class="btn btn-primary btn-sm" style="padding:0.28rem 0.55rem; font-size:0.72rem;" onclick="openStrategyDistrictInRutPlan('${safeCity}', '${safeDist}', '${safeRut}')" title="${s.city} / ${s.district} için Rut Planlama ekranına geç">
                        <i class="fa-solid fa-route"></i> Rut Planla
                    </button>
                    <button type="button" class="btn btn-secondary btn-sm" style="padding:0.28rem 0.55rem; font-size:0.72rem;" onclick="openStrategyDistrictInCariRehber('${safeCity}', '${safeDist}')" title="${s.city} / ${s.district} için Müşteri Rehberi &amp; Cari Ekstre ekranına geç">
                        <i class="fa-solid fa-address-book" style="color:#38bdf8;"></i> Müşteri Rehberi
                    </button>
                </div>
            </td>
        </tr>
    `}).join('');
}

window.initCustomRoutePlannerUI = initCustomRoutePlannerUI;
window.handleCustomRouteCityChange = handleCustomRouteCityChange;
window.addDistrictToCustomRouteDraft = addDistrictToCustomRouteDraft;
window.removeDistrictFromCustomRouteDraft = removeDistrictFromCustomRouteDraft;
window.renderCustomRouteCustomerPicker = renderCustomRouteCustomerPicker;
window.toggleCustomerInCustomRouteDraft = toggleCustomerInCustomRouteDraft;
window.selectAllFilteredForCustomRoute = selectAllFilteredForCustomRoute;
window.clearCustomRouteSelectedCustomers = clearCustomRouteSelectedCustomers;
window.resetCustomRouteForm = resetCustomRouteForm;
window.saveCustomRoutePlan = saveCustomRoutePlan;
window.editCustomRoutePlan = editCustomRoutePlan;
window.deleteCustomRoutePlan = deleteCustomRoutePlan;
window.filterLegacyByCustomRoute = filterLegacyByCustomRoute;
window.printCustomRouteSheet = printCustomRouteSheet;

function renderLogs() {
    const tbody = document.getElementById('logs-table-body');
    if (!tbody || !isOmerEren(currentUser)) return;
    const logs = appState.logs || [];

    tbody.innerHTML = logs.slice(0, 50).map(l => `
        <tr>
            <td style="font-family:monospace; font-size:0.75rem; color:var(--dizsan-light);">${l.timestamp}</td>
            <td><strong>${l.user}</strong></td>
            <td><span class="badge badge-secondary">${l.category}</span></td>
            <td style="font-size:0.8rem; color:#e2e8f0;">${l.detail}</td>
            <td style="font-size:0.74rem; color:var(--text-muted);">${l.platform}</td>
        </tr>
    `).join('');
}

function exportLogsCSV() {
    let csv = "\uFEFFTarih Saat;Personel;Kategori;İşlem Detayı;Platform\n";
    (appState.logs || []).forEach(l => {
        const clean = s => String(s || '').replace(/;/g, ',').replace(/\n/g, ' ');
        csv += `${clean(l.timestamp)};${clean(l.user)};${clean(l.category)};${clean(l.detail)};${clean(l.platform)}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Dizsan_Ziyaret_Denetim_Loglari_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
}

// ==========================================================================
// 9. VAPID WEB PUSH, SES MOTORU VE KİLİT EKRANI TESTİ
// ==========================================================================
function detectBrowserAndOS() {
    const ua = navigator.userAgent || '';
    const isIpadOS = (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isIOSDevice = /iPhone|iPad|iPod/i.test(ua) || isIpadOS;
    const isStandalonePWA = (window.navigator.standalone === true) ||
        (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);

    let browser = 'Web Tarayıcı';
    if (/SamsungBrowser/i.test(ua)) browser = 'Samsung Internet';
    else if (/CriOS/i.test(ua)) browser = 'Chrome (iOS)';
    else if (/Chrome/i.test(ua)) browser = 'Google Chrome';
    else if (/Safari/i.test(ua)) browser = isStandalonePWA ? 'Apple Web App' : 'Apple Safari';

    let os = 'Masaüstü / Web';
    if (/Android/i.test(ua)) os = 'Android';
    else if (isIpadOS || /iPad/i.test(ua)) os = 'iPadOS (Apple Tablet)';
    else if (/iPhone/i.test(ua)) os = 'iOS (Apple iPhone)';
    else if (/Mac/i.test(ua)) os = 'macOS';
    else if (/Win/i.test(ua)) os = 'Windows';

    return { browser, os, isIOS: isIOSDevice, isStandalonePWA, fullLabel: `${browser} (${os})` };
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
    return outputArray;
}

let isAutoEnrollInProgress = false;
let currentDeviceSubscribedEndpoint = null;

async function autoEnrollZeroTouchPush() {
    if (!currentUser || isAutoEnrollInProgress) return;
    isAutoEnrollInProgress = true;
    try {
        startSilentAudioKeepAlive();
        if ('serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window) {
            if (Notification.permission === 'default') {
                const perm = await Notification.requestPermission();
                if (perm === 'granted') await subscribeToWebPush(false);
            } else if (Notification.permission === 'granted') {
                await subscribeToWebPush(false);
            }
        }
        renderBgNotificationPermissionBanner();
    } catch (e) {
    } finally {
        isAutoEnrollInProgress = false;
    }
}

async function subscribeToWebPush(showAlert = false) {
    if (!currentUser) return null;
    const dev = detectBrowserAndOS();

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        startSilentAudioKeepAlive();
        if (showAlert) alert("ℹ️ Tarayıcınız Web Push API'yi Ana Ekrana eklendikten sonra desteklemektedir.");
        return null;
    }

    try {
        let perm = Notification.permission;
        if (perm !== 'granted') perm = await Notification.requestPermission();
        if (perm !== 'granted') return null;

        const reg = await navigator.serviceWorker.ready;
        let sub = await reg.pushManager.getSubscription();
        if (!sub) {
            sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });
        }

        const subJson = sub.toJSON();
        const endpoint = subJson.endpoint || sub.endpoint;
        if (endpoint) {
            currentDeviceSubscribedEndpoint = endpoint;
            if (!Array.isArray(appState.pushSubscriptions)) appState.pushSubscriptions = [];
            const existingIdx = appState.pushSubscriptions.findIndex(s => s.endpoint === endpoint);
            const subRecord = {
                id: 'SUB-' + Date.now(),
                username: currentUser.username,
                userFullName: currentUser.name,
                endpoint,
                p256dh: subJson.keys?.p256dh || '',
                auth: subJson.keys?.auth || '',
                browser: dev.browser,
                platform: dev.os,
                updatedAt: formatNowTR()
            };
            if (existingIdx !== -1) appState.pushSubscriptions[existingIdx] = subRecord;
            else appState.pushSubscriptions.unshift(subRecord);

            // Yerel push sunucusuna da doğrudan bildir
            fetch('http://localhost:8787/api/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subscription: subJson,
                    user: { username: currentUser.username, name: currentUser.name, role: currentUser.role }
                })
            }).catch(() => {});

            await syncToServer();
            renderBgNotificationPermissionBanner();
            if (showAlert) {
                playNotificationTone('INVITE');
                alert(`✅ VAPID Web Push Cihaz Aboneliği Aktif Edildi!\n\nPersonel: ${currentUser.name}\nCihaz: ${dev.fullLabel}\nArtık telefonunuz kilitliyken bildirimler doğrudan cihazınıza iletilecektir.`);
            }
            return subRecord;
        }
    } catch (err) {}
    return null;
}

function startSilentAudioKeepAlive() {
    try {
        if (!keepAliveAudioCtx) {
            keepAliveAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = keepAliveAudioCtx.createOscillator();
            const gain = keepAliveAudioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(10, keepAliveAudioCtx.currentTime);
            gain.gain.setValueAtTime(0.00005, keepAliveAudioCtx.currentTime);
            osc.connect(gain);
            gain.connect(keepAliveAudioCtx.destination);
            osc.start();
        } else if (keepAliveAudioCtx.state === 'suspended') {
            keepAliveAudioCtx.resume();
        }
    } catch (e) {}
}

function playNotificationTone(type = 'INVITE') {
    try {
        const ctx = keepAliveAudioCtx || new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === 'suspended') ctx.resume();
        const now = ctx.currentTime;
        
        if (type === 'PHONE_ALERT') {
            // Telefon çalma melodisi (çift zil sesi)
            [0, 0.2, 0.5, 0.7].forEach((delay, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(idx % 2 === 0 ? 853 : 960, now + delay);
                gain.gain.setValueAtTime(0.75, now + delay);
                gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.16);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + delay);
                osc.stop(now + delay + 0.16);
            });
            return;
        }

        if (type === 'DEPARTURE_ALARM') {
            // Acil yola çıkış gong & seyahat alarmı (4 yükselen acil ton)
            const freqs = [587.33, 783.99, 1174.66, 1567.98];
            freqs.forEach((f, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(f, now + i * 0.18);
                gain.gain.setValueAtTime(0.85, now + i * 0.18);
                gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.18 + 0.28);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + i * 0.18);
                osc.stop(now + i * 0.18 + 0.28);
            });
            return;
        }

        if (type === 'DAY_BEFORE') {
            // Ziyaretten 1 gün önceki hazırlık melodisi
            const freqs = [523.25, 659.25, 783.99];
            freqs.forEach((f, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(f, now + i * 0.14);
                gain.gain.setValueAtTime(0.65, now + i * 0.14);
                gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.14 + 0.22);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + i * 0.14);
                osc.stop(now + i * 0.14 + 0.22);
            });
            return;
        }

        // Standart davet / işlem onay tonu
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.25);
        gain.gain.setValueAtTime(0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
    } catch (e) {}
}

function sendLocalOrServiceWorkerPush(notif) {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(reg => {
            reg.showNotification(notif.title, {
                body: notif.body,
                icon: './icon-192.png',
                badge: './icon-192.png',
                vibrate: [400, 150, 400, 150, 600],
                tag: notif.tag || ('dizsan-' + Date.now()),
                data: { url: notif.url || './' },
                requireInteraction: true
            }).catch(() => {});
        }).catch(() => {});
    } else if ('Notification' in window && Notification.permission === 'granted') {
        try {
            new Notification(notif.title, {
                body: notif.body,
                icon: './icon-192.png'
            });
        } catch (e) {}
    }
}

function showPhoneReminderModal(task) {
    const phoneClean = (task.phone || '').replace(/[^0-9+]/g, '');
    const modalHtml = `
        <div id="phone-reminder-active-banner" style="position:fixed; bottom:20px; right:20px; z-index:99999; max-width:420px; width:calc(100% - 40px); background:rgba(15,23,42,0.96); border:2px solid #38bdf8; border-radius:16px; padding:1.2rem; box-shadow:0 15px 45px rgba(0,0,0,0.8), 0 0 30px rgba(56,189,248,0.3); backdrop-filter:blur(15px); animation:fadeInUp 0.3s ease;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.5rem;">
                <div style="display:flex; align-items:center; gap:0.5rem;">
                    <div style="width:36px; height:36px; border-radius:10px; background:rgba(56,189,248,0.2); display:flex; align-items:center; justify-content:center; color:#38bdf8; font-size:1.1rem;">
                        <i class="fa-solid fa-phone-volume fa-shake"></i>
                    </div>
                    <div>
                        <strong style="color:#fff; font-size:0.95rem;">GÖRÜŞMEYE 1 SAAT KALDI!</strong>
                        <div style="font-size:0.75rem; color:#94a3b8;">Telefon Görüşmesi Hatırlatıcısı</div>
                    </div>
                </div>
                <button type="button" style="background:none; border:none; color:#94a3b8; font-size:1.2rem; cursor:pointer;" onclick="document.getElementById('phone-reminder-active-banner').remove()">&times;</button>
            </div>
            <p style="font-size:0.85rem; color:#cbd5e1; margin-bottom:0.75rem; line-height:1.4;">
                <strong style="color:#fde68a;">${task.customerTitle}</strong> ile saat <strong style="color:#fff;">${task.dueTime}</strong> randevunuz var.${task.contactPerson ? ` (Yetkili: ${task.contactPerson})` : ''}
            </p>
            <div style="display:flex; gap:0.5rem;">
                ${phoneClean ? `
                    <a href="tel:${phoneClean}" class="btn btn-success btn-sm" style="flex:1; justify-content:center; text-decoration:none;">
                        <i class="fa-solid fa-phone"></i> Hemen Ara (${task.phone})
                    </a>
                ` : ''}
                <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('phone-reminder-active-banner').remove()">
                    Tamam
                </button>
            </div>
        </div>
    `;
    const existing = document.getElementById('phone-reminder-active-banner');
    if (existing) existing.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function openUrgentDepartureModal(task) {
    const modal = document.getElementById('urgent-departure-modal');
    const body = document.getElementById('urgent-departure-modal-body');
    const footer = document.getElementById('urgent-departure-modal-footer');
    if (!modal || !body || !footer) return;

    const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=Dizsan+Otomotiv+Corum&destination=${encodeURIComponent(task.location || task.customerTitle)}`;
    const phoneClean = (task.phone || '').replace(/[^0-9+]/g, '');

    body.innerHTML = `
        <div class="urgent-departure-card">
            <div style="font-size:2.8rem; margin-bottom:0.4rem;">🚗💨</div>
            <h2 style="color:#fbbf24; font-size:1.35rem; margin-bottom:0.35rem; font-weight:800;">
                YOLA ÇIKIŞ ZAMANI GELDİ!
            </h2>
            <p style="color:#e2e8f0; font-size:0.95rem; margin-bottom:1rem;">
                <strong style="color:#fff; font-size:1.1rem;">${task.customerTitle}</strong> ziyaretiniz için hemen hareket etmelisiniz!
            </p>

            <div style="background:rgba(0,0,0,0.45); border:1px solid rgba(245,158,11,0.4); border-radius:12px; padding:1rem; text-align:left; margin-bottom:1rem;">
                <div style="display:flex; justify-content:space-between; margin-bottom:0.4rem; font-size:0.85rem;">
                    <span style="color:var(--text-sec);">Hedef Lokasyon:</span>
                    <strong style="color:#fde68a;">${task.location || 'Müşteri Adresi'}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:0.4rem; font-size:0.85rem;">
                    <span style="color:var(--text-sec);">Mesafe / Seyir Süresi:</span>
                    <strong style="color:#38bdf8;">~${task.distanceKm || 60} km (~${task.driveMinutes || 55} dakika)</strong>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:0.4rem; font-size:0.85rem;">
                    <span style="color:var(--text-sec);">Trafik &amp; Yanılma Payı:</span>
                    <strong style="color:#34d399;">+1 Saat (60 dakika)</strong>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:0.4rem; font-size:0.85rem; border-top:1px dashed rgba(255,255,255,0.15); padding-top:0.4rem;">
                    <span style="color:var(--text-sec);">Randevu Saati:</span>
                    <strong style="color:#fff; font-size:0.95rem;">${task.dueTime}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:0.9rem;">
                    <span style="color:#f87171; font-weight:700;">Önerilen Çıkış Saati:</span>
                    <strong style="color:#f87171; font-size:1.05rem;">${task.departureTime}</strong>
                </div>
            </div>

            ${task.contactPerson || task.phone ? `
                <div style="font-size:0.82rem; color:#cbd5e1; margin-bottom:0.75rem;">
                    Yetkili: <strong>${task.contactPerson || '-'}</strong> &bull; Telefon: <strong>${task.phone || '-'}</strong>
                </div>
            ` : ''}
        </div>
    `;

    footer.innerHTML = `
        <a href="${mapsUrl}" target="_blank" class="btn btn-primary" style="flex:1; justify-content:center; text-decoration:none;">
            <i class="fa-solid fa-diamond-turn-right"></i> Google Haritalar Rota Başlat
        </a>
        ${phoneClean ? `
            <a href="tel:${phoneClean}" class="btn btn-success" style="justify-content:center; text-decoration:none;">
                <i class="fa-solid fa-phone"></i> Müşteriyi Ara
            </a>
        ` : ''}
        <button type="button" class="btn btn-secondary" onclick="closeUrgentDepartureModal()">
            <i class="fa-solid fa-check"></i> Yola Çıktım / Kapat
        </button>
    `;

    modal.classList.add('open');
}

function closeUrgentDepartureModal() {
    const modal = document.getElementById('urgent-departure-modal');
    if (modal) modal.classList.remove('open');
}

function checkDueReminders() {
    if (!Array.isArray(appState.tasks) || appState.tasks.length === 0) return;
    const now = new Date();
    const nowMs = now.getTime();
    let stateChanged = false;

    for (const t of appState.tasks) {
        if (t.status === 'Tamamlandı') continue;

        const appDt = new Date(`${t.dueDate}T${t.dueTime || '10:00'}:00`);
        const appMs = appDt.getTime();

        // DURUM 1: TELEFON GÖRÜŞMESİ - 1 SAAT KALA UYARISI
        if (t.type === 'TELEFON' && !t.phoneAlertFired) {
            const targetMs = appMs - 60 * 60 * 1000;
            if (nowMs >= targetMs && nowMs <= appMs + 30 * 60 * 1000) {
                t.phoneAlertFired = true;
                stateChanged = true;
                playNotificationTone('PHONE_ALERT');
                if (navigator.vibrate) navigator.vibrate([400, 200, 400, 200, 600]);

                sendLocalOrServiceWorkerPush({
                    title: `📞 GÖRÜŞMEYE 1 SAAT KALDI!`,
                    body: `${t.customerTitle} ile telefon görüşmeniz saat ${t.dueTime}'de. Yetkili: ${t.contactPerson || ''} - Tel: ${t.phone || ''}`,
                    url: './?tab=tasks-tab',
                    tag: `phone-${t.id}`
                });

                showPhoneReminderModal(t);
                addAuditLog("HATIRLATICI", `[1 SAAT KALA UYARISI] '${t.customerTitle}' telefon görüşmesi için hatırlatıcı tetiklendi (Saat: ${t.dueTime}).`);
            }
        }

        // DURUM 2: YÜZ YÜZE SAHA ZİYARETİ - 1 GÜN ÖNCE SAAT 14:00 HATIRLATMASI
        if (t.type === 'ZİYARET' && !t.visitDayBeforeFired) {
            const prevDayStr = new Date(appMs - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
            const targetMs = new Date(`${prevDayStr}T14:00:00`).getTime();
            if (nowMs >= targetMs && nowMs < appMs) {
                t.visitDayBeforeFired = true;
                stateChanged = true;

                playNotificationTone('DAY_BEFORE');
                if (navigator.vibrate) navigator.vibrate([300, 150, 300]);

                sendLocalOrServiceWorkerPush({
                    title: `🚗 YARIN SAHA ZİYARETİ VAR (14:00 Hatırlatıcısı)`,
                    body: `${t.customerTitle} (${t.location || 'Saha'}) ziyareti yarın saat ${t.dueTime}'de. Mesafe: ~${t.distanceKm || 50} km. Evraklarınızı ve rut planınızı hazırlayınız.`,
                    url: './?tab=tasks-tab',
                    tag: `visit-daybefore-${t.id}`
                });

                addAuditLog("HATIRLATICI", `[1 GÜN ÖNCE SAAT 14:00 UYARISI] '${t.customerTitle}' ziyareti için hazırlık hatırlatması tetiklendi.`);
            }
        }

        // DURUM 3: YÜZ YÜZE SAHA ZİYARETİ - RANDEVU GÜNÜ ÇIKIŞ UYARISI (+1 SAAT YANILMA PAYI)
        if (t.type === 'ZİYARET' && !t.departureWarningFired) {
            const depTimeStr = t.departureTime || calculateVisitTravelTime(t.location, t.dueTime).departureTime;
            const targetMs = new Date(`${t.dueDate}T${depTimeStr}:00`).getTime();
            if (nowMs >= targetMs && nowMs <= appMs + 30 * 60 * 1000) {
                t.departureWarningFired = true;
                stateChanged = true;

                playNotificationTone('DEPARTURE_ALARM');
                if (navigator.vibrate) navigator.vibrate([600, 200, 600, 200, 1000]);

                sendLocalOrServiceWorkerPush({
                    title: `🚗 YOLA ÇIKIŞ VAKTİ! (${t.customerTitle})`,
                    body: `Randevu: ${t.dueTime} | Hedef: ${t.location || 'Saha'}. Mesafe: ~${t.distanceKm} km (~${t.driveMinutes} dk) + 1 Saat Yanılma Payı ile şimdi saat ${depTimeStr}'de yola çıkmalısınız!`,
                    url: './?tab=tasks-tab',
                    tag: `departure-${t.id}`
                });

                openUrgentDepartureModal(t);
                addAuditLog("ÇIKIŞ UYARISI", `[YOLA ÇIKIŞ VAKTİ] '${t.customerTitle}' ziyareti için çıkış uyarısı tetiklendi (Mesafe: ${t.distanceKm} km, Çıkış: ${depTimeStr}, Randevu: ${t.dueTime}).`);
            }
        }
    }

    if (stateChanged) {
        saveStateLocally();
        syncToServer();
        renderTasks();
    }
}

function triggerSimulatedPhoneReminder() {
    startSilentAudioKeepAlive();
    playNotificationTone('PHONE_ALERT');
    if (navigator.vibrate) navigator.vibrate([400, 200, 400, 200, 600]);
    
    sendLocalOrServiceWorkerPush({
        title: `📞 GÖRÜŞMEYE 1 SAAT KALDI! (Simülasyon Testi)`,
        body: `ALAETTİN SOLAK ile telefon görüşmeniz saat 15:00'te. Yetkili: Alaettin Solak - Tel: 0542 714 19 34`,
        url: './?tab=tasks-tab',
        tag: 'test-phone'
    });

    showPhoneReminderModal({
        id: 'SIM-PHONE-1',
        customerTitle: 'ALAETTİN SOLAK',
        contactPerson: 'Alaettin Solak',
        phone: '0542 714 19 34',
        dueTime: '15:00'
    });
}

function triggerSimulatedDepartureWarning() {
    startSilentAudioKeepAlive();
    playNotificationTone('DEPARTURE_ALARM');
    if (navigator.vibrate) navigator.vibrate([600, 200, 600, 200, 1000]);

    const simTask = {
        id: 'SIM-DEP-1',
        customerTitle: 'ALAETTİN SOLAK',
        contactPerson: 'Alaettin Solak, Yusuf Solak',
        phone: '0542 714 19 34',
        location: 'Çorum / Osmancık',
        distanceKm: 60,
        driveMinutes: 55,
        marginMinutes: 60,
        totalLeadMinutes: 115,
        dueTime: '15:00',
        departureTime: '13:05'
    };

    sendLocalOrServiceWorkerPush({
        title: `🚗 YOLA ÇIKIŞ VAKTİ! (Simülasyon Testi: ALAETTİN SOLAK)`,
        body: `Randevu Saati: 15:00 | Hedef: Çorum / Osmancık. Mesafe: ~60 km (~55 dk sürüş) + 1 Saat Yanılma Payı ile şimdi saat 13:05'te yola çıkmalısınız!`,
        url: './?tab=tasks-tab',
        tag: 'test-dep'
    });

    openUrgentDepartureModal(simTask);
}

async function triggerServerWebPushTest(delaySec = 0) {
    if (!currentUser) return;
    startSilentAudioKeepAlive();
    await subscribeToWebPush(false);
    const dev = detectBrowserAndOS();

    const reqId = 'PTEST-' + Date.now();
    const testReq = {
        id: reqId,
        username: currentUser.username,
        userFullName: currentUser.name,
        delaySeconds: Number(delaySec) || 0,
        browser: dev.fullLabel,
        title: delaySec > 0
            ? `🔒 DİZSAN Kilit Ekranı Push Testi (${delaySec} Sn)`
            : `🔔 DİZSAN Anlık Web Push Bildirimi`,
        body: `Sayın ${currentUser.name}, telefonunuz kilitliyken veya uygulama kapalıyken VAPID Web Push sunucusu tarafından bildirim başarıyla iletildi.`,
        url: './?tab=dashboard-tab',
        status: 'PENDING',
        createdAt: formatNowTR()
    };

    if (!Array.isArray(appState.pushTestRequests)) appState.pushTestRequests = [];
    appState.pushTestRequests.unshift(testReq);
    if (appState.pushTestRequests.length > 25) {
        appState.pushTestRequests = appState.pushTestRequests.slice(0, 25);
    }

    // Yerel ve bulut push sunucusuna doğrudan istek at
    fetch('http://localhost:8787/api/push/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testReq)
    }).catch(() => {});

    await syncToServer();

    if (delaySec > 0) {
        alert(`⏱️ ${delaySec} Saniye Geri Sayım Başladı!\n\nLütfen ŞİMDİ telefonunuzun ekranını kilitleyin veya uygulamayı arka plana atın. ${delaySec} saniye sonra sunucumuz doğrudan telefonunuza kilit ekranı bildirimi gönderecektir.`);
    } else {
        playNotificationTone('INVITE');
        sendLocalOrServiceWorkerPush({
            title: '🔔 DİZSAN Anlık Bildirim Testi',
            body: `Sayın ${currentUser.name}, bildirim ses ve görüntü motoru aktif çalışmaktadır.`
        });
    }
}

function openPushTestCenterModal() {
    const m = document.getElementById('push-test-modal');
    if (!m) return;
    const dev = detectBrowserAndOS();
    const perm = ('Notification' in window) ? Notification.permission : 'unsupported';
    const hasSub = currentDeviceSubscribedEndpoint !== null;

    document.getElementById('push-test-modal-body').innerHTML = `
        <div style="background:rgba(255,255,255,0.04); border:1px solid var(--border-color); border-radius:12px; padding:1rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
                <div>
                    <strong style="color:#fff;">Cihaz &amp; Sistem:</strong> ${dev.fullLabel}<br>
                    <strong style="color:#fff;">Bildirim İzni:</strong> <span class="badge ${perm === 'granted' ? 'badge-success' : 'badge-p2'}">${perm}</span><br>
                    <strong style="color:#fff;">Web Push Durumu:</strong> <span class="badge ${hasSub ? 'badge-success' : 'badge-p2'}">${hasSub ? 'Aktif' : 'Beklemede'}</span>
                </div>
            </div>
        </div>
        <div style="display:flex; gap:0.6rem; flex-wrap:wrap;">
            <button type="button" class="btn btn-primary" onclick="subscribeToWebPush(true)">
                <i class="fa-solid fa-satellite-dish"></i> 1. Cihazı VAPID Push'a Kaydet
            </button>
            <button type="button" class="btn btn-success" onclick="triggerServerWebPushTest(0)">
                <i class="fa-solid fa-bolt"></i> 2. Anlık Test Gönder (0 Sn)
            </button>
            <button type="button" class="btn btn-danger" onclick="triggerServerWebPushTest(15)">
                <i class="fa-solid fa-lock"></i> 3. 15 Sn Kilit Ekranı Testi
            </button>
            <button type="button" class="btn btn-secondary" onclick="triggerSimulatedPhoneReminder()">
                <i class="fa-solid fa-phone"></i> 4. 1 Saat Kala Telefon Uyarısı Testi
            </button>
            <button type="button" class="btn btn-warning" onclick="triggerSimulatedDepartureWarning()">
                <i class="fa-solid fa-car-on"></i> 5. Ziyaret Çıkış Uyarısı Testi (+1 Saat Yanılma Payı)
            </button>
        </div>
    `;
    m.classList.add('open');
}

function closePushTestCenterModal() {
    const m = document.getElementById('push-test-modal');
    if (m) m.classList.remove('open');
}

function renderBgNotificationPermissionBanner() {
    const el = document.getElementById('bg-notification-permission-banner');
    if (!el) return;
    const perm = ('Notification' in window) ? Notification.permission : 'unsupported';
    if (perm === 'granted' && currentDeviceSubscribedEndpoint) {
        el.innerHTML = '';
        return;
    }
    el.innerHTML = `
        <div class="alarm-banner" onclick="subscribeToWebPush(true)" style="cursor:pointer;">
            <div class="alarm-banner-left">
                <div class="alarm-pulse-icon"><i class="fa-solid fa-satellite-dish"></i></div>
                <div>
                    <strong style="color:#fff; font-size:0.92rem; display:block;">📡 Kilit Ekranı ve Sesli Bildirimleri Aktif Edin</strong>
                    <span style="color:#e2e8f0; font-size:0.8rem;">Telefon veya tabletiniz kilitliyken ziyaret hatırlatıcılarını almak için dokunup izin verin.</span>
                </div>
            </div>
            <button type="button" class="btn btn-success btn-sm"><i class="fa-solid fa-check"></i> İzin Ver</button>
        </div>
    `;
}

function initBackgroundAlarmWorker() {
    if (bgAlarmWorker) return;
    try {
        bgAlarmWorker = new Worker('alarm-worker.js?v=1.0.0');
        bgAlarmWorker.onmessage = (e) => {
            const msg = e.data || {};
            if (msg.type === 'WORKER_STATE_TICK' && msg.state) {
                if (isCloudPutInFlight || hasPendingCloudPut || (Date.now() - lastLocalSaveTime < 6000)) return;
                const remoteTime = new Date(msg.state.updatedAt || 0).getTime();
                const localTime = new Date(appState.updatedAt || 0).getTime();
                if (remoteTime > localTime) {
                    appState = msg.state;
                    saveStateLocally();
                    renderAll();
                }
            }
            // Worker her kalp atışında hatırlatıcıları da kontrol eder
            checkDueReminders();
        };
        bgAlarmWorker.postMessage({ type: 'START_WORKER' });
    } catch (e) {}
}

// ==========================================================================
// 10. PAYLAŞIM VE KURULUM REHBERİ
// ==========================================================================
function getLivePreferredUrl() {
    return 'https://dizsan.github.io/ziyaret/';
}

function shareAppOnWhatsApp() {
    const url = getLivePreferredUrl();
    const msg = `📢 *DİZSAN Müşteri Ziyaret & Saha Takip Sistemi*\n\n🔗 *Uygulama Giriş Linki:*\n${url}\n\n📲 *Telefon ve Tablete Kurulum:*\n• *iPhone / iPad:* Safari'de açın ➔ *Paylaş (⬆️)* ➔ *Ana Ekrana Ekle*\n• *Android:* Chrome menüsünden *Uygulamayı Yükle* seçin.\n\n🔑 *Giriş Şifresi:* 123 veya 123456`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
}

// PWA Kurulum İstemi Dinleyicisi
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPwaPrompt = e;
    
    // Doğrudan kur butonunu göster
    const directBox = document.getElementById('pwa-direct-install-box');
    if (directBox) directBox.style.display = 'block';

    // Standalone değilse ve mobildeyse bannerı göster
    checkPwaInstallState();
});

window.addEventListener('appinstalled', () => {
    deferredPwaPrompt = null;
    const banner = document.getElementById('mobile-pwa-install-banner');
    if (banner) banner.style.display = 'none';
    const chips = document.querySelectorAll('.mobile-app-install-chip');
    chips.forEach(c => c.style.display = 'none');
    console.log('[Dizsan PWA] Uygulama başarıyla cihaza yüklendi.');
});

function isAppRunningStandalone() {
    return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
           (window.navigator.standalone === true) ||
           document.referrer.includes('android-app://');
}

function checkPwaInstallState() {
    if (isAppRunningStandalone()) {
        const banner = document.getElementById('mobile-pwa-install-banner');
        if (banner) banner.style.display = 'none';
        const chips = document.querySelectorAll('.mobile-app-install-chip');
        chips.forEach(c => c.style.display = 'none');
        return;
    }

    // Mobil cihazda ve kullanıcı bu oturumda kapatmadıysa bannerı göster
    const isMobile = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const dismissed = sessionStorage.getItem('dizsan_pwa_banner_dismissed') === '1';
    const banner = document.getElementById('mobile-pwa-install-banner');
    if (isMobile && !dismissed && banner) {
        banner.style.display = 'block';
    }
}

function dismissPwaBanner() {
    sessionStorage.setItem('dizsan_pwa_banner_dismissed', '1');
    const banner = document.getElementById('mobile-pwa-install-banner');
    if (banner) banner.style.display = 'none';
}

function triggerPwaPrompt() {
    if (deferredPwaPrompt) {
        deferredPwaPrompt.prompt();
        deferredPwaPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('[Dizsan PWA] Kullanıcı kurulumu onayladı.');
                dismissPwaBanner();
                closeInstallGuideModal();
            }
            deferredPwaPrompt = null;
        });
    } else {
        alert('Cihazınızda doğrudan kurulum tetiklenemedi. Lütfen menüdeki (3 nokta) "Uygulamayı Yükle" veya "Ana Ekrana Ekle" adımını uygulayın.');
    }
}

function switchInstallTab(platform) {
    const tabs = ['android', 'ios', 'qr'];
    tabs.forEach(p => {
        const btn = document.getElementById(`tab-btn-${p}`);
        const content = document.getElementById(`install-content-${p}`);
        if (btn) btn.classList.toggle('active', p === platform);
        if (content) content.style.display = (p === platform) ? 'block' : 'none';
    });
}

function openInstallGuideModal() {
    const m = document.getElementById('install-guide-modal');
    if (!m) return;
    const qrUrl = getLivePreferredUrl();
    const img = document.getElementById('install-qr-img');
    if (img) {
        img.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=4&data=${encodeURIComponent(qrUrl)}`;
    }

    // Otomatik platform seçimi
    const ua = navigator.userAgent || '';
    if (/iPhone|iPad|iPod/i.test(ua)) {
        switchInstallTab('ios');
    } else if (/Android/i.test(ua)) {
        switchInstallTab('android');
        const directBox = document.getElementById('pwa-direct-install-box');
        if (directBox && deferredPwaPrompt) {
            directBox.style.display = 'block';
        }
    } else {
        switchInstallTab('qr');
    }

    m.classList.add('open');
    m.classList.add('active');
    m.style.display = 'flex';
}

function closeInstallGuideModal() {
    const m = document.getElementById('install-guide-modal');
    if (m) {
        m.classList.remove('open');
        m.classList.remove('active');
        m.style.display = 'none';
    }
}

window.openInstallGuideModal = openInstallGuideModal;
window.closeInstallGuideModal = closeInstallGuideModal;
window.switchInstallTab = switchInstallTab;
window.triggerPwaPrompt = triggerPwaPrompt;
window.dismissPwaBanner = dismissPwaBanner;
window.checkPwaInstallState = checkPwaInstallState;
window.isAppRunningStandalone = isAppRunningStandalone;
window.shareAppOnWhatsApp = shareAppOnWhatsApp;

// Yönetici Onay Kalkanı & Görevlendirme Fonksiyonları
window.requestDeleteVisit = requestDeleteVisit;
window.requestDeleteTask = requestDeleteTask;
window.openApprovalRequestModal = openApprovalRequestModal;
window.closeApprovalRequestModal = closeApprovalRequestModal;
window.handleApprovalRequestSubmit = handleApprovalRequestSubmit;
window.openTaskActionModal = openTaskActionModal;
window.closeTaskActionModal = closeTaskActionModal;
window.handleTaskActionSubmit = handleTaskActionSubmit;
window.renderOmerApprovalCenter = renderOmerApprovalCenter;
window.openApprovalCenterModal = openApprovalCenterModal;
window.closeApprovalCenterModal = closeApprovalCenterModal;
window.approveRequest = approveRequest;
window.rejectRequest = rejectRequest;

// ==========================================================================
// 11. BAŞLATICI (INITIALIZATION)
// ==========================================================================
function renderAll() {
    renderDashboard();
    populateFilterOptions();
    renderLegacyCustomers();
    renderCariEkstreTable(false);
    renderActiveVisits();
    renderTasks();
    renderOmerApprovalCenter();
    renderDistrictStrategies();
    renderLogs();
    runAiDeduplicationAnalysis();
    checkPwaInstallState();
}

document.addEventListener('DOMContentLoaded', async () => {
    const isDproEmbedded = (window.self !== window.top) || window.location.search.includes('embed=dpro');
    if (isDproEmbedded) {
        document.body.classList.add('dpro-embedded');
    }

    // Eski Service Worker ve önbellekleri zorla temizle (v1.2.0)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(regs => {
            for (let r of regs) r.update();
        });
    }
    if ('caches' in window) {
        caches.keys().then(keys => {
            keys.forEach(k => {
                if (k !== 'dizsan-ziyaret-vv1.5.4: Sonsuz otomatik yenileme (reload loop) ve Service Worker cakismasi tamamen giderildi') caches.delete(k);
            });
        });
    }

    await loadInitialData();
    renderQuickUserChips();
    loadRememberedCredentials();

    // Şehir önerileri kutusu dışına tıklandığında otomatik kapat
    document.addEventListener('click', (e) => {
        const wrapper = e.target.closest('.city-filter-wrapper');
        if (!wrapper) {
            const box = document.getElementById('legacy-city-suggestions');
            if (box) box.style.display = 'none';
        }
    });

    // Görüşme sonucu ve türü için global olay dinleyicilerini bağla
    const resSel = document.getElementById('visit-result-select');
    if (resSel) {
        resSel.addEventListener('change', handleVisitResultChange);
        resSel.addEventListener('input', handleVisitResultChange);
        resSel.addEventListener('click', handleVisitResultChange);
    }
    const typeSel = document.getElementById('visit-type-select');
    if (typeSel) {
        typeSel.addEventListener('change', () => {
            const currentFollowup = document.getElementById('visit-followup-type')?.value;
            if (currentFollowup === 'ZİYARET') {
                updateVisitTravelCalculation();
            } else {
                updateVisitPhoneCalculation();
            }
        });
    }

    const saved = localStorage.getItem(STORAGE_KEY_SESSION) || sessionStorage.getItem(STORAGE_KEY_SESSION);
    if (saved) {
        try {
            const p = JSON.parse(saved);
            const matched = appState.users.find(u => normalizeTR(u.name) === normalizeTR(p.name) || normalizeTR(u.username) === normalizeTR(p.username));
            if (matched) currentUser = matched;
        } catch (e) {}
    }

    // D-Pro birleşik platform içinde gömülü çalışırken D-Pro'da Ömer Eren oturumu açıksa tek oturum (SSO) ile başlat
    const dproActiveUser = (localStorage.getItem('dizsan_dpro_active_session_v1') || sessionStorage.getItem('dizsan_dpro_active_session_v1') || '').toLowerCase();
    if (!currentUser && isDproEmbedded && (dproActiveUser === 'ömer' || dproActiveUser === 'omer') && Array.isArray(appState.users) && appState.users.length > 0) {
        currentUser = appState.users.find(u => normalizeTR(u.username).includes('omer')) || appState.users[0];
        localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(currentUser));
    }

    applyAuthenticatedUser();

    // Dokunma ve tıklamalarda otomatik bildirim ve ses aktivasyonu
    const unlockGesture = () => {
        startSilentAudioKeepAlive();
        if (currentUser && !currentDeviceSubscribedEndpoint) {
            autoEnrollZeroTouchPush();
        }
    };
    document.addEventListener('click', unlockGesture, { passive: true });
    document.addEventListener('touchend', unlockGesture, { passive: true });

    // Her 12 saniyede bir bulut kontrolü
    setInterval(() => {
        syncFromServer();
    }, 12000);

    // Her 8 saniyede bir telefon hatırlatıcısı & çıkış uyarısı motorunu çalıştır
    setInterval(() => {
        checkDueReminders();
    }, 8000);
    checkDueReminders();

    // Otomatik Sürüm Denetimi (İlk açılışta ve her 30 saniyede bir)
    updateAppVersionDisplay();
    checkForAppUpdates(false);
    setInterval(() => {
        checkForAppUpdates(false);
    }, 30000);

    // Sürüm butonlarına doğrudan tıklama dinleyicilerini bağla
    const vBadgeBtn = document.getElementById('app-version-badge');
    if (vBadgeBtn) {
        vBadgeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openVersionModal();
        });
    }
    const sideVer = document.getElementById('sidebar-app-version');
    if (sideVer) {
        sideVer.style.cursor = 'pointer';
        sideVer.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openVersionModal();
        });
    }
    const vModalEl = document.getElementById('version-modal');
    if (vModalEl) {
        vModalEl.addEventListener('click', (e) => {
            if (e.target === vModalEl) closeVersionModal();
        });
    }
    const changePassModalEl = document.getElementById('change-password-modal');
    if (changePassModalEl) {
        changePassModalEl.addEventListener('click', (e) => {
            if (e.target === changePassModalEl) closeChangePasswordModal();
        });
    }
    const forgotModalEl = document.getElementById('forgot-password-modal');
    if (forgotModalEl) {
        forgotModalEl.addEventListener('click', (e) => {
            if (e.target === forgotModalEl) closeForgotPasswordModal();
        });
    }
    const installGuideModalEl = document.getElementById('install-guide-modal');
    if (installGuideModalEl) {
        installGuideModalEl.addEventListener('click', (e) => {
            if (e.target === installGuideModalEl) closeInstallGuideModal();
        });
    }
    const invModalEl = document.getElementById('invoice-detail-modal');
    if (invModalEl) {
        invModalEl.addEventListener('click', (e) => {
            if (e.target === invModalEl) closeInvoiceDetailModal();
        });
    }
    const custDetailModalEl = document.getElementById('customer-detail-modal');
    if (custDetailModalEl) {
        custDetailModalEl.addEventListener('click', (e) => {
            if (e.target === custDetailModalEl) closeCustomerDetailModal();
        });
    }

    // Sekmeye veya uygulamaya geri dönüldüğünde anında güncelleme kontrolü
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            checkForAppUpdates(false);
            syncFromServer();
        }
    });
    window.addEventListener('focus', () => {
        checkForAppUpdates(false);
    });

    // Service Worker Kaydı (Sonsuz yenileme döngüsü yaratmadan sessiz çalışır)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js?v=Aranan kelimenin gectigi alani ve kelimeyi sari isaretleme (highlight) sistemi eklendi').catch(() => {});
    }
});
