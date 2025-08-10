$(document).ready(function () {
  "use strict";
  /* =================================
  Header and Footer 
  =================================== */

  var includes = $("[data-include]");
  $.each(includes, function () {
    if ($(this).data("include") == "header") {
      var file = $(this).data("include") + ".html";
      $(this).load(file, function () {
        // xSearch("id=my-search-37334002");
      });
    } else {
      var file = $(this).data("include") + ".html";
      $(this).load(file, function () {
        $(".dynamic_year").html(new Date().getFullYear());
        //smooth scroll to top
        $(".cd-top").on("click", function (event) {
          event.preventDefault();
          $("body,html").animate(
            {
              scrollTop: 0,
            },
            700
          );
        });
        setWhatsapp("social_whatsapp");
        getBannerType();
      });
    }
  });

  $('[data-toggle="tooltip"]').tooltip();

  /* =================================
  LOADER 
  =================================== */
  $(".loader").delay(400).fadeOut();
  $(".animationload").delay(400).fadeOut("fast");

  var bgi = $("[data-background]");
  bgi.length > 0 &&
    bgi.each(function () {
      var e = $(this),
        t = e.attr("data-background");
      e.css({ "background-image": "url(" + t + ")" });
    });

  var progressBar = $(".progress-bar");
  progressBar.length > 0 &&
    progressBar.each(function () {
      var e = $(this),
        t = e.attr("aria-valuenow");
      e.css({ width: t + "%" });
    });

  /* =================================
  NAVBAR 
  =================================== */

  jQuery(window).scroll(function () {
    var top = jQuery(document).scrollTop();
    var batas = 200;
    var navbar = jQuery(".navbar-main");
    var navbarnav = jQuery(".navbar-nav");
    var header = jQuery(".header");

    if (top > batas) {
      // navbar.addClass("stiky");
    } else {
      // navbar.removeClass("stiky");
      if (header.hasClass("header-2")) {
        // navbarnav.removeClass("ml-auto");
      }
      if (header.hasClass("header-5")) {
        // navbarnav.removeClass("ml-auto");
      }
    }
  });

  /* =================================
  BANNER ROTATOR IMAGE 
  =================================== */
  var slides = $("#oc-fullslider"),
    b = slides.find(".owl-slide");
  b.each(function () {
    var e = $(this),
      ocImg = e.find("img").attr("src"),
      ocBgColor = e.find("img").attr("bg-color");
    e.css({ "background-image": "url(" + ocImg + ")" });
    e.css({ "background-color": ocBgColor });
  });

  slides.owlCarousel({
    items: 1,
    autoplay: false,
    autoplayTimeout: 3000,
    autoplayHoverPause: true,
    loop: true,
    animateIn: "fadeIn",
    animateOut: "fadeOut",
    pagination: false,
    nav: true,
    navText: [
      "<span class='fa fa-chevron-left'></span>",
      "<span class='fa fa-chevron-right'></span>",
    ],
    dots: false,
  });

  var testimony = $("#testimonial");
  testimony.owlCarousel({
    items: 1,
    autoplay: true,
    autoplayTimeout: 3000,
    autoplayHoverPause: true,
    loop: true,
    animateIn: "fadeIn",
    animateOut: "rollOut",
    pagination: false,
    nav: true,
    navText: [
      "<span class='fa fa-chevron-left'></span>",
      "<span class='fa fa-chevron-right'></span>",
    ],
    dots: false,
  });

  /* =================================
  BACK TO TOP 
  =================================== */
  // browser window scroll (in pixels) after which the "back to top" link is shown
  var offset = 300,
    //browser window scroll (in pixels) after which the "back to top" link opacity is reduced
    offset_opacity = 1200,
    //duration of the top scrolling animation (in ms)
    scroll_top_duration = 700;
  //grab the "back to top" link

  //hide or show the "back to top" link
  $(window).scroll(function () {
    var top = jQuery(document).scrollTop();
    top > offset
      ? $(".cd-top").addClass("cd-is-visible")
      : $(".cd-top").removeClass("cd-is-visible cd-fade-out");
    if (top < offset_opacity && top > offset) {
      $(".cd-top").addClass("cd-fade-out");
    }
    if (top > offset_opacity) {
      $(".cd-top").removeClass("cd-fade-out");
    }
  });

  /* =================================
  MAGNIFIC POPUP
  =================================== */
  $(".popup-youtube, .popup-vimeo, .popup-gmaps").magnificPopup({
    disableOn: 700,
    type: "iframe",
    mainClass: "mfp-fade",
    removalDelay: 160,
    preloader: false,

    fixedContentPos: false,
  });

  $(".popup-gallery").magnificPopup({
    delegate: "a",
    type: "image",
    tLoading: "Loading image #%curr%...",
    mainClass: "mfp-img-mobile",
    gallery: {
      enabled: true,
      navigateByImgClick: true,
      preload: [0, 1],
    },
    image: {
      tError: '<a href="%url%">The image #%curr%</a> could not be loaded.',
      titleSrc: function (item) {
        return item.el.attr("title") + "";
      },
    },
  });
});

$(window).load(function () {
  // PAGE IS FULLY LOADED
  // FADE OUT YOUR OVERLAYING DIV
  $("#loading").fadeOut();
});

function setWhatsapp(id) {
  if (WURFL.is_mobile === true) {
    $("." + id).attr(
      "href",
      "whatsapp://send?phone=+919655692559&text=Hi, I am interested in MOBone 🍖 for my 🐕"
    );
  } else {
    $("." + id).attr(
      "href",
      "https://api.whatsapp.com/send?phone=+919655692559&text=Hi, I am interested in MOBone 🍖 for my 🐕"
    );
  }
}

function onSuccess() {
  $("#successModal").modal(
    "show",
    setTimeout(function () {
      $("#successModal").modal("hide");
    }, 5000)
  );
  // remove this to avoid redirect
  // window.location = window.location.pathname + "?message=Email+Successfully+Sent%21&isError=0";
}
function onError() {
  $("#failedModal").modal(
    "show",
    setTimeout(function () {
      $("#failedModal").modal("hide");
    }, 5000)
  );
  // remove this to avoid redirect
  // window.location = window.location.pathname + "?message=Email+could+not+be+sent.&isError=1";
}

function validateCaptcha(token) {
  // var myHeaders = new Headers();
  // myHeaders.append("Content-Type", "application/json");
  // var requestOptions = {
  //   method: 'POST'
  // };
  // fetch("https://www.google.com/recaptcha/api/siteverify?secret=test&response=" + token, requestOptions)
  //   .then(response => response.text())
  //   .then(result => {
  //     console.log(result);
  //     onSuccess();
  //   })
  //   .catch(error => onError);
}

function sendEMail(data, emailType) {
  // alert(JSON.stringify(data));
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("x-api-key", tokenKeys.get(emailType));

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify(data),
    redirect: "follow",
  };

  fetch(
    "https://pmxdgw8nt3.execute-api.ap-south-1.amazonaws.com/prod/v1/email/notify",
    requestOptions
  )
    .then((response) => response.text())
    .then((result) => {
      console.log(result);
      onSuccess();
    })
    .catch((error) => onError);
}

function isDateBetween(startDate, endDate, targetDate) {
  // Parse the dates to ensure they are valid Date objects
  startDate = new Date(startDate);
  endDate = new Date(endDate);
  targetDate = new Date(targetDate);

  // Check if the target date is between the start and end dates
  return targetDate >= startDate && targetDate <= endDate;
}
function checkisvalidpage(page) {
  var req = new XMLHttpRequest();
  req.open("GET", document.location, true);
  req.send(null);
  req.onload = function () {
    var headers = req.getResponseHeader("date");
    var currentDate = new Date(headers);
    var currentYear = currentDate.getFullYear();

    if (
      page == "servethestrays" &&
      !isDateBetween(
        new Date(currentYear + "/08/01"),
        new Date(currentYear + "/08/11"),
        currentDate
      )
    ) {
      window.location.href = "/index";
    }

    if (
      page == "thanks" &&
      !isDateBetween(
        new Date(currentYear + "/08/12"),
        new Date(currentYear + "/08/25"),
        currentDate
      )
    ) {
      window.location.href = "/index";
    }
  };
}
function getBannerType() {
  var req = new XMLHttpRequest();
  req.open("GET", document.location, true);
  req.send(null);
  req.onload = function () {
    var headers = req.getResponseHeader("date");
    var currentDate = new Date(headers);
    var currentYear = currentDate.getFullYear();
    if (
      isDateBetween(
        new Date(currentYear + "/08/01"),
        new Date(currentYear + "/08/11"),
        currentDate
      )
    ) {
      $("#bannerContent").html(
        '<a href="./gservethestrays"><img class="popup-image" src="./images/mobone/offers/servethestrays.jpg" /></a><a href="#" class="close_popup"></a>'
      );
      //ServetheStrays
    } else if (
      isDateBetween(
        new Date(currentYear + "/08/12"),
        new Date(currentYear + "/08/25"),
        currentDate
      )
    ) {
      $("#bannerContent").html(
        '<a href="./thanks"><img class="popup-image" src="./images/mobone/offers/servethestrays.jpg" /></a><a href="#" class="close_popup"></a>'
      );
      //Thanks
    } else {
      $("#bannerContent").html(
        '<a href="./shop"><img class="popup-image" src="./images/mobone/offers/standard.png" /></a><a href="#" class="close_popup"></a>'
      );
      //Normal
    }

    $(".close_popup").on("click", () => {
      $("#base-index-popup").toggleClass("hide");
      $("#banner-popup").toggleClass("hide");
    });
  };
}

const tokenKeys = new Map();

tokenKeys.set("contactEmail", "97B54C2CEAD52824759A6EA7EA1DA");
tokenKeys.set("serveTheStraysEmail", "25CF6311DE4464C5B7617D7652F71");
tokenKeys.set("subscriptionEmail", "85XU7TVKX884FZ2CR39GWGIOGT19A");
tokenKeys.set("freeSampleEmail", "K19DBSMH2MEWPS96QV6AOVB6NWGB4");
