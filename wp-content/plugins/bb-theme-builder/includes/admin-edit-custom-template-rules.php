<table class="fl-theme-builder-custom-template-rules fl-mb-table widefat">
	<tr class="fl-mb-row">
		<td  class="fl-mb-row-heading">
			<label><?php _e( 'Custom Template', 'bb-theme-builder' ); ?></label>
			<i class="fl-mb-row-heading-help dashicons dashicons-editor-help" title="<?php echo esc_attr( __( 'Include this layout as an option in the WordPress custom templates menu for this post type.', 'bb-theme-builder' ) ); ?>"></i>
		</td>
		<td class="fl-mb-row-content">
			<select name="fl-theme-builder-custom-template-rules[]" class="fl-theme-builder-custom-template-select" multiple>
				<?php
				foreach ( $options as $slug => $label ) :
					$selected_attr = in_array( $slug, $saved ) ? ' selected="selected"' : '';
					echo sprintf( '<option value="%s"%s>%s</optiopn>', $slug, $selected_attr, $label );
				endforeach;
				?>
			</select>
		</td>
	</tr>
</table>
