(function loadTool() {
  var thisTool = "enforce-advanced-styles-text-limits";
  chrome.storage.local.get(thisTool, function(settings) {
    var currentPage = window.location.pathname.toLowerCase();
    var isThemeManager = currentPage.startsWith("/designcenter/themes/");
    var isWidgetManager = currentPage.startsWith("/designcenter/widgets/");
    detect_if_cp_site(function() {
      if (settings[thisTool] && (isThemeManager || isWidgetManager)) {
        console.log("[CP Toolkit] Loading " + thisTool);
        try {
          if (isThemeManager) {
            // Override the initializePopovers function
            $("<script></script>")
              .html(
                `var originalInitializePopovers = initializePopovers;
                        initializePopovers = function() {
                            originalInitializePopovers();
                            var textAreas = $(".cpPopOver textarea");
                            textAreas.each(function() {
                                $(this).attr("maxlength", 1000);
                            });
                        }`
              )
              .appendTo("body");
          } else if (isWidgetManager) {
            // Widget Manager
            $("<script></script>")
              .html(
                `var oldInitOptionsModal = InitializeWidgetOptionsModal;
                        InitializeWidgetOptionsModal = function() {
                            oldInitOptionsModal();
                            $("#MiscAdvStyles").attr("maxlength", 255);
                        }`
              )
              .appendTo("body");
          }
        } catch (err) {
          console.warn(err);
        }
      }
    });
  });
})();
