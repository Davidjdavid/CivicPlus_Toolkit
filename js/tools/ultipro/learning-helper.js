switch (window.location.pathname.toLowerCase()) {
  // The "Current Opportunities" page
  case "/pages/edit/cdcurrentdevoppsummary.aspx":
    // Find the available opportunities
    var opportunities = document.getElementsByClassName("lastUnit");
    if (opportunities.length) {
      // Open the first opportunity
      opportunities[0].getElementsByTagName("a")[0].click();
    } else {
      // No opportunities, go to "Available Opportunities"
      window.location.href =
        "/pages/EDIT/CDAvailableDevOppSummary.aspx?USParams=PK=ESS";
    }
    break;

  // The "Current Opportunity" details page
  case "/pages/edit/cdcurrentdevoppdetails.aspx":
    // Click the complete button
    if (document.getElementById("ctl00_btnAdd")) {
      setTimeout(function() {
        document.getElementById("ctl00_btnAdd").click();
      }, 200);
    }
    break;

  // The "Available Opportunities" page
  case "/pages/edit/cdavailabledevoppsummary.aspx":
    // If came from participating in a new opportunity
    if (document.referrer.indexOf("participantid") !== -1) {
      // Redirect to complete that opportunity
      window.location.href =
        "/pages/EDIT/CDCurrentDevOppSummary.aspx?USParams=PK=ESS";
    } else if (
      // if on the "Required" tab
      document
        .getElementsByClassName("selectedFilter")[0]
        .textContent.indexOf("Required") !== -1
    ) {
      // Switch to the "All" tab
      document.getElementById("ctl00_Content_AllLink").click();
    }
    break;
}
