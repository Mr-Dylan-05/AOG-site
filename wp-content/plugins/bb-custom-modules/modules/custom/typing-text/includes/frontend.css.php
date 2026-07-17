<?php if ( $settings->heading_color <> '' ) { ?>
.fl-node-<?php echo $id; ?> .typing-text > a {
	color: #<?php echo $settings->heading_color; ?>;
}
<?php } ?>

<?php if ( $settings->cursor_color <> '' ) { ?>
.fl-node-<?php echo $id; ?> .typing-text .typewrite > .wrap {
    border-right: 0.08em solid #<?php echo $settings->cursor_color; ?>;
    border-color: #<?php echo $settings->cursor_color; ?>;
}
<?php } ?>

<?php
FLBuilderCSS::typography_field_rule( array(
	'settings'	=> $settings,
	'setting_name' 	=> 'heading_typography',
	'selector' 	=> ".fl-node-$id .typing-text",
) );
?>