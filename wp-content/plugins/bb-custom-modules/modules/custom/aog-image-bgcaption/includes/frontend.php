<?php
$imageURL = $settings->photo_img_src;
if ( $settings->select_align == 'right' ) {
    $imageALign = ' right';
} else {
    $imageALign = ' left';
}

$output = '<div class="'.$module->get_classname().$imageALign.'">';

    $output .= '<div class="image-wrapper">';
        $output .= '<img class="photo-img" src="'.$imageURL.'" />';
    $output .= '</div>';

    $output .= '<div class="caption-column">';
        $output .= '<div class="caption">';
            if ( $settings->label1 <> '' || $settings->label2 <> '' ) {
                $output .= '<span class="label1">'.$settings->label1.' </span>';
                $output .= '<span class="label2">'.$settings->label2.'</span>';
            }
            if ( $settings->btn_url <> '' && $settings->btn_label <> '' ) {
                $output .= '<div class="btn-wrapper">';
                    $output .= '<a href="'.$settings->btn_url.'" target="'.$settings->btn_url_target.'"'.$module->get_rel_link().' class="btn btn-outline">';
                        if ($settings->icon_type == 'icon' && $settings->icon <> '') {
                            $output .= '<i class="aog-icon '.$settings->icon.'"></i>';
                        }
                        $imageURL = $settings->image_src;
                        if ($settings->icon_type == 'image' && $imageURL <> '') {
                            $output .= '<img class="img-icon" src="'.$imageURL.'" />';
                        }
                        $output .= '<span class="btn-label">'.$settings->btn_label.' </span>';
                    $output .= '</a>';
                $output .= '</div>';
            }
        $output .= '</div>';
    $output .= '</div>';

$output .= '</div>';

echo $output;
?>