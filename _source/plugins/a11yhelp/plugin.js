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
		init : function( editor )
		{
			editor.addCommand( commandName,
				{
					exec : function()
					{
						editor.loadPluginLang( pluginName, function()
							{
								editor.openDialog( commandName );
							});
					},
					modes : { wysiwyg:1, source:1 },
					canUndo : false
				});

			CKEDITOR.dialog.add( commandName, this.path + 'dialogs/a11yhelp.js' );
		}
	});
})();

