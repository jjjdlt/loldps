// ChampionSpells.js
import React, { useState, useEffect } from 'react';
import SpellCard from './SpellCard';
import '../css/ChampionSpells.css';

function ChampionSpells({ championKey, onSpellSelect, selectedSpells = [] }) {
    const [championData, setChampionData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Format champion name for API URL
    const formatChampionNameForAPI = (key) => {
        // Special cases for API URLs
        const specialCases = {
            'Wukong': 'MonkeyKing',
            'Nunu & Willump': 'Nunu',
            // Add more special cases as needed
        };

        return specialCases[key] || key.replace(/['\s]/g, '');
    };

    useEffect(() => {
        if (!championKey) {
            setChampionData(null);
            return;
        }

        const fetchChampionData = async () => {
            setLoading(true);
            setError(null);

            try {
                const formattedName = formatChampionNameForAPI(championKey);
                const url = `https://ddragon.leagueoflegends.com/cdn/15.18.1/data/en_US/champion/${formattedName}.json`;

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Failed to fetch champion data: ${response.status}`);
                }

                const data = await response.json();
                // The data comes wrapped in a data object with the champion name as key
                const championInfo = data.data[formattedName] || data.data[championKey];

                if (!championInfo) {
                    throw new Error('Champion data not found in response');
                }

                setChampionData(championInfo);
            } catch (err) {
                console.error('Error fetching champion data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchChampionData();
    }, [championKey]);

    if (!championKey) {
        return (
            <div className="champion-spells-container">
                <h3>Champion Abilities</h3>
                <p className="no-champion-message">Select a champion to view abilities!</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="champion-spells-container">
                <h3>Champion Abilities</h3>
                <div className="loading-spells">Loading abilities...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="champion-spells-container">
                <h3>Champion Abilities</h3>
                <div className="error-message">Failed to load abilities: {error}</div>
            </div>
        );
    }

    if (!championData) {
        return null;
    }

    const handleSpellClick = (spellId, spellData) => {
        if (onSpellSelect) {
            onSpellSelect(spellId, spellData);
        }
    };

    return (
        <div className="champion-spells-container">
            <h3>{championData.name}'s Abilities</h3>

            <div className="spells-grid">
                {/* Passive Ability */}
                {championData.passive && (
                    <SpellCard
                        spell={championData.passive}
                        spellType="passive"
                        championName={championKey}
                        onClick={() => handleSpellClick('passive', championData.passive)}
                        selected={selectedSpells.includes('passive')}
                        hotkey="Passive"
                    />
                )}

                {/* Q, W, E, R Abilities */}
                {championData.spells && championData.spells.map((spell, index) => {
                    const hotkeys = ['Q', 'W', 'E', 'R'];
                    const spellId = `spell${index}`;

                    return (
                        <SpellCard
                            key={spell.id}
                            spell={spell}
                            spellType="ability"
                            championName={championKey}
                            onClick={() => handleSpellClick(spellId, spell)}
                            selected={selectedSpells.includes(spellId)}
                            hotkey={hotkeys[index]}
                        />
                    );
                })}
            </div>

            {/* Spell Details Section */}
            {selectedSpells.length > 0 && championData && (
                <div className="spell-details">
                    <h4>Selected Ability Details</h4>
                    <div className="spell-stats">
                        {selectedSpells.map(spellId => {
                            const spell = spellId === 'passive'
                                ? championData.passive
                                : championData.spells[parseInt(spellId.replace('spell', ''))];

                            if (!spell) return null;

                            return (
                                <div key={spellId} className="spell-detail-card">
                                    <h5>{spell.name}</h5>
                                    {spell.cooldownBurn && (
                                        <p>Cooldown: {spell.cooldownBurn}s</p>
                                    )}
                                    {spell.costBurn && (
                                        <p>Cost: {spell.costBurn}</p>
                                    )}
                                    {spell.rangeBurn && (
                                        <p>Range: {spell.rangeBurn}</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ChampionSpells;