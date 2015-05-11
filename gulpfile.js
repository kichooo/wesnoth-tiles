var gulp = require('gulp'),
  ts = require('gulp-typescript'),
  serve = require('gulp-serve'),
  concat = require('gulp-concat'),
  notify = require('gulp-notify')
  merge = require('merge2');

var tsProject = ts.createProject({
  declarationFiles: true,
  noExternalResolve: false,
  sortOutput: true,
  target: "ES5"
});

gulp.task('scripts', function() {
  var streams = gulp.src('src/**/*.ts')
    .pipe(ts(tsProject));

  var jsStream = streams.js
    .pipe(concat('wesnoth-tiles.js'))
    .pipe(gulp.dest("bin"));

  var defStream = streams.dts
    .pipe(concat('wesnoth-tiles.d.ts'))
    .pipe(gulp.dest("bin"));    

  return merge([jsStream, defStream])
    .on("queueDrain", function() {
      notify({
        "message": "Typescript built succesfully.",
        "onLast": true,
        "time": 3000
      })
    })
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

gulp.task("default", ["scripts"]);