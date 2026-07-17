<?php
$output = '<div class="carousel carousel-main">';
    $items = $settings->items;
    if ($items) {
        foreach ($items as $item) {
            $output .= '<div class="carousel-cell">';
                $output .= '<div class="carousel-heading">'.$item->item_heading.'</div>';
                $output .= '<div class="carousel-content">'.$item->item_content.'</div>';
            $output .= '</div>';
        }
    }

$output .= '</div>';
echo $output;
?>