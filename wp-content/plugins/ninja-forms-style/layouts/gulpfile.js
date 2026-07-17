/**
 * Gulpfile
 *
 * Rename and Minify JavaScript... and more (later).
 *
 * Install Command:
 * npm install gulp gulp-rename gulp-uglify
 */

const { watch, src, dest } = require('gulp');
const requirejsOptimize = require('gulp-requirejs-optimize');
const sass = require('gulp-dart-sass');
const sourcemaps = require('gulp-sourcemaps');
const rename            = require('gulp-rename');
const autoprefixer     = require('gulp-autoprefixer');

function jsBuilder() {
    return src('assets/js/builder/main.js')
            .pipe(sourcemaps.init())
            .pipe(requirejsOptimize(function(file) {
                return {
                    name: '../lib/almond',
                    optimize: 'uglify2',
                    wrap: true,
                    baseUrl: 'assets/js/builder/',
                    include: ['main'],
                    preserveLicenseComments: false
                };
            }))
            .pipe(rename('builder.js'))
            .pipe(sourcemaps.write('/'))
            .pipe(dest('assets/js/min/'));
}

function jsDisplay() {
    src('assets/js/front-end/main.js')
        .pipe(sourcemaps.init())
        .pipe(requirejsOptimize(function(file) {
            return {
                name: '../lib/almond',
                optimize: 'uglify2',
                wrap: true,
                baseUrl: 'assets/js/front-end/',
                include: ['main'],
                preserveLicenseComments: false
            };
        }))
        .pipe(rename('front-end.js'))
        .pipe(sourcemaps.write('/'))
        .pipe(dest('assets/js/min/'));
}

function js(done) {
    jsBuilder();
    jsDisplay();
    done();
}

function cssBuilder(){
    src('assets/scss/admin/builder.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(sourcemaps.write('/'))
        .pipe(dest('assets/css'));
}

function cssDisplay(){
    src('assets/scss/front-end/display-structure.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(sourcemaps.write('/'))
        .pipe(dest('assets/css'));
}

function css(done) {
    cssBuilder();
    cssDisplay();
    done();
}

// Watch Files For Changes
function watcher() {
    watch('assets/js/builder/**/*.js', ['js']);
    watch('assets/js/front-end/**/*.js', ['js']);
    watch('assets/scss/**/*.scss', ['sass']);
}

function build(done) {
    js();
    css();
    done();
}

function all() {
    js();
    css();
    watcher();
}

//Tasks
exports.js = js;
exports.css = css;
exports.build = build;
exports.default = all;
