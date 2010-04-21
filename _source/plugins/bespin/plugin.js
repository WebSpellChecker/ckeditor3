/*
Copyright (c) 2003-2009, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
*/

/**
 * @fileOverview The "bespin" plugin which register Bespin embedded as 'source' editing mode.
 */

(function()
{
	CKEDITOR.plugins.add( 'bespin',
	{
		requires : [ 'editingblock' ],

		init : function( editor )
		{
			var pluginPath = this.path;
			editor.on( 'editingBlockReady', function()
				{
					var mainElement,
						fieldset,
						iframe,
						isLoadingData,
						isPendingFocus,
						frameLoaded,
						fireMode,
						bespin;

					// Support for custom document.domain in IE.
					var isCustomDomain = CKEDITOR.env.isCustomDomain();

					// Creates the iframe that holds the editable document.
					var createIFrame = function()
					{
						if ( iframe )
							iframe.remove();
						if ( fieldset )
							fieldset.remove();

						frameLoaded = 0;
						// The document domain must be set within the src
						// attribute;
						// Defer the script execution until iframe
						// has been added to main window, this is needed for some
						// browsers which will begin to load the frame content
						// prior to it's presentation in DOM.(#3894)
						var src = 'void( '
								+ ( CKEDITOR.env.gecko ? 'setTimeout' : '' ) + '( function(){' +
								'document.open();' +
								( CKEDITOR.env.ie && isCustomDomain ? 'document.domain="' + document.domain + '";' : '' ) +
								'document.write( window.parent[ "_cke_htmlToLoad_' + editor.name + '" ] );' +
								'document.close();' +
								'window.parent[ "_cke_htmlToLoad_' + editor.name + '" ] = null;' +
								'}'
								+ ( CKEDITOR.env.gecko ? ', 0 )' : ')()' )
								+ ' )';

						// Loading via src attribute does not work in Opera.
						if ( CKEDITOR.env.opera )
							src = 'void(0);';

						iframe = CKEDITOR.dom.element.createFromHtml( '<iframe' +
								' style="width:100%;height:100%"' +
								' frameBorder="0"' +
								' tabIndex="-1"' +
								' allowTransparency="true"' +
								' src="javascript:' + encodeURIComponent( src ) + '"' +
								'></iframe>' );

						var accTitle = editor.lang.editorTitle.replace( '%1', editor.name );

						if ( CKEDITOR.env.gecko )
						{
							// Double checking the iframe will be loaded properly(#4058).
							iframe.on( 'load', function( ev )
							{
								ev.removeListener();
								contentDomReady( iframe.$.contentWindow );
							} );

							// Accessibility attributes for Firefox.
							mainElement.setAttributes(
								{
									role : 'region',
									title : accTitle
								} );
							iframe.setAttributes(
								{
									role : 'region',
									title : ' '
								} );
						}
						else if ( CKEDITOR.env.webkit )
						{
							iframe.setAttribute( 'title', accTitle );	// Safari 4
							iframe.setAttribute( 'name', accTitle );	// Safari 3
						}
						else if ( CKEDITOR.env.ie )
						{
							// Accessibility label for IE.
							fieldset = CKEDITOR.dom.element.createFromHtml(
								'<fieldset style="height:100%' +
								( CKEDITOR.env.ie && CKEDITOR.env.quirks ? ';position:relative' : '' ) +
								'">' +
									'<legend style="display:block;width:0;height:0;overflow:hidden;' +
									( CKEDITOR.env.ie && CKEDITOR.env.quirks ? 'position:absolute' : '' ) +
									'">' +
										CKEDITOR.tools.htmlEncode( accTitle ) +
									'</legend>' +
								'</fieldset>'
								, CKEDITOR.document );
							iframe.appendTo( fieldset );
							fieldset.appendTo( mainElement );
						}

						if ( !CKEDITOR.env.ie )
							mainElement.append( iframe );
					};

					// The script that is appended to the data being loaded. It
					// enables editing, and makes some
					var activationScript =
						'<script id="cke_actscrpt" type="text/javascript">' +
							'window.onload = function()' +
							'{' +
								// Call the temporary function for the editing
								// boostrap.
								'window.parent.CKEDITOR._["contentDomReady' + editor.name + '"]( window );' +
							'}' +
						'</script>';

					// Editing area bootstrap code.
					var contentDomReady = function( domWindow )
					{
						if ( frameLoaded )
							return;

						frameLoaded = 1;

						var domDocument = domWindow.document,
							body = domDocument.body;

						// Remove this script from the DOM.
						var script = domDocument.getElementById( "cke_actscrpt" );
						script.parentNode.removeChild( script );

						delete CKEDITOR._[ 'contentDomReady' + editor.name ];

						var focusTarget = ( CKEDITOR.env.ie || CKEDITOR.env.webkit ) ?
								new CKEDITOR.dom.window( domWindow ) : new CKEDITOR.dom.document( domDocument );

						focusTarget.on( 'blur', function()
							{
								editor.bespin.setFocus( false );
								editor.focusManager.blur();
							});

						focusTarget.on( 'focus', function()
							{
								editor.focusManager.focus();
							});

						editor.bespin = bespin = domDocument.getElementById( "editor" ).bespin;

						if ( fireMode )
						{
							editor.mode = 'source';
							editor.fire( 'mode' );
							fireMode = false;
						}

						isLoadingData = false;

						if ( isPendingFocus )
						{
							editor.focus();
							isPendingFocus = false;
						}

						editor.fire( 'dataReady' );
					};

					editor.addMode( 'source',
						{
							load : function( holderElement, data, isSnapshot )
							{
								mainElement = holderElement;

								if ( CKEDITOR.env.ie && CKEDITOR.env.quirks )
									holderElement.setStyle( 'position', 'relative' );

								// The editor data "may be dirty" after this
								// point.
								editor.mayBeDirty = true;

								fireMode = true;

								if ( isSnapshot )
									this.loadSnapshotData( data );
								else
									this.loadData( data );
							},

							loadData : function( data )
							{
								isLoadingData = true;

								data =
									editor.config.docType +
									'<html>' +
									'<head>' +
										'<link type="text/css" rel="stylesheet" href="' + pluginPath +  'assets/bespin_embedded.css">' +
										activationScript +
										'<script src="' + pluginPath + 'assets/bespin_embedded.js"><' + '/script>' +
										'<script> window.onBespinLoad = function() { document.body.style.visibility = "inherit"; }; ' +
										'</' + 'script>' +
										'<style type="text/css">' +
											'html, body { height: 100% }' +
											'.bespin { visibility: hidden; overflow: hidden; margin: 0px; }' +
										'</style>'+
									'</head>' +
									'<body id="editor" class="bespin"' +
									' data-bespinoptions=\'{ "settings": { "tabstop": 4 },"stealFocus": true, "syntax": "html" }\'>' +
										data +
									'</body>' +
									'</html>';

								window[ '_cke_htmlToLoad_' + editor.name ] = data;
								CKEDITOR._[ 'contentDomReady' + editor.name ] = contentDomReady;
								createIFrame();

								// Opera must use the old method for loading contents.
								if ( CKEDITOR.env.opera )
								{
									var doc = iframe.$.contentWindow.document;
									doc.open();
									doc.write( data );
									doc.close();
								}
							},

							getData : function()
							{
								return bespin.value;
							},

							getSnapshotData : function()
							{
								return bespin.value;
							},

							unload : function( holderElement )
							{
								editor.bespin = bespin = iframe = mainElement = isPendingFocus = null;
							},

							focus : function()
							{
								if ( isLoadingData )
									isPendingFocus = true;
								else if ( editor.bespin )
									editor.bespin.setFocus( true );
							}
						});
				});

			editor.addCommand( 'source',
			{
				modes : { wysiwyg:1, source:1 },

				exec : function( editor )
				{
					if ( editor.mode == 'wysiwyg' )
						editor.fire( 'saveSnapshot' );

					editor.getCommand( 'source' ).setState( CKEDITOR.TRISTATE_DISABLED );
					editor.setMode( editor.mode == 'source' ? 'wysiwyg' : 'source' );
				},

				canUndo : false
			});

			if ( editor.ui.addButton )
			{
				editor.ui.addButton( 'Source',
					{
						label : editor.lang.source,
						command : 'source'
					});
			}

			editor.on( 'mode', function()
				{
					editor.getCommand( 'source' ).setState(
						editor.mode == 'source' ?
							CKEDITOR.TRISTATE_ON :
							CKEDITOR.TRISTATE_OFF );
				});

		}
	});


})();
