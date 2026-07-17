<?php

/**
 * @class sliderGalleryModule
 */
class contentSliderflick extends FLBuilderModule {

	/** 
	 * @method __construct
	 */  
	public function __construct()
	{
		global $customcategory;
		parent::__construct(array(
			'name'          	=> __('Content Slider Flickity', 'fl-builder'),
			'description'   	=> __('Display Content Slider using Flickity.', 'fl-builder'),
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
		$classname = 'content-slider-flick';
		return $classname;
	}
}

/**
 * Register the module and its form settings.
 */
FLBuilder::register_module('contentSliderflick', array(
	'Content'         => array(
		'title'         => __('Content', 'fl-builder'),
		'sections'      => array(
			'general'       => array(
				'title'         => '',
				'fields'        => array(
					'items'         => array(
						'type'          => 'form',
						'label'         => __('Item Content', 'fl-builder'),
						'form'          => 'heading_form', // ID from registered form below
						'preview_text'  => 'heading_text', // Name of a field to use for the preview text
						'multiple'      => true
					)
				)
			),
			'content_bg_settings'       => array(
				'title'         => __('Background', 'fl-builder'),
				'fields'        => array(
				    'bg_type'        => array(
						'type'          => 'select',
						'label'         => __('Background Type', 'fl-builder'),
						'default'       => 'color',
						'options'       => array(
							'color'    => __('Color', 'fl-builder'),
							'photo'      => __('Photo', 'fl-builder'),
							'gradient'      => __('Gradient', 'fl-builder'),
						),
						'toggle'        => array(
							'color'        => array(
								'fields'        => array( 'content_bg_color' )
							),
							'photo'        => array(
								'fields'        => array( 'content_bg_photo' )
							),
							'gradient'        => array(
								'fields'        => array( 'content_bg_gradient' )
							),
						),
					),
					'content_bg_color' => array(
                        'type'          => 'color',
                        'label'         => __( 'Background Color', 'fl-builder' ),
                        'default'       => '333333',
                        'show_reset'    => true,
                        'show_alpha'    => true,
                        'preview'       => array(
                            'type'      => 'css',
                            'selector'  => '{node} .flickity-viewport',
                            'property'  => 'background-color',
                        ),
                    ),
					'content_bg_photo' => array(
                        'type'          => 'photo',
                        'label'         => __('Background Image', 'fl-builder'),
                        'show_remove'   => true,
                        'connection'    => array( 'photo' ),
                    ),
					'content_bg_gradient' => array(
                    	'type'    => 'gradient',
                    	'label'   => __( 'Background Gradient', 'fl-builder' ),
                    	'preview'       => array(
                            'type'      => 'css',
                            'selector'  => '{node} .flickity-viewport',
                            'property'  => 'background-image',
                        ),
                    ),
				)
			),
			'content_height'       => array(
				'title'         => __('Height', 'fl-builder'),
				'fields'        => array(
				    'height_type'        => array(
						'type'          => 'select',
						'label'         => __('Height', 'fl-builder'),
						'default'       => 'color',
						'options'       => array(
							'min_height'    => __('Minimum Height', 'fl-builder'),
							'full_height'      => __('Full Height', 'fl-builder'),
							'custom_height'      => __('Custom Height', 'fl-builder'),
						),
						'toggle'        => array(
							'min_height'        => array(
								'fields'        => array( 'content_min_height' ),
							),
							'full_height'        => array( ),
							'custom_height'        => array(
								'fields'        => array( 'content_custom_height' ),
							),
						),
					),
					'content_min_height' => array(
                    	'type'        => 'unit',
                    	'label'       => __('Minimum Height', 'fl-builder'),
                    	'units'	       => array( 'px', 'vh' ),
                    	'default_unit' => 'px', 
                    	'preview'	   => array(
                    		'type'          => 'css',
                    		'selector'      => '{node} .carousel-cell',
                    		'property'      => 'min-height',
                        ),
                    ),
    				'content_custom_height' => array(
                    	'type'        => 'unit',
                    	'label'       => __('Custom Height', 'fl-builder'),
                    	'units'	       => array( 'px', 'vh' ),
                    	'default_unit' => 'vh', 
                    	'preview'	   => array(
                    		'type'          => 'css',
                    		'selector'      => '{node} .carousel-cell',
                    		'property'      => 'height',
                        ),
                    ),
				),
			),
		),
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
					'adaptive_height'        => array(
						'type'          => 'select',
						'label'         => __('Adaptive Height', 'fl-builder'),
						'default'       => 'false',
						'options'       => array(
							'true'    => __('Yes', 'fl-builder'),
							'false'      => __('No', 'fl-builder'),
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
    		'heading_typo'       => array(
    			'title'         => 'Heading',
    			'fields'        => array(
    			    'slider_text_typography' => array(
                    	'type'       => 'typography',
                    	'label'      => __('Typography', 'fl-builder'),
                    	'responsive' => true,
                    	'preview'    => array(
                    		'type'	    => 'css',
                    		'selector'  => '{node} .carousel-heading',
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
                            'selector'  => '{node} .carousel-heading',
                            'property'    => 'color',
                        ),
                    ),
    			)
    		),
    		'content_typo'       => array(
    			'title'         => 'Content',
    			'fields'        => array(
    			    'slider_content_typography' => array(
                    	'type'       => 'typography',
                    	'label'      => __('Typography', 'fl-builder'),
                    	'responsive' => true,
                    	'preview'    => array(
                    		'type'	    => 'css',
                    		'selector'  => '{node} .carousel-content',
                    	),
                    ),
                    'slider_content_color' => array(
                        'type'          => 'color',
                        'label'         => __( 'Text Color', 'fl-builder' ),
                        'default'       => '333333',
                        'show_reset'    => true,
                        'show_alpha'    => true,
                        'preview'       => array(
                            'type'      => 'css',
                            'selector'  => '{node} .carousel-content',
                            'property'    => 'color',
                        ),
                    ),
    			)
    		),
		)
	)
));


FLBuilder::register_settings_form('heading_form', array(
	'title' => __('Heading', 'fl-builder'),
	'tabs'  => array(
		'heading'      => array(
			'title'         => __('Heading', 'fl-builder'),
			'sections'      => array(
				'content'       => array(
					'title'         => __('Content', 'fl-builder'),
					'fields'        => array(
						'item_heading'       => array(
							'type'          => 'text',
							'label'         => 'Heading Text',
                            'default'       => 'This is an example of a typing text effect.'
						),
						'item_content' => array(
                            'type'          => 'editor',
                            'media_buttons' => true,
                            'wpautop'       => true
                        ),
					)
				)
			)
		)
	)
));