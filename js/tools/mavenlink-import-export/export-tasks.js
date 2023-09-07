// The mavenlink subdomain
var mavenlinkDomain = "civicplus.mavenlink.com";

createSidePanel(
  "Export tasks from selected projects",
  `
	<h4>Please choose the projects that you would like to export:</h4>
	<input id="project-chooser" list="project-search-results" style="width: 100%;" placeholder="Start typing the project name to search..."></input>
    <br>
    <datalist id='project-search-results'></datalist>

    <h4>Selected Projects:</h4>
    <ul class="selectedProjects">
    </ul>
    <br><br>
    <button class="export">Export Tasks</button>
    <br><br>
	<hr>
	<h4>You can also paste a comma-seprated list of workspace IDs instead:</h4>
	<input id="project-ids" style="width: 100%;" placeholder="Example: 111111, 222222, 333333..."></input>
    <br><br>
	<button class="export-ids">Export Tasks</button>

`,
  "export-tasks",
  function() {
    var currentRequest;
    function performSearch(query) {
      if (typeof currentRequest !== "undefined") {
        currentRequest.abort();
      }
      var searchUrl = "https://" + window.location.host + "/api/v1/workspaces?archive=exclude&per_page=20";
      var datalist = $("#project-search-results");
      currentRequest = $.getJSON(searchUrl + "&search=" + encodeURIComponent(query), function(result) {
        datalist.empty();
        $.each(result.workspaces, function(key, value) {
          var theOption = $("<option>" + value.title + "</option>")
            .attr("value", value.title)
            .attr("data-value", key);
          datalist.append(theOption);
        });
      });
    }

    var selectedProjects = {};
    function addProject(project) {
      selectedProjects[project[0].dataset.value] = project[0].label;
      var selectedItemObject = $("<li data-id='" + project[0].dataset.value + "'>" + project[0].label + "</li>");
      var removeObject = $(
        "<span style='color: red; cursor: pointer; text-decoration: underline; padding-left: .25em;'>remove</span>"
      );
      removeObject.click(function() {
        removeProject(project[0].dataset.value);
      });
      selectedItemObject.append(removeObject);
      $(".selectedProjects").append(selectedItemObject);
      console.log(project);
    }

    function removeProject(projectId) {
      delete selectedProjects[projectId];
      $("li[data-id='" + projectId + "']").remove();
    }

    $("#project-chooser").on("input", function(event) {
      var val = $(this).val();
      if (val === "") return;
      var selectedOption = $("#project-search-results")
        .find("option")
        .filter(function() {
          return this.value.toUpperCase() === val.toUpperCase();
        });

      if (selectedOption.length) {
        addProject(selectedOption);
        $("#project-chooser").val("");
      } else {
        performSearch(val);
      }
    });

    $(".export").click(function() {
      exportTasks(selectedProjects);
    });

    $(".export-ids").click(function() {
      var ids = $("#project-ids").val();
      var idArray = ids.replace(/\s+/g, "").split(",");

      idArray.forEach(function(value, index) {
        $.get("https://" + mavenlinkDomain + "/api/v1/workspaces/" + value + ".json", function(result) {
          var title = result.workspaces[value].title;
          buildExportObject(value, title, idArray.length);
        });
      });
    });
  }
);

var exportObject = {};
function buildExportObject(id, name, totalCount) {
  exportObject[id] = name;
  if (totalCount == Object.keys(exportObject).length) {
    exportTasks(exportObject);
  }
}

function exportTasks(workspaces) {
  // The maximum number of stories per workspace
  var storyIdLimit = 200;

  // Do not edit below here.
  var getStoryURL =
    "https://" +
    mavenlinkDomain +
    "/api/v1/stories?order=position&limit=" +
    storyIdLimit +
    "&offset=0&include=time_estimate_in_minutes&workspace_id=";

  // Create a blank CSV with headers
  var csvHeader = ["Project Name", "Project ID", "Story Name", "Story ID", "Estimated time in Minutes"];
  var csvData = "data:text/csv;charset=utf-8," + csvHeader.join(",") + "\r\n";
  var csvArray = [];

  $.each(workspaces, function(workspace_id, workspace_name) {
    console.log("Getting tasks from workspace with ID: " + workspace_id);

    // Get the story ID's from the workspace ID
    $.get(getStoryURL + workspace_id, function(storiesObject) {
      // For each story object
      $.each(storiesObject.stories, function(story_id, story_attributes) {
        // Replace commas with spaces to prevent breaking CSV
        var title = story_attributes.title.replace(/[, ]+/g, " ");

        // Push this row to the array
        csvArray.push([workspace_name, workspace_id, title, story_id, story_attributes.time_estimate_in_minutes]);
      });
      signalFinished();
    });
  });

  var finishedWorkspaceCount = 0;
  function signalFinished() {
    finishedWorkspaceCount++;
    if (finishedWorkspaceCount == Object.keys(workspaces).length) {
      createCSV();
      $(".toolkit-panel-export-tasks").remove();
    }
  }

  function createCSV() {
    // Generate the CSV
    csvArray.forEach(function(rowArray) {
      row = rowArray.join(",");
      csvData += row + "\r\n";
    });

    var encodedCSV = encodeURI(csvData);
    var link = document.createElement("a");
    link.setAttribute("href", encodedCSV);
    link.setAttribute("style", "display: none;");
    link.setAttribute("download", "mavenlink_export.csv");
    document.body.appendChild(link);

    link.click();
  }
}
