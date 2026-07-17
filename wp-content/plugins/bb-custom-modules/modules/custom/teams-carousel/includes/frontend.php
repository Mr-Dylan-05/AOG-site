<?php 	
$output = '<div class="'.$module->get_classname().'">';
	$output .= '<div class="owl-carousel">';
		$post_type = 'team';
		$posts_per_page = ($settings->totalpost <> '') ? $settings->totalpost : '-1';
		$orderby = $settings->orderby;
		$order = $settings->order;
		$offset = $settings->offset;
		$terms = $settings->selected_categories;
		if ( $settings->categories != 'selected' || $settings->selected_categories == '' ) {
			$query_args = array(
				'post_type' => $post_type,
				'posts_per_page' => $posts_per_page,
				'orderby' => $orderby,
				'order' => $order,
				'offset' => $offset,
			);
		} else {
			$query_args = array(
				'post_type' => $post_type,
				'posts_per_page' => $posts_per_page,
				'orderby' => $orderby,
				'order' => $order,
				'offset' => $offset,
				'tax_query' => array( 
					array( 
						'taxonomy' => $post_type.'_category', //or tag or custom taxonomy
						'field' => 'slug', 
						'terms' => $terms,
					) 
				)
			);
		}
		/*gridder*/
		if ($settings->image_column_style == 'grid') {
			$grid = '0';
			$output .= '<div class="group">';
		}
			$query = new WP_Query($query_args);
			while ($query->have_posts()) : $query->the_post(); 
				$output .= '<div class="team">';
					$output .= '<div class="image">';
						$image = wp_get_attachment_image_src( get_post_thumbnail_id( $query->ID ), 'large' );
						$imageURL = $image[0] ? $image[0] : '';
						if( $imageURL <> '' ) {
							$output .= '<div class="image-bg" style="background-image: url('.$imageURL.'" alt="'.get_the_title().');"></div>';
						}
						$title = preg_replace('/(?<=\>)\b\w*\b|^\w*\b/', '<span>$0</span>', get_the_title());
						$output .= '<div class="caption">';
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
							$output .= '<h3 class="title">'.$title.'</h3>';
							if ( get_the_excerpt() ) {
								$output .= '<p class="excerpt">'.get_the_excerpt().'</p>';
							}
							if( get_field('job_title') ) {
								$output .= '<div class="teams-job">'.get_field('job_title').'</div>'; 
							}
						$output .= '</div>';
					$output .= '</div>';
				$output .= '</div>';
		/*gridder*/
		if ($settings->image_column_style == 'grid') {
			$grid++;
			$gridby = (( $settings->image_column <> '' ) ? $settings->image_column : '6')*2;
			if ($grid % $gridby == 0) $output .= '</div><div class="group">';
		}
			endwhile; wp_reset_query();
	$output .= '</div>';
$output .= '</div>';
echo $output;
?>