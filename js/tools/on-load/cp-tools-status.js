(function loadTool() {
  var thisTool = "cp-tools-status";
  chrome.storage.local.get(thisTool, function(settings) {
    detect_if_cp_site(function() {
      if (settings[thisTool]) {
        console.log("[CP Toolkit] Loading " + thisTool);
        try {
          $.get("https://uitools.civicplus.com/toolkit-status.php?domain=" + document.location.hostname, function(
            result
          ) {
            if (result) {
              var siteIds = {};

              $.each(result, function(resultItem) {
                if (!(result[resultItem].siteID in siteIds)) {
                  siteIds[result[resultItem].siteID] = result[resultItem].status;
                }
              });

              var statusToUse;

              if (Object.keys(siteIds).length > 1) {
                console.warn("[CP Toolkit](" + thisTool + ") This domain is associated with multiple site IDs.");
                statusToUse = "Unknown";
                linkToUse =
                  "javascript:alert('This domain is associated with multiple sites. Attempting to open CP Tools for all of them. You may have to allow popups.');";
                $.each(siteIds, function(key, value) {
                  linkToUse += "window.open('https://cptools.civicplus.com/Home/SiteDetails/" + key + "');";
                  console.log("[CP Toolkit](" + thisTool + ") Site Status: " + key + ", Site ID: " + value);
                });
              } else {
                $.each(siteIds, function(key, value) {
                  console.log("[CP Toolkit](" + thisTool + ") Site Status: " + key + ", Site ID: " + value);
                  statusToUse = value;
                  linkToUse = "https://cptools.civicplus.com/Home/SiteDetails/" + key;
                });
              }

              var retry = 10; // Retry for 10 seconds
              function waitForAdminBar() {
                if ($(".cp-Toolbar-items--right").length) {
                  if (statusToUse == "In Production/Development") {
                    statusToUse = "In Production";
                  }
                  $(".cp-Toolbar-items--right").append(
                    `<div class="cp-Toolbar-item cp-Toolbar-item--wide cp-SiteStatus">
                                        <a title="Visit CP Tools for this site" class="cp-Toolbar-itemLink" style="text-align: center;" target="_blank" href="` +
                      linkToUse +
                      `"><span>Status: &nbsp;</span>` +
                      statusToUse +
                      `</a>
                                    </div>`
                  );
                } else {
                  if (retry >= 0) {
                    setTimeout(function() {
                      waitForAdminBar();
                    }, 1000);
                    retry--;
                  } else {
                    console.log("[CP Toolkit](" + thisTool + ") Admin bar not detected.");
                  }
                }
              }
              waitForAdminBar();
            }
          });
        } catch (err) {
          console.warn(err);
        }
      }
    });
  });
})();
