document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("fetchStatements");
  if (button) {
    button.addEventListener("click", () => {
      // Send a message to the content script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "fetchData" },
          (response) => {
            // Handle the response from content script
            if (response) {
              button.innerText = response.message;
              button.disabled = true;
            }
          }
        );
      });
    });
  } else {
    console.error('Element with id "fetchStatements" not found');
  }

  const additionalButtons = document.querySelectorAll("[data-btn]");

  if (additionalButtons) {
    console.log(additionalButtons);
    for (const button of additionalButtons) {
      button.addEventListener("click", () => {
        console.log("click")
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.tabs.sendMessage(
            tabs[0].id,
            { action: "fetchData", nMonthsBefore: button.dataset.monthsBefore },
            (response) => {
              if (response) {
                button.innerText = response.message;
                button.disabled = true;
              }
            }
          );
        });
      });
    }
  }
});
