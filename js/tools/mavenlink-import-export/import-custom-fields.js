createSidePanel(
  "Import custom fields from CSV",
  `
    <h4>Please choose a file to import from</h4>
    <p>The file must be a CSV with a "Project ID" column, a "Field Name" column, and a "Value" column.</p>
    <input type="file" name="importCSV" id="importCSV" accept=".csv" style="width: 100%; height: 30px;">
    <br><br>
    <button class="import">Import Custom Fields</button>
    <div id="toolkitVisibleLog"></div>
`,
  "import-tasks",
  function() {
    $(".toolkit-panel-import-tasks .import").click(function() {
      var fileInput = $(".toolkit-panel-import-tasks #importCSV");
      if (fileInput[0].files.length !== 0) {
        doToolkitImport(fileInput[0].files[0]);
      } else {
        alert("Please select a file.");
      }
    });
  }
);

function doToolkitImport(file) {
  visibleLog("Import Started...");
  var reader = new FileReader();

  reader.readAsText(file);
  reader.onloadend = function(e) {
    var data = e.target.result;
    parseCSV(data);
  };
}

// The mavenlink subdomain
var mavenlinkDomain = "civicplus.mavenlink.com";

var maxPerPage = 200;

// Do not edit below here.
var api_custom_fields =
  "https://" + mavenlinkDomain + "/api/v1/custom_fields?include=choices&page=1&per_page=" + maxPerPage;
var api_custom_field_values = "https://" + mavenlinkDomain + "/api/v1/custom_field_values";

var choices = {};
var custom_fields;
// Get all custom fields for the organization
$.get(api_custom_fields, function(custom_fields_result) {
  custom_fields = custom_fields_result;
  // Make choices easier to access
  $.each(custom_fields.custom_field_choices, function(choice_id, choice_attributes) {
    if (!(choice_attributes.custom_field_id in choices)) {
      choices[choice_attributes.custom_field_id] = [];
    }
    choices[choice_attributes.custom_field_id].push(choice_attributes);
  });
  visibleLog("Got available custom fields. Ready to start import.");
});

var csvRegex = /,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/g;
function parseCSV(data) {
  var parsedObject = [];
  data = data.replace(/[\r]/g, "");
  var rows = data.split("\n");
  var headers = rows[0].split(csvRegex);
  // Remove quotes from escaped strings
  headers = headers.map((header) => header.replace(/^"(.+(?="$))"$/, "$1"));

  var projectIdIndex;
  var fieldNameIndex;
  var valueIndex;

  headers.forEach(function(value, index) {
    if (value.toLowerCase().indexOf("project id") !== -1) {
      projectIdIndex = index;
    } else if (value.toLowerCase().indexOf("field name") !== -1) {
      fieldNameIndex = index;
    } else if (value.toLowerCase().indexOf("value") !== -1) {
      valueIndex = index;
    }
  });

  if (
    typeof projectIdIndex !== "undefined" &&
    typeof fieldNameIndex !== "undefined" &&
    typeof valueIndex !== "undefined"
  ) {
    var numOpenAjax = 0;
    rows.forEach(function(value, index) {
      if (index == 0) {
        visibleLog("Import Headers: " + value);
      } else {
        var thisRowArray = value.split(csvRegex);
        // Remove quotes from escaped strings
        thisRowArray = thisRowArray.map((elem) => elem.replace(/^"(.+(?="$))"$/, "$1"));
        if (thisRowArray[projectIdIndex] && thisRowArray[fieldNameIndex]) {
          var field_name = thisRowArray[fieldNameIndex];
          var value_to_set = thisRowArray[valueIndex];
          var workspace_id = thisRowArray[projectIdIndex];

          // Get the currently-set fields for this workspace
          $.get(
            api_custom_field_values +
              ".json?subject_type=Workspace&per_page=" +
              maxPerPage +
              "&with_subject_id=" +
              workspace_id,
            function(set_fields) {
              if (set_fields.count !== set_fields.results.length) {
                visibleWarn(
                  "More values found already set than API returned. This project probably has more than " +
                    maxPerPage +
                    " custom field values set. Some fields may not update."
                );
              }

              var foundField = false;
              var fieldWasUpdated = false;

              // For each already set field
              $.each(set_fields.custom_field_values, function(value_id, value_attributes) {
                if (value_attributes.custom_field_name == field_name) {
                  fieldWasUpdated = true;

                  // For each custom field
                  $.each(custom_fields.custom_fields, function(field_id, field_attributes) {
                    if (field_attributes.name.toLowerCase() == field_name.toLowerCase()) {
                      if (field_id in choices) {
                        var foundValueToSet = false;
                        $.each(choices[field_id], function(id, choice) {
                          if (choice.label == value_to_set) {
                            foundValueToSet = true;
                            value_to_set = choice.id;
                          }
                        });
                        if (!foundValueToSet) {
                          visibleWarn(
                            "Unable to find valid value matching '" +
                              value_to_set +
                              "' on this field. Check the value. Valid values are shown in console."
                          );
                          console.log(choices[field_id]);
                        } else {
                          setCustomField("update", workspace_id, value_id, value_to_set, field_name);
                        }
                      } else {
                        console.error("Updating in a place which shouldn't be?");
                        setCustomField("update", workspace_id, value_id, value_to_set, field_name);
                      }
                    }
                  });
                }
              });

              // If the field wasn't already set
              if (!fieldWasUpdated) {
                // For each custom field
                $.each(custom_fields.custom_fields, function(field_id, field_attributes) {
                  if (field_attributes.name.toLowerCase() == field_name.toLowerCase()) {
                    foundField = true;

                    // If there are choices for this field
                    if (field_id in choices) {
                      var foundValueToSet = false;
                      $.each(choices[field_id], function(id, choice) {
                        if (choice.label == value_to_set) {
                          foundValueToSet = true;
                          value_to_set = choice.id;
                        }
                      });
                      if (!foundValueToSet) {
                        visibleWarn(
                          "Unable to find valid value matching '" +
                            value_to_set +
                            "' on this field. Check the value. Valid values are below."
                        );
                        visibleLog(choices[field_id]);
                      } else {
                        setCustomField("add", workspace_id, field_id, value_to_set, field_name);
                      }
                    } else {
                      setCustomField("add", workspace_id, field_id, value_to_set, field_name);
                    }
                  }
                });
                if (!foundField) {
                  visibleWarn(
                    "Unable to find field '" + field_name + "'. Check its name. Valid options are shown in console log."
                  );
                  console.log(custom_fields.custom_fields);
                }
              }
            }
          );
        } else {
          if (thisRowArray.toString() !== "") {
            visibleWarn("Row #" + index + " was not valid for import. Row value: " + thisRowArray.toString());
          }
          // visibleWarn("Skipping?")
        }
      }
    });
  } else {
    alert("CSV is missing a required header.");
  }
}

function setCustomField(action, workspace_id, custom_field_id, value_to_set, field_name) {
  var ajaxType;
  var data = {
    custom_field_value: {}
  };
  var url = api_custom_field_values;
  if (action == "delete" || value_to_set === "DELETEDATA" || value_to_set == "") {
    let shouldDelete = confirm(
      "Are you sure that you want to delete the value from '" +
        field_name +
        "' on workspace with ID '" +
        workspace_id +
        "'?"
    );
    if (shouldDelete) {
      action = "delete";
      ajaxType = "DELETE";
      url += "/" + custom_field_id + ".json";
      data = undefined;
    } else {
      visibleWarn("Skpped deleting value from '" + field_name + "' on workspace with ID '" + workspace_id + "'.");
      return true;
    }
  } else if (action == "update") {
    ajaxType = "PUT";
    data.custom_field_value.value = value_to_set;
    url += "/" + custom_field_id + ".json";
  } else if (action == "add") {
    ajaxType = "POST";
    data.custom_field_value = {
      subject_type: "Workspace",
      subject_id: workspace_id,
      custom_field_id: custom_field_id,
      value: value_to_set
    };
    url += ".json";
  } else {
    visibleWarn("Unknown action. There is an error in the code.");
  }

  $.ajax({
    beforeSend: function(request) {
      request.setRequestHeader("x-csrf-token", window.authenticity_token);
    },
    url: url,
    type: ajaxType,
    data: data,
    success: function(result) {
      visibleLog(
        "Action " +
          action +
          " was successful on '" +
          field_name +
          "' on workspace with ID '" +
          workspace_id +
          "'. New value was '" +
          value_to_set +
          "'"
      );
      return true;
    },
    error: function(xhr, error) {
      visibleWarn(
        "Action " +
          action +
          " failed on '" +
          field_name +
          "' on workspace with ID '" +
          workspace_id +
          "'. New value was '" +
          value_to_set +
          "'"
      );
      if ("errors" in xhr.responseJSON) {
        $.each(xhr.responseJSON.errors, function(key, error) {
          console.error(error);
        });
      }
      return false;
    }
  });
}
