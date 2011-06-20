/*
Copyright (c) 2003-2011, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
*/

/**
 * @file Blockquote.
 */

(function()
{
	function getState( editor, path )
	{
		var firstBlock = path.block || path.blockLimit;

		if ( !firstBlock || firstBlock.getName() == 'body' )
			return CKEDITOR.TRISTATE_OFF;

		// See if the first block has a blockquote parent.
		if ( firstBlock.getAscendant( 'blockquote', true ) )
			return CKEDITOR.TRISTATE_ON;

		return CKEDITOR.TRISTATE_OFF;
	}

	function onSelectionChange( evt )
	{
		var editor = evt.editor,
			command = editor.getCommand( 'blockquote' );
		command.state = getState( editor, evt.data.path );
		command.fire( 'state' );
	}

	function noBlockLeft( bqBlock )
	{
		for ( var i = 0, length = bqBlock.getChildCount(), child ; i < length && ( child = bqBlock.getChild( i ) ) ; i++ )
		{
			if ( child.type == CKEDITOR.NODE_ELEMENT && child.isBlockBoundary() )
				return false;
		}
		return true;
	}

	var commandObject =
	{
		exec : function( editor )
		{
			var state = editor.getCommand( 'blockquote' ).state,
				selection = editor.getSelection(),
				range = selection && selection.getRanges( true )[0],
				enterBr = editor.config.enterMode == CKEDITOR.ENTER_BR;

			if ( !range )
				return;

			var bookmarks = selection.createBookmarks();

			// Kludge for #1592: if the bookmark nodes are in the beginning of
			// blockquote, then move them to the nearest block element in the
			// blockquote.
			if ( CKEDITOR.env.ie )
			{
				var bookmarkStart = bookmarks[0].startNode,
					bookmarkEnd = bookmarks[0].endNode,
					cursor;

				if ( bookmarkStart && bookmarkStart.getParent().getName() == 'blockquote' )
				{
					cursor = bookmarkStart;
					while ( ( cursor = cursor.getNext() ) )
					{
						if ( cursor.type == CKEDITOR.NODE_ELEMENT &&
								cursor.isBlockBoundary() )
						{
							bookmarkStart.move( cursor, true );
							break;
						}
					}
				}

				if ( bookmarkEnd
						&& bookmarkEnd.getParent().getName() == 'blockquote' )
				{
					cursor = bookmarkEnd;
					while ( ( cursor = cursor.getPrevious() ) )
					{
						if ( cursor.type == CKEDITOR.NODE_ELEMENT &&
								cursor.isBlockBoundary() )
						{
							bookmarkEnd.move( cursor );
							break;
						}
					}
				}
			}

			if ( state == CKEDITOR.TRISTATE_OFF )
			{
				var iterator = range.createIterator(),
					block;
				iterator.enlargeBr = !enterBr;

				var paragraphs = [];
				while ( ( block = iterator.getNextParagraph() ) )
					paragraphs.push( block );

				// If no paragraphs, create one from the current selection position.
				if ( paragraphs.length < 1 )
				{
					var para = editor.document.createElement( editor.config.enterMode == CKEDITOR.ENTER_P ? 'p' : 'div' ),
						firstBookmark = bookmarks.shift();
					range.insertNode( para );
					para.append( new CKEDITOR.dom.text( '\ufeff', editor.document ) );
					range.moveToBookmark( firstBookmark );
					range.selectNodeContents( para );
					range.collapse( true );
					firstBookmark = range.createBookmark();
					paragraphs.push( para );
					bookmarks.unshift( firstBookmark );
				}

				// Make sure all paragraphs have the same parent.
				var commonParent = paragraphs[0].getParent(),
					tmp = [];
				for ( var i = 0 ; i < paragraphs.length ; i++ )
				{
					block = paragraphs[i];
					commonParent = commonParent.getCommonAncestor( block.getParent() );
				}

				// The common parent must not be the following tags: table, tbody, tr, ol, ul.
				var denyTags = { table : 1, tbody : 1, tr : 1, ol : 1, ul : 1 };
				while ( denyTags[ commonParent.getName() ] )
					commonParent = commonParent.getParent();

				// Reconstruct the block list to be processed such that all resulting blocks
				// satisfy parentNode.equals( commonParent ).
				var lastBlock = null;
				while ( paragraphs.length > 0 )
				{
					block = paragraphs.shift();
					while ( !block.getParent().equals( commonParent ) )
						block = block.getParent();
					if ( !block.equals( lastBlock ) )
						tmp.push( block );
					lastBlock = block;
				}

				// If any of the selected blocks is a blockquote, remove it to prevent
				// nested blockquotes.
				while ( tmp.length > 0 )
				{
					block = tmp.shift();
					if ( block.getName() == 'blockquote' )
					{
						var docFrag = new CKEDITOR.dom.documentFragment( editor.document );
						while ( block.getFirst() )
						{
							docFrag.append( block.getFirst().remove() );
							paragraphs.push( docFrag.getLast() );
						}

						docFrag.replace( block );
					}
					else
						paragraphs.push( block );
				}

				// Now we have all the blocks to be included in a new blockquote node.
				var bqBlock = editor.document.createElement( 'blockquote' );
				bqBlock.insertBefore( paragraphs[0] );
				while ( paragraphs.length > 0 )
				{
					block = paragraphs.shift();
					bqBlock.append( block );
				}
			}
			else if ( state == CKEDITOR.TRISTATE_ON )
			{
				var blockquote = range.getCommonAncestor().getAscendant( 'blockquote', 1 );

				range.enlarge( enterBr ? CKEDITOR.ENLARGE_LIST_ITEMS : CKEDITOR.ENLARGE_BLOCKS );

				// Fixing the case where blockquote element itself is enlarged, don't leak outside of it.
				// e.g. <blockquote>no other block</blockquote>.
				if ( range.startContainer.contains( blockquote ) )
					range.setStartAt( blockquote, CKEDITOR.POSITION_AFTER_START );
				if ( range.endContainer.contains( blockquote ) )
					range.setEndAt( blockquote, CKEDITOR.POSITION_BEFORE_END );

				var isStart = range.checkBoundaryOfElement( blockquote, CKEDITOR.START ),
					isEnd = range.checkBoundaryOfElement( blockquote, CKEDITOR.END ),
					frag = range.extractContents();

				if ( isStart )
					frag.insertBefore( blockquote );
				else if ( isEnd )
					frag.insertAfterNode( blockquote );
				else
				{
					var marker = editor.document.createElement( 'span' );
					range.insertNode( marker );
					marker.breakParent( blockquote );
					frag.replace( marker );
				}

				if ( blockquote.isEmptyBlock() )
					blockquote.remove();
			}

			selection.selectBookmarks( bookmarks );

			// Fix those moved out pseudo paragraphs in block enter mode.
			if ( !enterBr )
			{
				bookmarks = selection.createBookmarks();
				range = selection.getRanges()[ 0 ];
				var iterator = range.createIterator();
				while ( iterator.getNextParagraph() );
				selection.selectBookmarks( bookmarks );
			}

			editor.focus();
		}
	};

	CKEDITOR.plugins.add( 'blockquote',
	{
		init : function( editor )
		{
			editor.addCommand( 'blockquote', commandObject );

			editor.ui.addButton( 'Blockquote',
				{
					label : editor.lang.blockquote,
					command : 'blockquote'
				} );

			editor.on( 'selectionChange', onSelectionChange );
		},

		requires : [ 'domiterator' ]
	} );
})();
