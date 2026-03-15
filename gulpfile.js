const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const merge = require('merge-stream');
const concat = require('gulp-concat');
const terser = require('gulp-terser');
const header = require('gulp-header');
const rename = require('gulp-rename');
const package = require('./package.json');
const settingsPath = path.join(__dirname, '.vscode', 'settings.json');

const banner = `/**
 * JsWidthBreakpoints - A lightweight, vanilla JavaScript library for handling responsive breakpoints with dynamic CSS classes and visual rules.
 * Version: ${package.version}
 * Repository: https://github.com/marceloxp/JsWidthBreakpoints
 * License: MIT
 * Author: Marcelo XP
 * Build Date: ${new Date().toISOString().split('T')[0]}
 */
`;

function build() {
    const rawStream = gulp
        .src('src/JsWidthBreakpoints.js')
        .pipe(concat('JsWidthBreakpoints.js'))
        .pipe(header(banner))
        .pipe(gulp.dest('dist'));

    const minStream = gulp
        .src('src/JsWidthBreakpoints.js')
        .pipe(concat('JsWidthBreakpoints.js'))
        .pipe(terser())
        .pipe(rename({ suffix: '.min' }))
        .pipe(header(banner))
        .pipe(gulp.dest('dist'));

    return merge(rawStream, minStream);
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

exports.default = build;
exports.updateStatusBar = updateStatusBar;