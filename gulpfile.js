const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const concat = require('gulp-concat');
const terser = require('gulp-terser');
const rename = require('gulp-rename');
const package = require('./package.json');
const settingsPath = path.join(__dirname, '.vscode', 'settings.json');

// Tarefa principal: compila e minifica o código
function build() {
    return gulp
        .src('src/jsWidthBreakPoints.js') // Arquivo de entrada
        .pipe(concat('jsWidthBreakPoints.js')) // Concatena (útil se houver múltiplos arquivos)
        .pipe(gulp.dest('dist')) // Salva o arquivo não minificado
        .pipe(terser()) // Minifica o código usando Terser
        .pipe(rename({ suffix: '.min' })) // Adiciona o sufixo .min ao nome do arquivo
        .pipe(gulp.dest('dist')); // Salva o arquivo minificado
}

async function updateStatusBar() {
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));

    const version = package.version;
    settings.statusbartext = {
        active: true,
        text: `🏷️ jsWidthBreakPoints v${version}`
    };

    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 4));
    console.log(`Status bar updated to version v${version}`);

    await Promise.resolve();
}

// Tarefa padrão: executa a tarefa de build
exports.default = build;
exports.updateStatusBar = updateStatusBar;