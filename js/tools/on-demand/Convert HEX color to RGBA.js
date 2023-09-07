// From https://stackoverflow.com/a/21648508
function hexToRgbA(hex) {
  var c;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split("");
    if (c.length == 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = "0x" + c.join("");
    return "rgba(" + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(",") + ",1)";
  }
  alert("Invalid hex color.");
}

function copyText(text) {
  var $inputTemp = $("<input>");
  $inputTemp.appendTo("body");
  $inputTemp.val(text).select();
  document.execCommand("copy");
  $inputTemp.remove();
}

var hexColor = prompt("Type or paste a HEX color value here. The RGBA conversion will be copied to your clipboard.");
if (hexColor) {
  if (hexColor.indexOf("#") == -1) {
    hexColor = "#" + hexColor;
  }
  var resultColor = hexToRgbA(hexColor);
  copyText(resultColor);
}
