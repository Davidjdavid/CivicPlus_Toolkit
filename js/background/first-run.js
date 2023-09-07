// When the plugin is first installed
chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason == "install") {
    console.log("Detected first run.");
    window.open(chrome.extension.getURL("/html/help.html?firstrun=true"), "_blank");

    // Initialize settings
    $.getJSON("/data/on-load-tools.json", function(tools) {
      $.each(tools, function(key, value) {
        // Create the JSON showing the state
        var optionToSet = JSON.parse('{ "' + key + '": ' + value["enabled-by-default"] + "}");

        // Set the JSON in local storage
        chrome.storage.local.set(optionToSet);
      });
      $.getJSON("/data/modules.json", function(modules) {
        // For each module class
        $.each(modules, function(key, value) {
          var moduleClassFavorites = {};
          // For each module itself
          $.each(value, function(key, value) {
            // If it is a default favorite
            if (value["default-favorite"]) {
              // Set it as a favorite
              moduleClassFavorites[key] = value["default-icon"];
            }
          });
          if (Object.keys(moduleClassFavorites).length) {
            console.log("Saving Favorite " + key + " modules.");
            var optionToSet = '{"' + key + '": ' + JSON.stringify(moduleClassFavorites) + "}";
            chrome.storage.sync.set(JSON.parse(optionToSet));
          }
        });
      });
    });

    // Run when the plugin is updated
  } else if (details.reason == "update") {
    console.log("Detected update.");
    var previousVersion = details.previousVersion;

    $.getJSON("/data/on-load-tools.json", function(tools) {
      $.each(tools, function(key, value) {
        chrome.storage.local.get(key, function(result) {
          if (Object.keys(result).length === 0) {
            // Create the JSON showing the state
            var optionToSet = JSON.parse('{ "' + key + '": ' + value["enabled-by-default"] + "}");

            // Set the JSON in local storage
            chrome.storage.local.set(optionToSet);
            console.log(optionToSet);
          }
        });
      });
    });

    chrome.storage.local.get("show-changelog", function(result) {
      if (result["show-changelog"]) {
        chrome.storage.local.get({ lastViewedChangelog: "0.0.0" }, function(result) {
          if (versionCompare(chrome.runtime.getManifest().version, result["lastViewedChangelog"]) == 1) {
            window.open(
              chrome.extension.getURL("/html/changelog.html?prev=" + result["lastViewedChangelog"]),
              "_blank"
            );
          }
        });
      }
    });
  }
});
