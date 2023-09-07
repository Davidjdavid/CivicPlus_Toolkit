// Function creates and returns an element for the tool json provided
function createToolElement(toolKey, toolValue) {
  var toolElement = $("<div class='tool'></div>");
  var toolCheckboxContainer = $("<div class='checkbox'><input type='checkbox'></input></div>");
  var toolName = $("<span></span>");
  var toolDescription = $("<div class='description'></div>");
  var toolSubAction = $("<div class='sub-action'></div>");
  var toolSubActionLink = $("<a target='_blank'></a>");

  toolName.text(toolValue.name);
  $(toolDescription).text(toolValue.description);
  $(toolCheckboxContainer)
    .find("input")
    .attr("id", toolKey);
  $(toolCheckboxContainer).append(toolName);

  $(toolElement)
    .append(toolCheckboxContainer)
    .append(toolDescription);

  if (toolValue["settings-link"]) {
    $(toolSubActionLink)
      .attr("href", toolValue["settings-link"].url)
      .text(toolValue["settings-link"].text);
    $(toolSubAction).append(toolSubActionLink);
    $(toolElement).append(toolSubAction);
  }

  return toolElement;
}

function init_options() {
  // Load the plugin data
  $.getJSON("/data/on-load-tools.json", function(tools) {
    // For each tool
    $.each(tools, function(toolKey, toolValue) {
      // Append the tool to the tool list on the page
      $("#tool-list").append(createToolElement(toolKey, toolValue));

      // Get the tool's state from local storage
      chrome.storage.local.get(toolKey, function(result) {
        // Set the state on the checkbox
        $("#" + toolKey).prop("checked", result[toolKey]);

        // Create an event handler for when the checkbox changes
        $("#" + toolKey).change(function() {
          var id = $(this).attr("id");
          console.log("Saving " + id);

          // Create the JSON showing the state
          var optionToSet = JSON.parse('{ "' + id + '": ' + $(this).prop("checked") + "}");

          // Set the JSON in local storage
          chrome.storage.local.set(optionToSet);

          var analyticValue = "unknown";
          if ($(this).prop("checked")) {
            analyticValue = "enabled";
          } else {
            analyticValue = "disabled";
          }

          // Send analytics event
          ga("send", "event", "Setting Change", id, analyticValue);
        });
      });
    });
  });

  // If there is a spot for favorite modules
  if ($("#module-container")) {
    function createFavoriteModuleElement(moduleClass, name, icon) {
      // Create the element
      var moduleToAdd = document.createElement("div");
      var moduleName = document.createElement("div");
      var moduleIcon = document.createElement("input");
      var iconPreview = document.createElement("i");
      var deleteFavorite = document.createElement("a");

      // Set values in the element
      $(moduleName)
        .text(name)
        .addClass("moduleName");
      $(moduleIcon)
        .addClass("fa-icon")
        .val(icon)
        .data("moduleName", name)
        .data("moduleClass", moduleClass);
      $(iconPreview)
        .addClass("icon-preview")
        .addClass(icon)
        .data("moduleName", name)
        .data("moduleClass", moduleClass);
      $(deleteFavorite)
        .addClass("delete-module")
        .text("x")
        .attr("title", "Delete Favorite Module")
        .data("moduleName", name)
        .data("moduleClass", moduleClass);

      $(moduleToAdd)
        .addClass("module")
        .append(moduleName)
        .append(moduleIcon)
        .append(iconPreview)
        .append(deleteFavorite)
        .data("moduleClass", moduleClass);

      // Append the element to the module container (list)
      $("#module-container").append(moduleToAdd);

      // Add an event handler for setting the icon
      $(moduleIcon).change(function() {
        var moduleName = $(this).data("moduleName");
        var moduleClass = $(this).data("moduleClass");
        var selectedIcon = $(this)
          .parent()
          .find(".fa-icon")
          .val();
        $(this)
          .parent()
          .find(".icon-preview")
          .removeClass()
          .addClass(selectedIcon)
          .addClass("icon-preview");
        chrome.storage.sync.get(moduleClass, function(result) {
          result[moduleClass][moduleName] = selectedIcon;
          chrome.storage.sync.set(result);
        });
      });
      // Add an event handler for deleting the icon
      $(deleteFavorite).click(function() {
        var moduleName = $(this).data("moduleName");
        var moduleClass = $(this).data("moduleClass");
        chrome.storage.sync.get(moduleClass, function(result) {
          delete result[moduleClass][moduleName];
          chrome.storage.sync.set(result);
        });
        $(this)
          .parent()
          .remove();
      });
    }

    function populateFavoriteModuleMenu(moduleClass, moduleName) {
      var dropdown;
      if (moduleClass == "Content") {
        dropdown = $("#module-dropdown-content").find(".dropdown-menu");
      } else if (moduleClass == "Site Tools") {
        dropdown = $("#module-dropdown-siteTools").find(".dropdown-menu");
      } else if (moduleClass == "Live Edit") {
        dropdown = $("#module-dropdown-liveEdit").find(".dropdown-menu");
      }
      var addModuleLink = document.createElement("a");
      $(addModuleLink)
        .text(moduleName)
        .addClass("dropdown-item")
        .data("moduleClass", moduleClass);
      $(addModuleLink).click(function() {
        createFavoriteModuleElement($(this).data("moduleClass"), $(this).text(), "");
      });
      $(dropdown).append(addModuleLink);
    }

    // Load favorite modules from Settings
    chrome.storage.sync.get(null, function(favoriteModulesClass) {
      $.each(favoriteModulesClass, function(moduleClass, moduleItem) {
        $.each(moduleItem, function(name, details) {
          createFavoriteModuleElement(moduleClass, name, details);
        });
      });
    });
    // Populate menus to add modules
    $.getJSON("/data/modules.json", function(modules) {
      $.each(modules, function(moduleClass, moduleItem) {
        $.each(moduleItem, function(name, details) {
          populateFavoriteModuleMenu(moduleClass, name);
        });
      });
    });
  }
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
var currentPage = window.location.pathname;
if (window.location.pathname == "/html/options.html") {
  currentPage = "Options";
} else if (window.location.pathname == "/html/main.html") {
  currentPage = "Main Menu";
}
ga("send", "screenview", {
  appName: "CivicPlus Internal Toolkit Extension",
  screenName: currentPage,
  appVersion: chrome.runtime.getManifest().version
});

//bind events to dom elements
document.addEventListener("DOMContentLoaded", init_options);
