/*
Copyright (c) 2003-2009, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
*/

/**
 * @file Clipboard support
 */

(function()
{
	// Tries to execute any of the paste, cut or copy commands in IE. Returns a
	// boolean indicating that the operation succeeded.
	var execIECommand = function( editor, command )
	{
		var doc = editor.document,
			body = doc.getBody();

		var	enabled = false;
		var onExec = function()
		{
			enabled = true;
		};

		// The following seems to be the only reliable way to detect that
		// clipboard commands are enabled in IE. It will fire the
		// onpaste/oncut/oncopy events only if the security settings allowed
		// the command to execute.
		body.on( command, onExec );

		doc.$.execCommand( command );

		body.removeListener( command, onExec );

		return enabled;
	};

	// Attempts to execute the Cut and Copy operations.
	var tryToCutCopy =
		CKEDITOR.env.ie ?
			function( editor, type )
			{
				return execIECommand( editor, type );
			}
		:		// !IE.
			function( editor, type )
			{
				try
				{
					// Other browsers throw an error if the command is disabled.
					return editor.document.$.execCommand( type );
				}
				catch( e )
				{
					return false;
				}
			};

	// A class that represents one of the cut or copy commands.
	var cutCopyCmd = function( type )
	{
		this.type = type;
		this.canUndo = ( this.type == 'cut' );		// We can't undo copy to clipboard.
	};

	cutCopyCmd.prototype =
	{
		exec : function( editor, data )
		{
			var success = tryToCutCopy( editor, this.type );

			if ( !success )
				alert( editor.lang.clipboard[ this.type + 'Error' ] );		// Show cutError or copyError.

			return success;
		}
	};

	// Paste command.
	var pasteCmd =
		CKEDITOR.env.ie ?
			{
				exec : function( editor, data )
				{
					// Prevent IE from pasting at the begining of the document.
					editor.focus();

					if ( !editor.fire( 'beforePaste' )
						&& !execIECommand( editor, 'paste' ) )
					{
							editor.openDialog( 'paste' );
					}
				}
			}
		:
			{
				exec : function( editor )
				{
					try
					{
						if ( !editor.fire( 'beforePaste' )
							&& !editor.document.$.execCommand( 'Paste', false, null ) )
						{
							throw 0;
						}
					}
					catch ( e )
					{
						// Open the paste dialog.
						editor.openDialog( 'paste' );
					}
				}
			};

	// Listens for some clipboard related keystrokes, so they get customized.
	var onKey = function( event )
	{
		switch ( event.data.keyCode )
		{
			// Paste
			case CKEDITOR.CTRL + 86 :		// CTRL+V
			case CKEDITOR.SHIFT + 45 :		// SHIFT+INS

				var editor = this;
				editor.fire( 'saveSnapshot' );		// Save before paste

				if ( editor.fire( 'beforePaste' ) )
					event.cancel();
				// Simulate native 'paste' event for Opera/Firefox2. 
				else if( CKEDITOR.env.opera 
						 || CKEDITOR.env.gecko && CKEDITOR.env.version < 10900 )
					editor.document.getBody().fire( 'paste' );
					
				setTimeout( function()
					{
						editor.fire( 'saveSnapshot' );		// Save after paste
					}, 0 );
				return;

			// Cut
			case CKEDITOR.CTRL + 88 :		// CTRL+X
			case CKEDITOR.SHIFT + 46 :		// SHIFT+DEL

				// Save Undo snapshot.
				editor = this;
				editor.fire( 'saveSnapshot' );		// Save before paste
				setTimeout( function()
					{
						editor.fire( 'saveSnapshot' );		// Save after paste
					}, 0 );
		}
	};

	// Allow to peek clipboard content by redirecting the
	// pasting content into a temporary bin and grab the content of it.
	function getPasteBin( evt, callback ) {

		var doc = this.document;

		// Avoid recursions on 'paste' event for IE.
		if( CKEDITOR.env.ie && doc.getById( 'cke_pastebin' ) )
			return;

		var sel = this.getSelection(),
			range = new CKEDITOR.dom.range( doc );

		// Create container to paste into
		var pastebin = CKEDITOR.dom.element.createFromHtml( '<div id="cke_pastebin">&nbsp;</div>', doc );
		doc.getBody().append( pastebin );

		// Position the bin exactly at the position of the selected element
		// to avoid any subsequent document scroll.
		var position = sel.getStartElement().getDocumentPosition();
		pastebin.setStyles( {
			position : 'absolute',
			left : '-1000px',
			top : position.y + 'px',
			width : '1px',
			height : '1px',
			overflow : 'hidden'
		} );

		if ( CKEDITOR.env.ie )
		{
			// Select the container
			var ieRange = doc.getBody().$.createTextRange();
			ieRange.moveToElementText( pastebin.$ );
			// Re-direct the paste target, will fire another 'paste' event.
			ieRange.execCommand( 'Paste' );
			pastebin.remove();
			evt.data.preventDefault();
			callback( pastebin );
		}
		else
		{
			var bms = sel.createBookmarks();
			range.selectNodeContents( pastebin );
			range.select();
			// Wait a while and grab the pasted contents
			window.setTimeout( function() {

				pastebin.remove();

				// Grab the HTML contents
				// We need to look for a apple style wrapper on webkit it also adds a div wrapper if you copy/paste the body of the editor.
				// Remove hidden div and restore selection
				var bogusSpan;
				pastebin = ( CKEDITOR.env.webkit
						 && ( bogusSpan = pastebin.getFirst() )
						 && ( bogusSpan.is && bogusSpan.hasClass( 'Apple-style-span' ) ) ?
						  bogusSpan : pastebin );

				// Restore the old selection
				sel.selectBookmarks( bms );
				callback( pastebin );

			}, 0 );
		}
	};


	// Register the plugin.
	CKEDITOR.plugins.add( 'clipboard',
		{
			init : function( editor )
			{
				// Provide default 'html' paste handler. 
				editor.on( 'paste', function( evt )
				{
					editor.insertHtml( evt.data[ 'html' ] );
				} );

				function addButtonCommand( buttonName, commandName, command, ctxMenuOrder )
				{
					var lang = editor.lang[ commandName ];

					editor.addCommand( commandName, command );
					editor.ui.addButton( buttonName,
						{
							label : lang,
							command : commandName
						});

					// If the "menu" plugin is loaded, register the menu item.
					if ( editor.addMenuItems )
					{
						editor.addMenuItem( commandName,
							{
								label : lang,
								command : commandName,
								group : 'clipboard',
								order : ctxMenuOrder
							});
					}
				}

				addButtonCommand( 'Cut', 'cut', new cutCopyCmd( 'cut' ), 1 );
				addButtonCommand( 'Copy', 'copy', new cutCopyCmd( 'copy' ), 4 );
				addButtonCommand( 'Paste', 'paste', pasteCmd, 8 );

				CKEDITOR.dialog.add( 'paste', CKEDITOR.getUrl( this.path + 'dialogs/paste.js' ) );

				editor.on( 'key', onKey, editor );

				if( editor.config.autoDetectPaste )
					editor.on( 'contentDom', function()
					{
						var body = editor.document.getBody();
						body.on( 'paste', function( evt )
						{
							getPasteBin.call( editor, evt, function ( pasteBin )
							{
								var html = pasteBin.getHtml(),
									dataTransfer =
									{
										'html' : html
									};
								
								editor.fire( 'paste', dataTransfer );
								editor.fire( 'saveSnapshot' );		// Save after paste
							} );
						} );

					} );

				// If the "contextmenu" plugin is loaded, register the listeners.
				if ( editor.contextMenu )
				{
					function stateFromNamedCommand( command )
					{
						return editor.document.$.queryCommandEnabled( command ) ? CKEDITOR.TRISTATE_OFF : CKEDITOR.TRISTATE_DISABLED;
					}

					editor.contextMenu.addListener( function()
						{
							return {
								cut : stateFromNamedCommand( 'Cut' ),

								// Browser bug: 'Cut' has the correct states for both Copy and Cut.
								copy : stateFromNamedCommand( 'Cut' ),
								paste : CKEDITOR.env.webkit ? CKEDITOR.TRISTATE_OFF : stateFromNamedCommand( 'Paste' )
							};
						});
				}
			}
		});
})();

/**
 * Whether to automatically choose the right format when pasting based on the
 * detection of content text OR just leave it to the browser's default paste behavior.
 * @type Boolean
 * @default true
 * @example
 * config.autoDetectPaste = false;
 */
CKEDITOR.config.autoDetectPaste = true;
