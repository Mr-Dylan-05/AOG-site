.fl-node-<?php echo $id; ?> {
	position: relative;
    z-index: 99;
}

.fl-node-<?php echo $id; ?> .fl-heading, 
.fl-node-<?php echo $id; ?> .fl-subheading {
	text-align: <?php echo $settings->alignment; ?>;
}

.fl-node-<?php echo $id; ?> .text-advance p {
	font-size: 14px;
    line-height: 1.2em;
    margin-bottom: 0;
}
<?php if($settings->font_size == 'custom') : ?>
.fl-node-<?php echo $id; ?> .text-advance p,
.fl-node-<?php echo $id; ?> .text-advance h1,
.fl-node-<?php echo $id; ?> .text-advance h2,
.fl-node-<?php echo $id; ?> .text-advance h3,
.fl-node-<?php echo $id; ?> .text-advance h4,
.fl-node-<?php echo $id; ?> .text-advance h5 {
	font-size: <?php echo $settings->custom_font_size; ?>px;
    line-height: 1.2em;
    font-weight: 300;
    <?php if($settings->font_weight == 'custom') : ?>
    font-weight: <?php echo $settings->custom_font_weight; ?>;
    <?php endif; ?>
    <?php if($settings->line_height == 'custom') : ?>
	line-height: <?php echo $settings->custom_line_height; ?>;
	<?php endif; ?>
}
<?php endif; ?>
.fl-node-<?php echo $id; ?> .text-advance {
	text-align: <?php echo $settings->alignment; ?>;
    <?php if($settings->font_size == 'custom') : ?>
	font-size: <?php echo $settings->custom_font_size; ?>px;
	<?php endif; ?>
	<?php if($settings->line_height == 'custom') : ?>
	line-height: <?php echo $settings->custom_line_height; ?>;
	<?php endif; ?>
	<?php if($settings->letter_spacing == 'custom') : ?>
	letter-spacing: <?php echo $settings->custom_letter_spacing; ?>px;
	<?php endif; ?>
    opacity: <?php echo $settings->opacity; ?>;
}

.fl-node-<?php echo $id; ?> .text-advance {
	<?php if($settings->padding_top <> '') : ?>
	padding-top: <?php echo $settings->padding_top; ?>px;
	<?php endif; ?>
    <?php if($settings->padding_bottom <> '') : ?>
	padding-bottom: <?php echo $settings->padding_bottom; ?>px;
	<?php endif; ?>
    <?php if($settings->padding_left <> '') : ?>
	padding-left: <?php echo $settings->padding_left; ?>px;
	<?php endif; ?>
    <?php if($settings->padding_right <> '') : ?>
	padding-right: <?php echo $settings->padding_right; ?>px;
	<?php endif; ?>
}

<?php if(!empty($settings->color)) : ?>
.fl-node-<?php echo $id; ?> .text-advance a,
.fl-node-<?php echo $id; ?> .text-advance .text-advance-text,
.fl-node-<?php echo $id; ?> .text-advance .text-advance-text * {
	color: #<?php echo $settings->color; ?>;
}
<?php endif; ?>

<?php if(!empty($settings->h_color)) : ?>
.fl-node-<?php echo $id; ?> .text-advance .text-advance-text em,
.fl-node-<?php echo $id; ?> .text-advance .text-advance-text span,
.fl-node-<?php echo $id; ?> .text-advance .text-advance-text b,
.fl-node-<?php echo $id; ?> .text-advance .text-advance-text strong,
.fl-node-<?php echo $id; ?> .text-advance .text-advance-text i {
	color: #<?php echo $settings->h_color; ?>;
}
<?php endif; ?>

<?php if( !empty($settings->font) && $settings->font['family'] != 'Default' ) : ?>
.fl-node-<?php echo $id; ?> .text-advance .text-advance-text{
	<?php FLBuilderFonts::font_css( $settings->font ); ?>
}
<?php endif; ?>

<?php if($global_settings->responsive_enabled) : ?>

@media (max-width: <?php echo $global_settings->responsive_breakpoint; ?>px) {
    .fl-node-<?php echo $id; ?> .text-advance {
        padding: 0;
        margin: auto !important;
    }
}
<?php endif; ?>

<?php if($global_settings->responsive_enabled && ($settings->r_font_size == 'custom' || $settings->r_alignment == 'custom' || $settings->r_line_height == 'custom' || $settings->r_letter_spacing == 'custom')) : ?>

@media (max-width: <?php echo $global_settings->responsive_breakpoint; ?>px) {
    .fl-node-<?php echo $id; ?> .text-advance {
        padding: 0;
    }
	
	<?php if($settings->r_font_size == 'custom') : ?>
	.fl-node-<?php echo $id; ?> .text-advance p,
    .fl-node-<?php echo $id; ?> .text-advance h1,
    .fl-node-<?php echo $id; ?> .text-advance h2,
    .fl-node-<?php echo $id; ?> .text-advance h3,
    .fl-node-<?php echo $id; ?> .text-advance h4,
    .fl-node-<?php echo $id; ?> .text-advance h5 {
		font-size: <?php echo $settings->r_custom_font_size; ?>px;
	}
	<?php endif; ?>
	
	<?php if($settings->r_alignment == 'custom') : ?>
	.fl-node-<?php echo $id; ?> .text-advance {
		text-align: <?php echo $settings->r_custom_alignment; ?>;
	}
	<?php endif; ?>

	<?php if($settings->r_line_height == 'custom') : ?>
	.fl-node-<?php echo $id; ?> .text-advance {
		line-height: <?php echo $settings->r_custom_line_height; ?>;
	}
	<?php endif; ?>

	<?php if($settings->r_letter_spacing == 'custom') : ?>
	.fl-node-<?php echo $id; ?> .text-advance {
		letter-spacing: <?php echo $settings->r_custom_letter_spacing; ?>px;
	}
	<?php endif; ?>
}    
<?php endif; ?>