<?php
/*
Template Name: AOW Dynamic Page Template
*/

// 1. Let WordPress output the standard site header
get_header();

// 2. Locate the new index.html file
$dist_path = get_stylesheet_directory() . '/adon-ai/dist/index.html';

if ( file_exists( $dist_path ) ) {
    $html = file_get_contents( $dist_path );

    // Extract what's inside <head> and <body> from index.html
    preg_match('/<head>(.*?)<\/head>/s', $html, $head_matches);
    preg_match('/<body>(.*?)<\/body>/s', $html, $body_matches);

    // Get the base URL for your adon-ai directory (e.g., https://yoursite.com/wp-content/themes/bb-theme-child/adon-ai/dist/)
    $dist_uri = get_stylesheet_directory_uri() . '/adon-ai/dist/';

    // 3. Output the Head tags (CSS, Fonts, custom logic)
    if ( isset($head_matches[1]) ) {
        $head_content = $head_matches[1];
        
        // Dynamically fix any absolute paths (like /assets/ or /support.js) so they point to your theme folder
        $head_content = str_replace('href="/assets/', 'href="' . $dist_uri . 'assets/', $head_content);
        $head_content = str_replace('href="/favicon', 'href="' . $dist_uri . 'favicon', $head_content);
        $head_content = str_replace('href="/apple-touch', 'href="' . $dist_uri . 'apple-touch', $head_content);
        $head_content = str_replace('href="/site.webmanifest"', 'href="' . $dist_uri . 'site.webmanifest"', $head_content);
        $head_content = str_replace('src="/support.js"', 'src="' . $dist_uri . 'support.js"', $head_content);
        
        echo $head_content;
    }
}
?>

<div id="adon-ai-app">
<div id="adon-ai-app">
<?php
// 4. Output the Body tags (The layout, structured texts, and logic script)
if ( isset($body_matches[1]) ) {
    $body_content = $body_matches[1];
    
    // Get the base URL for your adon-ai directory
    $dist_uri = get_stylesheet_directory_uri() . '/adon-ai/dist/';
    
    // Dynamically fix any relative/absolute image paths inside the body
    $body_content = str_replace('src="assets/', 'src="' . $dist_uri . 'assets/', $body_content);
    $body_content = str_replace('src="/assets/', 'src="' . $dist_uri . 'assets/', $body_content);
    $body_content = str_replace('url(\'/assets/', 'url(\'' . $dist_uri . 'assets/', $body_content);
    
    // FIX FOR THE TEAM AVATARS / ASSET PATHS IN THE JAVASCRIPT OBJECTS
    // This catches variables like: R('teamDylan','assets/team-dylan.png')
    $body_content = str_replace('\'assets/team-', '\'' . $dist_uri . 'assets/team-', $body_content);
    $body_content = str_replace('"assets/team-', '"' . $dist_uri . 'assets/team-', $body_content);
    $body_content = str_replace('\'assets/client-', '\'' . $dist_uri . 'assets/client-', $body_content);
    $body_content = str_replace('"assets/client-', '"' . $dist_uri . 'assets/client-', $body_content);
    
    echo $body_content;
}
?>
</div>
</div>

<style>
#adon-ai-app {
    font-size: unset !important;
    background: radial-gradient(120% 60% at -2% -8%, rgba(255, 168, 112, 0.22), transparent 50%), radial-gradient(110% 60% at 104% -2%, rgba(47, 111, 237, 0.18), transparent 52%), radial-gradient(85% 38% at 102% 40%, rgba(47, 111, 237, 0.10), transparent 56%), radial-gradient(85% 36% at -2% 70%, rgba(255, 168, 112, 0.12), transparent 56%), radial-gradient(80% 34% at 50% 100%, rgba(45, 212, 191, 0.10), transparent 60%), linear-gradient(180deg, #FBF6F2 0%, #FAFAFE 32%, #F6FAFE 62%, #F2F5FB 100%);
}
#adon-ai-app * {
    box-sizing: border-box;
}
/* Reset container rules */
#adon-ai-app {
    font-size: unset !important;
}
#adon-ai-app * {
    box-sizing: border-box;
}

/* Reset container rules */
#adon-ai-app {
    font-size: unset !important;
}
#adon-ai-app * {
    box-sizing: border-box;
}

/* Reset container rules */
#adon-ai-app {
    font-size: unset !important;
}
#adon-ai-app * {
    box-sizing: border-box;
}

/* 1. FORCE Beaver Builder / Theme wrappers to be transparent */
body.page-template-template,
body.page-template-template-php,
body.page-template-template .fl-page,
body.page-template-template .fl-page-content,
body.page-template-template #primary,
body.page-template-template .site-main {
    background: transparent !important;
    box-shadow: none !important;
    border: none !important;
}

/* 2. Link overrides: Prevent WordPress from stealing link/button text colors */
#adon-ai-app a {
    text-decoration: none;
}

/* 
  If a link is meant to have a dark background button style, 
  ensure its text is always white.
*/
#adon-ai-app a[style*="background:#0B1220"],
#adon-ai-app a[style*="background: #0B1220"],
#adon-ai-app a[style*="background:#0b1220"] {
    color: #ffffff !important;
}

/* 
  If a link or span has a specific inline color defined by the template, 
  let it keep its own color instead of inheriting the parent text color.
*/
#adon-ai-app a[style*="color:#fff"],
#adon-ai-app a[style*="color: #fff"] {
    color: #ffffff !important;
}

#adon-ai-app a[style*="color:{{ accent }}"],
#adon-ai-app a[style*="color: {{ accent }}"] {
    color: #2F6FED !important; /* Fallback accent blue */
}

/* 3. FORCE non-styled text elements to inherit block section colors (like white on dark sections) */
#adon-ai-app h1, 
#adon-ai-app h2, 
#adon-ai-app h3, 
#adon-ai-app h4, 
#adon-ai-app p,
#adon-ai-app li,
#adon-ai-app strong {
    color: inherit;
}
</style>

<?php 
// 5. Let WordPress output the standard site footer
get_footer(); 
?>