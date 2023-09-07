function showChangelogAlert() {
  console.log("Checking if need to show changelog alert.");
  chrome.storage.local.get({ lastViewedChangelog: "0.0.0" }, function(result) {
    chrome.browserAction.setBadgeText({ text: "NEW" });
    chrome.browserAction.setBadgeBackgroundColor({ color: "#ff3b30" });

    chrome.browserAction.setPopup({ popup: "" });
    chrome.browserAction.onClicked.addListener(function(tab) {
      chrome.tabs.create({
        url: chrome.runtime.getURL("/html/changelog.html") + "?prev=" + result["lastViewedChangelog"]
      });
    });
  });
}

// When the plugin loads, check what the last viewed changelog is
chrome.storage.local.get({ lastViewedChangelog: "0.0.0" }, function(result) {
  if (versionCompare(chrome.runtime.getManifest().version, result["lastViewedChangelog"]) == 1) {
    showChangelogAlert();
  }
});
