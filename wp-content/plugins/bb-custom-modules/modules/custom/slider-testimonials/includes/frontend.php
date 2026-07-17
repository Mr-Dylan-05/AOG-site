<?php
$output = '<div class="'.$module->get_classname().'">';
    $output .= '<div class="carousel carousel-main">';

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
        $testimonialAvatar = wp_get_attachment_image_src( get_post_thumbnail_id( $query->ID ), 'full' );
        $testimonialAvatarSRC = $testimonialAvatar[0] <> '' ? $testimonialAvatar[0] : $module->url.'images/default.svg';
        $avatar = '<div class="testimonial-avatar"><img class="gallery-image'.$testimonialAvatarClass.'" src="'.$testimonialAvatarSRC.'" /></div>'; 
        if ( $settings->avatar_position == "top" ) {
            $avatar_top = $avatar;
        } else {
            $avatar_bottom = $avatar;
        }
        $output .= '<div class="carousel-cell">';
            $output .= '<div class="testimonial-post">';
                $output .=  '<div class="quote-icon"><i class="fas fa-quote-left"></i></div>';
                if ( $settings->avatar_show == "true" ) {
                    $output .=  $avatar_top;
                }
                $output .=  '<div class="message">'.get_the_content().'</div>';
                $output .=  '<div class="desc">'; 
                    $ratings = ''; 
                    $star = '<i class="fas fa-star" aria-hidden="true"></i>';
                    $star_haft = '<i class="fas fa-star-half-o" aria-hidden="true"></i>';
                    $star_o = '<i class="fas fa-star-o" aria-hidden="true"></i>';
                    if( class_exists('acf') ) {
                        if( $settings->rating_show == 'true' && get_field('rating') ) {
                            if ( get_field('rating') == '1' ) 	$ratings = $star.$star_o.$star_o.$star_o.$star_o;
                            if ( get_field('rating') == '2' ) 	$ratings = $star.$star.$star_o.$star_o.$star_o;
                            if ( get_field('rating') == '3' ) 	$ratings = $star.$star.$star.$star_o.$star_o;
                            if ( get_field('rating') == '4' ) 	$ratings = $star.$star.$star.$star.$star_o;
                            if ( get_field('rating') == '5' ) 	$ratings = $star.$star.$star.$star.$star;
                            $output .= '<div class="rating">'.$ratings.'</div>'; 
                        }
                    }
                $output .=  '</div>';
                if ( $settings->avatar_show == "true") {
                    $output .=  $avatar_bottom;
                }
            $output .=  '</div>';
            $output .= '<div class="testimonial-footer">'; 
                $output .= '<h4 class="author">'.get_the_title().'</h4>'; 
                if( class_exists('acf') ) {
                    if( $settings->company_show == 'true' && get_field('company') ) { 
                        $output .= '<h6 class="company">'.get_field('company').'</h6>'; 
                    }
                    if( $settings->date_show == 'true' && get_field('date') ) { 
                        $date = '';
                        $date = get_field('date', false, false);
                        $date = new DateTime($date);
                        $output .= '<h6 class="date">'.$date->format('F Y').'</h6>'; 
                    }
                }
            $output .=  '</div>';
        $output .=  '</div>';

        endwhile; wp_reset_query();

    $output .= '</div>';

    if ($settings->show_gal_nav == 'true') {
        $output .= '<div class="carousel carousel-nav">';

            $query = new WP_Query($query_args);
            while ($query->have_posts()) : $query->the_post();

            $testimonialAvatar = '';
            $testimonialAvatar = wp_get_attachment_image_src( get_post_thumbnail_id( $query->ID ), 'full' );
            $testimonialAvatarSRC = $testimonialAvatar[0] <> '' ? $testimonialAvatar[0] : $module->url.'images/default.svg';
            $testimonialAvatarClass = '';
            if ( empty($testimonialAvatar[0]) ) {
                $testimonialAvatarClass = ' no-image';
            }

            $output .= '<div class="carousel-cell">';
                $output .= '<div class="avatar">';
                    $output .= '<img class="gallery-image-nav'.$testimonialAvatarClass.'" src="'.$testimonialAvatarSRC.'" />';
                $output .= '</div>';
            $output .= '</div>';

            endwhile; wp_reset_query();
        $output .= '</div>';
    }
$output .= '</div>';

echo $output;
?>