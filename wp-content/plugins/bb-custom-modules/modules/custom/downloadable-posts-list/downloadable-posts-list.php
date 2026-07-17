<?php
/**
 * @class postDLListModule
 */
class postDLListModule extends FLBuilderModule {

	/** 
	 * @method __construct
	 */  
	public function __construct()
	{
        global $customcategory;
		parent::__construct(array(
			'name'          	=> __('Post Downloadable List', 'fl-builder'),
			'description'   	=> __('Display Downloadable Posts from Posttype.', 'fl-builder'),
			'category'      	=> __($customcategory, 'fl-builder'),
			'partial_refresh'	=> true
		));
	}
	
	/**
	 * @method get_classname
	 */
	public function get_classname()
	{
		//$classname = 'portfolio-mixitup' . $this->settings->layout;
		//return $classname;
	}
}

/*Testimonial Avatar Size*/
add_image_size( 'portfolio-mixitup', 366 , 366, true );

/**
 * Register the module and its form settings.
 */
FLBuilder::register_module('postDLListModule', array(
	'slides'         => array(
		'title'         => __('General', 'fl-builder'),
		'sections'      => array(
			'general'       => array(
				'title'         => '',
				'fields'        => array(
                    'posttype'         => array(
						'type'          => 'post-type',
						'label'         => __('Source', 'fl-builder'),
						'default'       => 'partner'
					),
					'totalpost'         => array(
						'type'          => 'text',
						'label'         => __('Number of Portfolio display', 'fl-builder'),
						'default'       => __('9', 'fl-builder'),
						'placeholder'       => __('9', 'fl-builder'),
						'maxlength'     => '2',
						'size'          => '1',
					),
					'grid'         => array(
						'type'          => 'select',
						'label'         => __('Number of Column', 'fl-builder'),
						'default'       => '4',
						'options'       => array(
							'6'    		=> __('Column 6', 'fl-builder'),
							'4'    		=> __('Column 4', 'fl-builder'),
							'3'    		=> __('Column 3', 'fl-builder'),
							'2'    		=> __('Column 2', 'fl-builder'),
							'1'    		=> __('Column 1', 'fl-builder'),
						)
					),
                    'post_orderby'         => array(
						'type'          => 'select',
						'label'         => __('Order By', 'fl-builder'),
						'default'       => 'date',
						'options'       => array(
							'date'    		=> __('Date', 'fl-builder'),
							'name'          => __('Name', 'fl-builder')
						)
					),
                    'post_order'         => array(
						'type'          => 'select',
						'label'         => __('Order', 'fl-builder'),
						'default'       => 'ASC',
						'options'       => array(
							'ASC'    		=> __('Ascending', 'fl-builder'),
							'DESC'          => __('Descending', 'fl-builder')
						)
					)
				)
			)
		)
	),
	'style'        => array(
		'title'         => __('Style', 'fl-builder'),
		'sections'      => array(
			'general'       => array(
				'title'         => '',
				'fields'        => array(
                    'dl_icon_color'          => array(
						'type'          => 'color',
						'show_reset'    => true,
						'label'         => __('Icon Color', 'fl-builder'),
                        'preview'         => array(
                            'type'            => 'css',
                            'selector'        => '.dl-title i',
                            'property'        => 'color',
						)
					),
                    'dl_title_color'          => array(
						'type'          => 'color',
						'show_reset'    => true,
						'label'         => __('Title Text Color', 'fl-builder'),
                        'preview'         => array(
                            'type'            => 'css',
                            'selector'        => '.dl-title-content span',
                            'property'        => 'color',
						)
					),
                    'dl_title_opacity' => array(
						'type'          => 'text',
						'label'         => __('Title Text Opacity', 'fl-builder'),
						'default'       => '1',
						'maxlength'     => '3',
						'size'          => '4',
						'preview'         => array(
							'type'            => 'css',
							'selector'        => '.dl-title-content span',
                            'property'        => 'opacity'
						)
					),
                    'dl_font'          => array(
						'type'          => 'font',
						'default'		=> array(
							'family'		=> 'Default',
							'weight'		=> 300
						),
						'label'         => __('Font', 'fl-builder'),
						'preview'         => array(
                            'type'            => 'css',
                            'selector'        => '.dl-title-content span',
                            'property'        => 'color'
						)						
					),
					'dl_font_size'     => array(
						'type'          => 'select',
						'label'         => __('Font Size', 'fl-builder'),
						'default'       => 'default',
						'options'       => array(
							'default'       =>  __('Default', 'fl-builder'),
							'custom'        =>  __('Custom', 'fl-builder')
						),
						'toggle'        => array(
							'custom'        => array(
								'fields'        => array('dl_custom_font_size')
							)
						)
					),
					'dl_custom_font_size' => array(
						'type'          => 'text',
						'label'         => __('Custom Font Size', 'fl-builder'),
						'default'       => '24',
						'maxlength'     => '3',
						'size'          => '4',
						'description'   => 'px'
					),
					'dl_line_height'     => array(
						'type'          => 'select',
						'label'         => __('Line Height', 'fl-builder'),
						'default'       => 'default',
						'options'       => array(
							'default'       =>  __('Default', 'fl-builder'),
							'custom'        =>  __('Custom', 'fl-builder')
						),
						'toggle'        => array(
							'custom'        => array(
								'fields'        => array('dl_custom_line_height')
							)
						)
					),
					'dl_custom_line_height' => array(
						'type'          => 'text',
						'label'         => __('Custom Line Height', 'fl-builder'),
						'default'       => '1.4',
						'maxlength'     => '4',
						'size'          => '4',
						'description'   => 'em'
					),
					'dl_letter_spacing'     => array(
						'type'          => 'select',
						'label'         => __('Letter Spacing', 'fl-builder'),
						'default'       => 'default',
						'options'       => array(
							'default'       =>  __('Default', 'fl-builder'),
							'custom'        =>  __('Custom', 'fl-builder')
						),
						'toggle'        => array(
							'custom'        => array(
								'fields'        => array('dl_custom_letter_spacing')
							)
						)
					),
					'dl_custom_letter_spacing' => array(
						'type'          => 'text',
						'label'         => __('Custom Letter Spacing', 'fl-builder'),
						'default'       => '0',
						'maxlength'     => '3',
						'size'          => '4',
						'description'   => 'px'
					)
				)
			),
			'padding'       => array(
				'title'         => 'Padding',
				'fields'        => array(       
					'padding_top'       => array(
						'type'          => 'text',
						'label'         => 'Top',
						'placeholder'         => '0',
						'maxlength'     => '3',
						'size'          => '4',
						'description'   => 'px',
					),    
					'padding_bottom'       => array(
						'type'          => 'text',
						'label'         => 'Bottom',
						'placeholder'         => '0',
						'maxlength'     => '3',
						'size'          => '4',
						'description'   => 'px',
					),    
					'padding_left'       => array(
						'type'          => 'text',
						'label'         => 'Left',
						'placeholder'         => '0',
						'maxlength'     => '3',
						'size'          => '4',
						'description'   => 'px',
					),    
					'padding_right'       => array(
						'type'          => 'text',
						'label'         => 'Right',
						'placeholder'         => '0',
						'maxlength'     => '3',
						'size'          => '4',
						'description'   => 'px',
					),
				)
			)
		)
	)
));