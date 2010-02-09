/*
Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
*/

/**
 * @fileOverview Bring better accessibility support to browsers that has limited support for modern technologies (e.g. ARIA).
 */

(function()
{
	var pluginName = 'a11yhelp',
		commandName = 'a11yHelp';
	
	CKEDITOR.plugins.add( pluginName,
	{
		langs : [ 'en' ],
		init : function( editor )
		{
			var plugin = this;
			editor.addCommand( commandName,
				{
					exec : function()
					{
						var langCode = ( CKEDITOR.tools.indexOf( plugin.langs, editor.langCode ) >= 0 ?
							editor.langCode : plugin.langs[ 0 ] );

						CKEDITOR.scriptLoader.load(
								CKEDITOR.getUrl( plugin.path + 'lang/' + langCode + '.js' ),
								function()
								{
									CKEDITOR.tools.extend( editor.lang, plugin.lang[ langCode ] );
									editor.openDialog( commandName );
								})	;
					},
					modes : { wysiwyg:1, source:1 },
					canUndo : false
				});

			CKEDITOR.dialog.add( commandName, this.path + 'dialogs/a11yhelp.js' );
		}
	});
})();

