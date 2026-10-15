/**
 * ============================================================================
 * DİZSAN EVRENSEL GERİ TUŞU & ÇIKIŞ ÖNLEME MOTORU (dizsan-back-navigation.js)
 * Antigravity AI - Dizsan Ekosistemi v1.1.0 (Performans & Sıfır Donma Garantili)
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
 * 7. %100 Hafiftir; ana iş parçacığını (UI thread) asla kilitlemez veya dondurmaz.
 * ============================================================================
 */

(function () {
    'use strict';

    if (window.DizsanBackNav) {
        return; // Zaten yüklü
    }

    let lastBackPressTime = 0;
    let isHandlingPopState = false;
    let visibilityCheckTimer = null;

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
                padding: 0.35rem 0.65rem;
                border-radius: 8px;
                font-size: 0.78rem;
                font-weight: 700;
                cursor: pointer;
                transition: background 0.15s ease, transform 0.1s ease;
                margin-right: 0.35rem;
                flex-shrink: 0;
                -webkit-tap-highlight-color: transparent;
                user-select: none;
                -webkit-user-select: none;
            }
            .dizsan-global-back-btn:active {
                transform: scale(0.92);
                background: rgba(56, 189, 248, 0.25);
            }
            .dizsan-global-back-btn.visible {
                display: inline-flex !important;
            }

            /* Modal Başlığı İçi Geri Tuşu */
            .dizsan-modal-back-btn {
                display: inline-flex;
                align-items: center;
                gap: 5px;
                background: rgba(255, 255, 255, 0.08);
                border: 1px solid rgba(255, 255, 255, 0.18);
                color: #e2e8f0;
                padding: 0.32rem 0.65rem;
                border-radius: 7px;
                font-size: 0.78rem;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.15s ease;
                margin-right: 0.65rem;
                flex-shrink: 0;
                -webkit-tap-highlight-color: transparent;
                user-select: none;
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
                border: 1px solid rgba(56, 189, 248, 0.4);
                color: #f8fafc;
                padding: 0.65rem 1.25rem;
                border-radius: 25px;
                font-size: 0.82rem;
                font-weight: 600;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
                z-index: 100000;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.2s ease, transform 0.2s ease;
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

    // 3. Açık Modal Tespiti (Reflow / Donma Yapmayan Hızlı Kontrol)
    function isModalElementOpen(el) {
        if (!el) return false;
        if (el.classList.contains('open') || el.classList.contains('active')) return true;
        if (el.style.display && el.style.display !== 'none') return true;
        return false;
    }

    function getActiveModal() {
        const modalIds = [
            'customer-detail-modal',
            'visit-modal',
            'task-modal',
            'customer-modal',
            'version-modal',
            'push-test-modal',
            'install-guide-modal',
            'change-password-modal',
            'forgot-password-modal',
            'meeting-modal',
            'action-modal',
            'new-card-modal',
            'new-payment-modal'
        ];

        for (const id of modalIds) {
            const el = document.getElementById(id);
            if (el && isModalElementOpen(el)) return el;
        }

        const openBackdrops = document.querySelectorAll('.modal-backdrop.open, .modal-backdrop.active, .modal.open, .modal.active');
        for (const m of openBackdrops) {
            if (isModalElementOpen(m)) return m;
        }

        return null;
    }

    // 4. Açık Modalı Kapatma
    function closeModal(modalEl) {
        if (!modalEl) return false;

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

        // Genel kapatma butonlarını tıkla
        const closeBtn = modalEl.querySelector('.modal-close, .close, [data-dismiss="modal"], button.btn-secondary');
        if (closeBtn && typeof closeBtn.click === 'function') {
            closeBtn.click();
            return true;
        }

        modalEl.classList.remove('open', 'active');
        modalEl.style.display = 'none';
        return true;
    }

    // 5. Açık Mobil Yan Menü Kontrolü
    function getActiveSidebar() {
        const sidebar = document.querySelector('.sidebar.mobile-open, .sidebar.active, .mobile-sidebar.open');
        return (sidebar && sidebar.classList.contains('mobile-open')) ? sidebar : null;
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

    // 6. Mevcut Sekme Kontrolü
    function getActiveTabId() {
        const activeSection = document.querySelector('.tab-section.active, .tab-pane.active, .page-section.active');
        return activeSection ? activeSection.id : '';
    }

    function isHomeTab(tabId) {
        if (!tabId) return true;
        const homeIds = ['dashboard-tab', 'tab-dashboard', 'kokpit-tab', 'home-tab', 'main-tab', 'summary-tab'];
        return homeIds.includes(tabId);
    }

    // 7. Geri Tuşu Karar Motoru
    function handleBackNavigation() {
        // 1. Aşama: Açık modal var mı?
        const modal = getActiveModal();
        if (modal) {
            closeModal(modal);
            scheduleVisibilityCheck();
            return true;
        }

        // 2. Aşama: Açık yan menü var mı?
        const sidebar = getActiveSidebar();
        if (sidebar) {
            closeSidebar(sidebar);
            scheduleVisibilityCheck();
            return true;
        }

        // 3. Aşama: Alt bir sekmede miyiz?
        const curTab = getActiveTabId();
        if (curTab && !isHomeTab(curTab)) {
            if (typeof window.switchTab === 'function') {
                window.switchTab('dashboard-tab');
            } else {
                const homeBtn = document.querySelector('[data-tab="dashboard-tab"], [onclick*="dashboard-tab"]');
                if (homeBtn) homeBtn.click();
            }
            scheduleVisibilityCheck();
            return true;
        }

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
        try {
            history.replaceState({ dizsanRoot: true }, '', location.href);
            history.pushState({ dizsanGuard: true }, '', location.href);
        } catch (e) {}

        window.addEventListener('popstate', function () {
            if (isHandlingPopState) return;

            const handled = handleBackNavigation();
            if (handled) {
                try {
                    history.pushState({ dizsanGuard: true }, '', location.href);
                } catch (e) {}
            } else {
                const now = Date.now();
                if (now - lastBackPressTime < 2000) {
                    history.back();
                } else {
                    lastBackPressTime = now;
                    try {
                        history.pushState({ dizsanGuard: true }, '', location.href);
                    } catch (e) {}
                    showBackToast('Çıkmak için tekrar basın');
                }
            }
        });
    }

    // 10. Geri Butonlarını DOM'a Enjekte Et
    function injectTopNavbarBackButton() {
        let btn = document.getElementById('dizsan-global-back-btn');
        if (!btn) {
            const targetContainer = document.querySelector('.navbar-left, .topbar-left, .header-left');
            if (targetContainer) {
                btn = document.createElement('button');
                btn.type = 'button';
                btn.id = 'dizsan-global-back-btn';
                btn.className = 'dizsan-global-back-btn';
                btn.title = 'Geri Dön';
                btn.innerHTML = '<i class="fa-solid fa-arrow-left"></i> <span>Geri</span>';
                btn.onclick = handleInAppBack;
                targetContainer.insertBefore(btn, targetContainer.firstChild);
            }
        }
        updateBackButtonVisibility();
    }

    function injectModalBackButtons() {
        const headers = document.querySelectorAll('.modal-header');
        headers.forEach(hdr => {
            if (hdr.querySelector('.dizsan-modal-back-btn')) return;

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

    // 11. Geri Butonunun Görünürlüğünü Güncelle (Throttled & Non-blocking)
    function updateBackButtonVisibility() {
        const btn = document.getElementById('dizsan-global-back-btn');
        if (!btn) return;

        const hasModal = !!getActiveModal();
        const curTab = getActiveTabId();
        const isNotHome = curTab && !isHomeTab(curTab);
        const shouldBeVisible = !!(hasModal || isNotHome);

        if (btn.classList.contains('visible') !== shouldBeVisible) {
            btn.classList.toggle('visible', shouldBeVisible);
        }
    }

    function scheduleVisibilityCheck() {
        if (visibilityCheckTimer) return;
        visibilityCheckTimer = setTimeout(() => {
            visibilityCheckTimer = null;
            updateBackButtonVisibility();
        }, 120);
    }

    // 12. Global API Tanımlaması
    window.DizsanBackNav = {
        handleInAppBack: handleInAppBack,
        getActiveModal: getActiveModal,
        updateBackButtonVisibility: updateBackButtonVisibility,
        showToast: showBackToast
    };

    // 13. Başlatıcı
    function init() {
        injectStyles();
        initPopStateListener();
        injectTopNavbarBackButton();
        injectModalBackButtons();

        // switchTab kancası
        if (typeof window.switchTab === 'function') {
            const originalSwitchTab = window.switchTab;
            window.switchTab = function () {
                const res = originalSwitchTab.apply(this, arguments);
                scheduleVisibilityCheck();
                return res;
            };
        }

        // Tıklamaları dinleyerek görünürlüğü güncelle (Hafif ve asenkron)
        document.addEventListener('click', scheduleVisibilityCheck, { passive: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
