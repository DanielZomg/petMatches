// —————————————————————————————————————————
//  1) Members
// —————————————————————————————————————————
const users = [ "Hope", "Z0mgphunk", "Miyu", "te Cain", "Dale", "Magdalina", "Air", "Mialyno",
                "gon Fruit", "Mankone", "Aramos", "te LadyMarion", "te Victor", "MiraSnow",
                "nati&nasti", "Maestro98", "PaniKotačka", "WickedWitch", "Daenerys",
                "Кери", "Lord Edward", "Roberta", "MarcyQueen", "ScrappyCocco",
                "tinchen", "Eloisya", "Maiwenna", "Astilabora", "Sunshine",
                "Anaïs", "Artémis", "Pégase", "kepat", "Dihya", "Aeslin",
                "Amoux", "Octavie Semper", "Rüffel", "Aliénor"];

// —————————————————————————————————————————
//  2) Bloodlines & their two bold attributes
// —————————————————————————————————————————
const skillList = [
  "Masquerade Ball",
  "Negotiations",
  "War of Conquest",
  "School of Athens",
  "Dragon Island Treasure Hunt",
  "Knight Parades",
  "Mystery Murder",
  "Realm Revival",
  "Siege of the Undead",
  "Ballroom",
  "Dragon Bounty",
  "Dragon Island",
  "Nibelungen Treasure",
  "Pet Race",
  "Texas Hold'em",
  "Royal Mines",
  "Scarlet Beauty",
  "Snow Mountain Exploration",
  "Twilight Castle",
  "Uncharted Waters",
  "War of Lions (Fortress War)",
  "War of Lions (Supply Reserves)"
];

const skillAttrs = {
  "Masquerade Ball": ["Intelligence",  "Liveliness"],
  "Negotiations": ["Obedience", "Physique"],
  "War of Conquest": ["Physique", "Liveliness"],
  "School of Athens": ["Intelligence", "Obedience"],
  "Dragon Island Treasure Hunt": ["Intelligence", "Friendliness"],
  "Knight Parades": ["Intelligence", "Friendliness"],
  "Mystery Murder": ["Obedience", "Liveliness"],
  "Realm Revival": ["Physique", "Friendliness"],
  "Siege of the Undead": ["Obedience", "Friendliness"],
  "Ballroom": ["Intelligence", "Obedience"],
  "Dragon Bounty": ["Physique", "Friendliness"],
  "Dragon Island": ["Liveliness", "Friendliness"],
  "Nibelungen Treasure": ["Obedience", "Friendliness"],
  "Pet Race": ["Intelligence", "Physique"],
  "Texas Hold'em": ["Intelligence", "Liveliness"],
  "Royal Mines": ["Liveliness", "Friendliness"],
  "Scarlet Beauty": ["Intelligence", "Physique"],
  "Snow Mountain Exploration": ["Physique", "Liveliness"],
  "Twilight Castle": ["Liveliness", "Obedience"],
  "Uncharted Waters": ["Physique", "Liveliness"],
  "War of Lions (Fortress War)": ["Intelligence", "Friendliness"],
  "War of Lions (Supply Reserves)": ["Physique", "Obedience"]
};

// —————————————————————————————————————————
//  3) Pets - will be populated from Google Sheets
// —————————————————————————————————————————
let pets = [];

// Google Sheets JSON URL
const PETS_JSON_URL = "https://docs.google.com/spreadsheets/d/1dugaEHpf8IVVkN5WeX6OwSAtIYoRNzATCFaLkJgou8o/gviz/tq?tqx=out:json&sheet=Pets";

// —————————————————————————————————————————
//  4) Bloodline helper
// —————————————————————————————————————————
const bloodRank = { None:0, Bronze:1, Silver:2, Gold:3 };

// —————————————————————————————————————————
//  5) Data fetching
// —————————————————————————————————————————

async function fetchPets() {
  try {
    const response = await fetch(PETS_JSON_URL);
    const text = await response.text();

    // Remove the wrapper function from the Visualization API response
    const json = JSON.parse(text.substring(47).slice(0, -2));
    const table = json.table;

    // Get valid headers (non-empty labels only)
    const headers = table.cols
      .map(col => col.label)
      .filter(label => label); // remove empty labels from unnamed columns

    // Map rows to objects using the filtered headers
    pets = table.rows.map(row => {
      const pet = {};
      let headerIndex = 0;

      // We only iterate over non-empty headers, skipping empty columns
      for (let i = 0; i < table.cols.length; i++) {
        const colLabel = table.cols[i].label;
        if (!colLabel) continue; // skip unnamed/empty columns

        const cell = row.c[i];
        let value = cell ? cell.v : '';
        const key = headers[headerIndex++];

        // Trim the value if it's a string
        if (typeof value === 'string') {
          value = value.trim();
        }

        // If the column is 'bold1Value' or 'bold2Value', parse as integers
        if (key == 'bold1Value' || key == 'bold2Value') {
          pet[key] = parseInt(value, 10) || 0;
        } else {
          pet[key] = value; // this now uses the trimmed version!
        }
      }

      return pet;
    });

    console.log(`✅ Loaded ${pets.length} pets`);
    if (document.getElementById("searchApp")) initSearchApp();
    if (document.getElementById("petsApp")) initMyPetsApp();

  } catch (error) {
    console.error("❌ Error fetching pets data:", error);

    // Display error and fallback
    const errorMsg = document.createElement('div');
    errorMsg.className = 'error-message';
    errorMsg.innerHTML = `
      <p>Error loading pets data from Google Sheets. ${error.message}</p>
      <p>Using fallback data instead.</p>
    `;
    document.body.prepend(errorMsg);

    // Fallback pet data
    pets = [
      {
        owner: "Z0mgphunk",
        name: "Milkshake",
        species: "Cat",
        breed: "Bengal",
        bold1Value: 72,
        bold2Value: 72,
        skill: "Uncharted Waters",
        bloodline: "Gold"
      }
    ];

    if (document.getElementById("searchApp")) initSearchApp();
    if (document.getElementById("petsApp")) initMyPetsApp();
  }
}

// —————————————————————————————————————————
//  6) Entry point - modified to fetch data first
// —————————————————————————————————————————
window.addEventListener("DOMContentLoaded", fetchPets);

// —————————————————————————————————————————
//  7) Search Pets page
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

  // Sort the list by owner name alphabetically
  list.sort((a, b) => a.owner.localeCompare(b.owner));

  // headers
  let html = `
    <table>
      <tr>
        <th>Owner</th><th>Name</th><th>Breed</th><th>Required Attribute 1</th><th>Required Attribute 2</th>
        <th>Bloodline</th><th>Skill</th>
      </tr>`;

  list.forEach(p=>{
    const [a1,a2] = skillAttrs[p.skill];
    html += `
      <tr>
        <td>${p.owner}</td>
        <td>${p.name}</td>
        <td>${p.breed}</td>
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
//  8) "Our pets" page
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

  // Check if the list has items before trying to access skills
  if (list.length === 0) return d.innerHTML = "<p>No pets for this user.</p>";

  let html = `
    <h3>${username}'s Pets</h3>
    <table>
      <tr><th>Name</th><th>Breed</th>
          <th>Required Attribute 1</th><th>Required Attribute 2</th>
          <th>Bloodline</th><th>Skill</th>
      </tr>`;

  list.forEach(p=>{
    const [a1,a2] = skillAttrs[p.skill];
    html += `
      <tr>
        <td>${p.name}</td>
        <td>${p.breed}</td>
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
//  9) Add loading indicator
// —————————————————————————————————————————
function showLoading() {
  const loadingDiv = document.createElement('div');
  loadingDiv.id = 'loading';
  loadingDiv.innerHTML = 'Loading pet data...';
  loadingDiv.style.cssText = 'padding: 20px; text-align: center; font-weight: bold;';

  if (document.getElementById("searchApp")) {
    document.getElementById("searchApp").innerHTML = '';
    document.getElementById("searchApp").appendChild(loadingDiv);
  }

  if (document.getElementById("petsApp")) {
    document.getElementById("petsApp").innerHTML = '';
    document.getElementById("petsApp").appendChild(loadingDiv);
  }
}

// Dark Mode toggle functionality
function setupDarkMode() {
  const toggleSwitch = document.querySelector('#checkbox');
  const currentTheme = localStorage.getItem('theme');

  // Check for saved theme preference
  if (currentTheme) {
    document.body.classList.add(currentTheme);
    if (currentTheme === 'dark-mode') {
      toggleSwitch.checked = true;
    }
  }

  // Theme switch event handler
  toggleSwitch.addEventListener('change', function(e) {
    if (e.target.checked) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', '');
    }
  });
}

// Show loading indicator before fetching data
window.addEventListener("DOMContentLoaded", () => {
  showLoading();
  fetchPets();
  setupDarkMode(); // To initialise dark mode
});
