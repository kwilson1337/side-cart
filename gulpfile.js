const { src, dest, watch, parallel, series } = require('gulp');
const browsersync = require("browser-sync").create();
const cssnano = require("cssnano");
const del = require('del');
const webpack = require('webpack-stream');
const rename = require("gulp-rename");
const plumber = require("gulp-plumber");
const autoprefixer = require("autoprefixer");
const postcss = require("gulp-postcss");
const sass = require('gulp-sass');
sass.compiler = require('node-sass');
const prettier = require('gulp-prettier');
const path = require('path');

const PLUGIN_ROOT = path.resolve();
const BUILD_DIR = PLUGIN_ROOT + "/dist";
const ALL_CSS = PLUGIN_ROOT + "/assets/**/*.scss";
const FINAL_CSS = PLUGIN_ROOT + "/assets/style.scss";
const FINAL_JS  = ["!" + PLUGIN_ROOT + "dist/main.min.js", PLUGIN_ROOT+ "/assets/main.js"];
const ALL_JS = PLUGIN_ROOT + "/assets/**/*.js";

//browser sync
function browserSync(done) {
  browsersync.init({
    proxy: "localhost/cart-pop",
    files: [ALL_CSS, ALL_JS]
  });
  done();
}

// Delete Dist
function clean() {
  return del([BUILD_DIR]);
}

//Minify JS
function buildJS() {
  return src(FINAL_JS)                 
    .pipe(webpack({
      mode: 'production',
      output: {
        filename: 'main.min.js'
      } 
    }))    
    .pipe(dest(BUILD_DIR))
    .pipe(browsersync.stream())
}

//Minify CSS
function buildCSS() {
  return src([FINAL_CSS])
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))   
    .pipe(rename({ suffix: ".min" })) 
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(dest(BUILD_DIR))
}

//Watch JS and CSS
function watchAssets() {
  watch(FINAL_CSS, buildCSS);
  watch(FINAL_JS, buildJS);
}

function prettyJS() {
  return src(ALL_JS)
  .pipe(prettier(undefined, { filter: true }))
  .pipe(dest(file => file.base))
}

//exports
exports.watch = parallel(watchAssets, browserSync);
exports.serverWatch = watchAssets;
exports.build = series(clean, prettyJS, buildCSS, buildJS);
exports.prettify = prettyJS;