function Globals() {
}

Globals.prototype.start = function Globals_start() {
	loadWidgets(this.uiFrame.document.body);
}

Function.prototype.setContext = function Function_setContext(obj){
	var func = this;
	var args = Array.prototype.slice.call(arguments, 1);
	return function(){
		func.apply(obj, args);
	};
};

function loadWidgets(elem){
	loadElementWidgets(elem);
	var query = elem.ownerDocument.evaluate("./" + "/" + "*[@widget_class]", elem, null, 7, null);
	for( var i = 0,len = query.snapshotLength; i < len; i++ )
		loadElementWidgets(query.snapshotItem(i));
};

function loadElementWidgets(elem){
	var widgetClass = elem.getAttribute('widget_class');
	if (!widgetClass)
		return;
	if (!elem.id)
		elem.id = 'WIDGET' + WidgetListener.prototype.autoGenId++;
	for (var c = widgetClass.split(' '), j = 0; j < c.length; j++)
		new WidgetLoader(elem.id, c[j]);
};

// ScriptLoader
function ScriptLoader(id) {
	this.id = id;
};
ScriptLoader.prototype.load = function ScriptLoader_load(href) {
	this.href = href;
	this.createElement();
	this.elem.setAttribute('src', href);
	this.elem.ownerDocument.getElementsByTagName('head')[0].appendChild(this.elem);
};

ScriptLoader.prototype.createElement = function ScriptLoader_createElement(){

	this.elem = this.oDocument ? this.oDocument.createElement('script') : document.createElement('script');
	this.elem['type'] = 'text/javascript';
	this.elem.id = this.id;
	this.elem.onload = this.onDatasetComplete.setContext(this);
}; 

// WidgetLoader
function WidgetLoader(id, name) {
	this.id = id;
	this.name = name;
	this.onDatasetComplete();
};

WidgetLoader.prototype.onDatasetComplete = function WidgetLoader_onDatasetComplete(state){
	var names = this.name.split(':');
	if (!names[1]) {
		this.widgets[this.id + ':' + names[0]] = new window[names[0]](this.id); 
	}
};
WidgetLoader.prototype.widgets = {};
WidgetLoader.prototype.autoGenId = 0;

// Widget_CKEditor
function Widget_CKEditor(id) {
	this.id = id;
	this.createEditorElem();
};

Widget_CKEditor.prototype.createEditorElem = function Widget_CKEditor_createEditorElem() {
	
	var loader = new ScriptLoader();
	var obj = this;
	loader.onDatasetComplete = function(state) {
		obj.onDatasetComplete(state);
	};

	// loads the script in the script frame

	// NG
	loader.oDocument = globals.scriptFrame.document;

	// OK
	// loader.oDocument = globals.uiFrame.document;

	loader.load("../ckeditor_source.js");
}

Widget_CKEditor.prototype.onDatasetComplete = function Widget_CKEditor_onDatasetComplete(state){
	
	if (!window['CKEDITOR']) {
		if (globals.uiFrame['CKEDITOR']) {
			CKEDITOR = globals.uiFrame['CKEDITOR'];
		}
	}
	if (window['CKEDITOR'] && CKEDITOR.status == 'loaded') {
		globals.uiFrame.CKEDITOR = window['CKEDITOR'];
		var editor = CKEDITOR.replace( globals.uiFrame.document.getElementById( this.id ), {});
	}
	else {
		setTimeout(this.onDatasetComplete.setContext(this), 100);
	}
}

