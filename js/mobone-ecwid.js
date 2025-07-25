// P1
configCategoryVsCityMap = {
  135216751: "Chennai",
  135216002: "Banglore",
  135216252: "Hyderabad",
  default: "Chennai",
};

//   Check 1
configStateVsCategoryMap = {
  TN: "135216751",
  KA: "135216002",
  TG: "135216252",
  AP: "135216252",
  default: "135216751",
};

//   P2
configCityVsSKUMap = {
  Chennai: /^\d+$/,
  Banglore: /^B\d+$/,
  Hyderabad: /^H\d+$/,
  default: /^\d+$/,
};

xProductBrowser(
  "categoriesPerRow=3",
  "views=grid(20,3) list(60) table(60)",
  "categoryView=grid",
  "searchView=list",
  "id=my-store-37334002"
);

xCategoriesV2("id=my-categories-37334002");

Ecwid.OnAPILoaded.add(function () {
  //https://docs.ecwid.com/build-apps/storefronts/store-configuration-settings/design-configs
  window.ec.storefront.show_breadcrumbs = false;
  Ecwid.refreshConfig && Ecwid.refreshConfig();
  updateDefaultStateAndCategory();
});

Ecwid.OnOrderPlaced.add((order) => {});

Ecwid.OnCartChanged.add(function (cart) {
  //   validateCart(cart);
  // console.log( JSON.stringify(cart,null,4));
});

Ecwid.OnSetProfile.add(function (customer) {});

Ecwid.OnPageSwitch.add(function (page) {
  var previousCategory = localStorage.getItem("selectedCategory");
  var previousCity = localStorage.getItem("selectedCity");
  localStorage.setItem("previousCity", previousCity);
  localStorage.setItem("previousCategory", previousCategory);
  var currentCity = configCategoryVsCityMap[page.categoryId];

  if (page.type == "CATEGORY" && page.categoryId != previousCategory) {
    Ecwid.Cart.get(function (cart) {
      if (cart.productsQuantity > 0) {
        if (!validateCart(cart, currentCity)) {
          showCartMismatchPopup(previousCity, currentCity);
        }
      }
    });
  }
});

Ecwid.OnPageLoad.add(function () {});

Ecwid.OnPageLoaded.add(function (page) {
  if (page.type == "CATEGORY" && page.categoryId == 0) {
    showPopup();
  } else if (page.type == "CATEGORY" && page.categoryId != 0) {
    updateSelectedCity(page.categoryId);
  }
  $("#shop_loading").fadeOut();
});

Ecwid.init();

function updateDefaultStateAndCategory() {
  var customerLocation = Ecwid.getVisitorLocation();
  var defaultCategory =
    configStateVsCategoryMap[customerLocation.state] ||
    configStateVsCategoryMap["default"];
  // openCategory(defaultCategory);
}

function updateSelectedCity(selectedCategory) {
  var selectedCity =
    configCategoryVsCityMap[selectedCategory] ||
    configCategoryVsCityMap["default"];
  localStorage.setItem("selectedCity", selectedCity);
  localStorage.setItem("selectedCategory", selectedCategory);
}

function openCategory(category) {
  Ecwid.openPage("category", { id: category });
}

function showCartMismatchPopup(previousCity, currentCity) {
  //   $("#mobone_cart_alert_text").text("Your Cart is not Empty, Continue shopping in " + previousCity);
  $("#mobone_cart_alert_text").html(
    "You have added items in your cart. To switch " +
      currentCity +
      ", you'll need to empty your cart. <br />" +
      "You can either empty the cart and continue shopping in " +
      currentCity +
      ", " +
      "or continue shopping in " +
      previousCity +
      "."
  );

  $("#cart-mismatch-popup-switch-to-new").text(
    "Empty Cart & Switch to " + currentCity
  );
  $("#cart-mismatch-popup-switch-to-old").text("Stay in " + previousCity);
  $("#base-shop-popup").removeClass("hide");
  $("#cart-mismatch-popup").removeClass("hide");
}

function hideCartMismatchPopup() {
  if (!$("#base-shop-popup").hasClass("hide")) {
    $("#base-shop-popup").addClass("hide");
  }
  if (!$("#cart-mismatch-popup").hasClass("hide")) {
    $("#cart-mismatch-popup").addClass("hide");
  }
}

function showPopup() {
  $("#base-shop-popup").removeClass("hide");
  $("#city-popup").removeClass("hide");
}

function hidePopup() {
  if (!$("#base-shop-popup").hasClass("hide")) {
    $("#base-shop-popup").addClass("hide");
  }
  if (!$("#city-popup").hasClass("hide")) {
    $("#city-popup").addClass("hide");
  }
}

$("#city-popup-close").on("click", (event) => {
  var cityPage = $("#mobone_city").val();
  var replaceUrl = window.location.pathname + "#!/" + cityPage;
  event.preventDefault();
  window.location.replace(replaceUrl);
  hidePopup();
});

$("#cart-mismatch-popup-switch-to-new").on("click", (event) => {
  event.preventDefault();
  clearCart();
  hideCartMismatchPopup();
});

$("#cart-mismatch-popup-switch-to-old").on("click", (event) => {
  event.preventDefault();
  previousCategory = localStorage.getItem("previousCategory");
  openCategory(previousCategory);
  hideCartMismatchPopup();
});

function validateCart(cart, currentCity) {
  var skuRegex =
    configCityVsSKUMap[currentCity] || configCityVsSKUMap["default"];
  for (var i = 0; i < cart.items.length; i++) {
    var item = cart.items[i];
    console.log(item.product.sku);
    var skuMatch = item.product.sku.match(skuRegex);
    if (!skuMatch) {
      return false;
    }
  }
  return true;
}

function clearCart() {
  Ecwid.Cart.clear(function (success, error) {
    if (success == true) {
      console.log("Cart was cleared");
    } else {
      console.log("Cart clear failed. Error message: " + error);
    }
  });
}
