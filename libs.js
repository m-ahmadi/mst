module.exports = {
	common: {
		css: [
			'byekan-fontface.css',
			'uikit-rtl.css',
			'fontawesome-free/css/all.css'
		],
		js: [
			'jquery/dist/jquery.js',
			'handlebars/dist/handlebars.runtime.js',
			'util-ma/util-ma.js',
			'pubsub-ma/pubsub-ma.js',
			'uikit.js',
			'uikit-icons.js',
			'ionicons/dist/ionicons.js'
		],
		toCopy: [
			'requirejs',
			'handlebars',
			'jquery',
			'util-ma',
			'pubsub-ma',
			'materialize-css',
			'@fortawesome/fontawesome-free',
			'ionicons'
		]	
	},
	index: {css: [], js: [], toCopy: []},
	login: {css: [], js: [], toCopy: []}
};