<?php

/**
 * @class sliderTestimonialModule
 */
class sliderTestimonialModule extends FLBuilderModule {

	/** 
	 * @method __construct
	 */  
	public function __construct()
	{
		global $customcategory;
		parent::__construct(array(
			'name'          	=> __('Slider Testimonials', 'fl-builder'),
			'description'   	=> __('Display Slideshow of Testimonials.', 'fl-builder'),
			'category'      	=> __($customcategory, 'fl-builder'),
			'partial_refresh'	=> true
		));
		// Register and enqueue your own.
		$this->add_css( 'flickity-style', BB_CUSTOM_MODULES_URL . 'assets/flickity/flickity.min.css' );
		$this->add_js( 'flickity', BB_CUSTOM_MODULES_URL . 'assets/flickity/flickity.pkgd.min.js', array(), '', true );
	}
	/**
	 * @method get_classname
	 */
	public function get_classname()
	{
		$classname = 'slider-testimonials';
		return $classname;
	}
    
    public function hexToRGB($hex)
	{
        $split = str_split($hex, 2);
        $r = hexdec($split[0]);
        $g = hexdec($split[1]);
        $b = hexdec($split[2]);
        $rgba = 'rgba('.$r.','.$g.','.$b.',0.6)';
		return $rgba;
	}
}

// Get Categories
$taxonomy     = 'testimonial_category';
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
FLBuilder::register_module('sliderTestimonialModule', array(
	'Content'         => array(
		'title'         => __('Content', 'fl-builder'),
		'sections'      => array(
			'general'       => array(
				'title'         => '',
				'fields'        => array(
					'categories'         => array(
						'type'          => 'select',
						'label'         => __('Categories', 'fl-builder'),
						'default'       => '',
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
						'options'       => $posttypeCategories,
						'multi-select'  => true
					),
					'totalpost'         => array(
						'type'          => 'unit',
						'label'         => __('Total Item', 'fl-builder'),
						'default'       => __('9', 'fl-builder'),
						'placeholder'       => __('9', 'fl-builder'),
						'maxlength'     => '2',
						'size'          => '1',
					),
					'order'         => array(
						'type'          => 'select',
						'label'         => __('Order Sorting', 'fl-builder'),
						'default'       => 'ASC',
						'options'       => array(
							'DESC'    		=> __('DESCENDING', 'fl-builder'),
							'ASC'    		=> __('ASCENDING', 'fl-builder'),
						)
					),
					'orderby'         => array(
						'type'          => 'select',
						'label'         => __('Order By', 'fl-builder'),
						'default'       => 'date',
						'options'       => array(
							'none'    		=> __('none', 'fl-builder'),
							'ID'    		=> __('ID', 'fl-builder'),
							'title'    		=> __('title', 'fl-builder'),
							'name'    		=> __('name', 'fl-builder'),
							'date'    		=> __('date', 'fl-builder'),
							'modified'    	=> __('modified', 'fl-builder'),
							'rand'    		=> __('rand', 'fl-builder'),
							'menu_order'    		=> __('menu_order', 'fl-builder'),
							''    		=> __('', 'fl-builder'),
						)
					)
				)
			),
            'gallery_settings'       => array(
				'title'         => 'Gallery Settings',
				'fields'        => array(
                    'main_slider_height'        => array(
						'type'          => 'select',
						'label'         => __('Main Slider Height', 'fl-builder'),
						'default'       => 'fullHeight',
						'options'       => array(
						    'defaultHeight'       => __('Default Height', 'fl-builder'),
							'fullHeight'       => __('Full Height', 'fl-builder'),
							'customHeight'     => __('Custom Height', 'fl-builder'),
						),
						'toggle'        => array(
							'customHeight'        => array(
								'fields'        => array('custom_height', 'nav_slider_height')
							),
						),
					),
					'show_gal_nav'      => array(
					    'type'          => 'select',
					    'label'         => __('Show Nav', 'fl-builder'),
					    'default'       => 'false',
					    'options'       => array(
					        'true'     => __('Show', 'fl-builder'),
				            'false'      => __('Hide','fl-builder'),
			            ),
			            'toggle'        => array(
			                'true'      => array(
		                        'fields'        => array( 'nav_slider_column' ),
		                    ),    
		                ),
				    ),
                    'custom_height'        => array(
						'type'          => 'unit',
						'label'         => __('Custom Height', 'fl-builder'),
						'placeholder'       => '400',
						'description'       => 'px',
					),
                    'nav_slider_height'        => array(
						'type'          => 'unit',
						'label'         => __('Custom Navigation Slider height', 'fl-builder'),
						'placeholder'       => '400',
						'description'       => 'px',
					),
                    'testimonial_column'        => array(
						'type'          => 'select',
						'label'         => __('Testimonial Columns', 'fl-builder'),
						'default'       => '1',
						'options'       => array(
							'1'         => __('1 Column', 'fl-builder'),
							'2'         => __('2 Columns', 'fl-builder'),
							'3'         => __('3 Columns', 'fl-builder'),
							'4'         => __('4 Columns', 'fl-builder'),
							'5'         => __('5 Columns', 'fl-builder'),
							'6'         => __('6 Columns', 'fl-builder'),
						),
						'toggle'        => array(
						    '1'         => array(
						        'fields'    => array('column_gutter_width', 'first_color'),    
					        ),
					        '2'         => array(
						        'fields'    => array('column_gutter_width', 'first_color', 'second_color'),    
					        ),
					        '3'         => array(
						        'fields'    => array('column_gutter_width', 'first_color', 'second_color', 'third_color'),    
					        ),
					        '4'         => array(
						        'fields'    => array('column_gutter_width', 'first_color', 'second_color', 'third_color', 'fourth_color'),    
					        ),
					        '5'         => array(
						        'fields'    => array('column_gutter_width', 'first_color', 'second_color', 'third_color', 'fourth_color', 'five_color'),    
					        ),
					        '6'         => array(
						        'fields'    => array('column_gutter_width', 'first_color', 'second_color', 'third_color', 'fourth_color', 'five_color', 'six_color'),    
					        ),
					    ),
					),
                    'column_gutter_width'   => array(
						'type'          => 'unit',
						'label'         => __('Gutter Width', 'fl-builder'),
						'placeholder'       => '20',
						'description'       => 'px',
					),
                    'nav_slider_column'        => array(
						'type'          => 'select',
						'label'         => __('Navigation Slider Columns', 'fl-builder'),
						'default'       => '3',
						'options'       => array(
							'2'         => __('2 Columns', 'fl-builder'),
							'3'         => __('3 Columns', 'fl-builder'),
							'4'         => __('4 Columns', 'fl-builder'),
							'5'         => __('5 Columns', 'fl-builder'),
							'6'         => __('6 Columns', 'fl-builder'),
						),
					)
				)
			),
            'layout_settings'       => array(
				'title'         => 'Layout',
				'fields'        => array(
                    'avatar_show'        => array(
						'type'          => 'select',
						'label'         => __('Show Avatar?', 'fl-builder'),
						'default'       => 'true',
						'options'       => array(
							'true'         => __('Yes', 'fl-builder'),
							'false'        => __('No', 'fl-builder')
						),
                        'toggle'        => array(
							'true'        => array(
								'fields'        => array('avatar_position', 'avatar_shape')
							),
						)
					),
					'avatar_shape'      => array(
					    'type'       => 'border',
                    	'label'      => __('Avatar Border', 'fl-builder'),
                    	'responsive' => true,
                    	'preview'    => array(
                    		'type'     => 'css',
                    		'selector' => '{node} .slider-testimonials .testimonial-avatar',
                    	),
				    ),
                    'avatar_position'        => array(
						'type'          => 'select',
						'label'         => __('Avatar Position', 'fl-builder'),
						'default'       => 'top',
						'options'       => array(
							'top'         => __('Top', 'fl-builder'),
							'bottom'      => __('Bottom', 'fl-builder')
						)
					),
                    'rating_show'        => array(
						'type'          => 'select',
						'label'         => __('Show Ratings?', 'fl-builder'),
						'default'       => 'true',
						'options'       => array(
							'true'         => __('Yes', 'fl-builder'),
							'false'        => __('No', 'fl-builder')
						)
					)
                )
            )
		)
	),
	'style'        => array(
		'title'         => __('Styles', 'fl-builder'),
		'sections'      => array(
			'general'       => array(
				'title'         => '',
				'fields'        => array(
					'first_color'        => array(
						 'type'          => 'color',
                        'label'         => __( 'First Item Color', 'fl-builder' ),
                        'show_reset'    => true,
					),
                    'second_color'        => array(
						 'type'          => 'color',
                        'label'         => __( 'Second Item Color', 'fl-builder' ),
                        'show_reset'    => true,
					),
					'third_color'        => array(
						 'type'          => 'color',
                        'label'         => __( 'Third Item Color', 'fl-builder' ),
                        'show_reset'    => true,
					),
					'fourth_color'        => array(
						 'type'          => 'color',
                        'label'         => __( 'Fourth Item Color', 'fl-builder' ),
                        'show_reset'    => true,
					),
					'five_color'        => array(
						 'type'          => 'color',
                        'label'         => __( 'Five Item Color', 'fl-builder' ),
                        'show_reset'    => true,
					),
					'six_color'        => array(
						 'type'          => 'color',
                        'label'         => __( 'Six Item Color', 'fl-builder' ),
                        'show_reset'    => true,
					),
				)
			)
		)
	),
	'setting'        => array(
		'title'         => __('Settings', 'fl-builder'),
		'sections'      => array(
			'general'       => array(
				'title'         => '',
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
								'fields'        => array('autoplay_speed')
							),
						),
					),
                    'autoplay_speed'        => array(
						'type'          => 'unit',
						'label'         => __('Autoplay Speed', 'fl-builder'),
						'placeholder'       => '1500',
						'description'       => 'Millisecond',
					),
					'attraction'        => array(
						'type'          => 'unit',
						'label'         => __('Attraction', 'fl-builder'),
						'placeholder'       => '1',
						'description'       => '%',
                        'help'              => 'Set attraction and friction higher for faster transitions between slides (bouncy effect) and set attraction and friction lower for smoother and slower transitions',
                        'slider' => array(
                            'min'  	=> 1,
                            'max'  	=> 100,
                            'step' 	=> 1,
                        )
					),
                    'friction'        => array(
						'type'          => 'unit',
						'label'         => __('Friction', 'fl-builder'),
						'placeholder'       => '1',
						'description'       => '%',
                        'help'              => 'Set attraction and friction higher for faster transitions between slides (bouncy effect) and set attraction and friction lower for smoother and slower transitions',
                        'slider' => array(
                            'min'  	=> 1,
                            'max'  	=> 100,
                            'step' 	=> 1,
                        )
					)
				)
			)
		)
	),
	'typography'        => array(
		'title'         => __('Typography', 'fl-builder'),
		'sections'      => array(
            'general'       => array(
				'title'         => __('', 'fl-builder'),
				'fields'        => array(
                    'rating_color'        => array(
						'type'          => 'color',
						'label'         => __('Color', 'fl-builder'),
						'default'       => '',
						'show_reset'       => true,
						'preview'		=> array(
							'type'		=> 'css',
							'selector'		=> '.rating',
							'property'      => 'color',
						),
					)
				)
			),
			'name'       => array(
				'title'         => __('Name', 'fl-builder'),
				'fields'        => array(
                    'name_color'        => array(
						'type'          => 'color',
						'label'         => __('Color', 'fl-builder'),
						'default'       => '',
						'show_reset'       => true,
						'preview'		=> array(
							'type'		=> 'css',
							'selector'		=> '.author',
							'property'      => 'color',
						),
					),
					'name_typography'        => array(
						'type'       => 'typography',
                    	'label'      => 'Typography',
                    	'responsive' => true,
                    	'preview'    => array(
                    		'type'	    => 'css',
                    		'selector'  => '{node} .author',
                    	),
					)
				)
			),
			'content'       => array(
				'title'         => __('Content', 'fl-builder'),
				'fields'        => array(
                    'content_color'        => array(
						'type'          => 'color',
						'label'         => __('Color', 'fl-builder'),
						'default'       => '',
						'show_reset'       => true,
						'preview'		=> array(
							'type'		=> 'css',
							'selector'		=> '.message',
							'property'      => 'color',
						),
					),
					'content_typography'        => array(
						'type'       => 'typography',
                    	'label'      => 'Typography',
                    	'responsive' => true,
                    	'preview'    => array(
                    		'type'	    => 'css',
                    		'selector'  => '{node} .message',
                    	),
					)
				)
			)
		)
	)
));