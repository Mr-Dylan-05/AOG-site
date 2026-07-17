(function($) {
	$(function() {
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
				
		<?php 
		if ( $settings->categories != 'selected' || $settings->selected_categories == '' ) {
			$query_args = array(
				'post_type' => 'testimonial',
				'posts_per_page' => $settings->totalpost,
				'orderby' => $settings->orderby,
				'order' => $settings->order,
				'offset' => $settings->offset,
			);
		} else {
			$query_args = array(
				'post_type' => 'testimonial',
				'posts_per_page' => $settings->totalpost,
				'orderby' => $settings->orderby,
				'order' => $settings->order,
				'offset' => $settings->offset,
				'tax_query' => array( 
					array( 
						'taxonomy' => 'testimonial_category', //or tag or custom taxonomy
						'field' => 'slug', 
						'terms' => $settings->selected_categories
					) 
				)
			);
		}
		$query = new WP_Query($query_args);
		$count = 0;
		while ( $query->have_posts()) : $query->the_post();
			$count++;
		endwhile; wp_reset_query();
		if ( $count == 1 ) { 
			$dots = 'false';
		} else {
			$dots = $settings->show_dots;
		}
				
		if ( $count < 4 ) { 
			$loop = 'false';
		} else {
			$loop = true;
		} ?>
				
		<?php if ( $settings->style == " one-row") { ?>
			$(".fl-node-<?php echo $id; ?> .testimonial-slides-nav").flickity({
				sync: '.fl-node-<?php echo $id; ?> .testimonial-slides', 
				contain: true, 
				pageDots: false, 
				prevNextButtons: false, 
				wrapAround: true,
				adaptiveHeight: true,
			});
			$(".fl-node-<?php echo $id; ?> .testimonial-slides").flickity({
				prevNextButtons: false,
				wrapAround: true,
				pageDots: <?php echo $dots; ?>,
				autoPlay: <?php echo $settings->autoplay; ?>,
				autoPlay: 7000,
			});
		<?php } else if ( $settings->style == " center-sync") { ?>
			$(".fl-node-<?php echo $id; ?> .testimonial-slides-nav").flickity({
				asNavFor: '.fl-node-<?php echo $id; ?> .testimonial-slides', 
				contain: true, 
				pageDots: false, 
				prevNextButtons: false, 
				wrapAround: <?php echo $loop; ?>,
				adaptiveHeight: true,
				<?php if ( $count == 3 ) {  ?>
				initialIndex: 1,
				<?php } ?>
			});
			$(".fl-node-<?php echo $id; ?> .testimonial-slides").flickity({
				prevNextButtons: false,
				wrapAround: true,
				pageDots: <?php echo $dots; ?>,
				autoPlay: <?php echo $settings->autoplay; ?>,
				autoPlay: 7000,
				<?php if ( $count == 3 ) {  ?>
				initialIndex: 1,
				<?php } ?>
			});
		<?php } else { ?>
			<?php 
				$margin = ( $settings->margin <> '' ) ? $settings->margin : '10';
				$dots = ( $settings->show_dots <> '' ) ? $settings->show_dots : 'true';
				$nav = ( $settings->show_nav <> '' ) ? $settings->show_nav : 'true';
				$items = ( $settings->items <> '' ) ? $settings->items : '3';
				$items_medium = ( $settings->items_medium <> '' ) ? $settings->items_medium : $items;
				$items_responsive = ( $settings->items_responsive <> '' ) ? $settings->items_responsive : $items_medium;
				$autoplay = ( $settings->autoplay <> '' ) ? $settings->autoplay : 'false';

				if ( $autoplay === 'false' ) {
					$loop = 'false';
				} else {
					$loop = 'true';
				}
			?>
			var owl = $(".fl-node-<?php echo $id; ?> .owl-carousel");
			owl.owlCarousel({
				margin: <?php echo $margin; ?>,
				autoplay: <?php echo $autoplay; ?>,
				autoplayHoverPause:true,
				autoHeight: true, 
				navText: [' ',' '],
				<?php if ( $count > $items ) { ?>
					dots: <?php echo $dots; ?>,
					nav: <?php echo $nav; ?>,
					loop: <?php echo $loop; ?>,
				<?php } else { ?>
					loop: false,
					dots: false,
					nav: false,
					touchDrag: false,
				<?php } ?>
				responsive : {
					0 : {
						items:<?php echo $items_responsive; ?>,
						slideBy: <?php echo $items_responsive; ?>,
					},
					767 : {
						items:<?php echo $items_medium; ?>,
						slideBy: <?php echo $items_medium; ?>,
					},
					1024 : {
						items:<?php echo $items; ?>,
						slideBy: <?php echo $items; ?>,
					}
				}
			});

			$(window).on("load scroll resize", function(){
				if (owl.visible(true)) {
					owl.trigger('play.owl.autoplay')
				} else {
					owl.trigger('stop.owl.autoplay')
				}
			});
		<?php } ?>
	});
})(jQuery);