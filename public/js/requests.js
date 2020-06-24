var app = new Vue({
  el: "#app",
  data: {
    requests: [],
  },
  methods: {
    async upvoteRequest(id) {
      const vote = firebase.functions().httpsCallable("upvote");
      try {
        await vote({ id });
      } catch (err) {
        this.showNotification(err.message);
      }
    },
    showNotification(message) {
      const notification = document.querySelector(".notification");
      notification.textContent = message;
      notification.classList.add("active");
      setTimeout(() => {
        notification.classList.remove("active");
        notification.textContent = "";
      }, 4000);
    },
  },
  mounted() {
    const ref = firebase
      .firestore()
      .collection("requests")
      .orderBy("upvotes", "desc");
    ref.onSnapshot((snapshot) => {
      const requests = [];
      snapshot.forEach((doc) => {
        requests.push({ ...doc.data(), id: doc.id });
      });
      this.requests = requests;
    });
  },
});
