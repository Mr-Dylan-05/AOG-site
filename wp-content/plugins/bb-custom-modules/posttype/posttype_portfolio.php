<?php
if ( ! function_exists('portfolio_init') ) {
	/*Custom Post Type Setting*/
	add_action( 'init', 'portfolio_init', 1 );
	function portfolio_init() {
		$labels = array(
			'name'               => 'Portfolios',
			'singular_name'      => 'Portfolio Page',
			'menu_name'          => 'Portfolios',
			'name_admin_bar'     => 'Portfolios',
			'add_new'            => 'Add New Portfolio',
			'add_new_item'       => 'Add New Portfolio',
			'new_item'           => 'New Portfolio Page',
			'edit_item'          => 'Edit Portfolio',
			'view_item'          => 'View Portfolio',
			'all_items'          => 'All Portfolios',
			'search_items'       => 'Search Portfolios',
			'parent_item_colon'  => 'Parent Portfolio:',
			'not_found'          => 'No Portfolio found.',
			'not_found_in_trash' => 'No Portfolio found in Trash.',
		);
		$args = array(
			'menu_icon' 		 => BB_CUSTOM_MODULES_URL . 'assets/icons/ic_folder.svg',
			'labels'             => $labels,
			'public'             => true,
			'publicly_queryable' => true,
			'show_ui'            => true,
			'show_in_menu'       => true,
			'query_var'          => true,
			'capability_type'    => 'post',
			'has_archive'        => true, /*false - no page slug conflic*/
			'rewrite'            => array('slug' => 'all-portfolios'),
			'hierarchical'       => true,
			'taxonomies'         => array('portfolio_category'),
			'menu_position'      => 21,
			'supports'           => array( 'title', 'editor', 'thumbnail'),
		);
		register_post_type( 'portfolio', $args );
	}
	/*Custom Post Type Category and Tags*/
	add_action( 'init', 'portfolio_category_init', 1 );
	function portfolio_category_init() {
		$labels = array(
			'name'              => _x( 'Portfolio Categories', 'taxonomy general name' ),
			'singular_name'     => _x( 'Portfolio Category', 'taxonomy singular name' ),
			'search_items'      => __( 'Search Portfolio Categories' ),
			'all_items'         => __( 'All Portfolio Categories' ),
			'parent_item'       => __( 'Parent Portfolio Category' ),
			'parent_item_colon' => __( 'Parent Portfolio Category:' ),
			'edit_item'         => __( 'Edit Portfolio Category' ),
			'update_item'       => __( 'Update Portfolio Category' ),
			'add_new_item'      => __( 'Add New Portfolio Category' ),
			'new_item_name'     => __( 'New Portfolio Category Name' ),
			'menu_name'         => __( 'Portfolio Categories' ),
		);
		$args = array(
			'hierarchical'      => true,
			'labels'            => $labels,
			'show_ui'           => true,
			'show_admin_column' => true,
			'query_var'         => true,
			'rewrite'           => array( 'slug' => 'portfolio_category' ),
		);
		register_taxonomy( 'portfolio_category', array( 'portfolio' ), $args );
		
		$labels = array(
			'name'              => _x( 'Portfolio Tags', 'taxonomy general name' ),
			'singular_name'     => _x( 'Portfolio Tag', 'taxonomy singular name' ),
			'search_items'      => __( 'Search Portfolio Tags' ),
			'all_items'         => __( 'All Portfolio Tags' ),
			'parent_item'       => __( 'Parent Portfolio Tag' ),
			'parent_item_colon' => __( 'Parent Portfolio Tag:' ),
			'edit_item'         => __( 'Edit Portfolio Tag' ),
			'update_item'       => __( 'Update Portfolio Tag' ),
			'add_new_item'      => __( 'Add New Portfolio Tag' ),
			'new_item_name'     => __( 'New Portfolio Tag Name' ),
			'menu_name'         => __( 'Portfolio Tags' ),
		);
		$args = array(
			'hierarchical'      => true,
			'labels'            => $labels,
			'show_ui'           => true,
			'show_admin_column' => true,
			'query_var'         => true,
			'rewrite'           => array( 'slug' => 'portfolio_tag' ),
		);
		register_taxonomy( 'portfolio_tag', array( 'portfolio' ), $args );
	}
	if ( !is_admin()) {
		/*Add to Sitename Menu Bar*/
		add_action('admin_bar_menu', 'menu_bar_portfolio', 1000);
		function menu_bar_portfolio() {
			global $wp_admin_bar;
			$website = esc_url( home_url() );
			$menu_site_name = 'site-name';
			$wp_admin_bar->add_menu(array('parent' => $menu_site_name, 'id' => 'all-portfolio', 'title' => 'Portfolios', 'href' => $website.'/wp-admin/edit.php?post_type=portfolio', 'meta'  => array( 'class' => 'menu-bar-portfolio' ),));
		}
	}
}
?>