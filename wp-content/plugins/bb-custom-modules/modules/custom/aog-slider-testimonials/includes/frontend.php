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
        $testimonialAvatarSRC = $testimonialAvatar[0] <> '' ? $testimonialAvatar[0] : BB_CUSTOM_MODULES_URL . 'modules/custom/aog-slider-testimonials/images/default.svg';
        $avatar = '<div class="testimonial-avatar"><img class="gallery-image'.$testimonialAvatarClass.'" src="'.$testimonialAvatarSRC.'" /></div>'; 
        if ( $settings->avatar_position == "top" ) {
            $avatar_top = $avatar;
        } else {
            $avatar_bottom = $avatar;
        }
        $output .= '<div class="carousel-cell">';
            $output .= '<div class="testimonial-post">';
                $output .= '<div class="testimonial-author equalHeight">';
                    if ( $settings->avatar_show == "true" ) {
                        $output .=  $avatar_top;
                    }
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
                    $output .=  '<div class="desc">'; 
                        $ratings = ''; 
                        $star_red    = '<svg width="25" height="23" viewBox="0 0 25 23" fill="#F44336"><path d="M12.5 0L15.3064 8.63729H24.3882L17.0409 13.9754L19.8473 22.6127L12.5 17.2746L5.15268 22.6127L7.95911 13.9754L0.611794 8.63729H9.69357L12.5 0Z" /></svg>';
                        $star_yellow = '<svg width="25" height="23" viewBox="0 0 25 23" fill="#FF9800"><path d="M12.5 0L15.3064 8.63729H24.3882L17.0409 13.9754L19.8473 22.6127L12.5 17.2746L5.15268 22.6127L7.95911 13.9754L0.611794 8.63729H9.69357L12.5 0Z" /></svg>';
                        $star_green  = '<svg width="25" height="23" viewBox="0 0 25 23" fill="#4CAF50"><path d="M12.5 0L15.3064 8.63729H24.3882L17.0409 13.9754L19.8473 22.6127L12.5 17.2746L5.15268 22.6127L7.95911 13.9754L0.611794 8.63729H9.69357L12.5 0Z" /></svg>';
                        if( class_exists('acf') ) {
                            if( $settings->rating_show == 'true' && get_field('rating') ) {
                                if ( get_field('rating') == '1' ) 	$ratings = $star_red;
                                if ( get_field('rating') == '2' ) 	$ratings = $star_red.$star_red;
                                if ( get_field('rating') == '3' ) 	$ratings = $star_red.$star_red.$star_yellow;
                                if ( get_field('rating') == '4' ) 	$ratings = $star_red.$star_red.$star_yellow.$star_green;
                                if ( get_field('rating') == '5' ) 	$ratings = $star_red.$star_red.$star_yellow.$star_green.$star_green;
                                $output .= '<div class="rating">'.$ratings.'</div>'; 
                            }
                        }
                    $output .=  '</div>';
                    if ( $settings->avatar_show == "true") {
                        $output .=  $avatar_bottom;
                    }
                $output .= '</div>';

                $output .= '<div class="testimonial-message equalHeight">';
                    $output .=  '<div class="message">';
                        $output .=  '<div class="quote-icon">';
                            $output .=  '<svg width="100" height="90" viewBox="0 0 100 90" fill="#272727">
                                <path d="M5.12803 89.1338L36.3064 89.1338C39.137 89.1338 41.4344 86.8364 41.4344 84.0058L41.4344 52.8274C41.4344 49.9967 39.137 47.6994 36.3064 47.6994L21.3838 47.6994C21.5787 39.5355 23.4761 33.0025 27.0657 28.0899C29.8964 24.2131 34.1833 21.003 39.9165 18.4697C42.5523 17.3108 43.6907 14.193 42.46 11.5878L38.7678 3.79325C37.5781 1.29088 34.6347 0.193374 32.0912 1.29088C25.3017 4.2241 19.5684 7.93679 14.8918 12.4494C9.18933 17.9569 5.28188 24.1721 3.16913 31.1052C1.05629 38.0382 1.50843e-05 47.4943 1.40353e-05 59.4939L1.18924e-05 84.0058C1.16449e-05 86.8363 2.29747 89.1338 5.12803 89.1338Z" />
                                <path d="M89.125 1.3114C82.4175 4.23437 76.7152 7.94695 72.0076 12.4495C66.254 17.9569 62.3259 24.1516 60.2132 31.0334C58.1005 37.9152 57.0442 47.402 57.0442 59.4939L57.0442 84.0058C57.0442 86.8364 59.3414 89.1338 62.1722 89.1338L93.3505 89.1338C96.1812 89.1338 98.4786 86.8364 98.4786 84.0058L98.4786 52.8274C98.4786 49.9967 96.1812 47.6994 93.3505 47.6994L78.428 47.6994C78.6229 39.5355 80.5202 33.0025 84.1099 28.0899C86.9405 24.2131 91.2275 21.003 96.9607 18.4697C99.5965 17.3108 100.735 14.193 99.5042 11.5878L95.8223 3.81377C94.6324 1.3114 91.6685 0.203651 89.125 1.3114Z" />
                                </svg>';
                        $output .=  '</div>';
                    $output .=  get_the_content();
                    $output .=  '</div>';
                $output .= '</div>';

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