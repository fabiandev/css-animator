var path = require('path');
var assign = require('lodash.assign');
var del = require('del');
var merge = require('merge2');
var wp = require('webpack');
var webpack = require('webpack-stream');
var gulp = require('gulp');
var file = require('gulp-file');
var filter = require('gulp-filter');
var sourcemaps = require('gulp-sourcemaps');
var rename = require('gulp-rename');
var ts = require('gulp-typescript');
var uglify = require('gulp-uglify');

var tsConfig = assign(require('./tsconfig.json').compilerOptions, {
  declaration: true
});

gulp.task('watch', function() {
  gulp.watch('./src/**/*.ts', ['watch-build']);
});

gulp.task('process', function() {
  var f = filter(['**', '!src/*.*']);

  var tsResult = gulp.src(['./src/**/*.ts'], {
      base: './src/css-animator'
    })
    .pipe(f)
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(ts(assign(tsConfig, {
      module: 'commonjs'
    })));

  return merge([
    tsResult.dts.pipe(gulp.dest('./dist')),
    tsResult.js
      .pipe(sourcemaps.write('.', { addComment: true }))
      .pipe(gulp.dest('./dist'))
  ]);
});

gulp.task('bundle:build:1', function() {
  return gulp.src('./dist/index.js')
    .pipe(webpack(require('./config.bundle')[0], wp))
    .pipe(gulp.dest('./dist/bundles'));
});

gulp.task('bundle:build:2', function() {
  return gulp.src('./dist/index.js')
    .pipe(webpack(require('./config.bundle')[1], wp))
    .pipe(gulp.dest('./dist/bundles'));
});

gulp.task('bundle:compress:1', function() {
  var wpConfig = require('./config.bundle');
  var location = wpConfig[0].output.path;
  var filename = wpConfig[0].output.filename;
  var filenameMin = wpConfig[0].output.filename.split('.');
  filenameMin.splice(filenameMin.length - 1, 0, '.min.');
  filenameMin = filenameMin.join('');
  return gulp.src(path.join(location, filename))
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(uglify({
      compress: { sequences: false }
    }))
    .pipe(rename(filenameMin))
    .pipe(sourcemaps.write('.', { addComment: true }))
    .pipe(gulp.dest(location));
});

gulp.task('bundle:compress:2', function() {
  var wpConfig = require('./config.bundle');
  var location = wpConfig[1].output.path;
  var filename = wpConfig[1].output.filename;
  var filenameMin = wpConfig[1].output.filename.split('.');
  filenameMin.splice(filenameMin.length - 1, 0, '.min.');
  filenameMin = filenameMin.join('');
  return gulp.src(path.join(location, filename))
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(uglify({
      compress: { sequences: false }
    }))
    .pipe(rename(filenameMin))
    .pipe(sourcemaps.write('.', { addComment: true }))
    .pipe(gulp.dest(location));
});

gulp.task('bundle:compress', gulp.series(gulp.parallel('bundle:compress:1', 'bundle:compress:2')));

gulp.task('bundle', gulp.series(gulp.parallel('bundle:build:1', 'bundle:build:2'), 'bundle:compress'));

gulp.task('example:build', function() {
  return gulp.src('./docs/assets/app.js', { allowEmpty: true })
    .pipe(webpack(require('./config.docs'), wp))
    .pipe(gulp.dest('./docs/assets'));
});

gulp.task('example:compress', function() {
  var wpConfig = require('./config.docs');
  var location = wpConfig.output.path;
  var filename = wpConfig.output.filename;
  var filenameMin = wpConfig.output.filename.split('.');
  filenameMin.splice(filenameMin.length - 1, 0, '.min.');
  filenameMin = filenameMin.join('');
  return gulp.src(path.join(location, filename))
    .pipe(sourcemaps.init({ loadMaps: true, largeFile: true }))
    .pipe(uglify({
      compress: { sequences: false }
    }))
    .pipe(rename(filenameMin))
    .pipe(sourcemaps.write('.', { addComment: true }))
    .pipe(gulp.dest(location));
});

gulp.task('example:cleanup', function() {
  return del([
    'docs/assets/app.js',
    'docs/assets/app.js.map'
  ]);
});

gulp.task('example:copy', function() {
  return gulp.src([
    './node_modules/animate.css/animate.css',
    './node_modules/normalize.css/normalize.css'
  ])
    .pipe(gulp.dest('docs/assets'));
});

// gulp.task('shim', function(done) {
//   runSequence('shim:build', 'shim:compress', done);
// });
//
// gulp.task('shim:build', function() {
//   return gulp.src('./dist/shim.js')
//     .pipe(webpack(require('./config.shim'), wp))
//     .pipe(gulp.dest('./dist/bundles'));
// });
//
// gulp.task('shim:compress', function() {
//   var wpConfig = require('./config.source');
//   var location = wpConfig.output.path;
//   var filename = wpConfig.output.filename;
//   var filenameMin = wpConfig.output.filename.split('.');
//   filenameMin.splice(filenameMin.length - 1, 0, '.min.');
//   filenameMin = filenameMin.join('');
//   return gulp.src(path.join(location, filename))
//     .pipe(sourcemaps.init({ loadMaps: true }))
//     .pipe(uglify({
//       compress: { sequences: false }
//     }))
//     .pipe(rename(filenameMin))
//     .pipe(sourcemaps.write('.', { addComment: true }))
//     .pipe(gulp.dest(location));
// });

gulp.task('clean:example', function() {
  return del([
    './docs/assets/app.js*',
    './docs/assets/app.min.js*',
    // './docs/assets/shim.js*',
    // './docs/assets/shim.min.js*',
  ]);
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

gulp.task('copy:sourcemaps', function() {
  return gulp.src('./compiled/**/*.js.map')
    .pipe(gulp.dest('./dist'));
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

gulp.task('clean:example', gulp.parallel('clean:example'));
gulp.task('clean', gulp.parallel('clean:process', 'clean:bundle'));

gulp.task('copy', gulp.parallel('copy:metadata', 'copy:sourcemaps', 'copy:readme', 'copy:license', 'copy:package'));

gulp.task('example', gulp.series('example:build', 'example:copy'));

gulp.task('build', gulp.series('clean', 'copy', 'process', 'bundle'/*, 'shim'*/));
gulp.task('build:example', gulp.series('clean:example', 'example'));

gulp.task('watch-build', gulp.series('process'));

gulp.task('default', gulp.parallel('build'));
