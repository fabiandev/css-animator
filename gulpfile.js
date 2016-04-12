var gulp = require('gulp');
var ts = require('gulp-typescript');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var assign = require('lodash.assign');
var merge = require('merge2');

var tsConfig = assign(require('./tsconfig.json'), {
  declaration: true
});

gulp.task('default', ['process', 'bundle']);

gulp.task('process', function() {
  var tsResult = gulp.src('./src/**/*.ts', { base: './src/css-animation-builder' })
    .pipe(ts(assign(tsConfig, {
      module: 'commonjs'
    })));

  return merge([
    tsResult.dts.pipe(gulp.dest('./dist')),
    tsResult.js.pipe(gulp.dest('./dist'))
  ]);
});

gulp.task('bundle', function() {
  var tsResult = gulp.src('./src/**/*.ts')
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
