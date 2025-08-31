// ---------------- PRODUCTS ----------------
const products = [
  {id:1, name:"Organic Apples", price:120, tag:"Produce", img:"https://images.unsplash.com/photo-1567306226416-28f0efdc88ce"},
  {id:2, name:"Whole Wheat Bread", price:45, tag:"Bakery", img:"https://images.unsplash.com/photo-1549931319-a545dcf3bc73"},
  {id:3, name:"Almond Milk", price:199, tag:"Beverages", img:"https://i.pinimg.com/736x/f0/1b/85/f01b85f69f1bc0daad7a3669f8d21223.jpg"},
  {id:4, name:"Free-range Eggs", price:80, tag:"Poultry", img:"https://i.pinimg.com/1200x/38/47/57/3847570fa2807f01204f59601d62af04.jpg"},
  {id:5, name:"Granola Cookies", price:99, tag:"Snacks", img:"https://i.pinimg.com/736x/2e/17/33/2e1733debae7cc0d672f7595de7ca7d8.jpg"},
  {id:6, name:"Basmati Rice 5kg", price:499, tag:"Grains", img:"https://i.pinimg.com/1200x/3c/22/ab/3c22abde6083df6ac25192f73d990665.jpg"},
  {id:7, name:"Bananas", price:40, tag:"Produce", img:"https://images.unsplash.com/photo-1603833665858-e61d17a86224"},
  {id:8, name:"Cheddar Cheese", price:149, tag:"Dairy", img:"https://i.pinimg.com/1200x/60/09/3d/60093db2b2ab4e642f5deea6dc0a96b7.jpg"}
];

const grid = document.getElementById('grid');
const drawer = document.getElementById('drawer');
const listEl = document.getElementById('list');
const toast = document.getElementById('toast');
const search = document.getElementById('search');
const langSelect = document.getElementById('lang');

// Create a container for suggestions inside the drawer
let suggestionsEl = document.getElementById('suggestions');
if (!suggestionsEl) {
  suggestionsEl = document.createElement("div");
  suggestionsEl.id = "suggestions";
  suggestionsEl.className = "mt-6 text-sm text-blue-600";
  drawer.querySelector(".absolute").appendChild(suggestionsEl);
}

// ---------------- UI RENDER ----------------
function card(p){
  return `<div class="bg-white rounded-2xl p-3 card-hover shadow-md">
    <img src="${p.img}" alt="${p.name}" class="h-40 w-full object-cover rounded-lg">
    <div class="mt-3">
      <div class="font-semibold">${p.name}</div>
      <div class="text-sm text-gray-600">₹${p.price} • ${p.tag}</div>
      <div class="mt-3 flex space-x-2">
        <button class="px-3 py-2 rounded-xl bg-black text-white text-sm" onclick="quickAdd('${p.name}')">Add</button>
        <button class="px-3 py-2 rounded-xl border text-sm" onclick="openList()">View List</button>
      </div>
    </div>
  </div>`;
}

function renderGrid(items=products){
  grid.innerHTML = items.map(card).join('');
}
renderGrid();

search?.addEventListener('input', (e)=>{
  const q = e.target.value.toLowerCase();
  renderGrid(products.filter(p => p.name.toLowerCase().includes(q)));
});

function openList(){ drawer.classList.remove('hidden'); loadList(); }
document.getElementById('open-list')?.addEventListener('click', openList);
function closeList(){ drawer.classList.add('hidden'); }
window.closeList = closeList;

// ---------------- API COMM ----------------
async function sendCommand(text){
  const res = await fetch('/command', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({text})
  });
  const data = await res.json();
  toast.textContent = data.message;
  renderList(data.list);
  speak(data.message);

  // Show smart suggestions
  if (data.suggestions && data.suggestions.length > 0) {
    suggestionsEl.innerHTML = `
      <h4 class="font-semibold mb-2">💡 Suggestions for you:</h4>
      <ul class="list-disc pl-5 space-y-1">
        ${data.suggestions.map(s => `<li>${s}</li>`).join('')}
      </ul>
    `;
  } else {
    suggestionsEl.innerHTML = "";
  }
}

function quickAdd(name){ 
  sendCommand(`add 1 ${name.toLowerCase()}`); 
  openList(); 
}
window.quickAdd = quickAdd;

// ---------------- LIST RENDER ----------------
function renderList(data){
  if(!data || data.length === 0){
    listEl.innerHTML = '<div class="text-gray-500">Your list is empty.</div>';
    return;
  }
  listEl.innerHTML = data.map(r => `
    <div class="flex items-center justify-between border-b py-3">
      <div>
        <div class="font-semibold">${r.item}</div>
        <div class="text-sm text-gray-500">${r.category}</div>
      </div>
      <div class="flex items-center space-x-2">
        <span class="px-3 py-1 bg-gray-100 rounded-full">x ${r.qty}</span>
        <button class="text-red-600" onclick="sendCommand('remove ${r.item.toLowerCase()}')">Remove</button>
      </div>
    </div>
  `).join('');
}

// ---------------- INIT ----------------
async function loadList(){
  const res = await fetch('/command', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({text:""})
  });
  const data = await res.json();
  renderList(data.list);

  // Render initial suggestions
  if (data.suggestions && data.suggestions.length > 0) {
    suggestionsEl.innerHTML = `
      <h4 class="font-semibold mb-2">💡 Suggestions for you:</h4>
      <ul class="list-disc pl-5 space-y-1">
        ${data.suggestions.map(s => `<li>${s}</li>`).join('')}
      </ul>
    `;
  }
}
window.onload = loadList;

// ---------------- VOICE INPUT ----------------
function startRecognition(){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SR){ 
    alert("⚠️ Speech recognition not supported. Please use Google Chrome.");
    return; 
  }

  const recog = new SR();
  recog.lang = langSelect.value || "en-US";
  recog.interimResults = false;
  recog.maxAlternatives = 1;

  recog.start();

  recog.onstart = () => { 
    toast.textContent = "🎤 Listening..."; 
    console.log("Speech recognition started");
  };

  recog.onresult = (e) => {
    const text = e.results[0][0].transcript;
    console.log("Recognized:", text);
    alert("Recognized: " + text);  // 🔎 Debug popup
    toast.textContent = `🎙️ You said: "${text}"`;
    sendCommand(text);
    openList();
  };

  recog.onerror = (e) => { 
    toast.textContent = "❌ Error: " + e.error; 
    console.error("Speech error:", e);
  };

  recog.onend = () => { 
    console.log("Speech recognition stopped"); 
  };
}
window.startRecognition = startRecognition;

// ---------------- VOICE FEEDBACK ----------------
function speak(text){
  if('speechSynthesis' in window){
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = langSelect.value || "en-US";
    window.speechSynthesis.speak(utter);
  }
}
// ---------------- API COMM ----------------
async function sendCommand(text){
  const res = await fetch('/command', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({text})
  });
  const data = await res.json();
  toast.textContent = data.message;
  renderList(data.list);
  speak(data.message);

  // Show smart suggestions
  renderSuggestions(data.suggestions);
}

function renderSuggestions(suggestions){
  if (suggestions && suggestions.length > 0) {
    suggestionsEl.innerHTML = `
      <h4 class="font-semibold mb-2">💡 Suggestions for you:</h4>
      <ul class="space-y-2">
        ${suggestions.map(s => `
          <li class="flex items-center justify-between bg-gray-50 p-2 rounded">
            <span>${s}</span>
            <button 
              class="px-2 py-1 bg-black text-white text-xs rounded"
              onclick="quickAdd('${s.split(' ')[0]}')">
              Add
            </button>
          </li>
        `).join('')}
      </ul>
    `;
  } else {
    suggestionsEl.innerHTML = "";
  }
}

// ---------------- INIT ----------------
async function loadList(){
  const res = await fetch('/command', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({text:""})
  });
  const data = await res.json();
  renderList(data.list);
  renderSuggestions(data.suggestions);
}
