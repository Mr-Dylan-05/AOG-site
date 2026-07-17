#header-search #search-toggler a > * { color: #<?php echo $settings->icon_color; ?>; }

<?php if ( !empty($settings->icon_size) ) { ?>
	.fl-node-<?php echo $id; ?> #header-search #search-toggler a > *{ 
		font-size: <?php echo $settings->icon_size; ?>px;
	}
<?php } ?>