<?php

/**
 * @class sliderModule
 */
class sliderModule extends FLBuilderModule {

	/** 
	 * @method __construct
	 */  
	public function __construct()
	{
		global $customcategory;
		parent::__construct(array(
			'name'          	=> __('Slider', 'fl-builder'),
			'description'   	=> __('Fullscreen Slideshow.', 'fl-builder'),
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
	public function get_classname()
	{
		$classname = 'slider';
		return $classname;
	}
}

/*Module Image Size*/
add_image_size( 'slider-ui-image', 1000 , 907, true );

/**
 * Register the module and its form settings.
 */
FLBuilder::register_module('sliderModule', array(
	'slides'         => array(
		'title'         => __('Slides', 'fl-builder'),
		'sections'      => array(
			'general'       => array(
				'title'         => '',
				'fields'        => array(
					'items'         => array(
						'type'          => 'form',
						'label'         => __('Slide', 'fl-builder'),
						'form'          => 'owl_slider_form', // ID from registered form below
						'preview_text'  => 'owl_slider_title', // Name of a field to use for the preview text
						'multiple'      => true
					),
				)
			)
		)
	),
	'typography'        => array(
		'title'         => __('Typography', 'fl-builder'),
		'sections'      => array(
		    'prefix_title'       => array(
				'title'         => 'Prefix',
				'fields'        => array(
                    'prefix_title_typography' => array(
                    	'type'       => 'typography',
                    	'label'      => 'Typography',
                    	'responsive' => true,
                    	'preview'    => array(
                    		'type'	    => 'css',
                    		'selector'  => '.slider-prefix',
                    	),
                    ),
                )
            ),
            'slider_title'       => array(
				'title'         => 'Title',
				'fields'        => array(
                    'slider_title_typography' => array(
                    	'type'       => 'typography',
                    	'label'      => 'Typography',
                    	'responsive' => true,
                    	'preview'    => array(
                    		'type'	    => 'css',
                    		'selector'  => '.slider-title',
                    	),
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
					'height'        => array(
						'type'          => 'select',
						'label'         => __('Height', 'fl-builder'),
						'default'       => 'fullscreen',
						'options'       => array(
							'fullscreen'    => __('Full Screen', 'fl-builder'),
							'autoheight'      => __('Auto Height', 'fl-builder'),
							'customheight'      => __('Custom Height', 'fl-builder'),
						),
						'toggle'        => array(
							'fullscreen'        => array(
								'fields'        => array('fullscreen_setting')
							),
							'customheight'        => array(
								'fields'        => array('customheight')
							),
						),
					),
					'fullscreen_setting'        => array(
						'type'          => 'select',
						'label'         => __('Minus Header Height', 'fl-builder'),
						'default'       => 'no',
						'options'       => array(
							'yes'    => __('Yes', 'fl-builder'),
							'no'      => __('No', 'fl-builder'),
						),
					),
					'customheight'        => array(
						'type'          => 'unit',
						'label'         => __('Custom Height', 'fl-builder'),
						'maxlength'     => '4',
						'size'          => '5',
						'description'   => 'px',
						'placeholder'   => '600',
						'responsive'  => array(
                    		'placeholder' => array(
                    			'default'    =>  700,
                    			'medium'     =>  600,
                    			'responsive' =>  600,
                    		),
                    	),
					),
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
								'fields'        => array('autoplay_delay', 'autoplay_speed')
							),
						),
					),
					'autoplay_delay'        => array(
						'type'          => 'unit',
						'label'         => __('Autoplay Delay', 'fl-builder'),
						'placeholder'       => '7000',
						'description'       => 'Millisecond',
					),
					'autoplay_speed'        => array(
						'type'          => 'unit',
						'label'         => __('Autoplay Speed', 'fl-builder'),
						'placeholder'       => '1500',
						'description'       => 'Millisecond',
					),
					'loop_animation'        => array(
						'type'          => 'select',
						'label'         => __('Loop Animation', 'fl-builder'),
						'default'       => 'fade',
						'options'       => array(
							'fade'    => __('Fade', 'fl-builder'),
							'slide'      => __('Slide', 'fl-builder'),
						),
						'toggle'        => array(
							'slide'        => array(
								'fields'        => array('autoplay_speed')
							),
						),
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
			),
			'color'       => array(
				'title'         => 'Color',
				'fields'        => array(  
					'slider_bg_color'       => array(
						'type'          => 'color',
						'label'         => 'Background Color',
						'show_reset'    => true,
						'preview'       => array(
							'type'          => 'css',
							'selector'      => '.slider',
							'property'      => 'background-color',
						)
					),  
				)
			),
			'overlay'       => array(
				'title'         => 'Overlay',
				'fields'        => array(
					'overlay_pattern'       => array(
						'type'          => 'photo',
						'label'         => 'Overlay Pattern',
						'show_remove'    => true,
					),   
					'overlay_color'       => array(
						'type'          => 'color',
						'label'         => 'Overlay Color',
						'show_reset'    => true,
						'preview'       => array(
							'type'          => 'css',
							'selector'      => '.slide-item::before',
							'property'      => 'background-color',
						)
					),
					'overlay_opacity'    => array(
						'type'          => 'unit',
						'label'         => __('Background Overlay Opacity', 'fl-builder'),
						'description'   => '0 to 1 eg: 0.6',
						'placeholder'   => '0.5',
						'preview'       => array(
							'type'          => 'css',
							'selector'      => '.slide-item::before',
							'property'      => 'opacity',
						)
					),
				)
			),
			'buttons'       => array(
				'title'         => 'Buttons',
				'fields'        => array(  
					'slider_button_color'       => array(
						'type'          => 'color',
						'label'         => 'Button Color',
						'show_reset'    => true,
						'preview'       => array(
							'type'          => 'css',
							'rules'           => array(
								array(
									'selector'      => 'a.slider-button',
									'property'      => 'background-color',
								),
								array(
									'selector'      => 'a.slider-button',
									'property'      => 'border-color',
								),   
							) 
						)
					),  
					'slider_button_color_text'       => array(
						'type'          => 'color',
						'label'         => 'Button Text Color',
						'show_reset'    => true,
						'preview'       => array(
							'type'          => 'css',
							'rules'           => array(
								array(
									'selector'      => 'a.slider-button',
									'property'      => 'color',
								),
							) 
						)
					),
					'slider_button_color_highlight'       => array(
						'type'          => 'color',
						'label'         => 'Highlight/First Button Color',
						'show_reset'    => true,
						'preview'       => array(
							'type'          => 'css',
							'rules'           => array(
								array(
									'selector'      => 'a.slider-button.highlight',
									'property'      => 'background-color',
								),
								array(
									'selector'      => 'a.slider-button.highlight',
									'property'      => 'border-color',
								),   
							) 
						)
					),
					'slider_button_color_highlight_text'       => array(
						'type'          => 'color',
						'label'         => 'Highlight/First Button Text Color',
						'show_reset'    => true,
						'preview'       => array(
							'type'          => 'css',
							'rules'           => array(
								array(
									'selector'      => 'a.slider-button.highlight',
									'property'      => 'color',
								),
							) 
						)
					),
				)
			),
			'padding'       => array(
				'title'         => 'Padding',
				'fields'        => array(       
					'padding_top'       => array(
						'type'          => 'unit',
						'label'         => 'Top',
						'maxlength'     => '3',
						'size'          => '4',
						'description'   => 'px',
						'preview'       => array(
							'type'          => 'css',
							'selector'      => '.slider-info',
							'property'      => 'padding-top',
							'unit'          => 'px'
						),
						'responsive'  => array(
							'placeholder' => array(
								'default'    => ( isset( $global_settings->padding_top ) ) ? $global_settings->padding_top : '110',
								'medium'     => ( isset( $global_settings->padding_top_medium ) ) ? $global_settings->padding_top_medium : '60',
								'responsive' => ( isset( $global_settings->padding_top_responsive ) ) ? $global_settings->padding_top_responsive : '',
							)
						),
					),    
					'padding_bottom'       => array(
						'type'          => 'unit',
						'label'         => 'Bottom',
						'maxlength'     => '3',
						'size'          => '4',
						'description'   => 'px',
						'preview'       => array(
							'type'          => 'css',
							'selector'      => '.slider-info',
							'property'      => 'padding-bottom',
							'unit'          => 'px'
						),
						'responsive'  => array(
							'placeholder' => array(
								'default'    => ( isset( $global_settings->padding_bottom ) ) ? $global_settings->padding_bottom : '70',
								'medium'     => ( isset( $global_settings->padding_bottom_medium ) ) ? $global_settings->padding_bottom_medium : '60',
								'responsive' => ( isset( $global_settings->padding_bottom_responsive ) ) ? $global_settings->padding_bottom_responsive : '',
							)
						),
					),    
					'padding_left'       => array(
						'type'          => 'unit',
						'label'         => 'Left',
						'maxlength'     => '3',
						'size'          => '4',
						'description'   => 'px',
						'preview'       => array(
							'type'          => 'css',
							'selector'      => '.slider-info',
							'property'      => 'padding-left',
							'unit'          => 'px'
						),
						'responsive'  => array(
							'placeholder' => array(
								'default'    => ( isset( $global_settings->padding_left ) ) ? $global_settings->padding_left : '80',
								'medium'     => ( isset( $global_settings->padding_left_medium ) ) ? $global_settings->padding_left_medium : '20',
								'responsive' => ( isset( $global_settings->padding_left_responsive ) ) ? $global_settings->padding_left_responsive : '',
							)
						),
					),    
					'padding_right'       => array(
						'type'          => 'unit',
						'label'         => 'Right',
						'maxlength'     => '3',
						'size'          => '4',
						'description'   => 'px',
						'preview'       => array(
							'type'          => 'css',
							'selector'      => '.slider-info',
							'property'      => 'padding-right',
							'unit'          => 'px'
						),
						'responsive'  => array(
							'placeholder' => array(
								'default'    => ( isset( $global_settings->padding_right ) ) ? $global_settings->padding_right : '80',
								'medium'     => ( isset( $global_settings->padding_right_medium ) ) ? $global_settings->padding_right_medium : '20',
								'responsive' => ( isset( $global_settings->padding_right_responsive ) ) ? $global_settings->padding_right_responsive : '',
							)
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
							'selector'		=> '.slider .owl-dots .owl-dot',
							'property'      => 'background-color',
						),
					),   
					'dots_active_color'        => array(
						'type'          => 'color',
						'label'         => __('Dots Active Color', 'fl-builder'),
						'default'       => '',
						'show_reset'       => 'true',
						'preview'		=> array(
							'type'		=> 'css',
							'selector'		=> '.slider .owl-dots .owl-dot.active',
							'property'      => 'background-color',
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
									'selector'		=> '.slider .owl-nav *',
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
									'selector'		=> '.slider .owl-nav *',
									'property'      => 'border-color',
								),
							),
						),
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
									'selector'		=> '.slider .owl-nav *::before',
									'property'      => 'background-color',
								),
								array(
									'selector'		=> '.slider .owl-nav *::after',
									'property'      => 'background-color',
								), 
							),
						),
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
									'selector'		=> '.slider .owl-nav *:hover',
									'property'      => 'background-color',
								),
								array(
									'selector'		=> '.slider .owl-nav *:hover',
									'property'      => 'background-color',
								), 
							),
						),
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
									'selector'		=> '.slider .owl-nav *:hover',
									'property'      => 'border-color',
								),
							),
						),
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
									'selector'		=> '.slider .owl-nav *:hover::before',
									'property'      => 'background-color',
								),
								array(
									'selector'		=> '.slider .owl-nav *:hover::after',
									'property'      => 'background-color',
								), 
							),
						),
					),
					'nav_size'        => array(
						'type'          => 'unit',
						'label'         => __('Nav Size', 'fl-builder'),
						'default'       => '',
						'preview'		=> array(
							'type'		=> 'css',
							'rules'           => array(
								array(
									'selector'		=> '.slider .owl-nav *',
									'property'      => 'width',
									'unit'      => 'px',
								),
								array(
									'selector'		=> '.slider .owl-nav *',
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
									'selector'		=> '.slider .owl-nav *',
									'property'      => 'border-radius',
									'unit'      => 'px',
								),
								array(
									'selector'		=> '.slider .owl-nav *',
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
									'selector'		=> '.slider .owl-nav .owl-prev',
									'property'      => 'left',
									'unit'      => 'px',
								),
								array(
									'selector'		=> '.slider .owl-nav .owl-next',
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
									'selector'		=> '.slider .owl-nav *::before',
									'property'      => 'width',
									'unit'      => 'px',
								),
								array(
									'selector'		=> '.slider .owl-nav *::after',
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
									'selector'		=> '.slider .owl-nav *',
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
									'selector'		=> '.slider .owl-nav *::before',
									'property'      => 'border-radius',
									'unit'      => 'px',
								),
								array(
									'selector'		=> '.slider .owl-nav *::after',
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
									'selector'		=> '.slider .owl-nav',
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

/**
 * Register a settings form to use in the "form" field type above.
 */
FLBuilder::register_settings_form('owl_slider_form', array(
	'title' => __('Slide', 'fl-builder'),
	'tabs'  => array(
		'slide'      => array(
			'title'         => __('Slide Info', 'fl-builder'),
			'sections'      => array(
				'info_bg'       => array(
					'title'         => __('Background', 'fl-builder'),
					'fields'        => array(
						'slider_bg_image'       => array(
							'type'          => 'photo',
							'label'         => 'Background Image',
							'show_remove' 	=> true,
						),
						'slider_bg_image_position'    => array(
							'type'          => 'select',
							'label'         => __('Background Position', 'fl-builder'),
							'default'   	=> '',
							'placeholder'   => '100',
							'options'       => array(
								'middle'    => __('Middle', 'fl-builder'),
								'top'    	=> __('Top', 'fl-builder'),
								'bottom'    => __('Bottom', 'fl-builder'),
							),
						),
						'slide_overlay_color'       => array(
							'type'          => 'color',
							'label'         => 'Overlay Color',
							'show_reset'    => true,
							'preview'       => array(
								'type'          => 'css',
								'selector'      => '.slider:before',
								'property'      => 'background-color',
							)
						), 
						'slide_overlay_opacity'    => array(
							'type'          => 'unit',
							'label'         => __('Background Overlay Opacity', 'fl-builder'),
							'description'   => '0 to 1 eg: 0.6',
							'placeholder'   => '0.5',
							'preview'       => array(
								'type'          => 'css',
								'selector'      => '.slider:before',
								'property'      => 'opacity',
							)
						),
						'slider_bg_offset'    => array(
							'type'          => 'unit',
							'label'         => __('Background Offset', 'fl-builder'),
							'description'   => 'Add overflow effect for png products',
							'placeholder'   => '100',
							'preview'       => array(
								'type'          => 'css',
								'selector'      => '.slide-item:not(.center)::before, .slide-item:not(.center)::after',
								'property'      => 'bottom',
							)
						),
						'slider_bg_image_mobile_setting'        => array(
							'type'          => 'select',
							'label'         => __('Change Background Mobile', 'fl-builder'),
							'default'       => 'false',
							'options'       => array(
								'true'    => __('Yes', 'fl-builder'),
								'false'    	=> __('No', 'fl-builder'),
							),
							'toggle'        => array(
								'true'        => array(
									'fields'        => array('slider_bg_image_mobile', 'slider_bg_image_mobile_bottom_spacing', 'slider_bg_image_mobile_portrait_bottom_spacing')
								),
							),
						),
						'slider_bg_image_mobile'       => array(
							'type'          => 'photo',
							'label'         => 'Background Image Mobile',
							'show_remove' 	=> true,
						),
						'slider_bg_image_mobile_bottom_spacing'       => array(
							'type'          => 'unit',
							'label'         => 'Background Image Mobile Bottom Spacing',
							'placeholder'   => '320',
							'description'   => 'px',
						),
						'slider_bg_image_mobile_portrait_bottom_spacing'       => array(
							'type'          => 'unit',
							'label'         => 'Background Image Mobile Portrait Bottom Spacing',
							'placeholder'   => '220',
							'description'   => 'px',
						),
					),
				),
				'info_image'       => array(
					'title'         => __('Image', 'fl-builder'),
					'fields'        => array(
						'slider_image'       => array(
							'type'          => 'photo',
							'label'         => 'Slide Image',
							'show_remove' 	=> true,
						),
						'slider_bottom_image'       => array(
							'type'          => 'photo',
							'label'         => 'Bottom Image',
							'show_remove' 	=> true,
						),
						'slide_padding_top'       => array(
							'type'          => 'unit',
							'label'         => 'Image Padding Top',
							'maxlength'     => '3',
							'size'          => '4',
							'description'   => 'px',
							'responsive'  => array(
								'placeholder' => array(
									'default'    => ( isset( $global_settings->slide_padding_top ) ) ? $global_settings->slide_padding_top : '110',
									'medium'     => ( isset( $global_settings->slide_padding_top_medium ) ) ? $global_settings->slide_padding_top_medium : '',
									'responsive' => ( isset( $global_settings->slide_padding_top_responsive ) ) ? $global_settings->slide_padding_top_responsive : '',
								)
							),
						),    
						'slide_padding_bottom'       => array(
							'type'          => 'unit',
							'label'         => 'Image Padding Bottom',
							'placeholder'         => '70',
							'maxlength'     => '3',
							'size'          => '4',
							'description'   => 'px',
							'responsive'  => array(
								'placeholder' => array(
									'default'    => ( isset( $global_settings->slide_padding_bottom ) ) ? $global_settings->slide_padding_bottom : '',
									'medium'     => ( isset( $global_settings->slide_padding_bottom_medium ) ) ? $global_settings->slide_padding_bottom_medium : '',
									'responsive' => ( isset( $global_settings->slide_padding_bottom_responsive ) ) ? $global_settings->slide_padding_bottom_responsive : '',
								)
							),
						),    
						'slide_padding_left'       => array(
							'type'          => 'unit',
							'label'         => 'Image Padding Left',
							'maxlength'     => '3',
							'size'          => '4',
							'description'   => 'px',
							'responsive'  => array(
								'placeholder' => array(
									'default'    => ( isset( $global_settings->slide_padding_left ) ) ? $global_settings->slide_padding_left : '80',
									'medium'     => ( isset( $global_settings->slide_padding_left_medium ) ) ? $global_settings->slide_padding_left_medium : '',
									'responsive' => ( isset( $global_settings->slide_padding_left_responsive ) ) ? $global_settings->slide_padding_left_responsive : '',
								)
							),
						),    
						'slide_padding_right'       => array(
							'type'          => 'unit',
							'label'         => 'Image Padding Right',
							'maxlength'     => '3',
							'size'          => '4',
							'description'   => 'px',
							'responsive'  => array(
								'placeholder' => array(
									'default'    => ( isset( $global_settings->slide_padding_right ) ) ? $global_settings->slide_padding_right : '80',
									'medium'     => ( isset( $global_settings->slide_padding_right_medium ) ) ? $global_settings->slide_padding_right_medium : '',
									'responsive' => ( isset( $global_settings->slide_padding_right_responsive ) ) ? $global_settings->slide_padding_right_responsive : '',
								)
							),
						),
					),
				),
				'info_video'       => array(
					'title'         => __('Video Button', 'fl-builder'),
					'fields'        => array(
						'slider_video_button'       => array(
							'type'          => 'text',
							'label'         => 'Video Url',
							'default'   => __('', 'fl-builder'),
							'placeholder'   => __('https://www.youtube.com/watch?v=DJn3TkvKHkE', 'fl-builder'),
						),
					),
				),
				'info_text'       => array(
					'title'         => __('Text', 'fl-builder'),
					'fields'        => array(
                        'slider_prefix'       => array(
							'type'          => 'text',
							'label'         => 'Prefix Subtitle',
							'default'   => __("Welcome", 'fl-builder'),
							'placeholder'   => __("Place text here", 'fl-builder'),
						),
						'owl_slider_title'       => array(
							'type'          => 'text',
							'label'         => 'Title',
							'default'   => __("Be one of the first to experience", 'fl-builder'),
							'placeholder'   => __("You don't have to be born with a <span>beautiful smile</span> to have one!", 'fl-builder'),
						),
						'slider_text'       => array(
							'type'          => 'textarea',
							'label'         => 'Text',
							'default'   => __('The untapped potential of the region.', 'fl-builder'),
						),
						'text_padding_top'       => array(
							'type'          => 'unit',
							'label'         => 'Text Padding Top',
							'maxlength'     => '3',
							'size'          => '4',
							'description'   => 'px',
							'responsive'  => array(
								'placeholder' => array(
									'default'    => ( isset( $global_settings->text_padding_top ) ) ? $global_settings->text_padding_top : '110',
									'medium'     => ( isset( $global_settings->text_padding_top_medium ) ) ? $global_settings->text_padding_top_medium : '',
									'responsive' => ( isset( $global_settings->text_padding_top_responsive ) ) ? $global_settings->text_padding_top_responsive : '',
								)
							),
						),
						'text_padding_bottom'       => array(
							'type'          => 'unit',
							'label'         => 'Text Padding Bottom',
							'maxlength'     => '3',
							'size'          => '4',
							'description'   => 'px',
							'responsive'  => array(
								'placeholder' => array(
									'default'    => ( isset( $global_settings->text_padding_bottom ) ) ? $global_settings->text_padding_bottom : '70',
									'medium'     => ( isset( $global_settings->text_padding_bottom_medium ) ) ? $global_settings->text_padding_bottom_medium : '',
									'responsive' => ( isset( $global_settings->text_padding_bottom_responsive ) ) ? $global_settings->text_padding_bottom_responsive : '',
								)
							),
						),    
						'text_padding_left'       => array(
							'type'          => 'unit',
							'label'         => 'Text Padding Left',
							'maxlength'     => '3',
							'size'          => '4',
							'description'   => 'px',
							'responsive'  => array(
								'placeholder' => array(
									'default'    => ( isset( $global_settings->text_padding_left ) ) ? $global_settings->text_padding_left : '80',
									'medium'     => ( isset( $global_settings->text_padding_left_medium ) ) ? $global_settings->text_padding_left_medium : '',
									'responsive' => ( isset( $global_settings->text_padding_left_responsive ) ) ? $global_settings->text_padding_left_responsive : '',
								)
							),
						),    
						'text_padding_right'       => array(
							'type'          => 'unit',
							'label'         => 'Text Padding Right',
							'maxlength'     => '3',
							'size'          => '4',
							'description'   => 'px',
							'responsive'  => array(
								'placeholder' => array(
									'default'    => ( isset( $global_settings->text_padding_right ) ) ? $global_settings->text_padding_right : '80',
									'medium'     => ( isset( $global_settings->text_padding_right_medium ) ) ? $global_settings->text_padding_right_medium : '',
									'responsive' => ( isset( $global_settings->text_padding_right_responsive ) ) ? $global_settings->text_padding_right_responsive : '',
								)
							),
						),
					),
				),
				'info_buttons'       => array(
					'title'         => __('Buttons', 'fl-builder'),
					'fields'        => array(
						'slider_btn_title'       => array(
							'type'          => 'text',
							'label'         => 'Button Title',
							'default'   => __('', 'fl-builder'),
							'placeholder'   => __('Call to <em>Action</em> Text', 'fl-builder'),
						),
						'slider_btn_1_label'       => array(
							'type'          => 'text',
							'label'         => 'Button 1 label',
							'default'   => __('', 'fl-builder'),
							'placeholder'   => __('Primary', 'fl-builder'),
						),
						'slider_btn_1_link'       => array(
							'type'          => 'link',
							'label'         => 'Button 1 Link',
						),
						'slider_btn_2_label'       => array(
							'type'          => 'text',
							'label'         => 'Button 2 label',
							'default'   => __('', 'fl-builder'),
							'placeholder'   => __('Secondary', 'fl-builder'),
						),
						'slider_btn_2_link'       => array(
							'type'          => 'link',
							'label'         => 'Button 2 Link',
						),
					)
				),
				'scroller'       => array(
					'title'         => __('Scroller', 'fl-builder'),
					'fields'        => array(
						'slider_scroller'        => array(
							'type'          => 'select',
							'label'         => __('Enable Scroller', 'fl-builder'),
							'default'       => 'false',
							'options'       => array(
								'true'   	=> __('Yes', 'fl-builder'),
								'false'     => __('No', 'fl-builder'),
							),
							'toggle'        => array(
								'true'      => array(
									'fields'        => array('slider_scroller_target', 'slider_scroller_bottom_spacing'),
								),
							)
						),
						'slider_scroller_target'        => array(
							'type'          => 'text',
							'label'         => __('Target Section ID', 'fl-builder'),
							'placeholder'       => 'below-slider-id',
							'description'       => 'add ID on next row setting',
						),
						'slider_scroller_bottom_spacing'        => array(
							'type'          => 'unit',
							'label'         => __('Scroller Bottom Spacing', 'fl-builder'),
							'responsive'  => array(
								'placeholder' => array(
									'default'    => ( isset( $global_settings->slider_scroller_bottom_spacing ) ) ? $global_settings->slider_scroller_bottom_spacing : '15',
									'medium'     => ( isset( $global_settings->slider_scroller_bottom_spacing_medium ) ) ? $global_settings->slider_scroller_bottom_spacing_medium : '',
									'responsive' => ( isset( $global_settings->slider_scroller_bottom_spacing_responsive ) ) ? $global_settings->slider_scroller_bottom_spacing_responsive : '',
								)
							),
						),
					),
				),
			)
		),
		'slide_setting'      => array(
			'title'         => __('Slide Setting', 'fl-builder'),
			'sections'      => array(
				'slide_aligment'       => array(
					'title'         => __('Slide Style', 'fl-builder'),
					'fields'        => array(
						'slider_style'        => array(
							'type'          => 'select',
							'label'         => __('Slide Aligment', 'fl-builder'),
							'default'       => 'center',
							'options'       => array(
								'left'    	=> __('Left', 'fl-builder'),
								'center'    => __('Center', 'fl-builder'),
								'right'     => __('Right', 'fl-builder'),
							),
							'toggle'        => array(
								'center'        => array(
									'fields'        => array('slider_bottom_image')
								),
							),
						),
						'slider_style_text_aligment'        => array(
							'type'          => 'select',
							'label'         => __('Slide Style Text Alignment', 'fl-builder'),
							'default'       => '',
							'options'       => array(
								''    	=> __('Default', 'fl-builder'),
								'left'    	=> __('Left', 'fl-builder'),
								'center'    => __('Center', 'fl-builder'),
								'right'     => __('Right', 'fl-builder'),
							),
						),
						'slide_text_vertical_align'        => array(
							'type'          => 'select',
							'label'         => __('Slide Style Text Vertical Alignment', 'fl-builder'),
							'default'       => '',
							'options'       => array(
								''    		=> __('Default', 'fl-builder'),
								'top'    	=> __('Top', 'fl-builder'),
								'middle'    => __('Middle', 'fl-builder'),
								'bottom'    => __('Bottom', 'fl-builder'),
							),
						),
						'slider_style_text_width'        => array(
							'type'          => 'unit',
							'label'         => __('Slide Style Text Width', 'fl-builder'),
							'default'       => '',
							'description'   => '%',
							'responsive'  => array(
								'placeholder' => array(
									'default'    => ( isset( $global_settings->slider_style_text_width ) ) ? $global_settings->slider_style_text_width : '50',
									'medium'     => ( isset( $global_settings->slider_style_text_width_medium ) ) ? $global_settings->slider_style_text_width_medium : '',
									'responsive' => ( isset( $global_settings->slider_style_text_width_responsive ) ) ? $global_settings->slider_style_text_width_responsive : '',
								)
							),
						),
						'slider_title_max_width'       => array(
							'type'          => 'unit',
							'label'         => 'Title Max Width',
							'description'   => '%',
							'responsive'  => array(
								'placeholder' => array(
									'default'    => ( isset( $global_settings->slider_title_max_width ) ) ? $global_settings->slider_title_max_width : '65',
									'medium'     => ( isset( $global_settings->slider_title_max_width_medium ) ) ? $global_settings->slider_title_max_width_medium : '',
									'responsive' => ( isset( $global_settings->slider_title_max_width_responsive ) ) ? $global_settings->slider_title_max_width_responsive : '',
								)
							),
						),
						'slider_text_max_width'       => array(
							'type'          => 'unit',
							'label'         => 'Text Max Width',
							'description'   => '%',
							'responsive'  => array(
								'placeholder' => array(
									'default'    => ( isset( $global_settings->slider_text_max_width ) ) ? $global_settings->slider_text_max_width : '30',
									'medium'     => ( isset( $global_settings->slider_text_max_width_medium ) ) ? $global_settings->slider_text_max_width_medium : '',
									'responsive' => ( isset( $global_settings->slider_text_max_width_responsive ) ) ? $global_settings->slider_text_max_width_responsive : '',
								)
							),
						),
					)
				),
				'font_size'       => array(
					'title'         => __('Font Size', 'fl-builder'),
					'fields'        => array(
						'slider_text_size'       => array(
							'type'          => 'unit',
							'label'         => 'Text Size',
							'description'   => 'px',
							'responsive'  => array(
								'placeholder' => array(
									'default'    => ( isset( $global_settings->slider_text_size ) ) ? $global_settings->slider_text_size : '22',
									'medium'     => ( isset( $global_settings->slider_text_size_medium ) ) ? $global_settings->slider_text_size_medium : '',
									'responsive' => ( isset( $global_settings->slider_text_size_responsive ) ) ? $global_settings->slider_text_size_responsive : '',
								)
							),
						),
						'slider_btn_title_size'       => array(
							'type'          => 'unit',
							'label'         => 'Buttons Title Size',
							'description'   => 'px',
							'responsive'  => array(
								'placeholder' => array(
									'default'    => ( isset( $global_settings->slider_btn_title_size ) ) ? $global_settings->slider_btn_title_size : '30',
									'medium'     => ( isset( $global_settings->slider_btn_title_size_medium ) ) ? $global_settings->slider_btn_title_size_medium : '',
									'responsive' => ( isset( $global_settings->slider_btn_title_size_responsive ) ) ? $global_settings->slider_btn_title_size_responsive : '',
								)
							),
						),
						'slider_btn_label_size'       => array(
							'type'          => 'unit',
							'label'         => 'Button Size',
							'description'   => 'px',
							'responsive'  => array(
								'placeholder' => array(
									'default'    => ( isset( $global_settings->slider_btn_label_size ) ) ? $global_settings->slider_btn_label_size : '16',
									'medium'     => ( isset( $global_settings->slider_btn_label_size_medium ) ) ? $global_settings->slider_btn_label_size_medium : '',
									'responsive' => ( isset( $global_settings->slider_btn_label_size_responsive ) ) ? $global_settings->slider_btn_label_size_responsive : '',
								)
							),
						),
					)
				),
				'font_color'       => array(
					'title'         => __('Font Color', 'fl-builder'),
					'fields'        => array(
						'slider_title_color'       => array(
							'type'          => 'color',
							'label'         => 'Title Color',
							'show_reset'    => true,
						),
						'slider_title_span_color'       => array(
							'type'          => 'color',
							'label'         => 'Title Span Color',
							'show_reset'    => true,
						),
						'slider_text_color'       => array(
							'type'          => 'color',
							'label'         => 'Text Color',
							'show_reset'    => true,
						),
						'slider_text_span_color'       => array(
							'type'          => 'color',
							'label'         => 'Text Span Color',
							'show_reset'    => true,
						),
						'slider_btn_title_color'       => array(
							'type'          => 'color',
							'label'         => 'Buttons Title Color',
							'show_reset'    => true,
						),
						'slider_btn_title_span_color'       => array(
							'type'          => 'color',
							'label'         => 'Buttons Title Span Color',
							'show_reset'    => true,
						),
						'slider_btn_label_color'       => array(
							'type'          => 'color',
							'label'         => 'Button label Color',
							'show_reset'    => true,
						),
						'slider_btn_label_span_color'       => array(
							'type'          => 'color',
							'label'         => 'Button label Span Color',
							'show_reset'    => true,
						),
						'slider_btn_border_color'       => array(
							'type'          => 'color',
							'label'         => 'Button Border Color',
							'show_reset'    => true,
						),
						'slider_btn_label_highlight_color'       => array(
							'type'          => 'color',
							'label'         => 'Button Highlight label Color',
							'show_reset'    => true,
						),
						'slider_btn_border_highlight_color'       => array(
							'type'          => 'color',
							'label'         => 'Button Highlight Border Color',
							'show_reset'    => true,
						),
						'slider_scroller_color'       => array(
							'type'          => 'color',
							'label'         => 'Scroller Color',
							'show_reset'    => true,
						),
					)
				),
			)
		),
	)
));