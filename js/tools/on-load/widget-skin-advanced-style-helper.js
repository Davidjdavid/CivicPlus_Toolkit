(function loadTool() {
  var thisTool = "widget-skin-advanced-style-helper";
  chrome.storage.local.get(thisTool, function(settings) {
    detect_if_cp_site(function() {
      if (settings[thisTool] && window.location.pathname.toLowerCase().startsWith("/designcenter/themes/")) {
        console.log("[CP Toolkit] Loading " + thisTool);
        try {
          $("<script></script>")
            .html(
              `
                        function checkValidBracket_ts(text) {
                            if (text.indexOf("}") > text.indexOf("{") || ((text.indexOf("}") == -1) && (text.indexOf("{") !== -1))) {
                            	alert("Invalid CSS detected. You appear to be using a { before using a } in an advanced style. You must close the CMS-provided { before using a {.");
                            }
                            var numLeftBracket = 0;
                            var numRightBracket = 0;
                            for (var i = 0; i < text.length; i++) {
                                if (text[i] == "}") {
                                    numRightBracket++;
                                } else if (text[i] == "{") {
                                    numLeftBracket++;
                                }
                            }
                            var difference = Math.abs(numLeftBracket - numRightBracket);
                            if (numLeftBracket > numRightBracket) {
                                alert("Invalid CSS detected. You appear to have " + difference + " extra {.");
                            } else if (numLeftBracket < numRightBracket) {
                                alert("Invalid CSS detected. You appear to have " + difference + " extra }. Don't forget about the CMS-provided }.");
                            }
                        }
                        var originalInitializePopoversWS = initializePopovers;
                        initializePopovers = function() {
                            originalInitializePopoversWS();
                            // Only do widget skins
                            if ($(".cpPopOver #widgetSkinName").length) {
                                var skinId = $(".cpPopOver input#hdnSkinID").val();
                                if (skinId !== "-1") {
                                    console.log("[CP Toolkit](` +
                thisTool +
                `) Editing skin " + skinId);
                                    // Wait for the focus to be applied
                                    setTimeout(function() {
                                        // Get the components that should be focused
                                        var shouldBeFocused = $(".skin" + skinId + " .focused");
                                        // Remove focuse from the elements that should not be focused.
                                        $(".focused").not(shouldBeFocused).removeClass("focused");
                                    }, 500);
                                    var textAreas = $(".cpPopOver [id*='MiscellaneousStyles']");
                                    textAreas.each(function() {
                                        var existingChangeFn = $._data(this).events.change[0].handler;
                                        var text = $(this).val();
                                        text = text.replace(/.skin[0-9]+/g, ".skin" + skinId);
                                        $(this).val(text);
                                        $(this).change(function() {
                                            var originalText = $(this).text();
                                            var text = $(this).val().replace(/.skin[0-9]+/g, ".skin" + skinId);
                                            if (text !== originalText) {
                                                $(this).val(text);
                                                existingChangeFn();
                                            }
                                            checkValidBracket_ts(text);
                                        });
                                    });
                                } else {
                                    console.log("[CP Toolkit](` +
                thisTool +
                `) Editing new skin.");
                                    var textAreas = $(".cpPopOver [id*='MiscellaneousStyles']");
                                    textAreas.each(function() {
                                        $(this).change(function() {
                                            var text = $(this).val();
                                            var skinRegEx = /.skin[0-9]+/g;
                                            if (skinRegEx.test(text)) {
                                                alert("It looks like you used a widget skin number in the advanced styles for this skin. Because this skin has not been saved it does not yet have a number. Please edit this portion of the skin again after saving for the advanced style to take effect.");
                                            }
                                            checkValidBracket_ts(text);
                                        });
                                    });
                                }
                            }
                        }`
            )
            .appendTo("body");
        } catch (err) {
          console.warn(err);
        }
      }
    });
  });
})();
