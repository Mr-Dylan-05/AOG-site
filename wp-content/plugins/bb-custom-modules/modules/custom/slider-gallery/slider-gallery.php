<?php

/**
 * @class sliderGalleryModule
 */
class sliderGalleryModule extends FLBuilderModule {

	/** 
	 * @method __construct
	 */  
	public function __construct()
	{
		global $customcategory;
		parent::__construct(array(
			'name'          	=> __('Slider Gallery', 'fl-builder'),
			'description'   	=> __('Display Slideshow of Images.', 'fl-builder'),
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
		$classname = 'slider-gallery';
		return $classname;
	}
}

/**
 * Register the module and its form settings.
 */
FLBuilder::register_module('sliderGalleryModule', array(
	'Content'         => array(
		'title'         => __('Content', 'fl-builder'),
		'sections'      => array(
			'general'       => array(
				'title'         => '',
				'fields'        => array(
					'slider_gallery' => array(
                        'type'          => 'multiple-photos',
                        'label'         => __( 'Slider Gallery', 'fl-builder' )
                    )
				)
			),
            'gallery_settings'       => array(
				'title'         => 'Gallery Settings',
				'fields'        => array(
                    'adaptive_height'        => array(
						'type'          => 'select',
						'label'         => __('Adaptive Height', 'fl-builder'),
						'default'       => 'false',
						'options'       => array(
							'true'        => __('Yes', 'fl-builder'),
							'false'       => __('No', 'fl-builder')
						),
                        'toggle'        => array(
							'false'        => array(
								'fields'        => array('main_slider_height', 'custom_height', 'nav_slider_height')
							),
						),
					),
                    'image_main_size'        => array(
						'type'          => 'select',
						'label'         => __('Main Images Size', 'fl-builder'),
						'default'       => 'cover',
						'options'       => array(
							'cover'         => __('Cover', 'fl-builder'),
							'contain'       => __('Contain', 'fl-builder')
						),
                        'toggle'        => array(
							'contain'        => array(
								'fields'        => array('image_main_padding')
							),
						),
					),
                    'image_main_padding' => array(
                    	'type'        => 'dimension',
                    	'label'       => 'Main Image Padding',
                    	'units'  => array( 'px', 'vw', '%' ),
                        'default_unit' => 'px',
                        'responsive' => true,
                    	'preview'    => array(
                    		'type'     => 'css',
                    		'selector' => '.slider-gallery .gallery-image',
                    		'property' => 'padding',
                    	),
                    ),
				    'image_nav_size'        => array(
						'type'          => 'select',
						'label'         => __('Nav Images Size', 'fl-builder'),
						'default'       => 'cover',
						'options'       => array(
							'cover'         => __('Cover', 'fl-builder'),
							'contain'       => __('Contain', 'fl-builder')
						),
                        'toggle'        => array(
							'contain'        => array(
								'fields'        => array('image_nav_padding')
							),
						),
					),
                    'image_nav_padding' => array(
                    	'type'        => 'dimension',
                    	'label'       => 'Nav Image Padding',
                    	'units'  => array( 'px', 'vw', '%' ),
                        'default_unit' => 'px',
                    	'responsive' => true,
                    	'preview'    => array(
                    		'type'     => 'css',
                    		'selector' => '.slider-gallery .gallery-image-nav',
                            'property' => 'padding',
                    	),
                    ),
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
						'units'         => array('px','vh', '%'),
						'responsive'        => true,
					),
                    'nav_slider_height'        => array(
						'type'          => 'unit',
						'label'         => __('Custom Navigation Slider height', 'fl-builder'),
						'placeholder'       => '400',
						'responsive'        => true,
						'units'         => array('px','vh', '%'),
					),
                    'nav_slider_column'        => array(
						'type'          => 'select',
						'label'         => __('Desktop Columns', 'fl-builder'),
						'default'       => '3',
						'options'       => array(
							'2'         => __('2 Columns', 'fl-builder'),
							'3'         => __('3 Columns', 'fl-builder'),
							'4'         => __('4 Columns', 'fl-builder'),
							'5'         => __('5 Columns', 'fl-builder'),
							'6'         => __('6 Columns', 'fl-builder'),
						)
					),
					'nav_slider_column_tablet'        => array(
						'type'          => 'select',
						'label'         => __('Tablet Columns', 'fl-builder'),
						'default'       => '2',
						'options'       => array(
						    '1'         => __('1 Column', 'fl-builder'),
							'2'         => __('2 Columns', 'fl-builder'),
							'3'         => __('3 Columns', 'fl-builder'),
							'4'         => __('4 Columns', 'fl-builder'),
							'5'         => __('5 Columns', 'fl-builder'),
							'6'         => __('6 Columns', 'fl-builder'),
						)
					),
					'nav_slider_column_mobile'        => array(
						'type'          => 'select',
						'label'         => __('Mobile Columns', 'fl-builder'),
						'default'       => '1',
						'options'       => array(
						    '1'         => __('1 Column', 'fl-builder'),
							'2'         => __('2 Columns', 'fl-builder'),
							'3'         => __('3 Columns', 'fl-builder'),
							'4'         => __('4 Columns', 'fl-builder'),
							'5'         => __('5 Columns', 'fl-builder'),
							'6'         => __('6 Columns', 'fl-builder'),
						)
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
						'default'       => 'true',
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
						'default'       => '',
						'placeholder'       => '10000',
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
			),
			'style'       => array(
				'title'         => '',
				'fields'        => array(
					'nav_bg_color'        => array(
						'type'          => 'color',
                        'label'         => __( 'Nav Background', 'fl-builder' ),
                        'default'       => '333333',
                        'show_reset'    => true,
						'show_alpha'    => true,
						'preview'    => array(
                    		'type'     => 'css',
                    		'selector' => '{node} .slider-gallery .flickity-button',
                            'property' => 'background-color',
                    	),
					),
                    'nav_icon_color'        => array(
						'type'          => 'color',
                        'label'         => __( 'Nav Icon Color', 'fl-builder' ),
                        'default'       => '333333',
                        'show_reset'    => true,
						'show_alpha'    => true,
						'preview'    => array(
                    		'type'     => 'css',
                    		'selector' => '{node} .slider-gallery .flickity-button svg',
                            'property' => 'fill',
                    	),
					)
				)
			)
		)
	)
));