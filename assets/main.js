(function($) {
  //Get side cart
  const cart = {
    body: $("body"),
    wrapper: $(".kw-cart__inner"),
    overLay: $(".kw-cart__overlay"),
    closeBtn: $(".closeThatCart")
  };

  // Open cart function
  function openSideCart() {
    cart.overLay.addClass("-expanded");
    cart.wrapper.addClass("-expanded");
    cart.body.addClass("-cart-open");
  }

  // Close cart function
  function closeSideCart() {
    cart.overLay.removeClass("-expanded");
    cart.wrapper.removeClass("-expanded");
    cart.body.removeClass("-cart-open");
  }

  $("#menu-item-15").click(function(e) {
    e.preventDefault();
    openSideCart();
  });

  cart.closeBtn.click(function() {
    closeSideCart();
  });

  //Update cart Qaunity on change
  $(".woocommerce").on("change", "input.qty", function() {
    setTimeout(() => {
      $("[name='update_cart']").trigger("click");
    }, 400);
  });

  $.fn.serializeArrayAll = function() {
    var rCRLF = /\r?\n/g;
    return this.map(function() {
      return this.elements ? jQuery.makeArray(this.elements) : this;
    })
      .map(function(i, elem) {
        var val = jQuery(this).val();
        if (val == null) {
          return val == null;
          //next 2 lines of code look if it is a checkbox and set the value to blank
          //if it is unchecked
        } else if (this.type == "checkbox" && this.checked === false) {
          return { name: this.name, value: this.checked ? this.value : "" };
          //next lines are kept from default jQuery implementation and
          //default to all checkboxes = on
        } else {
          return jQuery.isArray(val)
            ? jQuery.map(val, function(val, i) {
                return { name: elem.name, value: val.replace(rCRLF, "\r\n") };
              })
            : { name: elem.name, value: val.replace(rCRLF, "\r\n") };
        }
      })
      .get();
  };

  // Add to cart buttons
  $(document).on(
    "click",
    ".single_add_to_cart_button:not(.disabled), .add_to_cart_button:not(.product_type_variable)",
    function(e) {
      var $thisbutton = $(this),
        $form = $thisbutton.closest("form.cart"),
        //quantity = $form.find('input[name=quantity]').val() || 1,
        //product_id = $form.find('input[name=variation_id]').val() || $thisbutton.val(),
        data =
          $form
            .find('input:not([name="product_id"]), select, button, textarea')
            .serializeArrayAll() || 0;

      $.each(data, function(i, item) {
        if (item.name == "add-to-cart") {
          item.name = "product_id";
          item.value =
            $form.find("input[name=variation_id]").val() || $thisbutton.val();
        }
      });

      e.preventDefault();

      $(document.body).trigger("adding_to_cart", [$thisbutton, data]);

      $.ajax({
        type: "POST",
        url: woocommerce_params.wc_ajax_url
          .toString()
          .replace("%%endpoint%%", "add_to_cart"),
        data: data,
        beforeSend: function(response) {
          $thisbutton.removeClass("added").addClass("loading");
        },
        complete: function(response) {
          $thisbutton.addClass("added").removeClass("loading");
          openSideCart();
        },
        success: function(response) {
          if (response.error && response.product_url) {
            window.location = response.product_url;
            return;
          }
          $(document.body).trigger("added_to_cart", [
            response.fragments,
            response.cart_hash,
            $thisbutton
          ]);
        }
      });

      return false;
    }
  );

  // Ajax delete product in the cart
  $(document).on("click", ".kw-cart__inner a.remove", function(e) {
    e.preventDefault();

    const deleteProduct = {
      productId: $(this).attr("data-product_id"),
      cartItemKey: $(this).attr("data-cart_item_key"),
      cartRemove: $("body").find(`td.product-remove a.remove`)
    };

    // Delete individual item on cart page
    deleteProduct.cartRemove.each(function() {
      if (
        $(this)
          .attr("href")
          .includes(deleteProduct.cartItemKey)
      ) {
        $(this).trigger("click");
      }
    });

    $.ajax({
      type: "POST",
      dataType: "json",
      url: wc_add_to_cart_params.ajax_url,
      data: {
        action: "product_remove",
        product_id: deleteProduct.productId,
        cart_item_key: deleteProduct.cartItemKey
      },
      success: function(response) {
        if (!response || response.error) return;

        let fragments = response.fragments;

        // Replace fragments
        if (fragments) {
          $.each(fragments, function(key, value) {
            $(key).replaceWith(value);
          });
        }
      }
    });
  });

  // Quanity change
  $(document).on("click, change", ".kw-cart__quanity .qty", function(e) {
    e.preventDefault();
    const cartQuanity = {
      quanity: $(this).val(),
      cartItemKey: $(this).attr("id")
    };

    let itemPrice = $(this)
      .closest(".kw-cart__quanity")
      .find("input#itemPrice");
    let itemQuanity = $(this)
      .closest(".kw-cart__quanity")
      .find("input#itemQuantity");

    //If input is zero, remove item
    if (cartQuanity.quanity == 0) {
      $(this)
        .parents(".kw-cart__product-content")
        .find("a.remove")
        .trigger("click");
    }

    // Update cart on qunaity change
    const singleCartQuanity = $("body").find("td.product-quantity input.qty");
    singleCartQuanity.each(function() {
      if (
        $(this)
          .attr("name")
          .includes(cartQuanity.cartItemKey)
      ) {
        const cartUpate = $("body").find(
          'table.woocommerce-cart-form__contents [name="update_cart"]'
        );
        $(this).val(cartQuanity.quanity);

        setTimeout(() => {
          cartUpate.prop("disabled", false).trigger("click");
        }, 400);
      }
    });

    //update quanity
    itemQuanity.val($(this).val());
    // update price per item
    $(this)
      .closest(".kw-cart__quanity")
      .find("#kwCartTotal")
      .html(itemQuanity.val() * itemPrice.val());

    let localHostUrl = "";
    if (window.location.origin.includes("localhost")) {
      localHostUrl = "/cart-pop/";
    }

    $.ajax({
      type: "POST",
      dataType: "json",
      url: window.location.origin + localHostUrl + "wp-admin/admin-ajax.php",
      data: {
        action: "update_item_from_cart",
        cart_item_key: cartQuanity.cartItemKey,
        qty: cartQuanity.quanity
      },
      success: function(data) {}
    });
  });
})(jQuery);
