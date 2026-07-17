<?php
$desktop = BB_CUSTOM_MODULES_URL . 'modules/custom/devices-showcase/images/desktop.png';
$iphone = BB_CUSTOM_MODULES_URL . 'modules/custom/devices-showcase/images/iphone-6.png';
$desktop_imageURL = $settings->desktop_screen_image_src;
$phone_imageURL = $settings->phone_screen_image_src;

$output = '<div id="device" class="'.$module->get_classname().'">';
    $output .= '<a href="'.$settings->link_template.'" target="'.$settings->link_template_target.'">';
    
        $output .= '<div class="devices-label">';
            $output .= '<span>'.$settings->label.'</span>';
        $output .= '</div>';
    
        $output .= '<div class="devices-wrapper">';
            $output .= '<div class="device desktop">';
            $output .= '<div class="screen" style="background-image: url('.$desktop_imageURL.')"></div>';
                $output .= '<img src="'.$desktop.'" />';
            $output .= '</div>';
            $output .= '<div class="device phone">';
                $output .= '<div class="screen" style="background-image: url('.$phone_imageURL.')"></div>';
                $output .= '<img src="'.$iphone.'" />';
            $output .= '</div>';
        $output .= '</div>';
    $output .= '</a>';
    
$output .= '</div>';

echo $output;
?>