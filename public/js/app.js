const requestModal = document.querySelector(".new-request");
const requestLink = document.querySelector(".add-request");
const requestForm = document.querySelector(".new-request form");

// open request modal
requestLink.addEventListener("click", () => {
  requestModal.classList.add("open");
});

// close request modal
requestModal.addEventListener("click", (e) => {
  if (e.target.classList.contains("new-request")) {
    requestModal.classList.remove("open");
  }
});

//add request
requestForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const addRequest = firebase.functions().httpsCallable("addRequest");
    const res = await addRequest({ text: requestForm.request.value });
    requestForm.reset();
    requestModal.classList.remove("open");
    requestForm.querySelector(".error").textContent = "";
  } catch (err) {
    requestForm.querySelector(".error").textContent = err.message;
  }
});

//notification
const notification = document.querySelector(".notification");

const showNotification = (message) => {
  notification.textContent = message;
  notification.classList.add("active");
  setTimeout(() => {
    notification.classList.remove("active");
    notification.textContent = "";
  }, 4000);
};
