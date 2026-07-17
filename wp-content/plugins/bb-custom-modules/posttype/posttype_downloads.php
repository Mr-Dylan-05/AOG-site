<?php
if ( ! function_exists('download_init') ) {
	/*Custom Post Type Setting*/
	add_action( 'init', 'download_init', 1 );
	function download_init() {
		$labels = array(
			'name'               => 'Downloads',
			'singular_name'      => 'Download Page',
			'menu_name'          => 'Downloads',
			'name_admin_bar'     => 'Downloads',
			'add_new'            => 'Add New Download',
			'add_new_item'       => 'Add New Download',
			'new_item'           => 'New Download Page',
			'edit_item'          => 'Edit Download',
			'view_item'          => 'View Download',
			'all_items'          => 'All Downloads',
			'search_items'       => 'Search Downloads',
			'parent_item_colon'  => 'Parent Download:',
			'not_found'          => 'No Download found.',
			'not_found_in_trash' => 'No Download found in Trash.',
		);
		$args = array(
			'menu_icon' 		 => BB_CUSTOM_MODULES_URL . 'assets/icons/ic_download.svg',
			'labels'             => $labels,
			'public'             => true,
			'publicly_queryable' => true,
			'show_ui'            => true,
			'show_in_menu'       => true,
			'query_var'          => true,
			'capability_type'    => 'post',
			'has_archive'        => true, /*false - no page slug conflic*/
			'rewrite'            => array('slug' => 'all-downloads'),
			'hierarchical'       => true,
			'taxonomies'         => array('download_category'),
			'menu_position'      => 21,
			'supports'           => array( 'title', 'editor', 'excerpt', 'thumbnail'),
		);
		register_post_type( 'download', $args );
	}
	/*Custom Post Type Category and Tags*/
	add_action( 'init', 'download_category_init', 1 );
	function download_category_init() {
		$labels = array(
			'name'              => _x( 'Download Categories', 'taxonomy general name' ),
			'singular_name'     => _x( 'Download Category', 'taxonomy singular name' ),
			'search_items'      => __( 'Search Download Categories' ),
			'all_items'         => __( 'All Download Categories' ),
			'parent_item'       => __( 'Parent Download Category' ),
			'parent_item_colon' => __( 'Parent Download Category:' ),
			'edit_item'         => __( 'Edit Download Category' ),
			'update_item'       => __( 'Update Download Category' ),
			'add_new_item'      => __( 'Add New Download Category' ),
			'new_item_name'     => __( 'New Download Category Name' ),
			'menu_name'         => __( 'Download Categories' ),
		);
		$args = array(
			'hierarchical'      => true,
			'labels'            => $labels,
			'show_ui'           => true,
			'show_admin_column' => true,
			'query_var'         => true,
			'rewrite'           => array( 'slug' => 'download_category' ),
		);
		register_taxonomy( 'download_category', array( 'download' ), $args );
		
		$labels = array(
			'name'              => _x( 'Download Tags', 'taxonomy general name' ),
			'singular_name'     => _x( 'Download Tag', 'taxonomy singular name' ),
			'search_items'      => __( 'Search Download Tags' ),
			'all_items'         => __( 'All Download Tags' ),
			'parent_item'       => __( 'Parent Download Tag' ),
			'parent_item_colon' => __( 'Parent Download Tag:' ),
			'edit_item'         => __( 'Edit Download Tag' ),
			'update_item'       => __( 'Update Download Tag' ),
			'add_new_item'      => __( 'Add New Download Tag' ),
			'new_item_name'     => __( 'New Download Tag Name' ),
			'menu_name'         => __( 'Download Tags' ),
		);
		$args = array(
			'hierarchical'      => true,
			'labels'            => $labels,
			'show_ui'           => true,
			'show_admin_column' => true,
			'query_var'         => true,
			'rewrite'           => array( 'slug' => 'download_tag' ),
		);
		register_taxonomy( 'download_tag', array( 'download' ), $args );
	}
	if ( !is_admin()) {
		/*Add to Sitename Menu Bar*/
		add_action('admin_bar_menu', 'menu_bar_download', 1000);
		function menu_bar_download() {
			global $wp_admin_bar;
			$website = esc_url( home_url() );
			$menu_site_name = 'site-name';
			$wp_admin_bar->add_menu(array('parent' => $menu_site_name, 'id' => 'all-download', 'title' => 'downloads', 'href' => $website.'/wp-admin/edit.php?post_type=download', 'meta'  => array( 'class' => 'menu-bar-download' ),));
		}
	}
    
    if( function_exists('acf_add_local_field_group') ) {

    acf_add_local_field_group(array(
        'key' => 'group_5c94751e31f09',
        'title' => 'Downloads option',
        'fields' => array(
            array(
                'key' => 'field_5c94753a0f9ad',
                'label' => 'File name',
                'name' => 'file_name',
                'type' => 'text',
                'instructions' => '',
                'required' => 0,
                'conditional_logic' => 0,
                'wrapper' => array(
                    'width' => '',
                    'class' => '',
                    'id' => '',
                ),
                'default_value' => '',
                'placeholder' => '',
                'prepend' => '',
                'append' => '',
                'maxlength' => '',
            ),
            array(
                'key' => 'field_5c9476540f9af',
                'label' => 'File Type',
                'name' => 'file_type',
                'type' => 'select',
                'instructions' => '',
                'required' => 0,
                'conditional_logic' => 0,
                'wrapper' => array(
                    'width' => '',
                    'class' => '',
                    'id' => '',
                ),
                'choices' => array(
                    'pdf' => 'PDF',
                    'image' => 'Image',
                    'doc' => 'Word Document',
                    'excel' => 'Excel Document',
                    'presentation' => 'Presentation',
                    'text' => 'Text Document',
                    'misc' => 'Other',
                ),
                'default_value' => array(
                ),
                'allow_null' => 0,
                'multiple' => 0,
                'ui' => 0,
                'return_format' => 'value',
                'ajax' => 0,
                'placeholder' => '',
            ),
            array(
                'key' => 'field_5c9475590f9ae',
                'label' => 'File',
                'name' => 'file',
                'type' => 'file',
                'instructions' => '',
                'required' => 0,
                'conditional_logic' => 0,
                'wrapper' => array(
                    'width' => '',
                    'class' => '',
                    'id' => '',
                ),
                'return_format' => 'array',
                'library' => 'all',
                'min_size' => '',
                'max_size' => '',
                'mime_types' => '',
            ),
        ),
        'location' => array(
            array(
                array(
                    'param' => 'post_type',
                    'operator' => '==',
                    'value' => 'download',
                ),
            ),
        ),
        'menu_order' => 0,
        'position' => 'acf_after_title',
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