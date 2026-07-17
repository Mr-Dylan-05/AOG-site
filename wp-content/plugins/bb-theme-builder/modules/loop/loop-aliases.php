<?php

FLBuilder::register_module_alias( 'loop-blank', [
	'name'     => __( 'Blank', 'bb-theme-builder' ),
	'module'   => 'loop',
	'location' => 'inline',
	'icon'     => '<svg></svg>',
	'settings' => [
		'data_source'             => 'custom_query',
		'column_sizing'           => 'count',
		'column_count'            => 3,
		'column_count_large'      => 3,
		'column_count_medium'     => 2,
		'column_count_responsive' => 1,
		'gap_row'                 => 20,
		'gap_column'              => 20,
		'gap_unit'                => 'px',
	],
	'template' => [],
] );

FLBuilder::register_module_alias( 'loop-list', [
	'name'     => __( 'List', 'bb-theme-builder' ),
	'module'   => 'loop',
	'location' => 'inline',
	'icon'     => 'list-v2.svg',
	'settings' => [
		'data_source'             => 'custom_query',
		'column_sizing'           => 'count',
		'column_count'            => 1,
		'column_count_large'      => 1,
		'column_count_medium'     => 1,
		'column_count_responsive' => 1,
		'gap_row'                 => 0,
		'gap_column'              => 0,
		'gap_unit'                => 'px',
	],
	'template' => [
		[
			'box',
			[
				'layout'         => 'flex',
				'flex_direction' => 'column',
				'padding_left'   => 0,
				'padding_right'  => 0,
				'padding_top'    => 40,
				'padding_bottom' => 40,
				'border'         => [
					'style' => 'solid',
					'color' => 'd6d6d6',
					'width' => [
						'top'    => 0,
						'right'  => 0,
						'bottom' => 1,
						'left'   => 0,
					],
				],
			],
			[
				[
					'photo',
					[
						'link_type'          => 'url',
						'width'              => 100,
						'width_unit'         => '%',
						'margin_left'        => 0,
						'margin_right'       => 0,
						'margin_top'         => 0,
						'margin_bottom'      => 20,
						'visibility_display' => 'logic',
						'visibility_logic'   => [
							[
								[
									'type'     => 'wordpress/post-featured-image',
									'operator' => 'is_set',
								],
							],
						],
						'connections'        => [
							'photo'    => (object) [
								'object'   => 'post',
								'property' => 'featured_image_url',
								'field'    => 'photo',
								'settings' => (object) [
									'size' => 'medium',
								],
							],
							'link_url' => (object) [
								'object'   => 'post',
								'property' => 'url',
								'field'    => 'link',
								'settings' => null,
							],
						],
					],
				],
				[
					'heading',
					[
						'tag'         => 'h3',
						'connections' => [
							'heading' => (object) [
								'object'   => 'post',
								'property' => 'title',
								'field'    => 'text',
							],
							'link'    => (object) [
								'object'   => 'post',
								'property' => 'url',
								'field'    => 'link',
							],
						],
					],
				],
				[
					'rich-text',
					[
						'text' => "[wpbb post:author_name type='display' link='yes' link_type='archive'] | [wpbb post:date format=''] | [wpbb post:terms_list taxonomy='category' html_list='no' display='name' separator=', ' limit='' linked='yes']",
					],
				],
				[
					'rich-text',
					[
						'text' => "[wpbb post:excerpt length='55' more='']

									[wpbb post:link text='custom' custom_text='Read More']",
					],
				],
			],
		],
	],
] );

FLBuilder::register_module_alias( 'loop-columns', [
	'name'     => __( 'Columns', 'bb-theme-builder' ),
	'module'   => 'loop',
	'location' => 'inline',
	'icon'     => 'grid.svg',
	'settings' => [
		'data_source'             => 'custom_query',
		'column_sizing'           => 'count',
		'column_count'            => 3,
		'column_count_large'      => 3,
		'column_count_medium'     => 2,
		'column_count_responsive' => 1,
		'gap_row'                 => 20,
		'gap_column'              => 20,
		'gap_unit'                => 'px',
	],
	'template' => [
		[
			'box',
			[
				'layout'         => 'flex',
				'flex_direction' => 'column',
				'padding_left'   => 20,
				'padding_right'  => 20,
				'padding_top'    => 20,
				'padding_bottom' => 20,
				'border'         => [
					'style' => 'solid',
					'color' => 'e6e6e6',
					'width' => [
						'top'    => 1,
						'right'  => 1,
						'bottom' => 1,
						'left'   => 1,
					],
				],
			],
			[
				[
					'photo',
					[
						'link_type'          => 'url',
						'width'              => 100,
						'width_unit'         => '%',
						'margin_left'        => -20,
						'margin_right'       => -20,
						'margin_top'         => -20,
						'margin_bottom'      => 10,
						'visibility_display' => 'logic',
						'visibility_logic'   => [
							[
								[
									'type'     => 'wordpress/post-featured-image',
									'operator' => 'is_set',
								],
							],
						],
						'connections'        => [
							'photo'    => (object) [
								'object'   => 'post',
								'property' => 'featured_image_url',
								'field'    => 'photo',
								'settings' => (object) [
									'size' => 'medium',
								],
							],
							'link_url' => (object) [
								'object'   => 'post',
								'property' => 'url',
								'field'    => 'link',
								'settings' => null,
							],
						],
					],
				],
				[
					'heading',
					[
						'tag'         => 'h3',
						'connections' => [
							'heading' => (object) [
								'object'   => 'post',
								'property' => 'title',
								'field'    => 'text',
							],
							'link'    => (object) [
								'object'   => 'post',
								'property' => 'url',
								'field'    => 'link',
							],
						],
					],
				],
				[
					'rich-text',
					[
						'text' => "[wpbb post:author_name type='display' link='yes' link_type='archive'] | [wpbb post:date format='']",
					],
				],
				[
					'rich-text',
					[
						'connections' => [
							'text' => (object) [
								'object'   => 'post',
								'property' => 'excerpt',
								'field'    => 'editor',
							],
						],
					],
				],
			],
		],
	],
] );

FLBuilder::register_module_alias( 'loop-terms', [
	'name'     => __( 'Categories', 'bb-theme-builder' ),
	'module'   => 'loop',
	'location' => 'inline',
	'icon'     => 'grid.svg',
	'settings' => [
		'data_source'             => 'taxonomy_query',
		'column_sizing'           => 'count',
		'column_count'            => 3,
		'column_count_large'      => 3,
		'column_count_medium'     => 2,
		'column_count_responsive' => 1,
		'gap_row'                 => 20,
		'gap_column'              => 20,
		'gap_unit'                => 'px',
	],
	'template' => [
		[
			'box',
			[
				'layout'         => 'flex',
				'flex_direction' => 'column',
				'padding_left'   => 20,
				'padding_right'  => 20,
				'padding_top'    => 20,
				'padding_bottom' => 20,
				'border'         => [
					'style' => 'solid',
					'color' => 'e6e6e6',
					'width' => [
						'top'    => 1,
						'right'  => 1,
						'bottom' => 1,
						'left'   => 1,
					],
				],
			],
			[
				[
					'heading',
					[
						'tag'         => 'h3',
						'connections' => [
							'heading' => (object) [
								'object'   => 'post',
								'property' => 'term_title',
								'field'    => 'text',
							],
							'link'    => (object) [
								'object'   => 'post',
								'property' => 'term_url',
								'field'    => 'link',
							],
						],
					],
				],
				[
					'rich-text',
					[
						'connections' => [
							'text' => (object) [
								'object'   => 'post',
								'property' => 'term_description',
								'field'    => 'editor',
							],
						],
					],
				],
			],
		],
	],
] );

if ( class_exists( 'WooCommerce' ) ) {

	FLBuilder::register_module_alias( 'loop-woocommerce-category', [
		'name'     => __( 'Product Categories', 'bb-theme-builder' ),
		'module'   => 'loop',
		'location' => 'inline',
		'icon'     => 'grid.svg',
		'settings' => [
			'data_source'             => 'taxonomy_query',
			'terms_taxonomy'          => 'product_cat',
			'column_sizing'           => 'count',
			'column_count'            => 3,
			'column_count_large'      => 3,
			'column_count_medium'     => 2,
			'column_count_responsive' => 1,
			'gap_row'                 => 20,
			'gap_column'              => 20,
			'gap_unit'                => 'px',
		],
		'template' => [
			[
				'box',
				[
					'layout'         => 'flex',
					'flex_direction' => 'column',
					'padding_left'   => 20,
					'padding_right'  => 20,
					'padding_top'    => 20,
					'padding_bottom' => 20,
					'border'         => [
						'style' => 'solid',
						'color' => 'e6e6e6',
						'width' => [
							'top'    => 1,
							'right'  => 1,
							'bottom' => 1,
							'left'   => 1,
						],
					],
				],
				[
					[
						'photo',
						[
							'link_type'     => 'url',
							'width'         => 100,
							'width_unit'    => '%',
							'margin_left'   => -20,
							'margin_right'  => -20,
							'margin_top'    => -20,
							'margin_bottom' => 10,
							// 'visibility_display' => 'logic',
							// 'visibility_logic'   => [
							//  [
							//      [
							//          'type'     => 'wordpress/post-featured-image',
							//          'operator' => 'is_set',
							//      ],
							//  ],
							// ],
							'connections'   => [
								'photo'    => (object) [
									'object'   => 'archive',
									'property' => 'woocommerce_category_image_url',
									'field'    => 'photo',
									'settings' => (object) [
										'size' => 'medium',
									],
								],
								'link_url' => (object) [
									'object'   => 'post',
									'property' => 'url',
									'field'    => 'link',
									'settings' => null,
								],
							],
						],
					],
					[
						'heading',
						[
							'tag'         => 'h3',
							'connections' => [
								'heading' => (object) [
									'object'   => 'post',
									'property' => 'term_title',
									'field'    => 'text',
								],
								'link'    => (object) [
									'object'   => 'post',
									'property' => 'term_url',
									'field'    => 'link',
								],
							],
						],
					],
					[
						'rich-text',
						[
							'connections' => [
								'text' => (object) [
									'object'   => 'post',
									'property' => 'term_description',
									'field'    => 'editor',
								],
							],
						],
					],
				],
			],
		],
	] );
}
