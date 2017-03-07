var assign = require('lodash.assign');
var del = require('del');
var gulp = require('gulp');
var merge = require('merge2');
var rename = require('gulp-rename');
var runSequence = require('run-sequence');
var ts = require('gulp-typescript');
var uglify = require('gulp-uglify');

var tsConfig = assign(require('./tsconfig.json').compilerOptions, {
  declaration: true
});

gulp.task('default', ['copy', 'process', 'bundle', 'example']);
gulp.task('clean', ['clean:process', 'clean:bundle']);
gulp.task('copy', ['copy:readme', 'copy:license']);

gulp.task('build', function(done) {
  runSequence('clean', 'copy', 'process', 'bundle', 'example', done);
});

gulp.task('watch-build', function(done) {
  runSequence('process', done);
});

gulp.task('watch', function() {
  gulp.watch('./src/**/*.ts', ['watch-build']);
});

gulp.task('process', function() {
  var tsResult = gulp.src(['./src/**/*.ts'], {
      base: './src/css-animator'
    })
    .pipe(ts(assign(tsConfig, {
      module: 'commonjs'
    })));

  return merge([
    tsResult.dts.pipe(gulp.dest('./dist')),
    tsResult.js.pipe(gulp.dest('./dist'))
  ]);
});

gulp.task('bundle', function() {
  var tsResult = gulp.src(['./src/**/*.ts'])
    .pipe(ts(assign(tsConfig, {
      module: 'system',
      outFile: 'css-animator.js',
      declaration: false
    })));

  return tsResult.js
    .pipe(gulp.dest('./dist/bundles'))
    .pipe(rename('css-animator.min.js'))
    .pipe(uglify({
      mangle: {
        keep_fnames: true
      }
    }))
    .pipe(gulp.dest('./dist/bundles'));
});

gulp.task('example', function() {
  return gulp.src('./dist/bundles/**/*')
    .pipe(gulp.dest('./example'));
});

gulp.task('clean:process', function() {
  return del([
    './dist/**/*',
    '!./dist/bundles',
    '!./dist/package.json',
    '!./dist/README.md',
    '!./dist/LICENSE'
  ]);
});

gulp.task('clean:bundle', function() {
  return del([
    './dist/bundles/**/*'
  ]);
});

gulp.task('copy:readme', function() {
  return gulp.src('./README.md')
    .pipe(gulp.dest('./dist'));
});

gulp.task('copy:license', function() {
  return gulp.src('./LICENSE')
    .pipe(gulp.dest('./dist'));
});
