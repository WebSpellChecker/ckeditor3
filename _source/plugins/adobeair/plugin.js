/*
Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
*/

(function()
{
	var eventNameList = [ 'click', 'keydown', 'mousedown', 'keypress' ];
	// any inline event callbacks assigned via innerHTML/outerHTML such as
	// onclick/onmouseover, are ignored in AIR.
	// Use DOM2 event listeners to substitue inline handlers instead.
	function convertInlineHandlers( container )
	{
		// TODO: document.querySelectorAll is not supported in AIR.
		var children = container.getElementsByTag( '*' ),
			count = children.count(),
			child;
		for ( var i = 0; i < count; i++ )
		{
			child = children.getItem( i );

			(function( node )
			{
				for ( var j = 0; j < eventNameList.length; j++ )
				{
					(function( eventName )
					{

						if ( node.hasAttribute( 'on' + eventName ) )
						{
							node.on( eventName, function( evt )
							{
								var inlineEventHandler = node.getAttribute( 'on' + eventName ),
									callFunc = /callFunction\(([^)]+)\)/.exec( inlineEventHandler ),
									callFuncArgs = callFunc &&  callFunc[ 1 ].split( ',' ),
									preventDefault = /return false;/.test( inlineEventHandler );

								if ( callFuncArgs )
								{
									var nums = callFuncArgs.length,
										argName;

									for ( var i = 0; i < nums; i++ )
									{
										// Trim spaces around param.
										callFuncArgs[ i ] = argName = CKEDITOR.tools.trim( callFuncArgs[ i ] );

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
											callFuncArgs[ i ] = parseInt( argName, 10 );
											continue;
										}

										// Speical variables.
										switch( argName )
										{
											case 'this' :
												callFuncArgs[ i ] = node.$;
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

								if ( preventDefault )
									evt.data.preventDefault();
							});
						}
					})( eventNameList[ j ] );
				}
			})( child );
		}
	}

	CKEDITOR.plugins.add( 'adobeair',
	{
		init : function( editor )
		{
			if ( !CKEDITOR.env.air )
				return;

			// Body doesn't get default margin on AIR.
			editor.addCss( 'body { padding: 8px }' );

			// Frame source from application sandbox to be consumed by 'wysiwyg' plugin.
			editor._.air_bootstrap_frame_url = this.path + '/assets/air_boostrap_frame.html?' + editor.name;


			editor.on( 'uiReady', function()
				{
					convertInlineHandlers( editor.container );
					editor.sharedtop && convertInlineHandlers( editor.sharedtop );
					editor.sharedbottom && convertInlineHandlers( editor.sharedbottom );
					editor.on( 'elementsPathUpdate', function( evt ) { convertInlineHandlers( evt.data ); } );
				});

		},

		afterLoad : function()
		{
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

					// Adding dom event listeners off-line are not supported in AIR,
					// waiting for panel iframe loaded.
					if ( !panel.isLoaded )
					{
						setTimeout( arguments.callee, 30 );
						return;
					}
					holder = panel._.holder;
					convertInlineHandlers( holder );
				})();
			}

			richCombo && richCombo.on( 'uiReady', onPanelUIReady );
			panelButton && panelButton.on( 'uiReady', onPanelUIReady );
			menu && menu.on( 'uiReady', onPanelUIReady );
			dialog && dialog.on( 'uiReady', function ( evt )
				{
					convertInlineHandlers( evt.data._.element );
				});
		}
	});
})();
