<?php
// $macbook = $module->url . 'images/macbook.png';
$macbook = BB_CUSTOM_MODULES_URL . 'modules/custom/aog-wistia-macbook/images/macbook.png';
$macbook_URL = $settings->macbook_screen_wistia;

$output = '<div id="device" class="'.$module->get_classname().'">';

        $output .= '<div class="devices-wrapper">';

            
            $output .= '<div class="device macbook">';
                $output .= '<div class="screen">';

                    $output .= '<div class="fl-video fl-wistia-video">';
                        $output .= '<div class="wistia-container">';
                        
                            global $wp_embed;
                            if( !empty( $settings->wistia_id ) && !$settings->autoplay && !$settings->visible_control ){
                                $output .= $wp_embed->autoembed( 'https://fast.wistia.net/embed/iframe/'. trim($settings->wistia_id) );
                            }
                            else if( !empty( $settings->wistia_id ) && $settings->autoplay && !$settings->visible_control ){
                                $output .= $wp_embed->autoembed( 'https://fast.wistia.net/embed/iframe/'. trim($settings->wistia_id) .'?&autoPlay='.$settings->autoplay );
                            }
                            else{
                                $output .= $wp_embed->autoembed( 'https://fast.wistia.net/embed/iframe/'. trim($settings->wistia_id) .'?&autoPlay='.$settings->autoplay.'&controlsVisibleOnLoad='.$settings->visible_control );
                            }
                                
                        $output .= '</div>';
                    $output .= '</div>';

                $output .= '</div>';
                $output .= '<img src="'.$macbook.'" />';
            $output .= '</div>';
            

            

        $output .= '</div>';
    
    
$output .= '</div>';

echo $output;
?>