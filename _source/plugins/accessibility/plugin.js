/*
Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
*/

/**
 * @fileOverview Bring better accessibility support to browsers that has limited support for modern technologies (e.g. ARIA).
 */

( function()
{
	var dtd = CKEDITOR.dtd,
		 env = CKEDITOR.env;
	// List of in-use ARIA roles and states. 
	var roles = [ 'role' ],
		 states = [ 'label', 'labelledby', 'describedby', 'multiline' ],
		 length = Math.max( roles.length, states.length );


	function lookupARIASupport( role, tagName )
	{
		return {
			// Only Firefox3 support the "dialog" role.
			'dialog' :	 env.gecko && CKEDITOR.env.version >= 10900,
			// IE doesn't support editing iframe as region.
			'region' : env.gecko || ( env.ie && tagName != 'iframe' )
		}[ role ];
	}

	/**
	 *  Bring degradeable substitution to standard ARIA widgets.  
	 * @param element
	 * @param isOffline
	 */
	function degradeARIA( element, isOffline )
	{
		// Save the interested ARIA attributes first.
		var doc = element.getDocument(),
				role = element.getAttribute( 'role' ) || '';

		// Just leave the original element untouched if
		// the role is already supported on it.
		if( lookupARIASupport( role, element.getName() ) !== false )
			return element;

		var attrValue,
			 labelText = element.getAttribute( 'aria-label' ) || ( attrValue = element.getAttribute( 'aria-labelledby' ) ) && doc.getById( attrValue ).getText() || '',
			 descriptionText = ( attrValue = element.getAttribute( 'aria-describedby' ) ) && doc.getById( attrValue ).getText() || '',
			 legend = [ labelText, role, descriptionText ].join( ' ' );

		// Remove all ARIA attributes on the widget that could
		// bring down or conflict with the degradtion label.
		for ( var i = 0; i < length; i++ )
		{
			roles[ i ] && element.removeAttribute( roles[ i ] );
			states[ i ] && element.removeAttribute( 'aria-' + states[ i ] );
		}

		// Translate by wrapping with a form field legend that contains all ARIA
		// attributes which leads to be announced by ATs.
		var fieldset = CKEDITOR.dom.element.createFromHtml(
				'<fieldset class="cke_voicelabel_invisible">' +
					'<legend class="cke_voicelabel_invisible">' +
						CKEDITOR.tools.htmlEncode( legend ) +
					'</legend>' +
				'</fieldset>', doc );

		if( !isOffline )
		{
			var parent;
			while( ( parent = element.getParent() ) && !parent.getDtd()[ fieldset.getName() ] )
				element = parent;
			fieldset.insertBefore( element );
		}

		fieldset.append( element );
		return fieldset;
	}

	CKEDITOR.plugins.add( 'accessibility',
	{
		init : function( editor )
		{
			editor.on( 'ariaWidget', function( evt )
			{
				var data = evt.data,
					widget = data.element,
					 widgetIsOffline = !data.replace;
				data.element = degradeARIA( widget, widgetIsOffline );
			} );
		}
	});

} )();
