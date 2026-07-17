<?php if ( 'count' === $settings->column_sizing ) : ?>
.fl-node-<?php echo $id; ?> > ul {
	grid-template-columns: repeat( <?php echo $settings->column_count; ?>, minmax( 0, 1fr ) );
	gap: <?php echo $settings->gap_row . $settings->gap_unit; ?> <?php echo $settings->gap_column . $settings->gap_unit; ?>;
}
.fl-node-<?php echo $id; ?> > ul > li > * {
	flex: 1 1 30%;
}
<?php endif; ?>
<?php
if ( 'item_size' === $settings->column_sizing ) :
	$min = $settings->min_size . $settings->min_size_unit;
	$max = $settings->max_size . $settings->max_size_unit;
	?>
.fl-node-<?php echo $id; ?> > ul {
	grid-template-columns: repeat( auto-fit, minmax( <?php echo $min . ', ' . $max; ?> ) );
	gap: <?php echo $settings->gap_row . $settings->gap_unit; ?> <?php echo $settings->gap_column . $settings->gap_unit; ?>;
}
<?php endif; ?>
