// DamageCalculator.js - Enhanced Version with Ability Damage
import React, { useState, useEffect } from 'react';
import { useGameData } from '../backend/GameDataContext';
import ChampionSelector from './ChampionSelector';
import ItemBuilder from '../backend/ItemBuilder';
import ChampionSpells from './ChampionSpells';
import StatsDisplay from './StatsDisplay';
import '../css/DamageCalculator.css';

function DamageCalculator({ attackerCalculator }) {
    const { createCalculator, champions, items } = useGameData();

    // Target dummy state
    const [targetChampion, setTargetChampion] = useState(null);
    const [targetCalculator, setTargetCalculator] = useState(null);
    const [targetStats, setTargetStats] = useState(null);
    const [targetLevel, setTargetLevel] = useState(1);

    // Spell selection for damage calculations
    const [selectedAttackerSpells, setSelectedAttackerSpells] = useState([]);
    const [selectedTargetSpells, setSelectedTargetSpells] = useState([]);
    const [attackerSpellData, setAttackerSpellData] = useState({});

    // Combat calculations state
    const [damageOutput, setDamageOutput] = useState({
        autoAttackDamage: 0,
        criticalDamage: 0,
        dps: 0,
        timeToKill: 0,
        physicalReduction: 0,
        magicReduction: 0,
        trueDps: 0,
        effectiveDps: 0,
        abilityDamage: {}
    });

    // Handle target champion selection
    const handleTargetChampionSelect = (championKey) => {
        const newCalculator = createCalculator(championKey);
        newCalculator.setLevel(targetLevel);
        setTargetCalculator(newCalculator);
        setTargetChampion(championKey);
        setSelectedTargetSpells([]); // Reset spells when changing champion

        // Calculate initial stats
        const stats = newCalculator.calculateFinalStats();
        setTargetStats(stats);
    };

    // Handle target level change
    const handleTargetLevelChange = (level) => {
        const newLevel = Math.max(1, Math.min(18, parseInt(level) || 1));
        setTargetLevel(newLevel);

        if (targetCalculator) {
            targetCalculator.setLevel(newLevel);
            const stats = targetCalculator.calculateFinalStats();
            setTargetStats(stats);
        }
    };

    // Add item to target
    const addTargetItem = (itemData) => {
        if (!targetCalculator) return;

        targetCalculator.addItem(itemData);
        const stats = targetCalculator.calculateFinalStats();
        setTargetStats(stats);
    };

    // Remove item from target
    const removeTargetItem = (itemId) => {
        if (!targetCalculator) return;

        targetCalculator.removeItem(itemId);
        const stats = targetCalculator.calculateFinalStats();
        setTargetStats(stats);
    };

    // Handle spell selection for attacker (for ability damage calculations)
    const handleAttackerSpellSelect = (spellId, spellData) => {
        setSelectedAttackerSpells(prevSpells => {
            if (prevSpells.includes(spellId)) {
                return prevSpells.filter(id => id !== spellId);
            } else {
                return [...prevSpells, spellId];
            }
        });

        // Store spell data for damage calculations
        setAttackerSpellData(prevData => ({
            ...prevData,
            [spellId]: spellData
        }));
    };

    // Handle spell selection for target (just visual)
    const handleTargetSpellSelect = (spellId) => {
        setSelectedTargetSpells(prevSpells => {
            if (prevSpells.includes(spellId)) {
                return prevSpells.filter(id => id !== spellId);
            } else {
                return [...prevSpells, spellId];
            }
        });
    };

    // Calculate ability damage
    const calculateAbilityDamage = (spellData, attackerStats, targetStats, targetLevel) => {
        if (!spellData || !spellData.tooltip) return 0;

        // Parse tooltip for damage values
        // This is simplified - you'd want more sophisticated parsing
        const tooltip = spellData.tooltip;
        let baseDamage = 0;
        let apScaling = 0;
        let adScaling = 0;

        // Look for damage patterns in tooltip
        const damageMatch = tooltip.match(/(\d+)\s*(?:\+|plus)?\s*\(?([\d.]+)?\s*(?:AP|AD)?\)?/i);
        if (damageMatch) {
            baseDamage = parseInt(damageMatch[1]) || 0;
            if (tooltip.toLowerCase().includes('ap')) {
                apScaling = parseFloat(damageMatch[2]) || 0;
            } else if (tooltip.toLowerCase().includes('ad')) {
                adScaling = parseFloat(damageMatch[2]) || 0;
            }
        }

        // Calculate total damage
        let totalDamage = baseDamage;
        totalDamage += (attackerStats.abilityPower || 0) * apScaling;
        totalDamage += (attackerStats.attackDamage || 0) * adScaling;

        // Apply magic resistance if it's magic damage
        if (apScaling > 0) {
            totalDamage = attackerCalculator.calculateMagicDamage(
                totalDamage,
                targetStats.magicResist,
                targetLevel
            );
        }
        // Apply armor if it's physical damage
        else if (adScaling > 0) {
            totalDamage = attackerCalculator.calculatePhysicalDamage(
                totalDamage,
                targetStats.armor,
                targetLevel
            );
        }

        return Math.round(totalDamage);
    };

    // Calculate damage whenever attacker or target changes
    useEffect(() => {
        if (!attackerCalculator || !targetStats) {
            return;
        }

        const attackerStats = attackerCalculator.calculateFinalStats();

        // Calculate physical damage using the engine's built-in method
        const rawPhysicalDamage = attackerStats.attackDamage;
        const autoAttackDamage = attackerCalculator.calculatePhysicalDamage(
            rawPhysicalDamage,
            targetStats.armor,
            targetLevel
        );

        // Calculate critical strike damage
        const critChance = (attackerStats.critChance || 0) / 100;
        const critDamage = (attackerStats.critDamage || 175) / 100;
        const avgCritMultiplier = 1 + (critChance * (critDamage - 1));
        const effectiveAutoAttackDamage = autoAttackDamage * avgCritMultiplier;

        // Calculate DPS
        const attackSpeed = attackerStats.attackSpeed || 0.625;
        const dps = effectiveAutoAttackDamage * attackSpeed;

        // Calculate time to kill
        const targetHealth = targetStats.health || 1;
        const timeToKill = targetHealth / dps;

        // Calculate damage reductions
        const physicalReduction = (1 - (100 / (100 + targetStats.armor))) * 100;
        const magicReduction = (1 - (100 / (100 + targetStats.magicResist))) * 100;

        // Calculate ability damage for selected spells
        const abilityDamage = {};
        selectedAttackerSpells.forEach(spellId => {
            const spellData = attackerSpellData[spellId];
            if (spellData) {
                abilityDamage[spellId] = calculateAbilityDamage(
                    spellData,
                    attackerStats,
                    targetStats,
                    targetLevel
                );
            }
        });

        // Calculate lifesteal sustain
        const lifeSteal = (attackerStats.lifeSteal || 0) / 100;
        const sustainPerSecond = dps * lifeSteal;

        setDamageOutput({
            autoAttackDamage: Math.round(autoAttackDamage),
            criticalDamage: Math.round(autoAttackDamage * critDamage),
            dps: Math.round(dps),
            timeToKill: timeToKill.toFixed(1),
            physicalReduction: physicalReduction.toFixed(1),
            magicReduction: magicReduction.toFixed(1),
            trueDps: Math.round(dps),
            effectiveDps: Math.round(dps),
            attackSpeed: attackSpeed.toFixed(2),
            sustainPerSecond: Math.round(sustainPerSecond),
            abilityDamage: abilityDamage
        });
    }, [attackerCalculator, targetStats, targetLevel, selectedAttackerSpells, attackerSpellData]);

    // Get attacker stats and champion info
    const attackerStats = attackerCalculator ? attackerCalculator.calculateFinalStats() : null;
    const attackerChampionKey = attackerCalculator ? attackerCalculator.champion.key : null;
    const attackerChampionName = attackerCalculator ? attackerCalculator.champion.name : null;

    return (
        <div className="damage-calculator-container">
            <div className="damage-calculator-header">
                <h2>
                    <span className="icon">⚔️</span>
                    DAMAGE CALCULATOR
                    <span className="icon">🛡️</span>
                </h2>
            </div>

            {/* Target Champion Section */}
            <div className="target-section">
                <h3>
                    <span className="icon">🎯</span>
                    TARGET CHAMPION SETUP
                </h3>

                {/* Champion Selector */}
                <h4>
                    <span className="icon">🎯</span>
                    SELECT A CHAMPION
                </h4>
                <div className="target-champion-selector">
                    <ChampionSelector
                        champions={champions}
                        onSelect={handleTargetChampionSelect}
                        selectedChampion={targetChampion}
                    />
                </div>

                {targetChampion && (
                    <>
                        {/* Level Selector */}
                        <div className="level-selector">
                            <label>TARGET LEVEL:</label>
                            <input
                                type="number"
                                min="1"
                                max="18"
                                value={targetLevel}
                                onChange={(e) => handleTargetLevelChange(e.target.value)}
                            />
                            <div className="level-buttons">
                                {[1, 6, 11, 16, 18].map(lvl => (
                                    <button
                                        key={lvl}
                                        className={targetLevel === lvl ? 'active' : ''}
                                        onClick={() => handleTargetLevelChange(lvl)}
                                    >
                                        {lvl}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Item Builder for Target */}
                        <div className="target-items">
                            <ItemBuilder
                                items={items}
                                onAddItem={addTargetItem}
                                onRemoveItem={removeTargetItem}
                                currentItems={targetCalculator?.items || []}
                            />
                        </div>

                        {/* Target Spells Display */}
                        <ChampionSpells
                            championKey={targetChampion}
                            onSpellSelect={handleTargetSpellSelect}
                            selectedSpells={selectedTargetSpells}
                        />

                        {/* Target Stats Display - Reusing StatsDisplay component! */}
                        <div className="target-stats-wrapper">
                            <h3>TARGET DEFENSE STATS</h3>
                            <StatsDisplay
                                stats={targetStats}
                                championName={champions[targetChampion]?.name}
                                level={targetLevel}
                            />
                        </div>
                    </>
                )}
            </div>

            {/* Attacker Ability Selection (if attacker is selected) */}
            {attackerChampionKey && (
                <div className="attacker-abilities-section">
                    <h3>
                        <span className="icon">⚔️</span>
                        ATTACKER ABILITIES (Select for damage calculation)
                    </h3>
                    <ChampionSpells
                        championKey={attackerChampionKey}
                        onSpellSelect={handleAttackerSpellSelect}
                        selectedSpells={selectedAttackerSpells}
                    />
                </div>
            )}

            {/* Damage Output Section - Show when both attacker AND target are selected */}
            {attackerCalculator && targetStats && (
                <div className="damage-output-section">
                    <h3>DAMAGE ANALYSIS</h3>

                    <div className="damage-grid">
                        {/* Basic Damage Output Card */}
                        <div className="damage-card">
                            <h4>AUTO ATTACK DAMAGE</h4>
                            <div className="damage-stats">
                                <div className="damage-stat">
                                    <span>Auto Attack Damage:</span>
                                    <span className="damage-value">{damageOutput.autoAttackDamage}</span>
                                </div>
                                <div className="damage-stat">
                                    <span>Critical Strike Damage:</span>
                                    <span className="damage-value critical">{damageOutput.criticalDamage}</span>
                                </div>
                                <div className="damage-stat">
                                    <span>DPS (at {damageOutput.attackSpeed} AS):</span>
                                    <span className="damage-value dps">{damageOutput.dps}</span>
                                </div>
                                <div className="damage-stat highlight">
                                    <span>Time to Kill:</span>
                                    <span className="damage-value time">{damageOutput.timeToKill}s</span>
                                </div>
                                {damageOutput.sustainPerSecond > 0 && (
                                    <div className="damage-stat">
                                        <span>Lifesteal per second:</span>
                                        <span className="damage-value heal">+{damageOutput.sustainPerSecond} HP/s</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Ability Damage Card */}
                        {Object.keys(damageOutput.abilityDamage).length > 0 && (
                            <div className="damage-card">
                                <h4>ABILITY DAMAGE</h4>
                                <div className="damage-stats">
                                    {Object.entries(damageOutput.abilityDamage).map(([spellId, damage]) => {
                                        const spellData = attackerSpellData[spellId];
                                        return (
                                            <div key={spellId} className="damage-stat">
                                                <span>{spellData?.name || spellId}:</span>
                                                <span className="damage-value ability">{damage}</span>
                                            </div>
                                        );
                                    })}
                                    <div className="damage-stat highlight">
                                        <span>Total Burst:</span>
                                        <span className="damage-value burst">
                                            {Object.values(damageOutput.abilityDamage).reduce((a, b) => a + b, 0) + damageOutput.autoAttackDamage}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Damage Reduction Card */}
                        <div className="damage-card">
                            <h4>DAMAGE REDUCTION</h4>
                            <div className="damage-stats">
                                <div className="damage-stat">
                                    <span>Physical Reduction:</span>
                                    <span className="reduction-value">{damageOutput.physicalReduction}%</span>
                                </div>
                                <div className="damage-stat">
                                    <span>Magic Reduction:</span>
                                    <span className="reduction-value">{damageOutput.magicReduction}%</span>
                                </div>
                                <div className="damage-stat">
                                    <span>Effective HP (Physical):</span>
                                    <span className="reduction-value">
                                        {Math.round(targetStats.health * (1 + targetStats.armor / 100))}
                                    </span>
                                </div>
                                <div className="damage-stat">
                                    <span>Effective HP (Magic):</span>
                                    <span className="reduction-value">
                                        {Math.round(targetStats.health * (1 + targetStats.magicResist / 100))}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Combat Details */}
                        <div className="damage-card">
                            <h4>COMBAT BREAKDOWN</h4>
                            <div className="detail-grid">
                                <div className="detail-stat">
                                    <span className="label">Raw AD:</span>
                                    <span className="value">{Math.round(attackerStats.attackDamage)}</span>
                                </div>
                                <div className="detail-stat">
                                    <span className="label">AP:</span>
                                    <span className="value">{Math.round(attackerStats.abilityPower || 0)}</span>
                                </div>
                                <div className="detail-stat">
                                    <span className="label">Lethality:</span>
                                    <span className="value">{attackerStats.lethality || 0}</span>
                                </div>
                                <div className="detail-stat">
                                    <span className="label">Armor Pen:</span>
                                    <span className="value">{(attackerStats.armorPenetrationPercent || 0).toFixed(1)}%</span>
                                </div>
                                <div className="detail-stat">
                                    <span className="label">Magic Pen:</span>
                                    <span className="value">
                                        {attackerStats.magicPenetrationFlat || 0} | {(attackerStats.magicPenetrationPercent || 0).toFixed(1)}%
                                    </span>
                                </div>
                                <div className="detail-stat">
                                    <span className="label">Crit Chance:</span>
                                    <span className="value">{(attackerStats.critChance || 0).toFixed(1)}%</span>
                                </div>
                                <div className="detail-stat">
                                    <span className="label">Crit Damage:</span>
                                    <span className="value">{(attackerStats.critDamage || 175).toFixed(0)}%</span>
                                </div>
                                <div className="detail-stat">
                                    <span className="label">Life Steal:</span>
                                    <span className="value">{(attackerStats.lifeSteal || 0).toFixed(1)}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty State - Only show if no attacker */}
            {!attackerCalculator && (
                <div className="empty-state">
                    <p>⚔️ Select an attacker champion to begin</p>
                </div>
            )}

            {/* Show message if attacker selected but no target */}
            {attackerCalculator && !targetChampion && (
                <div className="empty-state">
                    <p>🛡️ Now select a target champion to calculate damage</p>
                </div>
            )}
        </div>
    );
}

export default DamageCalculator;