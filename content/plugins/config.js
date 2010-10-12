/*
Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
*/

CKEDITOR.editorConfig = function( config )
{
	// we don't need this in chrome
	config.removePlugins = 'maximize,resize,scayt,wsc';
	// The content isn't editable in chrome: automatically so let's trick it for the moment by setting focus (and use that routine)
	config.startupFocus = true;

	// Define changes to default configuration here. For example:
	// config.language = 'fr';
	// config.uiColor = '#AADC6E';
};
