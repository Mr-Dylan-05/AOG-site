<?php
/**
 * @class advanceResponsiveMenuModule
 */
class analogTime extends FLBuilderModule {

	/** 
	 * @method __construct
	 */  
	public function __construct()
	{
		global $customcategory;
		parent::__construct(array(
			'name'          	=> __('Analog Time', 'fl-builder'),
			'description'   	=> __('Displays a real time analog clock.', 'fl-builder'),
			'category'      	=> __($customcategory, 'fl-builder'),
			'partial_refresh'	=> true
		));
		
		
		$this->add_js( 'moment', BB_CUSTOM_MODULES_URL . 'assets/moment/moment.min.js', array(), '', true );
		$this->add_js( 'moment-with-locales', BB_CUSTOM_MODULES_URL . 'assets/moment/moment-with-locales.min.js', array(), '', true );
	}
	
	/**
	 * @method get_classname
	 */
	public function get_classname()
	{
		$classname = 'analog-time';
		return $classname;
	}
}

/**
 * Register the module and its form settings.
 */
FLBuilder::register_module('analogTime', array(
	'general'         => array(
		'title'         => __('General', 'fl-builder'),
		'sections'      => array(
			'general'       => array(
				'title'         => '',
				'fields'        => array(
				    'clock_type'   => array(
                        'type'          => 'select',
                        'label'         => __( 'Clock Type', 'fl-builder' ),
                        'default'       => 'analog',
						'options'       => array(
							'analog'      => __( 'Analog', 'fl-builder' ),
							'digital'      => __( 'Digital', 'fl-builder' )
						),
						'toggle'    => array(
						    'analog' => array(
						        'sections'    => array( 'colors', 'structure' ),
					        ),
					        'digital' => array(
						        'sections'    => array( 'text' ),
						        'fields'      => array( 'time_format' ),
					        ),
					    ),
                    ),
				    'custom_timezone' => array(
                    	'type'          => 'timezone',
                    	'label'         => __( 'Time Zone', 'fl-builder' ),
                    	'default'	=> 'Brisbane',
                    ),
                    'time_format'   => array(
                        'type'          => 'select',
                        'label'         => __( 'Time Format', 'fl-builder' ),
                        'default'       => '12',
						'options'       => array(
							'12'      => __( '12', 'fl-builder' ),
							'24'      => __( '24', 'fl-builder' )
						)
                    ),
                    'show_seconds'  => array(
                        'type'      => 'select',
                        'label'     =>  __( 'Show Seconds', 'fl-builder' ),
                        'default'   => 'show',
                        'options'   => array(
                            'show'  => __( 'Show', 'fl-builder' ),
                            'hide'  => __( 'Hide', 'fl-builder' )
                        ),
                    )
				)
			),
		)
	),
    'style'   => array( // Tab
		'title'    => __( 'Style', 'fl-builder' ), // Tab title
		'sections' => array( // Tab Sections
			'structure' => array( // Section
				'title'  => __( 'Clock Icon', 'fl-builder' ), // Section Title
				'fields' => array( // Section Fields
					'size'  => array(
						'type'       => 'unit',
						'label'      => __( 'Size', 'fl-builder' ),
						'default'    => '150',
						'sanitize'   => 'floatval',
						'responsive' => true,
						'units'      => array( 'px', 'em', 'rem' ),
						'slider'     => true,
						'preview'    => array(
						    'type'  => 'css',
						    'rules' => array(
					            array(
        							'selector'  => '{node} .hero-circle',
        							'property'  => 'width'
    					        ),
    					        array(
        							'selector'  => '{node} .hero-circle',
        							'property'  => 'height'
    					        ),
					        ),
						),
					),
				    'time_align' => array(
						'type'       => 'align',
						'label'      => __( 'Alignment', 'fl-builder' ),
						'responsive' => true,
						'values'  => array(
                    		'left'   => '0 auto 0 0',
                    		'center' => '0 auto',
                    		'right'  => '0 0 0 auto',
                    	),
						'preview'    => array(
							'type'     => 'css',
							'selector' => '{node} .hero-circle',
							'property' => 'margin',
						),
					),
				),
			),
			'colors'    => array( // Section
				'title'  => __( 'Clock Colors', 'fl-builder' ), // Section Title
				'fields' => array( // Section Fields
					'hour_color'          => array(
						'type'        => 'color',
						'connections' => array( 'color' ),
						'label'       => __( 'Hour-hand color', 'fl-builder' ),
						'show_reset'  => true,
						'show_alpha'  => true,
						'preview'     => array(
							'type'      => 'css',
							'selector'  => '{node} .hero-hour',
							'property'  => 'background',
						),
					),
					'minute_color'    => array(
						'type'        => 'color',
						'connections' => array( 'color' ),
						'label'       => __( 'Minute-hand color', 'fl-builder' ),
						'show_reset'  => true,
						'show_alpha'  => true,
						'preview'     => array(
							'type'      => 'css',
							'selector'  => '{node} .hero-minute',
							'property'  => 'background',
						),
					),
					'second_color'    => array(
						'type'        => 'color',
						'connections' => array( 'color' ),
						'label'       => __( 'Second-hand color', 'fl-builder' ),
						'show_reset'  => true,
						'show_alpha'  => true,
						'preview'     => array(
							'type'      => 'css',
							'selector'  => '{node} .hero-second',
							'property'  => 'background',
						),
					),
					'clock_bg_type'     => array(
					    'type'          => 'select',
					    'label'     => __('Background Type', 'fl-builder'),
					    'default' => 'color',
						'options' => array(
							'color' => __( 'Color', 'fl-builder' ),
							'gradient' => __( 'Gradient', 'fl-builder' ),
							'image'    => __('Image', 'fl-builder'),
						),
						'toggle'  => array(
						    'color'    => array(
    							'fields' => array( 'clock_bg_color' ),
    						),
        					'gradient'    => array(
    							'fields' => array( 'clock_gradient_color' ),
    						),
    						'image'    => array(
    							'fields' => array( 'clock_image_bg' ),
    						),
						),
					),
					'clock_bg_color' => array(
						'type'        => 'color',
						'connections' => array( 'color' ),
						'label'       => __( 'Background Color', 'fl-builder' ),
						'show_reset'  => true,
						'show_alpha'  => true,
						'preview'     => array(
							'type' => 'css',
							'selector'  => '{node} .hero-circle',
							'property'  => 'background-color',
						),
					),
					'clock_gradient_color'    => array(
						'type'    => 'gradient',
                    	'label'   => __( 'Background Gradient Color', 'fl-builder' ),
                    	'preview' => array(
                    		'type'     => 'css',
                    		'selector' => '{node} .hero-circle',
                    		'property' => 'background-image',
                    	),
					),
					'clock_image_bg' => array(
                        'type'          => 'photo',
                        'label'         => __('Clock Background Image', 'fl-builder'),
                        'show_remove'   => false,
                        'preview'       => array(
                            'type'      => 'css',
                            'selector'  => '{node} .hero-circle',
                            'property'  => 'background-image',
                        ),
                    ),
					'clock_border_color' => array(
					    'type'       => 'border',
                    	'label'      =>  __( 'Border Color', 'fl-builder' ),
                    	'responsive' => true,
                    	'preview'    => array(
                    		'type'     => 'css',
                    		'selector' => '{node} .hero-circle',
                    	),
					),
				),
			),
			'text'      => array(
				'title'  => __( 'Text', 'fl-builder' ),
				'fields' => array(
				    'time_text_align' => array(
						'type'       => 'align',
						'label'      => __( 'Alignment', 'fl-builder' ),
						'responsive' => true,
						'values'  => array(
                    		'left'   => '0 auto 0 0',
                    		'center' => '0 auto',
                    		'right'  => '0 0 0 auto',
                    	),
						'preview'    => array(
							'type'     => 'css',
							'selector' => '{node} .custom-time-cont',
							'property' => 'margin',
						),
					),
					'text_color'      => array(
						'type'        => 'color',
						'connections' => array( 'color' ),
						'label'       => __( 'Text Color', 'fl-builder' ),
						'show_reset'  => true,
						'show_alpha'  => true,
						'preview'     => array(
							'type'     => 'css',
							'selector' => '{node} .custom-time-cont, .custom-time-cont span',
							'property' => 'color',
						),
					),
					'text_typography' => array(
						'type'       => 'typography',
						'label'      => __( 'Time Typography', 'fl-builder' ),
						'responsive' => true,
						'preview'    => array(
							'type'     => 'css',
							'selector' => '{node} .custom-time-cont span.time-flex',
						),
					),
					'ampm_typography' => array(
						'type'       => 'typography',
						'label'      => __( 'AM/PM Typography', 'fl-builder' ),
						'responsive' => true,
						'preview'    => array(
							'type'     => 'css',
							'selector' => '{node} .custom-time-cont span.ampm-container',
						),
					),
					'ampm_vertical_align'   => array(
					    'type'      => 'select',
					    'label'     => __('AM/PM Vertical Alignment', 'fl-builder'),
					    'default' => 'top',
						'options' => array(
							'top' => __( 'Top', 'fl-builder' ),
							'middle' => __( 'Middle', 'fl-builder' ),
							'bottom'    => __('Bottom', 'fl-builder'),
						),
						'preview'   => array(
					        'type'  => 'css',
					        'selector'  => '{node} .custom-time-cont span.ampm-container',
					        'property'  => 'vertical-align',
					    ),
				    ),
				),
			),
        ),
	),
));