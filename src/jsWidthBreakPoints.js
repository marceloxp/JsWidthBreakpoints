class JsWidthBreakPoints {
    // Configurações padrão
    static defaults = {
        widths: [],               // Array de breakpoints (ex: [400, 600, 800])
        onBreakPoint: null,       // Callback executado ao atingir um breakpoint
        applyClasses: true,       // Aplicar classes CSS dinamicamente
        classPrefix: 'width-',    // Prefixo para as classes CSS
    };

    // Inicializa a biblioteca
    static init(options = {}) {
        // Mescla as opções padrão com as opções fornecidas pelo usuário
        this.options = { ...this.defaults, ...options };

        // Ordena os breakpoints em ordem decrescente
        this.breakpoints = this.options.widths.sort((a, b) => b - a);

        // Obtém a largura atual da janela
        this.currentWidth = this.getWindowWidth();

        // Guarda o nome da classe atual
        this.currentClass = null;

        // Configura o listener de redimensionamento da janela
        this.setupEventListeners();

        // Verifica e aplica os breakpoints imediatamente
        this.checkBreakPoints(true); // Passa `true` para forçar a execução do callback
    }

    // Obtém a largura atual da janela
    static getWindowWidth() {
        return window.innerWidth; // Usa window.innerWidth diretamente
    }

    // Configura o listener de redimensionamento da janela
    static setupEventListeners() {
        window.addEventListener('resize', () => {
            this.checkBreakPoints();
        });
    }

    // Verifica os breakpoints e executa ações
    static checkBreakPoints(forceCallback = false) {
        const newWidth = this.getWindowWidth();

        // Verifica se a largura mudou ou se o callback deve ser forçado
        if (newWidth !== this.currentWidth || forceCallback) {
            this.currentWidth = newWidth;
            const breakpoint = this.getCurrentBreakpoint();

            // Aplica classes CSS, se habilitado
            if (this.options.applyClasses) {
                // Verifica se o breakpoint mudou
                if (breakpoint !== this.currentClass) {
                    const oldBreakpoint = this.currentClass;
                    this.currentClass = breakpoint;

                    // Executa o callback, se definido
                    if (typeof this.options.onBreakPoint === 'function') {
                        this.options.onBreakPoint({
                            oldBreakpoint: oldBreakpoint || '',
                            currentWidth: this.currentWidth,
                            currentBreakpoint: breakpoint,
                        });
                    }

                    // Aplica classes CSS com base no breakpoint
                    this.applyBreakpointClasses(breakpoint);
                }
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