const fs = require("fs");
const gulp = require("gulp");
const gulpShell = require("gulp-shell");
const shell = require("shelljs");
const Handlebars = require("handlebars");
const indent = require("indent.js");
const cwp = fs.readFileSync("cwp.txt", "utf-8"); // current working page
const dirs = p => fs.readdirSync(p).filter( f => fs.statSync(p+"/"+f).isDirectory() );
const files = p => fs.readdirSync(p).filter( f => !fs.statSync(p+"/"+f).isDirectory() );
const INP = "./src";
const OUT = "./dist";
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// watching html

gulp.task("html", cb => {
	dirs(`${INP}/html/`).forEach(i => {
		if (i !== "LAYOUTS") {
			shell.exec(`htmlbilder ${INP}/html/${i}/ -o ${INP}/html/${i}.hbs`);
		}
	});
	
	const layouts = {};
	dirs(`${INP}/html/LAYOUTS/`).forEach(i => {
		const FILE = `${INP}/html/LAYOUTS/${i}.hbs`;
		shell.exec(`htmlbilder ${INP}/html/LAYOUTS/${i}/ -o ${FILE}`);
		layouts[ i.split(".")[0] ] = fs.readFileSync(FILE, "utf-8");
		fs.unlinkSync(FILE);
	});
	files(`${INP}/html/`).forEach(i => {
		if ( i.endsWith(".hbs") ) {
			let str = fs.readFileSync(`${INP}/html/${i}`, "utf-8");
			str = str.replace(/@@@/g, "{{{");
			str = str.replace(/%%%/g, "}}}");
			const template = Handlebars.compile(str);
			fs.writeFileSync( `${OUT}/${i.split(".")[0]}.html`, indent.html(template(layouts), {tabString: "  "}) );
			fs.unlinkSync(`${INP}/html/${i}`);
		}
	});
	// shell.exec("node build.js -- compile=html");
	cb();
});

gulp.task("html-w", () => {
	gulp.watch(
		["./src/html/**", "!/src/html/LAYOUTS/**"],
		{ignoreInitial: false},
		gulp.series("html")
	);
});
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// watching templates
const t = `handlebars ./src/templates/${cwp}/template/ -f ./dist/js/${cwp}/templates.js -e hbs -o`;
const p = `handlebars ./src/templates/${cwp}/partial/ -f ./dist/js/${cwp}/partials.js -p -e hbs -o`;

// gulp.task( "temp", gulpShell.task(t) );
// gulp.task( "part", gulpShell.task(p) );

gulp.task( "temp", cb => {
	dirs(`${INP}/templates/`).forEach(i => {
		shell.exec(`handlebars ${INP}/templates/${i}/template/ -f ${OUT}/js/${i}/templates.js -e hbs -o`);
	});
	cb();
});

gulp.task( "part", cb => {
	dirs(`${INP}/templates/`).forEach(i => {
		shell.exec(`handlebars ${INP}/templates/${i}/partial/ -f ${OUT}/js/${i}/partials.js -p -e hbs -o`);
	});
	cb();
});
	
gulp.task("temp-w", () => {
	gulp.watch( "./src/templates/**partial/", {ignoreInitial: false}, gulp.series("temp") );
});
gulp.task("part-w", () => {
	gulp.watch( "../src/templates/**/*", {ignoreInitial: false}, gulp.series("part") );
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