// BEGIN SHARED MAVENLINK TOOLS CODE
function createSidePanel(title, htmlContent, className, callback) {
  // Remove the panel if it already exists
  $(".toolkit-panel-" + className).remove();

  var element =
    `
        <div id="side-panel" class="is-active toolkit-panel-` +
    className +
    `" style="transform: translateX(0); box-shadow: 0 0 15px #b6b6b6;">
            <div class="inner-view-region side-panel-content fading-region" style="border-left: 1px solid #c8c8c8; background-color: #fff; height: 100%; width: inherit; position: relative;">
                <div class="side-panel-layout" style="height: inherit; width: inherit; display: flex; flex-direction: column; opacity: 1; transition: opacity ease-in-out 0.5s; position: absolute; top: 0; right: 0; bottom: 0; left: 0;">
                    <div class="header-region">
                        <div class="tracker-panel-header side-panel-header">
                            <div class="panel actions panel-neutral-mid-dark " style="display: inline-block; overflow: visible; width: 100%; height: 49px; padding: 0; background-color: #fbfaf6; border: 0; border-bottom: 1px solid #e1e1dd; position: relative;">
                                <span class="tracker-panel-workspace-link-wrapper tracker-panel-workspace-link-wrapper-sqkd-ad3438">
                                    <span class="tracker-panel-workspace-link" style="line-height: 52px; padding-left: 20px; color: #333333; font-size: 0.875rem; font-weight: bold;">` +
    title +
    `</span>
                                </span>
                                <ul class="side-panel-actions panel-items" style="display: flex; justify-content: flex-end; align-items: center; height: 100%; float: right; list-style-type: none; margin-right: 0;">
                                    <li class="side-panel-action side-panel-close-action panel-item" style="position: relative; border-left: 1px solid #e1e1dd; margin-right: 0; width: 60px; margin-left: 4px; height: 100%; display: inline-block; padding-left: 8px; padding-right: 8px; cursor: pointer; list-style-type: none; margin-right: 0; float: right;">
                                        <button class="no-custom side-panel-link panel-close-link" original-title="Close" data-tooltip="Close" aria-label="Close" style="position: absolute; top: 50%; left: 50%; transform: translate3d(-50%, -50%, 0); display: flex; align-items: center; color: #333333; background: none; min-width: 0; padding: 0; border: 0; cursor: pointer;">
                                            <svg class="icon-new" aria-hidden="true" style="fill: #737373;">
                                                <use xlink:href="#icon-close-thin"></use>
                                            </svg>
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="sections-region" style="position: relative; flex: 1;">
                        <div class="sections" style="display: flex; flex-direction: column; position: absolute; top: 0; right: 0; bottom: 0; left: 0;">
                            <div class="sections-layout grid-fluid" style="position: relative; overflow-y: auto; flex: 1; margin: 0; padding: 0 35px; min-width: 0 !important;">
                                ` +
    htmlContent +
    `
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style> .toolkit-panel-` +
    className +
    ` h4 { margin-top: 2em; margin-bottom: .5em; } </style>
        </div>
    `;
  $(element).appendTo("body");
  $(".toolkit-panel-" + className + " .side-panel-close-action").click(function() {
    $(".toolkit-panel-" + className).remove();
  });
  callback();
}

var logText = "";
function visibleLog(text) {
  console.log(text);
  var logTime = new Date().toTimeString().split(" ")[0];
  logText = "<p style='margin: 0;'>[" + logTime + "] " + text + "</p>" + logText;
  if ($("#toolkitVisibleLog").length) {
    $("#toolkitVisibleLog").html(logText);
  } else {
    console.warn("No visible log.");
  }
}
function visibleWarn(text) {
  console.warn(text);
  var logTime = new Date().toTimeString().split(" ")[0];
  logText = "<p style='color: red; margin: 0;'>[" + logTime + "] " + text + "</p>" + logText;
  if ($("#toolkitVisibleLog").length) {
    $("#toolkitVisibleLog").html(logText);
  } else {
    console.warn("No visible log.");
  }
}

// Get the API key for requests from the page
var apikey;
$(`<script>
    jQuery("<input type='hidden' id='apikey'>").appendTo("body");
    jQuery("#apikey").val(window.authenticity_token);
    </script>`).appendTo("body");
function checkForKey() {
  if ($("#apikey").val()) {
    apikey = $("#apikey").val();
  } else {
    setTimeout(function() {
      checkForKey();
    }, 500);
  }
}
checkForKey();
// END SHARED CODE
