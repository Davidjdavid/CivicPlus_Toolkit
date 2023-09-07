console.log("[CP Toolkit] Detecting if this site is a CivicPlus site. If not, a 404 error below this is normal.");
var thePromise = new Promise(function(resolve, reject) {
  var fileTestRequest = new XMLHttpRequest();
  fileTestRequest.open("Head", "/Assets/Mystique/Shared/Components/ModuleTiles/Templates/cp-Module-Tile.html");
  fileTestRequest.onload = function() {
    var hasTestFile = fileTestRequest.status == 200;
    resolve(hasTestFile);
  };
  fileTestRequest.onerror = reject;
  fileTestRequest.send();
});
async function detect_if_cp_site(callback) {
  var isCPsite = await thePromise;
  if (isCPsite) {
    callback();
  }
}
