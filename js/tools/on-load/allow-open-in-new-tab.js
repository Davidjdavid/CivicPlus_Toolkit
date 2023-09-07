(function loadTool() {
  var thisTool = "allow-open-in-new-tab";
  chrome.storage.local.get(thisTool, function(settings) {
    detect_if_cp_site(function() {
      if (settings[thisTool] && window.location.pathname.toLowerCase().startsWith("/admin/")) {
        console.log("[CP Toolkit] Loading " + thisTool);
        try {
          var moduleReferrer = window.location.pathname.toLowerCase().replace("/admin/", "");
          $(document).ready(function() {
            // Replace divs with onclicks with links
            $(".classicItems div[onclick]").each(function() {
              this.outerHTML = this.outerHTML.replace("<div ", "<a href ").replace("</div>", "</a>");
            });

            // Find links with onclicks
            $("a[onclick]").each(function() {
              var $this = $(this);
              var onclick = $this.attr("onclick");
              var onclickFunction = onclick.split("(")[0];
              var href = $this.attr("href");

              switch (onclickFunction) {
                // Outermost, Category View
                case "categoryDetails": // Quick Links
                case "displayItemList": //
                case "CallAlertCategoryDetail": // News Flash
                case "ModifyArchiveMaster": // Archives
                case "BidCategoryModifyDelete": // Bids
                case "CategoryModifyDelete": // Forms
                case "ModifyBlogCategory": // Blog
                case "FAQTopicModifyDelete": // FAQ's
                case "NotifyMeListAction": // Notify Me
                case "PollCategoryModifyDelete": // Opinion Polls
                case "editPhoto": // Photo Gallery
                case "goToSellerProperties": // Real Estate Locator
                case "CRMCategoryModifyDelete": // Request Tracker
                case "dirDetail": // Resource Directory
                  if (href == "" || href == "#") {
                    var newHref =
                      "/Admin/Classic.aspx?fromURL=" + moduleReferrer + "&toolkitRunfn=" + encodeURIComponent(onclick);
                    $this.attr("href", newHref);
                  } else {
                    console.log("[CP Toolkit](" + thisTool + ") Link already has href (" + href + "), it was skipped.");
                  }
                  break;

                // Link view from category view
                case "linkDetails":
                  if (href == "") {
                    // Since this is a nested function, bring over supporting functions
                    // Put function in input that we can access
                    $(
                      '<script>$(\'<input id="toolkit-aoint-fn" type="hidden"></input>\').appendTo("body");$("#toolkit-aoint-fn").val(linkDetails.toString());</script>'
                    ).appendTo("body");
                    // Get it
                    var supportFn = $("#toolkit-aoint-fn").val();

                    // We also need to get the form it submits
                    // Get the name of the form from the function in case it changes
                    var formElement = supportFn.split("theForm = document.")[1].split(";")[0];

                    // The function itself is too big to transport, so make a more efficient one:
                    supportFn =
                      `function linkDetails(id,el){theForm=document.` +
                      formElement +
                      `; theForm.strAction.value='qlLinkModify';theForm.ysnSave.value=0; theForm.ysnCopy.value=0;theForm.intQLLinkID.value=id;theForm.submit();}`;

                    $(
                      '<script>$("#toolkit-aoint-fn").val($("form[name=' + formElement + ']")[0].outerHTML);</script>'
                    ).appendTo("body");
                    var formHtml = $("#toolkit-aoint-fn").val();

                    var appendFormFunction = '$("body").append(`' + formHtml + "`);";

                    // Remove input
                    $('<script>$("#toolkit-aoint-fn").remove();</script>').appendTo("body");

                    var newHref =
                      "/Admin/Classic.aspx?fromURL=" +
                      moduleReferrer +
                      "&toolkitRunfn=" +
                      encodeURIComponent(supportFn) +
                      encodeURIComponent(appendFormFunction) +
                      encodeURIComponent(onclick);
                    $this.attr("href", newHref);
                    // Make graphic buttons behave as expected
                    $this
                      .parent("td")
                      .find("a.fancyButton")
                      .attr("href", newHref)
                      .attr("onclick", onclick);
                  } else {
                    console.log("[CP Toolkit](" + thisTool + ") Link already has href (" + href + "), it was skipped.");
                  }
                  break;

                // Alert view from category view
                case "CallAlertDetail": // News Flash
                case "ModifyArchiveItem": // Archives
                case "ModifyBidItem": // Bids
                case "ModifyBlogItem": // Blog
                case "editEvent": // Calendar
                case "FAQQuestionModifyDelete": // FAQ's
                case "FormModifyDelete": // Forms
                case "CallPollDetail": // Polls
                  // Not yet implemented
                  if (href == "") {
                    console.log(
                      "CP Toolkit](" + thisTool + ') Handler "' + onclickFunction + '" is not yet implemented.'
                    );
                  } else {
                    console.log("[CP Toolkit](" + thisTool + ") Link already has href (" + href + "), it was skipped.");
                  }
                  break;

                default:
                  console.log(
                    "[CP Toolkit](" + thisTool + ') "' + onclickFunction + '" is not a recognized onclick function.'
                  );
                  break;
              }
            });
          });

          if (document.referrer.indexOf("toolkitRunfn") !== -1) {
            $(document).ready(function() {
              var encodedFn = qsReferrer("toolkitRunfn");
              var fnToRun = decodeURIComponent(encodedFn).replace("return false;", "");
              console.log(
                "[CP Toolkit](" +
                  thisTool +
                  ") Detected page opened in new tab. Running function below to return state:"
              );
              console.log(fnToRun);
              $("body").append(
                "<script>ajaxPostBackStart('[CP Toolkit] Detected a page opened in a new tab. Redirecting to correct page...');" +
                  fnToRun +
                  "</script>"
              );
            });
          }

          /* From https://stackoverflow.com/a/7732379 modified to use referrer */
          function qsReferrer(key) {
            key = key.replace(/[*+?^$.\[\]{}()|\\\/]/g, "\\$&");
            var match = document.referrer.match(new RegExp("[?&]" + key + "=([^&]+)(&|$)"));
            return match && decodeURIComponent(match[1].replace(/\+/g, " "));
          }
        } catch (err) {
          console.warn(err);
        }
      }
    });
  });
})();
