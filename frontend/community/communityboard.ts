/**
 * This is the file that deals with any logic inside the community board:
 *  + create new origami
 *  + look at public origami
 */

// Global variable to store the list of origami profiles
let origamiProfiles: OrigamiProfile[] = [];

// this is the type of data that backend sends when loading all public origami
type OrigamiProfile = {
  origamiId: number,
  origamiName: string,
  author: string,
  ratings: number
};

/**
 * Verifies the token and user ID stored in localStorage.
 * It calls the backend endpoint (e.g. /user/getUserId) which returns the current user.
 * If the token is invalid or the user ID doesn't match, the user is redirected to the login page.
 */
const verifyUser = async (): Promise<boolean> => {
  const token = localStorage.getItem('authToken');
  const storedUserId = localStorage.getItem('userId');

  if (!token || !storedUserId) {
    alert("You are not logged in.");
    redirectTo("http://localhost:5173/frontend/user/login");
    return false;
  }

  try {
    const response = await fetch('http://localhost:8080/user/getUserId', {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    // If the token is invalid or expired, the backend should return an error status.
    if (!response.ok) {
      alert("Your login session has expired. Please log in again.");
      redirectTo("http://localhost:5173/frontend/user/login");
      return false;
    }

    const result = await response.json();
    // Assuming your backend returns an object with user details, for example: { id: 123, username: "foo", ... }
    if (result.id.toString() !== storedUserId) {
      alert("User information does not match. Please log in again.");
      redirectTo("http://localhost:5173/frontend/user/login");
      return false;
    }
  } catch (error) {
    console.error("Verification error:", error);
    alert("An error occurred during verification. Please log in again.");
    redirectTo("http://localhost:5173/frontend/user/login");
    return false;
  }

  return true;
};

/**
 * Redirects the user to the specified URL
 * @param url
 */
const redirectTo = (url: string) => {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
};


/**
 * This is the function that runs when the user creates a new origami
 * @see frontend/community/communityboard.html
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const fetchCreatingOrigamiAndGoToEditor = async () => {
  try {
    const popupInput = document.getElementById("popupInput") as HTMLInputElement | null;
    if (popupInput === null) {
      throw new Error("No popup input found");
    }
    const newOrigamiName = popupInput.value;
    const url = 'http://localhost:8080/origami/new';
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    const data = { userId, origamiName: newOrigamiName };

    const verified = await verifyUser();
    if (!verified) {
      console.error("User verification failed.");
      alert("Profile mismatch detected. Please log in again.");
      redirectTo("http://localhost:5173/frontend/user/login.html");
      return;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      if (response.status === 403) {
        alert("Your login session has expired. Please log in again.");
        redirectTo("http://localhost:5173/frontend/user/login");
      } else {
        console.error("Failed to fetch data");
      }
      return;
    }
    const result = await response.json();
    console.log(result);
    console.log("Data fetched successfully:", result.data.origamiId);

    // store id of origami to edit in editor
    localStorage.setItem("currentOrigamiIdForEditor", result.data.origamiId);
    clearUserInputForName();

    // Navigate to editor
    redirectTo("http://localhost:5173/frontend/paper/view/origami_editor/editor.html");
  } catch (err) {
    console.error("Error fetching data:", err);
  }
};

/**
 * This is the function that runs when the user loads all public origami
 */
const getAllPublicOrigami = async () => {
  try {
    const url = 'http://localhost:8080/origami/list';
    const token = localStorage.getItem('authToken');

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 403) {
        alert("Your login session has expired. Please log in again.");
        redirectTo("http://localhost:5173/frontend/user/login");
      } else {
        console.error("Failed to fetch data");
      }
      return;
    }
    const result = await response.json();
    console.log(result);

    // Store the list in the global variable
    origamiProfiles = result.data.origamis;
    // Render the list of origami cards
    renderOrigamiCards(origamiProfiles);

  } catch (err) {
    console.error("Error fetching data:", err);
  }
};

/**
 * Renders the origami cards from the provided list
 * @param profiles List of origami profiles to render
 */
function renderOrigamiCards(profiles: OrigamiProfile[]) {
  const mainBoard = document.getElementById("main-board");
  if (!mainBoard) return;

  // Clear the container
  mainBoard.innerHTML = "";

  // Create and append each profile card
  profiles.forEach(profile => {
    const cardElement = createProfile(profile);
    mainBoard.appendChild(cardElement);
  });
}

/**
 * This creates a single profile HTML element (card)
 * @param profile - the profile to create an HTML element from
 * @returns the HTML element for the profile card
 */
function createProfile(profile: OrigamiProfile): HTMLElement {
  const base = document.createElement("div");
  base.classList.add("card");

  // Image element
  const image = document.createElement("img");
  image.src = "crane_blue.png";
  image.alt = `${profile.origamiName} image`;
  image.classList.add("origami-image");

  // Generate children elements
  const title = document.createElement("p");
  title.textContent = profile.origamiName;
  title.classList.add("title");

  const lineBreak = document.createElement("hr");

  const author = document.createElement("p");
  author.textContent = profile.author;

  const ratings = document.createElement("p");
  ratings.textContent = "Rating: " + stars(profile.ratings);

  // Attach to base
  base.appendChild(image);
  base.appendChild(title);
  base.appendChild(lineBreak);
  base.appendChild(author);
  base.appendChild(ratings);

  return base;
}

/**
 * Returns a string of stars representing the rating
 * @param amount - the floored amount of stars
 * @returns a string of stars
 */
function stars(amount: number): string {
  let result = "★";
  for (let i = 0; i < amount; i++) {
    result += "★";
  }
  return result;
}

/*
 * Open Popups
 * @see frontend/community/communityboard.html
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function openPopup() {
  const exists = document.getElementById("popup");
  if (exists !== null) {
    exists.style.display = "flex";
  }
}

/*
 * Close Popups
 * @see frontend/community/communityboard.html
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function closePopup() {
  const exists = document.getElementById("popup");
  if (exists !== null) {
    clearUserInputForName();
    exists.style.display = "none";
  }
}

// Resets the text input when creating a new origami
function clearUserInputForName() {
  const popupInput = document.getElementById("popupInput") as HTMLInputElement | null;
  if (popupInput === null) {
    throw new Error("No popup input found");
  }
  popupInput.value = "";
}

// Add search functionality to filter origami cards by author
const searchInput = document.getElementById("search") as HTMLInputElement | null;
if (searchInput) {
  searchInput.addEventListener("input", (event) => {
    const query = (event.target as HTMLInputElement).value.toLowerCase();

    // Filter the global list of origami profiles by author
    const filteredProfiles = origamiProfiles.filter(profile =>
        profile.author.toLowerCase().includes(query)
    );

    // Re-render the cards based on the filtered list
    renderOrigamiCards(filteredProfiles);
  });
}

// Load public origami when the page is ready
getAllPublicOrigami();