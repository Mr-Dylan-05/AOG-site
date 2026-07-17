<?php if ( !empty($settings->slider_bg_color) ) { ?>
.fl-node-<?php echo $id; ?> .slider{
	background-color: #<?php echo $settings->slider_bg_color; ?>;
}
<?php } ?>
<?php if ( !empty($settings->overlay_pattern) || !empty($settings->overlay_color) || $settings->overlay_opacity <> '' ) { ?>
	.fl-node-<?php echo $id; ?> .slide-item::before{
		<?php if ( !empty($settings->overlay_color) ) { ?>
			background-color: #<?php echo $settings->overlay_color; ?>;
		<?php } ?>
		<?php if ( !empty($settings->overlay_pattern) ) { ?>
			background-image: url('<?php echo $settings->overlay_pattern_src; ?>');
		<?php } ?>
		<?php if ( $settings->overlay_opacity <> '' ) { ?>
			opacity: <?php echo $settings->overlay_opacity; ?>;
		<?php } ?>
	}
<?php } ?>
<?php if ( !empty($settings->slider_button_color) || !empty($settings->slider_button_color_text) ) { ?>
.fl-node-<?php echo $id; ?> a.slider-button{
	<?php if ( !empty($settings->slider_button_color) ) { ?>
		background-color: #<?php echo $settings->slider_button_color; ?>;
		border-color: #<?php echo $settings->slider_button_color; ?>;
	<?php } ?>
	<?php if ( !empty($settings->slider_button_color_text) ) { ?>
		color: #<?php echo $settings->slider_button_color_text; ?>;
	<?php } ?>
}
<?php } ?>
<?php if ( !empty($settings->slider_button_color_highlight) || !empty($settings->slider_button_color_highlight_text) ) { ?>
.fl-node-<?php echo $id; ?> a.slider-button.highlight{
	<?php if ( !empty($settings->slider_button_color_highlight) ) { ?>
		background-color: #<?php echo $settings->slider_button_color_highlight; ?>;
		border-color: #<?php echo $settings->slider_button_color_highlight; ?>;
	<?php } ?>
	<?php if ( !empty($settings->slider_button_color_highlight_text) ) { ?>
		color: #<?php echo $settings->slider_button_color_highlight_text; ?>;
	<?php } ?>
}
<?php } ?>
<?php if ( $settings->padding_top <> '' || $settings->padding_bottom <> '' || $settings->padding_left <> '' || $settings->padding_right <> '' ) { ?>
.fl-node-<?php echo $id; ?> .slider-info {
	<?php if ( $settings->padding_top <> '' ){ ?>padding-top: <?php echo $settings->padding_top; ?>px;<?php } ?>
	<?php if ( $settings->padding_bottom <> '' ) { ?>padding-bottom: <?php echo $settings->padding_bottom; ?>px;<?php } ?>
	<?php if ( $settings->padding_left <> '' ) { ?>padding-left: <?php echo $settings->padding_left; ?>px;<?php } ?>
	<?php if ( $settings->padding_right <> '' ) { ?>padding-right: <?php echo $settings->padding_right; ?>px;<?php } ?>
}
<?php } ?>
<?php if ( $settings->height == 'customheight' && !empty($settings->customheight) ) { ?>
	@media only screen and ( min-width: 1024px ) {
		.fl-node-<?php echo $id; ?> .customheight .slide-item,
		.fl-node-<?php echo $id; ?> .customheight,
		.fl-node-<?php echo $id; ?> .customheight .fl-row-fixed-width { height: <?php echo $settings->customheight; ?>px; }
	}
<?php } ?>

<?php
FLBuilderCSS::typography_field_rule( array(
	'settings'	=> $settings,
	'setting_name' 	=> 'slider_title_typography',
	'selector' 	=> ".fl-node-$id .slider-info .slider-title",
) );
?>

<?php
FLBuilderCSS::typography_field_rule( array(
	'settings'	=> $settings,
	'setting_name' 	=> 'prefix_title_typography',
	'selector' 	=> ".fl-node-$id .slider-info .slider-prefix",
) );
?>

<?php for($i = 0; $i < count($settings->items); $i++) : if(!is_object($settings->items[$i])) continue; ?>

	<?php if ( !empty($settings->items[$i]->slide_overlay_color) || $settings->items[$i]->slide_overlay_opacity <> '' ) { ?>
		.fl-node-<?php echo $id; ?> .slide-<?php echo ($i+1); ?>::before{
			<?php if ( !empty($settings->items[$i]->slide_overlay_color) ) { ?>
				background-color: #<?php echo $settings->items[$i]->slide_overlay_color; ?>;
			<?php } ?>
			<?php if ( $settings->items[$i]->slide_overlay_opacity <> '' ) { ?>
				opacity: <?php echo $settings->items[$i]->slide_overlay_opacity; ?>;
			<?php } ?>
		}
	<?php } ?>
	<?php if ( !empty( $settings->items[$i]->slider_bg_image ) ) { ?>
		.fl-node-<?php echo $id; ?> .slide-<?php echo ($i+1); ?> {
			 background-image: url(<?php echo $settings->items[$i]->slider_bg_image_src; ?>);
			<?php if ( !empty( $settings->items[$i]->slider_bg_image_position ) ) { ?>
			 background-position: <?php echo $settings->items[$i]->slider_bg_image_position; ?>;
			<?php } ?>
		}
	<?php } ?>
	<?php if ( !empty( $settings->items[$i]->slider_style_text_width ) ||  $settings->items[$i]->slide_padding_top <> '' || $settings->items[$i]->slide_padding_bottom <> '' || $settings->items[$i]->slide_padding_left <> '' || $settings->items[$i]->slide_padding_right <> '' ) { ?>
		.fl-node-<?php echo $id; ?> .slide-<?php echo ($i+1); ?> .slider-image {
			<?php if ( !empty( $settings->items[$i]->slide_style_text_width ) ) { ?>
				width: <?php echo 100-($settings->items[$i]->slide_style_text_width); ?>%;
			<?php } ?>
			<?php if ( $settings->items[$i]->slide_padding_top <> '' ){ ?>padding-top: <?php echo $settings->items[$i]->slide_padding_top; ?>px;<?php } ?>
			<?php if ( $settings->items[$i]->slide_padding_bottom <> '' ) { ?>padding-bottom: <?php echo $settings->items[$i]->slide_padding_bottom; ?>px;<?php } ?>
			<?php if ( $settings->items[$i]->slide_padding_left <> '' ) { ?>padding-left: <?php echo $settings->items[$i]->slide_padding_left; ?>px;<?php } ?>
			<?php if ( $settings->items[$i]->slide_padding_right <> '' ) { ?>padding-right: <?php echo $settings->items[$i]->slide_padding_right; ?>px;<?php } ?>
		}
	<?php } ?>
	<?php if ( !empty( $settings->items[$i]->slide_text_vertical_align ) ) { ?>
		.fl-node-<?php echo $id; ?> .slide-<?php echo ($i+1); ?> .slider-info {
			vertical-align: <?php echo $settings->items[$i]->slide_text_vertical_align; ?>;
		}
	<?php } ?>
	<?php if ( !empty( $settings->items[$i]->slider_style_text_aligment ) || !empty( $settings->items[$i]->slide_text_vertical_align ) || !empty( $settings->items[$i]->slider_style_text_width ) ||  $settings->items[$i]->text_padding_top <> '' || $settings->items[$i]->text_padding_bottom <> '' || $settings->items[$i]->text_padding_left <> '' || $settings->items[$i]->text_padding_right <> '' ) { ?>
		.fl-node-<?php echo $id; ?> .slide-<?php echo ($i+1); ?> .slider-info-content {
			<?php if ( !empty( $settings->items[$i]->slider_style_text_aligment ) ) { ?>
				text-align: <?php echo $settings->items[$i]->slider_style_text_aligment; ?>;
			<?php } ?>
			<?php if ( !empty( $settings->items[$i]->slider_style_text_width ) ) { ?>
				width: <?php echo $settings->items[$i]->slider_style_text_width; ?>%;
			<?php } ?>
			<?php if ( $settings->items[$i]->text_padding_top <> '' ){ ?>padding-top: <?php echo $settings->items[$i]->text_padding_top; ?>px;<?php } ?>
			<?php if ( $settings->items[$i]->text_padding_bottom <> '' ) { ?>padding-bottom: <?php echo $settings->items[$i]->text_padding_bottom; ?>px;<?php } ?>
			<?php if ( $settings->items[$i]->text_padding_left <> '' ) { ?>padding-left: <?php echo $settings->items[$i]->text_padding_left; ?>px;<?php } ?>
			<?php if ( $settings->items[$i]->text_padding_right <> '' ) { ?>padding-right: <?php echo $settings->items[$i]->text_padding_right; ?>px;<?php } ?>
		}
	<?php } ?>
	<?php if ( !empty($settings->items[$i]->slider_bg_image_mobile) || $settings->items[$i]->slider_bg_image_mobile_bottom_spacing <> '' ) { ?>
		@media only screen and ( max-width: 600px ) {
			.fl-node-<?php echo $id; ?> .slide-<?php echo ($i+1); ?>::after {
			<?php if ( !empty( $settings->items[$i]->slider_bg_image_mobile ) ) { ?>
				 background-image: url(<?php echo $settings->items[$i]->slider_bg_image_mobile_src; ?>);
			<?php } ?>
			<?php if ( $settings->items[$i]->slider_bg_image_mobile_bottom_spacing <> '' ) { ?>
				 padding-bottom: <?php echo $settings->items[$i]->slider_bg_image_mobile_bottom_spacing; ?>px;
			<?php } ?>
			}
		}
	<?php } ?>
	<?php if ( $settings->items[$i]->slider_bg_image_mobile_portrait_bottom_spacing <> '' ) { ?>
		@media only screen and ( max-width: 500px ) {
			.fl-node-<?php echo $id; ?> .slide-<?php echo ($i+1); ?> {
			<?php if ( $settings->items[$i]->slider_bg_image_mobile_portrait_bottom_spacing <> '' ) { ?>
				 padding-bottom: <?php echo $settings->items[$i]->slider_bg_image_mobile_portrait_bottom_spacing; ?>px;
			<?php } ?>
			}
		}
	<?php } ?>
	<?php if ( !empty($settings->items[$i]->slider_title_color) || $settings->items[$i]->slider_title_max_width <> '' ) { ?>
		.fl-node-<?php echo $id; ?> .slide-<?php echo ($i+1); ?> .slider-title{
			<?php if ( !empty($settings->items[$i]->slider_title_color) ) { ?>
				color: #<?php echo $settings->items[$i]->slider_title_color; ?>;
			<?php } ?>
			<?php if ( $settings->items[$i]->slider_title_max_width <> '' ) { ?>
				max-width: <?php echo $settings->items[$i]->slider_title_max_width; ?>%;
			<?php } ?>
		}
	<?php } ?>
		<?php if ( !empty($settings->items[$i]->slider_title_span_color) ) { ?>
			.fl-node-<?php echo $id; ?> .slide-<?php echo ($i+1); ?> .slider-title span{
				color: #<?php echo $settings->items[$i]->slider_title_span_color; ?>;
			}
		<?php } ?>
	<?php if ( $settings->items[$i]->slider_text_size <> '' || !empty($settings->items[$i]->slider_text_color) || $settings->items[$i]->slider_text_max_width <> '' ) { ?>
		.fl-node-<?php echo $id; ?> .slide-<?php echo ($i+1); ?> .slider-text{
			<?php if ( $settings->items[$i]->slider_text_size <> '') { ?>
				font-size: <?php echo $settings->items[$i]->slider_text_size; ?>px;
			<?php } ?>
			<?php if ( !empty($settings->items[$i]->slider_text_color) ) { ?>
				color: #<?php echo $settings->items[$i]->slider_text_color; ?>;
			<?php } ?>
			<?php if ( $settings->items[$i]->slider_text_max_width <> '' ) { ?>
				max-width: <?php echo $settings->items[$i]->slider_text_max_width; ?>%;
			<?php } ?>
		}
	<?php } ?>
		<?php if ( !empty($settings->items[$i]->slider_text_span_color) ) { ?>
			.fl-node-<?php echo $id; ?> .slide-<?php echo ($i+1); ?> .slider-text span{
				color: #<?php echo $settings->items[$i]->slider_text_span_color; ?>;
			}
		<?php } ?>
	<?php if ( $settings->items[$i]->slider_btn_title_size <> '' || !empty($settings->items[$i]->slider_btn_title_color) ) { ?>
		.fl-node-<?php echo $id; ?> .slide-<?php echo ($i+1); ?> .slider-button-title{
			<?php if ( $settings->items[$i]->slider_btn_title_size <> '') { ?>
				font-size: <?php echo $settings->items[$i]->slider_btn_title_size; ?>px;
			<?php } ?>
			<?php if ( !empty($settings->items[$i]->slider_btn_title_color) ) { ?>
				color: #<?php echo $settings->items[$i]->slider_btn_title_color; ?>;
			<?php } ?>
		}
	<?php } ?>
		<?php if ( !empty($settings->items[$i]->slider_btn_title_span_color) ) { ?>
			.fl-node-<?php echo $id; ?> .slide-<?php echo ($i+1); ?> .slider-button-title span{
				color: #<?php echo $settings->items[$i]->slider_btn_title_span_color; ?>;
			}
		<?php } ?>
	<?php if ( $settings->items[$i]->slider_btn_label_size <> '' || !empty($settings->items[$i]->slider_btn_label_color) || !empty($settings->items[$i]->slider_btn_border_color) ) { ?>
		.fl-node-<?php echo $id; ?> .slide-<?php echo ($i+1); ?> .slider-button{
			<?php if ( $settings->items[$i]->slider_btn_label_size <> '') { ?>
				font-size: <?php echo $settings->items[$i]->slider_btn_label_size; ?>px;
			<?php } ?>
			<?php if ( !empty($settings->items[$i]->slider_btn_label_color) ) { ?>
				color: #<?php echo $settings->items[$i]->slider_btn_label_color; ?>;
			<?php } ?>
			<?php if ( !empty($settings->items[$i]->slider_btn_border_color) ) { ?>
				border-color: #<?php echo $settings->items[$i]->slider_btn_border_color; ?>;
			<?php } ?>
		}
	<?php } ?>
	<?php if ( !empty($settings->items[$i]->slider_btn_label_highlight_color) || !empty($settings->items[$i]->slider_btn_border_highlight_color) ) { ?>
		.fl-node-<?php echo $id; ?> .slide-<?php echo ($i+1); ?> .slider-button.highlight{
			<?php if ( !empty($settings->items[$i]->slider_btn_label_highlight_color) ) { ?>
				color: #<?php echo $settings->items[$i]->slider_btn_label_highlight_color; ?>;
			<?php } ?>
			<?php if ( !empty($settings->items[$i]->slider_btn_border_highlight_color) ) { ?>
				border-color: #<?php echo $settings->items[$i]->slider_btn_border_highlight_color; ?>;
			<?php } ?>
		}
	<?php } ?>
	<?php if ( !empty($settings->items[$i]->slider_btn_label_span_color) ) { ?>
		.fl-node-<?php echo $id; ?> .slide-<?php echo ($i+1); ?> .slider-button span{
			color: #<?php echo $settings->items[$i]->slider_btn_label_span_color; ?>;
		}
	<?php } ?>
	<?php if ( !empty($settings->items[$i]->slider_bg_offset) ) { ?>
		.fl-node-<?php echo $id; ?> .slide-<?php echo ($i+1); ?>.slider-bg-offset.slider-bg-offset:not(.center)::before{
			bottom: <?php echo $settings->items[$i]->slider_bg_offset; ?>px;
		}
		.fl-node-<?php echo $id; ?> .slide-<?php echo ($i+1); ?>.slider-bg-offset.slider-bg-offset:not(.center)::after{
			bottom: <?php echo $settings->items[$i]->slider_bg_offset; ?>px;
		}
	<?php } ?>
	<?php if ( !empty($settings->items[$i]->slider_scroller) ) { ?>
		<?php if ( !empty($settings->items[$i]->slider_scroller_color) ) { ?>
			.fl-node-<?php echo $id; ?> .slide-<?php echo ($i+1); ?> .slider-scroller svg path + path{
				fill: #<?php echo $settings->items[$i]->slider_scroller_color; ?>;
			}
			.fl-node-<?php echo $id; ?> .slide-<?php echo ($i+1); ?> .slider-scroller svg path{
				stroke: #<?php echo $settings->items[$i]->slider_scroller_color; ?>;
			}
		<?php } ?>
		<?php if ( $settings->items[$i]->slider_scroller_bottom_spacing <> '' ) { ?>
			.fl-node-<?php echo $id; ?> .slide-<?php echo ($i+1); ?> .slider-scroller {
				bottom: <?php echo $settings->items[$i]->slider_scroller_bottom_spacing; ?>px;
			}
		<?php } ?>
	<?php } ?>
<?php endfor; ?>


<?php if ( $settings->show_dots == 'true') { ?>
	<?php if ( !empty($settings->dots_color) || $settings->dots_size <> '' || $settings->dots_spacing <> '' ) { ?>
		.fl-node-<?php echo $id; ?> .slider .owl-dots .owl-dot{
		<?php if ( !empty($settings->dots_color) ) { ?>
			background-color: #<?php echo $settings->dots_color; ?>;
		<?php } ?>
		<?php if ( $settings->dots_size <> '' ) { ?>
			width: <?php echo $settings->dots_size; ?>px;
			height: <?php echo $settings->dots_size; ?>px;
		<?php } ?>
		<?php if ( $settings->dots_spacing <> '' ) { ?>
			margin-left: <?php echo $settings->dots_spacing; ?>px;
			margin-right: <?php echo $settings->dots_spacing; ?>px;
		<?php } ?>
		}
	<?php } ?>
	<?php if ( !empty($settings->dots_active_color) ) { ?>
		.fl-node-<?php echo $id; ?> .slider .owl-dots .owl-dot.active{
			background-color: #<?php echo $settings->dots_active_color; ?>;
		}
	<?php } ?>
	<?php if ( $settings->dots_margin_top <> '' ) { ?>
		.fl-node-<?php echo $id; ?> .slider .owl-dots{
			margin-top: <?php echo $settings->dots_margin_top; ?>px;
		}
	<?php } ?>
<?php } ?>


<?php if ( $settings->show_nav == 'true') { ?>
	<?php if ( !empty($settings->nav_bg_color) || $settings->nav_border_thick <> '' || $settings->nav_size <> '' || $settings->nav_radius <> '' ) { ?>
		.fl-node-<?php echo $id; ?> .slider .owl-nav *{
		<?php if ( !empty($settings->nav_bg_color) ) { ?>
			background-color: #<?php echo $settings->nav_bg_color; ?>;
		<?php } ?>
		<?php if ( $settings->nav_border_thick <> '' ) { ?>
			border-width: <?php echo $settings->nav_border_thick; ?>px;
		<?php } ?>
		<?php if ( $settings->nav_size <> '' ) { ?>
			width: <?php echo $settings->nav_size; ?>px;
			height: <?php echo $settings->nav_size; ?>px;
		<?php } ?>
		<?php if ( $settings->nav_radius <> '' ) { ?>
			border-radius: <?php echo $settings->nav_radius; ?>px;
		<?php } ?>
		}
	<?php } ?>

	<?php if ( !empty($settings->nav_border_color) ) { ?>
		.fl-node-<?php echo $id; ?> .slider .owl-nav *:not(:hover){
			border-color: #<?php echo $settings->nav_border_color; ?>;
		}
	<?php } ?>
	<?php if ( !empty($settings->nav_bg_color_hover) || !empty($settings->nav_border_color_hover) ) { ?>
		.fl-node-<?php echo $id; ?> .slider .owl-nav *:hover{
			<?php if ( !empty($settings->nav_bg_color_hover) ) { ?>
				background-color: #<?php echo $settings->nav_bg_color_hover; ?>;
			<?php } ?>
			<?php if ( !empty($settings->nav_border_color_hover) ) { ?>
				border-color: #<?php echo $settings->nav_border_color_hover; ?>;
			<?php } ?>
		}
	<?php } ?>
	<?php if ( !empty($settings->nav_color_hover) ) { ?>
		.fl-node-<?php echo $id; ?> .slider .owl-nav *:hover::before,
		.fl-node-<?php echo $id; ?> .slider .owl-nav *:hover::after{
			background-color: #<?php echo $settings->nav_color_hover; ?>;
		}
	<?php } ?>

	<?php if ( $settings->nav_spacing <> '' ) { ?>
		.fl-node-<?php echo $id; ?> .slider .owl-nav .owl-prev{
			left: <?php echo $settings->nav_spacing; ?>px;
		}
		.fl-node-<?php echo $id; ?> .slider .owl-nav .owl-next{
			right: <?php echo $settings->nav_spacing; ?>px;
		}
	<?php } ?>

	<?php if ( !empty($settings->nav_color) || $settings->nav_thick <> '' || $settings->nav_arrow_radius <> '' ) { ?>
		.fl-node-<?php echo $id; ?> .slider .owl-nav *::before,
		.fl-node-<?php echo $id; ?> .slider .owl-nav *::after{
		<?php if ( !empty($settings->nav_color) ) { ?>
			background-color: #<?php echo $settings->nav_color; ?>;
		<?php } ?>
		<?php if ( $settings->nav_thick <> '' ) { ?>
			width: <?php echo $settings->nav_thick; ?>px;
		<?php } ?>
		<?php if ( $settings->nav_arrow_radius <> '' ) { ?>
			border-raduis: <?php echo $settings->nav_arrow_radius; ?>px;
		<?php } ?>
		}
	<?php } ?>
	<?php if ( $settings->nav_margin_top <> '' ) { ?>
		.fl-node-<?php echo $id; ?> .slider .owl-nav{
			margin-top: <?php echo $settings->nav_margin_top; ?>px;
		}
	<?php } ?>
<?php } ?>

<?php 
// MEDIUM - GLOBAL SETTING
$global_settings = FLBuilderModel::get_global_settings(); ?>
@media only screen and ( max-width: <?php echo $global_settings->medium_breakpoint; ?>px ) {
	<?php if ( $settings->padding_top_medium <> '' || $settings->padding_bottom_medium <> '' || $settings->padding_left_medium <> '' || $settings->padding_right_medium <> '' ) { ?>
	.fl-node-<?php echo $id; ?> .slider-info {
		<?php if ( $settings->padding_top_medium <> '' ){ ?>padding-top: <?php echo $settings->padding_top_medium; ?>px;<?php } ?>
		<?php if ( $settings->padding_bottom_medium <> '' ) { ?>padding-bottom: <?php echo $settings->padding_bottom_medium; ?>px;<?php } ?>
		<?php if ( $settings->padding_left_medium <> '' ) { ?>padding-left: <?php echo $settings->padding_left_medium; ?>px;<?php } ?>
		<?php if ( $settings->padding_right_medium <> '' ) { ?>padding-right: <?php echo $settings->padding_right_medium; ?>px;<?php } ?>
	}
	<?php } ?>
	<?php for($i = 0; $i < count($settings->items); $i++) : if(!is_object($settings->items[$i])) continue; ?>
		<?php if ( $settings->items[$i]->slide_padding_top_medium <> '' || $settings->items[$i]->slide_padding_bottom_medium <> '' || $settings->items[$i]->slide_padding_left_medium <> '' || $settings->items[$i]->slide_padding_right_medium <> '' ) { ?>
			.fl-node-<?php echo $id; ?> .slide-<?php echo ($i+1); ?> .slider-image {
				<?php if ( $settings->items[$i]->slide_padding_top_medium <> '' ){ ?>padding-top: <?php echo $settings->items[$i]->slide_padding_top_medium; ?>px;<?php } ?>
				<?php if ( $settings->items[$i]->slide_padding_bottom_medium <> '' ) { ?>padding-bottom: <?php echo $settings->items[$i]->slide_padding_bottom_medium; ?>px;<?php } ?>
				<?php if ( $settings->items[$i]->slide_padding_left_medium <> '' ) { ?>padding-left: <?php echo $settings->items[$i]->slide_padding_left_medium; ?>px;<?php } ?>
				<?php if ( $settings->items[$i]->slide_padding_right_medium <> '' ) { ?>padding-right: <?php echo $settings->items[$i]->slide_padding_right_medium; ?>px;<?php } ?>
			}
		<?php } ?>

		<?php if ( !empty( $settings->items[$i]->slider_style_text_width_medium ) ) { ?>
			.fl-node-<?php echo $id; ?> .slide-<?php echo ($i+1); ?> .slider-image {
				<?php if ( $settings->items[$i]->slider_style_text_width_medium != '100' ) { ?>
				width: <?php echo 100-($settings->items[$i]->slider_style_text_width_medium); ?>%;
				<?php } else { ?>
				width: <?php echo $settings->items[$i]->slider_style_text_width_medium; ?>%;
				<?php } ?>
			}
			.fl-node-<?php echo $id; ?> .slide-<?php echo ($i+1); ?> .slider-info-content {
				width: <?php echo $settings->items[$i]->slider_style_text_width_medium; ?>%;
			}
		<?php } ?>

		<?php if ( $settings->items[$i]->slider_title_size_medium <> '' || $settings->items[$i]->slider_title_size_medium <> '' ) { ?>
			.fl-node-<?php echo $id; ?> .slide-<?php echo ($i+1); ?> .slider-title{
				<?php if ( $settings->items[$i]->slider_title_size_medium <> '') { ?>
					font-size: <?php echo $settings->items[$i]->slider_title_size_medium; ?>px;
				<?php } ?>
				<?php if ( $settings->items[$i]->slider_title_max_width_medium <> '' ) { ?>
					max-width: <?php echo $settings->items[$i]->slider_title_max_width_medium; ?>%;
				<?php } ?>
			}
		<?php } ?>
		<?php if ( $settings->items[$i]->slider_text_size_medium <> '' || $settings->items[$i]->slider_text_max_width_medium <> '' ) { ?>
			.fl-node-<?php echo $id; ?> .slide-<?php echo ($i+1); ?> .slider-text{
				<?php if ( $settings->items[$i]->slider_text_size_medium <> '') { ?>
					font-size: <?php echo $settings->items[$i]->slider_text_size_medium; ?>px;
				<?php } ?>
				<?php if ( $settings->items[$i]->slider_text_max_width_medium <> '' ) { ?>
					max-width: <?php echo $settings->items[$i]->slider_text_max_width_medium; ?>%;
				<?php } ?>
			}
		<?php } ?>
		<?php if ( $settings->items[$i]->slider_btn_title_size_medium <> '') { ?>
			.fl-node-<?php echo $id; ?> .slide-<?php echo ($i+1); ?> .slider-button-title{
				font-size: <?php echo $settings->items[$i]->slider_btn_title_size_medium; ?>px;
			}
		<?php } ?>
		<?php if ( $settings->items[$i]->slider_btn_label_size_medium <> '') { ?>
			.fl-node-<?php echo $id; ?> .slide-<?php echo ($i+1); ?> .slider-button{
				font-size: <?php echo $settings->items[$i]->slider_btn_label_size_medium; ?>px;
			}
		<?php } ?>
		<?php if ( $settings->items[$i]->text_padding_top_medium <> '' || $settings->items[$i]->text_padding_bottom_medium <> '' || $settings->items[$i]->text_padding_left_medium <> '' || $settings->items[$i]->text_padding_right_medium <> '' ) { ?>
			.fl-node-<?php echo $id; ?> .slide-<?php echo ($i+1); ?> .slider-info-content {
				<?php if ( $settings->items[$i]->text_padding_top_medium <> '' ){ ?>padding-top: <?php echo $settings->items[$i]->text_padding_top_medium; ?>px;<?php } ?>
				<?php if ( $settings->items[$i]->text_padding_bottom_medium <> '' ) { ?>padding-bottom: <?php echo $settings->items[$i]->text_padding_bottom_medium; ?>px;<?php } ?>
				<?php if ( $settings->items[$i]->text_padding_left_medium <> '' ) { ?>padding-left: <?php echo $settings->items[$i]->text_padding_left_medium; ?>px;<?php } ?>
				<?php if ( $settings->items[$i]->text_padding_right_medium <> '' ) { ?>padding-right: <?php echo $settings->items[$i]->text_padding_right_medium; ?>px;<?php } ?>
			}
		<?php } ?>
	<?php endfor; ?>
}
@media only screen and ( max-width: <?php echo $global_settings->responsive_breakpoint; ?>px ) {
	<?php if ( $settings->padding_top_responsive <> '' || $settings->padding_bottom_responsive <> '' || $settings->padding_left_responsive <> '' || $settings->padding_right_responsive <> '' ) { ?>
	.fl-node-<?php echo $id; ?> .slider-info {
		<?php if ( $settings->padding_top_responsive <> '' ){ ?>padding-top: <?php echo $settings->padding_top_responsive; ?>px;<?php } ?>
		<?php if ( $settings->padding_bottom_responsive <> '' ) { ?>padding-bottom: <?php echo $settings->padding_bottom_responsive; ?>px;<?php } ?>
		<?php if ( $settings->padding_left_responsive <> '' ) { ?>padding-left: <?php echo $settings->padding_left_responsive; ?>px;<?php } ?>
		<?php if ( $settings->padding_right_responsive <> '' ) { ?>padding-right: <?php echo $settings->padding_right_responsive; ?>px;<?php } ?>
	}
	<?php } ?>

	<?php if ( !empty( $settings->items[$i]->slider_style_text_width_responsive ) ) { ?>
		.fl-node-<?php echo $id; ?> .slide-<?php echo ($i+1); ?> .slider-image {
			<?php if ( $settings->items[$i]->slider_style_text_width_responsive != '100' ) { ?>
			width: <?php echo 100-($settings->items[$i]->slider_style_text_width_responsive); ?>%;
			<?php } else { ?>
			width: <?php echo $settings->items[$i]->slider_style_text_width_responsive; ?>%;
			<?php } ?>
		}
		.fl-node-<?php echo $id; ?> .slide-<?php echo ($i+1); ?> .slider-info-content {
			width: <?php echo $settings->items[$i]->slider_style_text_width_responsive; ?>%;
		}
	<?php } ?>

	<?php for($i = 0; $i < count($settings->items); $i++) : if(!is_object($settings->items[$i])) continue; ?>
		<?php if ( $settings->items[$i]->slide_padding_top_responsive <> '' || $settings->items[$i]->slide_padding_bottom_responsive <> '' || $settings->items[$i]->slide_padding_left_responsive <> '' || $settings->items[$i]->slide_padding_right_responsive <> '' ) { ?>
			.fl-node-<?php echo $id; ?> .slide-<?php echo ($i+1); ?> .slider-image {
				<?php if ( $settings->items[$i]->slide_padding_top_responsive <> '' ){ ?>padding-top: <?php echo $settings->items[$i]->slide_padding_top_responsive; ?>px;<?php } ?>
				<?php if ( $settings->items[$i]->slide_padding_bottom_responsive <> '' ) { ?>padding-bottom: <?php echo $settings->items[$i]->slide_padding_bottom_responsive; ?>px;<?php } ?>
				<?php if ( $settings->items[$i]->slide_padding_left_responsive <> '' ) { ?>padding-left: <?php echo $settings->items[$i]->slide_padding_left_responsive; ?>px;<?php } ?>
				<?php if ( $settings->items[$i]->slide_padding_right_responsive <> '' ) { ?>padding-right: <?php echo $settings->items[$i]->slide_padding_right_responsive; ?>px;<?php } ?>
			}
		<?php } ?>
		<?php if ( $settings->items[$i]->slider_title_size_responsive <> '' || $settings->items[$i]->slider_title_size_responsive <> '' ) { ?>
			.fl-node-<?php echo $id; ?> .slide-<?php echo ($i+1); ?> .slider-title{
				<?php if ( $settings->items[$i]->slider_title_size_responsive <> '') { ?>
					font-size: <?php echo $settings->items[$i]->slider_title_size_responsive; ?>px;
				<?php } ?>
				<?php if ( $settings->items[$i]->slider_title_max_width_responsive <> '' ) { ?>
					max-width: <?php echo $settings->items[$i]->slider_title_max_width_responsive; ?>%;
				<?php } ?>
			}
		<?php } ?>
		<?php if ( $settings->items[$i]->slider_text_size_responsive <> '' || $settings->items[$i]->slider_text_max_width_responsive <> '' ) { ?>
			.fl-node-<?php echo $id; ?> .slide-<?php echo ($i+1); ?> .slider-text{
				<?php if ( $settings->items[$i]->slider_text_size_responsive <> '') { ?>
					font-size: <?php echo $settings->items[$i]->slider_text_size_responsive; ?>px;
				<?php } ?>
				<?php if ( $settings->items[$i]->slider_text_max_width_responsive <> '' ) { ?>
					max-width: <?php echo $settings->items[$i]->slider_text_max_width_responsive; ?>%;
				<?php } ?>
			}
		<?php } ?>
		<?php if ( $settings->items[$i]->slider_btn_title_size_responsive <> '') { ?>
			.fl-node-<?php echo $id; ?> .slide-<?php echo ($i+1); ?> .slider-button-title{
				font-size: <?php echo $settings->items[$i]->slider_btn_title_size_responsive; ?>px;
			}
		<?php } ?>
		<?php if ( $settings->items[$i]->slider_btn_label_size_responsive <> '') { ?>
			.fl-node-<?php echo $id; ?> .slide-<?php echo ($i+1); ?> .slider-button{
				font-size: <?php echo $settings->items[$i]->slider_btn_label_size_responsive; ?>px;
			}
		<?php } ?>
		<?php if ( $settings->items[$i]->text_padding_top_responsive <> '' || $settings->items[$i]->text_padding_bottom_responsive <> '' || $settings->items[$i]->text_padding_left_responsive <> '' || $settings->items[$i]->text_padding_right_responsive <> '' ) { ?>
			.fl-node-<?php echo $id; ?> .slide-<?php echo ($i+1); ?> .slider-info-content {
				<?php if ( $settings->items[$i]->text_padding_top_responsive <> '' ){ ?>padding-top: <?php echo $settings->items[$i]->text_padding_top_responsive; ?>px;<?php } ?>
				<?php if ( $settings->items[$i]->text_padding_bottom_responsive <> '' ) { ?>padding-bottom: <?php echo $settings->items[$i]->text_padding_bottom_responsive; ?>px;<?php } ?>
				<?php if ( $settings->items[$i]->text_padding_left_responsive <> '' ) { ?>padding-left: <?php echo $settings->items[$i]->text_padding_left_responsive; ?>px;<?php } ?>
				<?php if ( $settings->items[$i]->text_padding_right_responsive <> '' ) { ?>padding-right: <?php echo $settings->items[$i]->text_padding_right_responsive; ?>px;<?php } ?>
			}
		<?php } ?>
	<?php endfor; ?>
}