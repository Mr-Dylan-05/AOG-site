<?php if ( $settings->item_margin_top <> '' || $settings->item_margin_right <> '' || $settings->item_margin_bottom <> '' || $settings->item_margin_left <> '' ) { ?>
.fl-node-<?php echo $id; ?> #main .main-menu li {
    margin: <?php echo $settings->item_margin_top; ?>px <?php echo $settings->item_margin_right; ?>px <?php echo $settings->item_margin_bottom; ?>px <?php echo $settings->item_margin_left; ?>px;
}
<?php } ?>
<?php if ( $settings->item_padding_top <> '' || $settings->item_padding_right <> '' || $settings->item_padding_bottom <> '' || $settings->item_padding_left <> '' ) { ?>
.fl-node-<?php echo $id; ?> #main .main-menu li a {
    padding: <?php echo $settings->item_padding_top; ?>px <?php echo $settings->item_padding_right; ?>px <?php echo $settings->item_padding_bottom; ?>px <?php echo $settings->item_padding_left; ?>px;
}
<?php } ?>

<?php if ( $settings->item_padding_bottom <> '' ) { ?>
.fl-node-<?php echo $id; ?> #main .main-menu > li > ul.sub-menu {
    margin-top: <?php echo ($settings->item_padding_bottom ? '10' : '15'); ?>px;
}
<?php } ?>

<?php if ( !empty($settings->menu_item_color) ) { ?>
.fl-node-<?php echo $id; ?> #main .main-menu li a,
.fl-node-<?php echo $id; ?> #responsive-menu-wrapper #primary-menu > li a {
	color: #<?php echo $settings->menu_item_color; ?>;
}
<?php } ?>
<?php if ( !empty($settings->menu_item_color) ) { ?>
.fl-node-<?php echo $id; ?> #main .main-menu > .menu-item-has-children > a:after {
    border-top: 2px solid #<?php echo $settings->menu_item_color; ?>; border-right: 2px solid #<?php echo $settings->menu_item_color; ?>;
}
<?php } ?>
<?php if ( !empty($settings->menu_item_hover_color) ) { ?>
.fl-node-<?php echo $id; ?> #main .main-menu > .menu-item-has-children:hover > a:after {
    border-top: 2px solid #<?php echo $settings->menu_item_hover_color; ?>; border-right: 2px solid #<?php echo $settings->menu_item_hover_color; ?>;
}
<?php } ?>
<?php if ( !empty($settings->submenu_item_color) ) { ?>
.fl-node-<?php echo $id; ?> #main .main-menu li ul.sub-menu li a:before {
    border-top: 2px solid #<?php echo $settings->submenu_item_color; ?>; border-right: 2px solid #<?php echo $settings->submenu_item_color; ?>;
}
<?php } ?>
<?php if ( !empty($settings->submenu_item_hover_color) ) { ?>
.fl-node-<?php echo $id; ?> #main .main-menu li ul.sub-menu li:hover a:before {
    border-top: 2px solid #<?php echo $settings->submenu_item_hover_color; ?>; border-right: 2px solid #<?php echo $settings->submenu_item_hover_color; ?>;
}
<?php } ?>
<?php if ( $settings->item_padding_right <> '' ) { ?>
.fl-node-<?php echo $id; ?> #main .main-menu li.menu-item-has-children a {
	padding-right: <?php echo ($settings->item_padding_right ? $settings->item_padding_right : '0')+15; ?>px;
}
.fl-node-<?php echo $id; ?> #main .main-menu > .menu-item-has-children > a:after {
    right: <?php echo ($settings->item_padding_right ? $settings->item_padding_right : '0'); ?>px;
}
<?php } ?>
<?php if ( !empty($settings->menu_item_hover_color) ) { ?>
.fl-node-<?php echo $id; ?> #main .main-menu li:hover a,
.fl-node-<?php echo $id; ?> #responsive-menu-wrapper #primary-menu > li:hover a{
    color: #<?php echo $settings->menu_item_hover_color; ?>;
}
<?php } ?>

<?php if ( $settings->hover_style == 'border-slide' ) { ?>
.fl-node-<?php echo $id; ?> #main .main-menu > li:after {
    content: "";
    width: 0px;
    height: 4px;
    background-color: #5699e1;
    position: relative;
    display: block;
    transition: 0.4s ease-in-out;
}
.fl-node-<?php echo $id; ?> #main .main-menu li.current-menu-item:after,
.fl-node-<?php echo $id; ?> #main .main-menu li.current-page-ancestor:after,
.fl-node-<?php echo $id; ?> #main .main-menu li.current_page_item:after,
.fl-node-<?php echo $id; ?> #main .main-menu li:hover:after {
    width: 30px;
    transition: 0.4s ease-in-out;
}
<?php } ?>

<?php if ( $settings->hover_style == 'colored-bg' ) { ?>
.fl-node-<?php echo $id; ?> #main .main-menu li {
    transition: 0.4s ease-in-out;
}
.fl-node-<?php echo $id; ?> #main .main-menu li:hover {
    background-color: #<?php echo $settings->item_hover_border; ?>;
    transition: 0.4s ease-in-out;
}
<?php } ?>

<?php if ( !empty($settings->submenu_item_color_bg) || !empty($settings->submenu_item_color) ) { ?>
    <?php if ( !empty($settings->submenu_item_color_bg) ) { ?>
    .fl-node-<?php echo $id; ?> #main .main-menu > li > ul.sub-menu,
    .fl-node-<?php echo $id; ?> #main .main-menu li ul li {
        background-color: #<?php echo $settings->submenu_item_color_bg; ?>;
    }
    <?php } ?>

    <?php if ( !empty($settings->submenu_item_color) ) { ?>
    .fl-node-<?php echo $id; ?> #main .main-menu > li > ul.sub-menu a {
        color: #<?php echo $settings->submenu_item_color; ?>;
    }
    <?php } ?>
<?php } ?>

<?php if ( !empty($settings->submenu_item_hover_color_bg) || !empty($settings->submenu_item_hover_color) ) { ?>
    <?php if ( !empty($settings->submenu_item_hover_color_bg) ) { ?>
    .fl-node-<?php echo $id; ?> #main .main-menu li ul li:hover {
        background-color: #<?php echo $settings->submenu_item_hover_color_bg; ?>;
    }
    <?php } ?>

    <?php if ( !empty($settings->submenu_item_hover_color) ) { ?>
    .fl-node-<?php echo $id; ?> #main .main-menu li ul li.current-menu-item > a, 
    .fl-node-<?php echo $id; ?> #main .main-menu li ul li.current-page-ancestor > a, 
    .fl-node-<?php echo $id; ?> #main .main-menu li ul li a:hover, 
    .fl-node-<?php echo $id; ?> #main .main-menu li ul li > a:hover {
        color: #<?php echo $settings->submenu_item_hover_color; ?>;
    }
    <?php } ?>
<?php } ?>

<?php if ( !empty($settings->hamburger_menu_color) ) { ?>
.fl-node-<?php echo $id; ?> .hamburger-inner,
.fl-node-<?php echo $id; ?> .hamburger-inner:after,
.fl-node-<?php echo $id; ?> .hamburger-inner:before {
	background-color: #<?php echo $settings->hamburger_menu_color; ?>;
}
<?php } ?>

<?php if ( !empty($settings->hamburger_menu_hover_color) ) { ?>
.fl-node-<?php echo $id; ?> .hamburger.is-active .hamburger-inner,
.fl-node-<?php echo $id; ?> .hamburger.is-active .hamburger-inner:after,
.fl-node-<?php echo $id; ?> .hamburger.is-active .hamburger-inner:before{
	background-color: #<?php echo $settings->hamburger_menu_hover_color; ?>;
}
<?php } ?>

<?php
FLBuilderCSS::responsive_rule( array(
	'settings'	=> $settings,
	'setting_name' 	=> 'menu_align',
	'selector' 	=> ".fl-node-$id #main",
    'prop'		=> 'text-align',
) );

FLBuilderCSS::responsive_rule( array(
	'settings'	=> $settings,
	'setting_name' 	=> 'menu_align',
	'selector' 	=> ".fl-node-$id #responsive-menu",
    'prop'		=> 'text-align',
) );

FLBuilderCSS::typography_field_rule( array(
	'settings'	=> $settings,
	'setting_name' 	=> 'menu_typography',
	'selector' 	=> ".fl-node-$id #main .main-menu li a",
) );


