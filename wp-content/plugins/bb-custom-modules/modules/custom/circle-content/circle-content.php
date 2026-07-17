<?php
/**
 * @class circleContentModule
 */
class circleContentModule extends FLBuilderModule {

	/** 
	 * @method __construct
	 */  
	public function __construct()
	{
		global $customcategory;
		parent::__construct(array(
			'name'          	=> __('Circle Content', 'fl-builder'),
			'description'   	=> __('Displays content in a layered circle.', 'fl-builder'),
			'category'      	=> __($customcategory, 'fl-builder'),
			'partial_refresh'	=> true
		));
	}
	
	/**
	 * @method get_classname
	 */
	public function get_classname()
	{
		$classname = 'circle-content';
		return $classname;
	}
}

/**
 * Register the module and its form settings.
 */
FLBuilder::register_module('circleContentModule', array(
	'general'         => array(
		'title'         => __('Content', 'fl-builder'),
		'sections'      => array(
		    'center'       => array(
                'title'       => 'Center image',
                'fields'       => array(
                    'main_title'       => array(
                        'type'          => 'text',
                        'label'         => 'Title',
                        'default'   => __('', 'fl-builder'),
						'placeholder'   => __('Title Text', 'fl-builder'),
                    ),
                    'main_content'       => array(
                        'type'          => 'textarea',
                        'label'         => 'Content',
                        'default'   => __('', 'fl-builder'),
						'placeholder'   => __('Content Text', 'fl-builder'),
                        'maxlength'		=> '300',
                        'rows'          => '3'
                    ),
                    'image_logo'      => array(
                        'type'        => 'photo',
                        'show_remove' => true,
                        'label'       => __( 'Logo', 'fl-builder' ),
                        'responsive'  => true,
                        'connections' => array( 'photo' ),
                    ),
                    'main_color'       => array(
						'type'          => 'color',
						'label'         => 'Main Color',
						'show_reset'    => true,
						'show_alpha'    => true,
                        'preview'       => array(
							'type'          => 'css',
							'selector'      => '.r-outer',
                            'property'      => 'background-color',
						),
						'connections' => array( 'color' )
					),
                    'image_bg'      => array(
                        'type'        => 'photo',
                        'show_remove' => true,
                        'label'       => __( 'Image Background', 'fl-builder' ),
                        'responsive'  => true,
                        'connections' => array( 'photo' ),
                    ),
                    'image_options' => array(
                        'type'          => 'select',
                        'label'         => __( 'Image Options', 'fl-builder' ),
                        'default'       => 'icon',
                        'options'       => array(
                            'photo'      => __( 'Photo', 'fl-builder' ),
                            'icon'      => __( 'Icon', 'fl-builder' )
                        ),
                        'toggle'        => array(
                            'photo'      => array(
                                'fields'        => array( 'image' )
                            ),
                            'icon'      => array(
                                'fields'        => array( 'icon', 'icon_color' )
                            )
                        )
                    ),
                    'image'      => array(
                        'type'        => 'photo',
                        'show_remove' => true,
                        'label'       => __( 'Photo', 'fl-builder' ),
                        'responsive'  => true,
                        'connections' => array( 'photo' ),
                    ),
                    'icon' => array(
                        'type'          => 'icon',
                        'label'         => __( 'Icon', 'fl-builder' ),
                        'show_remove'   => true
                    ),
                    'icon_color'       => array(
						'type'          => 'color',
						'label'         => 'Icon Color',
						'show_reset'    => true,
                        'preview'       => array(
							'type'          => 'css',
							'selector'      => '.r-center i',
                            'property'      => 'color',
						),
						'connections' => array( 'color' )
					)
                )
            ),
		    'content1'       => array(
				'title'         => 'Content - Outer layer',
				'fields'        => array(
					'title1'       => array(
                        'type'          => 'text',
                        'label'         => 'Title',
                        'default'   => __('', 'fl-builder'),
						'placeholder'   => __('Title Text', 'fl-builder'),
                    ),
                    'image_options1' => array(
                        'type'          => 'select',
                        'label'         => __( 'Image Options', 'fl-builder' ),
                        'default'       => 'icon',
                        'options'       => array(
                            'photo'      => __( 'Photo', 'fl-builder' ),
                            'icon'      => __( 'Icon', 'fl-builder' )
                        ),
                        'toggle'        => array(
                            'photo'      => array(
                                'fields'        => array( 'image1' )
                            ),
                            'icon'      => array(
                                'fields'        => array( 'icon1', 'icon1_color' )
                            )
                        )
                    ),
                    'image1'      => array(
                        'type'        => 'photo',
                        'show_remove' => true,
                        'label'       => __( 'Photo', 'fl-builder' ),
                        'responsive'  => true,
                        'connections' => array( 'photo' ),
                    ),
                    'icon1' => array(
                        'type'          => 'icon',
                        'label'         => __( 'Icon', 'fl-builder' ),
                        'show_remove'   => true
                    ),
                    'icon_label1'       => array(
                        'type'          => 'text',
                        'label'         => 'Icon Label',
                        'default'   => __('', 'fl-builder'),
						'placeholder'   => __('Icon Label Text', 'fl-builder'),
                    ),
                    'icon1_color'       => array(
						'type'          => 'color',
						'label'         => 'Icon Color',
						'show_reset'    => true,
                        'preview'       => array(
							'type'          => 'css',
							'selector'      => '.r-outer i',
                            'property'      => 'color',
						),
						'connections' => array( 'color' )
					),
                    'content1'       => array(
                        'type'          => 'textarea',
                        'label'         => 'Content',
                        'default'   => __('', 'fl-builder'),
						'placeholder'   => __('Content Text', 'fl-builder'),
                        'maxlength'		=> '500',
                        'rows'          => '6'
                    )
				)
			),
            'content2'       => array(
				'title'         => 'Content - Mid layer',
				'fields'        => array(
					'title2'       => array(
                        'type'          => 'text',
                        'label'         => 'Title',
                        'default'   => __('', 'fl-builder'),
						'placeholder'   => __('Title Text', 'fl-builder'),
                    ),
                    'image_options2' => array(
                        'type'          => 'select',
                        'label'         => __( 'Image Options', 'fl-builder' ),
                        'default'       => 'icon',
                        'options'       => array(
                            'photo'      => __( 'Photo', 'fl-builder' ),
                            'icon'      => __( 'Icon', 'fl-builder' )
                        ),
                        'toggle'        => array(
                            'photo'      => array(
                                'fields'        => array( 'image2' )
                            ),
                            'icon'      => array(
                                'fields'        => array( 'icon2', 'icon2_color' )
                            )
                        )
                    ),
                    'image2'      => array(
                        'type'        => 'photo',
                        'show_remove' => true,
                        'label'       => __( 'Photo', 'fl-builder' ),
                        'responsive'  => true,
                        'connections' => array( 'photo' ),
                    ),
                    'icon2' => array(
                        'type'          => 'icon',
                        'label'         => __( 'Icon', 'fl-builder' ),
                        'show_remove'   => true
                    ),
                    'icon_label2'       => array(
                        'type'          => 'text',
                        'label'         => 'Icon Label',
                        'default'   => __('', 'fl-builder'),
						'placeholder'   => __('Icon Label Text', 'fl-builder'),
                    ),
                    'icon2_color'       => array(
						'type'          => 'color',
						'label'         => 'Icon Color',
						'show_reset'    => true,
                        'preview'       => array(
							'type'          => 'css',
							'selector'      => '.r-middle i',
                            'property'      => 'color',
						),
						'connections' => array( 'color' )
					),
                    'content2'       => array(
                        'type'          => 'textarea',
                        'label'         => 'Content',
                        'default'   => __('', 'fl-builder'),
						'placeholder'   => __('Content Text', 'fl-builder'),
                        'maxlength'		=> '500',
                        'rows'          => '6'
                    )
				)
			),
            'content3'       => array(
				'title'         => 'Content - Inner layer',
				'fields'        => array(
					'title3'       => array(
                        'type'          => 'text',
                        'label'         => 'Title',
                        'default'   => __('', 'fl-builder'),
						'placeholder'   => __('Title Text', 'fl-builder'),
                    ),
                    'image_options3' => array(
                        'type'          => 'select',
                        'label'         => __( 'Image Options', 'fl-builder' ),
                        'default'       => 'icon',
                        'options'       => array(
                            'photo'      => __( 'Photo', 'fl-builder' ),
                            'icon'      => __( 'Icon', 'fl-builder' )
                        ),
                        'toggle'        => array(
                            'photo'      => array(
                                'fields'        => array( 'image3' )
                            ),
                            'icon'      => array(
                                'fields'        => array( 'icon3', 'icon3_color' )
                            )
                        )
                    ),
                    'image3'      => array(
                        'type'        => 'photo',
                        'show_remove' => true,
                        'label'       => __( 'Photo', 'fl-builder' ),
                        'responsive'  => true,
                        'connections' => array( 'photo' ),
                    ),
                    'icon3' => array(
                        'type'          => 'icon',
                        'label'         => __( 'Icon', 'fl-builder' ),
                        'show_remove'   => true
                    ),
                    'icon_label3'       => array(
                        'type'          => 'text',
                        'label'         => 'Icon Label',
                        'default'   => __('', 'fl-builder'),
						'placeholder'   => __('Icon Label Text', 'fl-builder'),
                    ),
                    'icon3_color'       => array(
						'type'          => 'color',
						'label'         => 'Icon Color',
						'show_reset'    => true,
                        'preview'       => array(
							'type'          => 'css',
							'selector'      => '.r-inner i',
                            'property'      => 'color',
						),
						'connections' => array( 'color' )
					),
                    'content3'       => array(
                        'type'          => 'textarea',
                        'label'         => 'Content',
                        'default'   => __('', 'fl-builder'),
						'placeholder'   => __('Content Text', 'fl-builder'),
                        'maxlength'		=> '500',
                        'rows'          => '6'
                    )
				)
			)
		)
	),
    'style'         => array(
		'title'         => __('Style', 'fl-builder'),
		'sections'      => array(
			'typography'       => array(
				'title'         => 'Typography',
				'fields'        => array(
				    'label_color'       => array(
						'type'          => 'color',
						'label'         => 'Label Color',
						'show_reset'    => true,
						'preview'       => array(
							'type'          => 'css',
							'selector'      => '.ring-title',
							'property'      => 'color',
						)
					),
                    'main_title_typography'       => array(
						'type'          => 'typography',
						'label'         => 'Main Title Typography',
						'responsive' => true,
						'preview'       => array(
							'type'          => 'css',
							'selector'      => '.main-title',
						)
					),
                    'main_content_typography'       => array(
						'type'          => 'typography',
						'label'         => 'Main Content Typography',
						'responsive' => true,
						'preview'       => array(
							'type'          => 'css',
							'selector'      => '.main-content',
						)
					),
		            'label_typography'       => array(
						'type'          => 'typography',
						'label'         => 'Label Typography',
						'responsive' => true,
						'preview'       => array(
							'type'          => 'css',
							'selector'      => '.ring-title',
						)
					), 
				)
			)
		)
	)
));