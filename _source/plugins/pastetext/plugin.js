/*
Copyright (c) 2003-2009, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
*/

/**
 * @file Paste as plain text plugin
 */

(function()
{
	// The pastetext command definition.
	var pasteTextCmd =
	{
		exec : function( editor )
		{
			var clipboardText = CKEDITOR.getClipboardText( editor );
			if ( !clipboardText )   // Clipboard access privilege is not granted.  
			{
				editor.openDialog('pastetext');
				return false;
			}
			else
				editor.fire('paste', { 'text' : clipboardText });
		}
	};

	// Register the plugin.
	CKEDITOR.plugins.add( 'pastetext',
	{
		init : function( editor )
		{
			var commandName = 'pastetext',
				command = editor.addCommand( commandName, pasteTextCmd );

			editor.ui.addButton( 'PasteText',
				{
					label : editor.lang.pasteText.button,
					command : commandName
				});

			CKEDITOR.dialog.add( commandName, CKEDITOR.getUrl( this.path + 'dialogs/pastetext.js' ) );

			if( editor.config.forcePasteAsPlainText )
			{
				editor.on( 'pasteDialog', function ( evt )
				{
					editor.execCommand( 'pastetext' );
					evt.cancel();
				}, null, null, 0 );

			}

		},
		requires : [ 'clipboard' ]
	});

	CKEDITOR.getClipboardText =
		CKEDITOR.env.ie ? function()
		{
			var clipboardAccess = window.clipboardData;
			return clipboardAccess && clipboardAccess.getData( 'Text' );
		}
		:
		CKEDITOR.env.gecko ? function(copytext)
		{
			try {
				if ( netscape.security.PrivilegeManager.enablePrivilege ) {
					netscape.security.PrivilegeManager.enablePrivilege( "UniversalXPConnect" );
				}
				else
					return;
			} catch ( ex )
			{
				return;
			}

			var clip = Components.classes[ "@mozilla.org/widget/clipboard;1" ].getService(Components.interfaces.nsIClipboard);
			if ( !clip ) return false;

			var trans = Components.classes[ "@mozilla.org/widget/transferable;1" ].createInstance( Components.interfaces.nsITransferable );
			if ( !trans ) return false;
			trans.addDataFlavor( "text/unicode" );
			clip.getData( trans, clip.kGlobalClipboard );

			var str = {}, strLength = {}, pastetext;
			trans.getTransferData("text/unicode", str, strLength);
			if ( str )
				str = str.value.QueryInterface( Components.interfaces.nsISupportsString );
			if ( str )
				pastetext = str.data.substring( 0, strLength.value / 2 );
			return pastetext;
		}
		// Currently in Safari 'paste' event is only available in response
		// to the user action, while the codes below may work in the future. 
//		: CKEDITOR.env.webkit ? function( editor )
//		{
//			var doc = editor.document,
//				clipboardText;
//			doc.on( 'paste', function( evt )
//			{
//			    evt.data.preventDefault( true );
//				clipboardText = evt.clipboardData.getData( 'text/plain' );
//			} );
//			try
//			{
//				if ( !doc.$.execCommand( 'Paste', false, null ) )
//					throw 0;
//			}
//			catch ( e )
//			{
//				return;
//			}
//			return clipboardData;
//		}
		// Opera has no support for clipboard access.
		: function(){};
})();

CKEDITOR.editor.prototype.insertText = function( text )
{
	text = CKEDITOR.tools.htmlEncode( text );

	// TODO: Replace the following with fill line break processing (see V2).
	text = text.replace( /(?:\r\n)|\n|\r/g, '<br>' );

	this.insertHtml( text );
};

/**
 * Whether to force all pasting operations to insert on plain text into the
 * editor, loosing any formatting information possibly available in the source
 * text.
 * @type Boolean
 * @default false
 * @example
 * config.forcePasteAsPlainText = true;
 */
CKEDITOR.config.forcePasteAsPlainText = false;
