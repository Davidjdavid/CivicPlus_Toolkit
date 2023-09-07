(function loadTool() {
  var thisTool = "cp-ImportFancyButton";
  chrome.storage.local.get(thisTool, function(settings) {
    detect_if_cp_site(function() {
      if (settings[thisTool]) {
        console.log("[CP Toolkit] Loading " + thisTool);
        try {
          if (
            $("input[value*='Add Item']").length &&
            window.location.pathname.toLowerCase() == "/admin/graphiclinks.aspx"
          ) {
            var importItem = $(
              '<input type="button" style="background-color: #d3d657;border-bottom-color: #b3b64a;color: #333;margin-left: 5px;" class="cp-button" value="Import Item">'
            );
            var thisButtonSection = $("input[value*='Add Item']");
            thisButtonSection.after(importItem[0]);
            importItem.click(function() {
              var data = prompt("Paste here: ", "");
              console.log("Generating Fancy Button...");
              if (data === null) {
              } else {
                var ajaxLoad =
                  'ajaxPostBackStart("Generating Fancy Button...");$("#divAjaxProgress").clone().attr("id", "toolkit-block").css("display", "block").appendTo("body");ajaxPostBackEnd();';
                var script = document.createElement("script");
                script.innerHTML = ajaxLoad;
                document.body.appendChild(script);
                $.ajax({
                  type: "POST",
                  url: "/GraphicLinks/GraphicLinkSave",
                  data: data.replace(
                    '"categoryID":"0"',
                    '"categoryID": "' + document.getElementsByName("intQLCategoryID")[0].value + '"'
                  ),
                  contentType: "application/json"
                }).done(function() {
                  document.getElementById("toolkit-block").style.display = "none";
                  location.reload();
                });
              }
            });
          }
        } catch (err) {
          console.warn(err);
        }
      }
    });
  });
})();
