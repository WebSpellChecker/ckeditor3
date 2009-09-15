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

					if ( !execIECommand( editor, 'paste' ) )
						editor.fire( 'pasteDialog' );
				}
			}
		:
			{
				exec : function( editor )
				{
					try
					{
						if ( !editor.document.getBody().fire( 'beforepaste' )
							&& !editor.document.$.execCommand( 'Paste', false, null ) )
						{
							throw 0;
						}
					}
					catch ( e )
					{
						setTimeout( function()
						{
							editor.fire( 'pasteDialog' );
						}, 0 )
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

				var editor = this,
					body = editor.document.getBody();

				editor.fire( 'saveSnapshot' );		// Save before paste

				// Simulate 'beforepaste' event for all none-IEs.
				if ( !CKEDITOR.env.ie && body.fire( 'beforepaste' ) )
					event.cancel();
				// Simulate 'paste' event for Opera/Firefox2.
				else if( CKEDITOR.env.opera
						 || CKEDITOR.env.gecko && CKEDITOR.env.version < 10900 )
					body.fire( 'paste' );
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
	function getPasteBin( evt, mode, callback ) {

		var doc = this.document;

		// Avoid recursions on 'paste' event for IE.
		if( CKEDITOR.env.ie && doc.getById( 'cke_pastebin' ) )
			return;

		var sel = this.getSelection(),
			range = new CKEDITOR.dom.range( doc );

		// Create container to paste into
		var pastebin = new CKEDITOR.dom.element( mode == 'text' ? 'textarea' : 'div', doc );
		pastebin.setAttribute( 'id', 'cke_pastebin' );
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
			callback( pastebin[ 'get' + ( mode == 'text' ? 'Value' : 'Html' ) ]() );
		}
		else
		{
			var bms = sel.createBookmarks();
			// Turn off design mode temporarily,
			// give focus to the paste bin.
			if ( mode == 'text' )
			{
				doc.$.designMode = 'off';
				pastebin.$.focus();
			}
			else
			{
				range.setStartAt( pastebin, CKEDITOR.POSITION_AFTER_START );
				range.select();
			}
			// Wait a while and grab the pasted contents
			window.setTimeout( function() {

				doc.$.designMode = 'on';
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
				callback( pastebin[ 'get' + ( mode == 'text' ? 'Value' : 'Html' ) ]() );

			}, 0 );
		}
	};


	// Register the plugin.
	CKEDITOR.plugins.add( 'clipboard',
		{
			requires : [ 'htmldataprocessor' ],
			init : function( editor )
			{
				// The paste processor here is just a reduced copy of html data processor.
				CKEDITOR.pasteProcessor = function( editor )
				{
					this.editor = editor;
					this.dataFilter = this.editor.dataProcessor.dataFilter.clone();
				};
				CKEDITOR.pasteProcessor.prototype =
				{
					toHtml : function( data )
					{
						var oldDtd = CKEDITOR.dtd.ul;
						CKEDITOR.dtd.ul = CKEDITOR.dtd.ol =
						    CKEDITOR.tools.extend( CKEDITOR.tools.clone( oldDtd ), { ol : 1, ul : 1 } );

						var fragment = CKEDITOR.htmlParser.fragment.fromHtml( data, false ),
							writer = new CKEDITOR.htmlParser.basicWriter();

						CKEDITOR.dtd.ul = CKEDITOR.dtd.ol = oldDtd;

						fragment.writeHtml( writer, this.dataFilter );
						// Go through the default processor at last.
						return this.editor.dataProcessor.toHtml( writer.getHtml( true ) );
					}
				};

				// The very first handler which initialize the processor.
				editor.on( 'paste', function( evt )
				{
					// The processor is a transient instance life cycled to the
					// 'paste' event since the processing rules will be added
					// on demand accordingly to clipboard data flavor.
					editor.pasteProcessor = new CKEDITOR.pasteProcessor( editor );
					
				}, null, null, 1 );

				// The very last handler which insert final data into the editor at the end of the chain.
				editor.on( 'paste', function( evt )
				{
					var data = evt.data;

					if ( data[ 'html'] )
						editor.insertHtml(editor.pasteProcessor.toHtml(data[ 'html' ], false));
					else if ( data[ 'text'] )
						editor.insertText(data[ 'text' ]);

					delete editor.pasteProcessor;

					editor.fire( 'saveSnapshot' ); // Save after inserted.

				}, null, null, 1000 );

				editor.on( 'pasteDialog', function( evt )
				{
					// Open default paste dialog. 
					editor.openDialog( 'paste' );
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
				{
					var mode = editor.config.forcePasteAsPlainText ? 'text' : 'html';
					editor.on( 'contentDom', function()
					{
						var body = editor.document.getBody();
						body.on( ( mode == 'text' && !CKEDITOR.env.ie ) ?
						          'beforepaste' : 'paste',
								function( evt )
								{
									getPasteBin.call( editor, evt, mode, function ( data )
									{
										// The very last guard to make sure the
										// paste has really happened.
										if ( !data )
											return;

										var dataTransfer = {};
										dataTransfer[ mode ] = data;
										editor.fire( 'paste', dataTransfer );
									} );
								} );

					} );
				}

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
