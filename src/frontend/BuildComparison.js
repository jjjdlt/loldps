// BuildComparison.js - Side-by-side build comparison magic! *excited wiggle*
import React, { useState, useEffect } from 'react';
import { useGameData } from '../backend/GameDataContext';
import BuildStorage from '../backend/BuildStorage';
import '../css/BuildComparison.css';

function BuildComparison() {
    const { champions, items, createCalculator } = useGameData();
    const [savedBuilds, setSavedBuilds] = useState([]);
    const [selectedBuild1, setSelectedBuild1] = useState(null);
    const [selectedBuild2, setSelectedBuild2] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showBuildSelector1, setShowBuildSelector1] = useState(false);
    const [showBuildSelector2, setShowBuildSelector2] = useState(false);

    // Load builds on mount
    useEffect(() => {
        loadBuilds();
    }, []);

    const loadBuilds = () => {
        setIsLoading(true);
        const builds = BuildStorage.getAllBuilds();
        setSavedBuilds(builds);

        // Auto-select first two builds if available
        if (builds.length > 0) {
            setSelectedBuild1(builds[0]);
            if (builds.length > 1) {
                setSelectedBuild2(builds[1]);
            }
        }
        setIsLoading(false);
    };

    // Format stat values
    const formatStat = (value, decimals = 1) => {
        if (value === undefined || value === null) return '0';
        return Number(value).toFixed(decimals);
    };

    const formatPercent = (value) => {
        if (value === undefined || value === null) return '0%';
        return `${(value * 100).toFixed(1)}%`;
    };

    // Get image URLs
    const getItemImageUrl = (itemId) => {
        return `https://ddragon.leagueoflegends.com/cdn/15.18.1/img/item/${itemId}.png`;
    };

    const getChampionImageUrl = (championKey) => {
        return `https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/${championKey}.png`;
    };

    const getRuneIconUrl = (runeId) => {
        // Placeholder - would need actual rune data
        return 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/domination/electrocute/electrocute.png';
    };

    // Calculate stat bars for visualization
    const calculateStatBar = (stat, maxValue) => {
        return Math.min((stat / maxValue) * 100, 100);
    };

    // Compare two stat values
    const getStatComparison = (stat1, stat2) => {
        if (!stat1 || !stat2) return { winner: 'none', diff: 0 };

        const diff = ((stat1 - stat2) / stat2 * 100).toFixed(1);

        if (Math.abs(stat1 - stat2) < 0.01) {
            return { winner: 'tie', diff: 0 };
        } else if (stat1 > stat2) {
            return { winner: 'build1', diff: `+${diff}%` };
        } else {
            return { winner: 'build2', diff: `${diff}%` };
        }
    };

    // Render build box
    const renderBuildBox = (build, buildNumber, onSelectBuild, showSelector, setShowSelector) => {
        if (!build) {
            return (
                <div className="build-box empty">
                    <div className="empty-build-message">
                        <span className="empty-icon">📦</span>
                        <p>No build selected</p>
                        <button
                            className="select-build-btn"
                            onClick={() => setShowSelector(!showSelector)}
                        >
                            Select Build
                        </button>
                    </div>

                    {showSelector && (
                        <div className="build-selector-popup">
                            <div className="selector-header">
                                <h4>Select a Build</h4>
                                <button
                                    className="close-btn"
                                    onClick={() => setShowSelector(false)}
                                >
                                    ×
                                </button>
                            </div>
                            <div className="build-list">
                                {savedBuilds.map(b => (
                                    <div
                                        key={b.id}
                                        className="build-option"
                                        onClick={() => {
                                            onSelectBuild(b);
                                            setShowSelector(false);
                                        }}
                                    >
                                        <img
                                            src={getChampionImageUrl(b.championKey)}
                                            alt={b.championName}
                                            className="option-icon"
                                        />
                                        <div className="option-details">
                                            <span className="option-name">{b.name}</span>
                                            <span className="option-champ">{b.championName} • Lvl {b.level}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div className={`build-box build-${buildNumber}`}>
                <div className="build-content">
                    {/* Champion Portrait */}
                    <div className="champion-portrait">
                        <img
                            src={getChampionImageUrl(build.championKey)}
                            alt={build.championName}
                            className="champion-image"
                        />
                        <div className="champion-level">Lvl {build.level}</div>
                    </div>

                    {/* Build Details */}
                    <div className="build-details">
                        {/* Stats Visualization */}
                        <div className="stats-visualization">
                            <div className="stat-bar-mini">
                                <span className="bar-label">AD</span>
                                <div className="bar-bg">
                                    <div
                                        className="bar-fill ad"
                                        style={{ width: `${calculateStatBar(build.stats.attackDamage, 500)}%` }}
                                    />
                                </div>
                                <span className="bar-value">{formatStat(build.stats.attackDamage, 0)}</span>
                            </div>
                            <div className="stat-bar-mini">
                                <span className="bar-label">AP</span>
                                <div className="bar-bg">
                                    <div
                                        className="bar-fill ap"
                                        style={{ width: `${calculateStatBar(build.stats.abilityPower, 800)}%` }}
                                    />
                                </div>
                                <span className="bar-value">{formatStat(build.stats.abilityPower, 0)}</span>
                            </div>
                            <div className="stat-bar-mini">
                                <span className="bar-label">AS</span>
                                <div className="bar-bg">
                                    <div
                                        className="bar-fill as"
                                        style={{ width: `${calculateStatBar(build.stats.attackSpeed, 2.5)}%` }}
                                    />
                                </div>
                                <span className="bar-value">{formatStat(build.stats.attackSpeed, 2)}</span>
                            </div>
                            <div className="stat-bar-mini">
                                <span className="bar-label">HP</span>
                                <div className="bar-bg">
                                    <div
                                        className="bar-fill hp"
                                        style={{ width: `${calculateStatBar(build.stats.health, 4000)}%` }}
                                    />
                                </div>
                                <span className="bar-value">{formatStat(build.stats.health, 0)}</span>
                            </div>
                        </div>

                        {/* Items and Runes */}
                        <div className="loadout-section">
                            <div className="items-display">
                                {build.items.map((item, index) => (
                                    <div key={index} className="item-slot">
                                        <img
                                            src={getItemImageUrl(item.id)}
                                            alt={item.name}
                                            title={item.name}
                                            className="item-icon"
                                        />
                                    </div>
                                ))}
                                {/* Empty slots */}
                                {[...Array(6 - build.items.length)].map((_, index) => (
                                    <div key={`empty-${index}`} className="item-slot empty">
                                        <span className="empty-slot-icon">+</span>
                                    </div>
                                ))}
                            </div>

                            <div className="runes-display">
                                <div className="rune-column">
                                    {/* Primary tree placeholder */}
                                    <div className="rune-slot keystone">
                                        <img
                                            src={getRuneIconUrl('keystone')}
                                            alt="Keystone"
                                            className="rune-icon"
                                        />
                                    </div>
                                    <div className="rune-slot">🔴</div>
                                    <div className="rune-slot">🔴</div>
                                    <div className="rune-slot">🔴</div>
                                </div>
                                <div className="rune-column">
                                    {/* Secondary tree placeholder */}
                                    <div className="rune-slot">🔵</div>
                                    <div className="rune-slot">🔵</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Build Info Footer */}
                <div className="build-footer">
                    <div className="build-name">{build.name}</div>
                    <button
                        className="change-build-btn"
                        onClick={() => setShowSelector(!showSelector)}
                    >
                        Change
                    </button>
                </div>

                {/* Build Selector Popup */}
                {showSelector && (
                    <div className="build-selector-popup">
                        <div className="selector-header">
                            <h4>Select a Build</h4>
                            <button
                                className="close-btn"
                                onClick={() => setShowSelector(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="build-list">
                            {savedBuilds.map(b => (
                                <div
                                    key={b.id}
                                    className={`build-option ${b.id === build.id ? 'selected' : ''}`}
                                    onClick={() => {
                                        onSelectBuild(b);
                                        setShowSelector(false);
                                    }}
                                >
                                    <img
                                        src={getChampionImageUrl(b.championKey)}
                                        alt={b.championName}
                                        className="option-icon"
                                    />
                                    <div className="option-details">
                                        <span className="option-name">{b.name}</span>
                                        <span className="option-champ">{b.championName} • Lvl {b.level}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Stat comparison categories
    const statCategories = [
        {
            title: '⚔️ Offensive Stats',
            stats: [
                { key: 'attackDamage', label: 'Attack Damage', format: 'number' },
                { key: 'abilityPower', label: 'Ability Power', format: 'number' },
                { key: 'attackSpeed', label: 'Attack Speed', format: 'decimal2' },
                { key: 'critChance', label: 'Critical Chance', format: 'percent' },
                { key: 'critDamage', label: 'Critical Damage', format: 'percent' },
                { key: 'lethality', label: 'Lethality', format: 'number' },
                { key: 'armorPenetrationPercent', label: 'Armor Pen %', format: 'percent' },
                { key: 'magicPenetrationFlat', label: 'Magic Pen', format: 'number' },
                { key: 'magicPenetrationPercent', label: 'Magic Pen %', format: 'percent' },
            ]
        },
        {
            title: '🛡️ Defensive Stats',
            stats: [
                { key: 'health', label: 'Health', format: 'number' },
                { key: 'armor', label: 'Armor', format: 'number' },
                { key: 'magicResist', label: 'Magic Resist', format: 'number' },
                { key: 'healthRegen', label: 'Health Regen', format: 'decimal1' },
                { key: 'lifeSteal', label: 'Life Steal', format: 'percent' },
                { key: 'omnivamp', label: 'Omnivamp', format: 'percent' },
            ]
        },
        {
            title: '✨ Utility Stats',
            stats: [
                { key: 'movementSpeed', label: 'Movement Speed', format: 'number' },
                { key: 'abilityHaste', label: 'Ability Haste', format: 'number' },
                { key: 'cooldownReduction', label: 'CDR', format: 'percent' },
                { key: 'attackRange', label: 'Attack Range', format: 'number' },
                { key: 'mana', label: 'Mana', format: 'number' },
                { key: 'manaRegen', label: 'Mana Regen', format: 'decimal1' },
            ]
        }
    ];

    // Format stat value based on type
    const formatStatValue = (value, format) => {
        if (value === undefined || value === null) return '0';

        switch(format) {
            case 'number':
                return formatStat(value, 0);
            case 'decimal1':
                return formatStat(value, 1);
            case 'decimal2':
                return formatStat(value, 2);
            case 'percent':
                return formatPercent(value);
            default:
                return formatStat(value, 1);
        }
    };

    if (isLoading) {
        return (
            <div className="build-comparison-container">
                <div className="loading-message">Loading builds... ⚔️</div>
            </div>
        );
    }

    if (savedBuilds.length === 0) {
        return (
            <div className="build-comparison-container">
                <div className="no-builds-message">
                    <h2>No Builds Available</h2>
                    <p>Create and save some builds in Combat Sim first! :3</p>
                </div>
            </div>
        );
    }

    return (
        <div className="build-comparison-container">
            {/* Left side - Build boxes */}
            <div className="builds-column">
                {renderBuildBox(selectedBuild1, 1, setSelectedBuild1, showBuildSelector1, setShowBuildSelector1)}
                {renderBuildBox(selectedBuild2, 2, setSelectedBuild2, showBuildSelector2, setShowBuildSelector2)}
            </div>

            {/* Right side - Comparison cards */}
            <div className="comparison-column">
                <div className="comparison-header">
                    <h2>📊 Build Comparison</h2>
                    {selectedBuild1 && selectedBuild2 && (
                        <p className="comparison-subtitle">
                            {selectedBuild1.championName} vs {selectedBuild2.championName}
                        </p>
                    )}
                </div>

                {(!selectedBuild1 || !selectedBuild2) ? (
                    <div className="comparison-placeholder">
                        <p>Select two builds to compare their stats!</p>
                    </div>
                ) : (
                    <div className="comparison-cards">
                        {statCategories.map((category, catIndex) => (
                            <div key={catIndex} className="comparison-card">
                                <h3>{category.title}</h3>
                                <div className="stat-comparisons">
                                    {category.stats.map((stat, statIndex) => {
                                        const val1 = selectedBuild1.stats[stat.key];
                                        const val2 = selectedBuild2.stats[stat.key];
                                        const comparison = getStatComparison(val1, val2);

                                        return (
                                            <div key={statIndex} className="stat-comparison-row">
                                                <div className="stat-label">{stat.label}</div>
                                                <div className="stat-values">
                                                    <div className={`stat-value build-1 ${
                                                        comparison.winner === 'build1' ? 'winner' :
                                                            comparison.winner === 'tie' ? 'tie' : 'loser'
                                                    }`}>
                                                        {formatStatValue(val1, stat.format)}
                                                        {comparison.winner === 'build1' && (
                                                            <span className="diff-badge">{comparison.diff}</span>
                                                        )}
                                                    </div>
                                                    <div className="vs-separator">vs</div>
                                                    <div className={`stat-value build-2 ${
                                                        comparison.winner === 'build2' ? 'winner' :
                                                            comparison.winner === 'tie' ? 'tie' : 'loser'
                                                    }`}>
                                                        {formatStatValue(val2, stat.format)}
                                                        {comparison.winner === 'build2' && (
                                                            <span className="diff-badge">{comparison.diff}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        {/* Gold Efficiency Card */}
                        <div className="comparison-card efficiency-card">
                            <h3>💰 Gold Efficiency</h3>
                            <div className="efficiency-comparison">
                                <div className="efficiency-block">
                                    <div className="build-label">Build 1</div>
                                    <div className="gold-cost">
                                        {selectedBuild1.totalCost}g
                                    </div>
                                    <div className="efficiency-percent">
                                        {selectedBuild1.goldEfficiency || 100}% Efficient
                                    </div>
                                </div>
                                <div className="efficiency-vs">⚔️</div>
                                <div className="efficiency-block">
                                    <div className="build-label">Build 2</div>
                                    <div className="gold-cost">
                                        {selectedBuild2.totalCost}g
                                    </div>
                                    <div className="efficiency-percent">
                                        {selectedBuild2.goldEfficiency || 100}% Efficient
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default BuildComparison;