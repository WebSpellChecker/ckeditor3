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
		var command = new CKEDITOR.dialogCommand( 'a11yHelp' );
		command.modes = { wysiwyg:1, source:1 };
		command.canUndo = false;

		editor.addCommand( 'a11yHelp', command );
		CKEDITOR.dialog.add( 'a11yHelp', this.path + 'dialogs/a11yhelp.js' );
	}
});
