// Define variables.
const gulp         = require('gulp');
const autoprefixer = require('autoprefixer');
const postcss      = require('gulp-postcss');
const cssvariables = require('postcss-css-variables');
const sass         = require('gulp-sass');
const plumber      = require('gulp-plumber');
const browsersync  = require('browser-sync').create();
const sourcemaps   = require('gulp-sourcemaps');
const cssnano      = require('cssnano');
const rename       = require('gulp-rename');
const run          = require('gulp-run');
const del          = require('del');

// BrowserSync
const browserSyncConfig = {
  server: '_site/',
  ghostMode: true,
  logFileChanges: true,
  open: true,
  port: 3000,
  files: [
    './src/cssans/sass/**/*.scss',
    './src/site/sass/**/*.scss'
  ],
}

// BrowserSync Start
function browserSync() {
  browsersync.init(browserSyncConfig);
}

// BrowserSync Reload
function browserSyncReload(done) {
  browsersync.reload();
  done();
}

// Clean Assets
function clean() {
  return del(['_includes/assets/', 'dist', '_site', 'min']);
}

// Main CSS task.
// This watches both the site CSS and CSSans
function cssSite() {
  return gulp

     // Dev version
    .src("./src/site/sass/**/*.scss")
    .pipe(sourcemaps.init())
    .pipe(plumber())
    .pipe(sass({ outputStyle: "expanded" }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("./min/"))
    .pipe(gulp.dest("./_site/min/")) /* Update _site for live reloading */

     // Prod version
    .pipe(rename({ suffix: ".min" }))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(gulp.dest("./_includes/assets/"));
}

// CSSans only task
// outputs to dist/folder
function cssans() {
  return gulp
    .src("./src/cssans/sass/**/*.scss")
    .pipe(plumber())
    .pipe(sass({ outputStyle: "expanded" }))

     // Prod version
    .pipe(rename({ suffix: ".min" }))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(gulp.dest("./dist/"))

     // IE version (doesn't support CSS vars)
    .pipe(rename({ suffix: ".ie" }))
    .pipe(postcss([cssvariables]))
    .pipe(gulp.dest("./dist/"));
}

// Jekyll task
function jekyll() {
    return gulp.src('.').pipe(run('bundle exec jekyll build --config _config.yml,_config.dev.yml'));
}

// Watch files
function watchFiles() {
  gulp.watch("./src/site/sass/**/*", cssSite);
  gulp.watch("./src/cssans/sass/**/*", cssans);
  gulp.watch(
    [
      "./_includes/**/*.html",
      "./_layouts/**/*",
    ],
    gulp.series(jekyll, browserSyncReload)
  );
}

const css = gulp.series(cssSite, cssans);
const watch = gulp.series(clean, css, jekyll, gulp.parallel(watchFiles, browserSync));

exports.clean = clean;
exports.css = css;
exports.default = watch;

