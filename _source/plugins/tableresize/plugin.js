/*
Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
*/

( function()
{
	var pxUnit = CKEDITOR.tools.cssLength;

	function getCellWidth( cell )
	{
		return CKEDITOR.env.ie ? cell.$.clientWidth : parseInt( cell.getComputedStyle( 'width' ), 10 );
	}

	function getCellBorderWidth( cell, side )
	{
		var computed = cell.getComputedStyle( 'border-' + side + '-width' ),
			borderMap =
			{
				thin: '2px',
				medium: '4px',
				thick: '6px'
			};

		if ( computed.indexOf( 'px' ) < 0 )
		{
			// look up keywords
			if ( computed in borderMap && cell.getComputedStyle( 'border-style' ) != 'none' )
				computed = borderMap[ computed ];
			else
				computed = 0;
		}

		return computed;
	}

	function buildTableColumnPillars( tableElement )
	{
		var table = tableElement.$;

		// Elect the table row that contains the most columns.
		var maxCells = 0, elected;
		for ( var i = 0, rowCount = table.rows.length ; i < rowCount; i++ )
		{
			var tr = table.rows[ i ], cellsCount = tr.cells.length;

			if ( cellsCount > maxCells )
			{
				maxCells = cellsCount;
				elected = tr;
			}
		}

		tr = elected;
		var columnIndex = -1, pillars = [];
		var tbody = new CKEDITOR.dom.element( table.tBodies[ 0 ] ),
				tbodyPosition = tbody.getDocumentPosition();
		for ( var j = 0, colCount = tr.cells.length ; j < colCount ; j++ )
		{
			var td = new CKEDITOR.dom.element( tr.cells[ j ] ),
					nextTd = tr.cells[ j + 1 ] && new CKEDITOR.dom.element( tr.cells[ j + 1 ] );

			columnIndex += td.$.colSpan || 1;
			var cellPosition =  td.getDocumentPosition(),
					rangeLeft = cellPosition.x + td.$.offsetWidth - parseInt( getCellBorderWidth ( td, 'right' ), 10 );

			if ( nextTd )
			{
				cellPosition =  nextTd.getDocumentPosition();
				var rangeRight = cellPosition.x + parseInt( getCellBorderWidth( nextTd, 'left' ), 10 );

				// Compsensate for too "slim" line between columns, make the pillar shown easier.
				if ( rangeRight - rangeLeft < 8 )
				{
					rangeLeft-= 4;
					rangeRight += 4;
				}

				var columnWidth = rangeRight - rangeLeft;

				// The pillar should reflects exactly the shape of the hovered column border line.
				pillars.push({ table : tableElement, index : columnIndex, x : rangeLeft, y : tbodyPosition.y , width : columnWidth, height: tbody.$.offsetHeight });
			}
		}

		return pillars;
	}

	function getPillarAtPosition( pillars, position )
	{
		for ( var i = 0, length = pillars.length; i < length; i++ )
		{
			if ( position.x > pillars[ i ].x && position.x - pillars[ i ].x < pillars[ i ].width )
				return pillars[ i ];
		}
		return null;
	}

	function cancel( evt )
	{
		evt.data.preventDefault();
	}

	function columnResizer( editor )
	{
		var pillar, document, resizer, startOffset, currentShift;

		var leftSideCells, rightSideCells, leftShiftBoundary, rightShiftBoundary;

		function detach()
		{
			pillar = null;
			currentShift = null;
			document.removeListener( 'mousemove', onMouseMove );
			document.removeListener( 'mouseup', onMouseUp );
			resizer.removeListener( 'mousedown', onMouseDown );
			resizer.removeListener( 'mouseout', onMouseOut );
			resizer.hide();
		}

		function resizeStart()
		{
			// Before starting to resize, figure out which cells to change
			// and the boundaries of this resizing shift.
			var columnIndex = pillar.index,
					map = CKEDITOR.tools.buildTableMap( pillar.table ),
					leftColumnCells = [],
					rightColumnCells= [],
					leftMinSize =  Number.MAX_VALUE,
					rightMinSize = leftMinSize;

			for ( var i = 0, rowCount = map.length; i < rowCount; i++ )
			{
				var row = map[ i ],
						leftCell = new CKEDITOR.dom.element( row[ columnIndex ] ),
						rightCell = new CKEDITOR.dom.element( row[ columnIndex + 1 ] );

				if ( !leftCell.equals( rightCell ) )
				{
					leftMinSize = Math.min( leftMinSize, getCellWidth( leftCell ) );
					rightMinSize = Math.min( rightMinSize, getCellWidth( rightCell ) );
					leftColumnCells.push( leftCell );
					rightColumnCells.push( rightCell );
				}
			}

			leftSideCells = leftColumnCells;
			rightSideCells = rightColumnCells;
			leftShiftBoundary =  pillar.x - leftMinSize;
			rightShiftBoundary = pillar.x + rightMinSize;

			resizer.setOpacity( 0.5 );
			startOffset = parseInt( resizer.getStyle( 'left' ), 10 );
			currentShift = 0;
			document.on( 'mousemove', onMouseMove, this );
			// Prevent the native drag behavior otherwise the above 'mousemove' won't fired.
			document.on( 'dragstart', cancel, this );
		}

		function resizeEnd()
		{
			resizer.setOpacity( 0 );
			currentShift && resizeColumn();

			var table = pillar.table;
			setTimeout( function () { table.removeCustomData( '_cke_table_pillars' ); }, 0 );

			detach();
		}

		function resizeColumn()
		{
			// Perform the actual resize to table cells, only for those by side of the pillar.
			for ( var i = 0, count = leftSideCells.length; i < count; i++ )
			{
				var leftCell = leftSideCells[ i ],
						rightCell = rightSideCells[ i ];

				// Defer the resizing to avoid any interference among cells.
				( function( leftCell, leftOldWidth, rightCell, rightOldWidth, sizeShift )
				{
					CKEDITOR.tools.setTimeout( function()
					{
						leftCell.setStyle( 'width', pxUnit(  leftOldWidth + sizeShift ) );
						rightCell.setStyle( 'width', pxUnit(  rightOldWidth - sizeShift ) );

					}, 0, this );

				}).call( this, leftCell, getCellWidth( leftCell ),
						rightCell, getCellWidth( rightCell ), currentShift );
			}
		}

		function onMouseMove( evt )
		{
			var mouseOffset = evt.data.$.clientX,
					resizerNewPosition = mouseOffset - Math.round( parseInt( resizer.getComputedStyle( 'width' ), 10 ) / 2 );

			// Boundaries checking.
			if ( resizerNewPosition > leftShiftBoundary && resizerNewPosition < rightShiftBoundary )
			{
				resizer.setStyle( 'left', pxUnit( resizerNewPosition ) );
				currentShift = resizerNewPosition - startOffset;
			}

			cancel( evt );
		}

		function onMouseDown( evt )
		{
			cancel( evt );
			resizeStart();
			document.on( 'mouseup', onMouseUp, this );
		}

		function onMouseUp()
		{
			resizeEnd();
		}

		function onMouseOut()
		{
			// Don't detach during resizing.
			!currentShift && detach();
		}

		document = editor.document;
		resizer = CKEDITOR.dom.element.createFromHtml( '<div style="position: absolute; cursor: col-resize; ' +
			'filter:alpha(opacity=0);opacity:0;padding:0;background-color:#004;background-image:none;border: 0px none;"></div>' );

		// Place the resizer after body to prevent it from being editable.
		document.getDocumentElement().append( resizer );
		this.attachTo = function( targetPillar )
		{
			// Accept only one pillar at a time.
			if ( currentShift )
				return;

			pillar = targetPillar;
			resizer.setStyles(
			{
				width: pxUnit( targetPillar.width ),
				height : pxUnit( targetPillar.height ),
				left : pxUnit( targetPillar.x ),
				top : pxUnit( targetPillar.y )
			});

			resizer.on( 'mousedown', onMouseDown, this );
			resizer.on( 'mouseout', onMouseOut, this );

			// Display the resizer to receive events but don't show it,
			// only change the cursor to resizable shape.
			resizer.show();
		};
	}

	function clearPillarsCache( evt )
	{
		var target = evt.data.getTarget();

		if ( evt.name == 'mouseout' )
		{
			// Bypass interal mouse move.
			if ( !target.is ( 'table' ) )
				return;

			var dest = new CKEDITOR.dom.element( evt.data.$.relatedTarget || evt.data.$.toElement );
			while( dest && !dest.equals( target ) && !dest.is( 'body' ) )
				dest = dest.getParent();
			if ( !dest || dest.equals( target ) )
				return;
		}

		target.getAscendant( 'table', true ).removeCustomData( '_cke_table_pillars' );
		evt && evt.removeListener();
	}

	CKEDITOR.plugins.add( 'tableresize',
	{
		requires : [ 'tabletools' ],
		init : function( editor )
		{
			editor.on( 'contentDom', function ()
			{
				var resizer;
				editor.document.getBody().on( 'mousemove', function( evt )
				{
					evt = evt.data;

					// Considering table, tr, td, tbody but nothing else.
					var target = evt.getTarget();
					if ( !( target.is( 'table' ) || target.getAscendant( 'tbody', true ) ) )
						return;

					var table = target.getAscendant( 'table', true ),
							pillars;

					if ( !( pillars = table.getCustomData( '_cke_table_pillars' ) ) )
					{
						// Cache table pillars caculation result.
						table.setCustomData( '_cke_table_pillars', ( pillars = buildTableColumnPillars( table ) ) );
						table.on( 'mouseout', clearPillarsCache );
						table.on( 'mousedown', clearPillarsCache );
					}

					var pillar = getPillarAtPosition( pillars, { x : evt.$.clientX, y : evt.$.clientY } );
					if ( pillar )
					{
						!resizer && ( resizer = new columnResizer( editor ) );
						resizer.attachTo( pillar );
					}
				});
			});
		}
	});

} )( );
