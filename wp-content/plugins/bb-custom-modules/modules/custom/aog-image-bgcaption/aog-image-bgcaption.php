<?php
/**
 * @class aogImageBGCaption
 */
class aogImageBGCaption extends FLBuilderModule {

	/** 
	 * @method __construct
	 */  
	public function __construct()
	{
		global $customcategory;
		parent::__construct(array(
			'name'          	=> __('AOG - Image Background Caption', 'aog-image-bgcaption'),
			'description'   	=> __('Displays Image Background with Caption for AOG.', 'aog-image-bgcaption'),
			'category'      	=> __($customcategory, 'aog-image-bgcaption'),
			'partial_refresh'	=> true
		));
	}
	
	/**
	 * @method get_classname
	 */
	public function get_classname()
	{
		$classname = 'aog-image-bgcaption';
		return $classname;
	}

	/**
	 * Returns link rel based on settings.
	 * @since 2.2
	 * @return string
	 */
	public function get_rel_link() {
        $items = $this->settings;
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

/**
 * Register the module and its form settings.
 */
FLBuilder::register_module('aogImageBGCaption', array(
	'general'         => array(
		'title'         => __('Content', 'aog-image-bgcaption'),
		'sections'      => array(
            'general' => array(
                'title' => '',
                'fields' => array(
                    'select_align' => array(
                        'type'          => 'select',
                        'label'         => __( 'Caption Box Alignment', 'aog-image-bgcaption' ),
                        'default'       => 'left',
                        'options'       => array(
                            'left'      => __( 'Left', 'aog-image-bgcaption' ),
                            'right'      => __( 'Right', 'aog-image-bgcaption' )
                        )
					),
					'overall_height' => array(
						'type'         => 'unit',
						'label'        => 'Overall Height',
						'units'          => array( 'px', 'vh', '%' ),
						'default_unit' => '%', // Optional
						'preview'    => array(
							'type'          => 'css',
							'selector'      => '{node} .image-wrapper img',
							'property'      => 'height',
						),
					)
                )
            ),
		    'heading'       => array(
				'title'         => 'Dual Color Heading',
				'fields'        => array(
					'label1'       => array(
                        'type' => 'text',
                        'label'         => 'Label 1',
                        'default'   => __('', 'aog-image-bgcaption'),
						'placeholder'   => __('Label Text', 'aog-image-bgcaption'),
                    ),
                    'label2' => array(
                        'type'          => 'text',
                        'label'         => 'Label 2',
                        'default'   => __('', 'aog-image-bgcaption'),
						'placeholder'   => __('Label Text', 'aog-image-bgcaption'),
                    )
				)
			),
			'link'       => array(
				'title'         => 'Button',
				'fields'        => array(
					'link_color'        => array(
						'type'          => 'color',
						'label'         => __('Overall Color', 'aog-content-slider'),
						'default'       => '',
						'show_reset'  => true,
						'show_alpha'  => true,
						'rules' => array(
							array(
								'selector'     => '{node} .btn.btn-outline',
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
						'label'         => __('Icon Type', 'aog-image-bgcaption'),
						'default'       => 'icon',
						'options'       => array(
							'icon'      => __('Icon', 'aog-image-bgcaption'),
							'image'     => __('Image', 'aog-image-bgcaption'),
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
						'label'         => __( 'Icon', 'aog-image-bgcaption' ),
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
						'label'         => __('Image', 'aog-image-bgcaption'),
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
                        'default'   => __('', 'aog-image-bgcaption'),
						'placeholder'   => __('Button Text', 'aog-image-bgcaption'),
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
			'image_caption_section'       => array(
				'title'         => 'Image Caption',
				'fields'        => array(
					'caption_box_width' => array(
						'type'         => 'unit',
						'label'        => 'Width',
						'units'          => array( 'px', 'vw', '%' ),
						'default_unit' => '%', // Optional
						'preview'    => array(
							'type'          => 'css',
							'selector'      => '{node} .caption-column',
							'property'      => 'width',
						),
					),
					'caption_box_color'       => array(
						'type'          => 'color',
						'label'         => 'Background Color',
						'show_reset'    => true,
						'show_alpha'    => true,
						'preview'       => array(
							'type'          => 'css',
							'selector'      => '{node} .caption',
							'property'      => 'background-color',
						)
                    ),
				)
            ),
            'image'       => array(
				'title'         => 'Image',
				'fields'        => array(
                    'photo_img' => array(
                        'type'          => 'photo',
                        'label'         => __('Photo', 'aog-image-bgcaption'),
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