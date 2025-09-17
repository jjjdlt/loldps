// GameDataContext.js
import React, { createContext, useContext, useMemo } from 'react';
import ChampionCalculator from './CalculationEngine';

const GameDataContext = createContext();

export function GameDataProvider({ children, gameData }) {
    // *gets super animated* This is where the magic happens!
    const calculatorFactory = useMemo(() => ({
        // Function to create calculator instances
        createCalculator: (championKey) => {
            const championData = gameData.champions[championKey];
            if (!championData) {
                console.error(`Champion ${championKey} not found in:`, Object.keys(gameData.champions));
                throw new Error(`Champion ${championKey} not found! D:`);
            }

            // Create calculator with already-converted champion data
            return new ChampionCalculator(championData);
        },

        // Direct access to raw data (already converted!)
        champions: gameData.champions,
        items: gameData.items,
        runes: gameData.runes,
        portraits: gameData.portraits || {},

        // Helper functions! *wiggles fingers*
        getChampionList: () => Object.keys(gameData.champions),
        getItemList: () => Object.keys(gameData.items),

        // Find items by name (case-insensitive)
        findItem: (itemName) => {
            if (!itemName) return null;

            return Object.values(gameData.items).find(item =>
                item.name && item.name.toLowerCase().includes(itemName.toLowerCase())
            );
        },

        // Find items by tag
        findItemsByTag: (tag) => {
            return Object.values(gameData.items).filter(item =>
                item.tags && item.tags.includes(tag)
            );
        },

        // Get item by ID
        getItem: (itemId) => gameData.items[itemId] || null,

        // Get champion by key
        getChampion: (championKey) => gameData.champions[championKey] || null
    }), [gameData]);

    return (
        <GameDataContext.Provider value={calculatorFactory}>
            {children}
        </GameDataContext.Provider>
    );
}

export const useGameData = () => {
    const context = useContext(GameDataContext);
    if (!context) {
        throw new Error('useGameData must be used within a GameDataProvider');
    }
    return context;
};

export default GameDataContext;