<?php if ( ! empty( $settings->bg_color ) ) : ?>
.fl-node-<?php echo $id; ?> form.edd_download_purchase_form .edd-submit,
.fl-node-<?php echo $id; ?> form.edd_download_purchase_form .edd-submit:hover,
.fl-node-<?php echo $id; ?> form.edd_download_purchase_form .edd-submit:focus {
	background-color: <?php echo FLBuilderColor::hex_or_rgb( $settings->bg_color ); ?>;
	border-color: <?php echo FLBuilderColor::hex_or_rgb( FLBuilderColor::adjust_brightness( $settings->bg_color, 12, 'darken' ) ); ?>
}
<?php endif; ?>

<?php if ( ! empty( $settings->text_color ) ) : ?>
.fl-node-<?php echo $id; ?> form.edd_download_purchase_form .edd-submit,
.fl-node-<?php echo $id; ?> form.edd_download_purchase_form .edd-submit:hover,
.fl-node-<?php echo $id; ?> form.edd_download_purchase_form .edd-submit:focus {
	color: <?php echo FLBuilderColor::hex_or_rgb( $settings->text_color ); ?>;
}
<?php endif; ?>
