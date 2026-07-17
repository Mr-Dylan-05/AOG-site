(function($) {
	$(function() {
        var pause = $('.audioControl img').attr('data-pause');
        var play = $('.audioControl img').attr('data-play');
        
        $('.fl-node-<?php echo $id; ?> .audio-post').each( function() {
            $(this).click( function () {
                var postID = $('.audio-file', this).attr('data-ID');
                var audioFile = $('.audio-file', this).get(0);
                
                $('.audio-post').each(function(){
                    var audioID = $('.audio-file', this).attr('data-ID');
                    var audioFileSecond = $('.audio-file', this).get(0);
                    if( postID !==  audioID ){
                        audioFileSecond.pause();
                        $('img', this).attr("src", play);
                        $('.audioControl', this).addClass("play").removeClass("pause");
                    }
                });
                
                
                if ( $('.audioControl', this).hasClass('play') ) {
                    audioFile.play();
                    $('img', this).attr("src", pause);
                    $('.audioControl', this).addClass("pause");
                    $('.audioControl', this).removeClass("play");
                } else {
                    audioFile.pause();
                    $('img', this).attr("src", play);
                    $('.audioControl', this).addClass("play");
                    $('.audioControl', this).removeClass("pause");
                }
            } );
        } );
        

    });
})(jQuery);