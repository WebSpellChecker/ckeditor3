/*
Copyright (c) 2003-2011, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
*/

/**
 * @file DOM iterator, which iterates over list items, lines and paragraphs.
 */

CKEDITOR.plugins.add( 'domiterator' );

(function()
{
	/**
	 * @name CKEDITOR.dom.iterator
	 */
	function iterator( range, blocklist )
	{
		this.range = range;
		this.enlargeBr = 1;
		blocklist = CKEDITOR.tools.convertToList( blocklist ) || {};


		var doc = range.document,
			walker,
			current,
			insidePre;  // pre-formatted context indicator.

		this.getNextParagraph = function( fixBlockTag )
		{
			if ( !walker )
			{
				var walkerRange = range.clone();
				walkerRange.enlarge( this.enlargeBr ? CKEDITOR.ENLARGE_BLOCKS : CKEDITOR.ENLARGE_LIST_ITEMS );
				walkerRange.trim();

				walker = new CKEDITOR.dom.walker( walkerRange );

				var blocker = walkerRange.endContainer.getChild( walkerRange.endOffset - 1 ) || walkerRange.endContainer.getPreviousSourceNode( 1 );
				walker.evaluator = function( node )
				{
					if ( nonBookmark( node ) && nonWhitespaces( node ) )
					{
						var position = node.getPosition( blocker );

						// Considers only the nodes that are within the range.
						return ! ( position && !( (  position & CKEDITOR.POSITION_PRECEDING + CKEDITOR.POSITION_IS_CONTAINED )
								&& position ^ CKEDITOR.POSITION_PRECEDING + CKEDITOR.POSITION_CONTAINS ) );
					}
					else
						return false;
				};

				walker.guard = function( node, walkOut )
				{
					if ( node.type == CKEDITOR.NODE_ELEMENT && node.is( 'pre' ) )
						insidePre = !walkOut;
				};
			}

			current = current == undefined ?  walker.next() : current;

			if ( !current )
			{
				walker.reset();
				return null;
			}

			var path, block, checkRange, brToRemove, fixedBlock, lastChild;
			do
			{
				// Block encountered.
				if ( current.type == CKEDITOR.NODE_ELEMENT && current.isBlockBoundary( !this.enlargeBr && { br : 1 } ) )
				{
					// Block is just on wanted list.
					if ( current.getName() in blocklist )
						block = current;
					else if ( !current.getChildCount() )
					{
						// An empty path block is encountered, e.g. an empty paragraph.
						if ( current.getName() in CKEDITOR.dtd.$block )
							block = current;
						// Not a path block, but an empty block limit that could carry text, 
						// e.g. an empty table cell, so have to establish a real block in it. (#7220)
						else if ( CKEDITOR.dtd[ current.getName() ][ '#' ] )
							block = current.append( doc.createElement( fixBlockTag || 'p' ) );
					}
				}
				// At the beginning inside of a block.
				else
				{
					path = new CKEDITOR.dom.elementPath( current );
					block = path.block;

					// TODO: We should fix CKEDITOR.dom.elementPath instead.

					// Negate any shared (pseudo) blocks that contain more than one block.
					// e.g. <li>^pseudo<p>paragraph</p></li>
					if ( block )
					{
						if ( block.getName() in pathBlockExclusion )
							block = null;
						else
						{
							checkRange = new CKEDITOR.dom.range( doc );
							checkRange.setStartBefore( current );
							checkRange.enlarge( insidePre || this.enlargeBr ?
							                    CKEDITOR.ENLARGE_BLOCK_CONTENTS : CKEDITOR.ENLARGE_LIST_ITEM_CONTENTS );
							var atBlockStart = checkRange.checkStartOfBlock( block ),
									atBlockEnd = checkRange.checkEndOfBlock( block );
							if ( ! ( atBlockStart && atBlockEnd ) )
							{
								if ( !this.enlargeBr )
								{
									fixedBlock = block.clone();
									brToRemove = brHandler( checkRange );
									checkRange.extractContents().appendTo( fixedBlock );
									if ( atBlockStart )
										fixedBlock.insertBefore( block );
									else if ( atBlockEnd )
										fixedBlock.insertAfter( block );
									else
										fixedBlock.insertBefore( checkRange.splitBlock().nextBlock );
									brToRemove.remove();
									block = fixedBlock;
								}
								else
									block = null;
							}
						}
					}

					if ( !block )
					{
						checkRange = new CKEDITOR.dom.range( doc );
						checkRange.setStartBefore( current );
						if ( !this.enlargeBr )
						{
							fixedBlock = doc.createElement( fixBlockTag || 'p' );
							checkRange.enlarge( CKEDITOR.ENLARGE_LIST_ITEM_CONTENTS );
							brToRemove = brHandler( checkRange );
							checkRange.extractContents().appendTo( fixedBlock );
							checkRange.insertNode( fixedBlock );
							brToRemove.remove();
							block = fixedBlock;
						}
						else
						{
							block = checkRange.fixBlock( 1, fixBlockTag || 'p' );
						}
					}
				}
			}
			while ( !block && ( current = walker.next() ) );

			if ( block )
			{
				// Get a reference for the next element. This is important because the
				// above block can be removed or changed, so we can rely on it for the
				// next interation.

				current = block;
				while ( current.type == CKEDITOR.NODE_ELEMENT && ( lastChild = current.getLast() ) )
					current = lastChild;

				walker.current = current;
				current = walker.next();
			}

			return block;
		}
	}

	CKEDITOR.dom.range.prototype.createIterator = function( blockList )
	{
		return new iterator( this, blockList );
	};

	function brHandler( range )
	{
		var startBoundary = range.getTouchedStartNode(),
			endBoundary = range.getTouchedEndNode(),
			toRemove = [ startBoundary.getPrevious(), startBoundary, endBoundary ];

		for ( var i = 0; i < toRemove.length; i++ )
		{
			var node = toRemove[ i ];
			if ( !( node && node.type == CKEDITOR.NODE_ELEMENT && node.is( 'br' ) ) )
				toRemove.splice( i, 1 );
		}

		return {
			remove : function()
			{
				for ( var i = 0; i < toRemove.length; i++ )
					toRemove[ i ].remove();
			}
		}
	}

	var nonWhitespaces = CKEDITOR.dom.walker.whitespaces( 1 ),
		nonBookmark = CKEDITOR.dom.walker.bookmark( 0, 1 );

	var pathBlockExclusion = { address:1,blockquote:1,dl:1,dt:1,dd:1,li:1 };

})();
