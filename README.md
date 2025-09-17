# LoLDPS

A **React-based web application** for League of Legends players that calculates and visualizes **average damage output over time** and evaluates **item gold efficiency**.  
<img width="1913" height="823" alt="champselect1" src="https://github.com/user-attachments/assets/79ff469c-dcc1-4322-99ed-cca1b2a84ce7" />

Using Riot Games' official data (`.json` files), users can:
- Select champions
- Build custom item sets
- Analyze spells, runes, and summoner spells
- Compare item efficiency
- Visualize DPS (damage per second) performance over time

---

## Features

- 🔹 **Champion Selector** – choose any champion directly from Riot’s data  
- 🔹 **Item Builder** – assemble custom builds and compare items  
- 🔹 **Gold Efficiency Calculator** – evaluate item stats vs. cost  
- 🔹 **DPS Simulator** – visualize sustained damage output over time  
- 🔹 **Interactive UI** – clean, responsive design with React  

<img width="1912" height="748" alt="itemselect1" src="https://github.com/user-attachments/assets/3a650bee-b944-4f9d-8ae0-d67689448b36" />

<img width="1908" height="896" alt="image" src="https://github.com/user-attachments/assets/8471047a-0947-4148-9389-b0445a5cb8a9" />

<img width="1568" height="590" alt="damagecalc1" src="https://github.com/user-attachments/assets/a26d8c72-9fcc-4360-846b-446feb8f50a5" />

---

## Tech Stack

- **Frontend:** React, CSS  
- **Data Source:** Riot Games static `.json` datasets (champions, items, runes, summoner spells)  
- **Logic Layer:** Custom calculation engine for stats, item effects, and damage formulas  

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/jjjdlt/loldps.git

# Navigate into the project
cd loldps

# Install dependencies
npm install

# Run the app
npm start
