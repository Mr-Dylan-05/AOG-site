<?php
$output = '<div class="'.$module->get_classname().'">';
	if ( $settings->style == " one-row") {
		$output .= '<div class="testimonial-slides-nav flickity-slides-nav">';
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
			while ($query->have_posts()) : $query->the_post();
				$backgroundNav = $backgroundImage = '';
				if( class_exists('acf') ) {
					$backgroundImage = get_field('background');
					if ( !empty($backgroundImage) ) {
						$backgroundThumb = $backgroundImage['sizes'][ 'large' ];
						$backgroundNav = ' <div class="bg" style=" background-image: url('.$backgroundThumb.');"></div>';
					} else if ( !empty($settings->background_image) ) {
						$backgroundNav = ' <div class="bg" style=" background-image: url('.$settings->background_image_src.');"></div>';
					}
				}
				$output .= '<div class="author-info">'.$backgroundNav; 
				$output .= '<div class="author-content">'; 
					$testimonialAvatar = wp_get_attachment_image_src( get_post_thumbnail_id( $query->ID ), 'testimonial-avatar-nav' );
					$testimonialAvatarSRC = $testimonialAvatar[0] <> '' ? $testimonialAvatar[0] : $module->url.'images/default.svg';
					if( ! empty($testimonialAvatarSRC) ) {
						$output .= '<figure class="avatar"><img src="'.$testimonialAvatarSRC.'" alt="'.get_the_title().'"></figure>'; 
					}
					$ratings = ''; 
					$star = '<i class="fas fa-star" aria-hidden="true"></i>';
					$star_haft = '<i class="fas fa-star-half-o" aria-hidden="true"></i>';
					$star_o = '<i class="fas fa-star-o" aria-hidden="true"></i>';
					if( class_exists('acf') ) {
						if( $settings->date_show == 'true' && get_field('date') ) { 
							$date = '';
							$date = get_field('date', false, false);
							$date = new DateTime($date);
							$date_text = ', '.$date->format('F Y'); 
						}
						$output .= '<h3 class="author">'.get_the_title().$date_text.'</h3>'; 
						if( $settings->rating_show == 'true' && get_field('rating') ) { 
							if ( get_field('rating') == '1' ) 	$ratings = $star.$star_o.$star_o.$star_o.$star_o;
							if ( get_field('rating') == '1.5' ) $ratings = $star.$star_haft.$star_o.$star_o.$star_o;
							if ( get_field('rating') == '2' ) 	$ratings = $star.$star.$star_o.$star_o.$star_o;
							if ( get_field('rating') == '2.5' ) $ratings = $star.$star.$star_haft.$star_o.$star_o;
							if ( get_field('rating') == '3' ) 	$ratings = $star.$star.$star.$star_o.$star_o;
							if ( get_field('rating') == '3.5' ) $ratings = $star.$star.$star.$star_haft.$star_o;
							if ( get_field('rating') == '4' ) 	$ratings = $star.$star.$star.$star.$star_o;
							if ( get_field('rating') == '4.5' ) $ratings = $star.$star.$star.$star.$star_haft;
							if ( get_field('rating') == '5' ) 	$ratings = $star.$star.$star.$star.$star;
							$output .= '<div class="rating">'.$ratings.'</div>'; 
						}
						if( $settings->company_show == 'true' && get_field('company') ) { 
							$output .= '<div class="company">Company: '.get_field('company').'</div>'; 
						}
					}
				$output .= '</div>'; 
				$output .= '</div>'; 
			endwhile; wp_reset_query();
		$output .= '</div>';
		$output .= '<div class="testimonial-slides flickity-slides">';
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
			while ($query->have_posts()) : $query->the_post();
				$output .= '<div class="testimonial-post">'; 
					$output .=  '<blockquote>'; 
						$output .=  '<div class="message'.$settings->message_quote.$settings->message_font_style.'">'.get_the_content().'</div>'; 
					$output .=  '</blockquote>'; 
				$output .=  '</div>'; 
			endwhile; wp_reset_query();
		$output .= '</div>';
	} else if ( $settings->style == " center-sync") {
		$output .= '<div class="testimonial-slides-nav flickity-slides-nav">';
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
			while ($query->have_posts()) : $query->the_post();
				$testimonialAvatar = wp_get_attachment_image_src( get_post_thumbnail_id( $query->ID ), 'testimonial-avatar-nav' );
				$testimonialAvatarSRC = $testimonialAvatar[0] <> '' ? $testimonialAvatar[0] : $module->url.'images/default.svg';
				if( ! empty($testimonialAvatarSRC) ) {
					$output .= '<figure class="avatar"><img src="'.$testimonialAvatarSRC.'" alt="'.get_the_title().'"></figure>'; 
				}
			endwhile; wp_reset_query();
		$output .= '</div>';
		$output .= '<div class="testimonial-slides flickity-slides">';
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
			while ($query->have_posts()) : $query->the_post();
				$output .= '<div class="testimonial-post">'; 
					$output .=  '<blockquote>'; 
						$output .=  '<div class="message'.$settings->message_quote.$settings->message_font_style.'">'.get_the_content().'</div>'; 
						$ratings = ''; 
						$star = '<i class="fas fa-star" aria-hidden="true"></i>';
						$star_haft = '<i class="fas fa-star-half-o" aria-hidden="true"></i>';
						$star_o = '<i class="fas fa-star-o" aria-hidden="true"></i>';
						if( class_exists('acf') ) {
							if( $settings->company_show == 'true' && get_field('company') ) { 
								$company_text = ', '.get_field('company'); 
							}
							if( $settings->date_show == 'true' && get_field('date') ) { 
								$date = '';
								$date = get_field('date', false, false);
								$date = new DateTime($date);
								$date_text = ', '.$date->format('F Y'); 
							}
							$output .= '<h6 class="author">'.get_the_title().$company_text.$date_text.'</h6>'; 
							if( $settings->rating_show == 'true' && get_field('rating') ) { 
								if ( get_field('rating') == '1' ) 	$ratings = $star.$star_o.$star_o.$star_o.$star_o;
								if ( get_field('rating') == '1.5' ) $ratings = $star.$star_haft.$star_o.$star_o.$star_o;
								if ( get_field('rating') == '2' ) 	$ratings = $star.$star.$star_o.$star_o.$star_o;
								if ( get_field('rating') == '2.5' ) $ratings = $star.$star.$star_haft.$star_o.$star_o;
								if ( get_field('rating') == '3' ) 	$ratings = $star.$star.$star.$star_o.$star_o;
								if ( get_field('rating') == '3.5' ) $ratings = $star.$star.$star.$star_haft.$star_o;
								if ( get_field('rating') == '4' ) 	$ratings = $star.$star.$star.$star.$star_o;
								if ( get_field('rating') == '4.5' ) $ratings = $star.$star.$star.$star.$star_haft;
								if ( get_field('rating') == '5' ) 	$ratings = $star.$star.$star.$star.$star;
								$output .= '<h6 class="rating">'.$ratings.'</h6>'; 
							}
						}
					$output .=  '</blockquote>'; 
				$output .=  '</div>'; 
			endwhile; wp_reset_query();
		$output .= '</div>';
	} else {
		$output .= '<div class="testimonial-slides owl-carousel">';
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
			while ($query->have_posts()) : $query->the_post();
				$testimonialAvatar = '';
				$testimonialAvatar = wp_get_attachment_image_src( get_post_thumbnail_id( $query->ID ), 'testimonial-avatar' );
				$testimonialAvatarSRC = $testimonialAvatar[0] <> '' ? $testimonialAvatar[0] : $module->url.'images/default.svg';
				$avatar = '<figure class="avatar"><img src="'.$testimonialAvatarSRC.'" alt="'.get_the_title().'"></figure>'; 
				if ( $settings->avatar_position == "top" && $settings->style <> " bordered" || $settings->style == " bordered-right-author") {
					$avatar_top = $avatar;
				} else {
					$avatar_bottom = $avatar;
				}
				$output .= '<div class="testimonial-post">'; 
					$output .=  '<blockquote>'; 
						$output .=  '<div class="message'.$settings->message_quote.$settings->message_font_style.'">'.get_the_content().'</div>';
						if ( $settings->avatar_show == "true") {
						    $output .=  $avatar_top;
						}
						$output .=  '<div class="desc">'; 
							$ratings = ''; 
							$star = '<i class="fas fa-star" aria-hidden="true"></i>';
							$star_haft = '<i class="fas fa-star-half-o" aria-hidden="true"></i>';
							$star_o = '<i class="fas fa-star-o" aria-hidden="true"></i>';
							if( class_exists('acf') ) {
							    if( $settings->rating_show == 'true' && get_field('rating') ) {
									if ( get_field('rating') == '1' ) 	$ratings = $star.$star_o.$star_o.$star_o.$star_o;
									if ( get_field('rating') == '1.5' ) $ratings = $star.$star_haft.$star_o.$star_o.$star_o;
									if ( get_field('rating') == '2' ) 	$ratings = $star.$star.$star_o.$star_o.$star_o;
									if ( get_field('rating') == '2.5' ) $ratings = $star.$star.$star_haft.$star_o.$star_o;
									if ( get_field('rating') == '3' ) 	$ratings = $star.$star.$star.$star_o.$star_o;
									if ( get_field('rating') == '3.5' ) $ratings = $star.$star.$star.$star_haft.$star_o;
									if ( get_field('rating') == '4' ) 	$ratings = $star.$star.$star.$star.$star_o;
									if ( get_field('rating') == '4.5' ) $ratings = $star.$star.$star.$star.$star_haft;
									if ( get_field('rating') == '5' ) 	$ratings = $star.$star.$star.$star.$star;
									$output .= '<h6 class="rating">'.$ratings.'</h6>'; 
								}
							}
							$output .= '<h4 class="author">'.get_the_title().'</h4>'; 
							if( class_exists('acf') ) {
								if( $settings->company_show == 'true' && get_field('company') ) { 
									$output .= '<span class="company">'.get_field('company').'</span>'; 
								}
								if( $settings->date_show == 'true' && get_field('date') ) { 
									$date = '';
									$date = get_field('date', false, false);
									$date = new DateTime($date);
									$output .= '<span class="date">'.$date->format('F Y').'</span>'; 
								}
							}
						$output .=  '</div>';
						if ( $settings->avatar_show == "true") {
						    $output .=  $avatar_bottom;
						}
					$output .=  '</blockquote>'; 
				$output .=  '</div>'; 
			endwhile; wp_reset_query();
		$output .= '</div>';
	}
$output .= '</div>';


echo $output;
?>