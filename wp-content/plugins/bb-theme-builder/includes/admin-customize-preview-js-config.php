<?php
$headerlink = false;
$footerlink = false;
$header     = FLThemeBuilderLayoutData::get_current_page_header_ids();
$footer     = FLThemeBuilderLayoutData::get_current_page_footer_ids();
$has_header = 0 !== count( $header ); // @codingStandardsIgnoreLine
$has_footer = 0 !== count( $footer ); // @codingStandardsIgnoreLine
if ( is_array( $header ) && ! empty( $header ) ) {
	$headerlink = add_query_arg( array(
		'fl_builder'    => '',
		'fl_builder_ui' => '',
	), get_permalink( reset( $header ) ) );
}
if ( is_array( $footer ) && ! empty( $footer ) ) {
	$footerlink = add_query_arg( array(
		'fl_builder'    => '',
		'fl_builder_ui' => '',
	), get_permalink( reset( $footer ) ) );
}
?>
<script>

FLThemeBuilderConfig = {
	hasHeader : <?php echo $has_header ? 'true' : 'false'; ?>,
	hasFooter : <?php echo $has_footer ? 'true' : 'false'; ?>,
	headerLink: '<?php echo $headerlink; ?>',
	footerLink: '<?php echo $footerlink; ?>'
};

</script>
