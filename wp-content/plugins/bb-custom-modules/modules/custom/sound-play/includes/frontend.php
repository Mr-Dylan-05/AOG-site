<?php
$ic_play = $module->url . 'images/play-icon.svg';
$ic_pause = $module->url . 'images/pause-icon.svg';

/*setting*/
$post_type = 'audio';
$posts_per_page = ($settings->totalpost <> '') ? $settings->totalpost : '-1';
$orderby = $settings->post_orderby;
$order = $settings->post_order;
$terms = $settings->selected_categories;
if ( $settings->categories != 'selected' || $settings->selected_categories == '' ) {
	$query_args = array(
		'post_type' => $post_type,
		'posts_per_page' => $posts_per_page,
		'orderby' => $orderby,
		'order' => $order,
	);
} else {
	$query_args = array(
		'post_type' => $post_type,
		'posts_per_page' => $posts_per_page,
		'orderby' => $orderby,
		'order' => $order,
		'tax_query' => array( 
			array( 
				'taxonomy' => $post_type.'_category', //or tag or custom taxonomy
				'field' => 'slug', 
				'terms' => $terms,
			) 
		)
	);
}

/*loop*/
$query = new WP_Query($query_args);
while ($query->have_posts()) : $query->the_post();

    $heading = get_the_title();
    $audio_file = get_field('audio_file');
    $postID = get_the_ID();

    $output = '<div class="audio-post">';
        $output .= '<a class="audioControl play">';
            $output .= '<img src="'.$ic_play.'" data-pause="'.$ic_pause.'" data-play="'.$ic_play.'" />';
        $output .= '</a>';
        $output .= '<audio id="audioFile-'.$postID.'" class="audio-file" loop data-ID="'.$postID.'">';
            $output .= '<source src="'.$audio_file.'" type="audio/mpeg" />';
        $output .= '</audio>';
        $output .= '<h4 class="audio-heading">'.$heading.'</h4>';
    $output .= '</div>';
    
    echo $output;
endwhile; wp_reset_query();
/*end loop*/


?>

