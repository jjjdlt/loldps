// ChampionSpells.js - Fixed to work with Data Dragon API correctly!
import React, { useState, useEffect } from 'react';
import SpellCard from './SpellCard';
import '../css/ChampionSpells.css';

// Simple cache to avoid repeated fetches
const championDataCache = {};

function ChampionSpells({ championKey, onSpellSelect, selectedSpells = [] }) {
    const [championData, setChampionData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Format champion name for API URL
    const formatChampionNameForAPI = (key) => {
        const specialCases = {
            'Wukong': 'MonkeyKing',
            'Nunu & Willump': 'Nunu',
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

                // Check cache first
                if (championDataCache[formattedName]) {
                    setChampionData(championDataCache[formattedName]);
                    setLoading(false);
                    return;
                }

                // Try to fetch the individual champion data
                const url = `https://ddragon.leagueoflegends.com/cdn/15.18.1/data/en_US/champion/${formattedName}.json`;

                const response = await fetch(url);

                if (!response.ok) {
                    // If direct fetch fails, try with a CORS proxy
                    console.warn(`Direct fetch failed, trying proxy...`);
                    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
                    const proxyResponse = await fetch(proxyUrl);

                    if (!proxyResponse.ok) {
                        throw new Error(`Failed to fetch champion data: ${proxyResponse.status}`);
                    }

                    const proxyData = await proxyResponse.json();
                    const championInfo = proxyData.data[formattedName] || proxyData.data[championKey];

                    if (championInfo) {
                        championDataCache[formattedName] = championInfo;
                        setChampionData(championInfo);
                    } else {
                        throw new Error('Champion data not found');
                    }
                } else {
                    const data = await response.json();
                    const championInfo = data.data[formattedName] || data.data[championKey];

                    if (!championInfo) {
                        throw new Error('Champion data not found in response');
                    }

                    championDataCache[formattedName] = championInfo;
                    setChampionData(championInfo);
                }
            } catch (err) {
                console.error('Error fetching champion data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchChampionData();
    }, [championKey]);

    // Handle spell click
    const handleSpellClick = (spellId, spellData) => {
        if (onSpellSelect) {
            onSpellSelect(spellId, spellData);
        }
    };

    // Loading state
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
                <div className="error-message">
                    Failed to load abilities: {error}
                    <br />
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '10px',
                            padding: '5px 10px',
                            cursor: 'pointer',
                            background: '#c89b3c',
                            border: 'none',
                            borderRadius: '4px',
                            color: '#0c1f1f'
                        }}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!championData) {
        return null;
    }

    return (
        <div className="champion-spells-container">
            <h3>{championData.name}'s Abilities</h3>

            <div className="spells-grid">
                {/* Passive Ability - NO imageUrl prop! */}
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

                {/* Q, W, E, R Abilities - NO imageUrl prop! */}
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
                                : championData.spells?.[parseInt(spellId.replace('spell', ''))];

                            if (!spell) return null;

                            return (
                                <div key={spellId} className="spell-detail-card">
                                    <h5>{spell.name}</h5>
                                    {spell.cooldownBurn && spell.cooldownBurn !== "0" && (
                                        <p>Cooldown: {spell.cooldownBurn}s</p>
                                    )}
                                    {spell.costBurn && spell.costBurn !== "0" && (
                                        <p>Cost: {spell.costBurn}</p>
                                    )}
                                    {spell.rangeBurn && spell.rangeBurn !== "self" && (
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