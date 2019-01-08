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