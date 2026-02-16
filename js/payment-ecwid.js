(function (window, document) {
  "use strict";

  var UPI_CONFIG = {
    upiId: "palmpawfoods@icici",
    payeeName: "PALM PAW FOODS INDIA PVT LTD",
    currency: "INR",
    note: "MOBone Order Payment",
  };
  var cartChangeBound = false;
  var currentCartAmount = 0;

  function toNumber(value) {
    if (value === null || value === undefined) {
      return 0;
    }
    if (typeof value === "number") {
      return Number.isFinite(value) ? value : 0;
    }
    var parsed = parseFloat(String(value).replace(/[^0-9.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function formatAmount(amount) {
    return UPI_CONFIG.currency + " " + amount.toFixed(2);
  }

  function buildUpiUri(amount) {
    var params = new URLSearchParams();
    params.set("pa", UPI_CONFIG.upiId);
    params.set("pn", UPI_CONFIG.payeeName);
    params.set("cu", UPI_CONFIG.currency);
    params.set("tn", UPI_CONFIG.note);

    if (amount > 0) {
      params.set("am", amount.toFixed(2));
    }

    return "upi://pay?" + params.toString();
  }

  function renderQrCode(upiUri) {
    var qrRoot = document.getElementById("upi-qr-code");
    if (!qrRoot) {
      return;
    }

    qrRoot.innerHTML = "";

    if (typeof window.QRCode === "undefined") {
      qrRoot.innerHTML = '<p class="payment-qr-error">QR library not loaded.</p>';
      return;
    }

    new window.QRCode(qrRoot, {
      text: upiUri,
      width: 170,
      height: 170,
      colorDark: "#222222",
      colorLight: "#ffffff",
      correctLevel: window.QRCode.CorrectLevel.M,
    });
  }

  function applyPaymentUi(amount) {
    var normalizedAmount = amount > 0 ? amount : 0;
    currentCartAmount = normalizedAmount;
    var upiUri = buildUpiUri(normalizedAmount);

    var amountEl = document.getElementById("payment-cart-amount");
    if (amountEl) {
      amountEl.textContent = formatAmount(normalizedAmount);
    }

    var payButtonEl = document.getElementById("upi-pay-link");
    if (payButtonEl) {
      payButtonEl.setAttribute("href", upiUri);
    }

    var upiIdLinkEl = document.getElementById("upi-id-link");
    if (upiIdLinkEl) {
      upiIdLinkEl.setAttribute("href", upiUri);
    }

    renderQrCode(upiUri);
  }

  function getCartTotalFromEcwid(callback) {
    if (
      !window.Ecwid ||
      !window.Ecwid.Cart ||
      typeof window.Ecwid.Cart.get !== "function"
    ) {
      callback(0);
      return;
    }

    window.Ecwid.Cart.get(function (cart) {
      var total = toNumber(cart && (cart.total !== undefined ? cart.total : cart.subtotal));
      callback(total);
    });
  }

  function bindCartUpdates() {
    if (cartChangeBound) {
      return;
    }
    if (
      window.Ecwid &&
      window.Ecwid.OnCartChanged &&
      typeof window.Ecwid.OnCartChanged.add === "function"
    ) {
      window.Ecwid.OnCartChanged.add(function (cart) {
        var total = toNumber(cart && (cart.total !== undefined ? cart.total : cart.subtotal));
        applyPaymentUi(total);
      });
      cartChangeBound = true;
    }
  }

  function initWithEcwid() {
    if (
      window.Ecwid &&
      window.Ecwid.OnAPILoaded &&
      typeof window.Ecwid.OnAPILoaded.add === "function"
    ) {
      window.Ecwid.OnAPILoaded.add(function () {
        getCartTotalFromEcwid(applyPaymentUi);
        bindCartUpdates();
      });

      if (typeof window.Ecwid.init === "function") {
        window.Ecwid.init();
      }

      // In case API is already ready before callback registration.
      getCartTotalFromEcwid(applyPaymentUi);
      bindCartUpdates();
      return;
    }

    applyPaymentUi(0);
  }

  window.initPaymentInstructions = function () {
    initWithEcwid();
  };
})(window, document);
