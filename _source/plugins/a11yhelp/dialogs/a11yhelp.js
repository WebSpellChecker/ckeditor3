/*
Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
*/

CKEDITOR.dialog.add( 'a11yHelp', function( editor )
{
	var lang = editor.lang.accessibilityHelp;

	// Create the help list directly from lang file entries. 
	function buildHelpContents()
	{
		var pageTpl = '<div class="cke_accessibility_legend" role="document" tabIndex="-1">%1</div>',
			sectionTpl = '<h1>%1</h1><dl>%2</dl>',
			itemTpl = '<dt>%1</dt><dd>%2</dd>';

		var pageHtml = [],
			sections = lang.legend,
			sectionLength = sections.length;

		for ( var i = 0; i < sectionLength; i++ )
		{
			var section = sections[ i ],
				sectionHtml = [],
				items = section.items,
				itemsLength = items.length;

			for ( var j = 0; j < itemsLength; j++ )
			{
				var item = items[ j ],
					itemHtml;
				itemHtml = itemTpl.replace( '%1', item.name ).replace( '%2', item.legend );
				sectionHtml.push( itemHtml );
			}

			pageHtml.push( sectionTpl.replace( '%1', section.name ).replace( '%2', sectionHtml.join( '' ) ) );
		}

		return pageTpl.replace( '%1', pageHtml.join( '' ) );
	}

	return {
		title : lang.title,
		minWidth : 600,
		minHeight : 400,
		contents : [
			{
				id : 'info',
				label : editor.lang.common.generalTab,
				expand : true,
				elements :
				[
					{
						type : 'html',
						id : 'legends',
						focus : function() {},
						html : buildHelpContents() +
							'<style type="text/css">' +
							'.cke_accessibility_legend' +
							'{' +
								'width:600px;' +
								'height:400px;' +
								'padding-right:5px;' +
								'overflow-y:auto;' +
								'overflow-x:hidden;' +
							'}' +
							'.cke_accessibility_legend h1' +
							'{' +
								'font-size: 20px;' +
								'border-bottom: 1px solid #AAA;' +
								'margin: 5px 0px 15px;' +
							'}' +
							'.cke_accessibility_legend dl' +
							'{' +
								'margin-left: 5px;' +
							'}' +
							'.cke_accessibility_legend dt' +
							'{' +
								'font-size: 13px;' +
								'font-weight: bold;' +
							'}' +
							'.cke_accessibility_legend dd' +
							'{' +
								'white-space:normal;' +
								'margin:10px' +
							'}' +
						'</style>'
					}
				]
			}
		],
		buttons : [ CKEDITOR.dialog.cancelButton ]
	};
});
