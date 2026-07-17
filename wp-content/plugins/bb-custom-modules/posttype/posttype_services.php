<?php
if ( ! function_exists('service_init') ) {
	/*Custom Post Type Setting*/
	add_action( 'init', 'service_init', 1 );
	function service_init() {
		$labels = array(
			'name'               => 'Services',
			'singular_name'      => 'Service Page',
			'menu_name'          => 'Services',
			'name_admin_bar'     => 'Services',
			'add_new'            => 'Add New Service',
			'add_new_item'       => 'Add New Service',
			'new_item'           => 'New Service Page',
			'edit_item'          => 'Edit Service',
			'view_item'          => 'View Service',
			'all_items'          => 'All Services',
			'search_items'       => 'Search Services',
			'parent_item_colon'  => 'Parent Service:',
			'not_found'          => 'No Service found.',
			'not_found_in_trash' => 'No Service found in Trash.',
		);
		$args = array(
			'menu_icon' 		 => 'dashicons-slides',
			'labels'             => $labels,
			'public'             => true,
			'publicly_queryable' => true,
			'show_ui'            => true,
			'show_in_menu'       => true,
			'query_var'          => true,
			'capability_type'    => 'post',
			'has_archive'        => true, /*false - no page slug conflic*/
			'rewrite'            => array('slug' => 'all-services'),
			'hierarchical'       => true,
			'taxonomies'         => array('service_category'),
			'menu_position'      => 21,
			'supports'           => array( 'title', 'editor', 'excerpt', 'thumbnail'),
		);
		register_post_type( 'service', $args );
	}
	/*Custom Post Type Category and Tags*/
	add_action( 'init', 'service_category_init', 1 );
	function service_category_init() {
		$labels = array(
			'name'              => _x( 'Service Categories', 'taxonomy general name' ),
			'singular_name'     => _x( 'Service Category', 'taxonomy singular name' ),
			'search_items'      => __( 'Search Service Categories' ),
			'all_items'         => __( 'All Service Categories' ),
			'parent_item'       => __( 'Parent Service Category' ),
			'parent_item_colon' => __( 'Parent Service Category:' ),
			'edit_item'         => __( 'Edit Service Category' ),
			'update_item'       => __( 'Update Service Category' ),
			'add_new_item'      => __( 'Add New Service Category' ),
			'new_item_name'     => __( 'New Service Category Name' ),
			'menu_name'         => __( 'Service Categories' ),
		);
		$args = array(
			'hierarchical'      => true,
			'labels'            => $labels,
			'show_ui'           => true,
			'show_admin_column' => true,
			'query_var'         => true,
			'rewrite'           => array( 'slug' => 'service_category' ),
		);
		register_taxonomy( 'service_category', array( 'service' ), $args );
		
		$labels = array(
			'name'              => _x( 'Service Tags', 'taxonomy general name' ),
			'singular_name'     => _x( 'Service Tag', 'taxonomy singular name' ),
			'search_items'      => __( 'Search Service Tags' ),
			'all_items'         => __( 'All Service Tags' ),
			'parent_item'       => __( 'Parent Service Tag' ),
			'parent_item_colon' => __( 'Parent Service Tag:' ),
			'edit_item'         => __( 'Edit Service Tag' ),
			'update_item'       => __( 'Update Service Tag' ),
			'add_new_item'      => __( 'Add New Service Tag' ),
			'new_item_name'     => __( 'New Service Tag Name' ),
			'menu_name'         => __( 'Service Tags' ),
		);
		$args = array(
			'hierarchical'      => true,
			'labels'            => $labels,
			'show_ui'           => true,
			'show_admin_column' => true,
			'query_var'         => true,
			'rewrite'           => array( 'slug' => 'service_tag' ),
		);
		register_taxonomy( 'service_tag', array( 'service' ), $args );
	}
	if ( !is_admin()) {
		/*Add to Sitename Menu Bar*/
		add_action('admin_bar_menu', 'menu_bar_service', 1000);
		function menu_bar_service() {
			global $wp_admin_bar;
			$website = esc_url( home_url() );
			$menu_site_name = 'site-name';
			$wp_admin_bar->add_menu(array('parent' => $menu_site_name, 'id' => 'all-service', 'title' => 'Services', 'href' => $website.'/wp-admin/edit.php?post_type=service', 'meta'  => array( 'class' => 'menu-bar-service' ),));
		}
	}
}
?>