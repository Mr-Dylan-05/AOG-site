<?php
if ( ! function_exists('video_init') ) {
	/*Custom Post Type Setting*/
	add_action( 'init', 'video_init', 1 );
	function video_init() {
		$labels = array(
			'name'               => 'Videos',
			'singular_name'      => 'Video Page',
			'menu_name'          => 'Videos',
			'name_admin_bar'     => 'Videos',
			'add_new'            => 'Add New Video',
			'add_new_item'       => 'Add New Video',
			'new_item'           => 'New Video Page',
			'edit_item'          => 'Edit Video',
			'view_item'          => 'View Video',
			'all_items'          => 'All Videos',
			'search_items'       => 'Search Videos',
			'parent_item_colon'  => 'Parent Video:',
			'not_found'          => 'No Video found.',
			'not_found_in_trash' => 'No Video found in Trash.',
		);
		$args = array(
			'menu_icon' 		 => 'dashicons-format-video',
			'labels'             => $labels,
			'public'             => true,
			'publicly_queryable' => true,
			'show_ui'            => true,
			'show_in_menu'       => true,
			'query_var'          => true,
			'capability_type'    => 'post',
			'has_archive'        => true, /*false - no page slug conflic*/
			'rewrite'            => array('slug' => 'all-videos'),
			'hierarchical'       => true,
			'taxonomies'         => array('video_category'),
			'menu_position'      => 21,
			'supports'           => array( 'title', 'editor', 'thumbnail'),
		);
		register_post_type( 'video', $args );
	}
	/*Custom Post Type Category and Tags*/
	add_action( 'init', 'video_category_init', 1 );
	function video_category_init() {
		$labels = array(
			'name'              => _x( 'Video Categories', 'taxonomy general name' ),
			'singular_name'     => _x( 'Video Category', 'taxonomy singular name' ),
			'search_items'      => __( 'Search Video Categories' ),
			'all_items'         => __( 'All Video Categories' ),
			'parent_item'       => __( 'Parent Video Category' ),
			'parent_item_colon' => __( 'Parent Video Category:' ),
			'edit_item'         => __( 'Edit Video Category' ),
			'update_item'       => __( 'Update Video Category' ),
			'add_new_item'      => __( 'Add New Video Category' ),
			'new_item_name'     => __( 'New Video Category Name' ),
			'menu_name'         => __( 'Video Categories' ),
		);
		$args = array(
			'hierarchical'      => true,
			'labels'            => $labels,
			'show_ui'           => true,
			'show_admin_column' => true,
			'query_var'         => true,
			'rewrite'           => array( 'slug' => 'video_category' ),
		);
		register_taxonomy( 'video_category', array( 'video' ), $args );
		
		$labels = array(
			'name'              => _x( 'Video Tags', 'taxonomy general name' ),
			'singular_name'     => _x( 'Video Tag', 'taxonomy singular name' ),
			'search_items'      => __( 'Search Video Tags' ),
			'all_items'         => __( 'All Video Tags' ),
			'parent_item'       => __( 'Parent Video Tag' ),
			'parent_item_colon' => __( 'Parent Video Tag:' ),
			'edit_item'         => __( 'Edit Video Tag' ),
			'update_item'       => __( 'Update Video Tag' ),
			'add_new_item'      => __( 'Add New Video Tag' ),
			'new_item_name'     => __( 'New Video Tag Name' ),
			'menu_name'         => __( 'Video Tags' ),
		);
		$args = array(
			'hierarchical'      => true,
			'labels'            => $labels,
			'show_ui'           => true,
			'show_admin_column' => true,
			'query_var'         => true,
			'rewrite'           => array( 'slug' => 'video_tag' ),
		);
		register_taxonomy( 'video_tag', array( 'video' ), $args );
	}
	if ( !is_admin()) {
		/*Add to Sitename Menu Bar*/
		add_action('admin_bar_menu', 'menu_bar_video', 1000);
		function menu_bar_video() {
			global $wp_admin_bar;
			$website = esc_url( home_url() );
			$menu_site_name = 'site-name';
			$wp_admin_bar->add_menu(array('parent' => $menu_site_name, 'id' => 'all-video', 'title' => 'Videos', 'href' => $website.'/wp-admin/edit.php?post_type=video', 'meta'  => array( 'class' => 'menu-bar-video' ),));
		}
	}

	/*ACF VIDEO FIELD*/
	if(function_exists("register_field_group"))
	{
		register_field_group(array (
			'id' => 'acf_video',
			'title' => 'Video',
			'fields' => array (
				array (
					'key' => 'field_58c12cb40a1d1',
					'label' => 'Source',
					'name' => 'source',
					'type' => 'select',
					'choices' => array (
						'online' => 'Youtube or Vimeo',
						'media' => 'Media',
					),
					'default_value' => '',
					'allow_null' => 0,
					'multiple' => 0,
				),
				array (
					'key' => 'field_58c11a19268b8',
					'label' => 'Video',
					'name' => 'video',
					'type' => 'oembed',
					'conditional_logic' => array (
						'status' => 1,
						'rules' => array (
							array (
								'field' => 'field_58c12cb40a1d1',
								'operator' => '==',
								'value' => 'online',
							),
						),
						'allorany' => 'all',
					),
					'preview_size' => 'medium_large',
					'returned_size' => 0,
					'returned_format' => 'url',
				),
				array (
					'key' => 'field_58c12d240a1d2',
					'label' => 'Video File',
					'name' => 'video_file',
					'type' => 'file',
					'conditional_logic' => array (
						'status' => 1,
						'rules' => array (
							array (
								'field' => 'field_58c12cb40a1d1',
								'operator' => '==',
								'value' => 'media',
							),
						),
						'allorany' => 'all',
					),
					'save_format' => 'url',
					'library' => 'all',
				),
			),
			'location' => array (
				array (
					array (
						'param' => 'post_type',
						'operator' => '==',
						'value' => 'video',
						'order_no' => 0,
						'group_no' => 0,
					),
				),
			),
			'options' => array (
				'position' => 'normal',
				'layout' => 'no_box',
				'hide_on_screen' => array (
				),
			),
			'menu_order' => 0,
		));
	}
}
?>