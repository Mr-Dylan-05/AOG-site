<?php
$output = '<div class="'.$module->get_classname().'">';
    $output .= '<div class="carousel carousel-main">';

        for ( $i = 0; $i < count( $settings->items ); $i++ ) :
            if ( empty( $settings->items[ $i ] ) ) {
                continue;
            }

            $output .= '<div class="carousel-cell slide-'.$i.'">';
                $output .= '<div class="slide">';
                    $output .= '<div class="slide-column">';
                        
                        if ($settings->items[$i]->slide_prefix <> '') {
                            $output .= '<'.$settings->prefix_tag.' class="slide-prefix">'.$settings->items[$i]->slide_prefix.'</'.$settings->prefix_tag.'>';
                        }

                        if ($settings->items[$i]->slide_title <> '') {
                            $output .= '<'.$settings->title_tag.' class="slide-title">'.$settings->items[$i]->slide_title.'</'.$settings->title_tag.'>';
                        }

                        if ($settings->items[$i]->slide_content <> '') {
                            $output .= '<div class="slide-content">'.$settings->items[$i]->slide_content.'</div>';
                        }

                        $output .= '<div class="slide-btns">';
                            if ($settings->items[$i]->slide_btn1_link <> '') {
                                $output .= '<a href="'.$settings->items[$i]->slide_btn1_link.'" target="'.$settings->items[$i]->slide_btn1_link_target.'"'.$module->get_rel_btn1($i).' class="btn btn-default slide-btn btn1">'.$settings->items[$i]->slide_btn1_text.'</a>';
                            }

                            if ($settings->items[$i]->slide_btn2_link <> '') {
                                $output .= '<a href="'.$settings->items[$i]->slide_btn2_link.'" target="'.$settings->items[$i]->slide_btn2_link_target.'"'.$module->get_rel_btn2($i).' class="btn btn-secondary slide-btn btn2">'.$settings->items[$i]->slide_btn2_text.'</a>';
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