(function loadTool() {
  var thisTool = "";
  chrome.storage.local.get(thisTool, function(settings) {
    detect_if_cp_site(function() {
      if (settings[thisTool]) {
        console.log("[CP Toolkit] Loading " + thisTool);
        try {
        } catch (err) {
          console.warn(err);
        }
      }
    });
  });
})();
