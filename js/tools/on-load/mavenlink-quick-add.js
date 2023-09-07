(function loadTool() {
  var thisTool = "mavenlink-quick-add";
  chrome.storage.local.get(thisTool, function(settings) {
    if (settings[thisTool]) {
      console.log("[CP Toolkit] Loading " + thisTool);
      try {
        $(` <script>
                        $("<input id='csrftoken' type='hidden' value='" + window.authenticity_token + "'></input>").appendTo("body");
                    </script>`).appendTo("body");

        var csrfToken;
        setTimeout(function() {
          csrfToken = $("#csrftoken").val();
        }, 1000);
        $(document).ready(function() {
          var quickAddButton = $("<a id='quickAddButton' href='#'>Quick Add</a>");
          quickAddButton.click(function() {
            presentPopup();
          });
          quickAddButton.appendTo(".navigation-application");

          // Get the mavenlink variable and make it accessible to the tool
          $("script").each(function() {
            var $this = $(this);
            if ($this.html().indexOf("window.Mavenlink = {}") !== -1) {
              eval($this.html());
            }
          });
        });

        var currentRequest;
        function performSearch(query, showOnlyJoinable) {
          if (typeof currentRequest !== "undefined") {
            currentRequest.abort();
          }
          var joinableURL = "";
          if (showOnlyJoinable) {
            joinableURL = "&only_joinable=true";
          } else {
            joinableURL = "&only_joinable=false";
          }
          var url = "https://civicplus.mavenlink.com/api/v1/workspaces?archive=exclude&per_page=100" + joinableURL;
          var datalist = $("#search-results");
          currentRequest = $.getJSON(url + "&search=" + encodeURIComponent(query), function(result) {
            datalist.empty();
            $.each(result.workspaces, function(key, value) {
              var theOption = $("<option>" + value.title + "</option>")
                .attr("value", value.title)
                .attr("data-value", key);
              datalist.append(theOption);
            });
          });
        }

        function performTaskSearch(workspace_id, query) {
          if (typeof currentRequest !== "undefined") {
            currentRequest.abort();
          }
          var url =
            "https://civicplus.mavenlink.com/api/v1/stories?limit=20&offset=0&workspace_id=" +
            workspace_id +
            "&search=";
          var datalist = $("#task-search-results");
          currentRequest = $.getJSON(url + encodeURIComponent(query), function(result) {
            datalist.empty();
            $.each(result.stories, function(key, value) {
              var theOption = $("<option>" + value.title + "</option>")
                .attr("value", value.title)
                .attr("data-value", key);
              datalist.append(theOption);
            });
          });
        }

        function presentPopup() {
          $("#toolkit-popup").remove();
          var selectedProject;
          var popup = $(
            '<div id=\'toolkit-popup\'><a href=\'#\' onclick=\'$("#toolkit-popup").addClass("hiding").removeClass("showing"); setTimeout(function() { $("#toolkit-popup").remove(); }, 500);\'>Close</a></div>'
          );
          popup.append("<h1>Quick Add</h1>");

          // Project Search
          var projectContainer = $("<div class='project'><h3>Project</h3></div>");
          var toggleCheckbox = $("<input type='checkbox' id='show-only_joinable' value='only_joinable' checked>");
          popup.append(toggleCheckbox);
          popup.append(" Join Project (uncheck to join task)");
          var shouldShowProjectButton = true;
          toggleCheckbox.change(function() {
            if ($(this).is(":checked")) {
              $("#toolkit-popup .task").hide();
              shouldShowProjectButton = true;
              $("#joinTask").remove();
              $("#toolkit-task-quick-search").val("");
              $("#toolkit-quick-search").focus();
            } else {
              $("#toolkit-popup .task").show();
              if ($("#toolkit-quick-search").val()) {
                $("#toolkit-task-quick-search").focus();
              } else {
                $("#toolkit-quick-search").focus();
              }
              shouldShowProjectButton = false;
              $("#joinProject").remove();
            }
          });
          var searchInput = $(
            "<input id='toolkit-quick-search' list='search-results' placeholder='Type the name of a project'></input>"
          );
          searchInput.on("input", function(e) {
            // Clear out any selected task
            $("#toolkit-task-quick-search").val("");
            var val = $(this).val();
            if (val === "") return;
            var selectedOption = $("#search-results")
              .find("option")
              .filter(function() {
                return this.value.toUpperCase() === val.toUpperCase();
              });
            var theButton = $("<button id='joinProject'>Join Project</button>");
            if (selectedOption.length) {
              var selectedId = selectedOption.data("value");
              selectedProject = selectedId;
              if (shouldShowProjectButton) {
                popup.find("#joinProject").remove();
                popup.find(".project").append(theButton);
              }
              theButton.click(function() {
                $.ajax({
                  beforeSend: function(request) {
                    request.setRequestHeader("x-csrf-token", csrfToken);
                  },
                  url: "https://civicplus.mavenlink.com/api/v1/participations",
                  method: "POST",
                  contentType: "application/json",
                  dataType: "json",
                  data: JSON.stringify({
                    participation: { workspace_id: selectedId, role: "maven" },
                    include: "",
                    filters: "",
                    optional_fields: ""
                  }),
                  success: function() {
                    alert("Joined project!");
                    $("#joinProject").remove();
                  },
                  error: function(response) {
                    var alertMessage = "There was a problem joining the project. Details:\n\n";
                    console.warn("[CP Toolkit](" + thisTool + ") Error detected. Response details:");
                    console.log(response);
                    alertMessage += JSON.stringify(response);
                    alert(alertMessage);
                  }
                });
              });
            } else {
              $("#joinProject").remove();
              performSearch(val, $("#show-only_joinable").is(":checked"));
            }
          });
          projectContainer.append(searchInput);
          popup.append(projectContainer);
          popup.find(".project").append("<datalist id='search-results'></datalist>");

          // Task search
          var taskContainer = $("<div class='task'><h3>Task</h3></div>");
          var taskSearchInput = $(
            "<input id='toolkit-task-quick-search' list='task-search-results' placeholder='Type the name of a task'></input>"
          );
          taskSearchInput.on("input", function(e) {
            var val = $(this).val();
            if (val === "") return;
            var taskSelectedOption = $("#task-search-results")
              .find("option")
              .filter(function() {
                return this.value.toUpperCase() === val.toUpperCase();
              });
            var theButton = $("<button id='joinTask'>Join Task</button>");
            if (taskSelectedOption.length) {
              var taskSelectedId = taskSelectedOption.data("value");
              var currentUser = window.Mavenlink.currentUser.id;
              popup.find("#joinTask").remove();
              popup.find(".task").append(theButton);
              theButton.click(function() {
                $.get(
                  "https://civicplus.mavenlink.com/api/v1/stories/" +
                    taskSelectedId +
                    "?include=potential_workspace_resources_with_unnamed%2Cworkspace_resources_with_unnamed",
                  function(response) {
                    $.each(response.workspace_resources, function(key, value) {
                      if (value.user_id == currentUser) {
                        var resourceId = key;
                        console.log(
                          "[CP Toolkit](" +
                            thisTool +
                            ") Current User: " +
                            currentUser +
                            ", Resource ID: " +
                            resourceId +
                            ", Story ID: " +
                            taskSelectedId
                        );
                        $.ajax({
                          beforeSend: function(request) {
                            request.setRequestHeader("x-csrf-token", csrfToken);
                          },
                          url: "https://civicplus.mavenlink.com/api/v1/assignments",
                          method: "POST",
                          contentType: "application/json",
                          dataType: "json",
                          data: JSON.stringify({
                            assignment: {
                              assignee_id: currentUser.toString(),
                              resource_id: resourceId.toString(),
                              story_id: taskSelectedId.toString()
                            },
                            include: "",
                            filters: "",
                            optional_fields: ""
                          }),
                          success: function() {
                            alert("Joined task!");
                          },
                          error: function(response) {
                            var alertMessage = "There was a problem joining the task. Details:\n\n";

                            if ("responseJSON" in response) {
                              if ("errors" in response.responseJSON) {
                                $.each(response.responseJSON.errors, function() {
                                  alertMessage += this.message + "\n";
                                });
                              }
                            }
                            if ("responseText" in response) {
                              alertMessage += "\n\nTechnical Details:\n";
                              alertMessage += response.responseText;
                            }

                            console.warn("[CP Toolkit](" + thisTool + ") Error detected. Response details:");
                            console.log(response);
                            alert(alertMessage);
                          }
                        });
                      }
                    });
                  }
                );
              });
            } else {
              $("#joinTask").remove();
              performTaskSearch(selectedProject, val);
            }
          });

          taskContainer.append(taskSearchInput);
          popup.append(taskContainer);
          taskContainer.hide();
          popup.find(".task").append("<datalist id='task-search-results'></datalist>");
          popup.addClass("hiding");
          popup.appendTo("body");
          setTimeout(function() {
            popup.addClass("showing").removeClass("hiding");
            popup.find("#toolkit-quick-search").focus();
          }, 100);
        }

        var css = `
                <style>
                #quickAddButton {
                    position: absolute;
                    bottom: 1em;
                    left: 1em;
                    text-align: center;
                    background-color: #af282f;
                    color: #fff !important;
                    padding: 1em;
                    border-radius: 10em;
                    font-weight: bold;
                    line-height: 1.2em;
                    width: 110px;
                }
                #toolkit-popup {
                    position: fixed;
                    top: 50%;
                    left: 30%;
                    right: 30%;
                    transform: translateY(-50%);
                    z-index: 1000;
                    background-color: #fff;
                    border: 1px solid #000;
                    padding: 2em;
                    transition: opacity linear .3s;
                }
                #toolkit-popup.showing {
                    opacity: 1;
                }
                #toolkit-popup.hiding {
                    opacity: 0;
                }
                #toolkit-popup h3 {
                    margin: 1em 0 0.5em 0;
                }
                #toolkit-quick-search, #toolkit-task-quick-search {
                    width: 100%;
                }
                #joinProject, #joinTask {
                    margin-top: 2em;
                    font-size: 1em;
                }
                </style>
                `;
        $(css).appendTo("body");
      } catch (err) {
        console.warn(err);
      }
    }
  });
})();
