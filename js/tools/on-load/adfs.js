(function loadTool() {
  var thisTool = "adfs";
  chrome.storage.local.get(thisTool, function(settings) {
    if (
      (settings[thisTool] && window.location.pathname.toLowerCase().startsWith("/admin/saml/logonrequest")) ||
      ((window.location.hostname == "account.civicplus.com" ||
        window.location.hostname == "identityserver.cpqa.ninja") &&
        window.location.pathname.toLowerCase().startsWith("/identity/"))
    ) {
      console.log("[CP Toolkit] Loading " + thisTool);
      try {
        if (window.location.pathname.toLowerCase().startsWith("/admin/saml/logonrequest")) {
          $("form").remove();
          $(document).ready(function() {
            $("form").remove();
          });
          window.location = "//" + window.location.hostname + "/Admin/?saml=off";
          /*alert(
            "[CP Toolkit](adfs-redirect) Detected a SAML login. Redirecting to CP login page with SAML turned off."
          );*/
        } else if (
          (window.location.hostname == "account.civicplus.com" ||
            window.location.hostname == "identityserver.cpqa.ninja") &&
          window.location.pathname.toLowerCase().startsWith("/identity/")
        ) {
          $(document).ready(function() {
            if ($("#civicPlusAdfsUrl").length) {
              window.location = $("#civicPlusAdfsUrl").val();
            }
          });
        }
      } catch (err) {
        console.warn(err);
      }
    }
  });
})();
