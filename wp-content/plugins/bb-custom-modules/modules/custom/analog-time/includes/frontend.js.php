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
                
                <?php if(  $settings->show_seconds === 'show' ) { ?> 
                    if( jQuery('.timeSeconds').html !== pad(now.getSeconds()) ){
                        jQuery('.timeSeconds').html( pad(now.getSeconds()) );
                    }
                <?php } ?>
                
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
                
                <?php if(  $settings->show_seconds === 'show' ) { ?> 
                    if( jQuery('.timeSeconds').html !== pad(now.getSeconds()) ){
                        jQuery('.timeSeconds').html( pad(now.getSeconds()) );
                    }
                <?php } ?>
            }
            
            <?php if(  $settings->show_seconds === 'show' ) { ?> 
                var t = 1000;
            <?php } else{ ?> 
                var t = customCurrentSeconds();
            <?php } ?>
            
            setTimeout(function(){
                tinuodTime();
            }, t);
        }
        <?php if($settings->clock_type === 'digital') {?>
            tinuodTime();
        <?php } ?>
        
        
        <?php if($settings->clock_type === 'analog') {?>
            // Real Clock Display
            snippets = [];
        
            function createSnippets () {
                var i;
        
                for (i = 0; i < snippets.length; i++) {
                    snippets[i].render();
                }
            }
        
            function updateSnippets () {
                var i;
        
                for (i = 0; i < snippets.length; i++) {
                    snippets[i].update();
                }
            }
        
            function updateClock(){
                var now = new Date().toLocaleString("en-us",{timeZone: "<?php echo $settings->custom_timezone; ?>"});
                now = new Date(now);
                
                var second = now.getSeconds() * 6;
                var minute = now.getMinutes() * 6 + second / 60;
                var hour = ((now.getHours() % 12) / 12) * 360 + 90 + minute / 12;
        
                jQuery('#hour').css("transform", "rotate(" + hour + "deg)");
                jQuery('#minute').css("transform", "rotate(" + minute + "deg)");
                
                <?php if(  $settings->show_seconds === 'show' ) { ?> 
                    jQuery('#second').css("transform", "rotate(" + second + "deg)");
                <?php } ?>
            }
        
            function spaces (length) {
                var out = "";
                while (out.length < length) {
                    out += " ";
                }
                return out;
            }
        
            function Snippet (el) {
                var longest = 0,
                    i,
                    text  = this.text  = el.text().split('\n'),
                    html  = this.html  = el.html().split('\n'),
                    evals = this.evals = [];
        
                this.el = el;
        
                for (i = 0; i < text.length; i++) {
                    longest = Math.max(text[i].length, longest);
                    evals[i] = new Function('return ' + text[i]);
                }
        
                for (i = 0; i < text.length; i++) {
                    html[i] += spaces(longest - text[i].length);
                }
            }
        
            Snippet.prototype.render = function () {
                var output = [],
                    i;
        
                for (i = 0; i < this.html.length; i++) {
                    output[i] = this.html[i];
                    output[i] += '<span class="comment"> // ';
                    output[i] += this.evals[i]();
                    output[i] += '</span>';
                }
        
                this.el.html(output.join('\n'));
            };
        
            Snippet.prototype.update = function () {
                var i,
                    comments = [];
        
                if (!this.comments) {
                    for (i = 0; i < this.el[0].childNodes.length; i++) {
                        if ('comment' === this.el[0].childNodes[i].className) {
                            comments.push( jQuery(this.el[0].childNodes[i]));
                        }
                    }
                    this.comments = comments;
                }
        
                for (i = 0; i < this.comments.length; i++) {
                    this.comments[i].text(' // ' + this.evals[i]());
                }
            }
        
            function timedUpdate () {
                updateClock();
                updateSnippets();
                setTimeout(timedUpdate, 1000);
            }
        
            jQuery('.page-moment-index code').each(function () {
                snippets.push(new Snippet( jQuery(this)));
            });
        
            createSnippets();
            timedUpdate();
        
            jQuery(document).on('click', '[data-locale]', function(){
                var dom = jQuery(this);
                currentLang = dom.data('locale');
                jQuery('[data-locale]').removeClass('active');
                dom.addClass('active');
                updateSnippets();
            });
        <?php } ?>
        
	});
})(jQuery);
