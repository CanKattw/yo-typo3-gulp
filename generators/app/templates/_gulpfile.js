'use strict';
var gulp = require('gulp');
var less = require('gulp-less');
var browserSync = require('browser-sync').create();
var util = require('gulp-util');
var sourceMaps = require('gulp-sourcemaps');
var del = require('del');
var cache = require('gulp-cached');
var remember = require('gulp-remember');
var concat = require('gulp-concat');
var ftp = require( 'vinyl-ftp' );
var minifyCss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var mainBowerFiles = require('main-bower-files');
var rename = require('gulp-rename');

var config = require('./config.json');
var lessVariables = require('./variables.json');

var conn = ftp.create( {
  host:     config.ftp_connection.host,
  user:     config.ftp_connection.username,
  password: config.ftp_connection.password,
  parallel: 10,
  log:      util.log
});

var paths = {
  target: 'build-output',
  bowerJs: mainBowerFiles('**/*.js'),
  bowerLess: mainBowerFiles('**/*.less'),
  lessFiles: ['bower.less','src/less/**.less'],
  jsFiles: ['js/main.js']
};

var allLess = paths.bowerLess.concat(paths.lessFiles);
var allJs = paths.bowerJs.concat(paths.jsFiles);



function compileLess() {
  var s = gulp.src(allLess);
  s = s.pipe(sourceMaps.init());
  s = s.pipe(cache('less'));
  s = s.pipe(less({
    modifyVars: lessVariables
  }));
  s = s.pipe(remember('less'));
  s = s.pipe(minifyCss());
  s = s.pipe(concat('style.css'));
  s = s.pipe(sourceMaps.write('maps/'));
  return s.pipe(gulp.dest(paths.target));
}

function compileJs() {
  var s = gulp.src(allJs);
  s = s.pipe(sourceMaps.init());
  s = s.pipe(cache('js'));
  s = s.pipe(uglify());
  //s = s.pipe(#######); for by linting
  s = s.pipe(remember('js'));
  s = s.pipe(concat('app.js'));
  s = s.pipe(sourceMaps.write('maps/'));
  return s.pipe(gulp.dest(paths.target));
}


gulp.task('move', function() {

  // html templates
  gulp.src('./*.html', { cwd: './src' })
    .pipe(gulp.dest(paths.target));

  //assets
  gulp.src('./assets/**')
    .pipe(gulp.dest(paths.target+'/assets'));

  //typoscript
  gulp.src('./ts/includes/**',{ cwd: './src' })
    .pipe(gulp.dest(paths.target+'/ts/'));

});

gulp.task('browser-sync', function() {
  browserSync.init([], {
    proxy: config.ftp_connection.http_path,
    open: false,
  });
});



gulp.task('ftp', function() {
  var globs = [
    'build-output/**',
  ];
  return  gulp.src( globs, { base: './build-output', buffer: false } )
    .pipe( conn.newer( '/build-output' ) ) // only upload newer files
    .pipe( conn.dest(config.ftp_connection.path_to_typo3) )
    .on('end', function () {
      browserSync.reload();
    });
});


gulp.task('watch', function () {
  gulp.watch('src/less/**/*.less', ['less']);
  gulp.watch('src/js/**/*.js', ['js']);
  gulp.watch(['./src/*.html' ,  './src/ts/**', './assets/**/*'], ['move']);

});



gulp.task('less', function () {
  util.log('Compile less ...');
  return compileLess();
});


gulp.task('js', function () {
  util.log('Compile js ...');
  return compileJs();
});


gulp.task('clean', function (cb) {
  util.log('Delete old less ...');
  del([paths.target + '**/*'], {force: true}, cb);
});


//define tasks
gulp.task('default', [ 'clean', 'less', 'js' , 'move', 'watch', 'browser-sync'  ], function () {

  gulp.run('ftp');
  gulp.watch('./build-output/**/*',{debounceDelay: 2000} , ["ftp"]);
  return util.log('Gulp is running!');
});
