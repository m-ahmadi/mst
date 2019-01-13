const path = require("path");
const fs = require("fs-extra");
const shell = require("shelljs");
const Handlebars = require("handlebars");
const indent = require("indent.js");
const dirs = p => fs.readdirSync(p).filter( f => fs.statSync(p+"/"+f).isDirectory() );
const files = p => fs.readdirSync(p).filter( f => !fs.statSync(p+"/"+f).isDirectory() );
process.env.path += `${path.delimiter}./node_modules/.bin`;

let INP, OUT, ROOT, FLN;
setConfig("debug"); // default env

const args = process.argv.slice(2);
if ( args.includes("libs") ) libs();
if ( args.includes("compile=debug") ) debug();
if ( args.includes("compile=release") ) release();

if ( args.includes("compile=html") ) compileHtml();
if ( args.includes("compile=sass") ) compileSass();
if ( args.includes("compile=js") ) compileJs();
if ( args.includes("compile=templates") ) compileTemplates();

// theme
if ( args.includes("theme=css") ) themeCss();
if ( args.includes("theme=icons") ) themeIcons();

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// config

function setConfig(env) {
	if (env === "debug" || !env) {
		INP = "./src";
		OUT = "./dist";
		ROOT = "";
		FLN = "main.js";
	} else if (env === "release") {
		INP = "./src";
		OUT = "./release/static";
		ROOT = "/static/";
		FLN = "app.bundle.js";
	}
}
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// main build processes

function debug() {
	cleanupAndInit();
	
	
	
	writeHtml();
	compileHtml();
	compileSass();
	compileJs();
	// should make dirs beforehand for handlebars (it works after babel , but not before since babel makes dirs)
	compileTemplates();
}

function release() {
	setConfig("release");
	
	cleanupAndInit();
	
	
	
	writeHtml();
	compileHtml();
	compileSass("release");
	compileJs("release");
	compileTemplates("release");
}

function libs() {
	const libs = require("./libs.js");
	
	dirs(`${INP}/lib/`).forEach(i => {
		shell.rm("-rf", `${INP}/lib/${i}/*/`);
	});
	
	Object.keys(libs).forEach(page => {
		let pageLibs = libs[page].toCopy;
		if ( Array.isArray(pageLibs) && pageLibs.length ) {
			const path = `${INP}/lib/${page}/`;
			if ( !fs.existsSync(path) ) shell.mkdir("-p", path);
			pageLibs.forEach(i => {
				const trimmed = i.trim();
				if (trimmed.length) shell.cp("-r", `./node_modules/${i}/`, path);
			});
		}
	});
}
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// helper functions

function cleanupAndInit() {
	shell.rm("-rf", OUT);
	shell.mkdir("-p", OUT+"/css", OUT+"/js");
	shell.cp("-r", INP+"/lib", INP+"/images", INP+"/fonts", OUT);
	shell.mv(OUT+"/images/favicon.ico", OUT);
}

function compileHtml(env) {
	dirs(`${INP}/html/`).forEach(i => {
		fs.writeFileSync(`${INP}/html/${i}/links/root.htm`,           ROOT);
		fs.writeFileSync(`${INP}/html/${i}/scripts/root.htm`,         ROOT);
		fs.writeFileSync(`${INP}/html/${i}/scripts/app/root.htm`,     ROOT);
		fs.writeFileSync(`${INP}/html/${i}/scripts/app/filename.htm`, FLN);
		
		shell.exec(`htmlbilder ${INP}/html/${i}/ -o ${OUT}/${i}.html`);
	});
}

function compileSass(env) {
	dirs(`${INP}/sass/`).forEach(i => {
		if ( fs.existsSync(`${INP}/sass/${i}/style.scss`) ) {
			shell.mkdir("-p", `${OUT}/css/${i}/`);
			shell.exec(`sass ${INP}/sass/${i}/style.scss:${OUT}/css/${i}/style.css` +
				(env === "release" ? " --style=compressed --no-source-map" : ""));
		}
	});
}

function compileJs(env) {
	if (env === "debug" || !env) {
		fs.writeFileSync(`${INP}/js/common/root.js`, 'export default "";');
		
		dirs(`${INP}/js/`).forEach(i => {
			shell.exec(`babel ${INP}/js/${i}/ -d ${OUT}/js/${i}/ -s`);
		});
		
	} else if (env === "release") {
		fs.writeFileSync(`${INP}/js/common/root.js`, 'export default "${ROOT}";');
		
		dirs(`${INP}/js/`).forEach(i => {
			if (i !== "common") {
				const DIR = `${OUT}/js/${i}/`;
				const FILE = `${OUT}/js/${FLN}`;
				const FILE2 = `${OUT}/js/${i}/${FLN}`;
				
				shell.exec(`babel ${INP}/js/common/ -d ${OUT}/js/common/ --minified`);
				shell.exec(`babel ${INP}/js/${i}/ -d ${DIR}`);
				shell.exec(`r_js -o baseUrl=${DIR} name=main out=${FILE} optimize=uglify`); // optimize=none uglify
				shell.rm("-rf", DIR);
				shell.rm("-rf", `${OUT}/js/common/`);
				// shell.cp("-r", `${INP}/js/${i}/workers/`, `${OUT}/js/${i}/`);
				shell.exec(`babel ${INP}/js/${i}/workers/ -d ${OUT}/js/${i}/workers/ --minified`); // --minified
				shell.mv(FILE, `${OUT}/js/${i}/`);
				fs.writeFileSync(FILE2, fs.readFileSync(FILE2, "utf-8")+'require(["main"]);'); // "\n"
			}
		});
	}
}

function compileTemplates(env) {
	if (env === "debug" || !env) {
		dirs(`${INP}/templates/`).forEach(i => {
			shell.exec(`handlebars ${INP}/templates/${i}/template/ -f ${OUT}/js/${i}/templates.js -e hbs -o`);
			shell.exec(`handlebars ${INP}/templates/${i}/partial/ -f ${OUT}/js/${i}/partials.js -p -e hbs -o`);
		});
	} else if (env === "release") {
		dirs(`${INP}/templates/`).forEach(i => {
			const ensureDir = `${OUT}/js/${i}/`;
			const TEMPLATES_FILE = `${OUT}/js/${i}/templates.tmp.js`;
			const PARTIALS_FILE = `${OUT}/js/${i}/partials.tmp.js`;
			
			if ( !fs.existsSync(ensureDir) ) shell.mkdir("-p", ensureDir);
			
			shell.exec(`handlebars ${INP}/templates/${i}/template/ -f ${TEMPLATES_FILE} -e hbs -m -o`);
			shell.exec(`handlebars ${INP}/templates/${i}/partial/ -f ${PARTIALS_FILE} -p -e hbs -m -o`);
			fs.writeFileSync( `${OUT}/js/${i}/templates.js`, shell.cat(TEMPLATES_FILE, PARTIALS_FILE) );
			shell.rm("-rf", TEMPLATES_FILE, PARTIALS_FILE);
		});
	}
}

function writeHtml(env = "debug") {
	const libs = require("./libs.js");
	let links = "";
	let scripts = "";
	
	Object.keys(libs).forEach(k => {
		const { css, js } = libs[k];
		
		if (env === "debug") {
			if ( Array.isArray(css) ) {
				css.forEach(i => {
					links += `<link rel="styleSheet" type="text/css" href="{{root}}lib/${k}/${i}" />\n`;
				});
			}
			
			if ( Array.isArray(js) ) {
				js.forEach(i => {
					scripts += `<script type="text/javascript" src="{{root}}lib/${k}/${i}"></script>\n`;
				});
			}
		}
		
		if (k !== "common") {
			let appScripts = "";
			
			if (env === "debug") {
				appScripts += `<script type="text/javascript" src="{{root}}js/${k}/templates.js"></script>\n`;
				appScripts += `<script type="text/javascript" src="{{root}}js/${k}/partials.js"></script>\n`;
				appScripts += `<script data-main="{{root}}js/${k}/{{filename}}" src="{{root}}lib/common/requirejs/require.js"></script>`;
			} else if (env === "release") {
				scripts = `<script type="text/javascript" src="{{root}}js/${k}/libs.min.js"></script>\n`;
				appScripts += `<script data-main="{{root}}js/${k}/{{filename}}" src="{{root}}lib/common/require.min.js"></script>`;
			}
			
			fs.writeFileSync(`${INP}/html/${k}/links/main.handlebars`, links +
				`<link rel="styleSheet" type="text/css" href="{{root}}css/${k}/style.${env === 'debug' ? '' : 'min.'}css" />`);
			fs.writeFileSync(`${INP}/html/${k}/scripts/main.handlebars`, scripts + "{{{app}}}");
			fs.writeFileSync(`${INP}/html/${k}/scripts/app/main.handlebars`, appScripts);
		}
	});
}
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// theme construction

function themeCss() {
	shell.rm("-f", "./dist/lib/uikit-rtl.css");
	shell.cd("./src/theme/");
	shell.exec("sass site.scss:theme.css --no-source-map");
	shell.exec("rtlcss theme.css ../../src/lib/common/uikit-rtl.css");
	shell.rm("-f", "theme.css");
	shell.cd("../../");
	shell.cp("-f", "./src/lib/common/uikit-rtl.css", "./uk/dist/css/");
}

function themeIcons() {
	shell.rm("-f", "./dist/lib/common/uikit-icons.js");
	shell.rm("-rf", "./uk/custom/icons/");
	shell.mkdir("-p", "./uk/custom/icons/");
	shell.cp("-r", "./src/theme/icons/*", "./uk/custom/icons/");
	shell.cd("uk");
	shell.exec("npm run compile");
	shell.cp("dist/js/uikit-icons.js", "../src/lib/common/");
	shell.cd("../");
	shell.cp("-f", "./src/lib/common/uikit-icons.js", "./uk/dist/js/");
	shell.cp("-f", "./uk/dist/js/uikit.js", "./src/lib/common/");
}
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@