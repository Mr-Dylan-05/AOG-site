<?php

function load_claude_page($file) {

    $file_path = get_stylesheet_directory() . '/claude/' . $file;

    if (!file_exists($file_path)) {
        return '<p>Claude page not found: ' . esc_html($file) . '</p>';
    }


    $html = file_get_contents($file_path);


    /*
    Remove document wrappers
    */

    $html = preg_replace('/<!DOCTYPE.*?>/is', '', $html);

    $html = preg_replace('/<html.*?>/is', '', $html);

    $html = preg_replace('/<\/html>/is', '', $html);


    /*
    Remove head section
    */

    $html = preg_replace('/<head.*?>.*?<\/head>/is', '', $html);


    /*
    Remove body tags
    */

    $html = preg_replace('/<body.*?>/is', '', $html);

    $html = preg_replace('/<\/body>/is', '', $html);



/*
Fix asset paths
*/

$asset_url = get_stylesheet_directory_uri() . '/claude/assets/';


/*
Relative assets:
assets/file.png
*/

$html = str_replace(
    'src="assets/',
    'src="' . $asset_url,
    $html
);


$html = str_replace(
    'href="assets/',
    'href="' . $asset_url,
    $html
);


/*
Root assets:
/assets/file.png
*/

$html = str_replace(
    'src="/assets/',
    'src="' . $asset_url,
    $html
);


$html = str_replace(
    'href="/assets/',
    'href="' . $asset_url,
    $html
);


    /*
    Fix support.js
    */

    $html = str_replace(
        'src="/support.js"',
        'src="' . get_stylesheet_directory_uri() . '/claude/support.js"',
        $html
    );


    return $html;

}