var mozeditor = {
	dialog : null,

	/**
		Setup hook to configure the context menu
	*/
  onLoad: function() {
    document.getElementById("contentAreaContextMenu").addEventListener("popupshowing",
			function(e) { mozeditor.showContextMenu(e); }, false);
  },

	/**
	 Show or hide the menuitem based on what the context menu is on
	 see http://kb.mozillazine.org/Adding_items_to_menus
	 Enable it only for textareas and editable iFrames
	*/
  showContextMenu: function(event) {
		var target = gContextMenu.target;
		var name = target.nodeName.toUpperCase();
		var hideIt = (name != 'TEXTAREA') ;
		document.getElementById("sep_mozeditor").hidden = hideIt ;
		document.getElementById("context-mozeditor").hidden = hideIt ;
  },

	/**
		Called from the context menu
	*/
  onMenuItemCommand: function(e) {
		if (this.dialog && this.dialog.closed)
			this.cleanUp();

		if (this.editorInfo)
		{
			this.alert("Write Area is already enabled for another tab. Please, close that editor first.");
			return;
		}
		var editorInfo;
		var element = this.target = gContextMenu.target ;

		editorInfo = {
			data: element.value,
			type: 'textarea',
			baseHref : ''
		};

		// store the browser where the editor is being used.
		// this way we can hide/show the bottom pane as needed.
		editorInfo.browser = gBrowser.selectedBrowser;

		// Arguments that will be sent to the editor
		// store them in the object so they can be read by the editor
		this.editorInfo = editorInfo;

		this.openWindow(editorInfo);
	},

	openWindow: function(args) {
		args.closeFunction = this.closeWindow;
		// dialog=no to get the minimize and maximize buttons
		this.dialog = window.openDialog('chrome://mozeditor/content/editorContainer.xul', "mozeditor", "width=780,height=500,resizable=yes,dialog=no", args ) ;
	},

	closeWindow: function(data) {
		var element = mozeditor.target;

		element.value = data ;

		mozeditor.dialog.close() ;
		mozeditor.cleanUp();
	},


	cleanUp: function() {
		delete mozeditor.dialog;
		delete mozeditor.editorInfo;
		delete mozeditor.target;
	},

// Just for debug
	_toConsole: function(msg) {
		var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                  .getService(Components.interfaces.nsIPromptService);
    promptService.alert(window, "Debug", msg);
	},

	alert: function(msg) {
		var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                  .getService(Components.interfaces.nsIPromptService);
    promptService.alert(window, "Write Area", msg);
	}

};

window.addEventListener("load", function(e) { mozeditor.onLoad(e); }, false);


