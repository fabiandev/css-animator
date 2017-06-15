var assign = require('lodash.assign');
var del = require('del');
var file = require('gulp-file');
var filter = require('gulp-filter');
var gulp = require('gulp');
var merge = require('merge2');
var rename = require('gulp-rename');
var runSequence = require('run-sequence');
var ts = require('gulp-typescript');
var uglify = require('gulp-uglify');
var webpack = require('webpack-stream');

var tsConfig = assign(require('./tsconfig.json').compilerOptions, {
  declaration: true
});

gulp.task('default', ['copy', 'process', 'bundle', 'example']);
gulp.task('clean', ['clean:process', 'clean:bundle']);
gulp.task('copy', ['copy:metadata', 'copy:readme', 'copy:license', 'copy:package']);
gulp.task('example', ['example:build', 'example:copy']);

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
  var f = filter(['**', '!src/*.*']);

  var tsResult = gulp.src(['./src/**/*.ts'], {
      base: './src/css-animator'
    })
    .pipe(ts(assign(tsConfig, {
      module: 'commonjs'
    })));

  return merge([
    tsResult.dts.pipe(f).pipe(gulp.dest('./dist')),
    tsResult.js.pipe(f).pipe(gulp.dest('./dist'))
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

gulp.task('example:build', function() {
  return gulp.src('./docs/index.ts')
    .pipe(webpack(require('./webpack.config.js')))
    .pipe(gulp.dest('./docs/assets'));
});

gulp.task('example:copy', function() {
  return gulp.src([
    './node_modules/animate.css/animate.css',
    './node_modules/normalize.css/normalize.css'
  ])
    .pipe(gulp.dest('docs/assets'));
});

gulp.task('clean:process', function() {
  return del([
    './dist/**/*',
    '!./dist/bundles'
  ]);
});

gulp.task('clean:bundle', function() {
  return del([
    './dist/bundles/**/*'
  ]);
});

gulp.task('copy:metadata', function() {
  return gulp.src('./compiled/**/*.metadata.json')
    .pipe(gulp.dest('./dist'));
});

gulp.task('copy:readme', function() {
  return gulp.src('./README.md')
    .pipe(gulp.dest('./dist'));
});

gulp.task('copy:license', function() {
  return gulp.src('./LICENSE')
    .pipe(gulp.dest('./dist'));
});

gulp.task('copy:package', function () {
  var pkg = require('./package.json')

  delete pkg.devDependencies;
  delete pkg.main;

    return file('package.json', JSON.stringify(pkg, null, '\t'), {src: true})
        .pipe(gulp.dest('./dist'))
})
