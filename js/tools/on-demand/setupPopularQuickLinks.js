// [Gunnar Richards]
ajaxPostBackStart("Please wait... This will only take a moment.");
$("#divAjaxProgress")
  .clone()
  .attr("id", "toolkit-block")
  .css("z-index", "90000001")
  .appendTo("body");
ajaxPostBackEnd();

// Get Current Category ID
let intQLCategoryID = document.getElementsByName("intQLCategoryID")[1].value;
let lngResourceID = document.getElementsByName("lngResourceID")[1].value;

let today = new Date();
let dd = today.getDate();
let mm = today.getMonth() + 1; // January is 0!
let yyyy = today.getFullYear();

if (dd < 10) dd = "0" + dd;
if (mm < 10) mm = "0" + mm;
today = mm + "/" + dd + "/" + yyyy;

const params = {
  lngResourceID: lngResourceID,
  intQLCategoryID: intQLCategoryID,
  txtCategoryIDListSave: intQLCategoryID,
  strResourceType: "M",
  strAction: "qlLinkSave",
  strActionSubmit: 0,
  save: "Save and Publish",
  ysnSave: 1,
  dtiStartDate: today
};

function addQuickLink(title, url = "/") {
  return $.ajax({
    type: "POST",
    url: `https://${document.location.hostname}/admin/quicklinks.aspx`,
    data: {
      ...params,
      txtLink: url,
      txtLinkText: title
    }
  }).then(() => {
    console.log(`Created [${title}]: ${url}`);
  });
}

(async () => {
  await addQuickLink("Home", "/");
  await addQuickLink("Site Map", "/sitemap");
  await addQuickLink("Contact Us", "/directory.aspx");
  await addQuickLink("Accessibility", "/accessibility");
  await addQuickLink("Copyright Notices", "/copyright");
  await addQuickLink("Privacy Policy", "/privacy");

  setTimeout(function() {
    location.reload();
  }, 2000);
})();
