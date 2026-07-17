<?php
if ( ! function_exists('testimonial_init') ) {
	/*Custom Post Type Setting*/
	add_action( 'init', 'testimonial_init', 1 );
	function testimonial_init() {
		$labels = array(
			'name'               => 'Testimonials',
			'singular_name'      => 'Testimonial Page',
			'menu_name'          => 'Testimonials',
			'name_admin_bar'     => 'Testimonials',
			'add_new'            => 'Add New Testimonial',
			'add_new_item'       => 'Add New Testimonial',
			'new_item'           => 'New Testimonial Page',
			'edit_item'          => 'Edit Testimonial',
			'view_item'          => 'View Testimonial',
			'all_items'          => 'All Testimonials',
			'search_items'       => 'Search Testimonials',
			'parent_item_colon'  => 'Parent Testimonial:',
			'not_found'          => 'No Testimonial found.',
			'not_found_in_trash' => 'No Testimonial found in Trash.',
		);
		$args = array(
			'menu_icon' 		 => BB_CUSTOM_MODULES_URL . 'assets/icons/ic_testimonial.svg',
			'labels'             => $labels,
			'public'             => true,
			'publicly_queryable' => true,
			'show_ui'            => true,
			'show_in_menu'       => true,
			'query_var'          => true,
			'capability_type'    => 'post',
			'has_archive'        => true, /*false - no page slug conflic*/
			'rewrite'            => array('slug' => 'all-testimonials'),
			'hierarchical'       => true,
			'taxonomies'         => array('testimonial_category'),
			'menu_position'      => 21,
			'supports'           => array( 'title', 'editor', 'thumbnail'),
		);
		register_post_type( 'testimonial', $args );
	}
	/*Custom Post Type Category and Tags*/
	add_action( 'init', 'testimonial_category_init', 1 );
	function testimonial_category_init() {
		$labels = array(
			'name'              => _x( 'Testimonial Categories', 'taxonomy general name' ),
			'singular_name'     => _x( 'Testimonial Category', 'taxonomy singular name' ),
			'search_items'      => __( 'Search Testimonial Categories' ),
			'all_items'         => __( 'All Testimonial Categories' ),
			'parent_item'       => __( 'Parent Testimonial Category' ),
			'parent_item_colon' => __( 'Parent Testimonial Category:' ),
			'edit_item'         => __( 'Edit Testimonial Category' ),
			'update_item'       => __( 'Update Testimonial Category' ),
			'add_new_item'      => __( 'Add New Testimonial Category' ),
			'new_item_name'     => __( 'New Testimonial Category Name' ),
			'menu_name'         => __( 'Testimonial Categories' ),
		);
		$args = array(
			'hierarchical'      => true,
			'labels'            => $labels,
			'show_ui'           => true,
			'show_admin_column' => true,
			'query_var'         => true,
			'rewrite'           => array( 'slug' => 'testimonial_category' ),
		);
		register_taxonomy( 'testimonial_category', array( 'testimonial' ), $args );
		
		//$labels = array(
		//	'name'              => _x( 'Testimonial Tags', 'taxonomy general name' ),
		//	'singular_name'     => _x( 'Testimonial Tag', 'taxonomy singular name' ),
		//	'search_items'      => __( 'Search Testimonial Tags' ),
		//	'all_items'         => __( 'All Testimonial Tags' ),
		//	'parent_item'       => __( 'Parent Testimonial Tag' ),
		//	'parent_item_colon' => __( 'Parent Testimonial Tag:' ),
		//	'edit_item'         => __( 'Edit Testimonial Tag' ),
		//	'update_item'       => __( 'Update Testimonial Tag' ),
		//	'add_new_item'      => __( 'Add New Testimonial Tag' ),
		//	'new_item_name'     => __( 'New Testimonial Tag Name' ),
		//	'menu_name'         => __( 'Testimonial Tags' ),
		//);
		//$args = array(
		//	'hierarchical'      => true,
		//	'labels'            => $labels,
		//	'show_ui'           => true,
		//	'show_admin_column' => true,
		//	'query_var'         => true,
		//	'rewrite'           => array( 'slug' => 'testimonial_tag' ),
		//);
		//register_taxonomy( 'testimonial_tag', array( 'testimonial' ), $args );
	}
	if ( !is_admin()) {
		/*Add to Sitename Menu Bar*/
		add_action('admin_bar_menu', 'menu_bar_testimonial', 1000);
		function menu_bar_testimonial() {
			global $wp_admin_bar;
			$website = esc_url( home_url() );
			$menu_site_name = 'site-name';
			$wp_admin_bar->add_menu(array('parent' => $menu_site_name, 'id' => 'all-testimonial', 'title' => 'Testimonials', 'href' => $website.'/wp-admin/edit.php?post_type=testimonial', 'meta'  => array( 'class' => 'menu-bar-testimonial' ),));
		}
	}

	if( function_exists("register_field_group") ) {
		register_field_group(array (
			'id' => 'acf_testimonials',
			'title' => 'Testimonials',
			'fields' => array (
				array (
					'key' => 'field_58919bcec964d',
					'label' => 'Company',
					'name' => 'company',
					'type' => 'text',
					'default_value' => '',
					'placeholder' => '',
					'prepend' => '',
					'append' => '',
					'formatting' => 'html',
					'maxlength' => '',
				),
				array (
					'key' => 'field_58919bcec964d_date',
					'label' => 'Date',
					'name' => 'date',
					'type' => 'date_picker',
					'date_format' => 'yymmdd',
					'display_format' => 'dd/mm/yy',
					'first_day' => 1,
				),
				array (
					'key' => 'field_58919bcec964d_rating',
					'label' => 'Rating',
					'name' => 'rating',
					'type' => 'radio',
					'choices' => array (
						1 => '★ 1 star rating',
						2 => '★★ 2 star rating',
						3 => '★★★ 3 star rating',
						4 => '★★★★ 4 star rating',
						5 => '★★★★★ 5 star rating',
					),
					'other_choice' => 0,
					'save_other_choice' => 0,
					'default_value' => '5',
					'layout' => 'vertical',
				),
				array (
					'key' => 'field_58919bcec964d_background',
					'label' => 'Background',
					'name' => 'background',
					'type' => 'image',
					'save_format' => 'object',
					'preview_size' => 'large',
					'library' => 'all',
				),
			),
			'location' => array (
				array (
					array (
						'param' => 'post_type',
						'operator' => '==',
						'value' => 'testimonial',
						'order_no' => 0,
						'group_no' => 0,
					),
				),
			),
			'options' => array (
				'position' => 'normal', //acf_after_title, normal or side
				'layout' => 'default',// no_box or default
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