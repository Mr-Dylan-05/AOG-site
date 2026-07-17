<?php
/*
Template Name: Claude Page
*/


get_header();


$file = get_post_meta(
    get_the_ID(),
    '_claude_file',
    true
);


if ($file) {

    echo load_claude_page($file);

} else {

    echo '<p>No Claude file assigned.</p>';

}


get_footer();