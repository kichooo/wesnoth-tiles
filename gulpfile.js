var gulp = require('gulp'),
  ts = require('gulp-typescript'),
  serve = require('gulp-serve'),
  concat = require('gulp-concat'),
  notify = require('gulp-notify')

var tsProject = ts.createProject({
  declarationFiles: true,
  noExternalResolve: true,
  module: "amd"
});


gulp.task('scripts', function() {
  return gulp.src('src/**/*.ts')
    .pipe(ts(tsProject)).js
    .pipe(concat('wesnoth-tiles.js'))
    .pipe(gulp.dest("."))
    .pipe(notify({
      "message": "Typescript built succesfully.",
      "onLast": true,
      "time": 3000
    }))
    .on("error", notify.onError(function(error) {
      return "Failed to build typescript: " + error.message;
    }));
});

gulp.task('concat', function() {
  return gulp.src('bin_temp/**/*.js')
    .pipe(concat('wesnoth-tiles.js'))
    .pipe(gulp.dest("bin/"))
    .on("error", notify.onError(function(error) {
      return "Failed to concat: " + error.message;
    }));
});

gulp.task('watch', ['concat'], function() {
  gulp.watch('bin_temp/**/*.js', ['concat']);
});

gulp.task('serve', serve({
  root: ['test', 'bin'],
  port: 8001,
}));