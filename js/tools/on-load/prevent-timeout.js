(function loadTool() {
  var thisTool = "prevent-timeout";
  chrome.storage.local.get(thisTool, function(settings) {
    detect_if_cp_site(function() {
      if (settings[thisTool]) {
        console.log("[CP Toolkit] Loading " + thisTool);
        try {
          function checkForTimeoutAndPrevent() {
            console.log("[CP Toolkit](" + thisTool + ") Checking for login timeout...");
            if (
              $(".cp-UIMessage-text")
                .text()
                .startsWith("You will be signed out in")
            ) {
              $(".cp-UIMessage-text")
                .find(".cp-Btn")
                .click();
              console.log("[CP Toolkit](" + thisTool + ") Login timeout prevented!");
            }
          }
          // Check every two minutes
          setInterval(checkForTimeoutAndPrevent, 2 * 1000 * 60);
        } catch (err) {
          console.warn(err);
        }
      }
    });
  });
})();
