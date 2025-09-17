// ChampionBuilder.js
import { useState } from 'react';
import { useGameData } from './GameDataContext';
import ChampionSelector from "../components/ChampionSelector";
import ItemBuilder from "./ItemBuilder";
import StatsDisplay from "../components/StatsDisplay";
import DamageCalculator from '../components/DamageCalculator';
import ChampionSpells from '../components/ChampionSpells';


function ChampionBuilder() {
    const { createCalculator, champions, items } = useGameData();
    const [selectedChampion, setSelectedChampion] = useState(null);
    const [calculator, setCalculator] = useState(null);
    const [currentStats, setCurrentStats] = useState(null);
    const [selectedSpells, setSelectedSpells] = useState([]);

    const handleChampionSelect = (championKey) => {
        // Create a fresh calculator instance! :3
        const newCalculator = createCalculator(championKey);
        setCalculator(newCalculator);
        setSelectedChampion(championKey);

        // Reset selected spells when changing champions
        setSelectedSpells([]);

        // Calculate initial stats
        const initialStats = newCalculator.calculateFinalStats();
        setCurrentStats(initialStats);
    };

    const handleSpellSelect = (spellId, spellData) => {
        // Toggle spell selection
        setSelectedSpells(prevSpells => {
            if (prevSpells.includes(spellId)) {
                // Deselect if already selected
                return prevSpells.filter(id => id !== spellId);
            } else {
                // Add to selected spells
                return [...prevSpells, spellId];
            }
        });

        // Here you can also add spell data to the calculator if needed
        // For example, if you want to calculate ability damage later:
        if (calculator) {
            console.log('Selected spell:', spellId, spellData);
            // calculator.setSpellData(spellId, spellData); // If you add this method to your calculator
        }
    };

    const addItem = (itemData) => {
        if (!calculator) return;

        // Add item to calculator
        calculator.addItem(itemData);

        // Recalculate stats! *happy wiggle*
        const newStats = calculator.calculateFinalStats();
        setCurrentStats(newStats);
    };

    const removeItem = (itemId) => {
        if (!calculator) return;

        // Remove item from calculator
        calculator.removeItem(itemId);

        // Recalculate stats
        const newStats = calculator.calculateFinalStats();
        setCurrentStats(newStats);
    };

    return (
        <div>
            <ChampionSelector
                champions={champions}
                onSelect={handleChampionSelect}
                selectedChampion={selectedChampion}
            />

            {selectedChampion && (
                <ChampionSpells
                    championKey={selectedChampion}
                    onSpellSelect={handleSpellSelect}
                    selectedSpells={selectedSpells}
                />
            )}

            {calculator && (
                <>
                    <ItemBuilder
                        items={items}
                        onAddItem={addItem}
                        onRemoveItem={removeItem}
                        currentItems={calculator.items}
                    />
                    <StatsDisplay
                        stats={currentStats}
                        championName={champions[selectedChampion]?.name}
                        level={calculator.level}
                    />
                    <DamageCalculator calculator={calculator} />
                </>
            )}
        </div>
    );
}

export default ChampionBuilder;