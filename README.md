# gulp-direact
Precompiler that allows usage of React components directly inside markup as custom tags.

[![NPM](https://nodei.co/npm/gulp-direact.png?compact=true)](https://nodei.co/npm/gulp-direact/)

## Markup usage
```html
<!DOCTYPE html>
<html>
  <head></head>
  <body>
    <!-- using my component directly inside my markup -->
    <Clock color="red" />

    <!-- including React and my component's source -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/react/0.12.2/react.min.js"></script>
    <script src="/js/Clock.js"></script>
  </body>
</html>
```

## Gulp usage
```javascript
var gulp = require('gulp');
var react = require('gulp-react');
var direact = require('gulp-direact');

var path = {
   HTML: 'src/index.html',
   ALL: ['src/js/*.js', 'src/js/**/*.js', 'src/index.html'],
   JS: ['src/js/*.js', 'src/js/**/*.js'],
   DEST_JS: 'dist/js',
   DEST: 'dist'
};

gulp.task('transformJS', function(){
   gulp.src(path.JS)
   .pipe(react())
   .pipe(gulp.dest(path.DEST_JS));
});

gulp.task('transformHTML', function(){
   gulp.src(path.HTML)
   .pipe(direact())
   .pipe(gulp.dest(path.DEST));
});

gulp.task('watch', function(){
   gulp.watch(path.ALL, ['transformJS', 'transformHTML']);
});

gulp.task('default', ['transformJS', 'transformHTML']);
```
