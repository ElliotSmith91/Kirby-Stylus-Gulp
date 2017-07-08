// esversion: 6;
const gulp = require('gulp');
const conf = require('./conf/gulpvars.json');
//file to reference timestamps
const timestamps = require('./conf/timestamps/timestamps.json');
const del = require('del');
const browserSync = require('browser-sync');

//gulp related plugins
const file = require('gulp-file');
const stylus = require('gulp-stylus');
const connectPhp = require('gulp-connect-php');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer');
const util = require('gulp-util');
const cleanCss = require('gulp-clean-css');
const replace = require('gulp-replace');
const concat = require('gulp-concat');
const combineMq = require('gulp-combine-mq');
const uglify = require('gulp-uglify');
const merge = require('merge-stream');

//stylus related modules
const koutoSwiss = require( "kouto-swiss" );
const rupture = require("rupture");
const nib = require('nib');
const jeet = require('jeet');

//Function to update Timestamp file
function setTimestamp(){
  timestamps[ 'styles'] = Date.now();
  console.log("in setTimestamp function - created json for styles with " + timestamps['style']);

  return file(
    'timestamps.json',
    JSON.stringify(timestamps, null, 2),
    {src : true}
  )
  .pipe(gulp.dest('./conf/timestamps/'));
}

setTimestamp();


// Get Timestamp from json file function
var getStylesStamp = function () {
  // updateTimestamp();
  var stylesTimestamp = timestamps['styles'];
  console.log('retrieving timestamp' + timestamps['styles'])
  return stylesTimestamp;
};


gulp.task('clean', function() {

  // clean all relevant paths/ directories in _site
    return del([
      conf.paths.assets.fonts.dest,
      conf.paths.assets.images.dest,
      conf.paths.site.blueprints.dest,,
      conf.paths.site.controllers.dest,
      conf.paths.site.snippets.dest,
      conf.paths.site.templates.dest,
      conf.paths.assets.scripts.dest,
      './_site/assets/styl',
       './_site/assets/css/*.css',
    ],{force: true});
});

// Styles task must be depends on the clean task finishing
gulp.task('styles', ['clean'], function(stylesTimestamp) {

    // dev variables for gulp-util - gulp --dev will run with expanded css file etc.
    var isProduction = true;
    var stylusStyle = 'compressed';
    var sourceMap = false;
    if(util.env.dev === true) {
      stylusStyle = 'expanded';
      sourceMap = false;
      isProduction = false;
    }
  return gulp.src(
      conf.paths.assets.styles.app
    )
    .pipe(plumber())
    .pipe(stylus({
      onError: util.log,
      "use": [nib(), rupture()]
    }))
    .pipe(autoprefixer(conf.autoPrefixerList, {cascade: true}))
    .pipe(isProduction ? (cleanCss()): util.noop())
    .pipe(isProduction ? (combineMq()): util.noop())
    //Rename outgoing file to include the stamp created in setStamp
    .pipe(rename('app'+ getStylesStamp()+'.css'))
    .pipe(gulp.dest(conf.paths.assets.styles.dest))
    //debuggin output
    console.log('in styles.js - stamped css file with ' +getStylesStamp());
});

 // gulp.task('copy');
// Ensure all files needed from _dev directory are copied to _site after cleaning
gulp.task('copy', ['styles', 'scripts'], function(){
  var notSnippets = gulp.src([
    "./_dev/assets/**/**.*",
    '!./_dev/assets/js/common/**.*',
    conf.paths.content.src,
    // '!_dev/content/**/*.jpg',
    '!./_dev/assets/styl/**/**',
    '!./_dev/assets/styl/',
  ],{base : "./_dev"})
  .pipe(gulp.dest('./_site'));

  var snippets = gulp.src(
    "./_dev/site/**/"
  ,{base: "./_dev"})
  //replace any mentions of app.css in the files with the timestamped name,
  .pipe(replace('assets/css/app.css', 'assets/css/app'+getStylesStamp()+'.css'))

  .pipe(gulp.dest('./_site'));

  return merge(notSnippets, snippets)
  // console.log('copied all files');
})

//watch when copy task is done and then reload browserSync
gulp.task('copy-watch', ['copy'], function (done){
  browserSync.reload();
  done();
});

//simple scripts task that concatinates all script files, but also puts scripts in template folders
gulp.task('scripts',['clean'], function () {
  return gulp.src([
      conf.paths.assets.scripts.src
    ])
    .pipe(concat('app.js'))
    .pipe(uglify())
    .pipe(gulp.dest(conf.paths.assets.scripts.dest));
});

//php server task
gulp.task('phpconnect', function () {
    connectPhp.server({base: './_site', port:conf.phpPort, keepalive: true});
});

//watch task
gulp.task('watch', ['copy'], function () {
    gulp.watch(conf.paths.assets.styles.src, ['copy', 'copy-watch']);
    gulp.watch(conf.paths.site.src, ['copy', 'copy-watch']);
    gulp.watch(conf.paths.content.src, ['copy', 'copy-watch']);
    gulp.watch(conf.paths.assets.scripts.src, ['scripts']);

});

//start browserSync with a proxy to phpconnect port
gulp.task('browsersync',function() {
  browserSync({
    proxy: conf.browserSyncProxy,
    port: conf.broswerSyncPort,
    open: true,
    notify: true,
    snippetOptions: {
      ignorePaths: ['panel/**', 'site/accounts/**']
    },
  });
});

gulp.task('default', ['clean', 'styles', 'copy', 'watch', 'phpconnect','browsersync']);
