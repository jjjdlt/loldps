// SavedBuilds.js - The main saved builds interface! *excited*
import React, { useState, useEffect } from 'react';
import { useGameData } from '../backend/GameDataContext';
import BuildStorage from '../backend/BuildStorage';
import '../css/SavedBuilds.css';

function SavedBuilds() {
    const { champions, items, createCalculator } = useGameData();
    const [savedBuilds, setSavedBuilds] = useState([]);
    const [selectedBuild, setSelectedBuild] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [editingBuildId, setEditingBuildId] = useState(null);
    const [newBuildName, setNewBuildName] = useState('');

    // Load builds on component mount
    useEffect(() => {
        loadBuilds();
    }, []);

    // Auto-select first build when builds change
    useEffect(() => {
        if (savedBuilds.length > 0 && !selectedBuild) {
            setSelectedBuild(savedBuilds[0]);
        }
    }, [savedBuilds, selectedBuild]);

    const loadBuilds = () => {
        setIsLoading(true);
        const builds = BuildStorage.getAllBuilds();
        setSavedBuilds(builds);
        setIsLoading(false);
    };

    const handleSelectBuild = (build) => {
        setSelectedBuild(build);
        setEditingBuildId(null);
    };

    const handleDeleteBuild = (buildId) => {
        if (window.confirm('Are you sure you want to delete this build?')) {
            BuildStorage.deleteBuild(buildId);
            loadBuilds();
            if (selectedBuild?.id === buildId) {
                setSelectedBuild(null);
            }
        }
    };

    const handleRenameBuild = (buildId) => {
        if (newBuildName.trim()) {
            BuildStorage.renameBuild(buildId, newBuildName.trim());
            loadBuilds();
            setEditingBuildId(null);
            setNewBuildName('');
        }
    };

    const handleLoadBuild = (build) => {
        // This would communicate with the ChampionBuilder to load the build
        // For now, we'll just show an alert
        alert(`Loading build: ${build.name}\n\nThis would load the build into the Champion Builder!`);
        // TODO: Implement actual build loading via context or routing
    };

    const calculateStatChange = (baseStat, finalStat) => {
        if (!baseStat || baseStat === 0) return 0;
        return ((finalStat - baseStat) / baseStat * 100).toFixed(1);
    };

    const formatStat = (value, decimals = 1) => {
        if (value === undefined || value === null) return '0';
        return Number(value).toFixed(decimals);
    };

    // Get item image URL
    const getItemImageUrl = (itemId) => {
        return `https://ddragon.leagueoflegends.com/cdn/15.18.1/img/item/${itemId}.png`;
    };

    // Get champion image URL
    const getChampionImageUrl = (championKey) => {
        return `https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/${championKey}.png`;
    };

    if (isLoading) {
        return (
            <div className="saved-builds-container">
                <div className="loading-message">Loading saved builds...</div>
            </div>
        );
    }

    return (
        <div className="saved-builds-container">
            {/* Left Column - Saved Builds List */}
            <div className="builds-list-column">
                <div className="builds-list-header">
                    <h2>Saved Loadouts</h2>
                    <span className="build-count">{savedBuilds.length} builds</span>
                </div>

                <div className="builds-list">
                    {savedBuilds.length === 0 ? (
                        <div className="no-builds-message">
                            <p>No saved builds yet!</p>
                            <p className="hint">Create a build in Combat Sim and save it here :3</p>
                        </div>
                    ) : (
                        savedBuilds.map((build) => (
                            <div
                                key={build.id}
                                className={`build-list-item ${selectedBuild?.id === build.id ? 'selected' : ''}`}
                                onClick={() => handleSelectBuild(build)}
                            >
                                <div className="build-item-header">
                                    {editingBuildId === build.id ? (
                                        <input
                                            type="text"
                                            value={newBuildName}
                                            onChange={(e) => setNewBuildName(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleRenameBuild(build.id)}
                                            onBlur={() => setEditingBuildId(null)}
                                            onClick={(e) => e.stopPropagation()}
                                            autoFocus
                                            className="build-name-input"
                                        />
                                    ) : (
                                        <h3 className="build-name">{build.name}</h3>
                                    )}
                                    <div className="build-actions">
                                        <button
                                            className="action-btn edit"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingBuildId(build.id);
                                                setNewBuildName(build.name);
                                            }}
                                            title="Rename build"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className="action-btn delete"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteBuild(build.id);
                                            }}
                                            title="Delete build"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                                <div className="build-item-info">
                                    <span className="champion-name">{build.championName}</span>
                                    <span className="build-level">Lv.{build.level}</span>
                                </div>
                                <div className="build-item-meta">
                                    <span className="build-cost">💰 {build.totalCost} gold</span>
                                    <span className="build-date">{new Date(build.timestamp).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Right Column - Build Details Card */}
            <div className="build-details-column">
                {selectedBuild ? (
                    <div className="build-card">
                        <div className="build-card-header">
                            <h2>{selectedBuild.name}</h2>
                            <button
                                className="load-build-btn"
                                onClick={() => handleLoadBuild(selectedBuild)}
                            >
                                Load Build →
                            </button>
                        </div>

                        <div className="build-card-content">
                            {/* Champion and Items Section */}
                            <div className="champion-items-section">
                                <div className="champion-portrait">
                                    <img
                                        src={getChampionImageUrl(selectedBuild.championKey)}
                                        alt={selectedBuild.championName}
                                        onError={(e) => {
                                            e.target.src = 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Aatrox.png';
                                        }}
                                    />
                                    <div className="champion-level">Lv.{selectedBuild.level}</div>
                                </div>

                                <div className="items-grid">
                                    {[0, 1, 2, 3, 4, 5].map((index) => (
                                        <div key={index} className="item-slot">
                                            {selectedBuild.items[index] ? (
                                                <img
                                                    src={getItemImageUrl(selectedBuild.items[index].id)}
                                                    alt={selectedBuild.items[index].name}
                                                    title={selectedBuild.items[index].name}
                                                    onError={(e) => {
                                                        e.target.src = 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/item/1001.png';
                                                    }}
                                                />
                                            ) : (
                                                <div className="empty-item-slot">+</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Runes Section (Placeholder) */}
                            <div className="runes-section">
                                <h3>Runes & Shards</h3>
                                <div className="runes-grid">
                                    <div className="rune-tree primary">
                                        <div className="rune-row keystone">
                                            <div className="rune-slot placeholder">K</div>
                                        </div>
                                        <div className="rune-row">
                                            <div className="rune-slot placeholder">1</div>
                                            <div className="rune-slot placeholder">2</div>
                                            <div className="rune-slot placeholder">3</div>
                                        </div>
                                        <div className="rune-row">
                                            <div className="rune-slot placeholder">1</div>
                                            <div className="rune-slot placeholder">2</div>
                                            <div className="rune-slot placeholder">3</div>
                                        </div>
                                        <div className="rune-row">
                                            <div className="rune-slot placeholder">1</div>
                                            <div className="rune-slot placeholder">2</div>
                                            <div className="rune-slot placeholder">3</div>
                                        </div>
                                    </div>

                                    <div className="rune-tree secondary">
                                        <div className="rune-row">
                                            <div className="rune-slot placeholder">1</div>
                                            <div className="rune-slot placeholder">2</div>
                                            <div className="rune-slot placeholder">3</div>
                                        </div>
                                        <div className="rune-row">
                                            <div className="rune-slot placeholder">1</div>
                                            <div className="rune-slot placeholder">2</div>
                                            <div className="rune-slot placeholder">3</div>
                                        </div>
                                    </div>

                                    <div className="stat-shards">
                                        <div className="shard-row">
                                            <div className="shard-slot placeholder">⚔️</div>
                                            <div className="shard-slot placeholder">🏹</div>
                                            <div className="shard-slot placeholder">✨</div>
                                        </div>
                                        <div className="shard-row">
                                            <div className="shard-slot placeholder">⚔️</div>
                                            <div className="shard-slot placeholder">✨</div>
                                            <div className="shard-slot placeholder">❤️</div>
                                        </div>
                                        <div className="shard-row">
                                            <div className="shard-slot placeholder">❤️</div>
                                            <div className="shard-slot placeholder">🛡️</div>
                                            <div className="shard-slot placeholder">🛡️</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Visualization Section */}
                            <div className="stats-visualization">
                                <h3>Build Statistics</h3>
                                <div className="stat-bars">
                                    <div className="stat-bar">
                                        <span className="stat-label">AD</span>
                                        <div className="bar-container">
                                            <div
                                                className="bar-fill ad"
                                                style={{ width: `${Math.min((selectedBuild.stats.attackDamage / 500) * 100, 100)}%` }}
                                            >
                                                <span className="bar-value">{formatStat(selectedBuild.stats.attackDamage, 0)}</span>
                                            </div>
                                        </div>
                                        <span className="stat-change">+{calculateStatChange(selectedBuild.baseStats?.attackDamage, selectedBuild.stats.attackDamage)}%</span>
                                    </div>

                                    <div className="stat-bar">
                                        <span className="stat-label">AP</span>
                                        <div className="bar-container">
                                            <div
                                                className="bar-fill ap"
                                                style={{ width: `${Math.min((selectedBuild.stats.abilityPower / 800) * 100, 100)}%` }}
                                            >
                                                <span className="bar-value">{formatStat(selectedBuild.stats.abilityPower, 0)}</span>
                                            </div>
                                        </div>
                                        <span className="stat-change">+{selectedBuild.stats.abilityPower > 0 ? '∞' : '0'}%</span>
                                    </div>

                                    <div className="stat-bar">
                                        <span className="stat-label">AS</span>
                                        <div className="bar-container">
                                            <div
                                                className="bar-fill as"
                                                style={{ width: `${Math.min((selectedBuild.stats.attackSpeed / 2.5) * 100, 100)}%` }}
                                            >
                                                <span className="bar-value">{formatStat(selectedBuild.stats.attackSpeed, 2)}</span>
                                            </div>
                                        </div>
                                        <span className="stat-change">+{calculateStatChange(selectedBuild.baseStats?.attackSpeed, selectedBuild.stats.attackSpeed)}%</span>
                                    </div>

                                    <div className="stat-bar">
                                        <span className="stat-label">Pen</span>
                                        <div className="bar-container">
                                            <div
                                                className="bar-fill pen"
                                                style={{ width: `${Math.min(((selectedBuild.stats.lethality || 0) / 50) * 100, 100)}%` }}
                                            >
                                                <span className="bar-value">{formatStat(selectedBuild.stats.lethality || 0, 0)}</span>
                                            </div>
                                        </div>
                                        <span className="stat-change">
                                            {selectedBuild.stats.armorPenetrationPercent > 0 ? `${formatStat(selectedBuild.stats.armorPenetrationPercent, 0)}%` : '0%'}
                                        </span>
                                    </div>

                                    <div className="stat-bar">
                                        <span className="stat-label">MS</span>
                                        <div className="bar-container">
                                            <div
                                                className="bar-fill ms"
                                                style={{ width: `${Math.min((selectedBuild.stats.movementSpeed / 500) * 100, 100)}%` }}
                                            >
                                                <span className="bar-value">{formatStat(selectedBuild.stats.movementSpeed, 0)}</span>
                                            </div>
                                        </div>
                                        <span className="stat-change">+{calculateStatChange(selectedBuild.baseStats?.movementSpeed, selectedBuild.stats.movementSpeed)}%</span>
                                    </div>

                                    <div className="stat-bar">
                                        <span className="stat-label">CDR</span>
                                        <div className="bar-container">
                                            <div
                                                className="bar-fill cdr"
                                                style={{ width: `${Math.min((selectedBuild.stats.abilityHaste / 100) * 100, 100)}%` }}
                                            >
                                                <span className="bar-value">{formatStat(selectedBuild.stats.abilityHaste, 0)} AH</span>
                                            </div>
                                        </div>
                                        <span className="stat-change">{formatStat(selectedBuild.stats.cooldownReduction || 0, 1)}% CDR</span>
                                    </div>
                                </div>

                                {/* Gold Efficiency */}
                                <div className="gold-efficiency">
                                    <h4>Gold Efficiency</h4>
                                    <div className="efficiency-value">
                                        {selectedBuild.goldEfficiency || 'TBD'}%
                                        <span className="efficiency-label">
                                            {selectedBuild.goldEfficiency > 100 ? ' (Efficient!)' :
                                                selectedBuild.goldEfficiency < 100 ? ' (Inefficient)' : ''}
                                        </span>
                                    </div>
                                    <p className="efficiency-note">Gold efficiency calculation coming soon! :3</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="no-build-selected">
                        <h2>Select a Build</h2>
                        <p>Choose a saved build from the list to view details</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SavedBuilds;