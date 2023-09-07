(function loadTool() {
  var thisTool = "download-xml-css";
  chrome.storage.local.get(thisTool, function(settings) {
    detect_if_cp_site(function() {
      if (settings[thisTool] && window.location.pathname.toLowerCase() == "/admin/designcenter/layouts") {
        console.log("[CP Toolkit] Loading " + thisTool);
        try {
          // If fontawesome isn't loaded, load it
          (function() {
            if ($("#fontawesome_css").length == 0) {
              var css = document.createElement("link");
              css.id = "fontawesome_css";
              css.href = chrome.extension.getURL("/css/external/fontawesome-all.min.css");
              css.rel = "stylesheet";
              css.type = "text/css";
              document.getElementsByTagName("head")[0].appendChild(css);
            }
          })();

          $("body").append(`<style>
                        .downloadXML, .downloadCSS {
                            line-height: 33px;
                            font-size: .75rem;
                            font-weight: 400 !important;
                            position: absolute;
                            top: 4px;
                        }
                        .downloadXML {
                            right: 221px;
                        }
                        .downloadCSS {
                            right: 120px;
                        }
                        .downloadXML .fa, .downloadCSS .fa {
                            color: #4f8ec0;
                        }
                        .listing .item {
                            padding-right: 330px;
                        }
                        .listing .item>.status {
                            right: 330px;
                        }
                        .listing .item h3 {
                            width: calc(100% - 54px);
                        }
                    </style>`);

          var layouts = $(".item");
          var currentSite = document.location.host;

          function downloadItem(title, url) {
            var link = document.createElement("a");
            link.download = title;
            link.href = url;
            link.click();
          }

          layouts.each(function() {
            $this = $(this);
            var thisLayout = $this.find("h3 a").text();
            console.log("[CP Toolkit](" + thisTool + ") Running for layout: " + thisLayout);

            var downloadXML = $("<a href='#' class='button downloadXML'><i class='fa fa-download'></i> XML</a>");
            downloadXML.click(function() {
              var downloadUrl = "/App_Themes/" + thisLayout + "/" + thisLayout + ".xml";
              downloadItem(currentSite + "-" + thisLayout + ".xml", downloadUrl);
            });

            var thisLayoutPage = $this.find("a:contains('Layout Page')").attr("href");

            var downloadCSS = $("<a href='#' class='button downloadCSS'><i class='fa fa-download'></i> CSS</a>");
            downloadCSS.click(function() {
              // Because the layout page will redirect, get the redirected URL:
              var xhr = new XMLHttpRequest();
              xhr.onreadystatechange = function(e) {
                if (xhr.status == 200 && xhr.readyState == 4) {
                  var redirectedURL = xhr.responseURL;
                  console.log("[CP Toolkit](" + thisTool + ") Downloading... Got redirected URL: " + redirectedURL);
                  // Go to layout page with bundle off
                  $.get(
                    redirectedURL + "?bundle=off",
                    function(data) {
                      console.log("[CP Toolkit](" + thisTool + ") Downloading... Loaded layout page with bundle off.");
                      var cssLink = data.match(/\/App_Themes\/[^"]*Layout[^"]*/)[0];
                      downloadItem(currentSite + "-" + thisLayout + ".css", cssLink);
                    },
                    "text"
                  );
                }
              };
              xhr.open("GET", thisLayoutPage, true);
              xhr.send();
            });

            $this.append(downloadXML);
            $this.append(downloadCSS);
          });

          var downloadAll = $(
            "<li><a class='button bigButton nextAction' href='#'><span>Download All CSS and XML</span></a></li>"
          );
          downloadAll.click(function() {
            $(".downloadXML, .downloadCSS").each(function() {
              $(this).click();
            });
          });

          $(".contentContainer .sidebar .buttons").append(downloadAll);
        } catch (err) {
          console.warn(err);
        }
      }
    });
  });
})();
