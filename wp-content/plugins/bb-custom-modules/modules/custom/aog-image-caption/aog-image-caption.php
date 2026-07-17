<?php
/**
 * @class aogImageCaption
 */
class aogImageCaption extends FLBuilderModule {

	/** 
	 * @method __construct
	 */  
	public function __construct()
	{
		global $customcategory;
		parent::__construct(array(
			'name'          	=> __('AOG - Image Caption', 'fl-builder'),
			'description'   	=> __('Displays Image Caption for AOG.', 'fl-builder'),
			'category'      	=> __($customcategory, 'fl-builder'),
			'partial_refresh'	=> true
		));
	}
	
	/**
	 * @method get_classname
	 */
	public function get_classname()
	{
		$classname = 'aog-image-caption';
		return $classname;
	}
}

/**
 * Register the module and its form settings.
 */
FLBuilder::register_module('aogImageCaption', array(
	'general'         => array(
		'title'         => __('Content', 'fl-builder'),
		'sections'      => array(
            'general' => array(
                'title' => '',
                'fields' => array(
                    'select_align' => array(
                        'type'          => 'select',
                        'label'         => __( 'Image Alignment', 'fl-builder' ),
                        'default'       => 'left',
                        'options'       => array(
                            'left'      => __( 'Left', 'fl-builder' ),
                            'right'      => __( 'Right', 'fl-builder' )
                        )
                    )
                )
            ),
		    'heading'       => array(
				'title'         => 'Dual Color Heading',
				'fields'        => array(
					'label1'       => array(
                        'type'          => 'text',
                        'label'         => 'Label 1',
                        'default'   => __('', 'fl-builder'),
						'placeholder'   => __('Label Text', 'fl-builder'),
                    ),
                    'label2'       => array(
                        'type'          => 'text',
                        'label'         => 'Label 2',
                        'default'   => __('', 'fl-builder'),
						'placeholder'   => __('Label Text', 'fl-builder'),
                    )
				)
            ),
            'image'       => array(
				'title'         => 'Image',
				'fields'        => array(
                    'photo_img' => array(
                        'type'          => 'photo',
                        'label'         => __('Photo', 'fl-builder'),
                        'show_remove'   => false,
                    ),
				)
			),
			'typography'       => array(
				'title'         => 'Typography',
				'fields'        => array(
				    'label_color1'       => array(
						'type'          => 'color',
						'label'         => '1st Label Color',
						'show_reset'    => true,
						'preview'       => array(
							'type'          => 'css',
							'selector'      => '.caption .label1',
							'property'      => 'color',
						)
                    ),
                    'label_color2'       => array(
						'type'          => 'color',
						'label'         => '2nd Label Color',
						'show_reset'    => true,
						'preview'       => array(
							'type'          => 'css',
							'selector'      => '.caption .label2',
							'property'      => 'color',
						)
					),
		            'caption_typography'       => array(
						'type'          => 'typography',
						'label'         => 'Typography',
						'responsive' => true,
						'preview'       => array(
							'type'          => 'css',
							'selector'      => '.caption',
						)
					), 
				)
			)
		)
	)
));