const inst = u.extend( newPubSub() );
	
function addCustomEvts() {
	
}
function beforeReady() {
	
}
function onReady() {
	addCustomEvts();
}

inst.beforeReady = beforeReady;
inst.onReady = onReady;

export default inst;