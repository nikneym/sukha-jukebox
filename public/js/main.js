let search, addToQueue;

document.addEventListener("alpine:init", () => {
  console.log("ready to go!");
  document.querySelector("input.search").focus();

  Alpine.store("tracks", []);
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
    if (id === lastPlayedId) { console.log("Parça zaten sıraya eklendi. (client-side)"); return }
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

    const data = await res.json();
    console.log(data.message);
  }
});