(function loadTool() {
  var thisTool = "xml-change-alerts";
  chrome.storage.local.get(thisTool, function(settings) {
    detect_if_cp_site(function() {
      if (
        settings[thisTool] &&
        window.location.pathname.toLowerCase().startsWith("/admin/designcenter/layouts/modify")
      ) {
        console.log("[CP Toolkit] Loading " + thisTool);
        try {
          function arrayDiff(oldArray, newArray) {
            return oldArray.filter(function(i) {
              return newArray.indexOf(i) < 0;
            });
          }

          // Add an area for alerts
          $("#structureFile")
            .parent()
            .append("<div id='toolkitAlert'></div>");

          var originalXml = $("code").text();

          // Check for malformed XML on the original XML
          $(originalXml)
            .find("*[cpRole='contentContainer']")
            .each(function() {
              if ($(this).children().length) {
                var badIds = "";
                $(this)
                  .children()
                  .each(function() {
                    badIds += this.id + "\n";
                  });
                alert(
                  "The current XML is malformed:\n\n" +
                    this.id +
                    " is a content container that contains additional elements. Content containers should not contain any elements. Please change this to a structural container or remove the following elements from this container: \n\n" +
                    badIds +
                    "\nIf you continue to use this XML, you may run into unexpected issues, such as 404 errors when saving the theme."
                );
              }
            });

          // Monitor for alerts on save and do an alert box instead
          $("#ErrorMessage").bind("DOMSubtreeModified", function(e) {
            if (e.target.innerHTML.length > 0) {
              alert(
                $("#ErrorMessage")
                  .text()
                  .trim()
              );
            }
          });

          // Move breakpoint and error message up
          $("ol.cpForm > li.left:nth-child(4)").after($("#mainMenuBreakpoint").parents("li.left"));
          $("ol.cpForm > li.left:nth-child(5)").after($("#ErrorMessage").parents("li.left"));

          // Add button to view layout page
          var pagesUrl = "/Pages/LayoutPage/?name=" + $("#txtStructureName").val();
          var pagesLink = $(
            "<li><a class='button bigButton nextAction' href='" + pagesUrl + "'><span>View Layout Page</span></a></li>"
          );
          $(".buttons li a.save")
            .parent("li")
            .after(pagesLink);

          // Add title to auto-save button for help text
          $("#autoSaveThemeStyles").attr("title", "Rebuilds the CSS for all themes that use this layout.");

          $("#structureFile").change(function() {
            var file = $("#structureFile")[0].files[0];
            if (typeof file != "undefined") {
              console.log("[CP Toolkit](" + thisTool + ") Change detected, checking for differences.");
              var reader = new FileReader();
              reader.readAsText(file);
              reader.onloadend = function(e) {
                var data = e.target.result;
                var newXml = data.replace(/[\s\S]+<\?xml/, "<?xml");

                // Get all of the ID's from each
                var originalIds = [];
                var newIds = [];

                $(originalXml)
                  .find("*")
                  .each(function() {
                    if (this.id != "") {
                      originalIds.push(this.id);
                    }
                  });
                $(newXml)
                  .find("*")
                  .each(function() {
                    if (this.id != "") {
                      newIds.push(this.id);
                    }
                  });

                originalIds = originalIds.sort();
                newIds = newIds.sort();

                var differences = arrayDiff(originalIds, newIds);
                var differenceString = "";

                if (differences.length) {
                  $(differences).each(function(index, value) {
                    if (differenceString == "") {
                      differenceString += value;
                    } else {
                      differenceString += ", " + value;
                    }
                  });
                  $("#toolkitAlert")
                    .html(
                      "Warning: There are containers in the old XML that are not in the new XML. This will cause any widgets or styles applied to the following to be lost:<br><br>" +
                        differenceString
                    )
                    .css("color", "red");
                  $("a.button.save")
                    .css("background-color", "#B33A3A")
                    .css("border-bottom-color", "#792327")
                    .css("color", "#fff");
                  $("a.button.save span").text("Save ignoring XML warning");
                } else {
                  $("#toolkitAlert")
                    .text("This XML has all the containers that the old XML had.")
                    .css("color", "green");
                  $("a.button.save")
                    .css("background-color", "")
                    .css("border-bottom-color", "")
                    .css("color", "");
                  $("a.button.save span").text("Save");
                }

                // Check for malformed XML
                $(newXml)
                  .find("*[cpRole='contentContainer']")
                  .each(function() {
                    if ($(this).children().length) {
                      var badIds = "";
                      $(this)
                        .children()
                        .each(function() {
                          badIds += this.id + "\n";
                        });
                      alert(
                        "The chosen XML is malformed:\n\n" +
                          this.id +
                          " is a content container that contains additional elements. Content containers should not contain any elements. Please change this to a structural container or remove the following elements from this container: \n\n" +
                          badIds +
                          "\nIf you continue to use this XML, you may run into unexpected issues, such as 404 errors when saving the theme."
                      );
                    }
                  });
              };
            } else {
              console.log("[CP Toolkit](" + thisTool + ") No file picked.");
              $("#toolkitAlert").text("");
            }
          });
        } catch (err) {
          console.warn(err);
        }
      }
    });
  });
})();
