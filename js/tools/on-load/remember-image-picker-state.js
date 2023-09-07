(function loadTool() {
  var thisTool = "remember-image-picker-state";
  chrome.storage.local.get(thisTool, function(settings) {
    if (settings[thisTool]) {
      console.log("[CP Toolkit] Loading " + thisTool);
      try {
        function ajaxPostBackStart(message) {
          jQuery(`<script>ajaxPostBackStart("` + message + `");</script>`).appendTo("body");
        }

        function ajaxPostBackEnd() {
          jQuery(`<script>ajaxPostBackEnd();</script>`).appendTo("body");
        }

        if ($(".t-pane").length) {
          // Start the spinner
          ajaxPostBackStart("[CP Toolkit] Opening previously-opened folder...");

          // Create a reference to localStorage
          var windowStorage = window.localStorage;

          // Get previously-opened folders
          var foldersToOpen = windowStorage.getItem("foldersToOpen");

          // Set an event handler to store opened folders when closing dialog
          window.onunload = function() {
            var foldersToOpen = [];
            jQuery(".t-state-selected")
              .parents(".t-item")
              .not(".t-first")
              .each(function() {
                foldersToOpen.push(
                  $(this)
                    .find("input")
                    .val()
                );
              });
            windowStorage.setItem("foldersToOpen", foldersToOpen);
          };

          // Function that waits until the spinner element ".t-loading" is not present
          waitForElementToUnload(".t-loading", function() {
            if (foldersToOpen !== null) {
              foldersToOpen = foldersToOpen.split(",");

              // First, check if the currently opened folder is the same as the one to open:
              var currentlyOpenedFolder = jQuery(".t-state-selected")
                .parents(".t-item")
                .first()
                .find("input")
                .val();

              // If not
              if (currentlyOpenedFolder !== foldersToOpen[0]) {
                console.log(
                  "[CP Toolkit](" +
                    thisTool +
                    ") Modal loaded. Found previously-opened folders with IDs: " +
                    foldersToOpen
                );

                // Subtract 1 for 0-index, then subtract 1 since we don't need to re-open the inital folder
                var currentFolder = foldersToOpen.length - 2;
                function openAllFolders() {
                  // If there is another folder to open
                  if (currentFolder >= 0) {
                    console.log(
                      "[CP Toolkit](" + thisTool + ") Opening folder with id: " + foldersToOpen[currentFolder]
                    );
                    openFolder(foldersToOpen[currentFolder], function() {
                      currentFolder--;
                      openAllFolders();
                    });
                  } else {
                    console.log("[CP Toolkit](" + thisTool + ") Finished opening folders.");
                    setTimeout(function() {
                      ajaxPostBackEnd();
                    }, 500);
                  }
                }
                openAllFolders(foldersToOpen);
              } else {
                console.log("[CP Toolkit](" + thisTool + ") Modal loaded. Already in correct folder.");
                ajaxPostBackEnd();
              }
            } else {
              ajaxPostBackEnd();
            }
          });

          function openFolder(id, callback) {
            watchPanelChange(callback);
            // First, click the folder
            waitForElementToLoad(".t-input[value='" + id + "']", function() {
              jQuery(".t-input[value='" + id + "']")
                .siblings(".t-in")
                .click();
            });
          }

          function waitForElementToUnload(selector, callback) {
            if ($(selector).length) {
              setTimeout(function() {
                waitForElementToUnload(selector, callback);
              }, 100);
            } else {
              callback();
            }
          }

          function waitForElementToLoad(selector, callback) {
            if ($(selector).length) {
              callback();
            } else {
              setTimeout(function() {
                waitForElementToLoad(selector, callback);
              }, 100);
            }
          }

          function watchPanelChange(callback) {
            var watchPanelTimeout = setTimeout(function() {
              console.log("[CP Toolkit](" + thisTool + ") Timed out. Not opening folders anymore");
              panelObserver.disconnect();
              ajaxPostBackEnd();
            }, 2000);
            var panelObserver = new MutationObserver(function(mutation) {
              clearTimeout(watchPanelTimeout);
              console.log("[CP Toolkit](" + thisTool + ") Folder has opened.");
              panelObserver.disconnect();
              callback();
            });
            panelObserver.observe($(".t-pane")[1], { childList: true, subtree: true });
          }
        } else {
          console.log("[CP Toolkit](" + thisTool + ") Not folder view.");
        }
      } catch (err) {
        console.warn(err);
      }
    }
  });
})();
