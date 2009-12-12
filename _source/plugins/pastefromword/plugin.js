/*
Copyright (c) 2003-2009, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
*/
( function()
{
	CKEDITOR.plugins.add( 'pastefromword',
	{
		init : function( editor )
		{

			// Flag indicate this command is actually been asked instead of a generic
			// pasting.
			var forceFromWord = 0,
				resetFromWord = function()
				{
					setTimeout( function()
					{
						forceFromWord = 0;
					}, 0 );
				};

			// Features bring by this command beside the normal process:
			// 1. No more bothering of user about the clean-up.
			// 2. Perform the clean-up even if content is not from MS-Word.
			// (e.g. from a MS-Word similar application.)
			editor.addCommand( 'pastefromword',
			{
				exec : function ()
				{
					forceFromWord = 1;
					if( editor.execCommand( 'paste' ) === false )
					{
						editor.on( 'dialogHide', function ( evt )
						{
							evt.removeListener();
							resetFromWord();
						} );
					}
				}
			} );

			// Register the toolbar button.
			editor.ui.addButton( 'PasteFromWord',
				{
					label : editor.lang.pastefromword.toolbar,
					command : 'pastefromword'
				} );

			editor.on( 'paste', function( evt )
			{
				var data = evt.data,
					isLazyLoad,
					mswordHtml;
				// MS-WORD format sniffing.
				if ( ( mswordHtml = data[ 'html' ] )
					 && ( forceFromWord || /(class=\"?Mso|style=\"[^\"]*\bmso\-|w:WordDocument)/.test( mswordHtml ) )
					 && ( !editor.config.pasteFromWordPromptCleanup
						  || ( forceFromWord || confirm( editor.lang.pastefromword.confirmCleanup )  ) ) )
				{
					if( isLazyLoad = this.loadFilterRules( function()
					{
						// Re-continue the event with the original data.
						if( isLazyLoad )
							editor.fire( 'paste', data );
						else
						{
							// Firefox will be confused by those downlevel-revealed IE conditional
							// comments, fixing them first( convert it to upperlevel-revealed one ).
							// e.g. <![if !vml]>...<![endif]>
							if( CKEDITOR.env.gecko )
							{
								data[ 'html' ] =
									mswordHtml.replace( /(<!--\[if[^<]*?\])-->([\S\s]*?)<!--(\[endif\]-->)/gi, '$1$2$3' );
							}

							var filter = data.processor.dataFilter;
							// These rules will have higher priorities than default ones.
							filter.addRules( CKEDITOR.plugins.pastefromword.getRules( editor ), 5 );
						}
					} ) )
					{
						// The filtering rules are to be loaded, it's safe to just cancel
						// this event.  
						evt.cancel();
					}
				}
			}, this );
		},

		loadFilterRules : function( callback )
		{
			var isLoaded = typeof CKEDITOR.plugins.pastefromword != 'undefined';

			isLoaded ?
				callback() :
				// Load with busy indicator.
				CKEDITOR.scriptLoader.load( this.path + 'rules.js',
						callback, null, false, true );

			return !isLoaded;
		}
	} );
} )();

/**
 * Whether prompt the user about the clean-up of content from MS-Word.
 * @name CKEDITOR.config.pasteFromWordPromptCleanup
 * @type Boolean
 * @default true
 * @example
 * config.pasteFromWordPromptCleanup = true;
 */
