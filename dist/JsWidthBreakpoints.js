/**
 * JsWidthBreakpoints - A lightweight, vanilla JavaScript library for handling responsive breakpoints with dynamic CSS classes and visual rules.
 * Version: 1.0.1
 * Repository: https://github.com/marceloxp/JsWidthBreakpoints
 * License: MIT
 * Author: Marcelo XP
 * Build Date: 2026-03-15
 */
class JsWidthBreakpoints {
    // Default settings
    static defaults = {
        widths: [],               // Array of breakpoints in pixels (e.g., [400, 600, 800, 1200])
        onBreakPoint: null,       // Callback function when breakpoint changes
        applyClasses: true,       // Whether to apply CSS classes to <body>
        classPrefix: 'width-',    // Prefix for generated CSS classes
        rule: {
            show: false,          // Whether to display the rule
            opacity: 1,           // Opacity of the rule
            color: 'red',         // Color of the rule
        },
    };

    // Flag to prevent multiple initializations
    static _isInitialized = false;

    // Initialize the library
    static init(options = {}) {
        if (this._isInitialized) {
            console.warn('JsWidthBreakpoints is already initialized. Ignoring subsequent init call.');
            return;
        }

        // Deep merge only on rule object
        const userOptions = options || {};
        const mergedRule = { ...this.defaults.rule, ...(userOptions.rule || {}) };

        this.options = {
            ...this.defaults,
            ...userOptions,
            rule: mergedRule,
        };

        // Sort breakpoints in descending order
        this.breakpoints = [...(this.options.widths || [])]
            .filter(v => Number.isInteger(v) && v > 0)
            .sort((a, b) => b - a);

        this.breakpoints_length = this.breakpoints.length;

        // Key decision: no valid breakpoints → doesn't initialize anything
        if (this.breakpoints_length === 0) {
            console.warn('JsWidthBreakpoints: No valid breakpoints provided. Library will not be activated.');
            this._isInitialized = true;
            return;
        }

        this.smallestBreakpoint = this.breakpoints[this.breakpoints_length - 1];
        this.biggestBreakpoint = this.breakpoints[0];
        this.allBreakpointClasses = this.getAllBreakpointClasses();

        // Check if the callback is a function
        this.hasCallback = typeof this.options.onBreakPoint === 'function';
        // Get the current window width
        this.currentWidth = this.getWindowWidth();
        // Store the current class name
        this.currentClass = null;

        // Set up the window resize listener
        this.setupEventListeners();

        // Check and apply breakpoints immediately
        this.checkBreakpoints();

        // Initialize the rule if enabled
        if (this.options.rule.show) {
            this.injectRuleStyles();
            this.createRule();
        }

        this._isInitialized = true;
    }

    // Get all possible breakpoint class names
    static getAllBreakpointClasses() {
        if (this.breakpoints_length === 0) return [];

        const result = [
            `lt${this.smallestBreakpoint}`,
            `gt${this.biggestBreakpoint}`,
        ];

        for (let i = 1; i < this.breakpoints_length; i++) {
            const lower = this.breakpoints[i];
            const higher = this.breakpoints[i - 1];
            result.push(`b${lower}a${higher}`);
        }

        return result;
    }

    // Get the current window width
    static getWindowWidth() {
        return window.innerWidth;
    }

    // Set up the window resize listener
    static setupEventListeners() {
        window.addEventListener('resize', () => this.checkBreakpoints());
    }

    // Main logic - simplified and callback always works
    static checkBreakpoints() {
        const newWidth = this.getWindowWidth();
        this.currentWidth = newWidth;

        const breakpoint = this.getCurrentBreakpoint();

        if (breakpoint !== this.currentClass) {
            const oldBreakpoint = this.currentClass || '';
            this.currentClass = breakpoint;

            // Execute the callback if defined
            if (this.hasCallback) {
                this.options.onBreakPoint({
                    oldBreakpoint,
                    currentWidth: newWidth,
                    currentBreakpoint: breakpoint,
                });
            }

            // Apply classes only if enabled
            if (this.options.applyClasses) {
                this.applyBreakpointClasses(breakpoint);
            }
        }
    }

    static getCurrentBreakpoint() {
        if (this.breakpoints_length === 0) return null;

        const w = this.currentWidth;

        if (w <= this.smallestBreakpoint) {
            return `lt${this.smallestBreakpoint}`;
        }

        if (w >= this.biggestBreakpoint) {
            return `gt${this.biggestBreakpoint}`;
        }

        for (let i = 1; i < this.breakpoints_length; i++) {
            const higher = this.breakpoints[i - 1];
            const lower = this.breakpoints[i];

            if (w >= lower && w < higher) {
                return `b${lower}a${higher}`;
            }
        }

        return null;
    }

    static applyBreakpointClasses(breakpoint) {
        const body = document.body;
        const prefix = this.options.classPrefix;

        // Remove all possible classes first
        this.allBreakpointClasses.forEach((cls) => {
            body.classList.remove(`${prefix}${cls}`);
        });

        // Add current one
        if (breakpoint) {
            body.classList.add(`${prefix}${breakpoint}`);
        }
    }

    static injectRuleStyles() {
        const styleId = 'jsWidthBreakpointsRuleStyles';
        if (document.getElementById(styleId)) return;

        const styles = `
            .JsWidthBreakpoints-rule {
                position: fixed;
                top: 0; left: 0;
                width: 100%; height: 100%;
                pointer-events: none;
                z-index: 1000;
            }
            .JsWidthBreakpoints-rule-line {
                position: absolute;
                top: 0; height: 100%;
                width: 1px;
                background-color: ${this.options.rule.color};
                opacity: ${this.options.rule.opacity};
            }
            .JsWidthBreakpoints-rule-label {
                position: absolute;
                top: 10px;
                left: 5px;
                background-color: dimgrey;
                color: white;
                padding: 4px 6px;
                font-size: 12px;
                border-radius: 3px;
                font-family: monospace;
                box-shadow: 1px 1px 1px 0px rgba(0,0,0,0.75);
                opacity: ${this.options.rule.opacity};
            }
        `;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = styles;
        document.head.appendChild(style);
    }

    static createRule() {
        const ruleContainer = document.createElement('div');
        ruleContainer.className = 'JsWidthBreakpoints-rule';

        // Lines from largest to smallest (visual order)
        this.breakpoints.forEach((width) => {
            const line = document.createElement('div');
            line.className = 'JsWidthBreakpoints-rule-line';
            line.style.left = `${width}px`;

            const label = document.createElement('div');
            label.className = 'JsWidthBreakpoints-rule-label';
            label.textContent = `${width}px`;
            label.style.left = `${width + 5}px`;

            ruleContainer.appendChild(line);
            ruleContainer.appendChild(label);
        });

        // Add the rule container to the body
        document.body.appendChild(ruleContainer);
    }
}

// Expose globally
window.JsWidthBreakpoints = JsWidthBreakpoints;