function copyText(code) {
  var $inputTemp = $("<input>");
  $inputTemp.appendTo("body");
  $inputTemp.val(code).select();
  document.execCommand("copy");
  $inputTemp.remove();
}

$.getJSON("/data/fancy-button-library.json", function(modules) {
  $(".type-container")
    .not(".large")
    .click(function() {
      if ($(this).hasClass("clicked")) {
      } else {
        var $notification = $(".toast__container");
        $notification.css("opacity", "0");
        $notification.fadeTo("slow", 1);
        $(this).toggleClass("clicked");
        $(".type-container")
          .not(this)
          .removeClass("clicked");
        var $thisBtn = "fancyBtn_sec" + $(this).attr("data-sec-id") + "_" + $(this).attr("data-btn-id");
        var $thisResults = JSON.stringify(modules.FancyButtons[$thisBtn]);
        copyText($thisResults);
      }
    });
});

// Notification $
jQuery(document).ready(function() {
  jQuery(".toast__close").click(function(e) {
    e.preventDefault();
    // var parent = $(this).parent('.toast');
    // parent.fadeOut("slow", function() { $(this).remove(); } );
    var base = $(".toast__container");
    base.fadeTo("slow", 0);
  });
});
