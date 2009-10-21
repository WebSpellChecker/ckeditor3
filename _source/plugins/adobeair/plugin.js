/*
Copyright (c) 2003-2009, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
*/

CKEDITOR.plugins.add( 'adobeair',
{
	init : function( editor )
	{
		function convertInlineHandlers( container, eventNameList )
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
								callFuncArgs = callFunc &&  callFunc[ 1 ].split( ',' ),
								preventDefault = /return false;/.test( inlineEventHandler );


							if ( callFuncArgs )
							{
								var nums = callFuncArgs.length,
									argName;
								for ( var i = 0; i < nums; i++ )
								{
									callFuncArgs[ i ] = argName
										= CKEDITOR.tools.trim( callFuncArgs[ i ] );

									// String form param.
									var strPattern = argName.match( /^(["'])([^"']*?)\1$/ );
									if ( strPattern )
									{
										callFuncArgs[ i ] = strPattern[ 2 ];
										continue;
									}

									// Integer form param.
									if ( argName.match( /\d+/ ) )
									{
										callFuncArgs[ i ] = parseInt( argName );
										continue;
									}

									switch( argName )
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
								console.log( callFuncArgs );
								CKEDITOR.tools.callFunction.apply( window, callFuncArgs );
							}

							if( preventDefault )
								evt.data.preventDefault();

						} );
					} );

				} )( eventNameList[ i ] );
			}
		}

		if( CKEDITOR.env.air )
		{
			editor.on( 'uiReady', function()
			{
				convertInlineHandlers( editor.container, [ 'click', 'keydown', 'mousedown', 'keypress' ] );
			} );

			var richCombo = CKEDITOR.ui.richCombo,
				panelButton = CKEDITOR.ui.panelButton,
				menu = CKEDITOR.menu,
				dialog = CKEDITOR.dialog;

			function onPanelUIReady( evt )
			{
				var floatPanel = evt.data._.panel,
					panel = floatPanel._.panel,
					holder;

				( function(){

					// Off-line dom event is not supported in AIR, waiting for
					// panel iframe loaded.
					if ( !panel.isLoaded )
					{
						setTimeout( arguments.callee, 30 );
						return;
					}
					holder = panel._.holder;
					convertInlineHandlers( holder, [ 'click', 'keydown', 'mousedown', 'keypress' ] );
				})();

			}

			richCombo && richCombo.on( 'uiReady', onPanelUIReady );
			panelButton && panelButton.on( 'uiReady', onPanelUIReady );
			menu && menu.on( 'uiReady', onPanelUIReady );
			dialog && dialog.on( 'uiReady', function ( evt )
			{
				convertInlineHandlers( evt.data._.element, [ 'click', 'keydown', 'mousedown', 'keypress' ] );
			} );

		}
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
