/**
 * @jest-environment jsdom
 */

// Load the script
require('../src/JsWidthBreakpoints.js');

describe('JsWidthBreakpoints', () => {
    const originalInnerWidth = window.innerWidth;

    // Helper to simulate resize
    const triggerResize = (width) => {
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: width,
        });
        window.dispatchEvent(new Event('resize'));
    };

    beforeEach(() => {
        // Full state reset
        if (window.JsWidthBreakpoints && window.JsWidthBreakpoints._isInitialized) {
            window.JsWidthBreakpoints._isInitialized = false;
        }
        document.body.className = '';

        // Remove ruler and styles
        const oldRule = document.querySelector('.JsWidthBreakpoints-rule');
        if (oldRule) oldRule.remove();

        const oldStyle = document.getElementById('jsWidthBreakpointsRuleStyles');
        if (oldStyle) oldStyle.remove();

        jest.clearAllMocks();
    });

    afterEach(() => {
        // Restore original innerWidth
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: originalInnerWidth,
        });
    });

    describe('Initialization', () => {
        it('does not initialize if there are no valid breakpoints', () => {
            const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });

            window.JsWidthBreakpoints.init({ widths: [] });

            expect(window.JsWidthBreakpoints._isInitialized).toBe(true);
            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining('No valid breakpoints provided')
            );

            warnSpy.mockRestore();
        });

        it('initializes correctly with valid breakpoints', () => {
            window.JsWidthBreakpoints.init({ widths: [400, 768] });

            expect(window.JsWidthBreakpoints.breakpoints).toEqual([768, 400]);
            expect(window.JsWidthBreakpoints._isInitialized).toBe(true);
        });
    });

    describe('getCurrentBreakpoint', () => {
        beforeEach(() => {
            window.JsWidthBreakpoints.init({
                widths: [400, 600, 800],
                applyClasses: false,
            });
        });

        it.each([
            [300, 'lt400'],
            [400, 'lt400'],
            [500, 'b400a600'],
            [600, 'b600a800'],
            [799, 'b600a800'],
            [800, 'gt800'],
            [1200, 'gt800'],
        ])('for width %i returns %s', (width, expected) => {
            triggerResize(width);
            // Force verification
            window.JsWidthBreakpoints.checkBreakpoints();
            expect(window.JsWidthBreakpoints.currentClass).toBe(expected);
        });
    });

    describe('Class application', () => {
        beforeEach(() => {
            window.JsWidthBreakpoints.init({
                widths: [400, 600],
                applyClasses: true,
                classPrefix: 'test-',
            });
        });

        it('applies correct class', () => {
            triggerResize(350);
            window.JsWidthBreakpoints.checkBreakpoints();

            expect(document.body.classList.contains('test-lt400')).toBe(true);
            expect(document.body.classList.contains('test-b400a600')).toBe(false);
        });

        it('removes previous class when changing', () => {
            triggerResize(350);
            window.JsWidthBreakpoints.checkBreakpoints();
            expect(document.body.classList.contains('test-lt400')).toBe(true);

            triggerResize(550);
            window.JsWidthBreakpoints.checkBreakpoints();

            expect(document.body.classList.contains('test-lt400')).toBe(false);
            expect(document.body.classList.contains('test-b400a600')).toBe(true);
        });
    });

    describe('Callback', () => {
        let mockCallback;

        beforeEach(() => {
            mockCallback = jest.fn();

            // Sets a specific initial width for tests
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 500, // starts in the middle (between 400 and 600)
            });

            window.JsWidthBreakpoints.init({
                widths: [400, 600],
                onBreakPoint: mockCallback,
            });

            // Clears startup calls
            mockCallback.mockClear();
        });

        it('calls callback when changing to lt400', () => {
            triggerResize(350); // change to lt400
            window.JsWidthBreakpoints.checkBreakpoints();

            expect(mockCallback).toHaveBeenCalledTimes(1);
            expect(mockCallback).toHaveBeenCalledWith(
                expect.objectContaining({
                    oldBreakpoint: 'b400a600', // was in the middle
                    currentWidth: 350,
                    currentBreakpoint: 'lt400',
                })
            );
        });

        it('calls callback when changing to b400a600', () => {
            triggerResize(450); // still in the middle? No, it's already in the middle, so don't call
            window.JsWidthBreakpoints.checkBreakpoints();

            expect(mockCallback).toHaveBeenCalledTimes(0); // hasn't changed

            triggerResize(350); // go to lt400
            window.JsWidthBreakpoints.checkBreakpoints();
            expect(mockCallback).toHaveBeenCalledTimes(1);

            triggerResize(450); // return to the middle
            window.JsWidthBreakpoints.checkBreakpoints();
            expect(mockCallback).toHaveBeenCalledTimes(2);
            expect(mockCallback).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    oldBreakpoint: 'lt400',
                    currentWidth: 450,
                    currentBreakpoint: 'b400a600',
                })
            );
        });

        it('calls callback when changing to gt600', () => {
            triggerResize(650); // change to gt600
            window.JsWidthBreakpoints.checkBreakpoints();

            expect(mockCallback).toHaveBeenCalledTimes(1);
            expect(mockCallback).toHaveBeenCalledWith(
                expect.objectContaining({
                    oldBreakpoint: 'b400a600', // was in the middle
                    currentWidth: 650,
                    currentBreakpoint: 'gt600',
                })
            );
        });

        it('does not call callback if it has not changed', () => {
            triggerResize(450); // same breakpoint (b400a600)
            window.JsWidthBreakpoints.checkBreakpoints();

            expect(mockCallback).not.toHaveBeenCalled(); // 0 calls

            triggerResize(550); // still b400a600
            window.JsWidthBreakpoints.checkBreakpoints();

            expect(mockCallback).not.toHaveBeenCalled(); // continue 0
        });
    });

    describe('Visual ruler', () => {
        it('creates ruler elements when rule.show = true', () => {
            window.JsWidthBreakpoints.init({
                widths: [400, 600],
                rule: { show: true },
            });

            const container = document.querySelector('.JsWidthBreakpoints-rule');
            expect(container).not.toBeNull();

            const lines = document.querySelectorAll('.JsWidthBreakpoints-rule-line');
            expect(lines.length).toBe(2);
        });

        it('does not create ruler when rule.show = false', () => {
            window.JsWidthBreakpoints.init({
                widths: [400, 600],
                rule: { show: false },
            });

            const container = document.querySelector('.JsWidthBreakpoints-rule');
            expect(container).toBeNull();
        });
    });

    // No describe('Initialization')
    it('prevents double initialization', () => {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });

        window.JsWidthBreakpoints.init({ widths: [400] });
        window.JsWidthBreakpoints.init({ widths: [600] }); // segunda chamada

        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining('already initialized')
        );

        warnSpy.mockRestore();
    });

    // No describe('Visual ruler')
    it('creates labels for each breakpoint', () => {
        window.JsWidthBreakpoints.init({
            widths: [400, 600],
            rule: { show: true },
        });

        const labels = document.querySelectorAll('.JsWidthBreakpoints-rule-label');
        expect(labels.length).toBe(2);
        expect(labels[0].textContent).toBe('600px'); // ordem decrescente
        expect(labels[1].textContent).toBe('400px');
    });
});