const fs = require("fs");
const gulp = require("gulp");
const shell = require("gulp-shell");
const CWP = fs.readFileSync("CWP.txt", "utf-8"); // current working page
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// watching templates
const t = `handlebars ./src/templates/${CWP}/template/ -f ./dist/js/${CWP}/templates.js -e hbs -o`;
const p = `handlebars ./src/templates/${CWP}/partial/ -f ./dist/js/${CWP}/partials.js -p -e hbs -o`;

const ct = `handlebars ./src/templates/common/template/ -f ./dist/js/${CWP}/templates.js -e hbs -o`;
const cp = `handlebars ./src/templates/common/partial/ -f ./dist/js/${CWP}/partials.js -p -e hbs -o`;

gulp.task( "temp", shell.task(t) );
gulp.task( "part", shell.task(p) );
gulp.task( "ctemps", shell.task([ct, cp]) );

gulp.task("temp-w", () => {
	gulp.watch( `./src/templates/${CWP}/template/**/*.hbs`, {ignoreInitial: false}, gulp.series("temp") );
});
gulp.task("part-w", () => {
	gulp.watch( `./src/templates/${CWP}/partial/**/*.hbs`, {ignoreInitial: false}, gulp.series("part") );
});
gulp.task("ctemps-w", () => {
	gulp.watch( `./src/templates/common/**/*.hbs`, {ignoreInitial: false}, gulp.series("ctemps") );
});	
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// livereload
const livereload = require("gulp-livereload");
const h = `./dist/${CWP}.html`;
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