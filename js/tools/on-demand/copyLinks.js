function _fallbackCopyToClipboard(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand("copy");
    const msg = successful ? "successful" : "unsuccessful";
    console.log("Fallback: Copying text command was " + msg);
  } catch (err) {
    console.error("Fallback: Oops, unable to copy", err);
  }

  document.body.removeChild(textArea);
}

function copyToClipboard(text) {
  if (!navigator.clipboard) {
    _fallbackCopyToClipboard(text);
    return;
  }

  navigator.clipboard.writeText(text).then(
    function() {
      console.log("Async: Copying to clipboard was successful!");
    },
    function(err) {
      console.error("Async: Could not copy text: ", err);
      _fallbackCopyToClipboard(text);
    }
  );
}

function copyLinks() {
  const sel = getSelection();
  const range = sel.getRangeAt(0);
  const elems = range.commonAncestorContainer.querySelectorAll("a");
  const links = [...elems].filter(
    (elem) => sel.containsNode(elem) || elem.contains(sel.anchorNode) || elem.contains(sel.extentNode)
  );

  const details = links.map((elem) => [elem.innerText, elem.href]);
  copyToClipboard(JSON.stringify(details));
}

copyLinks();
