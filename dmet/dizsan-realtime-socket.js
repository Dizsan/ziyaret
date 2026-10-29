/**
 * DİZSAN CANLI SOCKET MOTORU (WebSocket RFC 6455 + SSE + BroadcastChannel)
 * & OTONOM ERİŞİLEBİLİRLİK / SIFIR KESİLME MOBİL KALKANI (v2026.10.29)
 */
(function () {
    "use strict";

    if (window.DizsanSocket && window.DizsanSocket.__initialized) {
        return;
    }

    var ws = null;
    var sse = null;
    var bc = null;
    var connected = false;
    var transportType = "none";
    var reconnectTimer = null;
    var reconnectAttempts = 0;
    var lastEventStamp = 0;
    var clientId = "c_" + Math.random().toString(36).slice(2, 10) + "_" + Date.now().toString(36);
    var listeners = [];
    var isStaticHost = Boolean(
        window.location &&
        window.location.hostname &&
        (window.location.hostname.indexOf("github.io") !== -1 || window.location.protocol === "file:")
    );

    function detectCurrentApp() {
        var p = "";
        try {
            p = decodeURIComponent(window.location.pathname || "").toLowerCase();
        } catch (e) {
            p = (window.location.pathname || "").toLowerCase();
        }
        if (p.indexOf("d-pro") !== -1 || p.indexOf("dpro") !== -1) return "dpro";
        if (p.indexOf("ziyaret") !== -1) return "ziyaret";
        if (p.indexOf("toplant") !== -1) return "toplanti";
        if (p.indexOf("dikas") !== -1) return "dikas";
        if (p.indexOf("kasa") !== -1) return "kasa";
        if (p.indexOf("kredi kart") !== -1 || p.indexOf("cardflow") !== -1) return "cardflow";
        if (p.indexOf("kredi") !== -1) return "kredi";
        if (p.indexOf("vdf") !== -1) return "vdf";
        if (p.indexOf("demet") !== -1 || p.indexOf("dmet") !== -1) return "demet";
        if (p.indexOf("odeme") !== -1 || p.indexOf("ödeme") !== -1) return "odeme";
        if (p.indexOf("hedef") !== -1) return "hedef";
        if (p.indexOf("itsm") !== -1) return "itsm";
        if (p.indexOf("dmt") !== -1 || p.indexOf("dimat") !== -1) return "dimat";
        if (p.indexOf("scania") !== -1) return "scania";
        if (p.indexOf("sesreter") !== -1) return "sesreter";
        if (p.indexOf("tansiyon") !== -1) return "tansiyon";
        if (p.indexOf("dizgun") !== -1 || p.indexOf("dizgün") !== -1) return "dizgun";
        return "portal";
    }

    var currentApp = detectCurrentApp();

    function invokeAppLiveRefresh(payload) {
        if (!payload || typeof payload !== "object") return;
        var evApp = String(payload.app || "all").toLowerCase();
        var evType = String(payload.type || "");
        if (evType !== "state_updated" && evType !== "logo_sync" && evType !== "sync_now") {
            return;
        }

        // Aynı olayın 250ms içinde mükerrer tetiklenmesini önle
        var stamp = Number(payload.updatedAtMs || Date.now());
        if (stamp && Math.abs(stamp - lastEventStamp) < 250 && payload.__processed) {
            return;
        }
        lastEventStamp = stamp;

        // Özel DOM olayı yayınla (tüm modern bileşenler dinleyebilir)
        try {
            window.dispatchEvent(new CustomEvent("dizsan:realtime", { detail: payload }));
        } catch (e) {}

        // Eğer olay bu uygulamayı, tüm uygulamaları veya D-Pro birleşik platformunu ilgilendiriyorsa canlı yenile
        var isRelevant =
            evApp === "all" ||
            evApp === currentApp ||
            currentApp === "dpro" ||
            currentApp === "portal" ||
            evType === "logo_sync";

        if (!isRelevant) return;

        var refreshFns = [
            "syncFromServer",
            "loadSharedStateFromServer",
            "fetchCloudState",
            "pullCloudState",
            "loadStateFromServer",
            "refreshLiveState",
            "checkServerLiveSync"
        ];

        for (var i = 0; i < refreshFns.length; i++) {
            var fnName = refreshFns[i];
            if (typeof window[fnName] === "function") {
                try {
                    window[fnName](true);
                    break;
                } catch (err) {}
            }
        }

        for (var j = 0; j < listeners.length; j++) {
            try {
                listeners[j](payload);
            } catch (e) {}
        }
    }

    function handleIncomingMessage(raw) {
        if (!raw) return;
        var data = raw;
        if (typeof raw === "string") {
            try {
                data = JSON.parse(raw);
            } catch (e) {
                return;
            }
        }
        if (!data || typeof data !== "object") return;
        if (data.senderId && data.senderId === clientId) return;
        invokeAppLiveRefresh(data);
    }

    function connectWebSocket() {
        if (isStaticHost) {
            transportType = "broadcast";
            return;
        }
        if (!window.WebSocket || !window.location || !window.location.host) {
            connectSSE();
            return;
        }
        try {
            if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
                return;
            }
            var proto = window.location.protocol === "https:" ? "wss:" : "ws:";
            var wsUrl = proto + "//" + window.location.host + "/api/ws?app=" + encodeURIComponent(currentApp) + "&cid=" + encodeURIComponent(clientId);
            ws = new WebSocket(wsUrl);

            ws.onopen = function () {
                connected = true;
                transportType = "websocket";
                reconnectAttempts = 0;
                try {
                    ws.send(JSON.stringify({ type: "hello", app: currentApp, senderId: clientId, ts: Date.now() }));
                } catch (e) {}
            };

            ws.onmessage = function (event) {
                if (event && event.data) {
                    handleIncomingMessage(event.data);
                }
            };

            ws.onerror = function () {
                if (!sse) {
                    connectSSE();
                }
            };

            ws.onclose = function () {
                if (transportType === "websocket") {
                    connected = Boolean(sse && sse.readyState === 1);
                    transportType = connected ? "sse" : "none";
                }
                scheduleReconnect();
            };
        } catch (err) {
            connectSSE();
        }
    }

    function connectSSE() {
        if (isStaticHost) {
            return;
        }
        if (!window.EventSource || !window.location || !window.location.host) {
            return;
        }
        try {
            if (sse && (sse.readyState === 0 || sse.readyState === 1)) {
                return;
            }
            var sseUrl = "/api/realtime-stream?app=" + encodeURIComponent(currentApp) + "&cid=" + encodeURIComponent(clientId);
            sse = new EventSource(sseUrl);

            sse.onopen = function () {
                connected = true;
                if (transportType !== "websocket") {
                    transportType = "sse";
                }
            };

            sse.onmessage = function (event) {
                if (event && event.data) {
                    handleIncomingMessage(event.data);
                }
            };

            sse.onerror = function () {
                try {
                    sse.close();
                } catch (e) {}
                sse = null;
                if (transportType === "sse") {
                    connected = false;
                    transportType = "none";
                }
                scheduleReconnect();
            };
        } catch (e) {}
    }

    function scheduleReconnect() {
        if (isStaticHost || reconnectTimer) return;
        reconnectAttempts += 1;
        var delay = Math.min(8000, 1200 * Math.max(1, reconnectAttempts));
        reconnectTimer = setTimeout(function () {
            reconnectTimer = null;
            connectWebSocket();
        }, delay);
    }

    function initBroadcastChannel() {
        if (typeof window.BroadcastChannel === "function") {
            try {
                bc = new BroadcastChannel("dizsan_realtime_bus");
                bc.onmessage = function (ev) {
                    if (ev && ev.data) {
                        handleIncomingMessage(ev.data);
                    }
                };
            } catch (e) {}
        }
    }

    // Fetch / XHR sonrası başarılı POST işlemlerinde sekmeler arası anında tetikleme
    function hookLocalSaveBroadcast() {
        if (typeof window.fetch === "function" && !window.fetch.__dizsanHooked) {
            var origFetch = window.fetch;
            var wrappedFetch = function (input, init) {
                var method = (init && init.method) ? String(init.method).toUpperCase() : "GET";
                var urlStr = typeof input === "string" ? input : (input && input.url ? input.url : "");
                return origFetch.apply(this, arguments).then(function (resp) {
                    if (method === "POST" && resp && resp.ok && urlStr.indexOf("/api/") !== -1 && urlStr.indexOf("-state") !== -1) {
                        var msg = {
                            type: "state_updated",
                            app: currentApp,
                            senderId: clientId,
                            updatedAtMs: Date.now()
                        };
                        if (bc) {
                            try { bc.postMessage(msg); } catch (e) {}
                        }
                    }
                    return resp;
                });
            };
            wrappedFetch.__dizsanHooked = true;
            window.fetch = wrappedFetch;
        }
    }

    /* ==========================================================================
       OTONOM ERİŞİLEBİLİRLİK (A11Y) & SIFIR KESİLME DOM KORUYUCUSU
       ========================================================================== */
    function inferReadableLabel(el, fallback) {
        if (!el) return fallback;
        var attrs = ["aria-label", "title", "placeholder", "name", "id", "data-tooltip", "data-action", "data-tab"];
        for (var i = 0; i < attrs.length; i++) {
            var val = el.getAttribute && el.getAttribute(attrs[i]);
            if (val && val.trim()) {
                return val.trim().replace(/[-_]+/g, " ");
            }
        }
        var txt = (el.textContent || el.innerText || "").replace(/\s+/g, " ").trim();
        if (txt) return txt.slice(0, 80);
        var icon = el.querySelector && el.querySelector("i[class*='fa-']");
        if (icon && icon.className) {
            var m = icon.className.match(/fa-([a-z0-9-]+)/i);
            if (m && m[1]) {
                return m[1].replace(/-/g, " ") + " " + fallback;
            }
        }
        return fallback;
    }

    function ensureA11yAndResponsive(root) {
        var scope = (root && root.querySelectorAll) ? root : document;
        try {
            // 1. HTML lang ve başlık kontrolü
            if (document.documentElement && !document.documentElement.getAttribute("lang")) {
                document.documentElement.setAttribute("lang", "tr");
            }

            // 2. İsimsiz butonlara otomatik aria-label
            var buttons = scope.querySelectorAll("button, [role='button'], a[href]");
            for (var i = 0; i < buttons.length; i++) {
                var btn = buttons[i];
                if (!btn.getAttribute("aria-label") && !btn.getAttribute("aria-labelledby")) {
                    var visibleText = (btn.textContent || "").replace(/\s+/g, " ").trim();
                    if (!visibleText) {
                        btn.setAttribute("aria-label", inferReadableLabel(btn, "İşlem Butonu"));
                    }
                }
            }

            // 3. Etiketsiz form girişlerine otomatik aria-label
            var inputs = scope.querySelectorAll("input:not([type='hidden']), select, textarea");
            for (var j = 0; j < inputs.length; j++) {
                var inp = inputs[j];
                if (!inp.getAttribute("aria-label") && !inp.getAttribute("aria-labelledby")) {
                    var id = inp.getAttribute("id");
                    var hasLabel = false;
                    if (id) {
                        try {
                            hasLabel = Boolean(document.querySelector("label[for='" + id.replace(/'/g, "\\'") + "']"));
                        } catch (e) {}
                    }
                    if (!hasLabel && !inp.closest("label")) {
                        inp.setAttribute("aria-label", inferReadableLabel(inp, "Veri Giriş Alanı"));
                    }
                }
            }

            // 4. Alt niteliği olmayan görsellere alt ekle
            var imgs = scope.querySelectorAll("img:not([alt])");
            for (var k = 0; k < imgs.length; k++) {
                var img = imgs[k];
                img.setAttribute("alt", inferReadableLabel(img, "Görsel"));
            }

            // 5. Inline style ile cümle kesen (ellipsis / nowrap / line-clamp) metin kutularını serbest bırak
            var inlineTruncated = scope.querySelectorAll("[style*='ellipsis'], [style*='nowrap'], [style*='line-clamp'], [style*='text-overflow']");
            for (var m = 0; m < inlineTruncated.length; m++) {
                var node = inlineTruncated[m];
                if (node.tagName === "SPAN" && node.classList && (node.classList.contains("badge-num") || node.classList.contains("nav-badge"))) {
                    continue;
                }
                if (node.style) {
                    node.style.setProperty("white-space", "normal", "important");
                    node.style.setProperty("text-overflow", "clip", "important");
                    node.style.setProperty("overflow-wrap", "anywhere", "important");
                    node.style.setProperty("word-break", "break-word", "important");
                    if (node.style.webkitLineClamp) {
                        node.style.setProperty("-webkit-line-clamp", "unset", "important");
                    }
                    if (node.style.maxWidth && (node.style.maxWidth === "140px" || node.style.maxWidth === "150px" || node.style.maxWidth === "160px")) {
                        node.style.setProperty("max-width", "100%", "important");
                    }
                }
            }
        } catch (err) {}
    }

    var a11yDebounce = null;
    function startDomGuardian() {
        ensureA11yAndResponsive(document);
        if (typeof MutationObserver === "function" && document.body) {
            var observer = new MutationObserver(function () {
                if (a11yDebounce) clearTimeout(a11yDebounce);
                a11yDebounce = setTimeout(function () {
                    ensureA11yAndResponsive(document);
                }, 180);
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", startDomGuardian);
    } else {
        startDomGuardian();
    }

    function closeAllTransports() {
        if (reconnectTimer) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
        }
        if (ws) {
            try { ws.onclose = null; ws.onerror = null; ws.close(); } catch (e) {}
            ws = null;
        }
        if (sse) {
            try { sse.onerror = null; sse.close(); } catch (e) {}
            sse = null;
        }
        connected = false;
    }

    // Başlat (Öncelik 1: RFC 6455 WebSocket; hata durumunda otomatik SSE fallback)
    initBroadcastChannel();
    hookLocalSaveBroadcast();
    connectWebSocket();

    // Sayfa geçişlerinde açık soket ve SSE akışlarını anında temizle (HTTP bağlantı havuzu koruması)
    window.addEventListener("pagehide", closeAllTransports);
    window.addEventListener("beforeunload", closeAllTransports);

    // Sekme görünür olduğunda veya ağ geri geldiğinde bağlantıyı anında tazele
    window.addEventListener("online", function () {
        connectWebSocket();
    });
    document.addEventListener("visibilitychange", function () {
        if (!document.hidden && !connected) {
            connectWebSocket();
        }
    });

    window.DizsanSocket = {
        __initialized: true,
        app: currentApp,
        clientId: clientId,
        isConnected: function () {
            return connected;
        },
        getTransport: function () {
            return transportType;
        },
        onMessage: function (fn) {
            if (typeof fn === "function") listeners.push(fn);
        },
        send: function (payload) {
            var msgObj = typeof payload === "object" && payload ? payload : { type: "ping", data: payload };
            msgObj.senderId = clientId;
            msgObj.app = msgObj.app || currentApp;
            msgObj.updatedAtMs = msgObj.updatedAtMs || Date.now();
            var raw = JSON.stringify(msgObj);
            if (ws && ws.readyState === WebSocket.OPEN) {
                try {
                    ws.send(raw);
                    return true;
                } catch (e) {}
            }
            if (bc) {
                try {
                    bc.postMessage(msgObj);
                    return true;
                } catch (e) {}
            }
            return false;
        },
        ensureA11yAndResponsive: ensureA11yAndResponsive
    };
})();
