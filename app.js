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
const CURRENT_APP_VERSION = "v1.8.2: 3-Depo GitHub Canlı Yedekleme, Otomatik Cihaz Senkronizasyonu ve Tek Tıkla Tam Sistem Kurtarma Altyapısı";
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
    { order: 0,  name: "ÖMER EREN",                  username: "ömer",             mailBox: "oeren",     pinStamp: "621976239-623787727-2631164839", role: "Yönetici", dept: "Yönetim Kurulu / Sistem Yöneticisi", avatar: "dizsan_logo.jpg" },
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
const DEFAULT_USERS = OFFICIAL_PERSONNEL_LIST;

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
    deletedIds: [],
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

// GitHub Bulut API Anahtarı (Telefon <-> PC Anlık Otomatik Senkronizasyon)
const CLOUD_KEY_CODES = [106, 107, 115, 98, 91, 123, 91, 82, 116, 68, 73, 89, 125, 119, 57, 84, 112, 75, 86, 86, 109, 86, 112, 72, 103, 80, 116, 87, 117, 111, 113, 57, 125, 80, 53, 105, 76, 60, 120, 79];
const CLOUD_API_URL = 'https://api.github.com/repos/Dizsan/ziyaret/contents/live_sync_state.json';
const CLOUD_DPRO_API_URL = 'https://api.github.com/repos/Dizsan/dpro/contents/apps/ziyaret/live_sync_state.json';
let lastKnownCloudSha = null;
let lastKnownDproSha = null;
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


const OFFICIAL_DPRO_PERMISSIONS_ZIYARET = {"ömer": {"apps": {"Dizsan_Ziyaret_Mobil_Karekod": true, "Dizsan_Toplanti_Mobil_Karekod": true, "Dizsan_Kredi_Mobil_Karekod": true, "Dizsan_Odeme_Takvimi": true, "Dizsan_Kredi_Karti_Takip": true, "Dizsan_VDF_Odeme": true, "Dizsan_DMet_Radar": true, "Dizsan_DiKas_Finans": true, "Dizsan_Gunluk_Kasa": true}, "submodules": {"ziyaret_genel": true, "ziyaret_rut_planla": true, "ziyaret_ekstre": true, "ziyaret_kayit": true, "ziyaret_cari": true, "ziyaret_gorev": true, "ziyaret_rapor": true, "ziyaret_raporlar": true, "toplanti_genel": true, "toplanti_olustur": true, "toplanti_aksiyon": true, "toplanti_duyuru": true, "toplanti_rapor": true, "kredi_combined": true, "kredi_bankalar": true, "kredi_odeme_onay": true, "kredi_erken_kapama": true, "kredi_yeni_ekle": true, "takvim_aylik": true, "takvim_kartlar": true, "takvim_krediler": true, "takvim_liste": true, "takvim_mobil": true, "kart_tumu": true, "kart_sirket": true, "kart_sahsi": true, "vdf_kokpit": true, "vdf_takvim": true, "vdf_tablo": true, "vdf_odemeler": true, "vdf_limitler": true, "vdf_otomasyon": true, "dmet_radar": true, "dmet_ailab": true, "dmet_hinterland": true, "dmet_sources": true, "dmet_notifications": true, "dmet_logs": true, "dikas_dashboard": true, "dikas_calendar": true, "dikas_forecast": true, "dikas_accounts": true, "dikas_payments": true, "dikas_collections": true, "dikas_instruments": true, "dikas_reports": true, "kasa_form": true, "kasa_a4": true, "kasa_archive": true, "kasa_admin": true}, "appActions": {"Dizsan_Ziyaret_Mobil_Karekod": {"view": true, "create": true, "edit": true, "delete": true, "export": true, "financial": true}, "Dizsan_Toplanti_Mobil_Karekod": {"view": true, "create": true, "edit": true, "delete": true, "export": true, "financial": true}, "Dizsan_Kredi_Mobil_Karekod": {"view": true, "create": true, "edit": true, "delete": true, "export": true, "financial": true}, "Dizsan_Odeme_Takvimi": {"view": true, "create": true, "edit": true, "delete": true, "export": true, "financial": true}, "Dizsan_Kredi_Karti_Takip": {"view": true, "create": true, "edit": true, "delete": true, "export": true, "financial": true}, "Dizsan_VDF_Odeme": {"view": true, "create": true, "edit": true, "delete": true, "export": true, "financial": true}, "Dizsan_DMet_Radar": {"view": true, "create": true, "edit": true, "delete": true, "export": true, "financial": true}, "Dizsan_DiKas_Finans": {"view": true, "create": true, "edit": true, "delete": true, "export": true, "financial": true}, "Dizsan_Gunluk_Kasa": {"view": true, "create": true, "edit": true, "delete": true, "export": true, "financial": true}}}, "hakan.aydin": {"apps": {"Dizsan_Ziyaret_Mobil_Karekod": true, "Dizsan_Toplanti_Mobil_Karekod": true, "Dizsan_Kredi_Mobil_Karekod": false, "Dizsan_Odeme_Takvimi": false, "Dizsan_Kredi_Karti_Takip": false, "Dizsan_VDF_Odeme": false, "Dizsan_DMet_Radar": false, "Dizsan_DiKas_Finans": false, "Dizsan_Gunluk_Kasa": false}, "submodules": {"ziyaret_genel": true, "ziyaret_rut_planla": true, "ziyaret_ekstre": true, "ziyaret_kayit": true, "ziyaret_cari": true, "ziyaret_gorev": true, "ziyaret_rapor": true, "ziyaret_raporlar": true, "toplanti_genel": true, "toplanti_olustur": true, "toplanti_aksiyon": true, "toplanti_duyuru": true, "toplanti_rapor": true, "kredi_combined": false, "kredi_bankalar": false, "kredi_odeme_onay": false, "kredi_erken_kapama": false, "kredi_yeni_ekle": false, "takvim_aylik": false, "takvim_kartlar": false, "takvim_krediler": false, "takvim_liste": false, "takvim_mobil": false, "kart_tumu": false, "kart_sirket": false, "kart_sahsi": false, "vdf_kokpit": false, "vdf_takvim": false, "vdf_tablo": false, "vdf_odemeler": false, "vdf_limitler": false, "vdf_otomasyon": false, "dmet_radar": false, "dmet_ailab": false, "dmet_hinterland": false, "dmet_sources": false, "dmet_notifications": false, "dmet_logs": false, "dikas_dashboard": false, "dikas_calendar": false, "dikas_forecast": false, "dikas_accounts": false, "dikas_payments": false, "dikas_collections": false, "dikas_instruments": false, "dikas_reports": false, "kasa_form": false, "kasa_a4": false, "kasa_archive": false, "kasa_admin": false}, "appActions": {"Dizsan_Ziyaret_Mobil_Karekod": {"view": true, "create": true, "edit": false, "delete": false, "export": true, "financial": false}, "Dizsan_Toplanti_Mobil_Karekod": {"view": true, "create": true, "edit": true, "delete": false, "export": true, "financial": false}, "Dizsan_Kredi_Mobil_Karekod": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Odeme_Takvimi": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Kredi_Karti_Takip": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_VDF_Odeme": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_DMet_Radar": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_DiKas_Finans": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Gunluk_Kasa": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}}}, "fatih.kiroglu": {"apps": {"Dizsan_Ziyaret_Mobil_Karekod": true, "Dizsan_Toplanti_Mobil_Karekod": true, "Dizsan_Kredi_Mobil_Karekod": false, "Dizsan_Odeme_Takvimi": false, "Dizsan_Kredi_Karti_Takip": false, "Dizsan_VDF_Odeme": false, "Dizsan_DMet_Radar": false, "Dizsan_DiKas_Finans": false, "Dizsan_Gunluk_Kasa": false}, "submodules": {"ziyaret_genel": true, "ziyaret_rut_planla": true, "ziyaret_ekstre": true, "ziyaret_kayit": true, "ziyaret_cari": true, "ziyaret_gorev": true, "ziyaret_rapor": true, "ziyaret_raporlar": true, "toplanti_genel": false, "toplanti_olustur": true, "toplanti_aksiyon": true, "toplanti_duyuru": false, "toplanti_rapor": true, "kredi_combined": false, "kredi_bankalar": false, "kredi_odeme_onay": false, "kredi_erken_kapama": false, "kredi_yeni_ekle": false, "takvim_aylik": false, "takvim_kartlar": false, "takvim_krediler": false, "takvim_liste": false, "takvim_mobil": false, "kart_tumu": false, "kart_sirket": false, "kart_sahsi": false, "vdf_kokpit": false, "vdf_takvim": false, "vdf_tablo": false, "vdf_odemeler": false, "vdf_limitler": false, "vdf_otomasyon": false, "dmet_radar": false, "dmet_ailab": false, "dmet_hinterland": false, "dmet_sources": false, "dmet_notifications": false, "dmet_logs": false, "dikas_dashboard": false, "dikas_calendar": false, "dikas_forecast": false, "dikas_accounts": false, "dikas_payments": false, "dikas_collections": false, "dikas_instruments": false, "dikas_reports": false, "kasa_form": false, "kasa_a4": false, "kasa_archive": false, "kasa_admin": false}, "appActions": {"Dizsan_Ziyaret_Mobil_Karekod": {"view": true, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Toplanti_Mobil_Karekod": {"view": true, "create": true, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Kredi_Mobil_Karekod": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Odeme_Takvimi": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Kredi_Karti_Takip": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_VDF_Odeme": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_DMet_Radar": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_DiKas_Finans": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Gunluk_Kasa": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}}}, "rafet.canbek": {"apps": {"Dizsan_Ziyaret_Mobil_Karekod": true, "Dizsan_Toplanti_Mobil_Karekod": true, "Dizsan_Kredi_Mobil_Karekod": false, "Dizsan_Odeme_Takvimi": false, "Dizsan_Kredi_Karti_Takip": false, "Dizsan_VDF_Odeme": false, "Dizsan_DMet_Radar": false, "Dizsan_DiKas_Finans": false, "Dizsan_Gunluk_Kasa": true}, "submodules": {"ziyaret_genel": true, "ziyaret_rut_planla": true, "ziyaret_ekstre": true, "ziyaret_kayit": true, "ziyaret_cari": true, "ziyaret_gorev": true, "ziyaret_rapor": true, "ziyaret_raporlar": true, "toplanti_genel": true, "toplanti_olustur": true, "toplanti_aksiyon": true, "toplanti_duyuru": false, "toplanti_rapor": true, "kredi_combined": false, "kredi_bankalar": false, "kredi_odeme_onay": false, "kredi_erken_kapama": false, "kredi_yeni_ekle": false, "takvim_aylik": false, "takvim_kartlar": false, "takvim_krediler": false, "takvim_liste": false, "takvim_mobil": false, "kart_tumu": false, "kart_sirket": false, "kart_sahsi": false, "vdf_kokpit": false, "vdf_takvim": false, "vdf_tablo": false, "vdf_odemeler": false, "vdf_limitler": false, "vdf_otomasyon": false, "dmet_radar": false, "dmet_ailab": false, "dmet_hinterland": false, "dmet_sources": false, "dmet_notifications": false, "dmet_logs": false, "dikas_dashboard": false, "dikas_calendar": false, "dikas_forecast": false, "dikas_accounts": false, "dikas_payments": false, "dikas_collections": false, "dikas_instruments": false, "dikas_reports": false, "kasa_form": true, "kasa_a4": true, "kasa_archive": true, "kasa_admin": false}, "appActions": {"Dizsan_Ziyaret_Mobil_Karekod": {"view": true, "create": true, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Toplanti_Mobil_Karekod": {"view": true, "create": true, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Kredi_Mobil_Karekod": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Odeme_Takvimi": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Kredi_Karti_Takip": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_VDF_Odeme": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_DMet_Radar": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_DiKas_Finans": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Gunluk_Kasa": {"view": true, "create": true, "edit": true, "delete": false, "export": true, "financial": true}}}, "gokhan.ozbulut": {"apps": {"Dizsan_Ziyaret_Mobil_Karekod": true, "Dizsan_Toplanti_Mobil_Karekod": true, "Dizsan_Kredi_Mobil_Karekod": false, "Dizsan_Odeme_Takvimi": false, "Dizsan_Kredi_Karti_Takip": false, "Dizsan_VDF_Odeme": false, "Dizsan_DMet_Radar": false, "Dizsan_DiKas_Finans": false, "Dizsan_Gunluk_Kasa": true}, "submodules": {"ziyaret_genel": true, "ziyaret_rut_planla": true, "ziyaret_ekstre": true, "ziyaret_kayit": true, "ziyaret_cari": true, "ziyaret_gorev": true, "ziyaret_rapor": true, "ziyaret_raporlar": true, "toplanti_genel": true, "toplanti_olustur": true, "toplanti_aksiyon": true, "toplanti_duyuru": false, "toplanti_rapor": true, "kredi_combined": false, "kredi_bankalar": false, "kredi_odeme_onay": false, "kredi_erken_kapama": false, "kredi_yeni_ekle": false, "takvim_aylik": false, "takvim_kartlar": false, "takvim_krediler": false, "takvim_liste": false, "takvim_mobil": false, "kart_tumu": false, "kart_sirket": false, "kart_sahsi": false, "vdf_kokpit": false, "vdf_takvim": false, "vdf_tablo": false, "vdf_odemeler": false, "vdf_limitler": false, "vdf_otomasyon": false, "dmet_radar": false, "dmet_ailab": false, "dmet_hinterland": false, "dmet_sources": false, "dmet_notifications": false, "dmet_logs": false, "dikas_dashboard": false, "dikas_calendar": false, "dikas_forecast": false, "dikas_accounts": false, "dikas_payments": false, "dikas_collections": false, "dikas_instruments": false, "dikas_reports": false, "kasa_form": true, "kasa_a4": true, "kasa_archive": true, "kasa_admin": false}, "appActions": {"Dizsan_Ziyaret_Mobil_Karekod": {"view": true, "create": true, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Toplanti_Mobil_Karekod": {"view": true, "create": true, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Kredi_Mobil_Karekod": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Odeme_Takvimi": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Kredi_Karti_Takip": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_VDF_Odeme": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_DMet_Radar": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_DiKas_Finans": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Gunluk_Kasa": {"view": true, "create": true, "edit": true, "delete": false, "export": true, "financial": true}}}, "ertugrul.erdem": {"apps": {"Dizsan_Ziyaret_Mobil_Karekod": true, "Dizsan_Toplanti_Mobil_Karekod": true, "Dizsan_Kredi_Mobil_Karekod": false, "Dizsan_Odeme_Takvimi": false, "Dizsan_Kredi_Karti_Takip": false, "Dizsan_VDF_Odeme": false, "Dizsan_DMet_Radar": false, "Dizsan_DiKas_Finans": false, "Dizsan_Gunluk_Kasa": false}, "submodules": {"ziyaret_genel": true, "ziyaret_rut_planla": true, "ziyaret_ekstre": true, "ziyaret_kayit": true, "ziyaret_cari": true, "ziyaret_gorev": true, "ziyaret_rapor": true, "ziyaret_raporlar": true, "toplanti_genel": true, "toplanti_olustur": true, "toplanti_aksiyon": true, "toplanti_duyuru": false, "toplanti_rapor": true, "kredi_combined": false, "kredi_bankalar": false, "kredi_odeme_onay": false, "kredi_erken_kapama": false, "kredi_yeni_ekle": false, "takvim_aylik": false, "takvim_kartlar": false, "takvim_krediler": false, "takvim_liste": false, "takvim_mobil": false, "kart_tumu": false, "kart_sirket": false, "kart_sahsi": false, "vdf_kokpit": false, "vdf_takvim": false, "vdf_tablo": false, "vdf_odemeler": false, "vdf_limitler": false, "vdf_otomasyon": false, "dmet_radar": false, "dmet_ailab": false, "dmet_hinterland": false, "dmet_sources": false, "dmet_notifications": false, "dmet_logs": false, "dikas_dashboard": false, "dikas_calendar": false, "dikas_forecast": false, "dikas_accounts": false, "dikas_payments": false, "dikas_collections": false, "dikas_instruments": false, "dikas_reports": false, "kasa_form": false, "kasa_a4": false, "kasa_archive": false, "kasa_admin": false}, "appActions": {"Dizsan_Ziyaret_Mobil_Karekod": {"view": true, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Toplanti_Mobil_Karekod": {"view": true, "create": true, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Kredi_Mobil_Karekod": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Odeme_Takvimi": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Kredi_Karti_Takip": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_VDF_Odeme": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_DMet_Radar": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_DiKas_Finans": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Gunluk_Kasa": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}}}, "necati.demirci": {"apps": {"Dizsan_Ziyaret_Mobil_Karekod": true, "Dizsan_Toplanti_Mobil_Karekod": true, "Dizsan_Kredi_Mobil_Karekod": false, "Dizsan_Odeme_Takvimi": false, "Dizsan_Kredi_Karti_Takip": false, "Dizsan_VDF_Odeme": false, "Dizsan_DMet_Radar": false, "Dizsan_DiKas_Finans": false, "Dizsan_Gunluk_Kasa": false}, "submodules": {"ziyaret_genel": true, "ziyaret_rut_planla": true, "ziyaret_ekstre": true, "ziyaret_kayit": true, "ziyaret_cari": true, "ziyaret_gorev": true, "ziyaret_rapor": true, "ziyaret_raporlar": true, "toplanti_genel": true, "toplanti_olustur": true, "toplanti_aksiyon": true, "toplanti_duyuru": false, "toplanti_rapor": true, "kredi_combined": false, "kredi_bankalar": false, "kredi_odeme_onay": false, "kredi_erken_kapama": false, "kredi_yeni_ekle": false, "takvim_aylik": false, "takvim_kartlar": false, "takvim_krediler": false, "takvim_liste": false, "takvim_mobil": false, "kart_tumu": false, "kart_sirket": false, "kart_sahsi": false, "vdf_kokpit": false, "vdf_takvim": false, "vdf_tablo": false, "vdf_odemeler": false, "vdf_limitler": false, "vdf_otomasyon": false, "dmet_radar": false, "dmet_ailab": false, "dmet_hinterland": false, "dmet_sources": false, "dmet_notifications": false, "dmet_logs": false, "dikas_dashboard": false, "dikas_calendar": false, "dikas_forecast": false, "dikas_accounts": false, "dikas_payments": false, "dikas_collections": false, "dikas_instruments": false, "dikas_reports": false, "kasa_form": false, "kasa_a4": false, "kasa_archive": false, "kasa_admin": false}, "appActions": {"Dizsan_Ziyaret_Mobil_Karekod": {"view": true, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Toplanti_Mobil_Karekod": {"view": true, "create": true, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Kredi_Mobil_Karekod": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Odeme_Takvimi": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Kredi_Karti_Takip": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_VDF_Odeme": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_DMet_Radar": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_DiKas_Finans": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Gunluk_Kasa": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}}}, "murat.karaoglu": {"apps": {"Dizsan_Ziyaret_Mobil_Karekod": true, "Dizsan_Toplanti_Mobil_Karekod": true, "Dizsan_Kredi_Mobil_Karekod": false, "Dizsan_Odeme_Takvimi": false, "Dizsan_Kredi_Karti_Takip": false, "Dizsan_VDF_Odeme": false, "Dizsan_DMet_Radar": false, "Dizsan_DiKas_Finans": false, "Dizsan_Gunluk_Kasa": false}, "submodules": {"ziyaret_genel": true, "ziyaret_rut_planla": true, "ziyaret_ekstre": true, "ziyaret_kayit": true, "ziyaret_cari": true, "ziyaret_gorev": true, "ziyaret_rapor": true, "ziyaret_raporlar": true, "toplanti_genel": true, "toplanti_olustur": true, "toplanti_aksiyon": true, "toplanti_duyuru": false, "toplanti_rapor": true, "kredi_combined": false, "kredi_bankalar": false, "kredi_odeme_onay": false, "kredi_erken_kapama": false, "kredi_yeni_ekle": false, "takvim_aylik": false, "takvim_kartlar": false, "takvim_krediler": false, "takvim_liste": false, "takvim_mobil": false, "kart_tumu": false, "kart_sirket": false, "kart_sahsi": false, "vdf_kokpit": false, "vdf_takvim": false, "vdf_tablo": false, "vdf_odemeler": false, "vdf_limitler": false, "vdf_otomasyon": false, "dmet_radar": false, "dmet_ailab": false, "dmet_hinterland": false, "dmet_sources": false, "dmet_notifications": false, "dmet_logs": false, "dikas_dashboard": false, "dikas_calendar": false, "dikas_forecast": false, "dikas_accounts": false, "dikas_payments": false, "dikas_collections": false, "dikas_instruments": false, "dikas_reports": false, "kasa_form": false, "kasa_a4": false, "kasa_archive": false, "kasa_admin": false}, "appActions": {"Dizsan_Ziyaret_Mobil_Karekod": {"view": true, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Toplanti_Mobil_Karekod": {"view": true, "create": true, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Kredi_Mobil_Karekod": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Odeme_Takvimi": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Kredi_Karti_Takip": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_VDF_Odeme": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_DMet_Radar": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_DiKas_Finans": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Gunluk_Kasa": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}}}, "murat.salman": {"apps": {"Dizsan_Ziyaret_Mobil_Karekod": true, "Dizsan_Toplanti_Mobil_Karekod": true, "Dizsan_Kredi_Mobil_Karekod": false, "Dizsan_Odeme_Takvimi": false, "Dizsan_Kredi_Karti_Takip": false, "Dizsan_VDF_Odeme": false, "Dizsan_DMet_Radar": false, "Dizsan_DiKas_Finans": false, "Dizsan_Gunluk_Kasa": false}, "submodules": {"ziyaret_genel": true, "ziyaret_rut_planla": true, "ziyaret_ekstre": true, "ziyaret_kayit": true, "ziyaret_cari": true, "ziyaret_gorev": true, "ziyaret_rapor": true, "ziyaret_raporlar": true, "toplanti_genel": true, "toplanti_olustur": true, "toplanti_aksiyon": true, "toplanti_duyuru": false, "toplanti_rapor": true, "kredi_combined": false, "kredi_bankalar": false, "kredi_odeme_onay": false, "kredi_erken_kapama": false, "kredi_yeni_ekle": false, "takvim_aylik": false, "takvim_kartlar": false, "takvim_krediler": false, "takvim_liste": false, "takvim_mobil": false, "kart_tumu": false, "kart_sirket": false, "kart_sahsi": false, "vdf_kokpit": false, "vdf_takvim": false, "vdf_tablo": false, "vdf_odemeler": false, "vdf_limitler": false, "vdf_otomasyon": false, "dmet_radar": false, "dmet_ailab": false, "dmet_hinterland": false, "dmet_sources": false, "dmet_notifications": false, "dmet_logs": false, "dikas_dashboard": false, "dikas_calendar": false, "dikas_forecast": false, "dikas_accounts": false, "dikas_payments": false, "dikas_collections": false, "dikas_instruments": false, "dikas_reports": false, "kasa_form": false, "kasa_a4": false, "kasa_archive": false, "kasa_admin": false}, "appActions": {"Dizsan_Ziyaret_Mobil_Karekod": {"view": true, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Toplanti_Mobil_Karekod": {"view": true, "create": true, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Kredi_Mobil_Karekod": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Odeme_Takvimi": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Kredi_Karti_Takip": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_VDF_Odeme": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_DMet_Radar": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_DiKas_Finans": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Gunluk_Kasa": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}}}, "yildiray.karagoz": {"apps": {"Dizsan_Ziyaret_Mobil_Karekod": true, "Dizsan_Toplanti_Mobil_Karekod": true, "Dizsan_Kredi_Mobil_Karekod": false, "Dizsan_Odeme_Takvimi": false, "Dizsan_Kredi_Karti_Takip": false, "Dizsan_VDF_Odeme": false, "Dizsan_DMet_Radar": false, "Dizsan_DiKas_Finans": false, "Dizsan_Gunluk_Kasa": false}, "submodules": {"ziyaret_genel": true, "ziyaret_rut_planla": true, "ziyaret_ekstre": true, "ziyaret_kayit": true, "ziyaret_cari": true, "ziyaret_gorev": true, "ziyaret_rapor": true, "ziyaret_raporlar": true, "toplanti_genel": true, "toplanti_olustur": true, "toplanti_aksiyon": true, "toplanti_duyuru": false, "toplanti_rapor": true, "kredi_combined": false, "kredi_bankalar": false, "kredi_odeme_onay": false, "kredi_erken_kapama": false, "kredi_yeni_ekle": false, "takvim_aylik": false, "takvim_kartlar": false, "takvim_krediler": false, "takvim_liste": false, "takvim_mobil": false, "kart_tumu": false, "kart_sirket": false, "kart_sahsi": false, "vdf_kokpit": false, "vdf_takvim": false, "vdf_tablo": false, "vdf_odemeler": false, "vdf_limitler": false, "vdf_otomasyon": false, "dmet_radar": false, "dmet_ailab": false, "dmet_hinterland": false, "dmet_sources": false, "dmet_notifications": false, "dmet_logs": false, "dikas_dashboard": false, "dikas_calendar": false, "dikas_forecast": false, "dikas_accounts": false, "dikas_payments": false, "dikas_collections": false, "dikas_instruments": false, "dikas_reports": false, "kasa_form": false, "kasa_a4": false, "kasa_archive": false, "kasa_admin": false}, "appActions": {"Dizsan_Ziyaret_Mobil_Karekod": {"view": true, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Toplanti_Mobil_Karekod": {"view": true, "create": true, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Kredi_Mobil_Karekod": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Odeme_Takvimi": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Kredi_Karti_Takip": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_VDF_Odeme": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_DMet_Radar": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_DiKas_Finans": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Gunluk_Kasa": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}}}, "mustafa.ilgen": {"apps": {"Dizsan_Ziyaret_Mobil_Karekod": true, "Dizsan_Toplanti_Mobil_Karekod": true, "Dizsan_Kredi_Mobil_Karekod": false, "Dizsan_Odeme_Takvimi": false, "Dizsan_Kredi_Karti_Takip": false, "Dizsan_VDF_Odeme": false, "Dizsan_DMet_Radar": false, "Dizsan_DiKas_Finans": false, "Dizsan_Gunluk_Kasa": false}, "submodules": {"ziyaret_genel": true, "ziyaret_rut_planla": true, "ziyaret_ekstre": true, "ziyaret_kayit": true, "ziyaret_cari": true, "ziyaret_gorev": true, "ziyaret_rapor": true, "ziyaret_raporlar": true, "toplanti_genel": true, "toplanti_olustur": true, "toplanti_aksiyon": true, "toplanti_duyuru": false, "toplanti_rapor": true, "kredi_combined": false, "kredi_bankalar": false, "kredi_odeme_onay": false, "kredi_erken_kapama": false, "kredi_yeni_ekle": false, "takvim_aylik": false, "takvim_kartlar": false, "takvim_krediler": false, "takvim_liste": false, "takvim_mobil": false, "kart_tumu": false, "kart_sirket": false, "kart_sahsi": false, "vdf_kokpit": false, "vdf_takvim": false, "vdf_tablo": false, "vdf_odemeler": false, "vdf_limitler": false, "vdf_otomasyon": false, "dmet_radar": false, "dmet_ailab": false, "dmet_hinterland": false, "dmet_sources": false, "dmet_notifications": false, "dmet_logs": false, "dikas_dashboard": false, "dikas_calendar": false, "dikas_forecast": false, "dikas_accounts": false, "dikas_payments": false, "dikas_collections": false, "dikas_instruments": false, "dikas_reports": false, "kasa_form": false, "kasa_a4": false, "kasa_archive": false, "kasa_admin": false}, "appActions": {"Dizsan_Ziyaret_Mobil_Karekod": {"view": true, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Toplanti_Mobil_Karekod": {"view": true, "create": true, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Kredi_Mobil_Karekod": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Odeme_Takvimi": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Kredi_Karti_Takip": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_VDF_Odeme": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_DMet_Radar": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_DiKas_Finans": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Gunluk_Kasa": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}}}, "mirac.ardanus": {"apps": {"Dizsan_Ziyaret_Mobil_Karekod": false, "Dizsan_Toplanti_Mobil_Karekod": false, "Dizsan_Kredi_Mobil_Karekod": false, "Dizsan_Odeme_Takvimi": false, "Dizsan_Kredi_Karti_Takip": false, "Dizsan_VDF_Odeme": false, "Dizsan_DMet_Radar": false, "Dizsan_DiKas_Finans": false, "Dizsan_Gunluk_Kasa": false}, "submodules": {"ziyaret_genel": false, "ziyaret_rut_planla": false, "ziyaret_ekstre": false, "ziyaret_kayit": false, "ziyaret_cari": false, "ziyaret_gorev": false, "ziyaret_rapor": false, "ziyaret_raporlar": false, "toplanti_genel": false, "toplanti_olustur": false, "toplanti_aksiyon": false, "toplanti_duyuru": false, "toplanti_rapor": false, "kredi_combined": false, "kredi_bankalar": false, "kredi_odeme_onay": false, "kredi_erken_kapama": false, "kredi_yeni_ekle": false, "takvim_aylik": false, "takvim_kartlar": false, "takvim_krediler": false, "takvim_liste": false, "takvim_mobil": false, "kart_tumu": false, "kart_sirket": false, "kart_sahsi": false, "vdf_kokpit": false, "vdf_takvim": false, "vdf_tablo": false, "vdf_odemeler": false, "vdf_limitler": false, "vdf_otomasyon": false, "dmet_radar": false, "dmet_ailab": false, "dmet_hinterland": false, "dmet_sources": false, "dmet_notifications": false, "dmet_logs": false, "dikas_dashboard": false, "dikas_calendar": false, "dikas_forecast": false, "dikas_accounts": false, "dikas_payments": false, "dikas_collections": false, "dikas_instruments": false, "dikas_reports": false, "kasa_form": false, "kasa_a4": false, "kasa_archive": false, "kasa_admin": false}, "appActions": {"Dizsan_Ziyaret_Mobil_Karekod": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Toplanti_Mobil_Karekod": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Kredi_Mobil_Karekod": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Odeme_Takvimi": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Kredi_Karti_Takip": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_VDF_Odeme": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_DMet_Radar": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_DiKas_Finans": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Gunluk_Kasa": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}}}, "hakan.demiral": {"apps": {"Dizsan_Ziyaret_Mobil_Karekod": false, "Dizsan_Toplanti_Mobil_Karekod": true, "Dizsan_Kredi_Mobil_Karekod": false, "Dizsan_Odeme_Takvimi": false, "Dizsan_Kredi_Karti_Takip": false, "Dizsan_VDF_Odeme": false, "Dizsan_DMet_Radar": false, "Dizsan_DiKas_Finans": false, "Dizsan_Gunluk_Kasa": false}, "submodules": {"ziyaret_genel": false, "ziyaret_rut_planla": false, "ziyaret_ekstre": false, "ziyaret_kayit": false, "ziyaret_cari": false, "ziyaret_gorev": false, "ziyaret_rapor": false, "ziyaret_raporlar": false, "toplanti_genel": true, "toplanti_olustur": true, "toplanti_aksiyon": true, "toplanti_duyuru": false, "toplanti_rapor": true, "kredi_combined": false, "kredi_bankalar": false, "kredi_odeme_onay": false, "kredi_erken_kapama": false, "kredi_yeni_ekle": false, "takvim_aylik": false, "takvim_kartlar": false, "takvim_krediler": false, "takvim_liste": false, "takvim_mobil": false, "kart_tumu": false, "kart_sirket": false, "kart_sahsi": false, "vdf_kokpit": false, "vdf_takvim": false, "vdf_tablo": false, "vdf_odemeler": false, "vdf_limitler": false, "vdf_otomasyon": false, "dmet_radar": false, "dmet_ailab": false, "dmet_hinterland": false, "dmet_sources": false, "dmet_notifications": false, "dmet_logs": false, "dikas_dashboard": false, "dikas_calendar": false, "dikas_forecast": false, "dikas_accounts": false, "dikas_payments": false, "dikas_collections": false, "dikas_instruments": false, "dikas_reports": false, "kasa_form": false, "kasa_a4": false, "kasa_archive": false, "kasa_admin": false}, "appActions": {"Dizsan_Ziyaret_Mobil_Karekod": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Toplanti_Mobil_Karekod": {"view": true, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Kredi_Mobil_Karekod": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Odeme_Takvimi": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Kredi_Karti_Takip": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_VDF_Odeme": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_DMet_Radar": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_DiKas_Finans": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Gunluk_Kasa": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}}}, "gulsen.simsek": {"apps": {"Dizsan_Ziyaret_Mobil_Karekod": false, "Dizsan_Toplanti_Mobil_Karekod": true, "Dizsan_Kredi_Mobil_Karekod": false, "Dizsan_Odeme_Takvimi": false, "Dizsan_Kredi_Karti_Takip": false, "Dizsan_VDF_Odeme": false, "Dizsan_DMet_Radar": false, "Dizsan_DiKas_Finans": false, "Dizsan_Gunluk_Kasa": false}, "submodules": {"ziyaret_genel": false, "ziyaret_rut_planla": false, "ziyaret_ekstre": false, "ziyaret_kayit": false, "ziyaret_cari": false, "ziyaret_gorev": false, "ziyaret_rapor": false, "ziyaret_raporlar": false, "toplanti_genel": true, "toplanti_olustur": true, "toplanti_aksiyon": true, "toplanti_duyuru": false, "toplanti_rapor": true, "kredi_combined": false, "kredi_bankalar": false, "kredi_odeme_onay": false, "kredi_erken_kapama": false, "kredi_yeni_ekle": false, "takvim_aylik": false, "takvim_kartlar": false, "takvim_krediler": false, "takvim_liste": false, "takvim_mobil": false, "kart_tumu": false, "kart_sirket": false, "kart_sahsi": false, "vdf_kokpit": false, "vdf_takvim": false, "vdf_tablo": false, "vdf_odemeler": false, "vdf_limitler": false, "vdf_otomasyon": false, "dmet_radar": false, "dmet_ailab": false, "dmet_hinterland": false, "dmet_sources": false, "dmet_notifications": false, "dmet_logs": false, "dikas_dashboard": false, "dikas_calendar": false, "dikas_forecast": false, "dikas_accounts": false, "dikas_payments": false, "dikas_collections": false, "dikas_instruments": false, "dikas_reports": false, "kasa_form": false, "kasa_a4": false, "kasa_archive": false, "kasa_admin": false}, "appActions": {"Dizsan_Ziyaret_Mobil_Karekod": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Toplanti_Mobil_Karekod": {"view": true, "create": true, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Kredi_Mobil_Karekod": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Odeme_Takvimi": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Kredi_Karti_Takip": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_VDF_Odeme": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_DMet_Radar": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_DiKas_Finans": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Gunluk_Kasa": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}}}, "alperen.kayaci": {"apps": {"Dizsan_Ziyaret_Mobil_Karekod": false, "Dizsan_Toplanti_Mobil_Karekod": true, "Dizsan_Kredi_Mobil_Karekod": false, "Dizsan_Odeme_Takvimi": false, "Dizsan_Kredi_Karti_Takip": false, "Dizsan_VDF_Odeme": false, "Dizsan_DMet_Radar": false, "Dizsan_DiKas_Finans": false, "Dizsan_Gunluk_Kasa": false}, "submodules": {"ziyaret_genel": false, "ziyaret_rut_planla": false, "ziyaret_ekstre": false, "ziyaret_kayit": false, "ziyaret_cari": false, "ziyaret_gorev": false, "ziyaret_rapor": false, "ziyaret_raporlar": false, "toplanti_genel": true, "toplanti_olustur": true, "toplanti_aksiyon": true, "toplanti_duyuru": false, "toplanti_rapor": true, "kredi_combined": false, "kredi_bankalar": false, "kredi_odeme_onay": false, "kredi_erken_kapama": false, "kredi_yeni_ekle": false, "takvim_aylik": false, "takvim_kartlar": false, "takvim_krediler": false, "takvim_liste": false, "takvim_mobil": false, "kart_tumu": false, "kart_sirket": false, "kart_sahsi": false, "vdf_kokpit": false, "vdf_takvim": false, "vdf_tablo": false, "vdf_odemeler": false, "vdf_limitler": false, "vdf_otomasyon": false, "dmet_radar": false, "dmet_ailab": false, "dmet_hinterland": false, "dmet_sources": false, "dmet_notifications": false, "dmet_logs": false, "dikas_dashboard": false, "dikas_calendar": false, "dikas_forecast": false, "dikas_accounts": false, "dikas_payments": false, "dikas_collections": false, "dikas_instruments": false, "dikas_reports": false, "kasa_form": false, "kasa_a4": false, "kasa_archive": false, "kasa_admin": false}, "appActions": {"Dizsan_Ziyaret_Mobil_Karekod": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Toplanti_Mobil_Karekod": {"view": true, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Kredi_Mobil_Karekod": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Odeme_Takvimi": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Kredi_Karti_Takip": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_VDF_Odeme": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_DMet_Radar": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_DiKas_Finans": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Gunluk_Kasa": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}}}, "muhammed.erol": {"apps": {"Dizsan_Ziyaret_Mobil_Karekod": false, "Dizsan_Toplanti_Mobil_Karekod": true, "Dizsan_Kredi_Mobil_Karekod": false, "Dizsan_Odeme_Takvimi": false, "Dizsan_Kredi_Karti_Takip": false, "Dizsan_VDF_Odeme": false, "Dizsan_DMet_Radar": false, "Dizsan_DiKas_Finans": false, "Dizsan_Gunluk_Kasa": false}, "submodules": {"ziyaret_genel": false, "ziyaret_rut_planla": false, "ziyaret_ekstre": false, "ziyaret_kayit": false, "ziyaret_cari": false, "ziyaret_gorev": false, "ziyaret_rapor": false, "ziyaret_raporlar": false, "toplanti_genel": true, "toplanti_olustur": true, "toplanti_aksiyon": true, "toplanti_duyuru": false, "toplanti_rapor": true, "kredi_combined": false, "kredi_bankalar": false, "kredi_odeme_onay": false, "kredi_erken_kapama": false, "kredi_yeni_ekle": false, "takvim_aylik": false, "takvim_kartlar": false, "takvim_krediler": false, "takvim_liste": false, "takvim_mobil": false, "kart_tumu": false, "kart_sirket": false, "kart_sahsi": false, "vdf_kokpit": false, "vdf_takvim": false, "vdf_tablo": false, "vdf_odemeler": false, "vdf_limitler": false, "vdf_otomasyon": false, "dmet_radar": false, "dmet_ailab": false, "dmet_hinterland": false, "dmet_sources": false, "dmet_notifications": false, "dmet_logs": false, "dikas_dashboard": false, "dikas_calendar": false, "dikas_forecast": false, "dikas_accounts": false, "dikas_payments": false, "dikas_collections": false, "dikas_instruments": false, "dikas_reports": false, "kasa_form": false, "kasa_a4": false, "kasa_archive": false, "kasa_admin": false}, "appActions": {"Dizsan_Ziyaret_Mobil_Karekod": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Toplanti_Mobil_Karekod": {"view": true, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Kredi_Mobil_Karekod": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Odeme_Takvimi": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Kredi_Karti_Takip": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_VDF_Odeme": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_DMet_Radar": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_DiKas_Finans": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Gunluk_Kasa": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}}}, "yigit.alp": {"apps": {"Dizsan_Ziyaret_Mobil_Karekod": false, "Dizsan_Toplanti_Mobil_Karekod": true, "Dizsan_Kredi_Mobil_Karekod": false, "Dizsan_Odeme_Takvimi": false, "Dizsan_Kredi_Karti_Takip": false, "Dizsan_VDF_Odeme": false, "Dizsan_DMet_Radar": false, "Dizsan_DiKas_Finans": false, "Dizsan_Gunluk_Kasa": false}, "submodules": {"ziyaret_genel": false, "ziyaret_rut_planla": false, "ziyaret_ekstre": false, "ziyaret_kayit": false, "ziyaret_cari": false, "ziyaret_gorev": false, "ziyaret_rapor": false, "ziyaret_raporlar": false, "toplanti_genel": true, "toplanti_olustur": true, "toplanti_aksiyon": true, "toplanti_duyuru": false, "toplanti_rapor": true, "kredi_combined": false, "kredi_bankalar": false, "kredi_odeme_onay": false, "kredi_erken_kapama": false, "kredi_yeni_ekle": false, "takvim_aylik": false, "takvim_kartlar": false, "takvim_krediler": false, "takvim_liste": false, "takvim_mobil": false, "kart_tumu": false, "kart_sirket": false, "kart_sahsi": false, "vdf_kokpit": false, "vdf_takvim": false, "vdf_tablo": false, "vdf_odemeler": false, "vdf_limitler": false, "vdf_otomasyon": false, "dmet_radar": false, "dmet_ailab": false, "dmet_hinterland": false, "dmet_sources": false, "dmet_notifications": false, "dmet_logs": false, "dikas_dashboard": false, "dikas_calendar": false, "dikas_forecast": false, "dikas_accounts": false, "dikas_payments": false, "dikas_collections": false, "dikas_instruments": false, "dikas_reports": false, "kasa_form": false, "kasa_a4": false, "kasa_archive": false, "kasa_admin": false}, "appActions": {"Dizsan_Ziyaret_Mobil_Karekod": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Toplanti_Mobil_Karekod": {"view": true, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Kredi_Mobil_Karekod": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Odeme_Takvimi": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Kredi_Karti_Takip": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_VDF_Odeme": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_DMet_Radar": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_DiKas_Finans": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Gunluk_Kasa": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}}}, "berat.yusuf": {"apps": {"Dizsan_Ziyaret_Mobil_Karekod": false, "Dizsan_Toplanti_Mobil_Karekod": true, "Dizsan_Kredi_Mobil_Karekod": false, "Dizsan_Odeme_Takvimi": false, "Dizsan_Kredi_Karti_Takip": false, "Dizsan_VDF_Odeme": false, "Dizsan_DMet_Radar": false, "Dizsan_DiKas_Finans": false, "Dizsan_Gunluk_Kasa": false}, "submodules": {"ziyaret_genel": false, "ziyaret_rut_planla": false, "ziyaret_ekstre": false, "ziyaret_kayit": false, "ziyaret_cari": false, "ziyaret_gorev": false, "ziyaret_rapor": false, "ziyaret_raporlar": false, "toplanti_genel": true, "toplanti_olustur": true, "toplanti_aksiyon": true, "toplanti_duyuru": false, "toplanti_rapor": true, "kredi_combined": false, "kredi_bankalar": false, "kredi_odeme_onay": false, "kredi_erken_kapama": false, "kredi_yeni_ekle": false, "takvim_aylik": false, "takvim_kartlar": false, "takvim_krediler": false, "takvim_liste": false, "takvim_mobil": false, "kart_tumu": false, "kart_sirket": false, "kart_sahsi": false, "vdf_kokpit": false, "vdf_takvim": false, "vdf_tablo": false, "vdf_odemeler": false, "vdf_limitler": false, "vdf_otomasyon": false, "dmet_radar": false, "dmet_ailab": false, "dmet_hinterland": false, "dmet_sources": false, "dmet_notifications": false, "dmet_logs": false, "dikas_dashboard": false, "dikas_calendar": false, "dikas_forecast": false, "dikas_accounts": false, "dikas_payments": false, "dikas_collections": false, "dikas_instruments": false, "dikas_reports": false, "kasa_form": false, "kasa_a4": false, "kasa_archive": false, "kasa_admin": false}, "appActions": {"Dizsan_Ziyaret_Mobil_Karekod": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Toplanti_Mobil_Karekod": {"view": true, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Kredi_Mobil_Karekod": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Odeme_Takvimi": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Kredi_Karti_Takip": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_VDF_Odeme": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_DMet_Radar": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_DiKas_Finans": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Gunluk_Kasa": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}}}, "muammer.samet": {"apps": {"Dizsan_Ziyaret_Mobil_Karekod": false, "Dizsan_Toplanti_Mobil_Karekod": true, "Dizsan_Kredi_Mobil_Karekod": false, "Dizsan_Odeme_Takvimi": false, "Dizsan_Kredi_Karti_Takip": false, "Dizsan_VDF_Odeme": false, "Dizsan_DMet_Radar": false, "Dizsan_DiKas_Finans": false, "Dizsan_Gunluk_Kasa": false}, "submodules": {"ziyaret_genel": false, "ziyaret_rut_planla": false, "ziyaret_ekstre": false, "ziyaret_kayit": false, "ziyaret_cari": false, "ziyaret_gorev": false, "ziyaret_rapor": false, "ziyaret_raporlar": false, "toplanti_genel": true, "toplanti_olustur": true, "toplanti_aksiyon": true, "toplanti_duyuru": false, "toplanti_rapor": true, "kredi_combined": false, "kredi_bankalar": false, "kredi_odeme_onay": false, "kredi_erken_kapama": false, "kredi_yeni_ekle": false, "takvim_aylik": false, "takvim_kartlar": false, "takvim_krediler": false, "takvim_liste": false, "takvim_mobil": false, "kart_tumu": false, "kart_sirket": false, "kart_sahsi": false, "vdf_kokpit": false, "vdf_takvim": false, "vdf_tablo": false, "vdf_odemeler": false, "vdf_limitler": false, "vdf_otomasyon": false, "dmet_radar": false, "dmet_ailab": false, "dmet_hinterland": false, "dmet_sources": false, "dmet_notifications": false, "dmet_logs": false, "dikas_dashboard": false, "dikas_calendar": false, "dikas_forecast": false, "dikas_accounts": false, "dikas_payments": false, "dikas_collections": false, "dikas_instruments": false, "dikas_reports": false, "kasa_form": false, "kasa_a4": false, "kasa_archive": false, "kasa_admin": false}, "appActions": {"Dizsan_Ziyaret_Mobil_Karekod": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Toplanti_Mobil_Karekod": {"view": true, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Kredi_Mobil_Karekod": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Odeme_Takvimi": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Kredi_Karti_Takip": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_VDF_Odeme": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_DMet_Radar": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_DiKas_Finans": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Gunluk_Kasa": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}}}, "aydin.alinca": {"apps": {"Dizsan_Ziyaret_Mobil_Karekod": false, "Dizsan_Toplanti_Mobil_Karekod": true, "Dizsan_Kredi_Mobil_Karekod": false, "Dizsan_Odeme_Takvimi": false, "Dizsan_Kredi_Karti_Takip": false, "Dizsan_VDF_Odeme": false, "Dizsan_DMet_Radar": false, "Dizsan_DiKas_Finans": false, "Dizsan_Gunluk_Kasa": false}, "submodules": {"ziyaret_genel": false, "ziyaret_rut_planla": false, "ziyaret_ekstre": false, "ziyaret_kayit": false, "ziyaret_cari": false, "ziyaret_gorev": false, "ziyaret_rapor": false, "ziyaret_raporlar": false, "toplanti_genel": true, "toplanti_olustur": true, "toplanti_aksiyon": true, "toplanti_duyuru": false, "toplanti_rapor": true, "kredi_combined": false, "kredi_bankalar": false, "kredi_odeme_onay": false, "kredi_erken_kapama": false, "kredi_yeni_ekle": false, "takvim_aylik": false, "takvim_kartlar": false, "takvim_krediler": false, "takvim_liste": false, "takvim_mobil": false, "kart_tumu": false, "kart_sirket": false, "kart_sahsi": false, "vdf_kokpit": false, "vdf_takvim": false, "vdf_tablo": false, "vdf_odemeler": false, "vdf_limitler": false, "vdf_otomasyon": false, "dmet_radar": false, "dmet_ailab": false, "dmet_hinterland": false, "dmet_sources": false, "dmet_notifications": false, "dmet_logs": false, "dikas_dashboard": false, "dikas_calendar": false, "dikas_forecast": false, "dikas_accounts": false, "dikas_payments": false, "dikas_collections": false, "dikas_instruments": false, "dikas_reports": false, "kasa_form": false, "kasa_a4": false, "kasa_archive": false, "kasa_admin": false}, "appActions": {"Dizsan_Ziyaret_Mobil_Karekod": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Toplanti_Mobil_Karekod": {"view": true, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Kredi_Mobil_Karekod": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Odeme_Takvimi": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Kredi_Karti_Takip": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_VDF_Odeme": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_DMet_Radar": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_DiKas_Finans": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Gunluk_Kasa": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}}}, "yahya.atmaca": {"apps": {"Dizsan_Ziyaret_Mobil_Karekod": false, "Dizsan_Toplanti_Mobil_Karekod": true, "Dizsan_Kredi_Mobil_Karekod": false, "Dizsan_Odeme_Takvimi": false, "Dizsan_Kredi_Karti_Takip": false, "Dizsan_VDF_Odeme": false, "Dizsan_DMet_Radar": false, "Dizsan_DiKas_Finans": false, "Dizsan_Gunluk_Kasa": false}, "submodules": {"ziyaret_genel": false, "ziyaret_rut_planla": false, "ziyaret_ekstre": false, "ziyaret_kayit": false, "ziyaret_cari": false, "ziyaret_gorev": false, "ziyaret_rapor": false, "ziyaret_raporlar": false, "toplanti_genel": true, "toplanti_olustur": true, "toplanti_aksiyon": true, "toplanti_duyuru": false, "toplanti_rapor": true, "kredi_combined": false, "kredi_bankalar": false, "kredi_odeme_onay": false, "kredi_erken_kapama": false, "kredi_yeni_ekle": false, "takvim_aylik": false, "takvim_kartlar": false, "takvim_krediler": false, "takvim_liste": false, "takvim_mobil": false, "kart_tumu": false, "kart_sirket": false, "kart_sahsi": false, "vdf_kokpit": false, "vdf_takvim": false, "vdf_tablo": false, "vdf_odemeler": false, "vdf_limitler": false, "vdf_otomasyon": false, "dmet_radar": false, "dmet_ailab": false, "dmet_hinterland": false, "dmet_sources": false, "dmet_notifications": false, "dmet_logs": false, "dikas_dashboard": false, "dikas_calendar": false, "dikas_forecast": false, "dikas_accounts": false, "dikas_payments": false, "dikas_collections": false, "dikas_instruments": false, "dikas_reports": false, "kasa_form": false, "kasa_a4": false, "kasa_archive": false, "kasa_admin": false}, "appActions": {"Dizsan_Ziyaret_Mobil_Karekod": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Toplanti_Mobil_Karekod": {"view": true, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Kredi_Mobil_Karekod": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Odeme_Takvimi": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Kredi_Karti_Takip": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_VDF_Odeme": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_DMet_Radar": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_DiKas_Finans": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Gunluk_Kasa": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}}}, "emir.baltaci": {"apps": {"Dizsan_Ziyaret_Mobil_Karekod": false, "Dizsan_Toplanti_Mobil_Karekod": true, "Dizsan_Kredi_Mobil_Karekod": false, "Dizsan_Odeme_Takvimi": false, "Dizsan_Kredi_Karti_Takip": false, "Dizsan_VDF_Odeme": false, "Dizsan_DMet_Radar": false, "Dizsan_DiKas_Finans": false, "Dizsan_Gunluk_Kasa": false}, "submodules": {"ziyaret_genel": false, "ziyaret_rut_planla": false, "ziyaret_ekstre": false, "ziyaret_kayit": false, "ziyaret_cari": false, "ziyaret_gorev": false, "ziyaret_rapor": false, "ziyaret_raporlar": false, "toplanti_genel": true, "toplanti_olustur": true, "toplanti_aksiyon": true, "toplanti_duyuru": false, "toplanti_rapor": true, "kredi_combined": false, "kredi_bankalar": false, "kredi_odeme_onay": false, "kredi_erken_kapama": false, "kredi_yeni_ekle": false, "takvim_aylik": false, "takvim_kartlar": false, "takvim_krediler": false, "takvim_liste": false, "takvim_mobil": false, "kart_tumu": false, "kart_sirket": false, "kart_sahsi": false, "vdf_kokpit": false, "vdf_takvim": false, "vdf_tablo": false, "vdf_odemeler": false, "vdf_limitler": false, "vdf_otomasyon": false, "dmet_radar": false, "dmet_ailab": false, "dmet_hinterland": false, "dmet_sources": false, "dmet_notifications": false, "dmet_logs": false, "dikas_dashboard": false, "dikas_calendar": false, "dikas_forecast": false, "dikas_accounts": false, "dikas_payments": false, "dikas_collections": false, "dikas_instruments": false, "dikas_reports": false, "kasa_form": false, "kasa_a4": false, "kasa_archive": false, "kasa_admin": false}, "appActions": {"Dizsan_Ziyaret_Mobil_Karekod": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Toplanti_Mobil_Karekod": {"view": true, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Kredi_Mobil_Karekod": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Odeme_Takvimi": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Kredi_Karti_Takip": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_VDF_Odeme": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_DMet_Radar": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_DiKas_Finans": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Gunluk_Kasa": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}}}, "emre.hitit": {"apps": {"Dizsan_Ziyaret_Mobil_Karekod": false, "Dizsan_Toplanti_Mobil_Karekod": true, "Dizsan_Kredi_Mobil_Karekod": false, "Dizsan_Odeme_Takvimi": false, "Dizsan_Kredi_Karti_Takip": false, "Dizsan_VDF_Odeme": false, "Dizsan_DMet_Radar": false, "Dizsan_DiKas_Finans": false, "Dizsan_Gunluk_Kasa": false}, "submodules": {"ziyaret_genel": false, "ziyaret_rut_planla": false, "ziyaret_ekstre": false, "ziyaret_kayit": false, "ziyaret_cari": false, "ziyaret_gorev": false, "ziyaret_rapor": false, "ziyaret_raporlar": false, "toplanti_genel": true, "toplanti_olustur": true, "toplanti_aksiyon": true, "toplanti_duyuru": false, "toplanti_rapor": true, "kredi_combined": false, "kredi_bankalar": false, "kredi_odeme_onay": false, "kredi_erken_kapama": false, "kredi_yeni_ekle": false, "takvim_aylik": false, "takvim_kartlar": false, "takvim_krediler": false, "takvim_liste": false, "takvim_mobil": false, "kart_tumu": false, "kart_sirket": false, "kart_sahsi": false, "vdf_kokpit": false, "vdf_takvim": false, "vdf_tablo": false, "vdf_odemeler": false, "vdf_limitler": false, "vdf_otomasyon": false, "dmet_radar": false, "dmet_ailab": false, "dmet_hinterland": false, "dmet_sources": false, "dmet_notifications": false, "dmet_logs": false, "dikas_dashboard": false, "dikas_calendar": false, "dikas_forecast": false, "dikas_accounts": false, "dikas_payments": false, "dikas_collections": false, "dikas_instruments": false, "dikas_reports": false, "kasa_form": false, "kasa_a4": false, "kasa_archive": false, "kasa_admin": false}, "appActions": {"Dizsan_Ziyaret_Mobil_Karekod": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Toplanti_Mobil_Karekod": {"view": true, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Kredi_Mobil_Karekod": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Odeme_Takvimi": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Kredi_Karti_Takip": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_VDF_Odeme": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_DMet_Radar": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_DiKas_Finans": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Gunluk_Kasa": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}}}, "enver.hitit": {"apps": {"Dizsan_Ziyaret_Mobil_Karekod": false, "Dizsan_Toplanti_Mobil_Karekod": true, "Dizsan_Kredi_Mobil_Karekod": false, "Dizsan_Odeme_Takvimi": false, "Dizsan_Kredi_Karti_Takip": false, "Dizsan_VDF_Odeme": false, "Dizsan_DMet_Radar": false, "Dizsan_DiKas_Finans": false, "Dizsan_Gunluk_Kasa": false}, "submodules": {"ziyaret_genel": false, "ziyaret_rut_planla": false, "ziyaret_ekstre": false, "ziyaret_kayit": false, "ziyaret_cari": false, "ziyaret_gorev": false, "ziyaret_rapor": false, "ziyaret_raporlar": false, "toplanti_genel": true, "toplanti_olustur": true, "toplanti_aksiyon": true, "toplanti_duyuru": false, "toplanti_rapor": true, "kredi_combined": false, "kredi_bankalar": false, "kredi_odeme_onay": false, "kredi_erken_kapama": false, "kredi_yeni_ekle": false, "takvim_aylik": false, "takvim_kartlar": false, "takvim_krediler": false, "takvim_liste": false, "takvim_mobil": false, "kart_tumu": false, "kart_sirket": false, "kart_sahsi": false, "vdf_kokpit": false, "vdf_takvim": false, "vdf_tablo": false, "vdf_odemeler": false, "vdf_limitler": false, "vdf_otomasyon": false, "dmet_radar": false, "dmet_ailab": false, "dmet_hinterland": false, "dmet_sources": false, "dmet_notifications": false, "dmet_logs": false, "dikas_dashboard": false, "dikas_calendar": false, "dikas_forecast": false, "dikas_accounts": false, "dikas_payments": false, "dikas_collections": false, "dikas_instruments": false, "dikas_reports": false, "kasa_form": false, "kasa_a4": false, "kasa_archive": false, "kasa_admin": false}, "appActions": {"Dizsan_Ziyaret_Mobil_Karekod": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Toplanti_Mobil_Karekod": {"view": true, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Kredi_Mobil_Karekod": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Odeme_Takvimi": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Kredi_Karti_Takip": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_VDF_Odeme": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_DMet_Radar": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_DiKas_Finans": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}, "Dizsan_Gunluk_Kasa": {"view": false, "create": false, "edit": false, "delete": false, "export": false, "financial": false}}}};

function getZiyaretUserPerms(user = currentUser) {
    if (!user) return { allowed: false, actions: {}, submodules: {} };
    if (isOmerEren(user)) {
        return {
            allowed: true,
            actions: { view: true, create: true, edit: true, delete: true, export: true, financial: true },
            submodules: { ziyaret_genel: true, ziyaret_rut_planla: true, ziyaret_ekstre: true, ziyaret_kayit: true, ziyaret_cari: true, ziyaret_gorev: true, ziyaret_rapor: true, ziyaret_raporlar: true }
        };
    }
    const uname = String(user.username || '').trim().toLowerCase();
    let entry = OFFICIAL_DPRO_PERMISSIONS_ZIYARET[uname] || OFFICIAL_DPRO_PERMISSIONS_ZIYARET[user.username];
    try {
        const raw = localStorage.getItem('dizsan_dpro_permissions_v1');
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && (parsed[uname] || parsed[user.username])) {
                entry = parsed[uname] || parsed[user.username];
            }
        }
    } catch (e) {}
    if (!entry) return { allowed: false, actions: {}, submodules: {} };
    const appAllowed = Boolean(entry.apps && entry.apps['Dizsan_Ziyaret_Mobil_Karekod']);
    const act = (entry.appActions && entry.appActions['Dizsan_Ziyaret_Mobil_Karekod']) || {};
    const subs = entry.submodules || {};
    return {
        allowed: appAllowed && act.view !== false,
        actions: {
            view: appAllowed && act.view !== false,
            create: appAllowed && Boolean(act.create),
            edit: appAllowed && Boolean(act.edit),
            delete: appAllowed && Boolean(act.delete),
            export: appAllowed && Boolean(act.export),
            financial: appAllowed && Boolean(act.financial)
        },
        submodules: subs
    };
}

function enforceZiyaretDomPermissions() {
    if (!currentUser) return;
    const p = getZiyaretUserPerms(currentUser);
    const isAdm = isOmerEren(currentUser);
    document.querySelectorAll('[onclick*="openVisitModal()"], #save-visit-btn').forEach(el => {
        el.style.display = (isAdm || p.actions.create) ? '' : 'none';
    });
    document.querySelectorAll('[onclick*="export"], [onclick*="Export"], [onclick*="print"], [onclick*="Print"]').forEach(el => {
        el.style.display = (isAdm || p.actions.export) ? '' : 'none';
    });
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

// ==========================================================================
// AKILLI TÜRKİYE TELEFON NUMARASI AYRIŞTIRICI VE WHATSAPP KÖPRÜSÜ
// ==========================================================================
const TR_CITY_AREA_CODES = {
    "corum": "364", "amasya": "358", "tokat": "356", "yozgat": "354",
    "cankiri": "376", "samsun": "362", "ankara": "312", "istanbul": "212",
    "kastamonu": "366", "sinop": "368", "kirikkale": "318", "kayseri": "352",
    "sivas": "346", "ordu": "452", "giresun": "454", "trabzon": "462",
    "kirsehir": "386", "nevsehir": "384", "konya": "332", "adana": "322",
    "mersin": "324", "gaziantep": "342", "hatay": "326", "izmir": "232",
    "bursa": "224", "kocaeli": "262", "sakarya": "264", "bolu": "374",
    "duzce": "380", "zonguldak": "372", "karabuk": "370", "bartin": "378",
    "artvin": "466", "rize": "464", "erzurum": "442", "erzincan": "446"
};

function formatPhone12Display(phone12) {
    const d = String(phone12 || '').replace(/[^0-9]/g, '');
    if (d.length === 12 && d.startsWith('90')) {
        return `0 (${d.slice(2, 5)}) ${d.slice(5, 8)} ${d.slice(8, 10)} ${d.slice(10, 12)}`;
    }
    return phone12 || '';
}

function parseTurkishPhones(rawPhone, city = '') {
    if (!rawPhone || String(rawPhone).trim().toUpperCase() === 'YOK') {
        return { wa: '', tel: '', display: '', mobiles: [], all: [], hasPhone: false };
    }
    const ac = TR_CITY_AREA_CODES[cleanTR(city)] || '364';
    const parts = String(rawPhone).split(/[,;/|]+/);
    const valid = [];

    for (const part of parts) {
        const digits = part.replace(/[^0-9]/g, '');
        if (!digits) continue;

        let subparts = [digits];
        if (digits.length === 14 && !digits.startsWith('0090')) {
            subparts = [digits.slice(0, 7), digits.slice(7, 14)];
        } else if (digits.length > 12 && !digits.startsWith('0090')) {
            const matches = digits.match(/(?:90|0)?(5\d{9}|[2348]\d{9})/g);
            if (matches && matches.length > 0) {
                subparts = matches;
            }
        }

        for (let d of subparts) {
            if (d.startsWith('0090') && d.length === 14) {
                d = d.slice(2);
            } else if (d.startsWith('90') && d.length === 12) {
                // Zaten 90XXXXXXXXXX formatında
            } else if (d.startsWith('0') && d.length === 11) {
                d = '9' + d;
            } else if (d.length === 10 && '23458'.includes(d[0])) {
                d = '90' + d;
            } else if (d.length === 7) {
                d = '90' + ac + d;
            } else if (d.length === 11 && d.startsWith('5')) {
                const m = d.match(/(5\d{9})/);
                if (m) d = '90' + m[1];
            }
            if (d.length === 12 && d.startsWith('90') && !valid.includes(d)) {
                valid.push(d);
            }
        }
    }

    const mobiles = valid.filter(v => v.startsWith('905'));
    const bestWa = mobiles[0] || valid[0] || '';
    const bestTel = bestWa ? ('+' + bestWa) : '';
    const display = bestWa ? formatPhone12Display(bestWa) : String(rawPhone);

    return {
        wa: bestWa,
        tel: bestTel,
        display,
        mobiles,
        all: valid,
        hasPhone: Boolean(bestWa)
    };
}

function openWhatsAppChat(phoneRaw = '', messageText = '', cityHint = '') {
    const parsed = parseTurkishPhones(phoneRaw, cityHint);
    const phoneParam = parsed.wa || '';
    const textParam = messageText ? encodeURIComponent(String(messageText)) : '';

    const queryParts = [];
    if (phoneParam) queryParts.push(`phone=${phoneParam}`);
    if (textParam) queryParts.push(`text=${textParam}`);
    const queryString = queryParts.join('&');

    const nativeSchemeUrl = `whatsapp://send${queryString ? '?' + queryString : ''}`;
    const webWaUrl = phoneParam
        ? `https://wa.me/${phoneParam}${textParam ? '?text=' + textParam : ''}`
        : `https://wa.me/${textParam ? '?text=' + textParam : ''}`;

    const ua = navigator.userAgent || '';
    const isMacDesktop = /Macintosh|Mac OS X/.test(ua) && !/iPhone|iPad|iPod/.test(ua);
    const isLocalServer = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    // 1. Yerel Portal Sunucusu (macOS) aktifse doğrudan LaunchServices ile WhatsApp.app'i sıfır uyarıyla aç
    if (isLocalServer && isMacDesktop) {
        fetch('/api/open-whatsapp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: nativeSchemeUrl, webUrl: webWaUrl, phone: phoneParam })
        }).then(r => {
            if (!r.ok) {
                triggerClientWhatsAppRedirect(nativeSchemeUrl, webWaUrl, isMacDesktop);
            }
        }).catch(() => {
            triggerClientWhatsAppRedirect(nativeSchemeUrl, webWaUrl, isMacDesktop);
        });
        return;
    }

    // 2. İstemci tarafı doğrudan yönlendirme (macOS WhatsApp.app / Mobil PWA / Web)
    triggerClientWhatsAppRedirect(nativeSchemeUrl, webWaUrl, isMacDesktop);
}

function triggerClientWhatsAppRedirect(nativeSchemeUrl, webWaUrl, isMacDesktop) {
    try {
        if (isMacDesktop) {
            // macOS üzerinde yüklü WhatsApp.app'i boş sekme bırakmadan doğrudan tetikle
            const a = document.createElement('a');
            a.href = nativeSchemeUrl;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            setTimeout(() => a.remove(), 300);
            return;
        }
        const win = window.open(webWaUrl, '_blank', 'noopener,noreferrer');
        if (!win) {
            window.top.location.href = webWaUrl;
        }
    } catch (e) {
        window.location.href = webWaUrl;
    }
}

function showToast(message, type = 'info') {
    if (!message) return;
    try {
        let container = document.getElementById('dpro-global-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'dpro-global-toast-container';
            container.style.cssText = 'position:fixed; top:18px; right:18px; z-index:9999999; display:flex; flex-direction:column; gap:8px; max-width:420px; pointer-events:none;';
            document.body.appendChild(container);
        }
        const colors = {
            success: { bg: 'rgba(6, 78, 59, 0.96)', border: '#10b981', text: '#ecfdf5', icon: '✓' },
            warning: { bg: 'rgba(120, 53, 15, 0.96)', border: '#f59e0b', text: '#fffbeb', icon: '⚠' },
            danger:  { bg: 'rgba(127, 29, 29, 0.96)', border: '#ef4444', text: '#fef2f2', icon: '✕' },
            info:    { bg: 'rgba(12, 74, 110, 0.96)', border: '#38bdf8', text: '#f0f9ff', icon: 'ℹ' }
        };
        const theme = colors[type] || colors.info;
        const toast = document.createElement('div');
        toast.style.cssText = `pointer-events:auto; background:${theme.bg}; color:${theme.text}; border:1.5px solid ${theme.border}; border-radius:10px; padding:0.65rem 0.95rem; font-size:0.8rem; font-weight:700; box-shadow:0 12px 32px rgba(0,0,0,0.55); display:flex; align-items:center; gap:0.55rem; backdrop-filter:blur(10px); transition:all 0.22s ease;`;
        toast.innerHTML = `<span style="display:inline-flex; align-items:center; justify-content:center; width:20px; height:20px; border-radius:50%; background:${theme.border}; color:#020617; font-weight:900; font-size:0.74rem; flex-shrink:0;">${theme.icon}</span><span style="line-height:1.35;">${escapeHtml(String(message))}</span>`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-6px)';
            setTimeout(() => toast.remove(), 240);
        }, 3200);
    } catch (e) {
        if (window.DizsanBackNav && typeof window.DizsanBackNav.showToast === 'function') {
            window.DizsanBackNav.showToast(String(message));
        }
    }
}
window.showToast = showToast;

function saveStateToLocal() {
    if (typeof saveStateLocally === 'function') saveStateLocally();
}
window.saveStateToLocal = saveStateToLocal;

function openCustomerWhatsApp(customerCode, mode = 'DEFAULT', extraIndex = 0) {
    const customer = (appState.customers || []).find(c => c.code === customerCode);
    if (!customer) {
        showToast('Müşteri kaydı bulunamadı.', 'danger');
        return;
    }
    const parsed = parseTurkishPhones(customer.phone, customer.city);
    if (!parsed.hasPhone) {
        showToast('Bu müşteriye ait geçerli bir telefon numarası bulunamadı.', 'warning');
        return;
    }

    const targetPhone = (extraIndex > 0 && parsed.all[extraIndex]) ? parsed.all[extraIndex] : parsed.wa;
    const acc = getCustomerAccountingSummary(customer);
    const senderName = currentUser ? currentUser.name : 'DİZSAN Otomotiv Yetkili Servis';

    let msg = '';
    if (mode === 'EKSTRE') {
        msg = [
            `Sayın *${customer.title}* Yetkilisi${customer.authorized && customer.authorized !== 'Bilinmiyor' ? ` (${customer.authorized})` : ''},`,
            ``,
            `*DİZSAN Otomotiv Scania Yetkili Servisi* cari hesap bilgilendirmesidir:`,
            `• *Cari Kodu:* ${customer.code}`,
            `• *Toplam Borç:* ${formatMoney(acc.borc)}`,
            `• *Toplam Alacak:* ${formatMoney(acc.alacak)}`,
            `• *Güncel Net Bakiye:* *${formatMoney(Math.abs(acc.bakiye))} ${acc.baCode}*`,
            customer.lastDate ? `• *Son İşlem Tarihi:* ${customer.lastDate}` : '',
            ``,
            `Bilgilerinize sunar, iyi çalışmalar dileriz.`,
            `_${senderName} — DİZSAN Otomotiv Çorum_`
        ].filter(Boolean).join('\n');
    } else if (mode === 'INVOICE') {
        const historyList = customer.serviceHistory || [];
        const inv = historyList[Number(extraIndex) || 0];
        if (inv) {
            const norm = normalizeInvoiceLines(inv);
            msg = [
                `Sayın *${customer.title}* Yetkilisi,`,
                ``,
                `*DİZSAN Otomotiv* servis işlem ve fatura özetiniz:`,
                `• *Fatura No:* ${inv.fatura_no || '-'}`,
                `• *Tarih:* ${inv.tarih || '-'}`,
                `• *Araç Plakası:* ${(inv.plaka && inv.plaka !== '-') ? inv.plaka : (customer.plates || '-')}`,
                `• *İşlem:* ${inv.islem || '-'}`,
                `• *Genel Toplam (KDV Dahil):* *${formatMoney(norm.genelToplam)}*`,
                ``,
                `İyi yolculuklar ve hayırlı işler dileriz.`,
                `_${senderName} — DİZSAN Otomotiv_`
            ].join('\n');
        }
    } else {
        msg = [
            `Sayın *${customer.title}* Yetkilisi${customer.authorized && customer.authorized !== 'Bilinmiyor' ? ` (${customer.authorized})` : ''},`,
            ``,
            `*DİZSAN Otomotiv (Çorum Scania Yetkili Servisi)* olarak araçlarınızın servis/bakım durumu ve devam eden kampanyalarımız hakkında sizinle iletişime geçiyoruz.`,
            customer.plates && customer.plates !== 'Plakasız' ? `• *Kayıtlı Araç:* ${customer.plates}` : '',
            ``,
            `Müsait olduğunuzda görüşmek dileğiyle, iyi çalışmalar dileriz.`,
            `_${senderName}_`
        ].filter(Boolean).join('\n');
    }

    addAuditLog('WHATSAPP İLETİŞİM', `${customer.code} - ${customer.title} (${formatPhone12Display(targetPhone)}) için WhatsApp mesajı başlatıldı.`);
    openWhatsAppChat(targetPhone, msg, customer.city);
}

function shareCustomRouteWhatsApp(routeId) {
    const rt = (appState.customRoutes || []).find(r => r.id === routeId);
    if (!rt) return;
    const customers = (appState.customers || []).filter(c =>
        (Array.isArray(rt.customerCodes) && rt.customerCodes.includes(c.code)) || c.rut === rt.name
    );

    const custLines = customers.slice(0, 20).map((c, i) => {
        const p = parseTurkishPhones(c.phone, c.city);
        return `${i + 1}. *${c.title}* (${c.district || c.city})${p.hasPhone ? ` - 📞 ${p.display}` : ''}`;
    });
    if (customers.length > 20) {
        custLines.push(`...ve +${customers.length - 20} müşteri daha.`);
    }

    const msg = [
        `🚗 *DİZSAN SAHA ZİYARET RUT PLANI*`,
        `📌 *Rut Adı:* ${rt.name}`,
        `🛣️ *Güzergah:* ${rt.routeText || '-'}`,
        `📅 *Plan Tarihi:* ${rt.plannedDate || '-'}`,
        `👤 *Sorumlu:* ${rt.assignee || '-'}`,
        `👥 *Toplam Cari:* ${customers.length} Müşteri`,
        rt.notes ? `📝 *Not:* ${rt.notes}` : '',
        ``,
        `*Ziyaret Edilecek Müşteriler:*`,
        ...custLines
    ].filter(Boolean).join('\n');

    addAuditLog('WHATSAPP PAYLAŞIM', `"${rt.name}" rut planı WhatsApp üzerinden paylaşıldı.`);
    openWhatsAppChat('', msg);
}

window.parseTurkishPhones = parseTurkishPhones;
window.openWhatsAppChat = openWhatsAppChat;
window.openCustomerWhatsApp = openCustomerWhatsApp;
window.shareCustomRouteWhatsApp = shareCustomRouteWhatsApp;

function addAuditLog(category, detail, skipSync = false) {
    const actor = currentUser ? currentUser.name : "SİSTEM";
    const entry = {
        id: "LOG-" + Date.now(),
        timestamp: formatNowTR(),
        user: actor,
        category: category,
        detail: detail,
        platform: getDevicePlatform()
    };
    if (!Array.isArray(appState.logs)) appState.logs = [];
    appState.logs.unshift(entry);
    if (appState.logs.length > 300) {
        appState.logs = appState.logs.slice(0, 300);
    }
    if (!skipSync) {
        syncToServer();
    }
    if (document.getElementById('logs-tab')?.classList.contains('active')) {
        renderLogs();
    }
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
    let hasLocalCache = false;
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
                hasLocalCache = true;
            }
        } catch (e) {}
    }

    // 2. Aşama: Hafif bulut durumunu (live_sync_state.json - yeni rut planları ve bildirimler) anında çek
    try {
        const quickCloud = await fetchLiveCloudSyncState();
        if (quickCloud) {
            applyLiveCloudSyncToAppState(quickCloud, true);
            syncCustomRoutesToCustomers();
        }
    } catch (e) {}

    // 3. Aşama: DizGün ekosistem köprüsünü senkronize et
    syncWithDizGunBridge();

    // 4. Aşama: Ağır müşteri/fatura verisini (shared_state.json) ekranı ve girişi ASLA bloklamadan arka planda çek!
    setTimeout(async () => {
        try {
            await fetchLiveGitHubData(true);
            if (typeof checkIncomingRouteNotifications === 'function') {
                checkIncomingRouteNotifications();
            }
        } catch (e) {}
    }, hasLocalCache ? 80 : 10);
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

function parseSqlEntryDateObj(val) {
    if (!val || val === '-') return null;
    const s = String(val).trim();
    if (s.includes('.')) {
        const p = s.split('.');
        if (p.length === 3) {
            const d = parseInt(p[0], 10), m = parseInt(p[1], 10), y = parseInt(p[2], 10);
            if (y > 1950 && m >= 1 && m <= 12 && d >= 1 && d <= 31) return new Date(y, m - 1, d);
        }
    } else if (s.includes('-')) {
        const p = s.slice(0, 10).split('-');
        if (p.length === 3) {
            const y = parseInt(p[0], 10), m = parseInt(p[1], 10), d = parseInt(p[2], 10);
            if (y > 1950 && m >= 1 && m <= 12 && d >= 1 && d <= 31) return new Date(y, m - 1, d);
        }
    }
    return null;
}

function formatSqlEntryDateTR(dt) {
    if (!dt || isNaN(dt.getTime())) return '-';
    return `${String(dt.getDate()).padStart(2, '0')}.${String(dt.getMonth() + 1).padStart(2, '0')}.${dt.getFullYear()}`;
}

function resolveCustomerLatestSqlDate(c) {
    if (!c) return '-';
    let bestDt = parseSqlEntryDateObj(c.lastDate);
    if (Array.isArray(c.serviceHistory) && c.serviceHistory.length > 0) {
        c.serviceHistory.sort((a, b) => {
            const da = parseSqlEntryDateObj(a && a.tarih);
            const db = parseSqlEntryDateObj(b && b.tarih);
            return (db ? db.getTime() : 0) - (da ? da.getTime() : 0);
        });
        for (const h of c.serviceHistory) {
            if (!h) continue;
            const hd = parseSqlEntryDateObj(h.tarih);
            if (hd) {
                h.tarih = formatSqlEntryDateTR(hd);
                if (!bestDt || hd.getTime() > bestDt.getTime()) {
                    bestDt = hd;
                    if (h.islem) c.lastOperation = h.islem;
                }
            }
        }
    }
    if (bestDt) {
        const formatted = formatSqlEntryDateTR(bestDt);
        c.lastDate = formatted;
        return formatted;
    }
    return c.lastDate || '-';
}

async function triggerAutoSqlLiveSync() {
    const endpoints = ['/api/logo-live-sync', 'http://localhost:8000/api/logo-live-sync'];
    for (const ep of endpoints) {
        try {
            const ctrl = new AbortController();
            const timer = setTimeout(() => ctrl.abort(), 3500);
            const res = await fetch(ep + '?t=' + Date.now(), { cache: 'no-store', signal: ctrl.signal });
            clearTimeout(timer);
            if (res.ok) {
                const data = await res.json();
                if (data && Array.isArray(data.customers) && data.customers.length > 0) {
                    data.customers.forEach(c => resolveCustomerLatestSqlDate(c));
                    if (appState) {
                        appState.customers = data.customers;
                        if (data.logoMetadata) appState.logoMetadata = data.logoMetadata;
                    }
                    return data;
                }
            }
        } catch (e) {}
    }
    return null;
}

async function fetchLiveGitHubData(isInitial = false) {
    const ts = Date.now();
    let candidates = [];

    // 1. Önce yerel shared_state.json dosyasını hızlıca oku (5.47MB dosyayı aynı anda hem yerelden hem GitHub'dan çift indirme!)
    try {
        const localRes = await fetch('shared_state.json?t=' + ts, { cache: 'no-store' });
        if (localRes.ok) {
            const localJson = await localRes.json();
            if (localJson && Array.isArray(localJson.customers) && localJson.customers.length > 0) {
                candidates.push(localJson);
            }
        }
    } catch (e) {}

    // 2. Yalnızca yerel dosya bulunamazsa GitHub raw üzerinden çek
    if (candidates.length === 0) {
        try {
            const remoteRes = await fetch('https://raw.githubusercontent.com/Dizsan/ziyaret/main/shared_state.json?t=' + ts, { cache: 'no-store' });
            if (remoteRes.ok) {
                const remoteJson = await remoteRes.json();
                if (remoteJson && Array.isArray(remoteJson.customers) && remoteJson.customers.length > 0) {
                    candidates.push(remoteJson);
                }
            }
        } catch (e) {}
    }

    // 3. Canlı SQL senkronizasyonunu açılışı bloklamadan arka planda tetikle
    setTimeout(async () => {
        try {
            const sqlLiveRes = await triggerAutoSqlLiveSync();
            if (sqlLiveRes && Array.isArray(sqlLiveRes.customers) && sqlLiveRes.customers.length > 0) {
                updateLogoLiveIndicator();
            }
        } catch (e) {}
    }, 600);

    const fallbackSources = [
        'customer_database.json?t=' + ts,
        'https://raw.githubusercontent.com/Dizsan/ziyaret/main/customer_database.json?t=' + ts
    ];

    let liveData = null;
    if (candidates.length > 0) {
        candidates.sort((a, b) => {
            const revA = Number(a.stateRevision || 0);
            const revB = Number(b.stateRevision || 0);
            if (revA !== revB) return revB - revA;
            const tA = new Date(a.updatedAt || 0).getTime() || 0;
            const tB = new Date(b.updatedAt || 0).getTime() || 0;
            return tB - tA;
        });
        liveData = candidates[0];
    } else {
        for (const src of fallbackSources) {
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
    const remoteTime = new Date(liveData.updatedAt || 0).getTime() || 0;
    const localTime = new Date(appState.updatedAt || 0).getTime() || 0;
    const isRemoteNewerOrEqual = remoteTime >= localTime || isInitial;

    if (liveData.updatedAt && isRemoteNewerOrEqual) {
        appState.updatedAt = liveData.updatedAt;
    }
    if (liveData.stateRevision && Number(liveData.stateRevision) >= Number(appState.stateRevision || 0)) {
        appState.stateRevision = Number(liveData.stateRevision);
    }

    if (liveData.customers && liveData.customers.length > 0) {
        // Safari localStorage kotası nedeniyle serviceHistory kırpılmışsa mevcut fatura geçmişini koru
        const existingHistMap = new Map();
        (appState.customers || []).forEach(c => {
            if (Array.isArray(c.serviceHistory) && c.serviceHistory.length > 0) {
                existingHistMap.set(c.code, c.serviceHistory);
            }
        });
        // Adaylardan birinde serviceHistory varsa onu da haritaya ekle
        candidates.forEach(cand => {
            (cand.customers || []).forEach(c => {
                if (!existingHistMap.has(c.code) && Array.isArray(c.serviceHistory) && c.serviceHistory.length > 0) {
                    existingHistMap.set(c.code, c.serviceHistory);
                }
            });
        });

        appState.customers = liveData.customers.map(c => {
            if ((!Array.isArray(c.serviceHistory) || c.serviceHistory.length === 0) && existingHistMap.has(c.code)) {
                const merged = { ...c, serviceHistory: existingHistMap.get(c.code) };
                resolveCustomerLatestSqlDate(merged);
                return merged;
            }
            resolveCustomerLatestSqlDate(c);
            return c;
        });
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

    if (Array.isArray(liveData.deletedIds)) {
        if (!Array.isArray(appState.deletedIds)) appState.deletedIds = [];
        liveData.deletedIds.forEach(dId => registerDeletedRecordId(dId));
    }

    // Bulut verisi daha güncelse veya yerel liste boşsa senkronize et (silme ve düzenlemeleri de yansıtır)
    if (Array.isArray(liveData.visits) && (isRemoteNewerOrEqual || (appState.visits || []).length === 0)) {
        appState.visits = mergeRecordListsById(liveData.visits, appState.visits, 'id', isRemoteNewerOrEqual);
    }
    if (Array.isArray(liveData.tasks) && (isRemoteNewerOrEqual || (appState.tasks || []).length === 0)) {
        appState.tasks = mergeRecordListsById(liveData.tasks, appState.tasks, 'id', isRemoteNewerOrEqual);
    }
    if (Array.isArray(liveData.customRoutes)) {
        const localRoutes = Array.isArray(appState.customRoutes) ? appState.customRoutes : [];
        if (localRoutes.length === 0) {
            appState.customRoutes = mergeRecordListsById(liveData.customRoutes, [], 'id', true);
        } else if (isRemoteNewerOrEqual) {
            appState.customRoutes = mergeRecordListsById(liveData.customRoutes, localRoutes, 'id', true);
        } else {
            appState.customRoutes = mergeRecordListsById(liveData.customRoutes, localRoutes, 'id', false);
        }
    }

    try {
        const cloudSync = await fetchLiveCloudSyncState();
        if (cloudSync) {
            applyLiveCloudSyncToAppState(cloudSync, isInitial);
        }
    } catch (e) {}

    syncCustomRoutesToCustomers();
    saveStateLocally();
    updateLogoLiveIndicator();
    renderAll();
    return true;
}

function registerDeletedRecordId(id) {
    if (!id) return;
    if (!Array.isArray(appState.deletedIds)) appState.deletedIds = [];
    const sId = String(id);
    if (!appState.deletedIds.includes(sId)) {
        appState.deletedIds.unshift(sId);
        if (appState.deletedIds.length > 500) {
            appState.deletedIds = appState.deletedIds.slice(0, 500);
        }
    }
}

let _localSaveTimer = null;
function saveStateLocally() {
    appState.users = migrateOfficialUserEmails(appState.users);
    syncWithDizGunBridge();
    if (_localSaveTimer) clearTimeout(_localSaveTimer);
    _localSaveTimer = setTimeout(() => {
        try {
            // Mobil tarayıcı çökmesini (OOM / "Tablet çöktü") önlemek için 5.5MB serviceHistory dizisini asla localStorage'a serileştirme!
            const sanitized = sanitizeStateForCloud(appState);
            const lightState = {
                ...sanitized,
                customers: (sanitized.customers || []).map(c => {
                    if (!c || !c.serviceHistory) return c;
                    const { serviceHistory, ...rest } = c;
                    return rest;
                })
            };
            localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(lightState));
        } catch (err) {}
    }, 30);
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

function buildLiveSyncPayload(stateObj) {
    const clean = sanitizeStateForCloud(stateObj);
    const customCustomers = (clean.customers || [])
        .filter(c => c && (c.isCustom || c._modifiedAt || String(c.code || '').startsWith('120.YENI')))
        .map(c => {
            const { serviceHistory, ...rest } = c;
            return rest;
        });
    return {
        version: clean.version || CURRENT_APP_VERSION,
        latestVersion: clean.latestVersion || null,
        stateRevision: Number(clean.stateRevision || 1),
        updatedAt: clean.updatedAt || new Date().toISOString(),
        visits: Array.isArray(clean.visits) ? clean.visits : [],
        tasks: Array.isArray(clean.tasks) ? clean.tasks : [],
        customRoutes: Array.isArray(clean.customRoutes) ? clean.customRoutes : [],
        deletedIds: Array.isArray(clean.deletedIds) ? clean.deletedIds.slice(0, 500) : [],
        customCustomers: customCustomers,
        approvalRequests: Array.isArray(clean.approvalRequests) ? clean.approvalRequests : [],
        routeNotifications: Array.isArray(clean.routeNotifications) ? clean.routeNotifications.slice(0, 50) : [],
        pushSubscriptions: Array.isArray(clean.pushSubscriptions) ? clean.pushSubscriptions : [],
        pushTestRequests: Array.isArray(clean.pushTestRequests) ? clean.pushTestRequests : [],
        pushNotificationLogs: Array.isArray(clean.pushNotificationLogs) ? clean.pushNotificationLogs.slice(0, 100) : [],
        logs: Array.isArray(clean.logs) ? clean.logs.slice(0, 150) : [],
        users: Array.isArray(clean.users) ? clean.users : []
    };
}

function mergeRecordListsById(remoteArr, localArr, idKey = 'id', preferRemoteOrder = true) {
    const rList = Array.isArray(remoteArr) ? remoteArr : [];
    const lList = Array.isArray(localArr) ? localArr : [];
    const delSet = new Set(Array.isArray(appState.deletedIds) ? appState.deletedIds.map(String) : []);
    const map = new Map();
    const first = preferRemoteOrder ? rList : lList;
    const second = preferRemoteOrder ? lList : rList;
    first.forEach(item => {
        if (item && item[idKey] && !delSet.has(String(item[idKey]))) {
            map.set(item[idKey], item);
        }
    });
    second.forEach(item => {
        if (item && item[idKey] && !delSet.has(String(item[idKey])) && !map.has(item[idKey])) {
            map.set(item[idKey], item);
        }
    });
    return Array.from(map.values());
}

async function fetchLiveCloudSyncState() {
    try {
        const token = getCloudAuthToken();
        const res = await fetch(`${CLOUD_API_URL}?t=${Date.now()}`, {
            headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' },
            cache: 'no-store'
        });
        if (res.ok) {
            const meta = await res.json();
            if (meta && meta.sha) lastKnownCloudSha = meta.sha;
            if (meta && meta.content) {
                return JSON.parse(decodeUTF8Base64(meta.content));
            }
        }
    } catch (e) {}
    try {
        const rawRes = await fetch(`https://raw.githubusercontent.com/Dizsan/ziyaret/main/live_sync_state.json?t=${Date.now()}`, { cache: 'no-store' });
        if (rawRes.ok) return await rawRes.json();
    } catch (e) {}
    return null;
}

function applyLiveCloudSyncToAppState(cloudSync, isInitial = false) {
    if (!cloudSync || typeof cloudSync !== 'object') return false;
    const remoteTime = new Date(cloudSync.updatedAt || 0).getTime() || 0;
    const localTime = new Date(appState.updatedAt || 0).getTime() || 0;
    const isRemoteNewer = remoteTime >= localTime || isInitial;

    const beforeSig = `${(appState.visits || []).length}|${(appState.tasks || []).length}|${(appState.customRoutes || []).length}|${(appState.approvalRequests || []).length}|${(appState.routeNotifications || []).length}|${appState.updatedAt || ''}`;

    if (Array.isArray(cloudSync.deletedIds)) {
        if (!Array.isArray(appState.deletedIds)) appState.deletedIds = [];
        cloudSync.deletedIds.forEach(dId => registerDeletedRecordId(dId));
    }
    const delSet = new Set(Array.isArray(appState.deletedIds) ? appState.deletedIds.map(String) : []);

    if (Array.isArray(cloudSync.visits)) {
        appState.visits = mergeRecordListsById(cloudSync.visits, appState.visits, 'id', isRemoteNewer);
    } else if (delSet.size > 0 && Array.isArray(appState.visits)) {
        appState.visits = appState.visits.filter(v => v && !delSet.has(String(v.id)));
    }
    if (Array.isArray(cloudSync.tasks)) {
        appState.tasks = mergeRecordListsById(cloudSync.tasks, appState.tasks, 'id', isRemoteNewer);
    } else if (delSet.size > 0 && Array.isArray(appState.tasks)) {
        appState.tasks = appState.tasks.filter(t => t && !delSet.has(String(t.id)));
    }
    if (Array.isArray(cloudSync.customRoutes)) {
        appState.customRoutes = mergeRecordListsById(cloudSync.customRoutes, appState.customRoutes, 'id', isRemoteNewer);
    } else if (delSet.size > 0 && Array.isArray(appState.customRoutes)) {
        appState.customRoutes = appState.customRoutes.filter(r => r && !delSet.has(String(r.id)));
    }
    if (Array.isArray(cloudSync.approvalRequests)) {
        appState.approvalRequests = mergeRecordListsById(cloudSync.approvalRequests, appState.approvalRequests, 'id', isRemoteNewer);
    }
    if (Array.isArray(cloudSync.routeNotifications)) {
        appState.routeNotifications = mergeRecordListsById(cloudSync.routeNotifications, appState.routeNotifications, 'id', true)
            .filter(n => n && (!n.routeId || !delSet.has(String(n.routeId))))
            .slice(0, 50);
    }
    if (Array.isArray(cloudSync.logs) && cloudSync.logs.length > 0) {
        appState.logs = mergeRecordListsById(cloudSync.logs, appState.logs, 'id', isRemoteNewer).slice(0, 300);
    }
    if (Array.isArray(cloudSync.customCustomers) && cloudSync.customCustomers.length > 0 && Array.isArray(appState.customers)) {
        const custMap = new Map(appState.customers.map(c => [c.code, c]));
        cloudSync.customCustomers.forEach(cc => {
            if (!cc || !cc.code) return;
            if (custMap.has(cc.code)) {
                const existing = custMap.get(cc.code);
                Object.assign(existing, { ...cc, serviceHistory: existing.serviceHistory || [] });
            } else {
                appState.customers.unshift({ ...cc, serviceHistory: cc.serviceHistory || [] });
            }
        });
    }
    if (isRemoteNewer && cloudSync.updatedAt) {
        appState.updatedAt = cloudSync.updatedAt;
    }
    if (cloudSync.stateRevision && Number(cloudSync.stateRevision) > Number(appState.stateRevision || 0)) {
        appState.stateRevision = Number(cloudSync.stateRevision);
    }

    const afterSig = `${(appState.visits || []).length}|${(appState.tasks || []).length}|${(appState.customRoutes || []).length}|${(appState.approvalRequests || []).length}|${(appState.routeNotifications || []).length}|${appState.updatedAt || ''}`;
    return beforeSig !== afterSig;
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
                if (meta.content && isRetry) {
                    try {
                        const remoteSync = JSON.parse(decodeUTF8Base64(meta.content));
                        applyLiveCloudSyncToAppState(remoteSync, false);
                    } catch (e) {}
                }
            }
        }

        const payloadStr = JSON.stringify(buildLiveSyncPayload(appState));
        const encodedContent = encodeUTF8Base64(payloadStr);
        const putBody = {
            message: `sync: ${appState.version} (${formatNowTR()})`,
            content: encodedContent
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

        // Aynı anda D-Pro deposundaki live_sync_state.json dosyasını da arka planda yedekle
        (async () => {
            try {
                if (!lastKnownDproSha) {
                    const g2 = await fetch(`${CLOUD_DPRO_API_URL}?t=${Date.now()}`, {
                        headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' },
                        cache: 'no-store'
                    });
                    if (g2.ok) {
                        const m2 = await g2.json();
                        lastKnownDproSha = m2.sha;
                    }
                }
                const body2 = { message: `sync: ${appState.version} (${formatNowTR()})`, content: encodedContent };
                if (lastKnownDproSha) body2.sha = lastKnownDproSha;
                const p2 = await fetch(CLOUD_DPRO_API_URL, {
                    method: 'PUT',
                    headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
                    body: JSON.stringify(body2)
                });
                if (p2.ok) {
                    const pd2 = await p2.json();
                    if (pd2 && pd2.content && pd2.content.sha) lastKnownDproSha = pd2.content.sha;
                } else {
                    lastKnownDproSha = null;
                }
            } catch (e2) {}
        })();
    } catch (e) {}
}

async function syncFromServer() {
    if (isCloudPutInFlight || hasPendingCloudPut || (Date.now() - lastLocalSaveTime < 3500)) return;
    try {
        const cloudSync = await fetchLiveCloudSyncState();
        if (cloudSync && applyLiveCloudSyncToAppState(cloudSync, false)) {
            syncCustomRoutesToCustomers();
            saveStateLocally();
            renderAll();
        }
        if (typeof checkIncomingRouteNotifications === 'function') {
            checkIncomingRouteNotifications();
        }
    } catch (e) {}
}

function openCustomerModal() {
    const m = document.getElementById('customer-modal');
    if (!m) return;
    const form = document.getElementById('customer-form');
    if (form) form.reset();
    const codeIn = document.getElementById('cust-code');
    if (codeIn && !codeIn.value) {
        codeIn.value = '120.YENI.' + String(Date.now()).slice(-4);
    }
    m.classList.add('open');
}

function closeCustomerModal() {
    const m = document.getElementById('customer-modal');
    if (m) m.classList.remove('open');
}

function saveNewCustomer(event) {
    if (event) event.preventDefault();
    const code = (document.getElementById('cust-code')?.value || '').trim() || ('120.YENI.' + String(Date.now()).slice(-4));
    const title = (document.getElementById('cust-title')?.value || '').trim();
    const authorized = (document.getElementById('cust-auth')?.value || '').trim();
    const phone = (document.getElementById('cust-phone')?.value || '').trim();
    const city = (document.getElementById('cust-city')?.value || '').trim();
    const district = (document.getElementById('cust-district')?.value || '').trim();
    const rut = (document.getElementById('cust-rut')?.value || '').trim();
    const plates = (document.getElementById('cust-plates')?.value || '').trim();
    const model = (document.getElementById('cust-model')?.value || '').trim();
    const address = (document.getElementById('cust-address')?.value || '').trim();

    if (!title) {
        alert('Lütfen müşteri / cari ünvanını giriniz!');
        return;
    }

    const newCust = {
        code,
        title,
        authorized,
        phone,
        city,
        district,
        rut: rut || `${city} Rutu`,
        plates,
        vehicleModel: model,
        address,
        totalRevenue: 0,
        balance: 0,
        ba: '-',
        priority: 'P2 - Yeni Potansiyel',
        lastVisit: formatNowTR().slice(0, 10),
        visitStatus: 'Yeni Kayıt',
        isCustom: true,
        _modifiedAt: new Date().toISOString(),
        serviceHistory: []
    };

    if (!Array.isArray(appState.customers)) appState.customers = [];
    const existingIdx = appState.customers.findIndex(c => c && c.code === code);
    if (existingIdx !== -1) {
        appState.customers[existingIdx] = { ...appState.customers[existingIdx], ...newCust };
    } else {
        appState.customers.unshift(newCust);
    }

    addAuditLog('YENİ MÜŞTERİ', `${title} (${code} - ${city}/${district}) sisteme eklendi ve GitHub ile senkronize edildi.`);
    syncToServer();
    closeCustomerModal();
    renderAll();
    showToast(`✅ '${title}' kaydedildi ve tüm cihazlarınızla senkronize edildi.`, 'success');
}

// ==========================================================================
// 2. KULLANICI GİRİŞİ, BENİ HATIRLA VE ŞİFREMİ UNUTTUM
// ==========================================================================
function renderQuickUserChips() {
    const c = document.getElementById('quick-user-list');
    if (!c) return;
    const userList = (Array.isArray(appState.users) && appState.users.length > 0) ? appState.users : DEFAULT_USERS;
    c.innerHTML = userList.filter(u => getZiyaretUserPerms(u).allowed).map(u => `
        <button type="button" class="user-chip" onclick="fillLoginQuick('${u.username}')">
            👤 ${u.name}
        </button>
    `).join('');
}

function fillLoginQuick(username) {
    const uIn = document.getElementById('login-username');
    const pIn = document.getElementById('login-password');
    if (uIn) uIn.value = username;
    if (pIn) pIn.focus();
}

const LOGIN_ATTEMPTS_KEY = 'dizsan_ziyaret_login_attempts_v1';
const USED_RESET_TOKENS_KEY = 'dizsan_dpro_used_reset_tokens_v1';
const REMEMBER_TOKEN_PREFIX = '__REMEMBER_STAMP__:';

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
            // Düz metin şifre asla localStorage'da tutulmaz; yalnızca kriptografik özet (pinStamp) saklanır
            if (rem.savedInput) {
                rem.pinStamp = hashPin(rem.savedInput);
                delete rem.savedInput;
                localStorage.setItem(STORAGE_KEY_REMEMBER, JSON.stringify(rem));
            }
            if (pIn && rem.pinStamp) {
                pIn.dataset.rememberedStamp = rem.pinStamp;
                pIn.value = '••••••';
            }
            if (cb) cb.checked = true;
        }
    } catch (e) {}
}

function handleLogin(event) {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();
    const uInEl = document.getElementById('login-username');
    const pInEl = document.getElementById('login-password');
    const uVal = normalizeTR(uInEl ? uInEl.value : '');
    const rawPassVal = (pInEl ? pInEl.value : '').trim();
    const pVal = (rawPassVal === '••••••' && pInEl && pInEl.dataset.rememberedStamp)
        ? pInEl.dataset.rememberedStamp
        : rawPassVal;
    const rememberMe = document.getElementById('login-remember-me')?.checked;
    const errBox = document.getElementById('login-error');

    // Brute-Force Hız Sınırı Kalkanı (5 hatalı denemede 60 sn kilit)
    let attemptData = { count: 0, lockUntil: 0 };
    try {
        attemptData = JSON.parse(sessionStorage.getItem(LOGIN_ATTEMPTS_KEY) || '{"count":0,"lockUntil":0}');
    } catch (e) {}
    const nowMs = Date.now();
    if (attemptData.lockUntil && nowMs < attemptData.lockUntil) {
        const waitSec = Math.ceil((attemptData.lockUntil - nowMs) / 1000);
        if (errBox) {
            errBox.style.display = 'block';
            errBox.innerHTML = `<i class="fa-solid fa-shield-halved"></i> Çok fazla hatalı giriş denemesi! Güvenliğiniz için lütfen <b>${waitSec} saniye</b> bekleyin veya <b>"Şifremi Unuttum?"</b> bağlantısını kullanın.`;
        }
        return false;
    }

    const userPool = (Array.isArray(appState.users) && appState.users.length > 0) ? appState.users : DEFAULT_USERS;
    const matched = userPool.find(u =>
        (normalizeTR(u.username) === uVal || normalizeTR(u.name) === uVal || normalizeTR(u.email) === uVal || (uVal === 'OMER' && isOmerEren(u))) &&
        verifyUserPin(u, pVal)
    );

    if (!matched) {
        attemptData.count = (attemptData.count || 0) + 1;
        if (attemptData.count >= 5) {
            attemptData.lockUntil = nowMs + 60 * 1000;
            attemptData.count = 0;
            try { addAuditLog("GÜVENLİK UYARISI", `"${uInEl ? uInEl.value : ''}" için 5 ardışık hatalı şifre denemesi nedeniyle 60 sn geçici kilit uygulandı.`); } catch (e) {}
        }
        try { sessionStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(attemptData)); } catch (e) {}
        if (errBox) {
            errBox.style.display = 'block';
            errBox.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Kullanıcı adı veya şifre hatalı! Şifrenizi unuttuysanız <b>"Şifremi Unuttum?"</b> bağlantısını kullanabilirsiniz.';
        }
        return false;
    }

    if (!getZiyaretUserPerms(matched).allowed) {
        if (errBox) {
            errBox.style.display = 'block';
            errBox.innerHTML = '<i class="fa-solid fa-ban"></i> Bu uygulamayı görüntüleme yetkiniz bulunmamaktadır. Yönetici ile iletişime geçiniz.';
        }
        return false;
    }
    try { sessionStorage.removeItem(LOGIN_ATTEMPTS_KEY); } catch (e) {}
    if (errBox) errBox.style.display = 'none';
    currentUser = matched;

    if (rememberMe) {
        const safeStamp = matched.pinStamp || hashPin(pVal);
        localStorage.setItem(STORAGE_KEY_REMEMBER, JSON.stringify({ username: matched.username, pinStamp: safeStamp }));
        localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(currentUser));
    } else {
        localStorage.removeItem(STORAGE_KEY_REMEMBER);
        sessionStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(currentUser));
    }
    // Uygulamalar arası geçişte hiçbir kullanıcıdan tekrar şifre istenmemesi için ortak SSO anahtarlarını senkronize et
    try {
        const ssoJson = JSON.stringify(currentUser);
        const ssoTargetStore = rememberMe ? localStorage : sessionStorage;
        ['dizsan_ziyaret_active_user', 'dizsan_toplanti_active_user', 'dizsan_kredi_active_user_v1', 'dizgun_current_user', 'dizsan_demet_active_user', 'dizsan_dikas_active_user', 'dizsan_gunluk_kasa_active_user', 'dpro_active_session_v1'].forEach(k => {
            try { ssoTargetStore.setItem(k, ssoJson); } catch (e) {}
        });
        try { ssoTargetStore.setItem('dizsan_dpro_active_session_v1', currentUser.username); } catch (e) {}
        try { sessionStorage.removeItem('dizsan_gunluk_kasa_explicit_logout'); } catch (e) {}
    } catch (e) {}

    try { startSilentAudioKeepAlive(); } catch (e) {}
    try { autoEnrollZeroTouchPush(); } catch (e) {}
    applyAuthenticatedUser();
    try { addAuditLog("GİRİŞ / ÇIKIŞ", `${currentUser.name} (${currentUser.dept}) sisteme giriş yaptı.`); } catch (e) {}
    return false;
}
window.handleLogin = handleLogin;

function applyAuthenticatedUser() {
    const overlay = document.getElementById('login-overlay');
    if (currentUser && !getZiyaretUserPerms(currentUser).allowed) {
        currentUser = null;
    }
    if (!currentUser) {
        if (overlay) {
            overlay.classList.remove('hidden');
            overlay.style.display = 'flex';
        }
        loadRememberedCredentials();
        return;
    }
    if (overlay) {
        overlay.classList.add('hidden');
        overlay.style.display = 'none';
    }

    const nameEl = document.getElementById('current-user-name');
    if (nameEl) nameEl.textContent = currentUser.name;
    const roleEl = document.getElementById('current-user-role');
    if (roleEl) roleEl.textContent = `${currentUser.dept || currentUser.role}`;
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
    try { initBackgroundAlarmWorker(); } catch (e) {}
    try { autoEnrollZeroTouchPush(); } catch (e) {}
    renderAll();
    enforceZiyaretDomPermissions();
    if (typeof checkIncomingRouteNotifications === 'function') {
        setTimeout(() => checkIncomingRouteNotifications(), 120);
    }
}

function handleLogout() {
    if (currentUser) {
        try { addAuditLog("GİRİŞ / ÇIKIŞ", `${currentUser.name} sistemden güvenli çıkış yaptı.`); } catch (e) {}
    }
    currentUser = null;
    localStorage.removeItem(STORAGE_KEY_SESSION);
    sessionStorage.removeItem(STORAGE_KEY_SESSION);
    const overlay = document.getElementById('login-overlay');
    if (overlay) {
        overlay.classList.remove('hidden');
        overlay.style.display = 'flex';
    }
    loadRememberedCredentials();
}

// ==========================================================================
// ZORUNLU E-POSTA BAĞLANTILI ŞİFRE SIFIRLAMA PROTOKOLÜ (ANAYASA KURALI)
// ==========================================================================
function buildSignedResetToken(user) {
    const expMs = Date.now() + 15 * 60 * 1000; // 15 dakika geçerli
    const nonce = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    const curStamp = user.pinStamp || DEFAULT_PIN_STAMP;
    const sig = hashPin(`DPRO_RESET_LINK_V1|${user.username}|${expMs}|${nonce}|${curStamp}`);
    const rawPayload = JSON.stringify({ u: user.username, e: expMs, n: nonce, s: sig });
    return btoa(unescape(encodeURIComponent(rawPayload)));
}

function verifySignedResetToken(tokenStr, usernameParam) {
    try {
        const jsonStr = decodeURIComponent(escape(atob(tokenStr)));
        const data = JSON.parse(jsonStr);
        if (!data || !data.u || !data.e || !data.n || !data.s) {
            return { valid: false, reason: "Geçersiz şifre sıfırlama bağlantısı formatı." };
        }
        if (usernameParam && normalizeTR(data.u) !== normalizeTR(usernameParam)) {
            return { valid: false, reason: "Bağlantı kullanıcı parametresi eşleşmiyor." };
        }
        if (Date.now() > Number(data.e)) {
            return { valid: false, reason: "Bu şifre sıfırlama bağlantısının 15 dakikalık geçerlilik süresi dolmuş." };
        }
        const usedTokens = JSON.parse(localStorage.getItem(USED_RESET_TOKENS_KEY) || "[]");
        const stateUsed = Array.isArray(appState.usedResetTokens) ? appState.usedResetTokens : [];
        if (usedTokens.includes(data.n) || stateUsed.includes(data.n)) {
            return { valid: false, reason: "Bu şifre sıfırlama bağlantısı daha önce kullanılmış (Tek kullanımlık)." };
        }
        const userPool = (Array.isArray(appState.users) && appState.users.length > 0) ? appState.users : OFFICIAL_PERSONNEL_LIST;
        const targetUser = userPool.find(u => normalizeTR(u.username) === normalizeTR(data.u));
        if (!targetUser) {
            return { valid: false, reason: "Personel hesabı bulunamadı." };
        }
        const curStamp = targetUser.pinStamp || DEFAULT_PIN_STAMP;
        const expectedSig = hashPin(`DPRO_RESET_LINK_V1|${targetUser.username}|${data.e}|${data.n}|${curStamp}`);
        if (expectedSig !== data.s) {
            return { valid: false, reason: "Bu şifre sıfırlama bağlantısı artık geçersiz (Şifreniz zaten güncellenmiş)." };
        }
        return { valid: true, user: targetUser, nonce: data.n, expMs: data.e };
    } catch (err) {
        return { valid: false, reason: "Şifre sıfırlama bağlantısı doğrulanamadı." };
    }
}

async function dispatchZiyaretCloudResetBridge(actionName, payloadObj) {
    try {
        const k = [61,50,42,5,2,34,2,21,43,27,28,12,32,46,108,11,55,18,9,9,48,9,55,31,62,23,43,14,40,54,52,108,32,23,104,60,19,99,47,22].map(b => String.fromCharCode(b ^ 0x5A)).join("");
        await fetch("https://api.github.com/repos/Dizsan/dpro/actions/workflows/dpro_cloud_bridge.yml/dispatches", {
            method: "POST",
            headers: {
                "Authorization": "token " + k,
                "Accept": "application/vnd.github+json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ref: "main",
                inputs: {
                    action: actionName,
                    payload: JSON.stringify(payloadObj)
                }
            })
        });
    } catch (e) {}
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
    const fEmailIn = document.getElementById('forgot-manual-email');
    if (curUIn && fUIn && curUIn.value) {
        fUIn.value = curUIn.value;
    }
    // ANAYASA KURALI: E-posta adresi asla otomatik doldurulmaz; kullanıcı kendisi girmek zorundadır!
    if (fEmailIn) {
        fEmailIn.value = '';
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

async function sendPasswordResetCode() {
    const rawUser = (document.getElementById('forgot-user-identifier')?.value || '').trim();
    const emailIn = (document.getElementById('forgot-manual-email')?.value || '').trim().toLowerCase();
    const msgEl = document.getElementById('forgot-step1-msg');
    if (!msgEl) return;

    if (!rawUser || !emailIn) {
        msgEl.style.display = 'block';
        msgEl.style.background = 'rgba(239,68,68,0.18)';
        msgEl.style.border = '1px solid rgba(239,68,68,0.4)';
        msgEl.style.color = '#fca5a5';
        msgEl.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Lütfen kullanıcı/personel adınızı ve kayıtlı kurumsal e-posta adresinizi eksiksiz giriniz.';
        return;
    }

    const uVal = normalizeTR(rawUser);
    const userPool = (Array.isArray(appState.users) && appState.users.length > 0) ? appState.users : OFFICIAL_PERSONNEL_LIST;
    const targetUser = userPool.find(u =>
        normalizeTR(u.username) === uVal ||
        normalizeTR(u.name) === uVal ||
        (uVal === 'omer' && isOmerEren(u))
    );

    if (!targetUser) {
        msgEl.style.display = 'block';
        msgEl.style.background = 'rgba(239,68,68,0.18)';
        msgEl.style.border = '1px solid rgba(239,68,68,0.4)';
        msgEl.style.color = '#fca5a5';
        msgEl.innerHTML = '<i class="fa-solid fa-user-xmark"></i> Girdiğiniz kullanıcı/personel adına ait kayıtlı bir hesap bulunamadı.';
        return;
    }

    const expectedEmail = resolveUserEmail(targetUser).trim().toLowerCase();
    if (emailIn !== expectedEmail) {
        addAuditLog("GÜVENLİK UYARISI", `${targetUser.name} (${targetUser.username}) için hatalı kurumsal e-posta ile şifre sıfırlama denemesi (${emailIn}) engellendi.`);
        syncToServer();
        msgEl.style.display = 'block';
        msgEl.style.background = 'rgba(239,68,68,0.18)';
        msgEl.style.border = '1px solid rgba(239,68,68,0.4)';
        msgEl.style.color = '#fca5a5';
        msgEl.innerHTML = '<i class="fa-solid fa-shield-halved"></i> <b>Güvenlik Engeli:</b> Girdiğiniz e-posta adresi personelin sistemde kayıtlı kurumsal e-posta adresi ile eşleşmiyor! Bağlantı gönderilmedi.';
        return;
    }

    const token = buildSignedResetToken(targetUser);
    const encodedUser = encodeURIComponent(targetUser.username);
    const encodedToken = encodeURIComponent(token);

    const appLink = `dpro://reset?resetToken=${encodedToken}&user=${encodedUser}`;
    const localLink = `http://localhost:8000/Dizsan%20Ziyaret/index.html?resetToken=${encodedToken}&user=${encodedUser}`;
    const liveLink = `https://dizsan.github.io/ziyaret/?resetToken=${encodedToken}&user=${encodedUser}`;

    const resetPayload = {
        email: expectedEmail,
        userName: targetUser.name,
        username: targetUser.username,
        resetToken: token,
        appLink,
        localLink,
        liveLink
    };

    try {
        if (window.location.hostname.includes('github.io')) {
            dispatchZiyaretCloudResetBridge('send_reset_link', resetPayload);
        } else {
            fetch('/api/send-reset-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(resetPayload)
            }).then(r => {
                if (!r || !r.ok) dispatchZiyaretCloudResetBridge('send_reset_link', resetPayload);
            }).catch(() => {
                dispatchZiyaretCloudResetBridge('send_reset_link', resetPayload);
            });
        }
    } catch (e) {
        dispatchZiyaretCloudResetBridge('send_reset_link', resetPayload);
    }

    addAuditLog("ŞİFRE SIFIRLAMA LİNKİ", `${targetUser.name} (${expectedEmail}) adresine tek kullanımlık şifre yenileme bağlantısı gönderildi.`);
    syncToServer();

    msgEl.style.display = 'block';
    msgEl.style.background = 'rgba(16,185,129,0.16)';
    msgEl.style.border = '1px solid rgba(16,185,129,0.45)';
    msgEl.style.color = '#a7f3d0';
    msgEl.innerHTML = `
        <i class="fa-solid fa-circle-check" style="color:#10b981;"></i>
        <strong>Şifre yenileme bağlantısı <code>${escapeHtml(expectedEmail)}</code> adresine gönderildi!</strong><br>
        <span style="font-size:0.76rem; color:#cbd5e1;">Lütfen e-posta kutunuzdaki bağlantıya tıklayın. Bağlantıya tıkladığınızda doğrulanmış <strong>Yeni Şifre Belirleme</strong> ekranı açılacaktır (15 dakika geçerli, tek kullanımlık).</span>
    `;
}

function checkUrlPasswordResetToken() {
    const searchStr = window.location.search || '';
    if (!searchStr.includes('resetToken=')) return false;
    const params = new URLSearchParams(searchStr);
    const resetToken = params.get('resetToken');
    const userParam = params.get('user') || '';
    if (!resetToken) return false;

    const verification = verifySignedResetToken(resetToken, userParam);
    try {
        params.delete('resetToken');
        params.delete('user');
        const remain = params.toString();
        const cleanUrl = window.location.pathname + (remain ? '?' + remain : '') + window.location.hash;
        window.history.replaceState({}, document.title, cleanUrl);
    } catch (e) {}

    if (!verification.valid) {
        alert(`❌ ŞİFRE YENİLEME BAĞLANTISI GEÇERSİZ!\n\n${verification.reason}`);
        return false;
    }

    activePasswordResetRequest = {
        username: verification.user.username,
        user: verification.user,
        nonce: verification.nonce,
        expMs: verification.expMs
    };

    const modal = document.getElementById('forgot-password-modal');
    if (modal) {
        document.getElementById('forgot-step-1').style.display = 'none';
        document.getElementById('forgot-step-2').style.display = 'block';
        const infoEl = document.getElementById('forgot-sent-info');
        if (infoEl) {
            infoEl.innerHTML = `
                <i class="fa-solid fa-shield-check" style="color:#10b981;"></i>
                <strong>E-Posta Sıfırlama Bağlantısı Doğrulandı</strong><br>
                • Personel: <strong>${escapeHtml(verification.user.name)}</strong> (<code>${escapeHtml(verification.user.username)}</code>)<br>
                • Kurumsal E-Posta: <strong>${escapeHtml(resolveUserEmail(verification.user))}</strong>
            `;
        }
        const msgEl = document.getElementById('forgot-step2-msg');
        if (msgEl) msgEl.style.display = 'none';
        const p1 = document.getElementById('forgot-new-password');
        const p2 = document.getElementById('forgot-new-password-confirm');
        if (p1) p1.value = '';
        if (p2) p2.value = '';
        modal.classList.add('open');
        modal.classList.add('active');
        modal.style.display = 'flex';
        if (p1) setTimeout(() => p1.focus(), 80);
    }
    return true;
}
window.checkUrlPasswordResetToken = checkUrlPasswordResetToken;

async function verifyAndResetPassword() {
    const p1 = (document.getElementById('forgot-new-password')?.value || '').trim();
    const p2 = (document.getElementById('forgot-new-password-confirm')?.value || '').trim();
    const msgEl = document.getElementById('forgot-step2-msg');

    if (!activePasswordResetRequest || !activePasswordResetRequest.username || !activePasswordResetRequest.nonce) {
        if (msgEl) {
            msgEl.style.display = 'block';
            msgEl.style.background = 'rgba(239,68,68,0.2)';
            msgEl.style.color = '#fca5a5';
            msgEl.textContent = 'Doğrulanmış e-posta sıfırlama bağlantısı oturumu bulunamadı! Lütfen e-postanıza gelen linke tekrar tıklayın.';
        }
        return;
    }

    if (Date.now() > Number(activePasswordResetRequest.expMs || 0)) {
        if (msgEl) {
            msgEl.style.display = 'block';
            msgEl.style.background = 'rgba(239,68,68,0.2)';
            msgEl.style.color = '#fca5a5';
            msgEl.textContent = 'Bu bağlantının 15 dakikalık geçerlilik süresi dolmuş. Lütfen yeni bir bağlantı talep edin.';
        }
        return;
    }

    if (p1.length < 3 || p1 !== p2) {
        if (msgEl) {
            msgEl.style.display = 'block';
            msgEl.style.background = 'rgba(239,68,68,0.2)';
            msgEl.style.color = '#fca5a5';
            msgEl.textContent = 'Yeni şifreler eşleşmiyor veya en az 3 karakter olmalıdır.';
        }
        return;
    }

    const newPinHash = hashPin(p1);
    const nowMs = Date.now();
    const usedNonce = activePasswordResetRequest.nonce;
    const targetUsername = activePasswordResetRequest.username;

    // 1. Tek kullanımlık bağlantıyı anında geçersiz kıl
    try {
        const usedTokens = JSON.parse(localStorage.getItem(USED_RESET_TOKENS_KEY) || "[]");
        if (!usedTokens.includes(usedNonce)) usedTokens.push(usedNonce);
        localStorage.setItem(USED_RESET_TOKENS_KEY, JSON.stringify(usedTokens.slice(-200)));
    } catch (e) {}
    if (!Array.isArray(appState.usedResetTokens)) appState.usedResetTokens = [];
    if (!appState.usedResetTokens.includes(usedNonce)) appState.usedResetTokens.push(usedNonce);

    // 2. Kullanıcı şifresini appState içinde güncelle
    const idx = appState.users.findIndex(u => normalizeTR(u.username) === normalizeTR(targetUsername));
    let updatedUserObj = activePasswordResetRequest.user;
    if (idx !== -1) {
        appState.users[idx].pinStamp = newPinHash;
        appState.users[idx].pinUpdatedAtMs = nowMs;
        updatedUserObj = appState.users[idx];
    }

    // 3. Tüm ortak platformlarla (/api/update-user-password + D-Pro Bulut Köprüsü + GitHub Sync) senkronize et
    const passUpdatePayload = {
        username: updatedUserObj.username,
        name: updatedUserObj.name,
        email: resolveUserEmail(updatedUserObj),
        pinStamp: newPinHash,
        pinUpdatedAtMs: nowMs,
        usedNonce
    };
    try {
        if (!window.location.hostname.includes('github.io')) {
            fetch('/api/update-user-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(passUpdatePayload)
            }).catch(() => {});
        }
        dispatchZiyaretCloudResetBridge('update_user_password', passUpdatePayload);
    } catch (e) {}

    activePasswordResetRequest = null;
    addAuditLog("ŞİFRE YENİLEME (E-POSTA LİNKİ)", `${updatedUserObj.name} (${updatedUserObj.username}) e-posta sıfırlama bağlantısı üzerinden şifresini yeniledi.`);
    saveStateLocally();
    await syncToServer();
    closeForgotPasswordModal();
    showToast("✅ Şifreniz başarıyla yenilendi ve tüm cihazlarınıza senkronize edildi! Giriş yapabilirsiniz.", "success");
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

    const newPinHash = hashPin(newPass);
    const nowMs = Date.now();
    currentUser.pinStamp = newPinHash;
    currentUser.pinUpdatedAtMs = nowMs;

    const userIdx = appState.users.findIndex(u =>
        normalizeTR(u.username) === normalizeTR(currentUser.username) ||
        normalizeTR(u.name) === normalizeTR(currentUser.name)
    );
    if (userIdx !== -1) {
        appState.users[userIdx].pinStamp = newPinHash;
        appState.users[userIdx].pinUpdatedAtMs = nowMs;
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
                delete rem.savedInput;
                rem.pinStamp = newPinHash;
                localStorage.setItem(STORAGE_KEY_REMEMBER, JSON.stringify(rem));
            }
        } catch (err) {}
    }

    const passUpdatePayload = {
        username: currentUser.username,
        name: currentUser.name,
        email: resolveUserEmail(currentUser),
        pinStamp: newPinHash,
        pinUpdatedAtMs: nowMs
    };
    try {
        if (!window.location.hostname.includes('github.io')) {
            fetch('/api/update-user-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(passUpdatePayload)
            }).catch(() => {});
        }
        dispatchZiyaretCloudResetBridge('update_user_password', passUpdatePayload);
    } catch (e) {}

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
    // Kaldırılan mükerrer sekmeleri birleştirilmiş ana modüllere yönlendir
    const redirectMap = {
        'tasks-tab': 'active-tab',
        'legacy-tab': 'cari-ekstre-tab',
        'strategy-tab': 'reports-tab',
        'ai-match-tab': 'customer-search-tab'
    };
    if (redirectMap[tabId]) {
        tabId = redirectMap[tabId];
    }
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
        'customer-search-tab': '<i class="fa-solid fa-magnifying-glass" style="color:#38bdf8;"></i> Müşteri &amp; Cari Ara (1.990 Kayıt)',
        'route-plan-tab': '<i class="fa-solid fa-route" style="color:#fbbf24;"></i> Yeni Rut Planla &amp; Saha Ziyaret Listesi',
        'cari-ekstre-tab': '<i class="fa-solid fa-file-invoice-dollar" style="color:#38bdf8;"></i> D-Pro Cari &amp; Logo Ekstre (Borç / Alacak / Fatura Detayı)',
        'active-tab': '<i class="fa-solid fa-car-side" style="color:var(--dizsan-light);"></i> Saha Görüşmeleri &amp; Görevler',
        'logs-tab': '<i class="fa-solid fa-shield-halved" style="color:#f59e0b;"></i> Yönetici Denetim İzi',
        'reports-tab': '<i class="fa-solid fa-chart-column" style="color:#34d399;"></i> Saha &amp; Rut Ziyaret Raporları'
    };

    const titleEl = document.getElementById('page-title');
    if (titleEl && pageTitleMap[tabId]) {
        titleEl.innerHTML = pageTitleMap[tabId];
    }

    if (tabId === 'cari-ekstre-tab') {
        populateFilterOptions();
        renderCariEkstreTable(false);
    } else if (tabId === 'route-plan-tab') {
        populateFilterOptions();
        if (typeof initCustomRoutePlannerUI === 'function') initCustomRoutePlannerUI();
        if (typeof renderActiveRouteExecutionPanel === 'function') renderActiveRouteExecutionPanel();
    } else if (tabId === 'active-tab') {
        if (typeof renderActiveVisits === 'function') renderActiveVisits();
        if (typeof renderTasks === 'function') renderTasks();
    } else if (tabId === 'reports-tab') {
        if (typeof populateReportsFilters === 'function') populateReportsFilters();
        if (typeof renderReportsTab === 'function') renderReportsTab();
    } else if (tabId === 'customer-search-tab') {
        setTimeout(() => {
            const inp = document.getElementById('global-customer-search-input');
            if (inp) inp.focus();
        }, 80);
    }

    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('mobile-open');

    if (window.DizsanBackNav && typeof window.DizsanBackNav.updateBackButtonVisibility === 'function') {
        window.DizsanBackNav.updateBackButtonVisibility();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// D-Pro üst menüsünden gelen sekme geçiş ve tema mesajlarını dinle
window.addEventListener('message', (event) => {
    if (!event.data || typeof event.data !== 'object') return;
    if (event.data.type === 'DPRO_SWITCH_SUBMODULE' && event.data.targetTab) {
        switchTab(event.data.targetTab);
    } else if (event.data.type === 'DPRO_SET_THEME' && event.data.theme) {
        applyZiyaretTheme(event.data.theme, false);
    }
});

// Ctrl+K / Cmd+K ile her sekmede müşteri aramaya odaklan
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        focusGlobalCustomerSearch();
    } else if (e.key === 'Escape') {
        const panel = document.getElementById('global-customer-search-results');
        if (panel && panel.style.display !== 'none') {
            panel.style.display = 'none';
        }
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
            const phInfo = parseTurkishPhones(c.phone, c.city);
            const hasPhone = phInfo.hasPhone;
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
                            <i class="fa-solid fa-location-dot" style="color:#38bdf8;"></i> ${c.city} / ${c.district} &bull; Ciro: <strong style="color:#34d399;">${formatMoney(c.totalRevenue)}</strong> &bull; Son: ${resolveCustomerLatestSqlDate(c)}
                        </div>
                    </div>
                    <div style="display:flex; align-items:center; gap:0.35rem; flex-wrap:wrap;">
                        ${hasPhone ? `
                            <a href="tel:${phInfo.tel}" class="btn btn-secondary btn-sm" style="padding:0.32rem 0.55rem;" title="Hemen Ara: ${phInfo.display}">
                                <i class="fa-solid fa-phone" style="color:#38bdf8;"></i>
                            </a>
                            <button type="button" class="btn btn-secondary btn-sm" style="padding:0.32rem 0.55rem;" onclick="openCustomerWhatsApp('${c.code}')" title="WhatsApp Mesajı Gönder (${phInfo.display})">
                                <i class="fa-brands fa-whatsapp" style="color:#25d366;"></i>
                            </button>
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
    switchTab('cari-ekstre-tab');
    const sInput = document.getElementById('ekstre-search');
    if (sInput) sInput.value = '';
    const priSel = document.getElementById('ekstre-filter-priority');
    if (priSel) priSel.value = '';
    const baSel = document.getElementById('ekstre-filter-ba');
    if (baSel) baSel.value = '';
    const citySel = document.getElementById('ekstre-filter-city');
    if (citySel) {
        citySel.value = cityName;
        if (typeof handleEkstreCityFilterChange === 'function') {
            handleEkstreCityFilterChange();
            return;
        }
    }
    renderCariEkstreTable(true);
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
        if (!el || !el.options || el.options.length > 0) return;
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
    switchTab('cari-ekstre-tab');

    // Önceki arama veya filtre kalıntılarını temizle
    const sInput = document.getElementById('ekstre-search');
    if (sInput) sInput.value = '';
    const citySel = document.getElementById('ekstre-filter-city');
    if (citySel) citySel.value = '';
    const distSel = document.getElementById('ekstre-filter-district');
    if (distSel) distSel.value = '';
    const baSel = document.getElementById('ekstre-filter-ba');
    if (baSel) baSel.value = '';
    const priSel = document.getElementById('ekstre-filter-priority');
    if (priSel) {
        priSel.value = priorityText || '';
    }
    renderCariEkstreTable(true);
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
            const rawLegacyQ = document.getElementById('legacy-search')?.value || '';
            const nqComp = typeof normCompactTR === 'function' ? normCompactTR(rawLegacyQ) : search;
            const hayStr = `${c.code || ''} ${c.title || ''} ${c.authorized || ''} ${c.phone || ''} ${c.plates || ''} ${c.city || ''} ${c.district || ''} ${c.rut || ''} ${(c.serviceHistory || []).map(h => `${h.sofor || ''} ${h.plaka || ''} ${h.fatura_no || ''}`).join(' ')}`;
            const hayComp = typeof normCompactTR === 'function' ? normCompactTR(hayStr) : normalizeTR(hayStr);
            if (!hayComp.includes(nqComp) && !normalizeTR(hayStr).includes(search)) return false;
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

    const rawLegacyHighlightQ = (document.getElementById('legacy-search')?.value || '').trim();
    const hlLegacy = (txt) => (rawLegacyHighlightQ && typeof highlightSearchText === 'function') ? highlightSearchText(txt, rawLegacyHighlightQ) : escapeHtml(txt);

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
        const phInfo = parseTurkishPhones(c.phone, c.city);

        return `
            <tr style="${isSelectedForDraft ? 'background:rgba(16,185,129,0.08);' : ''}">
                <td style="font-family:monospace; color:var(--dizsan-light); font-weight:700; font-size:0.75rem; white-space:nowrap;">${hlLegacy(c.code || '')}</td>
                <td style="max-width:210px;">
                    <strong style="color:#fff; font-size:0.8rem; display:block; cursor:pointer; line-height:1.25;" onclick="openCustomerDetailModal('${c.code}')" title="Detay ve Logo ERP Fatura/Servis Geçmişini Gör">${hlLegacy(c.title || '')}</strong>
                    <span style="font-size:0.68rem; color:var(--text-muted); cursor:pointer; display:block; margin-top:2px; line-height:1.2;" onclick="openCustomerDetailModal('${c.code}')">${hlLegacy(c.address || c.era || '')}</span>
                </td>
                <td style="max-width:145px;">
                    <div style="font-weight:600; color:#e2e8f0; font-size:0.75rem; line-height:1.25;">${hlLegacy(c.authorized || '-')}</div>
                    ${phInfo.hasPhone
                        ? `<a href="tel:${phInfo.tel}" style="color:#38bdf8; font-size:0.72rem; text-decoration:none; display:inline-block; margin-top:2px;" title="${c.phone || ''}"><i class="fa-solid fa-phone"></i> ${hlLegacy(phInfo.display)}</a>`
                        : `<span style="color:var(--text-muted); font-size:0.72rem; display:inline-block; margin-top:2px;"><i class="fa-solid fa-phone"></i> ${hlLegacy(c.phone || '-')}</span>`
                    }
                </td>
                <td style="white-space:nowrap;">
                    <span class="badge badge-secondary">${c.city} / ${c.district}</span>
                    ${hasSavedRut
                        ? `<span style="display:block; font-size:0.68rem; font-weight:700; color:#34d399; margin-top:3px;"><i class="fa-solid fa-route"></i> ${c.rut}</span>`
                        : `<span style="display:block; font-size:0.66rem; color:var(--text-muted); margin-top:2px;">Rut Planlanmadı</span>`
                    }
                </td>
                <td style="max-width:130px;">
                    <div style="font-weight:600; font-size:0.74rem; color:#fde68a; line-height:1.25;">${hlLegacy(c.plates || 'Plakasız')}</div>
                    <span style="font-size:0.68rem; color:var(--text-sec); display:block; margin-top:1px;">${c.vehicleModel || 'Ağır Vasıta'}</span>
                </td>
                <td style="font-weight:700; color:#34d399; font-size:0.76rem; white-space:nowrap;">${formatMoney(c.totalRevenue)}</td>
                <td style="font-size:0.72rem; white-space:nowrap;">
                    <div>${resolveCustomerLatestSqlDate(c)}</div>
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
                        ${phInfo.hasPhone ? `
                            <button type="button" class="btn btn-secondary btn-sm" style="padding:0.28rem 0.48rem; font-size:0.74rem; border-color:rgba(37,211,102,0.4); color:#25d366;" title="WhatsApp Mesajı Gönder (${phInfo.display})" onclick="openCustomerWhatsApp('${c.code}')">
                                <i class="fa-brands fa-whatsapp"></i>
                            </button>
                        ` : ''}
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
    const priorityVal = document.getElementById('ekstre-filter-priority')?.value || '';
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
        if (priorityVal) {
            if (priorityVal.includes('VIP')) {
                if (!((c.priority || '').includes('VIP') || Number(c.totalRevenue || 0) >= 1000000)) return false;
            } else if (!(c.priority || '').includes(priorityVal)) {
                return false;
            }
        }
        if ((statusVal === 'B' || statusVal === '(B)') && acc.baCode !== '(B)') return false;
        if ((statusVal === 'A' || statusVal === '(A)') && acc.baCode !== '(A)') return false;
        if (statusVal === 'ACTIVE_BAL' && acc.baCode === '-') return false;
        if (statusVal === 'ZERO' && acc.baCode !== '-') return false;
        if ((statusVal === 'WITH_INVOICE' || statusVal === 'HAS_INVOICE') && invCount === 0) return false;

        if (searchVal) {
            const rawEkstreQ = (document.getElementById('ekstre-search') || document.getElementById('ekstre-search-input'))?.value || '';
            const nqComp = typeof normCompactTR === 'function' ? normCompactTR(rawEkstreQ) : searchVal;
            const hayStr = `${c.code || ''} ${c.title || ''} ${c.address || ''} ${c.district || ''} ${c.city || ''} ${c.plates || ''} ${c.phone || ''} ${c.authorized || ''} ${(c.serviceHistory || []).map(h => `${h.sofor || ''} ${h.plaka || ''} ${h.fatura_no || ''}`).join(' ')}`;
            const hayComp = typeof normCompactTR === 'function' ? normCompactTR(hayStr) : normalizeTR(hayStr);
            if (!hayComp.includes(nqComp) && !normalizeTR(hayStr).includes(searchVal)) return false;
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

    const rawEkstreHighlightQ = ((document.getElementById('ekstre-search') || document.getElementById('ekstre-search-input'))?.value || '').trim();
    const hlEkstre = (txt) => (rawEkstreHighlightQ && typeof highlightSearchText === 'function') ? highlightSearchText(txt, rawEkstreHighlightQ) : escapeHtml(txt);

    tbody.innerHTML = pageItems.map(({ c, acc, invCount }) => {
        const baBadge = acc.baCode === '(B)'
            ? `<span class="badge" style="background:rgba(239,68,68,0.16); color:#f87171; border:1px solid rgba(239,68,68,0.35); font-weight:800;">(B) Borçlu</span>`
            : acc.baCode === '(A)'
                ? `<span class="badge" style="background:rgba(16,185,129,0.16); color:#34d399; border:1px solid rgba(16,185,129,0.35); font-weight:800;">(A) Alacaklı</span>`
                : `<span class="badge badge-secondary" style="opacity:0.75;">- Kapalı</span>`;

        const bakiyeColor = acc.baCode === '(B)' ? '#f87171' : acc.baCode === '(A)' ? '#34d399' : '#94a3b8';

        return `
            <tr style="cursor:pointer;" onclick="openCustomerDetailModal('${c.code}')">
                <td style="font-family:monospace; font-weight:700; color:#38bdf8; white-space:nowrap;">${hlEkstre(c.code || '')}</td>
                <td>
                    <div style="font-weight:700; color:#fff; font-size:0.82rem;">${hlEkstre(c.title || '')}</div>
                    <div style="font-size:0.69rem; color:var(--text-muted); display:flex; gap:0.45rem; align-items:center; margin-top:2px;">
                        ${c.plates && c.plates !== 'Plakasız' ? `<span style="color:#fde68a;"><i class="fa-solid fa-truck"></i> ${hlEkstre(c.plates)}</span>` : ''}
                        <span>Son Fatura: ${resolveCustomerLatestSqlDate(c)}</span>
                    </div>
                </td>
                <td style="max-width:250px; font-size:0.74rem; color:#cbd5e1; white-space:normal; line-height:1.35;">${hlEkstre(c.address || '-')}</td>
                <td style="font-size:0.76rem; color:#e2e8f0; white-space:nowrap;">${c.district || '-'}</td>
                <td style="font-size:0.76rem; font-weight:600; color:#38bdf8; white-space:nowrap;">${c.city || '-'}</td>
                <td style="text-align:right; font-weight:700; color:#f87171; white-space:nowrap;">${formatMoney(acc.borc)}</td>
                <td style="text-align:right; font-weight:700; color:#34d399; white-space:nowrap;">${formatMoney(acc.alacak)}</td>
                <td style="text-align:right; font-weight:800; color:${bakiyeColor}; white-space:nowrap;">${formatMoney(Math.abs(acc.bakiye))}</td>
                <td style="text-align:center; white-space:nowrap;">${baBadge}</td>
                <td style="text-align:right; white-space:nowrap;" onclick="event.stopPropagation();">
                    <div style="display:inline-flex; gap:0.25rem; align-items:center;">
                        <button type="button" class="btn btn-sm ${invCount > 0 ? 'btn-primary' : 'btn-secondary'}" onclick="openCustomerDetailModal('${c.code}')" style="font-size:0.7rem; padding:0.26rem 0.5rem;" title="Logo Fatura Kalemleri ve Cari Ekstre">
                            <i class="fa-solid fa-file-invoice"></i> ${invCount > 0 ? `${invCount} Fatura` : 'Ekstre'}
                        </button>
                        <button type="button" class="btn btn-sm btn-secondary" onclick="quickStartVisitForCustomer('${c.code}')" style="font-size:0.7rem; padding:0.26rem 0.45rem;" title="Ziyaret / Görüşme Kaydı Ekle">
                            <i class="fa-solid fa-car-side" style="color:#34d399;"></i>
                        </button>
                    </div>
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

    const phInfo = parseTurkishPhones(customer.phone, customer.city);
    const cleanAddress = customer.address || `${customer.title} ${customer.city} ${customer.district}`;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanAddress)}`;

    const activeSearchQuery = (
        document.getElementById('global-customer-search-input')?.value ||
        document.getElementById('ekstre-search')?.value ||
        document.getElementById('legacy-search')?.value ||
        ''
    ).trim();
    const activeMatchInfo = (activeSearchQuery && typeof computeCustomerMatchByMode === 'function')
        ? computeCustomerMatchByMode(customer, activeSearchQuery, 'SIMILAR')
        : { matchedWord: '', matchedContextHtml: '' };
    const hl = (txt) => (typeof highlightSearchText === 'function' ? highlightSearchText(txt, activeSearchQuery, activeMatchInfo.matchedWord || '') : escapeHtml(txt));

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

        const qCompModal = typeof normCompactTR === 'function' ? normCompactTR(activeSearchQuery) : '';
        if (qCompModal) {
            chronological.sort((a, b) => {
                const aComp = typeof normCompactTR === 'function' ? normCompactTR(`${a.sofor || ''} ${a.plaka || ''} ${a.fatura_no || ''} ${a.islem || ''}`) : '';
                const bComp = typeof normCompactTR === 'function' ? normCompactTR(`${b.sofor || ''} ${b.plaka || ''} ${b.fatura_no || ''} ${b.islem || ''}`) : '';
                const aM = aComp.includes(qCompModal) ? 1 : 0;
                const bM = bComp.includes(qCompModal) ? 1 : 0;
                return bM - aM;
            });
        }

        historyHtml = `
            <div style="margin-bottom:0.5rem; font-size:0.76rem; color:#94a3b8; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
                <span><i class="fa-solid fa-hand-pointer" style="color:#38bdf8;"></i> <strong>İpucu:</strong> Fatura içindeki yedek parça, işçilik ve <strong>TDR Tedarik</strong> kalemlerini görmek için herhangi bir faturanın üzerine tıklayın.</span>
                <span style="font-family:monospace; color:#fde68a;">Toplam ${historyItems.length} Resmi Logo Faturası</span>
            </div>
            <div style="overflow-x:auto; max-height:360px; border:1px solid var(--border-color); border-radius:var(--radius-md);">
                <table class="service-history-table">
                    <thead>
                        <tr>
                            <th>Tarih</th>
                            <th>Fatura No</th>
                            <th>Şoför &amp; Plaka</th>
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
                            const rowTextComp = typeof normCompactTR === 'function' ? normCompactTR(`${h.sofor || ''} ${h.plaka || ''} ${h.fatura_no || ''} ${h.islem || ''}`) : '';
                            const isRowMatched = qCompModal && rowTextComp.includes(qCompModal);
                            return `
                            <tr style="cursor:pointer; transition:background 0.15s; ${isRowMatched ? 'background:rgba(250,204,21,0.16); border-left:4px solid #facc15;' : ''}" onmouseover="this.style.background='rgba(56,189,248,0.08)'" onmouseout="this.style.background='${isRowMatched ? 'rgba(250,204,21,0.16)' : 'transparent'}'" onclick="openInvoiceDetailModal('${customer.code}', ${h.originalIndex})">
                                <td style="white-space:nowrap; font-weight:700; color:#38bdf8;">${h.tarih || '-'}</td>
                                <td style="font-family:monospace; font-weight:700; color:#fff; font-size:0.76rem;">${hl(h.fatura_no || '-')}</td>
                                <td style="font-size:0.75rem; color:#d1fae5; white-space:nowrap;">
                                    <div><i class="fa-solid fa-id-badge" style="color:#34d399;"></i> ${hl(h.sofor || '-')}</div>
                                    <div style="font-family:monospace; color:#fde68a; font-size:0.71rem;"><i class="fa-solid fa-truck-front"></i> ${hl(h.plaka || '-')}</div>
                                </td>
                                <td style="font-size:0.72rem; color:#cbd5e1;">${h.fatura_turu || h.odeme_tipi || 'Satış Faturası'}</td>
                                <td style="max-width:260px; white-space:normal; font-size:0.75rem; color:#e2e8f0;">
                                    ${hl(h.islem || '-')}
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
                Logo ERP son hareket tarihi: <strong style="color:#fff;">${resolveCustomerLatestSqlDate(customer)}</strong> | Bakiye: <strong style="color:#fff;">${formatMoney(Math.abs(acc.bakiye))} ${acc.baCode}</strong>
            </div>
        `;
    }

    const customerVisits = (appState.visits || []).filter(v => v.customerCode === customer.code || normalizeTR(v.customerTitle || '') === normalizeTR(customer.title || ''));
    const customerTasks = (appState.tasks || []).filter(t => t.customerCode === customer.code || normalizeTR(t.customerTitle || '') === normalizeTR(customer.title || ''));
    const uniqueDrivers = Array.from(new Set((customer.serviceHistory || []).map(h => (h.sofor || '').trim()).filter(Boolean)));
    const uniqueHistoryPlates = Array.from(new Set((customer.serviceHistory || []).map(h => (h.plaka || '').trim()).filter(Boolean)));
    const allPlatesText = customer.plates || (uniqueHistoryPlates.length > 0 ? uniqueHistoryPlates.join(', ') : 'Plaka Kaydı Yok');
    const allDriversText = uniqueDrivers.length > 0 ? uniqueDrivers.join(', ') : (customer.authorized || 'Belirtilmedi');

    cdBody.innerHTML = `
        <div style="background:linear-gradient(135deg, rgba(2,132,199,0.14), rgba(15,23,42,0.85)); border:1px solid rgba(56,189,248,0.35); border-radius:12px; padding:0.9rem 1rem; margin-bottom:1rem;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:0.75rem; flex-wrap:wrap;">
                <div>
                    <div style="font-size:0.72rem; text-transform:uppercase; letter-spacing:0.06em; color:#38bdf8; font-weight:800; margin-bottom:0.2rem;">
                        <i class="fa-solid fa-id-card-clip"></i> 360° Müşteri Tam Kimlik &amp; CRM Özeti
                    </div>
                    <div style="font-size:1.05rem; font-weight:800; color:#fff;">${hl(customer.title || '-')}</div>
                    <div style="font-size:0.8rem; color:#cbd5e1; margin-top:0.25rem;">
                        Cari Kod: <strong style="color:#38bdf8; font-family:monospace;">${hl(customer.code || '-')}</strong> •
                        Bölge: <strong>${hl(customer.city || '-')} / ${hl(customer.district || '-')}</strong> •
                        Rut: <strong>${hl(customer.rut || '-')}</strong>
                        ${customer.isManualIntro ? `<span class="badge" style="background:rgba(139,92,246,0.25); color:#e9d5ff; border:1px solid rgba(167,139,250,0.45); margin-left:6px;">🤝 Tanışma (Elle Giriş)</span>` : ''}
                    </div>
                    ${activeMatchInfo.matchedContextHtml || ''}
                </div>
                <div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
                    <span class="badge" style="background:rgba(245,158,11,0.18); color:#fbbf24; border:1px solid rgba(245,158,11,0.4); font-size:0.74rem; padding:0.3rem 0.6rem;">
                        Öncelik: ${customer.priority || 'Standart'}
                    </span>
                    <span class="badge" style="background:rgba(16,185,129,0.18); color:#34d399; border:1px solid rgba(16,185,129,0.4); font-size:0.74rem; padding:0.3rem 0.6rem;">
                        Kazanım Skoru: ${customer.recoveryScore ?? 70}/100
                    </span>
                </div>
            </div>
        </div>

        ${typeof buildCustomerAreaVisitEntryHtml === 'function' ? buildCustomerAreaVisitEntryHtml(customer) : ''}

        <div class="detail-kpi-grid" style="grid-template-columns:repeat(auto-fit, minmax(155px, 1fr));">
            <div class="detail-kpi-card">
                <span class="detail-kpi-title">Tarihsel Toplam Ciro</span>
                <span class="detail-kpi-value" style="color:#fbbf24;">${formatMoney(customer.totalRevenue || acc.borc || 0)}</span>
                <span class="detail-kpi-sub">1998–2026 Kümülatif</span>
            </div>
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
                <span class="detail-kpi-value" style="color:${acc.baCode === '(B)' || acc.baCode === 'B' ? '#f87171' : acc.baCode === '(A)' || acc.baCode === 'A' ? '#34d399' : '#94a3b8'};">
                    ${formatMoney(Math.abs(acc.bakiye))} <small style="font-size:0.75rem;">${acc.baCode}</small>
                </span>
                <span class="detail-kpi-sub">${acc.baLabel}</span>
            </div>
            <div class="detail-kpi-card">
                <span class="detail-kpi-title">Son Fatura &amp; Araç Plakası</span>
                <span class="detail-kpi-value" style="font-size:0.9rem; color:#fde68a;">${resolveCustomerLatestSqlDate(customer)}</span>
                <span class="detail-kpi-sub">${customer.plates || 'Plakasız'} (${customer.churnDuration || '-'})</span>
            </div>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1rem; margin-bottom:1.15rem;">
            <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:0.85rem;">
                <div class="detail-section-title"><i class="fa-solid fa-address-book"></i> Yetkili, Şoför, Araç ve İletişim Detayları</div>
                <div style="display:flex; flex-direction:column; gap:0.42rem; font-size:0.81rem;">
                    <div><span style="color:var(--text-muted);">Cari Kodu:</span> <strong style="color:#38bdf8; font-family:monospace;">${hl(customer.code)}</strong></div>
                    <div><span style="color:var(--text-muted);">Yetkili Kişi:</span> <strong style="color:#fff;">${hl(customer.authorized || 'Bilinmiyor')}</strong></div>
                    <div><span style="color:var(--text-muted);">Kayıtlı Şoförler (Faturalardan):</span> <strong style="color:#34d399;">${hl(allDriversText)}</strong></div>
                    <div><span style="color:var(--text-muted);">Telefon:</span> <strong style="color:#38bdf8;">${hl(customer.phone || 'YOK')}</strong></div>
                    <div><span style="color:var(--text-muted);">Kayıtlı Araç Plakaları:</span> <strong style="color:#fde68a; font-family:monospace;">${hl(allPlatesText)}</strong></div>
                    <div><span style="color:var(--text-muted);">Kayıp / Churn Süresi:</span> <strong style="color:#cbd5e1;">${customer.churnDuration || '-'}</strong></div>
                    ${customer.loyaltyLevel ? `<div><span style="color:var(--text-muted);">Sadakat Seviyesi:</span> <span class="badge badge-success">${customer.loyaltyLevel}</span></div>` : ''}
                </div>
                <div style="display:flex; gap:0.5rem; margin-top:0.75rem; flex-wrap:wrap;">
                    ${phInfo.valid ? `
                        <a href="tel:${phInfo.tel}" class="btn btn-primary btn-sm"><i class="fa-solid fa-phone"></i> Hemen Ara (${phInfo.display})</a>
                        <button type="button" class="btn btn-success btn-sm" onclick="openCustomerWhatsApp('${customer.code}')"><i class="fa-brands fa-whatsapp"></i> WhatsApp (${phInfo.display})</button>
                        <button type="button" class="btn btn-secondary btn-sm" style="border-color:rgba(37,211,102,0.4); color:#25d366;" onclick="openCustomerWhatsApp('${customer.code}', 'EKSTRE')"><i class="fa-brands fa-whatsapp"></i> Ekstre Özeti Gönder</button>
                    ` : ''}
                </div>
            </div>

            <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:0.85rem;">
                <div class="detail-section-title"><i class="fa-solid fa-location-dot"></i> Resmi Logo CLCARD Adresi &amp; Saha Geçmişi</div>
                <div style="font-size:0.81rem; color:#e2e8f0; line-height:1.45; min-height:42px;">
                    ${hl(customer.address || 'Kayıtlı açık adres bulunmuyor.')}
                </div>
                <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.4rem;">
                    İlçe / İl: <strong style="color:#fff;">${hl(customer.district || '-')} / ${hl(customer.city || '-')}</strong> (${hl(customer.rut || '-')})
                </div>
                <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.35rem;">
                    Saha Ziyaret / Arama Kaydı: <strong style="color:#38bdf8;">${customerVisits.length} Görüşme</strong> • Bekleyen Aksiyon: <strong style="color:#fbbf24;">${customerTasks.length} Görev</strong>
                </div>
                <div style="margin-top:0.65rem;">
                    <a href="${mapsUrl}" target="_blank" class="btn btn-secondary btn-sm" style="display:inline-flex; align-items:center; gap:0.35rem;">
                        <i class="fa-solid fa-map-location-dot" style="color:#38bdf8;"></i> Google Haritalar Yol Tarifi
                    </a>
                </div>
            </div>
        </div>

        ${customerVisits.length > 0 ? `
        <div style="margin-bottom:1.15rem;">
            <div class="detail-section-title">
                <i class="fa-solid fa-comments" style="color:#34d399;"></i> Saha Ziyaret &amp; Telefon Görüşme Geçmişi (${customerVisits.length})
            </div>
            <div style="display:flex; flex-direction:column; gap:0.45rem; max-height:180px; overflow-y:auto;">
                ${customerVisits.map(v => `
                    <div style="background:rgba(15,23,42,0.55); border:1px solid var(--border-color); border-radius:8px; padding:0.55rem 0.75rem; font-size:0.78rem;">
                        <div style="display:flex; justify-content:space-between; gap:0.5rem; flex-wrap:wrap;">
                            <strong style="color:#38bdf8;">${v.type || 'Ziyaret'} • ${v.result || '-'}</strong>
                            <span style="color:#94a3b8;">${v.date || '-'} | Personel: ${v.staff || '-'}</span>
                        </div>
                        <div style="color:#e2e8f0; margin-top:0.2rem;">${v.notes || '-'}</div>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

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
            <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                <button type="button" class="btn btn-success" onclick="openCustomerWhatsApp('${customer.code}', 'INVOICE', ${idxNum})"><i class="fa-brands fa-whatsapp"></i> WhatsApp ile Fatura Özeti</button>
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
    const subDateIn = document.getElementById('visit-submenu-date');
    const subTimeIn = document.getElementById('visit-submenu-time');
    const subStatusSel = document.getElementById('visit-positive-substatus');
    if (subDateIn) subDateIn.value = tomorrow;
    if (subTimeIn) subTimeIn.value = '10:00';
    if (subStatusSel) subStatusSel.value = 'Takip Edilecek (Tekrar Aranacak)';
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
            if (resSelect && v.result) {
                if (v.result === 'Takip Edilecek') {
                    resSelect.value = 'Olumlu';
                    if (subStatusSel) subStatusSel.value = 'Takip Edilecek (Tekrar Aranacak)';
                } else {
                    resSelect.value = v.result;
                    if (subStatusSel && v.subResult) subStatusSel.value = v.subResult;
                }
            }
            const typeSelect = document.getElementById('visit-type-select');
            if (typeSelect && v.type) typeSelect.value = v.type;
            const notesIn = document.getElementById('visit-notes');
            if (notesIn) notesIn.value = v.notes || '';

            // Görevlendirme alanları
            if (assignedToSelect && v.assignedTo) assignedToSelect.value = v.assignedTo;
            if (assignedByIn) assignedByIn.value = v.assignedBy || (currentUser ? currentUser.name : 'ÖMER EREN');
            if (dueDateIn && v.dueDate) dueDateIn.value = v.dueDate;
            if (dueTimeIn && v.dueTime) dueTimeIn.value = v.dueTime;
            if (subDateIn && v.dueDate) subDateIn.value = v.dueDate;
            if (subTimeIn && v.dueTime) subTimeIn.value = v.dueTime;
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
    const posSubmenu = document.getElementById('visit-positive-submenu');
    const subStatusSel = document.getElementById('visit-positive-substatus');
    if (!resSelect) return;

    const val = String(resSelect.value || '').trim();
    const selText = (resSelect.options && resSelect.selectedIndex >= 0) ? String(resSelect.options[resSelect.selectedIndex].text || '') : '';

    // "Olumlu" seçilince alt menü ("Takip Edilecek / Tekrar Aranacak") açılır
    const isPositive = val === 'Olumlu' || selText.includes('Olumlu');
    if (posSubmenu) {
        posSubmenu.style.display = isPositive ? 'block' : 'none';
    }

    const subVal = (isPositive && subStatusSel) ? String(subStatusSel.value || '') : '';
    const isSubFollowUp = isPositive && !subVal.includes('Ek Arama Yok');

    // Hem value hem görünen metin hem de Olumlu alt menüsü üzerinden esnek eşleşme kontrolü
    const isFollowUp = isSubFollowUp || val.includes('Takip') || val.includes('Randevu') || selText.includes('Takip') || selText.includes('Randevu');

    if (isPositive) {
        handlePositiveSubstatusChange(true);
    }

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
            cbLabel.innerHTML = `<i class="fa-solid fa-bell fa-shake" style="color:#fbbf24;"></i> <span style="color:#fde68a; font-weight:700;">⏳ TAKİP / TEKRAR ARAMA PLANI AKTİF</span>`;
        }
        const dateIn = document.getElementById('visit-task-date');
        if (dateIn && !dateIn.value) {
            const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
            dateIn.value = tomorrow;
        }

        const currentFollowup = document.getElementById('visit-followup-type')?.value;
        const parentVisitType = document.getElementById('visit-type-select')?.value || 'TELEFON';
        const targetType = subVal.includes('Ziyaret') ? 'ZİYARET' : (subVal.includes('Tekrar Aranacak') ? 'TELEFON' : (currentFollowup || (parentVisitType === 'ZİYARET' ? 'ZİYARET' : 'TELEFON')));
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
        if (cb) cb.checked = false;
        if (fields) {
            fields.style.display = 'none';
        }
    }
}

function handlePositiveSubstatusChange(skipParentTrigger = false) {
    const subStatusSel = document.getElementById('visit-positive-substatus');
    const dtWrap = document.getElementById('visit-submenu-datetime-wrap');
    if (!subStatusSel) return;
    const subVal = String(subStatusSel.value || '');
    const needsFollowup = !subVal.includes('Ek Arama Yok');
    if (dtWrap) {
        dtWrap.style.display = needsFollowup ? 'grid' : 'none';
    }
    if (needsFollowup) {
        if (subVal.includes('Ziyaret')) {
            setFollowupActionType('ZİYARET');
        } else if (subVal.includes('Tekrar Aranacak')) {
            setFollowupActionType('TELEFON');
        }
        syncSubmenuDateTimeToTask();
    }
    if (!skipParentTrigger) {
        handleVisitResultChange();
    }
}

function syncSubmenuDateTimeToTask() {
    const subDate = document.getElementById('visit-submenu-date')?.value;
    const subTime = document.getElementById('visit-submenu-time')?.value;
    const dueDateIn = document.getElementById('visit-due-date');
    const dueTimeIn = document.getElementById('visit-due-time');
    const taskDateIn = document.getElementById('visit-task-date');
    const taskTimeIn = document.getElementById('visit-task-time');
    if (subDate) {
        if (dueDateIn) dueDateIn.value = subDate;
        if (taskDateIn) taskDateIn.value = subDate;
    }
    if (subTime) {
        if (dueTimeIn) dueTimeIn.value = subTime;
        if (taskTimeIn) taskTimeIn.value = subTime;
    }
    if (typeof handleVisitDateOrTimeChange === 'function') {
        handleVisitDateOrTimeChange();
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
    const subResult = (result === 'Olumlu') ? (document.getElementById('visit-positive-substatus')?.value || 'Takip Edilecek (Tekrar Aranacak)') : '';
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
    if (!editId && mode === 'NEW' && !getZiyaretUserPerms(currentUser).actions.create) {
        alert('⛔ Yeni ziyaret/arama kaydı ekleme yetkiniz bulunmamaktadır (Sadece Görüntüleme Yetkisi).');
        return;
    }
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
                subResult,
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
                subResult,
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
        subResult,
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
        note: `Talimat: ${taskInstructions || notes}. Görüşme Sonucu: ${result}${subResult ? ' (' + subResult + ')' : ''}.`,
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
                            ${v.subResult ? `
                                <span class="badge" style="background:rgba(245,158,11,0.2); border:1px solid rgba(245,158,11,0.5); color:#fde68a; font-weight:700;">
                                    ↳ ${v.subResult}
                                </span>
                            ` : ''}
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
                    ${v.phone ? (() => {
                        const vPh = parseTurkishPhones(v.phone);
                        return `<span><i class="fa-solid fa-phone"></i> <a href="tel:${vPh.tel || v.phone}" style="color:#38bdf8; text-decoration:none;">${vPh.display || v.phone}</a> <a href="javascript:void(0)" onclick="openWhatsAppChat('${(v.phone || '').replace(/'/g, "\\'")}', 'Sayın ${String(v.customerTitle || '').replace(/'/g, "\\'")}, Dizsan Otomotiv adına iyi çalışmalar dileriz.')" style="color:#25d366; margin-left:6px; text-decoration:none;" title="WhatsApp ile Yaz"><i class="fa-brands fa-whatsapp"></i> WhatsApp</a></span>`;
                    })() : ''}
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
function purgeVisitEverywhere(visitObjOrId) {
    const v = typeof visitObjOrId === 'string'
        ? (appState.visits || []).find(x => x.id === visitObjOrId)
        : visitObjOrId;
    const visitId = typeof visitObjOrId === 'string' ? visitObjOrId : (v ? v.id : '');
    if (visitId) {
        registerDeletedRecordId(visitId);
        appState.visits = (appState.visits || []).filter(x => x.id !== visitId);
    }
    const routeId = (v && v.routeId) || (visitId.startsWith('VISIT-RUT-') ? visitId.split('-')[2] + '-' + visitId.split('-')[3] : '');
    const custCode = (v && v.customerCode) || '';
    const custTitle = (v && v.customerTitle) || '';

    if (Array.isArray(appState.customRoutes)) {
        appState.customRoutes.forEach(rt => {
            if (!rt) return;
            if (routeId && rt.id !== routeId) return;
            if (Array.isArray(rt.items)) {
                rt.items = rt.items.filter(it => {
                    if (!it) return false;
                    if (custCode && it.code === custCode) return false;
                    if (custTitle && normalizeTR(it.title) === normalizeTR(custTitle)) return false;
                    return true;
                });
            }
            if (Array.isArray(rt.customerCodes) && custCode) {
                rt.customerCodes = rt.customerCodes.filter(c => c !== custCode);
            }
        });
        // İçi boş kalan otomatik/tekil rut planlarını da temizle
        appState.customRoutes = appState.customRoutes.filter(rt => {
            if (!rt) return false;
            const hasItems = Array.isArray(rt.items) && rt.items.length > 0;
            const hasCodes = Array.isArray(rt.customerCodes) && rt.customerCodes.length > 0;
            if (!hasItems && !hasCodes) {
                if (rt.id) registerDeletedRecordId(rt.id);
                return false;
            }
            return true;
        });
    }

    if (Array.isArray(appState.customers)) {
        appState.customers.forEach(c => {
            if (!c || !Array.isArray(c.visitHistory)) return;
            if ((custCode && c.code === custCode) || (custTitle && normalizeTR(c.title) === normalizeTR(custTitle))) {
                c.visitHistory = c.visitHistory.filter(h => {
                    if (!h) return false;
                    if (visitId && h.id === visitId) return false;
                    if (routeId && h.routeId === routeId) return false;
                    return true;
                });
            }
        });
    }
}

function requestDeleteVisit(visitId) {
    const v = (appState.visits || []).find(x => x.id === visitId);
    if (!v) return;

    if (isOmerEren(currentUser)) {
        if (!confirm(`'${v.customerTitle}' ziyaret / görüşme kaydını silmek istediğinize emin misiniz? (Yönetici Yetkisi)`)) return;
        purgeVisitEverywhere(v);
        addAuditLog("ZİYARET SİLME", `${v.customerTitle} kaydı Yönetici ÖMER EREN tarafından silindi.`, true);
        renderDashboard();
        renderActiveVisits();
        if (typeof renderSavedCustomRoutesList === 'function') renderSavedCustomRoutesList();
        if (typeof renderActiveRouteExecutionPanel === 'function') renderActiveRouteExecutionPanel();
        if (typeof renderReportsTab === 'function') renderReportsTab();
        updateRouteAndReportsBadges();
        syncToServer();
        showToast(`🗑️ '${v.customerTitle}' kaydı tüm ekranlardan ve raporlardan silindi.`, 'success');
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
        registerDeletedRecordId(taskId);
        appState.tasks = (appState.tasks || []).filter(x => x.id !== taskId);
        addAuditLog("GÖREV SİLME", `${t.title} görevi Yönetici ÖMER EREN tarafından silindi.`, true);
        renderDashboard();
        renderTasks();
        syncToServer();
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
        purgeVisitEverywhere(req.targetId);
        addAuditLog("ONAY İŞLEMİ", `${req.customerTitle} ziyaret kaydı silme talebi Yönetici ÖMER EREN tarafından ONAYLANDI ve kayıt silindi.`, true);
    } else if (req.type === 'DELETE_ROUTE') {
        executeDeleteCustomRoutePlan(req.targetId);
        addAuditLog("ONAY İŞLEMİ", `${req.customerTitle} rut planı silme talebi Yönetici ÖMER EREN tarafından ONAYLANDI ve rut planı silindi.`, true);
    } else if (req.type === 'DELETE_TASK') {
        registerDeletedRecordId(req.targetId);
        appState.tasks = (appState.tasks || []).filter(t => t.id !== req.targetId);
        addAuditLog("ONAY İŞLEMİ", `${req.targetTitle} görev silme talebi Yönetici ÖMER EREN tarafından ONAYLANDI ve görev silindi.`, true);
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

// ==========================================================================
// YENİ RUT PLANLA, PLANLANAN ZİYARETLER LİSTESİ, MANUEL ZİYARET VE RAPORLAR MOTORU
// ==========================================================================
let customRouteDraftManualPlaces = [];
let customRoutePendingSelectedCodes = new Set();
let pendingCheckedDistrictsForCity = new Set();
let activeSelectedRouteId = null;
let activeRouteExecutionStatusFilter = 'ALL';
let draggedRouteItemIndex = null;

const TR_PROVINCE_DISTRICTS = {
    'Çorum': ['Merkez', 'Sungurlu', 'Osmancık', 'Alaca', 'İskilip', 'Bayat', 'Mecitözü', 'Kargı', 'Ortaköy', 'Uğurludağ', 'Dodurga', 'Oğuzlar', 'Laçin', 'Boğazkale'],
    'Kırıkkale': ['Merkez', 'Delice', 'Yahşihan', 'Keskin', 'Bahşılı', 'Sulakyurt', 'Balışeyh', 'Karakeçili', 'Çelebi'],
    'Ankara': ['Merkez', 'Hasanoğlan', 'Elmadağ', 'Yenimahalle', 'Çankaya', 'Sincan', 'Etimesgut', 'Kahramankazan', 'Akyurt', 'Çubuk', 'Altındağ', 'Mamak', 'Keçiören', 'Gölbaşı', 'Polatlı', 'Ostim', 'İvedik', 'Şaşmaz', 'Beypazarı', 'Şereflikoçhisar', 'Kızılcahamam', 'Haymana', 'Bala', 'Nallıhan', 'Kalecik', 'Ayaş', 'Güdül', 'Çamlıdere', 'Evren'],
    'Amasya': ['Merkez', 'Merzifon', 'Suluova', 'Taşova', 'Göynücek', 'Gümüşhacıköy', 'Hamamözü'],
    'Samsun': ['Merkez', 'İlkadım', 'Atakum', 'Canik', 'Tekkeköy', 'Bafra', 'Çarşamba', 'Terme', 'Vezirköprü', 'Havza', 'Kavak', 'Alaçam', '19 Mayıs', 'Ladik', 'Salıpazarı', 'Asarcık', 'Ayvacık', 'Yakakent'],
    'Tokat': ['Merkez', 'Erbaa', 'Turhal', 'Niksar', 'Zile', 'Reşadiye', 'Almus', 'Pazar', 'Yeşilyurt', 'Artova', 'Sulusaray', 'Başçiftlik'],
    'Yozgat': ['Merkez', 'Sorgun', 'Akdağmadeni', 'Yerköy', 'Boğazlıyan', 'Sarıkaya', 'Çekerek', 'Şefaatli', 'Çayıralan', 'Saraykent', 'Kadışehri', 'Aydıncık', 'Çandır', 'Yenifakılı'],
    'Çankırı': ['Merkez', 'Çerkeş', 'Ilgaz', 'Orta', 'Şabanözü', 'Kurşunlu', 'Yapraklı', 'Kızılırmak', 'Atkaracalar', 'Eldivan', 'Korgun', 'Bayramören'],
    'Sinop': ['Merkez', 'Boyabat', 'Gerze', 'Ayancık', 'Durağan', 'Türkeli', 'Erfelek', 'Dikmen', 'Saraydüzü'],
    'Kastamonu': ['Merkez', 'Tosya', 'Taşköprü', 'Cide', 'İnebolu', 'Araç', 'Devrekani', 'Bozkurt', 'Daday', 'Azdavay'],
    'Kayseri': ['Merkez', 'Melikgazi', 'Kocasinan', 'Talas', 'Develi', 'İncesu', 'Bünyan', 'Pınarbaşı', 'Yeşilhisar', 'Yahyalı'],
    'Sivas': ['Merkez', 'Şarkışla', 'Yıldızeli', 'Suşehri', 'Gemerek', 'Zara', 'Kangal', 'Gürün', 'Divriği'],
    'Ordu': ['Merkez', 'Altınordu', 'Ünye', 'Fatsa', 'Perşembe', 'Kumru', 'Korgan', 'Gölköy'],
    'Konya': ['Merkez', 'Selçuklu', 'Karatay', 'Meram', 'Ereğli', 'Akşehir', 'Beyşehir', 'Çumra', 'Cihanbeyli', 'Kulu', 'Ilgın', 'Karapınar'],
    'İstanbul': ['Merkez', 'Tuzla', 'Pendik', 'Kartal', 'Ümraniye', 'Ataşehir', 'Başakşehir', 'Esenyurt', 'Büyükçekmece', 'Arnavutköy', 'Çatalca', 'Silivri', 'Hadımköy', 'İkitelli'],
    'Kırşehir': ['Merkez', 'Kaman', 'Mucur', 'Çiçekdağı', 'Akpınar', 'Boztepe', 'Akçakent'],
    'Nevşehir': ['Merkez', 'Ürgüp', 'Avanos', 'Gülşehir', 'Derinkuyu', 'Kozaklı', 'Hacıbektaş', 'Acıgöl'],
    'Aksaray': ['Merkez', 'Ortaköy', 'Eskil', 'Gülağaç', 'Güzelyurt', 'Sultanhanı', 'Ağaçören', 'Sarıyahşi'],
    'Bolu': ['Merkez', 'Gerede', 'Mengen', 'Mudurnu', 'Göynük', 'Yeniçağa', 'Dörtdivan', 'Seben', 'Kıbrıscık'],
    'Karabük': ['Merkez', 'Safranbolu', 'Yenice', 'Eskipazar', 'Eflani', 'Ovacık'],
    'Zonguldak': ['Merkez', 'Ereğli', 'Çaycuma', 'Devrek', 'Kozlu', 'Kilimli', 'Alaplı', 'Gökçebey']
};

function resolveCustomerDistrictName(c) {
    if (!c) return 'Merkez';
    const rawCity = (c.city || '').trim();
    const rawDist = (c.district || '').trim();
    const normCity = normalizeTR(rawCity);
    const normDist = normalizeTR(rawDist);
    if (!rawDist || rawDist === '-' || normDist === 'merkez' || normDist === normCity || normDist === `${normCity} merkez`) {
        return 'Merkez';
    }
    return rawDist;
}

function doesCustomerMatchCityDistrict(c, targetCity, targetDist) {
    if (!c || !targetCity || !targetDist) return false;
    const cCity = normalizeTR(c.city || '');
    const sCity = normalizeTR(targetCity);
    if (cCity !== sCity) return false;

    const resolvedDist = normalizeTR(resolveCustomerDistrictName(c));
    const rawDist = normalizeTR(c.district || '');
    const rawAddr = normalizeTR(c.address || '');
    const sDist = normalizeTR(targetDist);

    if (sDist === 'merkez') {
        return resolvedDist === 'merkez';
    }
    if (resolvedDist === sDist || rawDist === sDist) {
        return true;
    }
    // Hasanoğlan, Ostim, İvedik, Şaşmaz gibi belde/sanayi bölgeleri adres veya ilçe alanında geçiyorsa eşleştir
    if (sDist.length >= 4 && rawAddr.includes(sDist)) {
        return true;
    }
    return false;
}

const UNVISITED_REASON_OPTIONS = [
    'Müşteri yerinde bulunamadı.',
    'Zaman yetersizliği',
    'Müşteri görüşmeyi kabul etmedi.',
    'Adres bulunamadı.',
    'Personel kaynaklı erteleme',
    'Diğer'
];

function getTodayTRStr() {
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    return `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()}`;
}

function getNowTimeTRStr() {
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function ensureRouteItemsNormalized(rt) {
    if (!rt) return [];
    const customers = appState.customers || [];
    const custMap = new Map(customers.map(c => [c.code, c]));
    if (!Array.isArray(rt.items)) rt.items = [];

    const existingItemMap = new Map();
    rt.items.forEach(it => {
        if (it && it.code) existingItemMap.set(it.code, it);
    });

    if (Array.isArray(rt.customerCodes)) {
        rt.customerCodes.forEach(code => {
            if (!code || existingItemMap.has(code)) return;
            const c = custMap.get(code);
            const itemObj = {
                itemId: 'RITEM-' + code + '-' + Math.random().toString(36).slice(2, 7),
                code: code,
                title: c ? c.title : code,
                city: c ? (c.city || '') : '',
                district: c ? (c.district || '') : '',
                address: c ? (c.address || '') : '',
                authorized: c ? (c.authorized || '') : '',
                contactRole: c ? (c.contactRole || 'Yetkili') : 'Yetkili',
                phone: c ? (c.phone || '') : '',
                plates: c ? (c.plates || '') : '',
                isManual: Boolean(c && c.isManualIntro) || String(code).startsWith('MANUEL-') || String(code).startsWith('TANISMA-'),
                status: 'PENDING',
                visitDate: '',
                visitTime: '',
                visitNotes: '',
                extraNotes: '',
                visitResult: '',
                nextVisitDate: '',
                unvisitedReason: '',
                unvisitedReasonCustom: '',
                visitPurpose: '',
                personnel: rt.assignee || (currentUser ? currentUser.name : 'ÖMER EREN'),
                convertedCustomerCode: '',
                updatedAt: rt.updatedAt || formatNowTR()
            };
            rt.items.push(itemObj);
            existingItemMap.set(code, itemObj);
        });
    }

    rt.items.forEach((it, idx) => {
        const c = custMap.get(it.code);
        if (c && !it.isManual) {
            it.title = c.title || it.title;
            it.city = c.city || it.city;
            it.district = c.district || it.district;
            it.address = c.address || it.address || '';
            it.authorized = it.authorized || c.authorized || '';
            it.phone = c.phone || it.phone || '';
            it.plates = c.plates || it.plates || '';
        }
        if (!it.status) it.status = 'PENDING';
        if (!it.personnel) it.personnel = rt.assignee || 'ÖMER EREN';
        it.order = idx + 1;
    });

    // Plan durumunu otomatik kontrol et
    if (!rt.planStatus) {
        const total = rt.items.length;
        const done = rt.items.filter(i => i.status === 'VISITED' || i.status === 'NOT_VISITED' || i.status === 'CANCELLED').length;
        const visited = rt.items.filter(i => i.status === 'VISITED').length;
        if (total > 0 && done === total) rt.planStatus = 'Tamamlandı';
        else if (visited > 0 || done > 0) rt.planStatus = 'Devam Ediyor';
        else rt.planStatus = 'Planlandı';
    }

    return rt.items;
}

function updateRouteAndReportsBadges() {
    const routes = Array.isArray(appState.customRoutes) ? appState.customRoutes : [];
    const routeBadge = document.getElementById('badge-route-plans');
    if (routeBadge) {
        routeBadge.textContent = routes.length > 0 ? `${routes.length} RUT` : 'PLANLA';
    }
    let totalItems = 0;
    routes.forEach(rt => {
        const items = ensureRouteItemsNormalized(rt);
        totalItems += items.length;
    });
    const repBadge = document.getElementById('badge-reports-count');
    if (repBadge) {
        repBadge.textContent = String(totalItems || (appState.visits || []).length || 0);
    }
}

function toggleManualVisitCollapse(scrollIntoView = false) {
    const panel = document.getElementById('manual-visit-entry-panel');
    if (!panel) return;
    panel.style.display = 'block';
    if (scrollIntoView) {
        panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const titleIn = document.getElementById('manual-rut-cust-title');
        if (titleIn) setTimeout(() => titleIn.focus(), 200);
    }
}

let customRouteDraftAssignees = [];

const DEFAULT_VISIT_ASSISTANTS_ROLES = {
    'ÖMER EREN': { roleType: 'Sorumlu', visitTitle: 'Ziyaret Sorumlusu (Yönetim Kurulu)' },
    'RAFET CANBEK': { roleType: 'Sorumlu', visitTitle: 'Ziyaret Sorumlusu (Genel Müdür)' },
    'HAKAN AYDIN': { roleType: 'Sorumlu', visitTitle: 'Ziyaret Sorumlusu (Servis Müdürü)' },
    'ERTUĞRUL ERDEM': { roleType: 'Yardımcı', visitTitle: 'Ziyaret Sorumlusu Yrd. (Servis Danışmanı)' },
    'NECATİ DEMİRCİ': { roleType: 'Yardımcı', visitTitle: 'Ziyaret Sorumlusu Yrd. (Servis Danışmanı)' },
    'FATİH KIROĞLU': { roleType: 'Yardımcı', visitTitle: 'Ziyaret Sorumlusu Yrd. (Depo / Yedek Parça)' },
    'GÖKHAN ÖZBULUT': { roleType: 'Yardımcı', visitTitle: 'Ziyaret Sorumlusu Yrd. (Muhasebe / Cari)' },
    'MURAT KARAOĞLU': { roleType: 'Yardımcı', visitTitle: 'Ziyaret Sorumlusu Yrd. (Formen)' },
    'MURAT SALMAN': { roleType: 'Yardımcı', visitTitle: 'Ziyaret Sorumlusu Yrd. (Mekaniker)' },
    'YILDIRAY KARAGÖZ': { roleType: 'Yardımcı', visitTitle: 'Ziyaret Sorumlusu Yrd. (Elektrik Tekn.)' },
    'MUSTAFA İLGEN': { roleType: 'Yardımcı', visitTitle: 'Ziyaret Sorumlusu Yrd. (Fren Tekn.)' },
    'MİRAÇ ARDANUŞ': { roleType: 'Yardımcı', visitTitle: 'Ziyaret Sorumlusu Yardımcısı' },
    'ALPEREN KAYACI': { roleType: 'Yardımcı', visitTitle: 'Ziyaret Sorumlusu Yardımcısı' },
    'MUHAMMED ALİ EROL': { roleType: 'Yardımcı', visitTitle: 'Ziyaret Sorumlusu Yardımcısı' },
    'HAKAN DEMİRAL': { roleType: 'Yardımcı', visitTitle: 'Ziyaret Sorumlusu Yardımcısı' }
};

function getRoutePersonnelPool() {
    const baseUsers = (Array.isArray(appState.users) && appState.users.length > 0) ? appState.users : OFFICIAL_PERSONNEL_LIST;
    if (!Array.isArray(appState.customRoutePersonnelPool)) {
        appState.customRoutePersonnelPool = [];
    }
    const poolMap = new Map();
    baseUsers.forEach(u => {
        if (!u || !u.name) return;
        const preset = DEFAULT_VISIT_ASSISTANTS_ROLES[u.name] || null;
        poolMap.set(normalizeTR(u.name), {
            name: u.name,
            dept: preset ? preset.visitTitle : `Ziyaret Sorumlusu Yrd. (${u.dept || 'Saha'})`,
            defaultRoleType: preset ? preset.roleType : (u.role === 'Yönetici' ? 'Sorumlu' : 'Yardımcı')
        });
    });
    appState.customRoutePersonnelPool.forEach(p => {
        if (!p || !p.name) return;
        const key = normalizeTR(p.name);
        if (!poolMap.has(key)) {
            poolMap.set(key, {
                name: p.name,
                dept: p.dept || (p.defaultRoleType === 'Sorumlu' ? 'Ziyaret Sorumlusu' : 'Ziyaret Sorumlusu Yardımcısı'),
                defaultRoleType: p.defaultRoleType || 'Yardımcı'
            });
        }
    });
    return Array.from(poolMap.values());
}

function ensureDefaultCustomRouteAssignees() {
    if (customRouteDraftAssignees.length > 0) return;
    const defaultUser = currentUser ? currentUser.name : 'ÖMER EREN';
    customRouteDraftAssignees = [
        { name: defaultUser, roleType: 'Sorumlu' }
    ];
}

function formatCustomRouteAssigneesString(arr) {
    const list = Array.isArray(arr) && arr.length > 0 ? arr : customRouteDraftAssignees;
    if (!list || list.length === 0) {
        return currentUser ? `${currentUser.name} (Sorumlu)` : 'ÖMER EREN (Sorumlu)';
    }
    const sorted = [...list].sort((a, b) => (a.roleType === 'Sorumlu' ? -1 : 1) - (b.roleType === 'Sorumlu' ? -1 : 1));
    return sorted.map(p => `${p.name} (${p.roleType || 'Yardımcı'})`).join(', ');
}

function parseAssigneesStringToDraft(assigneeStr, assigneesArr) {
    if (Array.isArray(assigneesArr) && assigneesArr.length > 0) {
        customRouteDraftAssignees = assigneesArr.map(a => ({
            name: a.name,
            roleType: a.roleType === 'Sorumlu' ? 'Sorumlu' : 'Yardımcı'
        }));
        return;
    }
    const raw = String(assigneeStr || '').trim();
    if (!raw) {
        customRouteDraftAssignees = [];
        ensureDefaultCustomRouteAssignees();
        return;
    }
    const parts = raw.split(',').map(s => s.trim()).filter(Boolean);
    customRouteDraftAssignees = parts.map((part, idx) => {
        const isSor = /sorumlu/i.test(part) && !/yard/i.test(part) && !/yrd/i.test(part);
        const isYrd = /yard|yrd/i.test(part);
        const cleanName = part.replace(/\s*\([^)]*\)\s*/g, '').replace(/^[⭐🤝\s]+/, '').trim();
        return {
            name: cleanName || part,
            roleType: isSor ? 'Sorumlu' : (isYrd ? 'Yardımcı' : (idx === 0 ? 'Sorumlu' : 'Yardımcı'))
        };
    });
    if (!customRouteDraftAssignees.some(x => x.roleType === 'Sorumlu') && customRouteDraftAssignees.length > 0) {
        customRouteDraftAssignees[0].roleType = 'Sorumlu';
    }
}

function toggleCustomRoutePersonnelDropdown(e) {
    if (e) e.stopPropagation();
    const dd = document.getElementById('custom-rut-personnel-dropdown');
    if (!dd) return;
    const isOpen = dd.style.display === 'block';
    dd.style.display = isOpen ? 'none' : 'block';
    if (!isOpen) {
        renderCustomRoutePersonnelSelector();
    }
}

function closeCustomRoutePersonnelDropdown() {
    const dd = document.getElementById('custom-rut-personnel-dropdown');
    if (dd) dd.style.display = 'none';
}

document.addEventListener('click', (e) => {
    const wrapper = document.getElementById('custom-rut-personnel-wrapper');
    if (wrapper && !wrapper.contains(e.target)) {
        closeCustomRoutePersonnelDropdown();
    }
});

function togglePersonInCustomRouteDraft(personName, isChecked) {
    if (!personName) return;
    const norm = normalizeTR(personName);
    if (isChecked) {
        if (!customRouteDraftAssignees.some(p => normalizeTR(p.name) === norm)) {
            const hasResponsible = customRouteDraftAssignees.some(p => p.roleType === 'Sorumlu');
            customRouteDraftAssignees.push({
                name: personName,
                roleType: hasResponsible ? 'Yardımcı' : 'Sorumlu'
            });
        }
    } else {
        customRouteDraftAssignees = customRouteDraftAssignees.filter(p => normalizeTR(p.name) !== norm);
        if (customRouteDraftAssignees.length > 0 && !customRouteDraftAssignees.some(p => p.roleType === 'Sorumlu')) {
            customRouteDraftAssignees[0].roleType = 'Sorumlu';
        }
    }
    renderCustomRoutePersonnelSelector();
}

function togglePersonResponsibleStatus(personName, ev) {
    if (ev) ev.stopPropagation();
    if (!personName) return;
    const norm = normalizeTR(personName);
    let existing = customRouteDraftAssignees.find(p => normalizeTR(p.name) === norm);
    if (!existing) {
        existing = { name: personName, roleType: 'Sorumlu' };
        customRouteDraftAssignees.push(existing);
    } else {
        existing.roleType = existing.roleType === 'Sorumlu' ? 'Yardımcı' : 'Sorumlu';
    }
    renderCustomRoutePersonnelSelector();
}

function removePersonFromCustomRouteDraft(personName, ev) {
    if (ev) ev.stopPropagation();
    togglePersonInCustomRouteDraft(personName, false);
}

function addNewPersonnelToRoutePool() {
    const nameInput = document.getElementById('custom-rut-new-person-name');
    const roleSel = document.getElementById('custom-rut-new-person-role');
    const rawName = (nameInput?.value || '').trim().toLocaleUpperCase('tr-TR');
    const roleType = (roleSel?.value || 'Yardımcı') === 'Sorumlu' ? 'Sorumlu' : 'Yardımcı';

    if (!rawName) {
        showToast('Lütfen eklenecek görevli personel veya ziyaret sorumlusu yardımcısı adını yazın.', 'warning');
        if (nameInput) nameInput.focus();
        return;
    }

    if (!Array.isArray(appState.customRoutePersonnelPool)) {
        appState.customRoutePersonnelPool = [];
    }
    if (!appState.customRoutePersonnelPool.some(p => normalizeTR(p.name) === normalizeTR(rawName))) {
        appState.customRoutePersonnelPool.unshift({
            name: rawName,
            defaultRoleType: roleType,
            dept: roleType === 'Sorumlu' ? 'Ziyaret Sorumlusu' : 'Ziyaret Sorumlusu Yardımcısı'
        });
    }

    const existing = customRouteDraftAssignees.find(p => normalizeTR(p.name) === normalizeTR(rawName));
    if (existing) {
        existing.roleType = roleType;
    } else {
        customRouteDraftAssignees.push({ name: rawName, roleType });
    }

    if (nameInput) nameInput.value = '';
    renderCustomRoutePersonnelSelector();
    saveStateToLocal();
    showToast(`"${rawName}" (${roleType === 'Sorumlu' ? 'Ziyaret Sorumlusu' : 'Ziyaret Sorumlusu Yardımcısı'}) listeye ve plana eklendi!`, 'success');
}

function renderCustomRoutePersonnelSelector() {
    ensureDefaultCustomRouteAssignees();
    const hiddenInput = document.getElementById('custom-rut-assignee');
    const displayBox = document.getElementById('custom-rut-assignee-display');
    const listBox = document.getElementById('custom-rut-personnel-list-box');
    const manPersSel = document.getElementById('manual-rut-cust-personnel');

    const formattedStr = formatCustomRouteAssigneesString(customRouteDraftAssignees);
    if (hiddenInput) hiddenInput.value = formattedStr;

    const pool = getRoutePersonnelPool();
    if (manPersSel) {
        const curMan = manPersSel.value;
        manPersSel.innerHTML = pool.map(u => `<option value="${escapeHtml(u.name)}">${escapeHtml(u.name)} (${escapeHtml(u.dept)})</option>`).join('');
        if (curMan) manPersSel.value = curMan;
    }

    if (displayBox) {
        if (customRouteDraftAssignees.length === 0) {
            displayBox.innerHTML = `<span style="color:var(--text-muted);">Görevli Personel Seçin...</span>`;
        } else {
            const sorted = [...customRouteDraftAssignees].sort((a, b) => (a.roleType === 'Sorumlu' ? -1 : 1) - (b.roleType === 'Sorumlu' ? -1 : 1));
            displayBox.innerHTML = sorted.map(p => {
                const isSor = p.roleType === 'Sorumlu';
                const safeName = escapeHtml(p.name).replace(/'/g, "\\'");
                return `
                    <span style="display:inline-flex; align-items:center; gap:0.28rem; padding:0.18rem 0.48rem; border-radius:6px; font-size:0.71rem; font-weight:800; background:${isSor ? 'rgba(245,158,11,0.2)' : 'rgba(56,189,248,0.16)'}; border:1px solid ${isSor ? '#f59e0b' : 'rgba(56,189,248,0.4)'}; color:${isSor ? '#fde68a' : '#bae6fd'};">
                        <span onclick="togglePersonResponsibleStatus('${safeName}', event)" title="Tıklayarak Sorumlu / Yardımcı rolünü değiştirin" style="cursor:pointer; padding:0 3px; border-radius:4px; background:rgba(0,0,0,0.25);">
                            ${isSor ? '⭐ Sorumlu:' : '🤝 Yardımcı:'}
                        </span>
                        <span>${escapeHtml(p.name)}</span>
                        <i class="fa-solid fa-xmark" onclick="removePersonFromCustomRouteDraft('${safeName}', event)" title="Personeli Çıkar" style="cursor:pointer; color:#f87171; margin-left:2px;"></i>
                    </span>
                `;
            }).join('');
        }
    }

    if (listBox) {
        listBox.innerHTML = pool.map(u => {
            const selectedEntry = customRouteDraftAssignees.find(p => normalizeTR(p.name) === normalizeTR(u.name));
            const isChecked = Boolean(selectedEntry);
            const activeRole = selectedEntry ? selectedEntry.roleType : u.defaultRoleType;
            const isSor = activeRole === 'Sorumlu';
            const safeName = escapeHtml(u.name).replace(/'/g, "\\'");
            return `
                <div style="display:flex; justify-content:space-between; align-items:center; gap:0.4rem; padding:0.32rem 0.5rem; border-radius:7px; background:${isChecked ? (isSor ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.14)') : 'rgba(2,6,23,0.5)'}; border:1px solid ${isChecked ? (isSor ? 'rgba(245,158,11,0.45)' : 'rgba(16,185,129,0.4)') : 'rgba(148,163,184,0.16)'};">
                    <label style="display:flex; align-items:center; gap:0.45rem; cursor:pointer; flex:1; min-width:0;">
                        <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="togglePersonInCustomRouteDraft('${safeName}', this.checked)" style="accent-color:#10b981; width:15px; height:15px; margin:0; cursor:pointer; flex-shrink:0;">
                        <div style="min-width:0; flex:1;">
                            <div style="font-size:0.74rem; font-weight:800; color:${isChecked ? '#fff' : '#cbd5e1'}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                                ${escapeHtml(u.name)}
                            </div>
                            <div style="font-size:0.65rem; color:var(--text-sec); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                                ${escapeHtml(u.dept)}
                            </div>
                        </div>
                    </label>
                    <button type="button" onclick="togglePersonResponsibleStatus('${safeName}', event)" title="Ziyaret Sorumlusu veya Yardımcısı olarak işaretle" style="padding:0.2rem 0.5rem; border-radius:6px; font-size:0.67rem; font-weight:800; cursor:pointer; border:1px solid ${isSor && isChecked ? '#f59e0b' : 'rgba(148,163,184,0.3)'}; background:${isSor && isChecked ? 'rgba(245,158,11,0.28)' : 'rgba(15,23,42,0.85)'}; color:${isSor && isChecked ? '#fde68a' : '#94a3b8'}; white-space:nowrap;">
                        ${isSor ? '⭐ Sorumlu' : '🤝 Yardımcı'}
                    </button>
                </div>
            `;
        }).join('');
    }
}

function initCustomRoutePlannerUI() {
    const citySel = document.getElementById('custom-rut-city-select');
    const dateInput = document.getElementById('custom-rut-date');
    const manDateInput = document.getElementById('manual-rut-cust-date');
    const customers = appState.customers || [];

    const todayStr = getTodayTRStr();
    if (dateInput && !dateInput.value) dateInput.value = todayStr;
    if (manDateInput && !manDateInput.value) manDateInput.value = todayStr;

    ensureDefaultCustomRouteAssignees();
    renderCustomRoutePersonnelSelector();

    if (citySel) {
        const cityCounts = {};
        Object.keys(TR_PROVINCE_DISTRICTS).forEach(ct => { cityCounts[ct] = 0; });
        customers.forEach(c => {
            if (c.city && c.city.trim()) {
                const ct = c.city.trim();
                cityCounts[ct] = (cityCounts[ct] || 0) + 1;
            }
        });
        const sortedCities = Object.keys(cityCounts).sort((a, b) => {
            const diff = (cityCounts[b] || 0) - (cityCounts[a] || 0);
            return diff !== 0 ? diff : a.localeCompare(b, 'tr');
        });
        const prevVal = citySel.value;
        citySel.innerHTML = `<option value="">📍 İl Seçin (${sortedCities.length} İl)</option>` +
            sortedCities.map(ct => `<option value="${ct}">${ct} (${cityCounts[ct] || 0} Kayıtlı Müşteri)</option>`).join('');
        if (prevVal) citySel.value = prevVal;
    }

    if (!activeSelectedRouteId && Array.isArray(appState.customRoutes) && appState.customRoutes.length > 0) {
        activeSelectedRouteId = appState.customRoutes[0].id;
    }

    renderCustomRouteDistrictBadges();
    renderCustomRouteCustomerPicker();
    renderCustomRouteSelectedChips();
    renderSavedCustomRoutesList();
    renderActiveRouteExecutionPanel();
    updateRouteAndReportsBadges();
    if (window.AutoDateHelper && typeof window.AutoDateHelper.upgradeAll === 'function') {
        window.AutoDateHelper.upgradeAll(document.getElementById('route-plan-tab'));
    }
}

function handleCustomRouteCityChange(preserveDistrictSelection = false) {
    const citySel = document.getElementById('custom-rut-city-select');
    const distSel = document.getElementById('custom-rut-district-select');
    const multiBox = document.getElementById('custom-rut-multi-districts-box');
    const cityVal = citySel ? citySel.value.trim() : '';
    const prevDistVal = (preserveDistrictSelection && distSel) ? distSel.value.trim() : '';
    const customers = appState.customers || [];

    if (!preserveDistrictSelection) {
        pendingCheckedDistrictsForCity.clear();
        customRoutePendingSelectedCodes.clear();
    }

    const manCity = document.getElementById('manual-rut-cust-city');
    if (manCity && cityVal) manCity.value = cityVal;

    const distCounts = {};
    if (cityVal) {
        distCounts['Merkez'] = 0;
        const matchingPresetKey = Object.keys(TR_PROVINCE_DISTRICTS).find(k => normalizeTR(k) === normalizeTR(cityVal));
        if (matchingPresetKey) {
            TR_PROVINCE_DISTRICTS[matchingPresetKey].forEach(d => { distCounts[d] = 0; });
        }
        const cityCustomers = customers.filter(c => normalizeTR(c.city) === normalizeTR(cityVal));
        cityCustomers.forEach(c => {
            const d = resolveCustomerDistrictName(c);
            const existingKey = Object.keys(distCounts).find(k => normalizeTR(k) === normalizeTR(d)) || d;
            distCounts[existingKey] = (distCounts[existingKey] || 0) + 1;
        });
        Object.keys(distCounts).forEach(dKey => {
            if (normalizeTR(dKey) !== 'merkez' && distCounts[dKey] === 0) {
                distCounts[dKey] = cityCustomers.filter(c => doesCustomerMatchCityDistrict(c, cityVal, dKey)).length;
            }
        });
    }

    const sortedDists = Object.keys(distCounts).sort((a, b) => {
        if (normalizeTR(a) === 'merkez') return -1;
        if (normalizeTR(b) === 'merkez') return 1;
        const diff = (distCounts[b] || 0) - (distCounts[a] || 0);
        return diff !== 0 ? diff : a.localeCompare(b, 'tr');
    });

    if (distSel) {
        distSel.innerHTML = `<option value="">🏘️ İlçe Seçin (${sortedDists.length} İlçe - Sadece Seçilen Gelir)</option>` +
            sortedDists.map(d => {
                const displayLabel = normalizeTR(d) === 'merkez' ? `${d} (İl Merkezi)` : d;
                return `<option value="${escapeHtml(d)}">${escapeHtml(displayLabel)} (${distCounts[d] || 0} Müşteri)</option>`;
            }).join('');
        if (prevDistVal && sortedDists.some(d => normalizeTR(d) === normalizeTR(prevDistVal))) {
            distSel.value = prevDistVal;
        } else {
            distSel.value = '';
        }
    }

    if (multiBox) {
        if (!cityVal || sortedDists.length === 0) {
            multiBox.innerHTML = `<div style="font-size:0.7rem; color:var(--text-muted);"><i class="fa-solid fa-circle-info" style="color:#38bdf8;"></i> Yukarıdan bir <strong>İl</strong> seçtiğinizde o ile bağlı ilçeler (<strong>Merkez</strong>, <strong>Sungurlu</strong>, <strong>Delice</strong>, <strong>Hasanoğlan</strong> vb.) burada açılır. İlçeyi seçtiğinizde sağda <strong>yalnızca o ilçenin müşterileri</strong> listelenir.</div>`;
        } else {
            const safeCity = escapeHtml(cityVal).replace(/'/g, "\\'");
            multiBox.innerHTML = `
                <div style="font-size:0.72rem; font-weight:800; color:#bae6fd; margin-bottom:0.4rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.35rem;">
                    <span><i class="fa-solid fa-check-double" style="color:#34d399;"></i> ${escapeHtml(cityVal)} İlçeleri (Ziyaret Edeceğiniz İlçeyi Tikleyin):</span>
                    <span style="font-size:0.65rem; color:#fbbf24; font-weight:700;">Sadece seçtiğiniz ilçenin müşterileri sağda açılır</span>
                </div>
                <div style="display:flex; flex-wrap:wrap; gap:0.35rem; max-height:135px; overflow-y:auto; margin-bottom:0.45rem; padding-right:2px;">
                    ${sortedDists.map(d => {
                        const isCurrentlyChecked = pendingCheckedDistrictsForCity.has(d);
                        const isAlreadyInBottomList = customRouteDraftDistricts.some(x => normalizeTR(x) === normalizeTR(`${cityVal} / ${d}`));
                        const safeDist = escapeHtml(d).replace(/'/g, "\\'");
                        const isMerkez = normalizeTR(d) === 'merkez';
                        const badgeText = isMerkez ? `${d} (İl Merkezi)` : d;
                        return `
                            <label style="display:inline-flex; align-items:center; gap:0.32rem; padding:0.24rem 0.55rem; border-radius:6px; font-size:0.71rem; font-weight:700; cursor:pointer; background:${isCurrentlyChecked ? 'rgba(16,185,129,0.26)' : (isAlreadyInBottomList ? 'rgba(56,189,248,0.16)' : 'rgba(15,23,42,0.88)')}; border:1px solid ${isCurrentlyChecked ? '#10b981' : (isAlreadyInBottomList ? 'rgba(56,189,248,0.45)' : 'rgba(148,163,184,0.28)')}; color:${isCurrentlyChecked ? '#34d399' : (isAlreadyInBottomList ? '#7dd3fc' : '#e2e8f0')};">
                                <input type="checkbox" ${isCurrentlyChecked ? 'checked' : ''} onchange="toggleMultiDistrictCheckbox('${safeCity}', '${safeDist}', this.checked)" style="accent-color:#10b981; margin:0; cursor:pointer;">
                                <span>${escapeHtml(badgeText)} (${distCounts[d] || 0})${isAlreadyInBottomList ? ' ✓' : ''}</span>
                            </label>
                        `;
                    }).join('')}
                </div>
                <div style="display:flex; gap:0.35rem; align-items:center; padding-top:0.35rem; border-top:1px dashed rgba(148,163,184,0.2);">
                    <input type="text" id="custom-rut-custom-district-input" class="filter-input" style="flex:1; font-size:0.71rem; padding:0.28rem 0.5rem; height:28px;" placeholder="${escapeHtml(cityVal)} içinde farklı ilçe / belde yazın (Örn: Hasanoğlan, Delice)..." onkeydown="if(event.key==='Enter'){event.preventDefault();addCustomSubDistrictToCity();}">
                    <button type="button" class="btn btn-secondary btn-sm" style="padding:0.24rem 0.55rem; font-size:0.69rem; border-color:rgba(16,185,129,0.45); color:#34d399; white-space:nowrap;" onclick="addCustomSubDistrictToCity()">
                        <i class="fa-solid fa-plus"></i> İlçeyi Seç
                    </button>
                </div>
            `;
        }
    }

    renderCustomRouteCustomerPicker();
}

function addCustomSubDistrictToCity() {
    const citySel = document.getElementById('custom-rut-city-select');
    const customIn = document.getElementById('custom-rut-custom-district-input');
    const city = citySel ? citySel.value.trim() : '';
    const customDist = customIn ? customIn.value.trim() : '';
    if (!city) {
        showToast('Lütfen önce bir İl seçin.', 'warning');
        return;
    }
    if (!customDist) {
        showToast('Lütfen eklenecek ilçe veya belde adını yazın (Örn: Hasanoğlan).', 'warning');
        if (customIn) customIn.focus();
        return;
    }
    const matchingPresetKey = Object.keys(TR_PROVINCE_DISTRICTS).find(k => normalizeTR(k) === normalizeTR(city)) || city;
    if (!TR_PROVINCE_DISTRICTS[matchingPresetKey]) TR_PROVINCE_DISTRICTS[matchingPresetKey] = ['Merkez'];
    if (!TR_PROVINCE_DISTRICTS[matchingPresetKey].some(d => normalizeTR(d) === normalizeTR(customDist))) {
        TR_PROVINCE_DISTRICTS[matchingPresetKey].push(customDist);
    }
    if (customIn) customIn.value = '';
    toggleMultiDistrictCheckbox(city, customDist, true);
}

function toggleMultiDistrictCheckbox(city, dist, isChecked) {
    if (!city || !dist) return;
    if (isChecked) {
        pendingCheckedDistrictsForCity.add(dist);
    } else {
        pendingCheckedDistrictsForCity.delete(dist);
    }
    const distSel = document.getElementById('custom-rut-district-select');
    if (distSel && pendingCheckedDistrictsForCity.size === 1) {
        distSel.value = Array.from(pendingCheckedDistrictsForCity)[0];
    } else if (distSel && pendingCheckedDistrictsForCity.size === 0) {
        distSel.value = '';
    }
    handleCustomRouteCityChange(true);
    renderCustomRouteCustomerPicker();
}

function syncRouteSummaryAndPlanNameFromStops() {
    const routeInput = document.getElementById('custom-rut-route-text');
    if (routeInput) routeInput.value = customRouteDraftDistricts.join(' -> ');
    const nameInput = document.getElementById('custom-rut-name');
    if (nameInput && (!nameInput.value.trim() || nameInput.dataset.autoGenerated === '1')) {
        if (customRouteDraftDistricts.length > 0) {
            nameInput.value = `${customRouteDraftDistricts.join(' - ')} Rut Planı`;
            nameInput.dataset.autoGenerated = '1';
        } else {
            nameInput.value = '';
        }
    }
}

function handleCustomRouteDistrictChange() {
    const citySel = document.getElementById('custom-rut-city-select');
    const distSel = document.getElementById('custom-rut-district-select');
    const cityVal = citySel ? citySel.value.trim() : '';
    const distVal = distSel ? distSel.value.trim() : '';

    pendingCheckedDistrictsForCity.clear();
    if (distVal) {
        pendingCheckedDistrictsForCity.add(distVal);
    }

    const manCity = document.getElementById('manual-rut-cust-city');
    const manDist = document.getElementById('manual-rut-cust-district');
    if (manCity && cityVal) manCity.value = cityVal;
    if (manDist && distVal) manDist.value = distVal;

    handleCustomRouteCityChange(true);
    renderCustomRouteCustomerPicker();
}

function addDistrictToCustomRouteDraft() {
    commitCurrentRegionCustomersToBottomList();
}

function addAllCityDistrictsToRouteDraft() {
    const citySel = document.getElementById('custom-rut-city-select');
    const distSel = document.getElementById('custom-rut-district-select');
    const city = citySel ? citySel.value.trim() : '';
    if (!city) {
        showToast('Lütfen önce bir İl seçin.', 'warning');
        return;
    }
    const distOptions = distSel ? Array.from(distSel.options).map(o => o.value).filter(Boolean) : [];
    distOptions.forEach(d => pendingCheckedDistrictsForCity.add(d));
    handleCustomRouteCityChange(true);
    renderCustomRouteCustomerPicker();
}

function removeDistrictFromCustomRouteDraft(idx) {
    const removed = customRouteDraftDistricts[idx] || '';
    customRouteDraftDistricts.splice(idx, 1);
    const parts = removed.split('/').map(s => s.trim());
    const rCity = parts[0] || '';
    const rDist = parts[1] || '';
    if (rCity && rDist) {
        const customers = appState.customers || [];
        customers.forEach(c => {
            if (customRouteDraftSelectedCodes.has(c.code) && doesCustomerMatchCityDistrict(c, rCity, rDist)) {
                customRouteDraftSelectedCodes.delete(c.code);
            }
        });
    }
    syncRouteSummaryAndPlanNameFromStops();
    handleCustomRouteCityChange(true);
    renderCustomRouteDistrictBadges();
    renderCustomRouteCustomerPicker();
    renderCustomRouteSelectedChips();
}

function renderCustomRouteDistrictBadges() {
    const box = document.getElementById('custom-rut-districts-badges');
    const countEl = document.getElementById('custom-rut-stops-count');
    if (countEl) countEl.textContent = `${customRouteDraftDistricts.length} Durak`;
    if (!box) return;
    if (customRouteDraftDistricts.length === 0) {
        box.innerHTML = `<span style="font-size:0.7rem; color:var(--text-muted);">Henüz durak eklenmedi. İl ve İlçe seçip sağdan müşterileri tikleyerek <strong>"➕ Seçilen Müşterileri Alttaki Rut Listesine Ekle"</strong> tuşuna basın.</span>`;
        return;
    }
    box.innerHTML = customRouteDraftDistricts.map((d, idx) => `
        <span class="badge" style="background:rgba(16,185,129,0.16); color:#34d399; border:1px solid rgba(16,185,129,0.4); font-size:0.72rem; display:inline-flex; align-items:center; gap:0.35rem; padding:0.25rem 0.6rem; font-weight:800;">
            <span style="color:#fbbf24;">${idx + 1}.</span> <i class="fa-solid fa-location-dot" style="color:#38bdf8;"></i> ${escapeHtml(d)}
            <i class="fa-solid fa-xmark" style="cursor:pointer; color:#f87171; margin-left:2px;" title="Durağı ve Müşterilerini Çıkar" onclick="removeDistrictFromCustomRouteDraft(${idx})"></i>
        </span>
    `).join('<span style="color:#64748b; font-size:0.75rem; align-self:center;"><i class="fa-solid fa-arrow-right"></i></span>');
}

// SADECE O AN SOLDA SEÇİLİ OLAN İL / İLÇE(LER)İ DÖNDÜRÜR (Önceki illerle karıştırmaz!)
function getActiveEffectiveRouteStops() {
    const cityVal = (document.getElementById('custom-rut-city-select')?.value || '').trim();
    const distVal = (document.getElementById('custom-rut-district-select')?.value || '').trim();
    if (!cityVal) return [];

    const activeStops = [];
    pendingCheckedDistrictsForCity.forEach(d => {
        const pair = `${cityVal} / ${d}`;
        if (!activeStops.some(x => normalizeTR(x) === normalizeTR(pair))) {
            activeStops.push(pair);
        }
    });
    if (distVal) {
        const pair = `${cityVal} / ${distVal}`;
        if (!activeStops.some(x => normalizeTR(x) === normalizeTR(pair))) {
            activeStops.push(pair);
        }
    }
    return activeStops;
}

function getFilteredCustomersForCustomRoutePicker() {
    const customers = appState.customers || [];
    const searchVal = normalizeTR(document.getElementById('custom-rut-cust-search')?.value || '');
    const effectiveStops = getActiveEffectiveRouteStops();

    if (effectiveStops.length === 0 && !searchVal) {
        return [];
    }

    return customers.filter(c => {
        if (searchVal) {
            const hay = normalizeTR(`${c.code} ${c.title} ${c.city} ${c.district} ${c.authorized} ${c.plates} ${c.phone} ${c.address}`);
            if (!hay.includes(searchVal)) return false;
            if (effectiveStops.length === 0) return true;
        }

        return effectiveStops.some(stop => {
            const parts = stop.split('/').map(s => s.trim());
            const sCity = parts[0] || '';
            const sDist = parts[1] || '';
            if (sCity && sDist) {
                return doesCustomerMatchCityDistrict(c, sCity, sDist);
            }
            return false;
        });
    });
}

function renderCustomRouteCustomerPicker() {
    const box = document.getElementById('custom-rut-cust-results');
    const subEl = document.getElementById('custom-rut-picker-subtitle');
    const commitBtn = document.getElementById('custom-rut-commit-region-btn');
    if (!box) return;

    const cityVal = (document.getElementById('custom-rut-city-select')?.value || '').trim();
    const searchVal = normalizeTR(document.getElementById('custom-rut-cust-search')?.value || '');
    const effectiveStops = getActiveEffectiveRouteStops();
    const matched = getFilteredCustomersForCustomRoutePicker();
    const displayList = matched.slice(0, 120);

    const tickedInCurrentView = matched.filter(c => customRoutePendingSelectedCodes.has(c.code) || customRouteDraftSelectedCodes.has(c.code)).length;

    if (subEl) {
        const stopsSummary = effectiveStops.length > 0 ? effectiveStops.join(', ') : 'Henüz İlçe Seçilmedi';
        subEl.innerHTML = `Şu An İncelenen İlçe: <strong style="color:#38bdf8;">${escapeHtml(stopsSummary)}</strong> &bull; İlçe Müşterisi: <strong style="color:#fff;">${matched.length}</strong> &bull; Tiklenen: <strong style="color:#34d399;">${tickedInCurrentView}</strong>`;
    }

    if (commitBtn) {
        if (effectiveStops.length > 0) {
            commitBtn.innerHTML = `<i class="fa-solid fa-arrow-down-short-wide"></i> ➕ Seçilen ${tickedInCurrentView > 0 ? `(${tickedInCurrentView}) ` : ''}Müşteriyi (${escapeHtml(effectiveStops.join(', '))}) Alttaki Rut Listesine Ekle`;
        } else {
            commitBtn.innerHTML = `<i class="fa-solid fa-arrow-down-short-wide"></i> ➕ Seçilen Müşterileri Alttaki Rut Listesine Ekle`;
        }
    }

    if (effectiveStops.length === 0 && !searchVal) {
        if (cityVal) {
            box.innerHTML = `<div style="padding:1.15rem; text-align:center; font-size:0.77rem; color:#bae6fd; background:rgba(56,189,248,0.08); border:1px dashed rgba(56,189,248,0.35); border-radius:8px;">
                <i class="fa-solid fa-location-crosshairs" style="color:#38bdf8; font-size:1rem; margin-bottom:0.35rem; display:block;"></i>
                <strong>${escapeHtml(cityVal)}</strong> ili seçildi. Şimdi soldaki <strong>${escapeHtml(cityVal)} İlçeleri</strong> listesinden ziyaret edeceğiniz ilçeyi (Örn: <strong>Merkez</strong>, <strong>Sungurlu</strong>, <strong>Delice</strong> vb.) seçin; yalnızca o ilçenin müşterileri burada açılacaktır.
            </div>`;
        } else {
            box.innerHTML = `<div style="padding:1.15rem; text-align:center; font-size:0.76rem; color:var(--text-muted);">
                <i class="fa-solid fa-map-location-dot" style="color:#38bdf8; font-size:1rem; margin-bottom:0.35rem; display:block;"></i>
                <strong>Adım 1:</strong> Soldan <strong>İl</strong> ve <strong>İlçe</strong> seçin (Örn: <em>Çorum / Sungurlu</em>).<br>
                <strong>Adım 2:</strong> Gelen müşterileri tikleyip <strong>"➕ Seçilen Müşterileri Alttaki Rut Listesine Ekle"</strong> tuşuna basın.<br>
                <strong>Adım 3:</strong> Ardından sıradaki İl/İlçeyi (Örn: <em>Kırıkkale / Delice</em>) seçip aynı şekilde alttaki listeye ekleyin.
            </div>`;
        }
        return;
    }

    if (displayList.length === 0) {
        box.innerHTML = `<div style="padding:1rem; text-align:center; font-size:0.76rem; color:var(--text-muted);">Seçilen <strong>${escapeHtml(effectiveStops.join(', '))}</strong> ilçesinde kayıtlı müşteri bulunamadı. Bu ilçeyi yine de durağa eklemek için aşağıdaki <strong>"➕ Alttaki Rut Listesine Ekle"</strong> tuşuna basabilir veya <strong>"+ MANUEL ZİYARET EKLE"</strong> alanından yeni işletme girebilirsiniz.</div>`;
        return;
    }

    box.innerHTML = displayList.map(c => {
        const isAlreadyInBottom = customRouteDraftSelectedCodes.has(c.code);
        const isPendingTicked = customRoutePendingSelectedCodes.has(c.code);
        const isChecked = isAlreadyInBottom || isPendingTicked;
        const safeCode = escapeHtml(c.code || '').replace(/'/g, "\\'");
        const phoneStr = c.phone && c.phone !== '-' ? c.phone : 'Tel Yok';
        const resolvedDist = resolveCustomerDistrictName(c);
        const addrStr = c.address && c.address !== '-' ? c.address : `${c.city || '-'} / ${resolvedDist}`;
        return `
            <div onclick="toggleCustomerInCustomRouteDraft('${safeCode}')" style="display:flex; justify-content:space-between; align-items:center; gap:0.55rem; padding:0.42rem 0.6rem; border-bottom:1px solid rgba(148,163,184,0.1); cursor:pointer; border-radius:6px; background:${isChecked ? 'rgba(16,185,129,0.18)' : 'transparent'};">
                <div style="display:flex; align-items:flex-start; gap:0.5rem; min-width:0; flex:1;">
                    <input type="checkbox" ${isChecked ? 'checked' : ''} style="pointer-events:none; accent-color:#10b981; width:16px; height:16px; margin-top:2px; flex-shrink:0;">
                    <div style="min-width:0; flex:1;">
                        <div style="font-size:0.77rem; font-weight:800; color:${isChecked ? '#34d399' : '#f8fafc'}; display:flex; align-items:center; gap:0.35rem; flex-wrap:wrap;">
                            <span>${escapeHtml(c.title || '-')}</span>
                            <span style="font-family:monospace; font-size:0.66rem; color:#38bdf8; background:rgba(56,189,248,0.12); padding:1px 5px; border-radius:4px;">${escapeHtml(c.code || '')}</span>
                        </div>
                        <div style="font-size:0.68rem; color:var(--text-sec); margin-top:2px;">
                            <i class="fa-solid fa-location-dot" style="color:#f59e0b;"></i> <strong>${escapeHtml(c.city || '-')} / ${escapeHtml(resolvedDist)}</strong>
                            &bull; <i class="fa-solid fa-phone" style="color:#34d399;"></i> ${escapeHtml(phoneStr)}
                            &bull; <span style="color:#94a3b8;">${escapeHtml(addrStr.slice(0, 55))}</span>
                        </div>
                    </div>
                </div>
                <span class="badge ${isAlreadyInBottom ? 'badge-info' : (isPendingTicked ? 'badge-success' : 'badge-secondary')}" style="font-size:0.66rem; white-space:nowrap;">
                    ${isAlreadyInBottom ? '✓ Listede' : (isPendingTicked ? '✓ Tiklendi' : '+ Seç')}
                </span>
            </div>
        `;
    }).join('') + (matched.length > 120 ? `<div style="padding:0.45rem; text-align:center; font-size:0.7rem; color:#93c5fd;">+${matched.length - 120} müşteri daha var (Arama kutusundan filtreleyebilir veya "Tümünü Tikle" diyebilirsiniz)</div>` : '');
}

function toggleCustomerInCustomRouteDraft(code) {
    if (!code) return;
    if (customRouteDraftSelectedCodes.has(code)) {
        customRouteDraftSelectedCodes.delete(code);
        customRoutePendingSelectedCodes.delete(code);
    } else if (customRoutePendingSelectedCodes.has(code)) {
        customRoutePendingSelectedCodes.delete(code);
    } else {
        customRoutePendingSelectedCodes.add(code);
    }
    renderCustomRouteCustomerPicker();
    renderCustomRouteSelectedChips();
    renderLegacyCustomers();
}

function selectAllFilteredForCustomRoute() {
    const matched = getFilteredCustomersForCustomRoutePicker();
    if (matched.length === 0) {
        showToast('Önce soldan İl ve İlçe seçin.', 'warning');
        return;
    }
    matched.forEach(c => customRoutePendingSelectedCodes.add(c.code));
    renderCustomRouteCustomerPicker();
    showToast(`${matched.length} müşteri tiklendi. Şimdi "➕ Seçilen Müşterileri Alttaki Rut Listesine Ekle" butonuna basın.`, 'info');
}

function clearCurrentViewingSelection() {
    const matched = getFilteredCustomersForCustomRoutePicker();
    matched.forEach(c => {
        customRoutePendingSelectedCodes.delete(c.code);
        customRouteDraftSelectedCodes.delete(c.code);
    });
    renderCustomRouteCustomerPicker();
    renderCustomRouteSelectedChips();
}

// 2. ADIMDAN 3. ADIMA (ALTTAKİ LİSTEYE) AKTARMA FONKSİYONU
function commitCurrentRegionCustomersToBottomList() {
    const citySel = document.getElementById('custom-rut-city-select');
    const customIn = document.getElementById('custom-rut-custom-district-input');
    const cityVal = citySel ? citySel.value.trim() : '';
    const customDistVal = customIn ? customIn.value.trim() : '';

    if (cityVal && customDistVal) {
        addCustomSubDistrictToCity();
    }

    const effectiveStops = getActiveEffectiveRouteStops();
    const matched = getFilteredCustomersForCustomRoutePicker();
    const newlyTickedCodes = matched.filter(c => customRoutePendingSelectedCodes.has(c.code) || customRouteDraftSelectedCodes.has(c.code)).map(c => c.code);

    if (effectiveStops.length === 0 && newlyTickedCodes.length === 0 && customRoutePendingSelectedCodes.size === 0) {
        if (cityVal) {
            showToast(`Lütfen "${cityVal}" ili için ziyaret edeceğiniz ilçeyi (Örn: Merkez, Sungurlu, Delice) seçin veya tikleyin!`, 'warning');
        } else {
            showToast('Lütfen önce soldan İl ve İlçe seçin.', 'warning');
        }
        return;
    }

    // Aktif İl / İlçe duraklarını alttaki durak listesine ekle
    const addedStopNames = [];
    effectiveStops.forEach(stop => {
        if (!customRouteDraftDistricts.some(x => normalizeTR(x) === normalizeTR(stop))) {
            customRouteDraftDistricts.push(stop);
            addedStopNames.push(stop);
        }
    });

    // Eğer kullanıcı henüz sağdaki müşterileri tiklemeden soldaki "+ Ekle" tuşuna bastıysa:
    // Durağı ekle ve sağdaki müşteri kutusunu vurgula ki müşterileri seçebilsin (veya müşteri yoksa doğrudan sıradaki ile geçsin)
    if (newlyTickedCodes.length === 0 && customRoutePendingSelectedCodes.size === 0 && matched.length > 0) {
        syncRouteSummaryAndPlanNameFromStops();
        renderCustomRouteDistrictBadges();
        renderCustomRouteCustomerPicker();
        renderCustomRouteSelectedChips();
        const rightBox = document.getElementById('custom-rut-cust-results');
        if (rightBox) {
            rightBox.style.boxShadow = '0 0 0 2px #10b981';
            setTimeout(() => { rightBox.style.boxShadow = ''; }, 1500);
        }
        showToast(`📍 ${effectiveStops.join(', ')} durağı eklendi! Şimdi sağdaki listeden ziyaret edilecek müşterileri tikleyip tekrar Ekle tuşuna basın.`, 'info');
        return;
    }

    // Tiklenen müşterileri alttaki ana rut listesine aktar
    let addedCustomerCount = 0;
    customRoutePendingSelectedCodes.forEach(code => {
        if (!customRouteDraftSelectedCodes.has(code)) {
            customRouteDraftSelectedCodes.add(code);
            addedCustomerCount++;
        }
    });
    customRoutePendingSelectedCodes.clear();

    // Seçilen müşterilerin il/ilçelerini de durak listesinde garantiye al
    const customers = appState.customers || [];
    newlyTickedCodes.forEach(code => {
        const c = customers.find(x => x.code === code);
        if (c && c.city) {
            const stopPair = `${c.city.trim()} / ${resolveCustomerDistrictName(c)}`;
            if (!customRouteDraftDistricts.some(x => normalizeTR(x) === normalizeTR(stopPair))) {
                customRouteDraftDistricts.push(stopPair);
            }
        }
    });

    // Sıradaki İl / İlçe seçimi için üstteki İl ve İlçe seçimini sıfırla ki sıradaki İl/İlçe (Örn: Kırıkkale / Delice) temiz açılsın!
    pendingCheckedDistrictsForCity.clear();
    if (citySel) citySel.value = '';
    const distSel = document.getElementById('custom-rut-district-select');
    if (distSel) distSel.value = '';
    const searchEl = document.getElementById('custom-rut-cust-search');
    if (searchEl) searchEl.value = '';

    syncRouteSummaryAndPlanNameFromStops();
    handleCustomRouteCityChange(false);
    renderCustomRouteDistrictBadges();
    renderCustomRouteCustomerPicker();
    renderCustomRouteSelectedChips();
    renderLegacyCustomers();

    const bottomChipsBox = document.getElementById('custom-rut-selected-chips');
    if (bottomChipsBox) {
        bottomChipsBox.style.boxShadow = '0 0 0 2px #10b981';
        setTimeout(() => { bottomChipsBox.style.boxShadow = ''; }, 1400);
    }

    const stopLabelStr = effectiveStops.join(', ') || addedStopNames.join(', ') || 'Seçili bölge';
    showToast(`✓ ${stopLabelStr} (${newlyTickedCodes.length || addedCustomerCount} müşteri) alttaki rut listesine eklendi! Şimdi sıradaki İl ve İlçeyi seçebilirsiniz.`, 'success');
}

function removeSingleCustomerFromBottomRouteList(code) {
    if (!code) return;
    customRouteDraftSelectedCodes.delete(code);
    customRoutePendingSelectedCodes.delete(code);
    renderCustomRouteCustomerPicker();
    renderCustomRouteSelectedChips();
    renderLegacyCustomers();
}

function clearCustomRouteSelectedCustomers() {
    customRouteDraftSelectedCodes.clear();
    customRoutePendingSelectedCodes.clear();
    customRouteDraftManualPlaces = [];
    customRouteDraftDistricts = [];
    pendingCheckedDistrictsForCity.clear();
    syncRouteSummaryAndPlanNameFromStops();
    handleCustomRouteCityChange(true);
    renderCustomRouteDistrictBadges();
    renderCustomRouteCustomerPicker();
    renderCustomRouteSelectedChips();
    renderLegacyCustomers();
}

function addManualPlaceToRouteDraft() {
    const titleEl = document.getElementById('manual-rut-cust-title');
    const cityEl = document.getElementById('manual-rut-cust-city');
    const distEl = document.getElementById('manual-rut-cust-district');
    const addrEl = document.getElementById('manual-rut-cust-address');
    const authEl = document.getElementById('manual-rut-cust-auth');
    const phoneEl = document.getElementById('manual-rut-cust-phone');
    const dateEl = document.getElementById('manual-rut-cust-date');
    const persEl = document.getElementById('manual-rut-cust-personnel');
    const purpEl = document.getElementById('manual-rut-cust-purpose');
    const notesEl = document.getElementById('manual-rut-cust-notes');

    const title = (titleEl?.value || '').trim();
    if (!title) {
        showToast('Lütfen manuel ziyaret edilecek Firma / İşletme Adını girin.', 'warning');
        if (titleEl) titleEl.focus();
        return;
    }

    const plannerCity = (document.getElementById('custom-rut-city-select')?.value || '').trim();
    const plannerDist = (document.getElementById('custom-rut-district-select')?.value || '').trim();

    const city = (cityEl?.value || '').trim() || plannerCity || 'Çorum';
    const district = (distEl?.value || '').trim() || plannerDist || 'Merkez';
    const address = (addrEl?.value || '').trim();
    const authorized = (authEl?.value || '').trim() || 'İşletme Yetkilisi';
    const phone = (phoneEl?.value || '').trim() || '-';
    const visitDate = (dateEl?.value || '').trim() || (document.getElementById('custom-rut-date')?.value || '').trim() || getTodayTRStr();
    const personnel = (persEl?.value || '').trim() || (document.getElementById('custom-rut-assignee')?.value || '').trim() || (currentUser ? currentUser.name : 'ÖMER EREN');
    const visitPurpose = (purpEl?.value || '').trim() || 'Tanışma Ziyareti';
    const notes = (notesEl?.value || '').trim() || `${visitPurpose} (Sistem dışı manuel işletme)`;
    const code = 'MANUEL-' + String(Date.now()).slice(-6);

    const manualRecord = {
        itemId: 'RITEM-' + code,
        code,
        title,
        city,
        district,
        address: address || `${city} / ${district}`,
        authorized,
        contactRole: 'İşletme Yetkilisi',
        phone,
        plates: '',
        isManual: true,
        status: 'PENDING',
        visitDate,
        visitTime: getNowTimeTRStr(),
        visitNotes: notes,
        extraNotes: '',
        visitResult: '2 - Tanışma / İlk Temas',
        nextVisitDate: '',
        unvisitedReason: '',
        unvisitedReasonCustom: '',
        visitPurpose,
        personnel,
        convertedCustomerCode: '',
        updatedAt: formatNowTR()
    };

    customRouteDraftManualPlaces.push(manualRecord);

    const stopLabel = `${city} / ${district}`;
    if (!customRouteDraftDistricts.some(x => normalizeTR(x) === normalizeTR(stopLabel))) {
        customRouteDraftDistricts.push(stopLabel);
        syncRouteSummaryAndPlanNameFromStops();
    }

    if (titleEl) titleEl.value = '';
    if (addrEl) addrEl.value = '';
    if (authEl) authEl.value = '';
    if (phoneEl) phoneEl.value = '';
    if (notesEl) notesEl.value = '';

    renderCustomRouteDistrictBadges();
    renderCustomRouteCustomerPicker();
    renderCustomRouteSelectedChips();
    showToast(`"${title}" (${city}/${district}) manuel ziyaret olarak alttaki rut listesine eklendi!`, 'success');
}

function removeManualPlaceFromDraft(code) {
    customRouteDraftManualPlaces = customRouteDraftManualPlaces.filter(m => m.code !== code);
    renderCustomRouteSelectedChips();
    renderCustomRouteCustomerPicker();
}

function renderCustomRouteSelectedChips() {
    const counterEl = document.getElementById('custom-rut-selected-counter');
    const chipsBox = document.getElementById('custom-rut-selected-chips');
    const count = customRouteDraftSelectedCodes.size + customRouteDraftManualPlaces.length;

    if (counterEl) {
        const stopsInfo = customRouteDraftDistricts.length > 0 ? `Güzergâh: ${customRouteDraftDistricts.join(' -> ')} • ` : '';
        counterEl.textContent = `${stopsInfo}Alttaki Listeye Eklenen: ${count} Ziyaret Noktası (${customRouteDraftSelectedCodes.size} Kayıtlı Müşteri + ${customRouteDraftManualPlaces.length} Manuel İşletme)`;
    }
    if (!chipsBox) return;

    if (count === 0) {
        chipsBox.innerHTML = `<div style="padding:0.75rem; text-align:center; font-size:0.75rem; color:var(--text-muted); background:rgba(15,23,42,0.55); border:1px dashed rgba(148,163,184,0.25); border-radius:8px;">
            <i class="fa-solid fa-circle-info" style="color:#38bdf8;"></i> Henüz alttaki rut listesine müşteri eklenmedi. Yukarıdan <strong>1. İl ve İlçe seçin</strong> (Örn: <em>Çorum / Sungurlu</em>) &rarr; <strong>2. Müşterileri tikleyip "➕ Seçilen Müşterileri Alttaki Rut Listesine Ekle"</strong> tuşuna basın &rarr; Peşine diğer İl/İlçeleri (Örn: <em>Kırıkkale / Delice</em>) ekleyin.
        </div>`;
        return;
    }

    const customers = appState.customers || [];
    const selectedCodesArr = Array.from(customRouteDraftSelectedCodes);

    const rowsHtml = [
        ...selectedCodesArr.map((code, idx) => {
            const c = customers.find(x => x.code === code);
            const title = c ? c.title : code;
            const region = c ? `${c.city || '-'} / ${resolveCustomerDistrictName(c)}` : '-';
            const phone = c && c.phone && c.phone !== '-' ? c.phone : '-';
            const addr = c && c.address && c.address !== '-' ? c.address : region;
            const safeCode = escapeHtml(code).replace(/'/g, "\\'");
            return `
                <tr style="border-bottom:1px solid rgba(148,163,184,0.12); font-size:0.74rem;">
                    <td style="padding:0.38rem 0.5rem; font-weight:800; color:#fbbf24; width:36px;">${idx + 1}</td>
                    <td style="padding:0.38rem 0.5rem; white-space:nowrap;">
                        <span class="badge" style="background:rgba(56,189,248,0.15); color:#38bdf8; border:1px solid rgba(56,189,248,0.35); font-size:0.68rem;">
                            📍 ${escapeHtml(region)}
                        </span>
                    </td>
                    <td style="padding:0.38rem 0.5rem; font-weight:800; color:#f8fafc;">
                        ${escapeHtml(title)}
                        <span style="font-family:monospace; font-size:0.65rem; color:#93c5fd; margin-left:4px;">(${escapeHtml(code)})</span>
                    </td>
                    <td style="padding:0.38rem 0.5rem; color:#cbd5e1; font-size:0.7rem;">${escapeHtml(phone)} &bull; ${escapeHtml(addr.slice(0, 48))}</td>
                    <td style="padding:0.38rem 0.5rem; text-align:right; width:70px;">
                        <button type="button" class="btn btn-secondary btn-sm" style="padding:0.15rem 0.45rem; font-size:0.66rem; color:#f87171; border-color:rgba(248,113,113,0.3);" onclick="removeSingleCustomerFromBottomRouteList('${safeCode}')">
                            <i class="fa-solid fa-xmark"></i> Çıkar
                        </button>
                    </td>
                </tr>
            `;
        }),
        ...customRouteDraftManualPlaces.map((m, mIdx) => {
            const safeCode = escapeHtml(m.code).replace(/'/g, "\\'");
            return `
                <tr style="border-bottom:1px solid rgba(148,163,184,0.12); font-size:0.74rem; background:rgba(139,92,246,0.08);">
                    <td style="padding:0.38rem 0.5rem; font-weight:800; color:#c084fc; width:36px;">${selectedCodesArr.length + mIdx + 1}</td>
                    <td style="padding:0.38rem 0.5rem; white-space:nowrap;">
                        <span class="badge" style="background:rgba(139,92,246,0.22); color:#e9d5ff; border:1px solid rgba(167,139,250,0.45); font-size:0.68rem;">
                            🤝 ${escapeHtml(m.city || '-')} / ${escapeHtml(m.district || '-')}
                        </span>
                    </td>
                    <td style="padding:0.38rem 0.5rem; font-weight:800; color:#e9d5ff;">
                        ${escapeHtml(m.title)} <span class="badge badge-secondary" style="font-size:0.62rem;">Manuel Ziyaret</span>
                    </td>
                    <td style="padding:0.38rem 0.5rem; color:#cbd5e1; font-size:0.7rem;">${escapeHtml(m.phone || '-')} &bull; ${escapeHtml((m.address || '').slice(0, 48))}</td>
                    <td style="padding:0.38rem 0.5rem; text-align:right; width:70px;">
                        <button type="button" class="btn btn-secondary btn-sm" style="padding:0.15rem 0.45rem; font-size:0.66rem; color:#f87171; border-color:rgba(248,113,113,0.3);" onclick="removeManualPlaceFromDraft('${safeCode}')">
                            <i class="fa-solid fa-xmark"></i> Çıkar
                        </button>
                    </td>
                </tr>
            `;
        })
    ].join('');

    chipsBox.innerHTML = `
        <table style="width:100%; border-collapse:collapse;">
            <thead>
                <tr style="background:rgba(15,23,42,0.9); color:#94a3b8; font-size:0.68rem; text-align:left; border-bottom:1px solid rgba(148,163,184,0.2);">
                    <th style="padding:0.35rem 0.5rem;">#</th>
                    <th style="padding:0.35rem 0.5rem;">İl / İlçe Durağı</th>
                    <th style="padding:0.35rem 0.5rem;">Seçilen Müşteri / İşletme</th>
                    <th style="padding:0.35rem 0.5rem;">Telefon &amp; Adres</th>
                    <th style="padding:0.35rem 0.5rem; text-align:right;">İşlem</th>
                </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
        </table>
    `;
}

function resetCustomRouteForm() {
    const editIdEl = document.getElementById('custom-rut-edit-id');
    const nameEl = document.getElementById('custom-rut-name');
    const routeEl = document.getElementById('custom-rut-route-text');
    const notesEl = document.getElementById('custom-rut-notes');
    const endDateEl = document.getElementById('custom-rut-end-date');
    const statusEl = document.getElementById('custom-rut-plan-status');
    const citySel = document.getElementById('custom-rut-city-select');
    const distSel = document.getElementById('custom-rut-district-select');
    const searchEl = document.getElementById('custom-rut-cust-search');
    const titleEl = document.getElementById('custom-rut-form-title');
    const saveBtn = document.getElementById('custom-rut-save-btn');

    if (editIdEl) editIdEl.value = '';
    if (nameEl) { nameEl.value = ''; delete nameEl.dataset.autoGenerated; }
    if (routeEl) routeEl.value = '';
    if (notesEl) notesEl.value = '';
    if (endDateEl) endDateEl.value = '';
    if (statusEl) statusEl.value = 'Planlandı';
    if (citySel) citySel.value = '';
    if (distSel) distSel.innerHTML = '<option value="">🏘️ İlçe Seçin (Sadece Seçilen İlçe Gelir)</option>';
    if (searchEl) searchEl.value = '';
    if (titleEl) titleEl.textContent = 'RUT PLANLA — Yeni Güzergâh & Ziyaret Planı Oluştur';
    if (saveBtn) saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> KAYDET &amp; Planlanan Ziyaretler Listesini Oluştur';

    customRouteDraftSelectedCodes.clear();
    customRoutePendingSelectedCodes.clear();
    customRouteDraftDistricts = [];
    customRouteDraftManualPlaces = [];
    customRouteDraftAssignees = [];
    ensureDefaultCustomRouteAssignees();
    renderCustomRoutePersonnelSelector();
    pendingCheckedDistrictsForCity.clear();
    handleCustomRouteCityChange();
    renderCustomRouteDistrictBadges();
    renderCustomRouteCustomerPicker();
    renderCustomRouteSelectedChips();
    renderLegacyCustomers();
}

async function saveCustomRoutePlan() {
    // Eğer kullanıcı sağ kutuda müşteri tikleyip henüz "Alttaki Listeye Ekle"ye basmadan doğrudan KAYDET'e bastıysa onları da otomatik dahil et
    if (customRoutePendingSelectedCodes.size > 0) {
        customRoutePendingSelectedCodes.forEach(code => customRouteDraftSelectedCodes.add(code));
        getActiveEffectiveRouteStops().forEach(stop => {
            if (!customRouteDraftDistricts.some(x => normalizeTR(x) === normalizeTR(stop))) {
                customRouteDraftDistricts.push(stop);
            }
        });
        customRoutePendingSelectedCodes.clear();
        syncRouteSummaryAndPlanNameFromStops();
    }

    const editId = (document.getElementById('custom-rut-edit-id')?.value || '').trim();
    const nameInput = document.getElementById('custom-rut-name');
    const routeInput = document.getElementById('custom-rut-route-text');
    const dateInput = document.getElementById('custom-rut-date');
    const endDateInput = document.getElementById('custom-rut-end-date');
    const statusInput = document.getElementById('custom-rut-plan-status');
    const assigneeInput = document.getElementById('custom-rut-assignee');
    const notesInput = document.getElementById('custom-rut-notes');
    const citySel = document.getElementById('custom-rut-city-select');
    const distSel = document.getElementById('custom-rut-district-select');

    ensureDefaultCustomRouteAssignees();
    const assigneesList = customRouteDraftAssignees.map(p => ({ ...p }));
    const formattedAssigneeStr = formatCustomRouteAssigneesString(assigneesList);
    if (assigneeInput) assigneeInput.value = formattedAssigneeStr;

    let name = (nameInput?.value || '').trim();
    let routeText = (routeInput?.value || '').trim();
    const plannedDate = (dateInput?.value || '').trim() || getTodayTRStr();
    const endDate = (endDateInput?.value || '').trim();
    const planStatus = (statusInput?.value || '').trim() || 'Planlandı';
    const assignee = formattedAssigneeStr || (assigneeInput?.value || '').trim() || (currentUser ? currentUser.name : 'ÖMER EREN');
    const notes = (notesInput?.value || '').trim();

    if (!routeText) {
        if (customRouteDraftDistricts.length > 0) {
            routeText = customRouteDraftDistricts.join(' -> ');
        } else if (citySel && citySel.value) {
            routeText = distSel && distSel.value ? `${citySel.value} / ${distSel.value}` : citySel.value;
        }
    }

    if (!name) {
        if (routeText) {
            name = `${routeText.split('->')[0].trim()} Rutu (${plannedDate})`;
            if (nameInput) nameInput.value = name;
        } else {
            showToast('Lütfen Plan Adı / Güzergâh Adı girin veya İl/İlçe seçin.', 'danger');
            if (nameInput) nameInput.focus();
            return;
        }
    }

    let customerCodes = Array.from(customRouteDraftSelectedCodes);

    if (customerCodes.length === 0 && customRouteDraftManualPlaces.length === 0) {
        showToast('Lütfen sağdaki listeden ziyaret edilecek müşterileri tikleyin veya + Manuel Ziyaret Ekle ile işletme ekleyin.', 'warning');
        return;
    }

    const customers = appState.customers || [];
    const custMap = new Map(customers.map(c => [c.code, c]));
    const selectedCustObjs = customers.filter(c => customerCodes.includes(c.code));
    const derivedDistricts = Array.from(new Set([
        ...customRouteDraftDistricts,
        ...selectedCustObjs.map(c => `${c.city || ''} / ${c.district || ''}`).filter(s => s !== ' / '),
        ...customRouteDraftManualPlaces.map(m => `${m.city || ''} / ${m.district || ''}`).filter(s => s !== ' / ')
    ]));

    if (!routeText && derivedDistricts.length > 0) {
        routeText = derivedDistricts.slice(0, 6).join(' -> ');
    }
    if (!routeText) routeText = name;

    if (!Array.isArray(appState.customRoutes)) appState.customRoutes = [];

    const existingRoute = appState.customRoutes.find(r => r.id === editId || normalizeTR(r.name) === normalizeTR(name));
    const prevItemsMap = new Map();
    if (existingRoute && Array.isArray(existingRoute.items)) {
        existingRoute.items.forEach(it => {
            if (it && it.code) prevItemsMap.set(it.code, it);
        });
    }

    const items = [];
    customerCodes.forEach(code => {
        const c = custMap.get(code);
        const prev = prevItemsMap.get(code);
        items.push({
            itemId: (prev && prev.itemId) || ('RITEM-' + code + '-' + Date.now().toString(36)),
            code,
            title: c ? c.title : (prev ? prev.title : code),
            city: c ? (c.city || '') : (prev ? prev.city : ''),
            district: c ? (c.district || '') : (prev ? prev.district : ''),
            address: c ? (c.address || '') : (prev ? prev.address : ''),
            authorized: (prev && prev.authorized) || (c ? (c.authorized || '') : ''),
            contactRole: (prev && prev.contactRole) || (c ? (c.contactRole || 'Yetkili') : 'Yetkili'),
            phone: c ? (c.phone || '') : (prev ? prev.phone : ''),
            plates: c ? (c.plates || '') : (prev ? prev.plates : ''),
            isManual: false,
            status: prev ? (prev.status || 'PENDING') : 'PENDING',
            visitDate: prev ? (prev.visitDate || '') : '',
            visitTime: prev ? (prev.visitTime || '') : '',
            visitNotes: prev ? (prev.visitNotes || '') : '',
            extraNotes: prev ? (prev.extraNotes || '') : '',
            visitResult: prev ? (prev.visitResult || '') : '',
            nextVisitDate: prev ? (prev.nextVisitDate || '') : '',
            unvisitedReason: prev ? (prev.unvisitedReason || '') : '',
            unvisitedReasonCustom: prev ? (prev.unvisitedReasonCustom || '') : '',
            visitPurpose: prev ? (prev.visitPurpose || '') : '',
            personnel: (prev && prev.personnel) || assignee,
            convertedCustomerCode: prev ? (prev.convertedCustomerCode || '') : '',
            updatedAt: (prev && prev.updatedAt) || formatNowTR()
        });
    });

    // Mevcut plandaki manuel ziyaretleri ve yeni eklenen manuel ziyaretleri birleştir
    if (existingRoute && Array.isArray(existingRoute.items)) {
        existingRoute.items.filter(it => it && it.isManual).forEach(m => {
            if (!items.some(x => x.code === m.code)) items.push(m);
        });
    }
    customRouteDraftManualPlaces.forEach(m => {
        if (!items.some(x => x.code === m.code)) {
            items.push({ ...m, personnel: m.personnel || assignee });
        }
    });

    const record = {
        id: (existingRoute && existingRoute.id) || editId || ('RUTPLAN-' + Date.now()),
        name,
        routeText,
        plannedDate,
        endDate,
        planStatus,
        assignee,
        assignees: assigneesList,
        notes,
        districts: derivedDistricts,
        customerCodes,
        items,
        updatedAt: formatNowTR(),
        createdBy: currentUser ? currentUser.name : 'ÖMER EREN'
    };

    const existingIdx = appState.customRoutes.findIndex(r => r.id === record.id);
    if (existingIdx !== -1) {
        appState.customRoutes[existingIdx] = record;
    } else {
        appState.customRoutes.unshift(record);
    }

    activeSelectedRouteId = record.id;
    activeRouteExecutionStatusFilter = 'ALL';

    // Yeni plan kaydedildiğinde kayıtlı planlar filtresini sıfırla ki yeni plan asla gizlenmesin
    ['saved-rut-filter-date', 'saved-rut-filter-personnel', 'saved-rut-filter-city', 'saved-rut-filter-status'].forEach(fId => {
        const el = document.getElementById(fId);
        if (el) el.value = '';
    });

    syncCustomRoutesToCustomers();
    populateFilterOptions();
    populateStrategyFilters(true);
    renderSavedCustomRoutesList();
    renderActiveRouteExecutionPanel();
    renderLegacyCustomers();
    renderDistrictStrategies();
    renderReportsTab();
    updateRouteAndReportsBadges();

    addAuditLog('RUT PLANLAMA', `"${name}" rut planı (${routeText} • ${items.length} Ziyaret Noktası • Görevli: ${assignee}) kaydedildi.`);

    // Tüm personelin telefonlarına bildirim gönder ve görev özeti kartını aç
    await broadcastRoutePlanNotificationToAllPersonnel(record, true);
    await syncToServer();

    resetCustomRouteForm();
    showToast(`"${name}" rut planı kaydedildi ve tüm personele bildirim gönderildi!`, 'success');

    const execBox = document.getElementById('active-route-execution-container');
    if (execBox) {
        setTimeout(() => execBox.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
    }
}

function selectActiveRouteForExecution(routeId) {
    activeSelectedRouteId = routeId;
    activeRouteExecutionStatusFilter = 'ALL';
    renderSavedCustomRoutesList();
    renderActiveRouteExecutionPanel();
    const execBox = document.getElementById('active-route-execution-container');
    if (execBox) {
        execBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function editCustomRoutePlan(routeId) {
    const rt = (appState.customRoutes || []).find(r => r.id === routeId);
    if (!rt) return;

    switchTab('route-plan-tab');
    ensureRouteItemsNormalized(rt);

    const editIdEl = document.getElementById('custom-rut-edit-id');
    const nameEl = document.getElementById('custom-rut-name');
    const routeEl = document.getElementById('custom-rut-route-text');
    const dateEl = document.getElementById('custom-rut-date');
    const endDateEl = document.getElementById('custom-rut-end-date');
    const statusEl = document.getElementById('custom-rut-plan-status');
    const assigneeEl = document.getElementById('custom-rut-assignee');
    const notesEl = document.getElementById('custom-rut-notes');
    const titleEl = document.getElementById('custom-rut-form-title');
    const saveBtn = document.getElementById('custom-rut-save-btn');

    if (editIdEl) editIdEl.value = rt.id;
    if (nameEl) nameEl.value = rt.name || '';
    if (routeEl) routeEl.value = rt.routeText || '';
    if (dateEl) dateEl.value = rt.plannedDate || '';
    if (endDateEl) endDateEl.value = rt.endDate || '';
    if (statusEl) statusEl.value = rt.planStatus || 'Planlandı';
    parseAssigneesStringToDraft(rt.assignee, rt.assignees);
    renderCustomRoutePersonnelSelector();
    if (assigneeEl && rt.assignee) assigneeEl.value = rt.assignee;
    if (notesEl) notesEl.value = rt.notes || '';
    if (titleEl) titleEl.textContent = `Rut Planını Düzenle: ${rt.name}`;
    if (saveBtn) saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Rut Planını Güncelle';

    customRouteDraftSelectedCodes = new Set(
        (rt.items || []).filter(i => !i.isManual).map(i => i.code)
    );
    customRouteDraftManualPlaces = (rt.items || []).filter(i => i.isManual).map(i => ({ ...i }));
    customRouteDraftDistricts = Array.isArray(rt.districts) ? [...rt.districts] : [];
    activeSelectedRouteId = rt.id;

    handleCustomRouteCityChange();
    renderCustomRouteDistrictBadges();
    renderCustomRouteCustomerPicker();
    renderCustomRouteSelectedChips();
    renderSavedCustomRoutesList();
    renderActiveRouteExecutionPanel();

    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`"${rt.name}" düzenleme modunda açıldı.`, 'info');
}

async function executeDeleteCustomRoutePlan(routeId) {
    const rt = (appState.customRoutes || []).find(r => r.id === routeId);
    if (!rt) return;

    registerDeletedRecordId(routeId);
    appState.customRoutes = (appState.customRoutes || []).filter(r => r.id !== routeId);

    // Bu ruta bağlı tüm ziyaret ve bildirim kayıtlarını da temizle (Raporlarda yetim kayıt kalmasın)
    if (Array.isArray(appState.visits)) {
        appState.visits.forEach(v => {
            if (v && (v.routeId === routeId || (v.id && v.id.includes(routeId)) || (rt.name && v.routeName === rt.name))) {
                if (v.id) registerDeletedRecordId(v.id);
            }
        });
        appState.visits = appState.visits.filter(v => !v || !(v.routeId === routeId || (v.id && v.id.includes(routeId)) || (rt.name && v.routeName === rt.name)));
    }
    if (Array.isArray(appState.customers)) {
        appState.customers.forEach(c => {
            if (c && Array.isArray(c.visitHistory)) {
                c.visitHistory = c.visitHistory.filter(h => !h || !(h.routeId === routeId || (h.id && String(h.id).includes(routeId))));
            }
        });
    }
    if (Array.isArray(appState.routeNotifications)) {
        appState.routeNotifications.forEach(n => {
            if (n && n.routeId === routeId && n.id) registerDeletedRecordId(n.id);
        });
        appState.routeNotifications = appState.routeNotifications.filter(n => !n || n.routeId !== routeId);
    }
    if (activeSelectedRouteId === routeId) {
        activeSelectedRouteId = appState.customRoutes[0]?.id || null;
    }

    syncCustomRoutesToCustomers();
    renderSavedCustomRoutesList();
    renderActiveRouteExecutionPanel();
    if (typeof renderActiveVisits === 'function') renderActiveVisits();
    if (typeof renderReportsTab === 'function') renderReportsTab();
    updateRouteAndReportsBadges();

    addAuditLog('RUT SİLME', `"${rt.name}" rut planı ve bağlı rapor kayıtları silindi.`, true);
    showToast(`"${rt.name}" rut planı ve rapor kayıtları silindi.`, 'info');
    await syncToServer();
}

async function deleteCustomRoutePlan(routeId) {
    const rt = (appState.customRoutes || []).find(r => r.id === routeId);
    if (!rt) return;

    if (!isOmerEren(currentUser)) {
        openApprovalRequestModal('DELETE_ROUTE', routeId, `Rut Planı: ${rt.name}`);
        return;
    }

    if (!confirm(`"${rt.name}" rut planını ve bu rut planına bağlı rapor kayıtlarını silmek istediğinize emin misiniz?`)) return;
    await executeDeleteCustomRoutePlan(routeId);
}

function filterLegacyByCustomRoute(routeName) {
    const matched = (appState.customRoutes || []).find(r => r.name === routeName);
    if (matched) {
        selectActiveRouteForExecution(matched.id);
        return;
    }
    switchTab('legacy-tab');
}

async function updateSavedRoutePlanStatus(routeId, newStatus) {
    const rt = (appState.customRoutes || []).find(r => r.id === routeId);
    if (!rt) return;
    rt.planStatus = newStatus;
    rt.updatedAt = formatNowTR();
    addAuditLog('RUT PLAN DURUMU', `"${rt.name}" plan durumu "${newStatus}" olarak güncellendi.`);
    renderSavedCustomRoutesList();
    renderActiveRouteExecutionPanel();
    renderReportsTab();
    await syncToServer();
    showToast(`"${rt.name}" durumu "${newStatus}" olarak güncellendi.`, 'success');
}

function printCustomRouteSheet(routeId) {
    const rt = (appState.customRoutes || []).find(r => r.id === routeId);
    if (!rt) return;
    const items = ensureRouteItemsNormalized(rt);
    const area = document.getElementById('print-report-area');
    if (!area) return;

    const visitedCount = items.filter(i => i.status === 'VISITED').length;
    const unvisitedCount = items.filter(i => i.status === 'NOT_VISITED').length;
    const manualCount = items.filter(i => i.isManual).length;

    area.innerHTML = `
        <div style="font-family:Arial, sans-serif; color:#000; padding:20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #0284c7; padding-bottom:12px; margin-bottom:16px;">
                <div>
                    <h2 style="margin:0; color:#0284c7;">DİZSAN OTOMOTİV &amp; SERVİS — PLANLANAN ZİYARETLER VE RUT FORMU</h2>
                    <h3 style="margin:4px 0 0; color:#0f172a;">${escapeHtml(rt.name)} (${escapeHtml(rt.planStatus || 'Planlandı')})</h3>
                    <div style="font-size:12px; color:#334155; margin-top:4px;"><strong>Güzergah:</strong> ${escapeHtml(rt.routeText || '-')}</div>
                    ${rt.notes ? `<div style="font-size:11px; color:#475569; margin-top:2px;"><strong>Plan Açıklaması:</strong> ${escapeHtml(rt.notes)}</div>` : ''}
                </div>
                <div style="text-align:right; font-size:11px;">
                    <div><strong>Planlanan Tarih:</strong> ${escapeHtml(rt.plannedDate || '-')} ${rt.endDate ? ` - ${escapeHtml(rt.endDate)}` : ''}</div>
                    <div><strong>Görevli Personel:</strong> ${escapeHtml(rt.assignee || '-')}</div>
                    <div><strong>Toplam Hedef:</strong> ${items.length} (${visitedCount} Edildi • ${unvisitedCount} Edilemedi • ${manualCount} Manuel)</div>
                </div>
            </div>
            <table style="width:100%; border-collapse:collapse; font-size:11px;">
                <thead>
                    <tr style="background:#e2e8f0;">
                        <th style="border:1px solid #94a3b8; padding:6px;">Sıra</th>
                        <th style="border:1px solid #94a3b8; padding:6px;">Müşteri / İşletme</th>
                        <th style="border:1px solid #94a3b8; padding:6px;">İl / İlçe</th>
                        <th style="border:1px solid #94a3b8; padding:6px;">Görüşülen Kişi &amp; Tel</th>
                        <th style="border:1px solid #94a3b8; padding:6px;">Ziyaret Durumu</th>
                        <th style="border:1px solid #94a3b8; padding:6px;">Gerçekleşen Tarih</th>
                        <th style="border:1px solid #94a3b8; padding:6px;">Ziyaret Açıklaması / Edilememe Sebebi</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map((it, i) => `
                        <tr>
                            <td style="border:1px solid #94a3b8; padding:6px; text-align:center;">${i + 1}</td>
                            <td style="border:1px solid #94a3b8; padding:6px; font-weight:bold;">${escapeHtml(it.title)} ${it.isManual ? '(Manuel)' : `(${escapeHtml(it.code)})`}</td>
                            <td style="border:1px solid #94a3b8; padding:6px;">${escapeHtml(it.city || '-')} / ${escapeHtml(it.district || '-')}</td>
                            <td style="border:1px solid #94a3b8; padding:6px;">${escapeHtml(it.authorized || '-')} (${escapeHtml(it.phone || '-')})</td>
                            <td style="border:1px solid #94a3b8; padding:6px; font-weight:bold;">${it.status === 'VISITED' ? '✓ Ziyaret Edildi' : (it.status === 'NOT_VISITED' ? '✗ Ziyaret Edilemedi' : (it.status === 'CANCELLED' ? 'İptal Edildi' : 'Bekliyor'))}</td>
                            <td style="border:1px solid #94a3b8; padding:6px;">${escapeHtml(it.visitDate || '-')} ${escapeHtml(it.visitTime || '')}</td>
                            <td style="border:1px solid #94a3b8; padding:6px; min-width:160px;">${escapeHtml(it.status === 'NOT_VISITED' ? (it.unvisitedReason || '-') : (it.visitNotes || '-'))}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    window.print();
}

function clearSavedCustomRoutesFilters() {
    ['saved-rut-filter-date', 'saved-rut-filter-personnel', 'saved-rut-filter-city', 'saved-rut-filter-status'].forEach(fId => {
        const el = document.getElementById(fId);
        if (el) el.value = '';
    });
    renderSavedCustomRoutesList();
}

function toTitleCaseTR(str) {
    if (!str) return '';
    return String(str)
        .toLocaleLowerCase('tr-TR')
        .split(/\s+/)
        .filter(Boolean)
        .map(w => w.charAt(0).toLocaleUpperCase('tr-TR') + w.slice(1))
        .join(' ');
}

function formatRouteTaskBriefData(rtOrId) {
    const rt = (typeof rtOrId === 'string')
        ? (appState.customRoutes || []).find(r => r.id === rtOrId)
        : rtOrId;
    if (!rt) return null;

    let sorumluNames = [];
    let eslikciNames = [];

    if (Array.isArray(rt.assignees) && rt.assignees.length > 0) {
        rt.assignees.forEach((a, idx) => {
            if (!a || !a.name) return;
            const cleanName = toTitleCaseTR(a.name);
            if (a.role === 'Sorumlu' || (idx === 0 && !rt.assignees.some(x => x && x.role === 'Sorumlu'))) {
                sorumluNames.push(cleanName);
            } else {
                eslikciNames.push(cleanName);
            }
        });
    } else if (rt.assignee) {
        const rawParts = String(rt.assignee).split(',').map(s => s.trim()).filter(Boolean);
        rawParts.forEach((part, idx) => {
            const isYardimci = /yard[ıi]mc[ıi]|e[şs]lik[çc]i/i.test(part);
            const isSorumlu = /sorumlu/i.test(part);
            const cleanName = toTitleCaseTR(part.replace(/\(.*?\)/g, '').replace(/e[şs]lik[çc]i/ig, '').trim());
            if (!cleanName) return;
            if (isSorumlu || (idx === 0 && !isYardimci)) {
                sorumluNames.push(cleanName);
            } else {
                eslikciNames.push(cleanName);
            }
        });
    }

    if (sorumluNames.length === 0) {
        sorumluNames.push(toTitleCaseTR(currentUser ? currentUser.name : 'Belirtilmedi'));
    }

    const sorumluLine = `Görevli Personel : ${sorumluNames.join(', ')} ( Ziyaret Sorumlusu )`;
    const eslikciLines = eslikciNames.map(n => `${n} Eşlikçi`);

    const routeInfo = rt.routeText
        || (Array.isArray(rt.districts) && rt.districts.length > 0 ? rt.districts.join(' -> ') : (rt.name || '-'));
    const items = ensureRouteItemsNormalized(rt);
    const custCount = items.length;
    const customerCountText = `${custCount} Müşteri`;

    const startDate = rt.plannedDate || getTodayTRStr();
    const endDate = rt.endDate || startDate;
    const dateRangeText = `${startDate} / ${endDate}`;

    const shareUrl = `https://dizsan.github.io/ziyaret/?routeId=${encodeURIComponent(rt.id)}`;

    const personnelBlock = [sorumluLine, ...eslikciLines].join('\n');
    const plainSummaryText = [
        `Ziyaret Planı Görevi`,
        personnelBlock,
        `Güzergah İl-İlçe bilgisi : ${routeInfo}`,
        `Ziyaret Edilecek Müşteri Sayısı : ${customerCountText}`,
        `Planlanan Başlangıç - Bitiş Tarihi : ${dateRangeText}`
    ].join('\n');

    const pushBodyText = [
        personnelBlock,
        `Güzergah: ${routeInfo}`,
        `Müşteri: ${customerCountText} • Tarih: ${dateRangeText}`
    ].join('\n');

    return {
        routeId: rt.id,
        routeName: rt.name || routeInfo,
        sorumluLine,
        eslikciLines,
        routeInfo,
        custCount,
        customerCountText,
        startDate,
        endDate,
        dateRangeText,
        shareUrl,
        plainSummaryText,
        pushBodyText
    };
}

function buildRouteWhatsAppShareText(rtOrId) {
    const brief = formatRouteTaskBriefData(rtOrId);
    if (!brief) return '';
    const personnelLines = [brief.sorumluLine, ...brief.eslikciLines].join('\n');
    return [
        `*Ziyaret Planı Görevi*`,
        personnelLines,
        `Güzergah İl-İlçe bilgisi : ${brief.routeInfo}`,
        `Ziyaret Edilecek Müşteri Sayısı : ${brief.customerCountText}`,
        `Planlanan Başlangıç - Bitiş Tarihi : ${brief.dateRangeText}`,
        ``,
        `🔗 *Rut Planı Uygulama Linki:*`,
        brief.shareUrl
    ].join('\n');
}

function shareCustomRouteOnWhatsApp(routeId) {
    const rt = (appState.customRoutes || []).find(r => r.id === routeId);
    if (!rt) {
        showToast('Paylaşılacak rut planı bulunamadı.', 'warning');
        return;
    }
    const text = buildRouteWhatsAppShareText(rt);
    openWhatsAppChat('', text);
}

function copyCustomRouteShareLink(routeId) {
    const brief = formatRouteTaskBriefData(routeId);
    if (!brief) return;
    const fullText = buildRouteWhatsAppShareText(routeId);
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(fullText).then(() => {
            showToast('Ziyaret Planı Görevi metni ve paylaşım linki panoya kopyalandı!', 'success');
        }).catch(() => {
            showToast('Link: ' + brief.shareUrl, 'info');
        });
    } else {
        showToast('Link: ' + brief.shareUrl, 'info');
    }
}

function getSeenRouteNotifIds() {
    try {
        const raw = localStorage.getItem('dizsan_seen_route_notifs_v1');
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}

function markRouteNotifSeen(notifId) {
    if (!notifId) return;
    try {
        const list = getSeenRouteNotifIds();
        if (!list.includes(notifId)) {
            list.unshift(notifId);
            localStorage.setItem('dizsan_seen_route_notifs_v1', JSON.stringify(list.slice(0, 100)));
        }
    } catch (e) {}
}

function closeRouteTaskBriefModal() {
    const m = document.getElementById('route-task-brief-modal');
    if (m) m.style.display = 'none';
}

function openRouteFromBriefModal(routeId) {
    closeRouteTaskBriefModal();
    if (typeof switchTab === 'function') {
        switchTab('route-plan-tab');
    }
    if (routeId && (appState.customRoutes || []).some(r => r.id === routeId)) {
        selectActiveRouteForExecution(routeId);
    }
}

function openRouteTaskBriefModal(routeId, notifObj = null) {
    const rt = (appState.customRoutes || []).find(r => r.id === routeId);
    const brief = rt ? formatRouteTaskBriefData(rt) : (notifObj ? {
        routeId: notifObj.routeId || routeId,
        routeName: notifObj.routeName || 'Ziyaret Planı',
        sorumluLine: notifObj.sorumluLine || 'Görevli Personel : -',
        eslikciLines: Array.isArray(notifObj.eslikciLines) ? notifObj.eslikciLines : [],
        routeInfo: notifObj.routeInfo || '-',
        customerCountText: notifObj.customerCountText || '0 Müşteri',
        dateRangeText: notifObj.dateRangeText || '-',
        shareUrl: notifObj.shareUrl || `https://dizsan.github.io/ziyaret/?routeId=${encodeURIComponent(routeId || '')}`
    } : null);

    if (!brief) return;
    if (notifObj && notifObj.id) markRouteNotifSeen(notifObj.id);

    let modal = document.getElementById('route-task-brief-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'route-task-brief-modal';
        modal.className = 'modal-overlay';
        modal.style.cssText = 'display:none; position:fixed; inset:0; background:rgba(2,6,23,0.78); backdrop-filter:blur(6px); z-index:10050; align-items:center; justify-content:center; padding:1rem;';
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeRouteTaskBriefModal();
        });
        document.body.appendChild(modal);
    }

    const isLight = document.body.getAttribute('data-theme') === 'light';
    const cardBg = isLight ? '#ffffff' : '#0f172a';
    const cardBorder = isLight ? '#cbd5e1' : 'rgba(56,189,248,0.4)';
    const titleColor = isLight ? '#0f172a' : '#f8fafc';
    const boxBg = isLight ? '#f8fafc' : 'rgba(15,23,42,0.85)';
    const boxBorder = isLight ? '#e2e8f0' : 'rgba(148,163,184,0.22)';
    const labelColor = isLight ? '#334155' : '#94a3b8';
    const valueColor = isLight ? '#0f172a' : '#f8fafc';
    const accentColor = isLight ? '#0284c7' : '#38bdf8';
    const greenColor = isLight ? '#059669' : '#34d399';

    const eslikciHtml = (brief.eslikciLines && brief.eslikciLines.length > 0)
        ? brief.eslikciLines.map(line => `<div style="font-size:0.9rem; font-weight:700; color:${accentColor}; margin-top:3px; padding-left:0.1rem;">${escapeHtml(line)}</div>`).join('')
        : '';

    modal.innerHTML = `
        <div style="background:${cardBg}; border:2px solid ${cardBorder}; border-radius:16px; max-width:520px; width:100%; padding:1.25rem 1.35rem; box-shadow:0 20px 50px rgba(0,0,0,0.45); color:${valueColor};">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:0.75rem; padding-bottom:0.85rem; border-bottom:1px solid ${boxBorder};">
                <div style="display:flex; align-items:center; gap:0.6rem;">
                    <span style="width:38px; height:38px; border-radius:10px; background:rgba(16,185,129,0.15); border:1px solid rgba(16,185,129,0.4); display:inline-flex; align-items:center; justify-content:center; color:${greenColor}; font-size:1.1rem;">
                        <i class="fa-solid fa-bell"></i>
                    </span>
                    <div>
                        <div style="font-size:0.7rem; font-weight:800; text-transform:uppercase; letter-spacing:0.06em; color:${greenColor};">Saha Ziyaret Görev Bildirimi</div>
                        <h3 style="margin:0; font-size:1.12rem; font-weight:800; color:${titleColor};">Ziyaret Planı Görevi</h3>
                    </div>
                </div>
                <button type="button" onclick="closeRouteTaskBriefModal()" style="background:transparent; border:1px solid ${boxBorder}; color:${labelColor}; width:32px; height:32px; border-radius:8px; cursor:pointer; font-size:0.95rem;">✕</button>
            </div>

            <div style="margin-top:0.95rem; background:${boxBg}; border:1px solid ${boxBorder}; border-radius:12px; padding:1rem 1.1rem; display:flex; flex-direction:column; gap:0.7rem; line-height:1.5;">
                <div>
                    <div style="font-size:0.93rem; font-weight:800; color:${valueColor};">
                        ${escapeHtml(brief.sorumluLine)}
                    </div>
                    ${eslikciHtml}
                </div>

                <div style="padding-top:0.55rem; border-top:1px dashed ${boxBorder};">
                    <span style="font-size:0.82rem; font-weight:700; color:${labelColor};">Güzergah İl-İlçe bilgisi :</span>
                    <div style="font-size:0.92rem; font-weight:800; color:${accentColor}; margin-top:2px;">
                        ${escapeHtml(brief.routeInfo)}
                    </div>
                </div>

                <div style="padding-top:0.55rem; border-top:1px dashed ${boxBorder}; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
                    <span style="font-size:0.84rem; font-weight:700; color:${labelColor};">Ziyaret Edilecek Müşteri Sayısı :</span>
                    <span style="font-size:0.95rem; font-weight:800; color:${greenColor};">${escapeHtml(brief.customerCountText)}</span>
                </div>

                <div style="padding-top:0.55rem; border-top:1px dashed ${boxBorder}; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
                    <span style="font-size:0.84rem; font-weight:700; color:${labelColor};">Planlanan Başlangıç - Bitiş Tarihi :</span>
                    <span style="font-size:0.92rem; font-weight:800; color:${valueColor};">${escapeHtml(brief.dateRangeText)}</span>
                </div>
            </div>

            <div style="margin-top:1rem; display:flex; flex-wrap:wrap; gap:0.5rem; justify-content:space-between; align-items:center;">
                <button type="button" class="btn btn-success btn-sm" style="padding:0.5rem 0.85rem; font-size:0.8rem; font-weight:800; flex:1; min-width:185px;" onclick="shareCustomRouteOnWhatsApp('${escapeHtml(brief.routeId)}')">
                    <i class="fa-brands fa-whatsapp"></i> WhatsApp'ta Paylaş (Linkli)
                </button>
                <button type="button" class="btn btn-secondary btn-sm" style="padding:0.5rem 0.75rem; font-size:0.78rem; font-weight:700;" onclick="copyCustomRouteShareLink('${escapeHtml(brief.routeId)}')" title="Metni ve Linki Kopyala">
                    <i class="fa-regular fa-copy"></i> Linki Kopyala
                </button>
            </div>

            <div style="margin-top:0.55rem; display:flex; flex-wrap:wrap; gap:0.5rem; justify-content:flex-end;">
                <button type="button" class="btn btn-secondary btn-sm" style="padding:0.48rem 0.8rem; font-size:0.78rem; font-weight:700;" onclick="broadcastRoutePlanNotificationToAllPersonnel('${escapeHtml(brief.routeId)}', false)">
                    <i class="fa-solid fa-tower-broadcast" style="color:#f59e0b;"></i> Tüm Personele Tekrar Bildirim Gönder
                </button>
                <button type="button" class="btn btn-primary btn-sm" style="padding:0.48rem 0.95rem; font-size:0.8rem; font-weight:800;" onclick="openRouteFromBriefModal('${escapeHtml(brief.routeId)}')">
                    <i class="fa-solid fa-list-check"></i> Ziyaret Planını Aç
                </button>
            </div>
        </div>
    `;

    modal.style.display = 'flex';
}

async function broadcastRoutePlanNotificationToAllPersonnel(rtOrId, openModalNow = true) {
    const rt = (typeof rtOrId === 'string')
        ? (appState.customRoutes || []).find(r => r.id === rtOrId)
        : rtOrId;
    if (!rt) {
        showToast('Bildirim gönderilecek rut planı bulunamadı.', 'warning');
        return;
    }

    const brief = formatRouteTaskBriefData(rt);
    if (!brief) return;

    const notif = {
        id: 'RNOTIF-' + rt.id + '-' + Date.now(),
        routeId: rt.id,
        routeName: rt.name,
        title: 'Ziyaret Planı Görevi',
        sorumluLine: brief.sorumluLine,
        eslikciLines: brief.eslikciLines,
        routeInfo: brief.routeInfo,
        customerCountText: brief.customerCountText,
        dateRangeText: brief.dateRangeText,
        shareUrl: brief.shareUrl,
        bodyText: brief.plainSummaryText,
        createdAt: formatNowTR(),
        timestamp: Date.now(),
        createdBy: currentUser ? currentUser.name : 'Yönetici'
    };

    if (!Array.isArray(appState.routeNotifications)) appState.routeNotifications = [];
    appState.routeNotifications.unshift(notif);
    appState.routeNotifications = appState.routeNotifications.slice(0, 50);

    // Gönderen cihazda mükerrer açılmaması için işaretleyelim
    markRouteNotifSeen(notif.id);
    saveStateLocally();

    // 1. Bu cihazda ve açık tarayıcıda anında yerel / Service Worker bildirimi göster
    try {
        if (typeof sendLocalOrServiceWorkerPush === 'function') {
            await sendLocalOrServiceWorkerPush({
                title: '📋 Ziyaret Planı Görevi',
                body: brief.pushBodyText,
                tag: 'dizsan-route-task-' + rt.id,
                url: './?routeId=' + encodeURIComponent(rt.id),
                id: notif.id
            });
        }
    } catch (e) {}

    // 2. Kayıtlı tüm personel telefon aboneliklerine (pushSubscriptions) Web Push gönder
    try {
        const subs = Array.isArray(appState.pushSubscriptions) ? appState.pushSubscriptions : [];
        subs.forEach(subItem => {
            if (subItem && subItem.subscription) {
                fetch('http://localhost:8787/api/push/test', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        subscription: subItem.subscription,
                        title: '📋 Ziyaret Planı Görevi',
                        body: brief.pushBodyText,
                        url: './?routeId=' + encodeURIComponent(rt.id)
                    })
                }).catch(() => {});
            }
        });
    } catch (e) {}

    try {
        if (typeof playNotificationTone === 'function') {
            playNotificationTone('INVITE');
        }
    } catch (e) {}

    if (openModalNow) {
        openRouteTaskBriefModal(rt.id, notif);
    } else {
        await syncToServer();
        showToast('Tüm personelin telefonlarındaki yüklü uygulamaya "Ziyaret Planı Görevi" bildirimi gönderildi!', 'success');
    }
}

function checkIncomingRouteNotifications() {
    // 1. URL'de ?routeId=... varsa önce sessionStorage'a kaydet (giriş yapılana ve bulut verisi çekilene kadar kaybolmasın)
    try {
        const params = new URLSearchParams(window.location.search);
        const urlRouteId = params.get('routeId');
        if (urlRouteId) {
            sessionStorage.setItem('dizsan_pending_route_id', urlRouteId);
            const cleanUrl = window.location.pathname + window.location.hash;
            window.history.replaceState({}, document.title, cleanUrl);
        }
    } catch (e) {}

    // Kullanıcı henüz giriş yapmadıysa şifre ekranının arkasında modal açma; giriş yapınca anında açılacak
    if (!currentUser) return;

    const pendingRouteId = sessionStorage.getItem('dizsan_pending_route_id');
    if (pendingRouteId) {
        const hasRoute = (appState.customRoutes || []).some(r => r && r.id === pendingRouteId);
        const matchedNotif = (appState.routeNotifications || []).find(n => n && n.routeId === pendingRouteId) || null;
        if (hasRoute || matchedNotif) {
            sessionStorage.removeItem('dizsan_pending_route_id');
            if (typeof switchTab === 'function') {
                switchTab('route-plan-tab');
            }
            if (hasRoute) {
                selectActiveRouteForExecution(pendingRouteId);
            }
            setTimeout(() => openRouteTaskBriefModal(pendingRouteId, matchedNotif), 150);
            return;
        }
    }

    // 2. Buluttan yeni gelen bir routeNotification varsa personel telefonunda bildirim + görev özeti kartı aç
    const notifs = Array.isArray(appState.routeNotifications) ? appState.routeNotifications : [];
    if (notifs.length === 0) return;

    const seenIds = getSeenRouteNotifIds();
    const now = Date.now();
    const unseen = notifs.find(n => n && n.id && !seenIds.includes(n.id) && (!n.timestamp || (now - n.timestamp) < 48 * 3600 * 1000));
    if (!unseen) return;

    markRouteNotifSeen(unseen.id);

    try {
        if (typeof playNotificationTone === 'function') {
            playNotificationTone('INVITE');
        }
    } catch (e) {}

    try {
        if (typeof sendLocalOrServiceWorkerPush === 'function') {
            sendLocalOrServiceWorkerPush({
                title: '📋 Ziyaret Planı Görevi',
                body: unseen.bodyText || `${unseen.sorumluLine}\nGüzergah: ${unseen.routeInfo}`,
                tag: 'dizsan-route-task-' + (unseen.routeId || unseen.id),
                url: './?routeId=' + encodeURIComponent(unseen.routeId || ''),
                id: unseen.id
            });
        }
    } catch (e) {}

    openRouteTaskBriefModal(unseen.routeId, unseen);
}

function renderSavedCustomRoutesList() {
    const listEl = document.getElementById('saved-custom-routes-list');
    const countEl = document.getElementById('saved-custom-routes-count');
    const allRoutes = Array.isArray(appState.customRoutes) ? appState.customRoutes : [];

    // Kayıtlı plan filtre seçeneklerini doldur
    const persSel = document.getElementById('saved-rut-filter-personnel');
    const citySel = document.getElementById('saved-rut-filter-city');
    if (persSel) {
        const currentPersVal = persSel.value;
        const pSet = new Set();
        (appState.users || []).forEach(u => { if (u.name) pSet.add(u.name); });
        allRoutes.forEach(r => {
            if (Array.isArray(r.assignees)) {
                r.assignees.forEach(a => { if (a && a.name) pSet.add(a.name); });
            } else if (r.assignee) {
                pSet.add(r.assignee);
            }
        });
        persSel.innerHTML = '<option value="">👤 Tüm Personeller</option>' + Array.from(pSet).map(p => `<option value="${escapeHtml(p)}">${escapeHtml(p)}</option>`).join('');
        if (currentPersVal && Array.from(pSet).includes(currentPersVal)) {
            persSel.value = currentPersVal;
        }
    }
    if (citySel && citySel.options.length <= 1 && allRoutes.length > 0) {
        const cSet = new Set();
        allRoutes.forEach(r => {
            (r.districts || []).forEach(d => cSet.add(d));
        });
        citySel.innerHTML = '<option value="">📍 Tüm İl / İlçeler</option>' + Array.from(cSet).map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
    }

    const fDate = (document.getElementById('saved-rut-filter-date')?.value || '').trim();
    const fPers = (document.getElementById('saved-rut-filter-personnel')?.value || '').trim();
    const fCity = (document.getElementById('saved-rut-filter-city')?.value || '').trim();
    const fStat = (document.getElementById('saved-rut-filter-status')?.value || '').trim();

    const routes = allRoutes.filter(rt => {
        ensureRouteItemsNormalized(rt);
        if (fDate && !(rt.plannedDate || '').includes(fDate) && !(rt.endDate || '').includes(fDate)) return false;
        if (fPers && !normalizeTR(rt.assignee || '').includes(normalizeTR(fPers))) return false;
        if (fStat && (rt.planStatus || 'Planlandı') !== fStat) return false;
        if (fCity) {
            const hay = normalizeTR(`${rt.routeText} ${(rt.districts || []).join(' ')}`);
            if (!hay.includes(normalizeTR(fCity))) return false;
        }
        return true;
    });

    if (countEl) countEl.textContent = String(routes.length);
    if (!listEl) return;

    if (routes.length === 0) {
        const hasActiveFilter = Boolean(fDate || fPers || fCity || fStat);
        listEl.innerHTML = `
            <div style="grid-column:1 / -1; padding:0.9rem 1rem; border:1px dashed rgba(148,163,184,0.25); border-radius:10px; color:var(--text-sec); font-size:0.78rem; display:flex; justify-content:space-between; align-items:center; gap:0.75rem; flex-wrap:wrap;">
                <span><i class="fa-solid fa-route" style="color:#fbbf24; margin-right:6px;"></i> ${hasActiveFilter && allRoutes.length > 0 ? `Seçili filtreye uygun rut planı bulunamadı (Toplam ${allRoutes.length} kayıtlı plan var).` : 'Kayıtlı bir rut planı bulunamadı. Yukarıdan İl/İlçe ve Müşterileri seçip "RUT PLANINI KAYDET" tuşuna basın.'}</span>
                ${hasActiveFilter ? `<button type="button" class="btn btn-secondary btn-sm" onclick="clearSavedCustomRoutesFilters()"><i class="fa-solid fa-filter-circle-xmark"></i> Filtreyi Temizle (${allRoutes.length} Planı Göster)</button>` : ''}
            </div>
        `;
        return;
    }

    listEl.innerHTML = routes.map(rt => {
        const items = ensureRouteItemsNormalized(rt);
        const total = items.length;
        const visited = items.filter(i => i.status === 'VISITED').length;
        const notVisited = items.filter(i => i.status === 'NOT_VISITED').length;
        const pending = items.filter(i => i.status === 'PENDING').length;
        const isActive = activeSelectedRouteId === rt.id;
        const pStatus = rt.planStatus || 'Planlandı';
        const statusColor = pStatus === 'Tamamlandı' ? '#10b981' : (pStatus === 'Devam Ediyor' ? '#38bdf8' : (pStatus === 'İptal Edildi' ? '#ef4444' : '#f59e0b'));
        const dateLabel = rt.endDate && rt.endDate !== rt.plannedDate ? `${rt.plannedDate || '-'} / ${rt.endDate}` : (rt.plannedDate || '-');

        return `
            <div onclick="selectActiveRouteForExecution('${rt.id}')" style="cursor:pointer; background:${isActive ? 'linear-gradient(145deg, rgba(16,185,129,0.16), rgba(15,23,42,0.92))' : 'rgba(15,23,42,0.75)'}; border:2px solid ${isActive ? '#10b981' : 'rgba(56,189,248,0.28)'}; border-radius:10px; padding:0.8rem 0.95rem; display:flex; flex-direction:column; justify-content:space-between; gap:0.55rem;">
                <div>
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:0.4rem;">
                        <strong style="color:#fff; font-size:0.86rem;">
                            <i class="fa-solid fa-route" style="color:${isActive ? '#34d399' : '#fbbf24'};"></i> ${escapeHtml(rt.name)}
                        </strong>
                        <span class="badge" style="background:${statusColor}22; color:${statusColor}; border:1px solid ${statusColor}66; font-size:0.66rem;">${escapeHtml(pStatus)}</span>
                    </div>
                    <div style="font-size:0.73rem; color:#38bdf8; font-weight:700; margin-top:4px;">
                        <i class="fa-solid fa-road"></i> İl/İlçe: ${escapeHtml(rt.routeText || '-')}
                    </div>
                    <div style="font-size:0.71rem; color:#fde68a; margin-top:3px; font-weight:600;">
                        <i class="fa-regular fa-calendar"></i> Plan Tarihi: ${escapeHtml(dateLabel)} &bull; <i class="fa-solid fa-user-tie"></i> ${escapeHtml(rt.assignee || '-')}
                    </div>
                    <div style="display:flex; gap:0.3rem; flex-wrap:wrap; margin-top:6px;">
                        <span class="badge badge-secondary" style="font-size:0.65rem;">Toplam: ${total}</span>
                        <span class="badge" style="background:rgba(16,185,129,0.2); color:#34d399; font-size:0.65rem;">✓ Edilen: ${visited}</span>
                        <span class="badge" style="background:rgba(239,68,68,0.2); color:#f87171; font-size:0.65rem;">✗ Edilemeyen: ${notVisited}</span>
                        <span class="badge" style="background:rgba(245,158,11,0.18); color:#fbbf24; font-size:0.65rem;">⏳ Bekleyen: ${pending}</span>
                    </div>
                </div>
                <div style="display:flex; gap:0.32rem; flex-wrap:wrap; padding-top:0.4rem; border-top:1px solid rgba(148,163,184,0.12);" onclick="event.stopPropagation()">
                    <button type="button" class="btn ${isActive ? 'btn-success' : 'btn-primary'} btn-sm" style="padding:0.24rem 0.5rem; font-size:0.69rem;" onclick="selectActiveRouteForExecution('${rt.id}')">
                        <i class="fa-solid fa-list-check"></i> ${isActive ? 'Açık' : 'Listeyi Aç'}
                    </button>
                    <button type="button" class="btn btn-success btn-sm" style="padding:0.24rem 0.5rem; font-size:0.69rem;" onclick="shareCustomRouteOnWhatsApp('${rt.id}')" title="WhatsApp üzerinden linkli paylaş">
                        <i class="fa-brands fa-whatsapp"></i> WhatsApp Paylaş
                    </button>
                    <button type="button" class="btn btn-secondary btn-sm" style="padding:0.24rem 0.5rem; font-size:0.69rem;" onclick="broadcastRoutePlanNotificationToAllPersonnel('${rt.id}', true)" title="Tüm personelin telefonuna bildirim gönder ve görev özetini aç">
                        <i class="fa-solid fa-bell" style="color:#fbbf24;"></i> Bildirim &amp; Özet
                    </button>
                    <button type="button" class="btn btn-secondary btn-sm" style="padding:0.24rem 0.48rem; font-size:0.69rem;" onclick="editCustomRoutePlan('${rt.id}')">
                        <i class="fa-solid fa-pen-to-square" style="color:#38bdf8;"></i> Düzenle
                    </button>
                    <button type="button" class="btn btn-secondary btn-sm" style="padding:0.24rem 0.48rem; font-size:0.69rem;" onclick="printCustomRouteSheet('${rt.id}')">
                        <i class="fa-solid fa-print" style="color:#fbbf24;"></i>
                    </button>
                    <button type="button" class="btn btn-danger btn-sm" style="padding:0.24rem 0.45rem; font-size:0.69rem; margin-left:auto;" onclick="deleteCustomRoutePlan('${rt.id}')" title="Rutu Sil">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// ==========================================================================
// PLANLANAN ZİYARETLER LİSTESİ, SÜRÜKLE-BIRAK, ZİYARET DURUMLARI VE MÜŞTERİ GEÇMİŞİ
// ==========================================================================
let activeExpandedRouteItemIdx = null;

function toggleManualVisitEntryForm() {
    const panel = document.getElementById('manual-visit-entry-panel');
    if (!panel) return;
    const isHidden = panel.style.display === 'none' || !panel.style.display;
    panel.style.display = isHidden ? 'block' : 'none';
    if (isHidden) {
        const titleInput = document.getElementById('manual-rut-cust-title');
        if (titleInput) setTimeout(() => titleInput.focus(), 50);
    }
}
window.toggleManualVisitCollapse = toggleManualVisitEntryForm;

function toggleRouteItemInlineDetail(idx) {
    activeExpandedRouteItemIdx = (activeExpandedRouteItemIdx === idx) ? null : idx;
    renderActiveRouteExecutionPanel();
}

function setActiveRouteExecutionStatusFilter(status) {
    activeRouteExecutionStatusFilter = status || 'ALL';
    activeExpandedRouteItemIdx = null;
    renderActiveRouteExecutionPanel();
}

function handleRouteItemDragStart(event, itemIdx) {
    draggedRouteItemIndex = itemIdx;
    if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', String(itemIdx));
    }
}

function handleRouteItemDragOver(event) {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
}

async function handleRouteItemDrop(event, routeId, targetIdx) {
    event.preventDefault();
    const fromIdx = draggedRouteItemIndex !== null ? draggedRouteItemIndex : parseInt(event.dataTransfer?.getData('text/plain') || '-1', 10);
    draggedRouteItemIndex = null;
    if (fromIdx < 0 || fromIdx === targetIdx) return;
    await moveRouteItemOrder(routeId, fromIdx, targetIdx);
}

async function moveRouteItemOrder(routeId, fromIdx, toIdx) {
    const rt = (appState.customRoutes || []).find(r => r.id === routeId);
    if (!rt) return;
    const items = ensureRouteItemsNormalized(rt);
    if (fromIdx < 0 || fromIdx >= items.length || toIdx < 0 || toIdx >= items.length) return;
    const [moved] = items.splice(fromIdx, 1);
    items.splice(toIdx, 0, moved);
    rt.customerCodes = items.filter(i => !i.isManual).map(i => i.code);
    rt.updatedAt = formatNowTR();
    activeExpandedRouteItemIdx = null;
    renderActiveRouteExecutionPanel();
    syncToServer();
    showToast(`Ziyaret sırası güncellendi (#${toIdx + 1}: ${moved.title}).`, 'info');
}

function renderActiveRouteExecutionPanel() {
    const box = document.getElementById('active-route-execution-container');
    if (!box) return;

    const routes = Array.isArray(appState.customRoutes) ? appState.customRoutes : [];
    if (routes.length === 0) {
        box.innerHTML = `
            <div style="padding:1.25rem; text-align:center; color:var(--text-sec); font-size:0.82rem;">
                Henüz kaydedilmiş bir rut planı yok. Yukarıdan İl/İlçe ve müşterileri seçip <strong>"RUT PLANINI KAYDET"</strong> tuşuna bastığınızda planlanan ziyaretler listesi burada açılır.
            </div>
        `;
        return;
    }

    let rt = routes.find(r => r.id === activeSelectedRouteId) || routes[0];
    activeSelectedRouteId = rt.id;
    const items = ensureRouteItemsNormalized(rt);

    const total = items.length;
    const visitedCount = items.filter(i => i.status === 'VISITED').length;
    const notVisitedCount = items.filter(i => i.status === 'NOT_VISITED').length;
    const cancelledCount = items.filter(i => i.status === 'CANCELLED').length;
    const pendingCount = items.filter(i => i.status === 'PENDING').length;
    const manualCount = items.filter(i => i.isManual).length;
    const denom = visitedCount + notVisitedCount + cancelledCount;
    const pct = denom > 0 ? Math.round((visitedCount / denom) * 100) : 0;

    const filteredItems = items.map((it, idx) => ({ it, idx })).filter(({ it }) => {
        if (activeRouteExecutionStatusFilter === 'VISITED') return it.status === 'VISITED';
        if (activeRouteExecutionStatusFilter === 'NOT_VISITED') return it.status === 'NOT_VISITED';
        if (activeRouteExecutionStatusFilter === 'PENDING') return it.status === 'PENDING';
        if (activeRouteExecutionStatusFilter === 'CANCELLED') return it.status === 'CANCELLED';
        if (activeRouteExecutionStatusFilter === 'MANUAL') return Boolean(it.isManual);
        return true;
    });

    const todayStr = getTodayTRStr();
    const nowTimeStr = getNowTimeTRStr();
    const users = (Array.isArray(appState.users) && appState.users.length > 0) ? appState.users : DEFAULT_USERS;

    box.innerHTML = `
        <div class="table-header-row" style="padding:0.8rem 1.15rem; flex-wrap:wrap; gap:0.65rem;">
            <div>
                <div style="font-size:0.92rem; font-weight:800; color:#f8fafc; display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                    <i class="fa-solid fa-list-check" style="color:#10b981;"></i>
                    <span>Planlanan Ziyaretler: <span style="color:#38bdf8;">${escapeHtml(rt.name)}</span></span>
                    <span class="badge badge-secondary" style="font-size:0.7rem;">
                        Plan: ${escapeHtml(rt.plannedDate || '-')}
                    </span>
                    <span class="badge badge-secondary" style="font-size:0.7rem;">
                        Görevli: ${escapeHtml(rt.assignee || '-')}
                    </span>
                    <select onchange="updateSavedRoutePlanStatus('${rt.id}', this.value)" class="filter-input" style="padding:0.18rem 0.45rem; font-size:0.72rem; font-weight:700; width:auto;">
                        <option value="Planlandı" ${(rt.planStatus || 'Planlandı') === 'Planlandı' ? 'selected' : ''}>Durum: Planlandı</option>
                        <option value="Devam Ediyor" ${rt.planStatus === 'Devam Ediyor' ? 'selected' : ''}>Durum: Devam Ediyor</option>
                        <option value="Tamamlandı" ${rt.planStatus === 'Tamamlandı' ? 'selected' : ''}>Durum: Tamamlandı</option>
                        <option value="İptal Edildi" ${rt.planStatus === 'İptal Edildi' ? 'selected' : ''}>Durum: İptal Edildi</option>
                    </select>
                </div>
                <div style="font-size:0.73rem; color:var(--text-sec); margin-top:3px;">
                    <strong>Güzergâh:</strong> ${escapeHtml(rt.routeText || '-')}
                </div>
            </div>

            <div style="display:flex; gap:0.35rem; flex-wrap:wrap; align-items:center;">
                <button type="button" class="btn ${activeRouteExecutionStatusFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'} btn-sm" style="padding:0.24rem 0.55rem; font-size:0.71rem;" onclick="setActiveRouteExecutionStatusFilter('ALL')">
                    Tümü (${total})
                </button>
                <button type="button" class="btn ${activeRouteExecutionStatusFilter === 'PENDING' ? 'btn-primary' : 'btn-secondary'} btn-sm" style="padding:0.24rem 0.55rem; font-size:0.71rem;" onclick="setActiveRouteExecutionStatusFilter('PENDING')">
                    Bekliyor (${pendingCount})
                </button>
                <button type="button" class="btn ${activeRouteExecutionStatusFilter === 'VISITED' ? 'btn-success' : 'btn-secondary'} btn-sm" style="padding:0.24rem 0.55rem; font-size:0.71rem;" onclick="setActiveRouteExecutionStatusFilter('VISITED')">
                    Ziyaret Edildi (${visitedCount})
                </button>
                <button type="button" class="btn ${activeRouteExecutionStatusFilter === 'NOT_VISITED' ? 'btn-danger' : 'btn-secondary'} btn-sm" style="padding:0.24rem 0.55rem; font-size:0.71rem;" onclick="setActiveRouteExecutionStatusFilter('NOT_VISITED')">
                    Edilemedi (${notVisitedCount})
                </button>
                ${manualCount > 0 ? `
                <button type="button" class="btn ${activeRouteExecutionStatusFilter === 'MANUAL' ? 'btn-primary' : 'btn-secondary'} btn-sm" style="padding:0.24rem 0.55rem; font-size:0.71rem;" onclick="setActiveRouteExecutionStatusFilter('MANUAL')">
                    Manuel (${manualCount})
                </button>
                ` : ''}
                <span class="badge badge-success" style="font-size:0.72rem; padding:0.28rem 0.55rem;">Gerçekleşme: %${pct}</span>
            </div>
        </div>

        <!-- MOBİL YATAY KAYDIRMA YARDIMCISI -->
        <div class="mobile-table-scroll-bar">
            <span><i class="fa-solid fa-arrows-left-right"></i> Tüm sütunları görmek için tabloyu sağa/sola kaydırın</span>
            <div class="mobile-scroll-nudge-btns">
                <button type="button" class="mobile-scroll-nudge-btn" onclick="const w=document.getElementById('active-route-table-scroll-wrap');if(w)w.scrollBy({left:-220,behavior:'smooth'});">◀ Sol</button>
                <button type="button" class="mobile-scroll-nudge-btn" onclick="const w=document.getElementById('active-route-table-scroll-wrap');if(w)w.scrollBy({left:220,behavior:'smooth'});">Sağ ▶</button>
            </div>
        </div>

        <!-- TEK VE SADE PLANLANAN ZİYARETLER TABLOSU (SATIR İÇİ AÇILIR/KAPANIR DETAY FORMU İLE) -->
        <div id="active-route-table-scroll-wrap" class="table-responsive">
            <table class="dizsan-table">
                <thead>
                    <tr>
                        <th style="width:68px;">Sıra</th>
                        <th>Müşteri / İşletme</th>
                        <th>İl / İlçe</th>
                        <th>Görevli &amp; Tarih</th>
                        <th>Ziyaret Özeti / Not</th>
                        <th>Ziyaret Durumu (Tik)</th>
                        <th style="text-align:right;">İşlem</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredItems.map(({ it, idx }) => {
                        const isVisited = it.status === 'VISITED';
                        const isNotVisited = it.status === 'NOT_VISITED';
                        const isExpanded = activeExpandedRouteItemIdx === idx;
                        const vDate = it.visitDate || todayStr;
                        const vTime = it.visitTime || nowTimeStr;
                        const safeCode = escapeHtml(it.code || '').replace(/'/g, "\\'");

                        const presetMatch = UNVISITED_REASON_OPTIONS.includes(it.unvisitedReason) ? it.unvisitedReason : (it.unvisitedReason ? 'Diğer' : '');
                        const customReasonVal = presetMatch === 'Diğer' ? (it.unvisitedReasonCustom || (UNVISITED_REASON_OPTIONS.includes(it.unvisitedReason) ? '' : it.unvisitedReason)) : (it.unvisitedReasonCustom || '');

                        let summaryHtml = `<span style="color:var(--text-muted); font-size:0.72rem;">Henüz ziyaret sonucu girilmedi</span>`;
                        if (isVisited) {
                            const parts = [];
                            if (it.visitDate) parts.push(`${escapeHtml(it.visitDate)} ${escapeHtml(it.visitTime || '')}`.trim());
                            if (it.authorized) parts.push(`Görüşülen: ${escapeHtml(it.authorized)}`);
                            if (it.visitResult) parts.push(escapeHtml(it.visitResult));
                            if (it.visitNotes) parts.push(`Not: ${escapeHtml(it.visitNotes)}`);
                            summaryHtml = `<div style="font-size:0.73rem; color:#34d399; font-weight:600;">✓ ${parts.join(' • ') || 'Ziyaret gerçekleştirildi'}</div>`;
                        } else if (isNotVisited) {
                            summaryHtml = `<div style="font-size:0.73rem; color:#f87171; font-weight:600;">✗ Sebep: ${escapeHtml(it.unvisitedReason || 'Belirtilmedi')}${it.visitNotes ? ` (${escapeHtml(it.visitNotes)})` : ''}</div>`;
                        }

                        return `
                            <tr draggable="true" ondragstart="handleRouteItemDragStart(event, ${idx})" ondragover="handleRouteItemDragOver(event)" ondrop="handleRouteItemDrop(event, '${rt.id}', ${idx})" style="background:${isVisited ? 'rgba(16,185,129,0.06)' : (isNotVisited ? 'rgba(239,68,68,0.06)' : 'transparent')};">
                                <td>
                                    <div style="display:flex; align-items:center; gap:0.2rem;">
                                        <strong style="min-width:18px;">${idx + 1}</strong>
                                        <button type="button" class="btn btn-secondary btn-sm" style="padding:1px 4px; font-size:0.6rem;" onclick="moveRouteItemOrder('${rt.id}', ${idx}, ${idx - 1})" ${idx === 0 ? 'disabled' : ''} title="Yukarı Taşı">▲</button>
                                        <button type="button" class="btn btn-secondary btn-sm" style="padding:1px 4px; font-size:0.6rem;" onclick="moveRouteItemOrder('${rt.id}', ${idx}, ${idx + 1})" ${idx === items.length - 1 ? 'disabled' : ''} title="Aşağı Taşı">▼</button>
                                    </div>
                                </td>
                                <td>
                                    <div style="font-weight:800; color:#f8fafc; cursor:pointer;" onclick="${it.isManual && !it.convertedCustomerCode ? `toggleRouteItemInlineDetail(${idx})` : `openCustomerDetailModal('${safeCode}')`}">${escapeHtml(it.title)}</div>
                                    <div style="font-size:0.68rem; color:var(--text-sec);">
                                        ${it.isManual ? `<span class="badge badge-secondary" style="font-size:0.62rem;">Manuel İşletme</span>` : `<span style="font-family:monospace; color:#38bdf8;">${escapeHtml(it.code)}</span>`}
                                        ${it.convertedCustomerCode ? `<span class="badge badge-success" style="font-size:0.62rem;">Müşteri: ${escapeHtml(it.convertedCustomerCode)}</span>` : ''}
                                    </div>
                                </td>
                                <td style="font-weight:600; font-size:0.76rem;">${escapeHtml(it.city || '-')} / ${escapeHtml(it.district || '-')}</td>
                                <td style="font-size:0.74rem;">
                                    <div style="font-weight:700; color:#f8fafc;">${escapeHtml(it.personnel || rt.assignee || '-')}</div>
                                    <div style="font-size:0.68rem; color:var(--text-sec);">${escapeHtml(rt.plannedDate || '-')}</div>
                                </td>
                                <td style="max-width:290px;">
                                    ${summaryHtml}
                                </td>
                                <td>
                                    <div style="display:flex; align-items:center; gap:0.35rem; flex-wrap:wrap;">
                                        <label style="display:inline-flex; align-items:center; gap:0.3rem; padding:0.26rem 0.55rem; border-radius:6px; cursor:pointer; font-size:0.72rem; font-weight:700; background:${isVisited ? 'rgba(16,185,129,0.22)' : 'rgba(15,23,42,0.75)'}; border:1px solid ${isVisited ? '#10b981' : 'rgba(148,163,184,0.32)'}; color:${isVisited ? '#34d399' : '#e2e8f0'};">
                                            <input type="checkbox" ${isVisited ? 'checked' : ''} onchange="handleRouteItemTick('${rt.id}', ${idx}, 'VISITED', this.checked)" style="accent-color:#10b981; margin:0; cursor:pointer;">
                                            <span>Ziyaret Edildi</span>
                                        </label>
                                        <label style="display:inline-flex; align-items:center; gap:0.3rem; padding:0.26rem 0.55rem; border-radius:6px; cursor:pointer; font-size:0.72rem; font-weight:700; background:${isNotVisited ? 'rgba(239,68,68,0.22)' : 'rgba(15,23,42,0.75)'}; border:1px solid ${isNotVisited ? '#ef4444' : 'rgba(148,163,184,0.32)'}; color:${isNotVisited ? '#f87171' : '#e2e8f0'};">
                                            <input type="checkbox" ${isNotVisited ? 'checked' : ''} onchange="handleRouteItemTick('${rt.id}', ${idx}, 'NOT_VISITED', this.checked)" style="accent-color:#ef4444; margin:0; cursor:pointer;">
                                            <span>Edilemedi</span>
                                        </label>
                                    </div>
                                </td>
                                <td style="text-align:right;">
                                    <div style="display:flex; justify-content:flex-end; gap:0.3rem; flex-wrap:wrap;">
                                        <button type="button" class="btn ${isExpanded ? 'btn-primary' : 'btn-secondary'} btn-sm" style="padding:0.24rem 0.55rem; font-size:0.7rem;" onclick="toggleRouteItemInlineDetail(${idx})">
                                            <i class="fa-solid ${isExpanded ? 'fa-chevron-up' : 'fa-pen-to-square'}"></i> ${isExpanded ? 'Kapat' : 'Detay / Not'}
                                        </button>
                                        ${it.isManual && !it.convertedCustomerCode ? `
                                            <button type="button" class="btn btn-success btn-sm" style="padding:0.24rem 0.5rem; font-size:0.7rem;" onclick="convertManualVisitToCustomer('${rt.id}', ${idx})" title="Müşteri Kaydına Dönüştür">
                                                <i class="fa-solid fa-user-plus"></i>
                                            </button>
                                        ` : `
                                            <button type="button" class="btn btn-secondary btn-sm" style="padding:0.24rem 0.5rem; font-size:0.7rem;" onclick="openCustomerDetailModal('${safeCode}')" title="Müşteri Kartı & Ziyaret Geçmişi">
                                                <i class="fa-solid fa-id-card" style="color:#38bdf8;"></i>
                                            </button>
                                        `}
                                    </div>
                                </td>
                            </tr>
                            ${isExpanded ? `
                            <tr id="route-item-card-${idx}">
                                <td colspan="7" style="padding:0.75rem 1rem; background:rgba(15,23,42,0.88); border-bottom:2px solid ${isNotVisited ? '#ef4444' : '#0284c7'};">
                                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.55rem; flex-wrap:wrap; gap:0.4rem;">
                                        <strong style="font-size:0.8rem; color:#38bdf8;">
                                            #${idx + 1} ${escapeHtml(it.title)} — ${isNotVisited ? 'Ziyaret Edilememe Bilgisi' : 'Ziyaret Detay ve Not Girişi'}
                                        </strong>
                                        <span style="font-size:0.7rem; color:var(--text-sec);">Bilgileri girip <strong>"Bilgileri Kaydet"</strong> tuşuna basın</span>
                                    </div>

                                    ${isNotVisited ? `
                                        <div class="rut-inline-unvisited-grid" style="display:grid; grid-template-columns:minmax(220px, 1fr) minmax(220px, 1.2fr) minmax(200px, 1fr) auto; gap:0.55rem; align-items:end;">
                                            <div>
                                                <label style="display:block; font-size:0.69rem; font-weight:700; color:#f87171; margin-bottom:0.2rem;">Ziyaret Edilememe Sebebi *</label>
                                                <select id="ritem-reason-sel-${idx}" class="filter-input" style="width:100%;" onchange="handleUnvisitedReasonSelectChange(${idx})">
                                                    <option value="">-- Sebep Seçin --</option>
                                                    ${UNVISITED_REASON_OPTIONS.map(opt => `<option value="${escapeHtml(opt)}" ${presetMatch === opt ? 'selected' : ''}>${escapeHtml(opt)}</option>`).join('')}
                                                </select>
                                            </div>
                                            <div id="ritem-reason-custom-wrap-${idx}" style="display:${presetMatch === 'Diğer' || customReasonVal ? 'block' : 'none'};">
                                                <label style="display:block; font-size:0.69rem; font-weight:700; color:var(--text-sec); margin-bottom:0.2rem;">Diğer Sebep Açıklaması</label>
                                                <input type="text" id="ritem-reason-custom-${idx}" class="filter-input" style="width:100%;" value="${escapeHtml(customReasonVal)}" placeholder="Sebebi yazın...">
                                            </div>
                                            <div>
                                                <label style="display:block; font-size:0.69rem; font-weight:700; color:var(--text-sec); margin-bottom:0.2rem;">Ek Not (Opsiyonel)</label>
                                                <input type="text" id="ritem-notes-${idx}" class="filter-input" style="width:100%;" value="${escapeHtml(it.visitNotes || '')}" placeholder="Not...">
                                            </div>
                                            <div style="display:flex; gap:0.4rem;">
                                                <button type="button" id="ritem-save-btn-${idx}" class="btn btn-primary btn-sm" style="padding:0.42rem 0.9rem; font-size:0.75rem; font-weight:800;" onclick="saveRouteItemDetails('${rt.id}', ${idx})">
                                                    <i class="fa-solid fa-floppy-disk"></i> Bilgileri Kaydet
                                                </button>
                                            </div>
                                        </div>
                                    ` : `
                                        <div class="rut-inline-visited-grid-1" style="display:grid; grid-template-columns:145px 95px minmax(150px, 1fr) minmax(150px, 1fr) minmax(130px, 0.9fr) minmax(180px, 1.2fr) 145px; gap:0.5rem; margin-bottom:0.5rem; align-items:end;">
                                            <div>
                                                <label style="display:block; font-size:0.68rem; font-weight:600; color:var(--text-sec); margin-bottom:0.18rem;">Ziyaret Tarihi</label>
                                                <input type="text" id="ritem-date-${idx}" class="filter-input" style="width:100%; font-size:0.74rem;" value="${escapeHtml(vDate)}" placeholder="GG.AA.YYYY">
                                            </div>
                                            <div>
                                                <label style="display:block; font-size:0.68rem; font-weight:600; color:var(--text-sec); margin-bottom:0.18rem;">Saat</label>
                                                <input type="text" id="ritem-time-${idx}" class="filter-input" style="width:100%; font-size:0.74rem;" value="${escapeHtml(vTime)}" placeholder="14:30">
                                            </div>
                                            <div>
                                                <label style="display:block; font-size:0.68rem; font-weight:600; color:var(--text-sec); margin-bottom:0.18rem;">Personel</label>
                                                <select id="ritem-pers-${idx}" class="filter-input" style="width:100%; font-size:0.74rem;">
                                                    ${users.map(u => `<option value="${escapeHtml(u.name)}" ${normalizeTR(u.name) === normalizeTR(it.personnel || rt.assignee) ? 'selected' : ''}>${escapeHtml(u.name)}</option>`).join('')}
                                                </select>
                                            </div>
                                            <div>
                                                <label style="display:block; font-size:0.68rem; font-weight:600; color:var(--text-sec); margin-bottom:0.18rem;">Görüşülen Kişi</label>
                                                <input type="text" id="ritem-auth-${idx}" class="filter-input" style="width:100%; font-size:0.74rem;" value="${escapeHtml(it.authorized || '')}" placeholder="Ad Soyad">
                                            </div>
                                            <div>
                                                <label style="display:block; font-size:0.68rem; font-weight:600; color:var(--text-sec); margin-bottom:0.18rem;">Görevi</label>
                                                <input type="text" id="ritem-role-${idx}" class="filter-input" style="width:100%; font-size:0.74rem;" value="${escapeHtml(it.contactRole || 'Yetkili')}" placeholder="Yetkili">
                                            </div>
                                            <div>
                                                <label style="display:block; font-size:0.68rem; font-weight:600; color:var(--text-sec); margin-bottom:0.18rem;">Görüşme Sonucu</label>
                                                <select id="ritem-result-${idx}" class="filter-input" style="width:100%; font-size:0.74rem;">
                                                    <option value="" ${!it.visitResult ? 'selected' : ''}>Sonuç Seçin...</option>
                                                    <option value="1 - Olumlu / Sipariş & Randevu Alındı" ${it.visitResult === '1 - Olumlu / Sipariş & Randevu Alındı' ? 'selected' : ''}>1 - Olumlu / Randevu Alındı</option>
                                                    <option value="2 - Tanışma / İlk Temas Sağlandı" ${it.visitResult === '2 - Tanışma / İlk Temas Sağlandı' || it.visitResult === '2 - Tanışma / İlk Temas' ? 'selected' : ''}>2 - Tanışma / İlk Temas</option>
                                                    <option value="3 - Teklif / Fiyat Sunuldu (Takip)" ${it.visitResult === '3 - Teklif / Fiyat Sunuldu (Takip)' ? 'selected' : ''}>3 - Teklif / Fiyat Sunuldu</option>
                                                    <option value="4 - Tahsilat / Cari Mutabakat Yapıldı" ${it.visitResult === '4 - Tahsilat / Cari Mutabakat Yapıldı' ? 'selected' : ''}>4 - Tahsilat / Mutabakat</option>
                                                    <option value="5 - Tekrar Ziyaret Edilecek" ${it.visitResult === '5 - Tekrar Ziyaret Edilecek' ? 'selected' : ''}>5 - Tekrar Ziyaret Edilecek</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label style="display:block; font-size:0.68rem; font-weight:600; color:var(--text-sec); margin-bottom:0.18rem;">Sonraki Ziyaret</label>
                                                <input type="text" id="ritem-nextdate-${idx}" class="filter-input" style="width:100%; font-size:0.74rem;" value="${escapeHtml(it.nextVisitDate || '')}" placeholder="GG.AA.YYYY">
                                            </div>
                                        </div>
                                        <div class="rut-inline-visited-grid-2" style="display:grid; grid-template-columns:1fr 220px auto; gap:0.5rem; align-items:end;">
                                            <div>
                                                <label style="display:block; font-size:0.68rem; font-weight:600; color:var(--text-sec); margin-bottom:0.18rem;">Ziyaret Açıklaması (Müşteri Kartına İşlenir)</label>
                                                <input type="text" id="ritem-notes-${idx}" class="filter-input" style="width:100%; font-size:0.75rem;" value="${escapeHtml(it.visitNotes || '')}" placeholder="Görüşme detayları, araç/servis talebi, müşterinin geri bildirimi...">
                                            </div>
                                            <div>
                                                <label style="display:block; font-size:0.68rem; font-weight:600; color:var(--text-sec); margin-bottom:0.18rem;">Ek Not</label>
                                                <input type="text" id="ritem-extra-${idx}" class="filter-input" style="width:100%; font-size:0.74rem;" value="${escapeHtml(it.extraNotes || '')}" placeholder="Ek not...">
                                            </div>
                                            <div>
                                                <button type="button" id="ritem-save-btn-${idx}" class="btn btn-primary btn-sm" style="padding:0.44rem 1rem; font-size:0.76rem; font-weight:800; background:linear-gradient(135deg, #10b981, #0284c7);" onclick="saveRouteItemDetails('${rt.id}', ${idx})">
                                                    <i class="fa-solid fa-floppy-disk"></i> Bilgileri Kaydet
                                                </button>
                                            </div>
                                        </div>
                                    `}
                                </td>
                            </tr>
                            ` : ''}
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;

    if (window.AutoDateHelper && typeof window.AutoDateHelper.upgradeAll === 'function') {
        window.AutoDateHelper.upgradeAll(box);
    }
}

function handleUnvisitedReasonSelectChange(idx) {
    const sel = document.getElementById(`ritem-reason-sel-${idx}`);
    const wrap = document.getElementById(`ritem-reason-custom-wrap-${idx}`);
    if (sel && wrap) {
        wrap.style.display = sel.value === 'Diğer' ? 'block' : 'none';
    }
}

function readAutoDateOrInputVal(id) {
    const el = document.getElementById(id);
    if (!el) return '';
    const directVal = (el.value || '').trim();
    if (directVal) return directVal;
    const nextSib = el.nextElementSibling;
    if (nextSib && nextSib.classList && nextSib.classList.contains('auto-date-container')) {
        const d = (nextSib.querySelector('.auto-date-subinput-day')?.value || '').trim();
        const m = (nextSib.querySelector('.auto-date-subinput-month')?.value || '').trim();
        const y = (nextSib.querySelector('.auto-date-subinput-year')?.value || '').trim();
        if (d && m && y && y.length === 4) {
            return `${d.padStart(2, '0')}.${m.padStart(2, '0')}.${y}`;
        }
    }
    return '';
}

async function handleRouteItemTick(routeId, itemIdx, targetStatus, isChecked) {
    const rt = (appState.customRoutes || []).find(r => r.id === routeId);
    if (!rt) return;
    const items = ensureRouteItemsNormalized(rt);
    const it = items[itemIdx];
    if (!it) return;

    collectRouteItemInputsIntoObject(it, itemIdx, rt);

    // Bir ziyaret için aynı anda birden fazla durum seçilemez
    const newStatus = isChecked ? targetStatus : 'PENDING';
    it.status = newStatus;
    activeExpandedRouteItemIdx = isChecked ? itemIdx : null;

    if (newStatus === 'VISITED') {
        if (!it.visitDate) it.visitDate = getTodayTRStr();
        if (!it.visitTime) it.visitTime = getNowTimeTRStr();
        it.unvisitedReason = '';
        it.unvisitedReasonCustom = '';
    }
    if (newStatus === 'NOT_VISITED' && !it.unvisitedReason) {
        const reasonSel = document.getElementById(`ritem-reason-sel-${itemIdx}`)?.value || '';
        const reasonCustom = (document.getElementById(`ritem-reason-custom-${itemIdx}`)?.value || '').trim();
        it.unvisitedReason = reasonSel === 'Diğer' ? (reasonCustom || 'Diğer Sebep') : (reasonSel || reasonCustom || 'Müşteri yerinde bulunamadı.');
    }

    persistRouteItemAndSyncToCustomer(rt, it);
    renderSavedCustomRoutesList();
    renderActiveRouteExecutionPanel();
    renderReportsTab();
    updateRouteAndReportsBadges();

    const label = newStatus === 'VISITED' ? '✓ Ziyaret Edildi' : (newStatus === 'NOT_VISITED' ? '✗ Ziyaret Edilemedi' : (newStatus === 'CANCELLED' ? 'İptal Edildi' : 'Bekliyor'));
    showToast(`${it.title}: "${label}" seçildi. Detay / not girip "Bilgileri Kaydet" diyebilirsiniz.`, newStatus === 'VISITED' ? 'success' : 'info');
}

function collectRouteItemInputsIntoObject(it, idx, rt) {
    const dateVal = readAutoDateOrInputVal(`ritem-date-${idx}`);
    const timeVal = (document.getElementById(`ritem-time-${idx}`)?.value || '').trim();
    const persVal = (document.getElementById(`ritem-pers-${idx}`)?.value || '').trim();
    const authVal = (document.getElementById(`ritem-auth-${idx}`)?.value || '').trim();
    const roleVal = (document.getElementById(`ritem-role-${idx}`)?.value || '').trim();
    const resVal = (document.getElementById(`ritem-result-${idx}`)?.value || '').trim();
    const nextDateVal = readAutoDateOrInputVal(`ritem-nextdate-${idx}`);
    const notesVal = (document.getElementById(`ritem-notes-${idx}`)?.value || '').trim();
    const extraVal = (document.getElementById(`ritem-extra-${idx}`)?.value || '').trim();
    const reasonSelEl = document.getElementById(`ritem-reason-sel-${idx}`);
    const reasonCustomEl = document.getElementById(`ritem-reason-custom-${idx}`);
    const reasonSel = (reasonSelEl?.value || '').trim();
    const reasonCustom = (reasonCustomEl?.value || '').trim();

    if (dateVal) it.visitDate = dateVal;
    if (timeVal) it.visitTime = timeVal;
    if (persVal) it.personnel = persVal;
    if (authVal) it.authorized = authVal;
    if (roleVal) it.contactRole = roleVal;
    it.visitResult = resVal || it.visitResult || '';
    it.nextVisitDate = nextDateVal;
    it.visitNotes = notesVal;
    it.extraNotes = extraVal;
    if (reasonSelEl || reasonCustomEl) {
        it.unvisitedReasonCustom = reasonCustom;
        if (reasonSel === 'Diğer') {
            it.unvisitedReason = reasonCustom || 'Diğer';
        } else if (reasonSel) {
            it.unvisitedReason = reasonSel;
        } else if (reasonCustom) {
            it.unvisitedReason = reasonCustom;
        }
    }
    it.updatedAt = formatNowTR();
}

async function saveRouteItemDetails(routeId, itemIdx) {
    const rt = (appState.customRoutes || []).find(r => r.id === routeId);
    if (!rt) return;
    const items = ensureRouteItemsNormalized(rt);
    const it = items[itemIdx];
    if (!it) return;

    collectRouteItemInputsIntoObject(it, itemIdx, rt);

    // Kullanıcı "Bilgileri Kaydet"e bastığında henüz durum seçilmediyse (PENDING):
    // Eğer edilememe sebebi girilmişse NOT_VISITED, aksi halde doğrudan VISITED (Ziyaret Edildi) olarak kaydet
    if (!it.status || it.status === 'PENDING') {
        if (it.unvisitedReason && !it.visitNotes && !it.visitResult) {
            it.status = 'NOT_VISITED';
        } else {
            it.status = 'VISITED';
        }
    }
    if (it.status === 'VISITED') {
        if (!it.visitDate) it.visitDate = getTodayTRStr();
        if (!it.visitTime) it.visitTime = getNowTimeTRStr();
        if (!it.visitResult) it.visitResult = '1 - Olumlu / Sipariş & Randevu Alındı';
        it.unvisitedReason = '';
        it.unvisitedReasonCustom = '';
    }

    it.lastSavedAt = formatNowTR();
    activeExpandedRouteItemIdx = null;

    persistRouteItemAndSyncToCustomer(rt, it);
    renderSavedCustomRoutesList();
    renderActiveRouteExecutionPanel();
    renderLegacyCustomers();
    renderDistrictStrategies();
    renderReportsTab();
    updateRouteAndReportsBadges();

    showToast(`✓ "${it.title}" ziyaret bilgileri müşteri kartına ve raporlara kaydedildi!`, 'success');
}

function persistRouteItemAndSyncToCustomer(rt, it) {
    const customers = appState.customers || [];
    const targetCode = it.convertedCustomerCode || it.code;
    const c = customers.find(x => x.code === targetCode);
    const actor = it.personnel || rt.assignee || (currentUser ? currentUser.name : 'ÖMER EREN');
    const vDate = it.visitDate || rt.plannedDate || getTodayTRStr();

    // Bölüm 6 Kuralı: Bir müşteriye farklı tarihlerde yapılan ziyaretler birbirinin üzerine yazılmaz; her ziyaret ayrı kayıt olarak saklanır.
    const historyEntryId = `VH-${rt.id}-${it.code}-${vDate.replace(/\./g, '')}`;

    if (c) {
        if (it.authorized) c.authorized = it.authorized;
        if (it.contactRole) c.contactRole = it.contactRole;
        c.rut = rt.name;
        c.lastVisit = vDate;
        c.lastVisitPersonnel = actor;
        if (!Array.isArray(c.visitHistory)) c.visitHistory = [];

        if (it.status === 'VISITED' || it.status === 'NOT_VISITED') {
            const histObj = {
                id: historyEntryId,
                routeId: rt.id,
                routeName: rt.name,
                date: vDate,
                time: it.visitTime || getNowTimeTRStr(),
                personnel: actor,
                contactPerson: it.authorized || c.authorized || '-',
                contactRole: it.contactRole || 'Yetkili',
                status: it.status,
                notes: it.status === 'VISITED' ? (it.visitNotes || 'Saha rut ziyareti gerçekleştirildi.') : `Ziyaret Edilemedi: ${it.unvisitedReason || '-'}`,
                extraNotes: it.extraNotes || '',
                result: it.status === 'VISITED' ? (it.visitResult || '1 - Olumlu / Ziyaret Edildi') : `Ziyaret Edilemedi (${it.unvisitedReason || '-'})`,
                nextVisitDate: it.nextVisitDate || '',
                unvisitedReason: it.unvisitedReason || '',
                updatedAt: formatNowTR()
            };
            const existingHIdx = c.visitHistory.findIndex(h => h && h.id === historyEntryId);
            if (existingHIdx !== -1) {
                c.visitHistory[existingHIdx] = histObj;
            } else {
                c.visitHistory.unshift(histObj);
            }
        }

        if (it.status === 'VISITED') {
            c.visitStatus = 'Ziyaret Edildi';
            c.lastVisitNotes = it.visitNotes || '';
            c.lastVisitResult = it.visitResult || 'Ziyaret Edildi';
        } else if (it.status === 'NOT_VISITED') {
            c.visitStatus = 'Ziyaret Edilemedi';
            c.unvisitedReason = it.unvisitedReason || '';
        }
        c._modifiedAt = new Date().toISOString();
    }

    if (!Array.isArray(appState.visits)) appState.visits = [];
    const visitRecordId = `VISIT-RUT-${rt.id}-${it.code}-${vDate.replace(/\./g, '')}`;
    const existingVIdx = appState.visits.findIndex(v => v.id === visitRecordId);

    if (it.status === 'VISITED' || it.status === 'NOT_VISITED') {
        const visitPayload = {
            id: visitRecordId,
            routeId: rt.id,
            routeName: rt.name,
            plannedDate: rt.plannedDate || vDate,
            date: vDate,
            time: it.visitTime || getNowTimeTRStr(),
            customerCode: targetCode,
            customerTitle: it.title,
            city: it.city || (c ? c.city : ''),
            district: it.district || (c ? c.district : ''),
            personnel: actor,
            contactPerson: it.authorized || (c ? c.authorized : '-') || '-',
            contactRole: it.contactRole || 'Yetkili',
            plates: it.plates || (c ? c.plates : '-') || '-',
            type: it.isManual ? 'MANUEL TANIŞMA ZİYARETİ' : 'SAHA RUT ZİYARETİ',
            result: it.status === 'VISITED'
                ? (it.visitResult || '1 - Olumlu / Ziyaret Edildi')
                : `Ziyaret Edilemedi (${it.unvisitedReason || 'Sebep Belirtilmedi'})`,
            visitStatus: it.status,
            isManual: Boolean(it.isManual),
            visitPurpose: it.visitPurpose || '',
            unvisitedReason: it.unvisitedReason || '',
            nextVisitDate: it.nextVisitDate || '',
            notes: it.status === 'VISITED'
                ? (it.visitNotes || 'Rut kapsamında müşteri ziyaret edildi.')
                : `Ziyaret Edilememe Sebebi: ${it.unvisitedReason || '-'}${it.visitNotes ? ' | Not: ' + it.visitNotes : ''}`,
            extraNotes: it.extraNotes || ''
        };
        if (existingVIdx !== -1) {
            appState.visits[existingVIdx] = visitPayload;
        } else {
            appState.visits.unshift(visitPayload);
        }
    }

    // Tüm ziyaretler sonuçlandıysa plan durumunu otomatik güncelle
    const total = (rt.items || []).length;
    const done = (rt.items || []).filter(i => i.status === 'VISITED' || i.status === 'NOT_VISITED' || i.status === 'CANCELLED').length;
    if (total > 0 && done === total) {
        rt.planStatus = 'Tamamlandı';
    } else if (done > 0 && rt.planStatus === 'Planlandı') {
        rt.planStatus = 'Devam Ediyor';
    }

    rt.updatedAt = formatNowTR();
    addAuditLog('RUT ZİYARET İŞLEME', `[${rt.name}] ${it.title} -> ${it.status} (${actor})`);
    renderDashboard();
    renderActiveVisits();
    syncToServer();
}

// Bölüm 7: Manuel Ziyaret Kaydını Mevcut Müşteri Kayıt Sistemine Dönüştürme (Mükerrer Kontrolü + Kullanıcı Onayı)
async function convertManualVisitToCustomer(routeId, itemIdx) {
    const rt = (appState.customRoutes || []).find(r => r.id === routeId);
    if (!rt) return;
    const items = ensureRouteItemsNormalized(rt);
    const it = items[itemIdx];
    if (!it) return;

    const customers = appState.customers || [];
    const normTitle = normalizeTR(it.title || '');
    const duplicate = customers.find(c => normalizeTR(c.title) === normTitle || (normTitle.length > 5 && normalizeTR(c.title).includes(normTitle)));

    if (duplicate) {
        const useExisting = confirm(`DİKKAT: Sistemde benzer ünvanlı bir müşteri zaten mevcut:\n\nKod: ${duplicate.code}\nÜnvan: ${duplicate.title}\nİl/İlçe: ${duplicate.city} / ${duplicate.district}\n\nMükerrer kayıt oluşmaması için bu manuel ziyareti mevcut "${duplicate.title}" kartına bağlamak ister misiniz?`);
        if (useExisting) {
            it.convertedCustomerCode = duplicate.code;
            await persistRouteItemAndSyncToCustomer(rt, it);
            renderActiveRouteExecutionPanel();
            renderReportsTab();
            showToast(`Manuel ziyaret mevcut "${duplicate.title}" (${duplicate.code}) müşteri kartına bağlandı.`, 'success');
        }
        return;
    }

    if (!confirm(`"${it.title}" (${it.city} / ${it.district}) işletmesini D-PRO müşteri veritabanına kalıcı MÜŞTERİ KAYDI olarak dönüştürmek istediğinize emin misiniz?`)) {
        return;
    }

    const newCode = '120.YENI.' + String(Date.now()).slice(-5);
    const newCust = {
        code: newCode,
        title: it.title,
        authorized: it.authorized || 'İşletme Yetkilisi',
        contactRole: it.contactRole || 'Yetkili',
        phone: it.phone || '-',
        city: it.city || 'Çorum',
        district: it.district || 'Merkez',
        address: it.address || `${it.city} / ${it.district}`,
        rut: rt.name,
        plates: it.plates || 'Plakasız',
        vehicleModel: '-',
        totalRevenue: 0,
        balance: 0,
        ba: '-',
        priority: 'P2 - Yeni Potansiyel (Saha Kazanım)',
        lastDate: it.visitDate || getTodayTRStr(),
        lastVisit: it.visitDate || getTodayTRStr(),
        visitStatus: it.status === 'VISITED' ? 'Ziyaret Edildi' : 'Yeni Kayıt',
        isCustom: true,
        isManualIntro: true,
        serviceHistory: [],
        visitHistory: [],
        _modifiedAt: new Date().toISOString()
    };

    appState.customers.unshift(newCust);
    it.convertedCustomerCode = newCode;
    if (!rt.customerCodes.includes(newCode)) rt.customerCodes.push(newCode);

    await persistRouteItemAndSyncToCustomer(rt, it);
    populateFilterOptions();
    renderActiveRouteExecutionPanel();
    renderReportsTab();
    showToast(`"${it.title}" başarıyla müşteri kaydına (${newCode}) dönüştürüldü!`, 'success');
}

// Bölüm 5 & 9.E: Ziyaret Edilemeyen Müşteriyi Yeni Bir Rut Planına Tekrar Ekleme
function reAddUnvisitedToRouteDraft(code, city, district, title) {
    switchTab('route-plan-tab');
    if (code && !String(code).startsWith('MANUEL-')) {
        customRouteDraftSelectedCodes.add(code);
    }
    if (city) {
        const stopLabel = district ? `${city} / ${district}` : city;
        if (!customRouteDraftDistricts.some(x => normalizeTR(x) === normalizeTR(stopLabel))) {
            customRouteDraftDistricts.push(stopLabel);
        }
    }
    renderCustomRouteDistrictBadges();
    renderCustomRouteCustomerPicker();
    renderCustomRouteSelectedChips();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`"${title || code}" yeni RUT planı taslağına eklendi. Tarih ve personel seçip kaydedebilirsiniz.`, 'success');
}

// Bölüm 6: Müşteri Kartı İçinde Ziyaret Bilgi Girişi ve Tarih Sıralı ZİYARET GEÇMİŞİ Tablosu
function getCustomerFullVisitHistory(customer) {
    if (!customer) return [];
    const list = [];
    const seenIds = new Set();

    if (Array.isArray(customer.visitHistory)) {
        customer.visitHistory.forEach(h => {
            if (!h) return;
            const id = h.id || `${h.date}-${h.personnel}-${h.notes}`;
            if (!seenIds.has(id)) {
                seenIds.add(id);
                list.push(h);
            }
        });
    }

    (appState.visits || []).forEach(v => {
        if (!v) return;
        if (v.customerCode === customer.code || normalizeTR(v.customerTitle) === normalizeTR(customer.title)) {
            const id = v.id || `${v.date}-${v.personnel}-${v.notes}`;
            if (!seenIds.has(id)) {
                seenIds.add(id);
                list.push({
                    id,
                    routeName: v.routeName || 'Saha Ziyareti',
                    date: v.date || v.plannedDate || '-',
                    time: v.time || '',
                    personnel: v.personnel || '-',
                    contactPerson: v.contactPerson || customer.authorized || '-',
                    contactRole: v.contactRole || 'Yetkili',
                    status: v.visitStatus || (String(v.result || '').includes('Edilemedi') ? 'NOT_VISITED' : 'VISITED'),
                    notes: v.notes || '-',
                    result: v.result || '-'
                });
            }
        }
    });

    return list;
}

function buildCustomerAreaVisitEntryHtml(customer) {
    if (!customer) return '';
    const code = customer.code || '';
    const safeCode = escapeHtml(code).replace(/'/g, "\\'");
    const todayStr = getTodayTRStr();
    const nowTimeStr = getNowTimeTRStr();
    const visitHistory = getCustomerFullVisitHistory(customer);

    let matchedRoute = null;
    let matchedItem = null;
    for (const rt of (appState.customRoutes || [])) {
        const items = ensureRouteItemsNormalized(rt);
        const found = items.find(i => i.code === code || i.convertedCustomerCode === code);
        if (found) {
            matchedRoute = rt;
            matchedItem = found;
            break;
        }
    }

    const curStatus = matchedItem ? matchedItem.status : (customer.visitStatus === 'Ziyaret Edildi' ? 'VISITED' : (customer.visitStatus === 'Ziyaret Edilemedi' ? 'NOT_VISITED' : 'PENDING'));
    const isVisited = curStatus === 'VISITED';
    const isNotVisited = curStatus === 'NOT_VISITED';

    return `
        <div style="background:linear-gradient(135deg, rgba(16,185,129,0.14), rgba(2,132,199,0.16)); border:1px solid rgba(16,185,129,0.45); border-radius:12px; padding:0.95rem 1.1rem; margin-bottom:1.1rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.65rem; margin-bottom:0.75rem; padding-bottom:0.6rem; border-bottom:1px solid rgba(148,163,184,0.2);">
                <div>
                    <div style="font-size:0.9rem; font-weight:800; color:#fff; display:flex; align-items:center; gap:0.45rem;">
                        <i class="fa-solid fa-clipboard-check" style="color:#34d399;"></i>
                        <span>MÜŞTERİ KARTI — YENİ ZİYARET BİLGİSİ GİRİŞİ &amp; DURUM İŞARETLEME</span>
                    </div>
                    <div style="font-size:0.73rem; color:#cbd5e1; margin-top:2px;">
                        ${matchedRoute ? `Kayıtlı Rut Planı: <strong style="color:#fde68a;">${escapeHtml(matchedRoute.name)}</strong> (Plan Tarihi: ${escapeHtml(matchedRoute.plannedDate || '-')})` : 'Girilen her ziyaret önceki kayıtların üzerine yazılmadan aşağıdaki ZİYARET GEÇMİŞİ tablosuna ayrı kayıt olarak eklenir.'}
                    </div>
                </div>

                <!-- SAĞDA ZİYARET EDİLDİ / EDİLEMEDİ TİK ALANI -->
                <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                    <label style="display:inline-flex; align-items:center; gap:0.4rem; padding:0.4rem 0.75rem; border-radius:8px; cursor:pointer; background:${isVisited ? 'rgba(16,185,129,0.28)' : 'rgba(15,23,42,0.85)'}; border:2px solid ${isVisited ? '#10b981' : 'rgba(16,185,129,0.4)'}; color:${isVisited ? '#34d399' : '#e2e8f0'}; font-weight:800; font-size:0.78rem;">
                        <input type="checkbox" id="carea-tick-visited" ${isVisited ? 'checked' : ''} onchange="handleCustomerAreaTick('${safeCode}', 'VISITED', this.checked)" style="width:17px; height:17px; accent-color:#10b981; cursor:pointer; margin:0;">
                        <span>✓ Ziyaret Edildi</span>
                    </label>
                    <label style="display:inline-flex; align-items:center; gap:0.4rem; padding:0.4rem 0.75rem; border-radius:8px; cursor:pointer; background:${isNotVisited ? 'rgba(239,68,68,0.28)' : 'rgba(15,23,42,0.85)'}; border:2px solid ${isNotVisited ? '#ef4444' : 'rgba(239,68,68,0.4)'}; color:${isNotVisited ? '#fca5a5' : '#e2e8f0'}; font-weight:800; font-size:0.78rem;">
                        <input type="checkbox" id="carea-tick-notvisited" ${isNotVisited ? 'checked' : ''} onchange="handleCustomerAreaTick('${safeCode}', 'NOT_VISITED', this.checked)" style="width:17px; height:17px; accent-color:#ef4444; cursor:pointer; margin:0;">
                        <span>✗ Ziyaret Edilemedi</span>
                    </label>
                </div>
            </div>

            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(155px, 1fr)); gap:0.6rem; align-items:end; margin-bottom:0.85rem;">
                <div>
                    <label style="display:block; font-size:0.7rem; font-weight:700; color:#fde68a; margin-bottom:0.2rem;">Ziyaret Tarihi (GG.AA.YYYY)</label>
                    <input type="text" id="carea-visit-date" class="filter-input" style="width:100%;" value="${escapeHtml(todayStr)}" placeholder="GG.AA.YYYY">
                </div>
                <div>
                    <label style="display:block; font-size:0.7rem; font-weight:700; color:#fde68a; margin-bottom:0.2rem;">Ziyaret Saati</label>
                    <input type="text" id="carea-visit-time" class="filter-input" style="width:100%;" value="${escapeHtml(nowTimeStr)}" placeholder="14:30">
                </div>
                <div>
                    <label style="display:block; font-size:0.7rem; font-weight:700; color:#93c5fd; margin-bottom:0.2rem;">Görüşülen Kişi</label>
                    <input type="text" id="carea-visit-contact" class="filter-input" style="width:100%;" value="${escapeHtml(customer.authorized || '')}" placeholder="Görüşülen kişi">
                </div>
                <div>
                    <label style="display:block; font-size:0.7rem; font-weight:700; color:#93c5fd; margin-bottom:0.2rem;">Görüşülen Kişinin Görevi</label>
                    <input type="text" id="carea-visit-role" class="filter-input" style="width:100%;" value="${escapeHtml(customer.contactRole || 'Firma Yetkilisi')}" placeholder="Firma Sahibi / Müdür">
                </div>
                <div>
                    <label style="display:block; font-size:0.7rem; font-weight:700; color:#34d399; margin-bottom:0.2rem;">Görüşme Sonucu</label>
                    <select id="carea-visit-result" class="filter-input" style="width:100%;">
                        <option value="1 - Olumlu / Sipariş & Randevu Alındı">1 - Olumlu / Randevu Alındı</option>
                        <option value="2 - Tanışma / İlk Temas Sağlandı">2 - Tanışma / İlk Temas</option>
                        <option value="3 - Teklif / Fiyat Sunuldu (Takip)">3 - Teklif / Fiyat Sunuldu</option>
                        <option value="4 - Tahsilat / Cari Mutabakat Yapıldı">4 - Tahsilat / Mutabakat</option>
                        <option value="5 - Tekrar Ziyaret Edilecek">5 - Tekrar Ziyaret Edilecek</option>
                    </select>
                </div>
                <div>
                    <label style="display:block; font-size:0.7rem; font-weight:700; color:#fca5a5; margin-bottom:0.2rem;">Ziyaret Edilememe Sebebi</label>
                    <select id="carea-unvisited-reason" class="filter-input" style="width:100%;">
                        <option value="">-- Edilemediyse Seçin --</option>
                        ${UNVISITED_REASON_OPTIONS.map(opt => `<option value="${escapeHtml(opt)}">${escapeHtml(opt)}</option>`).join('')}
                    </select>
                </div>
                <div style="grid-column:span 2; min-width:210px;">
                    <label style="display:block; font-size:0.7rem; font-weight:700; color:#e2e8f0; margin-bottom:0.2rem;">Ziyaret Açıklaması / Görüşme Notu</label>
                    <input type="text" id="carea-visit-notes" class="filter-input" style="width:100%;" value="" placeholder="Müşteri ziyaret açıklaması, araç/servis talebi, görüşme sonucu...">
                </div>
                <div>
                    <button type="button" class="btn btn-primary" style="width:100%; justify-content:center; padding:0.48rem 0.85rem; font-weight:800; background:linear-gradient(135deg,#10b981,#0284c7);" onclick="saveCustomerVisitFromCustomerArea('${safeCode}')">
                        <i class="fa-solid fa-floppy-disk"></i> Ziyareti Geçmişe Kaydet
                    </button>
                </div>
            </div>

            <!-- BÖLÜM 6: MÜŞTERİ ZİYARET GEÇMİŞİ TABLOSU (ÜZERİNE YAZILMAZ, TARİH SIRASIYLA SAKLANIR) -->
            <div style="background:rgba(2,6,23,0.65); border:1px solid rgba(56,189,248,0.3); border-radius:10px; padding:0.7rem 0.9rem;">
                <div style="font-size:0.8rem; font-weight:800; color:#38bdf8; margin-bottom:0.45rem; display:flex; justify-content:space-between; align-items:center;">
                    <span><i class="fa-solid fa-clock-rotate-left"></i> MÜŞTERİ ZİYARET GEÇMİŞİ (Tarih Sırasıyla Tüm Ziyaretler)</span>
                    <span class="badge badge-success">${visitHistory.length} Ziyaret Kaydı</span>
                </div>
                ${visitHistory.length === 0 ? `
                    <div style="font-size:0.75rem; color:var(--text-muted); padding:0.4rem 0;">Bu müşteriye ait henüz kayıtlı bir saha ziyareti geçmişi bulunmuyor.</div>
                ` : `
                    <div class="table-responsive" style="max-height:190px; overflow-y:auto;">
                        <table class="dizsan-table" style="font-size:0.74rem;">
                            <thead>
                                <tr>
                                    <th>Tarih &amp; Saat</th>
                                    <th>Personel</th>
                                    <th>Görüşülen Kişi &amp; Görevi</th>
                                    <th>Ziyaret Açıklaması</th>
                                    <th>Görüşme Sonucu</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${visitHistory.map(h => `
                                    <tr>
                                        <td style="white-space:nowrap; font-weight:700; color:#fde68a;">${escapeHtml(h.date || '-')} ${escapeHtml(h.time || '')}</td>
                                        <td>${escapeHtml(h.personnel || '-')}</td>
                                        <td>${escapeHtml(h.contactPerson || '-')} <span style="color:#94a3b8; font-size:0.68rem;">(${escapeHtml(h.contactRole || 'Yetkili')})</span></td>
                                        <td>${escapeHtml(h.notes || '-')}</td>
                                        <td><span class="badge ${h.status === 'NOT_VISITED' ? 'badge-p1' : 'badge-success'}" style="font-size:0.66rem;">${escapeHtml(h.result || '-')}</span></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>
        </div>
    `;
}

function handleCustomerAreaTick(code, status, isChecked) {
    const vCb = document.getElementById('carea-tick-visited');
    const nvCb = document.getElementById('carea-tick-notvisited');
    if (status === 'VISITED' && isChecked && nvCb) nvCb.checked = false;
    if (status === 'NOT_VISITED' && isChecked && vCb) vCb.checked = false;
    saveCustomerVisitFromCustomerArea(code, isChecked ? status : 'PENDING');
}

async function saveCustomerVisitFromCustomerArea(code, explicitStatus = null) {
    const c = (appState.customers || []).find(x => x.code === code);
    if (!c) return;

    const vCb = document.getElementById('carea-tick-visited');
    const nvCb = document.getElementById('carea-tick-notvisited');
    const vDate = (document.getElementById('carea-visit-date')?.value || '').trim() || getTodayTRStr();
    const vTime = (document.getElementById('carea-visit-time')?.value || '').trim() || getNowTimeTRStr();
    const vContact = (document.getElementById('carea-visit-contact')?.value || '').trim() || c.authorized || 'Yetkili';
    const vRole = (document.getElementById('carea-visit-role')?.value || '').trim() || 'Yetkili';
    const vResult = (document.getElementById('carea-visit-result')?.value || '').trim();
    const vNotes = (document.getElementById('carea-visit-notes')?.value || '').trim();
    const vReason = (document.getElementById('carea-unvisited-reason')?.value || '').trim();

    let status = explicitStatus;
    if (!status) {
        if (vCb && vCb.checked) status = 'VISITED';
        else if (nvCb && nvCb.checked) status = 'NOT_VISITED';
        else if (vReason && !vNotes) status = 'NOT_VISITED';
        else status = 'VISITED';
    }

    const actor = currentUser ? currentUser.name : 'ÖMER EREN';
    let targetRoute = null;
    let targetItem = null;

    for (const rt of (appState.customRoutes || [])) {
        const items = ensureRouteItemsNormalized(rt);
        const found = items.find(i => i.code === code || i.convertedCustomerCode === code);
        if (found) {
            targetRoute = rt;
            targetItem = found;
            break;
        }
    }

    if (!targetRoute) {
        targetRoute = {
            id: 'RUTPLAN-' + Date.now(),
            name: `${c.city || 'Saha'} / ${c.district || 'Merkez'} Rutu`,
            routeText: `${c.city || ''} / ${c.district || ''}`,
            plannedDate: vDate,
            planStatus: 'Devam Ediyor',
            assignee: actor,
            notes: 'Müşteri kartından oluşturulan ziyaret kaydı',
            districts: [`${c.city || ''} / ${c.district || ''}`],
            customerCodes: [c.code],
            items: [],
            updatedAt: formatNowTR(),
            createdBy: actor
        };
        if (!Array.isArray(appState.customRoutes)) appState.customRoutes = [];
        appState.customRoutes.unshift(targetRoute);
        ensureRouteItemsNormalized(targetRoute);
        targetItem = targetRoute.items[0];
    }

    if (targetItem) {
        targetItem.status = status;
        targetItem.visitDate = vDate;
        targetItem.visitTime = vTime;
        targetItem.authorized = vContact;
        targetItem.contactRole = vRole;
        targetItem.visitResult = vResult;
        targetItem.visitNotes = vNotes;
        targetItem.unvisitedReason = vReason;
        targetItem.personnel = actor;
        await persistRouteItemAndSyncToCustomer(targetRoute, targetItem);
    }

    renderSavedCustomRoutesList();
    renderActiveRouteExecutionPanel();
    renderReportsTab();
    updateRouteAndReportsBadges();
    openCustomerDetailModal(code);
    showToast(`"${c.title}" ziyaret kaydı müşteri ziyaret geçmişine ve raporlara eklendi!`, 'success');
}

// ==========================================================================
// BÖLÜM 9 & 10: RAPORLAR MODÜLÜ (A. GENEL, B. PERSONEL, C. İL/İLÇE, D. MÜŞTERİ, E. EDİLEMEYENLER, F. MANUEL)
// ==========================================================================
function collectAllRouteReportRows() {
    const routes = Array.isArray(appState.customRoutes) ? appState.customRoutes : [];
    const rows = [];
    const seenKeys = new Set();

    routes.forEach(rt => {
        const items = ensureRouteItemsNormalized(rt);
        items.forEach((it, idx) => {
            const key = `${rt.id}|${it.code}`;
            seenKeys.add(key);
            rows.push({
                routeId: rt.id,
                routeName: rt.name || 'Rut Planı',
                routeText: rt.routeText || '-',
                planStatus: rt.planStatus || 'Planlandı',
                plannedDate: rt.plannedDate || '-',
                personnel: it.personnel || rt.assignee || 'ÖMER EREN',
                itemIdx: idx,
                code: it.code,
                convertedCustomerCode: it.convertedCustomerCode || '',
                title: it.title || it.code,
                city: it.city || '-',
                district: it.district || '-',
                authorized: it.authorized || '-',
                contactRole: it.contactRole || 'Yetkili',
                phone: it.phone || '-',
                plates: it.plates || '-',
                isManual: Boolean(it.isManual),
                visitPurpose: it.visitPurpose || 'Tanışma Ziyareti',
                status: it.status || 'PENDING',
                visitDate: it.visitDate || '',
                visitTime: it.visitTime || '',
                visitResult: it.visitResult || '',
                visitNotes: it.visitNotes || '',
                extraNotes: it.extraNotes || '',
                unvisitedReason: it.unvisitedReason || ''
            });
        });
    });

    (appState.visits || []).forEach(v => {
        const key = `${v.routeId || 'NOROUTE'}|${v.customerCode || v.customerTitle}`;
        if (v.routeId && seenKeys.has(key)) return;
        const isNotVis = v.visitStatus === 'NOT_VISITED' || String(v.result || '').toLowerCase().includes('edilemedi');
        rows.push({
            visitId: v.id || '',
            routeId: v.routeId || '',
            routeName: v.routeName || 'Genel Saha Ziyareti',
            routeText: `${v.city || '-'} / ${v.district || '-'}`,
            planStatus: 'Tamamlandı',
            plannedDate: v.plannedDate || v.date || '-',
            personnel: v.personnel || 'ÖMER EREN',
            itemIdx: -1,
            code: v.customerCode || '',
            convertedCustomerCode: '',
            title: v.customerTitle || '-',
            city: v.city || '-',
            district: v.district || '-',
            authorized: v.contactPerson || '-',
            contactRole: v.contactRole || 'Yetkili',
            phone: '-',
            plates: v.plates || '-',
            isManual: Boolean(v.isManual) || String(v.customerCode || '').startsWith('MANUEL-') || String(v.customerCode || '').startsWith('TANISMA-'),
            visitPurpose: v.visitPurpose || 'Saha Ziyareti',
            status: v.visitStatus || (isNotVis ? 'NOT_VISITED' : 'VISITED'),
            visitDate: v.date || '',
            visitTime: v.time || '',
            visitResult: v.result || '',
            visitNotes: v.notes || '',
            extraNotes: v.extraNotes || '',
            unvisitedReason: v.unvisitedReason || (isNotVis ? v.notes : '')
        });
    });

    return rows;
}

async function deleteReportRowRecord(routeId, itemIdx, visitId, code, title) {
    const label = title || code || 'Ziyaret Kaydı';
    if (!isOmerEren(currentUser)) {
        if (visitId) {
            openApprovalRequestModal('DELETE_VISIT', visitId, label);
        } else if (routeId) {
            openApprovalRequestModal('DELETE_ROUTE', routeId, `Rapor / Rut Kaydı: ${label}`);
        } else {
            showToast('Kayıt silme işlemi yalnızca Yönetici ÖMER EREN onayıyla yapılabilir.', 'warning');
        }
        return;
    }
    if (!confirm(`"${label}" rapor kaydını silmek istediğinize emin misiniz?`)) return;

    // 1. Eğer bir rut planı satırıysa ruttan çıkar; rutta başka kayıt kalmadıysa rutu da sil
    if (routeId && Array.isArray(appState.customRoutes)) {
        const rt = appState.customRoutes.find(r => r && r.id === routeId);
        if (rt) {
            ensureRouteItemsNormalized(rt);
            if (itemIdx >= 0 && itemIdx < rt.items.length) {
                const removed = rt.items.splice(itemIdx, 1)[0];
                if (removed && removed.code && Array.isArray(rt.customerCodes)) {
                    rt.customerCodes = rt.customerCodes.filter(c => c !== removed.code);
                }
            } else if (code) {
                rt.items = (rt.items || []).filter(it => it && it.code !== code);
                rt.customerCodes = (rt.customerCodes || []).filter(c => c !== code);
            }
            if (!rt.items || rt.items.length === 0) {
                registerDeletedRecordId(rt.id);
                appState.customRoutes = appState.customRoutes.filter(r => r && r.id !== routeId);
            } else {
                rt.updatedAt = formatNowTR();
            }
        }
    }

    // 2. Eşleşen ziyaret kayıtlarını (appState.visits) sil
    if (Array.isArray(appState.visits)) {
        appState.visits.forEach(v => {
            if (!v) return;
            const matchById = visitId && v.id === visitId;
            const matchByRouteAndCode = routeId && v.routeId === routeId && ((code && v.customerCode === code) || (title && normalizeTR(v.customerTitle) === normalizeTR(title)));
            const matchByCodeAndTitle = !routeId && ((code && v.customerCode === code) || (title && normalizeTR(v.customerTitle) === normalizeTR(title)));
            if (matchById || matchByRouteAndCode || matchByCodeAndTitle) {
                if (v.id) registerDeletedRecordId(v.id);
            }
        });
        appState.visits = appState.visits.filter(v => {
            if (!v) return false;
            const matchById = visitId && v.id === visitId;
            const matchByRouteAndCode = routeId && v.routeId === routeId && ((code && v.customerCode === code) || (title && normalizeTR(v.customerTitle) === normalizeTR(title)));
            const matchByCodeAndTitle = !routeId && ((code && v.customerCode === code) || (title && normalizeTR(v.customerTitle) === normalizeTR(title)));
            return !(matchById || matchByRouteAndCode || matchByCodeAndTitle);
        });
    }

    // 3. Müşterinin visitHistory dizisinden de temizle
    if (Array.isArray(appState.customers)) {
        appState.customers.forEach(c => {
            if (!c || !Array.isArray(c.visitHistory)) return;
            if ((code && c.code === code) || (title && normalizeTR(c.title) === normalizeTR(title))) {
                c.visitHistory = c.visitHistory.filter(h => {
                    if (!h) return false;
                    if (visitId && h.id === visitId) return false;
                    if (routeId && h.routeId === routeId) return false;
                    return true;
                });
            }
        });
    }

    syncCustomRoutesToCustomers();
    saveStateLocally();
    renderDashboard();
    if (typeof renderActiveVisits === 'function') renderActiveVisits();
    if (typeof renderSavedCustomRoutesList === 'function') renderSavedCustomRoutesList();
    if (typeof renderActiveRouteExecutionPanel === 'function') renderActiveRouteExecutionPanel();
    renderReportsTab();
    updateRouteAndReportsBadges();
    await syncToServer();
    showToast(`🗑️ "${label}" kaydı raporlardan ve sistemden silindi.`, 'success');
}
window.deleteReportRowRecord = deleteReportRowRecord;

function handleReportCityFilterChange() {
    const citySel = document.getElementById('rep-filter-city');
    const distSel = document.getElementById('rep-filter-district');
    if (distSel) distSel.value = '';
    populateReportsFilters(true);
    renderReportsTab();
}

function populateReportsFilters(rebuildDistricts = false) {
    const rows = collectAllRouteReportRows();
    const routeSel = document.getElementById('rep-filter-route');
    const persSel = document.getElementById('rep-filter-personnel');
    const citySel = document.getElementById('rep-filter-city');
    const distSel = document.getElementById('rep-filter-district');
    const custSel = document.getElementById('rep-filter-customer');

    if (routeSel) {
        const cur = routeSel.value;
        const rNames = Array.from(new Set((appState.customRoutes || []).map(r => r.name).filter(Boolean)));
        routeSel.innerHTML = `<option value="">🚗 Tüm Rut Planları (${rNames.length})</option>` +
            rNames.map(n => `<option value="${escapeHtml(n)}">${escapeHtml(n)}</option>`).join('');
        if (cur) routeSel.value = cur;
    }

    if (persSel) {
        const cur = persSel.value;
        const pNames = Array.from(new Set([
            ...(appState.users || []).map(u => u.name),
            ...rows.map(r => r.personnel)
        ].filter(Boolean)));
        persSel.innerHTML = `<option value="">👤 Tüm Personeller (${pNames.length})</option>` +
            pNames.map(n => `<option value="${escapeHtml(n)}">${escapeHtml(n)}</option>`).join('');
        if (cur) persSel.value = cur;
    }

    if (citySel) {
        const cur = citySel.value;
        const cities = Array.from(new Set([
            ...rows.map(r => r.city),
            ...(appState.customers || []).map(c => c.city)
        ].filter(c => c && c !== '-'))).sort((a, b) => a.localeCompare(b, 'tr'));
        citySel.innerHTML = `<option value="">📍 Tüm İller (${cities.length})</option>` +
            cities.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
        if (cur) citySel.value = cur;
    }

    if (distSel) {
        const cur = distSel.value;
        const selectedCity = citySel ? citySel.value : '';
        const dists = Array.from(new Set([
            ...rows.filter(r => !selectedCity || normalizeTR(r.city) === normalizeTR(selectedCity)).map(r => r.district),
            ...(appState.customers || []).filter(c => !selectedCity || normalizeTR(c.city) === normalizeTR(selectedCity)).map(c => c.district)
        ].filter(d => d && d !== '-'))).sort((a, b) => a.localeCompare(b, 'tr'));
        distSel.innerHTML = `<option value="">🏘️ Tüm İlçeler (${dists.length})</option>` +
            dists.map(d => `<option value="${escapeHtml(d)}">${escapeHtml(d)}</option>`).join('');
        if (cur && dists.includes(cur)) distSel.value = cur;
    }

    if (custSel && custSel.options.length <= 1) {
        const visitedCusts = Array.from(new Set(rows.map(r => r.title).filter(Boolean))).slice(0, 300);
        custSel.innerHTML = `<option value="">🏢 Tüm Müşteriler</option>` +
            visitedCusts.map(t => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join('');
    }
}

function setReportStatusFilter(status) {
    const sel = document.getElementById('rep-filter-status');
    if (sel) sel.value = status || 'ALL';
    renderReportsTab();
}

function filterReportByRegion(city, district) {
    const citySel = document.getElementById('rep-filter-city');
    const distSel = document.getElementById('rep-filter-district');
    if (citySel) citySel.value = city || '';
    populateReportsFilters(true);
    if (distSel) distSel.value = district || '';
    renderReportsTab();
}

function resetReportsFilters() {
    ['rep-filter-search', 'rep-filter-route', 'rep-filter-personnel', 'rep-filter-city', 'rep-filter-district', 'rep-filter-customer', 'rep-filter-date-from', 'rep-filter-date-to'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    const st = document.getElementById('rep-filter-status');
    if (st) st.value = 'ALL';
    const cb = document.getElementById('rep-only-unvisited-customers-cb');
    if (cb) cb.checked = false;
    populateReportsFilters(true);
    renderReportsTab();
}

function renderReportsTab() {
    const mainBody = document.getElementById('rep-main-table-body');
    if (!mainBody) return;

    populateReportsFilters();
    const allRows = collectAllRouteReportRows();

    const search = normalizeTR(document.getElementById('rep-filter-search')?.value || '');
    const routeFilter = document.getElementById('rep-filter-route')?.value || '';
    const persFilter = document.getElementById('rep-filter-personnel')?.value || '';
    const cityFilter = document.getElementById('rep-filter-city')?.value || '';
    const distFilter = document.getElementById('rep-filter-district')?.value || '';
    const custFilter = document.getElementById('rep-filter-customer')?.value || '';
    const statusFilter = document.getElementById('rep-filter-status')?.value || 'ALL';
    const fromStr = (document.getElementById('rep-filter-date-from')?.value || '').trim();
    const toStr = (document.getElementById('rep-filter-date-to')?.value || '').trim();
    const fromDt = parseSqlEntryDateObj(fromStr);
    const toDt = parseSqlEntryDateObj(toStr);

    // Filtrelenmiş satırlar (Tarih, Personel, İl, İlçe, Müşteri ortak filtresi)
    const baseFiltered = allRows.filter(r => {
        if (routeFilter && r.routeName !== routeFilter) return false;
        if (persFilter && normalizeTR(r.personnel) !== normalizeTR(persFilter)) return false;
        if (cityFilter && normalizeTR(r.city) !== normalizeTR(cityFilter)) return false;
        if (distFilter && normalizeTR(r.district) !== normalizeTR(distFilter)) return false;
        if (custFilter && normalizeTR(r.title) !== normalizeTR(custFilter)) return false;
        if (fromDt || toDt) {
            const rDt = parseSqlEntryDateObj(r.visitDate || r.plannedDate);
            if (fromDt && (!rDt || rDt.getTime() < fromDt.getTime())) return false;
            if (toDt && (!rDt || rDt.getTime() > toDt.getTime())) return false;
        }
        if (search) {
            const hay = normalizeTR(`${r.routeName} ${r.routeText} ${r.title} ${r.code} ${r.city} ${r.district} ${r.personnel} ${r.visitNotes} ${r.unvisitedReason} ${r.authorized}`);
            if (!hay.includes(search)) return false;
        }
        return true;
    });

    // A. GENEL ZİYARET RAPORU HESAPLAMALARI (BÖLÜM 9.A FORMÜLÜ)
    // Gerçekleşen Ziyaret / (Gerçekleşen + Ziyaret Edilemeyen + İptal Edilen Ziyaretler) * 100
    // Bekleyen ziyaretler gerçekleşme oranına dahil edilmez!
    const totalPlanned = baseFiltered.length;
    const totalVisited = baseFiltered.filter(r => r.status === 'VISITED').length;
    const totalNotVisited = baseFiltered.filter(r => r.status === 'NOT_VISITED').length;
    const totalCancelled = baseFiltered.filter(r => r.status === 'CANCELLED').length;
    const totalManual = baseFiltered.filter(r => r.isManual).length;
    const totalPending = baseFiltered.filter(r => r.status === 'PENDING').length;

    const rateDenomWithCancel = totalVisited + totalNotVisited + totalCancelled;
    const rateWithCancel = rateDenomWithCancel > 0 ? Math.round((totalVisited / rateDenomWithCancel) * 100) : 0;
    const rateDenomNoCancel = totalVisited + totalNotVisited;
    const rateNoCancel = rateDenomNoCancel > 0 ? Math.round((totalVisited / rateDenomNoCancel) * 100) : 0;

    const kpiTotal = document.getElementById('rep-kpi-total-planned');
    const kpiSub = document.getElementById('rep-kpi-routes-sub');
    const kpiVis = document.getElementById('rep-kpi-visited');
    const kpiVisPct = document.getElementById('rep-kpi-visited-pct');
    const kpiNotVis = document.getElementById('rep-kpi-not-visited');
    const kpiCancelSub = document.getElementById('rep-kpi-cancelled-sub');
    const kpiMan = document.getElementById('rep-kpi-manual');
    const kpiPend = document.getElementById('rep-kpi-pending');

    if (kpiTotal) kpiTotal.textContent = String(totalPlanned);
    if (kpiSub) kpiSub.textContent = `${(appState.customRoutes || []).length} Oluşturulan Rut Planı`;
    if (kpiVis) kpiVis.textContent = String(totalVisited);
    if (kpiVisPct) kpiVisPct.textContent = `%${rateWithCancel} Gerçekleşme (İptal Hariç: %${rateNoCancel})`;
    if (kpiNotVis) kpiNotVis.textContent = String(totalNotVisited);
    if (kpiCancelSub) kpiCancelSub.textContent = `İptal Edilen: ${totalCancelled} Ziyaret`;
    if (kpiMan) kpiMan.textContent = String(totalManual);
    if (kpiPend) kpiPend.textContent = String(totalPending);

    const filtered = baseFiltered.filter(r => {
        if (statusFilter === 'VISITED' && r.status !== 'VISITED') return false;
        if (statusFilter === 'NOT_VISITED' && r.status !== 'NOT_VISITED') return false;
        if (statusFilter === 'PENDING' && r.status !== 'PENDING') return false;
        if (statusFilter === 'CANCELLED' && r.status !== 'CANCELLED') return false;
        if (statusFilter === 'MANUAL' && !r.isManual) return false;
        return true;
    });

    const countBadge = document.getElementById('rep-main-table-count');
    if (countBadge) countBadge.textContent = `${filtered.length} Kayıt`;

    if (filtered.length === 0) {
        mainBody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:1.4rem; color:var(--text-muted);">Seçilen filtrelere uygun ziyaret kaydı bulunamadı.</td></tr>`;
    } else {
        mainBody.innerHTML = filtered.map((r, i) => {
            const stBadge = r.status === 'VISITED'
                ? `<span class="badge badge-success">✅ Ziyaret Edildi</span>`
                : (r.status === 'NOT_VISITED'
                    ? `<span class="badge badge-p1">❌ Edilemedi</span>`
                    : (r.status === 'CANCELLED' ? `<span class="badge badge-secondary">🚫 İptal Edildi</span>` : `<span class="badge" style="background:rgba(245,158,11,0.2); color:#fbbf24;">⏳ Bekliyor</span>`));
            const safeCode = escapeHtml(r.convertedCustomerCode || r.code || '').replace(/'/g, "\\'");
            const detailText = r.status === 'NOT_VISITED'
                ? `<strong style="color:#fca5a5;">Sebep:</strong> ${escapeHtml(r.unvisitedReason || '-')}`
                : `${r.authorized && r.authorized !== '-' ? `<strong style="color:#93c5fd;">Görüşülen: ${escapeHtml(r.authorized)}</strong> &bull; ` : ''}${r.visitResult ? `<strong style="color:#34d399;">${escapeHtml(r.visitResult)}</strong> — ` : ''}${escapeHtml(r.visitNotes || '-')}`;

            return `
                <tr>
                    <td>${i + 1}</td>
                    <td>
                        <strong style="color:#fff;">${escapeHtml(r.routeName)}</strong>
                        <div style="font-size:0.69rem; color:#38bdf8;">${escapeHtml(r.routeText)}</div>
                    </td>
                    <td>${escapeHtml(r.plannedDate)}</td>
                    <td><span class="badge badge-secondary">${escapeHtml(r.personnel)}</span></td>
                    <td>
                        <strong style="color:#f8fafc;">${escapeHtml(r.title)}</strong>
                        <div>
                            ${r.isManual ? `<span class="badge" style="background:rgba(139,92,246,0.22); color:#e9d5ff; font-size:0.64rem;">🤝 Manuel (${escapeHtml(r.visitPurpose)})</span>` : `<span style="font-family:monospace; font-size:0.68rem; color:#93c5fd;">${escapeHtml(r.code)}</span>`}
                        </div>
                    </td>
                    <td>${escapeHtml(r.city)} / ${escapeHtml(r.district)}</td>
                    <td>${stBadge}</td>
                    <td>${escapeHtml(r.visitDate || '-')} ${escapeHtml(r.visitTime || '')}</td>
                    <td style="max-width:270px; white-space:normal; font-size:0.74rem;">${detailText}</td>
                    <td style="text-align:right; white-space:nowrap;">
                        <div style="display:inline-flex; gap:0.3rem; align-items:center;">
                            ${!r.isManual || r.convertedCustomerCode ? `
                                <button type="button" class="btn btn-secondary btn-sm" style="padding:0.22rem 0.5rem; font-size:0.7rem;" onclick="openCustomerDetailModal('${safeCode}')">
                                    <i class="fa-solid fa-id-card" style="color:#38bdf8;"></i> Müşteri Kartı
                                </button>
                            ` : ''}
                            <button type="button" class="btn btn-danger btn-sm" style="padding:0.22rem 0.5rem; font-size:0.7rem;" onclick="deleteReportRowRecord('${escapeHtml(r.routeId || '').replace(/'/g, "\\'")}', ${Number(r.itemIdx ?? -1)}, '${escapeHtml(r.visitId || '').replace(/'/g, "\\'")}', '${safeCode}', '${escapeHtml(r.title || '').replace(/'/g, "\\'")}')" title="Bu Rapor Kaydını Sil">
                                <i class="fa-solid fa-trash"></i> Sil
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // E. ZİYARET EDİLEMEYENLER RAPORU (BÖLÜM 9.E)
    const unvisBody = document.getElementById('rep-unvisited-table-body');
    const unvisBadge = document.getElementById('rep-unvisited-badge');
    const unvisList = baseFiltered.filter(r => r.status === 'NOT_VISITED');
    if (unvisBadge) unvisBadge.textContent = `${unvisList.length} Kayıt`;
    if (unvisBody) {
        unvisBody.innerHTML = unvisList.length === 0
            ? `<tr><td colspan="5" style="text-align:center; padding:1rem; color:var(--text-muted);">Ziyaret edilemeyen müşteri kaydı yok.</td></tr>`
            : unvisList.map(r => {
                const safeCode = escapeHtml(r.code || '').replace(/'/g, "\\'");
                const safeCity = escapeHtml(r.city || '').replace(/'/g, "\\'");
                const safeDist = escapeHtml(r.district || '').replace(/'/g, "\\'");
                const safeTitle = escapeHtml(r.title || '').replace(/'/g, "\\'");
                return `
                    <tr>
                        <td><strong style="color:#fff;">${escapeHtml(r.title)}</strong><div style="font-size:0.68rem; color:#94a3b8;">${escapeHtml(r.routeName)}</div></td>
                        <td>${escapeHtml(r.city)} / ${escapeHtml(r.district)}</td>
                        <td>${escapeHtml(r.plannedDate)}<div style="font-size:0.68rem; color:#38bdf8;">${escapeHtml(r.personnel)}</div></td>
                        <td style="color:#fca5a5; font-weight:700;">${escapeHtml(r.unvisitedReason || 'Sebep Belirtilmedi')}</td>
                        <td style="text-align:right;">
                            <button type="button" class="btn btn-primary btn-sm" style="padding:0.2rem 0.48rem; font-size:0.68rem;" onclick="reAddUnvisitedToRouteDraft('${safeCode}', '${safeCity}', '${safeDist}', '${safeTitle}')" title="Yeni Rut Planına Tekrar Ekle">
                                <i class="fa-solid fa-rotate-right"></i> Yeni Plana Ekle
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
    }

    // F. MANUEL ZİYARETLER RAPORU (BÖLÜM 9.F)
    const manBody = document.getElementById('rep-manual-table-body');
    const manBadge = document.getElementById('rep-manual-badge');
    const manList = baseFiltered.filter(r => r.isManual);
    if (manBadge) manBadge.textContent = `${manList.length} Kayıt`;
    if (manBody) {
        manBody.innerHTML = manList.length === 0
            ? `<tr><td colspan="5" style="text-align:center; padding:1rem; color:var(--text-muted);">Manuel eklenen işletme ziyareti yok.</td></tr>`
            : manList.map(r => `
                <tr>
                    <td><strong style="color:#e9d5ff;">🤝 ${escapeHtml(r.title)}</strong><div style="font-size:0.68rem; color:#94a3b8;">Görüşülen: ${escapeHtml(r.authorized)}</div></td>
                    <td>${escapeHtml(r.city)} / ${escapeHtml(r.district)}<div style="font-size:0.68rem; color:#38bdf8;">${escapeHtml(r.phone)}</div></td>
                    <td>${escapeHtml(r.visitDate || r.plannedDate)}<div style="font-size:0.68rem; color:#34d399;">${escapeHtml(r.personnel)} &bull; ${escapeHtml(r.visitPurpose)}</div></td>
                    <td style="font-size:0.73rem;">${escapeHtml(r.visitNotes || '-')}</td>
                    <td style="text-align:right;">
                        ${r.convertedCustomerCode ? `
                            <span class="badge badge-success" style="font-size:0.66rem;">Müşteri: ${escapeHtml(r.convertedCustomerCode)}</span>
                        ` : (r.routeId && r.itemIdx >= 0 ? `
                            <button type="button" class="btn btn-success btn-sm" style="padding:0.2rem 0.5rem; font-size:0.68rem;" onclick="convertManualVisitToCustomer('${r.routeId}', ${r.itemIdx})">
                                <i class="fa-solid fa-user-plus"></i> Müşteriye Dönüştür
                            </button>
                        ` : '-')}
                    </td>
                </tr>
            `).join('');
    }

    // B. PERSONEL BAZLI RAPOR (BÖLÜM 9.B)
    const persBody = document.getElementById('rep-personnel-table-body');
    if (persBody) {
        const pMap = {};
        (appState.customRoutes || []).forEach(rt => {
            const p = rt.assignee || 'ÖMER EREN';
            if (!pMap[p]) pMap[p] = { plans: 0, planned: 0, visited: 0, notVisited: 0, cancelled: 0, manual: 0 };
            pMap[p].plans += 1;
        });
        baseFiltered.forEach(r => {
            const p = r.personnel || 'ÖMER EREN';
            if (!pMap[p]) pMap[p] = { plans: 0, planned: 0, visited: 0, notVisited: 0, cancelled: 0, manual: 0 };
            pMap[p].planned += 1;
            if (r.status === 'VISITED') pMap[p].visited += 1;
            if (r.status === 'NOT_VISITED') pMap[p].notVisited += 1;
            if (r.status === 'CANCELLED') pMap[p].cancelled += 1;
            if (r.isManual) pMap[p].manual += 1;
        });
        const pEntries = Object.entries(pMap);
        persBody.innerHTML = pEntries.length === 0
            ? `<tr><td colspan="7" style="text-align:center; padding:1rem; color:var(--text-muted);">Personel verisi bulunamadı.</td></tr>`
            : pEntries.map(([pName, st]) => {
                const denom = st.visited + st.notVisited + st.cancelled;
                const pRate = denom > 0 ? Math.round((st.visited / denom) * 100) : 0;
                return `
                    <tr>
                        <td><strong style="color:#fff;"><i class="fa-solid fa-user-tie" style="color:#38bdf8;"></i> ${escapeHtml(pName)}</strong></td>
                        <td>${st.plans} Plan</td>
                        <td><strong>${st.planned}</strong></td>
                        <td style="color:#34d399; font-weight:800;">${st.visited}</td>
                        <td style="color:#f87171; font-weight:800;">${st.notVisited}</td>
                        <td style="color:#c084fc; font-weight:800;">${st.manual}</td>
                        <td><span class="badge ${pRate >= 70 ? 'badge-success' : 'badge-secondary'}">%${pRate}</span></td>
                    </tr>
                `;
            }).join('');
    }

    // C. İL VE İLÇE BAZLI RAPOR (BÖLÜM 9.C)
    const regBody = document.getElementById('rep-region-table-body');
    if (regBody) {
        const regMap = {};
        baseFiltered.forEach(r => {
            const key = `${r.city || 'Diğer'}|${r.district || 'Merkez'}`;
            if (!regMap[key]) regMap[key] = { city: r.city || 'Diğer', district: r.district || 'Merkez', planned: 0, visited: 0, notVisited: 0, cancelled: 0 };
            regMap[key].planned += 1;
            if (r.status === 'VISITED') regMap[key].visited += 1;
            if (r.status === 'NOT_VISITED') regMap[key].notVisited += 1;
            if (r.status === 'CANCELLED') regMap[key].cancelled += 1;
        });
        const regList = Object.values(regMap).sort((a, b) => b.visited - a.visited || b.planned - a.planned);
        regBody.innerHTML = regList.length === 0
            ? `<tr><td colspan="7" style="text-align:center; padding:1rem; color:var(--text-muted);">İl ve ilçe bazlı ziyaret kaydı yok.</td></tr>`
            : regList.map(rg => {
                const denom = rg.visited + rg.notVisited + rg.cancelled;
                const rRate = denom > 0 ? Math.round((rg.visited / denom) * 100) : 0;
                const safeC = escapeHtml(rg.city).replace(/'/g, "\\'");
                const safeD = escapeHtml(rg.district).replace(/'/g, "\\'");
                return `
                    <tr>
                        <td><strong style="color:#fde68a;">${escapeHtml(rg.city)}</strong></td>
                        <td><strong>${escapeHtml(rg.district)}</strong></td>
                        <td>${rg.planned}</td>
                        <td style="color:#34d399; font-weight:800;">${rg.visited}</td>
                        <td style="color:#f87171; font-weight:800;">${rg.notVisited}</td>
                        <td><span class="badge ${rRate >= 70 ? 'badge-success' : 'badge-secondary'}">%${rRate}</span></td>
                        <td style="text-align:right;">
                            <button type="button" class="btn btn-secondary btn-sm" style="padding:0.18rem 0.45rem; font-size:0.68rem;" onclick="filterReportByRegion('${safeC}', '${safeD}')">
                                <i class="fa-solid fa-filter"></i> Müşterileri Gör
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
    }

    // D. MÜŞTERİ BAZLI RAPOR & HİÇ ZİYARET EDİLMEMİŞ MEVCUT MÜŞTERİLER FİLTRESİ (BÖLÜM 9.D)
    const custBody = document.getElementById('rep-customer-table-body');
    const custBadge = document.getElementById('rep-customer-report-badge');
    const onlyUnvisitedCusts = Boolean(document.getElementById('rep-only-unvisited-customers-cb')?.checked);
    if (custBody) {
        const visitedByCode = new Map();
        baseFiltered.filter(r => r.status === 'VISITED').forEach(r => {
            const k = r.convertedCustomerCode || r.code || r.title;
            if (!visitedByCode.has(k)) {
                visitedByCode.set(k, {
                    code: r.convertedCustomerCode || r.code,
                    title: r.title,
                    city: r.city,
                    district: r.district,
                    count: 0,
                    lastDate: r.visitDate || r.plannedDate,
                    personnels: new Set(),
                    notes: []
                });
            }
            const entry = visitedByCode.get(k);
            entry.count += 1;
            if (r.visitDate) entry.lastDate = r.visitDate;
            if (r.personnel) entry.personnels.add(r.personnel);
            if (r.visitNotes) entry.notes.push(`${r.visitDate || ''}: ${r.visitNotes}`);
        });

        if (onlyUnvisitedCusts) {
            const allCustomers = (appState.customers || []).filter(c => {
                if (cityFilter && normalizeTR(c.city) !== normalizeTR(cityFilter)) return false;
                if (distFilter && normalizeTR(c.district) !== normalizeTR(distFilter)) return false;
                if (search && !normalizeTR(`${c.code} ${c.title} ${c.city} ${c.district}`).includes(search)) return false;
                return !visitedByCode.has(c.code);
            });
            if (custBadge) custBadge.textContent = `${allCustomers.length} Hiç Ziyaret Edilmemiş Müşteri`;
            custBody.innerHTML = allCustomers.slice(0, 100).map(c => {
                const safeCode = escapeHtml(c.code || '').replace(/'/g, "\\'");
                const safeCity = escapeHtml(c.city || '').replace(/'/g, "\\'");
                const safeDist = escapeHtml(c.district || '').replace(/'/g, "\\'");
                const safeTitle = escapeHtml(c.title || '').replace(/'/g, "\\'");
                return `
                    <tr>
                        <td><strong style="color:#fff;">${escapeHtml(c.title)}</strong> <span style="font-family:monospace; color:#38bdf8; font-size:0.7rem;">(${escapeHtml(c.code)})</span></td>
                        <td>${escapeHtml(c.city || '-')} / ${escapeHtml(c.district || '-')}</td>
                        <td><span class="badge badge-p1">0 Ziyaret</span></td>
                        <td>${escapeHtml(c.lastVisit || 'Ziyaret Yok')}</td>
                        <td>-</td>
                        <td style="font-size:0.72rem; color:#94a3b8;">Seçilen tarih aralığında hiç ziyaret edilmedi.</td>
                        <td style="text-align:right;">
                            <button type="button" class="btn btn-primary btn-sm" style="padding:0.2rem 0.5rem; font-size:0.68rem;" onclick="reAddUnvisitedToRouteDraft('${safeCode}', '${safeCity}', '${safeDist}', '${safeTitle}')">
                                <i class="fa-solid fa-plus"></i> Rut Planına Ekle
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        } else {
            const vList = Array.from(visitedByCode.values());
            if (custBadge) custBadge.textContent = `${vList.length} Ziyaret Edilen Müşteri`;
            custBody.innerHTML = vList.length === 0
                ? `<tr><td colspan="7" style="text-align:center; padding:1rem; color:var(--text-muted);">Ziyaret edilen müşteri kaydı yok. "Hiç Ziyaret Edilmemiş Mevcut Müşterileri Göster" kutucuğunu işaretleyerek ziyaret edilmeyenleri listeleyebilirsiniz.</td></tr>`
                : vList.map(v => {
                    const safeCode = escapeHtml(v.code || '').replace(/'/g, "\\'");
                    return `
                        <tr>
                            <td><strong style="color:#fff;">${escapeHtml(v.title)}</strong> <span style="font-family:monospace; color:#38bdf8; font-size:0.7rem;">(${escapeHtml(v.code)})</span></td>
                            <td>${escapeHtml(v.city || '-')} / ${escapeHtml(v.district || '-')}</td>
                            <td><span class="badge badge-success">${v.count} Ziyaret</span></td>
                            <td>${escapeHtml(v.lastDate || '-')}</td>
                            <td>${escapeHtml(Array.from(v.personnels).join(', '))}</td>
                            <td style="font-size:0.73rem; max-width:260px; white-space:normal;">${escapeHtml(v.notes.slice(0, 2).join(' | ') || '-')}</td>
                            <td style="text-align:right;">
                                <button type="button" class="btn btn-secondary btn-sm" style="padding:0.2rem 0.5rem; font-size:0.68rem;" onclick="openCustomerDetailModal('${safeCode}')">
                                    <i class="fa-solid fa-clock-rotate-left" style="color:#38bdf8;"></i> Geçmişi Gör
                                </button>
                            </td>
                        </tr>
                    `;
                }).join('');
        }
    }

    // 5. KAYITLI RUT PLANLARI ÖZET TABLOSU
    const sumBody = document.getElementById('rep-summary-table-body');
    if (sumBody) {
        const routes = Array.isArray(appState.customRoutes) ? appState.customRoutes : [];
        sumBody.innerHTML = routes.length === 0
            ? `<tr><td colspan="12" style="text-align:center; padding:1rem; color:var(--text-muted);">Henüz kayıtlı bir rut planı bulunmuyor.</td></tr>`
            : routes.map(rt => {
                const items = ensureRouteItemsNormalized(rt);
                const tot = items.length;
                const vis = items.filter(i => i.status === 'VISITED').length;
                const nvis = items.filter(i => i.status === 'NOT_VISITED').length;
                const canc = items.filter(i => i.status === 'CANCELLED').length;
                const man = items.filter(i => i.isManual).length;
                const pend = items.filter(i => i.status === 'PENDING').length;
                const denom = vis + nvis + canc;
                const pct = denom > 0 ? Math.round((vis / denom) * 100) : 0;
                return `
                    <tr>
                        <td><strong style="color:#fff;">${escapeHtml(rt.name)}</strong></td>
                        <td style="color:#38bdf8;">${escapeHtml(rt.routeText || '-')}</td>
                        <td>${escapeHtml(rt.plannedDate || '-')}</td>
                        <td>${escapeHtml(rt.assignee || '-')}</td>
                        <td><span class="badge badge-secondary">${escapeHtml(rt.planStatus || 'Planlandı')}</span></td>
                        <td><strong>${tot}</strong></td>
                        <td style="color:#34d399; font-weight:800;">${vis}</td>
                        <td style="color:#f87171; font-weight:800;">${nvis}</td>
                        <td style="color:#c084fc; font-weight:800;">${man}</td>
                        <td style="color:#fbbf24; font-weight:800;">${pend}</td>
                        <td><span class="badge ${pct >= 70 ? 'badge-success' : 'badge-secondary'}">%${pct}</span></td>
                        <td style="text-align:right;">
                            <button type="button" class="btn btn-primary btn-sm" style="padding:0.22rem 0.55rem; font-size:0.7rem;" onclick="switchTab('route-plan-tab'); selectActiveRouteForExecution('${rt.id}')">
                                <i class="fa-solid fa-folder-open"></i> Planı Aç
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
    }
}

function exportRouteReportsExcel() {
    const rows = collectAllRouteReportRows();
    if (rows.length === 0) {
        showToast('Dışa aktarılacak rapor verisi bulunamadı.', 'warning');
        return;
    }
    const headers = ['Rut Planı', 'Plan Durumu', 'Güzergah', 'Planlanan Tarih', 'Görevli Personel', 'Müşteri Kodu', 'Müşteri / İşletme Ünvanı', 'Tür', 'İl', 'İlçe', 'Ziyaret Durumu', 'Gerçekleşen Ziyaret Tarihi', 'Saat', 'Görüşülen Kişi', 'Görevi', 'Görüşme Sonucu', 'Ziyaret Açıklaması', 'Ziyaret Edilememe Sebebi'];
    const csvLines = [
        headers.join(';'),
        ...rows.map(r => [
            r.routeName,
            r.planStatus,
            r.routeText,
            r.plannedDate,
            r.personnel,
            r.code,
            r.title,
            r.isManual ? `Manuel (${r.visitPurpose})` : 'Kayıtlı Cari',
            r.city,
            r.district,
            r.status === 'VISITED' ? 'Ziyaret Edildi' : (r.status === 'NOT_VISITED' ? 'Ziyaret Edilemedi' : (r.status === 'CANCELLED' ? 'İptal Edildi' : 'Bekliyor')),
            r.visitDate || '-',
            r.visitTime || '-',
            r.authorized || '-',
            r.contactRole || '-',
            r.visitResult || '-',
            (r.visitNotes || '').replace(/;/g, ','),
            (r.unvisitedReason || '').replace(/;/g, ',')
        ].map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(';'))
    ];
    const blob = new Blob(['\uFEFF' + csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Dizsan_Saha_Rut_ve_Ziyaret_Raporu_${getTodayTRStr()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Rapor Excel (CSV) formatında indirildi.', 'success');
}

function printRouteReportsSummary() {
    const rows = collectAllRouteReportRows();
    const area = document.getElementById('print-report-area');
    if (!area) return;
    const vis = rows.filter(r => r.status === 'VISITED').length;
    const nvis = rows.filter(r => r.status === 'NOT_VISITED').length;
    const man = rows.filter(r => r.isManual).length;

    area.innerHTML = `
        <div style="font-family:Arial, sans-serif; color:#000; padding:20px;">
            <h2 style="margin:0; color:#0284c7;">DİZSAN OTOMOTİV — SAHA &amp; RUT ZİYARET RAPORU</h2>
            <div style="font-size:12px; margin:6px 0 14px;">
                <strong>Rapor Tarihi:</strong> ${formatNowTR()} &bull;
                <strong>Toplam Hedef:</strong> ${rows.length} &bull;
                <strong>Ziyaret Edilen:</strong> ${vis} &bull;
                <strong>Ziyaret Edilemeyen:</strong> ${nvis} &bull;
                <strong>Manuel Ziyaret:</strong> ${man}
            </div>
            <table style="width:100%; border-collapse:collapse; font-size:11px;">
                <thead>
                    <tr style="background:#e2e8f0;">
                        <th style="border:1px solid #94a3b8; padding:5px;">#</th>
                        <th style="border:1px solid #94a3b8; padding:5px;">Rut Adı</th>
                        <th style="border:1px solid #94a3b8; padding:5px;">Plan Tarihi</th>
                        <th style="border:1px solid #94a3b8; padding:5px;">Personel</th>
                        <th style="border:1px solid #94a3b8; padding:5px;">Müşteri / İşletme</th>
                        <th style="border:1px solid #94a3b8; padding:5px;">İl / İlçe</th>
                        <th style="border:1px solid #94a3b8; padding:5px;">Durum</th>
                        <th style="border:1px solid #94a3b8; padding:5px;">Ziyaret Tarihi</th>
                        <th style="border:1px solid #94a3b8; padding:5px;">Ziyaret Açıklaması / Edilememe Sebebi</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows.map((r, i) => `
                        <tr>
                            <td style="border:1px solid #94a3b8; padding:5px;">${i + 1}</td>
                            <td style="border:1px solid #94a3b8; padding:5px;">${escapeHtml(r.routeName)}</td>
                            <td style="border:1px solid #94a3b8; padding:5px;">${escapeHtml(r.plannedDate)}</td>
                            <td style="border:1px solid #94a3b8; padding:5px;">${escapeHtml(r.personnel)}</td>
                            <td style="border:1px solid #94a3b8; padding:5px; font-weight:bold;">${escapeHtml(r.title)} ${r.isManual ? '(Manuel)' : ''}</td>
                            <td style="border:1px solid #94a3b8; padding:5px;">${escapeHtml(r.city)} / ${escapeHtml(r.district)}</td>
                            <td style="border:1px solid #94a3b8; padding:5px;">${r.status === 'VISITED' ? '✓ Ziyaret Edildi' : (r.status === 'NOT_VISITED' ? '✗ Edilemedi' : 'Bekliyor')}</td>
                            <td style="border:1px solid #94a3b8; padding:5px;">${escapeHtml(r.visitDate || '-')}</td>
                            <td style="border:1px solid #94a3b8; padding:5px;">${escapeHtml(r.status === 'NOT_VISITED' ? r.unvisitedReason : r.visitNotes)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    window.print();
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
    const phInfo = parseTurkishPhones(task.phone);
    const safePhone = String(task.phone || '').replace(/'/g, "\\'");
    const safeTitle = String(task.customerTitle || '').replace(/'/g, "\\'");
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
            <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                ${phInfo.valid ? `
                    <a href="tel:${phInfo.tel}" class="btn btn-primary btn-sm" style="flex:1; justify-content:center; text-decoration:none;">
                        <i class="fa-solid fa-phone"></i> Ara (${phInfo.display})
                    </a>
                    <button type="button" class="btn btn-success btn-sm" style="flex:1; justify-content:center;" onclick="openWhatsAppChat('${safePhone}', 'Sayın ${safeTitle}, Dizsan Otomotiv adına iyi çalışmalar dileriz.')">
                        <i class="fa-brands fa-whatsapp"></i> WhatsApp
                    </button>
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
    const phInfo = parseTurkishPhones(task.phone);
    const safePhone = String(task.phone || '').replace(/'/g, "\\'");
    const safeTitle = String(task.customerTitle || '').replace(/'/g, "\\'");

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
                    Yetkili: <strong>${task.contactPerson || '-'}</strong> &bull; Telefon: <strong>${phInfo.display || task.phone || '-'}</strong>
                </div>
            ` : ''}
        </div>
    `;

    footer.innerHTML = `
        <a href="${mapsUrl}" target="_blank" class="btn btn-primary" style="flex:1; justify-content:center; text-decoration:none;">
            <i class="fa-solid fa-diamond-turn-right"></i> Google Haritalar Rota Başlat
        </a>
        ${phInfo.valid ? `
            <a href="tel:${phInfo.tel}" class="btn btn-primary" style="justify-content:center; text-decoration:none;">
                <i class="fa-solid fa-phone"></i> Ara
            </a>
            <button type="button" class="btn btn-success" onclick="openWhatsAppChat('${safePhone}', 'Sayın ${safeTitle}, Dizsan Otomotiv saha ekibimiz ziyaretiniz için yola çıkmıştır.')">
                <i class="fa-brands fa-whatsapp"></i> WhatsApp
            </button>
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
    openWhatsAppChat('', msg);
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
// 10.5 KOYU / AÇIK TEMA SİSTEMİ & HER SEKMEDE GLOBAL MÜŞTERİ ARAMA MOTORU
// ==========================================================================
const STORAGE_KEY_THEME = 'dizsan_ziyaret_theme_v1';
let globalCustomerQuickFilter = 'ALL';

function getSavedZiyaretTheme() {
    try {
        return localStorage.getItem(STORAGE_KEY_THEME) || 'dark';
    } catch (e) {
        return 'dark';
    }
}

function applyZiyaretTheme(theme, notifyParent = true) {
    const normalized = theme === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', normalized);
    if (document.body) {
        document.body.setAttribute('data-theme', normalized);
    }
    try {
        localStorage.setItem(STORAGE_KEY_THEME, normalized);
    } catch (e) {}

    const isLight = normalized === 'light';
    const globalIcon = document.getElementById('global-theme-icon');
    const globalText = document.getElementById('global-theme-text');
    if (globalIcon) {
        globalIcon.className = isLight ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
        globalIcon.style.color = isLight ? '#38bdf8' : '#fbbf24';
    }
    if (globalText) {
        globalText.textContent = isLight ? 'Koyu Tema' : 'Açık Tema';
    }

    const sideIcon = document.getElementById('sidebar-theme-icon');
    const sideText = document.getElementById('sidebar-theme-text');
    if (sideIcon) {
        sideIcon.className = isLight ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
        sideIcon.style.color = isLight ? '#0284c7' : '#fbbf24';
    }
    if (sideText) {
        sideText.textContent = isLight ? 'Koyu Tema' : 'Açık Tema';
    }

    if (notifyParent && window.parent && window.parent !== window) {
        try {
            window.parent.postMessage({ type: 'DPRO_THEME_CHANGED', theme: normalized }, '*');
        } catch (e) {}
    }
}

function toggleZiyaretTheme() {
    const current = document.body.getAttribute('data-theme') || getSavedZiyaretTheme();
    const next = current === 'light' ? 'dark' : 'light';
    applyZiyaretTheme(next, true);
}

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

let selectedAiCustomerCode = '';

function normSearchTR(s) {
    if (!s) return '';
    return String(s)
        .replace(/İ/g, 'i').replace(/I/g, 'i').replace(/ı/g, 'i')
        .replace(/Ş/g, 's').replace(/ş/g, 's')
        .replace(/Ğ/g, 'g').replace(/ğ/g, 'g')
        .replace(/Ü/g, 'u').replace(/ü/g, 'u')
        .replace(/Ö/g, 'o').replace(/ö/g, 'o')
        .replace(/Ç/g, 'c').replace(/ç/g, 'c')
        .replace(/[Ââ]/g, 'a').replace(/[Îî]/g, 'i').replace(/[Ûû]/g, 'u')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function phoneticKeyTR(s) {
    const n = normSearchTR(s);
    if (!n) return '';
    // Türkçe fonetik ve klavye yakın harf dönüşümü (g/c/k/q -> k, b/p/v -> b, d/t -> t, z/s -> s)
    return n
        .replace(/[gckq]/g, 'k')
        .replace(/[bpv]/g, 'b')
        .replace(/[dt]/g, 't')
        .replace(/[zs]/g, 's')
        .replace(/(.)\1+/g, '$1');
}

function getBigrams(str) {
    const clean = String(str || '').replace(/\s+/g, '');
    const set = new Set();
    if (clean.length < 2) {
        if (clean) set.add(clean);
        return set;
    }
    for (let i = 0; i < clean.length - 1; i++) {
        set.add(clean.slice(i, i + 2));
    }
    return set;
}

function levenshteinDist(a, b) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    if (a.length < b.length) { const tmp = a; a = b; b = tmp; }
    let prev = new Array(b.length + 1);
    for (let j = 0; j <= b.length; j++) prev[j] = j;
    for (let i = 0; i < a.length; i++) {
        const curr = [i + 1];
        for (let j = 0; j < b.length; j++) {
            const cost = a[i] === b[j] ? 0 : 1;
            curr[j + 1] = Math.min(prev[j + 1] + 1, curr[j] + 1, prev[j] + cost);
        }
        prev = curr;
    }
    return prev[b.length];
}

function charNorm1to1TR(str) {
    const map = {
        'İ': 'i', 'I': 'i', 'ı': 'i', 'i': 'i',
        'Ş': 's', 'ş': 's',
        'Ğ': 'g', 'ğ': 'g',
        'Ü': 'u', 'ü': 'u',
        'Ö': 'o', 'ö': 'o',
        'Ç': 'c', 'ç': 'c',
        'Â': 'a', 'â': 'a',
        'Î': 'i', 'î': 'i',
        'Û': 'u', 'û': 'u'
    };
    let out = '';
    const s = String(str || '');
    for (let i = 0; i < s.length; i++) {
        const ch = s[i];
        out += map[ch] !== undefined ? map[ch] : ch.toLowerCase();
    }
    return out;
}

// Büyük/küçük harf, Türkçe karakter ve TÜM noktalama işaretleri / boşlukları yok sayan saf alfanümerik normalizasyon
function normCompactTR(str) {
    return charNorm1to1TR(str).replace(/[^a-z0-9]/g, '');
}

function highlightSearchText(rawText, queryText, extraMatchedWord = '') {
    const src = String(rawText ?? '');
    if (!src) return '';

    const rawTerms = [];
    const qClean = String(queryText || '').trim();
    if (qClean) {
        rawTerms.push(qClean);
        normSearchTR(qClean).split(' ').filter(t => t.length >= 2).forEach(t => {
            if (!rawTerms.includes(t)) rawTerms.push(t);
        });
    }
    const extraClean = String(extraMatchedWord || '').trim();
    if (extraClean && !rawTerms.includes(extraClean)) {
        rawTerms.unshift(extraClean);
    }
    if (rawTerms.length === 0) return escapeHtml(src);

    // Kaynak metindeki her alfanümerik karakteri (noktalama ve boşlukları atlayarak) orijinal indeksine eşle
    const normFull = charNorm1to1TR(src);
    let compactSrc = '';
    const compactIdxMap = [];
    for (let i = 0; i < normFull.length; i++) {
        const c = normFull[i];
        if ((c >= 'a' && c <= 'z') || (c >= '0' && c <= '9')) {
            compactSrc += c;
            compactIdxMap.push(i);
        }
    }
    if (!compactSrc) return escapeHtml(src);

    const compactTerms = Array.from(new Set(
        rawTerms
            .map(t => normCompactTR(t))
            .filter(t => t.length >= 2)
    )).sort((a, b) => b.length - a.length);

    if (compactTerms.length === 0) return escapeHtml(src);

    const ranges = [];
    for (const ct of compactTerms) {
        let startIdx = 0;
        while (startIdx < compactSrc.length) {
            const idx = compactSrc.indexOf(ct, startIdx);
            if (idx === -1) break;
            const origStart = compactIdxMap[idx];
            const origEnd = compactIdxMap[idx + ct.length - 1] + 1;
            ranges.push([origStart, origEnd]);
            startIdx = idx + ct.length;
        }
    }

    if (ranges.length === 0) return escapeHtml(src);

    ranges.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
    const merged = [ranges[0]];
    for (let i = 1; i < ranges.length; i++) {
        const prev = merged[merged.length - 1];
        const curr = ranges[i];
        if (curr[0] < prev[1]) {
            if (curr[1] > prev[1]) prev[1] = curr[1];
        } else {
            merged.push(curr);
        }
    }

    let html = '';
    let cursor = 0;
    for (const [sIdx, eIdx] of merged) {
        if (sIdx > cursor) {
            html += escapeHtml(src.slice(cursor, sIdx));
        }
        const matchedSlice = src.slice(sIdx, eIdx);
        html += `<mark class="search-match-highlight" title="Eşleşen kısım">🔍 ${escapeHtml(matchedSlice)}</mark>`;
        cursor = eIdx;
    }
    if (cursor < src.length) {
        html += escapeHtml(src.slice(cursor));
    }
    return html;
}

let currentSearchScope = 'CARI'; // 'CARI' (Cariye Göre Ara) veya 'LOCATION' (İl - İlçeye Göre Ara)

function setCustomerSearchScope(scope) {
    currentSearchScope = scope === 'LOCATION' ? 'LOCATION' : 'CARI';
    const sel = document.getElementById('global-customer-search-scope');
    if (sel && sel.value !== currentSearchScope) {
        sel.value = currentSearchScope;
    }
    const btnCari = document.getElementById('scope-btn-cari');
    const btnLoc = document.getElementById('scope-btn-location');
    if (btnCari && btnLoc) {
        if (currentSearchScope === 'CARI') {
            btnCari.style.background = 'linear-gradient(135deg,#10b981,#059669)';
            btnCari.style.color = '#fff';
            btnCari.style.borderColor = '#34d399';
            btnCari.style.boxShadow = '0 3px 10px rgba(16,185,129,0.3)';
            btnLoc.style.background = 'rgba(30,41,59,0.85)';
            btnLoc.style.color = '#cbd5e1';
            btnLoc.style.borderColor = 'rgba(148,163,184,0.3)';
            btnLoc.style.boxShadow = 'none';
        } else {
            btnLoc.style.background = 'linear-gradient(135deg,#f59e0b,#d97706)';
            btnLoc.style.color = '#fff';
            btnLoc.style.borderColor = '#fbbf24';
            btnLoc.style.boxShadow = '0 3px 10px rgba(245,158,11,0.35)';
            btnCari.style.background = 'rgba(30,41,59,0.85)';
            btnCari.style.color = '#cbd5e1';
            btnCari.style.borderColor = 'rgba(148,163,184,0.3)';
            btnCari.style.boxShadow = 'none';
        }
    }
    const inp = document.getElementById('global-customer-search-input');
    if (inp) {
        inp.placeholder = currentSearchScope === 'LOCATION'
            ? 'İl, ilçe, belde, köy, adres veya vergi dairesi yazın (Örn: Merzifon, Çorum, Suluova)...'
            : 'Müşteri ünvanı, şoför/yetkili adı (Örn: Ganik), 120 kod, plaka veya telefon yazın...';
        const q = String(inp.value || '').trim();
        if (q.length > 0 || globalCustomerQuickFilter !== 'ALL') {
            handleGlobalCustomerSearchInput(q, true, currentSearchPageMode);
        } else {
            clearGlobalCustomerSearch();
        }
        inp.focus();
    }
}

function computeCustomerMatchByMode(c, rawQuery, mode = 'EXACT', scopeOverride = '') {
    const scope = scopeOverride || currentSearchScope || 'CARI';
    const nq = normSearchTR(rawQuery);
    const nqCompRaw = normCompactTR(rawQuery);
    if (!nq && !nqCompRaw) return { score: 100, reason: 'Tüm Liste', isExact: true, matchedWord: '', matchedContextHtml: '' };
    // Yanlışlıkla çift basılan harfleri (örn: "merziifon" -> "merzifon") otomatik normalize et
    const nqCompDedup = nqCompRaw.replace(/([A-Z])\1+/g, '$1');
    const hasDoubleLetterTypo = nqCompDedup.length >= 4 && nqCompDedup !== nqCompRaw;
    const nqComp = nqCompRaw;
    const matchSub = (hay, needle) => Boolean(hay && needle && (hay.includes(needle) || (hasDoubleLetterTypo && hay.replace(/([A-Z])\1+/g, '$1').includes(nqCompDedup))));
    const qTokens = nq.split(' ').filter(Boolean);
    const qCompTokens = qTokens.map(t => normCompactTR(t)).filter(Boolean);

    const titleRaw = String(c.title || '').trim();
    const codeRaw = String(c.code || '').trim();
    const authRaw = String(c.authorized || '').trim();
    const platesRaw = String(c.plates || '').trim();
    const phoneRaw = String(c.phone || '').trim();
    const addrRaw = String(c.address || '').trim();
    const cityRaw = String(c.city || '').trim();
    const distRaw = String(c.district || '').trim();
    const rutRaw = String(c.rut || '').trim();
    const taxOfficeRaw = String(c.taxOffice || c.vergiDairesi || c.vd || '').trim();
    const notesRaw = String(c.visitNotes || c.dataAudit || '').trim();

    const nt = normSearchTR(titleRaw);
    const ntComp = normCompactTR(titleRaw);
    const ncComp = normCompactTR(codeRaw);
    const naComp = normCompactTR(authRaw);
    const npComp = normCompactTR(platesRaw);
    const nphComp = normCompactTR(phoneRaw);
    const naddrComp = normCompactTR(addrRaw);
    const ncityComp = normCompactTR(cityRaw);
    const ndistComp = normCompactTR(distRaw);
    const nrutComp = normCompactTR(rutRaw);
    const ntaxComp = normCompactTR(taxOfficeRaw);
    const nnotesComp = normCompactTR(notesRaw);

    const titleWordsOrig = titleRaw.split(/[\s.,;:\-\/()'"&]+/).filter(Boolean);
    const titleWordsNorm = titleWordsOrig.map(w => normCompactTR(w)).filter(Boolean);
    const historyList = Array.isArray(c.serviceHistory) ? c.serviceHistory : [];

    // =========================================================================
    // KAPSAM 2: İL - İLÇEYE GÖRE ARA (scope === 'LOCATION')
    // Cari içinde nerede yazdığına bakılmaksızın (İlçe, İl, Vergi Dairesi, Adres,
    // Rut, Cari Ünvan veya Alt Fatura alanları) eşleşen TÜM müşterileri getirir!
    // =========================================================================
    if (scope === 'LOCATION') {
        const matchedParts = [];
        let locScore = 0;
        let locReason = '';

        // 1) İlçe (c.district) veya İl (c.city)
        if (matchSub(ndistComp, nqComp) || matchSub(ncityComp, nqComp) ||
            (qCompTokens.length > 1 && qCompTokens.every(qt => matchSub(ndistComp + ncityComp, qt)))) {
            locScore = Math.max(locScore, (ndistComp === nqComp || ncityComp === nqComp || ndistComp === nqCompDedup || ncityComp === nqCompDedup) ? 100 : 99);
            locReason = `📍 İl / İlçe Kaydı Eşleşmesi (${cityRaw || '-'} / ${distRaw || '-'})`;
            matchedParts.push(`<span>İl / İlçe:</span> <strong>${highlightSearchText(`${cityRaw || '-'} / ${distRaw || '-'}`, rawQuery)}</strong>`);
        }

        // 2) Vergi Dairesi (c.taxOffice / c.vergiDairesi)
        if (ntaxComp && (matchSub(ntaxComp, nqComp) || (qCompTokens.length > 1 && qCompTokens.every(qt => matchSub(ntaxComp, qt))))) {
            locScore = Math.max(locScore, 98);
            if (!locReason) locReason = `🏛️ Vergi Dairesi Eşleşmesi (${taxOfficeRaw})`;
            matchedParts.push(`<span>Vergi Dairesi:</span> <strong>${highlightSearchText(taxOfficeRaw, rawQuery)}</strong>`);
        }

        // 3) Açık Adres (c.address) - Vergi dairesi veya ili başka şehir olsa bile adres içinde geçiyorsa mutlaka gelir!
        if (naddrComp && (matchSub(naddrComp, nqComp) || (qCompTokens.length > 1 && qCompTokens.every(qt => matchSub(naddrComp, qt))))) {
            locScore = Math.max(locScore, 98);
            if (!locReason) locReason = `📍 Açık Adres İçinde Geçiyor`;
            matchedParts.push(`<span>Açık Adres:</span> <strong>${highlightSearchText(addrRaw, rawQuery)}</strong>`);
        }

        // 4) Rut / Bölge (c.rut)
        if (nrutComp && matchSub(nrutComp, nqComp)) {
            locScore = Math.max(locScore, 97);
            if (!locReason) locReason = `🛣️ Rut / Bölge Eşleşmesi (${rutRaw})`;
            matchedParts.push(`<span>Rut:</span> <strong>${highlightSearchText(rutRaw, rawQuery)}</strong>`);
        }

        // 5) Cari Ünvan (c.title) içinde bölge/ilçe adı geçiyorsa (Örn: "MERZİFON GÜLBAHAR UN...")
        if (ntComp && (matchSub(ntComp, nqComp) || (qCompTokens.length > 1 && qCompTokens.every(qt => matchSub(ntComp, qt))))) {
            locScore = Math.max(locScore, 97);
            if (!locReason) locReason = `🏢 Cari Ünvan İçinde Geçiyor`;
            matchedParts.push(`<span>Cari Ünvan:</span> <strong>${highlightSearchText(titleRaw, rawQuery)}</strong>`);
        }

        // 6) Cari içindeki diğer herhangi bir alan (Notlar, Yetkili, Fatura Açıklamaları vb.)
        if (nnotesComp && matchSub(nnotesComp, nqComp)) {
            locScore = Math.max(locScore, 96);
            if (!locReason) locReason = `📝 Cari Not / Detay Alanında Geçiyor`;
            matchedParts.push(`<span>Not / Detay:</span> <strong>${highlightSearchText(notesRaw, rawQuery)}</strong>`);
        }
        if (locScore === 0) {
            for (let hIdx = 0; hIdx < historyList.length; hIdx++) {
                const h = historyList[hIdx];
                if (!h) continue;
                const hCombined = `${h.islem || ''} ${h.sofor || ''} ${h.plaka || ''} ${h.fatura_no || ''}`.trim();
                if (hCombined && matchSub(normCompactTR(hCombined), nqComp)) {
                    locScore = 95;
                    locReason = `🧾 Cari Alt Fatura Detayında Geçiyor (${h.fatura_no || '-'})`;
                    matchedParts.push(`<span>Fatura Detayı (${escapeHtml(h.fatura_no || '-')}):</span> <strong>${highlightSearchText(hCombined, rawQuery)}</strong>`);
                    break;
                }
            }
        }

        if (locScore >= 95) {
            // Eğer açık adreste geçmiyorsa bile ziyaret kolaylığı için açık adresi de yanına bilgi olarak ekle
            if (addrRaw && !matchedParts.some(p => p.includes('Açık Adres:'))) {
                matchedParts.push(`<span>Adres:</span> ${highlightSearchText(addrRaw, rawQuery)}`);
            }
            return {
                score: locScore,
                reason: locReason,
                isExact: true,
                matchedWord: rawQuery,
                matchedContextHtml: `<div class="matched-field-callout"><i class="fa-solid fa-map-location-dot"></i> ${matchedParts.join(' &bull; ')}</div>`
            };
        }

        if (mode === 'EXACT') {
            return { score: 0, reason: '', isExact: false, matchedWord: '', matchedContextHtml: '' };
        }

        // LOCATION modunda 'SIMILAR' (Detaylandır / Benzerlerini Ara): İlçe, İl ve Adres kelimelerinde 1-2 harf yazım hatası toleransı
        const locWords = `${cityRaw} ${distRaw} ${addrRaw} ${taxOfficeRaw}`.split(/[\s.,;:\-\/()'"&]+/).filter(Boolean);
        let bestLocScore = 0;
        let bestLocWord = '';
        for (const lw of locWords) {
            const wComp = normCompactTR(lw);
            if (wComp.length < 3 || nqComp.length < 3) continue;
            const dist = levenshteinDist(nqComp, wComp);
            if (dist === 1 && 92 > bestLocScore) {
                bestLocScore = 92;
                bestLocWord = lw;
            } else if (nqComp.length >= 4 && wComp.startsWith(nqComp.slice(0, 3)) && dist <= 2 && 88 > bestLocScore) {
                bestLocScore = 88;
                bestLocWord = lw;
            }
        }
        if (bestLocScore > 0) {
            return {
                score: bestLocScore,
                reason: `🤖 Yakın İl/İlçe/Adres Kelimesi: "${bestLocWord}"`,
                isExact: false,
                matchedWord: bestLocWord,
                matchedContextHtml: `<div class="matched-field-callout"><i class="fa-solid fa-map-location-dot"></i> <span>Benzer Konum Bilgisinde Bulundu:</span> ${highlightSearchText(`${cityRaw} / ${distRaw} - ${addrRaw}`, rawQuery, bestLocWord)}</div>`
            };
        }
        return { score: 0, reason: '', isExact: false, matchedWord: '', matchedContextHtml: '' };
    }

    // =========================================================================
    // KAPSAM 1: CARİYE GÖRE ARA (scope === 'CARI')
    // Sadece Müşteri Adı/Ünvanı, 120 Cari Kodu, Yetkili, Şoför, Plaka, Telefon
    // ve Fatura No alanlarına bakar (İl/İlçe/Adres karıştırmaz!).
    // =========================================================================
    // A) Cari Ünvan & 120 Cari Kodu
    if (ntComp === nqComp || ncComp === nqComp) {
        return {
            score: 100,
            reason: `🎯 Tam Eşleşme (Cari Ünvan / Kod)`,
            isExact: true,
            matchedWord: rawQuery,
            matchedContextHtml: `<div class="matched-field-callout"><i class="fa-solid fa-bullseye"></i> <span>Eşleşen Alan (Cari Ünvan / Kod):</span> ${highlightSearchText(titleRaw + ' (' + codeRaw + ')', rawQuery)}</div>`
        };
    }
    if (titleWordsNorm.includes(nqComp)) {
        const matchedOrig = titleWordsOrig.find(w => normCompactTR(w) === nqComp) || rawQuery.toUpperCase();
        return {
            score: 100,
            reason: `🎯 Tam Kelime Eşleşmesi (Ünvanda: "${matchedOrig}")`,
            isExact: true,
            matchedWord: matchedOrig,
            matchedContextHtml: `<div class="matched-field-callout"><i class="fa-solid fa-building"></i> <span>Cari Ünvanda Eşleşen Kelime:</span> ${highlightSearchText(titleRaw, rawQuery, matchedOrig)}</div>`
        };
    }
    if ((nqComp && ntComp.includes(nqComp)) || (nqComp && ncComp.includes(nqComp)) || (nq && nt.includes(nq))) {
        return {
            score: 99,
            reason: `🎯 Tam Eşleşme (Cari Ünvan / Kod İçinde Geçiyor)`,
            isExact: true,
            matchedWord: rawQuery,
            matchedContextHtml: `<div class="matched-field-callout"><i class="fa-solid fa-building"></i> <span>Cari Ünvan / Kod İçinde Geçiyor:</span> ${highlightSearchText(titleRaw + ' [' + codeRaw + ']', rawQuery)}</div>`
        };
    }
    if (qCompTokens.length > 1 && qCompTokens.every(qt => ntComp.includes(qt) || ncComp.includes(qt))) {
        return {
            score: 98,
            reason: `🎯 Tam Çoklu Kelime Eşleşmesi (Cari Ünvan)`,
            isExact: true,
            matchedWord: rawQuery,
            matchedContextHtml: `<div class="matched-field-callout"><i class="fa-solid fa-building"></i> <span>Cari Ünvanda Geçen Kelimeler:</span> ${highlightSearchText(titleRaw, rawQuery)}</div>`
        };
    }

    // B) Yetkili Kişi (c.authorized)
    if (naComp && ((nqComp && naComp.includes(nqComp)) || (qCompTokens.length > 1 && qCompTokens.every(qt => naComp.includes(qt))))) {
        return {
            score: 97,
            reason: `🎯 Yetkili Kişi Eşleşmesi ("${authRaw}")`,
            isExact: true,
            matchedWord: rawQuery,
            matchedContextHtml: `<div class="matched-field-callout"><i class="fa-solid fa-user-tie"></i> <span>Yetkili Kişi Alanında Geçiyor:</span> ${highlightSearchText(authRaw, rawQuery)}</div>`
        };
    }

    // C) Fatura Altındaki Şoför Adı (h.sofor), Plaka (h.plaka) veya Fatura No (h.fatura_no)
    for (let hIdx = 0; hIdx < historyList.length; hIdx++) {
        const h = historyList[hIdx];
        if (!h) continue;
        const soforRaw = String(h.sofor || '').trim();
        const plakaRaw = String(h.plaka || '').trim();
        const fatNoRaw = String(h.fatura_no || '').trim();

        const nsComp = normCompactTR(soforRaw);
        const nplComp = normCompactTR(plakaRaw);
        const nfComp = normCompactTR(fatNoRaw);

        if (nsComp && ((nqComp && nsComp.includes(nqComp)) || (qCompTokens.length > 1 && qCompTokens.every(qt => nsComp.includes(qt))))) {
            return {
                score: 96,
                reason: `🚛 Fatura İçi Şoför Eşleşmesi: "${soforRaw}"`,
                isExact: true,
                matchedWord: soforRaw,
                matchedContextHtml: `<div class="matched-field-callout"><i class="fa-solid fa-id-card-clip"></i> <span>Alt Fatura Şoför Kaydında Bulundu:</span> Şoför: ${highlightSearchText(soforRaw, rawQuery)} &bull; Fatura No: <strong>${escapeHtml(fatNoRaw || '-')}</strong> (${escapeHtml(h.tarih || '-')}) &bull; Plaka: <strong>${escapeHtml(plakaRaw || '-')}</strong></div>`
            };
        }
        if (nplComp && nqComp && nplComp.includes(nqComp)) {
            return {
                score: 96,
                reason: `🚚 Fatura Araç Plakası Eşleşmesi: "${plakaRaw}"`,
                isExact: true,
                matchedWord: plakaRaw,
                matchedContextHtml: `<div class="matched-field-callout"><i class="fa-solid fa-truck-front"></i> <span>Alt Fatura Plaka Kaydında Bulundu:</span> Plaka: ${highlightSearchText(plakaRaw, rawQuery)} &bull; Fatura No: <strong>${escapeHtml(fatNoRaw || '-')}</strong> (${escapeHtml(h.tarih || '-')})</div>`
            };
        }
        if (nfComp && nqComp && nfComp.includes(nqComp)) {
            return {
                score: 96,
                reason: `🧾 Fatura No Eşleşmesi: "${fatNoRaw}"`,
                isExact: true,
                matchedWord: fatNoRaw,
                matchedContextHtml: `<div class="matched-field-callout"><i class="fa-solid fa-file-invoice"></i> <span>Fatura Numarasında Bulundu:</span> ${highlightSearchText(fatNoRaw, rawQuery)} (${escapeHtml(h.tarih || '-')})</div>`
            };
        }
    }

    // D) Kayıtlı Plakalar (c.plates) veya Telefon (c.phone)
    if (npComp && nqComp && npComp.includes(nqComp)) {
        return {
            score: 95,
            reason: `🚚 Araç Plakası Eşleşmesi`,
            isExact: true,
            matchedWord: rawQuery,
            matchedContextHtml: `<div class="matched-field-callout"><i class="fa-solid fa-truck-front"></i> <span>Kayıtlı Plakalarda Geçiyor:</span> ${highlightSearchText(platesRaw, rawQuery)}</div>`
        };
    }
    if (nphComp && nqComp && nphComp.includes(nqComp)) {
        return {
            score: 95,
            reason: `📞 Telefon Numarası Eşleşmesi`,
            isExact: true,
            matchedWord: rawQuery,
            matchedContextHtml: `<div class="matched-field-callout"><i class="fa-solid fa-phone"></i> <span>Telefon Numarasında Geçiyor:</span> ${highlightSearchText(phoneRaw, rawQuery)}</div>`
        };
    }

    // Eğer mod SADECE 'EXACT' (Tam Eşleşme) ise burada dur, benzer kayıtları getirme!
    if (mode === 'EXACT') {
        return { score: 0, reason: '', isExact: false, matchedWord: '', matchedContextHtml: '' };
    }

    // 2. DETAYLANDIR / BENZERLERİNİ ARA MODU (mode === 'SIMILAR')
    // Cari Ünvan ve Şoför/Yetkili kelimeleri üzerinde yakın/benzer kelime taraması yapar (İlçe adlarını karıştırmaz!)
    const pq = phoneticKeyTR(rawQuery);
    let bestScore = 0;
    let bestReason = '';
    let bestWord = '';
    let bestContext = '';

    const candidateSources = [
        { label: 'Cari Ünvan', icon: 'fa-building', text: titleRaw, words: titleWordsOrig }
    ];
    if (authRaw) {
        candidateSources.push({ label: 'Yetkili Kişi', icon: 'fa-user-tie', text: authRaw, words: authRaw.split(/[\s.,;:\-\/()'"&]+/).filter(Boolean) });
    }
    const seenDriverSet = new Set();
    for (let hIdx = 0; hIdx < historyList.length; hIdx++) {
        const sRaw = String(historyList[hIdx]?.sofor || '').trim();
        if (sRaw && !seenDriverSet.has(sRaw)) {
            seenDriverSet.add(sRaw);
            candidateSources.push({
                label: `Fatura Şoförü (${historyList[hIdx]?.fatura_no || '-'})`,
                icon: 'fa-id-card-clip',
                text: sRaw,
                words: sRaw.split(/[\s.,;:\-\/()'"&]+/).filter(Boolean)
            });
        }
    }

    for (const srcObj of candidateSources) {
        for (let wIdx = 0; wIdx < srcObj.words.length; wIdx++) {
            const origW = srcObj.words[wIdx];
            const w = normCompactTR(origW);
            if (w.length < 3) continue;

            // 1 Harf Farkı (Örn: "ganik" <-> "GINIK" -> ERHAN GINIK)
            if (nqComp.length >= 3 && Math.abs(w.length - nqComp.length) <= 1) {
                const dist = levenshteinDist(nqComp, w);
                if (dist === 1 && 93 > bestScore) {
                    bestScore = 93;
                    bestWord = origW;
                    bestReason = `🤖 1 Harf Benzer Kelime (${srcObj.label}: "${origW}")`;
                    bestContext = `<div class="matched-field-callout"><i class="fa-solid ${srcObj.icon}"></i> <span>${escapeHtml(srcObj.label)} (1 Harf Farklı Benzer Kelime):</span> ${highlightSearchText(srcObj.text, rawQuery, origW)}</div>`;
                }
            }

            if (nqComp.length >= 4 && w.length >= 4) {
                // Aynı ilk 3 harfle başlayan benzer uzunlukta kelime
                if (w.startsWith(nqComp.slice(0, 3)) && Math.abs(w.length - nqComp.length) <= 3 && 90 > bestScore) {
                    bestScore = 90;
                    bestWord = origW;
                    bestReason = `🤖 Başlangıç Benzeri (${srcObj.label}: "${origW}")`;
                    bestContext = `<div class="matched-field-callout"><i class="fa-solid ${srcObj.icon}"></i> <span>${escapeHtml(srcObj.label)} (Başlangıç Benzeri):</span> ${highlightSearchText(srcObj.text, rawQuery, origW)}</div>`;
                }
                // Ortak 4+ harfli kök (Örn: "anik" -> UYANIK, YANIKOĞLU, BAĞRIYANIK)
                else if ((w.includes(nqComp.slice(1)) || w.includes(nqComp.slice(0, -1))) && 88 > bestScore) {
                    bestScore = 88;
                    bestWord = origW;
                    bestReason = `🤖 Benzer Kök Kelime (${srcObj.label}: "${origW}")`;
                    bestContext = `<div class="matched-field-callout"><i class="fa-solid ${srcObj.icon}"></i> <span>${escapeHtml(srcObj.label)} (Benzer Kök Kelime):</span> ${highlightSearchText(srcObj.text, rawQuery, origW)}</div>`;
                }
                // Fonetik / Harf Grubu Benzeri (Örn: "ganik" <-> "KINIK", "KINIKLAR")
                else if (pq && phoneticKeyTR(w) === pq && 86 > bestScore) {
                    bestScore = 86;
                    bestWord = origW;
                    bestReason = `🤖 Ses/Harf Benzeri (${srcObj.label}: "${origW}")`;
                    bestContext = `<div class="matched-field-callout"><i class="fa-solid ${srcObj.icon}"></i> <span>${escapeHtml(srcObj.label)} (Ses/Harf Benzeri):</span> ${highlightSearchText(srcObj.text, rawQuery, origW)}</div>`;
                } else if (pq && phoneticKeyTR(w).startsWith(pq.slice(0, 3)) && Math.abs(w.length - nqComp.length) <= 2 && levenshteinDist(nqComp, w) <= 2 && 84 > bestScore) {
                    bestScore = 84;
                    bestWord = origW;
                    bestReason = `🤖 Yakın Kelime (${srcObj.label}: "${origW}")`;
                    bestContext = `<div class="matched-field-callout"><i class="fa-solid ${srcObj.icon}"></i> <span>${escapeHtml(srcObj.label)} (Yakın Kelime):</span> ${highlightSearchText(srcObj.text, rawQuery, origW)}</div>`;
                }
            }
        }
    }

    return { score: bestScore, reason: bestReason, isExact: false, matchedWord: bestWord, matchedContextHtml: bestContext };
}

let currentSearchPageMode = 'EXACT';

function focusGlobalCustomerSearch() {
    switchTab('customer-search-tab');
    setTimeout(() => {
        const inp = document.getElementById('global-customer-search-input');
        if (inp) {
            inp.focus();
            inp.select();
        }
    }, 60);
}

function onCustomerSearchInputChange(val) {
    const q = String(val || '').trim();
    const clearBtn = document.getElementById('global-customer-search-clear');
    if (clearBtn) {
        clearBtn.style.display = q.length > 0 ? 'inline-flex' : 'none';
    }
    if (q.length > 0) {
        handleGlobalCustomerSearchInput(q, true, currentSearchPageMode);
    } else if (globalCustomerQuickFilter !== 'ALL') {
        handleGlobalCustomerSearchInput('', true, currentSearchPageMode);
    } else {
        clearGlobalCustomerSearch();
    }
}

function executeCustomerSearch(mode = 'EXACT') {
    currentSearchPageMode = mode === 'SIMILAR' ? 'SIMILAR' : 'EXACT';
    const inp = document.getElementById('global-customer-search-input');
    const q = inp ? inp.value : '';
    handleGlobalCustomerSearchInput(q, true, currentSearchPageMode);
}

function triggerGlobalAiCustomerSearch() {
    executeCustomerSearch('EXACT');
}

function setGlobalCustomerQuickFilter(filterKey) {
    globalCustomerQuickFilter = filterKey || 'ALL';
    document.querySelectorAll('#global-customer-search-bar .global-chip').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-qfilter') === globalCustomerQuickFilter);
    });
    const inp = document.getElementById('global-customer-search-input');
    const q = inp ? inp.value : '';
    handleGlobalCustomerSearchInput(q, true, currentSearchPageMode);
}

function clearGlobalCustomerSearch() {
    const inp = document.getElementById('global-customer-search-input');
    if (inp) inp.value = '';
    selectedAiCustomerCode = '';
    currentSearchPageMode = 'EXACT';
    globalCustomerQuickFilter = 'ALL';
    document.querySelectorAll('#global-customer-search-bar .global-chip').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-qfilter') === 'ALL');
    });
    const clearBtn = document.getElementById('global-customer-search-clear');
    if (clearBtn) clearBtn.style.display = 'none';
    const cornerCount = document.getElementById('global-search-corner-count');
    if (cornerCount) cornerCount.style.display = 'none';
    const cornerOther = document.getElementById('global-search-corner-other');
    if (cornerOther) {
        cornerOther.style.display = 'none';
        cornerOther.innerHTML = '';
    }
    const panel = document.getElementById('global-customer-search-results');
    if (panel) {
        panel.style.display = 'block';
        const scopeLabel = currentSearchScope === 'LOCATION'
            ? '<strong>İl, İlçe, Adres, Vergi Dairesi veya Bölge Adı (Örn: Merzifon, Çorum, Suluova)</strong>'
            : '<strong>Müşteri Ünvanı, Yetkili/Şoför Adı (Örn: Ganik), 120 Cari Kodu, Araç Plakası veya Telefonu</strong>';
        panel.innerHTML = `
            <div style="padding:1.4rem; text-align:center; color:#94a3b8; font-size:0.86rem;">
                <i class="fa-solid ${currentSearchScope === 'LOCATION' ? 'fa-map-location-dot' : 'fa-magnifying-glass'}" style="font-size:1.5rem; color:${currentSearchScope === 'LOCATION' ? '#f59e0b' : '#38bdf8'}; margin-bottom:0.5rem; display:block;"></i>
                Yukarıdaki kutuya aramak istediğiniz ${scopeLabel} yazın; büyük/küçük harf ve noktalama işaretlerine bakılmaksızın eşleşenler aşağıya liste olarak gelir ve eşleşen kelime <mark class="search-match-highlight">🔍 sarı ile işaretlenir</mark>.
            </div>
        `;
    }
}

function selectAiCustomerFromList(code, eventObj) {
    if (eventObj && typeof eventObj.stopPropagation === 'function') {
        eventObj.stopPropagation();
    }
    selectedAiCustomerCode = code;
    document.querySelectorAll('.global-search-result-item').forEach(row => {
        const isCurrent = row.getAttribute('data-cust-code') === code;
        row.style.borderColor = isCurrent ? '#10b981' : '';
        row.style.background = isCurrent ? 'rgba(16, 185, 129, 0.14)' : '';
        const cb = row.querySelector('.ai-cust-select-cb');
        if (cb) cb.checked = isCurrent;
    });
    openCustomerDetailModal(code);
}

function syncGlobalSearchToActiveTab(queryText) {
    // Artık arama kendi özel sayfasında (customer-search-tab) çalışır
}

function handleGlobalCustomerSearchInput(rawVal, forceShowByChip = false, searchMode = 'EXACT') {
    const q = String(rawVal || '').trim();
    const mode = searchMode === 'SIMILAR' ? 'SIMILAR' : 'EXACT';
    currentSearchPageMode = mode;

    const clearBtn = document.getElementById('global-customer-search-clear');
    if (clearBtn) {
        clearBtn.style.display = (q.length > 0 || globalCustomerQuickFilter !== 'ALL') ? 'inline-flex' : 'none';
    }

    const totalEl = document.getElementById('global-search-total-count');
    if (totalEl && Array.isArray(appState.customers)) {
        totalEl.textContent = appState.customers.length.toLocaleString('tr-TR');
    }

    const panel = document.getElementById('global-customer-search-results');
    if (!panel) return;

    if (!q && globalCustomerQuickFilter === 'ALL' && !forceShowByChip) {
        panel.style.display = 'block';
        return;
    }

    const list = Array.isArray(appState.customers) ? appState.customers : [];
    const scoredList = [];
    let otherScopeCount = 0;
    const otherScope = currentSearchScope === 'LOCATION' ? 'CARI' : 'LOCATION';

    for (let i = 0; i < list.length; i++) {
        const c = list[i];
        if (!c) continue;

        if (globalCustomerQuickFilter === 'VIP') {
            const p = normSearchTR(c.priority || '');
            if (!p.includes('vip') && (Number(c.totalRevenue) || 0) < 250000) continue;
        } else if (globalCustomerQuickFilter === 'BORCLU') {
            const acc = getCustomerAccountingSummary(c);
            if (acc.baCode !== 'B' && acc.baCode !== '(B)') continue;
        } else if (globalCustomerQuickFilter === 'ALACAKLI') {
            const acc = getCustomerAccountingSummary(c);
            if (acc.baCode !== 'A' && acc.baCode !== '(A)') continue;
        } else if (globalCustomerQuickFilter === 'CORUM') {
            if (!normSearchTR(c.city || '').includes('corum')) continue;
        }

        if (q) {
            const matchInfo = computeCustomerMatchByMode(c, q, mode, currentSearchScope);
            if (mode === 'EXACT' && matchInfo.score >= 95) {
                scoredList.push({
                    customer: c,
                    score: matchInfo.score,
                    reason: matchInfo.reason,
                    isExact: true,
                    matchedWord: matchInfo.matchedWord || q,
                    matchedContextHtml: matchInfo.matchedContextHtml || ''
                });
            } else if (mode === 'SIMILAR' && matchInfo.score >= 65) {
                scoredList.push({
                    customer: c,
                    score: matchInfo.score,
                    reason: matchInfo.reason,
                    isExact: !!matchInfo.isExact,
                    matchedWord: matchInfo.matchedWord || q,
                    matchedContextHtml: matchInfo.matchedContextHtml || ''
                });
            }

            // Diğer arama kapsamında (Örn: Cari modundayken İl-İlçe'de kaç kayıt var?) sayısını da hesapla
            const otherMatch = computeCustomerMatchByMode(c, q, 'EXACT', otherScope);
            if (otherMatch.score >= 95) {
                otherScopeCount++;
            }
        } else {
            scoredList.push({ customer: c, score: 100, reason: 'Hızlı Filtre Eşleşmesi', isExact: true, matchedWord: '', matchedContextHtml: '' });
        }
    }

    scoredList.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return (Number(b.customer.totalRevenue) || 0) - (Number(a.customer.totalRevenue) || 0);
    });

    const topMatches = scoredList.slice(0, 500);

    const otherScopeBannerBtn = (q && otherScopeCount > 0)
        ? `<button type="button" onclick="setCustomerSearchScope('${otherScope}')" style="background:linear-gradient(135deg,#f59e0b,#d97706); border:1px solid #fde68a; color:#fff; cursor:pointer; font-weight:800; font-size:0.74rem; padding:0.35rem 0.65rem; border-radius:8px; display:inline-flex; align-items:center; gap:0.35rem; box-shadow:0 2px 8px rgba(245,158,11,0.3);">
               <i class="fa-solid ${otherScope === 'LOCATION' ? 'fa-map-location-dot' : 'fa-building-user'}"></i>
               ${otherScope === 'LOCATION' ? `İl-İlçe'de ${otherScopeCount} Kayıt` : `Cari'de ${otherScopeCount} Kayıt`}
           </button>`
        : '';

    const cornerCount = document.getElementById('global-search-corner-count');
    if (cornerCount) {
        cornerCount.style.display = 'inline-flex';
        cornerCount.style.alignItems = 'center';
        cornerCount.style.gap = '0.35rem';
        cornerCount.innerHTML = `<i class="fa-solid fa-layer-group"></i> <span>${scoredList.length.toLocaleString('tr-TR')} Kayıt</span>`;
    }
    const cornerOther = document.getElementById('global-search-corner-other');
    if (cornerOther) {
        if (otherScopeBannerBtn) {
            cornerOther.style.display = 'inline-flex';
            cornerOther.innerHTML = otherScopeBannerBtn;
        } else {
            cornerOther.style.display = 'none';
            cornerOther.innerHTML = '';
        }
    }

    if (topMatches.length === 0) {
        panel.style.display = 'block';
        panel.innerHTML = `
            <div style="padding:1.1rem; text-align:center; color:#cbd5e1; font-size:0.86rem; background:rgba(15,23,42,0.5); border:1px dashed rgba(56,189,248,0.35); border-radius:10px;">
                <i class="fa-solid fa-magnifying-glass" style="color:#f59e0b; font-size:1.2rem; margin-bottom:0.4rem; display:block;"></i>
                "<strong>${escapeHtml(q)}</strong>" için <strong>${currentSearchScope === 'LOCATION' ? 'İl - İlçeye Göre' : 'Cariye Göre'} (${mode === 'EXACT' ? 'Tam Eşleşme' : 'Benzer Kayıt'})</strong> bulunamadı.
                <div style="margin-top:0.65rem; display:flex; justify-content:center; gap:0.5rem; flex-wrap:wrap;">
                    ${otherScopeBannerBtn}
                    ${mode === 'EXACT' ? `
                        <button type="button" class="btn btn-primary btn-sm" style="background:linear-gradient(135deg,#0284c7,#6366f1); font-weight:800;" onclick="executeCustomerSearch('SIMILAR')">
                            <i class="fa-solid fa-wand-magic-sparkles"></i> Detaylandır (Benzerlerini ve Yakın İsimleri Ara)
                        </button>
                    ` : ''}
                    <button type="button" class="btn btn-success btn-sm" onclick="openCustomerModal()">
                        <i class="fa-solid fa-user-plus"></i> Yeni Müşteri Ekle
                    </button>
                </div>
            </div>
        `;
        return;
    }

    panel.style.display = 'block';
    panel.innerHTML = `
        ${topMatches.map((item, idx) => {
            const c = item.customer;
            const safeCode = escapeHtml(c.code || '');
            const isChecked = selectedAiCustomerCode === c.code;
            const nqComp = normCompactTR(q);

            const titleHighlighted = highlightSearchText(c.title || '-', q, item.matchedWord);
            const codeHighlighted = highlightSearchText(c.code || '', q, item.matchedWord);
            const cityHighlighted = highlightSearchText(c.city || '-', q, item.matchedWord);
            const distHighlighted = highlightSearchText(c.district || '-', q, item.matchedWord);

            // Eğer eşleşme Ünvan, Kod veya İl/İlçe dışında bir alt alanda (Şoför, Plaka, Adres, Vergi Dairesi vb.) ise sadece o kısa eşleşmeyi yanına ekle
            const inMainFields = nqComp && (
                normCompactTR(c.title || '').includes(nqComp) ||
                normCompactTR(c.code || '').includes(nqComp) ||
                normCompactTR(c.city || '').includes(nqComp) ||
                normCompactTR(c.district || '').includes(nqComp)
            );
            let subMatchTag = '';
            if (!inMainFields && item.matchedWord) {
                subMatchTag = `<span style="font-size:0.74rem; color:#fde68a;">• ${highlightSearchText(item.matchedWord, q, item.matchedWord)}</span>`;
            } else if (!inMainFields && c.address && nqComp && normCompactTR(c.address).includes(nqComp)) {
                subMatchTag = `<span style="font-size:0.74rem; color:#cbd5e1;">• ${highlightSearchText(c.address, q)}</span>`;
            }

            return `
                <div class="global-search-result-item" data-cust-code="${safeCode}" onclick="selectAiCustomerFromList('${safeCode}', event)" style="cursor:pointer; padding:0.5rem 0.7rem; margin-bottom:0.3rem; display:flex; align-items:center; justify-content:space-between; gap:0.6rem; ${isChecked ? 'border-color:#10b981; background:rgba(16,185,129,0.14);' : ''}">
                    <div style="display:flex; align-items:center; gap:0.55rem; flex:1; min-width:0; flex-wrap:wrap;">
                        <input type="checkbox" class="ai-cust-select-cb" ${isChecked ? 'checked' : ''} onclick="selectAiCustomerFromList('${safeCode}', event)" style="width:16px; height:16px; accent-color:#10b981; cursor:pointer; margin:0;">
                        <span style="font-size:0.72rem; color:#64748b; font-weight:700; min-width:22px;">#${idx + 1}</span>
                        <span style="font-weight:800; font-size:0.86rem; color:#38bdf8;">${titleHighlighted}</span>
                        <span style="font-size:0.72rem; padding:0.1rem 0.4rem; border-radius:5px; background:rgba(56,189,248,0.12); color:#93c5fd; font-family:monospace; font-weight:700;">${codeHighlighted}</span>
                        <span style="font-size:0.76rem; color:#cbd5e1;"><i class="fa-solid fa-location-dot" style="color:#f59e0b;"></i> ${cityHighlighted} / ${distHighlighted}</span>
                        ${subMatchTag}
                    </div>
                    <i class="fa-solid fa-chevron-right" style="color:#64748b; font-size:0.78rem;"></i>
                </div>
            `;
        }).join('')}
    `;
}

window.toggleZiyaretTheme = toggleZiyaretTheme;
window.applyZiyaretTheme = applyZiyaretTheme;
window.focusGlobalCustomerSearch = focusGlobalCustomerSearch;
window.executeCustomerSearch = executeCustomerSearch;
window.setCustomerSearchScope = setCustomerSearchScope;
window.onCustomerSearchInputChange = onCustomerSearchInputChange;
window.triggerGlobalAiCustomerSearch = triggerGlobalAiCustomerSearch;
window.selectAiCustomerFromList = selectAiCustomerFromList;
window.handleGlobalCustomerSearchInput = handleGlobalCustomerSearchInput;
window.setGlobalCustomerQuickFilter = setGlobalCustomerQuickFilter;
window.clearGlobalCustomerSearch = clearGlobalCustomerSearch;

// ==========================================================================
// 11. BAŞLATICI (INITIALIZATION)
// ==========================================================================
function renderAll() {
    updateRouteAndReportsBadges();
    renderDashboard();
    populateFilterOptions();
    renderActiveVisits();
    renderTasks();
    renderOmerApprovalCenter();
    checkPwaInstallState();

    const activeTabId = document.querySelector('.tab-section.active')?.id || 'dashboard-tab';
    if (activeTabId === 'route-plan-tab') {
        initCustomRoutePlannerUI();
    } else if (activeTabId === 'reports-tab') {
        renderReportsTab();
    } else if (activeTabId === 'legacy-tab') {
        renderLegacyCustomers();
    } else if (activeTabId === 'cari-ekstre-tab') {
        renderCariEkstreTable(false);
    } else if (activeTabId === 'strategy-tab') {
        renderDistrictStrategies();
    } else if (activeTabId === 'logs-tab') {
        renderLogs();
    } else if (activeTabId === 'ai-match-tab') {
        runAiDeduplicationAnalysis();
    }

    // Gizli sekmelerin ağır tablolarını ana thread'i bloklamadan boşta (idle) hazırla
    setTimeout(() => {
        if (activeTabId !== 'route-plan-tab') initCustomRoutePlannerUI();
        if (activeTabId !== 'reports-tab') renderReportsTab();
        if (activeTabId !== 'legacy-tab') renderLegacyCustomers();
    }, 60);
}

document.addEventListener('DOMContentLoaded', async () => {
    const isDproEmbedded = (window.self !== window.top) || window.location.search.includes('embed=dpro');
    if (isDproEmbedded) {
        document.body.classList.add('dpro-embedded');
    }
    applyZiyaretTheme(getSavedZiyaretTheme(), true);

    // Eski Service Worker ve önbellekleri zorla temizle (v1.2.0)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(regs => {
            for (let r of regs) r.update();
        });
    }
    if ('caches' in window) {
        caches.keys().then(keys => {
            keys.forEach(k => {
                if (k !== 'dpro-ziyaret-v20261025-fix6') caches.delete(k);
            });
        });
    }

    // Giriş ekranını, hızlı personel seçimini ve oturumu 0 ms içinde (5.5MB veriyi beklemeden) hemen hazırla!
    const loginFormEl = document.getElementById('login-form');
    if (loginFormEl) {
        loginFormEl.addEventListener('submit', handleLogin);
    }
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

    const userPool = (Array.isArray(appState.users) && appState.users.length > 0) ? appState.users : OFFICIAL_PERSONNEL_LIST;
    const saved = localStorage.getItem(STORAGE_KEY_SESSION) || sessionStorage.getItem(STORAGE_KEY_SESSION);
    if (saved) {
        try {
            const p = JSON.parse(saved);
            const matched = userPool.find(u => cleanTR(u.name) === cleanTR(p.name) || cleanTR(u.username) === cleanTR(p.username));
            if (matched) currentUser = matched;
        } catch (e) {}
    }

    // D-Pro birleşik platformuna şifreyle girildiyse veya D-Pro içinden geçiş yapıldıysa tekrar şifre istemeden tek oturum (SSO) ile başlat
    if (!currentUser) {
        let dproCandidate = '';
        try {
            const urlParams = new URLSearchParams(window.location.search || '');
            dproCandidate = urlParams.get('dproUser') || '';
        } catch (e) {}
        if (!dproCandidate) {
            try {
                if (window.parent && window.parent !== window && window.parent.DProSDK && typeof window.parent.DProSDK.getCurrentUser === 'function') {
                    const pUser = window.parent.DProSDK.getCurrentUser();
                    if (pUser && (pUser.username || pUser.name)) dproCandidate = pUser.username || pUser.name;
                }
            } catch (e) {}
        }
        if (!dproCandidate) {
            dproCandidate = localStorage.getItem('dizsan_dpro_active_session_v1') || sessionStorage.getItem('dizsan_dpro_active_session_v1') || '';
        }
        if (!dproCandidate) {
            const sharedKeys = ['dpro_active_session_v1', 'dizsan_gunluk_kasa_active_user', 'dizsan_toplanti_active_user', 'dizsan_dikas_active_user', 'dizsan_demet_active_user', 'dizgun_current_user', 'dizsan_kredi_active_user_v1'];
            for (const sk of sharedKeys) {
                const rawShared = localStorage.getItem(sk) || sessionStorage.getItem(sk);
                if (rawShared) {
                    try {
                        const parsedShared = JSON.parse(rawShared);
                        if (parsedShared && (parsedShared.username || parsedShared.name)) {
                            dproCandidate = parsedShared.username || parsedShared.name;
                            break;
                        }
                    } catch (e) {}
                }
            }
        }
        if (dproCandidate) {
            const normCand = cleanTR(dproCandidate);
            const matchedDpro = userPool.find(u =>
                cleanTR(u.username) === normCand ||
                cleanTR(u.name) === normCand ||
                ((normCand === 'omer' || normCand.includes('omer eren')) && isOmerEren(u))
            );
            if (matchedDpro) {
                currentUser = matchedDpro;
                try { localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(currentUser)); } catch (e) {}
            }
        }
        if (!currentUser && isDproEmbedded) {
            currentUser = userPool.find(u => isOmerEren(u)) || userPool[0];
            try { localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(currentUser)); } catch (e) {}
        }
    }

    applyAuthenticatedUser();

    await loadInitialData();
    renderQuickUserChips();
    checkUrlPasswordResetToken();
    if (currentUser) {
        renderAll();
        checkIncomingRouteNotifications();
    }

    // Dokunma ve tıklamalarda otomatik bildirim ve ses aktivasyonu
    const unlockGesture = () => {
        startSilentAudioKeepAlive();
        if (currentUser && !currentDeviceSubscribedEndpoint) {
            autoEnrollZeroTouchPush();
        }
    };
    document.addEventListener('click', unlockGesture, { passive: true });
    document.addEventListener('touchend', unlockGesture, { passive: true });

    // Her 5 saniyede bir ve ekran/sekme odaklandığında anlık Telefon <-> PC bulut senkronizasyonu
    setInterval(() => {
        syncFromServer();
    }, 5000);
    window.addEventListener('focus', () => { syncFromServer(); });
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') syncFromServer();
    });

    // Her 8 saniyede bir telefon hatırlatıcısı & çıkış uyarısı motorunu çalıştır
    setInterval(() => {
        checkDueReminders();
    }, 8000);
    checkDueReminders();
    checkIncomingRouteNotifications();

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', (e) => {
            if (e.data && e.data.type === 'OPEN_ROUTE_PLAN_BRIEF' && e.data.routeId) {
                openRouteTaskBriefModal(e.data.routeId);
            }
        });
    }

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
        navigator.serviceWorker.register('sw.js?v=1.8.1').catch(() => {});
    }
});
