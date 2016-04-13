var gulp = require('gulp');
var ts = require('gulp-typescript');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var clean = require('gulp-clean');
var assign = require('lodash.assign');
var merge = require('merge2');

var tsConfig = assign(require('./tsconfig.json'), {
  declaration: true
});

gulp.task('default', ['process', 'bundle']);

gulp.task('process', function() {
  var tsResult = gulp.src(['./typings/browser.d.ts', './src/**/*.ts'], {
      base: './src/css-animation-builder'
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
  var tsResult = gulp.src(['./typings/browser.d.ts', './src/**/*.ts'])
    .pipe(ts(assign(tsConfig, {
      module: 'system',
      outFile: 'css-animation-builder.js',
      declaration: false
    })));

  tsResult.js
    .pipe(gulp.dest('./dist/bundle'))
    .pipe(rename('css-animation-builder.min.js'))
    .pipe(uglify({
      mangle: {
        keep_fnames: true
      }
    }))
    .pipe(gulp.dest('./dist/bundle'));
});

gulp.task('clean', ['clean:process', 'clean:bundle']);

gulp.task('clean:process', function() {
  return gulp.src(['./dist', '!./dist/bundle'], {
      read: false
    })
    .pipe(clean());
});

gulp.task('clean:bundle', function() {
  return gulp.src(['./dist/bundle'], {
      read: false
    })
    .pipe(clean());
});
