var gulp = require('gulp'),
  ts = require('gulp-typescript'),
  serve = require('gulp-serve'),
  concat = require('gulp-concat'),
  notify = require('gulp-notify'),
  copy = require('gulp-copy'),
  merge = require('merge2');

gulp.task('scripts', function() {
  var tsStreams = gulp.src('src/**/*.ts')
    .pipe(ts({
      // noImplicitAny: true,
      declarationFiles: true,
      target: "ES5",
      out: 'wesnoth-tiles.js'
    }));

  var jsStream = tsStreams.js
    .pipe(gulp.dest("bin"))
    .pipe(notify({
      "message": "Typescript built succesfully.",
      "onLast": true,
      "time": 3000
    }));

  var defStream = tsStreams.dts
    .pipe(gulp.dest("bin"))
    .pipe(copy("test/src/", {
      prefix: 2
    }));

  return merge([jsStream, defStream])
    .on("error", notify.onError(function(error) {
      return "Failed to build typescript: " + error.message;
    }));
});

gulp.task('app', ['scripts'], function() {
  var streams = gulp.src('test/src/**/*.ts')
    .pipe(ts({
      declarationFiles: false,
      target: "ES5",
      out: 'app.js'
    }));

  var jsStream = streams.js
    .pipe(concat('app.js'))
    .pipe(gulp.dest("test/bin"));
  return jsStream;
});

gulp.task('watch', ['app'], function() {
  gulp.watch(['test/src/**/*.ts', 'src/**/*.ts'], ['app']);
});

gulp.task('serve', serve({
  root: ['test', 'bin', 'tiles'],
  port: 8001,
}));

gulp.task("default", ["scripts"]);