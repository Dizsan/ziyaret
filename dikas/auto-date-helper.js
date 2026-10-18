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
        }
        .auto-date-subinput {
            border: none !important;
            background: transparent !important;
            color: inherit !important;
            font-size: inherit !important;
            font-family: inherit !important;
            outline: none !important;
            padding: 0 !important;
            margin: 0 !important;
            text-align: center !important;
            height: 100% !important;
        }
        .auto-date-subinput::placeholder {
            color: rgba(255, 255, 255, 0.25) !important;
        }
        .auto-date-subinput-day, .auto-date-subinput-month {
            width: 24px !important;
        }
        .auto-date-subinput-year {
            width: 46px !important;
        }
        .auto-date-separator {
            opacity: 0.4 !important;
            margin: 0 1px !important;
            user-select: none !important;
        }
        .auto-date-icon {
            margin-left: auto !important;
            width: 16px;
            height: 16px;
            cursor: pointer;
            opacity: 0.5;
            transition: opacity 0.2s, transform 0.2s;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ffffff' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z' /%3E%3C/svg%3E");
            background-size: contain;
            background-repeat: no-repeat;
        }
        .auto-date-icon:hover {
            opacity: 1;
            transform: scale(1.1);
        }
        .auto-calendar-popup {
            position: absolute;
            top: 100%;
            left: 0;
            z-index: 100000;
            margin-top: 0.5rem;
            padding: 1.2rem;
            background: rgba(20, 20, 25, 0.95);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
            color: #f3f4f6;
            font-family: inherit;
            width: 280px;
            user-select: none;
            box-sizing: border-box;
            animation: autoCalendarFade 0.2s ease-out;
        }
        @keyframes autoCalendarFade {
            from { opacity: 0; transform: translateY(-8px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .auto-calendar-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }
        .auto-calendar-nav-btn {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.08);
            color: #ffffff;
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
            background: rgba(255, 255, 255, 0.15);
            border-color: rgba(255, 255, 255, 0.2);
        }
        .auto-calendar-weekdays {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            text-align: center;
            font-size: 0.72rem;
            color: #9ca3af;
            margin-bottom: 0.6rem;
            font-weight: 600;
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
            transition: all 0.2s;
            color: #e5e7eb;
        }
        .auto-calendar-day:hover:not(.empty) {
            background: rgba(255, 255, 255, 0.12);
            color: #ffffff;
        }
        .auto-calendar-day.active {
            background: #3b82f6 !important;
            color: #ffffff !important;
            font-weight: 700;
            box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        }
        .auto-calendar-day.today {
            border: 1px solid #3b82f6;
            color: #3b82f6;
            font-weight: 600;
        }
        .auto-calendar-day.empty {
            cursor: default;
        }
        .auto-calendar-selectors {
            display: flex;
            gap: 0.3rem;
        }
        .auto-calendar-select {
            background: #1f2937;
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #ffffff;
            font-size: 0.8rem;
            border-radius: 4px;
            padding: 0.1rem 0.3rem;
            outline: none;
            cursor: pointer;
        }
    `;
    document.head.appendChild(style);

    const monthNames = [
        "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", 
        "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
    ];

    const weekdayNames = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"];

    // Traverses prototype chain to safely find a property descriptor
    function getPropDescriptor(obj, prop) {
        let proto = obj;
        while (proto) {
            const desc = Object.getOwnPropertyDescriptor(proto, prop);
            if (desc && (desc.get || desc.set)) return desc;
            proto = Object.getPrototypeOf(proto);
        }
        return null;
    }

    function setupAutoDateInput(originalInput) {
        if (originalInput.dataset.autoDateSetup) return;
        
        // Safety check: parentNode must exist to perform replacement
        if (!originalInput.parentNode) return;
        
        originalInput.dataset.autoDateSetup = 'true';

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

        // Add calendar icon
        const icon = document.createElement('span');
        icon.className = 'auto-date-icon';

        // Append child elements
        container.appendChild(dayInput);
        container.appendChild(sep1);
        container.appendChild(monthInput);
        container.appendChild(sep2);
        container.appendChild(yearInput);
        container.appendChild(icon);

        // Focus styling
        const originalBorderColor = container.style.borderColor || 'rgba(255, 255, 255, 0.1)';
        const originalBoxShadow = container.style.boxShadow || 'none';

        function onFocus() {
            container.style.borderColor = '#3b82f6';
            container.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.25)';
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
            
            // Restrict input to digits
            inp.addEventListener('keydown', (e) => {
                if (e.key === 'Tab' || e.key === 'Enter' || e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Backspace' || e.key === 'Delete' || e.metaKey || e.ctrlKey) {
                    return;
                }
                if (!/^\d$/.test(e.key)) {
                    e.preventDefault();
                    return;
                }
                
                // Smart key routing to prevent dropped characters when typing fast
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

        // Sync value from display inputs to hidden original input
        const desc = getPropDescriptor(HTMLInputElement.prototype, 'value');

        function updateHiddenValue() {
            const d = dayInput.value.padStart(2, '0');
            const m = monthInput.value.padStart(2, '0');
            const y = yearInput.value;

            if (dayInput.value && monthInput.value && y && y.length === 4) {
                const val = `${y}-${m}-${d}`;
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

        // Sync value from hidden input back to display fields
        function updateCustomFieldsFromHidden(val) {
            if (val && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
                const parts = val.split('-');
                dayInput.value = parts[2];
                monthInput.value = parts[1];
                yearInput.value = parts[0];
            } else {
                dayInput.value = '';
                monthInput.value = '';
                yearInput.value = '';
            }
        }

        // Hijack getter/setter of the original hidden input
        if (desc && typeof desc.set === 'function') {
            try {
                Object.defineProperty(originalInput, 'value', {
                    get: function() {
                        return desc.get.call(this);
                    },
                    set: function(val) {
                        desc.set.call(this, val);
                        updateCustomFieldsFromHidden(val);
                    },
                    configurable: true
                });
                // Initialize display values if original has a value
                updateCustomFieldsFromHidden(desc.get.call(originalInput));
            } catch (err) {
                console.warn('Error hijacking input value descriptor:', err);
            }
        }

        // Also add change and input event listeners on original input as a fallback sync mechanism
        originalInput.addEventListener('change', () => {
            updateCustomFieldsFromHidden(originalInput.value);
        });
        originalInput.addEventListener('input', () => {
            updateCustomFieldsFromHidden(originalInput.value);
        });

        // Keyboard flow logic with automatic smart jumping (synchronous, no setTimeout delays)
        dayInput.addEventListener('input', () => {
            const val = dayInput.value;
            // Smart auto-advance: if first digit is 4, 5, 6, 7, 8, 9, it's a single digit day
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
            // Smart auto-advance: if first digit is 2, 3, 4, 5, 6, 7, 8, 9, it's a single digit month
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
                // Auto advance to next focusable element on the page
                const focusables = Array.from(document.querySelectorAll('input:not([style*="display: none"]):not([type="hidden"]), select, textarea, button'));
                const index = focusables.indexOf(yearInput);
                if (index > -1 && index < focusables.length - 1) {
                    let nextIdx = index + 1;
                    while (nextIdx < focusables.length) {
                        const nextEl = focusables[nextIdx];
                        const style = window.getComputedStyle(nextEl);
                        if (nextEl.tabIndex !== -1 && !nextEl.disabled && style.display !== 'none' && style.visibility !== 'hidden') {
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

        // Setup custom calendar dropdown
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            closeAllCalendars();
            openCalendar(originalInput, container, updateCustomFieldsFromHidden);
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

    function openCalendar(originalInput, container, updateCallback) {
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
        
        if (val && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
            const parts = val.split('-');
            currentYear = parseInt(parts[0]);
            currentMonth = parseInt(parts[1]) - 1;
            currentDay = parseInt(parts[2]);
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
                selectMonth = parseInt(e.target.value);
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
                selectYear = parseInt(e.target.value);
                renderMonth();
            });

            selectors.appendChild(monthSel);
            selectors.appendChild(yearSel);

            const navNext = document.createElement('button');
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

            const firstDayIndex = (new Date(selectYear, selectMonth, 1).getDay() + 6) % 7; // Monday-based index
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
                    const yyyy = selectYear;
                    
                    try {
                        if (desc && desc.set) {
                            originalInput.value = `${yyyy}-${mm}-${dd}`;
                        } else {
                            originalInput.value = `${yyyy}-${mm}-${dd}`;
                            updateCallback(`${yyyy}-${mm}-${dd}`);
                        }
                        originalInput.dispatchEvent(new Event('input', { bubbles: true }));
                        originalInput.dispatchEvent(new Event('change', { bubbles: true }));
                    } catch (err) {
                        console.warn('Error setting date from calendar picker:', err);
                        // Fallback manual sync
                        updateCallback(`${yyyy}-${mm}-${dd}`);
                    }
                    closeAllCalendars();
                });

                gridDays.appendChild(dayEl);
            }

            popup.appendChild(gridDays);
        }

        renderMonth();
        container.appendChild(popup);
        activePopup = popup;
    }

    function initializeAllAutoDateInputs() {
        document.querySelectorAll('input[type="date"]').forEach(setupAutoDateInput);

        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.matches && node.matches('input[type="date"]')) {
                            setupAutoDateInput(node);
                        }
                        if (node.querySelectorAll) {
                            node.querySelectorAll('input[type="date"]').forEach(setupAutoDateInput);
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
