<?php if ( !empty($settings->bg_color) || !empty($settings->color) || $settings->padding <> '' ) { ?>
.fl-node-<?php echo $id; ?> .teams-profile{
	<?php if (!empty($settings->bg_color)) { ?>background-color: #<?php echo $settings->bg_color ?>;<?php } ?>
	<?php if (!empty($settings->color)) { ?>color: #<?php echo $settings->color ?>;<?php } ?>
	<?php if ($settings->padding <> '') { ?>padding: <?php echo $settings->padding ?>px;<?php } ?>
}
<?php } ?>
<?php if ( !empty($settings->color) ) { ?>
.fl-node-<?php echo $id; ?> .teams-profile,
.fl-node-<?php echo $id; ?> .teams-profile .teams-name,
.fl-node-<?php echo $id; ?> .teams-profile .teams-job,
.fl-node-<?php echo $id; ?> .teams-social-media a{
	<?php if (!empty($settings->color)) { ?>color: #<?php echo $settings->color ?>;<?php } ?>
}
<?php } ?>
<?php if ( !empty($settings->color_name) ) { ?>
.fl-node-<?php echo $id; ?> .teams-profile .teams-name{
	<?php if (!empty($settings->color_name)) { ?>color: #<?php echo $settings->color_name ?>;<?php } ?>
}
<?php } ?>
<?php if ( !empty($settings->color_jobtitle) ) { ?>
.fl-node-<?php echo $id; ?> .teams-profile .teams-job{
	<?php if (!empty($settings->color_jobtitle)) { ?>color: #<?php echo $settings->color_jobtitle ?>;<?php } ?>
}
<?php } ?>
<?php if ( !empty($settings->color_icons) ) { ?>
.fl-node-<?php echo $id; ?> .teams-social-media a{
	<?php if (!empty($settings->color_icons)) { ?>color: #<?php echo $settings->color_icons ?>;<?php } ?>
}
<?php } ?>
<?php if ( !empty($settings->color_icons_hover) ) { ?>
.fl-node-<?php echo $id; ?> .teams-social-media a:hover{
	<?php if (!empty($settings->color_icons_hover)) { ?>color: #<?php echo $settings->color_icons_hover ?>;<?php } ?>
}
<?php } ?>

<?php if ( !empty($settings->info_bg_color) || $settings->padding_inside_top_bottom <> '' || $settings->padding_inside_left_right <> '' ) { ?>
.fl-node-<?php echo $id; ?> .teams-profile .teams-info{
	<?php if (!empty($settings->info_bg_color)) { ?>background-color: #<?php echo $settings->info_bg_color ?>;<?php } ?>
	<?php if ( $settings->padding_inside_top_bottom <> '' ) { ?>padding-top: <?php echo $settings->padding_inside_top_bottom ?>px;<?php } ?>
	<?php if ( $settings->padding_inside_top_bottom <> '' ) { ?>padding-bottom: <?php echo $settings->padding_inside_top_bottom ?>px;<?php } ?>
	<?php if ( $settings->padding_inside_left_right <> '' ) { ?>padding-left: <?php echo $settings->padding_inside_left_right ?>px;<?php } ?>
	<?php if ( $settings->padding_inside_left_right <> '' ) { ?>padding-right: <?php echo $settings->padding_inside_left_right ?>px;<?php } ?>
}
<?php } ?>
<?php if ( $settings->style == 'hovered' && !empty($settings->bg_color) ) { ?>
	.fl-node-<?php echo $id; ?> .teams.hovered .teams-profile .teams-info::before{
		<?php if (!empty($settings->bg_color)) { ?>background-color: #<?php echo $settings->bg_color ?>;<?php } ?>
	}
<?php } ?>
<?php if ( $settings->image_max_size <> '' ) { ?>
	.fl-node-<?php echo $id; ?> .teams-photo{
		max-width: <?php echo $settings->image_max_size; ?>px;
		padding: <?php echo $settings->image_max_size; ?>px;
		width: 100%;
	}
<?php } ?>

<?php if ( $settings->column_spacing <> '' ) { ?>
.teams-member { padding-right: <?php echo $settings->column_spacing; ?>px; margin-left: -<?php echo $settings->column_spacing; ?>px; width: calc(100% + <?php echo $settings->column_spacing; ?>px + <?php echo $settings->column_spacing; ?>px); width: -webkit-calc(100% + <?php echo $settings->column_spacing; ?>px + <?php echo $settings->column_spacing; ?>px); }
.teams-profile { margin: 0 0 <?php echo $settings->column_spacing; ?>px <?php echo $settings->column_spacing; ?>px; }

@media only screen and ( max-width: 1663px ) { 
	.fl-row-content.fl-row-full-width .column-5 .teams-profile,
	.fl-row-content.fl-row-full-width .column-6 .teams-profile { width: calc(25% - <?php echo $settings->column_spacing; ?>px); width: -webkit-calc(25% - <?php echo $settings->column_spacing; ?>px); } 
}
@media only screen and ( max-width: 1080px ) { 
	.column-5 .teams-profile,
	.column-6 .teams-profile { width: calc(25% - <?php echo $settings->column_spacing; ?>px); width: -webkit-calc(25% - <?php echo $settings->column_spacing; ?>px); } 
}
@media only screen and ( min-width: 1024px ) { 
	.column-1 .teams-profile { width: calc(100% - <?php echo $settings->column_spacing; ?>px); width: -webkit-calc(100% - <?php echo $settings->column_spacing; ?>px); }
	.column-2 .teams-profile { width: calc(50% - <?php echo $settings->column_spacing; ?>px); width: -webkit-calc(50% - <?php echo $settings->column_spacing; ?>px); }
	.column-3 .teams-profile { width: calc(33.33% - <?php echo $settings->column_spacing; ?>px); width: -webkit-calc(33.33% - <?php echo $settings->column_spacing; ?>px); }
	.column-4 .teams-profile { width: calc(25% - <?php echo $settings->column_spacing; ?>px); width: -webkit-calc(25% - <?php echo $settings->column_spacing; ?>px); }
	.column-5 .teams-profile {  width: calc(20% - <?php echo $settings->column_spacing; ?>px); width: -webkit-calc(20% - <?php echo $settings->column_spacing; ?>px); }
	.column-6 .teams-profile { width: calc(16.666% - <?php echo $settings->column_spacing; ?>px); width: -webkit-calc(16.666% - <?php echo $settings->column_spacing; ?>px); }
}
@media only screen and ( max-width: 1023px ) { 
	.column-1 .teams-profile,
	.column-2 .teams-profile { width: calc(100% - <?php echo $settings->column_spacing; ?>px); width: -webkit-calc(100% - <?php echo $settings->column_spacing; ?>px); } 
	.column-3 .teams-profile,
	.column-4 .teams-profile { width: calc(33.33% - <?php echo $settings->column_spacing; ?>px); width: -webkit-calc(33.33% - <?php echo $settings->column_spacing; ?>px); } 
	.column-5 .teams-profile,
	.column-6 .teams-profile { width: calc(50% - <?php echo $settings->column_spacing; ?>px); width: -webkit-calc(50% - <?php echo $settings->column_spacing; ?>px); } 
}
@media only screen and ( max-width: 767px ) { 
	.column-1 .teams-profile,
	.column-2 .teams-profile,
	.column-3 .teams-profile { width: calc(100% - <?php echo $settings->column_spacing; ?>px); width: -webkit-calc(100% - <?php echo $settings->column_spacing; ?>px); } 
	.column-4 .teams-profile,
	.column-5 .teams-profile,
	.column-6 .teams-profile { width: calc(50% - <?php echo $settings->column_spacing; ?>px); width: -webkit-calc(50% - <?php echo $settings->column_spacing; ?>px); } 
}
@media only screen and ( max-width: 530px ) { 
	.column-1 .teams-profile,
	.column-2 .teams-profile,
	.column-3 .teams-profile,
	.column-4 .teams-profile,
	.column-5 .teams-profile,
	.column-6 .teams-profile { width: calc(100% - <?php echo $settings->column_spacing; ?>px); width: -webkit-calc(100% - <?php echo $settings->column_spacing; ?>px); } 
}
<?php } ?>