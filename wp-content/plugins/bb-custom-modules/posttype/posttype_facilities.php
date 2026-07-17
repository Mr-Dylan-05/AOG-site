<?php
if ( ! function_exists('facility_init') ) {
	/*Custom Post Type Setting*/
	add_action( 'init', 'facility_init', 1 );
	function facility_init() {
		$labels = array(
			'name'               => 'Facilities',
			'singular_name'      => 'Facility Page',
			'menu_name'          => 'Facilities',
			'name_admin_bar'     => 'Facilities',
			'add_new'            => 'Add New Facility',
			'add_new_item'       => 'Add New Facility',
			'new_item'           => 'New Facility Page',
			'edit_item'          => 'Edit Facility',
			'view_item'          => 'View Facility',
			'all_items'          => 'All Facilities',
			'search_items'       => 'Search Facilities',
			'parent_item_colon'  => 'Parent Facility:',
			'not_found'          => 'No Facility found.',
			'not_found_in_trash' => 'No Facility found in Trash.',
		);
		$args = array(
			'menu_icon' 		 => 'dashicons-clipboard',
			'labels'             => $labels,
			'public'             => true,
			'publicly_queryable' => true,
			'show_ui'            => true,
			'show_in_menu'       => true,
			'query_var'          => true,
			'capability_type'    => 'post',
			'has_archive'        => true, /*false - no page slug conflic*/
			'rewrite'            => array('slug' => 'all-facilities'),
			'hierarchical'       => true,
			'taxonomies'         => array('facility_category'),
			'menu_position'      => 21,
			'supports'           => array( 'title', 'editor', 'excerpt', 'thumbnail'),
		);
		register_post_type( 'facility', $args );
	}
	/*Custom Post Type Category and Tags*/
	add_action( 'init', 'facility_category_init', 1 );
	function facility_category_init() {
		$labels = array(
			'name'              => _x( 'Facility Categories', 'taxonomy general name' ),
			'singular_name'     => _x( 'Facility Category', 'taxonomy singular name' ),
			'search_items'      => __( 'Search Facility Categories' ),
			'all_items'         => __( 'All Facility Categories' ),
			'parent_item'       => __( 'Parent Facility Category' ),
			'parent_item_colon' => __( 'Parent Facility Category:' ),
			'edit_item'         => __( 'Edit Facility Category' ),
			'update_item'       => __( 'Update Facility Category' ),
			'add_new_item'      => __( 'Add New Facility Category' ),
			'new_item_name'     => __( 'New Facility Category Name' ),
			'menu_name'         => __( 'Facility Categories' ),
		);
		$args = array(
			'hierarchical'      => true,
			'labels'            => $labels,
			'show_ui'           => true,
			'show_admin_column' => true,
			'query_var'         => true,
			'rewrite'           => array( 'slug' => 'facility_category' ),
		);
		register_taxonomy( 'facility_category', array( 'facility' ), $args );
		
		$labels = array(
			'name'              => _x( 'Facility Tags', 'taxonomy general name' ),
			'singular_name'     => _x( 'Facility Tag', 'taxonomy singular name' ),
			'search_items'      => __( 'Search Facility Tags' ),
			'all_items'         => __( 'All Facility Tags' ),
			'parent_item'       => __( 'Parent Facility Tag' ),
			'parent_item_colon' => __( 'Parent Facility Tag:' ),
			'edit_item'         => __( 'Edit Facility Tag' ),
			'update_item'       => __( 'Update Facility Tag' ),
			'add_new_item'      => __( 'Add New Facility Tag' ),
			'new_item_name'     => __( 'New Facility Tag Name' ),
			'menu_name'         => __( 'Facility Tags' ),
		);
		$args = array(
			'hierarchical'      => true,
			'labels'            => $labels,
			'show_ui'           => true,
			'show_admin_column' => true,
			'query_var'         => true,
			'rewrite'           => array( 'slug' => 'facility_tag' ),
		);
		register_taxonomy( 'facility_tag', array( 'facility' ), $args );
	}
	if ( !is_admin()) {
		/*Add to Sitename Menu Bar*/
		add_action('admin_bar_menu', 'menu_bar_facility', 1000);
		function menu_bar_facility() {
			global $wp_admin_bar;
			$website = esc_url( home_url() );
			$menu_site_name = 'site-name';
			$wp_admin_bar->add_menu(array('parent' => $menu_site_name, 'id' => 'all-facility', 'title' => 'Facilities', 'href' => $website.'/wp-admin/edit.php?post_type=facility', 'meta'  => array( 'class' => 'menu-bar-facility' ),));
		}
	}
}
?>