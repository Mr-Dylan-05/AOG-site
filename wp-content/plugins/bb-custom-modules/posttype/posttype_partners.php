<?php
if ( ! function_exists('partner_init') ) {
	/*Parnters*/
	add_image_size( 'partner-logo', 150 , 150 );
	/*Custom Post Type Setting*/
	add_action( 'init', 'partner_init', 1 );
	function partner_init() {
		$labels = array(
			'name'               => 'Partners',
			'singular_name'      => 'Partner Page',
			'menu_name'          => 'Partners',
			'name_admin_bar'     => 'Partners',
			'add_new'            => 'Add New Partner',
			'add_new_item'       => 'Add New Partner',
			'new_item'           => 'New Partner Page',
			'edit_item'          => 'Edit Partner',
			'view_item'          => 'View Partner',
			'all_items'          => 'All Partners',
			'search_items'       => 'Search Partners',
			'parent_item_colon'  => 'Parent Partner:',
			'not_found'          => 'No Partner found.',
			'not_found_in_trash' => 'No Partner found in Trash.',
		);
		$args = array(
			'menu_icon' 		 => 'dashicons-groups',
			'labels'             => $labels,
			'public'             => true,
			'publicly_queryable' => true,
			'show_ui'            => true,
			'show_in_menu'       => true,
			'query_var'          => true,
			'capability_type'    => 'post',
			'has_archive'        => true, /*false - no page slug conflic*/
			'rewrite'            => array('slug' => 'all-partners'),
			'hierarchical'       => true,
			'taxonomies'         => array('partner_category'),
			'menu_position'      => 21,
			'supports'           => array( 'title', 'editor', 'thumbnail'),
		);
		register_post_type( 'partner', $args );
	}
	/*Custom Post Type Category and Tags*/
	add_action( 'init', 'partner_category_init', 1 );
	function partner_category_init() {
		$labels = array(
			'name'              => _x( 'Partner Categories', 'taxonomy general name' ),
			'singular_name'     => _x( 'Partner Category', 'taxonomy singular name' ),
			'search_items'      => __( 'Search Partner Categories' ),
			'all_items'         => __( 'All Partner Categories' ),
			'parent_item'       => __( 'Parent Partner Category' ),
			'parent_item_colon' => __( 'Parent Partner Category:' ),
			'edit_item'         => __( 'Edit Partner Category' ),
			'update_item'       => __( 'Update Partner Category' ),
			'add_new_item'      => __( 'Add New Partner Category' ),
			'new_item_name'     => __( 'New Partner Category Name' ),
			'menu_name'         => __( 'Partner Categories' ),
		);
		$args = array(
			'hierarchical'      => true,
			'labels'            => $labels,
			'show_ui'           => true,
			'show_admin_column' => true,
			'query_var'         => true,
			'rewrite'           => array( 'slug' => 'partner_category' ),
		);
		register_taxonomy( 'partner_category', array( 'partner' ), $args );
		
		//$labels = array(
		//	'name'              => _x( 'Partner Tags', 'taxonomy general name' ),
		//	'singular_name'     => _x( 'Partner Tag', 'taxonomy singular name' ),
		//	'search_items'      => __( 'Search Partner Tags' ),
		//	'all_items'         => __( 'All Partner Tags' ),
		//	'parent_item'       => __( 'Parent Partner Tag' ),
		//	'parent_item_colon' => __( 'Parent Partner Tag:' ),
		//	'edit_item'         => __( 'Edit Partner Tag' ),
		//	'update_item'       => __( 'Update Partner Tag' ),
		//	'add_new_item'      => __( 'Add New Partner Tag' ),
		//	'new_item_name'     => __( 'New Partner Tag Name' ),
		//	'menu_name'         => __( 'Partner Tags' ),
		//);
		//$args = array(
		//	'hierarchical'      => true,
		//	'labels'            => $labels,
		//	'show_ui'           => true,
		//	'show_admin_column' => true,
		//	'query_var'         => true,
		//	'rewrite'           => array( 'slug' => 'partner_tag' ),
		//);
		//register_taxonomy( 'partner_tag', array( 'partner' ), $args );
	}
	if ( !is_admin()) {
		/*Add to Sitename Menu Bar*/
		add_action('admin_bar_menu', 'menu_bar_partner', 1000);
		function menu_bar_partner() {
			global $wp_admin_bar;
			$website = esc_url( home_url() );
			$menu_site_name = 'site-name';
			$wp_admin_bar->add_menu(array('parent' => $menu_site_name, 'id' => 'all-partner', 'title' => 'Partners', 'href' => $website.'/wp-admin/edit.php?post_type=partner', 'meta'  => array( 'class' => 'menu-bar-partner' ),));
		}
	}
	if( function_exists("register_field_group") ) {
		register_field_group(array (
			'id' => 'acf_partners',
			'title' => 'Partners',
			'fields' => array (
				array (
					'key' => 'field_posttype_partner_website_link',
					'label' => 'Website Link',
					'name' => 'website_link',
					'type' => 'text',
					'default_value' => '',
					'placeholder' => '',
					'prepend' => '',
					'append' => '',
					'formatting' => 'html',
					'maxlength' => '',
				),
			),
			'location' => array (
				array (
					array (
						'param' => 'post_type',
						'operator' => '==',
						'value' => 'partner',
						'order_no' => 0,
						'group_no' => 0,
					),
				),
			),
			'options' => array (
				'position' => 'acf_after_title', //acf_after_title, normal or side
				'layout' => 'no_box',// no_box or default
				'hide_on_screen' => array (
					//0 => 'permalink',
					//1 => 'the_content',
					//2 => 'excerpt',
					//3 => 'custom_fields',
					//4 => 'discussion',
					//5 => 'comments',
					//6 => 'revisions',
					//7 => 'slug',
					//8 => 'author',
					//9 => 'format',
					//10 => 'featured_image',
					//11 => 'categories',
					//12 => 'tags',
					//13 => 'send-trackbacks',
				),
			),
			'menu_order' => 0,
		));
	}
}
?>