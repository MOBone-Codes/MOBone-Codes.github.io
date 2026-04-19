/* Configure these values before publishing. */
window.GOOGLE_REVIEWS_CONFIG = window.GOOGLE_REVIEWS_CONFIG || {
  apiKey: "",
  placeId: "",
  businessQuery: "Palm Paw Foods India Pvt Ltd Chennai",
  maxReviews: 6,
};

(function () {
  "use strict";

  var config = window.GOOGLE_REVIEWS_CONFIG || {};
  var statusEl = document.getElementById("google-reviews-status");
  var listEl = document.getElementById("google-reviews-list");
  var summaryEl = document.getElementById("google-reviews-summary");
  var writeBtn = document.getElementById("write-review-btn");
  var writeNote = document.getElementById("write-review-note");
  var globalWatchdog = null;

  function setStatus(message, isError) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.classList.toggle("text-danger", !!isError);
    statusEl.classList.toggle("text-muted", !isError);
  }

  function escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function starsHtml(rating) {
    var rounded = Math.round(Number(rating) || 0);
    var out = "";
    for (var i = 1; i <= 5; i += 1) {
      out += i <= rounded
        ? '<i class="fa fa-star text-warning"></i>'
        : '<i class="fa fa-star-o text-warning"></i>';
    }
    return out;
  }

  function setWriteReviewLink(placeId, placeUrl) {
    if (!writeBtn) return;
    if (placeId) {
      writeBtn.href = "https://search.google.com/local/writereview?placeid=" + encodeURIComponent(placeId);
      writeBtn.removeAttribute("aria-disabled");
      writeBtn.classList.remove("disabled");
      return;
    }
    if (placeUrl) {
      writeBtn.href = placeUrl;
      writeBtn.removeAttribute("aria-disabled");
      writeBtn.classList.remove("disabled");
      return;
    }

    writeBtn.href = "#";
    writeBtn.setAttribute("aria-disabled", "true");
    writeBtn.classList.add("disabled");
    if (writeNote) {
      writeNote.textContent = "Add your Google API key/place details to enable posting.";
    }
  }

  function renderSummary(place) {
    if (!summaryEl || !place) return;
    var rating = Number(place.rating || 0).toFixed(1);
    var total = Number(place.user_ratings_total || 0);
    summaryEl.innerHTML =
      "<strong>" + escapeHtml(place.name || "Business") + "</strong><br>" +
      starsHtml(place.rating) + " <strong>" + rating + "/5</strong> from " + total + " Google ratings";
    summaryEl.style.display = "inline-block";
  }

  function renderReviews(reviews) {
    if (!listEl) return;
    listEl.innerHTML = "";

    if (!reviews || !reviews.length) {
      setStatus("No Google reviews were returned for this place.", false);
      return;
    }

    var max = Number(config.maxReviews || 6);
    reviews.slice(0, max).forEach(function (review) {
      var col = document.createElement("div");
      col.className = "col-sm-12 col-md-6 col-lg-4 mb-4";

      var card = document.createElement("div");
      card.className = "p-3 h-100";
      card.style.border = "1px solid #eee";
      card.style.borderRadius = "10px";
      card.style.backgroundColor = "#fff";

      var author = escapeHtml(review.author_name || "Google User");
      var text = escapeHtml(review.text || "");
      var relative = escapeHtml(review.relative_time_description || "");
      var authorUrl = review.author_url ? String(review.author_url) : "";

      card.innerHTML =
        '<div class="mb-2"><strong>' + author + "</strong></div>" +
        '<div class="mb-2">' + starsHtml(review.rating) + "</div>" +
        '<p class="mb-2">' + text + "</p>" +
        '<small class="text-muted">' + relative + "</small>" +
        (authorUrl ? '<div class="mt-2"><a target="_blank" rel="noopener noreferrer" href="' + authorUrl + '">View profile</a></div>' : "");

      col.appendChild(card);
      listEl.appendChild(col);
    });

    setStatus("");
  }

  function loadGoogleMapsApi(apiKey) {
    return new Promise(function (resolve, reject) {
      if (window.google && window.google.maps && window.google.maps.places) {
        resolve();
        return;
      }

      var isDone = false;
      var timer = setTimeout(function () {
        if (isDone) return;
        isDone = true;
        reject(
          new Error(
            "Google Maps API did not respond. Check API key, Places API enablement, and key restrictions."
          )
        );
      }, 12000);

      window.__moboneGooglePlacesReady = function () {
        if (isDone) return;
        isDone = true;
        clearTimeout(timer);
        resolve();
      };

      window.gm_authFailure = function () {
        if (isDone) return;
        isDone = true;
        clearTimeout(timer);
        reject(new Error("Google Maps authentication failed. Check your API key and referrer settings."));
      };

      var script = document.createElement("script");
      script.src =
        "https://maps.googleapis.com/maps/api/js?key=" +
        encodeURIComponent(apiKey) +
        "&libraries=places&callback=__moboneGooglePlacesReady";
      script.async = true;
      script.defer = true;
      script.onerror = function () {
        if (isDone) return;
        isDone = true;
        clearTimeout(timer);
        reject(new Error("Failed to load Google Maps JavaScript API."));
      };
      document.head.appendChild(script);
    });
  }

  function findPlace(service) {
    return new Promise(function (resolve, reject) {
      if (config.placeId) {
        resolve({ place_id: config.placeId });
        return;
      }

      var query = config.businessQuery || "";
      if (!query) {
        reject(new Error("Missing placeId and businessQuery in GOOGLE_REVIEWS_CONFIG."));
        return;
      }

      var finished = false;
      var timer = setTimeout(function () {
        if (finished) return;
        finished = true;
        reject(new Error("Timed out while searching for the Google place."));
      }, 10000);

      service.findPlaceFromQuery(
        {
          query: query,
          fields: ["place_id", "name"],
        },
        function (results, status) {
          if (finished) return;
          finished = true;
          clearTimeout(timer);
          if (
            status !== window.google.maps.places.PlacesServiceStatus.OK ||
            !results ||
            !results.length
          ) {
            reject(new Error("Could not find place from query."));
            return;
          }
          resolve(results[0]);
        }
      );
    });
  }

  function findPlaceByQueryOnly(service) {
    return new Promise(function (resolve, reject) {
      var query = config.businessQuery || "";
      if (!query) {
        reject(new Error("Missing businessQuery in GOOGLE_REVIEWS_CONFIG."));
        return;
      }

      var finished = false;
      var timer = setTimeout(function () {
        if (finished) return;
        finished = true;
        reject(new Error("Timed out while searching by businessQuery."));
      }, 10000);

      service.findPlaceFromQuery(
        {
          query: query,
          fields: ["place_id", "name"],
        },
        function (results, status) {
          if (finished) return;
          finished = true;
          clearTimeout(timer);
          if (
            status !== window.google.maps.places.PlacesServiceStatus.OK ||
            !results ||
            !results.length
          ) {
            reject(new Error("Query lookup failed with status: " + status));
            return;
          }
          resolve(results[0]);
        }
      );
    });
  }

  function getPlaceDetails(service, placeId) {
    return new Promise(function (resolve, reject) {
      var finished = false;
      var timer = setTimeout(function () {
        if (finished) return;
        finished = true;
        reject(new Error("Timed out while loading Google place details."));
      }, 10000);

      service.getDetails(
        {
          placeId: placeId,
          fields: ["name", "rating", "user_ratings_total", "url", "reviews", "place_id"],
        },
        function (place, status) {
          if (finished) return;
          finished = true;
          clearTimeout(timer);
          if (status !== window.google.maps.places.PlacesServiceStatus.OK || !place) {
            reject(new Error("Could not load Google place details. Status: " + status));
            return;
          }
          resolve(place);
        }
      );
    });
  }

  function init() {
    if (!config.apiKey) {
      setStatus("Add your Google Places API key in js/google-reviews.js to load live reviews.", true);
      setWriteReviewLink(config.placeId, "");
      return;
    }

    setStatus("Loading Google reviews...", false);
    globalWatchdog = setTimeout(function () {
      setStatus(
        "Still loading. Check Google API key restrictions, Places API enablement, and billing on this key.",
        true
      );
    }, 20000);

    loadGoogleMapsApi(config.apiKey)
      .then(function () {
        var helper = document.getElementById("google-place-helper-map");

        // A real map instance is more reliable across browsers than passing a plain div.
        var map = new window.google.maps.Map(helper, {
          center: { lat: 13.0827, lng: 80.2707 },
          zoom: 12,
        });
        var service = new window.google.maps.places.PlacesService(map);
        return findPlace(service).then(function (placeSeed) {
          return getPlaceDetails(service, placeSeed.place_id).catch(function () {
            // If configured placeId is stale/wrong, retry with fresh query lookup.
            return findPlaceByQueryOnly(service).then(function (freshPlace) {
              return getPlaceDetails(service, freshPlace.place_id);
            });
          });
        });
      })
      .then(function (place) {
        if (globalWatchdog) clearTimeout(globalWatchdog);
        renderSummary(place);
        renderReviews(place.reviews || []);
        setWriteReviewLink(place.place_id, place.url);
      })
      .catch(function (error) {
        if (globalWatchdog) clearTimeout(globalWatchdog);
        setStatus(error.message || "Failed to load Google reviews.", true);
        setWriteReviewLink(config.placeId, "");
      });
  }

  try {
    init();
  } catch (error) {
    setStatus("Review script failed to initialize: " + (error.message || "Unknown error"), true);
  }
})();
