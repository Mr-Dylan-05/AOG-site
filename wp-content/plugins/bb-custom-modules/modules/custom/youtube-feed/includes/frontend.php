<?php
    $output .= '<div class="youtube-feed-wrapper">';
        if( $settings->youtube_type === 'video'){
            $videoID = $settings->youtube_video;
            $output .= '<div class="youtube-'.$settings->youtube_type.'-'.$id.'-container">';
            $output .= '<iframe width="'. $settings->video_width .'" height="'. $settings->video_height .'" src="https://www.youtube.com/embed/'.$videoID.'" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>';
        }
        else{
            $videoID = $settings->youtube_playlist;
            $output .= '<div class="youtube-'.$settings->youtube_type.'-'.$id.'-container">';
            $output .= '<iframe width="'. $settings->video_width .'" height="'. $settings->video_height .'" src="https://www.youtube.com/embed/videoseries?list='.$videoID.'" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>';
        }
    $output .= '</div>';
    
    echo $output;
?>