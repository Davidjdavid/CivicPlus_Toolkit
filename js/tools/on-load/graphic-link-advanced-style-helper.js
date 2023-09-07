(function loadTool() {
  var thisTool = "graphic-link-advanced-style-helper";
  chrome.storage.local.get(thisTool, function(settings) {
    detect_if_cp_site(function() {
      if (settings[thisTool] && window.location.pathname.toLowerCase().startsWith("/admin/graphiclinks.aspx")) {
        console.log("[CP Toolkit] Loading " + thisTool);
        try {
          $(document).ready(function() {
            $(
              "<script>" +
                `
                            // Confirm we are on a add/modify link page
                            if ($(".actions").length) {

                                // Reference old click handler
                                var oldModifyButtonFunction = $._data($(".modify")[0], "events").click[0].handler;

                                function newModifyButtonFunction() {

                                    console.log("[CP Toolkit](` +
                thisTool +
                `) Successfully binded to modify function.");

                                    // Bring up the editor
                                    oldModifyButtonFunction();

                                    // Disable the fake transitions
                                    $("link[href='/Areas/GraphicLinks/Assets/Styles/FancyButtonEditor.css']").remove();

                                    // Get the actual selector
                                    var currentButtonStyleSelector;
                                    if ($(".fancyButtonContainer a.fancyButton").length) {
                                        currentButtonStyleSelector = $(".fancyButtonContainer a.fancyButton").attr("class").split(" ")[1];
                                    } else {
                                        currentButtonStyleSelector = "fancyButton1";
                                    }

                                    console.log("[CP Toolkit](` +
                thisTool +
                `) This button is " + currentButtonStyleSelector);

                                    // Replace all of the selectors with one that will work in the editor
                                    $("textarea.autoUpdate").each(function() {
                                        // Add a message
                                        if (currentButtonStyleSelector == "fancyButton1") {
                                            $(this).parent().prepend("<p style='color: red;'><i>This button doesn't appear to have been saved yet. If closing the brackets, edit and save the button again for the styles to take effect.</i></p>")
                                        }
                                        $(this).parent().prepend("<p>[CP Toolkit] <i>Use .fancyButton1 as a selector if closing the brackets.</i></p>");
                                        var text = $(this).val();
                                        text = text.replace(/fancyButton[0-9]+/g, "fancyButton1");
                                        $(this).val(text);
                                        $(this).change();
                                    });

                                    // Reference old click handler for insert button
                                    var oldInsertFancyButtonFunction = $._data($(".insertFancy")[0], "events").click[0].handler;

                                    // Create new click handler for insert button
                                    function newInsertFancyButton(e) {
                                        console.log("[CP Toolkit](` +
                thisTool +
                `) Successfully binded to insert function.")
                                        $("textarea.autoUpdate").each(function() {
                                            var text = $(this).val();
                                            text = text.replace(/fancyButton[0-9]+/g, currentButtonStyleSelector);
                                            $(this).val(text);
                                            $(this).change();
                                        });

                                        oldInsertFancyButtonFunction(e);

                                        // Fix the selector
                                        var newClass = $(".fancyButtonContainer a.fancyButton").attr("class").replace(new RegExp("fancyButton1", "g"), currentButtonStyleSelector);
                                        $(".fancyButtonContainer a.fancyButton").attr("class", newClass);
                                    }

                                    // Unbind old click handler and bind new one for insert button
                                    $(".insertFancy").unbind("click").click(newInsertFancyButton);

                                }
                                // Unbind old click handler and bind new one for modify
                                $(".modify").unbind("click").click(newModifyButtonFunction);
                                $(".fancyButtonContainer").unbind("click").click(newModifyButtonFunction);
                                $("#insertFancyButton").unbind("click").click(newModifyButtonFunction);
                            }
                        ` +
                "</script>"
            ).appendTo("body");
          });
        } catch (err) {
          console.warn(err);
        }
      }
    });
  });
})();
