<?php 
/**
 * Adds input for mini cart - if I decide to go this route
 */
add_action('woocommerce_widget_shopping_cart_before_buttons','ask_woo_mini_cart_before_buttons' );
function ask_woo_mini_cart_before_buttons(){
	wp_nonce_field( 'woocommerce-cart' ); 
	?>
 	<div class="submit-button">
         <input type="submit" class="button" name="update_cart" value="<?php// esc_attr_e('Uppdatera varukorg', 'tidymerch'); ?>"/>                  
 	</div>
<?php
}