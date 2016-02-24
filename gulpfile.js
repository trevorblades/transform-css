var browserify = require('browserify');
var browserSync = require('browser-sync').create();
var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');

var SRC_DIR = './src/';
var BUILD_DIR = './build/';
var EXAMPLE_DIR = './example/';

/**
 * Tasks for generating and watching scripts in development/debug mode.
 */

function devBuild() {
  return browserify(SRC_DIR + 'main.js', {debug: true})
     .bundle()
     .pipe(source('main.js'))
     .pipe(buffer())
     .pipe(sourcemaps.init({loadMaps: true}))
     .pipe(sourcemaps.write('./'))
     .pipe(gulp.dest(BUILD_DIR))
     .pipe(gulp.dest(EXAMPLE_DIR))
     .pipe(browserSync.stream());
}
devBuild.displayName = 'dev-build';

gulp.task(devBuild);

gulp.task('dev-browser-sync', function(done) {
  return browserSync.init({
    server: {
      baseDir: EXAMPLE_DIR
    },
    open: false,
    ghostMode: false
  }, done);
});

gulp.task('dev-serve', gulp.series('dev-build', 'dev-browser-sync'));

gulp.task('dev-watch', function(done) {
  gulp.watch(SRC_DIR + '**/*.js', devBuild);
  done();
});

gulp.task('dev', gulp.parallel('dev-serve', 'dev-watch'));

/**
 * Tasks for generating scripts for distribution/deployment.
 */

gulp.task('dist', function() {
  return browserify(SRC_DIR + 'fishsticss.js').bundle()
      .pipe(source('fishsticss.js'))
      .pipe(buffer())
      .pipe(uglify({compress: true}))
      .pipe(gulp.dest(BUILD_DIR));
});
