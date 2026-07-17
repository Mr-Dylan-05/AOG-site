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
            $output .= '<span class="label1">'.$settings->label1.' </span>';
            $output .= '<span class="label2">'.$settings->label2.'</span>';
        $output .= '</div>';
    $output .= '</div>';

$output .= '</div>';

echo $output;
?>