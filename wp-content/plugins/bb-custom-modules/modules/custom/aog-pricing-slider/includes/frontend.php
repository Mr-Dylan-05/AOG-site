<?php
$output = '<div class="'.$module->get_classname().'">';
    $output .= '<div class="carousel carousel-main">';

        for ( $i = 0; $i < count( $settings->items ); $i++ ) :
            if ( empty( $settings->items[ $i ] ) ) {
                continue;
            }

            $output .= '<div class="content-box-wrapper carousel-cell slide-'.$i.'">';
                $output .= '<div class="slide">';
                    
                    $output .= '<div class="slide-column">';
                        
                        if ($settings->items[$i]->aog_slide_prefix <> '') {
                            $output .= '<'.$settings->prefix_tag.' class="slide-prefix">'.$settings->items[$i]->aog_slide_prefix.'</'.$settings->prefix_tag.'>';
                        }
                        if ($settings->items[$i]->aog_slide_title <> '') {
                            $output .= '<'.$settings->title_tag.' class="slide-title">'.$settings->items[$i]->aog_slide_title.'</'.$settings->title_tag.'>';
                        }

                        $output .= '<hr>';

                        $output .= '<div class="pricing-content-wrapper">';
                            $output .= '<div class="pricing-content">';
                                
                                if ($settings->items[$i]->aog_slide_subtitle <> '') {
                                    $output .= '<'.$settings->subtitle_tag.' class="slide-subtitle">'.$settings->items[$i]->aog_slide_subtitle.'</'.$settings->subtitle_tag.'>';
                                }
                                if ($settings->items[$i]->aog_slide_price <> '') {
                                    $output .= '<'.$settings->pricing_tag.' class="slide-pricing">'.$settings->items[$i]->aog_slide_price.'</'.$settings->pricing_tag.'>';
                                }
                                if ($settings->items[$i]->price_content <> '') {
                                    $output .= '<div class="slide-content">'.$settings->items[$i]->price_content.'</div>';
                                }
                            $output .= '</div>';

                            if ( $settings->items[$i]->btn_url <> '' && $settings->items[$i]->btn_label <> '' ) {
                                $output .= '<div class="btn-wrapper">';
                                    $output .= '<a href="'.$settings->items[$i]->btn_url.'" target="'.$settings->items[$i]->btn_url_target.'"'.$module->get_rel_link($i).' class="fl-button btn btn-default">';
                                        if ($settings->items[$i]->icon_type == 'icon' && $settings->items[$i]->icon <> '') {
                                            $output .= '<i class="aog-icon '.$settings->items[$i]->icon.'"></i>';
                                        }
                                        $imageURL = $settings->items[$i]->image_src;
                                        if ($settings->items[$i]->icon_type == 'image' && $imageURL <> '') {
                                            $output .= '<img class="img-icon" src="'.$imageURL.'" />';
                                        }
                                        $output .= '<span class="btn-label">'.$settings->items[$i]->btn_label.' </span>';
                                    $output .= '</a>';
                                $output .= '</div>';
                            }
                        $output .= '</div>';

                    $output .= '</div>';
                    
                $output .=  '</div>';
            $output .=  '</div>';

        endfor;

    $output .= '</div>';
$output .= '</div>';

echo $output;
?>