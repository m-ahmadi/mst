module.exports = {
	common: {
		css: [
			"byekan-fontface.css",
			"uikit-rtl.css"
		],
		js: [
			"jquery/dist/jquery.js",
			"handlebars/dist/handlebars.runtime.js",
			"util-ma/util-ma.js",
			"pubsub-ma/pubsub-ma.js",
			"uikit.js",
			"uikit-icons.js",
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