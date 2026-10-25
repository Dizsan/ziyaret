(function() {
    // Add CSS dynamically
    const style = document.createElement('style');
    style.textContent = `
        .auto-date-container {
            display: inline-flex !important;
            align-items: center !important;
            box-sizing: border-box !important;
            cursor: text !important;
            position: relative;
            padding-right: 6px !important;
        }
        .auto-date-subinput {
            border: none !important;
            background: transparent !important;
            color: inherit !important;
            font-size: inherit !important;
            font-weight: inherit !important;
            font-family: inherit !important;
            outline: none !important;
            padding: 0 !important;
            margin: 0 !important;
            text-align: center !important;
            height: 100% !important;
        }
        .auto-date-subinput::placeholder {
            color: rgba(255, 255, 255, 0.35) !important;
        }
        body[data-theme="light"] .auto-date-subinput::placeholder {
            color: rgba(15, 23, 42, 0.4) !important;
        }
        .auto-date-subinput-day, .auto-date-subinput-month {
            width: 24px !important;
        }
        .auto-date-subinput-year {
            width: 46px !important;
        }
        .auto-date-separator {
            opacity: 0.55 !important;
            margin: 0 1px !important;
            user-select: none !important;
            font-weight: 700 !important;
        }
        .auto-date-icon {
            margin-left: auto !important;
            width: 26px !important;
            height: 26px !important;
            min-width: 26px !important;
            border-radius: 6px !important;
            cursor: pointer !important;
            opacity: 1 !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            background-color: rgba(56, 189, 248, 0.16) !important;
            border: 1px solid rgba(56, 189, 248, 0.42) !important;
            transition: all 0.18s ease !important;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2338bdf8' stroke-width='2.2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z' /%3E%3C/svg%3E") !important;
            background-size: 16px 16px !important;
            background-position: center !important;
            background-repeat: no-repeat !important;
            flex-shrink: 0 !important;
        }
        .auto-date-icon:hover {
            background-color: rgba(56, 189, 248, 0.3) !important;
            border-color: #38bdf8 !important;
            transform: scale(1.07);
            box-shadow: 0 0 10px rgba(56, 189, 248, 0.35);
        }
        .auto-calendar-popup {
            position: fixed;
            z-index: 999999;
            padding: 1rem;
            background: rgba(15, 23, 42, 0.98);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(56, 189, 248, 0.4);
            border-radius: 12px;
            box-shadow: 0 14px 44px rgba(0, 0, 0, 0.72);
            color: #f3f4f6;
            font-family: inherit;
            width: 280px;
            user-select: none;
            box-sizing: border-box;
            animation: autoCalendarFade 0.16s ease-out;
        }
        @keyframes autoCalendarFade {
            from { opacity: 0; transform: translateY(-6px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .auto-calendar-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.75rem;
        }
        .auto-calendar-nav-btn {
            background: rgba(56, 189, 248, 0.12);
            border: 1px solid rgba(56, 189, 248, 0.3);
            color: #38bdf8;
            cursor: pointer;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 0.8rem;
            transition: background 0.2s, border-color 0.2s;
        }
        .auto-calendar-nav-btn:hover {
            background: rgba(56, 189, 248, 0.28);
            border-color: #38bdf8;
            color: #ffffff;
        }
        .auto-calendar-weekdays {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            text-align: center;
            font-size: 0.72rem;
            color: #93c5fd;
            margin-bottom: 0.5rem;
            font-weight: 700;
            text-transform: uppercase;
        }
        .auto-calendar-days {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 4px;
        }
        .auto-calendar-day {
            aspect-ratio: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.82rem;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.16s;
            color: #e5e7eb;
            font-weight: 600;
        }
        .auto-calendar-day:hover:not(.empty) {
            background: rgba(56, 189, 248, 0.22);
            color: #ffffff;
        }
        .auto-calendar-day.active {
            background: #0284c7 !important;
            color: #ffffff !important;
            font-weight: 800;
            box-shadow: 0 0 10px rgba(2, 132, 199, 0.55);
        }
        .auto-calendar-day.today {
            border: 1px solid #f59e0b;
            color: #fbbf24;
            font-weight: 800;
        }
        .auto-calendar-day.empty {
            cursor: default;
        }
        .auto-calendar-selectors {
            display: flex;
            gap: 0.3rem;
        }
        .auto-calendar-select {
            background: #1e293b;
            border: 1px solid rgba(56, 189, 248, 0.3);
            color: #ffffff;
            font-size: 0.8rem;
            font-weight: 700;
            border-radius: 6px;
            padding: 0.18rem 0.35rem;
            outline: none;
            cursor: pointer;
        }
        .auto-calendar-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 0.4rem;
            margin-top: 0.7rem;
            padding-top: 0.55rem;
            border-top: 1px solid rgba(148, 163, 184, 0.18);
        }
        .auto-calendar-footer-btn {
            flex: 1;
            padding: 0.3rem 0.5rem;
            border-radius: 6px;
            font-size: 0.73rem;
            font-weight: 800;
            cursor: pointer;
            border: 1px solid rgba(56, 189, 248, 0.35);
            background: rgba(56, 189, 248, 0.14);
            color: #38bdf8;
            transition: all 0.16s;
        }
        .auto-calendar-footer-btn:hover {
            background: rgba(56, 189, 248, 0.28);
            color: #ffffff;
        }
        .auto-calendar-footer-btn.clear {
            border-color: rgba(248, 113, 113, 0.35);
            background: rgba(248, 113, 113, 0.12);
            color: #f87171;
        }
        .auto-calendar-footer-btn.clear:hover {
            background: rgba(248, 113, 113, 0.25);
            color: #ffffff;
        }
    `;
    document.head.appendChild(style);

    const monthNames = [
        "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", 
        "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
    ];

    const weekdayNames = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"];

    const DATE_INPUT_SELECTOR = 'input[type="date"], input[placeholder*="GG.AA.YYYY"], input[data-auto-date="true"]';

    function getPropDescriptor(obj, prop) {
        let proto = obj;
        while (proto) {
            const desc = Object.getOwnPropertyDescriptor(proto, prop);
            if (desc && (desc.get || desc.set)) return desc;
            proto = Object.getPrototypeOf(proto);
        }
        return null;
    }

    function parseAnyDateParts(val) {
        if (!val) return null;
        const s = String(val).trim();
        let m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (m) return { yyyy: m[1], mm: m[2], dd: m[3] };
        m = s.match(/^(\d{2})[./-](\d{2})[./-](\d{4})$/);
        if (m) return { dd: m[1], mm: m[2], yyyy: m[3] };
        return null;
    }

    function setupAutoDateInput(originalInput) {
        if (!originalInput || originalInput.dataset.autoDateSetup) return;
        if (!originalInput.parentNode) return;
        if (originalInput.classList && originalInput.classList.contains('auto-date-subinput')) return;

        originalInput.dataset.autoDateSetup = 'true';
        const useTRFormat = originalInput.type !== 'date' || originalInput.dataset.dateFormat === 'tr';

        // Hide original input
        originalInput.style.display = 'none';

        // Create container wrapper
        const container = document.createElement('div');
        container.className = 'auto-date-container ' + (originalInput.className || '');
        container.setAttribute('style', originalInput.getAttribute('style') || '');
        container.style.display = 'inline-flex';
        container.style.alignItems = 'center';
        container.style.gap = '2px';
        container.style.cursor = 'text';

        // Insert container right after the hidden original input
        originalInput.parentNode.insertBefore(container, originalInput.nextSibling);

        // Day Input
        const dayInput = document.createElement('input');
        dayInput.type = 'text';
        dayInput.maxLength = 2;
        dayInput.placeholder = 'GG';
        dayInput.inputMode = 'numeric';
        dayInput.className = 'auto-date-subinput auto-date-subinput-day';

        // Month Input
        const monthInput = document.createElement('input');
        monthInput.type = 'text';
        monthInput.maxLength = 2;
        monthInput.placeholder = 'AA';
        monthInput.inputMode = 'numeric';
        monthInput.className = 'auto-date-subinput auto-date-subinput-month';

        // Year Input
        const yearInput = document.createElement('input');
        yearInput.type = 'text';
        yearInput.maxLength = 4;
        yearInput.placeholder = 'YYYY';
        yearInput.inputMode = 'numeric';
        yearInput.className = 'auto-date-subinput auto-date-subinput-year';

        // Add separators
        const sep1 = document.createElement('span');
        sep1.className = 'auto-date-separator';
        sep1.textContent = '.';

        const sep2 = document.createElement('span');
        sep2.className = 'auto-date-separator';
        sep2.textContent = '.';

        // Add calendar icon button on the right side
        const icon = document.createElement('span');
        icon.className = 'auto-date-icon';
        icon.title = 'Takvimden Tarih Seç';

        // Append child elements
        container.appendChild(dayInput);
        container.appendChild(sep1);
        container.appendChild(monthInput);
        container.appendChild(sep2);
        container.appendChild(yearInput);
        container.appendChild(icon);

        const originalBorderColor = container.style.borderColor || 'rgba(255, 255, 255, 0.1)';
        const originalBoxShadow = container.style.boxShadow || 'none';

        function onFocus() {
            container.style.borderColor = '#38bdf8';
            container.style.boxShadow = '0 0 0 2px rgba(56, 189, 248, 0.25)';
        }

        function onBlur() {
            setTimeout(() => {
                if (!container.contains(document.activeElement)) {
                    container.style.borderColor = originalBorderColor;
                    container.style.boxShadow = originalBoxShadow;
                }
            }, 10);
        }

        [dayInput, monthInput, yearInput].forEach(inp => {
            inp.addEventListener('focus', onFocus);
            inp.addEventListener('blur', onBlur);
            
            inp.addEventListener('keydown', (e) => {
                if (e.key === 'Tab' || e.key === 'Enter' || e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Backspace' || e.key === 'Delete' || e.metaKey || e.ctrlKey) {
                    return;
                }
                if (!/^\d$/.test(e.key)) {
                    e.preventDefault();
                    return;
                }
                
                const isFull = inp.value.length >= inp.maxLength && inp.selectionStart === inp.selectionEnd;
                if (isFull) {
                    let nextInp = null;
                    if (inp === dayInput) nextInp = monthInput;
                    else if (inp === monthInput) nextInp = yearInput;
                    
                    if (nextInp) {
                        e.preventDefault();
                        nextInp.focus();
                        nextInp.value = e.key;
                        nextInp.dispatchEvent(new Event('input', { bubbles: true }));
                        if (nextInp === monthInput && /^[2-9]$/.test(e.key)) {
                            monthInput.value = '0' + e.key;
                            yearInput.focus();
                            yearInput.select();
                        }
                    }
                }
            });
        });

        container.addEventListener('click', (e) => {
            if (e.target === container || e.target.classList.contains('auto-date-separator')) {
                dayInput.focus();
            }
        });

        const desc = getPropDescriptor(HTMLInputElement.prototype, 'value');

        function formatTargetValue(dd, mm, yyyy) {
            return useTRFormat ? `${dd}.${mm}.${yyyy}` : `${yyyy}-${mm}-${dd}`;
        }

        function updateHiddenValue() {
            const d = dayInput.value.padStart(2, '0');
            const m = monthInput.value.padStart(2, '0');
            const y = yearInput.value;

            if (dayInput.value && monthInput.value && y && y.length === 4) {
                const val = formatTargetValue(d, m, y);
                try {
                    if (desc && desc.get && desc.get.call(originalInput) !== val) {
                        if (desc.set) {
                            desc.set.call(originalInput, val);
                        } else {
                            originalInput.value = val;
                        }
                        originalInput.dispatchEvent(new Event('input', { bubbles: true }));
                        originalInput.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                } catch (err) {
                    console.warn('Could not set hidden input value:', err);
                }
            } else {
                try {
                    if (desc && desc.get && desc.get.call(originalInput) !== '') {
                        if (desc.set) {
                            desc.set.call(originalInput, '');
                        } else {
                            originalInput.value = '';
                        }
                        originalInput.dispatchEvent(new Event('input', { bubbles: true }));
                        originalInput.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                } catch (err) {
                    console.warn('Could not clear hidden input value:', err);
                }
            }
        }

        function updateCustomFieldsFromHidden(val) {
            const parsed = parseAnyDateParts(val);
            if (parsed) {
                dayInput.value = parsed.dd;
                monthInput.value = parsed.mm;
                yearInput.value = parsed.yyyy;
            } else {
                dayInput.value = '';
                monthInput.value = '';
                yearInput.value = '';
            }
        }

        if (desc && typeof desc.set === 'function') {
            try {
                Object.defineProperty(originalInput, 'value', {
                    get: function() {
                        return desc.get.call(this);
                    },
                    set: function(val) {
                        const parsed = parseAnyDateParts(val);
                        const normalizedVal = parsed ? formatTargetValue(parsed.dd, parsed.mm, parsed.yyyy) : (val || '');
                        desc.set.call(this, normalizedVal);
                        updateCustomFieldsFromHidden(normalizedVal);
                    },
                    configurable: true
                });
                updateCustomFieldsFromHidden(desc.get.call(originalInput));
            } catch (err) {
                console.warn('Error hijacking input value descriptor:', err);
            }
        }

        originalInput.addEventListener('change', () => {
            updateCustomFieldsFromHidden(originalInput.value);
        });
        originalInput.addEventListener('input', () => {
            updateCustomFieldsFromHidden(originalInput.value);
        });

        dayInput.addEventListener('input', () => {
            const val = dayInput.value;
            if (val.length === 1 && /^[4-9]$/.test(val)) {
                dayInput.value = '0' + val;
                monthInput.focus();
                monthInput.select();
            } else if (val.length === 2) {
                monthInput.focus();
                monthInput.select();
            }
            updateHiddenValue();
        });

        dayInput.addEventListener('keydown', (e) => {
            if (e.key === '.' || e.key === '/' || e.key === '-') {
                e.preventDefault();
                if (dayInput.value.length > 0) {
                    if (dayInput.value.length === 1) {
                        dayInput.value = '0' + dayInput.value;
                    }
                    monthInput.focus();
                    monthInput.select();
                }
            } else if (e.key === 'ArrowRight' && dayInput.selectionEnd === dayInput.value.length) {
                e.preventDefault();
                monthInput.focus();
                monthInput.selectionStart = monthInput.selectionEnd = 0;
            }
        });

        monthInput.addEventListener('input', () => {
            const val = monthInput.value;
            if (val.length === 1 && /^[2-9]$/.test(val)) {
                monthInput.value = '0' + val;
                yearInput.focus();
                yearInput.select();
            } else if (val.length === 2) {
                yearInput.focus();
                yearInput.select();
            }
            updateHiddenValue();
        });

        monthInput.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && monthInput.value.length === 0) {
                e.preventDefault();
                dayInput.focus();
                dayInput.selectionStart = dayInput.selectionEnd = dayInput.value.length;
            }
            if (e.key === '.' || e.key === '/' || e.key === '-') {
                e.preventDefault();
                if (monthInput.value.length > 0) {
                    if (monthInput.value.length === 1) {
                        monthInput.value = '0' + monthInput.value;
                    }
                    yearInput.focus();
                    yearInput.select();
                }
            } else if (e.key === 'ArrowLeft' && monthInput.selectionStart === 0) {
                e.preventDefault();
                dayInput.focus();
                dayInput.selectionStart = dayInput.selectionEnd = dayInput.value.length;
            } else if (e.key === 'ArrowRight' && monthInput.selectionEnd === monthInput.value.length) {
                e.preventDefault();
                yearInput.focus();
                yearInput.selectionStart = yearInput.selectionEnd = 0;
            }
        });

        yearInput.addEventListener('input', () => {
            updateHiddenValue();
            if (yearInput.value.length === 4) {
                const focusables = Array.from(document.querySelectorAll('input:not([style*="display: none"]):not([type="hidden"]), select, textarea, button'));
                const index = focusables.indexOf(yearInput);
                if (index > -1 && index < focusables.length - 1) {
                    let nextIdx = index + 1;
                    while (nextIdx < focusables.length) {
                        const nextEl = focusables[nextIdx];
                        const st = window.getComputedStyle(nextEl);
                        if (nextEl.tabIndex !== -1 && !nextEl.disabled && st.display !== 'none' && st.visibility !== 'hidden') {
                            nextEl.focus();
                            if (typeof nextEl.select === 'function') {
                                nextEl.select();
                            }
                            break;
                        }
                        nextIdx++;
                    }
                }
            }
        });

        yearInput.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && yearInput.value.length === 0) {
                e.preventDefault();
                monthInput.focus();
                monthInput.selectionStart = monthInput.selectionEnd = monthInput.value.length;
            } else if (e.key === 'ArrowLeft' && yearInput.selectionStart === 0) {
                e.preventDefault();
                monthInput.focus();
                monthInput.selectionStart = monthInput.selectionEnd = monthInput.value.length;
            }
        });

        // Setup custom calendar dropdown on clicking the right-side calendar icon
        icon.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeAllCalendars();
            openCalendar(originalInput, container, updateCustomFieldsFromHidden, formatTargetValue);
        });
    }

    let activePopup = null;

    function closeAllCalendars() {
        if (activePopup) {
            activePopup.remove();
            activePopup = null;
        }
    }

    document.addEventListener('click', closeAllCalendars);
    window.addEventListener('scroll', closeAllCalendars, true);
    window.addEventListener('resize', closeAllCalendars);

    function applyPickedDateValue(originalInput, formattedVal, updateCallback) {
        const desc = getPropDescriptor(HTMLInputElement.prototype, 'value');
        try {
            if (desc && desc.set) {
                originalInput.value = formattedVal;
            } else {
                originalInput.value = formattedVal;
                updateCallback(formattedVal);
            }
            updateCallback(formattedVal);
            originalInput.dispatchEvent(new Event('input', { bubbles: true }));
            originalInput.dispatchEvent(new Event('change', { bubbles: true }));
        } catch (err) {
            updateCallback(formattedVal);
        }
    }

    function openCalendar(originalInput, container, updateCallback, formatTargetValue) {
        let currentYear = new Date().getFullYear();
        let currentMonth = new Date().getMonth();
        let currentDay = new Date().getDate();

        const desc = getPropDescriptor(HTMLInputElement.prototype, 'value');
        let val = '';
        try {
            val = desc && desc.get ? desc.get.call(originalInput) : originalInput.value;
        } catch (err) {
            val = originalInput.value;
        }
        
        const parsed = parseAnyDateParts(val);
        if (parsed) {
            currentYear = parseInt(parsed.yyyy, 10);
            currentMonth = parseInt(parsed.mm, 10) - 1;
            currentDay = parseInt(parsed.dd, 10);
        }

        let selectMonth = currentMonth;
        let selectYear = currentYear;

        const popup = document.createElement('div');
        popup.className = 'auto-calendar-popup';
        popup.addEventListener('click', e => e.stopPropagation());

        function renderMonth() {
            popup.innerHTML = '';

            const header = document.createElement('div');
            header.className = 'auto-calendar-header';

            const navPrev = document.createElement('button');
            navPrev.type = 'button';
            navPrev.className = 'auto-calendar-nav-btn';
            navPrev.innerHTML = '&#9664;';
            navPrev.addEventListener('click', () => {
                selectMonth--;
                if (selectMonth < 0) {
                    selectMonth = 11;
                    selectYear--;
                }
                renderMonth();
            });

            const selectors = document.createElement('div');
            selectors.className = 'auto-calendar-selectors';

            const monthSel = document.createElement('select');
            monthSel.className = 'auto-calendar-select';
            monthNames.forEach((name, i) => {
                const opt = document.createElement('option');
                opt.value = i;
                opt.textContent = name;
                if (i === selectMonth) opt.selected = true;
                monthSel.appendChild(opt);
            });
            monthSel.addEventListener('change', (e) => {
                selectMonth = parseInt(e.target.value, 10);
                renderMonth();
            });

            const yearSel = document.createElement('select');
            yearSel.className = 'auto-calendar-select';
            for (let y = selectYear - 15; y <= selectYear + 15; y++) {
                const opt = document.createElement('option');
                opt.value = y;
                opt.textContent = y;
                if (y === selectYear) opt.selected = true;
                yearSel.appendChild(opt);
            }
            yearSel.addEventListener('change', (e) => {
                selectYear = parseInt(e.target.value, 10);
                renderMonth();
            });

            selectors.appendChild(monthSel);
            selectors.appendChild(yearSel);

            const navNext = document.createElement('button');
            navNext.type = 'button';
            navNext.className = 'auto-calendar-nav-btn';
            navNext.innerHTML = '&#9654;';
            navNext.addEventListener('click', () => {
                selectMonth++;
                if (selectMonth > 11) {
                    selectMonth = 0;
                    selectYear++;
                }
                renderMonth();
            });

            header.appendChild(navPrev);
            header.appendChild(selectors);
            header.appendChild(navNext);
            popup.appendChild(header);

            const gridWeekdays = document.createElement('div');
            gridWeekdays.className = 'auto-calendar-weekdays';
            weekdayNames.forEach(w => {
                const wd = document.createElement('div');
                wd.textContent = w;
                gridWeekdays.appendChild(wd);
            });
            popup.appendChild(gridWeekdays);

            const gridDays = document.createElement('div');
            gridDays.className = 'auto-calendar-days';

            const firstDayIndex = (new Date(selectYear, selectMonth, 1).getDay() + 6) % 7;
            const daysInMonth = new Date(selectYear, selectMonth + 1, 0).getDate();

            for (let i = 0; i < firstDayIndex; i++) {
                const empty = document.createElement('div');
                empty.className = 'auto-calendar-day empty';
                gridDays.appendChild(empty);
            }

            const today = new Date();
            for (let d = 1; d <= daysInMonth; d++) {
                const dayEl = document.createElement('div');
                dayEl.className = 'auto-calendar-day';
                dayEl.textContent = d;

                if (d === currentDay && selectMonth === currentMonth && selectYear === currentYear) {
                    dayEl.classList.add('active');
                }

                if (d === today.getDate() && selectMonth === today.getMonth() && selectYear === today.getFullYear()) {
                    dayEl.classList.add('today');
                }

                dayEl.addEventListener('click', () => {
                    const dd = String(d).padStart(2, '0');
                    const mm = String(selectMonth + 1).padStart(2, '0');
                    const yyyy = String(selectYear);
                    const formattedVal = formatTargetValue(dd, mm, yyyy);
                    applyPickedDateValue(originalInput, formattedVal, updateCallback);
                    closeAllCalendars();
                });

                gridDays.appendChild(dayEl);
            }

            popup.appendChild(gridDays);

            const footer = document.createElement('div');
            footer.className = 'auto-calendar-footer';

            const todayBtn = document.createElement('button');
            todayBtn.type = 'button';
            todayBtn.className = 'auto-calendar-footer-btn';
            todayBtn.textContent = '📅 Bugün';
            todayBtn.addEventListener('click', () => {
                const now = new Date();
                const dd = String(now.getDate()).padStart(2, '0');
                const mm = String(now.getMonth() + 1).padStart(2, '0');
                const yyyy = String(now.getFullYear());
                const formattedVal = formatTargetValue(dd, mm, yyyy);
                applyPickedDateValue(originalInput, formattedVal, updateCallback);
                closeAllCalendars();
            });

            const clearBtn = document.createElement('button');
            clearBtn.type = 'button';
            clearBtn.className = 'auto-calendar-footer-btn clear';
            clearBtn.textContent = '✕ Temizle';
            clearBtn.addEventListener('click', () => {
                applyPickedDateValue(originalInput, '', updateCallback);
                closeAllCalendars();
            });

            footer.appendChild(todayBtn);
            footer.appendChild(clearBtn);
            popup.appendChild(footer);
        }

        renderMonth();
        document.body.appendChild(popup);

        // Position fixed relative to container so no parent overflow:hidden clips it
        const rect = container.getBoundingClientRect();
        const popupWidth = 280;
        const popupHeight = popup.offsetHeight || 310;
        let topPos = rect.bottom + 6;
        let leftPos = rect.left;

        if (topPos + popupHeight > window.innerHeight - 8 && rect.top - popupHeight - 6 > 8) {
            topPos = rect.top - popupHeight - 6;
        }
        if (leftPos + popupWidth > window.innerWidth - 8) {
            leftPos = Math.max(8, window.innerWidth - popupWidth - 8);
        }
        popup.style.top = `${Math.max(8, topPos)}px`;
        popup.style.left = `${Math.max(8, leftPos)}px`;

        activePopup = popup;
    }

    function upgradeAllAutoDateInputs(rootNode) {
        const root = rootNode && rootNode.querySelectorAll ? rootNode : document;
        root.querySelectorAll(DATE_INPUT_SELECTOR).forEach(setupAutoDateInput);
    }

    window.AutoDateHelper = {
        upgradeAll: upgradeAllAutoDateInputs,
        setupInput: setupAutoDateInput
    };

    function initializeAllAutoDateInputs() {
        upgradeAllAutoDateInputs(document);

        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.matches && node.matches(DATE_INPUT_SELECTOR)) {
                            setupAutoDateInput(node);
                        }
                        if (node.querySelectorAll) {
                            node.querySelectorAll(DATE_INPUT_SELECTOR).forEach(setupAutoDateInput);
                        }
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeAllAutoDateInputs);
    } else {
        initializeAllAutoDateInputs();
    }
})();
