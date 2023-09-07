(function loadTool() {
  var thisTool = "theme-manager-enhancer";
  chrome.storage.local.get(thisTool, function(settings) {
    detect_if_cp_site(function() {
      if (settings[thisTool]) {
        var currentPage = window.location.pathname.toLowerCase();
        try {
          if (currentPage.startsWith("/designcenter/themes/")) {
            console.log("[CP Toolkit] Loading " + thisTool);
            $(`
                            <style id="cp-tookit_theme-manager-enhancer">
                            /* Change outline when focused in exploded view */
                            .exploded [data-cprole$="Container"].focused {
                                outline-style: dashed !important;
                            }
                            /* Unfix stickyStructural on exploded view */
                            .exploded .stickySticky {
                                position: relative;
                                top: auto !important;
                            }
                            /* Fix padding when unfixed stickySticky on exploded view */
                            .exploded #bodyWrapper {
                                padding-top: 47px !important;
                            }
                            /* Fix z-index issue with stickyStructural hover (caused by cpComponent hover z-index) */
                            .stickyStructuralContainer.stickySticky:hover, .stickyStructuralContainer.stickyCollapsed:hover {
                                z-index: 100;
                            }
                            /* Fix Widget Skin cut-off */
                            .modalContainer.modalContainerCP.manageWidgetSkins .cpForm>li .status {
                                position: static;
                            }
                            .modalContainer.modalContainerCP.manageWidgetSkins .cpForm>li .status:before {
                                content: "The skin above is "
                            }
                            .modalContainer.modalContainerCP.manageWidgetSkins .cpForm>li input[type=text] {
                                padding-right: .5rem !important;
                            }
                            .currentWidgetSkins li.rename[data-active="False"] input {
                                background: #DDD;
                            }
                            /* Fix horizontal scroll bar (don't negative position first structuralContainer when exploded) */
                            .exploded #bodyWrapper > .structuralContainer:before {
                                left: 0 !important;
                                right: 0 !important;
                            }
                            /* Fix horizontal scroll bar (don't negative position cpComponents unless exploded) */
                            body:not(.exploded) .cpComponent:before {
                                left: 0 !important;
                                right: 0 !important;
                            }
                            </style>
                            `).appendTo("body");
          }
          if (
            currentPage.startsWith("/designcenter/themes/") ||
            currentPage.startsWith("/designcenter/widgets/") ||
            currentPage.startsWith("/designcenter/animations/")
          ) {
            console.log("[CP Toolkit] Loading " + thisTool);
            console.log("[CP Toolkit](" + thisTool + ") " + "Adding Layout Manager to dropdown.");
            var currentViewSelect = $(".cpToolbar select#currentView");
            if (currentViewSelect.length) {
              var layoutManagerOption = $(`<option value="Layouts">Layout Manager</option>`);
              $(".cpToolbar select#currentView").append(layoutManagerOption);
              currentViewSelect.change(function() {
                if ($(this).val() == "Layouts") {
                  window.location.href = "/Admin/DesignCenter/Layouts";
                }
              });
            }
          }
        } catch (err) {
          console.warn(err);
        }
      }
    });
  });
})();
