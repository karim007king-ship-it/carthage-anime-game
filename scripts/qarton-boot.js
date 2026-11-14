(function(){
  "use strict";
  if (window.__qartonBootInstalled) return;
  window.__qartonBootInstalled = true;

  var html = document.documentElement;
  var state = "TRANSITION";
  var ready = false;
  var timeout = 0;

  function publish(next) {
    if (next !== "HOME" && next !== "GAME") return false;
    state = next;
    ready = true;
    html.classList.remove("qarton-booting", "qarton-transitioning");
    html.dataset.qartonState = state;
    if (document.body) document.body.dataset.qartonState = state;
    html.removeAttribute("data-qarton-boot-error");
    window.clearTimeout(timeout);
    window.dispatchEvent(new CustomEvent("qarton:statechange", { detail: { state: state } }));
    return true;
  }

  html.classList.add("qarton-booting");
  html.dataset.qartonState = state;
  window.__qartonGetState = function(){ return state; };
  window.__qartonPublishReady = publish;

  window.addEventListener("qarton:ready", function(event) {
    var next = event && event.detail && event.detail.state;
    publish(next);
  });

  // Cover the old menu before React receives the start action. The cover is
  // removed only after the QARTON runtime confirms the destination screen.
  document.addEventListener("click", function(event) {
    var target = event.target;
    var button = target && target.closest ? target.closest("button") : null;
    if (!button || button.disabled || !button.closest(".home-actions")) return;
    var label = (button.textContent || "").trim();
    if (!/ابدأ|الجزء/.test(label)) return;
    state = "TRANSITION";
    ready = false;
    html.classList.add("qarton-transitioning");
    html.dataset.qartonState = state;
    html.removeAttribute("data-qarton-boot-error");
    window.clearTimeout(timeout);
    timeout = window.setTimeout(function() {
      if (state !== "TRANSITION") return;
      html.dataset.qartonBootError = "true";
      window.dispatchEvent(new CustomEvent("qarton:transition-timeout"));
    }, 15000);
  }, true);

  timeout = window.setTimeout(function() {
    if (state !== "TRANSITION") return;
    html.dataset.qartonBootError = "true";
    window.dispatchEvent(new CustomEvent("qarton:boot-timeout"));
  }, 15000);
})();