/*
Copyright (c) 2003-2009, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
*/

CKEDITOR.plugins.add( 'adobeair',
{
	init : function( editor )
	{
		if( CKEDITOR.env.air )
			editor.on( 'uiReady', function()
			{
				( function ( container, eventNameList )
				{
					for ( var i = 0; i < eventNameList.length; i++ )
					{
						( function( eventName ){

							var targetList =
								 container.eachChildWithAttribute( 'on'+ eventName, function( item )
							{
								item.on( eventName, function( evt )
								{
									var inlineEventHandler = item.getAttribute( 'on' + eventName ),
										callFunc = /callFunction\(([^)]+)\)/.exec( inlineEventHandler ),
										callFuncArgs = callFunc && callFunc[ 1 ].split( ',' ),
										preventDefault = /return false;/.test( inlineEventHandler );

									if ( callFuncArgs )
									{
										var nums = callFuncArgs.length,
											argName;
										for ( var i = 0; i < nums; i++ )
										{
											switch( argName = CKEDITOR.tools.trim( callFuncArgs[ i ] ) )
											{
												case 'this' :
													callFuncArgs[ i ] = item.$;
													break;
												case 'event' :
													callFuncArgs[ i ] = evt.data.$;
													break;
												case 'null' :
													callFuncArgs [ i ] = null;
													break;
											}
										}

										CKEDITOR.tools.callFunction.apply( window, callFuncArgs );
									}

									if( preventDefault )
										evt.data.preventDefault();

								} );
							} );

						} )( eventNameList[ i ] );
					}
				} )( editor.container, [ 'click', 'keydown', 'mousedown', 'keypress' ] );
			} );
	}
});

CKEDITOR.dom.element.prototype.eachChildWithAttribute = function( name, processor )
{
	var children = this.getElementsByTag( '*' ),
		count = children.count(),
		child;
	for ( var i = 0; i < count; i++ )
	{
		child = children.getItem( i );
		if( child.hasAttribute( name ) )
			processor( child );
	}
};
