const fetchCreatingOrigamiAndGoToEditor = async () => {
  try {
    const popupInput : HTMLInputElement | null = document.getElementById("popupInput") as HTMLInputElement;
    if (popupInput === null) {
      throw new Error("No popup button");
    }

    const newOrigamiName = popupInput.value;

    const url = 'http://localhost:8080/origami/new';
    const data = {
      userId: 1,
      origamiName:newOrigamiName
    }

    console.log(data);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        "Content-Type" : "application/json"
      },
      body: JSON.stringify(data)
    });


    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }
    const result = await response.json();
    console.log("Data fetched successfully:", result);

    // store id of origami to edit in editor
    localStorage.setItem("currentOrigamiIdForEditor", result.data);

    // Navigate to editor
     window.location.href = "http://localhost:5173/frontend/paper/view/origami_editor/editor.html";
  } catch (err) {
    console.error("Error fetching data:", err);
  }
};





// Open Popup
function openPopup() {
  const exists = document.getElementById("popup");
  if (exists !== null) {
    exists.style.display = "flex";
  }

}

// Close Popup
function closePopup() {
  const exists = document.getElementById("popup");
  if (exists !== null) {
    exists.style.display = "none";
  }

}