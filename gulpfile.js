var gulp = require('gulp'),
  ts = require('gulp-typescript'),
  serve = require('gulp-serve'),
  concat = require('gulp-concat'),
  notify = require('gulp-notify'),
  copy = require('gulp-copy'),
  merge = require('merge2');
  uglify = require('gulp-uglify');
  wrap = require('gulp-wrap');
  replace = require('gulp-replace');

function getWorkerStream(minify) {
  var tsStreams = gulp.src(['src/worker/**/*.ts'])
    .pipe(ts({
      // noImplicitAny: true,
      noLib: true,
      declarationFiles: false,
      target: "ES6",
      out: 'worker.js'
    }));

  var jsStream = tsStreams.js

    if (minify)
      jsStream = jsStream.pipe(uglify({mangle: false}))

    jsStream = jsStream.pipe(replace(/"/g, '\\"'))
    .pipe(wrap({ src: 'template.js'}))
    // .pipe(insert.prepend("var WesnothTiles;!function(a){var b;!function(a){\"use strict\";a.workerString=\`"))
    // .pipe(insert.append("\`}(b=a.Internal||(a.Internal={}))}(WesnothTiles||(WesnothTiles={}));"))


  return jsStream;
}

gulp.task('scripts', function() {
  var tsStreams = gulp.src(['src/main**/*.ts'])
    .pipe(ts({
      // noImplicitAny: true,
      declarationFiles: true,
      target: "ES6",
      out: 'wesnoth-tiles.js'
    }));


  var jsStream = merge(tsStreams.js, getWorkerStream(false))
    .pipe(concat('wesnoth-tiles.js'))
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
      target: "ES6",
      out: 'app.js'
    }));

  var jsStream = streams.js
    .pipe(concat('app.js'))
    .pipe(gulp.dest("test/bin"));
  return jsStream;
});

gulp.task('watch', ['app'], function() {
  gulp.watch(['test/src/app.ts', 'src/**/*.ts'], ['app']);
});

gulp.task('serve', serve({
  root: ['test', 'bin', 'tiles'],
  port: 8001,
}));

gulp.task("default", ["scripts"]);