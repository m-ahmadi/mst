const fs = require("fs-extra");
const shell = require("shelljs");
const Handlebars = require("handlebars");
const indent = require("indent.js");
const dirs = p => fs.readdirSync(p).filter( f => fs.statSync(p+"/"+f).isDirectory() );
const files = p => fs.readdirSync(p).filter( f => !fs.statSync(p+"/"+f).isDirectory() );
// console.log(process.argv);
process.env.path += ";./node_modules/.bin";

let args = process.argv.slice(3);
if ( args.filter(i => i === "compile=debug")[0] ) {
	debug();
} else if ( args.filter(i => i === "compile=release")[0] ) {
	release();
}
if ( args.includes("libs") ) libs();

// theme
if ( args.includes("theme") ) { themeIcons(); themeCss(); }
if ( args.filter(i => i === "theme=icons")[0] ) themeIcons();
if ( args.filter(i => i === "theme=css")[0] ) themeCss();


function libs() {
	const libs = require("./libs.js");
	const INP = "./src";
	
	shell.rm("-rf", `${INP}/lib/`);
	
	Object.keys(libs).forEach(page => {
		let pageLibs = libs[page];
		if ( Array.isArray(pageLibs) ) {
			const path = `${INP}/lib/${page}/`;
			if ( !fs.existsSync(path) ) shell.mkdir("-p", path);
			pageLibs.forEach(i => {
				const trimmed = i.trim();
				if (trimmed.length > 0) shell.cp("-r", `./node_modules/${i}/`, path);
			});
		}
	});
};

function debug() {
	const INP = "./src";
	const OUT = "./dist";
	const ROOT = "";
	
	shell.rm("-rf", OUT);
	shell.mkdir("-p", OUT+"/css", OUT+"/js");
	shell.cp("-r", INP+"/lib", INP+"/images", INP+"/fonts", OUT);
	shell.mv(OUT+"/images/favicon.ico", OUT);
	
	fs.writeFileSync(INP+"/js/common/root.js", 'export default "";', "utf8");
	
	dirs(`${INP}/html/`).forEach(i => {
		if (i !== "LAYOUTS") {
			fs.writeFileSync(`${INP}/html/${i}/links/root.htm`,           ROOT,      "utf8");
			fs.writeFileSync(`${INP}/html/${i}/scripts/root.htm`,         ROOT,      "utf8");
			fs.writeFileSync(`${INP}/html/${i}/scripts/app/root.htm`,     ROOT,      "utf8");
			fs.writeFileSync(`${INP}/html/${i}/scripts/app/filename.htm`, "main.js", "utf8");
			//shell.exec(`htmlbilder ${INP}/html/${i}/ -o ${OUT}/${i}.html`);
			shell.exec(`htmlbilder ${INP}/html/${i}/ -o ${INP}/html/${i}.hbs`);
		}
	});
	
	let layouts = {};
	files(`${INP}/html/LAYOUTS/`).forEach(i => {
		layouts[ i.split(".")[0] ] = fs.readFileSync(`${INP}/html/LAYOUTS/${i}`, {encoding: "utf-8", flag: "r"});
	});
	files(`${INP}/html/`).forEach(i => {
		if ( i.endsWith(".hbs") ) {
			let str = fs.readFileSync(`${INP}/html/${i}`, {encoding: "utf-8", flag: "r"});
			str = str.replace(/@@@/g, "{{{");
			str = str.replace(/%%%/g, "}}}");
			let template = Handlebars.compile(str);
			fs.writeFileSync(`${OUT}/${i.split(".")[0]}.html`, indent.indentHTML(template(layouts), "  "), "utf8");
			fs.unlinkSync(`${INP}/html/${i}`);
		}
	});
	
	dirs(`${INP}/js/`).forEach(i => {
		if (i === "common") {
			shell.exec(`babel ${INP}/js/common/ -d ${OUT}/js/common/ -s`);
		} else {
			shell.exec(`babel ${INP}/js/${i}/ -d ${OUT}/js/${i}/ -s`);
		}
	});
	
	// should make dirs beforehand for handlebars (it works after babel , but not before since babel makes dirs)
	dirs(`${INP}/templates/`).forEach(i => {
		if (i === "common") {
			shell.exec(`handlebars ${INP}/templates/common/template/ -f ${OUT}/js/common/templates.js -e hbs -m -o`);
			shell.exec(`handlebars ${INP}/templates/common/partial/ -f ${OUT}/js/common/partials.js -p -e hbs -m -o`);
		} else {
			shell.exec(`handlebars ${INP}/templates/${i}/template/ -f ${OUT}/js/${i}/templates.js -e hbs -m -o`);
			shell.exec(`handlebars ${INP}/templates/${i}/partial/ -f ${OUT}/js/${i}/partials.js -p -e hbs -m -o`);
		}
	});
	
	dirs(`${INP}/sass/`).forEach(i => {
		shell.mkdir("-p", `${OUT}/css/${i}/`);
		if (i === "common") {
			shell.exec(`chcp 1252 && sass ${INP}/sass/common/style.scss:${OUT}/css/common/style.css --style expanded --sourcemap=auto`);
		} else {
			shell.exec(`chcp 1252 && sass ${INP}/sass/${i}/style.scss:${OUT}/css/${i}/style.css --style expanded --sourcemap=auto`);
		}
	});
	
}

function release() {
	const INP = "./src";
	const OUT = "./release/static";
	const ROOT = "/static/";
	const FL = "app.bundle.js";
	
	shell.rm("-rf", OUT);
	shell.mkdir("-p", OUT+"/css", OUT+"/js");
	shell.cp("-r", INP+"/lib", INP+"/images", INP+"/fonts", OUT);
	shell.mv(OUT+"/images/favicon.ico", OUT);

	fs.writeFileSync(INP+"/html/links/root.htm",           ROOT,                       "utf8");
	fs.writeFileSync(INP+"/html/scripts/root.htm",         ROOT,                       "utf8");
	fs.writeFileSync(INP+"/html/scripts/app/root.htm",     ROOT,                       "utf8");
	fs.writeFileSync(INP+"/html/scripts/app/filename.htm", FL,                         "utf8");
	fs.writeFileSync(INP+"/js/core/root.js",               "export default '${ROOT}';", "utf8");

	shell.exec(`htmlbilder ${INP}/html/ -o ./release/index.html`);
	
	const TEMPLATES_FILE = `${OUT}/js/templates.tmp.js`;
	const PARTIALS_FILE = `${OUT}/js/partials.tmp.js`;
	shell.exec(`handlebars ${INP}/templates/template/ -f ${TEMPLATES_FILE} -e hbs -m -o`);
	shell.exec(`handlebars ${INP}/templates/partial/ -f ${PARTIALS_FILE} -p -e hbs -m -o`);
	fs.writeFileSync(`${OUT}/js/templates.js`, shell.cat(TEMPLATES_FILE, PARTIALS_FILE), "utf8");
	shell.rm("-rf", TEMPLATES_FILE, PARTIALS_FILE);
	
	const TMP = `${OUT}/js/app.unbabeled.js`;
	shell.exec(`r_js -o baseUrl=${INP}/js/ name=main out=${TMP} optimize=none`);
	shell.exec(`babel ${TMP} -o ${OUT}/js/${FL} --minified`); // --minified
	shell.rm("-rf", TMP);
	shell.cp("-r", `${INP}/js/workers/`, `${OUT}/js/`);
	
	shell.exec(`node-sass ${INP}/sass/style.scss > ${OUT}/css/style.css --output-style compressed`);
}

function themeCss() {
	shell.rm("-f", "./dist/lib/uikit-rtl.css");
	shell.cd("./src/theme/");
	shell.exec("node-sass site.scss > theme.css --output-style expanded");
	shell.exec("rtlcss theme.css ../../dist/lib/common/uikit-rtl.css");
	shell.rm("-f", "theme.css");
	shell.cd("../../");
	shell.cp("-f", "./dist/lib/common/uikit-rtl.css", "./uk/dist/css/");
}

function themeIcons() {
	shell.rm("-f", "./dist/lib/common/uikit-icons.js");
	shell.rm("-rf", "./uk/custom/icons/");
	shell.mkdir("-p", "./uk/custom/icons/");
	shell.cp("-r", "./src/theme/icons/*", "./uk/custom/icons/");
	shell.cd("uk");
	shell.exec("npm run compile");
	shell.cp("dist/js/uikit-icons.js", "../dist/lib/common/");
	shell.cd("../");
	shell.cp("-f", "./dist/lib/common/uikit-icons.js", "./uk/dist/js/");
}