(function($) {

	FLBuilderLoop = function(settings)
	{
		this.settings    = settings
		this.nodeClass   = '.fl-node-' + settings.id
		this.wrapperClass = this.nodeClass + ' .fl-loop-grid'
		this._initInfiniteScroll()
	}

	FLBuilderLoop.prototype = {

		settings        : {},
		nodeClass       : '',
		wrapperClass    : '',
		postClass       : '',
		gallery         : null,
		currPage		: 1,
		totalPages		: 1,

		_initInfiniteScroll: function()
		{
			var isScroll = 'scroll' == this.settings.pagination
				pages	 = $( this.nodeClass + ' .fl-builder-pagination' ).find( 'li .page-numbers:not(.next)' );

			if( pages.length > 1) {
				total = pages.last().text().replace( /\D/g, '' )
				this.totalPages = parseInt( total );
			}

			if( isScroll && this.totalPages > 1 && 'undefined' === typeof FLBuilder ) {
				this._infiniteScroll()
			}
			FLBuilderLayout._scrollToElement( $( this.nodeClass + ' .fl-loop-paged-scroll' ) );
		},

		_infiniteScroll: function(settings)
		{

			var path 		= $(this.nodeClass + ' .fl-builder-pagination a.next').attr('href'),
				pagePattern = /(.*?(\/|\&|\?)paged-[0-9]{1,}(\/|=))([0-9]{1,})+(.*)/,
				wpPattern   = /^(.*?\/?page\/?)(?:\d+)(.*?$)/,
				pageMatched = null,
				scrollData	= {
					navSelector     : this.nodeClass + ' .fl-builder-pagination',
					nextSelector    : this.nodeClass + ' .fl-builder-pagination a.next',
					itemSelector    : this.nodeClass + ' .fl-loop-item',
					prefill         : true,
					bufferPx        : 200,
					loading         : {
						msgText         : 'Loading...',
						finishedMsg     : '',
						img             : FLBuilderLayoutConfig.paths.pluginUrl + 'img/ajax-loader-grey.gif',
						speed           : 1
					}
				}

				// Define path since Infinitescroll incremented our custom pagination '/paged-2/2/' to '/paged-3/2/'.
				if ( pagePattern.test( path ) ) {
					scrollData.path = function( currPage ) {
						pageMatched = path.match( pagePattern );
						path = pageMatched[1] + currPage + pageMatched[5];
						return path;
					}
				}
				else if ( wpPattern.test( path ) ) {
					scrollData.path = path.match( wpPattern ).slice( 1 );
				}

				$( this.nodeClass + ' ul' ).infinitescroll( scrollData, $.proxy(this._infiniteScrollComplete, this) );
		},

		_infiniteScrollComplete: function(elements)
		{
			var wrap = $(this.wrapperClass);
			elements = $(elements);

			if(this.settings.layout == 'columns') {
				wrap.imagesLoaded( $.proxy( function() {
					this._gridLayoutMatchHeight();
					elements.css('visibility', 'visible');
				}, this ) );
			}

			elements.find( 'img[srcset]' ).each( function( index, img ) {
				img.outerHTML = img.outerHTML;
			});

			this.currPage++;

			// trigger an event
			node = $(wrap).closest('.fl-module-post-grid').data('node')
			$('.fl-node-' + node).trigger( 'gridScrollComplete', this );
		},
	}

})(jQuery);
