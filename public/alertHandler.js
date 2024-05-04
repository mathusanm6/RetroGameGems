/*eslint-disable*/

// Function to decode URI components for messages
function decodeUriComponent(input) {
  return decodeURIComponent(input.replace(/\+/g, " "));
}

$(document).ready(function () {
  const urlParams = new URLSearchParams(window.location.search);
  const success = urlParams.get("success");
  const message = urlParams.get("message");

  if (message) {
    const decodedMessage = decodeUriComponent(message);
    const alertType = success === "true" ? "success" : "danger";
    const alertId = `#${alertType}Alert`;
    const messageId = `#${alertType}Message`;

    $(messageId).text(decodedMessage);
    $(alertId).show();

    // Auto-hide after 5 seconds
    setTimeout(() => $(alertId).hide(), 5000);

    // Remove query params from URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  // Listener for close button clicks in alerts
  $(".alert .close").click(function () {
    $(this).parent().hide();
  });
});

/*eslint-enable*/
