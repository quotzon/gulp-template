var syntax = 'sass'; // Syntax: sass or scss;

var gulp = require('gulp'), // Подключаем Gulp
    sass = require('gulp-sass'), //Подключаем Sass пакет
    browserSync = require('browser-sync'), // Подключаем Browser Sync
    concat = require('gulp-concat'), // Подключаем gulp-concat (для конкатенации файлов)
    uglify = require('gulp-uglifyjs'), // Подключаем gulp-uglifyjs (для сжатия JS)
    cleancss = require('gulp-clean-css'), // Подключаем пакет для минификации CSS
    rename = require('gulp-rename'), // Подключаем библиотеку для переименования файлов
    notify = require("gulp-notify"), // Подключаем библиотеку для уведомлений об ошибках
    del = require('del'), // Подключаем библиотеку для удаления файлов и папок
    imagemin = require('gulp-imagemin'), // Подключаем библиотеку для работы с изображениями
    pngquant = require('imagemin-pngquant'), // Подключаем библиотеку для работы с png
    cache = require('gulp-cache'), // Подключаем библиотеку кеширования
    autoprefixer = require('gulp-autoprefixer'); // Подключаем библиотеку для автоматического добавления префиксов

gulp.task('styles', function() {
	return gulp.src('app/'+syntax+'/**/*.'+syntax+'')
	.pipe(sass({ outputStyle: 'expanded' }).on("error", notify.onError()))
	.pipe(autoprefixer(['last 15 versions']))
	.pipe(gulp.dest('app/css'));
});

gulp.task('scripts', function(){
    /*return gulp.src([ // Берем все необходимые библиотеки
        'app/libs/jquery/dist/jquery.min.js', // Берем jQuery
        'app/libs/magnific-popup/dist/jquery.magnific-popup.min.js' // Берем Magnific Popup
        ])*/
    return gulp.src('app/libs/**/*.js') // Берем все необходимые библиотеки
    .pipe(concat('libs.min.js')) // Собираем их в кучу в новом файле libs.min.js
    .pipe(uglify()) // Сжимаем JS файл
    .pipe(gulp.dest('app/js')); // Выгружаем в папку app/js
});

gulp.task('css-libs', ['styles'], function(){
    return gulp.src('app/css/**/*.css') // Выбираем файл для минификации
    .pipe(rename({ suffix: '.min', prefix : '' })) // Добавляем суффикс .min
    .pipe(cleancss( {level: { 1: { specialComments: 0 } } })) // Opt., comment out when debugging
    .pipe(gulp.dest('app/css')) // Выгружаем в папку app/css
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('browser-sync', function(){ // Создаем таск browser-sync
    browserSync({ // Выполняем browserSync
        server: { // Определяем параметры сервера
            baseDir: 'app' // Директория для сервера - app
        },
        notify: false // Отключаем уведомления
    });
});

gulp.task('clean', function(){
    return del.sync('dist'); // Удаляем папку dist перед сборкой
});

gulp.task('clear', function(){ //Автономный таск для очистки кеша Gulp
    return cache.clearAll();
});

gulp.task('img', function(){
    return gulp.src('app/img/**/*') // Берем все изображения из app
    .pipe(cache(imagemin({ // Сжимаем их с наилучшими настройками
        interlaced: true,
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
        use: [pngquant()]
    })))
    .pipe(gulp.dest('dist/img')); // Выгружаем на продакшен
});

gulp.task('watch', ['browser-sync', 'css-libs', 'scripts'], function(){
    gulp.watch('app/sass/**/*.sass', ['styles']); // Наблюдение за sass файлами в папке sass
    gulp.watch('app/*.html', browserSync.reload); // Наблюдение за HTML файлами в корне проекта
    gulp.watch('app/js/**/*.js', browserSync.reload); // Наблюдение за JS файлами в папке js
});

gulp.task('build', ['clean', 'img', 'sass', 'scripts'], function(){
    var buildCss = gulp.src([ // Переносим CSS стили в продакшен
        'app/css/main.css',
        'app/css/libs.min.css'
    ])
    .pipe(gulp.dest('dist/css'));
    
    var buildFonts = gulp.src('app/fonts/**/*') // Переносим шрифты в продакшен
    .pipe(gulp.dest('dist/fonts'));
    
    var buildJs = gulp.src('app/js/**/*') // Переносим скрипты в продакшен
    .pipe(gulp.dest('dist/js'));
    
    var buildHtml = gulp.src('app/*.html') // Переносим HTML в продакшен
    .pipe(gulp.dest('dist'));
});
