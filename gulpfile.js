var gulp = require('gulp'),
  ts = require('gulp-typescript'),
  serve = require('gulp-serve'),
  concat = require('gulp-concat'),
  notify = require('gulp-notify')

var tsProject = ts.createProject({
  declarationFiles: true,
  noExternalResolve: false,
  sortOutput: true,
  target: "ES5"
});

gulp.task('scripts', function() {
  return gulp.src('src/**/*.ts')
    .pipe(ts(tsProject)).js
    // .pipe(ts.filter(tsProject, { referencedFrom: ['references.ts'] }))
    .pipe(concat('wesnoth-tiles.js'))
    .pipe(gulp.dest("bin"))
    .pipe(notify({
      "message": "Typescript built succesfully.",
      "onLast": true,
      "time": 3000
    }))
    .on("error", notify.onError(function(error) {
      return "Failed to build typescript: " + error.message;
    }));
});

gulp.task('watch', ['scripts'], function() {
  gulp.watch('src/**/*.ts', ['scripts']);
});

gulp.task('serve', serve({
  root: ['test', 'bin', 'tiles'],
  port: 8001,
}));