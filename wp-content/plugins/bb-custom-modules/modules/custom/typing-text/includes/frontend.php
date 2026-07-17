<?php
$words = array();
for($i = 0; $i < count($settings->items); $i++) : if(!is_object($settings->items[$i])) continue;
    $words[$i] = $settings->items[$i]->heading_text;
endfor;
    
$allWords = json_encode($words);
?>

<h1 class="<?php echo $module->get_classname(); ?>">
  <a href="<?php echo $settings->heading_link; ?>" target="<?php echo $settings->heading_link_target; ?>"<?php echo $module->get_rel(); ?> class="typewrite" data-period="2000" data-type='<?php echo $allWords; ?>'>
    <span class="wrap"></span>
  </a>
</h1>