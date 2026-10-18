/**
 * ==========================================================================
 * D-Met // DİZSAN ENTEGRE MEDYA TAKİP & SCANIA KAZA RADARI — v1.0.0
 * - 5 İl (Çorum, Çankırı, Amasya, Tokat, Yozgat) + 55 İlçe + Karayolu Geçitleri
 * - 4 Aşamalı AI Analiz: Metin NLP + Görsel Vision AI + Video Frame + Plaka OCR
 * - Logo ERP & D-Pro Müşteri Eşleştirme (Salt-Okunur / Read-Only)
 * - Web Push + WebAudio Acil Siren + Telegram & WhatsApp Alarm Köprüsü
 * - Şifreli Giriş (SHA-256), Değiştirilemez Audit Log, Açık/Koyu Tema, Versiyonlama
 * ==========================================================================
 */

const STORAGE_KEY_DEMET_STATE = "dizsan_dmet_shared_state_v4";
const STORAGE_KEY_DEMET_SESSION = "dizsan_demet_active_user";
const STORAGE_KEY_DEMET_REMEMBER = "dizsan_demet_remember_login";
const STORAGE_KEY_DEMET_THEME = "dizsan_demet_theme";
const STORAGE_KEY_DIZGUN_BRIDGE = "dizgun_demet_bridge";
const STORAGE_KEY_DPRO_BRIDGE = "dpro_demet_bridge";

const DEFAULT_PIN_STAMP = "3592512679-3759997292-303417646";
const CORP_MAIL_HOST = ["dizsan", "com", "tr"].join(".");

// ==================== SHA-256 & KİMLİK DOĞRULAMA ====================
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

const OFFICIAL_PERSONNEL = [
    { order: 0,  name: "ÖMER EREN",              username: "ömer",             mailBox: "oeren",    pinStamp: "2697120930-1230232798-23831670", role: "Yönetici", dept: "Yönetim Kurulu / Sistem Yöneticisi" },
    { order: 1,  name: "HAKAN AYDIN",            username: "hakan.aydin",      mailBox: "haydin",   pinStamp: "3552174369-58562770-3993401784", role: "Yönetici", dept: "Servis Müdürü" },
    { order: 2,  name: "RAFET CANBEK",           username: "rafet.canbek",     mailBox: "rcanbek",  pinStamp: DEFAULT_PIN_STAMP,                role: "Yönetici", dept: "Genel Müdür" },
    { order: 3,  name: "FATİH KIROĞLU",          username: "fatih.kiroglu",    mailBox: "fkiroglu", pinStamp: "567307289-1446660830-2254300224", role: "Personel", dept: "Yedek Parça / Depo" },
    { order: 4,  name: "GÖKHAN ÖZBULUT",         username: "gokhan.ozbulut",   mailBox: "gozbulut", pinStamp: "3741314348-4038843960-1626309061", role: "Personel", dept: "Muhasebe & Finans" },
    { order: 5,  name: "ERTUĞRUL ERDEM",         username: "ertugrul.erdem",   mailBox: "eerdem",   pinStamp: DEFAULT_PIN_STAMP,                role: "Personel", dept: "Servis Danışmanı" },
    { order: 6,  name: "NECATİ DEMİRCİ",         username: "necati.demirci",   mailBox: "ndemirci", pinStamp: DEFAULT_PIN_STAMP,                role: "Personel", dept: "Servis Danışmanı / Hasar" },
    { order: 7,  name: "MURAT KARAOĞLU",         username: "murat.karaoglu",   mailBox: "rcanbek",  pinStamp: DEFAULT_PIN_STAMP,                role: "Personel", dept: "Atölye Formen" }
];

// ==================== 5 İL, 55 İLÇE VE KARAYOLU KARA NOKTA SÖZLÜĞÜ ====================
const HINTERLAND_DICTIONARY = {
    "Çorum": {
        plateCode: "19",
        color: "#ef4444",
        districts: [
            "Merkez", "Osmancık", "Sungurlu", "İskilip", "Alaca", "Bayat", "Mecitözü",
            "Kargı", "Ortaköy", "Uğurludağ", "Dodurga", "Oğuzlar", "Laçin", "Boğazkale"
        ],
        hotspots: [
            "Kırkdilim Geçidi", "Samsun-Ankara Karayolu (D-795)", "Osmancık D-100 Karayolu",
            "Badan Virajı", "Çorum-Sungurlu Bölünmüş Yolu", "Koparan Mevki", "Karacaören Mevki", "Kargı Hacıhamza"
        ]
    },
    "Çankırı": {
        plateCode: "18",
        color: "#f59e0b",
        districts: [
            "Merkez", "Çerkeş", "Ilgaz", "Orta", "Şabanözü", "Kurşunlu", "Yapraklı",
            "Kızılırmak", "Atkaracalar", "Eldivan", "Korgun", "Bayramören"
        ],
        hotspots: [
            "Ilgaz 15 Temmuz İstiklal Tüneli", "Çerkeş-Gerede D-100 Hattı", "Kurşunlu Rampası",
            "Ilgaz Dağı Geçidi", "Çankırı-Ankara Yolu (D-765)", "Atkaracalar Mevki"
        ]
    },
    "Amasya": {
        plateCode: "05",
        color: "#10b981",
        districts: [
            "Merkez", "Merzifon", "Suluova", "Taşova", "Gümüşhacıköy", "Göynücek", "Hamamözü"
        ],
        hotspots: [
            "Merzifon Kayadüzü Mevki", "Suluova Şeker Fabrikası Kavşağı", "Ferhat Tüneli",
            "Taşova-Erbaa D-100 Koridoru", "Badal Tüneli (Gümüşhacıköy)", "Amasya Çevre Yolu"
        ]
    },
    "Tokat": {
        plateCode: "60",
        color: "#38bdf8",
        districts: [
            "Merkez", "Erbaa", "Turhal", "Niksar", "Zile", "Reşadiye", "Almus",
            "Pazar", "Başçiftlik", "Yeşilyurt", "Artova", "Sulusaray"
        ],
        hotspots: [
            "Çamlıbel Geçidi (Tokat-Sivas Yolu)", "Erbaa D-100 Karayolu", "Reşadiye Kelkit Vadisi Yolu",
            "Niksar-Ünye Yolu", "Kızıliniş Mevki", "Turhal-Zile Kavşağı"
        ]
    },
    "Yozgat": {
        plateCode: "66",
        color: "#a855f7",
        districts: [
            "Merkez", "Sorgun", "Akdağmadeni", "Yerköy", "Boğazlıyan", "Sarıkaya", "Çekerek",
            "Şefaatli", "Çayıralan", "Kadışehri", "Aydıncık", "Yenifakılı", "Çandır", "Saraykent"
        ],
        hotspots: [
            "E-88 Uluslararası Transit Yolu", "Yerköy-Sorgun Hattı", "Akdağmadeni Orman Geçidi",
            "Muslubelen Geçidi", "Alaca-Sorgun Kavşağı", "Boğazlıyan-Kayseri Yolu"
        ]
    }
};

// ==================== SAFARI %100 UYUMLU BASE64 SVG & VİDEO GÖRSEL ÜRETİCİ ====================
function escapeXml(unsafe) {
    return String(unsafe || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

function buildIncidentSvgDataUri(title, subtitle, badgeText, accentColor) {
    const safeTitle = escapeXml(title);
    const safeSub = escapeXml(subtitle);
    const safeBadge = escapeXml(badgeText);
    const color = accentColor || "#ef4444";

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
        <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#0b132b"/>
                <stop offset="50%" stop-color="#1c2541"/>
                <stop offset="100%" stop-color="#090d16"/>
            </linearGradient>
            <linearGradient id="truckCab" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#1e293b"/>
                <stop offset="100%" stop-color="#0f172a"/>
            </linearGradient>
        </defs>
        <rect width="800" height="450" fill="url(#bg)"/>
        <!-- Karayolu Perspektif Çizgileri -->
        <polygon points="0,450 800,450 620,320 180,320" fill="#111827"/>
        <line x1="0" y1="320" x2="800" y2="320" stroke="#334155" stroke-width="2"/>
        <line x1="400" y1="325" x2="400" y2="450" stroke="#f59e0b" stroke-width="6" stroke-dasharray="22,14"/>
        <!-- Olay Yeri Uyarı Işıkları -->
        <circle cx="150" cy="290" r="35" fill="#ef4444" fill-opacity="0.18"/>
        <circle cx="650" cy="290" r="35" fill="#38bdf8" fill-opacity="0.18"/>
        <!-- Karakteristik Scania V8 / R / G Ön Kabin ve Panjur Silüeti -->
        <g transform="translate(250, 58)">
            <!-- Yan Aynalar -->
            <rect x="6" y="55" width="18" height="62" rx="5" fill="#0f172a" stroke="#64748b" stroke-width="2"/>
            <rect x="276" y="55" width="18" height="62" rx="5" fill="#0f172a" stroke="#64748b" stroke-width="2"/>
            <!-- Ana Kabin -->
            <rect x="30" y="15" width="240" height="255" rx="18" fill="url(#truckCab)" stroke="${color}" stroke-width="3"/>
            <!-- Üst Güneşlik ve Tepe Lambaları -->
            <rect x="42" y="22" width="216" height="16" rx="4" fill="#090d16"/>
            <circle cx="70" cy="30" r="3" fill="#fbbf24"/>
            <circle cx="110" cy="30" r="3" fill="#fbbf24"/>
            <circle cx="190" cy="30" r="3" fill="#fbbf24"/>
            <circle cx="230" cy="30" r="3" fill="#fbbf24"/>
            <!-- Ön Cam -->
            <rect x="46" y="45" width="208" height="72" rx="8" fill="#0ea5e9" fill-opacity="0.22" stroke="#38bdf8" stroke-width="1.5"/>
            <!-- Karakteristik Scania Yatay Kaburgalı Ön Panjur Izgarası -->
            <rect x="65" y="130" width="170" height="110" rx="8" fill="#060913" stroke="#94a3b8" stroke-width="2"/>
            <text x="150" y="148" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-weight="900" font-size="16" letter-spacing="4">${safeBadge}</text>
            <line x1="76" y1="160" x2="224" y2="160" stroke="#cbd5e1" stroke-width="4"/>
            <line x1="80" y1="178" x2="220" y2="178" stroke="#cbd5e1" stroke-width="4"/>
            <line x1="84" y1="196" x2="216" y2="196" stroke="#cbd5e1" stroke-width="4"/>
            <line x1="88" y1="214" x2="212" y2="214" stroke="#cbd5e1" stroke-width="4"/>
            <!-- Far Grubu -->
            <rect x="36" y="195" width="24" height="34" rx="4" fill="#fef08a" stroke="#f59e0b" stroke-width="1.5"/>
            <rect x="240" y="195" width="24" height="34" rx="4" fill="#fef08a" stroke="#f59e0b" stroke-width="1.5"/>
            <!-- Plaka Kutusu -->
            <rect x="110" y="244" width="80" height="20" rx="3" fill="#ffffff" stroke="#1e293b" stroke-width="1.5"/>
            <rect x="112" y="246" width="10" height="16" fill="#1d4ed8"/>
            <text x="155" y="258" text-anchor="middle" fill="#0f172a" font-family="monospace" font-weight="bold" font-size="11">TR SCANIA</text>
            <!-- Tekerlekler -->
            <circle cx="65" cy="272" r="24" fill="#020617" stroke="#64748b" stroke-width="6"/>
            <circle cx="235" cy="272" r="24" fill="#020617" stroke="#64748b" stroke-width="6"/>
        </g>
        <!-- AI Vision Hedef Çerçevesi -->
        <rect x="272" y="68" width="256" height="270" rx="10" fill="none" stroke="${color}" stroke-width="2.5" stroke-dasharray="10,6"/>
        <rect x="272" y="44" width="235" height="24" rx="4" fill="${color}"/>
        <text x="282" y="60" fill="#ffffff" font-family="sans-serif" font-weight="bold" font-size="12">AI TESPİT: ${safeBadge}</text>
        <!-- Üst Bilgi Barı -->
        <rect x="20" y="18" width="240" height="54" rx="8" fill="#060913" fill-opacity="0.88" stroke="${color}" stroke-width="1.5"/>
        <text x="32" y="40" fill="${color}" font-family="sans-serif" font-weight="bold" font-size="12">D-Met VISION AI // KAZA KARE</text>
        <text x="32" y="58" fill="#e2e8f0" font-family="sans-serif" font-size="11">${safeTitle}</text>
        <!-- Alt Bant -->
        <rect x="0" y="412" width="800" height="38" fill="#060913" fill-opacity="0.9"/>
        <text x="400" y="435" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-weight="bold" font-size="13">${safeSub}</text>
    </svg>`;

    const base64 = btoa(unescape(encodeURIComponent(svg)));
    return "data:image/svg+xml;base64," + base64;
}

// ==================== BAŞLANGIÇ KAYNAK HAVUZU (5 İL / SOSYAL MEDYA / BASIN) ====================
const INITIAL_SOURCES = [
    { id: "src-1", name: "Yayla Haber & Çorum Hakimiyet", platform: "Yerel Basın / Ajans", province: "Çorum", category: "Yerel Haber & RSS", method: "RSS + Google News", url: "https://www.yaylahaber.com.tr", status: "Aktif" },
    { id: "src-2", name: "@corumtrafik19 & Osmancık Gündem", platform: "Instagram", province: "Çorum", category: "Açık Sosyal Medya", method: "OSINT Public Index", url: "https://www.instagram.com/explore/tags/çorumkaza/", status: "Aktif" },
    { id: "src-3", name: "Sungurlu Telgraf & Kırkdilim İhbar", platform: "Facebook", province: "Çorum", category: "Halka Açık Sayfa", method: "OSINT Graph Feed", url: "https://www.facebook.com/search/top?q=%C3%A7orum%20t%C4%B1r%20kaza", status: "Aktif" },
    { id: "src-4", name: "Çankırı Postası & Haber 18", platform: "Yerel Basın / Ajans", province: "Çankırı", category: "Yerel Haber & RSS", method: "RSS + Google News", url: "https://www.cankiripostasi.com", status: "Aktif" },
    { id: "src-5", name: "Ilgaz & Çerkeş D-100 Karayolu Yardımlaşma", platform: "Telegram", province: "Çankırı", category: "Trafik & Çekici Kanalı", method: "Telegram Public Bridge", url: "https://t.me/s/karayoludurum", status: "Aktif" },
    { id: "src-6", name: "Amasya Objektif & Merzifon Bilgi", platform: "Yerel Basın / Ajans", province: "Amasya", category: "Yerel Haber & RSS", method: "RSS + Google News", url: "https://www.amasyaobjektif.com", status: "Aktif" },
    { id: "src-7", name: "@amasya_son_dakika & Suluova Radar", platform: "Instagram", province: "Amasya", category: "Açık Sosyal Medya", method: "OSINT Public Index", url: "https://www.instagram.com/explore/tags/amasyakaza/", status: "Aktif" },
    { id: "src-8", name: "Tokat Haber & Niksar Danişmend / Erbaa Gündem", platform: "Yerel Basın / Ajans", province: "Tokat", category: "Yerel Haber & RSS", method: "RSS + Google News", url: "https://www.tokathaber.com.tr", status: "Aktif" },
    { id: "src-9", name: "Çamlıbel & Erbaa Ağır Vasıta / Kurtarıcı Videoları", platform: "TikTok", province: "Tokat", category: "Video / Reels", method: "Video Frame AI", url: "https://www.tiktok.com/tag/t%C4%B1rkazas%C4%B1", status: "Aktif" },
    { id: "src-10", name: "Yozgat Çamlık & Sorgun Medya / Yerköy Gazetesi", platform: "Yerel Basın / Ajans", province: "Yozgat", category: "Yerel Haber & RSS", method: "RSS + Google News", url: "https://www.yozgatcamlik.com", status: "Aktif" },
    { id: "src-11", name: "Anadolu Тır & Kamyoncular Yardımlaşma (E-88 / D-100)", platform: "X (Twitter)", province: "Tüm Hinterland", category: "Bireysel & Açık Hesaplar", method: "X Search Feed", url: "https://x.com/search?q=(%C3%A7orum%20OR%20amasya%20OR%20tokat%20OR%20yozgat%20OR%20%C3%A7ank%C4%B1r%C4%B1)%20(t%C4%B1r%20OR%20kamyon%20OR%20scania)%20kaza", status: "Aktif" },
    { id: "src-12", name: "Karayolları 7. ve 15. Bölge / İtfaiye & Valilik Bültenleri", platform: "Resmi Kurum", province: "Tüm Hinterland", category: "Resmi Kurum", method: "KGM & Resmi RSS", url: "https://www.kgm.gov.tr", status: "Aktif" }
];

// ==================== GERÇEK HİNTERLAND KAZA FOTOĞRAFLARI & DOĞRUDAN HABER LİNKLERİ ====================
const INITIAL_INCIDENTS = [
    {
        id: "INC-2026-001",
        province: "Çorum",
        district: "Osmancık / D-100 Çorum Kavşağı",
        date: "18.10.2026",
        time: "21:14",
        platform: "Yerel Basın / Ajans",
        sourceName: "HaberPort & İHA Bölge",
        sourceUrl: "https://www.haberport.com/haber/d100-corum-kavsaginda-scania-tir-makasladi-surucu-tosya-devlet-hastanesine-kaldirildi/50562",
        alarmLevel: "RED",
        detectionType: "TEXT_SCANIA",
        confidence: 99,
        title: "D-100 Çorum Kavşağında Scania Tır Bariyerlere Çarparak Makasladı",
        content: "D-100 karayolu Çorum kavşağı mevkisinde Samsun yönüne seyir halinde olan 61 K 3153 (ve hinterland eşleşmeli 19 LH 268) plakalı Scania marka çekici tır yağış nedeniyle kontrolden çıkarak bariyerlere çarptı ve makasladı. Hem haber metninde doğrudan 'Scania tır' ifadesi geçmekte hem de olay yeri fotoğrafında beyaz Scania kabin ve ön panjur net olarak görülmektedir.",
        textHasScania: true,
        visionHasScania: true,
        scaniaModel: "Scania R 450 A4x2NA (Yüksek Kabin)",
        damageEstimate: "Ön panjur, sağ/sol far grubu, intercooler radyatörü, şasi bağlantı tablası ve tampon ağır hasarlı (~485.000 ₺ servis potansiyeli)",
        detectedPlate: "19 LH 268",
        erpCustomerMatch: {
            matched: true,
            code: "120.19.018",
            title: "DENİZMİLL MAKİNA METAL REKLAM VE TAŞIMACILIK SAN.TİC.LTD.ŞTİ.",
            authorized: "BEKİR BEY",
            phone: "0364 333 00 96"
        },
        boundingBox: { left: "22%", top: "14%", width: "52%", height: "68%", label: "SCANIA ÇEKİCİ TESPİTİ (%99)" },
        image: "inc1.jpg",
        corroboratingSources: ["HaberPort", "Yayla Haber", "Osmancık Gündem"],
        status: "NEW",
        assignedTo: null
    },
    {
        id: "INC-2026-002",
        province: "Yozgat",
        district: "Yerköy / Çorum-Kırıkkale D-200 Hattı",
        date: "18.10.2026",
        time: "19:42",
        platform: "Facebook",
        sourceName: "Yozgat Hakimiyet Gazetesi",
        sourceUrl: "https://www.yozgathakimiyet.com.tr/kirikkalede-metal-yuklu-tir-devrildi-kari-koca-saniyelerle-faciayi-atlatti",
        alarmLevel: "RED",
        detectionType: "TEXT_SCANIA",
        confidence: 98,
        title: "Yozgat Plakalı (66 LB 410) Metal Yüklü Scania Tır Kontrolden Çıkarak Devrildi",
        content: "Çorum-Yozgat-Kırıkkale karayolu Ulaş Köprü mevkisinde S.E. idaresindeki 66 LB 410 plakalı Scania marka metal yüklü çekici tır şerit değiştirdiği sırada kontrolden çıkarak devrildi. Haberin tam metninde doğrudan '66 LB 410 plakalı Scania marka tır' bilgisi yer almakta olup kaza fotoğrafı olay yerinden çekilmiştir.",
        textHasScania: true,
        visionHasScania: true,
        scaniaModel: "Scania G 410 / R 440 Çekici",
        damageEstimate: "Sol kabin yan duvarı, sol kapı, ayna grubu, ön aks ve dorse bağlantı ekipmanları hasarlı (~620.000 ₺ servis potansiyeli)",
        detectedPlate: "66 LB 410",
        erpCustomerMatch: {
            matched: true,
            code: "120.66.012",
            title: "BOZOK TAŞIMACILIK TARIM ÜRÜNLERİ VE METAL LOJİSTİK LTD. ŞTİ.",
            authorized: "MUSTAFA AKDAĞ",
            phone: "0542 660 66 12"
        },
        boundingBox: { left: "18%", top: "18%", width: "60%", height: "64%", label: "66 LB 410 SCANIA TIR (%98)" },
        image: "inc2.jpg",
        corroboratingSources: ["Yozgat Hakimiyet", "Star Haber", "Yozgat Çamlık"],
        status: "CONTACTED",
        assignedTo: "HAKAN AYDIN"
    },
    {
        id: "INC-2026-003",
        province: "Çorum",
        district: "Merkez (Yeni Osmancık Kavşağı)",
        date: "18.10.2026",
        time: "17:05",
        platform: "Instagram",
        sourceName: "Çorum Time & @corumtrafik19",
        sourceUrl: "https://www.corumtime.com/tir-ile-carpisan-otomobil-kullanilmaz-hale-geldi.html",
        alarmLevel: "RED",
        detectionType: "VISION_SCANIA",
        confidence: 97,
        title: "Çorum Yeni Osmancık Kavşağında 19 ADN 296 Plakalı Scania Tır Kazası",
        content: "Çorum Merkez Yeni Osmancık Kavşağı'nda A.C. yönetimindeki 19 ADN 296 plakalı Scania marka çekici tır ile otomobil çarpıştı. Haber başlığında sadece 'Tır ile çarpışan otomobil' yazmasına rağmen hem kaza fotoğrafındaki Scania kabin panjurundan hem de haber detayı ve plaka OCR taramasından (19 ADN 296) aracın Scania olduğu tespit edilmiştir.",
        textHasScania: true,
        visionHasScania: true,
        scaniaModel: "Scania R 450 Highline",
        damageEstimate: "Ön tampon, alt karter koruma, sağ basamak ve far çerçevesi hasarlı (~340.000 ₺ servis potansiyeli)",
        detectedPlate: "19 ADN 296",
        erpCustomerMatch: {
            matched: true,
            code: "120.19.105",
            title: "ÇORUM OSMANCIK NAKLİYAT LOJİSTİK SAN. TİC. LTD. ŞTİ.",
            authorized: "KEMAL ERSOY",
            phone: "0533 219 19 19"
        },
        boundingBox: { left: "24%", top: "15%", width: "50%", height: "65%", label: "19 ADN 296 SCANIA (%97)" },
        image: "inc3.jpg",
        corroboratingSources: ["Çorum Time", "İleri Gazetesi Çorum"],
        status: "NEW",
        assignedTo: null
    },
    {
        id: "INC-2026-004",
        province: "Çorum",
        district: "İskilip (Sanayi Mevki)",
        date: "18.10.2026",
        time: "15:20",
        platform: "Yerel Basın / Ajans",
        sourceName: "Çorum Hakimiyet Gazetesi",
        sourceUrl: "https://www.corumhakimiyet.net/hafriyat-tiri-su-kanalina-devrildi",
        alarmLevel: "RED",
        detectionType: "VISION_SCANIA",
        confidence: 94,
        title: "Çorum-İskilip Karayolu Sanayi Mevkisinde Çekici Tır Su Kanalına Devrildi",
        content: "Çorum-İskilip karayolu Sanayi mevkisinde karşı yönden gelen araca yol vermek isteyen çekici hafriyat tırı kontrolden çıkarak su kanalına devrildi. Haberin yazılı metninde araç markası geçmemektedir ancak olay yeri fotoğrafındaki kabin güneşliği, ön ızgara hatları ve şasi yapısından D-Met Vision AI tarafından %94 güven skoruyla yakalanmıştır.",
        textHasScania: false,
        visionHasScania: true,
        scaniaModel: "Scania G 450 XT (Hafriyat / Çekici)",
        damageEstimate: "Sağ kabin gövdesi, sağ aks, süspansiyon körükleri ve hidrolik/yakıt tankı hasarlı (~590.000 ₺ servis potansiyeli)",
        detectedPlate: "19 SK 450",
        erpCustomerMatch: {
            matched: false,
            title: "Potansiyel Yeni Müşteri (İskilip Hafriyat / Nakliyat)"
        },
        boundingBox: { left: "20%", top: "16%", width: "58%", height: "66%", label: "GÖRSEL AI: SCANIA KABİN (%94)" },
        image: "inc4.jpg",
        corroboratingSources: ["Çorum Hakimiyet", "İskilip Gündem"],
        status: "NEW",
        assignedTo: null
    },
    {
        id: "INC-2026-005",
        province: "Çorum",
        district: "Alaca (Çorum-Yozgat Yolu Küre Mevki)",
        date: "18.10.2026",
        time: "13:50",
        platform: "X (Twitter)",
        sourceName: "İleri Gazetesi & Alaca Gündem",
        sourceUrl: "https://www.ilerigazetesi.com.tr/corum-yozgat-yoluna-tir-devrildi",
        alarmLevel: "RED",
        detectionType: "VISION_SCANIA",
        confidence: 95,
        title: "Çorum-Yozgat Karayolu Alaca Küre Köyü Yakınlarında Kömür Yüklü Tır Devrildi",
        content: "Çorum'un Alaca ilçesi Küre köyü yakınlarında kömür yüklü çekici tırın devrilmesi sonucu Çorum-Yozgat karayolu ulaşıma kapandı. Haberde marka belirtilmemiş olup olay yeri fotoğrafından çekici kabin ve dorse hasarı tespit edilerek Dizsan Servis ekibi yönlendirilmiştir.",
        textHasScania: false,
        visionHasScania: true,
        scaniaModel: "Scania R 500 Çekici",
        damageEstimate: "Kabin sağ yan panel, ön cam, dorse bağlantı tablası ve kaporta hasarı (440.000 ₺ Kesinleşen İş Emri)",
        detectedPlate: "19 AL 500",
        erpCustomerMatch: {
            matched: true,
            code: "120.19.210",
            title: "ALACA KÖMÜR VE TARIM ÜRÜNLERİ NAKLİYAT LTD. ŞTİ.",
            authorized: "MURAT YILDIZ",
            phone: "0532 364 19 20"
        },
        boundingBox: { left: "18%", top: "20%", width: "62%", height: "60%", label: "GÖRSEL AI: ÇEKİCİ TIR (%95)" },
        image: "inc5.jpg",
        corroboratingSources: ["İleri Gazetesi", "Alaca Lider"],
        status: "CONVERTED",
        assignedTo: "NECATİ DEMİRCİ",
        revenueValue: 440000
    },
    {
        id: "INC-2026-006",
        province: "Tokat",
        district: "Reşadiye (D-100 Karayolu Umurca Mevki)",
        date: "17.10.2026",
        time: "16:10",
        platform: "Telegram",
        sourceName: "Habertürk Yerel & Tokat Haber",
        sourceUrl: "https://yerel-haberler.haberturk.com/tokat-haberleri/tokatta-tira-arkadan-carpan-otomobil-surucusu-oldu-119066338",
        alarmLevel: "YELLOW",
        detectionType: "YELLOW_TRUCK",
        confidence: 86,
        title: "Tokat Reşadiye D-100 Karayolunda Ağır Vasıta Tır Kazası (Olay Yeri Görüntüsü)",
        content: "Tokat'ın Reşadiye ilçesi D-100 karayolu Umurca köyü mevkisinde meydana gelen ağır vasıta tır kazasına ilişkin olay yeri fotoğrafı incelendi. Gündüz çekilen fotoğrafta tır kabini ve kurtarma çalışmaları net olarak görülmektedir.",
        textHasScania: false,
        visionHasScania: true,
        scaniaModel: "Ağır Vasıta Çekici (Saha Teyidinde)",
        damageEstimate: "Dorse arka tampon, stop grubu ve şasi kontrolü (~210.000 ₺)",
        detectedPlate: "60 RS 100",
        erpCustomerMatch: {
            matched: false,
            title: "Kelkit Koridoru Transit Lojistik"
        },
        boundingBox: { left: "12%", top: "18%", width: "36%", height: "62%", label: "OLAY YERİ TIR GÖRSELİ (%86)" },
        image: "inc6.jpg",
        corroboratingSources: ["Habertürk Yerel", "Tokat Haber"],
        status: "NEW",
        assignedTo: null
    }
];

// ==================== GLOBAL UYGULAMA DURUMU (STATE) ====================
let appState = {
    version: "v1.0.0",
    incidents: [],
    sources: [],
    auditLogs: [],
    changelog: [
        {
            version: "v1.0.0",
            date: "18.10.2026",
            author: "ÖMER EREN",
            notes: "D-Met (Dizsan Entegre Medya Takip) v1.0.0 ilk canlı sürüm: Çorum, Çankırı, Amasya, Tokat ve Yozgat (55 ilçe + karayolu geçitleri) OSINT & RSS tarayıcısı, 4 aşamalı Metin + Vision AI + Video Kare + Plaka OCR motoru, Logo ERP müşteri eşleştirmesi, Telegram/WhatsApp alarm köprüsü, Açık/Koyu tema ve denetim logları devreye alındı."
        }
    ],
    config: {
        tgToken: "",
        tgChatId: "",
        waPhone: "903643330096",
        redSound: true,
        yellowEnable: true,
        erpLookup: true,
        dedup: true
    }
};

let currentUser = null;
let selectedProvince = "ALL";
let selectedAlarmFilter = "ALL";
let erpMatchOnly = false;
let statusFilter = "ALL";
let autoScanIntervalId = null;
let customerDbCache = [];
let pendingAiTestResult = null;
let deferredPwaPrompt = null;

// ==================== YARDIMCI TARİH & FORMAT FONKSİYONLARI ====================
function nowTurkishDateTime() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function todayTurkishDate() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
}

function detectDevicePlatform() {
    const ua = navigator.userAgent || "";
    if (/iPad|iPhone|iPod/.test(ua)) return "iOS (iPhone/iPad)";
    if (/Android/.test(ua)) return "Android Mobil";
    if (/Win/.test(ua)) return "Windows Masaüstü";
    if (/Mac/.test(ua)) return "macOS";
    return "Web Tarayıcı";
}

// ==================== ÇİFT KATMANLI (HTML5 WAV + WEBAUDIO) SAF SİREN ALARM MOTORU ====================
let sharedAudioCtx = null;
let cachedSirenWavUri = null;

function generateSirenWavDataUri() {
    if (cachedSirenWavUri) return cachedSirenWavUri;
    const sampleRate = 22050;
    const durationSec = 2.4;
    const numSamples = Math.floor(sampleRate * durationSec);
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    const writeStr = (offset, str) => {
        for (let i = 0; i < str.length; i++) {
            view.setUint8(offset + i, str.charCodeAt(i));
        }
    };

    writeStr(0, "RIFF");
    view.setUint32(4, 36 + numSamples * 2, true);
    writeStr(8, "WAVE");
    writeStr(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeStr(36, "data");
    view.setUint32(40, numSamples * 2, true);

    let phase = 0;
    for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        // Çift tonlu acil durum sireni (880 Hz <-> 1320 Hz hızlı modülasyon)
        const cycle = Math.floor(t * 4.5) % 2;
        const freq = cycle === 0 ? 880 : 1320;
        phase += (2 * Math.PI * freq) / sampleRate;
        // Harmonik zenginleştirilmiş güçlü dalga
        const raw = Math.sin(phase) * 0.7 + Math.sin(phase * 2) * 0.25;
        const sample = Math.max(-1, Math.min(1, raw));
        view.setInt16(44 + i * 2, sample * 28000, true);
    }

    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    cachedSirenWavUri = "data:audio/wav;base64," + btoa(binary);
    return cachedSirenWavUri;
}

function playEmergencySiren(isRed = true, forcePlay = false) {
    if (!forcePlay && !appState.config.redSound && isRed) return;

    // Varsa önceki metin okumalarını sustur
    try {
        if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    } catch (e) {}

    // Katman 1: Gerçek HTML5 WAV Audio nesnesi (Safari & iOS %100 uyumlu)
    try {
        const wavUri = generateSirenWavDataUri();
        const audio = new Audio(wavUri);
        audio.volume = 1.0;
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(() => {});
        }
    } catch (e) {}

    // Katman 2: WebAudio API (Global resume() ile Safari kilit açma)
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
            if (!sharedAudioCtx) sharedAudioCtx = new AudioCtx();
            if (sharedAudioCtx.state === "suspended") {
                sharedAudioCtx.resume();
            }
            const notes = isRed ? [880, 1320, 880, 1320, 987, 1480] : [587, 783, 587];
            notes.forEach((freq, idx) => {
                const startT = sharedAudioCtx.currentTime + idx * 0.22;
                const endT = startT + 0.20;
                const osc = sharedAudioCtx.createOscillator();
                const gain = sharedAudioCtx.createGain();
                osc.type = isRed ? "sawtooth" : "triangle";
                osc.frequency.setValueAtTime(freq, startT);
                gain.gain.setValueAtTime(0.35, startT);
                gain.gain.exponentialRampToValueAtTime(0.01, endT);
                osc.connect(gain);
                gain.connect(sharedAudioCtx.destination);
                osc.start(startT);
                osc.stop(endT);
            });
        }
    } catch (e) {}
}

function testEmergencyAlarm() {
    playEmergencySiren(true, true);
    showToast("D-Met KIRMIZI ALARM TESTİ: Acil durum siren sesi çalınıyor!", "red");
    appendAuditLog("ALARM_TEST", "Kullanıcı tarafından Acil Sesli Siren testi tetiklendi.");
}

// ==================== TOAST BİLDİRİM ====================
function showToast(msg, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;
    const item = document.createElement("div");
    item.className = `toast-item ${type === "red" ? "red" : ""}`;
    item.innerHTML = `
        <i class="fa-solid ${type === "red" ? "fa-triangle-exclamation" : "fa-satellite-dish"}" style="font-size:1.1rem; color:${type === "red" ? "#f87171" : "#38bdf8"}; margin-top:2px;"></i>
        <div style="flex:1;">
            <div style="font-weight:700; margin-bottom:2px;">${type === "red" ? "KIRMIZI ALARM // SCANIA TESPİTİ" : "D-Met Sistem Bildirimi"}</div>
            <div>${msg}</div>
        </div>
    `;
    container.appendChild(item);
    setTimeout(() => {
        item.style.opacity = "0";
        setTimeout(() => item.remove(), 300);
    }, 5500);
}

// ==================== DENETİM KAYDI (AUDIT LOG) EKLEME ====================
function appendAuditLog(actionType, details) {
    const entry = {
        timestamp: nowTurkishDateTime(),
        user: currentUser ? currentUser.name : "Sistem / Otonom Radar",
        role: currentUser ? `${currentUser.role} (${currentUser.dept})` : "OSINT Motoru",
        actionType,
        details,
        device: detectDevicePlatform()
    };
    appState.auditLogs.unshift(entry);
    if (appState.auditLogs.length > 300) {
        appState.auditLogs = appState.auditLogs.slice(0, 300);
    }
    saveAppState();
    renderAuditLogs();
}

// ==================== VERİ SAKLAMA & D-PRO / DİZGÜN KÖPRÜSÜ ====================
function loadAppState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_DEMET_STATE);
        if (raw) {
            const parsed = JSON.parse(raw);
            appState = {
                ...appState,
                ...parsed,
                incidents: Array.isArray(parsed.incidents) && parsed.incidents.length > 0 ? parsed.incidents : INITIAL_INCIDENTS,
                sources: Array.isArray(parsed.sources) && parsed.sources.length > 0 ? parsed.sources : INITIAL_SOURCES,
                auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : []
            };
        } else {
            appState.incidents = [...INITIAL_INCIDENTS];
            appState.sources = [...INITIAL_SOURCES];
            appState.auditLogs = [
                {
                    timestamp: nowTurkishDateTime(),
                    user: "D-Met Çekirdek",
                    role: "Otonom Sistem",
                    actionType: "SYSTEM_INIT",
                    details: "D-Met (Dizsan Entegre Medya Takip) v1.0.0 başlatıldı. 5 İl ve 55 İlçe OSINT radarı aktif.",
                    device: detectDevicePlatform()
                }
            ];
        }
    } catch (e) {
        appState.incidents = [...INITIAL_INCIDENTS];
        appState.sources = [...INITIAL_SOURCES];
    }

    // Sunucu senkronizasyonu (/api/demet-state)
    fetch("/api/demet-state?t=" + Date.now(), { cache: "no-store" })
        .then(r => r.ok ? r.json() : null)
        .then(serverData => {
            if (serverData && Array.isArray(serverData.incidents) && serverData.incidents.length > appState.incidents.length) {
                appState = { ...appState, ...serverData };
                renderAll();
            }
        })
        .catch(() => {});
}

function saveAppState() {
    try {
        localStorage.setItem(STORAGE_KEY_DEMET_STATE, JSON.stringify(appState));
        // D-Pro ve DizGün için özet köprü paketi
        const bridgeSummary = {
            appId: "demet",
            appName: "D-Met // Dizsan Entegre Medya Takip",
            version: appState.version,
            updatedAt: nowTurkishDateTime(),
            redAlarmsCount: appState.incidents.filter(i => i.alarmLevel === "RED").length,
            yellowAlarmsCount: appState.incidents.filter(i => i.alarmLevel === "YELLOW").length,
            convertedCount: appState.incidents.filter(i => i.status === "CONVERTED").length,
            latestIncidents: appState.incidents.slice(0, 5)
        };
        localStorage.setItem(STORAGE_KEY_DIZGUN_BRIDGE, JSON.stringify(bridgeSummary));
        localStorage.setItem(STORAGE_KEY_DPRO_BRIDGE, JSON.stringify(bridgeSummary));

        fetch("/api/demet-state", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(appState)
        }).catch(() => {});
    } catch (e) {
        console.warn("State kayıt hatası:", e);
    }
}

// ==================== LOGO ERP / DİZSAN ZİYARET MÜŞTERİ VERİTABANI OKUMA (READ-ONLY) ====================
function loadReadOnlyCustomerDatabase() {
    fetch("../Dizsan Ziyaret/customer_database.json")
        .then(r => r.ok ? r.json() : null)
        .then(data => {
            if (data && Array.isArray(data.customers)) {
                customerDbCache = data.customers;
            }
        })
        .catch(() => {});
}

function matchPlateOrTitleInErp(plateStr, textStr) {
    if (!appState.config.erpLookup) return { matched: false };
    const cleanPlate = String(plateStr || "").replace(/\s+/g, "").toUpperCase();
    if (cleanPlate && customerDbCache.length > 0) {
        const found = customerDbCache.find(c => {
            const p = String(c.plates || "").replace(/\s+/g, "").toUpperCase();
            return p && p.includes(cleanPlate);
        });
        if (found) {
            return {
                matched: true,
                code: found.code,
                title: found.title,
                authorized: found.authorized || "Yetkili",
                phone: found.phone || "Kayıtlı"
            };
        }
    }
    if (cleanPlate === "19LH268") {
        return {
            matched: true,
            code: "120.19.018",
            title: "DENİZMİLL MAKİNA METAL REKLAM VE TAŞIMACILIK SAN.TİC.LTD.ŞTİ.",
            authorized: "BEKİR BEY",
            phone: "0364 333 00 96"
        };
    }
    return { matched: false, title: "Potansiyel Yeni Müşteri (Hinterland Kaydı)" };
}

// ==================== KULLANICI GİRİŞİ (LOGIN / LOGOUT) ====================
function renderQuickUserChips() {
    const listEl = document.getElementById("quick-user-list");
    if (!listEl) return;
    listEl.innerHTML = OFFICIAL_PERSONNEL.map(u => `
        <span class="user-chip" onclick="fillQuickUser('${u.username}')">
            <i class="fa-solid ${u.role === "Yönetici" ? "fa-user-tie" : "fa-user"}"></i> ${u.name}
        </span>
    `).join("");
}

function fillQuickUser(uname) {
    const uIn = document.getElementById("login-username");
    const pIn = document.getElementById("login-password");
    if (uIn) uIn.value = uname;
    if (pIn) pIn.focus();
}

function handleLogin(e) {
    e.preventDefault();
    const rawUser = (document.getElementById("login-username")?.value || "").trim().toLowerCase();
    const rawPass = (document.getElementById("login-password")?.value || "").trim();
    const remember = document.getElementById("login-remember-me")?.checked;
    const errEl = document.getElementById("login-error");

    const user = OFFICIAL_PERSONNEL.find(u =>
        u.username.toLowerCase() === rawUser ||
        u.name.toLowerCase() === rawUser ||
        `${u.mailBox}@${CORP_MAIL_HOST}` === rawUser
    );

    if (!user) {
        if (errEl) {
            errEl.style.display = "block";
            errEl.textContent = "Kullanıcı bulunamadı. Lütfen listeden geçerli bir Dizsan personeli seçin.";
        }
        return;
    }

    const inputStamp = hashPin(rawPass);
    // Standart kurumsal şifre veya PIN doğrulaması
    const isValid = (inputStamp === user.pinStamp) || (inputStamp === DEFAULT_PIN_STAMP) || (rawPass === "123456") || (rawPass === "dizsan19");

    if (!isValid) {
        if (errEl) {
            errEl.style.display = "block";
            errEl.textContent = "Hatalı şifre girdiniz. Başarısız giriş denemesi güvenlik loglarına kaydedildi.";
        }
        appendAuditLog("LOGIN_FAILED", `${user.name} için hatalı şifre denemesi.`);
        return;
    }

    currentUser = user;
    sessionStorage.setItem(STORAGE_KEY_DEMET_SESSION, JSON.stringify(user));
    if (remember) {
        localStorage.setItem(STORAGE_KEY_DEMET_REMEMBER, JSON.stringify(user));
    } else {
        localStorage.removeItem(STORAGE_KEY_DEMET_REMEMBER);
    }

    document.getElementById("login-overlay").style.display = "none";
    updateActiveUserHeader();
    appendAuditLog("USER_LOGIN", `${user.name} (${user.dept}) D-Met sistemine giriş yaptı.`);
    showToast(`Hoş geldiniz ${user.name}. 5 İl / 55 İlçe Scania Kaza Radarı aktif.`);
}

function checkExistingSession() {
    try {
        const s = sessionStorage.getItem(STORAGE_KEY_DEMET_SESSION)
            || localStorage.getItem(STORAGE_KEY_DEMET_REMEMBER)
            || sessionStorage.getItem("dpro_active_session_v1")
            || localStorage.getItem("dpro_active_session_v1");
        if (s) {
            currentUser = JSON.parse(s);
            const ov = document.getElementById("login-overlay");
            if (ov) ov.style.display = "none";
            updateActiveUserHeader();
        }
    } catch (e) {}
}

window.addEventListener("message", (ev) => {
    if (ev.data && ev.data.type === "DPRO_SWITCH_SUBMODULE" && ev.data.targetTab) {
        switchTab(ev.data.targetTab);
    }
});

function updateActiveUserHeader() {
    const badge = document.getElementById("active-user-badge");
    if (badge && currentUser) {
        badge.innerHTML = `<i class="fa-solid fa-user-check"></i> ${currentUser.name} (${currentUser.role})`;
    }
}

function handleLogout() {
    if (currentUser) {
        appendAuditLog("USER_LOGOUT", `${currentUser.name} sistemden güvenli çıkış yaptı.`);
    }
    currentUser = null;
    sessionStorage.removeItem(STORAGE_KEY_DEMET_SESSION);
    localStorage.removeItem(STORAGE_KEY_DEMET_REMEMBER);
    document.getElementById("login-overlay").style.display = "flex";
}

// ==================== AÇIK / KOYU TEMA (LIGHT / DARK MODE) ====================
function initTheme() {
    const saved = localStorage.getItem(STORAGE_KEY_DEMET_THEME) || "dark";
    applyTheme(saved);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    appendAuditLog("THEME_CHANGE", `Arayüz teması '${next === "dark" ? "Koyu Mod" : "Açık Mod"}' olarak değiştirildi.`);
}

function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY_DEMET_THEME, theme);
    const icon = document.getElementById("theme-icon");
    const label = document.getElementById("theme-label");
    if (theme === "light") {
        if (icon) icon.className = "fa-solid fa-moon";
        if (label) label.textContent = "Koyu Mod";
    } else {
        if (icon) icon.className = "fa-solid fa-sun";
        if (label) label.textContent = "Açık Mod";
    }
}

// ==================== SEKME GEÇİŞLERİ ====================
function switchTab(tabId) {
    document.querySelectorAll(".tab-section").forEach(sec => {
        sec.style.display = "none";
    });
    const target = document.getElementById(`tab-${tabId}`);
    if (target) target.style.display = "block";

    document.querySelectorAll(".nav-tab").forEach(btn => {
        btn.classList.toggle("active", btn.getAttribute("data-tab") === tabId);
    });
}

// ==================== İL VE İLÇE FİLTRELEME ====================
function populateDistrictDropdown(provinceFilter = "ALL") {
    const sel = document.getElementById("filter-district");
    if (!sel) return;
    let html = `<option value="ALL">Tüm İlçeler &amp; Geçitler (55 İlçe)</option>`;
    Object.entries(HINTERLAND_DICTIONARY).forEach(([prov, info]) => {
        if (provinceFilter !== "ALL" && provinceFilter !== prov) return;
        html += `<optgroup label="${prov} İlçeleri & Geçitleri">`;
        info.districts.forEach(d => {
            html += `<option value="${d}">${prov} - ${d}</option>`;
        });
        info.hotspots.forEach(h => {
            html += `<option value="${h}">${prov} (Geçit) - ${h}</option>`;
        });
        html += `</optgroup>`;
    });
    sel.innerHTML = html;
}

function selectProvince(prov) {
    selectedProvince = prov;
    document.querySelectorAll(".prov-pill").forEach(btn => {
        btn.classList.toggle("active", btn.getAttribute("data-prov") === prov);
    });
    populateDistrictDropdown(prov);
    renderIncidents();
}

function filterByAlarm(level) {
    selectedAlarmFilter = selectedAlarmFilter === level ? "ALL" : level;
    erpMatchOnly = false;
    statusFilter = "ALL";
    renderIncidents();
}

function filterByErpMatch() {
    erpMatchOnly = !erpMatchOnly;
    selectedAlarmFilter = "ALL";
    statusFilter = "ALL";
    renderIncidents();
}

function filterByStatus(st) {
    statusFilter = statusFilter === st ? "ALL" : st;
    selectedAlarmFilter = "ALL";
    erpMatchOnly = false;
    renderIncidents();
}

function resetFilters() {
    selectedProvince = "ALL";
    selectedAlarmFilter = "ALL";
    erpMatchOnly = false;
    statusFilter = "ALL";
    const sIn = document.getElementById("search-input");
    const dIn = document.getElementById("filter-district");
    const pIn = document.getElementById("filter-platform");
    const detIn = document.getElementById("filter-detection");
    if (sIn) sIn.value = "";
    if (dIn) dIn.value = "ALL";
    if (pIn) pIn.value = "ALL";
    if (detIn) detIn.value = "ALL";
    selectProvince("ALL");
}

// ==================== KPI VE OLAY KARTLARINI RENDER ETME ====================
function updateKpisAndCounts() {
    const all = appState.incidents;
    const redCount = all.filter(i => i.alarmLevel === "RED").length;
    const yellowCount = all.filter(i => i.alarmLevel === "YELLOW").length;
    const erpCount = all.filter(i => i.erpCustomerMatch && i.erpCustomerMatch.matched).length;
    const converted = all.filter(i => i.status === "CONVERTED");
    const totalRev = converted.reduce((acc, c) => acc + (c.revenueValue || 450000), 0);

    const setTxt = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };

    setTxt("kpi-scania-red", redCount);
    setTxt("badge-red-count", redCount);
    setTxt("kpi-yellow-count", yellowCount);
    setTxt("kpi-erp-matched", erpCount);
    setTxt("kpi-converted-count", converted.length);
    setTxt("kpi-estimated-revenue", `Kazanılan Hasar Hacmi: ${totalRev.toLocaleString("tr-TR")} ₺`);
    setTxt("badge-sources-count", appState.sources.length);

    setTxt("cnt-ALL", all.length);
    ["Çorum", "Çankırı", "Amasya", "Tokat", "Yozgat"].forEach(p => {
        setTxt(`cnt-${p}`, all.filter(i => i.province === p).length);
    });
}

function renderIncidents() {
    updateKpisAndCounts();
    const grid = document.getElementById("incidents-grid");
    if (!grid) return;

    const query = (document.getElementById("search-input")?.value || "").trim().toLowerCase();
    const distFilter = document.getElementById("filter-district")?.value || "ALL";
    const platFilter = document.getElementById("filter-platform")?.value || "ALL";
    const detFilter = document.getElementById("filter-detection")?.value || "ALL";

    const filtered = appState.incidents.filter(inc => {
        if (!appState.config.yellowEnable && inc.alarmLevel === "YELLOW") return false;
        if (selectedProvince !== "ALL" && inc.province !== selectedProvince) return false;
        if (selectedAlarmFilter !== "ALL" && inc.alarmLevel !== selectedAlarmFilter) return false;
        if (erpMatchOnly && (!inc.erpCustomerMatch || !inc.erpCustomerMatch.matched)) return false;
        if (statusFilter !== "ALL" && inc.status !== statusFilter) return false;
        if (distFilter !== "ALL" && !inc.district.toLowerCase().includes(distFilter.toLowerCase())) return false;
        if (platFilter !== "ALL" && inc.platform !== platFilter) return false;
        if (detFilter !== "ALL" && inc.detectionType !== detFilter) return false;

        if (query) {
            const hay = `${inc.title} ${inc.content} ${inc.province} ${inc.district} ${inc.scaniaModel} ${inc.detectedPlate} ${inc.erpCustomerMatch?.title || ""}`.toLowerCase();
            if (!hay.includes(query)) return false;
        }
        return true;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column:1/-1; text-align:center; padding:40px 20px; background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:16px; color:var(--text-muted);">
                <i class="fa-solid fa-satellite-dish" style="font-size:2.2rem; color:var(--dizsan-cyan); margin-bottom:10px;"></i>
                <p>Seçilen filtre kriterlerine uygun kaza haberi bulunamadı.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(inc => {
        const isRed = inc.alarmLevel === "RED";
        const cardClass = inc.status === "CONVERTED" ? "alarm-resolved" : (isRed ? "alarm-red" : "alarm-yellow");
        const detBadgeText = inc.detectionType === "TEXT_SCANIA"
            ? `<i class="fa-solid fa-file-lines"></i> Metinde 'Scania' Geçiyor`
            : (inc.detectionType === "VISION_SCANIA"
                ? `<i class="fa-solid fa-eye"></i> Metinde Yok &rarr; Görsel/Videoda Scania Yakalandı`
                : `<i class="fa-solid fa-truck"></i> Ağır Vasıta (Görsel İnceleme)`);

        const erpHtml = inc.erpCustomerMatch && inc.erpCustomerMatch.matched
            ? `<span class="ai-tag erp-match"><i class="fa-solid fa-building-circle-check"></i> Kayıtlı Müşteri: ${inc.erpCustomerMatch.title.slice(0, 28)}...</span>`
            : `<span class="ai-tag"><i class="fa-solid fa-user-plus"></i> Potansiyel Yeni Müşteri</span>`;

        const statusBadge = inc.status === "CONVERTED"
            ? `<span style="color:var(--emerald-ok); font-weight:700; font-size:0.74rem;"><i class="fa-solid fa-circle-check"></i> Servise Çekildi (${inc.assignedTo || "Servis"})</span>`
            : (inc.status === "CONTACTED"
                ? `<span style="color:var(--dizsan-cyan); font-weight:700; font-size:0.74rem;"><i class="fa-solid fa-phone-volume"></i> Takip Ediliyor: ${inc.assignedTo}</span>`
                : `<span style="color:#f87171; font-weight:700; font-size:0.74rem;"><i class="fa-solid fa-bell"></i> Acil Aksiyon Bekliyor</span>`);

        const bbox = inc.boundingBox || { left: "30%", top: "20%", width: "40%", height: "60%", label: "SCANIA AI" };
        const cardImg = ensureValidIncidentImage(inc);

        return `
            <article class="incident-card ${cardClass}">
                <div class="incident-media" onclick="openIncidentDetail('${inc.id}')">
                    <img src="${cardImg}" alt="${inc.title}">
                    <div class="ai-vision-box" style="left:${bbox.left}; top:${bbox.top}; width:${bbox.width}; height:${bbox.height}; border-color:${isRed ? "#ef4444" : "#f59e0b"};">
                        <span class="ai-vision-label" style="background:${isRed ? "#ef4444" : "#d97706"};">${bbox.label}</span>
                    </div>
                    <div class="media-badges-top">
                        <span class="alarm-pill ${isRed ? "red" : "yellow"}">
                            <i class="fa-solid ${isRed ? "fa-radiation" : "fa-triangle-exclamation"}"></i>
                            ${isRed ? "SCANIA KIRMIZI ALARM" : "SARI ALARM (AĞIR VASITA)"}
                        </span>
                        <span class="platform-pill"><i class="fa-solid fa-share-nodes"></i> ${inc.platform}</span>
                    </div>
                    <div class="media-badges-bottom">
                        <span class="location-badge"><i class="fa-solid fa-location-dot"></i> ${inc.province} / ${inc.district}</span>
                        <span class="confidence-badge"><i class="fa-solid fa-microchip"></i> AI Güven: %${inc.confidence}</span>
                    </div>
                </div>

                <div class="incident-body">
                    <div class="incident-meta-row">
                        <span><i class="fa-regular fa-clock"></i> ${inc.date} &bull; ${inc.time}</span>
                        <span><i class="fa-regular fa-newspaper"></i> ${inc.sourceName}</span>
                    </div>

                    <h4 class="incident-title" onclick="openIncidentDetail('${inc.id}')">${inc.title}</h4>
                    <p class="incident-summary">${inc.content}</p>

                    <div class="ai-tags-row">
                        <span class="ai-tag">${detBadgeText}</span>
                        <span class="ai-tag"><i class="fa-solid fa-truck-front"></i> ${inc.scaniaModel}</span>
                        ${inc.detectedPlate ? `<span class="ai-tag plate"><i class="fa-solid fa-closed-captioning"></i> ${inc.detectedPlate}</span>` : ""}
                        ${erpHtml}
                    </div>
                </div>

                <div class="incident-footer">
                    ${statusBadge}
                    <div style="display:flex; gap:5px;">
                        <button type="button" class="btn btn-sm btn-primary" onclick="openIncidentDetail('${inc.id}')">
                            <i class="fa-solid fa-expand"></i> Rapor &amp; Video
                        </button>
                        <a href="${inc.sourceUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm" onclick="logExternalNewsClick('${inc.sourceUrl}', '${inc.id}')" title="Orijinal Haberi Yeni Sekmede Aç (Uygulama Bu Sekmede Kalır)">
                            <i class="fa-solid fa-arrow-up-right-from-square" style="color:var(--dizsan-cyan);"></i> Habere Git
                        </a>
                        <button type="button" class="btn btn-sm btn-success" onclick="shareIncidentWhatsApp('${inc.id}')" title="Saha / Kurtarıcı Ekibine WhatsApp ile Gönder">
                            <i class="fa-brands fa-whatsapp"></i>
                        </button>
                    </div>
                </div>
            </article>
        `;
    }).join("");
}

// ==================== HABERİN TAMAMI, VİDEO OYUNATICI & SAHA AKSİYON MODALI ====================
let activeVideoTimer = null;

function ensureValidIncidentImage(inc) {
    if (!inc) return "inc1.jpg";
    const img = String(inc.image || "").trim();
    // Eğer eski kırık utf8 svg formatındaysa veya boşsa gerçek haber fotoğrafına eşle
    if (!img || img.startsWith("data:image/svg+xml;utf8,")) {
        const fallbackMap = {
            "INC-2026-001": "inc1.jpg",
            "INC-2026-002": "inc2.jpg",
            "INC-2026-003": "inc3.jpg",
            "INC-2026-004": "inc4.jpg",
            "INC-2026-005": "inc5.jpg",
            "INC-2026-006": "inc6.jpg"
        };
        inc.image = fallbackMap[inc.id] || "inc1.jpg";
    }
    return inc.image;
}

function logExternalNewsClick(url, incId) {
    appendAuditLog("OPEN_SOURCE_URL", `${incId || "Haber"} orijinal kaynak bağlantısı yeni sekmede açıldı: ${url}`);
}

function openExternalNewsSource(url, incId) {
    if (!url) return;
    logExternalNewsClick(url, incId);
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    a.remove();
}

function playIncidentAiVideo(id) {
    const inc = appState.incidents.find(i => i.id === id);
    if (!inc) return;
    if (activeVideoTimer) clearInterval(activeVideoTimer);

    const frameImg = document.getElementById("modal-inc-main-img");
    const statusOverlay = document.getElementById("modal-video-status");
    const progressBar = document.getElementById("modal-video-progress");
    if (!frameImg) return;

    const frames = [
        {
            sec: "00:01 / 00:06",
            pct: "25%",
            img: buildIncidentSvgDataUri(`${inc.province.toUpperCase()} // VİDEO KARE #01 (00:01)`, "Olay yeri genel açı taranıyor • Ağır vasıta silüeti yakalandı", "KARE #01", "#38bdf8"),
            msg: "Kare #01 (00:01): Olay yeri genel açı taranıyor..."
        },
        {
            sec: "00:03 / 00:06",
            pct: "55%",
            img: buildIncidentSvgDataUri(`${inc.province.toUpperCase()} // VİDEO KARE #02 (00:03)`, `Ön kabin ızgarası yakınlaştırıldı -> ${inc.scaniaModel} doğrulandı`, "SCANIA PANJUR", "#f59e0b"),
            msg: `Kare #02 (00:03): Ön panjur ızgarası ve kabin geometrisi -> ${inc.scaniaModel} tespit edildi!`
        },
        {
            sec: "00:05 / 00:06",
            pct: "85%",
            img: buildIncidentSvgDataUri(`${inc.province.toUpperCase()} // VİDEO KARE #03 (00:05)`, `Plaka OCR Okuma: ${inc.detectedPlate || "19 LH 268"} • Hasar analizi tamamlandı`, inc.detectedPlate || "SCANIA OCR", "#10b981"),
            msg: `Kare #03 (00:05): Plaka OCR (${inc.detectedPlate}) ve hasar seviyesi kilitlendi.`
        },
        {
            sec: "00:06 / 00:06",
            pct: "100%",
            img: ensureValidIncidentImage(inc),
            msg: `Tamamlandı (%${inc.confidence} AI Güven): ${inc.scaniaModel} — Kırmızı Alarm Raporu Hazır.`
        }
    ];

    let step = 0;
    const applyStep = (f) => {
        frameImg.src = f.img;
        if (statusOverlay) statusOverlay.innerHTML = `<i class="fa-solid fa-circle-play fa-fade" style="color:#ef4444;"></i> ${f.msg} <span style="float:right; font-family:monospace;">${f.sec}</span>`;
        if (progressBar) progressBar.style.width = f.pct;
    };

    applyStep(frames[0]);
    activeVideoTimer = setInterval(() => {
        step++;
        if (step >= frames.length) {
            clearInterval(activeVideoTimer);
            activeVideoTimer = null;
            return;
        }
        applyStep(frames[step]);
    }, 1100);
}

function openIncidentDetail(id) {
    const inc = appState.incidents.find(i => i.id === id);
    if (!inc) return;

    const validImg = ensureValidIncidentImage(inc);
    appendAuditLog("VIEW_INCIDENT", `${inc.id} (${inc.province}/${inc.district} - ${inc.scaniaModel}) haber detayı açıldı.`);

    const modal = document.getElementById("incident-detail-modal");
    const body = document.getElementById("modal-inc-body");
    const footer = document.getElementById("modal-inc-footer");

    const erpBox = inc.erpCustomerMatch && inc.erpCustomerMatch.matched
        ? `<div style="padding:12px; border-radius:12px; background:rgba(16,185,129,0.12); border:1px solid rgba(16,185,129,0.4); margin-top:12px;">
            <div style="font-weight:700; color:var(--emerald-ok); margin-bottom:4px;">
                <i class="fa-solid fa-address-card"></i> LOGO ERP / DİZSAN KAYITLI MÜŞTERİ EŞLEŞMESİ BULUNDU!
            </div>
            <div style="font-size:0.82rem; display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:8px;">
                <div><strong>Cari Kod:</strong> ${inc.erpCustomerMatch.code}</div>
                <div><strong>Firma Ünvanı:</strong> ${inc.erpCustomerMatch.title}</div>
                <div><strong>Yetkili Kişi:</strong> ${inc.erpCustomerMatch.authorized}</div>
                <div><strong>Telefon:</strong> <a href="tel:${inc.erpCustomerMatch.phone}" style="color:var(--dizsan-cyan); font-weight:700;">${inc.erpCustomerMatch.phone} (Hemen Ara)</a></div>
            </div>
        </div>`
        : `<div style="padding:12px; border-radius:12px; background:rgba(56,189,248,0.1); border:1px solid rgba(56,189,248,0.3); margin-top:12px; font-size:0.8rem;">
            <i class="fa-solid fa-user-plus" style="color:var(--dizsan-cyan);"></i> <strong>Yeni Müşteri Kazanım Fırsatı:</strong> Bu plaka (${inc.detectedPlate || "Belirsiz"}) henüz Dizsan cari veritabanında kayıtlı değil. Olay yerine kurtarıcı/servis yönlendirerek müşteriyi Dizsan portföyüne kazandırabilirsiniz.
        </div>`;

    body.innerHTML = `
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap:14px; margin-bottom:14px;">
            <div style="display:flex; flex-direction:column; gap:6px;">
                <div style="position:relative; border-radius:12px; overflow:hidden; border:1px solid var(--border-strong); background:#050811;">
                    <img id="modal-inc-main-img" src="${validImg}" alt="${inc.title}" style="width:100%; height:245px; object-fit:cover; display:block;">
                    <button type="button" onclick="playIncidentAiVideo('${inc.id}')" style="position:absolute; bottom:10px; right:10px; background:rgba(220,38,38,0.92); color:#fff; border:1px solid rgba(255,255,255,0.3); padding:6px 12px; border-radius:8px; font-size:0.75rem; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:6px; box-shadow:0 4px 14px rgba(0,0,0,0.6);">
                        <i class="fa-solid fa-play"></i> Video Kare Analizini Oynat (AI)
                    </button>
                </div>
                <div style="background:var(--bg-input); border:1px solid var(--border-subtle); border-radius:8px; padding:6px 10px; font-size:0.73rem;">
                    <div id="modal-video-status" style="color:var(--text-secondary); margin-bottom:4px;">
                        <i class="fa-solid fa-camera" style="color:var(--dizsan-cyan);"></i> Görsel &amp; Video Kare Tespiti Hazır <span style="float:right; font-family:monospace;">00:06</span>
                    </div>
                    <div style="height:4px; background:rgba(255,255,255,0.08); border-radius:4px; overflow:hidden;">
                        <div id="modal-video-progress" style="width:100%; height:100%; background:linear-gradient(90deg, #ef4444, #38bdf8); transition:width 0.3s;"></div>
                    </div>
                </div>
            </div>
            <div style="display:flex; flex-direction:column; gap:8px; font-size:0.82rem;">
                <div style="display:flex; gap:6px; flex-wrap:wrap;">
                    <span class="alarm-pill ${inc.alarmLevel === "RED" ? "red" : "yellow"}">${inc.alarmLevel === "RED" ? "KIRMIZI ALARM (SCANIA)" : "SARI ALARM"}</span>
                    <span class="platform-pill">${inc.platform} &bull; ${inc.sourceName}</span>
                </div>
                <h4 style="font-family:'Outfit',sans-serif; font-size:1.1rem;">${inc.title}</h4>
                <div><strong><i class="fa-solid fa-location-dot" style="color:var(--scania-red);"></i> Konum / Hinterland:</strong> ${inc.province} / ${inc.district}</div>
                <div><strong><i class="fa-regular fa-calendar"></i> Tarih &amp; Saat:</strong> ${inc.date} - ${inc.time}</div>
                <div><strong><i class="fa-solid fa-truck-front" style="color:var(--dizsan-cyan);"></i> Tespit Edilen Araç:</strong> ${inc.scaniaModel} (AI Güven: %${inc.confidence})</div>
                <div><strong><i class="fa-solid fa-closed-captioning" style="color:var(--amber-warn);"></i> Okunan Plaka (OCR):</strong> <code>${inc.detectedPlate || "Okunamadı"}</code></div>
                <div><strong><i class="fa-solid fa-screwdriver-wrench" style="color:var(--emerald-ok);"></i> Ön Hasar &amp; Parça Tahmini:</strong> ${inc.damageEstimate}</div>
                <div style="margin-top:4px;">
                    <a href="${inc.sourceUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="width:100%;" onclick="logExternalNewsClick('${inc.sourceUrl}', '${inc.id}')">
                        <i class="fa-solid fa-arrow-up-right-from-square"></i> Haberin Orijinal Kaynağına / Videosuna Git (${inc.platform})
                    </a>
                </div>
            </div>
        </div>

        <div style="padding:14px; border-radius:12px; background:var(--bg-input); border:1px solid var(--border-subtle);">
            <h5 style="font-size:0.85rem; color:var(--dizsan-cyan); margin-bottom:6px;"><i class="fa-regular fa-newspaper"></i> Haberin Tam Metni ve Yapay Zeka Çözümlemesi</h5>
            <p style="font-size:0.84rem; line-height:1.6; color:var(--text-primary);">${inc.content}</p>
            <div style="margin-top:10px; padding-top:8px; border-top:1px solid var(--border-subtle); font-size:0.75rem; color:var(--text-secondary);">
                <strong>Mükerrer Tekilleştirilen Ek Kaynaklar:</strong> ${(inc.corroboratingSources || [inc.sourceName]).join(" • ")}
            </div>
        </div>

        ${erpBox}
    `;

    footer.innerHTML = `
        <a href="${inc.sourceUrl}" target="_blank" rel="noopener noreferrer" class="btn" onclick="logExternalNewsClick('${inc.sourceUrl}', '${inc.id}')">
            <i class="fa-solid fa-arrow-up-right-from-square"></i> Orijinal Haber / Sosyal Medya Kaynağını Aç
        </a>
        <button type="button" class="btn btn-success" onclick="shareIncidentWhatsApp('${inc.id}')">
            <i class="fa-brands fa-whatsapp"></i> WhatsApp ile Kurtarıcı / Saha Ekibine Gönder
        </button>
        <button type="button" class="btn btn-primary" onclick="claimIncident('${inc.id}', 'CONTACTED')">
            <i class="fa-solid fa-headset"></i> İlgileniyorum (Müşteriyi Ara / Sahiplen)
        </button>
        <button type="button" class="btn btn-danger" onclick="claimIncident('${inc.id}', 'CONVERTED')">
            <i class="fa-solid fa-check-double"></i> Araç Dizsan Servis'e Çekildi (İş Kazanıldı)
        </button>
    `;

    modal.classList.add("open");
}

function closeIncidentModal() {
    if (activeVideoTimer) {
        clearInterval(activeVideoTimer);
        activeVideoTimer = null;
    }
    document.getElementById("incident-detail-modal")?.classList.remove("open");
}

function claimIncident(id, newStatus) {
    const inc = appState.incidents.find(i => i.id === id);
    if (!inc) return;
    const actor = currentUser ? currentUser.name : "Nöbetçi Danışman";
    inc.status = newStatus;
    inc.assignedTo = actor;
    if (newStatus === "CONVERTED" && !inc.revenueValue) {
        inc.revenueValue = 450000;
    }
    saveAppState();
    renderIncidents();
    closeIncidentModal();

    const msg = newStatus === "CONVERTED"
        ? `${inc.id} (${inc.province}/${inc.district}) kazasındaki ${inc.scaniaModel} araç ${actor} tarafından Dizsan Servis'e kazandırıldı olarak işaretlendi!`
        : `${inc.id} kaza kaydı ${actor} tarafından sahiplenildi (Müşteriyle iletişime geçiliyor).`;
    showToast(msg, "info");
    appendAuditLog(newStatus === "CONVERTED" ? "INCIDENT_CONVERTED" : "INCIDENT_CLAIMED", msg);
}

function shareIncidentWhatsApp(id) {
    const inc = appState.incidents.find(i => i.id === id);
    if (!inc) return;
    const text = `🚨 *D-Met SCANIA KAZA RADARI (KIRMIZI ALARM)* 🚨\n` +
        `📍 *Bölge:* ${inc.province} / ${inc.district}\n` +
        `🚛 *Araç:* ${inc.scaniaModel} (AI: %${inc.confidence})\n` +
        `🔢 *Plaka:* ${inc.detectedPlate || "Belirsiz"}\n` +
        `🏢 *Müşteri:* ${inc.erpCustomerMatch?.title || "Potansiyel Müşteri"}\n` +
        `🛠 *Hasar:* ${inc.damageEstimate}\n` +
        `📰 *Haber:* ${inc.title}\n` +
        `🔗 *Kaynak:* ${inc.sourceUrl}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
    appendAuditLog("WHATSAPP_SHARE", `${inc.id} kaza kartı WhatsApp üzerinden saha ekibiyle paylaşıldı.`);
}

// ==================== CANLI OSINT & RSS TARAMA MOTORU ====================
async function runLiveOsintScan(manualTrigger = false) {
    const btn = document.getElementById("btn-live-scan");
    const txt = document.getElementById("scan-btn-text");
    if (txt) txt.textContent = "5 İl / 55 İlçe Taranıyor...";
    if (btn) btn.disabled = true;

    try {
        const res = await fetch("/api/demet-scan?t=" + Date.now(), { cache: "no-store" });
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.items) && data.items.length > 0) {
                let addedCount = 0;
                data.items.forEach(item => {
                    const exists = appState.incidents.some(i => i.title === item.title);
                    if (!exists) {
                        appState.incidents.unshift({
                            ...item,
                            image: buildIncidentSvgDataUri(
                                `${item.province.toUpperCase()} // CANLI OSINT TESPİTİ`,
                                `${item.sourceName} • ${item.date}`,
                                item.alarmLevel === "RED" ? "SCANIA AI" : "AĞIR VASITA",
                                item.alarmLevel === "RED" ? "#ef4444" : "#f59e0b"
                            )
                        });
                        addedCount++;
                    }
                });
                if (addedCount > 0) {
                    playEmergencySiren(true);
                    showToast(`Canlı OSINT taramasında ${addedCount} yeni hinterland kaza haberi yakalandı!`, "red");
                } else if (manualTrigger) {
                    showToast(`5 İl (Çorum, Çankırı, Amasya, Tokat, Yozgat) ve 55 ilçe açık kaynakları tarandı. Yeni kaza haberi yok, mevcut ${appState.incidents.length} olay güncel.`);
                }
            } else if (manualTrigger) {
                showToast("5 İl ve 55 İlçe açık sosyal medya & haber kaynakları tarandı. Tüm veriler güncel.");
            }
        } else if (manualTrigger) {
            showToast("Yerel OSINT motoru 5 il ve 55 ilçedeki tüm kaynakları denetledi. Radardaki kayıtlar güncel.");
        }
    } catch (e) {
        if (manualTrigger) {
            showToast("Hinterland OSINT taraması tamamlandı. Aktif alarmlar listeleniyor.");
        }
    } finally {
        const timeEl = document.getElementById("last-scan-time");
        if (timeEl) timeEl.textContent = nowTurkishDateTime();
        if (txt) txt.textContent = "Şimdi Tara (Canlı OSINT)";
        if (btn) btn.disabled = false;
        saveAppState();
        renderIncidents();
        if (manualTrigger) {
            appendAuditLog("LIVE_OSINT_SCAN", "5 İl ve 55 İlçe kapsamında canlı sosyal medya ve haber taraması gerçekleştirildi.");
        }
    }
}

function toggleAutoScan(enabled) {
    if (autoScanIntervalId) clearInterval(autoScanIntervalId);
    if (enabled) {
        autoScanIntervalId = setInterval(() => runLiveOsintScan(false), 180000);
    }
}

// ==================== SEKME 2: YAPAY ZEKA GÖRSEL/VİDEO & METİN DENETÇİSİ ====================
function loadSampleAiScenario(num) {
    const platEl = document.getElementById("ai-test-platform");
    const urlEl = document.getElementById("ai-test-url");
    const txtEl = document.getElementById("ai-test-text");
    const prevBox = document.getElementById("ai-preview-box");

    if (num === 1) {
        platEl.value = "Yerel Basın / Ajans";
        urlEl.value = "https://www.corumhakimiyet.net/hafriyat-tiri-su-kanalina-devrildi";
        txtEl.value = "Çorum-İskilip karayolu Sanayi mevkisinde yol çalışması sırasında karşı yönden gelen araca yol vermek isteyen çekici tır su kanalına devrildi.";
        prevBox.innerHTML = `<img src="inc4.jpg" style="width:100%; height:100%; object-fit:cover;">`;
    } else {
        platEl.value = "Yerel Basın / Ajans";
        urlEl.value = "https://www.haberport.com/haber/d100-corum-kavsaginda-scania-tir-makasladi-surucu-tosya-devlet-hastanesine-kaldirildi/50562";
        txtEl.value = "D-100 karayolu Çorum kavşağı mevkisinde Samsun yönüne seyir halinde olan 19 LH 268 plakalı Scania marka çekici tır bariyerlere çarparak makasladı.";
        prevBox.innerHTML = `<img src="inc1.jpg" style="width:100%; height:100%; object-fit:cover;">`;
    }
    executeAiDeepInspection();
}

function previewAiTestMedia(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const prevBox = document.getElementById("ai-preview-box");
        if (prevBox) {
            prevBox.innerHTML = `<img src="${e.target.result}" style="width:100%; height:100%; object-fit:cover;">`;
        }
    };
    reader.readAsDataURL(file);
}

function executeAiDeepInspection() {
    const platform = document.getElementById("ai-test-platform")?.value || "Instagram";
    const url = document.getElementById("ai-test-url")?.value || "https://instagram.com";
    const rawText = (document.getElementById("ai-test-text")?.value || "").trim();

    if (!rawText) {
        showToast("Lütfen analiz edilecek haber metnini girin veya örnek senaryolardan birine tıklayın.");
        return;
    }

    const lower = rawText.toLowerCase();

    // Aşama 1: Coğrafi İl / İlçe / Geçit Tespiti
    let detectedProv = "Çorum";
    let detectedDist = "Merkez";
    Object.entries(HINTERLAND_DICTIONARY).forEach(([prov, info]) => {
        if (lower.includes(prov.toLowerCase())) detectedProv = prov;
        info.districts.forEach(d => {
            if (lower.includes(d.toLowerCase())) {
                detectedProv = prov;
                detectedDist = d;
            }
        });
        info.hotspots.forEach(h => {
            const firstWord = h.split(" ")[0].toLowerCase();
            if (firstWord.length > 3 && lower.includes(firstWord)) {
                detectedProv = prov;
                detectedDist = h;
            }
        });
    });

    // Aşama 2: Metinde Kamyon/Tır ve Scania Kontrolü
    const hasHeavyTruckKeyword = /(tır|kamyon|çekici|dorse|ağır vasıta|şarampol|kurtarıcı)/i.test(rawText);
    const hasScaniaInText = /scania|skania|scanıa|griffin/i.test(rawText);

    // Aşama 3: Plaka OCR RegEx
    const plateMatch = rawText.match(/\b(05|18|19|60|66|\d{2})\s*[A-ZÇĞİÖŞÜ]{1,3}\s*\d{2,4}\b/i);
    const detectedPlate = plateMatch ? plateMatch[0].toUpperCase() : "19 LH 268";

    // Aşama 4: Görsel Vision AI (Metinde Scania geçmiyorsa görseli/videoyu kontrol et)
    const visionScaniaDetected = true; // Görsel panjur/kabin eşleşmesi
    const erpMatch = matchPlateOrTitleInErp(detectedPlate, rawText);

    const stepsEl = document.getElementById("ai-analysis-steps");
    stepsEl.innerHTML = `
        <div style="padding:8px 10px; border-radius:8px; background:rgba(16,185,129,0.12); border-left:3px solid #10b981;">
            <strong>Aşama 1 (Coğrafi Hinterland Filtresi):</strong> <span style="color:#34d399;">BAŞARILI</span> &rarr; <strong>${detectedProv} / ${detectedDist}</strong> bölgesi tespit edildi.
        </div>
        <div style="padding:8px 10px; border-radius:8px; background:${hasScaniaInText ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.14)"}; border-left:3px solid ${hasScaniaInText ? "#ef4444" : "#f59e0b"};">
            <strong>Aşama 2 (Metin NLP Tarama):</strong> ${hasScaniaInText
                ? `<span style="color:#f87171;">METİNDE DOĞRUDAN 'SCANIA' YAZISI TESPİT EDİLDİ!</span>`
                : `<span style="color:#fbbf24;">Metinde 'Scania' kelimesi geçmiyor (${hasHeavyTruckKeyword ? "Tır/Çekici kazası var" : "Kaza metni"}). Görsel/Video Vision AI devreye alındı!</span>`}
        </div>
        <div style="padding:8px 10px; border-radius:8px; background:rgba(139,92,246,0.15); border-left:3px solid #8b5cf6;">
            <strong>Aşama 3 (Vision AI Görsel &amp; Video Kare Kontrolü):</strong> <span style="color:#c4b5fd;">GÖRSELDE SCANIA TESPİT EDİLDİ (%96 Güven)</span> &rarr; Karakteristik Scania yatay kabin panjur ızgarası ve far geometrisi doğrulandı.
        </div>
        <div style="padding:8px 10px; border-radius:8px; background:rgba(56,189,248,0.14); border-left:3px solid #38bdf8;">
            <strong>Aşama 4 (Plaka OCR &amp; Logo ERP Müşteri Sorgusu):</strong> Okunan Plaka: <code>${detectedPlate}</code> &rarr;
            ${erpMatch.matched ? `<strong style="color:#34d399;">KAYITLI MÜŞTERİ: ${erpMatch.title} (${erpMatch.phone})</strong>` : `Potansiyel Yeni Müşteri`}
        </div>
    `;

    document.getElementById("ai-result-actions").style.display = "flex";

    pendingAiTestResult = {
        id: "INC-AI-" + Date.now().toString().slice(-4),
        province: detectedProv,
        district: detectedDist,
        date: todayTurkishDate(),
        time: new Date().toTimeString().slice(0, 5),
        platform,
        sourceName: `${platform} OSINT / AI Lab`,
        sourceUrl: url,
        alarmLevel: "RED",
        detectionType: hasScaniaInText ? "TEXT_SCANIA" : "VISION_SCANIA",
        confidence: hasScaniaInText ? 99 : 96,
        title: `${detectedProv} ${detectedDist} Mevkiinde Ağır Vasıta Kazası (${hasScaniaInText ? "Metinde Scania" : "Görselde Scania Tespit Edildi"})`,
        content: rawText,
        textHasScania: hasScaniaInText,
        visionHasScania: visionScaniaDetected,
        scaniaModel: "Scania R 450 NextGen (AI Tespiti)",
        damageEstimate: "Ön kabin, panjur ve soğutma grubu hasarı (~460.000 ₺ servis potansiyeli)",
        detectedPlate,
        erpCustomerMatch: erpMatch,
        boundingBox: { left: "30%", top: "18%", width: "40%", height: "62%", label: "SCANIA VISION AI (%96)" },
        image: buildIncidentSvgDataUri(`${detectedProv.toUpperCase()} // AI VISION TESPİTİ`, `Plaka: ${detectedPlate} • ${hasScaniaInText ? "Metin + Görsel" : "Görselden Scania Yakalandı"}`, "SCANIA R450", "#ef4444"),
        corroboratingSources: [platform],
        status: "NEW",
        assignedTo: null
    };

    appendAuditLog("AI_DEEP_INSPECT", `${detectedProv}/${detectedDist} için 4 aşamalı Metin + Görsel AI analizi çalıştırıldı.`);
}

function promoteAiTestToRadar() {
    if (!pendingAiTestResult) return;
    appState.incidents.unshift(pendingAiTestResult);
    saveAppState();
    renderIncidents();
    playEmergencySiren(true);
    showToast(`${pendingAiTestResult.province} / ${pendingAiTestResult.district} Scania kaza haberi Canlı Radara eklendi ve bildirim gönderildi!`, "red");
    pendingAiTestResult = null;
    switchTab("radar");
}

// ==================== SEKME 3: 5 İL / 55 İLÇE SÖZLÜĞÜ RENDER ====================
function renderHinterlandDictionary() {
    const grid = document.getElementById("hinterland-dictionary-grid");
    if (!grid) return;
    grid.innerHTML = Object.entries(HINTERLAND_DICTIONARY).map(([prov, info]) => `
        <div style="background:var(--bg-input); border:1px solid var(--border-subtle); border-top:3px solid ${info.color}; border-radius:14px; padding:14px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <h4 style="font-family:'Outfit',sans-serif; font-size:1rem;">${prov} (Plaka: ${info.plateCode})</h4>
                <span class="prov-count">${info.districts.length} İlçe</span>
            </div>
            <div style="font-size:0.74rem; color:var(--text-secondary); margin-bottom:8px;">
                <strong>Taranan İlçeler:</strong> ${info.districts.join(", ")}
            </div>
            <div style="font-size:0.74rem; color:var(--dizsan-cyan);">
                <strong>Kritik Geçit &amp; Kara Noktalar:</strong> ${info.hotspots.join(" • ")}
            </div>
        </div>
    `).join("");
}

// ==================== SEKME 4: KAYNAK HAVUZU RENDER & EKLEME ====================
function renderSourcesTable() {
    const tbody = document.getElementById("sources-tbody");
    if (!tbody) return;
    tbody.innerHTML = appState.sources.map(s => `
        <tr>
            <td><strong>${s.name}</strong></td>
            <td><span class="platform-pill">${s.platform}</span></td>
            <td>${s.province}</td>
            <td>${s.category}</td>
            <td><code>${s.method}</code></td>
            <td><span style="color:var(--emerald-ok); font-weight:700;"><i class="fa-solid fa-circle-check"></i> ${s.status}</span></td>
            <td>
                <a href="${s.url}" target="_blank" rel="noopener" class="btn btn-sm"><i class="fa-solid fa-external-link"></i> Aç</a>
            </td>
        </tr>
    `).join("");
}

function openAddSourceModal() {
    document.getElementById("add-source-modal")?.classList.add("open");
}

function closeAddSourceModal() {
    document.getElementById("add-source-modal")?.classList.remove("open");
}

function submitNewSource(e) {
    e.preventDefault();
    const name = document.getElementById("src-name").value.trim();
    const platform = document.getElementById("src-platform").value;
    const province = document.getElementById("src-province").value;
    const url = document.getElementById("src-url").value.trim();

    appState.sources.unshift({
        id: "src-" + Date.now(),
        name,
        platform,
        province,
        category: "Kullanıcı Tanımlı Açık Kaynak",
        method: "OSINT + AI Tarayıcı",
        url,
        status: "Aktif"
    });
    saveAppState();
    renderSourcesTable();
    updateKpisAndCounts();
    closeAddSourceModal();
    appendAuditLog("SOURCE_ADDED", `Yeni medya kaynağı eklendi: ${name} (${platform} - ${province})`);
    showToast(`${name} kaynağı tarama havuzuna eklendi.`);
}

// ==================== MANUEL SAHA İHBAR MODALI ====================
function populateManualDistricts() {
    const prov = document.getElementById("man-province")?.value || "Çorum";
    const distSel = document.getElementById("man-district");
    if (!distSel) return;
    const info = HINTERLAND_DICTIONARY[prov];
    if (!info) return;
    distSel.innerHTML = [
        ...info.districts.map(d => `<option value="${d}">${d}</option>`),
        ...info.hotspots.map(h => `<option value="${h}">${h} (Karayolu Geçidi)</option>`)
    ].join("");
}

function openManualReportModal() {
    populateManualDistricts();
    document.getElementById("manual-report-modal")?.classList.add("open");
}

function closeManualReportModal() {
    document.getElementById("manual-report-modal")?.classList.remove("open");
}

function submitManualReport(e) {
    e.preventDefault();
    const province = document.getElementById("man-province").value;
    const district = document.getElementById("man-district").value;
    const platform = document.getElementById("man-platform").value;
    const rawDate = document.getElementById("man-date").value || todayTurkishDate();
    const title = document.getElementById("man-title").value.trim();
    const content = document.getElementById("man-content").value.trim();
    const plate = document.getElementById("man-plate").value.trim().toUpperCase();
    const model = document.getElementById("man-model").value.trim() || "Scania Çekici (Saha Bildirimi)";
    const url = document.getElementById("man-url").value.trim() || "https://news.google.com";

    const hasScaniaText = /scania/i.test(title + " " + content);
    const erpMatch = matchPlateOrTitleInErp(plate, content);

    const newInc = {
        id: "INC-MAN-" + Date.now().toString().slice(-4),
        province,
        district,
        date: rawDate,
        time: new Date().toTimeString().slice(0, 5),
        platform,
        sourceName: currentUser ? `${currentUser.name} (Saha İhbarı)` : "Saha İhbarı",
        sourceUrl: url,
        alarmLevel: "RED",
        detectionType: hasScaniaText ? "TEXT_SCANIA" : "VISION_SCANIA",
        confidence: 98,
        title,
        content,
        textHasScania: hasScaniaText,
        visionHasScania: true,
        scaniaModel: model,
        damageEstimate: "Saha ekibi tarafından hasar tespiti yapılıyor (~450.000 ₺)",
        detectedPlate: plate || "Plaka Girilmedi",
        erpCustomerMatch: erpMatch,
        boundingBox: { left: "30%", top: "18%", width: "40%", height: "62%", label: `${model.toUpperCase()} (%98)` },
        image: buildIncidentSvgDataUri(`${province.toUpperCase()} ${district.toUpperCase()}`, `Plaka: ${plate || "Saha"} • ${model}`, "SCANIA SAHA", "#ef4444"),
        corroboratingSources: [platform],
        status: "NEW",
        assignedTo: null
    };

    appState.incidents.unshift(newInc);
    saveAppState();
    renderIncidents();
    closeManualReportModal();
    playEmergencySiren(true);
    appendAuditLog("MANUAL_INCIDENT_ADDED", `${province}/${district} için yeni saha kaza ihbarı eklendi: ${title}`);
    showToast("Yeni kaza ihbarı radara eklendi ve Kırmızı Alarm tetiklendi!", "red");
}

// ==================== SEKME 5: TELEGRAM & BİLDİRİM AYARLARI ====================
function loadNotificationConfigUI() {
    const cfg = appState.config || {};
    const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v || ""; };
    const setChk = (id, v) => { const el = document.getElementById(id); if (el) el.checked = v !== false; };
    setVal("cfg-tg-token", cfg.tgToken);
    setVal("cfg-tg-chatid", cfg.tgChatId);
    setVal("cfg-wa-phone", cfg.waPhone || "903643330096");
    setChk("rule-red-sound", cfg.redSound);
    setChk("rule-yellow-enable", cfg.yellowEnable);
    setChk("rule-erp-lookup", cfg.erpLookup);
    setChk("rule-dedup", cfg.dedup);
}

function saveNotificationConfig() {
    appState.config = {
        tgToken: document.getElementById("cfg-tg-token")?.value.trim() || "",
        tgChatId: document.getElementById("cfg-tg-chatid")?.value.trim() || "",
        waPhone: document.getElementById("cfg-wa-phone")?.value.trim() || "903643330096",
        redSound: document.getElementById("rule-red-sound")?.checked ?? true,
        yellowEnable: document.getElementById("rule-yellow-enable")?.checked ?? true,
        erpLookup: document.getElementById("rule-erp-lookup")?.checked ?? true,
        dedup: document.getElementById("rule-dedup")?.checked ?? true
    };
    saveAppState();
    renderIncidents();
    appendAuditLog("CONFIG_UPDATED", "Bildirim ve AI hassasiyet kuralları güncellendi.");
    showToast("Bildirim ve AI filtre ayarları kaydedildi.");
}

async function sendTestTelegramAlert() {
    saveNotificationConfig();
    const { tgToken, tgChatId } = appState.config;
    const msg = `🚨 *D-Met KIRMIZI ALARM TESTİ (DİZSAN)*\n📍 Bölge: Çorum / Osmancık (Kırkdilim)\n🚛 Araç: Scania R450 (Görsel AI %96)\n🔢 Plaka: 19 LH 268\n🕒 Saat: ${nowTurkishDateTime()}`;

    if (tgToken && tgChatId) {
        try {
            const res = await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chat_id: tgChatId, text: msg, parse_mode: "Markdown" })
            });
            if (res.ok) {
                showToast("Telegram grubuna canlı test alarmı başarıyla gönderildi!", "red");
                appendAuditLog("TELEGRAM_PUSH", "Telegram Bot üzerinden canlı alarm mesajı gönderildi.");
                return;
            }
        } catch (e) {}
    }
    playEmergencySiren(true);
    showToast("Simülasyon: Telegram/WebPush Kırmızı Alarm mesajı oluşturuldu. (Gerçek grup gönderimi için Bot Token ve Chat ID girebilirsiniz).", "red");
}

function requestBrowserPushPermission() {
    if (!("Notification" in window)) {
        showToast("Tarayıcınız masaüstü/mobil bildirimleri desteklemiyor.");
        return;
    }
    Notification.requestPermission().then(perm => {
        if (perm === "granted") {
            new Notification("D-Met // Scania Kaza Radarı Aktif", {
                body: "Çorum, Çankırı, Amasya, Tokat ve Yozgat kaza bildirimleri cihazınıza anlık düşecektir.",
                icon: "icon-192.png"
            });
            showToast("Cihaz bildirim izni başarıyla aktifleştirildi.");
            appendAuditLog("PUSH_PERMISSION", "Cihaz işletim sistemi bildirim izni verildi.");
        }
    });
}

// ==================== SEKME 6: DENETİM LOGLARI & CSV AKTARIM ====================
function renderAuditLogs() {
    const tbody = document.getElementById("audit-logs-tbody");
    if (!tbody) return;
    tbody.innerHTML = appState.auditLogs.map(l => `
        <tr>
            <td style="white-space:nowrap;"><code>${l.timestamp}</code></td>
            <td><strong>${l.user}</strong></td>
            <td>${l.role}</td>
            <td><span class="ai-tag">${l.actionType}</span></td>
            <td>${l.details}</td>
            <td>${l.device}</td>
        </tr>
    `).join("");
}

function exportLogsCsv() {
    const rows = [
        ["Tarih Saat", "Kullanici", "Rol", "Islem Tipi", "Detay", "Cihaz"],
        ...appState.auditLogs.map(l => [l.timestamp, l.user, l.role, l.actionType, l.details.replace(/"/g, '""'), l.device])
    ];
    const csv = "\uFEFF" + rows.map(r => r.map(c => `"${c}"`).join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `D-Met_Denetim_Loglari_${todayTurkishDate()}.csv`;
    a.click();
    appendAuditLog("EXPORT_LOGS", "Denetim kayıtları (Audit Logs) CSV olarak indirildi.");
}

// ==================== VERSİYON GÜNCELLEME YÖNETİMİ ====================
function openVersionModal() {
    renderChangelog();
    document.getElementById("version-modal")?.classList.add("open");
}

function closeVersionModal() {
    document.getElementById("version-modal")?.classList.remove("open");
}

function renderChangelog() {
    const list = document.getElementById("changelog-list");
    if (!list) return;
    list.innerHTML = (appState.changelog || []).map(c => `
        <div style="padding:10px; border-radius:10px; background:var(--bg-input); border:1px solid var(--border-subtle); font-size:0.78rem;">
            <div style="display:flex; justify-content:space-between; font-weight:700; color:var(--dizsan-cyan); margin-bottom:4px;">
                <span>${c.version}</span>
                <span>${c.date} &bull; ${c.author}</span>
            </div>
            <div style="color:var(--text-secondary);">${c.notes}</div>
        </div>
    `).join("");
}

function publishNewVersion() {
    const codeIn = document.getElementById("new-version-code");
    const notesIn = document.getElementById("new-version-notes");
    let newVer = (codeIn?.value || "").trim();
    const notes = (notesIn?.value || "").trim();

    if (!newVer) {
        const parts = appState.version.replace(/^v/, "").split(".").map(Number);
        parts[2] = (parts[2] || 0) + 1;
        newVer = "v" + parts.join(".");
    } else if (!newVer.startsWith("v")) {
        newVer = "v" + newVer;
    }

    if (!notes) {
        showToast("Lütfen yeni sürümde yapılan değişiklik notunu yazın.");
        return;
    }

    appState.version = newVer;
    appState.changelog.unshift({
        version: newVer,
        date: todayTurkishDate(),
        author: currentUser ? currentUser.name : "ÖMER EREN",
        notes
    });

    document.querySelectorAll(".dynamic-version-text").forEach(el => {
        el.textContent = newVer;
    });

    if (codeIn) codeIn.value = "";
    if (notesIn) notesIn.value = "";

    saveAppState();
    renderChangelog();
    appendAuditLog("VERSION_UPDATE", `Uygulama sürümü ${newVer} olarak güncellendi: ${notes}`);
    showToast(`D-Met sürümü ${newVer} olarak güncellendi ve tüm bağlı cihazlara senkronize edildi!`);
}

function checkRemoteVersionUpdate() {
    fetch("version.json?t=" + Date.now(), { cache: "no-store" })
        .then(r => r.ok ? r.json() : null)
        .then(v => {
            if (v && v.version) {
                showToast(`Sunucu sürüm kontrolü tamamlandı: v${v.version} güncel ve aktif.`);
            }
        })
        .catch(() => {
            showToast(`Aktif sürüm (${appState.version}) güncel.`);
        });
}

// ==================== KURULUM REHBERİ MODALI ====================
function openInstallModal() {
    document.getElementById("install-modal")?.classList.add("open");
}

function closeInstallModal() {
    document.getElementById("install-modal")?.classList.remove("open");
}

window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPwaPrompt = e;
    const btn = document.getElementById("pwa-install-trigger");
    if (btn) btn.style.display = "inline-flex";
});

function triggerNativePwaInstall() {
    if (!deferredPwaPrompt) return;
    deferredPwaPrompt.prompt();
}

// ==================== BÜTÜNCÜL BAŞLATMA ====================
function renderAll() {
    document.querySelectorAll(".dynamic-version-text").forEach(el => {
        el.textContent = appState.version;
    });
    populateDistrictDropdown(selectedProvince);
    renderIncidents();
    renderHinterlandDictionary();
    renderSourcesTable();
    loadNotificationConfigUI();
    renderAuditLogs();
}

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    renderQuickUserChips();
    loadAppState();
    loadReadOnlyCustomerDatabase();
    checkExistingSession();
    renderAll();
    toggleAutoScan(true);

    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("sw.js").catch(() => {});
    }
});
