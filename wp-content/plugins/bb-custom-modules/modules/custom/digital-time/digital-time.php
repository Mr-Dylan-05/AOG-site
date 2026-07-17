<?php
/**
 * @class advanceResponsiveMenuModule
 */
class customTime extends FLBuilderModule {

	/** 
	 * @method __construct
	 */  
	public function __construct()
	{
		global $customcategory;
		parent::__construct(array(
			'name'          	=> __('Real Time', 'fl-builder'),
			'description'   	=> __('Displays a real time clock.', 'fl-builder'),
			'category'      	=> __($customcategory, 'fl-builder'),
			'partial_refresh'	=> true
		));
	}
	
	/**
	 * @method get_classname
	 */
	public function get_classname()
	{
		$classname = 'custom-time';
		return $classname;
	}
}

/**
 * Register the module and its form settings.
 */
FLBuilder::register_module('customTime', array(
	'general'         => array(
		'title'         => __('General', 'fl-builder'),
		'sections'      => array(
			'general'       => array(
				'title'         => '',
				'fields'        => array(
                    'icon' => array(
						'type'    => 'icon',
						'label'   => __( 'Icon', 'fl-builder' ),
						'preview' => array(
							'type' => 'none',
						),
					),
					'custom_timezone' => array(
						'type'          => 'text',
						'label'         => __( 'Timezone', 'fl-builder' ),
						'default'       => 'Australia/Brisbane',
						'description'   => '<i>View Timezone formats <a href="https://www.php.net/manual/en/timezones.php" target="_blank" style="text-decoration: underline; color: blue;">here.</a></i>',
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
				)
			),
		)
	),
    'style'   => array( // Tab
		'title'    => __( 'Style', 'fl-builder' ), // Tab title
		'sections' => array( // Tab Sections
			'structure' => array( // Section
				'title'  => __( 'Icon', 'fl-builder' ), // Section Title
				'fields' => array( // Section Fields
				    'inline_stacked'  => array(
				    	'type'    => 'select',
						'label'   => __( 'Structure', 'fl-builder' ),
						'default' => '0',
						'options' => array(
							'0' => __( 'Inline', 'fl-builder' ),
							'1' => __( 'Stacked', 'fl-builder' ),
						),
						'toggle'  => array(
						    '0'    => array(
    							'fields' => array( 'space_right_icon' ),
    						),
        					'1'    => array(
    							'fields' => array( 'space_below_icon' , 'time_align' ),
    						),
						),
				    ),
					'size'  => array(
						'type'       => 'unit',
						'label'      => __( 'Size', 'fl-builder' ),
						'default'    => '30',
						'sanitize'   => 'floatval',
						'responsive' => true,
						'units'      => array( 'px', 'em', 'rem' ),
						'slider'     => true,
						'preview'    => array(
							'type' => 'css',
							'selector'  => '{node} .fl-icon i, {node} .fl-icon i::before',
							'property'  => 'font-size',
						),
					),
				    'time_align' => array(
						'type'       => 'align',
						'label'      => __( 'Alignment', 'fl-builder' ),
						'responsive' => true,
						'values'  => array(
                    		'left'   => 'flex-start',
                    		'center' => 'center',
                    		'right'  => 'flex-end',
                    	),
						'preview'    => array(
							'type'     => 'css',
							'selector' => '.fl-icon-wrap',
							'property' => 'align-items',
						),
					),
				    'space_below_icon'  =>  array(
				        'type'       => 'unit',
						'label'      => __( 'Margin Bottom', 'fl-builder' ),
						'default'    => '20',
						'sanitize'   => 'floatval',
						'responsive' => true,
						'units'      => array( 'px', 'em', 'rem' ),
						'slider'     => true,
						'preview'    => array(
							'type' => 'css',
							'selector'  => '{node} .fl-icon',
							'property'  => 'margin-bottom',
						),  
			        ),
			        'space_right_icon'  =>  array(
				        'type'       => 'unit',
						'label'      => __( 'Padding Right', 'fl-builder' ),
						'default'    => '20',
						'sanitize'   => 'floatval',
						'responsive' => true,
						'units'      => array( 'px', 'em', 'rem' ),
						'slider'     => true,
						'preview'    => array(
							'type' => 'css',
							'selector'  => '{node} .fl-icon',
							'property'  => 'padding-right',
						),  
			        ),
				),
			),
			'colors'    => array( // Section
				'title'  => __( 'Icon Colors', 'fl-builder' ), // Section Title
				'fields' => array( // Section Fields
					'color'          => array(
						'type'        => 'color',
						'connections' => array( 'color' ),
						'label'       => __( 'Color', 'fl-builder' ),
						'show_reset'  => true,
						'show_alpha'  => true,
						'preview'     => array(
							'type'      => 'css',
							'selector'  => '.fl-icon i, .fl-icon i::before',
							'property'  => 'color',
							'important' => true,
						),
					),
					'hover_color'    => array(
						'type'        => 'color',
						'connections' => array( 'color' ),
						'label'       => __( 'Hover Color', 'fl-builder' ),
						'show_reset'  => true,
						'show_alpha'  => true,
						'preview'     => array(
							'type'      => 'css',
							'selector'  => '.fl-icon i:hover, .fl-icon i:hover::before',
							'property'  => 'color',
							'important' => true,
						),
					),
					'bg_color'       => array(
						'type'        => 'color',
						'connections' => array( 'color' ),
						'label'       => __( 'Background Color', 'fl-builder' ),
						'show_reset'  => true,
						'show_alpha'  => true,
					),
					'bg_hover_color' => array(
						'type'        => 'color',
						'connections' => array( 'color' ),
						'label'       => __( 'Background Hover Color', 'fl-builder' ),
						'show_reset'  => true,
						'show_alpha'  => true,
						'preview'     => array(
							'type' => 'none',
						),
					),
					'three_d'        => array(
						'type'    => 'select',
						'label'   => __( 'Gradient', 'fl-builder' ),
						'default' => '0',
						'options' => array(
							'0' => __( 'No', 'fl-builder' ),
							'1' => __( 'Yes', 'fl-builder' ),
						),
					),
				),
			),
			'text'      => array(
				'title'  => __( 'Text', 'fl-builder' ),
				'fields' => array(
					'text_color'      => array(
						'type'        => 'color',
						'connections' => array( 'color' ),
						'label'       => __( 'Text Color', 'fl-builder' ),
						'show_reset'  => true,
						'show_alpha'  => true,
						'preview'     => array(
							'type'     => 'css',
							'selector' => '.custom-time-cont, .custom-time-cont span',
							'property' => 'color',
						),
					),
					'text_typography' => array(
						'type'       => 'typography',
						'label'      => __( 'Text Typography', 'fl-builder' ),
						'responsive' => true,
						'preview'    => array(
							'type'     => 'css',
							'selector' => '.custom-time-cont span.time-flex',
						),
					),
					'ampm_typography' => array(
						'type'       => 'typography',
						'label'      => __( 'AM/PM Typography', 'fl-builder' ),
						'responsive' => true,
						'preview'    => array(
							'type'     => 'css',
							'selector' => '.custom-time-cont span.ampm-container',
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
					        'selector'  => '.custom-time-cont span.ampm-container',
					        'property'  => 'vertical-align',
					    ),
				    ),
				),
			),
        ),
	),
));