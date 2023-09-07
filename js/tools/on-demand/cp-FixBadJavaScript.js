var cp_fixJavaScript = `
if ($("body").hasClass("liveEditOn")) {
  alert("Live Edit must be turned OFF.");
} else {
    if (window.location.href.indexOf("/Admin") > -1) {
      alert("You need to be on a front-end page with Live Edit OFF to use this tool :)");
      console.log("You need to be on a front-end page with Live Edit OFF to use this tool :)");
    }
    else {
      document.write = () => { };
      console.log("[CPToolbox] JavaScript Fixed");
      alert("JavaScript Fixed. Turn Live Edit ON and resolve :)")
    }
}
`;

var script = document.createElement("script");
script.innerHTML = cp_fixJavaScript;
document.body.appendChild(script);
