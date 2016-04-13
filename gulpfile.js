var gulp = require('gulp');
var ts = require('gulp-typescript');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var del = require('del');
var assign = require('lodash.assign');
var merge = require('merge2');

var tsConfig = assign(require('./tsconfig.json'), {
  declaration: true
});

gulp.task('default', ['process', 'bundle']);

gulp.task('process', function() {
  var tsResult = gulp.src(['./typings/browser.d.ts', './src/**/*.ts'], {
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
  var tsResult = gulp.src(['./typings/browser.d.ts', './src/**/*.ts'])
    .pipe(ts(assign(tsConfig, {
      module: 'system',
      outFile: 'css-animator.js',
      declaration: false
    })));

  tsResult.js
    .pipe(gulp.dest('./dist/bundles'))
    .pipe(rename('css-animator.min.js'))
    .pipe(uglify({
      mangle: {
        keep_fnames: true
      }
    }))
    .pipe(gulp.dest('./dist/bundles'));
});

gulp.task('clean', ['clean:process', 'clean:bundle']);

gulp.task('clean:process', function() {
  return del([
    './dist/**/*',
    '!./dist/bundles',
    '!./dist/package.json'
  ]);
});

gulp.task('clean:bundle', function() {
  return del([
    './dist/bundles/**/*'
  ]);
});
