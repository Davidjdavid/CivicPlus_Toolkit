createSidePanel(
  "Import tasks from CSV",
  `
    <h4>Please choose a file to import from</h4>
    <p>The file must be a CSV with a "Project ID" column, a "Story ID" column, and an "Estimated time in Minutes" column.</p>
    <input type="file" name="importCSV" id="importCSV" accept=".csv" style="width: 100%; height: 30px;">
    <br><br>
    <button class="import">Import Tasks</button>
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

function parseCSV(data) {
  var parsedObject = [];
  data = data.replace(/[\r]/g, "");
  var rows = data.split("\n");
  var headers = rows[0].split(",");

  var projectIdIndex;
  var storyIdIndex;
  var estimatedTimeIndex;

  headers.forEach(function(value, index) {
    if (value.indexOf("Project ID") !== -1) {
      projectIdIndex = index;
    } else if (value.indexOf("Story ID") !== -1) {
      storyIdIndex = index;
    } else if (value.indexOf("Estimated time in Minutes") !== -1) {
      estimatedTimeIndex = index;
    }
  });

  if (typeof projectIdIndex !== null && typeof storyIdIndex !== null && typeof estimatedTimeIndex !== null) {
    var numOpenAjax = 0;
    rows.forEach(function(value, index) {
      if (index == 0) {
        visibleLog("Import Headers: " + value);
      } else {
        var thisRowArray = value.split(",");
        if (thisRowArray[projectIdIndex] && thisRowArray[storyIdIndex] && thisRowArray[estimatedTimeIndex]) {
          // Do import work here
          $.ajax({
            beforeSend: function(request) {
              request.setRequestHeader("x-csrf-token", window.authenticity_token);
              numOpenAjax++;
            },
            url: "https://civicplus.mavenlink.com/api/v1/stories/" + thisRowArray[storyIdIndex],
            type: "PUT",
            contentType: "application/json",
            dataType: "json",
            data: '{"story": {"time_estimate_in_minutes": ' + thisRowArray[estimatedTimeIndex] + "}}",
            success: function(result) {
              visibleLog(
                "Succesfully set estimated time for " +
                  thisRowArray[storyIdIndex] +
                  " on workspace with ID: " +
                  thisRowArray[projectIdIndex]
              );
              numOpenAjax--;
              if (numOpenAjax == 0) {
                visibleLog("Import complete.");
              }
            },
            error: function(xhr, error) {
              visibleWarn(
                "Failed to set estimated time for " +
                  thisRowArray[storyIdIndex] +
                  " on workspace with ID: " +
                  thisRowArray[projectIdIndex]
              );
              console.warn(xhr);
              console.warn(error);
              numOpenAjax--;
              if (numOpenAjax == 0) {
                visibleLog("Import complete.");
              }
            }
          });
        } else {
          visibleWarn("Row #" + index + " was not valid for import. Row value: " + thisRowArray.toString());
        }
      }
    });
  } else {
    alert("CSV is missing a required header.");
    visibleLog(projectIdIndex);
    visibleLog(storyIdIndex);
    visibleLog(estimatedTimeIndex);
  }
}
