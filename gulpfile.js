const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const concat = require('gulp-concat');
const terser = require('gulp-terser');
const header = require('gulp-header');
const rename = require('gulp-rename');
const package = require('./package.json');
const settingsPath = path.join(__dirname, '.vscode', 'settings.json');

// Cabeçalho personalizado
const banner = `/**
 * JsWidthBreakpoints - A lightweight, vanilla JavaScript library for handling responsive breakpoints with dynamic CSS classes and visual rules.
 * Version: ${package.version}
 * Repository: https://github.com/marceloxp/JsWidthBreakpoints
 * License: MIT
 * Author: Marcelo XP
 * Build Date: ${new Date().toISOString().split('T')[0]}
 */
`;

// Tarefa principal: compila e minifica o código
function build() {
    return gulp
        .src('src/JsWidthBreakpoints.js') // Arquivo de entrada
        .pipe(concat('JsWidthBreakpoints.js')) // Concatena (útil se houver múltiplos arquivos)
        .pipe(terser()) // Minifica o código usando Terser
        .pipe(rename({ suffix: '.min' })) // Adiciona o sufixo .min ao nome do arquivo
        .pipe(header(banner))               // Adiciona o cabeçalho personalizado
        .pipe(gulp.dest('dist')); // Salva o arquivo minificado
}

async function updateStatusBar() {
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));

    const version = package.version;
    settings.statusbartext = {
        active: true,
        text: `🏷️ JsWidthBreakpoints v${version}`
    };

    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 4));
    console.log(`Status bar updated to version v${version}`);

    await Promise.resolve();
}

// Tarefa padrão: executa a tarefa de build
exports.default = build;
exports.updateStatusBar = updateStatusBar;