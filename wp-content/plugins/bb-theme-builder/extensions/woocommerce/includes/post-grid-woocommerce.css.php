<?php if ( ! empty( $settings->woo_sale_flash_bg ) ) : ?>
	.fl-builder-content .fl-node-<?php echo $id; ?> .product span.onsale {
		background-color: <?php echo FLBuilderColor::hex_or_rgb( $settings->woo_sale_flash_bg ); ?>;
	}
<?php endif; ?> 

<?php if ( ! empty( $settings->woo_sale_flash_color ) ) : ?>
	.fl-builder-content .fl-node-<?php echo $id; ?> .product span.onsale {
		color: <?php echo FLBuilderColor::hex_or_rgb( $settings->woo_sale_flash_color ); ?>;
	}
<?php endif; ?> 

<?php if ( ! empty( $settings->woo_rating_fg ) ) : ?>
	.fl-builder-content .fl-node-<?php echo $id; ?> .fl-post-module-woo-meta .star-rating span:before {
		color: <?php echo FLBuilderColor::hex_or_rgb( $settings->woo_rating_fg ); ?> !important;
	}
<?php endif; ?> 

<?php if ( ! empty( $settings->woo_rating_bg ) ) : ?>
	.fl-builder-content .fl-node-<?php echo $id; ?> .fl-post-module-woo-meta .star-rating:before {
		color: <?php echo FLBuilderColor::hex_or_rgb( $settings->woo_rating_bg ); ?> !important;
	}
<?php endif; ?>

<?php if ( ! empty( $settings->woo_rating_font_size ) ) : ?>
	.fl-builder-content .fl-node-<?php echo $id; ?> .fl-post-module-woo-meta .star-rating {
		font-size: <?php echo $settings->woo_rating_font_size; ?>px;
	}
<?php endif; ?>

<?php if ( ! empty( $settings->woo_price_color ) ) : ?>
	.fl-builder-content .fl-node-<?php echo $id; ?> .fl-post-module-woo-meta .price span.woocommerce-Price-amount {
		color: <?php echo FLBuilderColor::hex_or_rgb( $settings->woo_price_color ); ?>;
	}
<?php endif; ?>

<?php if ( ! empty( $settings->woo_price_font_size ) ) : ?>
	.fl-builder-content .fl-node-<?php echo $id; ?> .fl-post-module-woo-meta .price span.woocommerce-Price-amount {
		font-size: <?php echo $settings->woo_price_font_size; ?>px;
	}
<?php endif; ?>

/* Add To Cart Button Styles */

<?php if ( ! empty( $settings->woo_button_bg_color ) ) : ?>
	.fl-builder-content .fl-node-<?php echo $id; ?> .fl-post-module-woo-button button[type=submit].alt.disabled,
	.fl-builder-content .fl-node-<?php echo $id; ?> .fl-post-module-woo-button button,
	.fl-builder-content .fl-node-<?php echo $id; ?> .fl-post-module-woo-button button.button,
	.fl-builder-content .fl-node-<?php echo $id; ?> .fl-post-module-woo-button a.button {
		background-color: <?php echo FLBuilderColor::hex_or_rgb( $settings->woo_button_bg_color ); ?>;
		border-color: <?php echo FLBuilderColor::hex_or_rgb( FLBuilderColor::adjust_brightness( $settings->woo_button_bg_color, 12, 'darken' ) ); ?>;
	}
<?php endif; ?>

<?php if ( ! empty( $settings->woo_button_text_color ) ) : ?>
	.fl-builder-content .fl-node-<?php echo $id; ?> .fl-post-module-woo-button button[type=submit].alt.disabled,
	.fl-builder-content .fl-node-<?php echo $id; ?> .fl-post-module-woo-button button,
	.fl-builder-content .fl-node-<?php echo $id; ?> .fl-post-module-woo-button button.button,
	.fl-builder-content .fl-node-<?php echo $id; ?> .fl-post-module-woo-button a.button {
		color: <?php echo FLBuilderColor::hex_or_rgb( $settings->woo_button_text_color ); ?>;
	}
<?php endif; ?>

<?php if ( ! empty( $settings->woo_button_hover_bg_color ) ) : ?>
	.fl-builder-content .fl-node-<?php echo $id; ?> .fl-post-module-woo-button button[type=submit].alt.disabled:hover,
	.fl-builder-content .fl-node-<?php echo $id; ?> .fl-post-module-woo-button button:hover,
	.fl-builder-content .fl-node-<?php echo $id; ?> .fl-post-module-woo-button button.button:hover,
	.fl-builder-content .fl-node-<?php echo $id; ?> .fl-post-module-woo-button a.button:hover {
		background-color: <?php echo FLBuilderColor::hex_or_rgb( $settings->woo_button_hover_bg_color ); ?>;
		border-color: <?php echo FLBuilderColor::hex_or_rgb( FLBuilderColor::adjust_brightness( $settings->woo_button_hover_bg_color, 12, 'darken' ) ); ?>
	}
<?php endif; ?>

<?php if ( ! empty( $settings->woo_button_hover_text_color ) ) : ?>
	.fl-builder-content .fl-node-<?php echo $id; ?> .fl-post-module-woo-button button[type=submit].alt.disabled:hover,
	.fl-builder-content .fl-node-<?php echo $id; ?> .fl-post-module-woo-button button:hover,
	.fl-builder-content .fl-node-<?php echo $id; ?> .fl-post-module-woo-button button.button:hover,
	.fl-builder-content .fl-node-<?php echo $id; ?> .fl-post-module-woo-button a.button:hover {
		color: <?php echo FLBuilderColor::hex_or_rgb( $settings->woo_button_hover_text_color ); ?>;
	}
<?php endif; ?>

.fl-builder-content .fl-node-<?php echo $id; ?> .fl-post-module-woo-button button[type=submit].alt.disabled,
.fl-builder-content .fl-node-<?php echo $id; ?> .fl-post-module-woo-button button.button, 
.fl-builder-content .fl-node-<?php echo $id; ?> .fl-post-module-woo-button a.button {
	display: <?php echo ( 'show' === $settings->woo_button ) ? 'inline-block' : 'none'; ?>;
}
