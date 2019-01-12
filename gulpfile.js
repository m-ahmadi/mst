const fs = require("fs");
const gulp = require("gulp");
const shell = require("gulp-shell");
const shelljs = require("shelljs");
const cwp = fs.readFileSync("cwp.txt", "utf-8"); // current working page
const dirs = p => fs.readdirSync(p).filter( f => fs.statSync(p+"/"+f).isDirectory() );
const files = p => fs.readdirSync(p).filter( f => !fs.statSync(p+"/"+f).isDirectory() );
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// watching html

// gulp.task("html", shell.task("echo salam olaghe aziz"));
gulp.task("html", cb => {
	shelljs.exec("echo hello");
	//shell.task("echo hello");
	cb();
});

gulp.task("html-w", () => {
	gulp.watch(
		["./src/html/**", "!/src/html/LAYOUTS/**"],
		{ignoreInitial: false},
		gulp.series("temp")
	);
});

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// watching templates
const t = `handlebars ./src/templates/${cwp}/template/ -f ./dist/js/${cwp}/templates.js -e hbs -o`;
const p = `handlebars ./src/templates/${cwp}/partial/ -f ./dist/js/${cwp}/partials.js -p -e hbs -o`;

gulp.task( "temp", shell.task(t) );
gulp.task( "part", shell.task(p) );

gulp.task("temp-w", () => {
	gulp.watch( `./src/templates/${cwp}/template/**`, {ignoreInitial: false}, gulp.series("temp") );
});
gulp.task("part-w", () => {
	gulp.watch( `./src/templates/${cwp}/partial/**`, {ignoreInitial: false}, gulp.series("part") );
});
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// livereload
const livereload = require("gulp-livereload");
const h = "./dist/index.html";
const c = "./dist/css/**/*.css";
const j = "./dist/js/**/*.js";

gulp.task("live-html", cb => {
	gulp.src(h)
		.pipe( livereload() );
	cb();
});
gulp.task("live-css", cb => {
	gulp.src(c)
		.pipe( livereload() );
	cb();
});
gulp.task("live-js", cb => {
	gulp.src(j)
		.pipe( livereload() );
	cb();
});
gulp.task("live", () => {
	livereload.listen();
	gulp.watch( h, gulp.series("live-html") );
	gulp.watch( c, gulp.series("live-css") );
	gulp.watch( j, gulp.series("live-js") );
});
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@