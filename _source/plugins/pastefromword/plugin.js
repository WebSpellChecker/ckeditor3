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

			editor.on( 'paste', function( evt )
			{
				var data = evt.data,
					mswordHtml;
				// MS-WORD format sniffing.
				if ( ( mswordHtml = data[ 'html' ] )
					 && /(class=\"?Mso|style=\"[^\"]*\bmso\-|w:WordDocument)/.test( mswordHtml ) )
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
			} );
		}
	} );

	CKEDITOR.plugins.pastefromword =
	{
		/**
		 * @deprecated Leave it here for reference.
		 */
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
		},

		utils :
		{
			// Create a <cke:listbullet> which indicate an list item type.
			createListBulletMarker : function ( bulletStyle )
			{
				var marker = new CKEDITOR.htmlParser.element( 'cke:listbullet' ),
					listType,
					defaultBulletStyle = 'decimal';

				// TODO: Support more list style type from MS-Word.
				if( bulletStyle[ 2 ].search( /[.)]/ ) != -1 )
				{
					if( !isNaN( bulletStyle[ 1 ] ) )
						bulletStyle = 'decimal';
					else if( bulletStyle[ 1 ].search( /[a-z]/ ) != -1 )
						bulletStyle = 'lower-latin';
					else if( bulletStyle[ 1 ].search( /[A-Z]/ ) != -1 )
						bulletStyle = 'upper-latin';
				}
				else if ( bulletStyle[ 1 ].search( /[l·•]/ ) != -1 )
					bulletStyle = 'disc';
				else if ( bulletStyle[ 1 ].search( /[oØ]/ ) != -1 )
					bulletStyle = 'circle';
				else if ( bulletStyle[ 1 ].search( /[n◆]/ ) != -1 )
					bulletStyle = 'square';
				else
					bulletStyle = defaultBulletStyle;

				listType = bulletStyle == 'decimal' ? 'ol'
						   : bulletStyle == 'disc' ? 'ul' : '';

				// Represent list type as CSS style.
				marker.attributes =
				{
					'cke:listtype' : listType,
					'style' : 'list-style-type:' + bulletStyle
				};

				return marker;
			}

		},

		filters : {
				/**
				 * A simple filter which always rejecting.
				 */
				falsyFilter  : function( value )
				{
					return false;
				},

				/**
				 * A filter dedicated on the 'style' attribute for dropping/replacing style rules.
				 * @param styles {Array} A triple in form of [ styleNameRegexp, styleValueRegexp, newStyleValue ] where the last two are optional.
				 */
				stylesFilter : function( styles )
				{
					return function( styleText, element )
					{
						 var rules = [];
						// quote might be html-encoded which confused the next regexp.
						 styleText.replace( /&quot;/g, '"' )
								  .replace( /\s*([^ :;]+?)\s*:\s*([^;]+?)\s*(?=;|$)/g,
							 function( match, name, value )
							 {
								 name = name.toLowerCase();
								 var namePattern,
									 valuePattern,
									 newValue,
									 newName;
								 for( var i = 0 ; i < styles.length; i++ )
								 {
									if( styles[ i ] )
									{
										namePattern = styles[ i ][ 0 ];
										valuePattern = styles[ i ][ 1 ];
										newValue = styles[ i ][ 2 ];
										newName = styles[ i ][ 3 ];

										if ( name.match( namePattern )
											 && ( !valuePattern || value.match( valuePattern ) ) )
										{
											name = newName || name;
											if( typeof newValue == 'function' )
												newValue = newValue( value, element );
											if( typeof newValue == 'string' )
												rules.push( [ name, newValue ] );
											return;
										}
									}
								 }
								 rules.push( [ name, value ] );

							 } );

						for ( var i = 0 ; i < rules.length ; i++ )
							 rules[ i ] = rules[ i ].join( ':' );
						return rules.length ?
						         ( rules.join( ';' ) + ';' ).replace( /"/g, '&quot;' )
						         // Remove attribute if there's no styles.
								 : false;
					 };
				},

				styleMigrateFilter : function ( styleDefiniton )
				{
					return function( element )
					{
						var styleDef = styleDefiniton;
						element.name = styleDef.element;
						element.attributes = CKEDITOR.tools.clone( styleDef.attributes ) || {};
						var attrs = element.attributes;
						attrs.style = ( attrs.style || '' ) + CKEDITOR.style.getStyleText( styleDef );
					}
				},

				/**
				 * A filter which remove cke-namespaced-attribute on
				 * all none-cke-namespaced elements. 
				 * @param value
				 * @param element
				 */
				bogusAttrFilter : function( value, element )
				{
					if( element.name.indexOf( 'cke:' ) == -1 )
						return false;
				}

			},

		getRules : function( editor )
		{
			var falsyFilter = this.filters.falsyFilter,
				stylesFilter = this.filters.stylesFilter,
				styleMigrateFilter = this.filters.styleMigrateFilter,
				bogusAttrFilter = this.filters.bogusAttrFilter,
				createListBulletMarker = this.utils.createListBulletMarker,
				listDtdParents = CKEDITOR.dtd.parentOf( 'ol' ),
				config = editor.config,
				ignoreFontFace = config.pasteFromWordIgnoreFontFace;

			return {

				elementNames :
				[
					// Remove script, meta and link elements.
					[ /meta|link|script|style/, '' ]
				],

				elements :
				{
					$ : function( element )
					{
						var tagName = element.name || '';

						// Processing headings.
						if ( tagName.match( /h(\d)/i ) )
						{
							element.filterChildren();
							var onlyChild = element.onlyChild();
							// Remove empty headings.
							if( onlyChild && onlyChild.value
								&& !CKEDITOR.tools.trim( onlyChild.value ) )
								return false;
							delete element.attributes;
						}
						// Remove inline elements which contain only empty spaces.
						else if( tagName.match( /^(:?b|u|i|strike|span)$/ ) )
						{
							element.filterChildren();
							var child = element.onlyChild();
							if ( child && /^(:?\s|&nbsp;)+$/.exec( child.value ) )
								delete element.name;
						}
						// Remove dummy inline wrappers.
						else if( tagName.match( /span|font/ ) )
						{
							if( !element.attributes )
								delete element.name;
							// Normalize <font> into <span> + style text.
							else if( tagName == 'font' )
							{
								element.filterChildren();
								// Merge nested <font> tags.
								var parent = element.parent;
								if( 'font' == parent.name )
								{
									CKEDITOR.tools.extend( parent.attributes,
											element.attributes );
									delete element.name;
									return;
								}
								// Convert the topmost into a span with font-styles. 
								else
								{
									var attrs = element.attributes,
										styleText = '';
									if( attrs.color )
										styleText += 'color:' + attrs.color + ';';
									if( attrs.face )
										styleText += 'font-family:' + attrs.face + ';';
									// TODO: Mapping size in ranges of xx-small,
									// x-small, small, medium, large, x-large, xx-large.
									if( attrs.size )
										styleText += 'font-size:' +
										            ( attrs.size > 3 ? 'larger'
												      : ( attrs.size < 3 ? 'smaller' : 'medium' ) )+ ';';

									if( styleText )
										element.attributes = { 'style' : styleText };

									element.name = 'span';
								}
							}
						}
						// Remove namespaced element while preserving the content.
						else if( tagName.indexOf( ':' ) != -1
								 && tagName.indexOf( 'cke' ) == -1 )
						{
							element.filterChildren();

							// Restore img element from vml.
							if( tagName == 'v:imagedata' )
							{
								var href = element.attributes[ 'o:href' ];
								if ( href )
									element.attributes.src = href;
								element.name = 'img';
							}
							else
								delete element.name;
						}
						else if ( !tagName )
						{
							// Trim empty spaces at the beginning of document for IE. 
							if( CKEDITOR.env.ie )
							{
								var firstTextChild = element.firstTextChild();
								if ( firstTextChild
									 && firstTextChild.value.match( /^(:?\s|&nbsp;)+$/ ) )
									element.children.splice( 0, 1 );
							}
						}

						// Any dtd-valid element which could contain a list.
						if( !tagName && element.children
								 || tagName in listDtdParents )
						{
							element.filterChildren();

							var children = element.children, child,
								listItem,   // The current processing cke:li element.
								listItemAttrs,
								listType,   // Determine the root type of the list.
								listItemIndent, // Indent attribute represent the level of it.
								lastListItem, // The previous one just been added to the list.
								list, parentList, // Current staging list and it's parent list if any.  
								indent;

							for( var i = 0 ; i < children.length; i++ )
							{
								child = children[ i ];

								if ( 'cke:li' == child.name )
								{
									child.name = 'li';
									listItem = child;
									listItemAttrs = listItem.attributes;
									listType = listItem.attributes[ 'cke:listtype' ];
									// The indent attribute might not present.
									listItemIndent = listItemAttrs[ 'cke:indent' ] || 0;

									// Ignore the 'list-style-type' attribute if it's matched with
									// the list root element type.
									if( ( !parentList && listType )
										|| listType == ( parentList && parentList.name ) )
										listItemAttrs.style = stylesFilter(
										[ [ 'list-style-type' ] ] )( listItemAttrs.style ) || '' ;

									if ( !list )
									{
										parentList = list = new CKEDITOR.htmlParser.element( listType || 'ol' );
										list.add( listItem );
										children[ i ] = list;
									}
									else
									{
										if( listItemIndent > indent )
										{
											parentList = list;
											list = new CKEDITOR.htmlParser.element( 'ol' );
											list.add( listItem );
											lastListItem.add( list );
										}
										else if( listItemIndent < indent )
										{
											list = parentList;
											list.add( listItem );
										}
										else
											list.add( listItem );

										children.splice( i-- , 1 );
									}

									lastListItem = listItem;
									indent = listItemIndent;
								}
								else
									list = null;
							}

							// Filter childrens again for cleaning up
							// the list attributes.
							element.filterChildren();
						}
					},

					'p' : function( element )
					{
						element.filterChildren();

						var attrs = element.attributes,
							parent = element.parent,
							children = element.children,
							firstChild = children && children[ 0 ];

						// Drop the single wrapper paragraph within table cell
						// while preserve the styles.
						if( /td|th/.test( parent.name )
							&& parent.onlyChild() )
						{
							if( attrs && attrs.style )
								parent.attributes.style += ( attrs.style + ';' );
							delete element.name;
							return;
						}
						// <cke:listbullet> been the first child of any paragraph
						// indicate a list item.
						if( 'cke:listbullet' == firstChild.name )
						{
							element.name = 'cke:li';
							attrs.style = stylesFilter(
							[
								[ 'text-indent' ],
								[ 'margin-left', null, function( value )
								{
									// Resolve indent level from 'margin-left' style.
									attrs[ 'cke:indent' ] = parseInt( value );
								} ]
							] )( attrs.style, element ) || '' ;

							// Inherit list-type-style from bullet. 
							var listBulletAttrs = firstChild.attributes,
								listBulletStyle = listBulletAttrs.style;
							attrs.style += ( listBulletStyle + ';' );
							CKEDITOR.tools.extend( attrs, listBulletAttrs );
							children.splice( 0, 1 );
						}
					},
					'span' : function( element )
					{
						element.filterChildren();

						// List item bullet type is supposed to be indicated by
						// the text of a span with style 'mso-list : Ignore'.
						if( !CKEDITOR.env.gecko )
						{
							var attrs = element.attributes,
									styles = attrs && attrs.style;
							if( styles )
							{
								var marker;
								stylesFilter(
										[
											[ 'mso-list', 'Ignore', function( value, element )
											{

												var listType = element.firstTextChild().value.match( /([^\s])([.)]?)/ );
												marker = createListBulletMarker( listType );
											} ]
										] )( styles, element );

								if( marker )
									return marker;
							}

							// Kill an additional wrapping span.
							var onlyChild = element.onlyChild();
							if( onlyChild && 'cke:listbullet' == onlyChild.name )
								return onlyChild;
						}
						
						// Update the src attribute of image element with href.
						var children = element.children,
							firstChild = children && children[ 0 ],
							secondChild;
						if( firstChild
							&& 'cke:imagesource' == firstChild.name )
						{
							secondChild = children[ 1 ];
							if ( 'img' == secondChild.name )
								secondChild.attributes.src = firstChild.attributes.src;
							children.splice( 0, 1 );
							delete element.name;
						}
					},
					// Migrate basic style formats to editor configured ones.
					'b' : styleMigrateFilter( config[ 'coreStyles_bold' ] ),
					'i' : styleMigrateFilter( config[ 'coreStyles_italic' ] ),
					'u' : styleMigrateFilter( config[ 'coreStyles_underline' ] ),
					's' : styleMigrateFilter( config[ 'coreStyles_strike' ] ),
					'sup' : styleMigrateFilter( config[ 'coreStyles_superscript' ] ),
					'sub' : styleMigrateFilter( config[ 'coreStyles_subscript' ] ),
					'v:imagedata' : function( element )
					{
						var href = element.attributes['o:href'];
						if( href )
							element.attributes.src = href;
						element.name = 'img';
					}
				},

				attributeNames :
				[
					// Remove onmouseover and onmouseout events (from MS Word comments effect)
					[ /^onmouse(:?out|over)/, '' ],
					// Remove office and vml attribute from elements.
					[ /(?:v|o):\w+/, '' ],
					// Remove lang/language attributes.
					[ /^lang/, '' ],
					ignoreFontFace ? [ /^(?:face|font|size)/, '' ] : null
				],

				attributes :
				{
					'cke:listtype' : bogusAttrFilter,
					'cke:indent' : bogusAttrFilter,
					// Remove mso-xxx styles.
					// Remove margin styles.
					'style' : stylesFilter(
					[
						[ /mso-/ ],
						[ /-moz-/ ],
						// Replace verbose background color style.
						[ /^background$/, null, function( value )
						{
							return value.match( /^[^\s]+/ )[ 0 ];
						}, 'background-color' ],
						[ 'background-color', 'transparent' ],
						// Remove verbose border-color style within Firefox.
						CKEDITOR.env.gecko ? [ 'border-color', /(:?windowtext|-moz-use-text-color|\s)*/ ] : null,
						// 'Indent' format migration(to use editor's indent unit).
						[ /margin-?/, null, function( value, element )
						{
							if( element.name == 'p' )
							{
								value = value.replace( /\d*\.?\d+pt/g, function( length )
								{
									var pt = parseInt( length );
									// Assume MS-Word indent unit length as '11pt'.
									return ( pt / 11 * config.indentOffset ) + config.indentUnit;
								} );
							}
							return value;
						} ],
						[ 'margin', /0(?:cm|in) 0(?:cm|in) 0pt/, function(){ debugger; } ],
						[ 'text-indent', '0cm' ],
						[ 'page-break-before' ],
						[ 'tab-stops' ],
						[ 'display', 'none' ],
						[ 'text-align', 'left' ],
						ignoreFontFace ? [ /font-?/ ] : null,
					] ),
					'width' : function( value, element )
					{
						// Prefer width style over attribute on table cell.
						if( element.name in { td : 1, th : 1 } )
							return false;
					},
					'class' : falsyFilter,

					// We always have both 'text-align' style company with
					// 'align' attribute, drop the attribute.
					'align' : falsyFilter
				},

				// Fore none-IE, some useful data might be buried under these IE-conditional
				// comments where RegExp were the right approach to dig them out where usual approach
				// is transform it into a fake element node which hold the desired data.
				comment : !CKEDITOR.env.ie ? function( value )
				{
					var imageInfo = value.match( /<img.*?>/ ),
						imageSource = value.match( /<v:imagedata[^>]*o:href=['"](.*?)['"]/ ),
						listInfo = value.match( /^\[if !supportLists\]([\s\S]*?)\[endif\]$/ );

					// Reveal the <img> element in conditional comments for Firefox.
					if( CKEDITOR.env.gecko && imageInfo )
						return CKEDITOR.htmlParser.fragment.fromHtml( imageInfo[ 0 ] ).children[ 0 ];
					// Try to dig the real image link from vml markup.
					if( imageSource )
						return new CKEDITOR.htmlParser.element( 'cke:imagesource', { src : imageSource[ 1 ] } );
					// Seek for list bullet style indicator.
					else if ( listInfo )
					{
						var listSymbol = listInfo[ 1 ],
							listType = listSymbol.match( />([^\s])([.)]?)</ );

						return createListBulletMarker( listType );
					}
					return false;
				} : falsyFilter
			};
		}
	}

	var fragmentPrototype = CKEDITOR.htmlParser.fragment.prototype,
		elementPrototype = CKEDITOR.htmlParser.element.prototype;

	fragmentPrototype.onlyChild = elementPrototype.onlyChild = function()
	{
		var children = this.children,
			count = children.length,
			firstChild = ( count == 1 ) && children[ 0 ];
		return firstChild || null;
	};

	fragmentPrototype.firstTextChild = elementPrototype.firstTextChild = function()
	{
		var child;
		for( var i = 0 ; i < this.children.length ; i++ )
		{
			child = this.children[ i ];
			if( child.value )
				return child;
		}
	};

	/**
	 * Return the DTD-valid parent tag names of the specified one.
	 * @param tagName
	 */
	CKEDITOR.dtd.parentOf = function( tagName )
	{
		var result = {};
		for( var tag in this )
		{
			if( tag.indexOf( '$' ) == -1 && this[ tag ][ tagName ] )
				result[ tag ] = 1;
		}
		return result;
	};

} )();


/**
 * Whether the "Ignore font face definitions" checkbox is enabled by default in
 * the Paste from Word dialog.
 * @type Boolean
 * @default true
 * @example
 * config.pasteFromWordIgnoreFontFace = false;
 */
CKEDITOR.config.pasteFromWordIgnoreFontFace = false;
