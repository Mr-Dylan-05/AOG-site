<?php if( $settings->video_layout === 'full' )  { ?>
    .fl-node-<?php echo $id; ?> .fl-wistia-video iframe{
        position: absolute;
        top: 0;
        left: 0;
        width: 100% !important;
        height: 100% !important;
    }
    .fl-node-<?php echo $id; ?> .wistia-container{
        position: relative !important;
        padding-bottom: 30% !important;
        padding-top: 26% !important;
        height: 0;
        overflow: hidden;
    }
<?php } else if( $settings->video_layout === 'custom' ) { ?>
    .fl-node-<?php echo $id; ?> .fl-wistia-video iframe{
        width: <?php echo $settings->custom_height; echo $settings->custom_height_unit;  ?>;
        height: <?php echo $settings->custom_width; echo $settings->custom_width_unit;  ?>;
    }
    .fl-node-<?php echo $id; ?> .wistia-container{
        text-align: center;
    }
<?php } 

FLBuilderCSS::border_field_rule( array(
	'settings' 	=> $settings,
	'setting_name' 	=> 'wistia_border',
	'selector' 	=> ".fl-node-$id .wistia-container",
) );

?>