<?php
$imageURL = array(
    $settings->web_img4_src, 
    $settings->web_img2_src,
    $settings->web_img1_src,
    $settings->web_img3_src,
    $settings->web_img5_src
);
$webURL = array(
    $settings->web_img4_url, 
    $settings->web_img2_url,
    $settings->web_img1_url,
    $settings->web_img3_url,
    $settings->web_img5_url
);
$webURL_target = array(
    $settings->web_img4_url_target, 
    $settings->web_img2_url_target,
    $settings->web_img1_url_target,
    $settings->web_img3_url_target,
    $settings->web_img5_url_target
);

$output = '<div class="'.$module->get_classname().'">';

    for ( $i = 0; $i < 5; $i++ ) {
        if ($imageURL[$i] <> '') {
            $output .= '<div class="web-wrapper web-'.$i.'">';
                $output .= '<a href="'.$webURL[$i].'" target="'.$webURL_target[$i].'"'.$module->get_rel_link($i).'>';
                    $output .= '<img class="web-img" src="'.$imageURL[$i].'" />';
                $output .= '</a>';
            $output .= '</div>';
        }
    }

$output .= '</div>';

echo $output;
?>