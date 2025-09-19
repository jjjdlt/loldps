// ChampionBuilder.js - Enhanced with save functionality! :3
import React, { useState } from 'react';
import { useGameData } from './GameDataContext';
import ChampionSelector from "../components/ChampionSelector";
import ItemBuilder from "./ItemBuilder";
import StatsDisplay from "../components/StatsDisplay";
import DamageCalculator from '../components/DamageCalculator';
import ChampionSpells from '../components/ChampionSpells';
import BuildStorage from './BuildStorage';
import '../css/ChampionBuilder.css'; // We'll need to create some additional styles
import RuneBuilder from '../components/RuneBuilder';



function ChampionBuilder() {
    const { createCalculator, champions, items } = useGameData();
    const [selectedChampion, setSelectedChampion] = useState(null);
    const [calculator, setCalculator] = useState(null);
    const [currentStats, setCurrentStats] = useState(null);
    const [selectedSpells, setSelectedSpells] = useState([]);
    const [buildName, setBuildName] = useState('');
    const [saveMessage, setSaveMessage] = useState(null);
    const [currentLevel, setCurrentLevel] = useState(1);

    const handleChampionSelect = (championKey) => {
        // Create a fresh calculator instance! :3
        const newCalculator = createCalculator(championKey);
        setCalculator(newCalculator);
        setSelectedChampion(championKey);

        // Reset selected spells when changing champions
        setSelectedSpells([]);
        setCurrentLevel(1);

        // Calculate initial stats
        const initialStats = newCalculator.calculateFinalStats();
        setCurrentStats(initialStats);
    };

    const handleRuneUpdate = (selectedRunes) => {
        // Update your calculator with the new runes
        if (calculator) {
            calculator.setKeystone(selectedRunes.primaryKeystone);
            calculator.setPrimaryRunes(selectedRunes.primaryRunes);
            calculator.setSecondaryRunes(selectedRunes.secondaryRunes);
            calculator.setStatShards(selectedRunes.statShards);
        }
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
        if (calculator) {
            console.log('Selected spell:', spellId, spellData);
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

    const handleLevelChange = (level) => {
        const newLevel = Math.max(1, Math.min(18, parseInt(level) || 1));
        setCurrentLevel(newLevel);

        if (calculator) {
            calculator.setLevel(newLevel);
            const newStats = calculator.calculateFinalStats();
            setCurrentStats(newStats);
        }
    };

    const saveBuild = () => {
        if (!selectedChampion || !calculator) {
            setSaveMessage({ type: 'error', text: 'Please select a champion first!' });
            setTimeout(() => setSaveMessage(null), 3000);
            return;
        }

        // Get base stats at level 1 for comparison
        const tempCalc = createCalculator(selectedChampion);
        tempCalc.setLevel(currentLevel);
        const baseStats = tempCalc.calculateFinalStats();

        const buildData = {
            name: buildName || `${champions[selectedChampion]?.name} Build`,
            championKey: selectedChampion,
            championName: champions[selectedChampion]?.name,
            level: currentLevel,
            items: calculator.items,
            stats: currentStats,
            baseStats: baseStats,
            runes: {
                // Placeholder rune data
                primaryTree: null,
                secondaryTree: null,
                keystone: null,
                primaryRunes: [],
                secondaryRunes: [],
                statShards: {
                    offense: null,
                    flex: null,
                    defense: null
                }
            },
            spells: selectedSpells,
            notes: ''
        };

        const result = BuildStorage.saveBuild(buildData);

        if (result.success) {
            setSaveMessage({ type: 'success', text: '✨ Build saved successfully!' });
            setBuildName(''); // Clear the name field
        } else {
            setSaveMessage({ type: 'error', text: `Error: ${result.error}` });
        }

        setTimeout(() => setSaveMessage(null), 3000);
    };

    const clearBuild = () => {
        if (calculator) {
            calculator.clearItems();
            const newStats = calculator.calculateFinalStats();
            setCurrentStats(newStats);
        }
    };

    return (
        <div className="champion-builder-enhanced">
            {/* Save Build Section */}
            <div className="build-controls">
                <div className="save-build-section">
                    <input
                        type="text"
                        placeholder="Build name (optional)"
                        value={buildName}
                        onChange={(e) => setBuildName(e.target.value)}
                        className="build-name-input"
                    />
                    <button
                        onClick={saveBuild}
                        className="save-build-btn"
                        disabled={!selectedChampion}
                    >
                        💾 Save Build
                    </button>
                    <button
                        onClick={clearBuild}
                        className="clear-build-btn"
                        disabled={!calculator || calculator.items.length === 0}
                    >
                        🗑️ Clear Items
                    </button>
                </div>

                {/* Level Control */}
                <div className="level-control">
                    <label>Level:</label>
                    <input
                        type="number"
                        min="1"
                        max="18"
                        value={currentLevel}
                        onChange={(e) => handleLevelChange(e.target.value)}
                        className="level-input"
                    />
                    <div className="level-buttons">
                        {[1, 6, 11, 16, 18].map(lvl => (
                            <button
                                key={lvl}
                                className={`level-preset ${currentLevel === lvl ? 'active' : ''}`}
                                onClick={() => handleLevelChange(lvl)}
                            >
                                {lvl}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Save Message */}
            {saveMessage && (
                <div className={`save-message ${saveMessage.type}`}>
                    {saveMessage.text}
                </div>
            )}

            {/* Existing Components */}
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

                    {/* Build Summary */}
                    <div className="build-summary">
                        <h3>Build Summary</h3>
                        <div className="summary-stats">
                            <div className="summary-item">
                                <span className="label">Total Cost:</span>
                                <span className="value gold">{calculator.items.reduce((sum, item) => sum + (item.gold?.total || 0), 0)} gold</span>
                            </div>
                            <div className="summary-item">
                                <span className="label">Items:</span>
                                <span className="value">{calculator.items.length}/6</span>
                            </div>
                            <div className="summary-item">
                                <span className="label">Level:</span>
                                <span className="value">{currentLevel}</span>
                            </div>
                        </div>
                    </div>
                    <RuneBuilder
                        onRuneUpdate={handleRuneUpdate}
                        // initialRunes={savedRunes} // Optional: pass in saved runes
                    />
                    <StatsDisplay
                        stats={currentStats}
                        championName={champions[selectedChampion]?.name}
                        level={calculator.level}
                    />
                    <DamageCalculator attackerCalculator={calculator} />
                </>
            )}
        </div>
    );
}

export default ChampionBuilder;