import fs from 'fs';
import del from 'del';
import precss from 'precss';
import cssnano from 'cssnano';
import at2x from 'postcss-at2x';
import neat from 'postcss-neat';
import fixes from 'postcss-fixes';
import autoprefixer from 'autoprefixer';

import gulp from 'gulp';
import pug from 'gulp-pug';
import data from 'gulp-data';
import util from 'gulp-util';
import babel from 'gulp-babel';
import cache from 'gulp-cache';
import concat from 'gulp-concat';
import rename from 'gulp-rename';
import uglify from 'gulp-uglify';
import connect from 'gulp-connect';
import plumber from 'gulp-plumber';
import postcss from 'gulp-postcss';
import imagemin from 'gulp-imagemin';
import jsonminify from 'gulp-jsonminify';
import sourcemaps from 'gulp-sourcemaps';

const config = {
  production: Boolean(util.env.production),

  src: 'src/',
  dist: 'dist/',

  db: '_db.json',

  html: {
    path: 'pug/',
    watchPattern: '**/*.pug',
    srcPattern: '**/!(_)*.pug',
    reloadPattern: '**/*.html',
    devOptions: {
      pretty: '  ',
    },
  },

  css: {
    path: 'css/',
    watchPattern: '**/*.css',
    srcPattern: '**/!(_)*.css',
    reloadPattern: '**/*.css',
  },

  js: {
    path: 'js/',
    watchPattern: '**/*.js',
    reloadPattern: '**/*.js',
  },

  fonts: {
    path: 'fonts/',
    srcPattern: '**/*.{eot,otf,svg,ttf,woff,woff2}',
  },

  img: {
    path: 'img/',
    srcPattern: '**/*.{gif,jpeg,jpg,png,svg}',
  },
};

/* HTML TASK */
gulp.task('html', () => (
  gulp.src(`${config.src}${config.html.path}${config.html.srcPattern}`)
    .pipe(plumber())
    .pipe(data(() => (
      JSON.parse(fs.readFileSync(`${config.src}${config.db}`))
    )))
    .pipe(pug(config.production ? {} : config.html.devOptions))
    .pipe(gulp.dest(config.dist))
));

/* CSS TASK */
gulp.task('css', () => {
  const processors = [
    precss(),
    at2x(),
    neat(),
    fixes(),
    autoprefixer({
      browsers: ['last 2 versions'],
    }),
  ];

  if (config.production) {
    processors.push(cssnano({
      safe: true,
      calc: false,
    }));
  }

  return gulp.src(`${config.src}${config.css.path}${config.css.srcPattern}`)
    .pipe(plumber())
    .pipe(config.production ? util.noop() : sourcemaps.init())
    .pipe(postcss(processors))
    .pipe(rename({
      suffix: '.min',
    }))
    .pipe(config.production ? util.noop() : sourcemaps.write())
    .pipe(gulp.dest(`${config.dist}${config.css.path}`));
});

/* JAVASCRIPT TASK */
gulp.task('js', () => (
  gulp.src([
    `${config.src}${config.js.path}0-vendor/jquery-3.1.1.js`,
    `${config.src}${config.js.path}0-vendor/plyr.js`,
    `${config.src}${config.js.path}0-vendor/parallax.js`,
    `${config.src}${config.js.path}0-vendor/slick.js`,
    `${config.src}${config.js.path}script.js`,
  ])
    .pipe(plumber())
    .pipe(config.production ? util.noop() : sourcemaps.init())
    .pipe(babel())
    .pipe(concat('script.min.js'))
    .pipe(config.production ? uglify() : util.noop())
    .pipe(config.production ? util.noop() : sourcemaps.write())
    .pipe(gulp.dest(`${config.dist}${config.js.path}`))
));

/* FONTS TASK */
gulp.task('fonts', () => (
  gulp.src(`${config.src}${config.fonts.path}${config.fonts.srcPattern}`)
    .pipe(gulp.dest(`${config.dist}${config.fonts.path}`))
));

gulp.task('db', () => (
  gulp.src(`${config.src}${config.db}`)
    .pipe(plumber())
    .pipe(config.production ? jsonminify() : util.noop())
    .pipe(gulp.dest(config.dist))
));

/* IMAGES TASK */
gulp.task('img', () => (
  gulp.src(`${config.src}${config.img.path}${config.img.srcPattern}`)
    .pipe(cache(imagemin({
      progressive: true,
      interlaced: true,
    })))
    .pipe(gulp.dest(`${config.dist}${config.img.path}`))
));

/* MOVE TASK */
gulp.task('move', () => (
  gulp.src([
    `${config.src}humans.txt`,
  ])
    .pipe(gulp.dest(`${config.dist}`))
));

/* SERVER TASK */
gulp.task('server', () => {
  connect.server({
    root: config.dist.slice(0, -1),
    port: 8000,
    livereload: true,
  });
});

/* RELOAD TASKS */
gulp.task('reload-html', ['html'], () => (
  gulp.src(`${config.dist}${config.html.reloadPattern}`)
    .pipe(connect.reload())
));

gulp.task('reload-css', ['css'], () => (
  gulp.src(`${config.dist}${config.css.reloadPattern}`)
    .pipe(connect.reload())
));

gulp.task('reload-js', ['js'], () => (
  gulp.src(`${config.dist}${config.js.reloadPattern}`)
    .pipe(connect.reload())
));

/* UTILITY TASKS */
gulp.task('clean-cache', done => cache.clearAll(done));

gulp.task('clean-dist', () => del(config.dist));

/* WATCH TASKS */
gulp.task('watch', () => {
  gulp.watch(`${config.src}${config.html.path}${config.html.watchPattern}`, ['reload-html']);
  gulp.watch(`${config.src}${config.css.path}${config.css.watchPattern}`, ['reload-css']);
  gulp.watch(`${config.src}${config.js.path}${config.js.watchPattern}`, ['reload-js']);
});

/* DEFAULT TASK */
gulp.task('default', ['html', 'css', 'js', 'fonts', 'db', 'img', 'move', 'server', 'watch']);
