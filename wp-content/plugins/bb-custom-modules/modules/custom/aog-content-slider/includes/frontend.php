<?php
$output = '<div class="'.$module->get_classname().'">';
    $output .= '<div class="carousel carousel-main">';

        for ( $i = 0; $i < count( $settings->items ); $i++ ) :
            if ( empty( $settings->items[ $i ] ) ) {
                continue;
            }

            $output .= '<div class="content-box-wrapper carousel-cell slide-'.$i.'">';
                $output .= '<div class="slide">';
                    if ($settings->items[$i]->item_link <> '') {
                        $output .= '<a href="'.$settings->items[$i]->item_link.'" target="'.$settings->items[$i]->item_link_target.'"'.$module->get_rel_link($i).' class="slide-link">';
                    }
                        $output .= '<div class="slide-column">';
                            
                            if ($settings->items[$i]->slide_prefix <> '') {
                                $output .= '<'.$settings->prefix_tag.' class="slide-prefix">'.$settings->items[$i]->slide_prefix.'</'.$settings->prefix_tag.'>';
                            }

                            if ($settings->items[$i]->icon_type == 'icon' && $settings->items[$i]->icon <> '') {
                                $output .= '<i class="aog-icon '.$settings->items[$i]->icon.'"></i>';
                            }
                            $imageURL = $settings->items[$i]->image_src;
                            if ($settings->items[$i]->icon_type == 'image' && $imageURL <> '') {
                                $output .= '<img class="img-icon" src="'.$imageURL.'" />';
                            }

                            if ($settings->items[$i]->aog_slide_title <> '') {
                                $output .= '<'.$settings->title_tag.' class="slide-title">'.$settings->items[$i]->aog_slide_title.'</'.$settings->title_tag.'>';
                            }

                            if ($settings->items[$i]->slide_content <> '') {
                                $output .= '<div class="slide-content">'.$settings->items[$i]->slide_content.'</div>';
                            }

                        $output .= '</div>';
                    if ($settings->items[$i]->item_link <> '') {
                        $output .= '</a>';
                    }
                $output .=  '</div>';
            $output .=  '</div>';

        endfor;

    $output .= '</div>';
$output .= '</div>';

echo $output;
?>