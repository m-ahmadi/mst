const path = require("path");
const fs = require("fs-extra");
const shell = require("shelljs");
const Handlebars = require("handlebars");
const indent = require("indent.js");
const dirs = p => fs.readdirSync(p).filter( f => fs.statSync(p+"/"+f).isDirectory() );
const files = p => fs.readdirSync(p).filter( f => !fs.statSync(p+"/"+f).isDirectory() );
// console.log(process.argv);
process.env.path += `${path.delimiter}./node_modules/.bin`;

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
	
	Object.keys(libs).forEach(k => {
		let prop = libs[k];
	});
	
};

function writeHtml(env = "debug_hard") {
	const libs = require("./libs.js");
	const INP = "./src";
	let links = "";
	let scripts = "";
	
	Object.keys(libs).forEach(k => {
		const { css, js } = libs[k];
		
		if (env === "hard_debug") {
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
			
			if (env === "hard_debug") {
				appScripts += `<script type="text/javascript" src="{{root}}js/${k}/templates.js"></script>\n`;
				appScripts += `<script type="text/javascript" src="{{root}}js/${k}/partials.js"></script>\n`;
				appScripts += `<script data-main="{{root}}js/${k}/{{filename}}" src="{{root}}lib/common/requirejs/require.js"></script>`;
			} else if (env === "normal_debug") {
				
			} else if (env === "light_debug") {
				
			} else if (env === "light_release") {
				
			} else if (env === "hard_release" || env === "static_release") {
				links += `<link rel="styleSheet" type="text/css" href="{{root}}css/${k}/style.min.css" />\n`;
				scripts += `<script type="text/javascript" src="{{root}}js/${k}/libs.min.js"></script>`;
			} else if (env === "static_release") {
				links += `<link rel="styleSheet" type="text/css" href="{{root}}css/${k}/style.min.css" />\n`;
				scripts += `<script type="text/javascript" src="{{root}}js/${k}/libs.min.js"></script>`;
				appScripts += `<script data-main="{{root}}js/${k}/{{filename}}" src="{{root}}lib/common/requirejs/require.js"></script>`;
			}
			
			
			fs.writeFileSync(`${INP}/html/${k}/links/main.handlebars`, links +
				`<link rel="styleSheet" type="text/css" href="{{root}}css/${k}/style.css" />`);
			fs.writeFileSync(`${INP}/html/${k}/scripts/main.handlebars`, scripts + "{{{app}}}");
			fs.writeFileSync(`${INP}/html/${k}/scripts/app/main.handlebars`, appScripts);
		}
	});
}

function debug() {
	const INP = "./src";
	const OUT = "./dist";
	const ROOT = "";
	
	shell.rm("-rf", OUT);
	shell.mkdir("-p", OUT+"/css", OUT+"/js");
	shell.cp("-r", INP+"/lib", INP+"/images", INP+"/fonts", OUT);
	shell.mv(OUT+"/images/favicon.ico", OUT);
	
	fs.writeFileSync(INP+"/js/common/root.js", 'export default "";', "utf-8");
	
	dirs(`${INP}/html/`).forEach(i => {
		if (i !== "LAYOUTS") {
			fs.writeFileSync(`${INP}/html/${i}/links/root.htm`,           ROOT);
			fs.writeFileSync(`${INP}/html/${i}/scripts/root.htm`,         ROOT);
			fs.writeFileSync(`${INP}/html/${i}/scripts/app/root.htm`,     ROOT);
			fs.writeFileSync(`${INP}/html/${i}/scripts/app/filename.htm`, "main.js");
			//shell.exec(`htmlbilder ${INP}/html/${i}/ -o ${OUT}/${i}.html`);
			shell.exec(`htmlbilder ${INP}/html/${i}/ -o ${INP}/html/${i}.hbs`);
		}
	});
	
	const layouts = {};
	files(`${INP}/html/LAYOUTS/`).forEach(i => {
	layouts[ i.split(".")[0] ] = fs.readFileSync(`${INP}/html/LAYOUTS/${i}`, "utf-8");
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
			shell.exec(`sass ${INP}/sass/common/style.scss:${OUT}/css/common/style.css`);
		} else {
			shell.exec(`sass ${INP}/sass/${i}/style.scss:${OUT}/css/${i}/style.css`);
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
	
	fs.writeFileSync(INP+"/js/common/root.js", "export default '${ROOT}';");
	
	dirs(`${INP}/html/`).forEach(i => {
		if (i !== "LAYOUTS") {
			fs.writeFileSync(`${INP}/html/${i}/links/root.htm`,           ROOT);
			fs.writeFileSync(`${INP}/html/${i}/scripts/root.htm`,         ROOT);
			fs.writeFileSync(`${INP}/html/${i}/scripts/app/root.htm`,     ROOT);
			fs.writeFileSync(`${INP}/html/${i}/scripts/app/filename.htm`, FL);
			shell.exec(`htmlbilder ${INP}/html/${i}/ -o ${INP}/html/${i}.hbs`);
		}
	});
	
	const layouts = {};
	files(`${INP}/html/LAYOUTS/`).forEach(i => {
		layouts[ i.split(".")[0] ] = fs.readFileSync(`${INP}/html/LAYOUTS/${i}`, "utf-8");
	});
	files(`${INP}/html/`).forEach(i => {
		if ( i.endsWith(".hbs") ) {
			let str = fs.readFileSync(`${INP}/html/${i}`, "utf-8");
			str = str.replace(/@@@/g, "{{{");
			str = str.replace(/%%%/g, "}}}");
			const template = Handlebars.compile(str);
			fs.writeFileSync( `./release/${i.split(".")[0]}.html`, indent.html(template(layouts), {tabString: "  "}) );
			fs.unlinkSync(`${INP}/html/${i}`);
		}
	});
	writeHtml("release");
	dirs(`${INP}/js/`).forEach(i => {
		if (i !== "common") {
			const dir = `${OUT}/js/${i}/`;
			const file = `${OUT}/js/${FL}`;
			const file2 = `${OUT}/js/${i}/${FL}`;
			
			shell.exec(`babel ${INP}/js/common/ -d ${OUT}/js/common/ --minified`);
			shell.exec(`babel ${INP}/js/${i}/ -d ${dir}`);
			shell.exec(`r_js -o baseUrl=${dir} name=main out=${file} optimize=uglify`); // optimize=none uglify
			shell.rm("-rf", dir);
			shell.rm("-rf", `${OUT}/js/common/`);
			// shell.cp("-r", `${INP}/js/${i}/workers/`, `${OUT}/js/${i}/`);
			shell.exec(`babel ${INP}/js/${i}/workers/ -d ${OUT}/js/${i}/workers/ --minified`); // --minified
			shell.mv(file, `${OUT}/js/${i}/`);
			fs.writeFileSync(file2, fs.readFileSync(file2, "utf-8")+'require(["main"]);'); // "\n"
		}
	});
	
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
	
	
	
	shell.exec(`sass ${INP}/sass/style.scss:${OUT}/css/style.css --style=compressed --no-source-map`);
}

function themeCss() {
	shell.rm("-f", "./dist/lib/uikit-rtl.css");
	shell.cd("./src/theme/");
	shell.exec("sass site.scss:theme.css");
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