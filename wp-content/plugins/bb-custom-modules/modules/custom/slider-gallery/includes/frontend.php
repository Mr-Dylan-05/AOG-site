<?php
$output = '<div class="'.$module->get_classname().'">';
    $output .= '<div class="carousel carousel-main">';
        $photos = $settings->slider_gallery;
        if ($photos) {
            foreach ($photos as $photo) {
                $photo_src = wp_get_attachment_url($photo, 'full');
                $output .= '<div class="carousel-cell">';
                    $output .= '<img class="gallery-image" src="'.$photo_src.'" />';
                $output .= '</div>';
            }
        }

    $output .= '</div>';

    $output .= '<div class="carousel carousel-nav">';
        if ($photos) {
            foreach ($photos as $photo) {
                $photo_src = wp_get_attachment_url($photo, 'full');
                $output .= '<div class="carousel-cell">';
                    $output .= '<img class="gallery-image-nav" src="'.$photo_src.'" />';
                $output .= '</div>';
            }
        }
    $output .= '</div>';
$output .= '</div>';

echo $output;
?>