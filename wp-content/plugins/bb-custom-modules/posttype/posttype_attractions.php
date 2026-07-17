<?php
if ( ! function_exists('attraction_init') ) {
	/*Custom Post Type Setting*/
	add_action( 'init', 'attraction_init', 1 );
	function attraction_init() {
		$labels = array(
			'name'               => 'Attraction',
			'singular_name'      => 'Attraction Page',
			'menu_name'          => 'Attraction',
			'name_admin_bar'     => 'Attraction',
			'add_new'            => 'Add New Attraction',
			'add_new_item'       => 'Add New Attraction',
			'new_item'           => 'New Attraction Page',
			'edit_item'          => 'Edit Attraction',
			'view_item'          => 'View Attraction',
			'all_items'          => 'All Attraction',
			'search_items'       => 'Search Attraction',
			'parent_item_colon'  => 'Parent Attraction:',
			'not_found'          => 'No Attraction found.',
			'not_found_in_trash' => 'No Attraction found in Trash.',
		);
		$args = array(
			'menu_icon' 		 => 'dashicons-images-alt',
			'labels'             => $labels,
			'public'             => true,
			'publicly_queryable' => true,
			'show_ui'            => true,
			'show_in_menu'       => true,
			'query_var'          => true,
			'capability_type'    => 'post',
			'has_archive'        => true, /*false - no page slug conflic*/
			'rewrite'            => array('slug' => 'all-attractions'),
			'hierarchical'       => true,
			'taxonomies'         => array('attraction_category'),
			'menu_position'      => 21,
			'supports'           => array( 'title', 'editor', 'excerpt', 'thumbnail'),
		);
		register_post_type( 'attraction', $args );
	}
	/*Custom Post Type Category and Tags*/
	add_action( 'init', 'attraction_category_init', 1 );
	function attraction_category_init() {
		$labels = array(
			'name'              => _x( 'Attraction Categories', 'taxonomy general name' ),
			'singular_name'     => _x( 'Attraction Category', 'taxonomy singular name' ),
			'search_items'      => __( 'Search Attraction Categories' ),
			'all_items'         => __( 'All Attraction Categories' ),
			'parent_item'       => __( 'Parent Attraction Category' ),
			'parent_item_colon' => __( 'Parent Attraction Category:' ),
			'edit_item'         => __( 'Edit Attraction Category' ),
			'update_item'       => __( 'Update Attraction Category' ),
			'add_new_item'      => __( 'Add New Attraction Category' ),
			'new_item_name'     => __( 'New Attraction Category Name' ),
			'menu_name'         => __( 'Attraction Categories' ),
		);
		$args = array(
			'hierarchical'      => true,
			'labels'            => $labels,
			'show_ui'           => true,
			'show_admin_column' => true,
			'query_var'         => true,
			'rewrite'           => array( 'slug' => 'attraction_category' ),
		);
		register_taxonomy( 'attraction_category', array( 'attraction' ), $args );
		
		$labels = array(
			'name'              => _x( 'Attraction Tags', 'taxonomy general name' ),
			'singular_name'     => _x( 'Attraction Tag', 'taxonomy singular name' ),
			'search_items'      => __( 'Search Attraction Tags' ),
			'all_items'         => __( 'All Attraction Tags' ),
			'parent_item'       => __( 'Parent Attraction Tag' ),
			'parent_item_colon' => __( 'Parent Attraction Tag:' ),
			'edit_item'         => __( 'Edit Attraction Tag' ),
			'update_item'       => __( 'Update Attraction Tag' ),
			'add_new_item'      => __( 'Add New Attraction Tag' ),
			'new_item_name'     => __( 'New Attraction Tag Name' ),
			'menu_name'         => __( 'Attraction Tags' ),
		);
		$args = array(
			'hierarchical'      => true,
			'labels'            => $labels,
			'show_ui'           => true,
			'show_admin_column' => true,
			'query_var'         => true,
			'rewrite'           => array( 'slug' => 'attraction_tag' ),
		);
		register_taxonomy( 'attraction_tag', array( 'attraction' ), $args );
	}
	if ( !is_admin()) {
		/*Add to Sitename Menu Bar*/
		add_action('admin_bar_menu', 'menu_bar_attraction', 1000);
		function menu_bar_attraction() {
			global $wp_admin_bar;
			$website = esc_url( home_url() );
			$menu_site_name = 'site-name';
			$wp_admin_bar->add_menu(array('parent' => $menu_site_name, 'id' => 'all-attraction', 'title' => 'Attraction', 'href' => $website.'/wp-admin/edit.php?post_type=attraction', 'meta'  => array( 'class' => 'menu-bar-attraction' ),));
		}
	}
}
?>