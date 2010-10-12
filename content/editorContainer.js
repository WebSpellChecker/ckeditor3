function FillInHTMLTooltip(tipElement) {
    var retVal = false;
    if (tipElement.namespaceURI == "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul") {
        return retVal;
    }
    const XLinkNS = "http://www.w3.org/1999/xlink";
    var titleText = null;
    var XLinkTitleText = null;
    while (!titleText && !XLinkTitleText && tipElement) {
        if (tipElement.nodeType == Node.ELEMENT_NODE) {
            titleText = tipElement.getAttribute("title");
            XLinkTitleText = tipElement.getAttributeNS(XLinkNS, "title");
        }
        tipElement = tipElement.parentNode;
    }
    var texts = [titleText, XLinkTitleText];
    var tipNode = document.getElementById("aHTMLTooltip");
    for (var i = 0; i < texts.length; ++i) {
        var t = texts[i];
        if (t && t.search(/\S/) >= 0) {
            tipNode.setAttribute("label", t.replace(/\s+/g, " "));
            retVal = true;
        }
    }
    return retVal;
}

// This function takes care of passing the window.arguments to the editor.html window
// If the open.dialog is called with editor.html instead of the .xul file it works automatically
function mozeditor_SetupArgs(e) {
	// Remove it so it's called only once
	window.removeEventListener("DOMContentLoaded", mozeditor_SetupArgs, false);
	// Add the property to the window object
	document.getElementById("browser1").contentWindow.arguments = window.arguments ;
}

window.addEventListener("DOMContentLoaded", mozeditor_SetupArgs, false);