$.getJSON("/data/on-load-tools.json", function(tools) {
  $.each(tools, function(key, value) {
    var element = createHelpElement(value.id, value.name, value["help-text"]);
    $("#persistant-tools").append(element);
  });
  if (window.location.href.split("#")[1]) {
    $([document.documentElement, document.body]).animate(
      {
        scrollTop: $("#" + window.location.href.split("#")[1]).offset().top
      },
      2000
    );
    $("#" + window.location.href.split("#")[1])
      .css("background-color", "rgb(125, 206, 160)")
      .css("padding", "1em");
  }
});

$.getJSON("/data/on-demand-tools.json", function(tools) {
  $.each(tools, function(key, value) {
    var element = createHelpElement(key.replace(/\s/g, ""), key, value["help"]);
    element.append("<em>Runs on: " + value["helpPages"] + "</em>");
    $("#on-demand-tools").append(element);
  });
});

function createHelpElement(pluginId, pluginName, helpText) {
  var tool = $("<div class='tool'><h4></h4><div class='helpText'></div></div>");
  $(tool).attr("id", pluginId);
  $(tool)
    .find("h4")
    .text(pluginName);
  $(tool)
    .find(".helpText")
    .text(helpText);
  return tool;
}

// Source: https://stackoverflow.com/a/901144
function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

var firstRun = getParameterByName("firstrun");

if (firstRun) {
  $("#outerWrap")
    .find("h1")
    .text("Welcome! This is an overview of the CivicPlus Internal Toolkit.");
}

(function(i, s, o, g, r, a, m) {
  i["GoogleAnalyticsObject"] = r;
  (i[r] =
    i[r] ||
    function() {
      (i[r].q = i[r].q || []).push(arguments);
    }),
    (i[r].l = 1 * new Date());
  (a = s.createElement(o)), (m = s.getElementsByTagName(o)[0]);
  a.async = 1;
  a.src = g;
  m.parentNode.insertBefore(a, m);
})(window, document, "script", "https://www.google-analytics.com/analytics.js", "ga");

ga("create", "UA-118042537-1", "auto");
ga("set", "checkProtocolTask", function() {});
ga("send", "screenview", {
  appName: "CivicPlus Internal Toolkit Extension",
  screenName: "Help",
  appVersion: chrome.runtime.getManifest().version
});
