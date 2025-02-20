
/**
 * This is the file that deals with any logic inside the community board:
 *  + create new origami
 *  + look at public origami
 */
const USER_ID = 1;


// this is the type of data that backend sends when loading all public origami
type OrigamiProfile = {
  origamiId: number,
  origamiName: string,
  author: string,
  ratings: number};


/**
 * This is the function that runs when the user creates a new origami
 */
const fetchCreatingOrigamiAndGoToEditor = async () => {
  try {
    const popupInput : HTMLInputElement | null = document.getElementById("popupInput") as HTMLInputElement;
    if (popupInput === null) {
      throw new Error("No popup button");
    }

    const newOrigamiName = popupInput.value;

    const url = 'http://localhost:8080/origami/new';
    const data = {
      userId: USER_ID,
      origamiName:newOrigamiName
    }


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
    console.log(result);
    console.log("Data fetched successfully:", result.data.origamiId);

    // store id of origami to edit in editor
    localStorage.setItem("currentOrigamiIdForEditor", result.data.origamiId);
    clearUserInputForName();

    // Navigate to editor
    window.location.href = "http://localhost:5173/frontend/paper/view/origami_editor/editor.html";
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


    const response = await fetch(url, {
      method: 'GET',
      headers: {
        "Content-Type" : "application/json"
      }
    });


    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }
    const result = await response.json();
    console.log(result);

    createAllOrigamiDomObjects(result.data.origamis);


  } catch (err) {
    console.error("Error fetching data:", err);
  }
};


/**
 * this creates all the origami profiles and adds them to the webpage
 * @param listOfPublicOrigami the list of origmai profiles to add
 */
function createAllOrigamiDomObjects(listOfPublicOrigami: OrigamiProfile[]) {
  console.log(listOfPublicOrigami);
  for(let i = 0; i < listOfPublicOrigami.length; i++) {
    let oneProfileDom = createProfile(listOfPublicOrigami[i]);
    document.getElementById("main-board")?.appendChild(oneProfileDom);
  }
}


/**
 * This creates a single profile HTMl element
 * @param profile - the profile to create an HTMl element from
 * @returnsteh html profile element
 */
function createProfile(profile: OrigamiProfile) : HTMLElement {
  const base = document.createElement("div");
  base.classList.add("card");

  // Image element
  const image = document.createElement("img");
  image.src = "crane_blue.png";
  image.alt = `${profile.origamiName} image`;
  image.classList.add("origami-image");

  // generate children elements
  const title = document.createElement("p");
  title.textContent = profile.origamiName;
  title.classList.add("title");

  const lineBreak = document.createElement("hr");

  const author = document.createElement("p");
  author.textContent = profile.author;

  const ratings = document.createElement("p");

  ratings.textContent = "Rating:" + stars(profile.ratings);

  // attach to base
  base.appendChild(image);
  base.appendChild(title);
  base.appendChild(lineBreak);
  base.appendChild(author);
  base.appendChild(ratings);


  return base;
}

/**
 * returns the floored amount of starts as a string
 * @param amount - the floored amount of stars
 * @returns a string of floor amount of stars
 */
function stars(amount : number) {
  let result = "★";
  for (let i = 0; i < amount; i++) {
    result += "★";
  }

  return result;
}

// Open Popups
function openPopup() {
  const exists = document.getElementById("popup");
  if (exists !== null) {
    exists.style.display = "flex";
  }

}

// Close Popups
function closePopup() {
  const exists = document.getElementById("popup");
  if (exists !== null) {
    clearUserInputForName();
    exists.style.display = "none";
  }
}

// resets the text input when creating a new origami
function clearUserInputForName() {
  const popupInput : HTMLInputElement | null = document.getElementById("popupInput") as HTMLInputElement;
  if (popupInput === null) {
    throw new Error("No popup button");
  }

  popupInput.value = "";

}

// load in public origami
getAllPublicOrigami();