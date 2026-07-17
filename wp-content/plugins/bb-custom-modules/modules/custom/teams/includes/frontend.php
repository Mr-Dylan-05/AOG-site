<?php
$output = '<div class="'.$module->get_classname().'">';
	$output .= '<div class="teams-member '.$settings->column.'">';
		
//		if($settings->featured_only === 'y'){
//			$query_args = array(
//				'post_type' => $settings->posttype,
//				'posts_per_page' => $settings->totalpost,
//				'order' => $settings->order,
//				'orderby' => 'menu_order',
//				'tax_query' => array(
//					array(
//						'taxonomy' => 'team_category',
//						'field' => 'slug',
//						'terms' => 'featured'
//					)
//				)			
//			);
//		}else{
//			$query_args = array(
//				'post_type' => $settings->posttype,
//				'posts_per_page' => $settings->totalpost,
//				'order' => $settings->order,
//				'orderby' => 'menu_order',		
//			);
//		}

        if ( $settings->categories != 'selected' || $settings->selected_categories == '' ) {
            $query_args = array(
                'post_type' => 'team',
                'posts_per_page' => $settings->totalpost,
                'orderby' => 'menu_order',
                'order' => $settings->order,
            );
        } else {
            $query_args = array(
                'post_type' => 'team',
                'posts_per_page' => $settings->totalpost,
                'orderby' => 'menu_order',
                'order' => $settings->order,
                'tax_query' => array( 
                    array( 
                        'taxonomy' => 'team_category', //or tag or custom taxonomy
                        'field' => 'slug', 
                        'terms' => $settings->selected_categories
                    ) 
                )
            );
        }
		
		$query = new WP_Query($query_args);
		while ($query->have_posts()) : $query->the_post();
			$output .= '<div class="teams-profile">';
				$photo = wp_get_attachment_image_src( get_post_thumbnail_id( $query->ID ), $settings->image_size );
				$photoURL = $photo[0] ? $photo[0] : $module->url.'img/photo.jpg';
				$output .= '<div class="teams-photo" style=" background-image: url('.$photoURL.');"></div>'; 
				if( $settings->style == 'hovered-icon' ) {
					if( have_rows('social_media') ):
						$output .= '<div class="teams-social-media">';
							$output .= '<div class="teams-social-media-wrapper">';
							while ( have_rows('social_media') ) : the_row();
								if( get_sub_field('icon') ) {
									$output .= '<a href="'.get_sub_field('url').'" target="_blank" data-toggle="tooltip" data-placement="top" title="'.get_sub_field('title').'">'.get_sub_field('icon').'</a>'; 
								}
							endwhile;
							$output .= '</div>';
						$output .= '</div>';
					endif;
				}
				$output .= '<div class="teams-info">'; 
					$output .= '<div class="teams-info-wrapper">'; 
						$output .= '<div class="teams-info-inner-wrapper">'; 
							$output .= '<h5 class="teams-name">'.get_the_title().'</h5>'; 
							if( get_field('job_title') ) {
								$output .= '<h6 class="teams-job">'.get_field('job_title').'</h6>'; 
							}
							if( get_field('job_description') && $settings->display_description === 'y') {
								$output .= '<div class="teams-description">'.get_field('job_description').'</div>'; 
							}
							if( $settings->style != 'hovered-icon' ) {
								if( have_rows('social_media') ):
									$output .= '<div class="teams-social-media">';
										$output .= '<div class="teams-social-media-wrapper">';
										while ( have_rows('social_media') ) : the_row();
											if( get_sub_field('icon') ) {
												$output .= '<a href="'.get_sub_field('url').'" target="_blank" data-toggle="tooltip" data-placement="top" title="'.get_sub_field('title').'">'.get_sub_field('icon').'</a>'; 
											}
										endwhile;
										$output .= '</div>';
									$output .= '</div>';
								endif;
							}
						$output .= '</div>'; 
					$output .= '</div>'; 
				$output .= '</div>'; 
			$output .=  '</div>'; 
		endwhile; wp_reset_query();

	$output .= '</div>';
$output .= '</div>';
echo $output;
?>