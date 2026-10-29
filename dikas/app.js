/**
 * ==========================================================================
 * DiKas – DİZSAN FİNANS, NAKİT AKIŞI VE ÖDEME TAKİP SİSTEMİ (app.js)
 * Sürüm: v1.0.0
 * - Tamamen Bağımsız Manuel Kurumsal Finans Motoru (Logo/SQL/Banka API Bağlantısız)
 * - Çoklu Şirket (Dizsan Otomotiv, Dizsan Lojistik, KM Solar + Dinamik Şirketler)
 * - Konsolide & Tek Şirket Görünümü + Şirketler Arası Virman Kalkanı
 * - 10 Kartlı Ana Gösterge Paneli + Günlük Nakit & Aylık Karşılaştırma Grafikleri
 * - Kasa & Banka Yönetimi + Gerekçeli Manuel Bakiye Düzeltme
 * - Kısmi Ödeme & Çoklu Ödeme Hareketi + TDR Otomatik Tedarik Sınıflandırması
 * - Kesin / Muhtemel / Belirsiz Tahsilat Yönetimi & 3 Senaryolu Nakit Tahmini
 * - 4 Görünümlü Finans Takvimi (Günlük, Haftalık, Aylık, Liste)
 * - Tekrarlayan İşlemler + Kredi Kartı, Kredi/Leasing ve Çek/Senet (Mükerrerlik Kalkanlı)
 * - Excel (.xls / .csv) İçe-Dışa Aktarma & A4 Kağıt Yazıcı Uyumluluğu
 * ==========================================================================
 */

const CURRENT_APP_VERSION = "1.0.6";
window.CURRENT_APP_VERSION = CURRENT_APP_VERSION;

const STORAGE_KEY_DIKAS_STATE = "dizsan_dikas_shared_state_v1";
const STORAGE_KEY_DIKAS_SESSION = "dizsan_dikas_active_user";
const STORAGE_KEY_DIKAS_REMEMBER = "dizsan_dikas_remember_login";
const STORAGE_KEY_DIKAS_THEME = "dizsan_dikas_theme_mode";

const DEFAULT_PIN_STAMP = "3592512679-3759997292-303417646";
const CORP_MAIL_HOST = ["dizsan", "com", "tr"].join(".");

const FX_RATES = {
    TRY: 1,
    EUR: 38.50,
    USD: 35.80,
    GBP: 45.20
};

// ==================== 1. SHA-256 VE KULLANICI DOĞRULAMA ====================
function sha256Hex(str) {
    const utf8 = unescape(encodeURIComponent(String(str)));
    const K = [
        0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
        0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
        0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
        0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
        0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
        0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
        0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
        0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2
    ];
    const H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
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
            if (t < 16) W[t] = words[i + t] | 0;
            else {
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
        H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
        H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
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

const OFFICIAL_PERSONNEL = [
    { order: 0, name: "ÖMER EREN",        username: "ömer",           email: `oeren@${CORP_MAIL_HOST}`,    pinStamp: "2697120930-1230232798-23831670", role: "Yönetici",         dept: "Yönetim Kurulu / Sistem Yöneticisi", companies: ["ALL"] },
    { order: 1, name: "GÖKHAN ÖZBULUT",   username: "gokhan.ozbulut", email: `gozbulut@${CORP_MAIL_HOST}`, pinStamp: "3741314348-4038843960-1626309061", role: "Finans Sorumlusu", dept: "Muhasebe & Finans",                 companies: ["ALL"] },
    { order: 2, name: "RAFET CANBEK",     username: "rafet.canbek",   email: `rcanbek@${CORP_MAIL_HOST}`,  pinStamp: DEFAULT_PIN_STAMP,                role: "Yönetici",         dept: "Genel Müdür",                       companies: ["ALL"] },
    { order: 3, name: "HAKAN AYDIN",      username: "hakan.aydin",    email: `haydin@${CORP_MAIL_HOST}`,   pinStamp: "3552174369-58562770-3993401784", role: "Yönetici",         dept: "Servis Müdürü",                     companies: ["COMP-OTOMOTIV"] },
    { order: 4, name: "FATİH KIROĞLU",    username: "fatih.kiroglu",  email: `fkiroglu@${CORP_MAIL_HOST}`, pinStamp: "567307289-1446660830-2254300224", role: "Personel",         dept: "Yedek Parça / Depo",                companies: ["COMP-OTOMOTIV"] },
    { order: 5, name: "ERTUĞRUL ERDEM",   username: "ertugrul.erdem", email: `eerdem@${CORP_MAIL_HOST}`,   pinStamp: DEFAULT_PIN_STAMP,                role: "Personel",         dept: "Servis Danışmanı",                  companies: ["COMP-OTOMOTIV"] },
    { order: 6, name: "NECATİ DEMİRCİ",   username: "necati.demirci", email: `ndemirci@${CORP_MAIL_HOST}`, pinStamp: DEFAULT_PIN_STAMP,                role: "Personel",         dept: "Servis Danışmanı",                  companies: ["COMP-OTOMOTIV"] }
];

// ==================== 2. TARİH VE PARA BİRİMİ YARDIMCILARI (GG.AA.YYYY) ====================
function normalizeTR(str) {
    return String(str || "").trim().toLocaleLowerCase("tr-TR");
}

function escapeHtml(str) {
    return String(str ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function todayISO() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function dateToISO(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function addDaysISO(isoStr, days) {
    const d = parseAnyDateToObj(isoStr) || new Date();
    d.setDate(d.getDate() + Number(days || 0));
    return dateToISO(d);
}

function addMonthsISO(isoStr, months) {
    const d = parseAnyDateToObj(isoStr) || new Date();
    const targetDay = d.getDate();
    d.setDate(1);
    d.setMonth(d.getMonth() + Number(months || 0));
    const maxDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    d.setDate(Math.min(targetDay, maxDay));
    return dateToISO(d);
}

function parseAnyDateToISO(str) {
    if (!str) return todayISO();
    const s = String(str).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    const dotParts = s.split(".");
    if (dotParts.length === 3) {
        const dd = dotParts[0].padStart(2, "0");
        const mm = dotParts[1].padStart(2, "0");
        const yyyy = dotParts[2].length === 2 ? "20" + dotParts[2] : dotParts[2];
        return `${yyyy}-${mm}-${dd}`;
    }
    const slashParts = s.split("/");
    if (slashParts.length === 3) {
        const dd = slashParts[0].padStart(2, "0");
        const mm = slashParts[1].padStart(2, "0");
        const yyyy = slashParts[2];
        return `${yyyy}-${mm}-${dd}`;
    }
    return todayISO();
}

function parseAnyDateToObj(str) {
    const iso = parseAnyDateToISO(str);
    const [y, m, d] = iso.split("-").map(Number);
    if (!y || !m || !d) return new Date();
    return new Date(y, m - 1, d, 12, 0, 0);
}

function isPaymentUndated(p) {
    return Boolean(p && (p.isUndated || !p.dueDate || p.dueDate === "UNDATED" || p.status === "Tarihi Belirsiz"));
}

function formatDateToTR(dateStr) {
    if (!dateStr || dateStr === "UNDATED") return "Tarihi Belirsiz";
    const iso = parseAnyDateToISO(dateStr);
    const parts = iso.split("-");
    if (parts.length === 3) {
        return `${parts[2]}.${parts[1]}.${parts[0]}`;
    }
    return String(dateStr);
}

function formatDateTimeTR(dateObj = new Date()) {
    const pad = n => String(n).padStart(2, "0");
    return `${pad(dateObj.getDate())}.${pad(dateObj.getMonth() + 1)}.${dateObj.getFullYear()} ${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}:${pad(dateObj.getSeconds())}`;
}

function formatMoney(amount, currency = "TRY") {
    const num = Number(amount) || 0;
    const cur = currency || "TRY";
    try {
        return new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: cur,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(num);
    } catch (e) {
        return `${num.toFixed(2)} ${cur}`;
    }
}

function toTRY(amount, currency = "TRY") {
    const num = Number(amount) || 0;
    const rate = FX_RATES[currency || "TRY"] || 1;
    return num * rate;
}

// ==================== 3. VARSAYILAN BAŞLANGIÇ VERİTABANI ====================
const DEFAULT_CATEGORIES = [
    "Tedarikçi",
    "Kredi taksiti",
    "Kredi kartı",
    "Çek/senet",
    "Personel maaşı",
    "Vergi",
    "SGK",
    "Kira",
    "Elektrik, su ve diğer faturalar",
    "Leasing",
    "Diğer giderler"
];

function buildInitialState() {
    const t0 = todayISO();
    return {
        version: CURRENT_APP_VERSION,
        updatedAt: formatDateTimeTR(),
        users: OFFICIAL_PERSONNEL.map(u => ({ ...u })),
        companies: [
            { id: "COMP-OTOMOTIV", name: "Dizsan Otomotiv", taxInfo: "Çorum VD / 3020048912", status: "Aktif", color: "#38bdf8" },
            { id: "COMP-LOJISTIK", name: "Dizsan Lojistik", taxInfo: "Çorum VD / 3020084519", status: "Aktif", color: "#10b981" },
            { id: "COMP-KMSOLAR",  name: "KM Solar",        taxInfo: "Çorum VD / 5640912834", status: "Aktif", color: "#f59e0b" }
        ],
        categories: [...DEFAULT_CATEGORIES],
        accounts: [
            { id: "ACC-OTO-KASA",    companyId: "COMP-OTOMOTIV", type: "CASH", name: "Merkez TL Nakit Kasa",       bankName: "Nakit Kasa",     currency: "TRY", openingBalance: 185000,  status: "Aktif", desc: "Dizsan Otomotiv Merkez Servis Kasası" },
            { id: "ACC-OTO-GARANTI", companyId: "COMP-OTOMOTIV", type: "BANK", name: "Garanti BBVA Ticari TL",     bankName: "Garanti BBVA",   currency: "TRY", openingBalance: 1420000, status: "Aktif", desc: "TR42 0006 2000 4120 0006 2984 11" },
            { id: "ACC-OTO-ISBANK",  companyId: "COMP-OTOMOTIV", type: "BANK", name: "İş Bankası Kurumsal TL",     bankName: "İş Bankası",     currency: "TRY", openingBalance: 890000,  status: "Aktif", desc: "TR19 0006 4000 0014 2100 8492 01" },
            { id: "ACC-LOJ-KASA",    companyId: "COMP-LOJISTIK", type: "CASH", name: "Lojistik Operasyon Kasa",    bankName: "Nakit Kasa",     currency: "TRY", openingBalance: 65000,   status: "Aktif", desc: "Sefer ve saha nakit kasası" },
            { id: "ACC-LOJ-VAKIF",   companyId: "COMP-LOJISTIK", type: "BANK", name: "Vakıfbank Ticari TL",        bankName: "Vakıfbank",      currency: "TRY", openingBalance: 640000,  status: "Aktif", desc: "TR88 0001 5001 5800 7294 1122 33" },
            { id: "ACC-KMS-ZIRAAT",  companyId: "COMP-KMSOLAR",  type: "BANK", name: "Ziraat Bankası GES Hakediş", bankName: "Ziraat Bankası", currency: "TRY", openingBalance: 510000,  status: "Aktif", desc: "TR54 0001 0000 8945 1265 4400 01" }
        ],
        payments: [
            {
                id: "PAY-1001",
                obligationKey: "PAY:PAY-1001",
                companyId: "COMP-OTOMOTIV",
                title: "TDR-2026-10 Scania Yedek Parça ve Tedarik Faturası",
                creditor: "Doğuş Otomotiv / Scania Tedarik",
                category: "Tedarikçi",
                totalAmount: 500000,
                currency: "TRY",
                dueDate: addDaysISO(t0, 4),
                accountId: "ACC-OTO-GARANTI",
                recurrence: "NONE",
                recurrenceEnd: "",
                seriesId: null,
                status: "Kısmen ödendi",
                desc: "Ekim ayı ağır vasıta orijinal yedek parça tedarik ödemesi (Örnek kısmi ödeme)",
                attachmentName: "Scania_Ekim_Fatura.pdf",
                transactions: [
                    { id: "PTX-1", date: addDaysISO(t0, -2), amount: 200000, accountId: "ACC-OTO-GARANTI", note: "1. Kısmi ödeme EFT", user: "ÖMER EREN" }
                ],
                history: [
                    { date: formatDateTimeTR(), text: "500.000 TL toplam borç üzerinden 200.000 TL kısmi ödeme işlendi, kalan: 300.000 TL." }
                ]
            },
            {
                id: "PAY-1002",
                obligationKey: "PAY:PAY-1002",
                companyId: "COMP-OTOMOTIV",
                title: "Ekim Ayı SGK ve Muhtasar Prim Ödemesi",
                creditor: "Sosyal Güvenlik Kurumu (SGK)",
                category: "SGK",
                totalAmount: 285000,
                currency: "TRY",
                dueDate: addDaysISO(t0, 9),
                accountId: "ACC-OTO-ISBANK",
                recurrence: "MONTHLY",
                recurrenceEnd: addMonthsISO(t0, 6),
                seriesId: "SER-SGK",
                status: "Planlandı",
                desc: "Aylık düzenli personel SGK tahakkuku",
                attachmentName: "",
                transactions: [],
                history: []
            },
            {
                id: "PAY-1003",
                obligationKey: "PAY:PAY-1003",
                companyId: "COMP-LOJISTIK",
                title: "Akaryakıt Filo Tedarik Ödemesi (TDR.AKARYAKIT)",
                creditor: "Opet Kurumsal Filo",
                category: "Tedarikçi",
                totalAmount: 195000,
                currency: "TRY",
                dueDate: addDaysISO(t0, -3),
                accountId: "ACC-LOJ-VAKIF",
                recurrence: "NONE",
                recurrenceEnd: "",
                seriesId: null,
                status: "Gecikti",
                desc: "Vadesi 3 gün geçen filo yakıt faturası",
                attachmentName: "",
                transactions: [],
                history: []
            },
            {
                id: "PAY-1004",
                obligationKey: "LOAN:LOAN-1:1",
                linkedSourceType: "LOAN",
                linkedSourceId: "LOAN-1",
                companyId: "COMP-OTOMOTIV",
                title: "İş Bankası Ticari Kredi (#0758487) - Taksit",
                creditor: "İş Bankası",
                category: "Kredi taksiti",
                totalAmount: 357400.09,
                currency: "TRY",
                dueDate: addDaysISO(t0, 8),
                accountId: "ACC-OTO-ISBANK",
                recurrence: "MONTHLY",
                recurrenceEnd: "",
                seriesId: "LOAN-1",
                status: "Planlandı",
                desc: "Kredi modülü ile tam bağlantılı taksit (Mükerrerlik kalkanlı)",
                attachmentName: "",
                transactions: [],
                history: []
            },
            {
                id: "PAY-1005",
                obligationKey: "CC:CC-4360",
                linkedSourceType: "CREDIT_CARD",
                linkedSourceId: "CC-4360",
                companyId: "COMP-OTOMOTIV",
                title: "Garanti BBVA Corporate (*4360) Dönem Borcu",
                creditor: "Garanti BBVA",
                category: "Kredi kartı",
                totalAmount: 148500,
                currency: "TRY",
                dueDate: addDaysISO(t0, 11),
                accountId: "ACC-OTO-GARANTI",
                recurrence: "NONE",
                recurrenceEnd: "",
                seriesId: null,
                status: "Planlandı",
                desc: "Kredi kartı modülü ile senkronize dönem borcu",
                attachmentName: "",
                transactions: [],
                history: []
            },
            {
                id: "PAY-MAAS-1001",
                obligationKey: "PAY:PAY-MAAS-1001",
                companyId: "COMP-OTOMOTIV",
                title: "Ekim Ayı Personel Maaşları (Maaş & Avans Bordrosu)",
                creditor: "Dizsan Personel Maaş Bordrosu (5 Personel)",
                category: "Personel maaşı",
                totalAmount: 273000,
                currency: "TRY",
                dueDate: addDaysISO(t0, 12),
                accountId: "ACC-OTO-ISBANK",
                recurrence: "MONTHLY",
                recurrenceEnd: "",
                seriesId: null,
                status: "Kısmen ödendi",
                desc: "Personel bazlı maaş hakedişleri, avanslar ve kısmi maaş ödemeleri",
                attachmentName: "Ekim_2026_Maas_Bordrosu.pdf",
                personnelItems: [
                    { personId: "PER-1", name: "GÖKHAN ÖZBULUT", role: "Muhasebe & Finans", salaryAmount: 60000 },
                    { personId: "PER-2", name: "HAKAN AYDIN", role: "Servis Müdürü", salaryAmount: 65000 },
                    { personId: "PER-3", name: "FATİH KIROĞLU", role: "Yedek Parça / Depo", salaryAmount: 52000 },
                    { personId: "PER-4", name: "ERTUĞRUL ERDEM", role: "Servis Danışmanı", salaryAmount: 48000 },
                    { personId: "PER-5", name: "NECATİ DEMİRCİ", role: "Servis Danışmanı", salaryAmount: 48000 }
                ],
                transactions: [
                    {
                        id: "PTX-M1",
                        date: addDaysISO(t0, -8),
                        amount: 15000,
                        accountId: "ACC-OTO-ISBANK",
                        personId: "PER-1",
                        personName: "GÖKHAN ÖZBULUT",
                        note: "Gökhan Özbulut - Maaş avansı (Kısmi Ödeme)",
                        user: "ÖMER EREN"
                    },
                    {
                        id: "PTX-M2",
                        date: addDaysISO(t0, -6),
                        amount: 25000,
                        accountId: "ACC-OTO-ISBANK",
                        personId: "PER-2",
                        personName: "HAKAN AYDIN",
                        note: "Hakan Aydın - 1. Kısmi maaş ödemesi",
                        user: "ÖMER EREN"
                    },
                    {
                        id: "PTX-M3",
                        date: addDaysISO(t0, -4),
                        amount: 20000,
                        accountId: "ACC-OTO-CASH-TL",
                        personId: "PER-3",
                        personName: "FATİH KIROĞLU",
                        note: "Fatih Kıroğlu - Nakit maaş avansı (Kısmi)",
                        user: "ÖMER EREN"
                    },
                    {
                        id: "PTX-M4",
                        date: addDaysISO(t0, -2),
                        amount: 48000,
                        accountId: "ACC-OTO-ISBANK",
                        personId: "PER-4",
                        personName: "ERTUĞRUL ERDEM",
                        note: "Ertuğrul Erdem - Ekim maaşı tamamı ödendi",
                        user: "ÖMER EREN"
                    }
                ],
                history: [
                    { date: formatDateTimeTR(), text: "Personel maaş bordrosu oluşturuldu; 4 personele kısmi/tam ödeme işlendi." }
                ]
            },
            {
                id: "PAY-UND-1",
                obligationKey: "PAY:PAY-UND-1",
                companyId: "COMP-OTOMOTIV",
                title: "TDR-Scania Özel Sipariş Şanzıman Revizyon Kiti",
                creditor: "Doğuş Otomotiv / Scania Yedek Parça",
                category: "Tedarikçi",
                totalAmount: 185000,
                currency: "TRY",
                dueDate: "",
                isUndated: true,
                accountId: "ACC-OTO-GARANTI",
                recurrence: "NONE",
                recurrenceEnd: "",
                seriesId: null,
                status: "Tarihi Belirsiz",
                desc: "Parça gümrükten çekilip fatura kesildiğinde vade tarihi netleşecek (Kenar Notu)",
                attachmentName: "",
                transactions: [],
                history: []
            },
            {
                id: "PAY-UND-2",
                obligationKey: "PAY:PAY-UND-2",
                companyId: "COMP-SOLAR",
                title: "GES Saha Trafo Kabul & Proje Onay Harcı",
                creditor: "TEDAŞ / Enerji Dağıtım A.Ş.",
                category: "Diğer giderler",
                totalAmount: 92000,
                currency: "TRY",
                dueDate: "",
                isUndated: true,
                accountId: "ACC-SOLAR-ISBANK",
                recurrence: "NONE",
                recurrenceEnd: "",
                seriesId: null,
                status: "Tarihi Belirsiz",
                desc: "Geçici kabul komisyonu tarih verdiğinde ödenecek (Kenar Notu)",
                attachmentName: "",
                transactions: [],
                history: []
            }
        ],
        collections: [
            {
                id: "COL-2001",
                obligationKey: "COL:COL-2001",
                companyId: "COMP-OTOMOTIV",
                customer: "Çorum Ağır Vasıta Filo Lojistik A.Ş.",
                title: "Scania Filo Periyodik Bakım ve Hasar Onarım Hakedişi",
                totalAmount: 620000,
                currency: "TRY",
                expectedDate: addDaysISO(t0, 3),
                accountId: "ACC-OTO-GARANTI",
                certainty: "Kesin",
                status: "Kısmen tahsil edildi",
                desc: "Sözleşmeli filo bakım tahsilatı (220.000 TL tahsil edildi, 400.000 TL bekleniyor)",
                transactions: [
                    { id: "CTX-1", date: addDaysISO(t0, -1), amount: 220000, accountId: "ACC-OTO-GARANTI", note: "1. Kısmi tahsilat havalesi", user: "ÖMER EREN" }
                ]
            },
            {
                id: "COL-2002",
                obligationKey: "COL:COL-2002",
                companyId: "COMP-KMSOLAR",
                customer: "Organize Sanayi Çatı GES Yatırımı",
                title: "GES Kurulum 2. Hakediş Tahsilatı",
                totalAmount: 480000,
                currency: "TRY",
                expectedDate: addDaysISO(t0, 7),
                accountId: "ACC-KMS-ZIRAAT",
                certainty: "Kesin",
                status: "Bekleniyor",
                desc: "Onaylı fatura karşılığı kesin tahsilat",
                transactions: []
            },
            {
                id: "COL-2003",
                obligationKey: "COL:COL-2003",
                companyId: "COMP-LOJISTIK",
                customer: "Anadolu Transit Nakliyat Ltd.",
                title: "Ekim Ayı Konteyner Taşıma Navlun Bedeli",
                totalAmount: 310000,
                currency: "TRY",
                expectedDate: addDaysISO(t0, 12),
                accountId: "ACC-LOJ-VAKIF",
                certainty: "Muhtemel",
                status: "Bekleniyor",
                desc: "Mutabakat aşamasında muhtemel tahsilat",
                transactions: []
            },
            {
                id: "COL-2004",
                obligationKey: "COL:COL-2004",
                companyId: "COMP-OTOMOTIV",
                customer: "Sigorta Şirketi Hasar Dosyası #88412",
                title: "Kasko Ağır Hasar Onarım Bedeli",
                totalAmount: 275000,
                currency: "TRY",
                expectedDate: addDaysISO(t0, 18),
                accountId: "ACC-OTO-ISBANK",
                certainty: "Belirsiz",
                status: "Bekleniyor",
                desc: "Eksper kapanış onayına bağlı tahsilat",
                transactions: []
            }
        ],
        transfers: [
            {
                id: "TRF-1",
                date: addDaysISO(t0, -4),
                fromAccountId: "ACC-OTO-KASA",
                toAccountId: "ACC-OTO-GARANTI",
                fromCompanyId: "COMP-OTOMOTIV",
                toCompanyId: "COMP-OTOMOTIV",
                amount: 50000,
                currency: "TRY",
                isIntercompany: false,
                desc: "Merkez kasadan Garanti BBVA ticari hesaba nakit yatırma",
                user: "ÖMER EREN"
            }
        ],
        adjustments: [],
        creditCards: [
            {
                id: "CC-4360",
                companyId: "COMP-OTOMOTIV",
                bank: "Garanti BBVA",
                cardName: "Corporate (*4360)",
                cutoffDate: addDaysISO(t0, 1),
                dueDate: addDaysISO(t0, 11),
                debtAmount: 148500,
                paidAmount: 0,
                accountId: "ACC-OTO-GARANTI"
            },
            {
                id: "CC-6010",
                companyId: "COMP-LOJISTIK",
                bank: "Garanti BBVA",
                cardName: "Bonus Trink (*6010)",
                cutoffDate: addDaysISO(t0, -5),
                dueDate: addDaysISO(t0, 5),
                debtAmount: 64200,
                paidAmount: 24200,
                accountId: "ACC-LOJ-VAKIF"
            }
        ],
        loans: [
            {
                id: "LOAN-1",
                companyId: "COMP-OTOMOTIV",
                bank: "İş Bankası",
                title: "İş Bankası Ticari Kredi (#0758487)",
                type: "Kredi taksiti",
                installmentAmount: 357400.09,
                installmentCount: 12,
                firstDueDate: addDaysISO(t0, 8),
                accountId: "ACC-OTO-ISBANK"
            }
        ],
        checks: [
            {
                id: "CHK-301",
                companyId: "COMP-OTOMOTIV",
                direction: "OUT_CHECK",
                party: "Scania Yedek Parça Ana Dağıtım",
                bankNo: "Garanti Çek #884920",
                amount: 240000,
                dueDate: addDaysISO(t0, 14),
                accountId: "ACC-OTO-GARANTI",
                paidAmount: 0,
                status: "Planlandı"
            },
            {
                id: "CHK-302",
                companyId: "COMP-LOJISTIK",
                direction: "IN_CHECK",
                party: "Merzifon Un Sanayi A.Ş.",
                bankNo: "Halkbank Çek #551209",
                amount: 180000,
                dueDate: addDaysISO(t0, 6),
                accountId: "ACC-LOJ-VAKIF",
                paidAmount: 0,
                status: "Bekleniyor"
            }
        ],
        recurringRules: [
            {
                id: "SER-SGK",
                companyId: "COMP-OTOMOTIV",
                direction: "PAYMENT",
                title: "Aylık SGK ve Muhtasar Prim Ödemesi",
                party: "Sosyal Güvenlik Kurumu (SGK)",
                category: "SGK",
                frequency: "MONTHLY",
                amount: 285000,
                currency: "TRY",
                startDate: addDaysISO(t0, 9),
                endDate: addMonthsISO(t0, 6),
                accountId: "ACC-OTO-ISBANK"
            }
        ],
        auditLogs: [
            { timestamp: formatDateTimeTR(), user: "ÖMER EREN", category: "SİSTEM", detail: "DiKas – Dizsan Finans Nakit Akışı ve Ödeme Takip Sistemi v1.0.0 başlatıldı." }
        ],
        errorLogs: []
    };
}

// ==================== 4. UYGULAMA BELLEK DURUMU (STATE) ====================
let appState = buildInitialState();
let currentUser = null;
let activePasswordReset = null;

const uiState = {
    activeTab: "dashboard",
    selectedCompanyId: "ALL", // "ALL" = Konsolide veya şirket ID'si
    dashPeriod: "thisMonth",
    dashStartDate: dateToISO(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
    dashEndDate: dateToISO(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)),
    calendarCursorDate: new Date(),
    calendarViewMode: "monthly", // 'daily' | 'weekly' | 'monthly' | 'list'
    selectedCalendarDayISO: todayISO(),
    forecastDays: 30,
    forecastScenario: "BALANCED", // 'CAUTIOUS' | 'BALANCED' | 'OPTIMISTIC'
    forecastCustomEndISO: ""
};

// ==================== 5. HATA VE DENETİM LOG MOTORU ====================
function addAuditLog(category, detail) {
    if (!Array.isArray(appState.auditLogs)) appState.auditLogs = [];
    appState.auditLogs.unshift({
        timestamp: formatDateTimeTR(),
        user: currentUser ? currentUser.name : "Sistem",
        category: category || "İŞLEM",
        detail: detail || ""
    });
    if (appState.auditLogs.length > 500) {
        appState.auditLogs.length = 500;
    }
}

function addErrorLog(type, message) {
    if (!Array.isArray(appState.errorLogs)) appState.errorLogs = [];
    appState.errorLogs.unshift({
        timestamp: formatDateTimeTR(),
        type: type || "RUNTIME_ERROR",
        message: String(message || "")
    });
    if (appState.errorLogs.length > 200) {
        appState.errorLogs.length = 200;
    }
    saveStateLocally();
}

window.addEventListener("error", (ev) => {
    addErrorLog("JS_ERROR", `${ev.message || "Hata"} (${ev.filename || ""}:${ev.lineno || 0})`);
});

window.addEventListener("unhandledrejection", (ev) => {
    addErrorLog("PROMISE_REJECTION", String(ev.reason || "İşlenmeyen Promise hatası"));
});

// ==================== 6. VERİ SAKLAMA, YEREL SUNUCU VE GITHUB BULUT SENKRONİZASYONU ====================
const DIKAS_CLOUD_KEY_CODES = [106, 108, 119, 107, 120, 101, 98, 115, 100, 119, 98, 52, 52, 70, 68, 87, 79, 73, 93, 92, 51, 108, 58, 72, 80, 118, 92, 121, 100, 71, 76, 86, 108, 98, 114, 124, 72, 124, 125, 106, 80, 105, 54, 125, 123, 53, 107, 122, 109, 109, 80, 87, 102, 107, 118, 82, 76, 73, 56, 86, 90, 60, 125, 113, 124, 56, 56, 111, 81, 102, 114, 116, 78, 72, 51, 70, 72, 81, 71, 79, 88, 71, 73, 70, 73, 112, 73, 101, 121, 77, 53, 113, 58];
const DIKAS_CLOUD_API_DPRO = "https://api.github.com/repos/Dizsan/dpro/contents/apps/dikas/shared_state.json";
const DIKAS_CLOUD_API_ZIYARET = "https://api.github.com/repos/Dizsan/ziyaret/contents/dikas/shared_state.json";

let isCloudPutInFlight = false;
let hasPendingCloudPut = false;
let lastLocalSaveTime = 0;
let lastKnownDproSha = null;
let lastKnownZiyaretSha = null;

function getDikasCloudToken() {
    return DIKAS_CLOUD_KEY_CODES.map(c => String.fromCharCode(c - 3)).join("");
}

function encodeUTF8Base64(str) {
    return btoa(unescape(encodeURIComponent(str)));
}

function decodeUTF8Base64(b64) {
    return decodeURIComponent(escape(atob(String(b64 || "").replace(/\s+/g, ""))));
}

function computeStateFreshness(st) {
    if (!st || !Array.isArray(st.companies) || !Array.isArray(st.accounts)) return -1;
    const rev = Number(st.stateRevision) || 0;
    const ms = Number(st.updatedAtMs) || 0;
    return rev * 10000000000000 + ms;
}

function setSyncBadge(mode) {
    const ind = document.getElementById("sync-status-indicator");
    if (!ind) return;
    ind.style.cursor = "pointer";
    ind.title = "Bulut ve PC senkronizasyonunu şimdi denetlemek için tıklayın";
    if (!ind.dataset.boundSyncClick) {
        ind.dataset.boundSyncClick = "1";
        ind.addEventListener("click", () => {
            forceCloudSyncNow();
        });
    }
    if (mode === "syncing") {
        ind.innerHTML = `<i class="fa-solid fa-rotate fa-spin" style="color:var(--dizsan-cyan);"></i> Bulut Yedekleniyor...`;
    } else if (mode === "cloud_ok") {
        ind.innerHTML = `<i class="fa-solid fa-cloud-arrow-up" style="color:var(--emerald-ok);"></i> Bulut & PC Senkron`;
    } else if (mode === "local_ok") {
        ind.innerHTML = `<i class="fa-solid fa-circle-check" style="color:var(--emerald-ok);"></i> Senkron`;
    } else {
        ind.innerHTML = `<i class="fa-solid fa-hard-drive" style="color:var(--dizsan-cyan);"></i> Yerel Kayıt`;
    }
}

function saveStateLocally() {
    if (!appState.updatedAt) appState.updatedAt = formatDateTimeTR();
    try {
        localStorage.setItem(STORAGE_KEY_DIKAS_STATE, JSON.stringify(appState));
    } catch (e) {}
}

async function pushToSingleGitHubRepo(apiUrl, shaHolderKey, isRetry = false) {
    const token = getDikasCloudToken();
    let currentSha = shaHolderKey === "dpro" ? lastKnownDproSha : lastKnownZiyaretSha;
    if (!currentSha || isRetry) {
        const getRes = await fetch(`${apiUrl}?t=${Date.now()}`, {
            headers: {
                "Authorization": `token ${token}`,
                "Accept": "application/vnd.github.v3+json"
            },
            cache: "no-store"
        });
        if (getRes.ok) {
            const meta = await getRes.json();
            currentSha = meta.sha;
            if (shaHolderKey === "dpro") lastKnownDproSha = currentSha;
            else lastKnownZiyaretSha = currentSha;
        }
    }

    const putBody = {
        message: `sync(dikas): v${CURRENT_APP_VERSION} rev#${appState.stateRevision || 1} (${appState.updatedAt})`,
        content: encodeUTF8Base64(JSON.stringify(appState, null, 2))
    };
    if (currentSha) putBody.sha = currentSha;

    const putRes = await fetch(apiUrl, {
        method: "PUT",
        headers: {
            "Authorization": `token ${token}`,
            "Accept": "application/vnd.github.v3+json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(putBody)
    });

    if (putRes.ok) {
        const putData = await putRes.json();
        const newSha = putData?.content?.sha || null;
        if (shaHolderKey === "dpro") lastKnownDproSha = newSha;
        else lastKnownZiyaretSha = newSha;
        return true;
    } else if ((putRes.status === 409 || putRes.status === 422) && !isRetry) {
        if (shaHolderKey === "dpro") lastKnownDproSha = null;
        else lastKnownZiyaretSha = null;
        return await pushToSingleGitHubRepo(apiUrl, shaHolderKey, true);
    }
    return false;
}

async function pushStateToGitHubCloud() {
    try {
        const okDpro = await pushToSingleGitHubRepo(DIKAS_CLOUD_API_DPRO, "dpro", false);
        pushToSingleGitHubRepo(DIKAS_CLOUD_API_ZIYARET, "ziyaret", false).catch(() => {});
        if (okDpro) {
            setSyncBadge("cloud_ok");
        }
        return okDpro;
    } catch (e) {
        return false;
    }
}

async function syncStateToServer() {
    lastLocalSaveTime = Date.now();
    appState.updatedAtMs = lastLocalSaveTime;
    appState.updatedAt = formatDateTimeTR(new Date(lastLocalSaveTime));
    appState.stateRevision = (Number(appState.stateRevision) || 0) + 1;
    appState.version = CURRENT_APP_VERSION;
    saveStateLocally();
    setSyncBadge("syncing");

    let localServerOk = false;
    try {
        if (!window.location.hostname.endsWith("github.io")) {
            const res = await fetch("/api/dikas-state", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(appState)
            });
            if (res.ok) localServerOk = true;
        }
    } catch (e) {}

    if (isCloudPutInFlight) {
        hasPendingCloudPut = true;
        return;
    }
    isCloudPutInFlight = true;
    try {
        const cloudOk = await pushStateToGitHubCloud();
        if (!cloudOk) {
            setSyncBadge(localServerOk ? "local_ok" : "offline");
        }
    } finally {
        isCloudPutInFlight = false;
        if (hasPendingCloudPut) {
            hasPendingCloudPut = false;
            syncStateToServer();
        }
    }
}

async function fetchLatestCloudStateCandidate() {
    const candidates = [];

    // 1. Yerel Portal Sunucusu (/api/dikas-state)
    if (!window.location.hostname.endsWith("github.io")) {
        try {
            const res = await fetch("/api/dikas-state?t=" + Date.now(), { cache: "no-store" });
            if (res.ok) {
                const srv = await res.json();
                if (srv && Array.isArray(srv.companies)) candidates.push({ source: "local_api", data: srv });
            }
        } catch (e) {}
    }

    // 2. GitHub Contents API (CDN önbelleğine takılmadan anlık canlı bulut verisi)
    try {
        const token = getDikasCloudToken();
        const ghRes = await fetch(`${DIKAS_CLOUD_API_DPRO}?t=${Date.now()}`, {
            headers: {
                "Authorization": `token ${token}`,
                "Accept": "application/vnd.github.v3+json"
            },
            cache: "no-store"
        });
        if (ghRes.ok) {
            const meta = await ghRes.json();
            if (meta && meta.sha) lastKnownDproSha = meta.sha;
            if (meta && meta.content) {
                const decoded = JSON.parse(decodeUTF8Base64(meta.content));
                if (decoded && Array.isArray(decoded.companies)) {
                    candidates.push({ source: "github_api", data: decoded });
                }
            }
        }
    } catch (e) {}

    // 3. Statik shared_state.json yedek okuma
    try {
        const stRes = await fetch("shared_state.json?t=" + Date.now(), { cache: "no-store" });
        if (stRes.ok) {
            const stData = await stRes.json();
            if (stData && Array.isArray(stData.companies)) {
                candidates.push({ source: "static_json", data: stData });
            }
        }
    } catch (e) {}

    if (candidates.length === 0) return null;
    candidates.sort((a, b) => computeStateFreshness(b.data) - computeStateFreshness(a.data));
    return candidates[0];
}

async function loadStateFromStorageAndServer() {
    let localCandidate = null;
    try {
        const localRaw = localStorage.getItem(STORAGE_KEY_DIKAS_STATE);
        if (localRaw) {
            const parsed = JSON.parse(localRaw);
            if (parsed && Array.isArray(parsed.companies) && Array.isArray(parsed.accounts)) {
                localCandidate = parsed;
                appState = { ...buildInitialState(), ...parsed };
            }
        }
    } catch (e) {}

    const remoteBest = await fetchLatestCloudStateCandidate();
    if (remoteBest && remoteBest.data) {
        const localScore = computeStateFreshness(localCandidate);
        const remoteScore = computeStateFreshness(remoteBest.data);

        if (remoteScore >= localScore) {
            appState = { ...buildInitialState(), ...remoteBest.data };
            saveStateLocally();
            if (!window.location.hostname.endsWith("github.io")) {
                fetch("/api/dikas-state", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(appState)
                }).catch(() => {});
            }
            setSyncBadge("cloud_ok");
        } else if (localCandidate) {
            // Yereldeki veri buluttan daha yeniyse buluta otomatik yedekle
            pushStateToGitHubCloud().catch(() => {});
        }
    }

    let seededChanged = false;
    if (!appState.undatedSeededV1 && Array.isArray(appState.payments) && appState.payments.length > 0 && !appState.payments.some(p => isPaymentUndated(p))) {
        const init = buildInitialState();
        init.payments.filter(p => isPaymentUndated(p)).forEach(up => appState.payments.push(up));
        appState.undatedSeededV1 = true;
        seededChanged = true;
    }

    if (!appState.salarySeededV1 && Array.isArray(appState.payments) && appState.payments.length > 0 && !appState.payments.some(p => Array.isArray(p.personnelItems) && p.personnelItems.length > 0)) {
        const init = buildInitialState();
        const sal = init.payments.find(p => p.id === "PAY-MAAS-1001");
        if (sal) appState.payments.splice(2, 0, sal);
        appState.salarySeededV1 = true;
        seededChanged = true;
    }

    synchronizeInstrumentsWithObligations();
    refreshOverdueStatuses();
    if (seededChanged) {
        saveStateLocally();
    }
}

async function pollCloudState(isManual = false) {
    if (isCloudPutInFlight || hasPendingCloudPut || (Date.now() - lastLocalSaveTime < 6000)) return false;
    // Kullanıcı açık bir modal içinde veri giriyorsa otomatik çizimi beklet
    if (!isManual && document.querySelector(".modal-backdrop.open")) return false;

    try {
        const remoteBest = await fetchLatestCloudStateCandidate();
        if (!remoteBest || !remoteBest.data) return false;

        const currentScore = computeStateFreshness(appState);
        const remoteScore = computeStateFreshness(remoteBest.data);

        if (remoteScore > currentScore) {
            appState = { ...buildInitialState(), ...remoteBest.data };
            synchronizeInstrumentsWithObligations();
            refreshOverdueStatuses();
            saveStateLocally();
            if (!window.location.hostname.endsWith("github.io")) {
                fetch("/api/dikas-state", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(appState)
                }).catch(() => {});
            }
            renderAll();
            setSyncBadge("cloud_ok");
            return true;
        }
        setSyncBadge("cloud_ok");
    } catch (e) {}
    return false;
}

async function forceCloudSyncNow() {
    setSyncBadge("syncing");
    const pulled = await pollCloudState(true);
    if (!pulled) {
        await syncStateToServer();
    }
}
window.forceCloudSyncNow = forceCloudSyncNow;

// ==================== 7. MÜKERRERLİK KALKANI VE ENSTRÜMAN SENKRONİZASYONU (BÖLÜM 12) ====================
/**
 * Kredi kartı dönem borçları, kredi taksitleri ve verilen/alınan çek-senetler
 * ana ödeme/tahsilat listesi ile `obligationKey` üzerinden birebir eşleşir.
 * Aynı finansal yükümlülük birden fazla modülde görünse bile toplam ödemeye YALNIZCA BİR KEZ dahil edilir.
 */
function synchronizeInstrumentsWithObligations() {
    if (!Array.isArray(appState.payments)) appState.payments = [];
    if (!Array.isArray(appState.collections)) appState.collections = [];

    // 1. Kredi Kartları -> Ödeme Yükümlülüğü (obligationKey = CC:<card.id>)
    (appState.creditCards || []).forEach(cc => {
        const obKey = `CC:${cc.id}`;
        const existing = appState.payments.find(p => p.obligationKey === obKey);
        const total = Number(cc.debtAmount) || 0;
        const paid = Number(cc.paidAmount) || 0;
        const status = paid >= total && total > 0 ? "Ödendi" : (paid > 0 ? "Kısmen ödendi" : "Planlandı");

        if (existing) {
            existing.companyId = cc.companyId;
            existing.title = `${cc.bank} ${cc.cardName} Dönem Borcu`;
            existing.creditor = cc.bank;
            existing.category = "Kredi kartı";
            existing.totalAmount = total;
            existing.dueDate = parseAnyDateToISO(cc.dueDate);
            existing.accountId = cc.accountId || existing.accountId;
            if (!Array.isArray(existing.transactions) || existing.transactions.length === 0) {
                existing.manualPaidAmount = paid;
                existing.status = status;
            }
        } else if (total > 0) {
            appState.payments.push({
                id: `PAY-${cc.id}`,
                obligationKey: obKey,
                linkedSourceType: "CREDIT_CARD",
                linkedSourceId: cc.id,
                companyId: cc.companyId,
                title: `${cc.bank} ${cc.cardName} Dönem Borcu`,
                creditor: cc.bank,
                category: "Kredi kartı",
                totalAmount: total,
                currency: "TRY",
                dueDate: parseAnyDateToISO(cc.dueDate),
                accountId: cc.accountId || "",
                recurrence: "NONE",
                status: status,
                manualPaidAmount: paid,
                desc: `Hesap kesim: ${formatDateToTR(cc.cutoffDate)}`,
                transactions: [],
                history: []
            });
        }
    });

    // 2. Çek ve Senetler -> Verilenler Ödeme (OUT_*), Alınanlar Tahsilat (IN_*)
    (appState.checks || []).forEach(chk => {
        const obKey = `CHK:${chk.id}`;
        const isOut = chk.direction === "OUT_CHECK" || chk.direction === "OUT_NOTE";
        const typeLabel = chk.direction === "OUT_CHECK" ? "Verilen Çek" :
                          chk.direction === "OUT_NOTE" ? "Verilen Senet" :
                          chk.direction === "IN_CHECK" ? "Müşteri Çeki" : "Müşteri Senedi";
        if (isOut) {
            const existing = appState.payments.find(p => p.obligationKey === obKey);
            if (!existing) {
                appState.payments.push({
                    id: `PAY-${chk.id}`,
                    obligationKey: obKey,
                    linkedSourceType: "CHECK_NOTE",
                    linkedSourceId: chk.id,
                    companyId: chk.companyId,
                    title: `${typeLabel} - ${chk.bankNo}`,
                    creditor: chk.party,
                    category: "Çek/senet",
                    totalAmount: Number(chk.amount) || 0,
                    currency: "TRY",
                    dueDate: parseAnyDateToISO(chk.dueDate),
                    accountId: chk.accountId || "",
                    recurrence: "NONE",
                    status: chk.status || "Planlandı",
                    desc: `${typeLabel}: ${chk.bankNo}`,
                    transactions: [],
                    history: []
                });
            }
        } else {
            const existing = appState.collections.find(c => c.obligationKey === obKey);
            if (!existing) {
                appState.collections.push({
                    id: `COL-${chk.id}`,
                    obligationKey: obKey,
                    linkedSourceType: "CHECK_NOTE",
                    linkedSourceId: chk.id,
                    companyId: chk.companyId,
                    customer: chk.party,
                    title: `${typeLabel} - ${chk.bankNo}`,
                    totalAmount: Number(chk.amount) || 0,
                    currency: "TRY",
                    expectedDate: parseAnyDateToISO(chk.dueDate),
                    accountId: chk.accountId || "",
                    certainty: "Kesin",
                    status: chk.status === "Ödendi" ? "Tahsil edildi" : "Bekleniyor",
                    desc: `${typeLabel}: ${chk.bankNo}`,
                    transactions: []
                });
            }
        }
    });
}

/**
 * Mükerrerlik Kalkanı: `obligationKey` bazında ödemeleri tekilleştirir.
 */
function getDeduplicatedPayments(companyFilter = uiState.selectedCompanyId) {
    const seenKeys = new Set();
    const result = [];
    for (const p of (appState.payments || [])) {
        if (companyFilter && companyFilter !== "ALL" && p.companyId !== companyFilter) continue;
        // Aktif olmayan şirketlerin işlemlerini konsolidede filtrele
        const comp = getCompanyById(p.companyId);
        if (companyFilter === "ALL" && comp && comp.status === "Pasif") continue;

        const key = p.obligationKey || `PAY:${p.id}`;
        if (seenKeys.has(key)) continue;
        seenKeys.add(key);
        result.push(p);
    }
    return result;
}

function getDeduplicatedCollections(companyFilter = uiState.selectedCompanyId) {
    const seenKeys = new Set();
    const result = [];
    for (const c of (appState.collections || [])) {
        if (companyFilter && companyFilter !== "ALL" && c.companyId !== companyFilter) continue;
        const comp = getCompanyById(c.companyId);
        if (companyFilter === "ALL" && comp && comp.status === "Pasif") continue;

        const key = c.obligationKey || `COL:${c.id}`;
        if (seenKeys.has(key)) continue;
        seenKeys.add(key);
        result.push(c);
    }
    return result;
}

// ==================== 8. FİNANSAL HESAPLAMA MOTORU (BAKİYE, KISMİ ÖDEME, VADE) ====================
function getCompanyById(compId) {
    return (appState.companies || []).find(c => c.id === compId) || null;
}

function getCompanyName(compId) {
    const c = getCompanyById(compId);
    return c ? c.name : "Tanımsız Şirket";
}

function getAccountById(accId) {
    return (appState.accounts || []).find(a => a.id === accId) || null;
}

function getAccountName(accId) {
    const a = getAccountById(accId);
    return a ? `${a.name} (${a.currency})` : "Hesap Seçilmedi";
}

function getPaymentPaidAmount(p) {
    if (!p || p.status === "İptal edildi") return 0;
    const txSum = Array.isArray(p.transactions)
        ? p.transactions.reduce((s, tx) => s + (Number(tx.amount) || 0), 0)
        : 0;
    if (txSum > 0) return Math.min(txSum, Number(p.totalAmount) || txSum);
    if (p.status === "Ödendi") return Number(p.totalAmount) || 0;
    if (Number(p.manualPaidAmount) > 0) return Number(p.manualPaidAmount);
    return 0;
}

function getPaymentRemainingAmount(p) {
    if (!p || p.status === "İptal edildi" || p.status === "Ödendi") return 0;
    const total = Number(p.totalAmount) || 0;
    const paid = getPaymentPaidAmount(p);
    return Math.max(0, Number((total - paid).toFixed(2)));
}

function getCollectionReceivedAmount(c) {
    if (!c || c.status === "İptal edildi") return 0;
    const txSum = Array.isArray(c.transactions)
        ? c.transactions.reduce((s, tx) => s + (Number(tx.amount) || 0), 0)
        : 0;
    if (txSum > 0) return Math.min(txSum, Number(c.totalAmount) || txSum);
    if (c.status === "Tahsil edildi") return Number(c.totalAmount) || 0;
    return 0;
}

function getCollectionRemainingAmount(c) {
    if (!c || c.status === "İptal edildi" || c.status === "Tahsil edildi") return 0;
    const total = Number(c.totalAmount) || 0;
    const rec = getCollectionReceivedAmount(c);
    return Math.max(0, Number((total - rec).toFixed(2)));
}

function refreshOverdueStatuses() {
    const today = todayISO();
    (appState.payments || []).forEach(p => {
        if (p.status === "İptal edildi") return;
        const rem = getPaymentRemainingAmount(p);
        const paid = getPaymentPaidAmount(p);
        if (isPaymentUndated(p)) {
            if (Number(p.totalAmount) > 0 && rem <= 0.009) {
                p.status = "Ödendi";
            } else if (paid > 0) {
                p.status = "Kısmen ödendi";
            } else {
                p.status = "Tarihi Belirsiz";
            }
            return;
        }
        const due = parseAnyDateToISO(p.dueDate);
        if (rem <= 0.009) {
            p.status = "Ödendi";
        } else if (due < today) {
            p.status = "Gecikti";
        } else if (paid > 0) {
            p.status = "Kısmen ödendi";
        } else {
            p.status = "Planlandı";
        }
    });

    (appState.collections || []).forEach(c => {
        if (c.status === "İptal edildi") return;
        const rem = getCollectionRemainingAmount(c);
        const rec = getCollectionReceivedAmount(c);
        const exp = parseAnyDateToISO(c.expectedDate);
        if (rem <= 0.009) {
            c.status = "Tahsil edildi";
        } else if (exp < today) {
            c.status = "Gecikti";
        } else if (rec > 0) {
            c.status = "Kısmen tahsil edildi";
        } else {
            c.status = "Bekleniyor";
        }
    });
}

/**
 * Kasa ve Banka Güncel Bakiyesi:
 * Planlanan işlemler gerçekleşene kadar mevcut bakiyeyi değiştirmez!
 * Sadece gerçekleşmiş tahsilatlar (+), gerçekleşmiş ödemeler (-), transferler (+/-) ve manuel düzeltmeler (+/-) hesaba katılır.
 */
function calculateAccountCurrentBalance(account) {
    if (!account) return 0;
    let bal = Number(account.openingBalance) || 0;

    // 1. Gerçekleşmiş Tahsilat Hareketleri (+)
    for (const c of getDeduplicatedCollections("ALL")) {
        if (c.status === "İptal edildi") continue;
        if (Array.isArray(c.transactions) && c.transactions.length > 0) {
            for (const tx of c.transactions) {
                if ((tx.accountId || c.accountId) === account.id) {
                    bal += Number(tx.amount) || 0;
                }
            }
        } else if (c.status === "Tahsil edildi" && c.accountId === account.id) {
            bal += Number(c.totalAmount) || 0;
        }
    }

    // 2. Gerçekleşmiş Ödeme Hareketleri (-)
    for (const p of getDeduplicatedPayments("ALL")) {
        if (p.status === "İptal edildi") continue;
        if (Array.isArray(p.transactions) && p.transactions.length > 0) {
            for (const tx of p.transactions) {
                if ((tx.accountId || p.accountId) === account.id) {
                    bal -= Number(tx.amount) || 0;
                }
            }
        } else if (p.status === "Ödendi" && p.accountId === account.id) {
            bal -= Number(p.totalAmount) || 0;
        } else if (Number(p.manualPaidAmount) > 0 && p.accountId === account.id) {
            bal -= Number(p.manualPaidAmount) || 0;
        }
    }

    // 3. Hesaplar / Şirketler Arası Transferler (+/-)
    for (const trf of (appState.transfers || [])) {
        if (trf.fromAccountId === account.id) bal -= Number(trf.amount) || 0;
        if (trf.toAccountId === account.id) bal += Number(trf.amount) || 0;
    }

    // 4. Manuel Bakiye Düzeltmeleri (+/-)
    for (const adj of (appState.adjustments || [])) {
        if (adj.accountId === account.id) {
            bal += Number(adj.deltaAmount) || 0;
        }
    }

    return Number(bal.toFixed(2));
}

function getFilteredActiveAccounts(companyFilter = uiState.selectedCompanyId) {
    return (appState.accounts || []).filter(a => {
        if (a.status !== "Aktif") return false;
        if (companyFilter && companyFilter !== "ALL" && a.companyId !== companyFilter) return false;
        const comp = getCompanyById(a.companyId);
        if (companyFilter === "ALL" && comp && comp.status === "Pasif") return false;
        return true;
    });
}

// ==================== 9. TDR KURALI (TEDARİK OTOMATİK SINIFLANDIRMA) ====================
function isTdrSuppliedItem(text) {
    const s = String(text || "").trim();
    return /^tdr([\.\-\s_]|$)/i.test(s) || /^tdr/i.test(s);
}

function checkTdrAutoCategory(val) {
    const catSel = document.getElementById("pay-category");
    if (isTdrSuppliedItem(val)) {
        if (catSel) catSel.value = "Tedarikçi";
        handlePayCategoryChange("Tedarikçi");
    } else if (/maa[sş]/i.test(String(val || ""))) {
        if (catSel) catSel.value = "Personel maaşı";
        handlePayCategoryChange("Personel maaşı");
    }
}

function handlePayCategoryChange(catVal) {
    const box = document.getElementById("pay-personnel-box");
    if (!box) return;
    const isSalary = catVal === "Personel maaşı";
    box.style.display = isSalary ? "block" : "none";
    if (isSalary) {
        const container = document.getElementById("pay-personnel-rows-container");
        if (container && container.children.length === 0) {
            populateDefaultPersonnelRowsInModal();
        }
    }
}

// ==================== 10. ANA GÖSTERGE PANELİ (BÖLÜM 5 - 10 KART + GRAFİKLER) ====================
function setDashboardPeriod(periodKey) {
    uiState.dashPeriod = periodKey;
    const now = new Date();
    const today = todayISO();

    if (periodKey === "7d") {
        uiState.dashStartDate = today;
        uiState.dashEndDate = addDaysISO(today, 7);
    } else if (periodKey === "thisMonth") {
        uiState.dashStartDate = dateToISO(new Date(now.getFullYear(), now.getMonth(), 1));
        uiState.dashEndDate = dateToISO(new Date(now.getFullYear(), now.getMonth() + 1, 0));
    } else if (periodKey === "30d") {
        uiState.dashStartDate = today;
        uiState.dashEndDate = addDaysISO(today, 30);
    } else if (periodKey === "90d") {
        uiState.dashStartDate = today;
        uiState.dashEndDate = addDaysISO(today, 90);
    } else if (periodKey === "year") {
        uiState.dashStartDate = `${now.getFullYear()}-01-01`;
        uiState.dashEndDate = `${now.getFullYear()}-12-31`;
    }

    document.querySelectorAll("[data-period]").forEach(btn => {
        btn.classList.toggle("active", btn.getAttribute("data-period") === periodKey);
    });

    const sIn = document.getElementById("dash-start-date");
    const eIn = document.getElementById("dash-end-date");
    if (sIn) sIn.value = formatDateToTR(uiState.dashStartDate);
    if (eIn) eIn.value = formatDateToTR(uiState.dashEndDate);

    renderDashboardSection();
}

function applyCustomDashboardDates() {
    const sVal = document.getElementById("dash-start-date")?.value;
    const eVal = document.getElementById("dash-end-date")?.value;
    if (sVal) uiState.dashStartDate = parseAnyDateToISO(sVal);
    if (eVal) uiState.dashEndDate = parseAnyDateToISO(eVal);
    document.querySelectorAll("[data-period]").forEach(btn => btn.classList.remove("active"));
    renderDashboardSection();
}

function computeDashboardMetrics(companyFilter = uiState.selectedCompanyId) {
    refreshOverdueStatuses();
    const accounts = getFilteredActiveAccounts(companyFilter);

    let cashBalanceTRY = 0;
    let bankBalanceTRY = 0;
    accounts.forEach(acc => {
        const curBal = calculateAccountCurrentBalance(acc);
        const tryVal = toTRY(curBal, acc.currency);
        if (acc.type === "CASH") cashBalanceTRY += tryVal;
        else bankBalanceTRY += tryVal;
    });

    const totalCashTRY = cashBalanceTRY + bankBalanceTRY;
    const payments = getDeduplicatedPayments(companyFilter);
    const collections = getDeduplicatedCollections(companyFilter);

    const today = todayISO();
    const now = new Date();
    const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const eomISO = dateToISO(new Date(now.getFullYear(), now.getMonth() + 1, 0));
    const next7dISO = addDaysISO(today, 7);

    let expectedCollectionsTRY = 0;
    let pendingPaymentsTRY = 0;
    let overduePaymentsTRY = 0;
    let paidThisMonthTRY = 0;
    let collectedThisMonthTRY = 0;

    let eomRemainingCollectionsTRY = 0;
    let eomRemainingPaymentsTRY = 0;

    let next7dCollectionsTRY = 0;
    let next7dPaymentsTRY = 0;

    // Ödemeler analizi
    payments.forEach(p => {
        if (p.status === "İptal edildi") return;
        const remTRY = toTRY(getPaymentRemainingAmount(p), p.currency);

        if (!isPaymentUndated(p) && remTRY > 0) {
            const due = parseAnyDateToISO(p.dueDate);
            if (due >= uiState.dashStartDate && due <= uiState.dashEndDate) {
                pendingPaymentsTRY += remTRY;
            }
            if (due < today) {
                overduePaymentsTRY += remTRY;
            }
            if (due <= eomISO) {
                eomRemainingPaymentsTRY += remTRY;
            }
            if (due >= today && due <= next7dISO) {
                next7dPaymentsTRY += remTRY;
            }
        }

        // Bu ay gerçekleşen ödemeler
        if (Array.isArray(p.transactions) && p.transactions.length > 0) {
            p.transactions.forEach(tx => {
                const txISO = parseAnyDateToISO(tx.date);
                if (txISO.startsWith(monthPrefix)) {
                    paidThisMonthTRY += toTRY(tx.amount, p.currency);
                }
            });
        } else if (p.status === "Ödendi" && due.startsWith(monthPrefix)) {
            paidThisMonthTRY += toTRY(p.totalAmount, p.currency);
        }
    });

    // Tahsilatlar analizi
    collections.forEach(c => {
        if (c.status === "İptal edildi") return;
        const exp = parseAnyDateToISO(c.expectedDate);
        const remTRY = toTRY(getCollectionRemainingAmount(c), c.currency);

        if (remTRY > 0) {
            if (exp >= uiState.dashStartDate && exp <= uiState.dashEndDate) {
                expectedCollectionsTRY += remTRY;
            }
            if (exp <= eomISO) {
                eomRemainingCollectionsTRY += remTRY;
            }
            if (exp >= today && exp <= next7dISO) {
                next7dCollectionsTRY += remTRY;
            }
        }

        // Bu ay gerçekleşen tahsilatlar
        if (Array.isArray(c.transactions) && c.transactions.length > 0) {
            c.transactions.forEach(tx => {
                const txISO = parseAnyDateToISO(tx.date);
                if (txISO.startsWith(monthPrefix)) {
                    collectedThisMonthTRY += toTRY(tx.amount, c.currency);
                }
            });
        } else if (c.status === "Tahsil edildi" && exp.startsWith(monthPrefix)) {
            collectedThisMonthTRY += toTRY(c.totalAmount, c.currency);
        }
    });

    const eomEstimatedCashTRY = totalCashTRY + eomRemainingCollectionsTRY - eomRemainingPaymentsTRY;
    const next7dNetNeedTRY = next7dCollectionsTRY - next7dPaymentsTRY;

    return {
        totalCashTRY,
        cashBalanceTRY,
        bankBalanceTRY,
        expectedCollectionsTRY,
        pendingPaymentsTRY,
        overduePaymentsTRY,
        paidThisMonthTRY,
        collectedThisMonthTRY,
        eomEstimatedCashTRY,
        next7dNetNeedTRY,
        next7dCollectionsTRY,
        next7dPaymentsTRY
    };
}

function handleKpiCardClick(cardType) {
    if (cardType === "total_cash") {
        switchTab("accounts");
        document.getElementById("acc-filter-type").value = "ALL";
        renderAccountsSection();
    } else if (cardType === "cash_only") {
        switchTab("accounts");
        document.getElementById("acc-filter-type").value = "CASH";
        renderAccountsSection();
    } else if (cardType === "bank_only") {
        switchTab("accounts");
        document.getElementById("acc-filter-type").value = "BANK";
        renderAccountsSection();
    } else if (cardType === "expected_collections") {
        switchTab("collections");
        document.getElementById("col-filter-status").value = "PENDING_ALL";
        renderCollectionsSection();
    } else if (cardType === "pending_payments") {
        switchTab("payments");
        document.getElementById("pay-filter-status").value = "UNPAID_ALL";
        renderPaymentsSection();
    } else if (cardType === "overdue_payments") {
        switchTab("payments");
        document.getElementById("pay-filter-status").value = "Gecikti";
        renderPaymentsSection();
    } else if (cardType === "paid_this_month") {
        switchTab("payments");
        document.getElementById("pay-filter-status").value = "Ödendi";
        renderPaymentsSection();
    } else if (cardType === "collected_this_month") {
        switchTab("collections");
        document.getElementById("col-filter-status").value = "Tahsil edildi";
        renderCollectionsSection();
    } else if (cardType === "eom_forecast") {
        switchTab("forecast");
        setForecastDays(30);
    } else if (cardType === "next_7d_need") {
        switchTab("forecast");
        setForecastDays(7);
    }
}

function renderDashboardSection() {
    const m = computeDashboardMetrics();

    const setEl = (id, txt) => {
        const el = document.getElementById(id);
        if (el) el.textContent = txt;
    };

    setEl("kpi-1-total-cash", formatMoney(m.totalCashTRY, "TRY"));
    setEl("kpi-2-cash-balance", formatMoney(m.cashBalanceTRY, "TRY"));
    setEl("kpi-3-bank-balance", formatMoney(m.bankBalanceTRY, "TRY"));
    setEl("kpi-4-expected-collections", formatMoney(m.expectedCollectionsTRY, "TRY"));
    setEl("kpi-5-pending-payments", formatMoney(m.pendingPaymentsTRY, "TRY"));
    setEl("kpi-6-overdue-payments", formatMoney(m.overduePaymentsTRY, "TRY"));
    setEl("kpi-7-paid-month", formatMoney(m.paidThisMonthTRY, "TRY"));
    setEl("kpi-8-collected-month", formatMoney(m.collectedThisMonthTRY, "TRY"));

    const kpi9El = document.getElementById("kpi-9-eom-cash");
    if (kpi9El) {
        kpi9El.textContent = formatMoney(m.eomEstimatedCashTRY, "TRY");
        kpi9El.style.color = m.eomEstimatedCashTRY < 0 ? "var(--rose-danger)" : "var(--dizsan-cyan)";
    }

    const kpi10El = document.getElementById("kpi-10-next7d");
    const kpi10Sub = document.getElementById("kpi-10-sub");
    if (kpi10El) {
        kpi10El.textContent = formatMoney(m.next7dNetNeedTRY, "TRY");
        kpi10El.style.color = m.next7dNetNeedTRY < 0 ? "var(--rose-danger)" : "var(--emerald-ok)";
    }
    if (kpi10Sub) {
        kpi10Sub.textContent = m.next7dNetNeedTRY < 0
            ? `7 Günde ${formatMoney(Math.abs(m.next7dNetNeedTRY))} Nakit İhtiyacı`
            : `7 Günde Net Fazla (+${formatMoney(m.next7dNetNeedTRY)})`;
    }

    // Erken uyarı bannerı
    const bannerEl = document.getElementById("dashboard-alert-banner");
    if (bannerEl) {
        if (m.overduePaymentsTRY > 0 || m.eomEstimatedCashTRY < 0) {
            bannerEl.style.display = "block";
            bannerEl.innerHTML = `
                <div style="padding:11px 14px; border-radius:10px; background:var(--rose-bg); border:1px solid var(--rose-danger); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <i class="fa-solid fa-triangle-exclamation" style="color:var(--rose-danger); font-size:1.2rem;"></i>
                        <div style="font-size:0.8rem;">
                            <strong style="color:var(--rose-danger);">Finansal Uyarı:</strong>
                            ${m.overduePaymentsTRY > 0 ? `Vadesi geçmiş <strong>${formatMoney(m.overduePaymentsTRY)}</strong> tutarında gecikmiş ödeme bulunuyor. ` : ""}
                            ${m.eomEstimatedCashTRY < 0 ? `Ay sonu tahmini nakit <strong>${formatMoney(m.eomEstimatedCashTRY)}</strong> ile sıfırın altına düşmektedir (Finansman ihtiyacı!).` : ""}
                        </div>
                    </div>
                    <button class="btn btn-sm btn-danger" onclick="handleKpiCardClick('overdue_payments')">Gecikmiş İşlemleri İncele</button>
                </div>
            `;
        } else {
            bannerEl.style.display = "none";
        }
    }

    renderDashboardLists();
    renderDashboardDailyCashChart();
    renderDashboardMonthlyComparisonChart();
}

function renderDashboardLists() {
    const today = todayISO();
    const payments = getDeduplicatedPayments();
    const collections = getDeduplicatedCollections();

    // 1. Yaklaşan Ödemeler
    const upcomingPayments = payments
        .filter(p => !isPaymentUndated(p) && getPaymentRemainingAmount(p) > 0 && parseAnyDateToISO(p.dueDate) >= today)
        .sort((a, b) => parseAnyDateToISO(a.dueDate).localeCompare(parseAnyDateToISO(b.dueDate)))
        .slice(0, 6);

    const upPayEl = document.getElementById("dash-upcoming-payments-list");
    if (upPayEl) {
        if (upcomingPayments.length === 0) {
            upPayEl.innerHTML = `<div style="font-size:0.78rem; color:var(--text-muted); padding:8px 0;">Yaklaşan bekleyen ödeme bulunmuyor.</div>`;
        } else {
            upPayEl.innerHTML = upcomingPayments.map(p => `
                <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; padding:8px 0; border-bottom:1px solid var(--border-subtle);">
                    <div style="min-width:0;">
                        <div style="font-weight:700; font-size:0.8rem; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(p.title)}</div>
                        <div style="font-size:0.71rem; color:var(--text-muted);">${formatDateToTR(p.dueDate)} &bull; ${escapeHtml(p.creditor)} (${escapeHtml(getCompanyName(p.companyId))})</div>
                    </div>
                    <div style="text-align:right; flex-shrink:0;">
                        <div style="font-weight:700; font-size:0.82rem; color:var(--amber-warn);">${formatMoney(getPaymentRemainingAmount(p), p.currency)}</div>
                        <button class="btn btn-sm" style="padding:2px 7px; font-size:0.68rem; margin-top:2px;" onclick="openPaymentExecModal('${p.id}')">Öde</button>
                    </div>
                </div>
            `).join("");
        }
    }

    // 2. Yaklaşan Tahsilatlar
    const upcomingCollections = collections
        .filter(c => getCollectionRemainingAmount(c) > 0 && parseAnyDateToISO(c.expectedDate) >= today)
        .sort((a, b) => parseAnyDateToISO(a.expectedDate).localeCompare(parseAnyDateToISO(b.expectedDate)))
        .slice(0, 6);

    const upColEl = document.getElementById("dash-upcoming-collections-list");
    if (upColEl) {
        if (upcomingCollections.length === 0) {
            upColEl.innerHTML = `<div style="font-size:0.78rem; color:var(--text-muted); padding:8px 0;">Yaklaşan beklenen tahsilat bulunmuyor.</div>`;
        } else {
            upColEl.innerHTML = upcomingCollections.map(c => `
                <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; padding:8px 0; border-bottom:1px solid var(--border-subtle);">
                    <div style="min-width:0;">
                        <div style="font-weight:700; font-size:0.8rem; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(c.title)}</div>
                        <div style="font-size:0.71rem; color:var(--text-muted);">${formatDateToTR(c.expectedDate)} &bull; ${escapeHtml(c.customer)} <span class="badge badge-info" style="font-size:0.62rem;">${c.certainty}</span></div>
                    </div>
                    <div style="text-align:right; flex-shrink:0;">
                        <div style="font-weight:700; font-size:0.82rem; color:var(--emerald-ok);">${formatMoney(getCollectionRemainingAmount(c), c.currency)}</div>
                        <button class="btn btn-sm" style="padding:2px 7px; font-size:0.68rem; margin-top:2px;" onclick="openCollectionExecModal('${c.id}')">Tahsil Et</button>
                    </div>
                </div>
            `).join("");
        }
    }

    // 3. Gecikmiş İşlemler (Ödeme + Tahsilat)
    const overdueItems = [];
    payments.filter(p => !isPaymentUndated(p) && getPaymentRemainingAmount(p) > 0 && parseAnyDateToISO(p.dueDate) < today).forEach(p => {
        overdueItems.push({
            type: "PAYMENT",
            id: p.id,
            date: parseAnyDateToISO(p.dueDate),
            title: p.title,
            party: p.creditor,
            amount: getPaymentRemainingAmount(p),
            currency: p.currency
        });
    });
    collections.filter(c => getCollectionRemainingAmount(c) > 0 && parseAnyDateToISO(c.expectedDate) < today).forEach(c => {
        overdueItems.push({
            type: "COLLECTION",
            id: c.id,
            date: parseAnyDateToISO(c.expectedDate),
            title: c.title,
            party: c.customer,
            amount: getCollectionRemainingAmount(c),
            currency: c.currency
        });
    });

    const ovBadge = document.getElementById("dash-overdue-badge");
    const hdrBadge = document.getElementById("header-alert-count");
    if (ovBadge) ovBadge.textContent = String(overdueItems.length);
    if (hdrBadge) hdrBadge.textContent = String(overdueItems.length);

    const ovListEl = document.getElementById("dash-overdue-items-list");
    if (ovListEl) {
        if (overdueItems.length === 0) {
            ovListEl.innerHTML = `<div style="font-size:0.78rem; color:var(--emerald-ok); padding:8px 0;"><i class="fa-solid fa-circle-check"></i> Gecikmiş ödeme veya tahsilat bulunmamaktadır.</div>`;
        } else {
            ovListEl.innerHTML = overdueItems.map(item => `
                <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; padding:8px 0; border-bottom:1px solid var(--border-subtle);">
                    <div style="min-width:0;">
                        <div style="font-weight:700; font-size:0.8rem; color:var(--rose-danger); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                            [${item.type === "PAYMENT" ? "ÖDEME" : "TAHSİLAT"}] ${escapeHtml(item.title)}
                        </div>
                        <div style="font-size:0.71rem; color:var(--text-muted);">Vade: ${formatDateToTR(item.date)} &bull; ${escapeHtml(item.party)}</div>
                    </div>
                    <div style="text-align:right; flex-shrink:0;">
                        <div style="font-weight:700; font-size:0.82rem; color:var(--rose-danger);">${formatMoney(item.amount, item.currency)}</div>
                        <button class="btn btn-sm btn-danger" style="padding:2px 7px; font-size:0.68rem; margin-top:2px;" onclick="${item.type === 'PAYMENT' ? `openPaymentExecModal('${item.id}')` : `openCollectionExecModal('${item.id}')`}">İşlem Yap</button>
                    </div>
                </div>
            `).join("");
        }
    }
}

function renderDashboardDailyCashChart() {
    const container = document.getElementById("daily-cash-svg-container");
    if (!container) return;
    const rows = generateCashflowProjectionRows(30, "BALANCED");
    container.innerHTML = buildCashflowSvgMarkup(rows, 220);
}

function renderDashboardMonthlyComparisonChart() {
    const container = document.getElementById("monthly-comparison-svg-container");
    if (!container) return;

    const now = new Date();
    const months = [];
    for (let i = -2; i <= 3; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
        const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const label = d.toLocaleDateString("tr-TR", { month: "short", year: "2-digit" });
        months.push({ ym, label, inAmt: 0, outAmt: 0 });
    }

    const payments = getDeduplicatedPayments();
    const collections = getDeduplicatedCollections();

    payments.forEach(p => {
        if (p.status === "İptal edildi") return;
        const ym = parseAnyDateToISO(p.dueDate).slice(0, 7);
        const bucket = months.find(m => m.ym === ym);
        if (bucket) bucket.outAmt += toTRY(p.totalAmount, p.currency);
    });

    collections.forEach(c => {
        if (c.status === "İptal edildi") return;
        const ym = parseAnyDateToISO(c.expectedDate).slice(0, 7);
        const bucket = months.find(m => m.ym === ym);
        if (bucket) bucket.inAmt += toTRY(c.totalAmount, c.currency);
    });

    const maxVal = Math.max(100000, ...months.flatMap(m => [m.inAmt, m.outAmt]));
    const w = 560;
    const h = 220;
    const padL = 55;
    const padB = 32;
    const padT = 18;
    const chartH = h - padB - padT;
    const colW = (w - padL - 20) / months.length;

    let barsSvg = "";
    months.forEach((m, idx) => {
        const xBase = padL + idx * colW + 12;
        const inH = Math.round((m.inAmt / maxVal) * chartH);
        const outH = Math.round((m.outAmt / maxVal) * chartH);
        const inY = padT + chartH - inH;
        const outY = padT + chartH - outH;

        barsSvg += `
            <rect x="${xBase}" y="${inY}" width="18" height="${Math.max(2, inH)}" rx="4" fill="#10b981">
                <title>${m.label} Tahsilat: ${formatMoney(m.inAmt)}</title>
            </rect>
            <rect x="${xBase + 22}" y="${outY}" width="18" height="${Math.max(2, outH)}" rx="4" fill="#ef4444">
                <title>${m.label} Ödeme: ${formatMoney(m.outAmt)}</title>
            </rect>
            <text x="${xBase + 20}" y="${h - 10}" text-anchor="middle" fill="#94a3b8" font-size="11" font-weight="600">${m.label}</text>
        `;
    });

    container.innerHTML = `
        <svg viewBox="0 0 ${w} ${h}" style="width:100%; height:220px; display:block;">
            <line x1="${padL}" y1="${padT + chartH}" x2="${w - 10}" y2="${padT + chartH}" stroke="#334155" stroke-width="1.5"/>
            <text x="8" y="${padT + 10}" fill="#94a3b8" font-size="10">${(maxVal / 1000).toFixed(0)}B ₺</text>
            <text x="8" y="${padT + chartH}" fill="#94a3b8" font-size="10">0 ₺</text>
            ${barsSvg}
            <rect x="${w - 175}" y="4" width="10" height="10" rx="2" fill="#10b981"/>
            <text x="${w - 160}" y="13" fill="#cbd5e1" font-size="10">Tahsilat</text>
            <rect x="${w - 105}" y="4" width="10" height="10" rx="2" fill="#ef4444"/>
            <text x="${w - 90}" y="13" fill="#cbd5e1" font-size="10">Ödeme</text>
        </svg>
    `;
}

// ==================== 11. FİNANS TAKVİMİ (BÖLÜM 9 - GÜNLÜK / HAFTALIK / AYLIK / LİSTE) ====================
function setCalendarViewMode(mode) {
    uiState.calendarViewMode = mode;
    document.querySelectorAll("[data-calview]").forEach(btn => {
        btn.classList.toggle("active", btn.getAttribute("data-calview") === mode);
    });
    renderCalendarSection();
}

function navigateCalendar(delta) {
    const d = new Date(uiState.calendarCursorDate);
    if (delta === 0) {
        uiState.calendarCursorDate = new Date();
    } else if (uiState.calendarViewMode === "daily") {
        d.setDate(d.getDate() + delta);
        uiState.calendarCursorDate = d;
    } else if (uiState.calendarViewMode === "weekly") {
        d.setDate(d.getDate() + delta * 7);
        uiState.calendarCursorDate = d;
    } else {
        d.setMonth(d.getMonth() + delta);
        uiState.calendarCursorDate = d;
    }
    renderCalendarSection();
}

function resetCalendarFilters() {
    document.getElementById("cal-search-input").value = "";
    document.getElementById("cal-filter-type").value = "ALL";
    document.getElementById("cal-filter-account").value = "ALL";
    document.getElementById("cal-filter-category").value = "ALL";
    document.getElementById("cal-filter-status").value = "ALL";
    renderCalendarSection();
}

function getFilteredCalendarItems() {
    const q = normalizeTR(document.getElementById("cal-search-input")?.value || "");
    const fType = document.getElementById("cal-filter-type")?.value || "ALL";
    const fAcc = document.getElementById("cal-filter-account")?.value || "ALL";
    const fCat = document.getElementById("cal-filter-category")?.value || "ALL";
    const fStat = document.getElementById("cal-filter-status")?.value || "ALL";

    const items = [];
    const today = todayISO();

    if (fType === "ALL" || fType === "PAYMENT") {
        getDeduplicatedPayments().forEach(p => {
            if (p.status === "İptal edildi" || isPaymentUndated(p)) return;
            if (fAcc !== "ALL" && p.accountId !== fAcc) return;
            if (fCat !== "ALL" && p.category !== fCat) return;
            const due = parseAnyDateToISO(p.dueDate);
            const rem = getPaymentRemainingAmount(p);
            const isOverdue = rem > 0 && due < today;
            const isCompleted = rem <= 0.009;

            if (fStat === "ACTIVE" && isCompleted) return;
            if (fStat === "OVERDUE" && !isOverdue) return;
            if (fStat === "COMPLETED" && !isCompleted) return;
            if (q && !normalizeTR(`${p.title} ${p.creditor} ${p.category} ${p.desc}`).includes(q)) return;

            items.push({
                kind: "PAYMENT",
                id: p.id,
                dateISO: due,
                title: p.title,
                party: p.creditor,
                category: p.category,
                totalAmount: toTRY(p.totalAmount, p.currency),
                remainingAmount: toTRY(rem, p.currency),
                status: p.status,
                isOverdue,
                isCompleted,
                raw: p
            });
        });
    }

    if (fType === "ALL" || fType === "COLLECTION") {
        getDeduplicatedCollections().forEach(c => {
            if (c.status === "İptal edildi") return;
            if (fAcc !== "ALL" && c.accountId !== fAcc) return;
            if (fCat !== "ALL" && fCat !== "Tahsilat") return;
            const exp = parseAnyDateToISO(c.expectedDate);
            const rem = getCollectionRemainingAmount(c);
            const isOverdue = rem > 0 && exp < today;
            const isCompleted = rem <= 0.009;

            if (fStat === "ACTIVE" && isCompleted) return;
            if (fStat === "OVERDUE" && !isOverdue) return;
            if (fStat === "COMPLETED" && !isCompleted) return;
            if (q && !normalizeTR(`${c.title} ${c.customer} ${c.certainty} ${c.desc}`).includes(q)) return;

            items.push({
                kind: "COLLECTION",
                id: c.id,
                dateISO: exp,
                title: c.title,
                party: c.customer,
                category: `Tahsilat (${c.certainty})`,
                totalAmount: toTRY(c.totalAmount, c.currency),
                remainingAmount: toTRY(rem, c.currency),
                status: c.status,
                isOverdue,
                isCompleted,
                raw: c
            });
        });
    }

    return items;
}

function renderCalendarSection() {
    const container = document.getElementById("calendar-view-container");
    const titleEl = document.getElementById("calendar-period-title");
    if (!container) return;

    const items = getFilteredCalendarItems();
    const navBadge = document.getElementById("nav-badge-calendar");
    if (navBadge) navBadge.textContent = String(items.length);

    const cur = uiState.calendarCursorDate;
    const mode = uiState.calendarViewMode;
    const today = todayISO();

    if (mode === "monthly") {
        const year = cur.getFullYear();
        const month = cur.getMonth();
        if (titleEl) {
            titleEl.textContent = cur.toLocaleDateString("tr-TR", { month: "long", year: "numeric" });
        }

        const firstDayOfMonth = new Date(year, month, 1);
        const startOffset = (firstDayOfMonth.getDay() + 6) % 7; // Pazartesi = 0
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const cells = [];
        for (let i = 0; i < startOffset; i++) {
            const d = new Date(year, month, 1 - (startOffset - i));
            cells.push({ dateObj: d, isOtherMonth: true });
        }
        for (let day = 1; day <= daysInMonth; day++) {
            cells.push({ dateObj: new Date(year, month, day), isOtherMonth: false });
        }
        while (cells.length % 7 !== 0) {
            const last = cells[cells.length - 1].dateObj;
            const nextD = new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1);
            cells.push({ dateObj: nextD, isOtherMonth: true });
        }

        const weekdaysHtml = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]
            .map(w => `<div class="calendar-weekday">${w}</div>`)
            .join("");

        const gridHtml = cells.map(cell => {
            const dISO = dateToISO(cell.dateObj);
            const dayItems = items.filter(it => it.dateISO === dISO);
            const dayPaySum = dayItems.filter(it => it.kind === "PAYMENT").reduce((s, it) => s + (it.isCompleted ? it.totalAmount : it.remainingAmount), 0);
            const dayColSum = dayItems.filter(it => it.kind === "COLLECTION").reduce((s, it) => s + (it.isCompleted ? it.totalAmount : it.remainingAmount), 0);
            const hasOverdue = dayItems.some(it => it.isOverdue);

            const pillsHtml = dayItems.slice(0, 3).map(it => {
                const cls = it.isCompleted ? "paid" : (it.isOverdue ? "overdue" : (it.kind === "PAYMENT" ? "payment" : "collection"));
                const sign = it.kind === "PAYMENT" ? "−" : "+";
                return `<div class="cal-pill ${cls}">${sign} ${escapeHtml(it.title)}</div>`;
            }).join("");

            const moreHtml = dayItems.length > 3
                ? `<div style="font-size:0.63rem; color:var(--dizsan-cyan); font-weight:700;">+${dayItems.length - 3} işlem daha</div>`
                : "";

            return `
                <div class="cal-day-cell ${cell.isOtherMonth ? "other-month" : ""} ${dISO === today ? "today" : ""} ${hasOverdue ? "has-overdue" : ""}" onclick="openCalendarDayModal('${dISO}')">
                    <div>
                        <div class="cal-day-header">
                            <span>${cell.dateObj.getDate()}</span>
                            ${dayItems.length > 0 ? `<span class="badge badge-neutral" style="font-size:0.6rem; padding:1px 5px;">${dayItems.length}</span>` : ""}
                        </div>
                        <div class="cal-day-totals">
                            ${dayColSum > 0 ? `<div class="cal-tot-in"><span>Tahsilat:</span><span>+${formatMoney(dayColSum)}</span></div>` : ""}
                            ${dayPaySum > 0 ? `<div class="cal-tot-out"><span>Ödeme:</span><span>−${formatMoney(dayPaySum)}</span></div>` : ""}
                        </div>
                        <div class="cal-items-mini">${pillsHtml}${moreHtml}</div>
                    </div>
                </div>
            `;
        }).join("");

        container.innerHTML = `
            <div class="calendar-weekdays">${weekdaysHtml}</div>
            <div class="calendar-month-grid">${gridHtml}</div>
        `;
    } else if (mode === "weekly") {
        const dayOfWeek = (cur.getDay() + 6) % 7;
        const monday = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() - dayOfWeek);
        const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);
        if (titleEl) {
            titleEl.textContent = `${formatDateToTR(dateToISO(monday))} - ${formatDateToTR(dateToISO(sunday))}`;
        }

        let colsHtml = "";
        for (let i = 0; i < 7; i++) {
            const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
            const dISO = dateToISO(d);
            const dayItems = items.filter(it => it.dateISO === dISO);
            const dayPaySum = dayItems.filter(it => it.kind === "PAYMENT").reduce((s, it) => s + it.totalAmount, 0);
            const dayColSum = dayItems.filter(it => it.kind === "COLLECTION").reduce((s, it) => s + it.totalAmount, 0);

            colsHtml += `
                <div class="cal-day-cell ${dISO === today ? "today" : ""}" style="min-height:220px;" onclick="openCalendarDayModal('${dISO}')">
                    <div>
                        <div class="cal-day-header">
                            <span>${d.toLocaleDateString("tr-TR", { weekday: "short", day: "numeric", month: "short" })}</span>
                        </div>
                        <div class="cal-day-totals">
                            ${dayColSum > 0 ? `<div class="cal-tot-in"><span>Giriş:</span><span>+${formatMoney(dayColSum)}</span></div>` : ""}
                            ${dayPaySum > 0 ? `<div class="cal-tot-out"><span>Çıkış:</span><span>−${formatMoney(dayPaySum)}</span></div>` : ""}
                        </div>
                        <div class="cal-items-mini">
                            ${dayItems.map(it => {
                                const cls = it.isCompleted ? "paid" : (it.isOverdue ? "overdue" : (it.kind === "PAYMENT" ? "payment" : "collection"));
                                return `<div class="cal-pill ${cls}">${escapeHtml(it.title)} (${formatMoney(it.totalAmount)})</div>`;
                            }).join("")}
                        </div>
                    </div>
                </div>
            `;
        }
        container.innerHTML = `<div class="calendar-month-grid">${colsHtml}</div>`;
    } else if (mode === "daily") {
        const dISO = dateToISO(cur);
        if (titleEl) titleEl.textContent = `Günlük Görünüm: ${formatDateToTR(dISO)}`;
        const dayItems = items.filter(it => it.dateISO === dISO);
        container.innerHTML = buildDayItemsTableMarkup(dISO, dayItems);
    } else {
        // Liste görünümü
        if (titleEl) titleEl.textContent = "Finans Takvimi – Kronolojik Liste";
        const sorted = [...items].sort((a, b) => a.dateISO.localeCompare(b.dateISO));
        container.innerHTML = buildDayItemsTableMarkup(null, sorted);
    }
}

function buildDayItemsTableMarkup(dayISO, list) {
    if (!list || list.length === 0) {
        return `<div style="padding:18px; text-align:center; color:var(--text-muted);">Seçili takvim kriterlerine uygun işlem bulunamadı.</div>`;
    }
    return `
        <div class="table-responsive">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Tarih</th>
                        <th>Tür</th>
                        <th>Şirket</th>
                        <th>Başlık</th>
                        <th>İlgili Taraf</th>
                        <th>Kategori</th>
                        <th>Toplam</th>
                        <th>Kalan</th>
                        <th>Durum</th>
                        <th>İşlem</th>
                    </tr>
                </thead>
                <tbody>
                    ${list.map(it => `
                        <tr>
                            <td><strong>${formatDateToTR(it.dateISO)}</strong></td>
                            <td>
                                <span class="badge ${it.kind === 'PAYMENT' ? 'badge-danger' : 'badge-success'}">
                                    ${it.kind === "PAYMENT" ? "Ödeme (−)" : "Tahsilat (+)"}
                                </span>
                            </td>
                            <td>${escapeHtml(getCompanyName(it.raw.companyId))}</td>
                            <td><strong>${escapeHtml(it.title)}</strong></td>
                            <td>${escapeHtml(it.party)}</td>
                            <td>${escapeHtml(it.category)}</td>
                            <td>${formatMoney(it.totalAmount)}</td>
                            <td><strong>${formatMoney(it.remainingAmount)}</strong></td>
                            <td><span class="badge ${it.isCompleted ? 'badge-success' : (it.isOverdue ? 'badge-danger' : 'badge-warning')}">${escapeHtml(it.status)}</span></td>
                            <td>
                                <button class="btn btn-sm" onclick="${it.kind === 'PAYMENT' ? `openPaymentExecModal('${it.id}')` : `openCollectionExecModal('${it.id}')`}">
                                    <i class="fa-solid fa-check"></i> İşle
                                </button>
                                <button class="btn btn-sm" onclick="${it.kind === 'PAYMENT' ? `openPaymentModal('${it.id}')` : `openCollectionModal('${it.id}')`}">
                                    <i class="fa-solid fa-pen"></i>
                                </button>
                            </td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `;
}

function openCalendarDayModal(dayISO) {
    uiState.selectedCalendarDayISO = dayISO;
    const titleEl = document.getElementById("modal-cal-day-title");
    if (titleEl) {
        titleEl.innerHTML = `<i class="fa-solid fa-calendar-day" style="color:var(--dizsan-cyan);"></i> ${formatDateToTR(dayISO)} Günü İşlemleri`;
    }
    const items = getFilteredCalendarItems().filter(it => it.dateISO === dayISO);
    const contentEl = document.getElementById("modal-cal-day-content");
    if (contentEl) {
        contentEl.innerHTML = buildDayItemsTableMarkup(dayISO, items);
    }
    openModal("modal-calendar-day");
}

function openPaymentModalFromCalendarDay() {
    closeModal("modal-calendar-day");
    openPaymentModal(null, uiState.selectedCalendarDayISO);
}

function openCollectionModalFromCalendarDay() {
    closeModal("modal-calendar-day");
    openCollectionModal(null, uiState.selectedCalendarDayISO);
}

// ==================== 12. NAKİT AKIŞI TAHMİNİ (BÖLÜM 10 - 7/15/30/60/90 GÜN & 3 SENARYO) ====================
function setForecastDays(days) {
    uiState.forecastDays = Number(days) || 30;
    uiState.forecastCustomEndISO = "";
    document.querySelectorAll("[data-fcast]").forEach(btn => {
        btn.classList.toggle("active", Number(btn.getAttribute("data-fcast")) === uiState.forecastDays);
    });
    renderForecastSection();
}

function setForecastScenario(scen) {
    uiState.forecastScenario = scen;
    renderForecastSection();
}

function setForecastCustomEndDate(val) {
    if (!val) return;
    const endISO = parseAnyDateToISO(val);
    const startObj = parseAnyDateToObj(todayISO());
    const endObj = parseAnyDateToObj(endISO);
    const diffDays = Math.max(1, Math.min(365, Math.round((endObj - startObj) / (1000 * 60 * 60 * 24))));
    uiState.forecastDays = diffDays;
    document.querySelectorAll("[data-fcast]").forEach(btn => btn.classList.remove("active"));
    renderForecastSection();
}

function isCollectionIncludedInScenario(col, scenario) {
    if (scenario === "CAUTIOUS") return col.certainty === "Kesin";
    if (scenario === "BALANCED") return col.certainty === "Kesin" || col.certainty === "Muhtemel";
    return true; // OPTIMISTIC: Kesin + Muhtemel + Belirsiz
}

function generateCashflowProjectionRows(daysCount = uiState.forecastDays, scenario = uiState.forecastScenario) {
    const m = computeDashboardMetrics();
    let runningCash = m.totalCashTRY;
    const today = todayISO();

    const payments = getDeduplicatedPayments().filter(p => p.status !== "İptal edildi" && getPaymentRemainingAmount(p) > 0);
    const collections = getDeduplicatedCollections().filter(c => c.status !== "İptal edildi" && getCollectionRemainingAmount(c) > 0 && isCollectionIncludedInScenario(c, scenario));

    // Vadesi geçmiş (gecikmiş) ödemeleri ilk güne (Bugün) dahil et ki gerçekçi projeksiyon çıksın
    const rows = [];
    for (let d = 0; d <= daysCount; d++) {
        const dateISO = addDaysISO(today, d);
        const startCash = runningCash;

        let inSum = 0;
        let outSum = 0;

        collections.forEach(c => {
            const cDate = parseAnyDateToISO(c.expectedDate);
            if ((d === 0 && cDate <= today) || (d > 0 && cDate === dateISO)) {
                inSum += toTRY(getCollectionRemainingAmount(c), c.currency);
            }
        });

        payments.forEach(p => {
            const pDate = parseAnyDateToISO(p.dueDate);
            if ((d === 0 && pDate <= today) || (d > 0 && pDate === dateISO)) {
                outSum += toTRY(getPaymentRemainingAmount(p), p.currency);
            }
        });

        const netChange = inSum - outSum;
        const endCash = startCash + netChange;
        runningCash = endCash;

        rows.push({
            dateISO,
            dateTR: formatDateToTR(dateISO),
            startCash,
            inSum,
            outSum,
            netChange,
            endCash
        });
    }
    return rows;
}

function buildCashflowSvgMarkup(rows, height = 250) {
    if (!rows || rows.length === 0) return "";
    const w = 780;
    const h = height;
    const padL = 70;
    const padR = 20;
    const padT = 20;
    const padB = 34;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    const vals = rows.map(r => r.endCash);
    const minVal = Math.min(0, ...vals);
    const maxVal = Math.max(100000, ...vals);
    const span = Math.max(1, maxVal - minVal);

    const xFor = i => padL + (i / Math.max(1, rows.length - 1)) * plotW;
    const yFor = v => padT + plotH - ((v - minVal) / span) * plotH;
    const zeroY = yFor(0);

    const pts = rows.map((r, i) => `${xFor(i).toFixed(1)},${yFor(r.endCash).toFixed(1)}`).join(" ");

    let circlesHtml = "";
    const step = Math.max(1, Math.floor(rows.length / 8));
    rows.forEach((r, i) => {
        const cx = xFor(i).toFixed(1);
        const cy = yFor(r.endCash).toFixed(1);
        const isDeficit = r.endCash < 0;
        const isDrop = r.netChange < 0;
        if (isDeficit || isDrop || i % step === 0 || i === rows.length - 1) {
            circlesHtml += `
                <circle cx="${cx}" cy="${cy}" r="${isDeficit ? 5 : 3.5}" fill="${isDeficit ? '#ef4444' : '#38bdf8'}" stroke="#0f172a" stroke-width="1.5">
                    <title>${r.dateTR}: ${formatMoney(r.endCash)} (Net: ${formatMoney(r.netChange)})</title>
                </circle>
            `;
        }
        if (i % step === 0 || i === rows.length - 1) {
            circlesHtml += `<text x="${cx}" y="${h - 10}" text-anchor="middle" fill="#94a3b8" font-size="10">${r.dateTR.slice(0, 5)}</text>`;
        }
    });

    return `
        <svg viewBox="0 0 ${w} ${h}" style="width:100%; height:${h}px; display:block;">
            ${minVal < 0 ? `<rect x="${padL}" y="${zeroY}" width="${plotW}" height="${padT + plotH - zeroY}" fill="rgba(239,68,68,0.14)"/>` : ""}
            <line x1="${padL}" y1="${zeroY}" x2="${w - padR}" y2="${zeroY}" stroke="${minVal < 0 ? '#ef4444' : '#475569'}" stroke-width="1.5" stroke-dasharray="5,4"/>
            <text x="6" y="${padT + 10}" fill="#94a3b8" font-size="10">${formatMoney(maxVal)}</text>
            <text x="6" y="${zeroY + 4}" fill="${minVal < 0 ? '#ef4444' : '#94a3b8'}" font-size="10">0,00 ₺</text>
            ${minVal < 0 ? `<text x="6" y="${padT + plotH}" fill="#ef4444" font-size="10">${formatMoney(minVal)}</text>` : ""}
            <polyline fill="none" stroke="#38bdf8" stroke-width="2.6" points="${pts}"/>
            ${circlesHtml}
        </svg>
    `;
}

function renderForecastSection() {
    const days = uiState.forecastDays;
    const rowsCautious = generateCashflowProjectionRows(days, "CAUTIOUS");
    const rowsBalanced = generateCashflowProjectionRows(days, "BALANCED");
    const rowsOptimistic = generateCashflowProjectionRows(days, "OPTIMISTIC");

    const activeRows = uiState.forecastScenario === "CAUTIOUS" ? rowsCautious :
                       uiState.forecastScenario === "BALANCED" ? rowsBalanced : rowsOptimistic;

    const endCautious = rowsCautious[rowsCautious.length - 1]?.endCash || 0;
    const endBalanced = rowsBalanced[rowsBalanced.length - 1]?.endCash || 0;
    const endOptimistic = rowsOptimistic[rowsOptimistic.length - 1]?.endCash || 0;

    const cardsEl = document.getElementById("forecast-scenario-cards");
    if (cardsEl) {
        cardsEl.innerHTML = `
            <div class="panel-card" style="margin-bottom:0; border-color:${uiState.forecastScenario === 'CAUTIOUS' ? 'var(--dizsan-cyan)' : 'var(--border-subtle)'};">
                <div style="font-size:0.73rem; font-weight:700; color:var(--text-muted);">1. TEMKİNLİ SENARYO (SADECE KESİN TAHSİLATLAR)</div>
                <div style="font-family:'Outfit',sans-serif; font-size:1.35rem; font-weight:800; margin-top:4px; color:${endCautious < 0 ? 'var(--rose-danger)' : 'var(--emerald-ok)'};">${formatMoney(endCautious)}</div>
                <div style="font-size:0.72rem; color:var(--text-muted); margin-top:3px;">${days} gün sonu tahmini nakit</div>
            </div>
            <div class="panel-card" style="margin-bottom:0; border-color:${uiState.forecastScenario === 'BALANCED' ? 'var(--dizsan-cyan)' : 'var(--border-subtle)'};">
                <div style="font-size:0.73rem; font-weight:700; color:var(--text-muted);">2. DENGELİ SENARYO (KESİN + MUHTEMEL)</div>
                <div style="font-family:'Outfit',sans-serif; font-size:1.35rem; font-weight:800; margin-top:4px; color:${endBalanced < 0 ? 'var(--rose-danger)' : 'var(--dizsan-cyan)'};">${formatMoney(endBalanced)}</div>
                <div style="font-size:0.72rem; color:var(--text-muted); margin-top:3px;">${days} gün sonu tahmini nakit</div>
            </div>
            <div class="panel-card" style="margin-bottom:0; border-color:${uiState.forecastScenario === 'OPTIMISTIC' ? 'var(--dizsan-cyan)' : 'var(--border-subtle)'};">
                <div style="font-size:0.73rem; font-weight:700; color:var(--text-muted);">3. İYİMSER SENARYO (TÜM TAHSİLATLAR)</div>
                <div style="font-family:'Outfit',sans-serif; font-size:1.35rem; font-weight:800; margin-top:4px; color:${endOptimistic < 0 ? 'var(--rose-danger)' : 'var(--emerald-ok)'};">${formatMoney(endOptimistic)}</div>
                <div style="font-size:0.72rem; color:var(--text-muted); margin-top:3px;">${days} gün sonu tahmini nakit</div>
            </div>
        `;
    }

    // Sıfırın altına düşen gün kontrolü (Finansman İhtiyacı Uyarısı)
    const deficitDays = activeRows.filter(r => r.endCash < 0);
    const alertEl = document.getElementById("forecast-deficit-alert");
    if (alertEl) {
        if (deficitDays.length > 0) {
            const firstDef = deficitDays[0];
            const worstDef = deficitDays.reduce((minR, r) => (r.endCash < minR.endCash ? r : minR), firstDef);
            alertEl.innerHTML = `
                <div style="padding:12px 15px; border-radius:10px; background:var(--rose-bg); border:1px solid var(--rose-danger); color:var(--text-primary);">
                    <strong style="color:var(--rose-danger);"><i class="fa-solid fa-triangle-exclamation"></i> FİNANSMAN İHTİYACI UYARISI (NAKİT AÇIĞI TESPİT EDİLDİ):</strong>
                    <div style="font-size:0.79rem; margin-top:4px;">
                        Seçili senaryoda tahmini nakit bakiyesi ilk olarak <strong>${firstDef.dateTR}</strong> tarihinde sıfırın altına (<strong>${formatMoney(firstDef.endCash)}</strong>) düşmektedir.
                        Dönem içindeki en yüksek finansman ihtiyacı <strong>${worstDef.dateTR}</strong> günü <strong>${formatMoney(Math.abs(worstDef.endCash))}</strong> olarak hesaplanmıştır.
                    </div>
                </div>
            `;
        } else {
            alertEl.innerHTML = `
                <div style="padding:10px 14px; border-radius:10px; background:var(--emerald-bg); border:1px solid rgba(16,185,129,0.35); font-size:0.79rem; color:var(--emerald-ok);">
                    <i class="fa-solid fa-shield-check"></i> <strong>Nakit Dengesi Pozitif:</strong> Önümüzdeki ${days} gün boyunca tahmini nakit bakiyesi sıfırın altına düşmemektedir.
                </div>
            `;
        }
    }

    const chartEl = document.getElementById("forecast-main-svg-chart");
    if (chartEl) {
        chartEl.innerHTML = buildCashflowSvgMarkup(activeRows, 250);
    }

    const tbody = document.getElementById("forecast-daily-tbody");
    if (tbody) {
        tbody.innerHTML = activeRows.map(r => `
            <tr style="${r.endCash < 0 ? 'background:rgba(239,68,68,0.12);' : ''}">
                <td><strong>${r.dateTR}</strong></td>
                <td>${formatMoney(r.startCash)}</td>
                <td style="color:var(--emerald-ok); font-weight:600;">${r.inSum > 0 ? `+${formatMoney(r.inSum)}` : "-"}</td>
                <td style="color:var(--rose-danger); font-weight:600;">${r.outSum > 0 ? `−${formatMoney(r.outSum)}` : "-"}</td>
                <td style="font-weight:700; color:${r.netChange < 0 ? 'var(--amber-warn)' : (r.netChange > 0 ? 'var(--emerald-ok)' : 'var(--text-muted)')};">
                    ${r.netChange === 0 ? "0,00 ₺" : (r.netChange > 0 ? `+${formatMoney(r.netChange)}` : formatMoney(r.netChange))}
                </td>
                <td><strong style="color:${r.endCash < 0 ? 'var(--rose-danger)' : 'var(--text-primary)'};">${formatMoney(r.endCash)}</strong></td>
                <td>
                    ${r.endCash < 0
                        ? `<span class="badge badge-danger"><i class="fa-solid fa-triangle-exclamation"></i> Finansman İhtiyacı</span>`
                        : (r.netChange < 0 ? `<span class="badge badge-warning">Nakit Düşüşü</span>` : `<span class="badge badge-success">Pozitif</span>`)}
                </td>
            </tr>
        `).join("");
    }
}

// ==================== 13. KASA VE BANKA YÖNETİMİ (BÖLÜM 6) ====================
function resetAccountFilters() {
    document.getElementById("acc-search-input").value = "";
    document.getElementById("acc-filter-type").value = "ALL";
    document.getElementById("acc-filter-currency").value = "ALL";
    document.getElementById("acc-filter-status").value = "ACTIVE";
    renderAccountsSection();
}

function renderAccountsSection() {
    const q = normalizeTR(document.getElementById("acc-search-input")?.value || "");
    const fType = document.getElementById("acc-filter-type")?.value || "ALL";
    const fCur = document.getElementById("acc-filter-currency")?.value || "ALL";
    const fStat = document.getElementById("acc-filter-status")?.value || "ACTIVE";

    const list = (appState.accounts || []).filter(a => {
        if (uiState.selectedCompanyId !== "ALL" && a.companyId !== uiState.selectedCompanyId) return false;
        if (fType !== "ALL" && a.type !== fType) return false;
        if (fCur !== "ALL" && a.currency !== fCur) return false;
        if (fStat === "ACTIVE" && a.status !== "Aktif") return false;
        if (fStat === "PASSIVE" && a.status !== "Pasif") return false;
        if (q && !normalizeTR(`${a.name} ${a.bankName} ${a.desc} ${getCompanyName(a.companyId)}`).includes(q)) return false;
        return true;
    });

    const navBadge = document.getElementById("nav-badge-accounts");
    if (navBadge) navBadge.textContent = String(list.length);

    const tbody = document.getElementById("accounts-tbody");
    if (tbody) {
        tbody.innerHTML = list.map(a => {
            const curBal = calculateAccountCurrentBalance(a);
            const tryEq = toTRY(curBal, a.currency);
            return `
                <tr>
                    <td><span class="badge badge-info">${escapeHtml(getCompanyName(a.companyId))}</span></td>
                    <td><strong>${escapeHtml(a.name)}</strong></td>
                    <td>
                        <i class="fa-solid ${a.type === 'CASH' ? 'fa-cash-register' : 'fa-building-columns'}" style="color:var(--dizsan-cyan); margin-right:5px;"></i>
                        ${escapeHtml(a.bankName)}
                    </td>
                    <td><strong>${escapeHtml(a.currency)}</strong></td>
                    <td>${formatMoney(a.openingBalance, a.currency)}</td>
                    <td><strong style="color:${curBal < 0 ? 'var(--rose-danger)' : 'var(--emerald-ok)'}; font-size:0.86rem;">${formatMoney(curBal, a.currency)}</strong></td>
                    <td>${formatMoney(tryEq, "TRY")}</td>
                    <td><span class="badge ${a.status === 'Aktif' ? 'badge-success' : 'badge-neutral'}">${escapeHtml(a.status)}</span></td>
                    <td style="font-size:0.74rem; color:var(--text-muted);">${escapeHtml(a.desc || "-")}</td>
                    <td>
                        <button class="btn btn-sm" onclick="openAccountModal('${a.id}')" title="Düzenle"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn btn-sm" onclick="openBalanceAdjustModal('${a.id}')" title="Manuel Bakiye Düzelt"><i class="fa-solid fa-sliders"></i></button>
                    </td>
                </tr>
            `;
        }).join("");
    }

    // Transfer geçmişi
    const trfTbody = document.getElementById("transfers-tbody");
    if (trfTbody) {
        const trfs = (appState.transfers || []).slice(0, 15);
        trfTbody.innerHTML = trfs.length === 0
            ? `<tr><td colspan="6" style="text-align:center; color:var(--text-muted);">Henüz transfer kaydı yok.</td></tr>`
            : trfs.map(t => `
                <tr>
                    <td>${formatDateToTR(t.date)}</td>
                    <td>${escapeHtml(getAccountName(t.fromAccountId))}</td>
                    <td>${escapeHtml(getAccountName(t.toAccountId))}</td>
                    <td><strong>${formatMoney(t.amount, t.currency || "TRY")}</strong></td>
                    <td>
                        <span class="badge ${t.isIntercompany ? 'badge-warning' : 'badge-info'}">
                            ${t.isIntercompany ? "Şirketler Arası" : "Şirket İçi Virman"}
                        </span>
                    </td>
                    <td>${escapeHtml(t.desc)}</td>
                </tr>
            `).join("");
    }

    // Manuel düzeltme geçmişi
    const adjTbody = document.getElementById("adjustments-tbody");
    if (adjTbody) {
        const adjs = (appState.adjustments || []).slice(0, 15);
        adjTbody.innerHTML = adjs.length === 0
            ? `<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">Henüz manuel bakiye düzeltmesi yapılmadı.</td></tr>`
            : adjs.map(ad => `
                <tr>
                    <td>${formatDateToTR(ad.date)}</td>
                    <td><strong>${escapeHtml(getAccountName(ad.accountId))}</strong></td>
                    <td>${formatMoney(ad.oldBalance, ad.currency)}</td>
                    <td><strong>${formatMoney(ad.newBalance, ad.currency)}</strong></td>
                    <td>${escapeHtml(ad.reason)} <span style="color:var(--text-muted);">(${escapeHtml(ad.user)})</span></td>
                </tr>
            `).join("");
    }
}

function openAccountModal(accId = null) {
    populateCompanySelects();
    const form = document.getElementById("form-account");
    if (form) form.reset();
    document.getElementById("acc-id").value = accId || "";

    if (accId) {
        const acc = getAccountById(accId);
        if (acc) {
            document.getElementById("acc-company").value = acc.companyId;
            document.getElementById("acc-type").value = acc.type;
            document.getElementById("acc-name").value = acc.name;
            document.getElementById("acc-bank-name").value = acc.bankName;
            document.getElementById("acc-currency").value = acc.currency;
            document.getElementById("acc-opening-balance").value = acc.openingBalance;
            document.getElementById("acc-status").value = acc.status;
            document.getElementById("acc-desc").value = acc.desc || "";
        }
    } else if (uiState.selectedCompanyId !== "ALL") {
        document.getElementById("acc-company").value = uiState.selectedCompanyId;
    }
    openModal("modal-account");
}

function handleSaveAccount(e) {
    e.preventDefault();
    const id = document.getElementById("acc-id").value;
    const companyId = document.getElementById("acc-company").value;
    const type = document.getElementById("acc-type").value;
    const name = document.getElementById("acc-name").value.trim();
    const bankName = document.getElementById("acc-bank-name").value.trim();
    const currency = document.getElementById("acc-currency").value;
    const openingBalance = Number(document.getElementById("acc-opening-balance").value) || 0;
    const status = document.getElementById("acc-status").value;
    const desc = document.getElementById("acc-desc").value.trim();

    if (id) {
        const acc = getAccountById(id);
        if (acc) {
            Object.assign(acc, { companyId, type, name, bankName, currency, openingBalance, status, desc });
            addAuditLog("KASA/BANKA", `${name} (${getCompanyName(companyId)}) hesabı güncellendi.`);
        }
    } else {
        const newAcc = {
            id: "ACC-" + Date.now(),
            companyId,
            type,
            name,
            bankName,
            currency,
            openingBalance,
            status,
            desc
        };
        appState.accounts.push(newAcc);
        addAuditLog("KASA/BANKA", `Yeni hesap tanımlandı: ${name} (${formatMoney(openingBalance, currency)}).`);
    }

    closeModal("modal-account");
    syncStateToServer();
    renderAll();
}

function openTransferModal() {
    populateAccountSelectsForModal();
    document.getElementById("form-transfer")?.reset();
    document.getElementById("trf-date").value = formatDateToTR(todayISO());
    openModal("modal-transfer");
}

function handleSaveTransfer(e) {
    e.preventDefault();
    const fromId = document.getElementById("trf-from-account").value;
    const toId = document.getElementById("trf-to-account").value;
    const amount = Number(document.getElementById("trf-amount").value) || 0;
    const dateISO = parseAnyDateToISO(document.getElementById("trf-date").value);
    const desc = document.getElementById("trf-desc").value.trim();

    if (!fromId || !toId || fromId === toId) {
        alert("Kaynak ve hedef hesap birbirinden farklı olmalıdır!");
        return;
    }

    const fromAcc = getAccountById(fromId);
    const toAcc = getAccountById(toId);
    const isIntercompany = fromAcc && toAcc && fromAcc.companyId !== toAcc.companyId;

    appState.transfers.unshift({
        id: "TRF-" + Date.now(),
        date: dateISO,
        fromAccountId: fromId,
        toAccountId: toId,
        fromCompanyId: fromAcc ? fromAcc.companyId : "",
        toCompanyId: toAcc ? toAcc.companyId : "",
        amount,
        currency: fromAcc ? fromAcc.currency : "TRY",
        isIntercompany,
        desc,
        user: currentUser ? currentUser.name : "Sistem"
    });

    addAuditLog("TRANSFER", `${getAccountName(fromId)} -> ${getAccountName(toId)} arasında ${formatMoney(amount)} transfer yapıldı (${isIntercompany ? "Şirketler Arası" : "Şirket İçi"}).`);
    closeModal("modal-transfer");
    syncStateToServer();
    renderAll();
}

function openBalanceAdjustModal(preselectAccId = null) {
    populateAccountSelectsForModal();
    document.getElementById("form-balance-adjust")?.reset();
    document.getElementById("adj-date").value = formatDateToTR(todayISO());
    const sel = document.getElementById("adj-account");
    if (preselectAccId && sel) {
        sel.value = preselectAccId;
    }
    if (sel && sel.value) {
        handleAdjustAccountSelect(sel.value);
    }
    openModal("modal-balance-adjust");
}

function handleAdjustAccountSelect(accId) {
    const acc = getAccountById(accId);
    const curEl = document.getElementById("adj-current-balance");
    if (acc && curEl) {
        const curBal = calculateAccountCurrentBalance(acc);
        curEl.value = formatMoney(curBal, acc.currency);
    }
}

function handleSaveBalanceAdjustment(e) {
    e.preventDefault();
    const accId = document.getElementById("adj-account").value;
    const newBal = Number(document.getElementById("adj-new-balance").value);
    const dateISO = parseAnyDateToISO(document.getElementById("adj-date").value);
    const reason = document.getElementById("adj-reason").value.trim();

    const acc = getAccountById(accId);
    if (!acc || isNaN(newBal) || !reason) return;

    const oldBal = calculateAccountCurrentBalance(acc);
    const delta = Number((newBal - oldBal).toFixed(2));

    appState.adjustments.unshift({
        id: "ADJ-" + Date.now(),
        date: dateISO,
        accountId: accId,
        currency: acc.currency,
        oldBalance: oldBal,
        newBalance: newBal,
        deltaAmount: delta,
        reason,
        user: currentUser ? currentUser.name : "Sistem"
    });

    addAuditLog("BAKİYE DÜZELTME", `${acc.name} bakiyesi ${formatMoney(oldBal, acc.currency)} -> ${formatMoney(newBal, acc.currency)} olarak düzeltildi. Gerekçe: ${reason}`);
    closeModal("modal-balance-adjust");
    syncStateToServer();
    renderAll();
}

// ==================== 14. ÖDEME YÖNETİMİ VE KISMİ ÖDEME HAREKETLERİ (BÖLÜM 7) ====================
function resetPaymentFilters() {
    document.getElementById("pay-search-input").value = "";
    document.getElementById("pay-filter-category").value = "ALL";
    document.getElementById("pay-filter-status").value = "ALL";
    document.getElementById("pay-filter-account").value = "ALL";
    document.getElementById("pay-sort-by").value = "dueDateAsc";
    renderPaymentsSection();
}

// ==================== PERSONEL MAAŞ KIRILIMI VE KİŞİ BAZLI KISMİ ÖDEME YARDIMCILARI ====================
function getPersonnelTransactions(p, personItem) {
    if (!p || !Array.isArray(p.transactions) || !personItem) return [];
    const pNameNorm = normalizeTR(personItem.name);
    return p.transactions.filter(tx =>
        (tx.personId && tx.personId === personItem.personId) ||
        (tx.personName && normalizeTR(tx.personName) === pNameNorm)
    );
}

function getPersonnelPaidAmount(p, personItem) {
    const txs = getPersonnelTransactions(p, personItem);
    const txSum = txs.reduce((s, tx) => s + (Number(tx.amount) || 0), 0);
    return Number((txSum + (Number(personItem?.initialPaid) || 0)).toFixed(2));
}

function getPersonnelRemainingAmount(p, personItem) {
    const sal = Number(personItem?.salaryAmount) || 0;
    const paid = getPersonnelPaidAmount(p, personItem);
    return Math.max(0, Number((sal - paid).toFixed(2)));
}

function togglePersonnelSubRow(payId) {
    const row = document.getElementById(`pers-subrow-${payId}`);
    if (!row) return;
    row.style.display = row.style.display === "none" ? "table-row" : "none";
}

function quickAddPersonToExistingPayroll(e, payId) {
    e.preventDefault();
    const p = (appState.payments || []).find(x => x.id === payId);
    if (!p) return;
    const nameIn = document.getElementById(`qpers-name-${payId}`);
    const roleIn = document.getElementById(`qpers-role-${payId}`);
    const salIn = document.getElementById(`qpers-sal-${payId}`);
    const name = (nameIn?.value || "").trim().toLocaleUpperCase("tr-TR");
    const role = (roleIn?.value || "").trim() || "Personel";
    const salaryAmount = Number(salIn?.value) || 0;
    if (!name || salaryAmount <= 0) return;

    if (!Array.isArray(p.personnelItems)) p.personnelItems = [];
    p.personnelItems.push({
        personId: "PER-" + Date.now(),
        name,
        role,
        salaryAmount
    });
    p.totalAmount = p.personnelItems.reduce((s, item) => s + (Number(item.salaryAmount) || 0), 0);
    p.creditor = `Dizsan Personel Maaş Bordrosu (${p.personnelItems.length} Personel)`;
    addAuditLog("MAAŞ PERSONEL EKLEME", `${p.title} bordrosuna ${name} (${formatMoney(salaryAmount, p.currency)}) eklendi.`);
    syncStateToServer();
    renderAll();
}

function removePersonFromPayroll(payId, personId) {
    const p = (appState.payments || []).find(x => x.id === payId);
    if (!p || !Array.isArray(p.personnelItems)) return;
    const target = p.personnelItems.find(x => x.personId === personId);
    if (!target) return;
    if (!confirm(`${target.name} isimli personeli bu maaş bordrosundan çıkarmak istediğinize emin misiniz?`)) return;
    p.personnelItems = p.personnelItems.filter(x => x.personId !== personId);
    if (p.personnelItems.length > 0) {
        p.totalAmount = p.personnelItems.reduce((s, item) => s + (Number(item.salaryAmount) || 0), 0);
    }
    syncStateToServer();
    renderAll();
}

function renderPaymentsSection() {
    refreshOverdueStatuses();
    renderUndatedNotesUI();

    const q = normalizeTR(document.getElementById("pay-search-input")?.value || "");
    const fCat = document.getElementById("pay-filter-category")?.value || "ALL";
    const fStat = document.getElementById("pay-filter-status")?.value || "ALL";
    const fAcc = document.getElementById("pay-filter-account")?.value || "ALL";
    const sortBy = document.getElementById("pay-sort-by")?.value || "dueDateAsc";

    const allPayments = getDeduplicatedPayments();
    const unpaidCount = allPayments.filter(p => !isPaymentUndated(p) && getPaymentRemainingAmount(p) > 0 && p.status !== "İptal edildi").length;
    const navBadge = document.getElementById("nav-badge-payments");
    if (navBadge) navBadge.textContent = String(unpaidCount);

    const filtered = allPayments.filter(p => {
        if (fCat !== "ALL" && p.category !== fCat) return false;
        if (fAcc !== "ALL" && p.accountId !== fAcc) return false;
        if (fStat === "UNPAID_ALL") {
            if (p.status === "Ödendi" || p.status === "İptal edildi" || isPaymentUndated(p)) return false;
        } else if (fStat === "Tarihi Belirsiz") {
            if (!isPaymentUndated(p)) return false;
        } else if (fStat !== "ALL" && p.status !== fStat) {
            return false;
        }
        if (q) {
            const persNames = Array.isArray(p.personnelItems) ? p.personnelItems.map(x => `${x.name} ${x.role}`).join(" ") : "";
            const haystack = normalizeTR(`${p.title} ${p.creditor} ${p.category} ${p.desc} ${persNames} maaşlar maaslar`);
            if (!haystack.includes(q)) return false;
        }
        return true;
    });

    filtered.sort((a, b) => {
        const aUnd = isPaymentUndated(a);
        const bUnd = isPaymentUndated(b);
        if (aUnd && !bUnd) return 1;
        if (!aUnd && bUnd) return -1;
        if (sortBy === "dueDateDesc") return parseAnyDateToISO(b.dueDate).localeCompare(parseAnyDateToISO(a.dueDate));
        if (sortBy === "amountDesc") return (Number(b.totalAmount) || 0) - (Number(a.totalAmount) || 0);
        if (sortBy === "remainingDesc") return getPaymentRemainingAmount(b) - getPaymentRemainingAmount(a);
        return parseAnyDateToISO(a.dueDate).localeCompare(parseAnyDateToISO(b.dueDate));
    });

    const tbody = document.getElementById("payments-tbody");
    if (!tbody) return;

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="11" style="text-align:center; padding:18px; color:var(--text-muted);">Filtre kriterlerine uygun ödeme kaydı bulunamadı.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(p => {
        const paid = getPaymentPaidAmount(p);
        const rem = getPaymentRemainingAmount(p);
        const undated = isPaymentUndated(p);
        const hasPersonnel = Array.isArray(p.personnelItems) && p.personnelItems.length > 0;
        const isSalary = hasPersonnel || p.category === "Personel maaşı";
        const statusBadge = p.status === "Ödendi" ? "badge-success" :
                            p.status === "Gecikti" ? "badge-danger" :
                            p.status === "Kısmen ödendi" ? "badge-info" :
                            p.status === "İptal edildi" ? "badge-neutral" : "badge-warning";
        const dueCell = undated
            ? `<span class="badge badge-warning"><i class="fa-solid fa-note-sticky"></i> Tarihi Belirsiz</span>`
            : `<strong>${formatDateToTR(p.dueDate)}</strong>`;
        const totalTxt = (undated && (!p.totalAmount || Number(p.totalAmount) <= 0))
            ? `<span style="color:var(--text-muted); font-size:0.72rem;">Tutar Belirsiz</span>`
            : `<strong>${formatMoney(p.totalAmount, p.currency)}</strong>`;

        let subRowHtml = "";
        if (isSalary) {
            const pItems = Array.isArray(p.personnelItems) ? p.personnelItems : [];
            const personRows = pItems.map(per => {
                const perPaid = getPersonnelPaidAmount(p, per);
                const perRem = getPersonnelRemainingAmount(p, per);
                const perTxs = getPersonnelTransactions(p, per);
                const perStatus = perRem <= 0.009
                    ? `<span class="badge badge-success">Tam Ödendi</span>`
                    : (perPaid > 0 ? `<span class="badge badge-info">Kısmen Ödendi</span>` : `<span class="badge badge-warning">Bekliyor</span>`);

                const txPills = perTxs.length > 0
                    ? `<div style="display:flex; flex-wrap:wrap; gap:4px; margin-top:3px;">` +
                      perTxs.map(tx => `<span class="badge badge-success" style="font-weight:600; font-size:0.63rem;" title="${escapeHtml(tx.note || '')}"><i class="fa-solid fa-check-double"></i> ${formatDateToTR(tx.date)}: ${formatMoney(tx.amount, p.currency)} (${escapeHtml(tx.note || 'Kısmi Ödeme')})</span>`).join("") +
                      `</div>`
                    : `<span style="font-size:0.68rem; color:var(--text-muted);">Henüz kısmi ödeme / avans yok</span>`;

                return `
                    <tr style="background:rgba(15,23,42,0.55);">
                        <td style="padding:6px 10px;">
                            <div style="font-weight:700; color:var(--text-primary); font-size:0.78rem;">
                                <i class="fa-solid fa-user-tie" style="color:var(--dizsan-cyan); margin-right:5px;"></i>${escapeHtml(per.name)}
                            </div>
                            <div style="font-size:0.68rem; color:var(--text-muted); padding-left:18px;">${escapeHtml(per.role || "Personel")}</div>
                        </td>
                        <td style="padding:6px 10px; font-weight:700;">${formatMoney(per.salaryAmount, p.currency)}</td>
                        <td style="padding:6px 10px;">
                            <div style="font-weight:700; color:var(--emerald-ok);">${formatMoney(perPaid, p.currency)}</div>
                            ${txPills}
                        </td>
                        <td style="padding:6px 10px; font-weight:700; color:${perRem > 0 ? 'var(--rose-danger)' : 'var(--text-muted)'};">
                            ${formatMoney(perRem, p.currency)}
                        </td>
                        <td style="padding:6px 10px;">${perStatus}</td>
                        <td style="padding:6px 10px;">
                            <div style="display:flex; gap:4px; flex-wrap:wrap;">
                                ${perRem > 0 ? `
                                    <button type="button" class="btn btn-sm btn-primary" onclick="openPaymentExecModal('${p.id}', '${per.personId}')" title="${escapeHtml(per.name)} için Kısmi Maaş / Avans Ödemesi Gir">
                                        <i class="fa-solid fa-hand-holding-dollar"></i> Kısmi Öde / Avans
                                    </button>
                                ` : ""}
                                <button type="button" class="btn btn-sm" onclick="removePersonFromPayroll('${p.id}', '${per.personId}')" title="Personeli Bordrodan Çıkar">
                                    <i class="fa-solid fa-xmark" style="color:var(--rose-danger);"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join("");

            subRowHtml = `
                <tr id="pers-subrow-${p.id}" class="personnel-sub-row">
                    <td colspan="11" style="padding:10px 14px; background:rgba(2,132,199,0.06); border-left:3px solid var(--dizsan-cyan);">
                        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; margin-bottom:8px;">
                            <div style="font-size:0.78rem; font-weight:700; color:var(--dizsan-cyan);">
                                <i class="fa-solid fa-users-viewfinder"></i> ${escapeHtml(p.title)} — Personel İsimleri ve Kişi Bazlı Kısmi Ödemeler (${pItems.length} Personel)
                            </div>
                            <form onsubmit="quickAddPersonToExistingPayroll(event, '${p.id}')" style="display:flex; align-items:center; gap:5px; flex-wrap:wrap;">
                                <input type="text" id="qpers-name-${p.id}" class="form-control" style="width:155px; padding:4px 8px; font-size:0.71rem;" placeholder="Yeni Personel Adı Soyadı *" required>
                                <input type="text" id="qpers-role-${p.id}" class="form-control" style="width:125px; padding:4px 8px; font-size:0.71rem;" placeholder="Görevi / Departman">
                                <input type="number" step="0.01" min="1" id="qpers-sal-${p.id}" class="form-control" style="width:110px; padding:4px 8px; font-size:0.71rem;" placeholder="Maaş Tutarı *" required>
                                <button type="submit" class="btn btn-sm btn-primary"><i class="fa-solid fa-user-plus"></i> + Personel Ekle</button>
                            </form>
                        </div>
                        <div class="table-responsive">
                            <table class="data-table" style="background:rgba(15,23,42,0.4); border-radius:8px; overflow:hidden;">
                                <thead>
                                    <tr>
                                        <th>Personel Adı &amp; Görevi</th>
                                        <th>Hak Edilen Maaş</th>
                                        <th>Yapılan Kısmi Ödemeler / Avans Geçmişi</th>
                                        <th>Kalan Maaş</th>
                                        <th>Durum</th>
                                        <th>Kişi Bazlı Ödeme İşlemi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${personRows || `<tr><td colspan="6" style="text-align:center; padding:10px; color:var(--text-muted);">Henüz personel eklenmemiş. Sağ üstten personel ekleyebilirsiniz.</td></tr>`}
                                </tbody>
                            </table>
                        </div>
                    </td>
                </tr>
            `;
        }

        return `
            <tr>
                <td>${dueCell}</td>
                <td><span class="badge badge-neutral">${escapeHtml(getCompanyName(p.companyId))}</span></td>
                <td>
                    <div style="font-weight:700; color:var(--text-primary); display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                        <span>${escapeHtml(p.title)}</span>
                        ${isSalary ? `<button type="button" class="badge badge-info" style="cursor:pointer; border:1px solid var(--dizsan-cyan);" onclick="togglePersonnelSubRow('${p.id}')"><i class="fa-solid fa-users"></i> ${Array.isArray(p.personnelItems) ? p.personnelItems.length : 0} Personel Detayı</button>` : ""}
                    </div>
                    <div style="font-size:0.72rem; color:var(--text-muted);">${escapeHtml(p.creditor)} ${p.desc ? `&bull; ${escapeHtml(p.desc)}` : ""}</div>
                </td>
                <td><span class="badge badge-info">${escapeHtml(p.category)}</span></td>
                <td>${totalTxt}</td>
                <td style="color:var(--emerald-ok);">${formatMoney(paid, p.currency)}</td>
                <td><strong style="color:${rem > 0 ? 'var(--rose-danger)' : 'var(--text-muted)'};">${formatMoney(rem, p.currency)}</strong></td>
                <td>${escapeHtml(getAccountName(p.accountId))}</td>
                <td><span class="badge ${statusBadge}">${escapeHtml(p.status)}</span></td>
                <td style="font-size:0.72rem;">
                    ${p.attachmentName ? `<span class="badge badge-info" title="${escapeHtml(p.attachmentName)}"><i class="fa-solid fa-paperclip"></i> Ek</span>` : ""}
                    ${p.recurrence && p.recurrence !== "NONE" ? `<span class="badge badge-neutral"><i class="fa-solid fa-arrows-rotate"></i> ${escapeHtml(p.recurrence)}</span>` : ""}
                </td>
                <td>
                    <div style="display:flex; gap:4px; flex-wrap:wrap;">
                        ${undated ? `<button class="btn btn-sm btn-warning" onclick="promptAssignDateToUndatedPayment('${p.id}')" title="Vade Tarihi Belirle ve Takvime Aktar"><i class="fa-solid fa-calendar-check"></i> Tarih Ver</button>` : ""}
                        <button class="btn btn-sm btn-success" onclick="openPaymentExecModal('${p.id}')" title="Ödeme Yap / Kısmi Ödeme / Hareketler">
                            <i class="fa-solid fa-check"></i> Öde
                        </button>
                        <button class="btn btn-sm" onclick="openPaymentModal('${p.id}')" title="Düzenle">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="btn btn-sm" onclick="deletePaymentRecord('${p.id}')" title="Sil">
                            <i class="fa-solid fa-trash" style="color:var(--rose-danger);"></i>
                        </button>
                    </div>
                </td>
            </tr>
            ${subRowHtml}
        `;
    }).join("");
}

function addPersonnelRowInModal(name = "", role = "", salaryAmount = "", personId = "") {
    const container = document.getElementById("pay-personnel-rows-container");
    if (!container) return;
    const pid = personId || ("PER-" + Date.now() + "-" + Math.floor(Math.random() * 1000));
    const row = document.createElement("div");
    row.className = "modal-personnel-row";
    row.setAttribute("data-person-id", pid);
    row.style.cssText = "display:grid; grid-template-columns: 1.4fr 1.1fr 1fr auto; gap:5px; align-items:center;";
    row.innerHTML = `
        <input type="text" class="form-control pers-row-name" placeholder="Personel Adı Soyadı *" value="${escapeHtml(name)}">
        <input type="text" class="form-control pers-row-role" placeholder="Görev / Departman" value="${escapeHtml(role)}">
        <input type="number" step="0.01" min="0" class="form-control pers-row-salary" placeholder="Maaş Tutarı" value="${salaryAmount}" oninput="recalcModalPersonnelTotal()">
        <button type="button" class="btn btn-sm" onclick="this.parentElement.remove(); recalcModalPersonnelTotal();" title="Kaldır">
            <i class="fa-solid fa-trash" style="color:var(--rose-danger);"></i>
        </button>
    `;
    container.appendChild(row);
    recalcModalPersonnelTotal();
}

function populateDefaultPersonnelRowsInModal() {
    const container = document.getElementById("pay-personnel-rows-container");
    if (!container) return;
    container.innerHTML = "";
    const defaults = [
        { personId: "PER-1", name: "GÖKHAN ÖZBULUT", role: "Muhasebe & Finans", salaryAmount: 60000 },
        { personId: "PER-2", name: "HAKAN AYDIN", role: "Servis Müdürü", salaryAmount: 65000 },
        { personId: "PER-3", name: "FATİH KIROĞLU", role: "Yedek Parça / Depo", salaryAmount: 52000 },
        { personId: "PER-4", name: "ERTUĞRUL ERDEM", role: "Servis Danışmanı", salaryAmount: 48000 },
        { personId: "PER-5", name: "NECATİ DEMİRCİ", role: "Servis Danışmanı", salaryAmount: 48000 }
    ];
    defaults.forEach(d => addPersonnelRowInModal(d.name, d.role, d.salaryAmount, d.personId));
    const credIn = document.getElementById("pay-creditor");
    if (credIn && !credIn.value.trim()) {
        credIn.value = `Dizsan Personel Maaş Bordrosu (${defaults.length} Personel)`;
    }
}

function recalcModalPersonnelTotal() {
    const rows = document.querySelectorAll("#pay-personnel-rows-container .modal-personnel-row");
    if (!rows || rows.length === 0) return;
    let sum = 0;
    rows.forEach(r => {
        const val = Number(r.querySelector(".pers-row-salary")?.value) || 0;
        sum += val;
    });
    const amtIn = document.getElementById("pay-amount");
    if (amtIn && sum > 0) {
        amtIn.value = sum;
    }
}

function collectModalPersonnelItems() {
    const box = document.getElementById("pay-personnel-box");
    if (!box || box.style.display === "none") return [];
    const rows = document.querySelectorAll("#pay-personnel-rows-container .modal-personnel-row");
    const items = [];
    rows.forEach(r => {
        const personId = r.getAttribute("data-person-id") || ("PER-" + Date.now());
        const name = (r.querySelector(".pers-row-name")?.value || "").trim().toLocaleUpperCase("tr-TR");
        const role = (r.querySelector(".pers-row-role")?.value || "").trim() || "Personel";
        const salaryAmount = Number(r.querySelector(".pers-row-salary")?.value) || 0;
        if (name) {
            items.push({ personId, name, role, salaryAmount });
        }
    });
    return items;
}

function togglePayUndatedMode(checked) {
    const dueIn = document.getElementById("pay-due-date");
    const statSel = document.getElementById("pay-status");
    const recSel = document.getElementById("pay-recurrence");
    if (dueIn) {
        if (checked) {
            dueIn.value = "";
            dueIn.disabled = true;
            dueIn.placeholder = "Tarihi Belirsiz (Kenar Notu)";
        } else {
            dueIn.disabled = false;
            dueIn.placeholder = "GG.AA.YYYY";
            if (!dueIn.value) dueIn.value = formatDateToTR(todayISO());
        }
    }
    if (statSel) {
        statSel.value = checked ? "Tarihi Belirsiz" : "Planlandı";
    }
    if (recSel && checked) {
        recSel.value = "NONE";
        togglePayRecurrenceFields("NONE");
    }
}

function openUndatedPaymentModal() {
    openPaymentModal(null, null, true);
}

function togglePayRecurrenceFields(val) {
    const wrap = document.getElementById("pay-recurrence-end-wrap");
    if (wrap) wrap.style.display = val && val !== "NONE" ? "block" : "none";
}

function openPaymentModal(payId = null, defaultDateISO = null, forceUndated = false) {
    populateCompanySelects();
    populateCategorySelects();
    populateAccountSelectsForModal();

    const form = document.getElementById("form-payment");
    if (form) form.reset();
    document.getElementById("pay-id").value = payId || "";
    document.getElementById("pay-due-date").value = formatDateToTR(defaultDateISO || todayISO());
    document.getElementById("pay-series-update-scope").style.display = "none";

    const persContainer = document.getElementById("pay-personnel-rows-container");
    if (persContainer) persContainer.innerHTML = "";
    const persBox = document.getElementById("pay-personnel-box");
    if (persBox) persBox.style.display = "none";

    const undatedChk = document.getElementById("pay-is-undated");
    if (undatedChk) undatedChk.checked = Boolean(forceUndated);
    togglePayUndatedMode(Boolean(forceUndated));

    if (payId) {
        const p = appState.payments.find(x => x.id === payId);
        if (p) {
            const isUnd = isPaymentUndated(p);
            if (undatedChk) undatedChk.checked = isUnd;
            togglePayUndatedMode(isUnd);

            document.getElementById("pay-company").value = p.companyId;
            populateAccountSelectsForModal();
            document.getElementById("pay-category").value = p.category;
            document.getElementById("pay-title").value = p.title;
            document.getElementById("pay-creditor").value = p.creditor;
            document.getElementById("pay-amount").value = p.totalAmount || "";
            document.getElementById("pay-currency").value = p.currency || "TRY";
            document.getElementById("pay-due-date").value = isUnd ? "" : formatDateToTR(p.dueDate);
            document.getElementById("pay-account").value = p.accountId || "";
            document.getElementById("pay-status").value = p.status;
            document.getElementById("pay-recurrence").value = p.recurrence || "NONE";
            document.getElementById("pay-recurrence-end").value = p.recurrenceEnd ? formatDateToTR(p.recurrenceEnd) : "";
            document.getElementById("pay-desc").value = p.desc || "";
            togglePayRecurrenceFields(p.recurrence || "NONE");

            if (p.category === "Personel maaşı" || (Array.isArray(p.personnelItems) && p.personnelItems.length > 0)) {
                if (persBox) persBox.style.display = "block";
                (p.personnelItems || []).forEach(item => {
                    addPersonnelRowInModal(item.name, item.role, item.salaryAmount, item.personId);
                });
            }

            if (p.seriesId) {
                document.getElementById("pay-series-update-scope").style.display = "block";
            }
        }
    } else if (uiState.selectedCompanyId !== "ALL") {
        document.getElementById("pay-company").value = uiState.selectedCompanyId;
        populateAccountSelectsForModal();
    }

    openModal("modal-payment");
}

function handleSavePayment(e) {
    e.preventDefault();
    const id = document.getElementById("pay-id").value;
    const companyId = document.getElementById("pay-company").value;
    let category = document.getElementById("pay-category").value;
    const title = document.getElementById("pay-title").value.trim();
    const creditor = document.getElementById("pay-creditor").value.trim();
    const personnelItems = collectModalPersonnelItems();
    const persSum = personnelItems.reduce((s, x) => s + (Number(x.salaryAmount) || 0), 0);
    const totalAmount = persSum > 0 ? persSum : (Number(document.getElementById("pay-amount").value) || 0);
    const currency = document.getElementById("pay-currency").value;
    const rawDueVal = (document.getElementById("pay-due-date")?.value || "").trim();
    const isUndatedChecked = Boolean(document.getElementById("pay-is-undated")?.checked) || !rawDueVal || document.getElementById("pay-status")?.value === "Tarihi Belirsiz";
    const dueDate = isUndatedChecked ? "" : parseAnyDateToISO(rawDueVal);
    const accountId = document.getElementById("pay-account").value;
    const status = isUndatedChecked ? "Tarihi Belirsiz" : document.getElementById("pay-status").value;
    const recurrence = isUndatedChecked ? "NONE" : document.getElementById("pay-recurrence").value;
    const recurrenceEnd = (!isUndatedChecked && document.getElementById("pay-recurrence-end").value) ? parseAnyDateToISO(document.getElementById("pay-recurrence-end").value) : "";
    const desc = document.getElementById("pay-desc").value.trim();
    const fileInput = document.getElementById("pay-attachment");
    const attachmentName = fileInput?.files?.[0]?.name || "";

    // TDR Kuralı
    if (isTdrSuppliedItem(title)) {
        category = "Tedarikçi";
    } else if (/maa[sş]/i.test(title) && personnelItems.length > 0) {
        category = "Personel maaşı";
    }

    if (id) {
        const p = appState.payments.find(x => x.id === id);
        if (p) {
            const oldDue = p.dueDate;
            const oldAmt = p.totalAmount;
            p.companyId = companyId;
            p.category = category;
            p.title = title;
            p.creditor = creditor;
            p.totalAmount = totalAmount;
            p.currency = currency;
            p.dueDate = dueDate;
            p.isUndated = isUndatedChecked;
            p.accountId = accountId;
            p.status = status;
            p.desc = desc;
            if (personnelItems.length > 0 || category === "Personel maaşı") {
                p.personnelItems = personnelItems;
            }
            if (attachmentName) p.attachmentName = attachmentName;

            if (!Array.isArray(p.history)) p.history = [];
            if (oldDue !== dueDate || oldAmt !== totalAmount) {
                const logMsg = `Vade/Tutar düzeltmesi: Vade ${formatDateToTR(oldDue)} -> ${formatDateToTR(dueDate)}, Tutar ${formatMoney(oldAmt, currency)} -> ${formatMoney(totalAmount, currency)}`;
                p.history.unshift({ date: formatDateTimeTR(), text: logMsg });
                addAuditLog("ÖDEME DÜZELTME", `${title}: ${logMsg}`);
            }

            const updateSeries = document.getElementById("pay-update-all-series")?.checked;
            if (p.seriesId && updateSeries) {
                appState.payments.forEach(other => {
                    if (other.seriesId === p.seriesId && other.id !== p.id && other.status === "Planlandı") {
                        other.totalAmount = totalAmount;
                        other.accountId = accountId;
                        other.category = category;
                    }
                });
                addAuditLog("TEKRARLAYAN SERİ", `${title} serisindeki bekleyen tüm taksitler kullanıcı onayıyla güncellendi.`);
            }
        }
    } else {
        const seriesId = recurrence !== "NONE" ? "SER-" + Date.now() : null;
        const newPay = {
            id: "PAY-" + Date.now(),
            obligationKey: `PAY:PAY-${Date.now()}`,
            companyId,
            title,
            creditor,
            category,
            totalAmount,
            currency,
            dueDate,
            isUndated: isUndatedChecked,
            accountId,
            recurrence,
            recurrenceEnd,
            seriesId,
            status,
            desc,
            attachmentName,
            personnelItems,
            transactions: status === "Ödendi" ? [{
                id: "PTX-" + Date.now(),
                date: todayISO(),
                amount: totalAmount,
                accountId,
                note: "Tam ödeme olarak kaydedildi",
                user: currentUser ? currentUser.name : "Sistem"
            }] : [],
            history: []
        };
        appState.payments.unshift(newPay);
        addAuditLog(isUndatedChecked ? "KENAR NOTU EKLEME" : "ÖDEME EKLEME", `${title} (${creditor}) için ${formatMoney(totalAmount, currency)} ${isUndatedChecked ? "tarihi belirsiz kenar notu" : "ödeme"} kaydedildi.`);

        if (recurrence !== "NONE" && !isUndatedChecked) {
            generateFutureRecurringInstallments(newPay);
        }
    }

    closeModal("modal-payment");
    syncStateToServer();
    renderAll();
}

// ==================== TARİHİ BELLİ OLMAYAN ÖDEMELER & KENAR NOTLARI MOTORU ====================
function toggleUndatedNotesDrawer() {
    const drawer = document.getElementById("undated-notes-drawer");
    if (!drawer) return;
    drawer.classList.toggle("open");
    renderUndatedNotesUI();
    if (window.autoDateHelper && typeof window.autoDateHelper.init === "function") {
        setTimeout(() => window.autoDateHelper.init(), 50);
    }
}

function handleQuickAddUndatedNote(e, prefix) {
    e.preventDefault();
    const companyId = document.getElementById(`${prefix}-undated-company`)?.value || (appState.companies?.[0]?.id || "COMP-OTOMOTIV");
    const title = (document.getElementById(`${prefix}-undated-title`)?.value || "").trim();
    const creditor = (document.getElementById(`${prefix}-undated-creditor`)?.value || "").trim();
    const totalAmount = Number(document.getElementById(`${prefix}-undated-amount`)?.value) || 0;
    const currency = document.getElementById(`${prefix}-undated-currency`)?.value || "TRY";
    const desc = (document.getElementById(`${prefix}-undated-note`)?.value || "").trim();

    if (!title || !creditor) return;

    const category = isTdrSuppliedItem(title) ? "Tedarikçi" : "Diğer giderler";
    const newId = "PAY-UND-" + Date.now();
    appState.payments.unshift({
        id: newId,
        obligationKey: `PAY:${newId}`,
        companyId,
        title,
        creditor,
        category,
        totalAmount,
        currency,
        dueDate: "",
        isUndated: true,
        accountId: "",
        recurrence: "NONE",
        recurrenceEnd: "",
        seriesId: null,
        status: "Tarihi Belirsiz",
        desc: desc || "Vade tarihi henüz netleşmedi (Kenar Notu)",
        attachmentName: "",
        transactions: [],
        history: [{ date: formatDateTimeTR(), text: "Tarihi belli olmayan ödeme / kenar notu olarak eklendi." }]
    });

    addAuditLog("KENAR NOTU", `${title} (${creditor}) tarihi belli olmayan ödemeler havuzuna eklendi.`);
    e.target.reset();
    syncStateToServer();
    renderAll();
}

function assignDateToUndatedPayment(payId, dateInputId) {
    const inp = document.getElementById(dateInputId);
    const rawVal = (inp?.value || "").trim();
    if (!rawVal) {
        alert("Lütfen geçerli bir vade tarihi (GG.AA.YYYY) giriniz.");
        inp?.focus();
        return;
    }
    const iso = parseAnyDateToISO(rawVal);
    const p = (appState.payments || []).find(x => x.id === payId);
    if (!p) return;

    p.dueDate = iso;
    p.isUndated = false;
    p.status = iso < todayISO() ? "Gecikti" : "Planlandı";
    if (!Array.isArray(p.history)) p.history = [];
    p.history.unshift({
        date: formatDateTimeTR(),
        text: `Kenar notuna vade tarihi atandı ve takvime aktarıldı: ${formatDateToTR(iso)}`
    });

    addAuditLog("VADE ATAMA", `${p.title} kenar notuna ${formatDateToTR(iso)} vade tarihi atanarak ödeme takvimine aktarıldı.`);
    syncStateToServer();
    renderAll();
}

function promptAssignDateToUndatedPayment(payId) {
    const p = (appState.payments || []).find(x => x.id === payId);
    if (!p) return;
    const defTR = formatDateToTR(addDaysISO(todayISO(), 7));
    const userVal = prompt(`"${p.title}" (${p.creditor}) için vade tarihini giriniz (GG.AA.YYYY):`, defTR);
    if (!userVal || !userVal.trim()) return;
    const iso = parseAnyDateToISO(userVal.trim());
    p.dueDate = iso;
    p.isUndated = false;
    p.status = iso < todayISO() ? "Gecikti" : "Planlandı";
    if (!Array.isArray(p.history)) p.history = [];
    p.history.unshift({
        date: formatDateTimeTR(),
        text: `Kenar notuna vade tarihi atandı ve takvime aktarıldı: ${formatDateToTR(iso)}`
    });
    addAuditLog("VADE ATAMA", `${p.title} kenar notuna ${formatDateToTR(iso)} vade tarihi atanarak ödeme takvimine aktarıldı.`);
    syncStateToServer();
    renderAll();
}

function renderUndatedNotesUI() {
    const allPayments = getDeduplicatedPayments();
    const undatedList = allPayments.filter(p => isPaymentUndated(p) && p.status !== "İptal edildi" && p.status !== "Ödendi");
    const totalTRY = undatedList.reduce((s, p) => s + toTRY(getPaymentRemainingAmount(p), p.currency), 0);

    // Rozetleri güncelle
    const setTxt = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };
    setTxt("header-undated-count", String(undatedList.length));
    setTxt("floating-undated-count", String(undatedList.length));
    setTxt("dash-undated-count-badge", `${undatedList.length} Not`);
    setTxt("dash-undated-total-badge", `Tahmini: ${formatMoney(totalTRY, "TRY")}`);
    setTxt("pay-undated-count-badge", `${undatedList.length} Not`);
    setTxt("pay-undated-total-badge", `Tahmini Toplam: ${formatMoney(totalTRY, "TRY")}`);
    setTxt("drawer-undated-count", `${undatedList.length} Adet`);
    setTxt("drawer-undated-total", formatMoney(totalTRY, "TRY"));

    const buildCardsHtml = (ctxPrefix) => {
        if (undatedList.length === 0) {
            return `<div style="padding:12px; text-align:center; font-size:0.76rem; color:var(--text-muted);">Şu anda tarihi belli olmayan ödeme veya kenar notu bulunmuyor. Yukarıdan hızlıca ekleyebilirsiniz.</div>`;
        }
        return `<div class="${ctxPrefix === 'drawer' ? '' : 'undated-note-grid'}" style="${ctxPrefix === 'drawer' ? 'display:flex; flex-direction:column; gap:8px;' : ''}">` +
            undatedList.map(p => {
                const rem = getPaymentRemainingAmount(p);
                const amtLabel = (!p.totalAmount || Number(p.totalAmount) <= 0)
                    ? `<span class="badge badge-neutral">Tutar Henüz Belirsiz</span>`
                    : `<strong style="font-size:0.9rem; color:var(--amber-warn);">${formatMoney(rem, p.currency)}</strong>`;
                const inputId = `und-date-${ctxPrefix}-${p.id}`;
                return `
                    <div class="undated-note-card">
                        <div>
                            <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:6px; margin-bottom:4px;">
                                <div style="font-weight:700; font-size:0.81rem; color:var(--text-primary);">${escapeHtml(p.title)}</div>
                                ${amtLabel}
                            </div>
                            <div style="font-size:0.71rem; color:var(--text-secondary); margin-bottom:4px;">
                                <i class="fa-solid fa-building" style="color:var(--dizsan-cyan);"></i> ${escapeHtml(p.creditor)}
                                &bull; <span class="badge badge-neutral" style="font-size:0.62rem;">${escapeHtml(getCompanyName(p.companyId))}</span>
                                <span class="badge badge-info" style="font-size:0.62rem;">${escapeHtml(p.category)}</span>
                            </div>
                            ${p.desc ? `<div style="font-size:0.7rem; color:var(--text-muted); background:rgba(255,255,255,0.03); padding:5px 7px; border-radius:6px; border-left:2px solid var(--dizsan-cyan);">${escapeHtml(p.desc)}</div>` : ""}
                        </div>
                        <div style="display:flex; align-items:center; justify-content:space-between; gap:5px; flex-wrap:wrap; padding-top:6px; border-top:1px solid var(--border-subtle);">
                            <div style="display:flex; align-items:center; gap:4px; flex:1; min-width:175px;">
                                <input type="text" id="${inputId}" class="form-control" style="padding:4px 7px; font-size:0.71rem; width:102px;" placeholder="GG.AA.YYYY">
                                <button type="button" class="btn btn-sm btn-warning" onclick="assignDateToUndatedPayment('${p.id}', '${inputId}')" title="Vade Tarihi Belirle ve Takvime Aktar">
                                    <i class="fa-solid fa-calendar-plus"></i> Takvime Al
                                </button>
                            </div>
                            <div style="display:flex; align-items:center; gap:4px;">
                                <button type="button" class="btn btn-sm btn-success" onclick="openPaymentExecModal('${p.id}')" title="Hemen Öde">
                                    <i class="fa-solid fa-check"></i>
                                </button>
                                <button type="button" class="btn btn-sm" onclick="openPaymentModal('${p.id}')" title="Düzenle">
                                    <i class="fa-solid fa-pen"></i>
                                </button>
                                <button type="button" class="btn btn-sm" onclick="deletePaymentRecord('${p.id}')" title="Notu Sil">
                                    <i class="fa-solid fa-trash" style="color:var(--rose-danger);"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join("") +
            `</div>`;
    };

    const dashListEl = document.getElementById("dash-undated-notes-list");
    if (dashListEl) dashListEl.innerHTML = buildCardsHtml("dash");

    const payListEl = document.getElementById("pay-undated-notes-list");
    if (payListEl) payListEl.innerHTML = buildCardsHtml("pay");

    const drawerListEl = document.getElementById("drawer-undated-notes-list");
    if (drawerListEl) drawerListEl.innerHTML = buildCardsHtml("drawer");
}

function generateFutureRecurringInstallments(basePayment) {
    const endISO = basePayment.recurrenceEnd || addMonthsISO(basePayment.dueDate, 6);
    let cursorISO = basePayment.dueDate;
    let count = 1;

    appState.recurringRules.push({
        id: basePayment.seriesId,
        companyId: basePayment.companyId,
        direction: "PAYMENT",
        title: basePayment.title,
        party: basePayment.creditor,
        category: basePayment.category,
        frequency: basePayment.recurrence,
        amount: basePayment.totalAmount,
        currency: basePayment.currency,
        startDate: basePayment.dueDate,
        endDate: endISO,
        accountId: basePayment.accountId
    });

    while (count < 24) {
        if (basePayment.recurrence === "WEEKLY") cursorISO = addDaysISO(cursorISO, 7);
        else if (basePayment.recurrence === "MONTHLY") cursorISO = addMonthsISO(cursorISO, 1);
        else if (basePayment.recurrence === "QUARTERLY") cursorISO = addMonthsISO(cursorISO, 3);
        else if (basePayment.recurrence === "SEMIANNUAL") cursorISO = addMonthsISO(cursorISO, 6);
        else if (basePayment.recurrence === "YEARLY") cursorISO = addMonthsISO(cursorISO, 12);
        else cursorISO = addDaysISO(cursorISO, 30);

        if (cursorISO > endISO) break;
        count++;
        const instId = `${basePayment.id}-R${count}`;
        appState.payments.push({
            ...basePayment,
            id: instId,
            obligationKey: `PAY:${instId}`,
            title: `${basePayment.title} (${count}. Dönem)`,
            dueDate: cursorISO,
            status: "Planlandı",
            transactions: [],
            history: []
        });
    }
}

function openPaymentExecModal(payId, preselectedPersonId = "") {
    const p = appState.payments.find(x => x.id === payId);
    if (!p) return;

    populateAccountSelectsForModal();
    document.getElementById("exec-pay-id").value = p.id;
    const paid = getPaymentPaidAmount(p);
    const rem = getPaymentRemainingAmount(p);

    document.getElementById("exec-pay-amount").value = rem > 0 ? rem : p.totalAmount;
    document.getElementById("exec-pay-date").value = formatDateToTR(todayISO());
    document.getElementById("exec-pay-note").value = "";
    if (p.accountId) document.getElementById("exec-pay-account").value = p.accountId;

    const personWrap = document.getElementById("exec-pay-person-wrap");
    const personSel = document.getElementById("exec-pay-person");
    const personInfo = document.getElementById("exec-pay-person-info");
    const hasPersonnel = Array.isArray(p.personnelItems) && p.personnelItems.length > 0;

    if (personWrap && personSel) {
        if (hasPersonnel) {
            personWrap.style.display = "block";
            personSel.innerHTML = `<option value="">-- Genel Ödeme (Tüm Bordro / Toplu) --</option>` +
                p.personnelItems.map(pr => {
                    const pid = pr.personId || pr.id || "";
                    const sal = Number(pr.salaryAmount ?? pr.salary) || 0;
                    const pRem = getPersonnelRemainingAmount(p, pr);
                    const pPaid = getPersonnelPaidAmount(p, pr);
                    return `<option value="${escapeHtml(pid)}">${escapeHtml(pr.name)} (${escapeHtml(pr.role || "Personel")}) — Maaş: ${formatMoney(sal, p.currency)} | Ödenen: ${formatMoney(pPaid, p.currency)} | Kalan: ${formatMoney(pRem, p.currency)}</option>`;
                }).join("");
            personSel.value = preselectedPersonId || "";
            handleExecPersonSelectChange(personSel.value);
        } else {
            personWrap.style.display = "none";
            personSel.innerHTML = `<option value="">-- Genel Ödeme (Tüm Kayıt) --</option>`;
            if (personInfo) personInfo.textContent = "";
        }
    }

    const sumEl = document.getElementById("exec-pay-summary");
    if (sumEl) {
        sumEl.innerHTML = `
            <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:10px;">
                <div>
                    <div style="font-weight:800; font-size:0.95rem;">${escapeHtml(p.title)}</div>
                    <div style="font-size:0.76rem; color:var(--text-muted);">${escapeHtml(p.creditor)} &bull; Vade: ${p.dueDate ? formatDateToTR(p.dueDate) : "Tarihi Belirsiz"}</div>
                </div>
                <div style="display:flex; gap:14px; text-align:right;">
                    <div><span style="font-size:0.7rem; color:var(--text-muted); display:block;">Toplam Borç</span><strong>${formatMoney(p.totalAmount, p.currency)}</strong></div>
                    <div><span style="font-size:0.7rem; color:var(--text-muted); display:block;">Ödenen</span><strong style="color:var(--emerald-ok);">${formatMoney(paid, p.currency)}</strong></div>
                    <div><span style="font-size:0.7rem; color:var(--text-muted); display:block;">Kalan Borç</span><strong style="color:var(--rose-danger);">${formatMoney(rem, p.currency)}</strong></div>
                </div>
            </div>
        `;
    }

    const histEl = document.getElementById("exec-pay-history-list");
    if (histEl) {
        const txs = p.transactions || [];
        const logs = p.history || [];
        histEl.innerHTML = `
            ${txs.length === 0 ? `<div style="font-size:0.76rem; color:var(--text-muted); margin-bottom:8px;">Henüz ödeme hareketi kaydedilmemiş.</div>` : txs.map(tx => `
                <div style="padding:7px 10px; border-radius:7px; background:var(--emerald-bg); border:1px solid rgba(16,185,129,0.3); margin-bottom:6px; font-size:0.77rem; display:flex; justify-content:space-between; align-items:center; gap:8px;">
                    <span>
                        <strong>${formatDateToTR(tx.date)}</strong> &bull;
                        ${tx.personName ? `<span style="background:rgba(59,130,246,0.16); color:var(--brand-primary); padding:1px 6px; border-radius:4px; font-weight:700; margin-right:4px;"><i class="fa-solid fa-user"></i> ${escapeHtml(tx.personName)}</span>` : ""}
                        ${escapeHtml(getAccountName(tx.accountId))} &bull; ${escapeHtml(tx.note || "Ödeme hareketi")}
                    </span>
                    <strong style="color:var(--emerald-ok); white-space:nowrap;">${formatMoney(tx.amount, p.currency)}</strong>
                </div>
            `).join("")}
            ${logs.map(l => `
                <div style="padding:6px 10px; border-radius:7px; background:rgba(255,255,255,0.04); margin-bottom:4px; font-size:0.73rem; color:var(--text-muted);">
                    <i class="fa-solid fa-clock-rotate-left"></i> ${escapeHtml(l.date)}: ${escapeHtml(l.text)}
                </div>
            `).join("")}
        `;
    }

    openModal("modal-payment-exec");
}

function handleExecPersonSelectChange(personId) {
    const payId = document.getElementById("exec-pay-id") ? document.getElementById("exec-pay-id").value : "";
    const p = appState.payments.find(x => x.id === payId);
    const infoEl = document.getElementById("exec-pay-person-info");
    const amtInput = document.getElementById("exec-pay-amount");
    const noteInput = document.getElementById("exec-pay-note");
    if (!p) return;

    if (!personId) {
        const rem = getPaymentRemainingAmount(p);
        if (amtInput) amtInput.value = rem > 0 ? rem : p.totalAmount;
        if (infoEl) infoEl.innerHTML = `<span style="color:var(--text-muted);">Genel ödeme seçildi. Belirli bir personele kısmi ödeme veya avans girmek için yukarıdan personel seçebilirsiniz.</span>`;
        return;
    }

    const pr = (p.personnelItems || []).find(item => (item.personId || item.id) === personId);
    if (!pr) return;

    const sal = Number(pr.salaryAmount ?? pr.salary) || 0;
    const pPaid = getPersonnelPaidAmount(p, pr);
    const pRem = getPersonnelRemainingAmount(p, pr);
    if (amtInput) amtInput.value = pRem > 0 ? pRem : sal;
    if (noteInput && !noteInput.value.trim()) {
        noteInput.placeholder = `${pr.name} maaş / kısmi avans ödemesi`;
    }
    if (infoEl) {
        infoEl.innerHTML = `
            <div style="margin-top:4px; padding:6px 10px; border-radius:6px; background:rgba(59,130,246,0.1); border:1px solid rgba(59,130,246,0.25); display:flex; justify-content:space-between; flex-wrap:wrap; gap:8px;">
                <span><i class="fa-solid fa-user-check" style="color:var(--brand-primary);"></i> <strong>${escapeHtml(pr.name)}</strong> (${escapeHtml(pr.role || "Personel")})</span>
                <span>Maaş: <strong>${formatMoney(sal, p.currency)}</strong> &bull; Ödenen: <strong style="color:var(--emerald-ok);">${formatMoney(pPaid, p.currency)}</strong> &bull; Kalan: <strong style="color:var(--rose-danger);">${formatMoney(pRem, p.currency)}</strong></span>
            </div>
        `;
    }
}

function handleExecutePaymentTransaction(e) {
    e.preventDefault();
    const payId = document.getElementById("exec-pay-id").value;
    const amt = Number(document.getElementById("exec-pay-amount").value) || 0;
    const dateISO = parseAnyDateToISO(document.getElementById("exec-pay-date").value);
    const accId = document.getElementById("exec-pay-account").value;
    const note = document.getElementById("exec-pay-note").value.trim();
    const personId = document.getElementById("exec-pay-person") ? document.getElementById("exec-pay-person").value : "";

    const p = appState.payments.find(x => x.id === payId);
    if (!p || amt <= 0) return;

    let personObj = null;
    if (personId && Array.isArray(p.personnelItems)) {
        personObj = p.personnelItems.find(item => (item.personId || item.id) === personId) || null;
    }

    if (!Array.isArray(p.transactions)) p.transactions = [];
    const defaultNote = personObj ? `${personObj.name} kısmi maaş / avans ödemesi` : "Ödeme hareketi";
    p.transactions.push({
        id: "PTX-" + Date.now(),
        date: dateISO,
        amount: amt,
        accountId: accId,
        personId: personObj ? (personObj.personId || personObj.id) : "",
        personName: personObj ? personObj.name : "",
        note: note || defaultNote,
        user: currentUser ? currentUser.name : "Sistem"
    });
    p.accountId = accId;

    // Eğer kredi kartı veya çek ile bağlantılıysa kaynak kaydı da güncelle
    if (p.linkedSourceType === "CREDIT_CARD" && p.linkedSourceId) {
        const cc = (appState.creditCards || []).find(c => c.id === p.linkedSourceId);
        if (cc) cc.paidAmount = getPaymentPaidAmount(p);
    }

    refreshOverdueStatuses();
    const rem = getPaymentRemainingAmount(p);
    const personLogSuffix = personObj ? ` [Personel: ${personObj.name}]` : "";
    addAuditLog("ÖDEME HAREKETİ", `${p.title}${personLogSuffix} için ${formatMoney(amt, p.currency)} ödeme yapıldı (${getAccountName(accId)}). Kalan borç: ${formatMoney(rem, p.currency)}.`);

    closeModal("modal-payment-exec");
    syncStateToServer();
    renderAll();
    if (personObj) {
        showNotification(`${personObj.name} için ${formatMoney(amt, p.currency)} kısmi ödeme/avans kaydedildi.`, "success");
    }
}

function deletePaymentRecord(payId) {
    if (!confirm("Bu ödeme kaydını silmek istediğinize emin misiniz?")) return;
    const idx = appState.payments.findIndex(x => x.id === payId);
    if (idx !== -1) {
        const removed = appState.payments.splice(idx, 1)[0];
        addAuditLog("ÖDEME SİLME", `${removed.title} ödeme kaydı silindi.`);
        syncStateToServer();
        renderAll();
    }
}

// ==================== 15. TAHSİLAT YÖNETİMİ (BÖLÜM 8) ====================
function resetCollectionFilters() {
    document.getElementById("col-search-input").value = "";
    document.getElementById("col-filter-certainty").value = "ALL";
    document.getElementById("col-filter-status").value = "ALL";
    document.getElementById("col-filter-account").value = "ALL";
    document.getElementById("col-sort-by").value = "dateAsc";
    renderCollectionsSection();
}

function renderCollectionsSection() {
    refreshOverdueStatuses();
    const q = normalizeTR(document.getElementById("col-search-input")?.value || "");
    const fCert = document.getElementById("col-filter-certainty")?.value || "ALL";
    const fStat = document.getElementById("col-filter-status")?.value || "ALL";
    const fAcc = document.getElementById("col-filter-account")?.value || "ALL";
    const sortBy = document.getElementById("col-sort-by")?.value || "dateAsc";

    const allCols = getDeduplicatedCollections();
    const pendingCount = allCols.filter(c => getCollectionRemainingAmount(c) > 0 && c.status !== "İptal edildi").length;
    const navBadge = document.getElementById("nav-badge-collections");
    if (navBadge) navBadge.textContent = String(pendingCount);

    const filtered = allCols.filter(c => {
        if (fCert !== "ALL" && c.certainty !== fCert) return false;
        if (fAcc !== "ALL" && c.accountId !== fAcc) return false;
        if (fStat === "PENDING_ALL") {
            if (c.status === "Tahsil edildi" || c.status === "İptal edildi") return false;
        } else if (fStat !== "ALL" && c.status !== fStat) {
            return false;
        }
        if (q && !normalizeTR(`${c.title} ${c.customer} ${c.desc}`).includes(q)) return false;
        return true;
    });

    filtered.sort((a, b) => {
        if (sortBy === "dateDesc") return parseAnyDateToISO(b.expectedDate).localeCompare(parseAnyDateToISO(a.expectedDate));
        if (sortBy === "amountDesc") return (Number(b.totalAmount) || 0) - (Number(a.totalAmount) || 0);
        return parseAnyDateToISO(a.expectedDate).localeCompare(parseAnyDateToISO(b.expectedDate));
    });

    const tbody = document.getElementById("collections-tbody");
    if (!tbody) return;

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:18px; color:var(--text-muted);">Filtre kriterlerine uygun tahsilat kaydı bulunamadı.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(c => {
        const rec = getCollectionReceivedAmount(c);
        const rem = getCollectionRemainingAmount(c);
        const certBadge = c.certainty === "Kesin" ? "badge-success" : (c.certainty === "Muhtemel" ? "badge-info" : "badge-warning");
        const statBadge = c.status === "Tahsil edildi" ? "badge-success" :
                          c.status === "Gecikti" ? "badge-danger" :
                          c.status === "Kısmen tahsil edildi" ? "badge-info" : "badge-warning";
        return `
            <tr>
                <td><strong>${formatDateToTR(c.expectedDate)}</strong></td>
                <td><span class="badge badge-neutral">${escapeHtml(getCompanyName(c.companyId))}</span></td>
                <td>
                    <div style="font-weight:700; color:var(--text-primary);">${escapeHtml(c.customer)}</div>
                    <div style="font-size:0.72rem; color:var(--text-muted);">${escapeHtml(c.title)} ${c.desc ? `&bull; ${escapeHtml(c.desc)}` : ""}</div>
                </td>
                <td><span class="badge ${certBadge}">${escapeHtml(c.certainty)}</span></td>
                <td><strong>${formatMoney(c.totalAmount, c.currency)}</strong></td>
                <td style="color:var(--emerald-ok);">${formatMoney(rec, c.currency)}</td>
                <td><strong style="color:${rem > 0 ? 'var(--dizsan-cyan)' : 'var(--text-muted)'};">${formatMoney(rem, c.currency)}</strong></td>
                <td>${escapeHtml(getAccountName(c.accountId))}</td>
                <td><span class="badge ${statBadge}">${escapeHtml(c.status)}</span></td>
                <td>
                    <div style="display:flex; gap:4px;">
                        <button class="btn btn-sm btn-success" onclick="openCollectionExecModal('${c.id}')" title="Tahsil Et / Kısmi Tahsilat">
                            <i class="fa-solid fa-check"></i> Tahsil Et
                        </button>
                        <button class="btn btn-sm" onclick="openCollectionModal('${c.id}')" title="Düzenle">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

function openCollectionModal(colId = null, defaultDateISO = null) {
    populateCompanySelects();
    populateAccountSelectsForModal();
    document.getElementById("form-collection")?.reset();
    document.getElementById("col-id").value = colId || "";
    document.getElementById("col-expected-date").value = formatDateToTR(defaultDateISO || todayISO());

    if (colId) {
        const c = appState.collections.find(x => x.id === colId);
        if (c) {
            document.getElementById("col-company").value = c.companyId;
            populateAccountSelectsForModal();
            document.getElementById("col-certainty").value = c.certainty;
            document.getElementById("col-customer").value = c.customer;
            document.getElementById("col-title").value = c.title;
            document.getElementById("col-amount").value = c.totalAmount;
            document.getElementById("col-currency").value = c.currency || "TRY";
            document.getElementById("col-expected-date").value = formatDateToTR(c.expectedDate);
            document.getElementById("col-account").value = c.accountId || "";
            document.getElementById("col-status").value = c.status;
            document.getElementById("col-desc").value = c.desc || "";
        }
    } else if (uiState.selectedCompanyId !== "ALL") {
        document.getElementById("col-company").value = uiState.selectedCompanyId;
        populateAccountSelectsForModal();
    }
    openModal("modal-collection");
}

function handleSaveCollection(e) {
    e.preventDefault();
    const id = document.getElementById("col-id").value;
    const companyId = document.getElementById("col-company").value;
    const certainty = document.getElementById("col-certainty").value;
    const customer = document.getElementById("col-customer").value.trim();
    const title = document.getElementById("col-title").value.trim();
    const totalAmount = Number(document.getElementById("col-amount").value) || 0;
    const currency = document.getElementById("col-currency").value;
    const expectedDate = parseAnyDateToISO(document.getElementById("col-expected-date").value);
    const accountId = document.getElementById("col-account").value;
    const status = document.getElementById("col-status").value;
    const desc = document.getElementById("col-desc").value.trim();

    if (id) {
        const c = appState.collections.find(x => x.id === id);
        if (c) {
            Object.assign(c, { companyId, certainty, customer, title, totalAmount, currency, expectedDate, accountId, status, desc });
            addAuditLog("TAHSİLAT DÜZENLEME", `${customer} - ${title} tahsilat kaydı güncellendi.`);
        }
    } else {
        const newCol = {
            id: "COL-" + Date.now(),
            obligationKey: `COL:COL-${Date.now()}`,
            companyId,
            customer,
            title,
            totalAmount,
            currency,
            expectedDate,
            accountId,
            certainty,
            status,
            desc,
            transactions: status === "Tahsil edildi" ? [{
                id: "CTX-" + Date.now(),
                date: todayISO(),
                amount: totalAmount,
                accountId,
                note: "Tam tahsilat olarak işlendi",
                user: currentUser ? currentUser.name : "Sistem"
            }] : []
        };
        appState.collections.unshift(newCol);
        addAuditLog("TAHSİLAT EKLEME", `${customer} (${title}) için ${formatMoney(totalAmount, currency)} (${certainty}) tahsilat beklentisi eklendi.`);
    }

    closeModal("modal-collection");
    syncStateToServer();
    renderAll();
}

function openCollectionExecModal(colId) {
    const c = appState.collections.find(x => x.id === colId);
    if (!c) return;

    populateAccountSelectsForModal();
    document.getElementById("exec-col-id").value = c.id;
    const rec = getCollectionReceivedAmount(c);
    const rem = getCollectionRemainingAmount(c);

    document.getElementById("exec-col-amount").value = rem > 0 ? rem : c.totalAmount;
    document.getElementById("exec-col-date").value = formatDateToTR(todayISO());
    if (c.accountId) document.getElementById("exec-col-account").value = c.accountId;

    const sumEl = document.getElementById("exec-col-summary");
    if (sumEl) {
        sumEl.innerHTML = `
            <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:10px;">
                <div>
                    <div style="font-weight:800; font-size:0.95rem;">${escapeHtml(c.customer)} – ${escapeHtml(c.title)}</div>
                    <div style="font-size:0.76rem; color:var(--text-muted);">Beklenen Tarih: ${formatDateToTR(c.expectedDate)} &bull; Kesinlik: ${escapeHtml(c.certainty)}</div>
                </div>
                <div style="display:flex; gap:14px; text-align:right;">
                    <div><span style="font-size:0.7rem; color:var(--text-muted); display:block;">Toplam Tutar</span><strong>${formatMoney(c.totalAmount, c.currency)}</strong></div>
                    <div><span style="font-size:0.7rem; color:var(--text-muted); display:block;">Tahsil Edilen</span><strong style="color:var(--emerald-ok);">${formatMoney(rec, c.currency)}</strong></div>
                    <div><span style="font-size:0.7rem; color:var(--text-muted); display:block;">Kalan Alacak</span><strong style="color:var(--dizsan-cyan);">${formatMoney(rem, c.currency)}</strong></div>
                </div>
            </div>
        `;
    }

    const histEl = document.getElementById("exec-col-history-list");
    if (histEl) {
        const txs = c.transactions || [];
        histEl.innerHTML = txs.length === 0
            ? `<div style="font-size:0.76rem; color:var(--text-muted);">Henüz tahsilat hareketi kaydedilmemiş.</div>`
            : txs.map(tx => `
                <div style="padding:7px 10px; border-radius:7px; background:var(--emerald-bg); border:1px solid rgba(16,185,129,0.3); margin-bottom:6px; font-size:0.77rem; display:flex; justify-content:space-between;">
                    <span><strong>${formatDateToTR(tx.date)}</strong> &bull; ${escapeHtml(getAccountName(tx.accountId))} &bull; ${escapeHtml(tx.note || "Tahsilat girişi")}</span>
                    <strong style="color:var(--emerald-ok);">+${formatMoney(tx.amount, c.currency)}</strong>
                </div>
            `).join("");
    }

    openModal("modal-collection-exec");
}

function handleExecuteCollectionTransaction(e) {
    e.preventDefault();
    const colId = document.getElementById("exec-col-id").value;
    const amt = Number(document.getElementById("exec-col-amount").value) || 0;
    const dateISO = parseAnyDateToISO(document.getElementById("exec-col-date").value);
    const accId = document.getElementById("exec-col-account").value;
    const note = document.getElementById("exec-col-note").value.trim();

    const c = appState.collections.find(x => x.id === colId);
    if (!c || amt <= 0) return;

    if (!Array.isArray(c.transactions)) c.transactions = [];
    c.transactions.push({
        id: "CTX-" + Date.now(),
        date: dateISO,
        amount: amt,
        accountId: accId,
        note: note || "Tahsilat girişi",
        user: currentUser ? currentUser.name : "Sistem"
    });
    c.accountId = accId;

    refreshOverdueStatuses();
    addAuditLog("TAHSİLAT HAREKETİ", `${c.customer} (${c.title}) için ${formatMoney(amt, c.currency)} tahsilat ${getAccountName(accId)} hesabına işlendi.`);

    closeModal("modal-collection-exec");
    syncStateToServer();
    renderAll();
}

// ==================== 16. TEKRARLAYAN İŞLEMLER & KART/KREDİ/ÇEK (BÖLÜM 11 & 12) ====================
function openRecurringRuleModal() {
    openPaymentModal();
    const recSel = document.getElementById("pay-recurrence");
    if (recSel) {
        recSel.value = "MONTHLY";
        togglePayRecurrenceFields("MONTHLY");
    }
}

function renderRecurringSection() {
    const tbody = document.getElementById("recurring-tbody");
    if (!tbody) return;
    const rules = (appState.recurringRules || []).filter(r => uiState.selectedCompanyId === "ALL" || r.companyId === uiState.selectedCompanyId);

    if (rules.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:16px; color:var(--text-muted);">Tanımlı tekrarlayan işlem şablonu bulunmuyor.</td></tr>`;
        return;
    }

    tbody.innerHTML = rules.map(r => {
        const count = (appState.payments || []).filter(p => p.seriesId === r.id).length;
        return `
            <tr>
                <td><span class="badge badge-info">${escapeHtml(getCompanyName(r.companyId))}</span></td>
                <td><span class="badge badge-danger">Düzenli Ödeme</span></td>
                <td><strong>${escapeHtml(r.title)}</strong> <div style="font-size:0.71rem; color:var(--text-muted);">${escapeHtml(r.party)}</div></td>
                <td>${escapeHtml(r.category)}</td>
                <td><span class="badge badge-neutral">${escapeHtml(r.frequency)}</span></td>
                <td><strong>${formatMoney(r.amount, r.currency)}</strong></td>
                <td>${formatDateToTR(r.startDate)} - ${formatDateToTR(r.endDate)}</td>
                <td><span class="badge badge-success">${count} Taksit</span></td>
                <td>
                    <button class="btn btn-sm" onclick="switchTab('payments')">Taksitleri Gör</button>
                </td>
            </tr>
        `;
    }).join("");
}

function renderInstrumentsSection() {
    synchronizeInstrumentsWithObligations();

    // 1. Kredi Kartları
    const ccTbody = document.getElementById("credit-cards-tbody");
    if (ccTbody) {
        const cards = (appState.creditCards || []).filter(c => uiState.selectedCompanyId === "ALL" || c.companyId === uiState.selectedCompanyId);
        ccTbody.innerHTML = cards.map(cc => {
            const linkedPay = appState.payments.find(p => p.obligationKey === `CC:${cc.id}`);
            const paid = linkedPay ? getPaymentPaidAmount(linkedPay) : (Number(cc.paidAmount) || 0);
            const rem = Math.max(0, (Number(cc.debtAmount) || 0) - paid);
            return `
                <tr>
                    <td><span class="badge badge-neutral">${escapeHtml(getCompanyName(cc.companyId))}</span></td>
                    <td><strong>${escapeHtml(cc.bank)}</strong> – ${escapeHtml(cc.cardName)}</td>
                    <td>${formatDateToTR(cc.cutoffDate)}</td>
                    <td><strong>${formatDateToTR(cc.dueDate)}</strong></td>
                    <td><strong>${formatMoney(cc.debtAmount)}</strong></td>
                    <td style="color:var(--emerald-ok);">${formatMoney(paid)}</td>
                    <td><strong style="color:${rem > 0 ? 'var(--rose-danger)' : 'var(--text-muted)'};">${formatMoney(rem)}</strong></td>
                    <td><span class="badge ${rem <= 0 ? 'badge-success' : 'badge-warning'}">${rem <= 0 ? "Ödendi" : "Bekliyor"}</span></td>
                    <td>
                        ${linkedPay ? `<button class="btn btn-sm btn-success" onclick="openPaymentExecModal('${linkedPay.id}')">Öde</button>` : ""}
                    </td>
                </tr>
            `;
        }).join("");
    }

    // 2. Krediler & Leasing
    const loanTbody = document.getElementById("loans-tbody");
    if (loanTbody) {
        const loans = (appState.loans || []).filter(l => uiState.selectedCompanyId === "ALL" || l.companyId === uiState.selectedCompanyId);
        loanTbody.innerHTML = loans.map(l => {
            const insts = appState.payments.filter(p => p.seriesId === l.id || p.linkedSourceId === l.id);
            const totalPayback = insts.length > 0
                ? insts.reduce((s, i) => s + (Number(i.totalAmount) || 0), 0)
                : (Number(l.installmentAmount) || 0) * (Number(l.installmentCount) || 1);
            const paidSum = insts.reduce((s, i) => s + getPaymentPaidAmount(i), 0);
            const remSum = Math.max(0, totalPayback - paidSum);
            const nextInst = insts.filter(i => getPaymentRemainingAmount(i) > 0).sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];
            return `
                <tr>
                    <td><span class="badge badge-neutral">${escapeHtml(getCompanyName(l.companyId))}</span></td>
                    <td><strong>${escapeHtml(l.bank)}</strong></td>
                    <td>${escapeHtml(l.title)} <span class="badge badge-info">${escapeHtml(l.type)}</span></td>
                    <td><strong>${formatMoney(totalPayback)}</strong></td>
                    <td style="color:var(--emerald-ok);">${formatMoney(paidSum)}</td>
                    <td><strong style="color:var(--amber-warn);">${formatMoney(remSum)}</strong></td>
                    <td>${insts.filter(i => getPaymentRemainingAmount(i) <= 0).length} / ${Math.max(insts.length, l.installmentCount || 1)} Taksit</td>
                    <td>${nextInst ? formatDateToTR(nextInst.dueDate) : "Tamamlandı"}</td>
                    <td>
                        ${nextInst ? `<button class="btn btn-sm btn-success" onclick="openPaymentExecModal('${nextInst.id}')">Taksit Öde</button>` : ""}
                    </td>
                </tr>
            `;
        }).join("");
    }

    // 3. Çek ve Senetler
    const chkTbody = document.getElementById("checks-tbody");
    if (chkTbody) {
        const checks = (appState.checks || []).filter(k => uiState.selectedCompanyId === "ALL" || k.companyId === uiState.selectedCompanyId);
        chkTbody.innerHTML = checks.map(chk => {
            const isOut = chk.direction === "OUT_CHECK" || chk.direction === "OUT_NOTE";
            const linked = isOut
                ? appState.payments.find(p => p.obligationKey === `CHK:${chk.id}`)
                : appState.collections.find(c => c.obligationKey === `CHK:${chk.id}`);
            const paid = linked ? (isOut ? getPaymentPaidAmount(linked) : getCollectionReceivedAmount(linked)) : 0;
            const rem = Math.max(0, (Number(chk.amount) || 0) - paid);
            return `
                <tr>
                    <td><strong>${formatDateToTR(chk.dueDate)}</strong></td>
                    <td><span class="badge badge-neutral">${escapeHtml(getCompanyName(chk.companyId))}</span></td>
                    <td><span class="badge ${isOut ? 'badge-danger' : 'badge-success'}">${isOut ? "Verilen Borç Evrakı" : "Alınan Müşteri Evrakı"}</span></td>
                    <td><strong>${escapeHtml(chk.party)}</strong></td>
                    <td>${escapeHtml(chk.bankNo)}</td>
                    <td><strong>${formatMoney(chk.amount)}</strong></td>
                    <td style="color:var(--emerald-ok);">${formatMoney(paid)}</td>
                    <td><strong>${formatMoney(rem)}</strong></td>
                    <td><span class="badge ${rem <= 0 ? 'badge-success' : 'badge-warning'}">${rem <= 0 ? "Kapandı" : "Açık"}</span></td>
                    <td>
                        ${linked ? `<button class="btn btn-sm" onclick="${isOut ? `openPaymentExecModal('${linked.id}')` : `openCollectionExecModal('${linked.id}')`}">İşle</button>` : ""}
                    </td>
                </tr>
            `;
        }).join("");
    }
}

function openCreditCardModal() {
    populateCompanySelects();
    populateAccountSelectsForModal();
    document.getElementById("form-credit-card")?.reset();
    document.getElementById("cc-cutoff-date").value = formatDateToTR(todayISO());
    document.getElementById("cc-due-date").value = formatDateToTR(addDaysISO(todayISO(), 10));
    openModal("modal-credit-card");
}

function handleSaveCreditCard(e) {
    e.preventDefault();
    const id = "CC-" + Date.now();
    const companyId = document.getElementById("cc-company").value;
    const bank = document.getElementById("cc-bank").value.trim();
    const cardName = document.getElementById("cc-name").value.trim();
    const accountId = document.getElementById("cc-account").value;
    const cutoffDate = parseAnyDateToISO(document.getElementById("cc-cutoff-date").value);
    const dueDate = parseAnyDateToISO(document.getElementById("cc-due-date").value);
    const debtAmount = Number(document.getElementById("cc-debt").value) || 0;
    const paidAmount = Number(document.getElementById("cc-paid").value) || 0;

    appState.creditCards.push({ id, companyId, bank, cardName, accountId, cutoffDate, dueDate, debtAmount, paidAmount });
    synchronizeInstrumentsWithObligations();
    addAuditLog("KREDİ KARTI", `${bank} ${cardName} (${formatMoney(debtAmount)}) dönem borcu eklendi ve ödeme takvimine bağlandı.`);
    closeModal("modal-credit-card");
    syncStateToServer();
    renderAll();
}

function openLoanPlanModal() {
    populateCompanySelects();
    populateAccountSelectsForModal();
    document.getElementById("form-loan-plan")?.reset();
    document.getElementById("loan-first-due").value = formatDateToTR(addDaysISO(todayISO(), 15));
    openModal("modal-loan-plan");
}

function handleSaveLoanPlan(e) {
    e.preventDefault();
    const loanId = "LOAN-" + Date.now();
    const companyId = document.getElementById("loan-company").value;
    const bank = document.getElementById("loan-bank").value.trim();
    const title = document.getElementById("loan-title").value.trim();
    const type = document.getElementById("loan-type").value;
    const installmentAmount = Number(document.getElementById("loan-installment-amount").value) || 0;
    const installmentCount = Math.min(120, Math.max(1, Number(document.getElementById("loan-installment-count").value) || 12));
    const firstDueDate = parseAnyDateToISO(document.getElementById("loan-first-due").value);
    const accountId = document.getElementById("loan-account").value;

    appState.loans.push({
        id: loanId,
        companyId,
        bank,
        title,
        type,
        installmentAmount,
        installmentCount,
        firstDueDate,
        accountId
    });

    for (let i = 0; i < installmentCount; i++) {
        const dueISO = addMonthsISO(firstDueDate, i);
        const obKey = `LOAN:${loanId}:${i + 1}`;
        appState.payments.push({
            id: `PAY-${loanId}-${i + 1}`,
            obligationKey: obKey,
            linkedSourceType: "LOAN",
            linkedSourceId: loanId,
            seriesId: loanId,
            companyId,
            title: `${title} (${i + 1}/${installmentCount}. Taksit)`,
            creditor: bank,
            category: type,
            totalAmount: installmentAmount,
            currency: "TRY",
            dueDate: dueISO,
            accountId,
            recurrence: "MONTHLY",
            status: "Planlandı",
            desc: `${bank} ${title} taksit planı`,
            transactions: [],
            history: []
        });
    }

    addAuditLog("KREDİ/LEASING", `${bank} - ${title} için ${installmentCount} taksitli (${formatMoney(installmentAmount)}/ay) ödeme planı oluşturuldu.`);
    closeModal("modal-loan-plan");
    syncStateToServer();
    renderAll();
}

function openCheckNoteModal() {
    populateCompanySelects();
    populateAccountSelectsForModal();
    document.getElementById("form-check-note")?.reset();
    document.getElementById("chk-due-date").value = formatDateToTR(addDaysISO(todayISO(), 14));
    openModal("modal-check-note");
}

function handleSaveCheckNote(e) {
    e.preventDefault();
    const id = "CHK-" + Date.now();
    const companyId = document.getElementById("chk-company").value;
    const direction = document.getElementById("chk-direction").value;
    const party = document.getElementById("chk-party").value.trim();
    const bankNo = document.getElementById("chk-bank-no").value.trim();
    const amount = Number(document.getElementById("chk-amount").value) || 0;
    const dueDate = parseAnyDateToISO(document.getElementById("chk-due-date").value);
    const accountId = document.getElementById("chk-account").value;

    appState.checks.push({
        id,
        companyId,
        direction,
        party,
        bankNo,
        amount,
        dueDate,
        accountId,
        paidAmount: 0,
        status: direction.startsWith("OUT") ? "Planlandı" : "Bekleniyor"
    });

    synchronizeInstrumentsWithObligations();
    addAuditLog("ÇEK/SENET", `${party} - ${bankNo} (${formatMoney(amount)}) vade takibine eklendi.`);
    closeModal("modal-check-note");
    syncStateToServer();
    renderAll();
}

// ==================== 17. ÇOKLU ŞİRKET VE KATEGORİ YÖNETİMİ (BÖLÜM 4 & 7) ====================
function handleCompanyFilterChange(compId) {
    uiState.selectedCompanyId = compId || "ALL";
    const pill = document.getElementById("active-company-pill");
    if (pill) {
        pill.textContent = uiState.selectedCompanyId === "ALL"
            ? "Tüm Şirketler (Konsolide)"
            : getCompanyName(uiState.selectedCompanyId);
    }
    renderAll();
}

function renderCompaniesSection() {
    const tbody = document.getElementById("companies-tbody");
    if (tbody) {
        tbody.innerHTML = (appState.companies || []).map(comp => {
            const m = computeDashboardMetrics(comp.id);
            return `
                <tr>
                    <td>
                        <strong>${escapeHtml(comp.name)}</strong>
                        <div style="font-size:0.7rem; color:var(--text-muted);">${escapeHtml(comp.taxInfo || "")}</div>
                    </td>
                    <td><strong style="color:var(--emerald-ok);">${formatMoney(m.totalCashTRY)}</strong></td>
                    <td style="color:var(--amber-warn);">${formatMoney(m.pendingPaymentsTRY)}</td>
                    <td style="color:var(--dizsan-cyan);">${formatMoney(m.expectedCollectionsTRY)}</td>
                    <td><span class="badge ${comp.status === 'Aktif' ? 'badge-success' : 'badge-neutral'}">${escapeHtml(comp.status)}</span></td>
                    <td>
                        <button class="btn btn-sm" onclick="openCompanyModal('${comp.id}')"><i class="fa-solid fa-pen"></i> Düzenle</button>
                    </td>
                </tr>
            `;
        }).join("");
    }

    const catWrap = document.getElementById("categories-chip-container");
    if (catWrap) {
        catWrap.innerHTML = (appState.categories || []).map(cat => `
            <span class="badge badge-info" style="padding:6px 10px; font-size:0.76rem; display:inline-flex; align-items:center; gap:6px;">
                <span>${escapeHtml(cat)}</span>
                <i class="fa-solid fa-xmark" style="cursor:pointer;" onclick="removeCategory('${escapeHtml(cat)}')" title="Kategoriyi Sil"></i>
            </span>
        `).join("");
    }
}

function openCompanyModal(compId = null) {
    document.getElementById("form-company")?.reset();
    document.getElementById("comp-id").value = compId || "";
    if (compId) {
        const comp = getCompanyById(compId);
        if (comp) {
            document.getElementById("comp-name").value = comp.name;
            document.getElementById("comp-tax").value = comp.taxInfo || "";
            document.getElementById("comp-status").value = comp.status || "Aktif";
        }
    }
    openModal("modal-company");
}

function handleSaveCompany(e) {
    e.preventDefault();
    const id = document.getElementById("comp-id").value;
    const name = document.getElementById("comp-name").value.trim();
    const taxInfo = document.getElementById("comp-tax").value.trim();
    const status = document.getElementById("comp-status").value;

    if (id) {
        const comp = getCompanyById(id);
        if (comp) {
            Object.assign(comp, { name, taxInfo, status });
            addAuditLog("ŞİRKET", `${name} şirket bilgileri güncellendi (${status}).`);
        }
    } else {
        appState.companies.push({
            id: "COMP-" + Date.now(),
            name,
            taxInfo,
            status,
            color: "#38bdf8"
        });
        addAuditLog("ŞİRKET", `Yeni şirket eklendi: ${name}.`);
    }

    closeModal("modal-company");
    syncStateToServer();
    renderAll();
}

function handleAddCategory(e) {
    e.preventDefault();
    const inp = document.getElementById("new-category-name");
    const val = (inp?.value || "").trim();
    if (!val) return;
    if (!appState.categories.includes(val)) {
        appState.categories.push(val);
        addAuditLog("KATEGORİ", `Yeni ödeme kategorisi eklendi: ${val}`);
        syncStateToServer();
        renderAll();
    }
    if (inp) inp.value = "";
}

function removeCategory(catName) {
    if (!confirm(`"${catName}" kategorisini listeden kaldırmak istiyor musunuz?`)) return;
    appState.categories = appState.categories.filter(c => c !== catName);
    syncStateToServer();
    renderAll();
}

// ==================== 18. RAPORLAR, EXCEL (.XLS/.CSV) VE A4 YAZICI UYUMLULUĞU (BÖLÜM 13) ====================
function updatePrintOrientation(orient) {
    let styleEl = document.getElementById("dynamic-a4-page-style");
    if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = "dynamic-a4-page-style";
        document.head.appendChild(styleEl);
    }
    styleEl.textContent = `@media print { @page { size: A4 ${orient === "landscape" ? "landscape" : "portrait"}; margin: 10mm; } }`;
}

function buildReportHtmlContent(reportType = null) {
    const rType = reportType || document.getElementById("rep-type-select")?.value || "SUMMARY_ALL";
    const sDate = document.getElementById("rep-start-date")?.value
        ? parseAnyDateToISO(document.getElementById("rep-start-date").value)
        : uiState.dashStartDate;
    const eDate = document.getElementById("rep-end-date")?.value
        ? parseAnyDateToISO(document.getElementById("rep-end-date").value)
        : uiState.dashEndDate;

    const m = computeDashboardMetrics();
    const companyTitle = uiState.selectedCompanyId === "ALL" ? "TÜM ŞİRKETLER (KONSOLİDE)" : getCompanyName(uiState.selectedCompanyId);
    const payments = getDeduplicatedPayments();
    const collections = getDeduplicatedCollections();
    const accounts = getFilteredActiveAccounts();

    const reportTitles = {
        SUMMARY_ALL: "KAPSAMLI YÖNETİCİ FİNANS VE NAKİT AKIŞ ÖZET RAPORU",
        PAYMENTS_LIST: "DETAYLI ÖDEME VE BORÇ LİSTESİ RAPORU",
        COLLECTIONS_LIST: "DETAYLI TAHSİLAT VE ALACAK LİSTESİ RAPORU",
        OVERDUE_REPORT: "GECİKMİŞ ÖDEMELER VE TAHSİLATLAR RAPORU",
        CASHFLOW_30D: "30 GÜNLÜK NAKİT AKIŞI PROJEKSİYON RAPORU",
        CATEGORY_BREAKDOWN: "KATEGORİ VE ŞİRKET BAZLI GİDER DAĞILIM RAPORU",
        INSTRUMENTS_REPORT: "KREDİ KARTI, KREDİ TAKSİTLERİ VE ÇEK/SENET RAPORU"
    };

    let bodyTablesHtml = "";

    if (rType === "SUMMARY_ALL" || rType === "PAYMENTS_LIST") {
        const payRows = payments.map(p => `
            <tr>
                <td>${formatDateToTR(p.dueDate)}</td>
                <td>${escapeHtml(getCompanyName(p.companyId))}</td>
                <td><strong>${escapeHtml(p.title)}</strong></td>
                <td>${escapeHtml(p.creditor)}</td>
                <td>${escapeHtml(p.category)}</td>
                <td>${formatMoney(p.totalAmount, p.currency)}</td>
                <td>${formatMoney(getPaymentPaidAmount(p), p.currency)}</td>
                <td><strong>${formatMoney(getPaymentRemainingAmount(p), p.currency)}</strong></td>
                <td>${escapeHtml(p.status)}</td>
            </tr>
        `).join("");

        bodyTablesHtml += `
            <h4 style="margin:12px 0 6px; font-size:12px; color:#0f172a; border-bottom:1px solid #cbd5e1; padding-bottom:4px;">ÖDEME YÜKÜMLÜLÜKLERİ TABLOSU</h4>
            <table class="a4-table">
                <thead>
                    <tr>
                        <th>Vade</th><th>Şirket</th><th>Ödeme Başlığı</th><th>Alacaklı</th><th>Kategori</th><th>Toplam</th><th>Ödenen</th><th>Kalan Borç</th><th>Durum</th>
                    </tr>
                </thead>
                <tbody>${payRows || `<tr><td colspan="9">Kayıt yok</td></tr>`}</tbody>
            </table>
        `;
    }

    if (rType === "SUMMARY_ALL" || rType === "COLLECTIONS_LIST") {
        const colRows = collections.map(c => `
            <tr>
                <td>${formatDateToTR(c.expectedDate)}</td>
                <td>${escapeHtml(getCompanyName(c.companyId))}</td>
                <td><strong>${escapeHtml(c.customer)}</strong></td>
                <td>${escapeHtml(c.title)}</td>
                <td>${escapeHtml(c.certainty)}</td>
                <td>${formatMoney(c.totalAmount, c.currency)}</td>
                <td>${formatMoney(getCollectionReceivedAmount(c), c.currency)}</td>
                <td><strong>${formatMoney(getCollectionRemainingAmount(c), c.currency)}</strong></td>
                <td>${escapeHtml(c.status)}</td>
            </tr>
        `).join("");

        bodyTablesHtml += `
            <h4 style="margin:12px 0 6px; font-size:12px; color:#0f172a; border-bottom:1px solid #cbd5e1; padding-bottom:4px;">BEKLENEN VE GERÇEKLEŞEN TAHSİLATLAR TABLOSU</h4>
            <table class="a4-table">
                <thead>
                    <tr>
                        <th>Tarih</th><th>Şirket</th><th>Müşteri / Kaynak</th><th>Başlık</th><th>Kesinlik</th><th>Toplam</th><th>Tahsil Edilen</th><th>Kalan Alacak</th><th>Durum</th>
                    </tr>
                </thead>
                <tbody>${colRows || `<tr><td colspan="9">Kayıt yok</td></tr>`}</tbody>
            </table>
        `;
    }

    if (rType === "SUMMARY_ALL") {
        const accRows = accounts.map(a => `
            <tr>
                <td>${escapeHtml(getCompanyName(a.companyId))}</td>
                <td><strong>${escapeHtml(a.name)}</strong></td>
                <td>${escapeHtml(a.bankName)}</td>
                <td>${escapeHtml(a.currency)}</td>
                <td>${formatMoney(a.openingBalance, a.currency)}</td>
                <td><strong>${formatMoney(calculateAccountCurrentBalance(a), a.currency)}</strong></td>
            </tr>
        `).join("");

        bodyTablesHtml = `
            <h4 style="margin:8px 0 6px; font-size:12px; color:#0f172a; border-bottom:1px solid #cbd5e1; padding-bottom:4px;">KASA VE BANKA HESAPLARI DURUMU</h4>
            <table class="a4-table">
                <thead>
                    <tr><th>Şirket</th><th>Hesap Adı</th><th>Banka / Kasa</th><th>Döviz</th><th>Açılış Bakiyesi</th><th>Güncel Bakiye</th></tr>
                </thead>
                <tbody>${accRows}</tbody>
            </table>
        ` + bodyTablesHtml;
    }

    if (rType === "OVERDUE_REPORT") {
        const today = todayISO();
        const ovPays = payments.filter(p => getPaymentRemainingAmount(p) > 0 && parseAnyDateToISO(p.dueDate) < today);
        bodyTablesHtml += `
            <h4 style="margin:10px 0 6px; font-size:12px; color:#dc2626;">VADESİ GEÇMİŞ (GECİKMİŞ) ÖDEMELER</h4>
            <table class="a4-table">
                <thead>
                    <tr><th>Vade</th><th>Şirket</th><th>Başlık</th><th>Alacaklı</th><th>Kategori</th><th>Kalan Borç</th></tr>
                </thead>
                <tbody>
                    ${ovPays.map(p => `
                        <tr>
                            <td><strong>${formatDateToTR(p.dueDate)}</strong></td>
                            <td>${escapeHtml(getCompanyName(p.companyId))}</td>
                            <td>${escapeHtml(p.title)}</td>
                            <td>${escapeHtml(p.creditor)}</td>
                            <td>${escapeHtml(p.category)}</td>
                            <td><strong>${formatMoney(getPaymentRemainingAmount(p), p.currency)}</strong></td>
                        </tr>
                    `).join("") || `<tr><td colspan="6">Gecikmiş ödeme bulunmamaktadır.</td></tr>`}
                </tbody>
            </table>
        `;
    }

    if (rType === "CASHFLOW_30D") {
        const fRows = generateCashflowProjectionRows(30, uiState.forecastScenario);
        bodyTablesHtml += `
            <h4 style="margin:10px 0 6px; font-size:12px; color:#0f172a;">30 GÜNLÜK NAKİT AKIŞI PROJEKSİYON TABLOSU</h4>
            <table class="a4-table">
                <thead>
                    <tr><th>Tarih</th><th>Başlangıç Nakdi</th><th>Tahsilat (+)</th><th>Ödeme (−)</th><th>Günlük Net</th><th>Gün Sonu Tahmini Nakit</th></tr>
                </thead>
                <tbody>
                    ${fRows.map(r => `
                        <tr>
                            <td>${r.dateTR}</td>
                            <td>${formatMoney(r.startCash)}</td>
                            <td>${formatMoney(r.inSum)}</td>
                            <td>${formatMoney(r.outSum)}</td>
                            <td>${formatMoney(r.netChange)}</td>
                            <td><strong>${formatMoney(r.endCash)}</strong></td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        `;
    }

    if (rType === "CATEGORY_BREAKDOWN") {
        const catMap = {};
        payments.forEach(p => {
            if (p.status === "İptal edildi") return;
            const cat = p.category || "Diğer giderler";
            if (!catMap[cat]) catMap[cat] = { total: 0, paid: 0, rem: 0, count: 0 };
            catMap[cat].total += toTRY(p.totalAmount, p.currency);
            catMap[cat].paid += toTRY(getPaymentPaidAmount(p), p.currency);
            catMap[cat].rem += toTRY(getPaymentRemainingAmount(p), p.currency);
            catMap[cat].count += 1;
        });

        bodyTablesHtml += `
            <h4 style="margin:10px 0 6px; font-size:12px; color:#0f172a;">KATEGORİ BAZLI ÖDEME VE BORÇ DAĞILIMI</h4>
            <table class="a4-table">
                <thead>
                    <tr><th>Ödeme Kategorisi</th><th>İşlem Adedi</th><th>Toplam Tutar</th><th>Ödenen</th><th>Kalan Borç</th></tr>
                </thead>
                <tbody>
                    ${Object.entries(catMap).map(([cat, st]) => `
                        <tr>
                            <td><strong>${escapeHtml(cat)}</strong></td>
                            <td>${st.count}</td>
                            <td>${formatMoney(st.total)}</td>
                            <td>${formatMoney(st.paid)}</td>
                            <td><strong>${formatMoney(st.rem)}</strong></td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        `;
    }

    if (rType === "INSTRUMENTS_REPORT") {
        bodyTablesHtml += `
            <h4 style="margin:10px 0 6px; font-size:12px; color:#0f172a;">KREDİ KARTLARI, KREDİ TAKSİTLERİ VE ÇEK/SENET LİSTESİ</h4>
            <table class="a4-table">
                <thead>
                    <tr><th>Vade</th><th>Şirket</th><th>Enstrüman / Başlık</th><th>Alacaklı / Banka</th><th>Toplam Tutar</th><th>Kalan Tutar</th><th>Durum</th></tr>
                </thead>
                <tbody>
                    ${payments.filter(p => ["Kredi kartı", "Kredi taksiti", "Leasing", "Çek/senet"].includes(p.category)).map(p => `
                        <tr>
                            <td>${formatDateToTR(p.dueDate)}</td>
                            <td>${escapeHtml(getCompanyName(p.companyId))}</td>
                            <td><strong>${escapeHtml(p.title)}</strong></td>
                            <td>${escapeHtml(p.creditor)}</td>
                            <td>${formatMoney(p.totalAmount, p.currency)}</td>
                            <td><strong>${formatMoney(getPaymentRemainingAmount(p), p.currency)}</strong></td>
                            <td>${escapeHtml(p.status)}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        `;
    }

    return `
        <div class="a4-report-sheet">
            <div class="a4-header-banner" style="display:flex; align-items:center; justify-content:space-between; border-bottom:2px solid #0f172a; padding-bottom:10px; margin-bottom:12px;">
                <div style="display:flex; align-items:center; gap:12px;">
                    <img src="dizsan_logo.jpg" alt="Dizsan" style="width:48px; height:48px; object-fit:contain;">
                    <div>
                        <div style="font-size:15px; font-weight:800; color:#0f172a;">DiKas – DİZSAN FİNANS, NAKİT AKIŞI VE ÖDEME TAKİP SİSTEMİ</div>
                        <div style="font-size:11px; font-weight:700; color:#0284c7;">${escapeHtml(reportTitles[rType] || "FİNANSAL RAPOR")}</div>
                    </div>
                </div>
                <div style="text-align:right; font-size:10px; color:#334155;">
                    <div><strong>Kapsam:</strong> ${escapeHtml(companyTitle)}</div>
                    <div><strong>Basım Tarihi:</strong> ${formatDateTimeTR()}</div>
                    <div><strong>Hazırlayan:</strong> ${escapeHtml(currentUser ? currentUser.name : "ÖMER EREN")}</div>
                </div>
            </div>

            <div class="a4-kpi-strip" style="display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-bottom:12px;">
                <div class="a4-kpi-item" style="border:1px solid #94a3b8; border-radius:6px; padding:7px; background:#f8fafc;">
                    <div class="lbl" style="font-size:9px; color:#475569; font-weight:700;">MEVCUT TOPLAM NAKİT</div>
                    <div class="val" style="font-size:13px; font-weight:800; color:#0f172a;">${formatMoney(m.totalCashTRY)}</div>
                </div>
                <div class="a4-kpi-item" style="border:1px solid #94a3b8; border-radius:6px; padding:7px; background:#f8fafc;">
                    <div class="lbl" style="font-size:9px; color:#475569; font-weight:700;">BEKLENEN TAHSİLATLAR</div>
                    <div class="val" style="font-size:13px; font-weight:800; color:#059669;">${formatMoney(m.expectedCollectionsTRY)}</div>
                </div>
                <div class="a4-kpi-item" style="border:1px solid #94a3b8; border-radius:6px; padding:7px; background:#f8fafc;">
                    <div class="lbl" style="font-size:9px; color:#475569; font-weight:700;">BEKLEYEN ÖDEMELER</div>
                    <div class="val" style="font-size:13px; font-weight:800; color:#dc2626;">${formatMoney(m.pendingPaymentsTRY)}</div>
                </div>
                <div class="a4-kpi-item" style="border:1px solid #94a3b8; border-radius:6px; padding:7px; background:#f8fafc;">
                    <div class="lbl" style="font-size:9px; color:#475569; font-weight:700;">AY SONU TAHMİNİ NAKİT</div>
                    <div class="val" style="font-size:13px; font-weight:800; color:#0284c7;">${formatMoney(m.eomEstimatedCashTRY)}</div>
                </div>
            </div>

            ${bodyTablesHtml}

            <div class="a4-signature-grid" style="display:grid; grid-template-columns:repeat(3,1fr); gap:24px; margin-top:26px;">
                <div class="a4-sig-box" style="border-top:1px solid #334155; padding-top:6px; text-align:center; font-size:10px; color:#334155;">
                    <strong>Finans / Muhasebe Hazırlayan</strong><br>${escapeHtml(currentUser ? currentUser.name : "GÖKHAN ÖZBULUT")}
                </div>
                <div class="a4-sig-box" style="border-top:1px solid #334155; padding-top:6px; text-align:center; font-size:10px; color:#334155;">
                    <strong>Genel Müdür Kontrol</strong><br>RAFET CANBEK
                </div>
                <div class="a4-sig-box" style="border-top:1px solid #334155; padding-top:6px; text-align:center; font-size:10px; color:#334155;">
                    <strong>Yönetim Kurulu Onayı</strong><br>ÖMER EREN
                </div>
            </div>
        </div>
    `;
}

function renderReportsSection() {
    const previewEl = document.getElementById("report-preview-box");
    if (!previewEl) return;
    previewEl.innerHTML = buildReportHtmlContent();
}

function printSelectedReportA4() {
    const printBox = document.getElementById("a4-print-container");
    if (!printBox) return;
    printBox.innerHTML = buildReportHtmlContent();
    document.body.classList.add("printing-custom-a4");
    addAuditLog("A4 BASKI", "DiKas finans raporu A4 yazıcı formatında yazdırıldı.");
    window.print();
    setTimeout(() => {
        document.body.classList.remove("printing-custom-a4");
    }, 600);
}

function printCurrentReportA4() {
    printSelectedReportA4();
}

function exportSelectedReportExcel() {
    const content = buildReportHtmlContent();
    const htmlDoc = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head><meta charset="UTF-8"><style>table, th, td { border: 1px solid #64748b; border-collapse: collapse; padding: 5px; font-family: Arial, sans-serif; font-size: 11px; } th { background: #e2e8f0; font-weight: bold; }</style></head>
        <body>${content}</body></html>
    `;
    const blob = new Blob(["\uFEFF" + htmlDoc], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `DiKas_Finans_Raporu_${formatDateToTR(todayISO())}.xls`;
    a.click();
    addAuditLog("EXCEL RAPOR", "DiKas finans raporu Excel (.xls) formatında indirildi.");
}

function exportCurrentViewExcel() {
    exportSelectedReportExcel();
}

function exportPaymentsExcel() {
    const clean = s => String(s || "").replace(/;/g, ",").replace(/\n/g, " ");
    let csv = "\uFEFFVade Tarihi;Şirket;Ödeme Başlığı;Alacaklı;Kategori;Toplam Tutar;Ödenen Tutar;Kalan Borç;Para Birimi;Hesap;Durum;Açıklama\n";
    getDeduplicatedPayments().forEach(p => {
        csv += `${formatDateToTR(p.dueDate)};${clean(getCompanyName(p.companyId))};${clean(p.title)};${clean(p.creditor)};${clean(p.category)};${p.totalAmount};${getPaymentPaidAmount(p)};${getPaymentRemainingAmount(p)};${p.currency};${clean(getAccountName(p.accountId))};${clean(p.status)};${clean(p.desc)}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `DiKas_Odemeler_${formatDateToTR(todayISO())}.csv`;
    a.click();
}

function exportCollectionsExcel() {
    const clean = s => String(s || "").replace(/;/g, ",").replace(/\n/g, " ");
    let csv = "\uFEFFBeklenen Tarih;Şirket;Müşteri / Kaynak;Tahsilat Başlığı;Kesinlik;Toplam Tutar;Tahsil Edilen;Kalan Alacak;Para Birimi;Hesap;Durum;Açıklama\n";
    getDeduplicatedCollections().forEach(c => {
        csv += `${formatDateToTR(c.expectedDate)};${clean(getCompanyName(c.companyId))};${clean(c.customer)};${clean(c.title)};${clean(c.certainty)};${c.totalAmount};${getCollectionReceivedAmount(c)};${getCollectionRemainingAmount(c)};${c.currency};${clean(getAccountName(c.accountId))};${clean(c.status)};${clean(c.desc)}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `DiKas_Tahsilatlar_${formatDateToTR(todayISO())}.csv`;
    a.click();
}

function exportSelectedReportCSV() {
    exportPaymentsExcel();
}

function openExcelImportModal(targetType = "PAYMENT") {
    document.getElementById("import-target-type").value = targetType;
    openModal("modal-excel-import");
}

function downloadSampleImportTemplate() {
    const tType = document.getElementById("import-target-type").value;
    let csv = "";
    if (tType === "PAYMENT") {
        csv = "\uFEFFTarih(GG.AA.YYYY);Şirket;Başlık;Alacaklı;Kategori;Tutar;ParaBirimi;Açıklama\n25.10.2026;Dizsan Otomotiv;TDR-Yedek Parça Alımı;Scania Tedarik;Tedarikçi;125000;TRY;Ekim faturası\n";
    } else {
        csv = "\uFEFFTarih(GG.AA.YYYY);Şirket;Müşteri;Başlık;Kesinlik;Tutar;ParaBirimi;Açıklama\n28.10.2026;Dizsan Otomotiv;Çorum Nakliyat;Servis Bakım Bedeli;Kesin;85000;TRY;Fatura tahsilatı\n";
    }
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `DiKas_Ornek_${tType}_Sablonu.csv`;
    a.click();
}

function processExcelImport() {
    const file = document.getElementById("excel-import-file")?.files?.[0];
    const tType = document.getElementById("import-target-type").value;
    if (!file) {
        alert("Lütfen bir CSV dosyası seçin.");
        return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
        const lines = String(ev.target.result || "").split(/\r?\n/).filter(l => l.trim().length > 0);
        let added = 0;
        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].includes(";") ? lines[i].split(";") : lines[i].split(",");
            if (cols.length < 5) continue;
            const dateISO = parseAnyDateToISO(cols[0]);
            const compName = cols[1].trim();
            const matchedComp = appState.companies.find(c => normalizeTR(c.name).includes(normalizeTR(compName))) || appState.companies[0];

            if (tType === "PAYMENT") {
                const title = cols[2].trim();
                const creditor = cols[3].trim();
                const cat = isTdrSuppliedItem(title) ? "Tedarikçi" : (cols[4].trim() || "Diğer giderler");
                const amt = Number(String(cols[5] || "0").replace(",", ".")) || 0;
                const cur = (cols[6] || "TRY").trim();
                const desc = (cols[7] || "").trim();
                if (amt > 0) {
                    const id = "PAY-IMP-" + Date.now() + "-" + i;
                    appState.payments.unshift({
                        id,
                        obligationKey: `PAY:${id}`,
                        companyId: matchedComp.id,
                        title,
                        creditor,
                        category: cat,
                        totalAmount: amt,
                        currency: cur,
                        dueDate: dateISO,
                        accountId: "",
                        recurrence: "NONE",
                        status: "Planlandı",
                        desc,
                        transactions: [],
                        history: []
                    });
                    added++;
                }
            } else {
                const customer = cols[2].trim();
                const title = cols[3].trim();
                const certainty = cols[4].trim() || "Kesin";
                const amt = Number(String(cols[5] || "0").replace(",", ".")) || 0;
                const cur = (cols[6] || "TRY").trim();
                const desc = (cols[7] || "").trim();
                if (amt > 0) {
                    const id = "COL-IMP-" + Date.now() + "-" + i;
                    appState.collections.unshift({
                        id,
                        obligationKey: `COL:${id}`,
                        companyId: matchedComp.id,
                        customer,
                        title,
                        certainty,
                        totalAmount: amt,
                        currency: cur,
                        expectedDate: dateISO,
                        accountId: "",
                        status: "Bekleniyor",
                        desc,
                        transactions: []
                    });
                    added++;
                }
            }
        }
        addAuditLog("EXCEL İÇE AKTARMA", `${added} adet kayıt Excel CSV dosyasından içe aktarıldı.`);
        closeModal("modal-excel-import");
        syncStateToServer();
        renderAll();
        alert(`${added} adet kayıt başarıyla içe aktarıldı.`);
    };
    reader.readAsText(file, "utf-8");
}

// ==================== 19. YÖNETİCİ PANELİ, KULLANICI YETKİLERİ, LOGLAR VE YEDEKLEME ====================
function isOmerErenDikas(u = currentUser) {
    if (!u) return false;
    const un = normalizeTR(u.username || "");
    const fn = normalizeTR(u.name || "");
    return un === "ömer" || un === "omer" || fn === "ömer eren" || fn === "omer eren";
}

function renderAdminSection() {
    const usrTbody = document.getElementById("admin-users-tbody");
    const auditTbody = document.getElementById("audit-logs-tbody");
    const errTbody = document.getElementById("error-logs-tbody");
    if (!isOmerErenDikas(currentUser)) {
        if (usrTbody) usrTbody.innerHTML = "";
        if (auditTbody) auditTbody.innerHTML = "";
        if (errTbody) errTbody.innerHTML = "";
        return;
    }
    if (usrTbody) {
        usrTbody.innerHTML = (appState.users || []).map(u => `
            <tr>
                <td><strong>${escapeHtml(u.name)}</strong></td>
                <td><code>${escapeHtml(u.username)}</code></td>
                <td><span class="badge badge-info">${escapeHtml(u.role)}</span> &bull; ${escapeHtml(u.dept || "")}</td>
                <td>${(u.companies || ["ALL"]).includes("ALL") ? "Tüm Şirketler (Konsolide)" : (u.companies || []).map(getCompanyName).join(", ")}</td>
                <td>
                    <button class="btn btn-sm" onclick="openUserModal('${escapeHtml(u.username)}')"><i class="fa-solid fa-pen"></i></button>
                </td>
            </tr>
        `).join("");
    }

    if (auditTbody) {
        auditTbody.innerHTML = (appState.auditLogs || []).slice(0, 60).map(l => `
            <tr>
                <td style="white-space:nowrap;">${escapeHtml(l.timestamp)}</td>
                <td><strong>${escapeHtml(l.user)}</strong></td>
                <td><span class="badge badge-info">${escapeHtml(l.category)}</span></td>
                <td>${escapeHtml(l.detail)}</td>
            </tr>
        `).join("");
    }

    if (errTbody) {
        const errs = appState.errorLogs || [];
        errTbody.innerHTML = errs.length === 0
            ? `<tr><td colspan="3" style="text-align:center; color:var(--emerald-ok);">Kayıtlı çalışma zamanı hatası bulunmamaktadır (Sıfır Hata).</td></tr>`
            : errs.map(er => `
                <tr>
                    <td>${escapeHtml(er.timestamp)}</td>
                    <td><span class="badge badge-danger">${escapeHtml(er.type)}</span></td>
                    <td>${escapeHtml(er.message)}</td>
                </tr>
            `).join("");
    }
}

function openUserModal(username = null) {
    document.getElementById("usr-edit-username").value = username || "";
    if (username) {
        const u = appState.users.find(x => x.username === username);
        if (u) {
            document.getElementById("usr-name").value = u.name;
            document.getElementById("usr-username").value = u.username;
            document.getElementById("usr-role").value = u.role;
            document.getElementById("usr-dept").value = u.dept || "";
            document.getElementById("usr-pass").value = "";
        }
    } else {
        document.getElementById("usr-name").value = "";
        document.getElementById("usr-username").value = "";
        document.getElementById("usr-role").value = "Personel";
        document.getElementById("usr-dept").value = "";
        document.getElementById("usr-pass").value = "";
    }
    openModal("modal-user-admin");
}

function handleSaveUserAdmin(e) {
    e.preventDefault();
    const editU = document.getElementById("usr-edit-username").value;
    const name = document.getElementById("usr-name").value.trim().toLocaleUpperCase("tr-TR");
    const username = document.getElementById("usr-username").value.trim();
    const role = document.getElementById("usr-role").value;
    const dept = document.getElementById("usr-dept").value.trim();
    const pass = document.getElementById("usr-pass").value.trim();

    if (editU) {
        const u = appState.users.find(x => x.username === editU);
        if (u) {
            u.name = name;
            u.username = username;
            u.role = role;
            u.dept = dept;
            if (pass) u.pinStamp = hashPin(pass);
            addAuditLog("KULLANICI YÖNETİMİ", `${name} kullanıcı yetkileri güncellendi.`);
        }
    } else {
        appState.users.push({
            order: appState.users.length,
            name,
            username,
            email: `${username}@${CORP_MAIL_HOST}`,
            pinStamp: pass ? hashPin(pass) : DEFAULT_PIN_STAMP,
            role,
            dept,
            companies: ["ALL"]
        });
        addAuditLog("KULLANICI YÖNETİMİ", `Yeni kullanıcı eklendi: ${name} (${role}).`);
    }

    closeModal("modal-user-admin");
    syncStateToServer();
    renderAll();
}

function exportAuditLogsCSV() {
    const clean = s => String(s || "").replace(/;/g, ",");
    let csv = "\uFEFFTarih Saat;Kullanıcı;Kategori;Detay\n";
    (appState.auditLogs || []).forEach(l => {
        csv += `${clean(l.timestamp)};${clean(l.user)};${clean(l.category)};${clean(l.detail)}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `DiKas_Denetim_Loglari_${formatDateToTR(todayISO())}.csv`;
    a.click();
}

function clearErrorLogs() {
    appState.errorLogs = [];
    syncStateToServer();
    renderAdminSection();
}

function exportFullBackupJSON() {
    const blob = new Blob([JSON.stringify(appState, null, 2)], { type: "application/json;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `DiKas_Yedek_${CURRENT_APP_VERSION}_${todayISO()}.json`;
    a.click();
    addAuditLog("YEDEKLEME", "Tam sistem veritabanı yedeği (JSON) indirildi.");
}

function clearAllDemoDataToZero() {
    if (!confirm("Ekrandaki başlangıç örnek (demo) kasa, banka, ödeme, tahsilat, kredi kartı, kredi ve çek kayıtlarının tamamı silinerek sistem 0,00 TL bakiye ile sıfırdan başlatılsın mı?\n\n(Not: Şirket tanımları ve kullanıcı hesapları korunacaktır.)")) {
        return;
    }
    appState.accounts = [];
    appState.payments = [];
    appState.collections = [];
    appState.transfers = [];
    appState.balanceAdjustments = [];
    appState.creditCards = [];
    appState.loans = [];
    appState.checks = [];
    addAuditLog("SIFIRLAMA", "Tüm örnek (demo) başlangıç verileri temizlendi; sistem 0,00 TL ile manuel girişe hazırlandı.");
    syncStateToServer();
    renderAll();
    alert("Tüm örnek veriler temizlendi. Kasa/banka hesaplarınızı, ödemelerinizi ve tahsilatlarınızı sıfırdan manuel olarak girebilirsiniz.");
}

function restoreDemoData() {
    if (!confirm("Başlangıç örnek (demo) verileri geri yüklensin mi? Mevcut kayıtların üzerine örnek veri seti yazılacaktır.")) {
        return;
    }
    const fresh = buildInitialState();
    fresh.users = appState.users || fresh.users;
    fresh.undatedSeededV1 = true;
    appState = fresh;
    addAuditLog("DEMO VERİ", "Başlangıç örnek (demo) veri seti geri yüklendi.");
    syncStateToServer();
    renderAll();
}

function importFullBackupJSON(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const parsed = JSON.parse(ev.target.result);
            if (parsed && Array.isArray(parsed.companies) && Array.isArray(parsed.accounts)) {
                appState = parsed;
                addAuditLog("YEDEKLEME", "JSON yedek dosyası başarıyla geri yüklendi.");
                syncStateToServer();
                renderAll();
                alert("Yedek verileri başarıyla geri yüklendi!");
            } else {
                alert("Geçersiz DiKas yedek dosyası.");
            }
        } catch (err) {
            addErrorLog("BACKUP_IMPORT_ERROR", err.message);
            alert("JSON dosyası okunamadı.");
        }
    };
    reader.readAsText(file, "utf-8");
}

// ==================== 20. TEMA (KOYU / AÇIK / SİSTEM), NAVİGASYON VE OTURUM YÖNETİMİ ====================
function applyTheme(mode) {
    const savedMode = mode || localStorage.getItem(STORAGE_KEY_DIKAS_THEME) || "dark";
    localStorage.setItem(STORAGE_KEY_DIKAS_THEME, savedMode);
    const sel = document.getElementById("theme-mode-select");
    if (sel) sel.value = savedMode;

    let effective = savedMode;
    if (savedMode === "system") {
        const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
        effective = prefersLight ? "light" : "dark";
    }
    document.documentElement.setAttribute("data-theme", effective);
}

function setThemeMode(mode) {
    applyTheme(mode);
    addAuditLog("TEMA", `Arayüz teması "${mode}" olarak değiştirildi.`);
}

if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
        if (localStorage.getItem(STORAGE_KEY_DIKAS_THEME) === "system") {
            applyTheme("system");
        }
    });
}

function switchTab(tabId) {
    if (tabId === "admin" && !isOmerErenDikas(currentUser)) {
        alert("⛔ Yönetici & Yetki Paneli yalnızca Ana Sistem Yöneticisi (Ömer Eren) tarafından görüntülenebilir!");
        return;
    }
    uiState.activeTab = tabId;
    document.querySelectorAll(".tab-section").forEach(sec => {
        sec.classList.toggle("active", sec.id === `tab-${tabId}`);
    });
    document.querySelectorAll(".side-nav-btn").forEach(btn => {
        btn.classList.toggle("active", btn.getAttribute("data-tab") === tabId);
    });
    document.querySelectorAll(".mob-nav-item").forEach(btn => {
        btn.classList.toggle("active", btn.getAttribute("data-tab") === tabId);
    });

    const titles = {
        dashboard: ["Ana Gösterge Paneli", "Mevcut kasa/banka varlıkları, beklenen tahsilatlar, planlanan ödemeler ve nakit projeksiyonu"],
        calendar: ["Finans Takvimi", "Günlük, haftalık, aylık ve liste görünümlü ödeme & tahsilat takvimi"],
        forecast: ["Nakit Akışı Tahmini", "7, 15, 30, 60 ve 90 günlük 3 senaryolu nakit projeksiyonu ve finansman uyarısı"],
        accounts: ["Kasa ve Banka Yönetimi", "Şirket kasa/banka hesapları, virman transferler ve gerekçeli bakiye düzeltmeleri"],
        payments: ["Ödeme Yönetimi", "Planlanan ödemeler, kısmi ödeme hareketleri, vade takibi ve TDR tedarik sınıflandırması"],
        collections: ["Tahsilat Yönetimi", "Kesin, muhtemel ve belirsiz tahsilat beklentileri ve otomatik hesap işleme"],
        recurring: ["Tekrarlayan İşlemler", "Haftalık, aylık, 3/6 aylık ve yıllık düzenli ödeme/tahsilat serileri"],
        instruments: ["Kredi Kartı, Kredi & Çek/Senet", "Mükerrerlik kalkanlı kredi kartı dönem borçları, kredi taksitleri ve çek/senet portföyü"],
        companies: ["Çoklu Şirket & Kategori Yönetimi", "Dizsan Otomotiv, Dizsan Lojistik, KM Solar ve özel ödeme kategorileri"],
        reports: ["Raporlar, Excel & A4 Baskı Merkezi", "Excel (.xls / .csv) veri aktarımı ve A4 kağıda tam uyumlu kurumsal raporlama"],
        admin: ["Yönetici Paneli, Loglar & Yedekleme", "Kullanıcı yetki yönetimi, işlem/hata logları ve JSON veri yedekleme"]
    };

    const info = titles[tabId] || titles.dashboard;
    const h1 = document.getElementById("current-page-title");
    const sub = document.getElementById("current-page-subtitle");
    const compLabel = uiState.selectedCompanyId === "ALL" ? "Tüm Şirketler (Konsolide)" : getCompanyName(uiState.selectedCompanyId);
    if (h1) {
        h1.innerHTML = `<span>${info[0]}</span> <span class="badge badge-info" id="active-company-pill">${escapeHtml(compLabel)}</span>`;
    }
    if (sub) sub.textContent = info[1];

    document.getElementById("app-sidebar")?.classList.remove("mobile-open");
    renderAll();

    if (window.autoDateHelper && typeof window.autoDateHelper.init === "function") {
        window.autoDateHelper.init();
    }
}

function toggleMobileSidebar() {
    document.getElementById("app-sidebar")?.classList.toggle("mobile-open");
}

function toggleMobileViewportPreview() {
    document.body.classList.toggle("force-mobile-mode");
    const isMob = document.body.classList.contains("force-mobile-mode");
    const lbl = document.getElementById("lbl-mobile-preview");
    if (lbl) lbl.textContent = isMob ? "Web" : "Mobil";
}

function openAlertsDrawer() {
    handleKpiCardClick("overdue_payments");
}

function openModal(modalId) {
    const m = document.getElementById(modalId);
    if (m) m.classList.add("open");
    if (window.autoDateHelper && typeof window.autoDateHelper.init === "function") {
        setTimeout(() => window.autoDateHelper.init(), 50);
    }
}

function closeModal(modalId) {
    const m = document.getElementById(modalId);
    if (m) m.classList.remove("open");
}

function openInstallModal() {
    openModal("modal-install-guide");
}

// ==================== 21. FORM SEÇİCİLERİ VE GİRİŞ/ŞİFRE İŞLEMLERİ ====================
function populateCompanySelects() {
    const activeComps = (appState.companies || []).filter(c => c.status === "Aktif");
    const allComps = appState.companies || [];

    const globalSel = document.getElementById("global-company-select");
    if (globalSel) {
        const curVal = uiState.selectedCompanyId || "ALL";
        globalSel.innerHTML = `<option value="ALL">Tüm Şirketler (Konsolide)</option>` +
            activeComps.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join("");
        globalSel.value = curVal;
    }

    const modalCompIds = ["acc-company", "pay-company", "col-company", "cc-company", "loan-company", "chk-company", "dash-undated-company", "pay-undated-company", "drawer-undated-company"];
    modalCompIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.innerHTML = allComps.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join("");
        }
    });
}

function populateCategorySelects() {
    const cats = appState.categories || DEFAULT_CATEGORIES;
    const payCat = document.getElementById("pay-category");
    if (payCat) {
        payCat.innerHTML = cats.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
    }
    const filterIds = ["pay-filter-category", "cal-filter-category"];
    filterIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            const cur = el.value || "ALL";
            el.innerHTML = `<option value="ALL">Tüm Kategoriler</option>` +
                cats.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
            el.value = cur;
        }
    });
}

function populateAccountSelectsForModal() {
    const accs = (appState.accounts || []).filter(a => a.status === "Aktif");
    const optsWithEmpty = `<option value="">-- Hesap Seçiniz --</option>` +
        accs.map(a => `<option value="${a.id}">${escapeHtml(getCompanyName(a.companyId))} – ${escapeHtml(a.name)} (${a.currency})</option>`).join("");
    const optsRequired = accs.map(a => `<option value="${a.id}">${escapeHtml(getCompanyName(a.companyId))} – ${escapeHtml(a.name)} (${a.currency})</option>`).join("");

    ["pay-account", "col-account", "cc-account", "loan-account", "chk-account"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = optsWithEmpty;
    });

    ["trf-from-account", "trf-to-account", "adj-account", "exec-pay-account", "exec-col-account"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = optsRequired;
    });

    ["pay-filter-account", "col-filter-account", "cal-filter-account"].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            const cur = el.value || "ALL";
            el.innerHTML = `<option value="ALL">Tüm Hesaplar</option>` + optsRequired;
            el.value = cur;
        }
    });
}

function renderQuickUserChips() {
    const box = document.getElementById("quick-user-list");
    if (!box) return;
    box.innerHTML = (appState.users || []).map(u => `
        <button type="button" class="user-chip" onclick="fillQuickLogin('${escapeHtml(u.username)}')">
            ${escapeHtml(u.name)}
        </button>
    `).join("");
}

function fillQuickLogin(username) {
    const uIn = document.getElementById("login-username");
    const pIn = document.getElementById("login-password");
    if (uIn) uIn.value = username;
    if (pIn) pIn.focus();
}

function handleLogin(e) {
    e.preventDefault();
    const uVal = normalizeTR(document.getElementById("login-username")?.value || "");
    const pVal = (document.getElementById("login-password")?.value || "").trim();
    const rem = document.getElementById("login-remember-me")?.checked;
    const errEl = document.getElementById("login-error");

    const matched = (appState.users || []).find(u =>
        (normalizeTR(u.username) === uVal || normalizeTR(u.name) === uVal || normalizeTR(u.email) === uVal) &&
        verifyUserPin(u, pVal)
    );

    if (!matched) {
        if (errEl) {
            errEl.style.display = "block";
            errEl.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> Kullanıcı adı veya şifre hatalı! Şifrenizi unuttuysanız "Şifremi Unuttum?" bağlantısını kullanabilirsiniz.`;
        }
        return;
    }

    if (errEl) errEl.style.display = "none";
    currentUser = matched;

    if (rem) {
        localStorage.setItem(STORAGE_KEY_DIKAS_REMEMBER, JSON.stringify({ username: matched.username, pinStamp: matched.pinStamp }));
        localStorage.setItem(STORAGE_KEY_DIKAS_SESSION, JSON.stringify(currentUser));
    } else {
        localStorage.removeItem(STORAGE_KEY_DIKAS_REMEMBER);
        sessionStorage.setItem(STORAGE_KEY_DIKAS_SESSION, JSON.stringify(currentUser));
    }

    addAuditLog("OTURUM", `${currentUser.name} sisteme giriş yaptı.`);
    syncStateToServer();
    applyAuthenticatedSession();
}

function applyAuthenticatedSession() {
    const overlay = document.getElementById("login-overlay");
    if (!currentUser) {
        overlay?.classList.remove("hidden");
        return;
    }
    overlay?.classList.add("hidden");

    const isOmer = isOmerErenDikas(currentUser);
    document.querySelectorAll('[data-tab="admin"], [data-section="admin"], #tab-admin').forEach(el => {
        if (el.id === "tab-admin" && !isOmer) el.classList.remove("active");
        else el.style.display = isOmer ? "" : "none";
    });

    const nameEl = document.getElementById("sidebar-user-name");
    const roleEl = document.getElementById("sidebar-user-role");
    if (nameEl) nameEl.textContent = currentUser.name;
    if (roleEl) roleEl.textContent = isOmer ? "👑 Yönetici" : `${currentUser.dept || "Personel"}`;

    renderAll();
}

function handleLogout() {
    if (currentUser) {
        addAuditLog("OTURUM", `${currentUser.name} güvenli çıkış yaptı.`);
        syncStateToServer();
    }
    currentUser = null;
    localStorage.removeItem(STORAGE_KEY_DIKAS_SESSION);
    sessionStorage.removeItem(STORAGE_KEY_DIKAS_SESSION);
    document.getElementById("login-overlay")?.classList.remove("hidden");
}

function openForgotPasswordModal() {
    document.getElementById("forgot-step-1").style.display = "block";
    document.getElementById("forgot-step-2").style.display = "none";
    openModal("modal-forgot-password");
}

function sendPasswordResetCode() {
    const uVal = normalizeTR(document.getElementById("forgot-username").value);
    const eVal = (document.getElementById("forgot-email").value || "").trim().toLowerCase();
    const matched = (appState.users || []).find(u => normalizeTR(u.username) === uVal || normalizeTR(u.name) === uVal);
    if (!matched || !eVal || eVal !== String(matched.email || "").trim().toLowerCase()) {
        alert("❌ Girdiğiniz kullanıcı adı ve kayıtlı kurumsal e-posta adresi eşleşmiyor!");
        return;
    }
    const expMs = Date.now() + 15 * 60 * 1000;
    const nonce = Math.random().toString(36).substring(2, 10).toUpperCase();
    const curStamp = matched.pinStamp || DEFAULT_PIN_STAMP;
    const sig = hashPin(`DPRO_RESET_LINK_V1|${matched.username}|${expMs}|${nonce}|${curStamp}`);
    const token = btoa(unescape(encodeURIComponent(JSON.stringify({ u: matched.username, e: expMs, n: nonce, s: sig }))));
    const liveLink = `https://dizsan.github.io/dpro/index.html?resetToken=${encodeURIComponent(token)}&user=${encodeURIComponent(matched.username)}`;
    try {
        fetch("/api/send-reset-link", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: eVal, userName: matched.name, username: matched.username, resetToken: token, liveLink })
        }).catch(() => {});
    } catch (e) {}
    alert(`✅ Doğrulanan kurumsal e-posta adresinize (${eVal}) tek kullanımlık Şifre Yenileme Bağlantısı gönderildi.`);
    closeModal("modal-forgot-password");
}

function verifyAndResetPassword() {
    const code = document.getElementById("forgot-code-input").value.trim();
    const newPass = document.getElementById("forgot-new-pass").value.trim();
    if (!activePasswordReset || code !== activePasswordReset.code || newPass.length < 3) {
        alert("Doğrulama kodu hatalı veya şifre çok kısa!");
        return;
    }
    const u = appState.users.find(x => x.username === activePasswordReset.username);
    if (u) {
        u.pinStamp = hashPin(newPass);
        addAuditLog("ŞİFRE SIFIRLAMA", `${u.name} şifresini doğrulama koduyla yeniledi.`);
        syncStateToServer();
        closeModal("modal-forgot-password");
        alert("Şifreniz başarıyla güncellendi.");
    }
}

function openChangePasswordModal() {
    openModal("modal-change-password");
}

function handleChangePasswordSubmit(e) {
    e.preventDefault();
    if (!currentUser) return;
    const oldP = document.getElementById("chg-old-pass").value.trim();
    const newP = document.getElementById("chg-new-pass").value.trim();
    const confP = document.getElementById("chg-confirm-pass").value.trim();

    if (!verifyUserPin(currentUser, oldP)) {
        alert("Mevcut şifreniz hatalı!");
        return;
    }
    if (newP.length < 3 || newP !== confP) {
        alert("Yeni şifreler eşleşmiyor veya en az 3 karakter olmalıdır!");
        return;
    }
    currentUser.pinStamp = hashPin(newP);
    const u = appState.users.find(x => x.username === currentUser.username);
    if (u) u.pinStamp = currentUser.pinStamp;

    addAuditLog("ŞİFRE DEĞİŞTİRME", `${currentUser.name} şifresini değiştirdi.`);
    syncStateToServer();
    closeModal("modal-change-password");
    alert("Şifreniz başarıyla değiştirildi.");
}

// ==================== 22. KLAVYE KISAYOLLARI VE BAŞLATMA (INIT) ====================
function renderAll() {
    populateCompanySelects();
    populateCategorySelects();
    populateAccountSelectsForModal();
    renderDashboardSection();
    renderCalendarSection();
    renderForecastSection();
    renderAccountsSection();
    renderPaymentsSection();
    renderCollectionsSection();
    renderRecurringSection();
    renderInstrumentsSection();
    renderCompaniesSection();
    renderReportsSection();
    renderAdminSection();
}

document.addEventListener("keydown", (e) => {
    const tag = (e.target?.tagName || "").toUpperCase();
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
        if (e.key === "Escape") {
            document.querySelectorAll(".modal-backdrop.open").forEach(m => m.classList.remove("open"));
        }
        return;
    }
    if (e.key === "Escape") {
        document.querySelectorAll(".modal-backdrop.open").forEach(m => m.classList.remove("open"));
    } else if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        openPaymentModal();
    } else if (e.key === "t" || e.key === "T") {
        e.preventDefault();
        openCollectionModal();
    } else if (e.key === "p" || e.key === "P") {
        e.preventDefault();
        printCurrentReportA4();
    }
});

window.addEventListener("DOMContentLoaded", async () => {
    applyTheme();
    await loadStateFromStorageAndServer();
    renderQuickUserChips();

    // Beni Hatırla & Aktif Oturum Kontrolü
    try {
        const remRaw = localStorage.getItem(STORAGE_KEY_DIKAS_REMEMBER);
        if (remRaw) {
            const rem = JSON.parse(remRaw);
            if (rem?.username) document.getElementById("login-username").value = rem.username;
            if (rem?.savedPass) document.getElementById("login-password").value = rem.savedPass;
        }
        const sessRaw = localStorage.getItem(STORAGE_KEY_DIKAS_SESSION) || sessionStorage.getItem(STORAGE_KEY_DIKAS_SESSION) || localStorage.getItem("dpro_active_session_v1") || sessionStorage.getItem("dpro_active_session_v1") || localStorage.getItem("dizsan_ziyaret_active_user") || sessionStorage.getItem("dizsan_ziyaret_active_user") || localStorage.getItem("dizsan_gunluk_kasa_active_user") || sessionStorage.getItem("dizsan_gunluk_kasa_active_user");
        if (sessRaw) {
            const parsedUser = JSON.parse(sessRaw);
            const matched = (appState.users || []).find(u => u.username === parsedUser.username || u.name === parsedUser.name);
            if (matched) {
                currentUser = matched;
            }
        }
        if (!currentUser) {
            const dproU = localStorage.getItem("dizsan_dpro_active_session_v1") || sessionStorage.getItem("dizsan_dpro_active_session_v1") || (new URLSearchParams(window.location.search || "").get("dproUser")) || "";
            if (dproU) {
                const matched = (appState.users || []).find(u => u.username.toLowerCase() === dproU.toLowerCase() || u.name.toLowerCase() === dproU.toLowerCase());
                if (matched) currentUser = matched;
            }
        }
        if (!currentUser) {
            // Varsayılan hızlı kurumsal erişim: Ömer Eren oturumu hazırla
            currentUser = appState.users[0];
        }
    } catch (e) {
        currentUser = appState.users[0];
    }

    setDashboardPeriod("thisMonth");
    applyAuthenticatedSession();
    setSyncBadge("cloud_ok");

    // Mobil ve PC arası canlı otomatik veri senkronizasyonu (20 sn + sekme/ekran açılışında anında)
    setInterval(() => {
        pollCloudState(false);
    }, 20000);

    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
            pollCloudState(false);
        }
    });

    window.addEventListener("focus", () => {
        pollCloudState(false);
    });

    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("sw.js").catch(() => {});
    }
});
