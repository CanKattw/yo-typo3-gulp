'use strict';
var gulp = require('gulp');
var less = require('gulp-less');
var browserSync = require('browser-sync').create('default');
var browserSyncSourceMaps = require('browser-sync').create('sourcemaps');
var util = require('gulp-util');
var sourceMaps = require('gulp-sourcemaps');
var del = require('del');
var cache = require('gulp-cached');
var remember = require('gulp-remember');
var concat = require('gulp-concat');
var ftp = require('vinyl-ftp');
var minifyCss = require('gulp-clean-css');
var uglify = require('gulp-uglify');
var debug = require('gulp-debug');
var mainBowerFiles = require('main-bower-files');
var rename = require('gulp-rename');
var runSequence = require('run-sequence').use(gulp);
var gulpif = require('gulp-if');
var autoprefixer = require('gulp-autoprefixer');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');

// Iconfont
var iconfont = require('gulp-iconfont');
var iconfontCss = require('gulp-iconfont-css');
var runTimestamp = Math.round(Date.now() / 1000);
var fontName = 'icons';

// proxy for sourcemaps
var proxyMiddleware = require('http-proxy-middleware');
var proxyURL = 'http://localhost:3333';


var firstIteration = true;
var devMode = true;
var config = require('./config.json');
var lessVariables = require('./variables.json');

var conn = ftp.create({
  host: config.ftp_connection.host,
  user: config.ftp_connection.username,
  password: config.ftp_connection.password,
  parallel: 3,
  log: util.log
});

var onError = function (err) {
  util.log(util.colors.red.bold('[ERROR LESS]:'), util.colors.bgRed(err.message));
  this.emit('end');
};


var paths = {
  target: 'build-output',
  bowerJs: mainBowerFiles('**/*.js'),
  bowerLess: mainBowerFiles(['**/*.less', '**/*.css']),
  lessFiles: ['bower.less', 'src/less/**/*'],
  jsFiles: ['src/js/**/*.js'],
  tmplPath: 'fileadmin/template/'
};

var allLess = paths.bowerLess.concat(paths.lessFiles);
var allJs = paths.bowerJs.concat(paths.jsFiles);

function compileLess(src, fileName) {
  var s = gulp.src(src);
  s = s.pipe(gulpif(devMode, sourceMaps.init()));
  s = s.pipe(cache(fileName));
  s = s.pipe(debug());
  s = s.pipe(less({
    modifyVars: lessVariables
  }));
  s = s.on('error', onError);
  s = s.pipe(autoprefixer({
    browsers: ['> 5%'],
    cascade: false
  }));
  s = s.pipe(minifyCss());
  s = s.pipe(remember(fileName));
  s = s.pipe(concat(fileName));
  s = s.pipe(gulpif(devMode, sourceMaps.write('/e48e13207341b6bffb7fb1622282247b', {
    sourceMappingURL: function (file) {
      return 'http://localhost:3000/e48e13207341b6bffb7fb1622282247b/' + file.relative + '.map';
    }
  })));
  return s.pipe(gulp.dest(paths.target));
}

function compileJs(src, fileName, lint) {
  var s = gulp.src(src);
  s = s.pipe(gulpif(lint, jshint()));
  s = s.pipe(gulpif(lint, jshint.reporter(stylish)));
  s = s.pipe(gulpif(devMode, sourceMaps.init()));
  s = s.pipe(cache(fileName));
  s = s.pipe(debug());
  s = s.pipe(uglify());
  s = s.on('error', onError);
  s = s.pipe(remember(fileName));
  s = s.pipe(concat(fileName));
  s = s.pipe(gulpif(devMode, sourceMaps.write('/e48e13207341b6bffb7fb1622282247b', {
    sourceMappingURL: function (file) {
      return 'http://localhost:3000/e48e13207341b6bffb7fb1622282247b/' + file.relative + '.map';
    }
  })));
  return s.pipe(gulp.dest(paths.target));
}


gulp.task('moveHtml', function () {
  // html templates
  return gulp.src('**/*.html', {cwd: 'src'})
      .pipe(gulp.dest(paths.target));


});


gulp.task('moveAssets', function () {
  //assets
  return gulp.src('./assets/**')
      .pipe(gulp.dest(paths.target + '/assets'));
});


gulp.task('moveTypoScript', function () {
  //typoscript
  return gulp.src(['ts/**', '!ts/snippets/**'], {cwd: './src', dot: true})
      .pipe(gulp.dest(paths.target + '/ts/'));
});

gulp.task('browser-sync', function () {
  browserSync.init({
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
      },
      proxyMiddleware('/e48e13207341b6bffb7fb1622282247b', {target: proxyURL})
    ],

    open: false,
    reloadOnRestart: true,
    port: 3000
  });
});


gulp.task('serveMaps', function () {
  browserSyncSourceMaps.init({
    server: {
      baseDir: "./build-output/",
      directory: true
    },
    ui: false,
    open: false,
    reloadOnRestart: true,
    port: 3333
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


gulp.task('ftp', function () {
  var globs = [
    'build-output/**', '!build-output/**/*.map',
  ];
  return gulp.src(globs, {base: './build-output', buffer: false, dot: true})
      .pipe(conn.differentSize(config.paths.typo3 + paths.tmplPath)) // only upload newer files
      .on('error', onError)
      .pipe(conn.dest(config.paths.typo3 + paths.tmplPath))
      .on('error', onError)
      .on('end', function () {
        browserSync.reload();
      });
});


gulp.task('cleanRemote', function (cb) {
  // deletes template directory on server
  return conn.rmdir(config.paths.typo3 + paths.tmplPath, cb)
});


gulp.task('watch', function () {
  gulp.watch('src/less/**/*.less', ['less:custom']);
  gulp.watch('src/js/**/*.js', ['js:custom']);
  gulp.watch(['src/**/*.html'], ['moveHtml']);
  gulp.watch(['assets/**/*'], ['moveAssets']);
  gulp.watch(['src/ts/**'], ['moveTypoScript']);
  gulp.watch(['iconfont/icons/**'], ['iconfont']);
});

/* ------------------
 *  Compile Less
 * ------------------*/

gulp.task('less:custom', function () {
  util.log('Compile less:custom ...');
  return compileLess(paths.lessFiles, "custom.css");
});

gulp.task('less:vendor', function () {
  util.log('Compile less:vendor...');
  return compileLess(paths.bowerLess, "vendor.css");
});

gulp.task('less:bundle', function () {
  util.log('Compile less:bundle...');
  return compileLess(allLess, "style.css");
});


/* ------------------
 *  Compile JavaScript
 * ------------------*/


gulp.task('js:custom', function () {
  util.log('Compile js:custom ...');
  return compileJs(paths.jsFiles, "custom.js", true);
});

gulp.task('js:vendor', function () {
  util.log('Compile js:vendor...');
  return compileJs(paths.bowerJs, "vendor.js");
});

gulp.task('js:bundle', function () {
  util.log('Compile js:bundle...');
  return compileJs(allJs, "app.js");
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

gulp.task('ftp-deploy-watch', function () {
  gulp.watch(['./build-output/**/*', '!./build-output/**/*.map'])
      .on('change', function (event) {
        return gulp.src([event.path], {base: './build-output', buffer: false})
            .pipe(conn.dest(config.paths.typo3 + paths.tmplPath))
            .pipe(browserSync.stream());
      });
});


var mainChain = ['clean', 'moveHtml', 'moveAssets', 'moveTypoScript', 'iconfont'];
var devChain = ['less:custom', 'less:vendor', 'js:custom', 'js:vendor'];
//  not yet implemented
var deployChain = ['js:bundle', 'less:bundle'];

gulp.task('default', function () {
  runSequence(
      'browser-sync',
      'serveMaps',
      mainChain,
      devChain,
      'firstIteration',
      'ftp',
      ['ftp-deploy-watch', 'watch']
  );
});


gulp.task('deploy', function () {
  runSequence(
      'cleanRemote',
      'disabledDev',
      mainChain,
      devChain,
      'ftp'
  );
});

