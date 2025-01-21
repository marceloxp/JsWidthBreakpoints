class JsWidthBreakPoints {
    // Default settings
    static defaults = {
        widths: [],               // Array of breakpoints (e.g., [400, 600, 800])
        onBreakPoint: null,       // Callback executed when a breakpoint is reached
        applyClasses: true,       // Dynamically apply CSS classes
        classPrefix: 'width-',    // Prefix for CSS classes
        rule: {                   // Rule configuration
            show: false,          // Whether to display the rule
            opacity: 1,           // Opacity of the rule
            color: 'red',         // Color of the rule
        },
    };

    // Initialize the library
    static init(options = {}) {
        // Merge default options with user-provided options
        this.options = { ...this.defaults, ...options };

        // Sort breakpoints in descending order
        this.breakpoints = this.options.widths.sort((a, b) => b - a);

        // Store the length of the breakpoints array
        this.breakpoints_length = this.breakpoints.length;

        // Get the biggest breakpoint
        this.biggestBreakpoint = this.breakpoints[0];

        // Get the smallest breakpoint
        this.smallestBreakpoint = this.breakpoints[this.breakpoints_length - 1];

        // Check if the callback is a function
        this.hasCallback = typeof this.options.onBreakPoint === 'function';

        // Get the current window width
        this.currentWidth = this.getWindowWidth();

        // Get all possible breakpoint class names
        this.allBreakpointClasses = this.getAllBreakpointClasses();

        // Store the current class name
        this.currentClass = null;

        // Set up the window resize listener
        this.setupEventListeners();

        // Check and apply breakpoints immediately
        this.checkBreakPoints(true); // Pass `true` to force callback execution

        // Initialize the rule if enabled
        if (this.options.rule.show) {
            this.injectRuleStyles(); // Inject CSS styles
            this.createRule();       // Create the rule
        }
    }

    // Get all possibles breakpoint class names
    static getAllBreakpointClasses() {
        const result = [
            `lt${this.smallestBreakpoint}`,
            `gt${this.biggestBreakpoint}`,
        ];

        for (let i = this.breakpoints_length - 1; i > 0; i--) {
            result.push(`b${this.breakpoints[i]}a${this.breakpoints[i - 1]}`);
        }

        return result;
    }

    // Get the current window width
    static getWindowWidth() {
        return window.innerWidth; // Use window.innerWidth directly
    }

    // Set up the window resize listener
    static setupEventListeners() {
        window.addEventListener('resize', () => {
            this.checkBreakPoints();
        });
    }

    // Check breakpoints and execute actions
    static checkBreakPoints(forceCallback = false) {
        const newWidth = this.getWindowWidth();

        // Check if the width has changed or if the callback should be forced
        if (newWidth !== this.currentWidth || forceCallback) {
            this.currentWidth = newWidth;
            const breakpoint = this.getCurrentBreakpoint();

            // Apply CSS classes if enabled
            if (this.options.applyClasses) {
                // Check if the breakpoint has changed
                if (breakpoint !== this.currentClass) {
                    const oldBreakpoint = this.currentClass;
                    this.currentClass = breakpoint;

                    // Execute the callback if defined
                    if (this.hasCallback) {
                        this.options.onBreakPoint({
                            oldBreakpoint: oldBreakpoint || '',
                            currentWidth: this.currentWidth,
                            currentBreakpoint: breakpoint,
                        });
                    }

                    // Apply CSS classes based on the breakpoint
                    this.applyBreakpointClasses(breakpoint);
                }
            }
        }
    }

    // Get the current breakpoint
    static getCurrentBreakpoint() {
        if (this.currentWidth <= this.smallestBreakpoint) {
            return `lt${this.smallestBreakpoint}`;
        } else if (this.currentWidth >= this.biggestBreakpoint) {
            return `gt${this.biggestBreakpoint}`;
        } else {
            for (let i = 0; i < this.breakpoints_length; i++) {
                if (this.currentWidth >= this.breakpoints[i]) {
                    return `b${this.breakpoints[i]}a${this.breakpoints[i - 1]}`;
                }
            }
        }
        return null;
    }

    // Apply CSS classes based on the breakpoint
    static applyBreakpointClasses(breakpoint) {
        const body = document.body;
        const classPrefix = this.options.classPrefix;

        // Remove old classes
        this.allBreakpointClasses.forEach((cls) => {
            body.classList.remove(`${classPrefix}${cls}`);
        });

        // Add the new class
        if (breakpoint) {
            body.classList.add(`${classPrefix}${breakpoint}`);
        }
    }

    // Inject CSS styles for the rule
    static injectRuleStyles() {
        const styleId = 'jsWidthBreakPointsRuleStyles';
        if (document.getElementById(styleId)) return; // Avoid duplicate injection

        const styles = `
            .jsWidthBreakPoints-rule {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none; /* Ensure the rule doesn't interfere with clicks */
                z-index: 1000;
            }

            .jsWidthBreakPoints-rule-line {
                position: absolute;
                top: 0;
                height: 100%;
                width: 1px;
                background-color: ${this.options.rule.color};
                opacity: ${this.options.rule.opacity};
            }

            .jsWidthBreakPoints-rule-label {
                position: absolute;
                top: 10px;
                left: 5px;
                background-color: dimgrey;
                color: white;
                padding: 2px 5px;
                font-size: 12px;
                border-radius: 3px;
                shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                opacity: ${this.options.rule.opacity};
            }
        `;

        const styleElement = document.createElement('style');
        styleElement.id = styleId;
        styleElement.textContent = styles;
        document.head.appendChild(styleElement);
    }

    // Create the rule (régua)
    static createRule() {
        const ruleContainer = document.createElement('div');
        ruleContainer.className = 'jsWidthBreakPoints-rule';

        // Add lines for each breakpoint
        this.breakpoints.forEach((width) => {
            const line = document.createElement('div');
            line.className = 'jsWidthBreakPoints-rule-line';
            line.style.left = `${width}px`;

            const label = document.createElement('div');
            label.className = 'jsWidthBreakPoints-rule-label';
            label.textContent = `${width}px`;
            label.style.left = `${width + 5}px`; // Offset the label slightly

            ruleContainer.appendChild(line);
            ruleContainer.appendChild(label);
        });

        // Add the rule container to the body
        document.body.appendChild(ruleContainer);
    }
}

// Expose the class globally
window.JsWidthBreakPoints = JsWidthBreakPoints;