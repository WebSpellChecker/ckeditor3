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
			var clipboardText = CKEDITOR.tools.tryThese(
				function()
				{
					var clipboardText = window.clipboardData.getData( 'Text' );
					if ( !clipboardText )
						throw 0;
					return clipboardText;
				},
				function()
				{
					netscape.security.PrivilegeManager.enablePrivilege( "UniversalXPConnect" );

					var clip = Components.classes[ "@mozilla.org/widget/clipboard;1" ]
							.getService( Components.interfaces.nsIClipboard );
					var trans = Components.classes[ "@mozilla.org/widget/transferable;1" ]
							.createInstance( Components.interfaces.nsITransferable );
					trans.addDataFlavor( "text/unicode" );
					clip.getData( trans, clip.kGlobalClipboard );

					var str = {}, strLength = {}, clipboardText;
					trans.getTransferData( "text/unicode", str, strLength );
					str = str.value.QueryInterface( Components.interfaces.nsISupportsString );
					clipboardText = str.data.substring( 0, strLength.value / 2 );
					return clipboardText;
				}
				// Any other approach that's working... 
				);
			
			if ( !clipboardText )   // Clipboard access privilege is not granted.
			{
				editor.openDialog( 'pastetext' );
				return false;
			}
			else
				editor.fire( 'paste', { 'text' : clipboardText } );
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
				} );

			CKEDITOR.dialog.add( commandName, CKEDITOR.getUrl( this.path + 'dialogs/pastetext.js' ) );

			if( editor.config.forcePasteAsPlainText )
			{
				// Intercept the default pasting process.
				editor.on( 'beforeCommandExec', function ( evt )
				{
					if ( evt.data.name == 'paste' )
					{
						editor.execCommand( 'pastetext' );
						evt.cancel();
					}
				}, null, null, 0 );
			}
		},
		requires : [ 'clipboard' ]
	});
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
CKEDITOR.config.forcePasteAsPlainText = true;
