const gulp = require("gulp");
const livereload = require("gulp-livereload");
const h = "./index.html";
const c = "./css/**/*.css";
const j = "./js/**/*.js";

gulp.task("live-html", () => {
	gulp.src(h)
		.pipe( livereload() );
});
gulp.task("live-css", () => {
	gulp.src(c)
		.pipe( livereload() );
});
gulp.task("live-js", () => {
	gulp.src(j)
		.pipe( livereload() );
});
gulp.task("live", () => {
	livereload.listen();
	
	gulp.watch(h, ["live-html"]);
	gulp.watch(c, ["live-css"]);
	gulp.watch(j, ["live-js"]);
});
gulp.task("default", ["live"]);