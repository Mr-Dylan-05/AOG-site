<?php

// Defines
define( 'FL_CHILD_THEME_DIR', get_stylesheet_directory() );
define( 'FL_CHILD_THEME_URL', get_stylesheet_directory_uri() );

define( 'FL_BUILDER_MODSEC_FIX', true );

// Classes
require_once 'classes/class-fl-child-theme.php';

// Actions
add_action( 'wp_enqueue_scripts', 'FLChildTheme::enqueue_scripts', 1000 );

//Allow SVG
add_filter( 'upload_mimes', 'my_myme_types', 1, 1 );
function my_myme_types( $mime_types ) {
  $mime_types['svg'] = 'image/svg+xml';     // Adding .svg extension
  $mime_types['json'] = 'application/json'; // Adding .json extension
  
  unset( $mime_types['xls'] );  // Remove .xls extension
  unset( $mime_types['xlsx'] ); // Remove .xlsx extension
  
  return $mime_types;
}
function load_claude_assets() {


    wp_enqueue_style(
        'claude-fonts',
        get_stylesheet_directory_uri() . '/claude/assets/fonts.css'
    );


}

add_action(
    'wp_enqueue_scripts',
    'load_claude_assets'
);

function load_claude_scripts() {


    wp_enqueue_script(
        'claude-support',
        get_stylesheet_directory_uri() . '/claude/support.js',
        array(),
        null,
        true
    );


}

add_action(
    'wp_enqueue_scripts',
    'load_claude_scripts'
);
//Add ACF Options page
if( function_exists('acf_add_options_page') ) {
	
	acf_add_options_page(array(
		'page_title' 	=> 'Theme General Settings',
		'menu_title'	=> 'Theme Settings',
		'menu_slug' 	=> 'theme-general-settings',
		'capability'	=> 'edit_posts',
		'redirect'		=> false
	));
	
	acf_add_options_sub_page(array(
		'page_title' 	=> 'Theme Header Settings',
		'menu_title'	=> 'Header',
		'parent_slug'	=> 'theme-general-settings',
	));
	
	acf_add_options_sub_page(array(
		'page_title' 	=> 'Theme Footer Settings',
		'menu_title'	=> 'Footer',
		'parent_slug'	=> 'theme-general-settings',
	));
	
}

// add_action('wp_head', 'chargebee');
function chargebee() {
    if(!is_front_page() && !is_page(1592)) { ?>
    <script>console.log('working');</script>
    <script src="https://js.chargebee.com/v2/chargebee.js" data-cb-site="adongroup" data-cb-domain="https://cb.adongroup.com.au" data-cb-domain="https://adongroup.com.au" ></script>
    <?php  }
};


/**
 * Disable the emoji's
 */
function disable_emojis() {
 remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
 remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
 remove_action( 'wp_print_styles', 'print_emoji_styles' );
 remove_action( 'admin_print_styles', 'print_emoji_styles' ); 
 remove_filter( 'the_content_feed', 'wp_staticize_emoji' );
 remove_filter( 'comment_text_rss', 'wp_staticize_emoji' ); 
 remove_filter( 'wp_mail', 'wp_staticize_emoji_for_email' );
 add_filter( 'tiny_mce_plugins', 'disable_emojis_tinymce' );
 add_filter( 'wp_resource_hints', 'disable_emojis_remove_dns_prefetch', 10, 2 );
}
add_action( 'init', 'disable_emojis' );

/**
 * Filter function used to remove the tinymce emoji plugin.
 * 
 * @param array $plugins 
 * @return array Difference betwen the two arrays
 */
function disable_emojis_tinymce( $plugins ) {
 if ( is_array( $plugins ) ) {
 return array_diff( $plugins, array( 'wpemoji' ) );
 } else {
 return array();
 }
}

/**
 * Remove emoji CDN hostname from DNS prefetching hints.
 *
 * @param array $urls URLs to print for resource hints.
 * @param string $relation_type The relation type the URLs are printed for.
 * @return array Difference betwen the two arrays.
 */
function disable_emojis_remove_dns_prefetch( $urls, $relation_type ) {
 if ( 'dns-prefetch' == $relation_type ) {
 /** This filter is documented in wp-includes/formatting.php */
 $emoji_svg_url = apply_filters( 'emoji_svg_url', 'https://s.w.org/images/core/emoji/2/svg/' );

$urls = array_diff( $urls, array( $emoji_svg_url ) );
 }

return $urls;
}


//Product forms JS 
function product_forms_script(){
	$product_option_index;
	$page_title = strval(get_the_title());

	if(strpos($page_title, 'Review') != false){
		$product_option_index = 'first-child';
	}
	else if(strpos($page_title, 'SEO') != false){
		$product_option_index = 'last-child';
	}
	else if(strpos($page_title, 'Blogs') != false){
		$product_option_index = 'nth-child(6)';
	}
	else if(strpos($page_title, 'Video') != false){
		$product_option_index = 'nth-child(8)';
	}
	else if(strpos($page_title, 'Google') != false){
		$product_option_index = 'nth-child(2)';
	}
	else if(strpos($page_title, 'Websites') != false){
		$product_option_index = 'nth-child(4)';
	}
	else if(strpos($page_title, 'Brochure') != false){
		$product_option_index = 'nth-child(7)';
	}
// 	wp_enqueue_script('product-form-js', FL_CHILD_THEME_URL.'/product-form.js', array(), '', true);
// 	wp_localize_script('product-form-js', 'nth_child_post', array(
// 		'nth_child' => $product_option_index,
// 		'title' => $page_title
// 	));
} 

add_action('wp_enqueue_scripts','product_forms_script');

function report_explainer_enqueues() {
	if ( is_page_template( 'report-explainer.php' ) ) {
		wp_enqueue_script ( 'report-explainer-poi-main', get_stylesheet_directory_uri() . '/js/main.js' );
		wp_enqueue_script ( 'modernizr', get_stylesheet_directory_uri() . '/js/modernizr.js' );
		wp_enqueue_style('report-explainer', get_stylesheet_directory_uri() . '/css/report-explainer.css', array(), filemtime(get_stylesheet_directory() . '/css/report-explainer.css'), false);
	} else {
	/** Call regular enqueue */
	}
}
add_action( 'wp_enqueue_scripts', 'report_explainer_enqueues' );

require_once get_stylesheet_directory() . '/claude-loader.php';