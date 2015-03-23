var gulp = require('gulp');

var g = require('gulp-load-plugins')();

g.run = require('run-sequence');

var p = require('./package.json').options;
var htmltojson = require('gulp-html-to-json');
var sys = require('sys');
var exec = require('child_process').exec;
var minifyCss = require('gulp-minify-css');

//handle assets

gulp.task('css',function () {
    var c = "expanded";
    if (g.util.env.optimize)
        c = "compressed";

    return gulp.src(p.css.src)
        .pipe(g.rubySass(
                {
                    style: c
                    ,cacheLocation: p.css.cacheLocation
                    ,precision: 10
                    ,loadPath: p.css.loadPath
                }
                )
        )
        .on('error',g.util.log)
        .pipe(g.autoprefixer())
        .pipe(g.size())
        .pipe(gulp.dest(p.dest+'css'))
        ;
});

gulp.task('jsonhtml', function () {
  var c = false;
  if (g.util.env.optimize)
    c = true;

  return gulp.src(p.jsonhtml.src)
    .pipe(htmltojson({
        useAsVariable: true
        , isAngularTemplate : true
        , prefix : "amc"
    }))
    .on('error',g.util.log)
    .pipe(g.if(c,g.uglify()))
    .pipe(g.size())
    .pipe(gulp.dest('./' + p.dest+'template'))
    ;
})

gulp.task('angularTemplate', function () {
  var c = false;
  if (g.util.env.optimize)
    c = true;

  return gulp.src(p.angularTemplate.src)
    .pipe(htmltojson({
        useAsVariable: true
        , isAngularTemplate : true
        , prefix : "amc"
    }))
    .on('error',g.util.log)
    .pipe(g.if(c,g.uglify()))
    .pipe(g.size())
    .pipe(gulp.dest('./' + p.dest+'template'))
    ;
})

gulp.task('template', function () {
    var c = false;
    if (g.util.env.optimize)
        c = true;

    return gulp.src(p.template.src)
        .pipe(g.size())
        .pipe(gulp.dest(p.dest+'template'))
        ;
})

gulp.task('map', function () {
    var c = false;
    if (g.util.env.optimize)
        c = true;

    return gulp.src(p.mapfiles.src)
        .pipe(g.size())
        .pipe(g.flatten())
        .pipe(gulp.dest(p.dest+'js'))
        ;
})

gulp.task('js', function () {
    var c = false;
    if (g.util.env.optimize)
        c = true;

    return gulp.src(p.js.src)
        .pipe(g.include())
        .on('error',g.util.log)
        .pipe(g.if(c,g.uglify()))
        .pipe(g.size())
        .pipe(gulp.dest(p.dest+'js'))
        ;
})

gulp.task('fonts', function () {
    return gulp.src(p.fonts.src)
        .pipe(g.flatten())
        .pipe(g.size())
        .pipe(gulp.dest(p.dest+'fonts'));
});

gulp.task('images', function () {
    var c = false;
    if (g.util.env.optimize)
            c = true;

    return gulp.src(p.images.src)
    /*.pipe(g.flatten())*/
    .pipe(g.if(c,g.imagemin()))
    .pipe(g.size())
    .pipe(gulp.dest(p.dest));
});

//utilities

gulp.task('clear-manifest',function() {
    return gulp.src(p.manifest+'/rev-manifest.json')
    .pipe(g.clean());
})

gulp.task('clean',['clear-manifest'], function () {
    return gulp.src(p.dest, {read: false})
        .pipe(g.clean());
});


// watch tasks

gulp.task('devmode',function(){

    console.log("\nWatching for file changes\n");
    g.livereload.listen();

    g.run('clean','css','js', 'jsonhtml', 'angularTemplate' ,'map','images','fonts');

    gulp.watch(p.css.src,['css']);
    gulp.watch(p.js.appsrc,['js']);
    gulp.watch(p.angularTemplate.appsrc,['angularTemplate']);
    gulp.watch(p.js.src,['js']);

    gulp.watch(p.dest+'/css/**/*').on('change',g.livereload.changed);

});

