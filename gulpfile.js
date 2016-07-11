var gulp = require('gulp'),
    run = require('gulp-run'),
    gulpWatch = require('gulp-watch'),
    del = require('del'),
    runSequence = require('run-sequence'),
    argv = process.argv,
    electron = require('gulp-electron'),
    runSequence = require('run-sequence'),
    packageJson = require('./package.json');

process.NODE_ENV = 'test';

/**
 * Ionic hooks
 * Add ':before' or ':after' to any Ionic project command name to run the specified
 * tasks before or after the command.
 */
gulp.task('serve:before', ['watch']);
gulp.task('emulate:before', ['build']);
gulp.task('deploy:before', ['build']);
gulp.task('build:before', ['build']);

// we want to 'watch' when livereloading
var shouldWatch = argv.indexOf('-l') > -1 || argv.indexOf('--livereload') > -1;
gulp.task('run:before', [shouldWatch ? 'watch' : 'build']);

/**
 * Ionic Gulp tasks, for more information on each see
 * https://github.com/driftyco/ionic-gulp-tasks
 *
 * Using these will allow you to stay up to date if the default Ionic 2 build
 * changes, but you are of course welcome (and encouraged) to customize your
 * build however you see fit.
 */
var buildBrowserify = require('ionic-gulp-browserify-typescript');
var buildSass = require('ionic-gulp-sass-build');
var copyHTML = require('ionic-gulp-html-copy');
var copyFonts = require('ionic-gulp-fonts-copy');
var copyScripts = require('ionic-gulp-scripts-copy');

var isRelease = argv.indexOf('--release') > -1;

gulp.task('watch', ['clean'], function (done) {
    runSequence(
        ['sass', 'html', 'fonts', 'scripts'],
        function () {
            gulpWatch('app/**/*.scss', function () {
                gulp.start('sass');
            });
            gulpWatch('app/**/*.html', function () {
                gulp.start('html');
            });
            buildBrowserify({
                watch: true
            }).on('end', done);
        }
    );
});

gulp.task('build', ['clean'], function (done) {
    runSequence(
        ['sass', 'html', 'fonts', 'scripts'],
        function () {
            buildBrowserify({
                minify: isRelease,
                browserifyOptions: {
                    debug: !isRelease
                },
                uglifyOptions: {
                    mangle: false
                }
            }).on('end', done);
        }
    );
});

gulp.task('sass', buildSass);
gulp.task('html', copyHTML);
gulp.task('fonts', copyFonts);
gulp.task('scripts', copyScripts);
gulp.task('clean', function () {
    del('release');
    return del('www/build');
});

//https://github.com/mainyaa/gulp-electron
//TODO: Switch to this
// gulp.task('electron', ['clean', 'build'], function () {
//     gulp.src("")
//         .pipe(electron({
//             src: 'www',
//             packageJson: packageJson,
//             release: './release',
//             cache: './cache',
//             version: 'v0.37.4',
//             packaging: true,
//             token: '',
//             platforms: ['darwin-x64', 'win32-ia32'],
//             platformResources: {
//                 darwin: {
//                     CFBundleDisplayName: packageJson.name,
//                     CFBundleIdentifier: packageJson.name,
//                     CFBundleName: packageJson.name,
//                     CFBundleVersion: packageJson.version,
//                     icon: 'gulp-electron.icns'
//                 },
//                 win: {
//                     "version-string": packageJson.version,
//                     "file-version": packageJson.version,
//                     "product-version": packageJson.version,
//                     "icon": 'gulp-electron.ico'
//                 }
//             }
//         }))
//         .pipe(gulp.dest(""));
// });
//
gulp.task('copy-package-json', function () {
    return gulp.src('./package.json')
        .pipe(gulp.dest('./www/'));
});

gulp.task('electron:all', function () {
    return runSequence('clean', 'build', 'copy-package-json', 'electron:osx', 'electron:win', 'electron:nix');
});

gulp.task('electron:osx', function () {
    return run('npm run pack:osx').exec()
        .pipe(gulp.dest('output'));
});

gulp.task('electron:win', function () {
    return run('npm run pack:win').exec()
        .pipe(gulp.dest('output'));
});

gulp.task('electron:nix', function () {
    return run('npm run pack:nix').exec()
        .pipe(gulp.dest('output'));
});
