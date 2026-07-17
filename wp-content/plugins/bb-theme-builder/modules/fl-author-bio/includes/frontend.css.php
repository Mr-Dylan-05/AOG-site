<?php if ( ! empty( $settings->bg_color ) ) : ?>
.fl-node-<?php echo $id; ?> .fl-module-content {
	background-color: <?php echo FLBuilderColor::hex_or_rgb( $settings->bg_color ); ?>;
	padding: 30px;
}
<?php endif; ?>

<?php if ( ! empty( $settings->text_color ) ) : ?>
.fl-node-<?php echo $id; ?> .fl-module-content,
.fl-node-<?php echo $id; ?> .fl-module-content h3 {
	color: <?php echo FLBuilderColor::hex_or_rgb( $settings->text_color ); ?>;
}
<?php endif; ?>
