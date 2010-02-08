/*
Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
*/

CKEDITOR.plugins.setLang( 'a11yhelp', 'en',
{
	accessibilityHelp :
	{
		title : 'Accessibility Instructions',
		legend :
		[
			{
				name : 'General',
				items :
						[
							{
								name : 'Editor Toolbar',
								legend: 'Press ALT + F10 to navigate to the toolbar; Move to next toolbar button with TAB or RIGHT ARROW; Move to previous button with  SHIFT+TAB or LEFT ARROW; Press SPACE or ENTER to trigger the toolbar button.'
							},

							{
								name : 'Editor Element Pathbar',
								legend : 'Press ALT + F10 to navigate to the elements pathbar; Move to next element button with TAB or RIGHT ARROW; Move to previous button with  SHIFT+TAB or LEFT ARROW. Press SPACE or ENTER to select the element in editor.'
							},

							{
								name : 'Editor Context Menu',
								legend : 'Press SHIFT + F10 or CTRL + SHIFT + F10 or APPLICATION KEY to open context-menu. Then move to next menu option with TAB or DOWN ARROW; Move to previous option with  SHIFT+TAB or UP ARROW. Press SPACE or ENTER to select the menu option.' +
										 'Open sub-menu of current option wtih SPACE or ENTER or RIGHT ARROW; Go back to parent menu item with ESC or LEFT ARROW;' +
										 'Close context menu with ESC.'
							},

							{
								name : 'Editor Dialog',
								legend : 'Inside a dialog, press TAB to navigate to next dialog field, press SHIFT + TAB to move to previous field, press ENTER to submit dialog, press ESC to cancel dialog.' +
										 'For dialogs that have multiple tab pages, press ALT + F10 to navigate to tab-list. Then move to next tab with TAB OR RIGTH ARROW; Move to previous tab with SHIFT + TAB or LEFT ARROW. Press SPACE or ENTER to select the tab page.'
							},

							{
								name : 'Editor List Box',
								legend : 'Inside a list-box, move to next list item with TAB OR DOWN ARROW; Move to previous list item with SHIFT + TAB or UP ARROW. Press SPACE or ENTER to select the list option. Press ESC to close the list-box.'
							}
						]
			},
			{
				name : 'Commands',
				items :
						[
							{
								name : ' Undo command',
								legend : 'Press CTRL + Z'
							},
							{
								name : ' Redo command',
								legend : 'Press CTRL + Y or CTRL + SHIFT + Y'
							},
							{
								name : ' Bold command',
								legend : 'Press CTRL + B'
							},
							{
								name : ' Italic command',
								legend : 'Press CTRL + I'
							},
							{
								name : ' Underline command',
								legend : 'Press CTRL + U'
							},
							{
								name : ' Link command',
								legend : 'Press CTRL + L'
							},
							{
								name : ' Toolbar Collapse command',
								legend : 'Press ALT + -'
							}
						]
			}
		]
	}
});
