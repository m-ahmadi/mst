/* module.exports = {
	common: [
		"requirejs",
		"handlebars",
		"jquery",
		"util-ma",
		"pubsub-ma",
		"!materialize-css"
	],
	index: ["", ""],
	login: ["", ""]
}; */

module.exports = {
	common: {
		css: [
			"byekan-fontface.css"
		],
		js: [
			"util-ma/util-ma.js",
			"pubsub-ma/pubsub-ma.js",
			"handlebars/dist/handlebars.runtime.js",
			"jquery/dist/jquery.js",
		],
		toCopy: [
			"requirejs",
			"handlebars",
			"jquery",
			"util-ma",
			"pubsub-ma",
			"materialize-css"
		]	
	},
	index: {css: [], js: [], toCopy: []},
	login: {css: [], js: [], toCopy: []}
};

module.exports = {
	common: {
		css: [
			{unmin: "byekan-fontface.css", min: "", srcmap: "", toCopy: ""}
		],
		js: [
			{ unmin: "util-ma/util-ma.js" }
			{ unmin: "pubsub-ma/pubsub-ma.js" },
			{
				unmin: "handlebars/dist/handlebars.runtime.js",
				min: "handlebars/dist/handlebars.runtime.min",
				srcmap: ""
			},
			{
				unmin: "jquery/dist/jquery.js",
				min: "jquery/dist/jquery.min.js",
				srcmap: "jquery/dist/jquery.min.map"
			},
		],
		toCopy: [
			"requirejs",
			"handlebars",
			"jquery",
			"util-ma",
			"pubsub-ma",
			"materialize-css"
		]	
	},
	index: {css: [], js: [], toCopy: []},
	login: {css: [], js: [], toCopy: []}
};