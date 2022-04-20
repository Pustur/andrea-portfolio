/* eslint-disable no-console */

import { createClient } from 'contentful';
import { PassThrough } from 'stream';
import fs from 'fs';
import del from 'del';
import dotenv from 'dotenv';
import { marked } from 'marked';
import precss from 'precss';
import cssnano from 'cssnano';
import IntlPolyfill from 'intl';
import neat from 'postcss-neat';
import autoprefixer from 'autoprefixer';

import gulp from 'gulp';
import pug from 'gulp-pug';
import data from 'gulp-data';
import babel from 'gulp-babel';
import concat from 'gulp-concat';
import rename from 'gulp-rename';
import uglify from 'gulp-uglify';
import connect from 'gulp-connect';
import plumber from 'gulp-plumber';
import postcss from 'gulp-postcss';
import sourcemaps from 'gulp-sourcemaps';

const noop = () => new PassThrough({ objectMode: true });

const config = {
  production: process.env.NODE_ENV === 'production',

  src: 'src/',
  dist: 'dist/',

  contentfulFile: 'contentful.json',

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

  img: {
    path: 'img/',
    srcPattern: '**/*',
  },

  static: {
    path: 'static/',
    srcPattern: '**/*',
  },
};

/* Get env variables */
dotenv.config();

/* Fix regex problem, see https://github.com/andyearnshaw/Intl.js/issues/308 */
// eslint-disable-next-line no-underscore-dangle
IntlPolyfill.__disableRegExpRestore();

/* HTML TASK */
function htmlTask() {
  return gulp
    .src(`${config.src}${config.html.path}${config.html.srcPattern}`)
    .pipe(plumber())
    .pipe(
      data(() => {
        const dataObj = JSON.parse(fs.readFileSync(config.contentfulFile));

        dataObj.marked = marked;
        dataObj.PolyFilledDateTimeFormat = IntlPolyfill.DateTimeFormat;
        dataObj.languages = [
          { name: 'English', code: 'en' },
          { name: 'Italiano', code: 'it' },
        ];

        return dataObj;
      }),
    )
    .pipe(pug(config.production ? {} : config.html.devOptions))
    .pipe(gulp.dest(config.dist));
}

/* CSS TASK */
function cssTask() {
  const processors = [precss(), neat(), autoprefixer()];

  if (config.production) {
    processors.push(cssnano({ safe: true, calc: false }));
  }

  return gulp
    .src(`${config.src}${config.css.path}${config.css.srcPattern}`)
    .pipe(plumber())
    .pipe(config.production ? noop() : sourcemaps.init())
    .pipe(postcss(processors))
    .pipe(rename({ suffix: '.min' }))
    .pipe(config.production ? noop() : sourcemaps.write())
    .pipe(gulp.dest(`${config.dist}${config.css.path}`));
}

/* JAVASCRIPT TASK */
function jsTask() {
  return gulp
    .src([
      `${config.src}${config.js.path}0-vendor/plyr.js`,
      `${config.src}${config.js.path}0-vendor/parallax.js`,
      `${config.src}${config.js.path}0-vendor/slick.js`,
      `${config.src}${config.js.path}script.js`,
    ])
    .pipe(plumber())
    .pipe(config.production ? noop() : sourcemaps.init())
    .pipe(babel())
    .pipe(concat('script.min.js'))
    .pipe(config.production ? uglify() : noop())
    .pipe(config.production ? noop() : sourcemaps.write())
    .pipe(gulp.dest(`${config.dist}${config.js.path}`));
}

/* CONTENTFUL TASK */
function contentfulTask() {
  const client = createClient({
    space: process.env.SPACE_ID,
    accessToken: process.env.ACCESS_TOKEN,
  });

  function getContentTypes() {
    return client
      .getContentTypes()
      .then(response => response.items.map(contentType => contentType.sys.id))
      .catch(console.error);
  }

  function getEntriesOfContentType(contentType) {
    const defaultOptions = {
      content_type: contentType,
    };
    const additionalOptions =
      contentType === 'news' ? { order: '-fields.date' } : {};
    const options = { ...defaultOptions, ...additionalOptions };

    return client.withAllLocales
      .getEntries(options)
      .then(entries => [contentType, entries.items])
      .catch(console.error);
  }

  function getEntriesOfContentTypes(contentTypes) {
    const promises = contentTypes.map(getEntriesOfContentType);

    return Promise.all(promises)
      .then(entries => Object.fromEntries(entries))
      .catch(console.error);
  }

  function writeContentfulFile() {
    return getContentTypes()
      .then(getEntriesOfContentTypes)
      .then(entries =>
        fs.promises.writeFile(
          config.contentfulFile,
          JSON.stringify(entries, null, 2),
        ),
      );
  }

  return fs.promises
    .access(config.contentfulFile, fs.constants.F_OK)
    .then(() => {
      console.info(
        `${config.contentfulFile} file found.\nTo fetch new data delete ${config.contentfulFile} before running this command.`,
      );
    })
    .catch(() => {
      console.info(
        `${config.contentfulFile} file not found.\nFetching new data...`,
      );
      return writeContentfulFile();
    });
}

/* IMAGES TASK */
function imgTask() {
  return gulp
    .src(`${config.src}${config.img.path}${config.img.srcPattern}`)
    .pipe(gulp.dest(`${config.dist}${config.img.path}`));
}

/* MOVE TASK */
function moveTask() {
  return gulp
    .src(`${config.src}${config.static.path}${config.static.srcPattern}`)
    .pipe(gulp.dest(config.dist));
}

/* SERVER TASK */
function serverTask(done) {
  connect.server({
    root: config.dist.slice(0, -1),
    port: 8000,
    livereload: true,
    host: '0.0.0.0',
  });
  done();
}

/* RELOAD TASKS */
function reloadHtmlTask() {
  return gulp
    .src(`${config.dist}${config.html.reloadPattern}`)
    .pipe(connect.reload());
}

function reloadCssTask() {
  return gulp
    .src(`${config.dist}${config.css.reloadPattern}`)
    .pipe(connect.reload());
}

function reloadJsTask() {
  return gulp
    .src(`${config.dist}${config.js.reloadPattern}`)
    .pipe(connect.reload());
}

/* UTILITY TASKS */
function cleanDistTask() {
  return del(config.dist);
}

/* WATCH TASKS */
function watchTask(done) {
  gulp.watch(
    `${config.src}${config.html.path}${config.html.watchPattern}`,
    gulp.series(htmlTask, reloadHtmlTask),
  );
  gulp.watch(
    `${config.src}${config.css.path}${config.css.watchPattern}`,
    gulp.series(cssTask, reloadCssTask),
  );
  gulp.watch(
    `${config.src}${config.js.path}${config.js.watchPattern}`,
    gulp.series(jsTask, reloadJsTask),
  );
  done();
}

/* EXPORTED TASKS */
function buildTask() {
  return gulp.series(
    cleanDistTask,
    gulp.parallel(
      gulp.series(contentfulTask, htmlTask),
      cssTask,
      jsTask,
      imgTask,
      moveTask,
    ),
  );
}

function defaultTask() {
  return gulp.series(
    cleanDistTask,
    gulp.parallel(
      gulp.series(contentfulTask, htmlTask),
      cssTask,
      jsTask,
      imgTask,
      moveTask,
    ),
    gulp.parallel(serverTask, watchTask),
  );
}

/* EXPORTS */
exports.build = buildTask();
exports.default = defaultTask();
