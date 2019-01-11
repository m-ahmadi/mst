const gulp = require("gulp");
const livereload = require("gulp-livereload");
const h = "./index.html";
const c = "./css/**/*.css";
const j = "./js/**/*.js";

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
	
	gulp.watch(h, gulp.series("live-html"));
	gulp.watch(c, gulp.series("live-css"));
	gulp.watch(j, gulp.series("live-js"));
});
gulp.task("default", ["live"]);