var responseObject;
var siteNames = [];

function getSiteList() {
  $.getJSON("http://uitools.civicplus.com/toolkit-search.php", function(response) {
    siteNames = response;
  });
}
// Get a list so results are immediate when searching
getSiteList();
resetDefaultSuggestion();

// Refresh the site list when starting a search
chrome.omnibox.onInputStarted.addListener(function() {
  getSiteList();
});

// Make Suggestions
chrome.omnibox.onInputChanged.addListener(function(text, suggest) {
  text = text.toLowerCase();
  var suggestionsArray = [];
  var shouldDoTools = false;

  if (text.startsWith("tools ")) {
    shouldDoTools = true;
    text = text.replace("tools ", "");
  }

  $.each(siteNames, function(index, value) {
    var siteNameIndex = value.txtSiteName.toLowerCase().indexOf(text);
    var siteURLIndex = value.txtSiteURL.toLowerCase().indexOf(text);
    if (siteNameIndex !== -1 || siteURLIndex !== -1) {
      var highlightedResultURL;
      if (siteURLIndex == -1) {
        highlightedResultURL = escapeXML(value.txtSiteURL);
      } else {
        highlightedResultURL =
          escapeXML(value.txtSiteURL.substring(0, siteURLIndex)) +
          "<match>" +
          escapeXML(value.txtSiteURL.substring(siteURLIndex, siteURLIndex + text.length)) +
          "</match>" +
          escapeXML(value.txtSiteURL.substring(siteURLIndex + text.length));
      }

      var highlightedResultName;
      if (siteNameIndex == -1) {
        highlightedResultName = escapeXML(value.txtSiteName);
      } else {
        highlightedResultName =
          escapeXML(value.txtSiteName.substring(0, siteNameIndex)) +
          "<match>" +
          escapeXML(value.txtSiteName.substring(siteNameIndex, siteNameIndex + text.length)) +
          "</match>" +
          escapeXML(value.txtSiteName.substring(siteNameIndex + text.length));
      }
      var thisDescription = highlightedResultName + " - <url>" + highlightedResultURL + "</url>";
      var resultItem = {
        content: escapeXML("https://" + value.txtSiteURL),
        description: thisDescription
      };
      if (shouldDoTools) {
        resultItem.content = "https://cptools.civicplus.com/Home/SiteDetails/" + value.siteID;
        resultItem.description = "CP Tools: " + thisDescription;
      }
      suggestionsArray.push(resultItem);
    }
  });

  // Suggest the suggestions
  suggest(suggestionsArray);
});

// Handle suggestion pick
chrome.omnibox.onInputEntered.addListener(function(text) {
  if (text.startsWith("https://") || text.startsWith("http://")) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.update(tabs[0].id, { url: text });
    });
    resetDefaultSuggestion();
  }
});

function resetDefaultSuggestion() {
  chrome.omnibox.setDefaultSuggestion({
    description:
      'Keep typing part of the site\'s name or choose from the matched results below. You can also type "tools" followed by a name to open the CP Tools for that site.'
  });
  currentSuggestion = "";
}
chrome.omnibox.onInputCancelled.addListener(function() {
  resetDefaultSuggestion();
});

// Escape XML unsafe text (required for results)
function escapeXML(unsafe) {
  return unsafe.replace(/[<>&'"]/g, function(c) {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
    }
  });
}
