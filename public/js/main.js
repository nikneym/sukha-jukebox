let search, addToQueue;
let resetInfoBox;

document.addEventListener("alpine:init", () => {
  console.log("ready to go!");
  const searchArea = document.querySelector("input.search");
  searchArea.focus();

  const infoBox = document.querySelector("#wrapper #response");
  const green = "#1db954";
  const red   = "#ff5555";

  // store up
  Alpine.store("tracks", []);
  Alpine.store("box", {
    on: false,
    message: ""
  });

  resetInfoBox = function() {
    Alpine.store("box", {
      on: false,
      message: ""
    });

    infoBox.style.background = "";
  }

  let timer;
  showInfoBox = function(status, message) {
    infoBox.style.background = status ? green : red;
    Alpine.store("box", {
      on: true,
      message: message
    });

    clearTimeout(timer);
    timer = setTimeout(resetInfoBox, 1250); // reset
  }

  search = async function(input) {
    if (!input || input === "") { return }
    const res = await fetch("/search/" + input, {
      method: "GET",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json"
      }
    });

    const data = await res.json();
    if (!data || !data.q === input || data.error === 400) {
      return Alpine.store("tracks", []);
    }

    return Alpine.store("tracks", data.items);
  }

  let lastPlayedId;
  addToQueue = async function(id) {
    if (id === lastPlayedId) { await showInfoBox(false, "Aynı parçaya tekrar tıkladın!"); return }
    lastPlayedId = id;

    const res = await fetch("/que", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: id
      })
    });

    const { status, message } = await res.json();
    //console.log(status, message); // for testing purposes
    await showInfoBox(status, message);
  }
});