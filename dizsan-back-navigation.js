/**
 * ============================================================================
 * DİZSAN EVRENSEL GERİ TUŞU & ÇIKIŞ ÖNLEME MOTORU (dizsan-back-navigation.js)
 * Antigravity AI - Dizsan Ekosistemi v1.0.0
 * 
 * Özellikler:
 * 1. Telefon donanım / kaydırma geri tuşu (Android Back / iOS swipe) basıldığında
 *    uygulamadan komple çıkmayı %100 engeller.
 * 2. Açık modal (müşteri detayı, ziyaret ekle, şifre vb.) varsa önce modalı kapatır.
 * 3. Açık mobil yan menü/sidebar varsa önce menüyü kapatır.
 * 4. Alt sekmedeyse (Müşteriler, Saha, Arşiv vb.) ana sekmeye (Kokpit/Dashboard) döner.
 * 5. Ana ekrandayken çıkmak için 2 saniye içinde çift basma (Double-Back) ister.
 * 6. Tüm uygulamaların üst çubuğuna (navbar) ve tüm modal başlıklarına şık, 
 *    dokunmatik dostu "← Geri" butonu ekler.
 * ============================================================================
 */

(function () {
    'use strict';

    if (window.DizsanBackNav) {
        return; // Zaten yüklü
    }

    let lastBackPressTime = 0;
    let isHandlingPopState = false;

    // 1. Gerekli CSS Stillerini Dinamik Olarak Ekle
    function injectStyles() {
        if (document.getElementById('dizsan-back-nav-styles')) return;
        const style = document.createElement('style');
        style.id = 'dizsan-back-nav-styles';
        style.textContent = `
            /* Üst Çubuk Evrensel Geri Tuşu */
            .dizsan-global-back-btn {
                display: none;
                align-items: center;
                gap: 6px;
                background: rgba(255, 255, 255, 0.08);
                border: 1px solid rgba(255, 255, 255, 0.15);
                color: #ffffff;
                padding: 0.45rem 0.85rem;
                border-radius: 8px;
                font-size: 0.82rem;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.2s ease;
                margin-right: 0.5rem;
                flex-shrink: 0;
                -webkit-tap-highlight-color: transparent;
                user-select: none;
            }
            .dizsan-global-back-btn:hover {
                background: rgba(56, 189, 248, 0.2);
                border-color: rgba(56, 189, 248, 0.4);
                color: #38bdf8;
            }
            .dizsan-global-back-btn:active {
                transform: scale(0.92);
            }
            .dizsan-global-back-btn.visible {
                display: inline-flex !important;
            }

            /* Modal Başlığı İçi Geri Tuşu */
            .dizsan-modal-back-btn {
                display: inline-flex;
                align-items: center;
                gap: 5px;
                background: rgba(255, 255, 255, 0.06);
                border: 1px solid rgba(255, 255, 255, 0.15);
                color: #cbd5e1;
                padding: 0.35rem 0.7rem;
                border-radius: 7px;
                font-size: 0.78rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.15s ease;
                margin-right: 0.75rem;
                flex-shrink: 0;
            }
            .dizsan-modal-back-btn:hover {
                background: rgba(56, 189, 248, 0.15);
                color: #ffffff;
                border-color: rgba(56, 189, 248, 0.35);
            }
            .dizsan-modal-back-btn:active {
                transform: scale(0.92);
            }

            /* Çift Basma Bilgilendirme Toastı */
            #dizsan-back-toast {
                position: fixed;
                bottom: 85px;
                left: 50%;
                transform: translateX(-50%) translateY(30px);
                background: rgba(15, 23, 42, 0.95);
                border: 1px solid rgba(56, 189, 248, 0.35);
                color: #f8fafc;
                padding: 0.7rem 1.25rem;
                border-radius: 25px;
                font-size: 0.82rem;
                font-weight: 600;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.6);
                z-index: 100000;
                opacity: 0;
                pointer-events: none;
                transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                white-space: nowrap;
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
            }
            #dizsan-back-toast.show {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
        `;
        document.head.appendChild(style);
    }

    // 2. Çift Basış Toast Bildirimi
    function showBackToast(text) {
        let toast = document.getElementById('dizsan-back-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'dizsan-back-toast';
            document.body.appendChild(toast);
        }
        toast.innerHTML = `<i class="fa-solid fa-arrow-left" style="color:#38bdf8; margin-right:6px;"></i> ${text}`;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    }

    // 3. Açık Modal Tespiti
    function getActiveModal() {
        // Dizsan Ziyaret, Toplantı, vb. modal seçicileri
        const selectors = [
            '.modal-backdrop.open',
            '.modal-backdrop.active',
            '.modal.open',
            '.modal.active',
            '.modal-box.open',
            '.modal-box.active',
            '#customer-detail-modal.open',
            '#visit-modal.open',
            '#task-modal.open',
            '#customer-modal.open',
            '#version-modal.open',
            '#push-test-modal.open',
            '#install-guide-modal.open',
            '#change-password-modal.open',
            '#forgot-password-modal.open'
        ];

        for (const sel of selectors) {
            const el = document.querySelector(sel);
            if (el && isElementVisible(el)) return el;
        }

        // Genel display !== none olan modal-backdrop kontrolü
        const allBackdrops = document.querySelectorAll('.modal-backdrop, .modal, .modal-overlay');
        for (const m of allBackdrops) {
            if (isElementVisible(m)) {
                return m;
            }
        }
        return null;
    }

    function isElementVisible(el) {
        if (!el) return false;
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
    }

    // 4. Açık Modalı Kapatma
    function closeModal(modalEl) {
        if (!modalEl) return false;

        // Özel modal ID'leri ve kapatma fonksiyonları
        const id = modalEl.id;
        if (id === 'customer-detail-modal' && typeof window.closeCustomerDetailModal === 'function') {
            window.closeCustomerDetailModal();
            return true;
        }
        if (id === 'visit-modal' && typeof window.closeVisitModal === 'function') {
            window.closeVisitModal();
            return true;
        }
        if (id === 'task-modal' && typeof window.closeTaskModal === 'function') {
            window.closeTaskModal();
            return true;
        }
        if (id === 'customer-modal' && typeof window.closeCustomerModal === 'function') {
            window.closeCustomerModal();
            return true;
        }
        if (id === 'version-modal' && typeof window.closeVersionModal === 'function') {
            window.closeVersionModal();
            return true;
        }
        if (id === 'push-test-modal' && typeof window.closePushTestCenterModal === 'function') {
            window.closePushTestCenterModal();
            return true;
        }
        if (id === 'install-guide-modal' && typeof window.closeInstallGuideModal === 'function') {
            window.closeInstallGuideModal();
            return true;
        }
        if (id === 'change-password-modal' && typeof window.closeChangePasswordModal === 'function') {
            window.closeChangePasswordModal();
            return true;
        }
        if (id === 'forgot-password-modal' && typeof window.closeForgotPasswordModal === 'function') {
            window.closeForgotPasswordModal();
            return true;
        }

        // Genel kapatma: modal içindeki kapat butonuna tıkla
        const closeBtn = modalEl.querySelector('.modal-close, .close, [data-dismiss="modal"], button.btn-secondary');
        if (closeBtn && typeof closeBtn.click === 'function') {
            closeBtn.click();
            return true;
        }

        // Sınıfları kaldır
        modalEl.classList.remove('open', 'active');
        modalEl.style.display = 'none';
        return true;
    }

    // 5. Açık Mobil Yan Menü (Sidebar) Kontrolü
    function getActiveSidebar() {
        const sidebar = document.querySelector('.sidebar.mobile-open, .sidebar.active, .mobile-sidebar.open');
        return isElementVisible(sidebar) ? sidebar : null;
    }

    function closeSidebar(sidebarEl) {
        if (!sidebarEl) return false;
        if (typeof window.toggleMobileSidebar === 'function') {
            window.toggleMobileSidebar();
            return true;
        }
        if (typeof window.toggleSidebar === 'function') {
            window.toggleSidebar();
            return true;
        }
        sidebarEl.classList.remove('mobile-open', 'active', 'open');
        return true;
    }

    // 6. Mevcut Sekme / Sayfa Durumu
    function getActiveTabId() {
        const activeSection = document.querySelector('.tab-section.active, .tab-pane.active, .page-section.active');
        return activeSection ? activeSection.id : '';
    }

    function isHomeTab(tabId) {
        if (!tabId) return true;
        const homeIds = ['dashboard-tab', 'tab-dashboard', 'kokpit-tab', 'home-tab', 'main-tab', 'summary-tab'];
        return homeIds.includes(tabId);
    }

    // 7. Geri Tuşuna Basıldığında Çalışacak Ana Karar Motoru
    function handleBackNavigation() {
        // 1. Aşama: Açık bir modal var mı?
        const modal = getActiveModal();
        if (modal) {
            closeModal(modal);
            updateBackButtonVisibility();
            return true;
        }

        // 2. Aşama: Açık bir mobil yan menü var mı?
        const sidebar = getActiveSidebar();
        if (sidebar) {
            closeSidebar(sidebar);
            updateBackButtonVisibility();
            return true;
        }

        // 3. Aşama: Alt bir sekmede miyiz? (Dashboard haricinde bir yerdeysek Dashboard'a dön)
        const curTab = getActiveTabId();
        if (curTab && !isHomeTab(curTab)) {
            if (typeof window.switchTab === 'function') {
                window.switchTab('dashboard-tab');
            } else {
                const homeBtn = document.querySelector('[data-tab="dashboard-tab"], [onclick*="dashboard-tab"]');
                if (homeBtn) homeBtn.click();
            }
            updateBackButtonVisibility();
            return true;
        }

        // 4. Aşama: Ana ekrandayız ve açık hiçbir şey yok.
        // Kullanıcı komple çıkmak istiyor olabilir -> Çift basma kontrolü
        return false;
    }

    // 8. Uygulama İçi "← Geri" Butonuna Basıldığında
    function handleInAppBack() {
        const handled = handleBackNavigation();
        if (!handled) {
            showBackToast('Zaten ana ekrandasınız.');
        }
    }

    // 9. Donanım / Tarayıcı Popstate Dinleyicisi
    function initPopStateListener() {
        // Tarihçe tuzağı kur (History Guard)
        // Sayfa ilk yüklendiğinde bir guard state itilir
        try {
            history.replaceState({ dizsanRoot: true }, '', location.href);
            history.pushState({ dizsanGuard: true }, '', location.href);
        } catch (e) {}

        window.addEventListener('popstate', function (event) {
            if (isHandlingPopState) return;

            const handled = handleBackNavigation();
            if (handled) {
                // Geri işlemi bir modal/sekme kapattı -> Uygulamadan çıkışı engellemek için guard'ı hemen yenile!
                try {
                    history.pushState({ dizsanGuard: true }, '', location.href);
                } catch (e) {}
            } else {
                // Ana ekrandayız, hiçbir şey kapatılmadı
                const now = Date.now();
                if (now - lastBackPressTime < 2000) {
                    // 2 saniye içinde ikinci kez basıldı -> Tarayıcının çıkmasına izin ver
                    history.back();
                } else {
                    lastBackPressTime = now;
                    // Guard'ı yeniden itip çıkışı engelle ve bilgilendirme göster
                    try {
                        history.pushState({ dizsanGuard: true }, '', location.href);
                    } catch (e) {}
                    showBackToast('Çıkmak için tekrar basın');
                }
            }
        });
    }

    // 10. Üst Çubuktaki "← Geri" Butonunu Enjekte Et ve Durumunu Güncelle
    function injectTopNavbarBackButton() {
        const targetContainer = document.querySelector('.navbar-left, .topbar-left, .header-left');
        if (!targetContainer) return;

        let btn = document.getElementById('dizsan-global-back-btn');
        if (!btn) {
            btn = document.createElement('button');
            btn.type = 'button';
            btn.id = 'dizsan-global-back-btn';
            btn.className = 'dizsan-global-back-btn';
            btn.title = 'Geri Dön';
            btn.innerHTML = '<i class="fa-solid fa-arrow-left"></i> <span>Geri</span>';
            btn.onclick = handleInAppBack;

            // En başa ekle (Hamburger menü veya başlığın hemen soluna)
            targetContainer.insertBefore(btn, targetContainer.firstChild);
        }

        updateBackButtonVisibility();
    }

    // 11. Modal Başlıklarına "← Geri" Butonu Enjekte Et
    function injectModalBackButtons() {
        const headers = document.querySelectorAll('.modal-header');
        headers.forEach(hdr => {
            if (hdr.querySelector('.dizsan-modal-back-btn')) return; // Zaten var

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'dizsan-modal-back-btn';
            btn.innerHTML = '<i class="fa-solid fa-arrow-left"></i> Geri';
            btn.onclick = function (e) {
                e.stopPropagation();
                handleInAppBack();
            };

            hdr.insertBefore(btn, hdr.firstChild);
        });
    }

    // 12. Geri Butonunun Görünürlüğünü Güncelle
    function updateBackButtonVisibility() {
        const btn = document.getElementById('dizsan-global-back-btn');
        if (!btn) return;

        const hasModal = !!getActiveModal();
        const curTab = getActiveTabId();
        const isNotHome = curTab && !isHomeTab(curTab);

        if (hasModal || isNotHome) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    }

    // 13. DOM Gözlemcisi (Sekme Değişimleri veya Modal Açılışlarını İzler)
    function setupObserver() {
        const observer = new MutationObserver(() => {
            injectModalBackButtons();
            updateBackButtonVisibility();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'style']
        });
    }

    // 14. Global API Tanımlaması
    window.DizsanBackNav = {
        handleInAppBack: handleInAppBack,
        getActiveModal: getActiveModal,
        updateBackButtonVisibility: updateBackButtonVisibility,
        showToast: showBackToast
    };

    // 15. Başlat
    function init() {
        injectStyles();
        initPopStateListener();
        injectTopNavbarBackButton();
        injectModalBackButtons();
        setupObserver();

        // switchTab fonksiyonu varsa içine kanca (hook) at
        if (typeof window.switchTab === 'function') {
            const originalSwitchTab = window.switchTab;
            window.switchTab = function (tabId) {
                const res = originalSwitchTab.apply(this, arguments);
                setTimeout(updateBackButtonVisibility, 50);
                return res;
            };
        }

        // Sayfa yüklendiğinde kontrol et
        window.addEventListener('load', () => {
            injectTopNavbarBackButton();
            injectModalBackButtons();
            updateBackButtonVisibility();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
