<?php
/**
 * @class teamsCarouselModule
 */
class teamsCarouselModule extends FLBuilderModule {

	/** 
	 * @method __construct
	 */  
	public function __construct()
	{
		global $customcategory;
		parent::__construct(array(
			'name'          	=> __('Teams Carousel', 'fl-builder'),
			'description'   	=> __('Teams Carousel Postype', 'fl-builder'),
			'category'      	=> __($customcategory, 'fl-builder'),
			'partial_refresh'	=> true
		));
		// Register and enqueue your own.
		$this->add_css( 'owl-carousel', BB_CUSTOM_MODULES_URL . 'assets/owlcarousel/owl.carousel.css' );
		$this->add_css( 'owl-carousel-theme', BB_CUSTOM_MODULES_URL . 'assets/owlcarousel/owl.theme.default.min.css' );
		$this->add_js( 'owl-carousel', BB_CUSTOM_MODULES_URL . 'assets/owlcarousel/owl.carousel.min.js', array(), '', true );
	}
	
	/**
	 * @method get_classname
	 */
	public function get_classname()	{
		$effect = $this->settings->image_effects ? ' '.$this->settings->image_effects : '';
		$gridsColumn = '';
		if ( $this->settings->image_column_style == 'grid' ) {
			$gridsColumn = 'column-'.$this->settings->image_column;
		}
		$classname = 'teams-carousel '.$gridsColumn.' '.$this->settings->image_alignment.' '.$effect;
		return $classname;
	}
}
// Get Categories
$taxonomy     = 'team_category';
$hide_empty   = 0;
$args = array(
	'taxonomy'     => $taxonomy,
	'hide_empty'   => $hide_empty
);
$all_categories = get_categories( $args );
$posttypeCategories = array();
foreach ($all_categories as $sub_category1) {
	if($sub_category1->category_parent == 0) {
		$posttypeCategories[$sub_category1->slug] = ucfirst($sub_category1->name);
		/*level 2*/
		$args2 = array(
				'taxonomy'     => $taxonomy,
				'child_of'     => $sub_category1->term_id,
				'parent'       => $sub_category1->term_id,
				'hide_empty'   => $hide_empty
		);
		$sub_cats2 = get_categories( $args2 );
		if($sub_cats2) {
			foreach($sub_cats2 as $sub_category2) {
				$posttypeCategories[$sub_category2->slug] = '-- '.ucfirst($sub_category2->name);

				/*level 3*/
				$args3 = array(
					'taxonomy'     => $taxonomy,
					'child_of'     => $sub_category2->term_id,
					'parent'       => $sub_category2->term_id,
					'hide_empty'   => $hide_empty
				);
				$sub_cats3 = get_categories( $args3 );
				if($sub_cats3) {
					foreach($sub_cats3 as $sub_category3) {
						$posttypeCategories[$sub_category3->slug] = '--- '.ucfirst($sub_category3->name);

						/*level 4*/
						$args4 = array(
							'taxonomy'     => $taxonomy,
							'child_of'     => $sub_category3->term_id,
							'parent'       => $sub_category3->term_id,
							'hide_empty'   => $hide_empty
						);
						$sub_cats4 = get_categories( $args4 );
						if($sub_cats4) {
							foreach($sub_cats4 as $sub_category4) {
								$posttypeCategories[$sub_category4->slug] = '---- '.ucfirst($sub_category4->name);
							}
						}
					}
				}
			} 
		}
	}       
}

/**
 * Register the module and its form settings.
 */
FLBuilder::register_module('teamsCarouselModule', array(
	'settings'         => array(
		'title'         => __('General', 'fl-builder'),
		'sections'      => array(
			'settings'       => array(
				'title'         => '',
				'fields'        => array(
					'categories'         => array(
						'type'          => 'select',
						'label'         => __('Categories', 'fl-builder'),
						'default'       => '',
						'description'       => ' Add New Post <a href="'.get_site_url().'/wp-admin/edit.php?post_type=team" target="_blank">Here</a>',
						'options'       => array(
							''    		=> __('All', 'fl-builder'),
							'selected'    		=> __('Selected', 'fl-builder'),
						),
						'toggle'        => array(
							'selected'        => array(
								'fields'        => array('selected_categories')
							),
						)
					),
					'selected_categories'         => array(
						'type'          => 'select',
						'label'         => __('Select Category', 'fl-builder'),
						'description'       => ' Add New Post Category <a href="'.get_site_url().'/wp-admin/edit-tags.php?taxonomy=team_category&post_type=team" target="_blank">Here</a>',
						'options'       => $posttypeCategories,
						'multi-select'  => true
					),
					'btn'         => array(
						'type'          => 'text',
						'label'         => __('Button Text', 'fl-builder'),
						'default'       => __('', 'fl-builder'),
						'placeholder'       => __('View Gallery', 'fl-builder'),
					),
				),
			),
			'image_setting'       => array(
				'title'         => 'Image Effect',
				'fields'        => array(
					'image_effects'         => array(
						'type'          => 'select',
						'label'         => __('Image Effects', 'fl-builder'),
						'default'       => 'zoom',
						'options'       => array(
							''    		=> __('Default', 'fl-builder'),
							'zoom'    		=> __('Zoom on hover', 'fl-builder'),
						)
					),
					'image_column'         => array(
						'type'          => 'select',
						'label'         => __('Image Column', 'fl-builder'),
						'default'       => '3',
						'options'       => array(
							'6'    		=> __('Column 6 for fullscreen', 'fl-builder'),
							'5'    		=> __('Column 5 for fullscreen', 'fl-builder'),
							'4'    		=> __('Column 4 for fullwidth', 'fl-builder'),
							'3'    		=> __('Column 3', 'fl-builder'),
							'2'    		=> __('Column 2', 'fl-builder'),
							'1'    		=> __('Column 1', 'fl-builder'),
						)
					),
					'image_column_style'         => array(
						'type'          => 'select',
						'label'         => __('Image Column Style', 'fl-builder'),
						'default'       => '',
						'options'       => array(
							''    		=> __('Carousel', 'fl-builder'),
							'grid'    		=> __('Grid', 'fl-builder'),
						)
					),
					'image_alignment'         => array(
						'type'          => 'select',
						'label'         => __('Image Alignment', 'fl-builder'),
						'default'       => 'align-left',
						'options'       => array(
							'text-left'    		=> __('Align Left', 'fl-builder'),
							'text-center'    		=> __('Align Center', 'fl-builder'),
							'text-right'    		=> __('Align Right', 'fl-builder'),
						)
					),
					'image_column_spacing'           => array(
						'type'          => 'unit',
						'label'         => __( 'Column Spacing', 'fl-builder' ),
						'default' 		=> '',
						'placeholder' 	=> '30',
						'maxlength'     => '3',
						'size'          => '4',
						'description'   => 'px',
					),
					'totalpost'         => array(
						'type'          => 'unit',
						'label'         => __('Total Item', 'fl-builder'),
						'default'       => __('', 'fl-builder'),
						'placeholder'       => __('20', 'fl-builder'),
						'maxlength'     => '3',
						'size'          => '2',
					),
					'order'         => array(
						'type'          => 'select',
						'label'         => __('Order Sorting', 'fl-builder'),
						'default'       => 'ASC',
						'options'       => array(
							'DESC'    		=> __('Descending', 'fl-builder'),
							'ASC'    		=> __('Ascending', 'fl-builder'),
						)
					),
					'orderby'         => array(
						'type'          => 'select',
						'label'         => __('Order By', 'fl-builder'),
						'default'       => 'menu_order',
						'options'       => array(
							'none'    		=> __('None', 'fl-builder'),
							'ID'    		=> __('ID', 'fl-builder'),
							'title'    		=> __('Title', 'fl-builder'),
							'name'    		=> __('Name', 'fl-builder'),
							'date'    		=> __('Date', 'fl-builder'),
							'modified'    	=> __('Modified', 'fl-builder'),
							'rand'    		=> __('Random', 'fl-builder'),
							'menu_order'    		=> __('Menu Order', 'fl-builder'),
							''    		=> __('', 'fl-builder'),
						),
					),
				),
			),
			'carousel_setting'       => array(
				'title'         => 'Carousel Setting',
				'fields'        => array(
					'autoplay'        => array(
						'type'          => 'select',
						'label'         => __('Autoplay', 'fl-builder'),
						'default'       => 'false',
						'options'       => array(
							'true'    => __('Yes', 'fl-builder'),
							'false'      => __('No', 'fl-builder'),
						),
						'toggle'        => array(
							'true'        => array(
								'fields'        => array('autoplay_delay')
							),
						),
					),
					'autoplay_delay'        => array(
						'type'          => 'unit',
						'label'         => __('Autoplay Delay', 'fl-builder'),
						'placeholder'       => '3000',
						'description'       => 'Millisecond',
					),
					'show_dots'        => array(
						'type'          => 'select',
						'label'         => __('Enable Pagination', 'fl-builder'),
						'default'       => 'true',
						'options'       => array(
							'true'   	=> __('Yes', 'fl-builder'),
							'false'     => __('No', 'fl-builder'),
						),
					),
					'show_nav'        => array(
						'type'          => 'select',
						'label'         => __('Enable Navigation', 'fl-builder'),
						'default'       => 'false',
						'options'       => array(
							'true'   	=> __('Yes', 'fl-builder'),
							'false'     => __('No', 'fl-builder'),
						),
					),
				)
			)
		)
	),
));