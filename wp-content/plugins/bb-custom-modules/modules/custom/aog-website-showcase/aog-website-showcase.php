<?php
/**
 * @class aogWebsiteShowcase
 */
class aogWebsiteShowcase extends FLBuilderModule {

	/** 
	 * @method __construct
	 */  
	public function __construct()
	{
		global $customcategory;
		parent::__construct(array(
			'name'          	=> __('AOG - Website Showcase', 'aog-web-showcase'),
			'description'   	=> __('Displays a website portfolio for AOG.', 'aog-web-showcase'),
			'category'      	=> __($customcategory, 'aog-web-showcase'),
			'partial_refresh'	=> true
		));
	}
	
	/**
	 * @method get_classname
	 */
	public function get_classname()
	{
		$classname = 'aog-web-showcase';
		return $classname;
	}

	/**
	 * Returns link rel based on settings.
	 * @since 2.2
	 * @return string
	 */
	public function get_rel_link($i) {
		$items = $this->settings;
		
		if ($i == 0) {
			$url_target = $items->web_img4_url_target;
			$url_nofollow = $items->web_img4_url_nofollow;
		}
		elseif ($i == 1) {
			$url_target = $items->web_img2_url_target;
			$url_nofollow = $items->web_img2_url_nofollow;
		}
		elseif ($i == 2) {
			$url_target = $items->web_img1_url_target;
			$url_nofollow = $items->web_img1_url_nofollow;
		}
		elseif ($i == 3) {
			$url_target = $items->web_img3_url_target;
			$url_nofollow = $items->web_img3_url_nofollow;
		}
		elseif ($i == 4) {
			$url_target = $items->web_img5_url_target;
			$url_nofollow = $items->web_img5_url_nofollow;
		}

		$rel = array();
        if ( '_blank' == $url_target ) {
            $rel[] = 'noopener';
        }
        if ( isset( $url_nofollow ) && 'yes' == $url_nofollow ) {
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
FLBuilder::register_module('aogWebsiteShowcase', array(
	'general'         => array(
		'title'         => __('Content', 'aog-web-showcase'),
		'sections'      => array(
			'img_section1'       => array(
				'title'         => 'Website Image 1',
				'fields'        => array(
                    'web_img1' => array(
                        'type'          => 'photo',
                        'label'         => __('Image', 'aog-web-showcase'),
                        'show_remove'   => false,
					),
					'web_img1_url'  => array(
						'type'          => 'link',
						'label'         => 'Link',
						'show_target'	=> true,
						'show_nofollow'	=> true
					)
				)
			),
			'img_section2'       => array(
				'title'         => 'Website Image 2',
				'fields'        => array(
                    'web_img2' => array(
                        'type'          => 'photo',
                        'label'         => __('Image', 'aog-web-showcase'),
                        'show_remove'   => false,
					),
					'web_img2_url'  => array(
						'type'          => 'link',
						'label'         => 'Link',
						'show_target'	=> true,
						'show_nofollow'	=> true
					)
				)
			),
			'img_section3'       => array(
				'title'         => 'Website Image 3',
				'fields'        => array(
                    'web_img3' => array(
                        'type'          => 'photo',
                        'label'         => __('Image', 'aog-web-showcase'),
                        'show_remove'   => false,
					),
					'web_img3_url'  => array(
						'type'          => 'link',
						'label'         => 'Link',
						'show_target'	=> true,
						'show_nofollow'	=> true
					)
				)
			),
			'img_section4'       => array(
				'title'         => 'Website Image 4',
				'fields'        => array(
                    'web_img4' => array(
                        'type'          => 'photo',
                        'label'         => __('Image', 'aog-web-showcase'),
                        'show_remove'   => false,
					),
					'web_img4_url'  => array(
						'type'          => 'link',
						'label'         => 'Link',
						'show_target'	=> true,
						'show_nofollow'	=> true
					)
				)
			),
			'img_section5'       => array(
				'title'         => 'Website Image 5',
				'fields'        => array(
                    'web_img5' => array(
                        'type'          => 'photo',
                        'label'         => __('Image', 'aog-web-showcase'),
                        'show_remove'   => false,
					),
					'web_img5_url'  => array(
						'type'          => 'link',
						'label'         => 'Link',
						'show_target'	=> true,
						'show_nofollow'	=> true
					)
				)
			)
		)
	),
	'style'         => array(
		'title'         => __('Style', 'aog-web-showcase'),
		'sections'      => array(
            'general' => array(
                'title' => '',
                'fields' => array(
                    'select_align' => array(
                        'type'          => 'select',
                        'label'         => __( 'Caption Box Alignment', 'aog-web-showcase' ),
                        'default'       => 'left',
                        'options'       => array(
                            'left'      => __( 'Left', 'aog-web-showcase' ),
                            'right'      => __( 'Right', 'aog-web-showcase' )
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
                        'default'   => __('', 'aog-web-showcase'),
						'placeholder'   => __('Label Text', 'aog-web-showcase'),
                    ),
                    'label2' => array(
                        'type'          => 'text',
                        'label'         => 'Label 2',
                        'default'   => __('', 'aog-web-showcase'),
						'placeholder'   => __('Label Text', 'aog-web-showcase'),
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
						'label'         => __('Icon Type', 'aog-web-showcase'),
						'default'       => 'icon',
						'options'       => array(
							'icon'      => __('Icon', 'aog-web-showcase'),
							'image'     => __('Image', 'aog-web-showcase'),
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
						'label'         => __( 'Icon', 'aog-web-showcase' ),
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
						'label'         => __('Image', 'aog-web-showcase'),
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
                        'default'   => __('', 'aog-web-showcase'),
						'placeholder'   => __('Button Text', 'aog-web-showcase'),
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