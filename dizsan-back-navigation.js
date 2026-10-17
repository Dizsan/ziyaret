/**
 * ============================================================================
 * DİZSAN EVRENSEL GERİ TUŞU & ÇIKIŞ ÖNLEME MOTORU (dizsan-back-navigation.js)
 * Antigravity AI - Dizsan Ekosistemi v2.0.0
 * 
 * Özellikler:
 * 1. Telefon donanım / kaydırma geri tuşu (Android Back / iOS swipe) basıldığında
 *    uygulamadan komple çıkmayı %100 engeller.
 * 2. Gerçek LIFO Navigasyon Yığını (Tab History Stack):
 *    Sayfalar arası gezinti geçmişini hatırlar ve her geri basışta bir önceki sayfaya döner.
 * 3. Açık modal (ziyaret, toplantı, aksiyon, müşteri detayı vb.) varsa önce modalı kapatır.
 * 4. Açık mobil yan menü/sidebar varsa önce menüyü kapatır.
 * 5. Ana ekrandayken (Kokpit) geri tuşuna basıldığında uygulamadan atmaz;
 *    "DİZSAN Ana Sayfasındasınız" uyarısı verir ve ekranda kalır.
 * 6. Tüm uygulamaların üst çubuğuna (navbar) ve tüm modal başlıklarına şık, 
 *    dokunmatik dostu "← Geri" butonu ekler.
 * ============================================================================
 */

(function () {
    'use strict';

    if (window.DizsanBackNav && window.DizsanBackNav.version === '2.0.0') {
        return;
    }

    const tabHistoryStack = [];
    let isInternalTabSwitch = false;
    let visibilityCheckTimer = null;
    let toastTimer = null;

    // 1. Gerekli CSS Stilleri
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
                border: 1px solid rgba(255, 255, 255, 0.16);
                color: #ffffff;
                padding: 0.38rem 0.72rem;
                border-radius: 9px;
                font-size: 0.82rem;
                font-weight: 700;
                cursor: pointer;
                transition: background 0.15s ease, transform 0.1s ease;
                margin-right: 0.45rem;
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
                border-radius: 8px;
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

            /* Bilgilendirme Toastı */
            #dizsan-back-toast {
                position: fixed;
                bottom: 85px;
                left: 50%;
                transform: translateX(-50%) translateY(30px);
                background: rgba(15, 23, 42, 0.96);
                border: 1px solid rgba(56, 189, 248, 0.45);
                color: #f8fafc;
                padding: 0.65rem 1.25rem;
                border-radius: 25px;
                font-size: 0.82rem;
                font-weight: 600;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.75);
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

    // 2. Toast Bildirimi
    function showBackToast(text) {
        let toast = document.getElementById('dizsan-back-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'dizsan-back-toast';
            document.body.appendChild(toast);
        }
        toast.innerHTML = `<i class="fa-solid fa-arrow-left" style="color:#38bdf8; margin-right:6px;"></i> ${text}`;
        toast.classList.add('show');
        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toast.classList.remove('show');
            toastTimer = null;
        }, 1800);
    }

    // 3. Açık Modal Tespiti
    function isModalElementOpen(el) {
        if (!el) return false;
        if (el.classList.contains('open') || el.classList.contains('active')) return true;
        if (el.style.display && el.style.display !== 'none') return true;
        return false;
    }

    function getActiveModal() {
        const modalOrder = [
            'mobile-pwa-prompt-modal',
            'approval-request-modal',
            'task-action-modal',
            'manager-approval-modal',
            'urgent-departure-modal',
            'attachment-preview-modal',
            'meeting-modal',
            'action-modal',
            'announcement-modal',
            'visit-modal',
            'customer-detail-modal',
            'customer-modal',
            'task-modal',
            'user-modal',
            'version-modal',
            'push-test-modal',
            'install-guide-modal',
            'change-password-modal',
            'forgot-password-modal',
            'new-card-modal',
            'new-payment-modal'
        ];

        for (const id of modalOrder) {
            const el = document.getElementById(id);
            if (el && isModalElementOpen(el)) return el;
        }

        const openBackdrops = document.querySelectorAll('.modal-backdrop.open, .modal-backdrop.active, .modal.open, .modal.active');
        if (openBackdrops.length > 0) {
            return openBackdrops[openBackdrops.length - 1];
        }

        return null;
    }

    // 4. Modalı Kapatma
    function closeModal(modalEl) {
        if (!modalEl) return false;
        const id = modalEl.id;

        const closeFnMap = {
            'mobile-pwa-prompt-modal': 'closePwaPromptModal',
            'approval-request-modal': 'closeApprovalRequestModal',
            'task-action-modal': 'closeTaskActionModal',
            'manager-approval-modal': 'closeApprovalCenterModal',
            'urgent-departure-modal': 'closeUrgentDepartureModal',
            'attachment-preview-modal': 'closeAttachmentPreviewModal',
            'meeting-modal': 'closeMeetingModal',
            'action-modal': 'closeActionModal',
            'announcement-modal': 'closeAnnouncementModal',
            'visit-modal': 'closeVisitModal',
            'customer-detail-modal': 'closeCustomerDetailModal',
            'customer-modal': 'closeCustomerModal',
            'task-modal': 'closeTaskModal',
            'user-modal': 'closeUserModal',
            'version-modal': 'closeVersionModal',
            'push-test-modal': 'closePushTestCenterModal',
            'install-guide-modal': 'closeInstallGuideModal',
            'change-password-modal': 'closeChangePasswordModal',
            'forgot-password-modal': 'closeForgotPasswordModal'
        };

        const fnName = closeFnMap[id];
        if (fnName && typeof window[fnName] === 'function') {
            window[fnName]();
            return true;
        }

        const closeBtn = modalEl.querySelector('.modal-close, .close, [data-dismiss="modal"], button.btn-secondary');
        if (closeBtn && typeof closeBtn.click === 'function') {
            closeBtn.click();
            return true;
        }

        modalEl.classList.remove('open', 'active');
        modalEl.style.display = 'none';
        return true;
    }

    // 5. Mobil Yan Menü Kontrolü
    function getActiveSidebar() {
        const sidebar = document.querySelector('.sidebar.mobile-open, .sidebar.active, .mobile-sidebar.open');
        return (sidebar && (sidebar.classList.contains('mobile-open') || sidebar.classList.contains('active') || sidebar.classList.contains('open'))) ? sidebar : null;
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

    // 7. Geri Tuşu Karar Motoru (Hierarchical Navigation)
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

        // 3. Aşama: Sekme geçmişinde bir önceki sayfa var mı?
        while (tabHistoryStack.length > 0) {
            const prevTab = tabHistoryStack.pop();
            const curTab = getActiveTabId();
            if (prevTab && prevTab !== curTab && document.getElementById(prevTab)) {
                isInternalTabSwitch = true;
                if (typeof window.switchTab === 'function') {
                    window.switchTab(prevTab);
                } else {
                    const btn = document.querySelector(`[data-tab="${prevTab}"], [onclick*="${prevTab}"]`);
                    if (btn) btn.click();
                }
                isInternalTabSwitch = false;
                scheduleVisibilityCheck();
                return true;
            }
        }

        // 4. Aşama: Eğer geçmiş boş ama ana sekmede değilsek, ana sekmeye dön
        const curTab = getActiveTabId();
        if (curTab && !isHomeTab(curTab)) {
            isInternalTabSwitch = true;
            if (typeof window.switchTab === 'function') {
                window.switchTab('dashboard-tab');
            } else {
                const homeBtn = document.querySelector('[data-tab="dashboard-tab"], [onclick*="dashboard-tab"]');
                if (homeBtn) homeBtn.click();
            }
            isInternalTabSwitch = false;
            scheduleVisibilityCheck();
            return true;
        }

        // 5. Aşama: Zaten ana sekmedeyiz. D-Pro içindeysek D-Pro Ana Menüsüne dön!
        if (window.parent && window.parent !== window) {
            try {
                window.parent.postMessage({ type: 'DPRO_BACK_TO_MAIN' }, '*');
                return true;
            } catch (e) {}
        }
        showBackToast('DİZSAN Ana Sayfasındasınız');
        scheduleVisibilityCheck();
        return false;
    }

    // 8. Uygulama İçi "← Geri" Butonuna Basıldığında
    function handleInAppBack() {
        handleBackNavigation();
    }

    // 9. Donanım / Tarayıcı Popstate Kalkanı (Anti-Exit Guard)
    function pushGuard() {
        try {
            history.pushState({ dizsanGuard: true, timestamp: Date.now() }, '', location.href);
        } catch (e) {}
    }

    function initPopStateGuard() {
        pushGuard();
        pushGuard();

        window.addEventListener('popstate', function (e) {
            // Tarayıcı geri tuşuna basıldığında geçmiş havuzunu anında tekrar doldur
            pushGuard();

            // Uygulama içi önceki sayfaya veya modala dön
            handleBackNavigation();
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
                btn.className = 'dizsan-global-back-btn visible';
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

    // 11. Geri Butonunun Görünürlüğünü Güncelle
    function updateBackButtonVisibility() {
        const btn = document.getElementById('dizsan-global-back-btn');
        if (!btn) return;

        const isEmbedded = (window.parent && window.parent !== window);
        const hasModal = !!getActiveModal();
        const hasSidebar = !!getActiveSidebar();
        const curTab = getActiveTabId();
        const hasHistory = tabHistoryStack.length > 0;
        const isNotHome = curTab && !isHomeTab(curTab);
        const shouldBeVisible = !!(isEmbedded || hasModal || hasSidebar || hasHistory || isNotHome || true);

        if (btn.classList.contains('visible') !== shouldBeVisible) {
            btn.classList.toggle('visible', shouldBeVisible);
        }
    }

    function scheduleVisibilityCheck() {
        if (visibilityCheckTimer) return;
        visibilityCheckTimer = setTimeout(() => {
            visibilityCheckTimer = null;
            updateBackButtonVisibility();
        }, 100);
    }

    // 12. Sekme Değişikliklerini İzleme (Tab History Tracking)
    function trackTabSwitch(newTabId) {
        if (isInternalTabSwitch || !newTabId) return;
        const curTab = getActiveTabId();
        if (curTab && curTab !== newTabId) {
            if (tabHistoryStack.length === 0 || tabHistoryStack[tabHistoryStack.length - 1] !== curTab) {
                tabHistoryStack.push(curTab);
                if (tabHistoryStack.length > 30) {
                    tabHistoryStack.shift();
                }
            }
        }
        scheduleVisibilityCheck();
    }

    // 13. Global API Tanımlaması
    window.DizsanBackNav = {
        version: '2.0.0',
        handleInAppBack: handleInAppBack,
        getActiveModal: getActiveModal,
        updateBackButtonVisibility: updateBackButtonVisibility,
        showToast: showBackToast,
        pushGuard: pushGuard
    };

    // 14. Başlatıcı
    function init() {
        injectStyles();
        initPopStateGuard();
        injectTopNavbarBackButton();
        injectModalBackButtons();

        // switchTab kancası
        if (typeof window.switchTab === 'function') {
            const originalSwitchTab = window.switchTab;
            window.switchTab = function (tabId) {
                trackTabSwitch(tabId);
                const res = originalSwitchTab.apply(this, arguments);
                scheduleVisibilityCheck();
                return res;
            };
        }

        // Tıklamaları dinle ve görünürlüğü güncelle
        document.addEventListener('click', function (e) {
            scheduleVisibilityCheck();
            // Herhangi bir kullanıcı etkileşiminde geçmiş kalkanını tazele
            pushGuard();
        }, { passive: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
