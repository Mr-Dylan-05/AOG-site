.fl-node-<?php echo $id; ?> {
	padding-top: <?php echo $settings->padding_top; ?>px;
	padding-bottom: <?php echo $settings->padding_bottom; ?>px;
	padding-left: <?php echo $settings->padding_left; ?>px;
	padding-right: <?php echo $settings->padding_right; ?>px;
}

.fl-node-<?php echo $id; ?> .dl-title-content span {
    
}

<?php if(!empty($settings->dl_icon_color)) : ?>
.fl-node-<?php echo $id; ?> .dl-title i {
	color: #<?php echo $settings->dl_icon_color; ?>;
}
<?php endif; ?>

.fl-node-<?php echo $id; ?> .dl-title-content span {
    <?php if($settings->dl_font_size == 'custom') : ?>
	font-size: <?php echo $settings->dl_custom_font_size; ?>px;
	<?php endif; ?>
	<?php if($settings->dl_line_height == 'custom') : ?>
	line-height: <?php echo $settings->dl_custom_line_height; ?>;
	<?php endif; ?>
	<?php if($settings->dl_letter_spacing == 'custom') : ?>
	letter-spacing: <?php echo $settings->dl_custom_letter_spacing; ?>px;
	<?php endif; ?>
    opacity: <?php echo $settings->dl_title_opacity; ?> !important;
    margin-bottom: 5px;
}

<?php if(!empty($settings->dl_title_color)) : ?>
.fl-node-<?php echo $id; ?> .dl-title-content span {
	color: #<?php echo $settings->dl_title_color; ?>;
}
<?php endif; ?>
<?php if( !empty($settings->dl_font) && $settings->dl_font['family'] != 'Default' ) : ?>
.fl-node-<?php echo $id; ?> .items-slider-parallax-text h2 {
	<?php FLBuilderFonts::font_css( $settings->dl_font ); ?>
}
<?php endif; ?>