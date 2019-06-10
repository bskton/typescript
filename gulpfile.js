const gulp = require('gulp');
const browserSync = require('browser-sync').create();

function serve(cb) {
  browserSync.init({
    server: 'dist/'
  });
  gulp.watch('dist/**/*.*').on('change', browserSync.reload);
  cb();
}

exports.default = serve;
