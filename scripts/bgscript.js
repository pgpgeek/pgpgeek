browser.runtime.onMessage.addListener( async message => {
  console.log('plop',message.tabId);
  // Get the existing message.
  browser.compose.getComposeDetails(message.tabId).then(details => {
    if  (details.isPlainText  || message.message.indexOf('-----BEGIN PGP MESSAGE-----') != -1) {
      // The message is being composed in plain text mode.
      let body = details.plainTextBody;
      // Make direct modifications to the message text, and send it back to the editor.
      body =  message.message;
      browser.compose.setComposeDetails(message.tabId, { plainTextBody: body, isPlainText:true });
    } else {
      // The message is being composed in HTML mode. Parse the message into an HTML document.
      let document = new DOMParser().parseFromString(message.message, "text/html");
      // Serialize the document back to HTML, and send it back to the editor.
      let html = new XMLSerializer().serializeToString(document);
      browser.compose.setComposeDetails(message.tabId, { body: html });
    }
  });
});