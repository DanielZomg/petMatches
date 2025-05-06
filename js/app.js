// —————————————————————————————————————————
//  1) Members
// —————————————————————————————————————————
const users = [ "Hope", "Z0mgphunk", "Miyu", "te Cain", "Dale", "Magdalina", "Air", "Mialyno",
                "gon Fruit", "Mankone", "Aramos", "te LadyMarion", "te Victor", "MiraSnow"];

// —————————————————————————————————————————
//  2) Bloodlines & their two bold attributes
// —————————————————————————————————————————
const skillList = [
  "Uncharted Waters","Masquerade Ball","Negotiations","War of Conquest",
  "School of Athens","Dragon Island Treasure Hunt","Knight Parades"
  /* ...add the rest... */
];

const skillAttrs = {
  "Uncharted Waters": ["Physique", "Liveliness"],
  "Masquerade Ball": ["Intelligence",  "Liveliness"],
  "Negotiations": ["Obedience", "Physique"],
  "War of Conquest": ["Physique", "Liveliness"],
  "School of Athens": ["Intelligence", "Obedience"],
  "Dragon Island Treasure Hunt": ["Intelligence", "Friendliness"],
  "Knight Parades": ["Intelligence", "Friendliness"],
  /* ...add the rest... */
};

// —————————————————————————————————————————
//  3) Pets
// —————————————————————————————————————————
const pets = [
  {
    owner:       "Z0mgphunk",
    name:        "Milkshake",
    species:     "Cat",
    breed:       "Bengal",
    bold1Value:  72,
    bold2Value:  72,
    skill:       "Uncharted Waters",
    bloodline:   "Gold"
  },
  {
    owner:       "Z0mgphunk",
    name:        "Siri",
    species:     "Cat",
    breed:       "Siamese",
    bold1Value:  79,
    bold2Value:  76,
    skill:       "Masquerade Ball",
    bloodline:   "Gold"
  },
  {
    owner:       "Z0mgphunk",
    name:        "Egg Roll",
    species:     "Dog",
    breed:       "German Shepherd",
    bold1Value:  71,
    bold2Value:  76,
    skill:       "Negotiations",
    bloodline:   "Silver"
  },
  {
    owner:       "Z0mgphunk",
    name:        "Toon",
    species:     "Dog",
    breed:       "German Shepherd",
    bold1Value:  72,
    bold2Value:  77,
    skill:       "Negotiations",
    bloodline:   "Silver"
  },
  {
    owner:       "Miyu",
    name:        "Shippy",
    species:     "Cat",
    breed:       "Bengal",
    bold1Value:  86,
    bold2Value:  80,
    skill:       "Uncharted Waters",
    bloodline:   "Gold"
  },
];

// —————————————————————————————————————————
//  4) Bloodline helper
// —————————————————————————————————————————
/*
// Maybe for a future update?
function computeBloodline(a,b) {
  if (a>=90 && b>=90) return "Gold";
  if (a>=75 && b>=75) return "Silver";
  if (a>=60 && b>=60) return "Bronze";
  return "None";
}
*/
const bloodRank = { None:0, Bronze:1, Silver:2, Gold:3 };

// —————————————————————————————————————————
//  5) Entry point
// —————————————————————————————————————————
window.addEventListener("DOMContentLoaded",()=>{
  if (document.getElementById("searchApp")) initSearchApp();
  if (document.getElementById("petsApp"))   initMyPetsApp();
});

// —————————————————————————————————————————
//  6) Search Pets Page
// —————————————————————————————————————————
function initSearchApp() {
  const app = document.getElementById("searchApp");
  const breeds = [...new Set(pets.map(p => p.breed))].sort();

  app.innerHTML = `
    <h2>Search available pets</h2>
    <form id="filterForm">
      <label>Species:
        <select name="species">
          <option value="">All</option>
          <option>Cat</option><option>Dog</option>
        </select>
      </label>

      <label>Breed:
        <select name="breed">
          <option value="">All</option>
          ${breeds.map(b => `<option>${b}</option>`).join("")}
        </select>
      </label>

      <label>Bloodline ≥
        <select name="bloodline">
          <option value="">None</option>
          <option>Bronze</option><option>Silver</option><option>Gold</option>
        </select>
      </label>

      <!-- Skill comes before the bold-attribute filters -->
      <label>Skill:
        <select name="skill" id="skillSelect">
          <option value="">All</option>
          ${skillList.map(s => `<option>${s}</option>`).join("")}
        </select>
      </label>

      <!-- We give these labels IDs so we can rewrite them in JS -->
      <label id="lbl1">Bold1 ≥
        <input type="number" name="min1" value="0" min="0" max="100">
      </label>
      <label id="lbl2">Bold2 ≥
        <input type="number" name="min2" value="0" min="0" max="100">
      </label>

      <button type="submit">Search</button>
    </form>
    <div id="results"></div>
  `;

  // Dynamically relabel Bold1/Bold2 when skill changes
  const skillSelect = document.getElementById("skillSelect");
  const lbl1 = document.getElementById("lbl1");
  const lbl2 = document.getElementById("lbl2");

  skillSelect.addEventListener("change", () => {
    const skill = skillSelect.value;
    if (skill && skillAttrs[skill]) {
      const [a1, a2] = skillAttrs[skill];
      lbl1.firstChild.textContent = `${a1} ≥ `;
      lbl2.firstChild.textContent = `${a2} ≥ `;
    } else {
      lbl1.firstChild.textContent = `Bold1 ≥ `;
      lbl2.firstChild.textContent = `Bold2 ≥ `;
    }
  });

  // Filter logic
  document.getElementById("filterForm").addEventListener("submit", e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const species   = f.get("species");
    const breed     = f.get("breed");
    const bloodline = f.get("bloodline");
    const min1      = +f.get("min1");
    const min2      = +f.get("min2");
    const skill     = f.get("skill");

    const out = pets.filter(p => {
      if (species   && p.species !== species)    return false;
      if (breed     && p.breed   !== breed)      return false;
      if (p.bold1Value < min1)                   return false;
      if (p.bold2Value < min2)                   return false;
      if (skill     && p.skill   !== skill)      return false;

      // checking bloodline
      if (bloodline && bloodRank[p.bloodline] < bloodRank[bloodline])
        return false;

      return true;
    });

    renderResults(out);
  });
}

function renderResults(list){
  const d = document.getElementById("results");
  if (!list.length) return d.innerHTML = "<p>No pets found.</p>";

  // header uses the two attrs of the first pet's skill
  const [h1,h2] = skillAttrs[list[0].skill];
  let html = `
    <table>
      <tr>
        <th>Owner</th><th>Name</th><th>${h1}</th><th>${h2}</th>
        <th>Bloodline</th><th>Skill</th>
      </tr>`;

  list.forEach(p=>{
    const [a1,a2] = skillAttrs[p.skill];
    html += `
      <tr>
        <td>${p.owner}</td>
        <td>${p.name}</td>
        <td>${a1}: ${p.bold1Value}</td>
        <td>${a2}: ${p.bold2Value}</td>
        <td>${p.bloodline}</td>
        <td>${p.skill}</td>
      </tr>`;
  });

  html += "</table>";
  d.innerHTML = html;
}

// —————————————————————————————————————————
//  7) "Our pets" page (display (for now?))
// —————————————————————————————————————————
function initMyPetsApp(){
  const app = document.getElementById("petsApp");
  app.innerHTML = `
    <h2>Our pets</h2>
    <label>Select user:
      <select id="userSelect">
        <option value="">-- pick user --</option>
        ${users.map(u=>`<option>${u}</option>`).join("")}
      </select>
    </label>
    <div id="myPetsList"></div>
  `;

  document.getElementById("userSelect")
    .addEventListener("change", e=>{
      renderUserPets(e.target.value);
    });
}

function renderUserPets(username){
  const list = pets.filter(p=> p.owner === username );
  const d    = document.getElementById("myPetsList");
  if (!username) return d.innerHTML = "";
  if (!list.length) return d.innerHTML = "<p>No pets for this user.</p>";

  const [h1,h2] = skillAttrs[list[0].skill];
  let html = `
    <h3>${username}'s Pets</h3>
    <table>
      <tr><th>Name</th><th>Breed</th>
          <th>${h1}</th><th>${h2}</th>
          <th>Bloodline</th><th>Skill</th>
      </tr>`;

  list.forEach(p=>{
    html += `
      <tr>
        <td>${p.name}</td>
        <td>${p.breed}</td>
        <td>${h1}: ${p.bold1Value}</td>
        <td>${h2}: ${p.bold2Value}</td>
        <td>${p.bloodline}</td>
        <td>${p.skill}</td>
      </tr>`;
  });

  html += "</table>";
  d.innerHTML = html;
}
