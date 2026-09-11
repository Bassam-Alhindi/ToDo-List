const taskInput = document.getElementById('taskInput');
const composer = document.getElementById('composer');
const taskList = document.getElementById('taskList');
const listWrap = document.getElementById('listWrap');
const taskCounter = document.getElementById('taskCounter');
const emptyMessage = document.getElementById('emptyMessage');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const todayLabel = document.getElementById('todayLabel');
const progress = document.getElementById('progress');
const progressFill = document.getElementById('progressFill');
const panel = document.querySelector('.panel');
const tabs = document.getElementById('tabs');
const tabInd = document.getElementById('tabInd');
const filterButtons = document.querySelectorAll('.tab');
const fx = document.getElementById('fx');

const datePill = document.getElementById('datePill');
const datePillText = document.getElementById('datePillText');
const priorityPill = document.getElementById('priorityPill');
const priorityPillText = document.getElementById('priorityPillText');
const dateSheet = document.getElementById('dateSheet');
const sheetScrim = document.getElementById('sheetScrim');
const quickRow = document.getElementById('quickRow');
const calTitle = document.getElementById('calTitle');
const calDow = document.getElementById('calDow');
const calGrid = document.getElementById('calGrid');
const calPrev = document.getElementById('calPrev');
const calNext = document.getElementById('calNext');
const dateClear = document.getElementById('dateClear');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let currentFilter = 'all';

/* ── أدوات ────────────────────────────────────────────────────── */

function ar(n) {
    return new Intl.NumberFormat('ar-EG').format(n);
}

function isoOf(date) {
    return date.getFullYear() + '-' +
        String(date.getMonth() + 1).padStart(2, '0') + '-' +
        String(date.getDate()).padStart(2, '0');
}

function todayISO() {
    return isoOf(new Date());
}

function shiftISO(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return isoOf(d);
}

// التسميات النسبية حول اليوم؛ ما عداها يُعرض تاريخًا كاملًا
const RELATIVE_DAYS = { '-2': 'قبل أمس', '-1': 'أمس', '0': 'اليوم', '1': 'بكرة', '2': 'بعد بكرة' };

// الفرق بالأيام التقويمية بين تاريخ ISO واليوم المحلّي؛ UTC يُحيّد تغيّر التوقيت الصيفي
function daysFromToday(iso) {
    const parts = iso.split('-').map(Number);
    const now = new Date();
    return Math.round(
        (Date.UTC(parts[0], parts[1] - 1, parts[2]) -
         Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000
    );
}

function formatDueDate(dueDate) {
    const relative = RELATIVE_DAYS[daysFromToday(dueDate)];
    if (relative) return relative;

    const parts = dueDate.split('-');
    const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
    return new Intl.DateTimeFormat('ar-u-nu-arab', { day: 'numeric', month: 'long' }).format(dateObj);
}

/* ── منتقي التاريخ ────────────────────────────────────────────── */

// الأسبوع العربي يبدأ بالسبت، وgetDay يبدأ بالأحد
const DOW = ['سبت', 'أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع'];
// المهام الجديدة تبدأ بتاريخ اليوم افتراضيًّا
let selectedDate = todayISO();
let viewDate = new Date();
let hideTimer = null;
// حالة الفتح تُتابَع صراحةً: خاصية hidden تبقى false طوال حركة الإغلاق
let sheetOpen = false;

DOW.forEach(function (label) {
    const span = document.createElement('span');
    span.textContent = label;
    calDow.appendChild(span);
});

function updatePill() {
    datePillText.textContent = selectedDate ? formatDueDate(selectedDate) : 'أضف تاريخًا';
    datePill.classList.toggle('has-date', !!selectedDate);
    datePill.classList.toggle('is-custom', !!selectedDate && selectedDate !== todayISO());

    quickRow.querySelectorAll('.quick-btn').forEach(function (b) {
        b.classList.toggle('is-on', !!selectedDate && shiftISO(Number(b.dataset.offset)) === selectedDate);
    });
}

function renderCal() {
    calTitle.textContent = new Intl.DateTimeFormat('ar-u-nu-arab', {
        month: 'long', year: 'numeric'
    }).format(viewDate);

    calGrid.textContent = '';

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const startCol = (new Date(year, month, 1).getDay() + 1) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = todayISO();

    const labelFmt = new Intl.DateTimeFormat('ar-u-nu-arab', {
        weekday: 'long', day: 'numeric', month: 'long'
    });

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const iso = isoOf(date);

        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'cal-day';
        cell.dataset.iso = iso;
        cell.textContent = ar(day);
        cell.setAttribute('aria-label', labelFmt.format(date));

        if (day === 1) cell.style.gridColumnStart = String(startCol + 1);
        if (iso < today) cell.classList.add('is-past');
        if (iso === today) cell.classList.add('is-today');
        if (iso === selectedDate) {
            cell.classList.add('is-selected');
            cell.setAttribute('aria-current', 'date');
        }

        calGrid.appendChild(cell);
    }
}

function setDate(iso) {
    selectedDate = iso;
    updatePill();
    renderCal();
}

// المنبثقة معلّقة على الزرّ: فوقه إن اتّسع المكان، وتحته إن ضاق
function placeSheet() {
    const pill = datePill.getBoundingClientRect();
    const gap = 8;
    const edge = 12;
    const w = dateSheet.offsetWidth;
    const h = dateSheet.offsetHeight;

    let top = pill.top - h - gap;
    if (top < edge) top = pill.bottom + gap;
    top = Math.max(edge, Math.min(top, window.innerHeight - h - edge));

    // محاذاة الحافة اليمنى للزرّ، مع إبقائها داخل الشاشة
    let left = pill.right - w;
    left = Math.max(edge, Math.min(left, window.innerWidth - w - edge));

    dateSheet.style.top = top + 'px';
    dateSheet.style.left = left + 'px';
    dateSheet.style.transformOrigin =
        (top < pill.top ? 'bottom' : 'top') + ' right';
}

function openSheet() {
    if (sheetOpen) return;
    sheetOpen = true;

    // إعادة الفتح أثناء حركة الإغلاق يجب ألّا تُخفي البطاقة بعد فتحها
    clearTimeout(hideTimer);

    viewDate = selectedDate
        ? new Date(Number(selectedDate.split('-')[0]), Number(selectedDate.split('-')[1]) - 1, 1)
        : new Date();
    renderCal();

    sheetScrim.hidden = false;
    dateSheet.hidden = false;
    document.body.classList.add('sheet-open');
    datePill.setAttribute('aria-expanded', 'true');

    placeSheet();   // القياس ممكن الآن بعد رفع hidden

    requestAnimationFrame(function () {
        dateSheet.classList.add('is-open');
    });

    const first = quickRow.querySelector('.quick-btn');
    if (first) first.focus({ preventScroll: true });
}

function closeSheet() {
    if (!sheetOpen) return;
    sheetOpen = false;

    dateSheet.classList.remove('is-open');
    document.body.classList.remove('sheet-open');
    datePill.setAttribute('aria-expanded', 'false');

    clearTimeout(hideTimer);
    hideTimer = setTimeout(function () {
        sheetScrim.hidden = true;
        dateSheet.hidden = true;
    }, reduceMotion.matches ? 0 : 260);

    // الزرّ هو من فتح البطاقة دائمًا، فإليه يعود التركيز
    datePill.focus({ preventScroll: true });
}

datePill.addEventListener('click', function () {
    if (sheetOpen) closeSheet();
    else openSheet();
});

sheetScrim.addEventListener('click', closeSheet);

dateClear.addEventListener('click', function () {
    setDate('');
    closeSheet();
});

quickRow.addEventListener('click', function (e) {
    const btn = e.target.closest('.quick-btn');
    if (!btn) return;
    setDate(shiftISO(Number(btn.dataset.offset)));
    setTimeout(closeSheet, 140);
});

calGrid.addEventListener('click', function (e) {
    const cell = e.target.closest('.cal-day');
    if (!cell) return;
    setDate(cell.dataset.iso);
    setTimeout(closeSheet, 140);
});

calPrev.addEventListener('click', function () {
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
    renderCal();
});

calNext.addEventListener('click', function () {
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
    renderCal();
});

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && sheetOpen) {
        e.preventDefault();
        closeSheet();
    }
});

// إبقاء التنقّل بـTab داخل البطاقة ما دامت مفتوحة
dateSheet.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;

    const focusables = dateSheet.querySelectorAll('button');
    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
    }
});

/* ── منتقي الأولوية ────────────────────────────────────────────── */

const PRIORITY_LABELS = { high: 'عالية', medium: 'متوسطة', low: 'منخفضة' };
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };
const PRIORITY_CYCLE = ['medium', 'high', 'low'];

let selectedPriority = 'medium';

function updatePriorityPill() {
    priorityPill.dataset.priority = selectedPriority;
    priorityPillText.textContent = PRIORITY_LABELS[selectedPriority];
    priorityPill.setAttribute('aria-label', 'أولوية: ' + PRIORITY_LABELS[selectedPriority]);
}

priorityPill.addEventListener('click', function () {
    const idx = PRIORITY_CYCLE.indexOf(selectedPriority);
    selectedPriority = PRIORITY_CYCLE[(idx + 1) % PRIORITY_CYCLE.length];
    updatePriorityPill();
});

/* ── الرشّ الذهبي عند إنجاز مهمة ──────────────────────────────── */

const SPARK_COLORS = ['#d4af37', '#e5c158', '#9c7d23', '#f3e6c0'];

function burst(anchor) {
    if (reduceMotion.matches) return;

    const rect = anchor.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;
    const frag = document.createDocumentFragment();

    for (let i = 0; i < 10; i++) {
        const p = document.createElement('i');
        p.className = 'spark';

        const angle = (Math.PI * 2 * i) / 10 + Math.random() * 0.4;
        const dist = 28 + Math.random() * 38;
        const round = Math.random() > 0.6;

        p.style.left = originX + 'px';
        p.style.top = originY + 'px';
        p.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
        p.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
        p.style.setProperty('--rot', Math.round(Math.random() * 360 - 180) + 'deg');
        p.style.setProperty('--c', SPARK_COLORS[i % SPARK_COLORS.length]);
        p.style.setProperty('--w', (round ? 3.5 : 2) + 'px');
        p.style.setProperty('--h', (round ? 3.5 : 6) + 'px');
        p.style.setProperty('--r', round ? '50%' : '1px');
        p.style.animationDelay = Math.random() * 80 + 'ms';

        p.addEventListener('animationend', () => p.remove());
        frag.appendChild(p);
    }

    fx.appendChild(frag);
}

/* ── بناء سطر المهمة ──────────────────────────────────────────── */

// معرّف فريد لكلّ مربّع، يربط به نصّ المهمة عبر <label for>
let taskSeq = 0;
let sortTimer = null;

function createTaskElement(text, isDone, dueDate, priority) {
    const li = document.createElement('li');
    li.dataset.text = text;
    li.dataset.priority = priority || 'medium';
    li.dataset.created = Date.now();
    if (isDone) li.classList.add('done');

    /* التبديل أصليّ بالكامل: المربّع يدير حالته بنفسه، والغلاف .check وبقيّة
       السطر (.task-main) كلاهما <label> له، فتصله أوّل نقرة أو لمسة مرّةً واحدة.
       لا خطوة تحديد للسطر، ولا مستمعات pointer أو touch، ولا .click() برمجيّ. */
    const check = document.createElement('label');
    check.className = 'check';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'task-' + (++taskSeq);
    checkbox.checked = isDone;
    checkbox.setAttribute('aria-label', 'إنجاز مهمة: ' + text);
    check.appendChild(checkbox);

    const tick = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    tick.setAttribute('class', 'tick');
    tick.setAttribute('viewBox', '0 0 24 24');
    const tickPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    tickPath.setAttribute('d', 'M5 13l4.5 4.5L19 7');
    tick.appendChild(tickPath);
    check.appendChild(tick);

    // المستمع الوحيد لتبديل الحالة: حدث change الأصليّ، مرّةً لكلّ نقرة
    checkbox.addEventListener('change', function () {
        const done = checkbox.checked;
        li.classList.toggle('done', done);
        refreshDueState(li);

        if (done) {
            check.classList.remove('pulse');
            void check.offsetWidth;
            check.classList.add('pulse');
            burst(checkbox);
        }

        /* الكتابة في localStorage متزامنة، وupdateUI يفرض تخطيطًا.
           تأجيلهما إطارًا واحدًا يترك إطار انطلاق الحركة خاليًا.
           تأجيل الفرز 400ms يسمح بتشغيل حركات الملء والنبض والرشّ كاملة. */
        requestAnimationFrame(function () {
            updateUI();
            saveTasks();
        });

        // التبديلات المتتالية السريعة تنتهي بفرز واحد
        clearTimeout(sortTimer);
        sortTimer = setTimeout(sortTasks, 400);
    });

    check.addEventListener('animationend', function (e) {
        if (e.animationName === 'pulse-ring') check.classList.remove('pulse');
    });

    const taskText = document.createElement('span');
    taskText.className = 'task-text';

    const ink = document.createElement('span');
    ink.className = 'task-ink';
    ink.textContent = text;
    taskText.appendChild(ink);

    /* النصّ والشارتان في ملصق ثانٍ للمربّع نفسه، تمتدّ مساحته عبر ::after على
       السطر كلّه، فأيّ لمسة على السطر تبدّل الحالة من المرّة الأولى */
    const main = document.createElement('label');
    main.className = 'task-main';
    main.htmlFor = checkbox.id;
    main.appendChild(taskText);

    li.appendChild(check);
    li.appendChild(main);

    if (priority && priority !== 'medium') {
        const pBadge = document.createElement('span');
        pBadge.className = 'priority-badge';
        pBadge.textContent = PRIORITY_LABELS[priority];
        main.appendChild(pBadge);
    }

    if (dueDate) {
        li.dataset.due = dueDate;
        const badge = document.createElement('span');
        badge.className = 'due-badge';
        badge.textContent = formatDueDate(dueDate);
        main.appendChild(badge);
    }

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'del';
    deleteBtn.setAttribute('aria-label', 'حذف مهمة: ' + text);
    deleteBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    deleteBtn.addEventListener('click', function () {
        removeTask(li);
    });
    li.appendChild(deleteBtn);

    refreshDueState(li);
    return li;
}

function refreshDueState(li) {
    li.classList.remove('overdue', 'due-today');
    const due = li.dataset.due;
    if (!due || li.classList.contains('done')) return;

    const today = todayISO();
    if (due < today) li.classList.add('overdue');
    else if (due === today) li.classList.add('due-today');
}

/* ── تغيّر اليوم ─ التسميات النسبية تتبع التاريخ الحيّ ───────────── */

function renderTodayLabel() {
    todayLabel.textContent = new Intl.DateTimeFormat('ar-u-nu-arab', {
        weekday: 'long', day: 'numeric', month: 'long'
    }).format(new Date());
}

/* "اليوم" و"بكرة" و"أمس" وحالتا التأخّر والاستحقاق تُحسب كلّها من تاريخ اليوم،
   فتُعاد حين يتغيّر: بمؤقّت عند منتصف الليل، وعند عودة الصفحة إلى الواجهة
   لأنّ المؤقّتات تتوقّف أثناء نوم الجهاز */
let currentDay = todayISO();
let midnightTimer = null;

function scheduleMidnight() {
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    clearTimeout(midnightTimer);
    // ثانية زائدة حتى لا يُطلَق المؤقّت قبل منتصف الليل بجزء من الثانية
    midnightTimer = setTimeout(refreshDates, next - now + 1000);
}

function refreshDates() {
    scheduleMidnight();

    const today = todayISO();
    if (today === currentDay) return;

    // التاريخ الافتراضيّ للمهمة الجديدة يتبع اليوم، ما لم يختر المستخدم غيره
    if (selectedDate === currentDay) selectedDate = today;
    currentDay = today;

    for (const li of taskList.children) {
        const badge = li.querySelector('.due-badge');
        if (badge) badge.textContent = formatDueDate(li.dataset.due);
        refreshDueState(li);
    }

    renderTodayLabel();
    updatePill();
    renderCal();
}

document.addEventListener('visibilitychange', function () {
    if (!document.hidden) refreshDates();
});
window.addEventListener('pageshow', refreshDates);

/* ── الحذف ─ انطواء السطر ثم إزالته ───────────────────────────── */

function collapse(li, delay) {
    // حركة الدخول تُبقي تحويلها بـ fill-mode، فتُلغي حركة الخروج ما لم تُزل أوّلًا
    li.classList.remove('is-new');
    li.style.animationDelay = '';

    li.style.height = li.offsetHeight + 'px';
    void li.offsetHeight;
    setTimeout(() => li.classList.add('removing'), delay || 0);
}

function removeTask(li) {
    collapse(li);
    setTimeout(function () {
        li.remove();
        saveTasks();
        sortTasks();
        updateUI();
    }, 340);
}

/* ── الحفظ والتحميل ───────────────────────────────────────────── */

function saveTasks() {
    const tasks = [];
    for (const li of taskList.children) {
        tasks.push({
            text: li.dataset.text,
            done: li.classList.contains('done'),
            due: li.dataset.due || '',
            priority: li.dataset.priority || 'medium',
            created: Number(li.dataset.created) || Date.now()
        });
    }
    try {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (e) {
        /* التخزين غير متاح ـ المهام تبقى في هذه الجلسة فقط */
    }
}

function loadTasks() {
    let saved = null;
    try {
        saved = localStorage.getItem('tasks');
    } catch (e) {
        saved = null;
    }
    if (!saved) return;

    let tasks;
    try {
        tasks = JSON.parse(saved);
    } catch (e) {
        return;
    }
    if (!Array.isArray(tasks)) return;

    for (const task of tasks) {
        if (!task || !task.text) continue;
        taskList.appendChild(createTaskElement(task.text, !!task.done, task.due, task.priority || 'medium'));
        if (task.created) {
            taskList.lastChild.dataset.created = String(task.created);
        }
    }
    sortTasks();
}

/* ── تحديث الواجهة ────────────────────────────────────────────── */

const EMPTY_COPY = {
    all: 'الصفحة فارغة. اكتب أول مهمة.',
    active: 'لا مهام نشطة الآن.',
    done: 'لم تكتمل أي مهمة بعد.'
};

function updateUI() {
    let total = 0;
    let done = 0;
    let anyVisible = false;

    for (const li of taskList.children) {
        if (li.classList.contains('removing')) continue;

        total++;
        const isDone = li.classList.contains('done');
        if (isDone) done++;

        let show = true;
        if (currentFilter === 'active') show = !isDone;
        if (currentFilter === 'done') show = isDone;

        const next = show ? 'flex' : 'none';
        if (li.style.display !== next) li.style.display = next;
        if (show) anyVisible = true;
    }

    setProgress(total ? (done / total) * 100 : 0);
    panel.classList.toggle('is-complete', total > 0 && done === total);

    if (total === 0) {
        taskCounter.textContent = 'لا مهام بعد';
    } else if (done === total) {
        taskCounter.textContent = 'اكتمل كل شيء';
    } else {
        taskCounter.textContent = ar(done) + ' من ' + ar(total) + ' مكتملة';
    }

    emptyMessage.textContent = EMPTY_COPY[currentFilter];
    emptyMessage.style.display = anyVisible ? 'none' : 'block';

    clearCompletedBtn.disabled = done === 0;

    /* قراءة scrollHeight بعد الكتابات تفرض تخطيطًا متزامنًا، فتُؤجَّل إطارًا */
    requestAnimationFrame(updateScrollEdge);
}

// حاشية متلاشية عند كلّ طرف ما دام وراءه بقيّة
function updateScrollEdge() {
    const below = taskList.scrollHeight - taskList.scrollTop - taskList.clientHeight > 2;
    listWrap.classList.toggle('can-scroll', below);
    listWrap.classList.toggle('can-scroll-up', taskList.scrollTop > 2);
}

taskList.addEventListener('scroll', updateScrollEdge, { passive: true });

/* ── التقدّم ────────────────────────────────────────────────────── */

let progressValue = 0;

function setProgress(percent) {
    const next = Math.max(0, Math.min(100, Math.round(percent)));
    progressValue = next;
    progress.style.setProperty('--progress', String(next));
    progress.setAttribute('aria-valuenow', String(next));
    progressFill.classList.toggle('has-value', next > 0);
}

/* ── الفرز: تاريخ استحقاق → أولوية → تاريخ إنشاء ─────────────── */

function sortTasks() {
    const items = Array.from(taskList.children);

    items.sort(function (a, b) {
        if (a.classList.contains('removing') || b.classList.contains('removing')) return 0;

        // أولاً: تاريخ الاستحقاق (تصاعدي، التواريخ الفارغة في النهاية)
        const dA = a.dataset.due || '';
        const dB = b.dataset.due || '';
        if (dA !== dB) {
            if (!dA) return 1;
            if (!dB) return -1;
            return dA < dB ? -1 : 1;
        }

        // ثانيًا: الأولوية (عالية > متوسطة > منخفضة)
        const pA = PRIORITY_ORDER[a.dataset.priority] ?? 1;
        const pB = PRIORITY_ORDER[b.dataset.priority] ?? 1;
        if (pA !== pB) return pA - pB;

        // ثالثًا: تاريخ الإنشاء (الأحدث أولاً)
        const cA = Number(a.dataset.created) || 0;
        const cB = Number(b.dataset.created) || 0;
        return cB - cA;
    });

    /* لا يُنقل إلّا السطر الذي تغيّر موضعه: نقل عنصر في DOM يقطع حركاته الجارية
       (شطب النصّ ورسم العلامة)، وقد يُضيّع النقرة إن جرى تحت إصبع المستخدم */
    items.forEach(function (li, i) {
        const current = taskList.children[i];
        if (current !== li) taskList.insertBefore(li, current);
    });
}

/* ── الإضافة ──────────────────────────────────────────────────── */

function addTask(event) {
    if (event) event.preventDefault();

    const taskText = taskInput.value.trim();
    if (taskText === '') {
        taskInput.focus();
        return;
    }

    const li = createTaskElement(taskText, false, selectedDate, selectedPriority);
    li.classList.add('is-new');
    li.addEventListener('animationend', function once(e) {
        if (e.target !== li) return;
        li.classList.remove('is-new');
        li.removeEventListener('animationend', once);
    });

    taskList.appendChild(li);
    sortTasks();
    saveTasks();
    updateUI();

    taskInput.value = '';
    setDate(todayISO());
    selectedPriority = 'medium';
    updatePriorityPill();

    /* على الجوّال: إزالة التركيز تُخفي لوحة المفاتيح فورًا بعد الإضافة.
       على سطح المكتب يبقى التركيز ليتواصل إدخال المهام بسرعة. */
    if (window.matchMedia('(pointer: coarse)').matches) taskInput.blur();
    else taskInput.focus();
}

composer.addEventListener('submit', addTask);

/* ── التصفية ──────────────────────────────────────────────────── */

function moveIndicator(animate) {
    const active = tabs.querySelector('.tab.is-active');
    if (!active) return;

    if (!animate) tabs.classList.add('no-anim');
    tabInd.style.width = active.offsetWidth + 'px';
    tabInd.style.transform = 'translateX(' + active.offsetLeft + 'px)';
    if (!animate) {
        void tabInd.offsetWidth;
        tabs.classList.remove('no-anim');
    }
}

filterButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
        if (btn.classList.contains('is-active')) return;

        filterButtons.forEach(function (b) {
            b.classList.remove('is-active');
            b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('is-active');
        btn.setAttribute('aria-pressed', 'true');

        currentFilter = btn.dataset.filter;
        moveIndicator(true);
        updateUI();
        stagger();
    });
});

function stagger() {
    if (reduceMotion.matches) return;

    let i = 0;
    for (const li of taskList.children) {
        if (li.style.display === 'none') continue;

        li.classList.remove('is-new');
        void li.offsetWidth;
        li.style.animationDelay = Math.min(i, 8) * 28 + 'ms';
        li.classList.add('is-new');
        li.addEventListener('animationend', function once(e) {
            if (e.target !== li) return;
            li.classList.remove('is-new');
            li.style.animationDelay = '';
            li.removeEventListener('animationend', once);
        });
        i++;
    }
}

/* ── مسح المكتملة ─────────────────────────────────────────────── */

clearCompletedBtn.addEventListener('click', function () {
    const doneItems = taskList.querySelectorAll('li.done');
    if (!doneItems.length) return;

    doneItems.forEach(function (li, i) {
        collapse(li, i * 45);
    });

    setTimeout(function () {
        doneItems.forEach(function (li) { li.remove(); });
        saveTasks();
        sortTasks();
        updateUI();
    }, 340 + doneItems.length * 45);
});

/* ── الإقلاع ──────────────────────────────────────────────────── */

renderTodayLabel();
updatePill();
updatePriorityPill();
renderCal();
loadTasks();
updateUI();
moveIndicator(false);
scheduleMidnight();

window.addEventListener('resize', function () {
    moveIndicator(false);
    if (sheetOpen) placeSheet();
});
if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { moveIndicator(false); });
}
