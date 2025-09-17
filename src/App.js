// App.js - Your main data hub! *gestures excitedly*
import React from 'react';
import championsJson from './data/champion.json';
import itemsJson from './data/item.json';
import runesJson from './data/runesReforged.json';
import ChampionCalculator from './backend/CalculationEngine';
import { GameDataProvider } from './backend/GameDataContext';
import HomePage from './frontend/Homepage';
import StatMapper from './backend/StatMappingUtility';

function App() {
    // Transform your data for easy calculator consumption! :3
    // Convert all data from Riot format to calculator format
    const gameData = {
        champions: StatMapper.convertAllChampions(championsJson.data),
        items: StatMapper.convertAllItems(itemsJson.data),
        runes: runesJson, // Assuming runes are already in correct format
        portraits: {} // Add portraits data if you have it
    };

    // Debug logging to verify conversions
    console.log('Converted Champions:', Object.keys(gameData.champions).length);
    console.log('Converted Items:', Object.keys(gameData.items).length);
    console.log('Sample Champion Stats:', gameData.champions['Jinx']?.stats);
    console.log('Sample Item Stats:', gameData.items['1001']?.stats);

    return (
        <GameDataProvider gameData={gameData}>
            <div className="app">
                <HomePage />
            </div>
        </GameDataProvider>
    );
}

export default App;