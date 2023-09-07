// Source: https://stackoverflow.com/a/6832721
function versionCompare(v1, v2, options) {
  var lexicographical = options && options.lexicographical,
    zeroExtend = options && options.zeroExtend,
    v1parts = v1.split("."),
    v2parts = v2.split(".");

  function isValidPart(x) {
    return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
  }

  if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
    return NaN;
  }

  if (zeroExtend) {
    while (v1parts.length < v2parts.length) v1parts.push("0");
    while (v2parts.length < v1parts.length) v2parts.push("0");
  }

  if (!lexicographical) {
    v1parts = v1parts.map(Number);
    v2parts = v2parts.map(Number);
  }

  for (var i = 0; i < v1parts.length; ++i) {
    if (v2parts.length == i) {
      return 1;
    }

    if (v1parts[i] == v2parts[i]) {
      continue;
    } else if (v1parts[i] > v2parts[i]) {
      return 1;
    } else {
      return -1;
    }
  }

  if (v1parts.length != v2parts.length) {
    return -1;
  }

  return 0;
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

var previousVersion = getParameterByName("prev");

if (previousVersion) {
  $("#message").text(
    "New notes are highlighted in green. Don't want to see the changelog? You can turn it off in settings."
  );
}

$(".version").each(function() {
  var elementVersion = $(this)
    .attr("class")
    .replace("version", "")
    .replace("v", "")
    .trim();
  if (elementVersion && previousVersion && versionCompare(elementVersion, previousVersion) == 1) {
    $(this)
      .css("background", "#7DCEA0")
      .css("padding", "1em");
  }
});

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
  screenName: "Changelog",
  appVersion: chrome.runtime.getManifest().version
});

console.log(
  "Viewed changelog. Clearing alert and updating last viewed changelog to " + chrome.runtime.getManifest().version
);
chrome.browserAction.setBadgeText({ text: "" });
chrome.browserAction.setPopup({ popup: "html/main.html" });
chrome.storage.local.set({ lastViewedChangelog: chrome.runtime.getManifest().version });
