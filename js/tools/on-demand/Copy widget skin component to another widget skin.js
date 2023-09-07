// Make a list of widget skins:
var widgetSkinInfo = "";
$.each(DesignCenter.themeJSON.WidgetSkins, function() {
  widgetSkinInfo += this.Name + ": " + this.WidgetSkinID + "\n";
});

var skinToCopy = prompt("What skin would you like to copy from? (Enter the number)\n\n" + widgetSkinInfo);
var skinToEdit = prompt("What skin would you like to copy to? (Enter the number)\n\n" + widgetSkinInfo);

var fromSkinName;
var fromSkin;
var toSkinName;
var toSkin;
$.each(DesignCenter.themeJSON.WidgetSkins, function() {
  if (this.WidgetSkinID == skinToCopy) {
    fromSkinName = this.Name;
    fromSkin = this;
  } else if (this.WidgetSkinID == skinToEdit) {
    toSkinName = this.Name;
    toSkin = this;
  }
});

var correctSkinNames = confirm(
  "Copying from skin '" + fromSkinName + "' to '" + toSkinName + "'. If this is not correct, click cancel."
);

if (skinToCopy && skinToEdit && correctSkinNames) {
  if (skinToCopy !== skinToEdit) {
    var widgetSkinComponentTypes = [
      "Wrapper",
      "Header",
      "Item List",
      "Item",
      "Item Title",
      "Item Secondary Text",
      "Item Bullets",
      "Item Link",
      "Read On",
      "View All",
      "RSS",
      "Footer",
      "Tab List",
      "Tab",
      "Tab Panel",
      "Column Seperator",
      "Calendar Header",
      "Cal Grid",
      "Cal Day Headers",
      "Cal Day",
      "Cal Event Link",
      "Cal Today",
      "Cal Day Not In Month",
      "Cal Wrapper"
    ];

    var widgetSkinComponentTypeList = "";
    $.each(widgetSkinComponentTypes, function(key, value) {
      widgetSkinComponentTypeList += value + ": " + key + "\n";
    });

    var componentsToCopy = prompt(
      "Which components would you like to copy (comma seperate, e.x. 0,1,2)\n\n" + widgetSkinComponentTypeList
    );

    if (componentsToCopy) {
      var componentsToCopyArray = componentsToCopy.split(",");
      $.each(componentsToCopyArray, function() {
        var shouldCopy = confirm(
          "Copying " + widgetSkinComponentTypes[this] + ". Click OK to confirm or Cancel to skip"
        );
        if (shouldCopy) {
          console.log("Copy from:");
          console.log(fromSkin.Components[this]);
          console.log("Copy to:");
          console.log(toSkin.Components[this]);
          toSkin.RecordStatus = DesignCenter.recordStatus.Modified;
          toSkin.Components[this] = Object.assign({}, fromSkin.Components[this]);
          toSkin.Components[this].WidgetSkinID = parseInt(skinToEdit);
          toSkin.Components[this].RecordStatus = DesignCenter.recordStatus.Modified;
          console.log("Result:");
          console.log(toSkin.Components[this]);
        }
      });
      var shouldSave = confirm("Widget skin components copied. Click OK to save changes.");
      if (shouldSave) {
        saveTheme();
      } else {
        alert("Changes not saved. Refresh the page to cancel the changes.");
      }
    }
  } else {
    alert("You cannot copy to the same skin.");
  }
}
