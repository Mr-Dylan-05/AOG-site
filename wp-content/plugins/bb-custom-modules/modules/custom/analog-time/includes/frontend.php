<?php
    date_default_timezone_set($settings->custom_timezone);
    if( $settings->time_format === '12'){
        $customhour = date("h");
        $customminute = date("i");
        $customseconds = date("s");
        $customAMPM = date("a");
    }
    else{
        $customhour = date("H");
        $customminute = date("i");
        $customseconds = date("s");
    }
    
?>

<div class="fl-time-wrap">
    <?php if( $settings->clock_type === 'analog') {?>
        <span class="fl-time-icon">
            <div class="hero-circle">
    			<div class="hero-face">
    				<div id="hour" class="hero-hour"></div>
    				<div id="minute" class="hero-minute"></div>
    				<?php if($settings->show_seconds === 'show') { ?>
    				    <div id="second" class="hero-second"></div>
    				<?php } ?>
    			</div>
    		</div>
        </span>
    <?php } ?>
    
    <?php if( $settings->clock_type === 'digital') {?>
        <div class="time-container fl-time-text">
            <p class="custom-time-cont">
                <span class="time-flex"><span class="timeHour"><?php echo $customhour; ?></span><span class=" <?php if($settings->show_seconds !== 'show'){ ?> time-colon <?php } ?>">:</span><span class="timeMinute"><?php echo $customminute; ?></span><?php if($settings->show_seconds === 'show') { ?><span class="time-colon">:</span><span class="timeSeconds"><?php echo $customseconds; ?></span> <?php } ?></span>
                <?php
                if($settings->time_format === '12'){?>
                    <span class="ampm-container">&nbsp;<?php echo $customAMPM; ?></span>
                <?php
                }
                
                ?>
            </p>
        </div>
    <?php } ?>
</div>
        

