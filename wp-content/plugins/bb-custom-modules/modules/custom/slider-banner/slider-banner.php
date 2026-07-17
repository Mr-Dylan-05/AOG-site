<?php

/**
 * @class sliderBannerModule
 */
class sliderBannerModule extends FLBuilderModule {

	/** 
	 * @method __construct
	 */  
	public function __construct()
	{
		global $customcategory;
		parent::__construct(array(
			'name'          	=> __('Slider Banner', 'slider-banner'),
			'description'   	=> __('Display Slideshow of Hero Banner.', 'slider-banner'),
			'category'      	=> __($customcategory, 'slider-banner'),
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
		$classname = 'slider-banner';
		return $classname;
	}
    
    /**
	 * Returns link rel based on settings.
	 * @since 2.2
	 * @return string
	 */
	public function get_rel_btn1($i) {
        $items = $this->settings->items[ $i ];
		$rel = array();
        if ( '_blank' == $items->slide_btn1_link_target ) {
            $rel[] = 'noopener';
        }
        if ( isset( $items->slide_btn1_link_nofollow ) && 'yes' == $items->slide_btn1_link_nofollow ) {
            $rel[] = 'nofollow';
        }
        $rel = implode( ' ', $rel );
        if ( $rel ) {
            $rel = ' rel="' . $rel . '" ';
        }
        return $rel;
	}
    public function get_rel_btn2($i) {
        $items = $this->settings->items[ $i ];
		$rel = array();
        if ( '_blank' == $items->slide_btn2_link_target ) {
            $rel[] = 'noopener';
        }
        if ( isset( $items->slide_btn2_link_nofollow ) && 'yes' == $items->slide_btn2_link_nofollow ) {
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
FLBuilder::register_module('sliderBannerModule', array(
	'content'         => array(
		'title'         => __('Content', 'slider-banner'),
		'sections'      => array(
			'general'       => array(
				'title'         => '',
				'fields'        => array(
					'items'         => array(
						'type'          => 'form',
						'label'         => __('Slide', 'slider-banner'),
						'form'          => 'slider_form', // ID from registered form below
						'preview_text'  => 'slide_title', // Name of a field to use for the preview text
						'multiple'      => true
					)
				)
			)
		)
	),
	'style'        => array(
		'title'         => __('Styles', 'slider-banner'),
		'sections'      => array(
            'bg_overlay'   => array(
                'title'  => __( 'Background Overlay', 'fl-builder' ),
                'fields' => array(
                    'bg_overlay_type'     => array(
                        'type'    => 'select',
                        'label'   => __( 'Overlay Type', 'fl-builder' ),
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
                                'fields' => array( 'bg_overlay_gradient' ),
                            ),
                        ),
                        'preview' => array(
                            'type' => 'none',
                        ),
                    ),
                    'bg_overlay_color'    => array(
                        'type'        => 'color',
                        'connections' => array( 'color' ),
                        'label'       => __( 'Overlay Color', 'fl-builder' ),
                        'show_reset'  => true,
                        'show_alpha'  => true,
                        'preview'     => array(
                            'type' => 'none',
                        ),
                    ),
                    'bg_overlay_gradient' => array(
                        'type'    => 'gradient',
                        'label'   => __( 'Overlay Gradient', 'fl-builder' ),
                        'preview' => array(
                            'type'     => 'css',
                            'selector' => '.carousel-cell:after',
                            'property' => 'background-image',
                        ),
                    )
                )
            )
		)
	),
    'typography'        => array(
		'title'         => __('Typography', 'slider-banner'),
		'sections'      => array(
            'prefix'       => array(
				'title'         => __('Prefix', 'slider-banner'),
				'fields'        => array(
                    'prefix_tag'     => array(
						'type'    => 'select',
						'label'   => __( 'HTML Tag', 'slider-banner' ),
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
						'label'         => __('Color', 'slider-banner'),
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
				'title'         => __('Title', 'slider-banner'),
				'fields'        => array(
                    'title_tag'     => array(
						'type'    => 'select',
						'label'   => __( 'HTML Tag', 'slider-banner' ),
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
						'label'         => __('Color', 'slider-banner'),
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
            'content'       => array(
				'title'         => __('Content', 'slider-banner'),
				'fields'        => array(
                    'content_color'        => array(
						'type'          => 'color',
						'label'         => __('Color', 'slider-banner'),
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
		'title'         => __('Settings', 'slider-banner'),
		'sections'      => array(
            'general_settings'       => array(
				'title'         => '',
				'fields'        => array(
                    'slide_content_width' => array(
                        'type'    => 'select',
                        'label'   => __( 'Content Width', 'slider-banner' ),
                        'default' => $global_settings->row_content_width_default,
                        'options' => array(
                            'fixed' => __( 'Fixed', 'slider-banner' ),
                            'full'  => __( 'Full Width', 'slider-banner' ),
                        ),
                        'toggle'  => array(
                            'fixed' => array(
                                'fields' => array( 'slide_max_content_width' ),
                            ),
                        ),
                        'help'    => __( 'Full width content spans the width of the page from edge to edge. Fixed content is no wider than the Row Max Width set in the Global Settings.', 'slider-banner' ),
                    ),
                    'slide_max_content_width' => array(
                        'type'         => 'unit',
                        'label'        => __( 'Fixed Width', 'slider-banner' ),
                        'responsive' => true,
                        'placeholder'  => $global_settings->row_width,
                        'default_unit' => $global_settings->row_width_unit,
                        'units'        => array(
                            'px',
                            'vw',
                            '%',
                        ),
                        'slider'       => array(
                            'px' => array(
                                'min'  => 0,
                                'max'  => $global_settings->row_width,
                                'step' => 10,
                            ),
                        )
                    ),
                    'slide_full_height'       => array(
                        'type'    => 'select',
                        'label'   => __( 'Height', 'slider-banner' ),
                        'default' => 'default',
                        'options' => array(
                            'default' => __( 'Default', 'slider-banner' ),
                            'full'    => __( 'Full Height', 'slider-banner' ),
                            'custom'  => __( 'Minimum Height', 'slider-banner' ),
                        ),
                        'help'    => __( 'Full height rows fill the height of the browser window. Minimum height rows are at least as tall as the value entered.', 'slider-banner' ),
                        'toggle'  => array(
                            'custom' => array(
                                'fields' => array( 'slide_min_height' ),
                            ),
                        )
                    ),
                    'slide_min_height'        => array(
                        'type'       => 'unit',
                        'label'      => __( 'Minimum Height', 'slider-banner' ),
                        'responsive' => true,
                        'units'      => array(
                            'px',
                            'vw',
                            'vh',
                        ),
                        'slider'     => array(
                            'px' => array(
                                'min'  => 0,
                                'max'  => 1000,
                                'step' => 10,
                            ),
                        ),
                        'preview'    => array(
                            'type'     => 'css',
                            'selector' => '.slide',
                            'property' => 'height',
                        ),
                    )
				)
			),
			'behavior'       => array(
				'title'         => 'Behavior',
				'fields'        => array(
					'autoplay'        => array(
						'type'          => 'select',
						'label'         => __('Autoplay', 'slider-banner'),
						'default'       => 'false',
						'options'       => array(
							'true'    => __('Yes', 'slider-banner'),
							'false'      => __('No', 'slider-banner'),
						),
						'toggle'        => array(
							'true'        => array(
								'fields'        => array('autoplay_speed')
							),
						),
					),
                    'autoplay_speed'        => array(
						'type'          => 'unit',
						'label'         => __('Autoplay Speed', 'slider-banner'),
						'placeholder'       => '10000',
						'description'       => 'Millisecond',
					),
					'attraction'        => array(
						'type'          => 'unit',
						'label'         => __('Attraction', 'slider-banner'),
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
						'label'         => __('Friction', 'slider-banner'),
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
	)
));

/**
 * Register a settings form to use in the "form" field type above.
 */
FLBuilder::register_settings_form('slider_form', array(
	'title' => __('Slide', 'slider-banner'),
	'tabs'  => array(
		'slide'      => array(
			'title'         => __('Content', 'slider-banner'),
			'sections'      => array(
                'content'       => array(
                    'title'         => 'Content',
                    'fields'        => array(
                        'slide_prefix'         => array(
                            'type'          => 'text',
                            'label'         => __('Slide Prefix', 'slider-banner'),
                            'placeholder'   => __('Enter text here', 'slider-banner')
                        ),
                        'slide_title'         => array(
                            'type'          => 'text',
                            'label'         => __('Slide Title', 'slider-banner'),
                            'placeholder'   => __('Enter text here', 'slider-banner')
                        ),
                        'slide_content'         => array(
                            'type'          => 'editor',
                            'label'         => '',
                        )
                    )
                )
            )
        ),
        'button'      => array(
			'title'         => __('Button', 'slider-banner'),
			'sections'      => array(
                'button1'       => array(
                    'title'         => 'Button 1',
                    'fields'        => array(
                        'slide_btn1_text'         => array(
                            'type'          => 'text',
                            'label'         => __('Button 1 text', 'slider-banner'),
                            'default'       => __('Click Here', 'slider-banner'),
                            'placeholder'   => __('Enter text here', 'slider-banner')
                        ),
                        'slide_btn1_link'  => array(
                            'type'          => 'link',
                            'label'         => 'Link',
                            'show_target'	=> true,
                            'show_nofollow'	=> true
                        )
                    )
                ),
                'button2'       => array(
                    'title'         => 'Button 2',
                    'fields'        => array(
                        'slide_btn2_text'         => array(
                            'type'          => 'text',
                            'label'         => __('Button 2 text', 'slider-banner'),
                            'default'       => __('Click Here', 'slider-banner'),
                            'placeholder'   => __('Enter text here', 'slider-banner')
                        ),
                        'slide_btn2_link'  => array(
                            'type'          => 'link',
                            'label'         => 'Link',
                            'show_target'	=> true,
                            'show_nofollow'	=> true
                        )
                    )
                )
            )
        ),
        'image'      => array(
			'title'         => __('Image', 'slider-banner'),
			'sections'      => array(
                'background'       => array(
                    'title'         => 'Background',
                    'fields'        => array(
                        'bg_image'      => array(
							'type'        => 'photo',
							'show_remove' => true,
							'label'       => __( 'Photo', 'slider-banner' ),
							'responsive'  => true,
							'connections' => array( 'photo' ),
							'preview'     => array(
								'type'     => 'css',
								'selector' => '.slide',
								'property' => 'background-image',
							),
						),
						'bg_repeat'     => array(
							'type'       => 'select',
							'label'      => __( 'Repeat', 'slider-banner' ),
							'default'    => 'none',
							'responsive' => true,
							'options'    => array(
								'no-repeat' => _x( 'None', 'Background repeat.', 'slider-banner' ),
								'repeat'    => _x( 'Tile', 'Background repeat.', 'slider-banner' ),
								'repeat-x'  => _x( 'Horizontal', 'Background repeat.', 'slider-banner' ),
								'repeat-y'  => _x( 'Vertical', 'Background repeat.', 'slider-banner' ),
							),
							'preview'    => array(
								'type'     => 'css',
								'selector' => '.slide',
								'property' => 'background-repeat',
							),
						),
						'bg_position'   => array(
							'type'       => 'select',
							'label'      => __( 'Position', 'slider-banner' ),
							'default'    => 'center center',
							'responsive' => true,
							'options'    => array(
								'left top'      => __( 'Left Top', 'slider-banner' ),
								'left center'   => __( 'Left Center', 'slider-banner' ),
								'left bottom'   => __( 'Left Bottom', 'slider-banner' ),
								'right top'     => __( 'Right Top', 'slider-banner' ),
								'right center'  => __( 'Right Center', 'slider-banner' ),
								'right bottom'  => __( 'Right Bottom', 'slider-banner' ),
								'center top'    => __( 'Center Top', 'slider-banner' ),
								'center center' => __( 'Center', 'slider-banner' ),
								'center bottom' => __( 'Center Bottom', 'slider-banner' ),
							),
							'preview'    => array(
								'type'     => 'css',
								'selector' => '.slide',
								'property' => 'background-position',
							),
						),
						'bg_attachment' => array(
							'type'       => 'select',
							'label'      => __( 'Attachment', 'slider-banner' ),
							'default'    => 'scroll',
							'responsive' => true,
							'options'    => array(
								'scroll' => __( 'Scroll', 'slider-banner' ),
								'fixed'  => __( 'Fixed', 'slider-banner' ),
							),
							'preview'    => array(
								'type'     => 'css',
								'selector' => '.slide',
								'property' => 'background-attachment',
							),
						),
						'bg_size'       => array(
							'type'       => 'select',
							'label'      => __( 'Scale', 'slider-banner' ),
							'default'    => 'cover',
							'responsive' => true,
							'options'    => array(
								'auto'    => _x( 'None', 'Background scale.', 'slider-banner' ),
								'contain' => __( 'Fit', 'slider-banner' ),
								'cover'   => __( 'Fill', 'slider-banner' ),
							),
							'preview'    => array(
								'type'     => 'css',
								'selector' => '.slide',
								'property' => 'background-size',
							),
						)
                    )
                )
            )
        ),
        'layout'      => array(
			'title'         => __('Layout', 'slider-banner'),
			'sections'      => array(
                'slide_width'       => array(
                    'title'         => 'Content Width',
                    'fields'        => array(
                        'slide_column_content_width'       => array(
							'type'       => 'select',
							'label'      => __( 'Slide Content Width', 'slider-banner' ),
							'default'    => 'full',
							'responsive' => true,
							'options'    => array(
								'full'    => _x( 'Full', 'Background scale.', 'slider-banner' ),
								'custom'  => __( 'Custom', 'slider-banner' ),
							),
                            'toggle'  => array(
                                'custom' => array(
                                    'fields' => array( 'slide_column_max_width' ),
                                ),
                            )
						),
                        'slide_column_max_width' => array(
                            'type'         => 'unit',
                            'label'        => __( 'Custom Width', 'slider-banner' ),
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