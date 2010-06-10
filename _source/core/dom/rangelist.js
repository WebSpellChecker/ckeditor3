/*
Copyright (c) 2003-2009, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
*/
( function()
{
	/**
	 * Representation of multiple ranges within a selection.
	 * @constructor
	 * @param {CKEDITOR.dom.range|Array|undefined} ranges
	 *  The ranges consist of this list, note that if an array of ranges is specified,
	 *  the range sequence should compliant with the selection order, this class is
	 *  will not help to sort them.
	 *
	 * @borrows CKEDITOR.dom.selection#createBookmarks as this.createBookmarks
	 * @borrows CKEDITOR.dom.selection#createBookmarks2 as this.createBookmarks2
	 */
	CKEDITOR.dom.rangeList = function( ranges )
	{
		if ( !ranges )
			ranges = [];
		else if ( ranges instanceof CKEDITOR.dom.range )
			ranges = [ ranges ];

		return CKEDITOR.tools.extend( ranges, mixins );
	};

	var mixins =
	/** @lends CKEDITOR.dom.rangeList.prototype */
	{
			/**
			 * Create an instance of rangeList iterator, it should be only used when
			 * the processing of range is DOM destructive, which means it will possibly
			 * pollute other ranges in this list.
			 * Otherwise, it's enough to just iterate over this array.
			 * in a for loop.
			 * @returns {CKEDITOR.dom.rangeListIterator}
			 */
			createIterator : function()
			{
				var rangeList = this,
					bookmarks = [],
					current;

				/**
				 * @lends CKEDITOR.dom.rangeListIterator.prototype
				 */
				return {

					/**
					 * Iterate over the next range in this list.
					 */
					getNextRange : function()
					{
						current = current == undefined ? 0 : current + 1;

						var range = rangeList[ current ];

						// Multiple ranges might be mangled by each other.
						if ( range && rangeList.length > 1 )
						{
							// Bookmarking all other ranges on the first iteration,
							// the range correctness after it doesn't matter since we'll
							// restore them before the next iteration.
							if ( current == 0 )
							{
								// Make sure bookmark correctness by reverse processing.
								for ( var i = rangeList.length - 1 ; i > 0 ; i-- )
									bookmarks.unshift( rangeList[ i ].createBookmark() );
							}
							else
								range.moveToBookmark( bookmarks.shift() );
						}

						return range;
					}
				};
			},

			/**
			 * @param serializable
			 */
			createBookmarks : function( serializable )
			{
				var retval = [], bookmark;
				for ( var i = 0; i < this.length ; i++ )
				{
					retval.push( bookmark = this[ i ].createBookmark( serializable, true) );

					// Updating the container & offset values for ranges
					// that have been touched.
					for ( var j = i + 1; j < this.length; j++ )
					{
						this[ j ] = updateDirtyRange( bookmark, this[ j ] );
						this[ j ] = updateDirtyRange( bookmark, this[ j ], true );
					}
				}
				return retval;
			},

			/**
			 * @param normalized
			 */
			createBookmarks2 : function( normalized )
			{
				var bookmarks = [];

				for ( var i = 0 ; i < this.length ; i++ )
					bookmarks.push( this[ i ].createBookmark2( normalized ) );

				return bookmarks;
			},

			/**
			 * Apply each of the supplied bookmarks to the corresponding range at the index.
			 * @param bookmarks
			 */
			moveToBookmarks :  function( bookmarks )
			{
				for ( var i = 0 ; i < this.length ; i++ )
					this[ i ].moveToBookmark( bookmarks[ i ] );
			}
	};

	// Update the specified range which has been mangled by previous insertion of
	// range bookmark nodes.(#3256)
	function updateDirtyRange( bookmark, dirtyRange , checkEnd )
	{
		var serializable = bookmark.serializable,
			container = dirtyRange[ checkEnd ? 'endContainer' : 'startContainer' ],
			offset = checkEnd ? 'endOffset' : 'startOffset',
			bookmarkStart = serializable ?
				dirtyRange.document.getById( bookmark.startNode )
				: bookmark.startNode,
			bookmarkEnd = serializable ?
			  dirtyRange.document.getById( bookmark.endNode )
			  : bookmark.endNode;

		if ( container.equals( bookmarkStart.getPrevious() ) )
		{
			dirtyRange.startOffset = dirtyRange.startOffset
					- container.getLength() - bookmarkEnd.getPrevious().getLength();
			container = bookmarkEnd.getNext();
		}
		else if ( container.equals( bookmarkEnd.getPrevious() ) )
		{
			dirtyRange.startOffset = dirtyRange.startOffset - container.getLength();
			container = bookmarkEnd.getNext();
		}

		container.equals( bookmarkStart.getParent() ) && dirtyRange[ offset ]++;
		container.equals( bookmarkEnd.getParent() ) && dirtyRange[ offset ]++;

		// Update and return this range.
		dirtyRange[ checkEnd ? 'endContainer' : 'startContainer' ] = container;
		return dirtyRange;
	}

	/**
	 * (Virtual Class) Do not call this constructor. This class is not really part
	 *	of the API. It just describes the return type of {@link CKEDITOR.dom.rangeList#createIterator}.
	 * @name CKEDITOR.dom.rangeListIterator
	 * @constructor
	 * @example
	 */


} )();
