<?php
/**
 * @class testimonialsModule
 */
class testimonialsModule extends FLBuilderModule {

	/** 
	 * @method __construct
	 */  
	public function __construct()
	{
		global $customcategory;
		parent::__construct(array(
			'name'          	=> __('Testimonials', 'fl-builder'),
			'description'   	=> __('Display Testominials from Posttype.', 'fl-builder'),
			'category'      	=> __($customcategory, 'fl-builder'),
			'partial_refresh'	=> true
		));
		// Register and enqueue your own.
	}
	
	/**
	 * @method get_classname
	 */
	public function get_classname()
	{
		$classname = 'testimonials'.$this->settings->style;
		return $classname;
	}
	
	public function enqueue_scripts()
	{
		if ( $this->settings->style == " center-sync" ) {
			$this->add_css( 'flickity', $this->url . 'css/flickity.css' );
			$this->add_js( 'flickity', $this->url . 'js/flickity.pkgd.min.js', array(), '', true );
		}
		if ($this->settings->style == " one-row" ) {
			$this->add_css( 'flickity', $this->url . 'css/flickity.css' );
			$this->add_js( 'flickity', $this->url . 'js/flickity.pkgd.min.js', array(), '', true );
			$this->add_js( 'flickity-sync', $this->url . 'js/flickity.sync.js', array(), '', true );
		} else {
			$this->add_css( 'owl-carousel', BB_CUSTOM_MODULES_URL . 'assets/owlcarousel/owl.carousel.css' );
			$this->add_css( 'owl-carousel-theme', BB_CUSTOM_MODULES_URL . 'assets/owlcarousel/owl.theme.default.min.css' );
			$this->add_js( 'owl-carousel', BB_CUSTOM_MODULES_URL . 'assets/owlcarousel/owl.carousel.min.js', array(), '', true );
		}
	}
}

/*Testimonial Avatar Size*/
add_image_size( 'testimonial-avatar', 80 , 80, true );
add_image_size( 'testimonial-avatar-nav', 134 , 134, true );



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
FLBuilder::register_module('testimonialsModule', array(
	'slides'         => array(
		'title'         => __('General', 'fl-builder'),
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
						),
					),
					'items'         => array(
						'type'          => 'unit',
						'label'         => __('Number of Column', 'fl-builder'),
						'default'       => '3',
						'maxlength'     => '6',
					),
					'items_medium'         => array(
						'type'          => 'unit',
						'label'         => __('Tablet Number of Column', 'fl-builder'),
						'default'       => '1',
						'maxlength'     => '6',
					),
					'items_responsive'         => array(
						'type'          => 'unit',
						'label'         => __('Mobile Number of Column', 'fl-builder'),
						'default'       => '1',
						'maxlength'     => '6',
					),
					'margin'         => array(
						'type'          => 'unit',
						'label'         => __('Column Margin', 'fl-builder'),
						'default'       => __('10', 'fl-builder'),
						'placeholder'       => __('10', 'fl-builder'),
						'maxlength'     => '3',
					),
					'autoplay'        => array(
						'type'          => 'select',
						'label'         => __('Autoplay', 'fl-builder'),
						'default'       => 'true',
						'options'       => array(
							'true'   	=> __('Yes', 'fl-builder'),
							'false'     => __('No', 'fl-builder'),
						)
					),
					'show_dots'        => array(
						'type'          => 'select',
						'label'         => __('Enable Pagination', 'fl-builder'),
						'default'       => 'true',
						'options'       => array(
							'true'   	=> __('Yes', 'fl-builder'),
							'false'     => __('No', 'fl-builder'),
						),
						'toggle'        => array(
							'true'      => array(
								'sections'        => array( 'dots' ),
							),
						)
					),
					'show_nav'        => array(
						'type'          => 'select',
						'label'         => __('Enable Navigation', 'fl-builder'),
						'default'       => 'true',
						'options'       => array(
							'true'   	=> __('Yes', 'fl-builder'),
							'false'     => __('No', 'fl-builder'),
						),
						'toggle'        => array(
							'true'      => array(
								'sections'        => array( 'nav' ),
							),
						)
					),
				)
			)
		)
	),
	'style_setting'        => array(
		'title'         => __('Style', 'fl-builder'),
		'sections'      => array(
			'general'       => array(
				'title'         => '',
				'fields'        => array(             
					'style'        => array(
						'type'          => 'select',
						'label'         => __('Style', 'fl-builder'),
						'default'       => '',
						'options'       => array(
							' bordered-right-author'  => __('Bordered Right Author', 'fl-builder'),
							' bordered'  => __('Bordered', 'fl-builder'),
							' form-box'   => __('Form Box', 'fl-builder'),
							' one-row'  => __('One Row', 'fl-builder'),
							' center-sync'  => __('Center Sync', 'fl-builder'),
							''      => __('None', 'fl-builder'),
						),
						'toggle'        => array(
							' one-row'      => array(
								'fields'        => array( 'background_image' ),
							),
							' bordered'      => array(
								'fields'        => array( 'items', 'items_medium', 'items_responsive', 'margin', 'show_nav' ),
								'sections'        => array( 'nav' ),
							),
							' bordered-right-author'      => array(
								'fields'        => array( 'items', 'items_medium', 'items_responsive', 'margin', 'show_nav' ),
								'sections'        => array( 'nav' ),
							),
							' form-box'      => array(
								'fields'        => array( 'avatar_position',  'items', 'items_medium', 'items_responsive', 'margin', 'show_nav' ),
								'sections'        => array( 'nav' ),
							),
							' center-sync'      => array(
								'fields'        => array( 'items', 'items_medium', 'items_responsive', 'margin', 'show_nav' ),
								'sections'        => array( 'nav' ),
							),
							''      => array(
								'fields'        => array( 'avatar_position',  'items', 'items_medium', 'items_responsive', 'margin', 'show_nav' ),
								'sections'        => array( 'nav' ),
							),
						)
					),
					'background_image'        => array(
						'type'          => 'photo',
						'label'         => __('Default Profile Background', 'fl-builder'),
						'show_remove'   => true,
					),
					'avatar_position'        => array(
						'type'          => 'select',
						'label'         => __('Style', 'fl-builder'),
						'default'       => '',
						'options'       => array(
							'bottom'    => __('Bottom', 'fl-builder'),
							'top'  		=> __('Top', 'fl-builder'),
						),
					),
					'avatar_show'        => array(
						'type'          => 'select',
						'label'         => __('Show Avatar?', 'fl-builder'),
						'default'       => 'true',
						'options'       => array(
							'true'    => __('Yes', 'fl-builder'),
							'false'  		=> __('No', 'fl-builder'),
						),
					),
					'color'        => array(
						'type'          => 'color',
						'label'         => __('Color', 'fl-builder'),
						'default'       => '',
						'show_reset'       => 'true',
						'preview'		=> array(
							'type'		=> 'css',
							'selector'		=> '.testimonials *',
							'property'      => 'color',
						),
                        'connections' => array( 'color' )
					),  
					'testimonial_margin_bottom'        => array(
						'type'          => 'unit',
						'label'         => __('Margin Bottom', 'fl-builder'),
						'default'       => '',
						'description'       => 'px',
						'preview'		=> array(
							'type'		=> 'css',
							'selector'		=> '.testimonial-post',
							'property'      => 'margin-bottom',
							'unit'      => 'px',
						),
					),   
				)
			),
			'testimonial_item'       => array(
				'title'         => 'Testimonial Item Style',
				'fields'        => array(
                    'item_margin' => array(
                    	'type'        => 'dimension',
                    	'label'       => 'Margin',
                    	'units'	       => array( 'px', 'vw', '%' ),
                        'default_unit' => 'px',
                        'responsive' => true,
                    	'preview'    => array(
                    		'type'     => 'css',
                    		'selector' => '.testimonials blockquote',
                            'property'  => 'margin'
                    	),
                    ),
                    'item_padding' => array(
                    	'type'        => 'dimension',
                    	'label'       => 'Padding',
                    	'units'	       => array( 'px', 'vw', '%' ),
                        'default_unit' => 'px',
                        'responsive' => true,
                    	'preview'    => array(
                    		'type'     => 'css',
                    		'selector' => '.testimonials blockquote',
                            'property'  => 'margin'
                    	),
                    ),
                    'item_background_color'        => array(
						'type'          => 'color',
						'label'         => __('Background Color', 'fl-builder'),
						'default'       => '',
						'show_reset'       => 'true',
						'preview'		=> array(
							'type'		=> 'css',
							'selector'		=> '.testimonials blockquote',
							'property'      => 'background-color',
						),
                        'connections' => array( 'color' )
					),
                    'item_border' => array(
                        'type'       => 'border',
                        'label'      => 'Border',
                        'responsive' => true,
                        'preview'    => array(
                            'type'     => 'css',
                            'selector' => '.testimonials blockquote',
                        ),
                    ),
                )
            ),
            'message'       => array(
				'title'         => 'Message',
				'fields'        => array(             
					'message_color'        => array(
						'type'          => 'color',
						'label'         => __('Message Color', 'fl-builder'),
						'default'       => '',
						'show_reset'       => 'true',
						'preview'		=> array(
							'type'		=> 'css',
							'selector'		=> '.testimonials .message',
							'property'      => 'color',
						),
                        'connections' => array( 'color' )
					),
					'message_typography' => array(
                    	'type'       => 'typography',
                    	'label'      => 'Typography',
                    	'responsive' => true,
                    	'preview'    => array(
                    		'type'	    => 'css',
                    		'selector'  => '.testimonials .message',
                    	),
                    ),
					'message_font_style'        => array(
						'type'          => 'select',
						'label'         => __('Show Message Font Style', 'fl-builder'),
						'default'       => 'true',
						'options'       => array(
							''   	=> __('Default', 'fl-builder'),
							' italic'   	=> __('Italic', 'fl-builder'),
						),
						'preview'		=> array(
							'type'		=> 'css',
							'selector'		=> '.testimonials .message',
							'property'      => 'font-style',
						),
					), 
					'message_max_width'        => array(
						'type'          => 'unit',
						'label'         => __('Message Max Width', 'fl-builder'),
						'default'       => '',
						'placeholder'       => '715',
						'description'       => 'px',
						'preview'		=> array(
							'type'		=> 'css',
							'selector'		=> '.testimonials .message',
							'property'      => 'max-width',
							'unit'      => 'px',
						),
					),
                    'message_margin_bottom'        => array(
						'type'          => 'unit',
						'label'         => __('Message Spacing', 'fl-builder'),
						'default'       => '',
						'preview'		=> array(
							'type'		=> 'css',
							'selector'		=> '.testimonials .message',
							'property'      => 'margin-bottom',
							'unit'      => 'px',
						),
					),
					'message_quote'        => array(
						'type'          => 'select',
						'label'         => __('Show Message Quote', 'fl-builder'),
						'default'       => 'true',
						'options'       => array(
							''   	=> __('Yes', 'fl-builder'),
							' no-quote'     => __('No', 'fl-builder'),
						),
                        'toggle'        => array(
							''      => array(
								'fields'        => array( 'message_quote_color' ),
							)
						)
					),
                    'message_quote_color'        => array(
						'type'          => 'color',
						'label'         => __('Message Quote Color', 'fl-builder'),
						'default'       => '',
						'show_reset'       => 'true',
                        'preview'		=> array(
							'type'		=> 'css',
                            'rules'           => array(
                                array(
                                    'selector'		=> '.testimonials blockquote .message:not(.no-quote)::before',
                                    'property'      => 'color',
                                ),
                                array(
                                    'selector'		=> '.testimonials blockquote .message:not(.no-quote)::after',
                                    'property'      => 'color',
                                ),    
                            )
						),
                        'connections' => array( 'color' )
					),
				)
			),
			'author'       => array(
				'title'         => 'Author',
				'fields'        => array(             
					'author_color'        => array(
						'type'          => 'color',
						'label'         => __('Author Color', 'fl-builder'),
						'default'       => '',
						'show_reset'       => 'true',
						'preview'		=> array(
							'type'		=> 'css',
							'selector'		=> '.testimonials .author',
							'property'      => 'color',
						),
                        'connections' => array( 'color' )
					),
					'author_typography' => array(
                    	'type'       => 'typography',
                    	'label'      => 'Typography',
                    	'responsive' => true,
                    	'preview'    => array(
                    		'type'	    => 'css',
                    		'selector'  => '.testimonials .author',
                    	),
                    ),
					'author_margin_bottom'        => array(
						'type'          => 'unit',
						'label'         => __('Author Spacing', 'fl-builder'),
						'default'       => '',
						'preview'		=> array(
							'type'		=> 'css',
							'selector'		=> '.testimonials .author',
							'property'      => 'margin-bottom',
							'unit'      => 'px',
						),
					),
				)
			),
			'company'       => array(
				'title'         => 'Company',
				'fields'        => array(  
					'company_show'        => array(
						'type'          => 'select',
						'label'         => __('Show Company', 'fl-builder'),
						'default'       => 'true',
						'options'       => array(
							'true'   	=> __('Yes', 'fl-builder'),
							'false'     => __('No', 'fl-builder'),
						)
					),           
					'company_color'        => array(
						'type'          => 'color',
						'label'         => __('Company Color', 'fl-builder'),
						'default'       => '',
						'show_reset'       => 'true',
						'preview'		=> array(
							'type'		=> 'css',
							'selector'		=> '.testimonials .company',
							'property'      => 'color',
						),
                        'connections' => array( 'color' )
					),
					'company_typography' => array(
                    	'type'       => 'typography',
                    	'label'      => 'Typography',
                    	'responsive' => true,
                    	'preview'    => array(
                    		'type'	    => 'css',
                    		'selector'  => '.testimonials .company',
                    	),
                    )
				)
			),
			'date'       => array(
				'title'         => 'Date',
				'fields'        => array(    
					'date_show'        => array(
						'type'          => 'select',
						'label'         => __('Date Company', 'fl-builder'),
						'default'       => 'false',
						'options'       => array(
							'true'   	=> __('Yes', 'fl-builder'),
							'false'     => __('No', 'fl-builder'),
						)
					),             
					'date_color'        => array(
						'type'          => 'color',
						'label'         => __('Date Color', 'fl-builder'),
						'default'       => '',
						'show_reset'       => 'true',
						'preview'		=> array(
							'type'		=> 'css',
							'selector'		=> '.testimonials .date',
							'property'      => 'color',
						),
                        'connections' => array( 'color' )
					),
					'date_typography' => array(
                    	'type'       => 'typography',
                    	'label'      => 'Typography',
                    	'responsive' => true,
                    	'preview'    => array(
                    		'type'	    => 'css',
                    		'selector'  => '.testimonials .date',
                    	),
                    )
				)
			),
			'rating'       => array(
				'title'         => 'Rating',
				'fields'        => array(      
					'rating_show'        => array(
						'type'          => 'select',
						'label'         => __('Rating Company', 'fl-builder'),
						'default'       => 'true',
						'options'       => array(
							'true'   	=> __('Yes', 'fl-builder'),
							'false'     => __('No', 'fl-builder'),
						)
					),           
					'rating_color'        => array(
						'type'          => 'color',
						'label'         => __('Rating Color', 'fl-builder'),
						'default'       => '',
						'show_reset'       => 'true',
						'preview'		=> array(
							'type'		=> 'css',
							'selector'		=> '.testimonials .rating',
							'property'      => 'color',
						),
                        'connections' => array( 'color' )
					),
					'rating_font_size'        => array(
						'type'          => 'unit',
						'label'         => __('Rating Font Size', 'fl-builder'),
						'default'       => '',
						'responsive' => true,
						'preview'		=> array(
							'type'		=> 'css',
							'selector'		=> '.testimonials .rating',
							'property'      => 'font-size',
							'unit'      => 'px',
						),
					),
				)
			),
			'padding'       => array(
				'title'         => 'Padding',
				'fields'        => array(       
					'padding_top'       => array(
						'type'          => 'unit',
						'label'         => 'Top',
						'placeholder'         => '0',
						'maxlength'     => '3',
						'size'          => '4',
						'description'   => 'px',
						'preview'		=> array(
							'type'		=> 'css',
							'selector'		=> '.testimonial-post',
							'property'      => 'padding-top',
							'unit'      => 'px',
						),
					),    
					'padding_bottom'       => array(
						'type'          => 'unit',
						'label'         => 'Bottom',
						'placeholder'         => '0',
						'maxlength'     => '3',
						'size'          => '4',
						'description'   => 'px',
						'preview'		=> array(
							'type'		=> 'css',
							'selector'		=> '.testimonial-post',
							'property'      => 'padding-bottom',
							'unit'      => 'px',
						),
					),    
					'padding_left'       => array(
						'type'          => 'unit',
						'label'         => 'Left',
						'placeholder'         => '0',
						'maxlength'     => '3',
						'size'          => '4',
						'description'   => 'px',
						'preview'		=> array(
							'type'		=> 'css',
							'selector'		=> '.testimonial-post',
							'property'      => 'padding-left',
							'unit'      => 'px',
						),
					),    
					'padding_right'       => array(
						'type'          => 'unit',
						'label'         => 'Right',
						'placeholder'         => '0',
						'maxlength'     => '3',
						'size'          => '4',
						'description'   => 'px',
						'preview'		=> array(
							'type'		=> 'css',
							'selector'		=> '.testimonial-post',
							'property'      => 'padding-right',
							'unit'      => 'px',
						),
					),
				)
			),
			'dots'       => array(
				'title'         => 'Dots',
				'fields'        => array(             
					'dots_color'        => array(
						'type'          => 'color',
						'label'         => __('Dots Color', 'fl-builder'),
						'default'       => '',
						'show_reset'       => 'true',
						'preview'		=> array(
							'type'		=> 'css',
							'rules'           => array(
								array(
									'selector'		=> '.testimonials .owl-dots .owl-dot',
									'property'      => 'background-color',
								),
								array(
									'selector'		=> '.testimonials .flickity-page-dots .dot',
									'property'      => 'background-color',
								), 
							),
						),
                        'connections' => array( 'color' )
					),   
					'dots_active_color'        => array(
						'type'          => 'color',
						'label'         => __('Dots Active Color', 'fl-builder'),
						'default'       => '',
						'show_reset'       => 'true',
						'preview'		=> array(
							'type'		=> 'css',
							'rules'           => array(
								array(
									'selector'		=> '.testimonials .owl-dots .owl-dot.active',
									'property'      => 'background-color',
								),
								array(
									'selector'		=> '.testimonials .flickity-page-dots .dot.is-selected',
									'property'      => 'background-color',
								), 
							),
						),
                        'connections' => array( 'color' )
					),
					'dots_size'        => array(
						'type'          => 'unit',
						'label'         => __('Dots Size', 'fl-builder'),
						'default'       => '',
						'preview'		=> array(
							'type'		=> 'css',
							'rules'           => array(
								array(
									'selector'		=> '.testimonials .owl-dots .owl-dot',
									'property'      => 'width',
									'unit'      => 'px',
								),
								array(
									'selector'		=> '.testimonials .owl-dots .owl-dot',
									'property'      => 'height',
									'unit'      => 'px',
								), 
								array(
									'selector'		=> '.testimonials .flickity-page-dots .dot',
									'property'      => 'width',
									'unit'      => 'px',
								),
								array(
									'selector'		=> '.testimonials .flickity-page-dots .dot',
									'property'      => 'height',
									'unit'      => 'px',
								), 
							),
						),
					),
					'dots_spacing'        => array(
						'type'          => 'unit',
						'label'         => __('Dots Spacing', 'fl-builder'),
						'default'       => '',
						'preview'		=> array(
							'type'		=> 'css',
							'rules'           => array(
								array(
									'selector'		=> '.testimonials .owl-dots .owl-dot',
									'property'      => 'margin-left',
									'unit'      => 'px',
								),
								array(
									'selector'		=> '.testimonials .owl-dots .owl-dot',
									'property'      => 'margin-right',
									'unit'      => 'px',
								), 
								array(
									'selector'		=> '.testimonials .flickity-page-dots .dot',
									'property'      => 'margin-left',
									'unit'      => 'px',
								),
								array(
									'selector'		=> '.testimonials .flickity-page-dots .dot',
									'property'      => 'margin-right',
									'unit'      => 'px',
								), 
							),
						),
					),
					'dots_margin_top'        => array(
						'type'          => 'unit',
						'label'         => __('Dots Top Margin', 'fl-builder'),
						'default'       => '',
						'preview'		=> array(
							'type'		=> 'css',
							'rules'           => array(
								array(
									'selector'		=> '.testimonials .owl-dots',
									'property'      => 'margin-top',
									'unit'      => 'px',
								),
								array(
									'selector'		=> '.testimonials .flickity-page-dots .dot',
									'property'      => 'margin-top',
									'unit'      => 'px',
								), 
							),
						),
					),
				)
			),
			'nav'       => array(
				'title'         => 'Navs',
				'fields'        => array(
					'nav_bg_color'        => array(
						'type'          => 'color',
						'label'         => __('Nav Background Color', 'fl-builder'),
						'default'       => '',
						'show_reset'    => true,
						'preview'		=> array(
							'type'		=> 'css',
							'rules'           => array(
								array(
									'selector'		=> '.testimonials .owl-nav *',
									'property'      => 'background-color',
								),
							),
						),
					),
					'nav_border_color'        => array(
						'type'          => 'color',
						'label'         => __('Nav Border Color', 'fl-builder'),
						'default'       => '',
						'show_reset'    => true,
						'preview'		=> array(
							'type'		=> 'css',
							'rules'           => array(
								array(
									'selector'		=> '.testimonials .owl-nav *',
									'property'      => 'border-color',
								),
							),
						),
                        'connections' => array( 'color' )
					),
					'nav_color'        => array(
						'type'          => 'color',
						'label'         => __('Nav Color', 'fl-builder'),
						'default'       => '',
						'description'   => 'default: #000000',
						'show_reset'    => false,
						'preview'		=> array(
							'type'		=> 'css',
							'rules'           => array(
								array(
									'selector'		=> '.testimonials .owl-nav *::before',
									'property'      => 'background-color',
								),
								array(
									'selector'		=> '.testimonials .owl-nav *::after',
									'property'      => 'background-color',
								), 
							),
						),
                        'connections' => array( 'color' )
					),
					'nav_bg_color_hover'        => array(
						'type'          => 'color',
						'label'         => __('Nav Background Color Hover', 'fl-builder'),
						'default'       => '',
						'show_reset'    => true,
						'preview'		=> array(
							'type'		=> 'css',
							'rules'           => array(
								array(
									'selector'		=> '.testimonials .owl-nav *:hover',
									'property'      => 'background-color',
								),
								array(
									'selector'		=> '.testimonials .owl-nav *:hover',
									'property'      => 'background-color',
								), 
							),
						),
                        'connections' => array( 'color' )
					),
					'nav_border_color_hover'        => array(
						'type'          => 'color',
						'label'         => __('Nav Border Color Hover', 'fl-builder'),
						'default'       => '',
						'show_reset'    => true,
						'preview'		=> array(
							'type'		=> 'css',
							'rules'           => array(
								array(
									'selector'		=> '.testimonials .owl-nav *:hover',
									'property'      => 'border-color',
								),
							),
						),
                        'connections' => array( 'color' )
					),
					'nav_color_hover'        => array(
						'type'          => 'color',
						'label'         => __('Nav Color Hover', 'fl-builder'),
						'default'       => '',
						'show_reset'    => true,
						'preview'		=> array(
							'type'		=> 'css',
							'rules'           => array(
								array(
									'selector'		=> '.testimonials .owl-nav *:hover::before',
									'property'      => 'background-color',
								),
								array(
									'selector'		=> '.testimonials .owl-nav *:hover::after',
									'property'      => 'background-color',
								), 
							),
						),
                        'connections' => array( 'color' )
					),
					'nav_size'        => array(
						'type'          => 'unit',
						'label'         => __('Nav Size', 'fl-builder'),
						'default'       => '',
						'preview'		=> array(
							'type'		=> 'css',
							'rules'           => array(
								array(
									'selector'		=> '.testimonials .owl-nav *',
									'property'      => 'width',
									'unit'      => 'px',
								),
								array(
									'selector'		=> '.testimonials .owl-nav *',
									'property'      => 'height',
									'unit'      => 'px',
								), 
							),
						),
					),
					'nav_radius'        => array(
						'type'          => 'unit',
						'label'         => __('Nav Radius', 'fl-builder'),
						'default'       => '',
						'description'   => 'px',
						'preview'		=> array(
							'type'		=> 'css',
							'rules'           => array(
								array(
									'selector'		=> '.testimonials .owl-nav *',
									'property'      => 'border-radius',
									'unit'      => 'px',
								),
								array(
									'selector'		=> '.testimonials .owl-nav *',
									'property'      => 'border-radius',
									'unit'      => 'px',
								),
							),
						),
					),
					'nav_spacing'        => array(
						'type'          => 'unit',
						'label'         => __('Nav Spacing', 'fl-builder'),
						'default'       => '',
						'description'   => 'px',
						'preview'		=> array(
							'type'		=> 'css',
							'rules'           => array(
								array(
									'selector'		=> '.testimonials .owl-nav .owl-prev',
									'property'      => 'left',
									'unit'      => 'px',
								),
								array(
									'selector'		=> '.testimonials .owl-nav .owl-next',
									'property'      => 'right',
									'unit'      => 'px',
								), 
							),
						),
					),
					'nav_thick'        => array(
						'type'          => 'unit',
						'label'         => __('Nav Arrow Thickness', 'fl-builder'),
						'default'       => '',
						'description'   => 'px',
						'preview'		=> array(
							'type'		=> 'css',
							'rules'           => array(
								array(
									'selector'		=> '.testimonials .owl-nav *::before',
									'property'      => 'width',
									'unit'      => 'px',
								),
								array(
									'selector'		=> '.testimonials .owl-nav *::after',
									'property'      => 'width',
									'unit'      => 'px',
								),
							),
						),
					),
					'nav_border_thick'        => array(
						'type'          => 'unit',
						'label'         => __('Nav Border Thickness', 'fl-builder'),
						'default'       => '',
						'description'   => 'px',
						'preview'		=> array(
							'type'		=> 'css',
							'rules'           => array(
								array(
									'selector'		=> '.testimonials .owl-nav *',
									'property'      => 'border-width',
									'unit'      => 'px',
								),
							),
						),
					),
					'nav_arrow_radius'        => array(
						'type'          => 'unit',
						'label'         => __('Nav Arrow Radius', 'fl-builder'),
						'default'       => '',
						'description'   => 'px',
						'preview'		=> array(
							'type'		=> 'css',
							'rules'           => array(
								array(
									'selector'		=> '.testimonials .owl-nav *::before',
									'property'      => 'border-radius',
									'unit'      => 'px',
								),
								array(
									'selector'		=> '.testimonials .owl-nav *::after',
									'property'      => 'border-radius',
									'unit'      => 'px',
								),
							),
						),
					),
					'nav_margin_top'        => array(
						'type'          => 'unit',
						'label'         => __('Nav Top Margin', 'fl-builder'),
						'default'       => '',
						'preview'		=> array(
							'type'		=> 'css',
							'rules'           => array(
								array(
									'selector'		=> '.testimonials .owl-nav',
									'property'      => 'margin-top',
									'unit'      => 'px',
								),
							),
						),
					),
				)
			),
		)
	)
));