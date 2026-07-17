<?php

/**
 * @class sliderGalleryModule
 */
class bolosSliderGallery extends FLBuilderModule {

	/** 
	 * @method __construct
	 */  
	public function __construct()
	{
		global $customcategory;
		parent::__construct(array(
			'name'          	=> __('Bolos Slider Gallery', 'fl-builder'),
			'description'   	=> __('Display Slideshow of Images with Text.', 'fl-builder'),
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
		$classname = 'bolos-slider-gallery';
		return $classname;
	}
}

/**
 * Register the module and its form settings.
 */
FLBuilder::register_module('bolosSliderGallery', array(
	'Content'         => array(
		'title'         => __('Content', 'fl-builder'),
		'sections'      => array(
			'general'       => array(
				'title'         => '',
				'fields'        => array(
					'slider_gallery' => array(
                        'type'          => 'multiple-photos',
                        'label'         => __( 'Slider Gallery', 'fl-builder' )
                    ),
                    'slider_text' => array(
                        'type'          => 'text',
                        'label'         => __( 'Slider Text', 'fl-builder' )
                    ),
                    'slider_text_vertical_align' => array(
                    	'type'    => 'select',
                    	'label'   => __( 'Vertical Alignment', 'fl-builder' ),
                    	'default' => '50%',
                    	'options'       => array(
                            '0'      => __( 'Top', 'fl-builder' ),
                            '50%'      => __( 'Center', 'fl-builder' ),
                            '100%'      => __( 'Bottom', 'fl-builder' )
                        )
                    ),
                    'slider_overlay_color' => array(
                    	'type'    => 'gradient',
                    	'label'   => __( 'Overlay Color', 'fl-builder' ),
                    	'preview' => array(
                    		'type'     => 'css',
                    		'selector' => '{node} .carousel-main .flickity-viewport::before',
                    		'property' => 'background-image',
                    	),
                    ),
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
							'fullHeight'       => __('Full Height', 'fl-builder'),
							'customHeight'     => __('Custom Height', 'fl-builder'),
						),
						'toggle'        => array(
							'customHeight'        => array(
								'fields'        => array('custom_height', 'nav_slider_height')
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
					'nav_type'          => array(
					    'type'          => 'select',
					    'label'         => __('Navigation Type', 'fl-builder'),
					    'default'       => 'slider',
					    'options'       => array(
				            'slider'      => __('Slider', 'fl-builder'),
				            'dots'        => __('Dots', 'fl-builder'),
				        ),
				        'toggle'        => array(
				            'slider'    => array(
				                'fields'        => array( 'nav_slider_column' ),
			                ),
			                'dots'    => array(
				                'fields'        => array( 'show_dots' ),
			                ),
			            ),
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
						)
					)
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
								'fields'        => array( 'autoplay_speed', 'pause_hover')
							),
						),
					),
					'pause_hover'        => array(
						'type'          => 'select',
						'label'         => __('Pause on Hover', 'fl-builder'),
						'default'       => 'false',
						'options'       => array(
							'true'    => __('Yes', 'fl-builder'),
							'false'      => __('No', 'fl-builder'),
						)
					),
					'autoplay_speed'        => array(
						'type'          => 'unit',
						'label'         => __('Autoplay Speed', 'fl-builder'),
						'placeholder'       => '1500',
						'description'       => 'Millisecond',
					),
					'show_dots'        => array(
						'type'          => 'select',
						'label'         => __('Enable Dots', 'fl-builder'),
						'default'       => 'true',
						'options'       => array(
							'true'   	=> __('Yes', 'fl-builder'),
							'false'     => __('No', 'fl-builder'),
						)
					),
					'free_scroll'        => array(
						'type'          => 'select',
						'label'         => __('Enable Free Scroll', 'fl-builder'),
						'default'       => 'true',
						'options'       => array(
							'true'   	=> __('Yes', 'fl-builder'),
							'false'     => __('No', 'fl-builder'),
						)
					),
					'contain'        => array(
						'type'          => 'select',
						'label'         => __('Enable Scroll Contain', 'fl-builder'),
						'default'       => 'true',
						'options'       => array(
							'true'   	=> __('Yes', 'fl-builder'),
							'false'     => __('No', 'fl-builder'),
						)
					),
					'wrap_round'        => array(
						'type'          => 'select',
						'label'         => __('Enable Wrap Around', 'fl-builder'),
						'default'       => 'true',
						'options'       => array(
							'true'   	=> __('Yes', 'fl-builder'),
							'false'     => __('No', 'fl-builder'),
						)
					),
					'show_nav'        => array(
						'type'          => 'select',
						'label'         => __('Enable Arrows', 'fl-builder'),
						'default'       => 'true',
						'options'       => array(
							'true'   	=> __('Yes', 'fl-builder'),
							'false'     => __('No', 'fl-builder'),
						),
						'toggle'        => array(
							'false'      => array(
								'sections'        => array( 'nav' ),
							),
						)
					),
					'gap_between'       => array(
					    'type'          => 'unit',
					    'label'         => __('Gaps Between Slides', 'fl-builder'),
					    'default'       => '10',
					    'description'   => 'px',
					    'preview'       => array(
					        'type'      => 'css',
					        'selector'  => '{node} .carousel-cell',
					        'property'  => 'margin-right'
				        ),
				    ),
				)
			)
		)
	),
	'typography'        => array(
		'title'         => __('Typography', 'fl-builder'),
		'sections'      => array(
    		'general'       => array(
    			'title'         => '',
    			'fields'        => array(
    			    'slider_text_typography' => array(
                    	'type'       => 'typography',
                    	'label'      => __('Typography', 'fl-builder'),
                    	'responsive' => true,
                    	'preview'    => array(
                    		'type'	    => 'css',
                    		'selector'  => '{node} .carousel-text-content',
                    	),
                    ),
                    'slider_text_color' => array(
                        'type'          => 'color',
                        'label'         => __( 'Text Color', 'fl-builder' ),
                        'default'       => '333333',
                        'show_reset'    => true,
                        'show_alpha'    => true,
                        'preview'       => array(
                            'type'      => 'css',
                            'selector'  => '{node} .carousel-text-content',
                            'property'    => 'color',
                        ),
                    ),
    			)
    		)
		)
	)
));