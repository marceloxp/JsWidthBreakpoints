const gulp = require('gulp');
const concat = require('gulp-concat');
const terser = require('gulp-terser');
const rename = require('gulp-rename');

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

// Tarefa padrão: executa a tarefa de build
exports.default = build;