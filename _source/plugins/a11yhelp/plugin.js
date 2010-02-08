/*
Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
*/

/**
 * @fileOverview Bring better accessibility support to browsers that has limited support for modern technologies (e.g. ARIA).
 */

CKEDITOR.plugins.add( 'a11yhelp',
{
	init : function( editor )
	{
		var plugin = this,
			pluginLang = ( plugin.lang = [] );

		editor.addCommand( 'a11yHelp',
		{
			exec :	 function()
			{
				CKEDITOR.scriptLoader.load( CKEDITOR.getUrl( plugin.path + 'lang/default.js' ), function()
					{
						CKEDITOR.tools.extend( editor.lang, pluginLang[ editor.langCode ] || pluginLang[ 'en' ] );
						editor.openDialog( 'a11yHelp' );
					})	;
			},
			modes : { wysiwyg:1, source:1 },
			canUndo : false
		} );

		CKEDITOR.dialog.add( 'a11yHelp', this.path + 'dialogs/a11yhelp.js' );
	}
});
