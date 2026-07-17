<?php
/**
 * @class aogPricingSlider
 */
class aogPricingSlider extends FLBuilderModule {

	/** 
	 * @method __construct
	 */  
	public function __construct()
	{
		global $customcategory;
		parent::__construct(array(
			'name'          	=> __('AOG - Pricing Slider', 'aog-pricing-slider'),
			'description'   	=> __('Display Slideshow of pricing boxes.', 'aog-pricing-slider'),
			'category'      	=> __($customcategory, 'aog-pricing-slider'),
			'partial_refresh'	=> true
		));
		// Register and enqueue your own.
		$this->add_css( 'animate', BB_CUSTOM_MODULES_URL . 'assets/css/animate.css' );
		$this->add_css( 'flickity-style', BB_CUSTOM_MODULES_URL . 'assets/flickity/flickity.min.css' );
		$this->add_js( 'flickity', BB_CUSTOM_MODULES_URL . 'assets/flickity/flickity.pkgd.min.js', array(), '', true );
	}
	/**
	 * @method get_classname
	 */
	public function get_classname()
	{
		$classname = 'aog-pricing-slider';
		return $classname;
	}
    
    /**
	 * Returns link rel based on settings.
	 * @since 2.2
	 * @return string
	 */
	public function get_rel_link($i) {
        $items = $this->settings->items[ $i ];
		$rel = array();
        if ( '_blank' == $items->btn_url_target ) {
            $rel[] = 'noopener';
        }
        if ( isset( $items->btn_url_nofollow ) && 'yes' == $items->btn_url_nofollow ) {
            $rel[] = 'nofollow';
        }
        $rel = implode( ' ', $rel );
        if ( $rel ) {
            $rel = ' rel="' . $rel . '" ';
        }
        return $rel;
	}
}

$global_settings = FLBuilderModel::get_global_settings();
/**
 * Register the module and its form settings.
 */
FLBuilder::register_module('aogPricingSlider', array(
	'content'         => array(
		'title'         => __('Content', 'aog-pricing-slider'),
		'sections'      => array(
			'general'       => array(
				'title'         => '',
				'fields'        => array(
					'items'         => array(
						'type'          => 'form',
						'label'         => __('Slide', 'aog-pricing-slider'),
						'form'          => 'aog_slider_item', // ID from registered form below
						'preview_text'  => 'aog_slide_title', // Name of a field to use for the preview text
						'multiple'      => true
					)
				)
			)
		)
	),
	'style'        => array(
		'title'         => __('Styles', 'aog-pricing-slider'),
		'sections'      => array(
            'border_section'       => array(
				'title'         => __('Box Border', 'aog-pricing-slider'),
				'fields'        => array(
                    'box_border' => array(
                        'type'       => 'border',
                        'label'      => 'Box Border',
                        'responsive' => true,
                        'preview'    => array(
                            'type'     => 'css',
							'selector' => '.content-box-wrapper',
							'property' => 'border'
                        )
                    ),
                    'box_margin' => array(
                    	'type'        => 'dimension',
                    	'label'       => 'Box Margin',
                    	'description' => 'px',
                    	'preview'    => array(
                    		'type'     => 'css',
							'selector' => '.content-box-wrapper',
							'property' => 'margin'
                    	)
					),
					'outer_box_padding' => array(
                    	'type'        => 'dimension',
                    	'label'       => 'Outer Box Padding',
                    	'description' => 'px',
                    	'preview'    => array(
                    		'type'     => 'css',
							'selector' => '.content-box-wrapper',
							'property' => 'padding'
                    	)
                    ),
					'box_padding' => array(
                    	'type'        => 'dimension',
                    	'label'       => 'Box Padding',
                    	'description' => 'px',
                    	'preview'    => array(
                    		'type'     => 'css',
							'selector' => '.content-box-wrapper .slide',
							'property' => 'padding'
                    	)
                    )
                )
			),
			'hr_section'       => array(
				'title'         => __('Title Horizontal Line', 'aog-pricing-slider'),
				'fields'        => array(
					'hr_border' => array(
                        'type'       => 'border',
                        'label'      => 'Horizontal Line Border',
                        'responsive' => true,
                        'preview'    => array(
                            'type'     => 'css',
							'selector' => '{node} .aog-pricing-slider .slide hr',
							'property' => 'border'
                        )
                    )
                )
            ),
            'column_section'       => array(
				'title'         => __('Column', 'aog-pricing-slider'),
				'fields'        => array(
                    'box_column'        => array(
						'type'          => 'select',
						'label'         => __('Desktop Columns', 'fl-builder'),
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
					'box_column_tablet'        => array(
						'type'          => 'select',
						'label'         => __('Tablet Columns', 'fl-builder'),
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
					'box_column_mobile'        => array(
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
					)
                )
            )
		)
	),
    'typography'        => array(
		'title'         => __('Typography', 'aog-pricing-slider'),
		'sections'      => array(
            'prefix'       => array(
				'title'         => __('Prefix', 'aog-pricing-slider'),
				'fields'        => array(
                    'prefix_tag'     => array(
						'type'    => 'select',
						'label'   => __( 'HTML Tag', 'aog-pricing-slider' ),
						'default' => 'h5',
						'options' => array(
							'h1' => 'H1',
							'h2' => 'H2',
							'h3' => 'H3',
							'h4' => 'H4',
							'h5' => 'H5',
							'h6' => 'H6',
							'div' => 'Div',
							'p' => 'p',
							'span' => 'span',
						),
					),
                    'prefix_color'        => array(
						'type'          => 'color',
						'label'         => __('Color', 'aog-pricing-slider'),
						'default'       => '',
						'show_reset'       => true,
						'preview'		=> array(
							'type'		=> 'css',
							'selector'		=> '{node} .slide-prefix',
							'property'      => 'color',
						),
					),
					'prefix_typography'        => array(
						'type'       => 'typography',
                    	'label'      => 'Typography',
                    	'responsive' => true,
                    	'preview'    => array(
                    		'type'	    => 'css',
                    		'selector'  => '{node} .slide-prefix',
                    	),
					)
				)
			),
			'title'       => array(
				'title'         => __('Title', 'aog-pricing-slider'),
				'fields'        => array(
                    'title_tag'     => array(
						'type'    => 'select',
						'label'   => __( 'HTML Tag', 'aog-pricing-slider' ),
						'default' => 'h2',
						'options' => array(
							'h1' => 'H1',
							'h2' => 'H2',
							'h3' => 'H3',
							'h4' => 'H4',
							'h5' => 'H5',
							'h6' => 'H6',
							'div' => 'Div',
							'p' => 'p',
							'span' => 'span',
						),
					),
                    'title_color'        => array(
						'type'          => 'color',
						'label'         => __('Color', 'aog-pricing-slider'),
						'default'       => '',
						'show_reset'       => true,
						'preview'		=> array(
							'type'		=> 'css',
							'selector'		=> '{node} .slide-title',
							'property'      => 'color',
						),
					),
					'title_typography'        => array(
						'type'       => 'typography',
                    	'label'      => 'Typography',
                    	'responsive' => true,
                    	'preview'    => array(
                    		'type'	    => 'css',
                    		'selector'  => '{node} .slide-title',
                    	),
					)
				)
			),
			'subtitle'       => array(
				'title'         => __('Subtitle', 'aog-pricing-slider'),
				'fields'        => array(
                    'subtitle_tag'     => array(
						'type'    => 'select',
						'label'   => __( 'HTML Tag', 'aog-pricing-slider' ),
						'default' => 'h5',
						'options' => array(
							'h1' => 'H1',
							'h2' => 'H2',
							'h3' => 'H3',
							'h4' => 'H4',
							'h5' => 'H5',
							'h6' => 'H6',
							'div' => 'Div',
							'p' => 'p',
							'span' => 'span',
						),
					),
                    'subtitle_color'        => array(
						'type'          => 'color',
						'label'         => __('Color', 'aog-pricing-slider'),
						'default'       => '',
						'show_reset'       => true,
						'preview'		=> array(
							'type'		=> 'css',
							'selector'		=> '{node} .slide-subtitle',
							'property'      => 'color',
						),
					),
					'subtitle_typography'        => array(
						'type'       => 'typography',
                    	'label'      => 'Typography',
                    	'responsive' => true,
                    	'preview'    => array(
                    		'type'	    => 'css',
                    		'selector'  => '{node} .slide-subtitle',
                    	),
					)
				)
			),
			'pricing'       => array(
				'title'         => __('Pricing', 'aog-pricing-slider'),
				'fields'        => array(
                    'pricing_tag'     => array(
						'type'    => 'select',
						'label'   => __( 'HTML Tag', 'aog-pricing-slider' ),
						'default' => 'h2',
						'options' => array(
							'h1' => 'H1',
							'h2' => 'H2',
							'h3' => 'H3',
							'h4' => 'H4',
							'h5' => 'H5',
							'h6' => 'H6',
							'div' => 'Div',
							'p' => 'p',
							'span' => 'span',
						),
					),
                    'pricing_color'        => array(
						'type'          => 'color',
						'label'         => __('Color', 'aog-pricing-slider'),
						'default'       => '',
						'show_reset'       => true,
						'preview'		=> array(
							'type'		=> 'css',
							'selector'		=> '{node} .slide-pricing',
							'property'      => 'color',
						),
					),
					'pricing_typography'        => array(
						'type'       => 'typography',
                    	'label'      => 'Typography',
                    	'responsive' => true,
                    	'preview'    => array(
                    		'type'	    => 'css',
                    		'selector'  => '{node} .slide-pricing',
                    	),
					)
				)
			),
            'content'       => array(
				'title'         => __('Content', 'aog-pricing-slider'),
				'fields'        => array(
                    'content_color'        => array(
						'type'          => 'color',
						'label'         => __('Color', 'aog-pricing-slider'),
						'default'       => '',
						'show_reset'       => true,
						'preview'		=> array(
							'type'		=> 'css',
							'selector'		=> '{node} .slide-content',
							'property'      => 'color',
						),
					),
					'content_typography'        => array(
						'type'       => 'typography',
                    	'label'      => 'Typography',
                    	'responsive' => true,
                    	'preview'    => array(
                    		'type'	    => 'css',
                    		'selector'  => '{node} .slide-content',
                    	),
					)
				)
			)
		)
	),
	'setting'        => array(
		'title'         => __('Settings', 'aog-pricing-slider'),
		'sections'      => array(
			'behavior'       => array(
				'title'         => 'Behavior',
				'fields'        => array(
					'autoplay'        => array(
						'type'          => 'select',
						'label'         => __('Autoplay', 'aog-pricing-slider'),
						'default'       => 'false',
						'options'       => array(
							'true'    => __('Yes', 'aog-pricing-slider'),
							'false'      => __('No', 'aog-pricing-slider'),
						),
						'toggle'        => array(
							'true'        => array(
								'fields'        => array('autoplay_speed')
							),
						),
					),
                    'autoplay_speed'        => array(
						'type'          => 'unit',
						'label'         => __('Autoplay Speed', 'aog-pricing-slider'),
						'placeholder'       => '10000',
						'description'       => 'Millisecond',
					),
					'attraction'        => array(
						'type'          => 'unit',
						'label'         => __('Attraction', 'aog-pricing-slider'),
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
						'label'         => __('Friction', 'aog-pricing-slider'),
						'placeholder'       => '1',
						'description'       => '%',
                        'help'              => 'Set attraction and friction higher for faster transitions between slides (bouncy effect) and set attraction and friction lower for smoother and slower transitions',
                        'slider' => array(
                            'min'  	=> 1,
                            'max'  	=> 100,
                            'step' 	=> 1,
                        )
					),
					'nav_arrows'        => array(
						'type'          => 'select',
						'label'         => __('Navigation Arrows', 'aog-pricing-slider'),
						'default'       => 'false',
						'options'       => array(
							'true'    => __('Yes', 'aog-pricing-slider'),
							'false'      => __('No', 'aog-pricing-slider'),
						)
					),
					'nav_dots'        => array(
						'type'          => 'select',
						'label'         => __('Navigation Dots', 'aog-pricing-slider'),
						'default'       => 'false',
						'options'       => array(
							'true'    => __('Yes', 'aog-pricing-slider'),
							'false'      => __('No', 'aog-pricing-slider'),
						)
					)
				)
			)
		)
	)
));

/**
 * Register a settings form to use in the "form" field type above.
 */
FLBuilder::register_settings_form('aog_slider_item', array(
	'title' => __('Slide', 'aog-pricing-slider'),
	'tabs'  => array(
		'slide'      => array(
			'title'         => __('Content', 'aog-pricing-slider'),
			'sections'      => array(
                'content'       => array(
                    'title'         => 'Content',
                    'fields'        => array(
						'aog_slide_prefix'         => array(
                            'type'          => 'text',
                            'label'         => __('Slide Prefix', 'aog-pricing-slider'),
                            'placeholder'   => __('Enter text here', 'aog-pricing-slider')
                        ),
                        'aog_slide_title'         => array(
                            'type'          => 'text',
                            'label'         => __('Slide Title', 'aog-pricing-slider'),
                            'placeholder'   => __('Enter text here', 'aog-pricing-slider')
						),
						'aog_slide_subtitle'         => array(
                            'type'          => 'text',
                            'label'         => __('Slide Subtitle', 'aog-pricing-slider'),
                            'placeholder'   => __('Enter text here', 'aog-pricing-slider')
                        ),
						'aog_slide_price'         => array(
                            'type'          => 'text',
                            'label'         => __('Price', 'aog-pricing-slider'),
                            'placeholder'   => __('Enter text here', 'aog-pricing-slider')
                        ),
                        'price_content'         => array(
                            'type'          => 'editor',
                            'label'         => '',
                        )
                    )
                )
            )
        ),
        'link'      => array(
			'title'         => __('Button', 'aog-pricing-slider'),
			'sections'      => array(
                'link'       => array(
				'title'         => 'Button',
					'fields'        => array(
						'link_color'        => array(
							'type'          => 'color',
							'label'         => __('Overall Color', 'aog-pricing-slider'),
							'default'       => '',
							'show_reset'  => true,
							'show_alpha'  => true,
							'rules' => array(
								array(
									'selector'     => '{node} .btn',
									'property'     => 'border-color'
								),
								array(
									'selector'     => '{node} .aog-icon',
									'property'     => 'color'
								),
								array(
									'selector'     => '{node} .btn .btn-label',
									'property'     => 'color'
								),
							)
						),
						'icon_type'        => array(
							'type'          => 'select',
							'label'         => __('Icon Type', 'aog-pricing-slider'),
							'default'       => 'icon',
							'options'       => array(
								'icon'      => __('Icon', 'aog-pricing-slider'),
								'image'     => __('Image', 'aog-pricing-slider'),
							),
							'toggle'        => array(
								'icon'        => array(
									'fields'        => array('icon', 'icon_size' )
								),
								'image'        => array(
									'fields'        => array('image', 'image_size')
								)
							),
						),
						'icon' => array(
							'type'          => 'icon',
							'label'         => __( 'Icon', 'aog-pricing-slider' ),
							'show_remove'   => true
						),
						'icon_size' => array(
							'type'         => 'unit',
							'label'        => 'Icon Size',
							'units'          => array( 'px', 'vw' ),
							'default_unit' => 'px',
							'preview'    => array(
								'type'          => 'css',
								'selector'      => '.aog-icon',
								'property'      => 'font-size',
							),
						),
						'image' => array(
							'type'          => 'photo',
							'label'         => __('Image', 'aog-pricing-slider'),
							'show_remove'   => false,
						),
						'image_size' => array(
							'type'         => 'unit',
							'label'        => 'Image Size',
							'units'          => array( 'px', 'vw' ),
							'default_unit' => 'px',
							'preview'    => array(
								'type'          => 'css',
								'selector'      => 'img.img-icon',
								'property'      => 'width',
							),
						),
						'btn_label'       => array(
							'type'          => 'text',
							'label'         => 'Button Label',
							'default'   => __('', 'aog-pricing-slider'),
							'placeholder'   => __('Button Text', 'aog-pricing-slider'),
						),
						'btn_url'  => array(
							'type'          => 'link',
							'label'         => 'Link',
							'show_target'	=> true,
							'show_nofollow'	=> true
						),
						'btn_border' => array(
							'type'       => 'border',
							'label'      => 'Button Border',
							'responsive' => true,
							'preview'    => array(
								'type'     => 'css',
								'selector' => '{node} .btn.btn-outline',
							),
						),
						'btn_typography'       => array(
							'type'          => 'typography',
							'label'         => 'Typography',
							'responsive' => true,
							'preview'       => array(
								'type'          => 'css',
								'selector'      => '{node} .btn .btn-label',
							)
						), 
					)
				),
            )
        ),
        'background_tab'      => array(
			'title'         => __('Background', 'aog-pricing-slider'),
			'sections'      => array(
                'background_section'       => array(
                    'title'         => 'Gradient Background',
                    'fields'        => array(
                        'bg_overlay_type'     => array(
                            'type'    => 'select',
                            'label'   => __( 'Background Color Type', 'fl-builder' ),
                            'default' => 'color',
                            'options' => array(
                                'none'     => __( 'None', 'fl-builder' ),
                                'color'    => __( 'Color', 'fl-builder' ),
                                'gradient' => __( 'Gradient', 'fl-builder' ),
                            ),
                            'toggle'  => array(
                                'color'    => array(
                                    'fields' => array( 'bg_overlay_color' ),
                                ),
                                'gradient' => array(
                                    'fields' => array( 'bg_overlay_gradient1', 'bg_overlay_gradient2' ),
                                ),
                            ),
                            'preview' => array(
                                'type' => 'none',
                            ),
                        ),
                        'bg_overlay_color'    => array(
                            'type'        => 'color',
                            'connections' => array( 'color' ),
                            'label'       => __( 'Background Color', 'fl-builder' ),
                            'show_reset'  => true,
                            'show_alpha'  => true,
                            'preview'     => array(
                                'type' => 'none',
                            ),
                        ),
                        'bg_overlay_gradient1'    => array(
                            'type'        => 'color',
                            'connections' => array( 'color' ),
                            'label'       => __( '1st Gradient Color', 'fl-builder' ),
                            'show_reset'  => true,
                            'show_alpha'  => true,
                            'preview'     => array(
                                'type' => 'none',
                            ),
                        ),
                        'bg_overlay_gradient2'    => array(
                            'type'        => 'color',
                            'connections' => array( 'color' ),
                            'label'       => __( '2nd Gradient Color', 'fl-builder' ),
                            'show_reset'  => true,
                            'show_alpha'  => true,
                            'preview'     => array(
                                'type' => 'none',
                            ),
                        ),
                    )
                )
            )
        ),
        'layout'      => array(
			'title'         => __('Layout', 'aog-pricing-slider'),
			'sections'      => array(
                'slide_width'       => array(
                    'title'         => 'Content Width',
                    'fields'        => array(
                        'slide_column_content_width'       => array(
							'type'       => 'select',
							'label'      => __( 'Slide Content Width', 'aog-pricing-slider' ),
							'default'    => 'full',
							'responsive' => true,
							'options'    => array(
								'full'    => _x( 'Full', 'Background scale.', 'aog-pricing-slider' ),
								'custom'  => __( 'Custom', 'aog-pricing-slider' ),
							),
                            'toggle'  => array(
                                'custom' => array(
                                    'fields' => array( 'slide_column_max_width' ),
                                ),
                            )
						),
                        'slide_column_max_width' => array(
                            'type'         => 'unit',
                            'label'        => __( 'Custom Width', 'aog-pricing-slider' ),
                            'responsive' => true,
                            'placeholder'  => '100',
                            'default_unit' => '%',
                            'units'        => array(
                                'px',
                                'vw',
                                '%',
                            ),
                            'slider'       => array(
                                '%' => array(
                                    'min'  => 0,
                                    'max'  => 100,
                                    'step' => 1,
                                ),
                            )
                        )
                    )
                ),
                'alignment'       => array(
                    'title'         => 'Alignment',
                    'fields'        => array(
                        'slide_column_align' => array(
                            'type'    => 'align',
                            'label'   => 'Content Alignment',
                            'default' => 'center',
                            'responsive' => true,
                            'values'  => array(
                                'left'   => 'flex-start',
                                'center' => 'center',
                                'right'  => 'flex-end',
                            ),
                        ),
                        'slide_text_align' => array(
                            'type'    => 'align',
                            'label'   => 'Overall Text Alignment',
                            'default' => 'center',
                            'responsive' => true
                        ),
                        'slide_btns_align' => array(
                            'type'    => 'align',
                            'label'   => 'Slide Buttons Alignment',
                            'default' => 'center',
                            'responsive' => true,
                            'values'  => array(
                                'left'   => 'flex-start',
                                'center' => 'center',
                                'right'  => 'flex-end',
                            ),
                        ),
                    )
                )
            )
        )
    )
));