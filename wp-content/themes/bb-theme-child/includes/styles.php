<style type="text/css">
    /* Default Ad on Group Color Palettes */
    .purple { color: #6A4AED; }
    .green { color: #4CAF50; }
    .cyan { color: #37A8C3; }
    .body, html {
        overflow-x: hidden !important;
    }
    <?php if (get_field('accent_color', 'option') <> '') { ?>
    a {
        color: <?php echo get_field('accent_color', 'option'); ?>;
    }
    <?php } ?>
    
    
    /*sidebar 2 style css*/
    <?php if (get_field('main_color', 'option') <> '') { ?>
    .fl-module-sidebar:not(.sidebar-style-2) ul li:before {
        border-left: 5px solid <?php echo get_field('main_color', 'option'); ?>;
    }
    <?php } ?>
    
    /*sidebar 2 style css*/
    .sidebar-style-2 .fl-widget-title {
        <?php if (get_field('main_color', 'option') <> '') { ?>
        color: <?php echo get_field('main_color', 'option'); ?>;
        <?php } ?>
        <?php if (get_field('main_color', 'option') <> '') { ?>
        border-left: 5px solid <?php echo get_field('main_color', 'option'); ?>;
        <?php } ?>
    }
    .sidebar-style-2 ul li:before {
        <?php if (get_field('main_color', 'option') <> '') { ?>
        border-right: 3px solid <?php echo get_field('main_color', 'option'); ?>;
        border-bottom: 3px solid <?php echo get_field('main_color', 'option'); ?>;
        <?php } ?>
    }
</style>