<?php
/**
 * Plugin Name:       Side Cart
 * Plugin URI:        https://github.com/kwilson1337
 * Description:       A new way to view your cart
 * Version:           1.0
 * Author:            Kyle Wilson
 * Text Domain:       side-cart
 */

class side_cart {
    public function __construct() {
        add_action('init', [ $this, 'load_styles' ]);
        add_action('wp_body_open', [$this, 'get_cart']);
        add_action('init', [$this, 'get_cart_update']);
        add_action('wp_ajax_product_remove',[$this, 'remove_cart_item']);
        add_action('wp_ajax_nopriv_product_remove',[$this, 'remove_cart_item']);
        add_action('wp_ajax_update_item_from_cart', [$this, 'update_quainty']);
        add_action('wp_ajax_nopriv_update_item_from_cart', [$this, 'update_quainty']);  
        add_filter( 'woocommerce_add_to_cart_fragments', [$this, 'cart_check_out']);      
    }

    public function load_styles() {
        wp_register_style('kw-side-cart-styles', plugins_url('dist/style.min.css', __FILE__));
        wp_enqueue_style('kw-side-cart-styles');
        wp_register_script('kw-side-cart-js', plugins_url('dist/main.min.js', __FILE__));
        wp_enqueue_script('kw-side-cart-js', '', array( 'jquery' ), '1.0.0', true );
    }

    public function get_cart() {
        require_once('cart.php');        
    }

    public static function get_cart_update() {
        require_once('cart-update.php');
    }   
    
    public function remove_cart_item() {
        // Get mini cart
        ob_start();

        foreach (WC()->cart->get_cart() as $cart_item_key => $cart_item) {     
            if($cart_item['product_id'] == $_POST['product_id'] && $cart_item_key == $_POST['cart_item_key']) {          
                WC()->cart->remove_cart_item($cart_item_key);
            }
        }

        WC()->cart->calculate_totals();
        WC()->cart->maybe_set_cart_cookies();
       
        $kw_cart = ob_get_clean();

        // Fragments and cart are returned
        $data = array(
            'fragments' => apply_filters('woocommerce_add_to_cart_fragments', array(
                    'div.kw-cart__items' => '<div class="kw-cart__items">' . $kw_cart . '</div>'
                )
            ),
            'cart_hash' => apply_filters( 'woocommerce_add_to_cart_hash', WC()->cart->get_cart_for_session() ? md5( json_encode( WC()->cart->get_cart_for_session() ) ) : '', WC()->cart->get_cart_for_session() )
        );

        wp_send_json($data);

        die();
    }

    public function update_quainty() {
        $cart_item_key = $_POST['cart_item_key'];   
        $quantity = $_POST['qty'];     

        // Get mini cart
        ob_start();

        foreach (WC()->cart->get_cart() as $cart_item_key => $cart_item)
        {
            if( $cart_item_key == $_POST['cart_item_key'] )
            {
                WC()->cart->set_quantity( $cart_item_key, $quantity, $refresh_totals = true );
            }
        }
        WC()->cart->calculate_totals();
        WC()->cart->maybe_set_cart_cookies();
        return true;
    } 
    
    public function cart_check_out() {       
        ob_start();
        $items_count = WC()->cart->get_cart_contents_count();
        ?>
        <div class="kw-cart__link">            
            <?php echo $items_count 
            ? '
            <div class="cart-total"><p>Subtotal:</p> <p>'. WC()->cart->cart_contents_total .'</p></div>

            <div class="cart-check-out-container">
                <a class="cart-checkout" href="'. wc_get_checkout_url() .'">Proceed to checkout</a>
            </div>
            ' 
            : '<p>You have no items in your cart</p>'; ?>            
        </div>
        <?php
            $fragments['.kw-cart__link'] = ob_get_clean();
        return $fragments;
    }
}

if(class_exists('side_cart')) {
    $side_cart = new side_cart();         
}
?>
