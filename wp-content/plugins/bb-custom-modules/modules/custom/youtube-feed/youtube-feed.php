<?php
/**
 * @class advanceResponsiveMenuModule
 */
class youtubeFeed extends FLBuilderModule {

	/** 
	 * @method __construct
	 */  
	public function __construct()
	{
		global $customcategory;
		parent::__construct(array(
			'name'          	=> __('YouTube Feed', 'fl-builder'),
			'description'   	=> __('Displays a youtube video or playlist.', 'fl-builder'),
			'category'      	=> __($customcategory, 'fl-builder'),
			'partial_refresh'	=> true
		));
	}
	
	/**
	 * @method get_classname
	 */
	public function get_classname()
	{
		$classname = 'youtube-feed';
		return $classname;
	}
}

/**
 * Register the module and its form settings.
 */
FLBuilder::register_module('youtubeFeed', array(
	'general'         => array(
		'title'         => __('General', 'fl-builder'),
		'sections'      => array(
			'general'       => array(
				'title'         => '',
				'fields'        => array(
                    'youtube_type'   => array(
                        'type'          => 'select',
                        'label'         => __( 'YouTube Format', 'fl-builder' ),
                        'default'       => 'video',
						'options'       => array(
							'video'      => __( 'Video', 'fl-builder' ),
							'playlist'      => __( 'Playlist', 'fl-builder' )
						),
						'toggle'        => array(
						    'video'     => array(
						        'fields'  => array( 'youtube_video' ),    
					        ), 
					        'playlist'     => array(
						        'fields'  => array( 'youtube_playlist' ),    
					        ),
					    ),
                    ),
                    'youtube_video'     => array(
                        'type'      => 'text',
                        'label'     => __('YouTube Video ID', 'fl-builder'),
                    ),
                    'youtube_playlist'     => array(
                        'type'      => 'text',
                        'label'     => __('YouTube Playlist ID', 'fl-builder'),
                    ),
				)
			),
			'video_size'    => array(
		        'title'     => '',
		        'fields'    => array(
		            'video_width'    => array(
		                'type'  => 'unit',
		                'label' => __('Video Width', 'fl-builder'),
		                'default'    => '500',
		                'sanitize'   => 'floatval',
		                'units' => array('px'),
	                ),
	                'video_height'    => array(
		                'type'  => 'unit',
		                'label' => __('Video Height', 'fl-builder'),
		                'default'    => '300',
		                'sanitize'   => 'floatval',
		                'units' =>  array('px') ,
	                ), 
	            ),
		    ),
		)
	),
));