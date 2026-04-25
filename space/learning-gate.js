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

        return shuffle(selected);
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
        session.root.querySelector('.learning-gate-feedback').textContent = '选择正确数字，为飞船充能';
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
        session.root.querySelector('.learning-gate-feedback').textContent =
            nextCompleted === total ? '能量充满，准备出发' : '答对了，能量继续上升';

        window.setTimeout(() => {
            session.index += 1;
            if (session.index >= session.questions.length) {
                completeSession(session);
            } else {
                renderCurrentQuestion(session);
            }
        }, session.plan.correctDelayMs || 620);
    }

    function handleWrongAnswer(session, button, question) {
        session.locked = true;
        session.wrongAttempts += 1;
        button.classList.add('is-wrong');
        button.dataset.blocked = 'true';
        setAllButtonsDisabled(session, true);

        const hintText = question.hint ? `再想一下：${question.hint}` : '再想一下，能量还差一点';
        session.root.querySelector('.learning-gate-feedback').textContent = hintText;
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
