<?php
$widgetHeight = $settings->w_height <> '' ? $settings->w_height : '500';
$widgetWidth = $settings->w_width <> '' ? $settings->w_width : '500';
?>
<div class="custom_facebook">
    
    <div class="fb-page" data-href="<?php echo $settings->facebook_url; ?>" data-tabs="timeline" data-width="<?php echo $widgetWidth; ?>px" data-height="<?php echo $widgetHeight; ?>px" data-small-header="false" data-adapt-container-width="true" data-hide-cover="false" data-show-facepile="true">
        <blockquote cite="<?php echo $settings->facebook_url; ?>" class="fb-xfbml-parse-ignore"></blockquote>
    </div>
</div>
<?php

?>