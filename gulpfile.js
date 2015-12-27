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
var debug = require('gulp-debug');
var mainBowerFiles = require('main-bower-files');
var rename = require('gulp-rename');
var runSequence = require('run-sequence').use(gulp);
var gulpif = require('gulp-if');

// Iconfont
var iconfont = require('gulp-iconfont');
var iconfontCss = require('gulp-iconfont-css');
var runTimestamp = Math.round(Date.now() / 1000);
var fontName = 'icons';



var firstIteration = true;
var devMode = true;
var config = require('./config.json');
var lessVariables = require('./variables.json');

var conn = ftp.create( {
  host:     config.ftp_connection.host,
  user:     config.ftp_connection.username,
  password: config.ftp_connection.password,
  parallel: 3,
  log:      util.log
});

var onError = function (err) {
  util.log(util.colors.red.bold('[ERROR LESS]:'),util.colors.bgRed(err.message));
  this.emit('end');
};



var paths = {
  target: 'build-output',
  bowerJs: mainBowerFiles('**/*.js'),
  bowerLess: mainBowerFiles(['**/*.less', '**/*.css']),
  lessFiles: ['bower.less','src/less/**/*'],
  jsFiles: ['src/js/**/*.js'],
  tmplPath: 'fileadmin/template/'
};

var allLess = paths.bowerLess.concat(paths.lessFiles);
var allJs = paths.bowerJs.concat(paths.jsFiles);



function compileLess() {
  var s = gulp.src(allLess);
  s = s.pipe(gulpif(devMode, sourceMaps.init()));
  s = s.pipe(cache('less'));
  s = s.pipe(less({
    modifyVars: lessVariables
  }));
  s = s.on('error', onError);

  s = s.pipe(minifyCss());
  s = s.pipe(remember('less'));
  s = s.pipe(concat('style.css'));
  s = s.pipe(gulpif(devMode,sourceMaps.write()));
  //s = s.pipe(browserSync.stream());
  return s.pipe(gulp.dest(paths.target));
}

function compileJs() {
  var s = gulp.src(allJs);
  s = s.pipe(gulpif(devMode, sourceMaps.init()));
  s = s.pipe(cache('js'));
  s = s.pipe(uglify());
  s = s.on('error', onError);
  //s = s.pipe(#######); for by linting
  s = s.pipe(remember('js'));
  s = s.pipe(concat('app.js'));
  s = s.pipe(gulpif(devMode,sourceMaps.write()));
  return s.pipe(gulp.dest(paths.target));
}


gulp.task('moveHtml', function() {
  // html templates
  return gulp.src('**/*.html', {cwd: 'src'})
      .pipe(gulp.dest(paths.target));



});


gulp.task('moveAssets', function() {


  //assets
  return gulp.src('./assets/**')
      .pipe(gulp.dest(paths.target+'/assets'));



});



gulp.task('moveTypoScript', function() {

  //typoscript
  return gulp.src(['ts/**', '!ts/snippets/**'], {cwd: './src'})
      .pipe(gulp.dest(paths.target+'/ts/'));

});

gulp.task('browser-sync', function() {
  browserSync.init( {
    proxy: {
      target: config.paths.http,
      cookies: {
        devMode: true
      }
    },
    middleware: [
      function (req, res, next) {
        req.headers['user-agent'] = 'cachebust';
        next();
      }
    ],
    open: false,
    reloadOnRestart: true,
    port: 3000
  });
});


gulp.task('iconfont', function () {
  gulp.src(['iconfont/icons/*.svg'])
      .pipe(debug())
      .pipe(iconfontCss({
        fontName: fontName,
        path: 'iconfont/template.less',
        targetPath: '../../../src/less/iconfont.less',
        fontPath: 'assets/fonts/iconfont/'
      }))
      .pipe(iconfont({
        fontName: fontName,
        normalize: true
      }))
      .pipe(gulp.dest('assets/fonts/iconfont/'));
});






gulp.task('ftp', function() {
  var globs = [
    'build-output/**',
  ];
  return  gulp.src( globs, { base: './build-output', buffer: false } )
      .pipe( conn.differentSize(config.paths.typo3 + paths.tmplPath) ) // only upload newer files
      .on('error', onError)
      .pipe( conn.dest(config.paths.typo3 + paths.tmplPath) )
      .on('error', onError)
      .on('end', function () {
        browserSync.reload();
      });
});



gulp.task('cleanRemote', function(cb) {
  // deletes template directory on server
  return  conn.rmdir( config.paths.typo3 + paths.tmplPath, cb )
});


gulp.task('watch', function () {
  gulp.watch('src/less/**/*.less', ['less']);
  gulp.watch('src/js/**/*.js', ['js']);

  gulp.watch(['src/**/*.html'], ['moveHtml']);
  gulp.watch(['assets/**/*'], ['moveAssets']);
  gulp.watch(['src/ts/**'], ['moveTypoScript']);

  gulp.watch(['iconfont/icons/**'], ['iconfont']);

});



gulp.task('less', function () {
  util.log('Compile less ...');
  return compileLess();
});


gulp.task('js', function () {
  util.log('Compile js ...');
  return compileJs();



});


gulp.task('clean', function () {
  util.log('Delete old less ...');
  return del.sync([paths.target + '**/*'], {force: true});
});



gulp.task('firstIteration', function () {
  firstIteration = false;
});


gulp.task('disabledDev', function () {
  devMode = false;
});

gulp.task('ftp-deploy-watch', function() {
  gulp.watch('./build-output/**/*')
      .on('change', function (event) {
        return gulp.src([event.path], {base: './build-output', buffer: false})
            .pipe(conn.dest(config.paths.typo3 + paths.tmplPath))
            .pipe(browserSync.stream());
      });
});


var mainChain = ['clean', 'less', 'js',  'moveHtml', 'moveAssets', 'moveTypoScript', 'iconfont'];


gulp.task('default', function () {
  runSequence(
      'browser-sync',
      mainChain,
      'firstIteration',
      'ftp',
      ['ftp-deploy-watch','watch']
  );
});


gulp.task('deploy', function () {
  runSequence(
      'cleanRemote',
      'disabledDev',
      mainChain,
      'ftp'
  );
});

