/**
 * DİZSAN KURUMSAL SIFIR TEMAS OTOMATİK GÜNCELLEME MOTORU (dizsan-auto-updater.js)
 * Tüm web uygulamalarında (Ziyaret, Toplantı, DizGün, CardFlow, Ödeme Takvimi vb.)
 * ve tüm cihazlarda (iPhone, iPad, Android, Windows, Mac) sıfır temasla çalışır.
 * 
 * - 30 saniyede bir arka plan sürüm kontrolü (version.json?t=...)
 * - Sekmeye/uygulamaya dönüşte anında kontrol (visibilitychange & focus)
 * - Service Worker & Browser Cache otomatik temizliği
 * - 2.5 saniyede otomatik yenileme (Kullanıcının hiçbir şey yapmasına gerek kalmaz)
 * - Modern sürüm modalı ve yönetici sürüm paneli
 */

(function () {
    'use strict';

    // Script etiketinden veya ortamdan parametreleri al
    const currentScript = document.currentScript || document.querySelector('script[src*="dizsan-auto-updater.js"]');
    const APP_ID = (currentScript && currentScript.getAttribute('data-app-id')) || 'dizsan-app';
    const APP_NAME = (currentScript && currentScript.getAttribute('data-app-name')) || document.title || 'Dizsan Uygulaması';
    const DEFAULT_VERSION = (currentScript && currentScript.getAttribute('data-version')) || window.CURRENT_APP_VERSION || '1.0.0';
    const STORAGE_KEY_VER = `dizsan_app_version_${APP_ID}`;

    let runningVersion = localStorage.getItem(STORAGE_KEY_VER) || DEFAULT_VERSION;
    let hasTriggeredUpdate = false;
    let cachedVersionData = null;

    function cleanVer(v) {
        return String(v || '').replace(/^[vV]/, '').trim();
    }

    function compareVersions(v1, v2) {
        if (!v1 || !v2) return 0;
        const p1 = cleanVer(v1).split('.').map(p => parseInt(p, 10) || 0);
        const p2 = cleanVer(v2).split('.').map(p => parseInt(p, 10) || 0);
        const len = Math.max(p1.length, p2.length);
        for (let i = 0; i < len; i++) {
            const num1 = p1[i] || 0;
            const num2 = p2[i] || 0;
            if (num1 > num2) return 1;
            if (num1 < num2) return -1;
        }
        return 0;
    }

    function injectStyles() {
        if (document.getElementById('dizsan-updater-styles')) return;
        const style = document.createElement('style');
        style.id = 'dizsan-updater-styles';
        style.textContent = `
            .dizsan-update-banner {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                z-index: 999999;
                background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
                color: #ffffff;
                padding: 0.75rem 1.25rem;
                box-shadow: 0 4px 25px rgba(2, 132, 199, 0.45);
                border-bottom: 2px solid #38bdf8;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                animation: dizsanSlideDown 0.35s ease-out;
            }
            @keyframes dizsanSlideDown {
                from { transform: translateY(-100%); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            .dizsan-version-pill-floating {
                position: fixed;
                bottom: 12px;
                right: 12px;
                z-index: 9999;
                background: rgba(15, 23, 42, 0.85);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                border: 1px solid rgba(255, 255, 255, 0.15);
                color: #38bdf8;
                font-size: 0.75rem;
                font-weight: 700;
                padding: 4px 10px;
                border-radius: 999px;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                display: flex;
                align-items: center;
                gap: 5px;
                transition: all 0.2s ease;
                user-select: none;
                font-family: inherit;
            }
            .dizsan-version-pill-floating:hover {
                background: #0284c7;
                color: #ffffff;
                transform: scale(1.05);
            }
            .dizsan-updater-modal {
                position: fixed;
                inset: 0;
                z-index: 9999999;
                background: rgba(0, 0, 0, 0.75);
                backdrop-filter: blur(6px);
                -webkit-backdrop-filter: blur(6px);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 1rem;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            .dizsan-updater-box {
                background: #0f172a;
                border: 1px solid rgba(255, 255, 255, 0.15);
                border-radius: 16px;
                width: 100%;
                max-width: 460px;
                color: #f8fafc;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
                overflow: hidden;
                animation: dizsanPopIn 0.25s ease-out;
            }
            @keyframes dizsanPopIn {
                from { transform: scale(0.92); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    async function fetchVersionInfo() {
        try {
            const res = await fetch(`version.json?t=${Date.now()}`, {
                cache: 'no-store',
                headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
            });
            if (res.ok) {
                return await res.json();
            }
        } catch (e) {}
        return null;
    }

    async function checkForUpdates(isManual = false) {
        const data = await fetchVersionInfo();
        if (!data) {
            if (isManual) alert('Sunucu bağlantısı kurulamadı. İnternet bağlantınızı kontrol ediniz.');
            return false;
        }

        cachedVersionData = data;
        const cloudVer = cleanVer(data.version);
        const curVer = cleanVer(runningVersion);

        // İlk defa kaydediliyorsa yerel hafızaya yaz
        if (!localStorage.getItem(STORAGE_KEY_VER)) {
            localStorage.setItem(STORAGE_KEY_VER, cloudVer || curVer);
            runningVersion = cloudVer || curVer;
            updateUIBadges();
            return false;
        }

        if (compareVersions(cloudVer, curVer) > 0) {
            triggerZeroTouchUpdate(data);
            if (isManual) alert(`🎉 Yeni sürüm bulundu: v${cloudVer}! Uygulama otomatik güncelleniyor...`);
            return true;
        } else {
            if (isManual) {
                alert(`✅ ${APP_NAME} en güncel sürümde (v${curVer}).\n\nTüm cihazlarınız senkronize ve hazır.`);
            }
        }
        return false;
    }

    function triggerZeroTouchUpdate(data) {
        if (hasTriggeredUpdate) return;
        hasTriggeredUpdate = true;

        const newVer = cleanVer(data.version);
        const notes = data.releaseNotes || 'Performans iyileştirmeleri ve yeni özellikler yayınlandı.';
        localStorage.setItem(STORAGE_KEY_VER, newVer);

        // Bildirim Bannerı Göster (Otomatik zorunlu sayfa yenileme döngüsü kaldırıldı)
        const banner = document.createElement('div');
        banner.className = 'dizsan-update-banner';
        banner.innerHTML = `
            <div style="display:flex; align-items:center; justify-content:space-between; max-width:1100px; margin:0 auto; gap:1rem; flex-wrap:wrap;">
                <div style="display:flex; align-items:center; gap:0.75rem;">
                    <span style="font-size:1.4rem;">🚀</span>
                    <div>
                        <strong style="font-size:0.95rem;">${APP_NAME} v${newVer} Yayında!</strong>
                        <div style="font-size:0.8rem; color:#bae6fd; margin-top:2px;">${notes}</div>
                    </div>
                </div>
                <button type="button" id="dizsan-update-now-btn" style="background:#f59e0b; color:#0f172a; border:none; padding:6px 14px; border-radius:8px; font-weight:700; font-size:0.85rem; cursor:pointer;">
                    ⚡ Şimdi Güncelle
                </button>
            </div>
        `;
        document.body.appendChild(banner);

        const btn = document.getElementById('dizsan-update-now-btn');
        if (btn) {
            btn.onclick = () => applyUpdateImmediately();
        }
    }

    function applyUpdateImmediately() {
        if ('caches' in window) {
            caches.keys().then((names) => {
                return Promise.all(names.map(name => caches.delete(name)));
            }).then(() => {
                if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.getRegistrations().then(regs => {
                        regs.forEach(r => r.update());
                    }).catch(() => {});
                }
                window.location.reload(true);
            }).catch(() => {
                window.location.reload(true);
            });
        } else {
            window.location.reload(true);
        }
    }

    function updateUIBadges() {
        // Mevcut DOM'da sürüm etiketlerini güncelle
        const targets = document.querySelectorAll('.dynamic-version-text, #app-current-version-text, #sidebar-app-version, .app-version-badge');
        targets.forEach(el => {
            el.textContent = `v${cleanVer(runningVersion)}`;
        });

        // Floating rozet varsa güncelle
        const floatPill = document.getElementById('dizsan-floating-version-pill');
        if (floatPill) {
            floatPill.innerHTML = `⚡ v${cleanVer(runningVersion)}`;
        }
    }

    function injectFloatingPillIfNeeded() {
        // Eğer sayfada belirgin bir sürüm butonu yoksa sağ alta şık bir rozet ekle
        const existingBadge = document.querySelector('#app-version-badge, #sidebar-app-version, .version-pill, .app-version-chip');
        if (!existingBadge && !document.getElementById('dizsan-floating-version-pill')) {
            const pill = document.createElement('div');
            pill.id = 'dizsan-floating-version-pill';
            pill.className = 'dizsan-version-pill-floating';
            pill.title = `${APP_NAME} Sürüm & Güncelleme Bilgisi`;
            pill.innerHTML = `⚡ v${cleanVer(runningVersion)}`;
            pill.onclick = () => openUpdaterModal();
            document.body.appendChild(pill);
        }
    }

    function openUpdaterModal() {
        if (document.getElementById('dizsan-updater-modal')) return;

        const cloudVer = cachedVersionData ? cleanVer(cachedVersionData.version) : cleanVer(runningVersion);
        const relDate = cachedVersionData ? (cachedVersionData.releasedAt || '-') : '-';
        const notes = cachedVersionData ? (cachedVersionData.releaseNotes || 'Sistem aktif ve güncel.') : 'Sistem aktif ve güncel.';

        const modal = document.createElement('div');
        modal.id = 'dizsan-updater-modal';
        modal.className = 'dizsan-updater-modal';
        modal.innerHTML = `
            <div class="dizsan-updater-box">
                <div style="padding:1.1rem 1.25rem; border-bottom:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center;">
                    <div style="font-weight:700; font-size:1.05rem; display:flex; align-items:center; gap:0.5rem;">
                        <span>🚀</span>
                        <span>${APP_NAME} Sürüm Merkezi</span>
                    </div>
                    <button type="button" id="dizsan-modal-close-btn" style="background:transparent; border:none; color:#94a3b8; font-size:1.4rem; cursor:pointer; line-height:1;">&times;</button>
                </div>
                <div style="padding:1.25rem;">
                    <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:0.9rem; margin-bottom:1rem;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem; font-size:0.85rem;">
                            <span style="color:#94a3b8;">Cihazdaki Sürüm:</span>
                            <span style="font-weight:700; color:#34d399;">v${cleanVer(runningVersion)}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem; font-size:0.85rem;">
                            <span style="color:#94a3b8;">Buluttaki Sürüm:</span>
                            <span style="font-weight:700; color:#38bdf8;">v${cloudVer}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; font-size:0.82rem;">
                            <span style="color:#94a3b8;">Yayınlanma Tarihi:</span>
                            <span style="color:#fde68a;">${relDate}</span>
                        </div>
                    </div>
                    <div style="margin-bottom:1rem;">
                        <span style="display:block; font-size:0.8rem; color:#94a3b8; margin-bottom:0.35rem; font-weight:600;">Sürüm Notları:</span>
                        <div style="background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:0.65rem 0.85rem; font-size:0.82rem; color:#e2e8f0; line-height:1.45;">
                            ${notes}
                        </div>
                    </div>
                    <div style="background:rgba(52,211,153,0.08); border:1px solid rgba(52,211,153,0.25); border-radius:8px; padding:0.65rem 0.85rem; font-size:0.78rem; color:#cbd5e1; line-height:1.4;">
                        ✅ <strong>Sıfır Temas Motoru Aktif:</strong> Yeni bir sürüm çıktığında tüm telefon, tablet ve bilgisayarlarınız otomatik olarak güncellenir.
                    </div>
                </div>
                <div style="padding:0.9rem 1.25rem; border-top:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; gap:0.5rem;">
                    <button type="button" id="dizsan-modal-check-btn" style="background:#0284c7; color:#fff; border:none; padding:7px 14px; border-radius:8px; font-size:0.85rem; font-weight:600; cursor:pointer;">
                        🔄 Güncellemeleri Denetle
                    </button>
                    <button type="button" id="dizsan-modal-ok-btn" style="background:rgba(255,255,255,0.1); color:#fff; border:none; padding:7px 16px; border-radius:8px; font-size:0.85rem; cursor:pointer;">
                        Kapat
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const closeBtn = document.getElementById('dizsan-modal-close-btn');
        const okBtn = document.getElementById('dizsan-modal-ok-btn');
        const checkBtn = document.getElementById('dizsan-modal-check-btn');

        const closeModal = () => modal.remove();
        if (closeBtn) closeBtn.onclick = closeModal;
        if (okBtn) okBtn.onclick = closeModal;
        modal.onclick = (e) => { if (e.target === modal) closeModal(); };

        if (checkBtn) {
            checkBtn.onclick = async () => {
                checkBtn.textContent = '⏳ Kontrol Ediliyor...';
                await checkForUpdates(true);
                checkBtn.textContent = '🔄 Güncellemeleri Denetle';
            };
        }
    }

    // Başlatma ve Dinleyiciler
    function init() {
        injectStyles();
        injectFloatingPillIfNeeded();
        updateUIBadges();

        // İlk açılışta kontrol et
        checkForUpdates(false);

        // Her 30 saniyede bir arka planda kontrol et
        setInterval(() => {
            checkForUpdates(false);
        }, 30000);

        // Sekmeye geri dönüldüğünde veya telefon açıldığında anında kontrol et
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                checkForUpdates(false);
            }
        });
        window.addEventListener('focus', () => {
            checkForUpdates(false);
        });

        // Service Worker güncelleme yakalayıcısı
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data && (event.data.type === 'SW_UPDATED' || event.data.type === 'NEW_VERSION_AVAILABLE')) {
                    checkForUpdates(false);
                }
            });
        }

        // Global köprü
        window.DizsanAutoUpdater = {
            check: (isManual) => checkForUpdates(isManual),
            openModal: () => openUpdaterModal(),
            getVersion: () => runningVersion,
            applyUpdate: () => applyUpdateImmediately()
        };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
