<?php
?>
(function($) {
	$(function() {
        function customCurrentSeconds(){
            var newnow = new Date().toLocaleString("en-us",{timeZone: "<?php echo $settings->custom_timezone; ?>"});
    	    newnow = new Date(newnow);
            var currentSecond = ( ( 59 - newnow.getSeconds() ) * 1000 );
            
            return currentSecond;
        }
        
        function tinuodTime(){
            
            function pad(n) {
                return (n < 10) ? '0' + n : n;
            }
        
            var now = new Date().toLocaleString("en-us",{timeZone: "<?php echo $settings->custom_timezone; ?>"});
            now = new Date(now);
            if('<?php echo $settings->time_format; ?>' === '12'){
                if( jQuery('.timeHour').html !== pad( (now.getHours() + 24) % 12 || 12 ) ){
                    jQuery('.timeHour').html( pad( (now.getHours() + 24) % 12 || 12 ) );
                }
                if( jQuery('.timeMinute').html !== pad(now.getMinutes()) ){
                    jQuery('.timeMinute').html( pad(now.getMinutes()) );
                }
                
                var checkHour = pad( now.getHours() ); 
                
                if(checkHour > 12 && jQuery('.ampm-container').html().trim() !== 'pm'){
                    jQuery('.ampm-container').html('&nbsp;pm');
                }
                else if(checkHour < 12 && jQuery('.ampm-container').html().trim() === 'am'){
                    jQuery('.ampm-container').html('&nbsp;am');
                }
            }
            else{
                if( jQuery('.timeHour').html !== pad( now.getHours() ) ){
                    jQuery('.timeHour').html( pad( now.getHours() ) );
                }
                if( jQuery('.timeMinute').html !== pad(now.getMinutes()) ){
                    jQuery('.timeMinute').html( pad(now.getMinutes()) );
                }
            }
            var t = customCurrentSeconds();
            setTimeout(function(){
                tinuodTime();
            }, t);
        }
        
        tinuodTime();
       
	});
})(jQuery);
