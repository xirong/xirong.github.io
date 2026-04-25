/**
 * 宇宙能量补给闸门
 * 用法：
 * LearningGate.require({ gateId: 'solar-system-entry', planId: 'space-energy-math-10', onPass })
 */
(function () {
    const DATA = window.LearningGateData || {};
    const STORAGE_PREFIX = 'zt-learning-gate';
    const DEFAULT_PLAN_ID = DATA.defaultPlanId || 'space-energy-math-10';
    const DEFAULT_COOLDOWN_HOURS = Number.isFinite(DATA.defaultCooldownHours) ? DATA.defaultCooldownHours : 24;

    let activeSession = null;
    let currentGateAudio = null;

    function requireGate(options) {
        const gateOptions = options || {};
        const planId = gateOptions.planId || DEFAULT_PLAN_ID;
        const plan = getPlan(planId);

        if (!plan) {
            runPassCallback(gateOptions);
            return Promise.resolve({ status: 'missing-plan', planId });
        }

        if (!gateOptions.force && isWithinCooldown(planId, plan, gateOptions)) {
            runPassCallback(gateOptions);
            return Promise.resolve({ status: 'cooldown', planId });
        }

        if (activeSession) {
            return activeSession.promise.then(() => requireGate(gateOptions));
        }

        const questions = buildQuestionSet(plan);
        if (!questions.length) {
            runPassCallback(gateOptions);
            return Promise.resolve({ status: 'empty-plan', planId });
        }

        let resolveSession;
        const promise = new Promise(resolve => {
            resolveSession = resolve;
        });

        activeSession = {
            planId,
            plan,
            options: gateOptions,
            questions,
            index: 0,
            wrongAttempts: 0,
            locked: false,
            root: null,
            answerButtons: [],
            resolve: resolveSession,
            promise
        };

        renderGate(activeSession);
        return promise;
    }

    function getPlan(planId) {
        return DATA.plans && DATA.plans[planId] ? DATA.plans[planId] : null;
    }

    function getCooldownHours(plan, options) {
        const value = options.cooldownHours ?? plan.cooldownHours ?? DEFAULT_COOLDOWN_HOURS;
        const hours = Number(value);
        return Number.isFinite(hours) ? Math.max(0, hours) : DEFAULT_COOLDOWN_HOURS;
    }

    function getCompletionScope(plan, options) {
        return options.completionScope || plan.completionScope || 'plan';
    }

    function getStorageKey(planId, plan, options) {
        const scope = getCompletionScope(plan, options);
        if (scope === 'gate') {
            return `${STORAGE_PREFIX}:${planId}:${options.gateId || 'default'}`;
        }
        return `${STORAGE_PREFIX}:${planId}`;
    }

    function readProgress(planId, plan, options) {
        try {
            const raw = window.localStorage.getItem(getStorageKey(planId, plan, options));
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            return null;
        }
    }

    function writeProgress(session) {
        try {
            const payload = {
                planId: session.planId,
                gateId: session.options.gateId || 'default',
                completedAt: Date.now(),
                questionCount: session.questions.length,
                wrongAttempts: session.wrongAttempts
            };
            window.localStorage.setItem(
                getStorageKey(session.planId, session.plan, session.options),
                JSON.stringify(payload)
            );
        } catch (error) {
            // localStorage 不可用时也允许继续放行，避免页面被卡住。
        }
    }

    function isWithinCooldown(planId, plan, options) {
        const cooldownHours = getCooldownHours(plan, options);
        if (cooldownHours <= 0) return false;

        const progress = readProgress(planId, plan, options);
        if (!progress || !Number.isFinite(progress.completedAt)) return false;

        const elapsed = Date.now() - progress.completedAt;
        return elapsed >= 0 && elapsed < cooldownHours * 60 * 60 * 1000;
    }

    function resetProgress(planId, options) {
        const targetPlanId = planId || DEFAULT_PLAN_ID;
        const plan = getPlan(targetPlanId);
        if (!plan) return;
        const resetOptions = options || {};
        try {
            window.localStorage.removeItem(getStorageKey(targetPlanId, plan, resetOptions));
        } catch (error) {
            // ignore
        }
    }

    function getRemainingMs(planId, options) {
        const targetPlanId = planId || DEFAULT_PLAN_ID;
        const plan = getPlan(targetPlanId);
        if (!plan) return 0;

        const gateOptions = options || {};
        const cooldownHours = getCooldownHours(plan, gateOptions);
        const progress = readProgress(targetPlanId, plan, gateOptions);
        if (!progress || !Number.isFinite(progress.completedAt)) return 0;

        return Math.max(0, progress.completedAt + cooldownHours * 60 * 60 * 1000 - Date.now());
    }

    function buildQuestionSet(plan) {
        const selected = [];
        const answerRange = plan.answerRange || { min: 0, max: 20 };

        (plan.sections || []).forEach(section => {
            const bank = DATA.questionBanks && DATA.questionBanks[section.kind]
                ? DATA.questionBanks[section.kind]
                : [];
            const pool = shuffle(bank.filter(question => (
                question.kind === section.kind &&
                question.type === section.type &&
                isAnswerInRange(question.answer, answerRange)
            )));

            for (let i = 0; i < section.count; i++) {
                if (!pool.length) break;
                const sourceQuestion = pool[i % pool.length];
                selected.push({
                    ...sourceQuestion,
                    sectionLabel: section.label || sourceQuestion.type,
                    sessionId: `${sourceQuestion.id}-${section.type}-${i}`
                });
            }
        });

        return selected;
    }

    function isAnswerInRange(answer, range) {
        const value = Number(answer);
        const min = Number.isFinite(range.min) ? range.min : 0;
        const max = Number.isFinite(range.max) ? range.max : 20;
        return Number.isFinite(value) && value >= min && value <= max;
    }

    function shuffle(items) {
        const copy = items.slice();
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    }

    function renderGate(session) {
        const plan = session.plan;
        const root = document.createElement('div');
        root.className = 'learning-gate';
        root.setAttribute('role', 'dialog');
        root.setAttribute('aria-modal', 'true');
        root.setAttribute('aria-labelledby', 'learningGateTitle');
        root.innerHTML = `
            <div class="learning-gate-shell">
                <header class="learning-gate-header">
                    <div class="learning-gate-kicker">能量核心</div>
                    <h2 class="learning-gate-title" id="learningGateTitle"></h2>
                    <p class="learning-gate-subtitle"></p>
                </header>
                <section class="learning-gate-meter" aria-label="能量进度">
                    <div class="learning-gate-meter-row">
                        <span class="learning-gate-progress-text"></span>
                        <span class="learning-gate-energy-text"></span>
                    </div>
                    <div class="learning-gate-meter-track">
                        <div class="learning-gate-meter-fill"></div>
                    </div>
                </section>
                <main class="learning-gate-card">
                    <div class="learning-gate-meta">
                        <span class="learning-gate-type"></span>
                        <span class="learning-gate-source"></span>
                        <button class="learning-gate-audio-btn" type="button" aria-label="听题目">听题目</button>
                    </div>
                    <p class="learning-gate-question"></p>
                    <div class="learning-gate-expression" aria-live="polite"></div>
                    <div class="learning-gate-visual" aria-label="数一数星球" hidden></div>
                    <div class="learning-gate-answer-pad" aria-label="选择答案"></div>
                    <div class="learning-gate-feedback" aria-live="polite"></div>
                </main>
                <footer class="learning-gate-footer">10 个能量题全部点亮后，就可以继续探索</footer>
            </div>
        `;

        root.querySelector('.learning-gate-title').textContent = plan.title || '宇宙能量补给';
        root.querySelector('.learning-gate-subtitle').textContent = plan.subtitle || '先补满能量，再继续探索';
        session.root = root;
        document.body.appendChild(root);
        document.body.classList.add('learning-gate-open');

        root.querySelector('.learning-gate-audio-btn').addEventListener('click', () => {
            const question = session.questions[session.index];
            if (question) playQuestionAudio(question);
        });

        createAnswerButtons(session);
        renderCurrentQuestion(session);
    }

    function createAnswerButtons(session) {
        const range = session.plan.answerRange || { min: 0, max: 20 };
        const min = Number.isFinite(range.min) ? range.min : 0;
        const max = Number.isFinite(range.max) ? range.max : 20;
        const pad = session.root.querySelector('.learning-gate-answer-pad');

        for (let value = min; value <= max; value++) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'learning-gate-answer';
            button.textContent = value;
            button.dataset.value = String(value);
            button.setAttribute('aria-label', `答案 ${value}`);
            button.addEventListener('click', () => handleAnswer(session, value, button));
            pad.appendChild(button);
            session.answerButtons.push(button);
        }
    }

    function renderCurrentQuestion(session) {
        const question = session.questions[session.index];
        const total = session.questions.length;
        const completed = session.index;
        const percent = Math.round((completed / total) * 100);

        session.locked = false;
        session.answerButtons.forEach(button => {
            button.disabled = false;
            button.dataset.blocked = 'false';
            button.classList.remove('is-correct', 'is-wrong');
        });

        session.root.querySelector('.learning-gate-progress-text').textContent = `第 ${session.index + 1} / ${total} 题`;
        session.root.querySelector('.learning-gate-energy-text').textContent = `能量 ${percent}%`;
        session.root.querySelector('.learning-gate-meter-fill').style.width = `${percent}%`;
        session.root.querySelector('.learning-gate-type').textContent = question.sectionLabel || getQuestionTypeLabel(question);
        session.root.querySelector('.learning-gate-source').textContent = question.source || '';
        session.root.querySelector('.learning-gate-question').textContent = question.question;
        session.root.querySelector('.learning-gate-expression').textContent = formatExpression(question);
        renderMathVisual(session.root.querySelector('.learning-gate-visual'), question);
        const feedback = session.root.querySelector('.learning-gate-feedback');
        feedback.classList.remove('is-celebration');
        feedback.textContent = '选择正确数字，为飞船充能';
        playQuestionAudio(question);

        const firstButton = session.answerButtons[0];
        if (firstButton) {
            window.setTimeout(() => {
                try {
                    firstButton.focus({ preventScroll: true });
                } catch (error) {
                    firstButton.focus();
                }
            }, 0);
        }
    }

    function getQuestionTypeLabel(question) {
        if (question.type === 'add') return '加法能量';
        if (question.type === 'sub') return '减法能量';
        if (question.type === 'sequential') return '连续加减法';
        return '能量题';
    }

    function formatExpression(question) {
        if (question.expression) {
            return `${question.expression} = ?`;
        }
        return '?';
    }

    function renderMathVisual(container, question) {
        if (!container) return;

        const model = buildMathVisualModel(question);
        container.innerHTML = '';

        if (!model) {
            container.hidden = true;
            return;
        }

        container.hidden = false;
        const steps = document.createElement('div');
        steps.className = 'learning-gate-visual-steps';

        model.steps.forEach((step, index) => {
            steps.appendChild(createVisualStep(step, index, model.steps.length));
        });

        container.appendChild(steps);
    }

    function buildMathVisualModel(question) {
        if (!question || question.kind !== 'math' || !question.expression || question.visual === false) {
            return null;
        }

        const parts = String(question.expression).match(/\d+|[+-]/g);
        if (!parts || parts.length < 3) return null;

        let current = Number(parts[0]);
        if (!Number.isInteger(current) || current < 0 || current > 20) return null;

        const steps = [];
        for (let i = 1; i < parts.length; i += 2) {
            const operator = parts[i];
            const amount = Number(parts[i + 1]);

            if ((operator !== '+' && operator !== '-') || !Number.isInteger(amount) || amount < 0 || amount > 20) {
                return null;
            }

            const previous = current;
            const next = operator === '+' ? previous + amount : previous - amount;
            if (next < 0 || next > 20) return null;

            steps.push({
                operator,
                previous,
                amount,
                next
            });
            current = next;
        }

        return steps.length ? { steps } : null;
    }

    function createVisualStep(step, index, total) {
        const card = document.createElement('section');
        card.className = 'learning-gate-visual-step';
        card.setAttribute('aria-label', buildVisualStepLabel(step, index));

        const title = document.createElement('div');
        title.className = 'learning-gate-visual-title';
        title.textContent = buildVisualStepTitle(step, index, total);

        const body = document.createElement('div');
        body.className = 'learning-gate-visual-body';

        if (step.operator === '+') {
            body.appendChild(createPlanetGroup(step.previous, '原来', 'base'));
            body.appendChild(createVisualOperator('+'));
            body.appendChild(createPlanetGroup(step.amount, '又来', 'added'));
        } else {
            body.appendChild(createPlanetGroup(step.previous, '先有', 'base', step.amount));
            body.appendChild(createTakeAwayMarker(step.amount));
        }

        const result = document.createElement('div');
        result.className = 'learning-gate-visual-result';
        result.textContent = step.operator === '+'
            ? '把两边星球都数一数'
            : '只数没有划掉的星球';

        card.append(title, body, result);
        return card;
    }

    function buildVisualStepTitle(step, index, total) {
        const prefix = total > 1 ? `第 ${index + 1} 步：` : '';
        if (step.operator === '+') {
            return `${prefix}${step.previous} 个，再来 ${step.amount} 个`;
        }
        return `${prefix}${step.previous} 个，拿走 ${step.amount} 个`;
    }

    function buildVisualStepLabel(step, index) {
        const action = step.operator === '+' ? '加上' : '拿走';
        return `第${index + 1}步，${step.previous}个，${action}${step.amount}个`;
    }

    function createPlanetGroup(count, label, tone, crossedCount, allCrossed) {
        const group = document.createElement('div');
        group.className = `learning-gate-planet-group is-${tone}`;

        const planets = document.createElement('div');
        planets.className = 'learning-gate-planets';

        for (let i = 0; i < count; i++) {
            const planet = document.createElement('span');
            planet.className = 'learning-gate-planet';
            if (allCrossed || (crossedCount && i >= count - crossedCount)) {
                planet.classList.add('is-crossed');
            }
            planets.appendChild(planet);
        }

        const caption = document.createElement('div');
        caption.className = 'learning-gate-planet-caption';
        caption.textContent = `${label} ${count} 个`;

        group.append(planets, caption);
        return group;
    }

    function createVisualOperator(operator) {
        const element = document.createElement('div');
        element.className = 'learning-gate-visual-operator';
        element.textContent = operator;
        return element;
    }

    function createTakeAwayMarker(amount) {
        const element = document.createElement('div');
        element.className = 'learning-gate-take-away';
        element.textContent = `划掉 ${amount} 个`;
        return element;
    }

    function handleAnswer(session, value, button) {
        if (session.locked || button.disabled) return;

        const question = session.questions[session.index];
        if (Number(value) === Number(question.answer)) {
            handleCorrectAnswer(session, button);
            return;
        }

        handleWrongAnswer(session, button, question);
    }

    function handleCorrectAnswer(session, button) {
        session.locked = true;
        button.classList.add('is-correct');
        setAllButtonsDisabled(session, true);

        const total = session.questions.length;
        const nextCompleted = session.index + 1;
        const percent = Math.round((nextCompleted / total) * 100);
        session.root.querySelector('.learning-gate-energy-text').textContent = `能量 ${percent}%`;
        session.root.querySelector('.learning-gate-meter-fill').style.width = `${percent}%`;
        const feedback = session.root.querySelector('.learning-gate-feedback');
        feedback.textContent = getProgressEncouragement(nextCompleted, total);
        feedback.classList.add('is-celebration');

        window.setTimeout(() => {
            session.index += 1;
            if (session.index >= session.questions.length) {
                completeSession(session);
            } else {
                renderCurrentQuestion(session);
            }
        }, session.plan.correctDelayMs || 620);
    }

    function getProgressEncouragement(completed, total) {
        const remaining = Math.max(0, total - completed);
        if (completed >= total) return '能量充满，可以出发探索太阳系了';
        if (completed === Math.ceil(total / 2)) return `完成一半了，还剩 ${remaining} 题，飞船已经亮起来了`;
        if (completed === 3) return `已经完成 3 题，还剩 ${remaining} 题，能量核心开始发光`;
        if (remaining === 2) return '只差 2 题就能出发，坚持住';
        if (remaining === 1) return '最后 1 题，马上打开宇宙入口';
        return `答对了，还剩 ${remaining} 题，能量继续上升`;
    }

    function handleWrongAnswer(session, button, question) {
        session.locked = true;
        session.wrongAttempts += 1;
        button.classList.add('is-wrong');
        button.dataset.blocked = 'true';
        setAllButtonsDisabled(session, true);

        const hintText = question.hint ? `再想一下：${question.hint}` : '再想一下，能量还差一点';
        const feedback = session.root.querySelector('.learning-gate-feedback');
        feedback.classList.remove('is-celebration');
        feedback.textContent = hintText;
        playQuestionHint(question);

        window.setTimeout(() => {
            session.locked = false;
            session.answerButtons.forEach(answerButton => {
                answerButton.disabled = answerButton.dataset.blocked === 'true';
            });
        }, session.plan.wrongLockMs || 650);
    }

    function setAllButtonsDisabled(session, disabled) {
        session.answerButtons.forEach(button => {
            button.disabled = disabled;
        });
    }

    function completeSession(session) {
        stopGateAudio();
        writeProgress(session);
        const root = session.root;
        const options = session.options;
        const planId = session.planId;

        root.querySelector('.learning-gate-shell').classList.add('learning-gate-complete');
        window.setTimeout(() => {
            root.remove();
            document.body.classList.remove('learning-gate-open');
            activeSession = null;
            session.resolve({ status: 'passed', planId, wrongAttempts: session.wrongAttempts });
            runPassCallback(options);
        }, 380);
    }

    function runPassCallback(options) {
        if (typeof options.onPass === 'function') {
            options.onPass();
        }
    }

    function playQuestionAudio(question) {
        const text = buildQuestionSpeechText(question);
        playGateAudio(getQuestionAudioPath(question), text);
    }

    function playQuestionHint(question) {
        if (!question.hint) return;
        playGateAudio(getQuestionHintAudioPath(question), question.hint);
    }

    function getQuestionAudioPath(question) {
        return question.audio || `audio/learning-gate/${question.id}.mp3`;
    }

    function getQuestionHintAudioPath(question) {
        return question.hintAudio || `audio/learning-gate/${question.id}-hint.mp3`;
    }

    function buildQuestionSpeechText(question) {
        const parts = [question.question];
        if (question.expression) {
            parts.push(toSpeechExpression(question.expression));
        }
        return parts.join('。');
    }

    function toSpeechExpression(expression) {
        if (!expression) return '';
        return expression
            .replace(/\s+/g, '')
            .replace(/\+/g, '加')
            .replace(/-/g, '减') + '等于几';
    }

    function playGateAudio(audioPath, fallbackText) {
        stopGateAudio();

        const audio = new Audio(audioPath);
        let fallbackStarted = false;
        const fallback = () => {
            if (fallbackStarted) return;
            fallbackStarted = true;
            speakFallback(fallbackText);
        };

        currentGateAudio = audio;
        audio.onerror = fallback;
        audio.play().catch(fallback);
    }

    function stopGateAudio() {
        if (currentGateAudio) {
            currentGateAudio.pause();
            currentGateAudio = null;
        }

        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    }

    function speakFallback(text) {
        if (!text || !window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        window.setTimeout(() => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'zh-CN';
            utterance.rate = 0.86;
            utterance.pitch = 1.12;
            window.speechSynthesis.speak(utterance);
        }, 50);
    }

    window.LearningGate = {
        require: requireGate,
        resetProgress,
        getRemainingMs
    };
})();
