<?php 	
if ( ! empty( $settings->color ) ) {
	$color = ( $settings->color <> '' ) ? $settings->color : 'dark';
	$colorclass = ' '.$color;
}

$output = '<div id="dl-articles" class="">';

	$output .= '<div class="dl-articles-items">';
		/*setting*/
		$query_args = array(
			'post_type' => $settings->posttype,
			'posts_per_page' => $settings->totalpost,
			'orderby' => $settings->post_orderby,
			'order' => $settings->post_order,
		);
        /*loop*/
		$query = new WP_Query($query_args);
		while ($query->have_posts()) : $query->the_post();

			$output .= '<article class="dl-title">';
			$output .= '<h3>'.get_the_title().'</h3>';
            $output .= '<div class="row">';
            if( get_field('file') <> '' ) {

                    $file_name = get_field('file_name');
                    $file_type = get_field('file_type');
                    $file = get_field('file');

                    if( $file ){
                        $output .=  '<div class="dl-wrapper">';
                            $output .=  '<a href="'.$file['url'].'" title="View '.$file_name.'" target="_blank">';
                                $output .= '<i class="fa fa-download" aria-hidden="true"></i>';
                                $output .=  '<div class="dl-title-content">';
                                    $output .= '<span class="dl-file-name">'.($file_name ? $file_name : $file["title"]).'</span>';
                                    $output .= '<span class="filetype">Filetype: <strong>'.$file_type.'</strong></span>';
                                    $output .= '<span class="dl-date">'.get_the_date().'</span>';
                                $output .=  '</div>';
                            $output .=  '</a>';
                        $output .=  '</div>';
                    } else {
                        $output .= '<div class="dl-wrapper"><div class="no-download"><i class="fa fa-times-circle" aria-hidden="true"></i><span>No Downloadable file available.</span></div></div>';
                    }
                
            } else {
                $output .= '<div class="dl-wrapper"><div class="no-download"><i class="fa fa-times-circle" aria-hidden="true"></i><span>No files to Download.</span></div></div>';
            }

            $output .= '</div>';
			$output .= '</article>';
			
		endwhile; wp_reset_query();
        /*end loop*/
	$output .= '</div>';
$output .= '</div>';


echo $output;
?>