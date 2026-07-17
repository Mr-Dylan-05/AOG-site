(function($) {
	$(function() {
		<?php 
			$column = ( $settings->image_column <> '' ) ? $settings->image_column : '3';
			$spacing = ( $settings->image_column_spacing <> '' ) ? $settings->image_column_spacing : '30';
			$autoplay = ( $settings->autoplay <> '' ) ? $settings->autoplay : 'false';
			$dots = ( $settings->show_dots <> '' ) ? $settings->show_dots : 'false';
			$nav = ( $settings->show_nav <> '' ) ? $settings->show_nav : 'true';
			$delay = $settings->autoplay_delay <> '' ? $settings->autoplay_delay : '3000';
			$gridby = ( $settings->image_column <> '' ) ? $settings->image_column : '6';
			$itemsTablet = '3';
			$itemsMobile = '1';
			if ($settings->image_column_style == 'grid') {
				$items = 1;
			} else {
				$items = ( $settings->image_column <> '' ) ? $settings->image_column : '3';
				if ( $items > 4 ) $itemsTablet = '3';
			}
		?>
		if ( $(".fl-node-<?php echo $id; ?> .owl-carousel .image").length < <?php echo $column; ?> ) {
			var loopSet = false;
			var touchDragSet = false;
			var dotsSet = false;
			var navSet = false;
		} else {
			var loopSet = false;
			var touchDragSet = true;
			var dotsSet = <?php echo $dots; ?>;
			var navSet = <?php echo $nav; ?>;
		}
		if ( $(".fl-node-<?php echo $id; ?> .owl-carousel .image").length < 2 ) {
			var tabletDotsSet = false;
		} else {
			var tabletDotsSet = <?php echo $dots; ?>;
		}
		if ( $(".fl-node-<?php echo $id; ?> .owl-carousel .image").length < 1 ) {
			var mobileDotsSet = false;
		} else {
			var mobileDotsSet = <?php echo $dots; ?>;
		}
		
		var owl = $(".fl-node-<?php echo $id; ?> .owl-carousel");
		owl.owlCarousel({
			margin: <?php echo $spacing; ?>,
			navText: ['',''],
			autoplay: <?php echo $autoplay; ?>,
			autoplayTimeout: <?php echo $delay ?>,
			autoplayHoverPause: <?php echo $autoplay; ?>,
			autoHeight: true,
			loop: loopSet,
			touchDrag: touchDragSet,
			dots: dotsSet,
			nav: navSet,
			responsive : {
				0 : {
					items: 1,
					slideBy: 1,
					dots: mobileDotsSet,
				},
				568 : {
					items: 2,
					slideBy: 2,
					dots: tabletDotsSet,
				},
				768 : {
					items: <?php echo $items; ?>,
					slideBy: <?php echo $items; ?>,
				}
			}
		});
		setTimeout(function(){
			owl.trigger('refresh.owl.carousel');
		}, 300);
		$(window).on("load", function(){
			owl.trigger('refresh.owl.carousel');
		});
		

		<?php if ( $autoplay === 'true' ) { ?>
			$.fn.visible = function(partial) {		
				var $t            = $(this),
					$w            = $(window),
					viewTop       = $w.scrollTop(),
					viewBottom    = viewTop + $w.height(),
					_top          = $t.offset().top,
					_bottom       = _top + $t.height(),
					compareTop    = partial === true ? _bottom : _top,
					compareBottom = partial === true ? _top : _bottom;		
				return ((compareBottom <= viewBottom) && (compareTop >= viewTop));
			};
			$(window).on("load scroll resize", function(){
				if (owl.visible(true)) {
					owl.trigger('play.owl.autoplay');
				} else {
					owl.trigger('stop.owl.autoplay');
				}
			});
		<?php } ?>
		
	});
})(jQuery);