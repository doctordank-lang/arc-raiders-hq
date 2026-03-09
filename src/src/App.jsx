import { useState, useEffect, useCallback, useRef } from "react";

// ============================================================
// DATA LAYER — All game data baked in, no external lookups
// ============================================================

const MAPS = {
  dam: {
    id: "dam",
    name: "Dam Battlegrounds",
    emoji: "💧",
    lore: "Alcantara Power Plant — toxic floodlands, dense vegetation, beginner-friendly",
    difficulty: "Low",
    pvpLevel: "Medium",
    color: "#4ade80",
    bgColor: "#052e16",
    poi: [
      { id:"d1", name:"Power Generation Complex", x:15, y:20, tier:"S", loot:"Weapon cases, blueprints, industrial containers", tips:"Circle top edge, every marked cache. Best opener.", threats:"Surveyors, raiders", extract:"Raider Hatch nearby" },
      { id:"d2", name:"Hydroponic Dome", x:30, y:35, tier:"A", loot:"Rare plant materials, food, electrical containers", tips:"High floor loot. Push here if early loot is good.", threats:"Light ARC drones", extract:"Cargo Elevator NE" },
      { id:"d3", name:"Dam Control Room", x:50, y:25, tier:"S", loot:"Security lockers, 2x blueprint lockers", tips:"Two lockers near control panel. Key shortcut from west.", threats:"Turrets, Wasp swarms", extract:"North gate" },
      { id:"d4", name:"Raider Outpost East", x:70, y:30, tier:"B", loot:"Weapon crates, ammo, player gear", tips:"Player hotspot. Contested. Best for PvP loot.", threats:"Other Raiders", extract:"East Bridge" },
      { id:"d5", name:"Broken Bridge Cache", x:62, y:40, tier:"A", loot:"Hidden cache under elevated highway", tips:"Under the highway between outpost and bridge. Ticking sound gives away cache.", threats:"Minimal", extract:"East Bridge" },
      { id:"d6", name:"Water Towers", x:40, y:55, tier:"B", loot:"Industrial containers, red lockers", tips:"Spikes during EM Storm. Farm during electromagnetic event.", threats:"Heavy ARC units", extract:"South platform" },
      { id:"d7", name:"Underground Generator Tunnels", x:25, y:65, tier:"A", loot:"Security locker (key required), weapon cases", tips:"Key required. Always worth it — room classified as high-value zone.", threats:"Enclosed, watch flanks", extract:"Cargo Elevator SW" },
      { id:"d8", name:"Electrical Substations", x:55, y:70, tier:"B", loot:"Pure materials, electrical parts", tips:"Best for material farming. Minimal combat needed.", threats:"Light drones", extract:"South gate" },
      { id:"d9", name:"Olive Grove", x:80, y:60, tier:"C", loot:"Coins from trees, basic containers", tips:"Passive income between POIs. Not a primary destination.", threats:"None usually", extract:"East extraction" },
    ],
    routes: [
      { name:"Blueprint Circle Run", time:"15 min", risk:"Medium", steps:["Drop Power Generation Complex", "Sweep upper map edge — loot every cache", "Push Hydroponic Dome if loot is good", "Loop back via Water Towers", "Extract Raider Hatch or Cargo Elevator"], goal:"Blueprints/XP" },
      { name:"Fast Material Farm", time:"10 min", risk:"Low", steps:["Drop Electrical Substations", "Sweep all industrial containers", "Quick check Water Towers", "Exit south gate"], goal:"Materials" },
      { name:"PvP/Loot Hybrid", time:"20 min", risk:"High", steps:["Drop Raider Outpost East", "Contest bridge area", "Push Control Room for security lockers", "Broken Bridge cache on the way out", "North gate extract"], goal:"PvP/Blueprints" },
    ],
    conditions: { hurricane:"First Wave Caches activate NW sector — very high blueprint chance", nightRaid:"Residential containers boosted, all drop rates up ~20%", harvester:"Event in center map — top loot reward at end", emStorm:"Water Towers red lockers spike in rare drops" },
    extraction: ["Raider Hatch (north)", "Cargo Elevator NE", "Cargo Elevator SW", "North gate", "East Bridge", "South platform", "South gate"],
  },
  buried: {
    id: "buried",
    name: "Buried City",
    emoji: "🏙️",
    lore: "Desert ruins — sand dunes, narrow urban streets, close-quarters combat",
    difficulty: "Medium",
    pvpLevel: "High",
    color: "#fb923c",
    bgColor: "#431407",
    poi: [
      { id:"b1", name:"Space Travel (6F Building)", x:20, y:30, tier:"S", loot:"Blueprint drawers floors 4-6, weapon cases", tips:"Climb ledge→4th floor→6th floor. Drawers and cabinets top. Fast clear.", threats:"Surveyors on roof", extract:"West rooftop" },
      { id:"b2", name:"Hospital (Multi-Floor)", x:35, y:25, tier:"S", loot:"Red lockers top floor, all floor cabinets/drawers/med bags", tips:"Do ALL floors. Top floor red lockers = blueprint goldmine.", threats:"Medium ARC density", extract:"Hospital roof zipline" },
      { id:"b3", name:"Plaza Rosa + Attic", x:50, y:40, tier:"S", loot:"Weapon case interior stairs, shelves, pharmacy (entire building)", tips:"Vault attic open window. Check weapon case near stairs. Cross street to ground window corner.", threats:"High player traffic", extract:"Plaza central" },
      { id:"b4", name:"Plaza Rosa Pharmacy", x:53, y:43, tier:"S", loot:"Every drawer, shelf, cabinet, med bag, potential weapon case", tips:"Multi-floor, all high-value. Most container-dense spot in entire map.", threats:"Steady player traffic", extract:"Plaza central" },
      { id:"b5", name:"Red Tower (NE of Plaza Rosa)", x:65, y:30, tier:"A", loot:"Multiple weapon cases, locker spawns", tips:"Vertical building. Fast to clear. Reasonable blueprint chance.", threats:"Moderate", extract:"Red Tower rooftop" },
      { id:"b6", name:"Library", x:30, y:50, tier:"A", loot:"Containers, rare blueprint spots", tips:"Library classified high-value. Good secondary stop.", threats:"Low", extract:"South exit" },
      { id:"b7", name:"New District", x:75, y:35, tier:"A", loot:"3 caches, solid blueprint chance", tips:"Three caches. Quick sweep. Good if spawning east side.", threats:"Moderate players", extract:"East extraction" },
      { id:"b8", name:"East Housing + Rooftop Rooms", x:80, y:55, tier:"B", loot:"Weapon cases, rarely contested containers", tips:"Off main traffic. Safer option. Rooftop rooms have hidden containers.", threats:"Low traffic", extract:"East extraction" },
      { id:"b9", name:"Village (Contested Zone)", x:15, y:65, tier:"A", loot:"Raider containers, player-carried blueprints", tips:"Ambush other Raiders for their blueprints. High risk, high reward.", threats:"MAX PvP", extract:"West side" },
    ],
    routes: [
      { name:"West-to-East Blueprint Route", time:"20 min", risk:"High", steps:["Drop Space Travel building", "Clear floors 4-6 fast", "Move to Hospital — all floors, top lockers", "Plaza Rosa attic + pharmacy", "Red Tower as bonus", "East Housing for low-risk exit"], goal:"Blueprints" },
      { name:"Night Raid Farm", time:"15 min", risk:"Medium", steps:["Night Raid only", "Focus Piazza Roma/Arbusto security lockers (16-18% blueprint rate)", "Hospital top floor", "Library secondary", "Extract with full bags"], goal:"Blueprints (Night)" },
      { name:"Fast XP Rush", time:"10 min", risk:"Medium", steps:["Drop Plaza Rosa", "Clear pharmacy + attic", "Quick Red Tower", "Extract central"], goal:"XP/Items" },
    ],
    conditions: { nightRaid:"16-18% blueprint drop rate at Piazza/Arbusto lockers. Best BP farming in game.", hurricane:"First Wave Caches appear. Great for quick material runs.", harvester:"Avoid if harvester active unless geared up", emStorm:"Bonus drops in electrical zones" },
    extraction: ["West rooftop", "Hospital roof zipline", "Plaza central", "Red Tower rooftop", "South exit", "East extraction", "West side"],
  },
  spaceport: {
    id: "spaceport",
    name: "Acerra Spaceport",
    emoji: "🚀",
    lore: "Industrial space complex — where Exodus shuttles once launched. Warehouses, towers, launch pads",
    difficulty: "Medium",
    pvpLevel: "Medium",
    color: "#60a5fa",
    bgColor: "#0c1a2e",
    poi: [
      { id:"s1", name:"Control Tower A6 (West-Central)", x:30, y:30, tier:"S", loot:"Various containers, blueprints via ziplines", tips:"Use ziplines to reach upper levels. Dense containers. Good consistent spot.", threats:"Raiders contest this", extract:"Tower base" },
      { id:"s2", name:"Launch Tower + Generator Puzzle", x:55, y:20, tier:"S", loot:"High-tier loot chests after puzzle completion", tips:"Collect Fuel Cells → power generators at base → zipline to top → trigger event → open top chests. Time investment = high reward.", threats:"Heavy ARC at top", extract:"West zipline down" },
      { id:"s3", name:"Departure Building (SW entrance)", x:20, y:55, tier:"A", loot:"Cabinets, shelves in Staff Bathroom", tips:"Enter SW exterior entrance. Staff Bathroom after entry hall. Quick clear.", threats:"Minimal", extract:"Departure exit S" },
      { id:"s4", name:"Arrival Building (West Breach Room)", x:25, y:70, tier:"A", loot:"Weapon case + blueprint in south breach room", tips:"West side of Arrival. Stay low. South breach room has weapon case.", threats:"Moderate drones", extract:"Arrival exit" },
      { id:"s5", name:"Vehicle Maintenance", x:40, y:65, tier:"B", loot:"Industrial containers, tool caches", tips:"Off main corridors. Safe opener from south spawn or mid-route between Fuel Lines and A6.", threats:"Low traffic", extract:"South extraction" },
      { id:"s6", name:"Fuel Lines Trench", x:45, y:45, tier:"B", loot:"Overlooked blueprint spot: vertical pipe center-area", tips:"One vertical pipe stands upright center of trench. Most players miss it. Long industrial trench west of Launch Towers.", threats:"Low", extract:"North or south" },
      { id:"s7", name:"Industrial Garage (Loading Bay)", x:65, y:50, tier:"A", loot:"Blaze Grenade blueprint, industrial containers", tips:"Loading Bay = Blaze Grenade blueprint. Red lockers and Rusty Raider boxes here.", threats:"Moderate ARC", extract:"Dock extraction" },
      { id:"s8", name:"Hangar Complex", x:70, y:30, tier:"B", loot:"Ammo, weapon crates, general loot", tips:"Good for ammo restock mid-run.", threats:"Turrets inside", extract:"East gate" },
    ],
    routes: [
      { name:"Tower Run", time:"20 min", risk:"Medium", steps:["Drop Vehicle Maintenance (safe opener)", "Move to Fuel Lines — check vertical pipe", "Control Tower A6 — zipline sweep", "If time: Launch Tower puzzle for bonus chests", "West zipline extract"], goal:"Blueprints" },
      { name:"Industrial Loop", time:"15 min", risk:"Low", steps:["Drop Departure Building SW entrance", "Staff Bathroom quick loot", "Arrival Building south breach room", "Vehicle Maintenance", "South extract"], goal:"Materials/Safe Run" },
      { name:"Blaze Blueprint Run", time:"10 min", risk:"Medium", steps:["Drop Industrial Garage direct", "Clear Loading Bay — red lockers + rusty raider boxes", "Hangar ammo restock", "Dock extract"], goal:"Blaze Blueprint" },
    ],
    conditions: { nightRaid:"All indoor zones boosted. Best time for tower runs.", hurricane:"Industrial areas have First Wave Caches", harvester:"Harvester occasionally spawns here. Huge loot event.", emStorm:"Electrical containers boosted throughout" },
    extraction: ["Tower base", "West zipline down", "Departure exit S", "Arrival exit", "South extraction", "Dock extraction", "East gate"],
  },
  bluegate: {
    id: "bluegate",
    name: "The Blue Gate",
    emoji: "🌀",
    lore: "Mountain gateway — valley scars, puzzle mechanics, premium loot behind locked doors",
    difficulty: "High",
    pvpLevel: "High",
    color: "#a78bfa",
    bgColor: "#1e0a3c",
    poi: [
      { id:"g1", name:"Reinforced Reception (Blue Gate Main)", x:40, y:35, tier:"S", loot:"Complex gun parts, Combat Mk.III augments, showstopper blueprints, glow sticks", tips:"BEST 5-min blueprint run. Bring Looting Mk.I-III + light shield + Anvil + shotgun + heals. Restart if you spawn too far south.", threats:"PvP hotspot, turrets", extract:"Zipline exfil nearby — USE THIS to avoid main entrance" },
      { id:"g2", name:"Blue Gate Village (Key Required)", x:25, y:50, tier:"S", loot:"Multiple high-tier containers, near-guaranteed blueprint", tips:"Blue Gate Village Key unlocks large double doors center. Almost always worth the key. Best key-locked spot in game.", threats:"Key cost, some PvP", extract:"Village south" },
      { id:"g3", name:"Pilgrim's Peak", x:60, y:25, tier:"A", loot:"Strong loot chances, frequent blueprint drops", tips:"Contested. High traffic. Worth it if you're geared.", threats:"Heavy PvP", extract:"Peak east" },
      { id:"g4", name:"Adorned Wreckage", x:70, y:45, tier:"A", loot:"Frequent blueprint drops", tips:"Less contested than Pilgrim's Peak. Good alternative.", threats:"Moderate ARC", extract:"Wreckage extract" },
      { id:"g5", name:"Maintenance Wing", x:30, y:65, tier:"A", loot:"Blaze Grenade blueprint (best spot), industrial containers", tips:"Maintenance Wing = consistent industrial blueprint source. Red lockers, Rusty Raider boxes.", threats:"Moderate", extract:"South gate" },
      { id:"g6", name:"Puzzle Chambers", x:50, y:55, tier:"B", loot:"Battery pack reward = extra weapon cases", tips:"Carry battery packs to basement. PvP threat during puzzle — be cautious.", threats:"PvP during puzzle solve", extract:"Chamber exit" },
    ],
    routes: [
      { name:"Reinforced Reception Blueprint Farm", time:"5-10 min", risk:"High", steps:["Spawn check — restart if too far south", "Rush Reinforced Reception", "Clear all containers fast", "Optional: Puzzle Chamber battery bonus", "Zipline exfil — AVOID main entrance"], goal:"Blueprints (fastest run)" },
      { name:"Village Key Run", time:"15 min", risk:"Medium", steps:["Bring Blue Gate Village Key", "Clear Maintenance Wing first for warm-up loot", "Village — unlock double doors, clear all high-tier containers", "Village south extract"], goal:"Guaranteed Blueprints" },
      { name:"Peak Circuit", time:"20 min", risk:"Very High", steps:["Drop Pilgrim's Peak (aggressive)", "Contest loot vs other Raiders", "Adorned Wreckage loop", "Reinforced Reception on exit", "Zipline exfil"], goal:"PvP/Blueprints/XP" },
    ],
    conditions: { nightRaid:"All residential zones boosted. Locked Gate activates — great for Muzzle Brake III.", hurricane:"Hurricane Caches appear. Patched — can't walk away with armfuls but still solid.", harvester:"Matriarch spawns in Blue Gate region. Farm for Aphelion blueprint.", lockedGate:"Locked Gate condition: security checkpoint on Stella Montis boosted, residential 2x major map" },
    extraction: ["Zipline exfil (use this!)", "Village south", "Peak east", "Wreckage extract", "South gate", "Chamber exit"],
  },
  stella: {
    id: "stella",
    name: "Stella Montis",
    emoji: "🏔️",
    lore: "Underground mountain facility — last bulwark of humanity. Endgame content, extreme competition",
    difficulty: "Extreme",
    pvpLevel: "Extreme",
    color: "#f472b6",
    bgColor: "#2d0a1e",
    poi: [
      { id:"st1", name:"Cultural Archives (Top Layer)", x:30, y:25, tier:"S", loot:"Epic loot clusters, rare blueprints", tips:"Top layer priority. Dense high-value loot. Focus here first on Night Raid.", threats:"Max PvP at entry", extract:"Top layer extract" },
      { id:"st2", name:"Medical Research (Top Layer)", x:55, y:20, tier:"S", loot:"Medical blueprints, augment containers, epic loot", tips:"Top layer. Essential for medical blueprint farming.", threats:"Heavy competition", extract:"Top layer extract" },
      { id:"st3", name:"Control Room (Bottom Layer)", x:45, y:65, tier:"S", loot:"Security checkpoint (Night Raid = Muzzle Brake III), black containers", tips:"Night Raid here = Muzzle Brake III blueprint reliable. Also dustbins and black containers throughout.", threats:"Enclosed, flanks everywhere", extract:"Bottom extract" },
      { id:"st4", name:"Security Checkpoint", x:35, y:55, tier:"A", loot:"Muzzle Brake III blueprint, rare loot", tips:"During Night Raid: highest probability spot for Muzzle Brake III. Loot all black containers.", threats:"Chokepoint danger", extract:"Checkpoint exit" },
      { id:"st5", name:"Loading Bay", x:65, y:45, tier:"A", loot:"Blaze Grenade blueprint, industrial containers", tips:"One of three best spots for Blaze Grenade blueprint.", threats:"Moderate", extract:"Bay exit" },
      { id:"st6", name:"Primary Facility / Industrial Garage", x:50, y:50, tier:"B", loot:"Industrial loot, materials", tips:"Center of map. Good for materials run. Less contested than Archives.", threats:"Moderate ARC", extract:"Central extract" },
    ],
    routes: [
      { name:"Night Raid Top Layer Sweep", time:"20 min", risk:"Extreme", steps:["Night Raid only", "Drop Cultural Archives", "Clear Medical Research", "Security Checkpoint for Muzzle Brake III", "Bottom layer Control Room if time allows", "Bottom extract — safer than top"], goal:"Blueprints (Night Raid)" },
      { name:"Quick Loading Bay Run", time:"10 min", risk:"High", steps:["Drop Loading Bay direct", "Clear all industrial containers", "Check black containers in corridors", "Bay exit extract — fast"], goal:"Blaze Blueprint" },
      { name:"Solo Rat Run", time:"12 min", risk:"Medium", steps:["Avoid top layer entirely", "Enter via side entrance", "Primary Facility materials loop", "Central extract — do not overstay"], goal:"Materials/Safe Farm" },
    ],
    conditions: { nightRaid:"BEST map condition here. All rare drops up. Muzzle Brake III reliable at Checkpoint.", coldSnap:"Cold Snap boosts rare blueprint chances throughout map.", harvester:"Top loot reward. Worth doing with full squad.", lockedGate:"Locked Gate 2x Map Condition: residential areas boost + security checkpoint boost" },
    extraction: ["Top layer extract", "Bottom extract", "Checkpoint exit", "Bay exit", "Central extract"],
  },
};

const WEAPONS = [
  { name:"Venator", tier:"S", type:"Hand Cannon", ammo:"Light", pvp:10, pve:8, weight:3, notes:"Fires 2 rounds per trigger pull for cost of 1. Best TTK at close-mid range. Nerfs hit but still dominant.", craft:"Gunsmith Lvl 2", meta:"PvP King" },
  { name:"Vulcano", tier:"S", type:"Shotgun", ammo:"Heavy", pvp:10, pve:7, weight:4, notes:"Highest burst damage in game. Semi-auto. Dominates indoor/close range. Weak vs heavy ARC armor.", craft:"Gunsmith Lvl 2", meta:"Indoor God" },
  { name:"Anvil", tier:"S", type:"Hand Cannon", ammo:"Heavy", pvp:9, pve:10, weight:3, notes:"Heavy ammo pocket battle rifle. Two-taps raiders, shreds ARC armor. Best all-around. Also great vs Surveyors.", craft:"Gunsmith Lvl 1", meta:"Best All-Around" },
  { name:"Bettina", tier:"A", type:"Assault Rifle", ammo:"Heavy", pvp:8, pve:9, weight:5, notes:"22 round mag (buffed). Strong armor penetration. Best choice for long multi-objective raids. Previous bug made it overpowered briefly.", craft:"Gunsmith Lvl 2", meta:"Multi-Objective Raids" },
  { name:"Ferro", tier:"A", type:"Battle Rifle", ammo:"Heavy", pvp:8, pve:9, weight:4, notes:"Budget sniper. 2 rubber + 5 metal to craft. Incredible damage for cost. Essential early-game and beyond.", craft:"2 Rubber + 5 Metal (Gunsmith Lvl 1)", meta:"Budget MVP" },
  { name:"Kettle", tier:"A", type:"SMG", ammo:"Light", pvp:8, pve:6, weight:3, notes:"Formerly S-tier. Fire rate capped at 450 RPM in v1.11.0. Still dominant close-range. Needs grip + barrel.", craft:"Gunsmith Lvl 1", meta:"Close Range" },
  { name:"Bobcat", tier:"A", type:"SMG", ammo:"Light", pvp:8, pve:7, weight:3, notes:"High damage, rapid fire. Default is unruly — grip+barrel makes it a monster. Punishes anything close.", craft:"Gunsmith Lvl 1", meta:"Close Range" },
  { name:"Renegade", tier:"A", type:"Lever-Action Rifle", ammo:"Heavy", pvp:7, pve:8, weight:4, notes:"Chunks-reload lever action. Reliable mid-range powerhouse. Great for medium-range engagements.", craft:"Gunsmith Lvl 2", meta:"Mid Range" },
  { name:"Tempest", tier:"B", type:"Assault Rifle", ammo:"Light", pvp:7, pve:8, weight:5, notes:"Reliable ARC killer. High fire rate but ammo-hungry. Bring extra. Found only in Medical containers (unlike most weapons).", craft:"Medical Container drop only", meta:"ARC PvE" },
  { name:"Osprey", tier:"B", type:"Sniper Rifle", ammo:"Heavy", pvp:6, pve:6, weight:5, notes:"Long range but not accurate enough to excel. Better as suppression or weakening from stealth. Covering fire.", craft:"Gunsmith Lvl 2", meta:"Long Range Niche" },
  { name:"Arpeggio", tier:"B", type:"Burst Rifle", ammo:"Light", pvp:6, pve:7, weight:4, notes:"3-round burst. Great stability and range. Lower burst damage than semi-auto at close range.", craft:"Gunsmith Lvl 1", meta:"Stable/Range" },
  { name:"Torrente", tier:"B", type:"LMG", ammo:"Heavy", pvp:5, pve:8, weight:8, notes:"Suppressive fire. Pins ARC squads. Heavy weight = sitting duck vs mobile players.", craft:"Gunsmith Lvl 3", meta:"Suppression PvE" },
  { name:"Il Toro", tier:"B", type:"Shotgun", ammo:"Light", pvp:8, pve:5, weight:4, notes:"Widest pellet spread. Highest damage per shot when all pellets connect. PvP only — weak vs ARC armor.", craft:"Gunsmith Lvl 2 + Blueprint", meta:"Close PvP" },
  { name:"Aphelion", tier:"B", type:"Battle Rifle", ammo:"Heavy", pvp:7, pve:8, weight:6, notes:"Legendary. Difficult to craft. Many prefer Renegade or Bettina for resource efficiency. Matriarch drops blueprint.", craft:"Matriarch blueprint required", meta:"Legendary / Prestige" },
  { name:"Hullcracker", tier:"B", type:"Shotgun", ammo:"Light", pvp:6, pve:9, weight:5, notes:"Quest reward blueprint (The Major's Footlocker). Great vs ARC. No point farming containers — it's a quest reward.", craft:"Quest: The Major's Footlocker", meta:"PvE ARC" },
  { name:"Stitcher", tier:"C", type:"SMG", ammo:"Light", pvp:5, pve:5, weight:3, notes:"Spray and pray. Suppression role only. Pairs with Ferro: Ferro for armor, Stitcher for cleanup.", craft:"Gunsmith Lvl 1", meta:"Budget Spray" },
  { name:"Rattler", tier:"D", type:"Rifle", ammo:"Light", pvp:3, pve:4, weight:3, notes:"Cheap and hardly worth it. Decent armor pen but outclassed immediately. Early game filler.", craft:"Gunsmith Lvl 1", meta:"Early Game Only" },
  { name:"Burletta", tier:"D", type:"Pistol", ammo:"Light", pvp:3, pve:3, weight:2, notes:"Standard pistol upgrade. Eventually outclassed by Anvil or Venator.", craft:"Gunsmith Lvl 1", meta:"Starter" },
  { name:"Hairpin", tier:"D", type:"Pistol", ammo:"Light", pvp:1, pve:2, weight:1, notes:"Suppressed bolt-action. Worst combat weapon. One use: stealth looting runs without fighting.", craft:"Gunsmith Lvl 1", meta:"Stealth Loot Only" },
];

const AUGMENTS = [
  { name:"Looting Mk.3 (Survivor)", tier:"S", type:"Looting", mark:3, rarity:"Epic", slots:20, weight:80, safePockets:3, quickSlots:5, shields:["Light","Medium"], passive:"Regen HP to 75% while downed + stationary. Crawl to extract after knockdown.", notes:"Top pick for most scenarios. Only looting augment with medium shield." },
  { name:"Combat Mk.3 (Aggressive)", tier:"S", type:"Combat", mark:3, rarity:"Epic", slots:18, weight:70, safePockets:2, quickSlots:4, shields:["Light","Medium","Heavy"], passive:"Shield absorbs 15% more before breaking. +10% damage during low HP.", notes:"Heavy shield support. Best for aggressive PvP playstyle." },
  { name:"Tactical Mk.3 (Defensive)", tier:"S", type:"Tactical", mark:3, rarity:"Epic", slots:16, weight:65, safePockets:2, quickSlots:5, shields:["Light","Medium","Heavy"], passive:"Built-in defibrillator passive — auto-revive attempt once per raid.", notes:"Heavy shield + defibrillator. Solo/duo runs." },
  { name:"Tactical Mk.3 (Revival)", tier:"A", type:"Tactical", mark:3, rarity:"Epic", slots:16, weight:60, safePockets:2, quickSlots:5, shields:["Light","Medium"], passive:"Defibrillator + ambient heal for short duration when downed.", notes:"Squad revival utility. GamesRadar highlight pick." },
  { name:"Looting Mk.3 (Safekeeper)", tier:"A", type:"Looting", mark:3, rarity:"Epic", slots:20, weight:75, safePockets:3, quickSlots:4, shields:["Light","Medium"], passive:"Can put a WEAPON in safe pocket — never lose high-tier weapons.", notes:"Risk-free farming. Best for carrying in a valuable weapon without risking it." },
  { name:"Tactical Mk.2", tier:"A", type:"Tactical", mark:2, rarity:"Rare", slots:18, weight:60, safePockets:2, quickSlots:4, shields:["Light","Medium"], passive:"Shield Recharger built-in — unlimited use with cooldown.", notes:"Saves inventory space. No need to carry shield consumables." },
  { name:"Looting Mk.2", tier:"A", type:"Looting", mark:2, rarity:"Rare", slots:22, weight:60, safePockets:2, quickSlots:3, shields:["Light"], passive:"Trinket Slots x3. Safe pockets x2. 4 utility slots.", notes:"Ultimate budget loot runner. Light shield only but excellent value." },
  { name:"Combat Mk.2", tier:"B", type:"Combat", mark:2, rarity:"Rare", slots:16, weight:55, safePockets:1, quickSlots:3, shields:["Light","Medium"], passive:"HP regen 2 every 5s (2x rate of Combat Mk.1).", notes:"Good balance of combat and utility. Medium shield access." },
  { name:"Combat Mk.1", tier:"C", type:"Combat", mark:1, rarity:"Common", slots:14, weight:45, safePockets:1, quickSlots:2, shields:["Light","Medium"], passive:"None", notes:"Strongest Mk.1 — medium shield at entry level. Good starting point." },
  { name:"Looting Mk.1", tier:"C", type:"Looting", mark:1, rarity:"Common", slots:16, weight:40, safePockets:1, quickSlots:2, shields:["Light"], passive:"None", notes:"Most inventory slots at Mk.1 but light shield only." },
  { name:"Tactical Mk.1", tier:"C", type:"Tactical", mark:1, rarity:"Common", slots:14, weight:40, safePockets:1, quickSlots:3, shields:["Light"], passive:"None", notes:"3 quick slots. Useful for consumable-heavy playstyle." },
  { name:"Free Augment", tier:"D", type:"Any", mark:0, rarity:"Free", slots:14, weight:35, safePockets:0, quickSlots:0, shields:["Light"], passive:"None", notes:"No cost. Random gear drop. Use for rat runs and learning the game." },
];

const BLUEPRINTS = [
  // Weapons
  { name:"Anvil", category:"Weapon", source:"Raider Containers", container:"Weapon Cases, Ammo Crates, Raider Backpacks", bestMaps:["dam","buried","bluegate"], conditions:"Uncovered Caches (~10% drop), EM Storm industrial zones", guaranteed:false, questReward:false },
  { name:"Bettina", category:"Weapon", source:"Raider Containers", container:"Weapon Cases, Ammo Crates, Raider Backpacks", bestMaps:["dam","buried"], conditions:"Was bugged (high rate), now normalized. Common as byproduct. First Wave Caches during Hurricane.", guaranteed:false, questReward:false },
  { name:"Vulcano", category:"Weapon", source:"Raider Containers", container:"Weapon Cases, Raider Caches", bestMaps:["bluegate","stella"], conditions:"High-value zones. 2x Map Conditions help.", guaranteed:false, questReward:false },
  { name:"Kettle", category:"Weapon", source:"Raider Containers", container:"Weapon Cases, Ammo Crates", bestMaps:["dam","buried"], conditions:"Standard Raider Container loot pool.", guaranteed:false, questReward:false },
  { name:"Ferro", category:"Weapon", source:"Raider Containers", container:"Weapon Cases", bestMaps:["dam","buried","spaceport"], conditions:"Common. Often found as byproduct of general farming.", guaranteed:false, questReward:false },
  { name:"Bobcat", category:"Weapon", source:"Raider Containers", container:"Weapon Cases, Raider Caches", bestMaps:["buried","bluegate"], conditions:"Standard drop. Night Raid boosts chances.", guaranteed:false, questReward:false },
  { name:"Venator", category:"Weapon", source:"Raider Containers", container:"Weapon Cases, Ammo Crates", bestMaps:["buried","dam"], conditions:"Standard Raider Container pool. Contests lots.", guaranteed:false, questReward:false },
  { name:"Renegade", category:"Weapon", source:"Raider Containers", container:"Weapon Cases", bestMaps:["dam","spaceport"], conditions:"Common. Easy to find during routine farming.", guaranteed:false, questReward:false },
  { name:"Osprey", category:"Weapon", source:"Raider Containers", container:"Weapon Cases, Ammo Crates, Raider Backpacks", bestMaps:["dam","buried","bluegate"], conditions:"Raider Container pool. Often in buried Raider Caches. Uncovered Caches valid strategy.", guaranteed:false, questReward:false },
  { name:"Tempest", category:"Weapon", source:"Medical Containers", container:"Medical Bags, Medical Duffels", bestMaps:["buried","spaceport"], conditions:"ONLY spawns in Medical Containers (exception to weapon rule). Hospital top floor, Departure Building bathroom.", guaranteed:false, questReward:false },
  { name:"Il Toro", category:"Weapon", source:"Raider Containers", container:"Weapon Cases, Ammo Crates", bestMaps:["spaceport","stella"], conditions:"Standard Raider Container. Spaceport industrial zones.", guaranteed:false, questReward:false },
  { name:"Hullcracker", category:"Weapon", source:"Quest Only", container:"N/A", bestMaps:[], conditions:"QUEST REWARD ONLY: 'The Major's Footlocker'. Do NOT farm containers for this.", guaranteed:true, questReward:true },
  { name:"Aphelion", category:"Weapon", source:"Boss Drop", container:"Matriarch Core Loot", bestMaps:["bluegate","spaceport","dam"], conditions:"Matriarch boss drop. Farm during Matriarch Map Event. Also very rarely in Stella Montis containers during Night Raid.", guaranteed:false, questReward:false },
  { name:"Equalizer", category:"Weapon", source:"Boss Drop", container:"Harvester Puzzle Final Containers", bestMaps:["all"], conditions:"Complete Harvester Puzzle → 3 final containers. Rarest weapon blueprint. Ask squad members for spares.", guaranteed:false, questReward:false },
  { name:"Jupiter", category:"Weapon", source:"Boss Drop", container:"Harvester Puzzle Final Containers", bestMaps:["all"], conditions:"More common than Equalizer in Harvester final containers. Others may drop spare Jupiters — worth asking.", guaranteed:false, questReward:false },
  // Augments
  { name:"Combat Mk.3 (Flanking)", category:"Augment", source:"Security Containers", container:"Security Lockers, rarely Medical Containers", bestMaps:["bluegate","stella"], conditions:"Rare blueprint. 2x Map Conditions. Security Checkpoint Stella Night Raid.", guaranteed:false, questReward:false },
  { name:"Combat Mk.3 (Aggressive)", category:"Augment", source:"Security Containers", container:"Security Lockers", bestMaps:["bluegate","stella"], conditions:"Reinforced Reception Blue Gate reliably drops this. High-tier zones.", guaranteed:false, questReward:false },
  { name:"Looting Mk.3 (Survivor)", category:"Augment", source:"Security Containers", container:"Security Lockers, Medical Containers (rare)", bestMaps:["buried","bluegate"], conditions:"Night Raid boosted. Security lockers in Piazza/Arbusto area.", guaranteed:false, questReward:false },
  { name:"Looting Mk.3 (Safekeeper)", category:"Augment", source:"Security Containers", container:"Security Lockers", bestMaps:["bluegate","stella"], conditions:"Reinforced Reception Blue Gate. Rare drop.", guaranteed:false, questReward:false },
  { name:"Tactical Mk.3 (Revival)", category:"Augment", source:"Security Containers", container:"Security Lockers", bestMaps:["stella","buried"], conditions:"Rare. Top-layer Stella Montis during Night Raid.", guaranteed:false, questReward:false },
  // Attachments
  { name:"Heavy Gun Parts", category:"Attachment", source:"Raider Containers", container:"Raider Caches, Weapon Cases, Ammo Crates", bestMaps:["dam","spaceport"], conditions:"Uncovered Caches ~10% rate. EM Storm industrial zones (Water Towers Dam, random Red Lockers). 2x Major Map.", guaranteed:false, questReward:false },
  { name:"Light Gun Parts", category:"Attachment", source:"Raider Containers", container:"Weapon Crates, Ammo Boxes", bestMaps:["dam","buried","spaceport"], conditions:"Hunt Uncovered Caches and green Weapon Crates. Stop looting filing cabinets.", guaranteed:false, questReward:false },
  { name:"Muzzle Brake III", category:"Attachment", source:"High-Value Zones", container:"Security Lockers, High-Value Containers", bestMaps:["stella","bluegate"], conditions:"Security Checkpoint Stella Montis (Night Raid). Blue Gate (Locked Gate). Residential 2x Map Conditions.", guaranteed:false, questReward:false },
  { name:"Padded Stock", category:"Attachment", source:"High-Value Zones", container:"Various high-tier containers", bestMaps:["stella","buried"], conditions:"2x Map Conditions (Night Raid, Locked Gate). Rare tier.", guaranteed:false, questReward:false },
  // Explosives/Utilities
  { name:"Blaze Grenade", category:"Explosive", source:"Industrial Containers", container:"Red Lockers, Rusty Raider Boxes", bestMaps:["bluegate","stella","dam"], conditions:"Best: Maintenance Wing Blue Gate, Loading Bay Stella, Primary Facility/Industrial Garage Dam. 2x Major Map.", guaranteed:false, questReward:false },
  { name:"Wolfpack", category:"Explosive", source:"Residential Areas", container:"Residential Containers", bestMaps:["buried","dam"], conditions:"Night Raids. Residential/Commercial areas. Drop rate nerfed but still viable at night.", guaranteed:false, questReward:false },
];

const CONSUMABLES = [
  { name:"Medkit (Standard)", type:"Healing", effect:"Restore ~50 HP", when:"After medium engagement — not in active combat", weight:2, notes:"Bread and butter heal. Use in cover between fights." },
  { name:"Trauma Kit", type:"Healing", effect:"Full HP restore + bleed cure", when:"Heavy damage or bleed status — worth the weight", weight:3, notes:"Only full-heal option. Save for critical moments." },
  { name:"Bandage", type:"Healing", effect:"Restore ~20 HP fast", when:"Small chip damage during loot runs, fast and cheap", weight:1, notes:"Fastest apply time. Stack several." },
  { name:"Adrenaline Shot", type:"Stamina", effect:"Full stamina + movement speed boost", when:"During chase, escape, or rushing extract under pressure", weight:1, notes:"Crucial for extract dashes. Always carry 1-2." },
  { name:"Light Shield", type:"Shield", effect:"Light damage absorption", when:"All augments support this — budget option", weight:2, notes:"Universal compatibility. Farm for free." },
  { name:"Medium Shield", type:"Shield", effect:"Medium damage absorption", when:"Combat Mk.1+, Tactical Mk.2+, Looting Mk.3 Survivor", weight:3, notes:"Significant protection upgrade. Match to augment." },
  { name:"Heavy Shield", type:"Shield", effect:"Heavy damage absorption", when:"Combat Mk.3 Aggressive or Tactical Mk.3 Defensive ONLY", weight:4, notes:"Best protection. Limited augment compatibility." },
  { name:"Glow Stick", type:"Utility", effect:"Area illumination, marks position", when:"Night Raids, caves, dark areas", weight:1, notes:"Drops from Reinforced Reception. Tag extraction points." },
  { name:"Zipline Kit", type:"Utility", effect:"Deploy personal zipline", when:"Vertical navigation, fast extraction from heights", weight:2, notes:"Tactical Mk.3 has deployable slot for this." },
];

const MATERIALS = [
  { name:"Motor", category:"Mechanical", action:"KEEP ALL — NEVER RECYCLE", value:"Very High", notes:"Core crafting component for weapon upgrades and stations. Accidentally recycling a Motor is a painful mistake." },
  { name:"Leaper Pulse Unit", category:"ARC Parts", action:"KEEP ALL — NEVER RECYCLE", value:"Very High", notes:"Critical rare material. Never recycle. Use in high-tier crafting recipes." },
  { name:"Rubber Parts", category:"Basic", action:"Keep buffer (20+)", value:"Medium", notes:"Used in Mk.1 augments. Farm easily but maintain a buffer." },
  { name:"Plastic Parts", category:"Basic", action:"Keep buffer (20+)", value:"Medium", notes:"Mk.1 augments. Plentiful. Keep buffer." },
  { name:"Metal Parts", category:"Basic", action:"Keep buffer (50+)", value:"Medium", notes:"Ferro crafting (5 Metal). Most common recipe ingredient. Never let this run to zero." },
  { name:"Electronic Parts", category:"Electronic", action:"Keep buffer (10+)", value:"High", notes:"Weapon modifications and mid-tier crafting. Don't recycle below 10." },
  { name:"Chemical Parts", category:"Chemical", action:"Keep buffer (10+)", value:"High", notes:"Grenades, explosives, med items. Don't recycle freely." },
  { name:"Glass Parts", category:"Basic", action:"Recycle safely (excess)", value:"Low", notes:"Specific recipes only. Recycle when overstocked." },
  { name:"Fabric Parts", category:"Basic", action:"Recycle safely (excess)", value:"Low", notes:"Augment low-tier crafting. Excess is safe to sell." },
  { name:"ARC Scrap", category:"ARC Parts", action:"Keep ALL", value:"High", notes:"Dropped by ARC enemies. Used in multiple crafting tiers. Never sell." },
  { name:"Fuel Cell", category:"Special", action:"KEEP — Puzzle use", value:"High", notes:"Required for Launch Tower puzzle at Spaceport. Don't recycle." },
  { name:"Battery Pack", category:"Special", action:"KEEP — Puzzle use", value:"High", notes:"Blue Gate basement puzzle. Extra weapon cases as reward. Keep on farm runs." },
];

// ============================================================
// RUN OPTIMIZER ENGINE
// ============================================================
function optimizeRun({ goal, gearLevel, squadSize, timeAvailable, riskTolerance, mapConditions, startMap }) {
  const scores = {};
  Object.values(MAPS).forEach(map => {
    let score = 50;
    // Goal scoring
    if (goal === "blueprints") {
      if (map.id === "buried") score += 30;
      if (map.id === "bluegate") score += 25;
      if (map.id === "dam") score += 20;
      if (map.id === "stella") score += (gearLevel >= 3 ? 30 : -20);
    } else if (goal === "materials") {
      if (map.id === "dam") score += 30;
      if (map.id === "spaceport") score += 20;
      if (map.id === "stella") score += 10;
    } else if (goal === "xp") {
      if (map.id === "buried") score += 25;
      if (map.id === "dam") score += 25;
    } else if (goal === "pvp") {
      if (map.id === "buried") score += 30;
      if (map.id === "bluegate") score += 25;
      if (map.id === "stella") score += (gearLevel >= 3 ? 20 : -30);
    }
    // Gear level
    if (map.difficulty === "Extreme" && gearLevel < 3) score -= 40;
    if (map.difficulty === "High" && gearLevel < 2) score -= 20;
    // Risk tolerance
    if (map.pvpLevel === "Extreme" && riskTolerance < 50) score -= 30;
    if (map.pvpLevel === "High" && riskTolerance < 30) score -= 20;
    // Squad size
    if (squadSize === 1 && map.pvpLevel === "Extreme") score -= 20;
    if (squadSize >= 3 && map.pvpLevel === "Extreme") score += 10;
    // Map conditions
    if (mapConditions.nightRaid && map.id === "buried") score += 20;
    if (mapConditions.nightRaid && map.id === "stella") score += 15;
    if (mapConditions.hurricane && map.id === "dam") score += 15;
    if (mapConditions.harvester) score += 20;
    if (mapConditions.matriarch && map.id === "bluegate") score += 15;
    // Time
    if (timeAvailable === "quick" && map.difficulty === "Extreme") score -= 15;
    if (timeAvailable === "full" && map.id === "bluegate") score += 10;
    // Force map
    if (startMap && startMap !== "any" && map.id !== startMap) score = -9999;
    scores[map.id] = score;
  });
  const best = Object.entries(scores).sort((a,b) => b[1]-a[1])[0][0];
  const map = MAPS[best];
  // Select route
  const routeIdx = goal === "materials" ? 1 : goal === "pvp" ? 2 : 0;
  const route = map.routes[routeIdx] || map.routes[0];
  // Build loadout rec
  let loadout = [];
  if (goal === "blueprints") loadout = ["Looting Mk.2 or Mk.3 augment (max safe pockets)", "Anvil (vs Surveyors) + Shotgun (PvP backup)", "2x Adrenaline, 2x Medkit", "Light or Medium Shield"];
  else if (goal === "materials") loadout = ["Looting Mk.2 (max slots, light shield OK)", "Ferro (budget, efficient)", "1x Medkit, 2x Bandage", "Light Shield"];
  else if (goal === "pvp") loadout = ["Combat Mk.3 Aggressive (heavy shield)", "Venator + Vulcano", "3x Adrenaline, Trauma Kit", "Heavy Shield"];
  else loadout = ["Tactical Mk.2 (balanced)", "Bettina + Anvil", "2x Medkit, 2x Adrenaline", "Medium Shield"];
  // Warnings
  const warnings = [];
  if (gearLevel < 2 && map.difficulty === "High") warnings.push("⚠️ Underpowered for this map — gear up before going here solo");
  if (squadSize === 1 && map.pvpLevel === "High") warnings.push("⚠️ Solo into high-PvP zone: use stealthy approach, avoid contests");
  if (timeAvailable === "quick" && route.time !== "5-10 min" && route.time !== "10 min") warnings.push("⚠️ Tight time budget — take only the first 2-3 stops, extract early");
  if (mapConditions.harvester && gearLevel < 3) warnings.push("⚠️ Harvester active: this is an elite event. Team up and gear up first.");
  return { map, route, loadout, warnings, score: scores[best] };
}

// ============================================================
// STORAGE HELPERS
// ============================================================
async function storageGet(key) {
  try { const r = await window.storage.get(key, true); return r ? JSON.parse(r.value) : null; } catch { return null; }
}
async function storageSet(key, val) {
  try { await window.storage.set(key, JSON.stringify(val), true); } catch {}
}

// ============================================================
// MAIN APP
// ============================================================
export default function ArcRaidersHQ() {
  const [tab, setTab] = useState("optimizer");
  const [mobileMenu, setMobileMenu] = useState(false);

  // Squad data
  const [squadNotes, setSquadNotes] = useState([
    { id:1, author:"System", text:"Welcome to Arc Raiders Squad HQ. All edits sync live across your squad!", time: new Date().toISOString(), pinned:true },
  ]);
  const [bpChecklist, setBpChecklist] = useState({});
  const [squadDiscoveries, setSquadDiscoveries] = useState([]);
  const [noteInput, setNoteInput] = useState("");
  const [noteAuthor, setNoteAuthor] = useState("Raider");
  const [discoveryInput, setDiscoveryInput] = useState({ map:"dam", text:"", author:"Raider" });
  const [lastSync, setLastSync] = useState(null);
  const syncIntervalRef = useRef(null);

  // Load from storage
  useEffect(() => {
    const load = async () => {
      const notes = await storageGet("arc:squadNotes");
      if (notes) setSquadNotes(notes);
      const bp = await storageGet("arc:bpChecklist");
      if (bp) setBpChecklist(bp);
      const disc = await storageGet("arc:discoveries");
      if (disc) setSquadDiscoveries(disc);
      setLastSync(new Date());
    };
    load();
    syncIntervalRef.current = setInterval(load, 8000);
    return () => clearInterval(syncIntervalRef.current);
  }, []);

  const addNote = async () => {
    if (!noteInput.trim()) return;
    const newNote = { id: Date.now(), author: noteAuthor||"Raider", text: noteInput, time: new Date().toISOString(), pinned: false };
    const updated = [newNote, ...squadNotes];
    setSquadNotes(updated);
    await storageSet("arc:squadNotes", updated);
    setNoteInput("");
  };
  const toggleBP = async (name) => {
    const updated = { ...bpChecklist, [name]: !bpChecklist[name] };
    setBpChecklist(updated);
    await storageSet("arc:bpChecklist", updated);
  };
  const addDiscovery = async () => {
    if (!discoveryInput.text.trim()) return;
    const disc = { id: Date.now(), ...discoveryInput, time: new Date().toISOString() };
    const updated = [disc, ...squadDiscoveries];
    setSquadDiscoveries(updated);
    await storageSet("arc:discoveries", updated);
    setDiscoveryInput(d => ({...d, text:""}));
  };

  // Optimizer state
  const [optGoal, setOptGoal] = useState("blueprints");
  const [optGear, setOptGear] = useState(2);
  const [optSquad, setOptSquad] = useState(3);
  const [optTime, setOptTime] = useState("standard");
  const [optRisk, setOptRisk] = useState(50);
  const [optConditions, setOptConditions] = useState({ nightRaid:false, hurricane:false, harvester:false, matriarch:false, emStorm:false });
  const [optStartMap, setOptStartMap] = useState("any");
  const [optResult, setOptResult] = useState(null);
  const runOptimizer = () => {
    const r = optimizeRun({ goal:optGoal, gearLevel:optGear, squadSize:optSquad, timeAvailable:optTime, riskTolerance:optRisk, mapConditions:optConditions, startMap:optStartMap });
    setOptResult(r);
  };

  // Maps state
  const [selectedMap, setSelectedMap] = useState("dam");
  const [selectedPOI, setSelectedPOI] = useState(null);
  const [mapView, setMapView] = useState("poi");
  const map = MAPS[selectedMap];

  // Items filter
  const [weaponFilter, setWeaponFilter] = useState("all");
  const [augFilter, setAugFilter] = useState("all");
  const [bpFilter, setBpFilter] = useState("all");
  const [bpSearch, setBpSearch] = useState("");

  const tierColor = t => ({ S:"#facc15", A:"#4ade80", B:"#60a5fa", C:"#a78bfa", D:"#94a3b8" }[t]||"#94a3b8");
  const actionColor = a => a.includes("NEVER") ? "#f87171" : a.includes("Keep ALL") ? "#4ade80" : a.includes("Keep buffer") ? "#facc15" : "#94a3b8";

  const tabs = [
    { id:"optimizer", label:"⚡ Optimizer", short:"Opt" },
    { id:"maps", label:"🗺️ Maps & Routes", short:"Maps" },
    { id:"weapons", label:"🔫 Weapons", short:"Guns" },
    { id:"augments", label:"🎒 Augments", short:"Aug" },
    { id:"blueprints", label:"📋 Blueprints", short:"BP" },
    { id:"items", label:"📦 Items/Mats", short:"Items" },
    { id:"squad", label:"👥 Squad", short:"Squad" },
  ];

  return (
    <div style={{ fontFamily:"'Courier New', monospace", background:"#0a0a0f", color:"#e2e8f0", minHeight:"100vh", fontSize:"13px" }}>
      {/* HEADER */}
      <div style={{ background:"linear-gradient(135deg,#0f1729 0%,#1a0a2e 50%,#0f1729 100%)", borderBottom:"2px solid #facc15", padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ fontSize:24, fontWeight:"bold", letterSpacing:2, color:"#facc15", textShadow:"0 0 20px #facc1588" }}>
            ⚡ ARC RAIDERS HQ
          </div>
          <div style={{ background:"#16a34a22", border:"1px solid #16a34a", borderRadius:4, padding:"2px 8px", fontSize:11, color:"#4ade80" }}>
            🟢 LIVE SYNC {lastSync ? `• ${lastSync.toLocaleTimeString()}` : ""}
          </div>
        </div>
        <div style={{ fontSize:11, color:"#64748b" }}>SQUAD FIELD GUIDE • MARCH 2026 META</div>
      </div>

      {/* TAB NAV */}
      <div style={{ display:"flex", overflowX:"auto", background:"#0f1729", borderBottom:"1px solid #1e293b", gap:0 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ background: tab===t.id ? "#facc1522" : "transparent", border:"none", borderBottom: tab===t.id ? "2px solid #facc15" : "2px solid transparent", color: tab===t.id ? "#facc15" : "#64748b", padding:"10px 14px", cursor:"pointer", whiteSpace:"nowrap", fontSize:12, fontFamily:"inherit", fontWeight: tab===t.id ? "bold" : "normal", transition:"all 0.15s" }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding:16, maxWidth:1200, margin:"0 auto" }}>

        {/* =========== OPTIMIZER =========== */}
        {tab === "optimizer" && (
          <div>
            <h2 style={{ color:"#facc15", margin:"0 0 16px", fontSize:16 }}>⚡ RUN OPTIMIZER — Build Your Perfect Raid</h2>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:16, marginBottom:16 }}>
              {/* Goal */}
              <div style={{ background:"#0f1729", border:"1px solid #1e293b", borderRadius:8, padding:16 }}>
                <div style={{ color:"#94a3b8", fontSize:11, marginBottom:8, letterSpacing:1 }}>PRIMARY GOAL</div>
                {[["blueprints","📋 Blueprints"],["materials","🔩 Materials"],["xp","⭐ XP / Leveling"],["pvp","⚔️ PvP / Combat"]].map(([v,l])=>(
                  <button key={v} onClick={()=>setOptGoal(v)} style={{ display:"block", width:"100%", textAlign:"left", background:optGoal===v?"#facc1522":"transparent", border:`1px solid ${optGoal===v?"#facc15":"#1e293b"}`, color:optGoal===v?"#facc15":"#94a3b8", padding:"8px 12px", marginBottom:4, borderRadius:4, cursor:"pointer", fontFamily:"inherit", fontSize:12 }}>
                    {optGoal===v?"▶ ":""}{l}
                  </button>
                ))}
              </div>

              {/* Setup */}
              <div style={{ background:"#0f1729", border:"1px solid #1e293b", borderRadius:8, padding:16 }}>
                <div style={{ color:"#94a3b8", fontSize:11, marginBottom:8, letterSpacing:1 }}>SETUP</div>
                <div style={{ marginBottom:12 }}>
                  <div style={{ color:"#64748b", fontSize:11, marginBottom:4 }}>GEAR LEVEL: <span style={{ color:"#e2e8f0" }}>{["Naked Run","Budget Kit","Mid Gear","Full Kit"][optGear-1]||"Mid"}</span></div>
                  <input type="range" min={1} max={4} value={optGear} onChange={e=>setOptGear(+e.target.value)} style={{ width:"100%" }} />
                </div>
                <div style={{ marginBottom:12 }}>
                  <div style={{ color:"#64748b", fontSize:11, marginBottom:4 }}>SQUAD SIZE: <span style={{ color:"#e2e8f0" }}>{optSquad} players</span></div>
                  <input type="range" min={1} max={4} value={optSquad} onChange={e=>setOptSquad(+e.target.value)} style={{ width:"100%" }} />
                </div>
                <div style={{ marginBottom:12 }}>
                  <div style={{ color:"#64748b", fontSize:11, marginBottom:4 }}>RISK TOLERANCE: <span style={{ color:"#e2e8f0" }}>{optRisk < 33 ? "Safe Farm" : optRisk < 66 ? "Balanced" : "Full Chaos"}</span></div>
                  <input type="range" min={0} max={100} value={optRisk} onChange={e=>setOptRisk(+e.target.value)} style={{ width:"100%" }} />
                </div>
                <div>
                  <div style={{ color:"#64748b", fontSize:11, marginBottom:4 }}>TIME BUDGET</div>
                  <select value={optTime} onChange={e=>setOptTime(e.target.value)} style={{ width:"100%", background:"#1e293b", border:"1px solid #334155", color:"#e2e8f0", padding:"6px 8px", borderRadius:4, fontFamily:"inherit" }}>
                    <option value="quick">Quick (~10 min)</option>
                    <option value="standard">Standard (~15 min)</option>
                    <option value="full">Full Run (~25 min)</option>
                  </select>
                </div>
              </div>

              {/* Conditions + Map */}
              <div style={{ background:"#0f1729", border:"1px solid #1e293b", borderRadius:8, padding:16 }}>
                <div style={{ color:"#94a3b8", fontSize:11, marginBottom:8, letterSpacing:1 }}>ACTIVE CONDITIONS</div>
                {[["nightRaid","🌙 Night Raid"],["hurricane","🌀 Hurricane"],["harvester","🤖 Harvester"],["matriarch","👁️ Matriarch"],["emStorm","⚡ EM Storm"]].map(([k,l])=>(
                  <label key={k} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6, cursor:"pointer", color: optConditions[k]?"#facc15":"#64748b" }}>
                    <input type="checkbox" checked={optConditions[k]||false} onChange={e=>setOptConditions(c=>({...c,[k]:e.target.checked}))} style={{ accentColor:"#facc15" }} />
                    <span style={{ fontSize:12 }}>{l}</span>
                  </label>
                ))}
                <div style={{ marginTop:12 }}>
                  <div style={{ color:"#64748b", fontSize:11, marginBottom:4 }}>DROP LOCATION (optional)</div>
                  <select value={optStartMap} onChange={e=>setOptStartMap(e.target.value)} style={{ width:"100%", background:"#1e293b", border:"1px solid #334155", color:"#e2e8f0", padding:"6px 8px", borderRadius:4, fontFamily:"inherit" }}>
                    <option value="any">Let optimizer decide</option>
                    {Object.values(MAPS).map(m=><option key={m.id} value={m.id}>{m.emoji} {m.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <button onClick={runOptimizer} style={{ display:"block", width:"100%", background:"linear-gradient(135deg,#854d0e,#ca8a04)", border:"none", color:"#0a0a0f", padding:"14px", borderRadius:8, fontSize:15, fontWeight:"bold", cursor:"pointer", letterSpacing:2, marginBottom:16, fontFamily:"inherit" }}>
              ⚡ OPTIMIZE MY RUN
            </button>

            {optResult && (
              <div style={{ background:"#0f1729", border:"2px solid #facc15", borderRadius:8, padding:20 }}>
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
                  <div style={{ fontSize:28 }}>{optResult.map.emoji}</div>
                  <div>
                    <div style={{ color:"#facc15", fontSize:18, fontWeight:"bold" }}>{optResult.map.name}</div>
                    <div style={{ color:"#64748b", fontSize:11 }}>RECOMMENDED MAP • Route: {optResult.route.name}</div>
                  </div>
                  <div style={{ marginLeft:"auto", background:"#facc1522", border:"1px solid #facc15", borderRadius:4, padding:"4px 10px", color:"#facc15", fontSize:11 }}>
                    {optResult.route.time} • {optResult.route.risk} Risk
                  </div>
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:16 }}>
                  <div>
                    <div style={{ color:"#94a3b8", fontSize:11, marginBottom:8, letterSpacing:1 }}>OPTIMIZED ROUTE STEPS</div>
                    {optResult.route.steps.map((s,i) => (
                      <div key={i} style={{ display:"flex", gap:8, marginBottom:6, alignItems:"flex-start" }}>
                        <div style={{ background:"#facc15", color:"#0a0a0f", width:20, height:20, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:11, fontWeight:"bold" }}>{i+1}</div>
                        <div style={{ color:"#e2e8f0", fontSize:12, paddingTop:2 }}>{s}</div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{ color:"#94a3b8", fontSize:11, marginBottom:8, letterSpacing:1 }}>RECOMMENDED LOADOUT</div>
                    {optResult.loadout.map((l,i) => (
                      <div key={i} style={{ color:"#4ade80", fontSize:12, marginBottom:4 }}>✓ {l}</div>
                    ))}
                    {optResult.map.conditions.nightRaid && optConditions.nightRaid && (
                      <div style={{ marginTop:12, padding:8, background:"#1e3a5f22", border:"1px solid #3b82f6", borderRadius:4, color:"#93c5fd", fontSize:11 }}>
                        🌙 NIGHT RAID BONUS: {optResult.map.conditions.nightRaid}
                      </div>
                    )}
                  </div>
                  <div>
                    <div style={{ color:"#94a3b8", fontSize:11, marginBottom:8, letterSpacing:1 }}>DROP HERE FIRST</div>
                    <div style={{ background:"#facc1511", border:"1px solid #facc1544", borderRadius:4, padding:10 }}>
                      <div style={{ color:"#facc15", fontWeight:"bold", marginBottom:4 }}>
                        {optResult.map.poi[0].name}
                      </div>
                      <div style={{ color:"#94a3b8", fontSize:11 }}>{optResult.map.poi[0].tips}</div>
                    </div>
                    <div style={{ color:"#94a3b8", fontSize:11, marginTop:12, marginBottom:4, letterSpacing:1 }}>EXTRACTION OPTIONS</div>
                    {optResult.map.extraction.slice(0,3).map((e,i)=>(
                      <div key={i} style={{ color:"#4ade80", fontSize:11, marginBottom:3 }}>⬆ {e}</div>
                    ))}
                    {optResult.warnings.length > 0 && (
                      <div style={{ marginTop:12 }}>
                        <div style={{ color:"#94a3b8", fontSize:11, marginBottom:4, letterSpacing:1 }}>WARNINGS</div>
                        {optResult.warnings.map((w,i)=>(
                          <div key={i} style={{ color:"#fbbf24", fontSize:11, marginBottom:4, background:"#78350f22", border:"1px solid #78350f", borderRadius:3, padding:"4px 8px" }}>{w}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========== MAPS =========== */}
        {tab === "maps" && (
          <div>
            <h2 style={{ color:"#facc15", margin:"0 0 16px", fontSize:16 }}>🗺️ Maps, POIs & Routes</h2>
            {/* Map selector */}
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:16 }}>
              {Object.values(MAPS).map(m => (
                <button key={m.id} onClick={()=>{setSelectedMap(m.id);setSelectedPOI(null);}} style={{ background: selectedMap===m.id ? m.bgColor : "#0f1729", border:`2px solid ${selectedMap===m.id ? m.color : "#1e293b"}`, color: selectedMap===m.id ? m.color : "#64748b", padding:"8px 14px", borderRadius:6, cursor:"pointer", fontFamily:"inherit", fontSize:12, fontWeight:"bold" }}>
                  {m.emoji} {m.name}
                </button>
              ))}
            </div>

            {/* Map header */}
            <div style={{ background:map.bgColor, border:`1px solid ${map.color}44`, borderRadius:8, padding:16, marginBottom:16, display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
              <div>
                <div style={{ fontSize:20, fontWeight:"bold", color:map.color }}>{map.emoji} {map.name}</div>
                <div style={{ color:"#94a3b8", fontSize:11, marginTop:4 }}>{map.lore}</div>
              </div>
              <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                <div style={{ textAlign:"center" }}><div style={{ fontSize:10, color:"#64748b" }}>DIFFICULTY</div><div style={{ color:map.color, fontWeight:"bold" }}>{map.difficulty}</div></div>
                <div style={{ textAlign:"center" }}><div style={{ fontSize:10, color:"#64748b" }}>PVP</div><div style={{ color:"#f87171", fontWeight:"bold" }}>{map.pvpLevel}</div></div>
              </div>
            </div>

            {/* View toggle */}
            <div style={{ display:"flex", gap:8, marginBottom:16 }}>
              {[["poi","📍 POIs & Loot"],["routes","🛣️ Routes"],["conditions","🌤️ Conditions"],["extract","⬆️ Extraction"]].map(([v,l])=>(
                <button key={v} onClick={()=>setMapView(v)} style={{ background:mapView===v?"#facc1522":"#0f1729", border:`1px solid ${mapView===v?"#facc15":"#1e293b"}`, color:mapView===v?"#facc15":"#64748b", padding:"6px 12px", borderRadius:4, cursor:"pointer", fontFamily:"inherit", fontSize:11 }}>
                  {l}
                </button>
              ))}
            </div>

            {/* SVG Map */}
            <div style={{ background:"#0f1729", border:"1px solid #1e293b", borderRadius:8, padding:12, marginBottom:16, position:"relative" }}>
              <div style={{ color:"#64748b", fontSize:10, marginBottom:8, letterSpacing:1 }}>CLICK A POI TO VIEW DETAILS — Tier color: S=Gold A=Green B=Blue C=Purple</div>
              <svg viewBox="0 0 100 100" style={{ width:"100%", maxHeight:340, background:"#0a0e1a", borderRadius:6, display:"block" }} preserveAspectRatio="xMidYMid meet">
                {/* Background terrain feel */}
                <rect x={0} y={0} width={100} height={100} fill="#0a0e1a"/>
                {/* subtle grid */}
                {[20,40,60,80].map(v=><>
                  <line key={`h${v}`} x1={0} y1={v} x2={100} y2={v} stroke="#1e293b" strokeWidth={0.3}/>
                  <line key={`v${v}`} x1={v} y1={0} x2={v} y2={100} stroke="#1e293b" strokeWidth={0.3}/>
                </>)}
                {/* Route connections */}
                {mapView === "routes" && map.poi.length > 1 && map.poi.slice(0,-1).map((p,i) => (
                  <line key={i} x1={p.x} y1={p.y} x2={map.poi[i+1].x} y2={map.poi[i+1].y} stroke="#facc1544" strokeWidth={0.5} strokeDasharray="2,2"/>
                ))}
                {/* POIs */}
                {map.poi.map(poi => {
                  const c = tierColor(poi.tier);
                  const isSelected = selectedPOI?.id === poi.id;
                  return (
                    <g key={poi.id} onClick={()=>setSelectedPOI(isSelected?null:poi)} style={{ cursor:"pointer" }}>
                      <circle cx={poi.x} cy={poi.y} r={isSelected?5:3.5} fill={c+"33"} stroke={c} strokeWidth={isSelected?1.5:1}/>
                      <text x={poi.x} y={poi.y+0.4} textAnchor="middle" dominantBaseline="middle" fontSize={2.2} fill={c} fontWeight="bold">{poi.tier}</text>
                      {isSelected && <circle cx={poi.x} cy={poi.y} r={7} fill="none" stroke={c} strokeWidth={0.5} opacity={0.5}/>}
                    </g>
                  );
                })}
                {/* Labels */}
                {map.poi.map(poi => (
                  <text key={poi.id+"l"} x={poi.x} y={poi.y-5} textAnchor="middle" fontSize={1.8} fill="#94a3b8">{poi.name.split(" ").slice(0,2).join(" ")}</text>
                ))}
                {/* Extracts */}
                {map.extraction.map((e,i) => (
                  <g key={i}>
                    <polygon points={`${10+i*12},88 ${14+i*12},95 ${6+i*12},95`} fill="#4ade8022" stroke="#4ade80" strokeWidth={0.5}/>
                    <text x={10+i*12} y={98} textAnchor="middle" fontSize={1.5} fill="#4ade80">{e.split(" ")[0]}</text>
                  </g>
                ))}
              </svg>

              {/* POI Detail */}
              {selectedPOI && (
                <div style={{ marginTop:12, background:`${map.bgColor}`, border:`1px solid ${tierColor(selectedPOI.tier)}44`, borderRadius:6, padding:14 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                    <div>
                      <span style={{ background:tierColor(selectedPOI.tier), color:"#0a0a0f", fontSize:11, fontWeight:"bold", padding:"2px 6px", borderRadius:3, marginRight:8 }}>TIER {selectedPOI.tier}</span>
                      <span style={{ color: tierColor(selectedPOI.tier), fontWeight:"bold", fontSize:14 }}>{selectedPOI.name}</span>
                    </div>
                    <button onClick={()=>setSelectedPOI(null)} style={{ background:"transparent", border:"none", color:"#64748b", cursor:"pointer", fontSize:14 }}>✕</button>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:12 }}>
                    <div><div style={{ color:"#64748b", fontSize:10, marginBottom:3 }}>LOOT</div><div style={{ color:"#e2e8f0", fontSize:12 }}>{selectedPOI.loot}</div></div>
                    <div><div style={{ color:"#64748b", fontSize:10, marginBottom:3 }}>SQUAD TIP</div><div style={{ color:"#facc15", fontSize:12 }}>{selectedPOI.tips}</div></div>
                    <div><div style={{ color:"#64748b", fontSize:10, marginBottom:3 }}>THREATS</div><div style={{ color:"#f87171", fontSize:12 }}>{selectedPOI.threats}</div></div>
                    <div><div style={{ color:"#64748b", fontSize:10, marginBottom:3 }}>EXTRACTION</div><div style={{ color:"#4ade80", fontSize:12 }}>⬆ {selectedPOI.extract}</div></div>
                  </div>
                </div>
              )}
            </div>

            {/* Routes */}
            {mapView === "routes" && (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:12 }}>
                {map.routes.map((r,i) => (
                  <div key={i} style={{ background:"#0f1729", border:`1px solid ${map.color}44`, borderRadius:8, padding:14 }}>
                    <div style={{ color:map.color, fontWeight:"bold", marginBottom:4 }}>{r.name}</div>
                    <div style={{ display:"flex", gap:8, marginBottom:8 }}>
                      <span style={{ background:"#1e293b", padding:"2px 6px", borderRadius:3, fontSize:10, color:"#94a3b8" }}>⏱ {r.time}</span>
                      <span style={{ background:"#1e293b", padding:"2px 6px", borderRadius:3, fontSize:10, color:r.risk==="High"||r.risk==="Very High"?"#f87171":"#4ade80" }}>⚠ {r.risk}</span>
                      <span style={{ background:"#1e293b", padding:"2px 6px", borderRadius:3, fontSize:10, color:"#60a5fa" }}>🎯 {r.goal}</span>
                    </div>
                    {r.steps.map((s,j) => (
                      <div key={j} style={{ display:"flex", gap:6, marginBottom:4, alignItems:"flex-start" }}>
                        <span style={{ color:"#facc15", fontSize:10, flexShrink:0, paddingTop:1 }}>{j+1}.</span>
                        <span style={{ color:"#e2e8f0", fontSize:11 }}>{s}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Conditions */}
            {mapView === "conditions" && (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:12 }}>
                {Object.entries(map.conditions).map(([k,v]) => (
                  <div key={k} style={{ background:"#0f1729", border:"1px solid #1e293b", borderRadius:6, padding:12 }}>
                    <div style={{ color:"#facc15", fontWeight:"bold", marginBottom:4, fontSize:11, letterSpacing:1 }}>{k.replace(/([A-Z])/g," $1").toUpperCase()}</div>
                    <div style={{ color:"#e2e8f0", fontSize:12 }}>{v}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Extract */}
            {mapView === "extract" && (
              <div>
                <div style={{ color:"#94a3b8", fontSize:11, marginBottom:8 }}>All known extraction points for {map.name}:</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {map.extraction.map((e,i) => (
                    <div key={i} style={{ background:"#16a34a22", border:"1px solid #16a34a", borderRadius:4, padding:"6px 12px", color:"#4ade80", fontSize:12 }}>⬆ {e}</div>
                  ))}
                </div>
                {/* Squad discoveries for this map */}
                <div style={{ marginTop:16 }}>
                  <div style={{ color:"#facc15", fontSize:12, fontWeight:"bold", marginBottom:8 }}>📡 Squad Zone Discoveries — {map.name}</div>
                  {squadDiscoveries.filter(d=>d.map===selectedMap).length === 0 && (
                    <div style={{ color:"#64748b", fontSize:11 }}>No discoveries yet. Add one below!</div>
                  )}
                  {squadDiscoveries.filter(d=>d.map===selectedMap).map(d=>(
                    <div key={d.id} style={{ background:"#0f1729", border:"1px solid #1e293b", borderRadius:4, padding:8, marginBottom:6 }}>
                      <span style={{ color:"#facc15", fontSize:10 }}>{d.author}</span> <span style={{ color:"#e2e8f0", fontSize:11 }}>{d.text}</span>
                    </div>
                  ))}
                  <div style={{ display:"flex", gap:8, marginTop:8, flexWrap:"wrap" }}>
                    <input value={discoveryInput.author} onChange={e=>setDiscoveryInput(d=>({...d,author:e.target.value}))} placeholder="Your name" style={{ background:"#1e293b", border:"1px solid #334155", color:"#e2e8f0", padding:"6px 10px", borderRadius:4, fontFamily:"inherit", fontSize:11, width:120 }}/>
                    <input value={discoveryInput.text} onChange={e=>setDiscoveryInput(d=>({...d,text:e.target.value}))} placeholder="Describe your find..." style={{ flex:1, background:"#1e293b", border:"1px solid #334155", color:"#e2e8f0", padding:"6px 10px", borderRadius:4, fontFamily:"inherit", fontSize:11, minWidth:150 }}/>
                    <button onClick={addDiscovery} style={{ background:"#facc15", border:"none", color:"#0a0a0f", padding:"6px 14px", borderRadius:4, cursor:"pointer", fontFamily:"inherit", fontSize:11, fontWeight:"bold" }}>POST</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========== WEAPONS =========== */}
        {tab === "weapons" && (
          <div>
            <h2 style={{ color:"#facc15", margin:"0 0 16px", fontSize:16 }}>🔫 Weapons — March 2026 Meta</h2>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:16 }}>
              {["all","S","A","B","C","D"].map(f=>(
                <button key={f} onClick={()=>setWeaponFilter(f)} style={{ background:weaponFilter===f?"#facc1522":"#0f1729", border:`1px solid ${weaponFilter===f?"#facc15":"#1e293b"}`, color:weaponFilter===f?"#facc15":"#64748b", padding:"4px 12px", borderRadius:4, cursor:"pointer", fontFamily:"inherit", fontSize:11 }}>
                  {f==="all"?"All Tiers":`Tier ${f}`}
                </button>
              ))}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))", gap:10 }}>
              {WEAPONS.filter(w=>weaponFilter==="all"||w.tier===weaponFilter).map(w=>(
                <div key={w.name} style={{ background:"#0f1729", border:`1px solid ${tierColor(w.tier)}44`, borderRadius:8, padding:14 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                    <div>
                      <span style={{ background:tierColor(w.tier), color:"#0a0a0f", fontSize:10, fontWeight:"bold", padding:"1px 6px", borderRadius:2, marginRight:6 }}>{w.tier}</span>
                      <span style={{ color:tierColor(w.tier), fontWeight:"bold", fontSize:13 }}>{w.name}</span>
                    </div>
                    <span style={{ background:"#1e293b", color:"#94a3b8", fontSize:9, padding:"2px 5px", borderRadius:2 }}>{w.meta}</span>
                  </div>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:8 }}>
                    <span style={{ background:"#1e293b", color:"#60a5fa", fontSize:10, padding:"2px 6px", borderRadius:3 }}>{w.type}</span>
                    <span style={{ background:"#1e293b", color:"#a78bfa", fontSize:10, padding:"2px 6px", borderRadius:3 }}>{w.ammo} Ammo</span>
                    <span style={{ background:"#1e293b", color:"#94a3b8", fontSize:10, padding:"2px 6px", borderRadius:3 }}>⚖ {w.weight}</span>
                  </div>
                  <div style={{ display:"flex", gap:16, marginBottom:8 }}>
                    <div>
                      <div style={{ fontSize:9, color:"#64748b" }}>PvP</div>
                      <div style={{ height:4, width:60, background:"#1e293b", borderRadius:2, marginTop:2 }}>
                        <div style={{ height:4, width:`${w.pvp*10}%`, background: w.pvp>=8?"#f87171":w.pvp>=6?"#facc15":"#64748b", borderRadius:2 }}/>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize:9, color:"#64748b" }}>PvE</div>
                      <div style={{ height:4, width:60, background:"#1e293b", borderRadius:2, marginTop:2 }}>
                        <div style={{ height:4, width:`${w.pve*10}%`, background: w.pve>=8?"#4ade80":w.pve>=6?"#facc15":"#64748b", borderRadius:2 }}/>
                      </div>
                    </div>
                  </div>
                  <div style={{ color:"#94a3b8", fontSize:11, marginBottom:6 }}>{w.notes}</div>
                  <div style={{ color:"#64748b", fontSize:10 }}>Craft: {w.craft}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========== AUGMENTS =========== */}
        {tab === "augments" && (
          <div>
            <h2 style={{ color:"#facc15", margin:"0 0 16px", fontSize:16 }}>🎒 Augments — Full Tier List</h2>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:16 }}>
              {["all","S","A","B","C","D"].map(f=>(
                <button key={f} onClick={()=>setAugFilter(f)} style={{ background:augFilter===f?"#facc1522":"#0f1729", border:`1px solid ${augFilter===f?"#facc15":"#1e293b"}`, color:augFilter===f?"#facc15":"#64748b", padding:"4px 12px", borderRadius:4, cursor:"pointer", fontFamily:"inherit", fontSize:11 }}>
                  {f==="all"?"All":`Tier ${f}`}
                </button>
              ))}
            </div>
            <div style={{ background:"#0f172944", border:"1px solid #1e293b", borderRadius:4, padding:"8px 12px", marginBottom:12, fontSize:11, color:"#94a3b8" }}>
              ℹ️ Shield compatibility: ALL augments support Light Shield. Only Mk.2+ Tactical and Mk.1+ Combat allow Medium Shield. Heavy Shield = Combat Mk.3 or Tactical Mk.3 Defensive only.
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:10 }}>
              {AUGMENTS.filter(a=>augFilter==="all"||a.tier===augFilter).map(a=>(
                <div key={a.name} style={{ background:"#0f1729", border:`1px solid ${tierColor(a.tier)}44`, borderRadius:8, padding:14 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                    <div>
                      <span style={{ background:tierColor(a.tier), color:"#0a0a0f", fontSize:10, fontWeight:"bold", padding:"1px 6px", borderRadius:2, marginRight:6 }}>{a.tier}</span>
                      <span style={{ color:tierColor(a.tier), fontWeight:"bold", fontSize:13 }}>{a.name}</span>
                    </div>
                    <span style={{ background:"#1e293b", color:"#a78bfa", fontSize:9, padding:"2px 5px", borderRadius:2 }}>{a.rarity}</span>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:4, marginBottom:8 }}>
                    {[["Slots",a.slots,"#60a5fa"],["Weight",a.weight+"kg","#fb923c"],["Safe Pck.",a.safePockets,"#4ade80"],["Q.Slots",a.quickSlots,"#a78bfa"]].map(([l,v,c])=>(
                      <div key={l} style={{ background:"#1e293b", borderRadius:3, padding:4, textAlign:"center" }}>
                        <div style={{ fontSize:9, color:"#64748b" }}>{l}</div>
                        <div style={{ fontSize:13, fontWeight:"bold", color:c }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginBottom:6 }}>
                    <span style={{ fontSize:9, color:"#64748b" }}>SHIELDS: </span>
                    {a.shields.map(s=>(
                      <span key={s} style={{ background:s==="Heavy"?"#7f1d1d22":s==="Medium"?"#1e3a5f22":"#14532d22", border:`1px solid ${s==="Heavy"?"#dc2626":s==="Medium"?"#3b82f6":"#16a34a"}`, color:s==="Heavy"?"#f87171":s==="Medium"?"#93c5fd":"#4ade80", fontSize:9, padding:"1px 5px", borderRadius:2, marginRight:3 }}>{s}</span>
                    ))}
                  </div>
                  {a.passive !== "None" && <div style={{ color:"#facc15", fontSize:11, marginBottom:4 }}>⚡ {a.passive}</div>}
                  <div style={{ color:"#94a3b8", fontSize:11 }}>{a.notes}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========== BLUEPRINTS =========== */}
        {tab === "blueprints" && (
          <div>
            <h2 style={{ color:"#facc15", margin:"0 0 4px", fontSize:16 }}>📋 Blueprint Database + Squad Tracker</h2>
            <div style={{ color:"#64748b", fontSize:11, marginBottom:16 }}>Check off what your squad has learned — syncs live</div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:12 }}>
              {["all","Weapon","Augment","Attachment","Explosive"].map(f=>(
                <button key={f} onClick={()=>setBpFilter(f)} style={{ background:bpFilter===f?"#facc1522":"#0f1729", border:`1px solid ${bpFilter===f?"#facc15":"#1e293b"}`, color:bpFilter===f?"#facc15":"#64748b", padding:"4px 12px", borderRadius:4, cursor:"pointer", fontFamily:"inherit", fontSize:11 }}>
                  {f==="all"?"All":f}
                </button>
              ))}
              <input value={bpSearch} onChange={e=>setBpSearch(e.target.value)} placeholder="Search blueprints..." style={{ background:"#1e293b", border:"1px solid #334155", color:"#e2e8f0", padding:"4px 10px", borderRadius:4, fontFamily:"inherit", fontSize:11, marginLeft:"auto", width:160 }}/>
            </div>
            <div style={{ marginBottom:8, fontSize:11, color:"#94a3b8" }}>
              Squad progress: <span style={{ color:"#4ade80", fontWeight:"bold" }}>{Object.values(bpChecklist).filter(Boolean).length}</span> / {BLUEPRINTS.length} blueprints learned
            </div>
            <div style={{ height:4, background:"#1e293b", borderRadius:2, marginBottom:16 }}>
              <div style={{ height:4, background:"linear-gradient(90deg,#16a34a,#4ade80)", borderRadius:2, width:`${(Object.values(bpChecklist).filter(Boolean).length/BLUEPRINTS.length)*100}%`, transition:"width 0.3s" }}/>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:8 }}>
              {BLUEPRINTS
                .filter(b=>(bpFilter==="all"||b.category===bpFilter) && (!bpSearch || b.name.toLowerCase().includes(bpSearch.toLowerCase())))
                .map(b => {
                  const learned = bpChecklist[b.name];
                  return (
                    <div key={b.name} onClick={()=>toggleBP(b.name)} style={{ background: learned ? "#16a34a11" : "#0f1729", border:`1px solid ${learned?"#16a34a":"#1e293b"}`, borderRadius:6, padding:12, cursor:"pointer", opacity: learned ? 0.85 : 1, transition:"all 0.2s" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <div style={{ width:16, height:16, border:`2px solid ${learned?"#4ade80":"#334155"}`, background:learned?"#4ade80":"transparent", borderRadius:3, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                            {learned && <span style={{ color:"#0a0a0f", fontSize:10, fontWeight:"bold" }}>✓</span>}
                          </div>
                          <span style={{ color: learned ? "#4ade80" : "#e2e8f0", fontWeight:"bold", fontSize:12 }}>{b.name}</span>
                        </div>
                        <div style={{ display:"flex", gap:4 }}>
                          <span style={{ background:"#1e293b", color:"#94a3b8", fontSize:9, padding:"1px 5px", borderRadius:2 }}>{b.category}</span>
                          {b.questReward && <span style={{ background:"#7c3aed22", border:"1px solid #7c3aed", color:"#a78bfa", fontSize:9, padding:"1px 5px", borderRadius:2 }}>QUEST</span>}
                          {b.guaranteed && <span style={{ background:"#16a34a22", border:"1px solid #16a34a", color:"#4ade80", fontSize:9, padding:"1px 5px", borderRadius:2 }}>GUARANTEED</span>}
                        </div>
                      </div>
                      <div style={{ color:"#64748b", fontSize:10, marginBottom:3 }}>{b.source} → {b.container}</div>
                      <div style={{ color:"#94a3b8", fontSize:10, marginBottom:4 }}>{b.conditions}</div>
                      {b.bestMaps.length > 0 && (
                        <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                          {b.bestMaps.map(m => <span key={m} style={{ background:`${MAPS[m]?.color||"#64748b"}22`, border:`1px solid ${MAPS[m]?.color||"#64748b"}44`, color:MAPS[m]?.color||"#94a3b8", fontSize:9, padding:"1px 5px", borderRadius:2 }}>{MAPS[m]?.emoji} {MAPS[m]?.name?.split(" ")[0]}</span>)}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* =========== ITEMS / MATERIALS =========== */}
        {tab === "items" && (
          <div>
            <h2 style={{ color:"#facc15", margin:"0 0 16px", fontSize:16 }}>📦 Items, Consumables & Materials</h2>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:20 }}>
              {/* Consumables */}
              <div>
                <div style={{ color:"#facc15", fontWeight:"bold", marginBottom:10, fontSize:13, borderBottom:"1px solid #1e293b", paddingBottom:6 }}>💊 Consumables — When To Use</div>
                {CONSUMABLES.map(c=>(
                  <div key={c.name} style={{ background:"#0f1729", border:"1px solid #1e293b", borderRadius:6, padding:10, marginBottom:8 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                      <span style={{ color:"#e2e8f0", fontWeight:"bold", fontSize:12 }}>{c.name}</span>
                      <span style={{ background:"#1e293b", color:"#94a3b8", fontSize:9, padding:"1px 5px", borderRadius:2 }}>⚖ {c.weight}</span>
                    </div>
                    <div style={{ color:"#4ade80", fontSize:11, marginBottom:3 }}>{c.effect}</div>
                    <div style={{ color:"#60a5fa", fontSize:10, fontStyle:"italic", marginBottom:3 }}>Use when: {c.when}</div>
                    <div style={{ color:"#64748b", fontSize:10 }}>{c.notes}</div>
                  </div>
                ))}
              </div>
              {/* Materials */}
              <div>
                <div style={{ color:"#facc15", fontWeight:"bold", marginBottom:10, fontSize:13, borderBottom:"1px solid #1e293b", paddingBottom:6 }}>🔩 Materials — Keep or Recycle?</div>
                {MATERIALS.map(m=>(
                  <div key={m.name} style={{ background:"#0f1729", border:`1px solid ${actionColor(m.action)}44`, borderRadius:6, padding:10, marginBottom:8 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                      <span style={{ color:"#e2e8f0", fontWeight:"bold", fontSize:12 }}>{m.name}</span>
                      <span style={{ background:`${actionColor(m.action)}22`, border:`1px solid ${actionColor(m.action)}44`, color:actionColor(m.action), fontSize:9, padding:"1px 5px", borderRadius:2 }}>{m.category}</span>
                    </div>
                    <div style={{ color:actionColor(m.action), fontWeight:"bold", fontSize:11, marginBottom:3 }}>{m.action}</div>
                    <div style={{ color:"#94a3b8", fontSize:10 }}>{m.notes}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========== SQUAD =========== */}
        {tab === "squad" && (
          <div>
            <h2 style={{ color:"#facc15", margin:"0 0 16px", fontSize:16 }}>👥 Squad Notes — Live Board</h2>
            <div style={{ background:"#0f1729", border:"1px solid #1e293b", borderRadius:8, padding:16, marginBottom:16 }}>
              <div style={{ color:"#94a3b8", fontSize:11, marginBottom:10, letterSpacing:1 }}>POST A NOTE — VISIBLE TO ENTIRE SQUAD IMMEDIATELY</div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                <input value={noteAuthor} onChange={e=>setNoteAuthor(e.target.value)} placeholder="Your name" style={{ background:"#1e293b", border:"1px solid #334155", color:"#e2e8f0", padding:"8px 12px", borderRadius:4, fontFamily:"inherit", fontSize:12, width:140 }}/>
                <input value={noteInput} onChange={e=>setNoteInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addNote()} placeholder="Drop intel, meta callout, loot find..." style={{ flex:1, background:"#1e293b", border:"1px solid #334155", color:"#e2e8f0", padding:"8px 12px", borderRadius:4, fontFamily:"inherit", fontSize:12, minWidth:200 }}/>
                <button onClick={addNote} style={{ background:"#facc15", border:"none", color:"#0a0a0f", padding:"8px 16px", borderRadius:4, cursor:"pointer", fontFamily:"inherit", fontSize:12, fontWeight:"bold" }}>POST</button>
              </div>
            </div>

            {/* Pinned */}
            {squadNotes.filter(n=>n.pinned).map(n=>(
              <div key={n.id} style={{ background:"#78350f22", border:"1px solid #ca8a04", borderRadius:6, padding:12, marginBottom:8, display:"flex", gap:10 }}>
                <span style={{ color:"#fbbf24", fontSize:14, flexShrink:0 }}>📌</span>
                <div>
                  <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:4 }}>
                    <span style={{ color:"#fbbf24", fontWeight:"bold", fontSize:11 }}>{n.author}</span>
                    <span style={{ color:"#64748b", fontSize:10 }}>{new Date(n.time).toLocaleString()}</span>
                  </div>
                  <div style={{ color:"#e2e8f0", fontSize:12 }}>{n.text}</div>
                </div>
              </div>
            ))}

            {/* Regular notes */}
            {squadNotes.filter(n=>!n.pinned).map(n=>(
              <div key={n.id} style={{ background:"#0f1729", border:"1px solid #1e293b", borderRadius:6, padding:12, marginBottom:8 }}>
                <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:4 }}>
                  <span style={{ color:"#facc15", fontWeight:"bold", fontSize:11 }}>{n.author}</span>
                  <span style={{ color:"#64748b", fontSize:10 }}>{new Date(n.time).toLocaleString()}</span>
                </div>
                <div style={{ color:"#e2e8f0", fontSize:12 }}>{n.text}</div>
              </div>
            ))}

            {/* Map discoveries */}
            <div style={{ marginTop:20 }}>
              <div style={{ color:"#facc15", fontWeight:"bold", marginBottom:10, fontSize:13 }}>📡 All Squad Zone Discoveries</div>
              {squadDiscoveries.length === 0 && <div style={{ color:"#64748b", fontSize:11 }}>No squad discoveries yet. Go find something and share it!</div>}
              {squadDiscoveries.map(d=>(
                <div key={d.id} style={{ background:"#0f1729", border:`1px solid ${MAPS[d.map]?.color||"#1e293b"}44`, borderRadius:6, padding:10, marginBottom:6 }}>
                  <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    <span style={{ color:MAPS[d.map]?.color||"#94a3b8", fontSize:10 }}>{MAPS[d.map]?.emoji} {MAPS[d.map]?.name}</span>
                    <span style={{ color:"#facc15", fontSize:10 }}>{d.author}</span>
                    <span style={{ color:"#64748b", fontSize:10 }}>{new Date(d.time).toLocaleString()}</span>
                  </div>
                  <div style={{ color:"#e2e8f0", fontSize:12, marginTop:4 }}>{d.text}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* FOOTER */}
      <div style={{ borderTop:"1px solid #1e293b", padding:"8px 16px", fontSize:10, color:"#334155", textAlign:"center" }}>
        ARC RAIDERS SQUAD HQ • Data: March 2026 • Headwinds Patch • Live sync every 8s • All squad changes persist across sessions
      </div>
    </div>
  );
}
