<?php
if ( ! function_exists('audio_init') ) {
	/*Custom Post Type Setting*/
	add_action( 'init', 'audio_init', 1 );
	function audio_init() {
		$labels = array(
			'name'               => 'Audio',
			'singular_name'      => 'Audio Page',
			'menu_name'          => 'Audio',
			'name_admin_bar'     => 'Audio',
			'add_new'            => 'Add New Audio',
			'add_new_item'       => 'Add New Audio',
			'new_item'           => 'New Audio Page',
			'edit_item'          => 'Edit Audio',
			'view_item'          => 'View Audio',
			'all_items'          => 'All Audio',
			'search_items'       => 'Search Audio',
			'parent_item_colon'  => 'Parent Audio:',
			'not_found'          => 'No Audio found.',
			'not_found_in_trash' => 'No Audio found in Trash.',
		);
		$args = array(
			'menu_icon' 		 => BB_CUSTOM_MODULES_URL . 'assets/icons/ic_play.svg',
			'labels'             => $labels,
			'public'             => true,
			'publicly_queryable' => true,
			'show_ui'            => true,
			'show_in_menu'       => true,
			'query_var'          => true,
			'capability_type'    => 'post',
			'has_archive'        => true, /*false - no page slug conflic*/
			'rewrite'            => array('slug' => 'all-audio'),
			'hierarchical'       => true,
			'taxonomies'         => array('audio_category'),
			'menu_position'      => 21,
			'supports'           => array( 'title', 'editor', 'excerpt', 'thumbnail'),
		);
		register_post_type( 'audio', $args );
	}
	/*Custom Post Type Category and Tags*/
	add_action( 'init', 'audio_category_init', 1 );
	function audio_category_init() {
		$labels = array(
			'name'              => _x( 'Audio Categories', 'taxonomy general name' ),
			'singular_name'     => _x( 'Audio Category', 'taxonomy singular name' ),
			'search_items'      => __( 'Search Audio Categories' ),
			'all_items'         => __( 'All Audio Categories' ),
			'parent_item'       => __( 'Parent Audio Category' ),
			'parent_item_colon' => __( 'Parent Audio Category:' ),
			'edit_item'         => __( 'Edit Audio Category' ),
			'update_item'       => __( 'Update Audio Category' ),
			'add_new_item'      => __( 'Add New Audio Category' ),
			'new_item_name'     => __( 'New Audio Category Name' ),
			'menu_name'         => __( 'Audio Categories' ),
		);
		$args = array(
			'hierarchical'      => true,
			'labels'            => $labels,
			'show_ui'           => true,
			'show_admin_column' => true,
			'query_var'         => true,
			'rewrite'           => array( 'slug' => 'audio_category' ),
		);
		register_taxonomy( 'audio_category', array( 'audio' ), $args );
		
		$labels = array(
			'name'              => _x( 'Audio Tags', 'taxonomy general name' ),
			'singular_name'     => _x( 'Audio Tag', 'taxonomy singular name' ),
			'search_items'      => __( 'Search Audio Tags' ),
			'all_items'         => __( 'All Audio Tags' ),
			'parent_item'       => __( 'Parent Audio Tag' ),
			'parent_item_colon' => __( 'Parent Audio Tag:' ),
			'edit_item'         => __( 'Edit Audio Tag' ),
			'update_item'       => __( 'Update Audio Tag' ),
			'add_new_item'      => __( 'Add New Audio Tag' ),
			'new_item_name'     => __( 'New Audio Tag Name' ),
			'menu_name'         => __( 'Audio Tags' ),
		);
		$args = array(
			'hierarchical'      => true,
			'labels'            => $labels,
			'show_ui'           => true,
			'show_admin_column' => true,
			'query_var'         => true,
			'rewrite'           => array( 'slug' => 'audio_tag' ),
		);
		register_taxonomy( 'audio_tag', array( 'audio' ), $args );
	}
	if ( !is_admin()) {
		/*Add to Sitename Menu Bar*/
		add_action('admin_bar_menu', 'menu_bar_audio', 1000);
		function menu_bar_audio() {
			global $wp_admin_bar;
			$website = esc_url( home_url() );
			$menu_site_name = 'site-name';
			$wp_admin_bar->add_menu(array('parent' => $menu_site_name, 'id' => 'all-audio', 'title' => 'audio', 'href' => $website.'/wp-admin/edit.php?post_type=audio', 'meta'  => array( 'class' => 'menu-bar-audio' ),));
		}
	}
    
    if( function_exists('acf_add_local_field_group') ) {

        acf_add_local_field_group(array(
            'key' => 'group_5ce63262daf7b',
            'title' => 'Audio options',
            'fields' => array(
                array(
                    'key' => 'field_5ce6326cc16da',
                    'label' => 'Audio FIle',
                    'name' => 'audio_file',
                    'type' => 'file',
                    'instructions' => '',
                    'required' => 0,
                    'conditional_logic' => 0,
                    'wrapper' => array(
                        'width' => '',
                        'class' => '',
                        'id' => '',
                    ),
                    'return_format' => 'url',
                    'library' => 'all',
                    'min_size' => '',
                    'max_size' => '',
                    'mime_types' => 'wav, ogg, mp3, aac',
                ),
            ),
            'location' => array(
                array(
                    array(
                        'param' => 'post_type',
                        'operator' => '==',
                        'value' => 'audio',
                    ),
                ),
            ),
            'menu_order' => 0,
            'position' => 'normal',
            'style' => 'default',
            'label_placement' => 'top',
            'instruction_placement' => 'label',
            'hide_on_screen' => '',
            'active' => true,
            'description' => '',
        ));

    }
}
?>