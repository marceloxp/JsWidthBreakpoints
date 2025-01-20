class JsWidthBreakPoints {
    // Configurações padrão
    static defaults = {
        widths: [],               // Array de breakpoints (ex: [400, 600, 800])
        syncWidthMediaQuery: false, // Sincronizar com media queries CSS
        onBreakPoint: null,       // Callback executado ao atingir um breakpoint
        applyClasses: true,       // Aplicar classes CSS dinamicamente
        classPrefix: 'width-',    // Prefixo para as classes CSS
    };

    // Inicializa a biblioteca
    static init(options = {}) {
        this.options = { ...this.defaults, ...options };
        this.breakpoints = this.options.widths.sort((a, b) => b - a); // Ordena breakpoints
        this.currentWidth = this.getWindowWidth();
        this.setupEventListeners();
        this.checkBreakPoints(); // Verifica breakpoints ao carregar a página
    }

    // Obtém a largura atual da janela
    static getWindowWidth() {
        return this.options.syncWidthMediaQuery
            ? window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
            : window.innerWidth;
    }

    // Configura o listener de redimensionamento da janela
    static setupEventListeners() {
        window.addEventListener('resize', () => {
            this.checkBreakPoints();
        });
    }

    // Verifica os breakpoints e executa ações
    static checkBreakPoints() {
        const newWidth = this.getWindowWidth();
        if (newWidth !== this.currentWidth) {
            this.currentWidth = newWidth;
            const breakpoint = this.getCurrentBreakpoint();

            // Executa o callback, se definido
            if (typeof this.options.onBreakPoint === 'function') {
                this.options.onBreakPoint({
                    currentWidth: this.currentWidth,
                    breakpoint: breakpoint,
                });
            }

            // Aplica classes CSS, se habilitado
            if (this.options.applyClasses) {
                this.applyBreakpointClasses(breakpoint);
            }
        }
    }

    // Retorna o breakpoint atual
    static getCurrentBreakpoint() {
        if (this.currentWidth <= this.breakpoints[this.breakpoints.length - 1]) {
            return `lt${this.breakpoints[this.breakpoints.length - 1]}`;
        } else if (this.currentWidth >= this.breakpoints[0]) {
            return `gt${this.breakpoints[0]}`;
        } else {
            for (let i = 0; i < this.breakpoints.length; i++) {
                if (this.currentWidth >= this.breakpoints[i]) {
                    return `b${this.breakpoints[i]}a${this.breakpoints[i - 1]}`;
                }
            }
        }
        return null;
    }

    // Aplica classes CSS com base no breakpoint
    static applyBreakpointClasses(breakpoint) {
        const body = document.body;
        const classPrefix = this.options.classPrefix;

        // Remove classes antigas
        body.classList.remove(
            ...Array.from(body.classList).filter((cls) => cls.startsWith(classPrefix))
        );

        // Adiciona a nova classe
        if (breakpoint) {
            body.classList.add(`${classPrefix}${breakpoint}`);
        }
    }
}

// Expõe a classe globalmente
window.JsWidthBreakPoints = JsWidthBreakPoints;