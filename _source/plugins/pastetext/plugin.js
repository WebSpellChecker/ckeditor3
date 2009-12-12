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

	var enterKeyPlugin = CKEDITOR.plugins.enterkey;

	function doInsertText( doc, text )
	{
		// Native text insertion.
		if( CKEDITOR.env.ie )
		{
			var selection = doc.selection;
			if ( selection.type == 'Control' )
				selection.clear();
			selection.createRange().pasteHTML( text );
		}
		else
			doc.execCommand( 'inserthtml', false, text );
	}

	function doEnter( editor, mode )
	{
		enterKeyPlugin[ mode == CKEDITOR.ENTER_BR ? 'enterBr' : 'enterBlock' ]( editor, mode );
	}

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

	var enterKeyPlugin = CKEDITOR.plugins.enterkey;

	function doInsertText( doc, text )
	{
		// Native text insertion.
		if( CKEDITOR.env.ie )
		{
			var selection = doc.selection;
			if ( selection.type == 'Control' )
				selection.clear();
			selection.createRange().pasteHTML( text );
		}
		else
			doc.execCommand( 'inserthtml', false, text );
	}

	function doEnter( editor, mode )
	{
		enterKeyPlugin[ mode == CKEDITOR.ENTER_BR ? 'enterBr' : 'enterBlock' ]( editor, mode );
	}

	CKEDITOR.editor.prototype.insertText = function( text )
	{
		var mode = this.getSelection().getStartElement().hasAscendant( 'pre', true ) ? CKEDITOR.ENTER_BR : this.config.enterMode,
			doc = this.document.$,
			self = this,
			line;

		text = CKEDITOR.tools.htmlEncode( text );

		var startIndex = 0;
		text.replace( /(?:\r\n)|\n|\r/g, function( match, lastIndex )
		{
			line = text.substring( startIndex, lastIndex );
			startIndex = lastIndex + match.length;
			line.length && doInsertText( doc, line );
			// Line-break as an editor enter key result.
			doEnter( self, mode );
		} );

		line = text.substring( startIndex, text.length );
		line.length && doInsertText( doc, line );
	};

})();


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
