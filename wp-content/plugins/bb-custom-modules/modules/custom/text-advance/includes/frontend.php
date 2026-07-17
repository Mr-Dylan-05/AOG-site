<div class="text-advance">
	<?php if(!empty($settings->link)) : ?>
	<a href="<?php echo $settings->link; ?>" title="<?php echo $settings->link; ?>" target="<?php echo $settings->link_target; ?>">
	<?php endif; ?>
	<span class="text-advance-text"><?php echo $settings->heading; ?></span>
	<?php if(!empty($settings->link)) : ?>
	</a>
	<?php endif; ?>
</div>