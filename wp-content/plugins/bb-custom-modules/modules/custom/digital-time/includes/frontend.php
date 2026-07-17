<?php
    date_default_timezone_set($settings->custom_timezone);
    if( $settings->time_format === '12'){
        $customhour = date("h");
        $customminute = date("i");
        $customAMPM = date("a");
    }
    else{
        $customhour = date("H");
        $customminute = date("i");
    }
    
?>

<?php 
    if( $settings->inline_stacked === '0' ){ ?>
    
        <div class="fl-icon-wrap">
            <span class="fl-icon"><i class="<?php echo $settings->icon; ?>" aria-hidden="true"></i></span>
            <div class="time-container fl-icon-text">
                <p class="custom-time-cont">
                    <span class="time-flex"><span class="timeHour"><?php echo $customhour; ?></span><span class="time-colon">:</span><span class="timeMinute"><?php echo $customminute; ?></span></span>
                    <?php
                    if($settings->time_format === '12'){?>
                        <span class="ampm-container">&nbsp;<?php echo $customAMPM; ?></span>
                    <?php
                    }
                    
                    ?>
                </p>
            </div>
        </div>
        
<?php    }
    else{ ?>
        
        <div class="fl-icon-wrap icon-stacked">
            <span class="fl-icon"><i class="<?php echo $settings->icon; ?>" aria-hidden="true"></i></span>
            <div class="time-container fl-icon-text">
                <p class="custom-time-cont">
                    <span class="time-flex"><span class="timeHour"><?php echo $customhour; ?></span><span class="time-colon">:</span><span class="timeMinute"><?php echo $customminute; ?></span></span>
                    <?php
                    if($settings->time_format === '12'){?>
                        <span class="ampm-container">&nbsp;<?php echo $customAMPM; ?></span>
                    <?php
                    }
                    
                    ?>
                </p>
            </div>
        </div>
        
<?php    }
?>

