/*
Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
*/

CKEDITOR.dialog.add( 'checkspell', function( editor )
{
	var number = CKEDITOR.tools.getNextNumber(),
		iframeId = 'cke_frame_' + number,
		textareaId = 'cke_data_' + number,
		errorBoxId = 'cke_error_' + number,
		interval,
		protocol = document.location.protocol || 'http:',
		errorMsg = editor.lang.spellCheck.notAvailable,
		constraints = {
			minWidth : 485,
			minHeight : 380
		};

	var pasteArea = '<textarea'+
			' style="display: none"' +
			' id="' + textareaId + '"' +
			' rows="10"' +
			' cols="40">' +
		' </textarea><div' +
			' id="' + errorBoxId + '"' +
			' style="display:none;color:red;font-size:16px;font-weight:bold;padding-top:160px;text-align:center;z-index:11;">' +
		'</div><iframe' +
			' src=""' +
			' style="width:100%;background-color:#f1f1e3;"' +
			' frameborder="0"' +
			' name="' + iframeId + '"' +
			' id="' + iframeId + '"' +
			' allowtransparency="1">' +
		'</iframe>';

	var wscCoreUrl = editor.config.wsc_customLoaderScript || ( protocol +
			'//loader.webspellchecker.net/sproxy_fck/sproxy.php'
			+ '?plugin=fck2'
			+ '&customerid=' + editor.config.wsc_customerId
			+ '&cmd=script&doc=wsc&schema=22'
		);

	if ( editor.config.wsc_customLoaderScript )
		errorMsg += '<p style="color:#000;font-size:11px;font-weight: normal;text-align:center;padding-top:10px">' +
			editor.lang.spellCheck.errorLoading.replace( /%s/g, editor.config.wsc_customLoaderScript ) + '</p>';

	function burnSpelling( dialog, errorMsg )
	{
		var i = 0;
		return function ()
		{
			if ( typeof( window.doSpell ) == 'function' )
			{
				//Call from window.setInteval expected at once.
				if ( typeof( interval ) != 'undefined' )
					window.clearInterval( interval );

				initAndSpell( dialog );
			}
			else if ( i++ == 180 )								// Timeout: 180 * 250ms = 45s.
				window._cancelOnError( errorMsg );
		};
	}

	window._cancelOnError = function( m )
	{
		if ( typeof( window.WSC_Error ) == 'undefined' )
		{
			CKEDITOR.document.getById( iframeId ).setStyle( 'display', 'none' );
			var errorBox = CKEDITOR.document.getById( errorBoxId );
			errorBox.setStyle( 'display', 'block' );
			errorBox.setHtml( m || editor.lang.spellCheck.notAvailable );
		}
	};

	function initAndSpell( dialog )
	{
		var LangComparer = new window._SP_FCK_LangCompare(),							// Language abbr standarts comparer.
			pluginPath = CKEDITOR.getUrl( editor.plugins.wsc.path + 'dialogs/' ),			// Service paths corecting/preparing.
			framesetPath = pluginPath + 'tmpFrameset.html';

		// global var is used in FCK specific core
		// change on equal var used in fckplugin.js
		window.gFCKPluginName = 'wsc';

		LangComparer.setDefaulLangCode( editor.config.defaultLanguage );

		window.doSpell({
			ctrl : textareaId,

			lang : editor.config.wsc_lang || LangComparer.getSPLangCode(editor.langCode ),
			intLang: editor.config.wsc_uiLang || LangComparer.getSPLangCode(editor.langCode ),
			winType : iframeId,		// If not defined app will run on winpopup.

			// Callback binding section.
			onCancel : function()
			{
				dialog.hide();
			},
			onFinish : function( dT )
			{
				editor.focus();
				dialog.getParentEditor().setData( dT.value );
				dialog.hide();
			},

			// Some manipulations with client static pages.
			staticFrame : framesetPath,
			framesetPath : framesetPath,
			iframePath : pluginPath + 'ciframe.html',

			userDictionaryName: editor.config.wsc_userDictionaryName,
			customDictionaryName: editor.config.wsc_customDictionaryIds && editor.config.wsc_customDictionaryIds.split(","),
			domainName: editor.config.wsc_domainName

		});

		// Hide user message console (if application was loaded more then after timeout).
		CKEDITOR.document.getById( errorBoxId ).setStyle( 'display', 'none' );
		CKEDITOR.document.getById( iframeId ).setStyle( 'display', 'block' );
	}

	function initView(dialog) {
		var newViewSettings = {
				left: parseInt(editor.config.wsc_left, 10),
				top: parseInt(editor.config.wsc_top, 10),
				width: parseInt(editor.config.wsc_width, 10),
				height: parseInt(editor.config.wsc_height, 10)
			},
			viewSize = CKEDITOR.document.getWindow().getViewPaneSize(),
			currentPosition = dialog.getPosition(),
			currentSize = dialog.getSize(),
			savePosition = 0;

		if(!dialog._.resized) {
			var wrapperHeight = currentSize.height - dialog.parts.contents.getSize('height',  !(CKEDITOR.env.gecko || CKEDITOR.env.opera || CKEDITOR.env.ie && CKEDITOR.env.quirks)),
				wrapperWidth = currentSize.width - dialog.parts.contents.getSize('width', 1);

			if(newViewSettings.width < constraints.minWidth || isNaN(newViewSettings.width)) {
				newViewSettings.width = constraints.minWidth;
			}
			if(newViewSettings.width > viewSize.width - wrapperWidth) {
				newViewSettings.width = viewSize.width - wrapperWidth;
			}

			if(newViewSettings.height < constraints.minHeight || isNaN(newViewSettings.height)) {
				newViewSettings.height = constraints.minHeight;
			}
			if(newViewSettings.height > viewSize.height - wrapperHeight) {
				newViewSettings.height = viewSize.height - wrapperHeight;
			}

			currentSize.width = newViewSettings.width + wrapperWidth;
			currentSize.height = newViewSettings.height + wrapperHeight;

			dialog._.fromResizeEvent = false;
			dialog.resize(newViewSettings.width, newViewSettings.height);
		}

		if(!dialog._.moved) {
			savePosition = isNaN(newViewSettings.left) && isNaN(newViewSettings.top) ? 0 : 1;

			if(isNaN(newViewSettings.left)) {
				newViewSettings.left = (viewSize.width - currentSize.width) / 2;
			}
			if(newViewSettings.left < 0) {
				newViewSettings.left = 0;
			}
			if(newViewSettings.left > viewSize.width - currentSize.width) {
				newViewSettings.left = viewSize.width - currentSize.width;
			}

			if(isNaN(newViewSettings.top)) {
				newViewSettings.top = (viewSize.height - currentSize.height) / 2;
			}
			if(newViewSettings.top < 0) {
				newViewSettings.top = 0;
			}
			if(newViewSettings.top > viewSize.height - currentSize.height) {
				newViewSettings.top = viewSize.height - currentSize.height;
			}

			dialog.move(newViewSettings.left, newViewSettings.top, savePosition);
		}
	}

	return {
		title : editor.config.wsc_dialogTitle || editor.lang.spellCheck.title,
		minWidth : constraints.minWidth,
		minHeight : constraints.minHeight,
		buttons : [ CKEDITOR.dialog.cancelButton ],
		onShow : function()
		{

			var contentArea = this.getContentElement( 'general', 'content' ).getElement();
			contentArea.setHtml( pasteArea );
			contentArea.getChild( 2 ).setStyle( 'height', this._.contentSize.height + 'px' );

			CKEDITOR.scriptLoader.load(wscCoreUrl);

			var sData = editor.getData();											// Get the data to be checked.
			CKEDITOR.document.getById( textareaId ).setValue( sData );

			interval = window.setInterval( burnSpelling( this, errorMsg ), 250 );

			initView(this);
		},
		onHide : function()
		{
			window.ooo = undefined;
			window.int_framsetLoaded = undefined;
			window.framesetLoaded = undefined;
			window.is_window_opened = false;
		},
		contents : [
			{
				id : 'general',
				label : editor.config.wsc_dialogTitle || editor.lang.spellCheck.title,
				padding : 0,
				elements : [
					{
						type : 'html',
						id : 'content',
						html : ''
					}
				]
			}
		]
	};
});

// Expand the spell-check frame when dialog resized. (#6829)
CKEDITOR.dialog.on( 'resize', function( evt )
{
	var data = evt.data,
		dialog = data.dialog;

	if ( dialog._.name == 'checkspell' )
	{
		var content = dialog.getContentElement( 'general', 'content' ).getElement(),
			iframe = content && content.getChild( 2 );

		iframe && iframe.setSize( 'height', data.height );
		iframe && iframe.setSize( 'width', data.width );

		// add flag that indicate whether dialog has been resized by user
		if(dialog._.fromResizeEvent && !dialog._.resized) {
			dialog._.resized = true;
		}
		dialog._.fromResizeEvent = true;
	}
});