const tapFeedbackClass = 'tap-feedback-active';
const tapFeedbackSelector = [
    'button',
    'a[href]',
    '[role="button"]',
    'input[type="button"]',
    'input[type="submit"]',
    'input[type="reset"]',
    '[data-tap-feedback]',
].join(', ');
const tapFeedbackDuration = 420;

export function setupTapFeedback() {
    if (typeof window === 'undefined' || window.__uangKuTapFeedbackBound) {
        return;
    }

    window.__uangKuTapFeedbackBound = true;

    const timers = new WeakMap();

    const findTarget = (eventTarget) => {
        if (!(eventTarget instanceof Element)) {
            return null;
        }

        const target = eventTarget.closest(tapFeedbackSelector);

        if (
            !target ||
            target.closest('[data-tap-feedback="false"]') ||
            target.matches(':disabled, [aria-disabled="true"]')
        ) {
            return null;
        }

        return target;
    };

    const showFeedback = (target) => {
        const currentTimer = timers.get(target);

        if (currentTimer) {
            window.clearTimeout(currentTimer);
        }

        target.classList.remove(tapFeedbackClass);
        target.getBoundingClientRect();
        target.classList.add(tapFeedbackClass);

        const nextTimer = window.setTimeout(() => {
            target.classList.remove(tapFeedbackClass);
            timers.delete(target);
        }, tapFeedbackDuration);

        timers.set(target, nextTimer);
    };

    document.addEventListener(
        'pointerdown',
        (event) => {
            if (event.pointerType === 'mouse' && event.button !== 0) {
                return;
            }

            const target = findTarget(event.target);

            if (target) {
                showFeedback(target);
            }
        },
        { capture: true, passive: true },
    );

    document.addEventListener(
        'keydown',
        (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') {
                return;
            }

            const target = findTarget(event.target);

            if (target) {
                showFeedback(target);
            }
        },
        { capture: true },
    );
}
