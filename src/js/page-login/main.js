import page from "./mediator";

require.config({
	baseUrl: "js/",
	paths: {
		lib: "../lib"
	}
});

page.beforeReady();

$(function () {
	
	page.onReady();
	
});