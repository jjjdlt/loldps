// StatsDisplay.js
import React from 'react';
import '../css/StatsDisplay.css'; // Make sure to import the CSS file!

function StatsDisplay({ stats, championName, level }) {
    // Empty state when no champion is selected
    if (!stats) {
        return (
            <div className="stats-display-container">
                <div className="stats-empty">
                    <h3>Champion Stats</h3>
                    <p>Select a champion to view their stats!</p>
                </div>
            </div>
        );
    }

    // Helper functions for formatting
    const formatStat = (value, decimals = 1) => {
        if (value === undefined || value === null) return '0';
        return Number(value).toFixed(decimals);
    };

    const formatPercent = (value) => {
        if (value === undefined || value === null) return '0%';
        return `${formatStat(value, 1)}%`;
    };

    // Calculate resource regen (mana or energy)
    const getResourceRegen = () => {
        if (stats.manaRegen) {
            return formatStat(stats.manaRegen, 1);
        } else if (stats.energyRegen) {
            return formatStat(stats.energyRegen, 1);
        }
        return '0';
    };

    // Determine resource type
    const resourceType = stats.mana ? 'Mana' : stats.energy ? 'Energy' : 'Resource';
    const resourceValue = stats.mana || stats.energy || 0;

    return (
        <div className="stats-display-container">
            {/* Header with champion name and level */}
            <div className="stats-header">
                <h3>{championName || 'Champion'} Stats</h3>
                <span className="level-badge">Level {level}</span>
            </div>

            {/* Main stats grid - 2 columns */}
            <div className="stats-grid">
                {/* Left Column - Top Card */}
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-icon">⚔️</span>
                        <span>Offensive</span>
                    </div>

                    <div className="stat-item">
                        <span className="stat-label">Health</span>
                        <span className="stat-value">{formatStat(stats.health, 0)}</span>
                    </div>

                    <div className="stat-item">
                        <span className="stat-label">{resourceType} Regen</span>
                        <span className="stat-value">
                            {getResourceRegen()}
                            <span className="stat-value-secondary">/5s</span>
                        </span>
                    </div>

                    <div className="stat-item">
                        <span className="stat-label">Lethality</span>
                        <span className="stat-value">
                            {formatStat(stats.lethality || 0, 0)}
                            <span className="stat-value-separator">|</span>
                            <span className="stat-value-secondary">{formatPercent(stats.armorPenetrationPercent || 0)}</span>
                        </span>
                    </div>

                    <div className="stat-item">
                        <span className="stat-label">Life Steal</span>
                        <span className="stat-value">{formatPercent(stats.lifeSteal || 0)}</span>
                    </div>

                    <div className="stat-item">
                        <span className="stat-label">Attack Range</span>
                        <span className="stat-value">{formatStat(stats.attackRange, 0)}</span>
                    </div>

                    <div className="stat-item">
                        <span className="stat-label">Attack Damage</span>
                        <span className="stat-value highlight">{formatStat(stats.attackDamage, 0)}</span>
                    </div>

                    <div className="stat-item">
                        <span className="stat-label">Armor</span>
                        <span className="stat-value">{formatStat(stats.armor, 0)}</span>
                    </div>

                    <div className="stat-item">
                        <span className="stat-label">Attack Speed</span>
                        <span className="stat-value">{formatStat(stats.attackSpeed, 2)}</span>
                    </div>

                    <div className="stat-item">
                        <span className="stat-label">Crit Chance</span>
                        <span className="stat-value">{formatPercent(stats.critChance || 0)}</span>
                    </div>
                </div>

                {/* Right Column - Top Card */}
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-icon">🛡️</span>
                        <span>Defensive & Utility</span>
                    </div>

                    <div className="stat-item">
                        <span className="stat-label">Heal & Shield</span>
                        <span className="stat-value">{formatPercent(stats.healAndShieldPower || 0)}</span>
                    </div>

                    <div className="stat-item">
                        <span className="stat-label">Magic Pen</span>
                        <span className="stat-value">
                            {formatStat(stats.magicPenetrationFlat || 0, 0)}
                            <span className="stat-value-separator">|</span>
                            <span className="stat-value-secondary">{formatPercent(stats.magicPenetrationPercent || 0)}</span>
                        </span>
                    </div>

                    <div className="stat-item">
                        <span className="stat-label">Omnivamp</span>
                        <span className="stat-value">{formatPercent(stats.omnivamp || 0)}</span>
                    </div>

                    <div className="stat-item">
                        <span className="stat-label">Tenacity</span>
                        <span className="stat-value">{formatPercent(stats.tenacity || 0)}</span>
                    </div>

                    <div className="stat-item">
                        <span className="stat-label">Ability Power</span>
                        <span className="stat-value highlight">{formatStat(stats.abilityPower || 0, 0)}</span>
                    </div>

                    <div className="stat-item">
                        <span className="stat-label">Magic Resist</span>
                        <span className="stat-value">{formatStat(stats.magicResist, 0)}</span>
                    </div>

                    <div className="stat-item">
                        <span className="stat-label">Ability Haste</span>
                        <span className="stat-value">{formatStat(stats.abilityHaste || 0, 0)}</span>
                    </div>

                    <div className="stat-item">
                        <span className="stat-label">Movement Speed</span>
                        <span className="stat-value">{formatStat(stats.movementSpeed, 0)}</span>
                    </div>
                </div>
            </div>

            {/* Optional: Additional stats that don't fit in the main grid */}
            {(stats.effectiveHealth || stats.critDamage) && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-card-header">
                            <span className="stat-icon">📊</span>
                            <span>Advanced Stats</span>
                        </div>

                        {stats.critDamage && (
                            <div className="stat-item">
                                <span className="stat-label">Crit Damage</span>
                                <span className="stat-value">{formatPercent(stats.critDamage)}</span>
                            </div>
                        )}

                        {stats.effectiveHealth && (
                            <>
                                <div className="stat-item">
                                    <span className="stat-label">Effective HP (Physical)</span>
                                    <span className="stat-value">{formatStat(stats.effectiveHealth.physical, 0)}</span>
                                </div>

                                <div className="stat-item">
                                    <span className="stat-label">Effective HP (Magical)</span>
                                    <span className="stat-value">{formatStat(stats.effectiveHealth.magical, 0)}</span>
                                </div>
                            </>
                        )}

                        {stats.cooldownReduction && (
                            <div className="stat-item">
                                <span className="stat-label">Cooldown Reduction</span>
                                <span className="stat-value">{formatPercent(stats.cooldownReduction)}</span>
                            </div>
                        )}

                        {stats.healthRegen && (
                            <div className="stat-item">
                                <span className="stat-label">Health Regen</span>
                                <span className="stat-value">
                                    {formatStat(stats.healthRegen, 1)}
                                    <span className="stat-value-secondary">/5s</span>
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default StatsDisplay;