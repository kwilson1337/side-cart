<?php 
add_filter( 'woocommerce_add_to_cart_fragments', 'ajax_update_cart', 10, 1 );
function ajax_update_cart( $fragments ) {
    ob_start();
    ?>
    <div class="kw-cart__items">                
        <?php    
            foreach( WC()->cart->get_cart() as $cart_item_key => $cart_item ):                                                               
                // Get product image
                $img_atts = wp_get_attachment_image_src($cart_item['data']->image_id, 'small');                                      
                ?>               
                <div class="kw-cart__single-item">                                   
                    <div class="kw-cart__product-image">
                        <a href="<?php echo get_permalink($cart_item['data']->id) ?>">
                            <img src="<?php echo $img_atts[0]; ?>" alt="<?php echo $cart_item['data']->get_title(); ?>">
                        </a> 
                    </div> <!-- //img -->   

                    <div class="kw-cart__product-content">                        
                        <div class="top-content">
                            <div class="title">
                                <p>
                                    <a href="<?php echo get_permalink($cart_item['data']->id) ?>">
                                        <?php echo $cart_item['data']->name; ?>                                
                                    </a>
                                </p> 
                                <?php if($cart_item['data']->short_description): ?>                                    
                                    <p class="desc"><?php echo wp_trim_words( $cart_item['data']->short_description, '8', '...' ); ?></p>
                                <?php endif; ?>
                            </div>                       
                            <div class="remove-item">
                                <a 
                                    class="remove" 
                                    data-product_id="<?php echo $cart_item['data']->id; ?>"
                                    data-cart_item_key="<?php echo $cart_item_key; ?>"
                                >
                                    <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M2.343 15.071L.93 13.657 13.657.929l1.414 1.414z"></path><path d="M.929 2.343L2.343.93l12.728 12.728-1.414 1.414z"></path></g></svg>
                                </a>  
                            </div>    
                        </div> <!-- //top -->

                        <div class="bottom-content">
                            <div class="kw-cart__quanity" data-product-id="<?php echo $cart_item['data']->id; ?>">
                                <input id="itemPrice" type="hidden" value="<?php echo  wc_get_price_to_display( $cart_item['data']); ?>">
                                <input id="itemQuantity" type="hidden" value="<?php echo $cart_item['quantity']; ?>">  
                                <div class="quanity-left">
                                    <?php
                                        $product = $cart_item['data']; 
                                        if ( ! $product->is_sold_individually() && $product->is_purchasable() ) {
                                            woocommerce_quantity_input( array( 
                                                'input_id'  => $cart_item_key,
                                                'min_value' => '0', 
                                                'input_value' => $cart_item['quantity'], 
                                                'max_value' => $product->backorders_allowed() ? '' : $product->get_stock_quantity() ), $product, true 
                                            );
                                        }
                                    ?>
                                </div> <!-- //quanity-left -->

                                <div class="quanity-right">
                                   <span class="curreny"><?php echo get_woocommerce_currency_symbol(); ?></span> 
                                   <span id="kwCartTotal"><?php echo  $cart_item['quantity'] * wc_get_price_to_display( $cart_item['data']); ?></span>
                                </div> <!-- //quanity-right -->
                            </div> <!-- //__quanity -->
                        </div> <!-- //bottom -->
                    </div> <!-- //content -->                         
                </div>
            <?php 
            endforeach;
        ?>    
    </div>                  
    <?php
    $fragments['.kw-cart__items'] = ob_get_clean();
    return $fragments;    
}
?>