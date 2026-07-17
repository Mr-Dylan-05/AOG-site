<?php
$imagebg_URL = $settings->image_bg_src;
$logo_URL = $settings->image_logo_src;
$image_URL = $settings->image_src;
$image1_URL = $settings->image1_src;
$image2_URL = $settings->image2_src;
$image3_URL = $settings->image3_src;
?>


<div id="desktop" class="donut-button" style="background-image: url(<?php echo $imagebg_URL; ?>);">
    <div class="donut-button-wrapper">
        
        <div class="img-logo">
            <img src="<?php echo $logo_URL; ?>" />
        </div>
        
        <div class="main-content-block">
            <h3 class="main-title"><?php echo $settings->main_title; ?></h3>
            <span class="main-content"><?php echo $settings->main_content; ?></span>
        </div>

        <div class="ring r-outer tooltips">
            <h3 class="ring-title"><?php echo $settings->title1; ?></h3>
            <?php if ($settings->icon1 <> '' && $settings->image_options1 == 'photo') { ?>
            <div class="img-photo">
                <img src="<?php echo $image1_URL; ?>" />
                <h4 class="img-caption"><?php echo $settings->icon_label1; ?></h4>
            </div>
            <?php } ?>
            <?php if ($settings->icon1 <> '' && $settings->image_options1 == 'icon') { ?>
            <div class="img-photo">
                <i class="<?php echo $settings->icon1; ?>"></i>
                <h4 class="img-caption"><?php echo $settings->icon_label1; ?></h4>
            </div>
            <?php } ?>
        </div>
        <span class="tooltip-content outer"><?php echo $settings->content1; ?></span>

        <div class="ring r-middle tooltips">
            <h3 class="ring-title"><?php echo $settings->title2; ?></h3>
            <?php if ($settings->icon2 <> '' && $settings->image_options2 == 'photo') { ?>
            <div class="img-photo">
                <img src="<?php echo $image2_URL; ?>" />
                <h4 class="img-caption"><?php echo $settings->icon_label2; ?></h4>
            </div>
            <?php } ?>
            <?php if ($settings->icon2 <> '' && $settings->image_options2 == 'icon') { ?>
            <div class="img-photo">
                <i class="<?php echo $settings->icon2; ?>"></i>
                <h4 class="img-caption"><?php echo $settings->icon_label2; ?></h4>
            </div>
            <?php } ?>
        </div>
        <span class="tooltip-content middle"><?php echo $settings->content2; ?></span>

        <div class="ring r-inner tooltips">
            <h3 class="ring-title"><?php echo $settings->title3; ?></h3>
            <?php if ($settings->icon3 <> '' && $settings->image_options3 == 'photo') { ?>
            <div class="img-photo">
                <img src="<?php echo $image3_URL; ?>" />
                <h4 class="img-caption"><?php echo $settings->icon_label3; ?></h4>
            </div>
            <?php } ?>
            <?php if ($settings->icon3 <> '' && $settings->image_options3 == 'icon') { ?>
            <div class="img-photo">
                <i class="<?php echo $settings->icon3; ?>"></i>
                <h4 class="img-caption"><?php echo $settings->icon_label3; ?></h4>
            </div>
            <?php } ?>
        </div>
        <span class="tooltip-content inner"><?php echo $settings->content3; ?></span>

        <div class="ring r-center">
            <?php if ($settings->icon <> '' && $settings->image_options == 'photo') { ?>
            <div class="img-photo">
                <img src="<?php echo $image_URL; ?>" />
            </div>
            <?php } ?>
            <?php if ($settings->icon <> '' && $settings->image_options == 'icon') { ?>
            <i class="<?php echo $settings->icon; ?>"></i>
            <?php } ?>
        </div>

    </div>
</div>


<!--Responsive mobile view-->
<div id="mobile-view">
    <div class="img-logo">
        <img src="<?php echo $logo_URL; ?>" />
    </div>

    <div class="main-content-block">
        <h3 class="main-title"><?php echo $settings->main_title; ?></h3>
        <span class="main-content"><?php echo $settings->main_content; ?></span>
    </div>
    
    <div id="donut-2" class="donut-button" style="background-image: url(<?php echo $imagebg_URL; ?>);">
        <div class="donut-button-wrapper">

            <div class="ring r-outer tooltips">
                <h3 class="ring-title"><?php echo $settings->title1; ?></h3>
                <?php if ($settings->icon1 <> '' && $settings->image_options1 == 'photo') { ?>
                <div class="img-photo">
                    <img src="<?php echo $image1_URL; ?>" />
                    <h4 class="img-caption"><?php echo $settings->icon_label1; ?></h4>
                </div>
                <?php } ?>
                <?php if ($settings->icon1 <> '' && $settings->image_options1 == 'icon') { ?>
                <div class="img-photo">
                    <i class="<?php echo $settings->icon1; ?>"></i>
                    <h4 class="img-caption"><?php echo $settings->icon_label1; ?></h4>
                </div>
                <?php } ?>
            </div>
            <span class="tooltip-content outer"><?php echo $settings->content1; ?></span>

            <div class="ring r-middle tooltips">
                <h3 class="ring-title"><?php echo $settings->title2; ?></h3>
                <?php if ($settings->icon2 <> '' && $settings->image_options2 == 'photo') { ?>
                <div class="img-photo">
                    <img src="<?php echo $image2_URL; ?>" />
                    <h4 class="img-caption"><?php echo $settings->icon_label2; ?></h4>
                </div>
                <?php } ?>
                <?php if ($settings->icon2 <> '' && $settings->image_options2 == 'icon') { ?>
                <div class="img-photo">
                    <i class="<?php echo $settings->icon2; ?>"></i>
                    <h4 class="img-caption"><?php echo $settings->icon_label2; ?></h4>
                </div>
                <?php } ?>
            </div>
            <span class="tooltip-content middle"><?php echo $settings->content2; ?></span>

            <div class="ring r-inner tooltips">
                <h3 class="ring-title"><?php echo $settings->title3; ?></h3>
                <?php if ($settings->icon3 <> '' && $settings->image_options3 == 'photo') { ?>
                <div class="img-photo">
                    <img src="<?php echo $image3_URL; ?>" />
                    <h4 class="img-caption"><?php echo $settings->icon_label3; ?></h4>
                </div>
                <?php } ?>
                <?php if ($settings->icon3 <> '' && $settings->image_options3 == 'icon') { ?>
                <div class="img-photo">
                    <i class="<?php echo $settings->icon3; ?>"></i>
                    <h4 class="img-caption"><?php echo $settings->icon_label3; ?></h4>
                </div>
                <?php } ?>
            </div>
            <span class="tooltip-content inner"><?php echo $settings->content3; ?></span>

            <div class="ring r-center">
                <?php if ($settings->icon <> '' && $settings->image_options == 'photo') { ?>
                <div class="img-photo">
                    <img src="<?php echo $image_URL; ?>" />
                </div>
                <?php } ?>
                <?php if ($settings->icon <> '' && $settings->image_options == 'icon') { ?>
                <i class="<?php echo $settings->icon; ?>"></i>
                <?php } ?>
            </div>

        </div>
    </div>
</div>