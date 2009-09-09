/*
Copyright (c) 2003-2009, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
*/

CKEDITOR.plugins.add( 'pastefromword',
{
	init : function( editor )
	{
		// Register the command.
		editor.addCommand( 'pastefromword', new CKEDITOR.dialogCommand( 'pastefromword' ) );
		// Register the dialog.
		CKEDITOR.dialog.add( 'pastefromword', this.path + 'dialogs/pastefromword.js' );

		// Register the toolbar button.
		editor.ui.addButton( 'PasteFromWord',
			{
				label : editor.lang.pastefromword.toolbar,
				command : 'pastefromword'
			} );

		var config = editor.config;
		editor.on( 'paste', function( evt )
		{
			var mswordHtml;
			// MS-WORD format sniffing.
			if ( ( mswordHtml = evt.data[ 'html' ] )
				 && /(class=\"?Mso|style=\"[^\"]*\bmso\-|w:WordDocument)/.test( mswordHtml ) )
			{
				// Perform cleaning with default configuration.
				editor.insertHtml(
					CKEDITOR.plugins.pastefromword.cleanWord(
						editor, mswordHtml,
						config.pasteFromWordIgnoreFontFace,
						config.pasteFromWordRemoveStyle));

				// Cancel other html paste handlers.
				evt.cancel();
			}
		}, null, null, 9 );

	}
} );

CKEDITOR.plugins.pastefromword =
{
	cleanWord : function( editor, html, ignoreFont, removeStyles )
	{
		// Remove comments [SF BUG-1481861].
		html = html.replace(/<\!--[\s\S]*?-->/g, '' ) ;

		html = html.replace(/<o:p>\s*<\/o:p>/g, '') ;
		html = html.replace(/<o:p>[\s\S]*?<\/o:p>/g, '&nbsp;') ;

		// Remove mso-xxx styles.
		html = html.replace( /\s*mso-[^:]+:[^;"]+;?/gi, '' ) ;

		// Remove margin styles.
		html = html.replace( /\s*MARGIN: 0(?:cm|in) 0(?:cm|in) 0pt\s*;/gi, '' ) ;
		html = html.replace( /\s*MARGIN: 0(?:cm|in) 0(?:cm|in) 0pt\s*"/gi, "\"" ) ;

		html = html.replace( /\s*TEXT-INDENT: 0cm\s*;/gi, '' ) ;
		html = html.replace( /\s*TEXT-INDENT: 0cm\s*"/gi, "\"" ) ;

		html = html.replace( /\s*TEXT-ALIGN: [^\s;]+;?"/gi, "\"" ) ;

		html = html.replace( /\s*PAGE-BREAK-BEFORE: [^\s;]+;?"/gi, "\"" ) ;

		html = html.replace( /\s*FONT-VARIANT: [^\s;]+;?"/gi, "\"" ) ;

		html = html.replace( /\s*tab-stops:[^;"]*;?/gi, '' ) ;
		html = html.replace( /\s*tab-stops:[^"]*/gi, '' ) ;

		// Remove FONT face attributes.
		if ( ignoreFont )
		{
			html = html.replace( /\s*face="[^"]*"/gi, '' ) ;
			html = html.replace( /\s*face=[^ >]*/gi, '' ) ;

			html = html.replace( /\s*FONT-FAMILY:[^;"]*;?/gi, '' ) ;
		}

		// Remove Class attributes
		html = html.replace(/<(\w[^>]*) class=([^ |>]*)([^>]*)/gi, "<$1$3") ;

		// Remove styles.
		if ( removeStyles )
			html = html.replace( /<(\w[^>]*) style="([^\"]*)"([^>]*)/gi, "<$1$3" ) ;

		// Remove style, meta and link tags
		html = html.replace( /<STYLE[^>]*>[\s\S]*?<\/STYLE[^>]*>/gi, '' ) ;
		html = html.replace( /<(?:META|LINK)[^>]*>\s*/gi, '' ) ;

		// Remove empty styles.
		html =  html.replace( /\s*style="\s*"/gi, '' ) ;

		html = html.replace( /<SPAN\s*[^>]*>\s*&nbsp;\s*<\/SPAN>/gi, '&nbsp;' ) ;

		html = html.replace( /<SPAN\s*[^>]*><\/SPAN>/gi, '' ) ;

		// Remove Lang attributes
		html = html.replace(/<(\w[^>]*) lang=([^ |>]*)([^>]*)/gi, "<$1$3") ;

		html = html.replace( /<SPAN\s*>([\s\S]*?)<\/SPAN>/gi, '$1' ) ;

		html = html.replace( /<FONT\s*>([\s\S]*?)<\/FONT>/gi, '$1' ) ;

		// Remove XML elements and declarations
		html = html.replace(/<\\?\?xml[^>]*>/gi, '' ) ;

		// Remove w: tags with contents.
		html = html.replace( /<w:[^>]*>[\s\S]*?<\/w:[^>]*>/gi, '' ) ;

		// Remove Tags with XML namespace declarations: <o:p><\/o:p>
		html = html.replace(/<\/?\w+:[^>]*>/gi, '' ) ;

		html = html.replace( /<(U|I|STRIKE)>&nbsp;<\/\1>/g, '&nbsp;' ) ;

		html = html.replace( /<H\d>\s*<\/H\d>/gi, '' ) ;

		// Remove "display:none" tags.
		html = html.replace( /<(\w+)[^>]*\sstyle="[^"]*DISPLAY\s?:\s?none[\s\S]*?<\/\1>/ig, '' ) ;

		// Remove language tags
		html = html.replace( /<(\w[^>]*) language=([^ |>]*)([^>]*)/gi, "<$1$3") ;

		// Remove onmouseover and onmouseout events (from MS Word comments effect)
		html = html.replace( /<(\w[^>]*) onmouseover="([^\"]*)"([^>]*)/gi, "<$1$3") ;
		html = html.replace( /<(\w[^>]*) onmouseout="([^\"]*)"([^>]*)/gi, "<$1$3") ;

		if ( editor.config.pasteFromWordKeepsStructure )
		{
			// The original <Hn> tag send from Word is something like this: <Hn style="margin-top:0px;margin-bottom:0px">
			html = html.replace( /<H(\d)([^>]*)>/gi, '<h$1>' ) ;

			// Word likes to insert extra <font> tags, when using MSIE. (Wierd).
			html = html.replace( /<(H\d)><FONT[^>]*>([\s\S]*?)<\/FONT><\/\1>/gi, '<$1>$2<\/$1>' );
			html = html.replace( /<(H\d)><EM>([\s\S]*?)<\/EM><\/\1>/gi, '<$1>$2<\/$1>' );
		}
		else
		{
			html = html.replace( /<H1([^>]*)>/gi, '<div$1><b><font size="6">' ) ;
			html = html.replace( /<H2([^>]*)>/gi, '<div$1><b><font size="5">' ) ;
			html = html.replace( /<H3([^>]*)>/gi, '<div$1><b><font size="4">' ) ;
			html = html.replace( /<H4([^>]*)>/gi, '<div$1><b><font size="3">' ) ;
			html = html.replace( /<H5([^>]*)>/gi, '<div$1><b><font size="2">' ) ;
			html = html.replace( /<H6([^>]*)>/gi, '<div$1><b><font size="1">' ) ;

			html = html.replace( /<\/H\d>/gi, '<\/font><\/b><\/div>' ) ;

			// Transform <P> to <DIV>
			var re = new RegExp( '(<P)([^>]*>[\\s\\S]*?)(<\/P>)', 'gi' ) ;	// Different because of a IE 5.0 error
			html = html.replace( re, '<div$2<\/div>' ) ;

			// Remove empty tags (three times, just to be sure).
			// This also removes any empty anchor
			html = html.replace( /<([^\s>]+)(\s[^>]*)?>\s*<\/\1>/g, '' ) ;
			html = html.replace( /<([^\s>]+)(\s[^>]*)?>\s*<\/\1>/g, '' ) ;
			html = html.replace( /<([^\s>]+)(\s[^>]*)?>\s*<\/\1>/g, '' ) ;
		}

		return html ;
	}
}

/**
 * Whether the "Ignore font face definitions" checkbox is enabled by default in
 * the Paste from Word dialog.
 * @type Boolean
 * @default true
 * @example
 * config.pasteFromWordIgnoreFontFace = false;
 */
CKEDITOR.config.pasteFromWordIgnoreFontFace = true;

/**
 * Whether the "Remove styles definitions" checkbox is enabled by default in
 * the Paste from Word dialog.
 * @type Boolean
 * @default false
 * @example
 * config.pasteFromWordRemoveStyle = true;
 */
CKEDITOR.config.pasteFromWordRemoveStyle = false;

/**
 * Whether to keep structure markup (&lt;h1&gt;, &lt;h2&gt;, etc.) or replace
 * it with elements that create more similar pasting results when pasting
 * content from Microsoft Word into the Paste from Word dialog.
 * @type Boolean
 * @default false
 * @example
 * config.pasteFromWordKeepsStructure = true;
 */
CKEDITOR.config.pasteFromWordKeepsStructure = false;
