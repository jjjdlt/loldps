// ========================================
// LEAGUE OF LEGENDS STAT CALCULATOR ENGINE
// ========================================

class ChampionCalculator {
    constructor(championData) {
        // *bounces* championData should already be converted by StatMapper!
        this.champion = championData;
        this.level = 1;
        this.items = [];
        this.runes = {
            keystone: null,
            primaryTree: [],
            secondaryTree: [],
            statShards: { offense: null, flex: null, defense: null }
        };
        this.buffs = {
            baron: false,
            elderDragon: false,
            dragonSoul: null,
            dragonStacks: 0
        };
    }

    // ========================================
    // CORE STAT CALCULATION - The League Formula!
    // ========================================

    calculateBaseStat(baseValue, growthValue) {
        // The magical League growth formula :3
        const growthMultiplier = (this.level - 1) * (0.7025 + 0.0175 * (this.level - 1));
        return baseValue + (growthValue * growthMultiplier);
    }

    calculateAttackSpeed() {
        // Attack speed is special! It uses a ratio system
        const baseAS = this.champion.stats.attackSpeed || 0.625;
        const asPerLevel = this.champion.stats.attackSpeedPerLevel || 0;

        // Calculate bonus AS from level
        const levelBonus = asPerLevel * (this.level - 1) * (0.7025 + 0.0175 * (this.level - 1)) / 100;

        // Get bonus AS from items (already in percentage)
        const itemBonus = this.items.reduce((sum, item) => {
            return sum + (item.stats?.attackSpeed || 0);
        }, 0) / 100;

        // Apply all bonuses
        return baseAS * (1 + levelBonus + itemBonus);
    }

    // ========================================
    // LEVEL MANAGEMENT
    // ========================================

    setLevel(level) {
        this.level = Math.max(1, Math.min(18, level));
    }

    // ========================================
    // ITEM MANAGEMENT
    // ========================================

    addItem(itemData) {
        if (this.items.length >= 6) {
            console.warn('Cannot add more than 6 items!');
            return false;
        }

        this.items.push(itemData);
        return true;
    }

    removeItem(itemData) {
        const index = this.items.findIndex(item =>
            item.id === itemData.id || item.name === itemData.name
        );

        if (index !== -1) {
            this.items.splice(index, 1);
            return true;
        }
        return false;
    }

    clearItems() {
        this.items = [];
    }

    // ========================================
    // MAIN CALCULATION METHOD
    // ========================================

    calculateFinalStats() {
        // Step 1: Calculate base stats with growth
        const stats = {
            // Health
            health: this.calculateBaseStat(
                this.champion.stats.health,
                this.champion.stats.healthPerLevel
            ),

            // Mana/Energy
            mana: this.calculateBaseStat(
                this.champion.stats.mana,
                this.champion.stats.manaPerLevel
            ),

            // Defensive stats
            armor: this.calculateBaseStat(
                this.champion.stats.armor,
                this.champion.stats.armorPerLevel
            ),
            magicResist: this.calculateBaseStat(
                this.champion.stats.magicResist,
                this.champion.stats.magicResistPerLevel
            ),

            // Offensive stats
            attackDamage: this.calculateBaseStat(
                this.champion.stats.attackDamage,
                this.champion.stats.attackDamagePerLevel
            ),
            attackSpeed: this.calculateAttackSpeed(),
            critChance: this.calculateBaseStat(
                this.champion.stats.critChance || 0,
                this.champion.stats.critChancePerLevel || 0
            ),

            // Regeneration
            healthRegen: this.calculateBaseStat(
                this.champion.stats.healthRegen,
                this.champion.stats.healthRegenPerLevel
            ),
            manaRegen: this.calculateBaseStat(
                this.champion.stats.manaRegen,
                this.champion.stats.manaRegenPerLevel
            ),

            // Utility
            movementSpeed: this.champion.stats.movementSpeed,
            attackRange: this.champion.stats.attackRange,

            // Additional stats (start at 0, modified by items/runes)
            abilityPower: 0,
            abilityHaste: 0,
            critDamage: 175, // Base crit damage
            lethality: 0,
            armorPenetrationPercent: 0,
            magicPenetrationFlat: 0,
            magicPenetrationPercent: 0,
            lifeSteal: 0,
            omnivamp: 0,
            healAndShieldPower: 0
        };

        // Step 2: Apply items
        const statsWithItems = this.applyItemStats(stats);

        // Step 3: Apply runes
        const statsWithRunes = this.applyRuneStats(statsWithItems);

        // Step 4: Apply buffs (Baron, Dragons, etc)
        const finalStats = this.applyBuffs(statsWithRunes);

        // Step 5: Calculate derived values
        finalStats.cooldownReduction = this.abilityHasteToCDR(finalStats.abilityHaste);
        finalStats.effectiveHealth = this.calculateEffectiveHealth(finalStats);

        return finalStats;
    }

    // ========================================
    // ITEM SYSTEM
    // ========================================

    applyItemStats(baseStats) {
        let stats = { ...baseStats };

        this.items.forEach(item => {
            if (!item.stats) return;

            // Apply each stat from the item
            Object.entries(item.stats).forEach(([statName, value]) => {
                // Skip unmapped stats
                if (statName.startsWith('_unmapped_')) return;

                // Check if it's a percentage modifier
                if (statName.includes('Percent') || statName.endsWith('Percent')) {
                    // Apply percentage bonuses multiplicatively
                    const baseStat = statName.replace('Percent', '');
                    if (stats[baseStat] !== undefined) {
                        stats[baseStat] *= (1 + value / 100);
                    }
                } else {
                    // Apply flat bonuses additively
                    if (stats[statName] !== undefined) {
                        stats[statName] += value;
                    } else {
                        // For stats not in base (like lethality, lifesteal, etc.)
                        stats[statName] = (stats[statName] || 0) + value;
                    }
                }
            });

            // Handle unique passives if needed
            if (item.passives) {
                // Process special passives here
                this.applyItemPassives(stats, item.passives);
            }
        });

        return stats;
    }

    applyItemPassives(stats, passives) {
        // Handle special item passives
        passives.forEach(passive => {
            // Example: Infinity Edge crit damage
            if (passive.name === 'Perfection') {
                stats.critDamage = (stats.critDamage || 175) + 35;
            }
            // Add more passive effects as needed
        });
    }

    // ========================================
    // RUNE SYSTEM
    // ========================================

    applyRuneStats(baseStats) {
        let stats = { ...baseStats };

        // Apply stat shards
        if (this.runes.statShards.offense === 'adaptiveForce') {
            // Adaptive force gives AD or AP based on what's higher
            if (stats.attackDamage > stats.abilityPower) {
                stats.attackDamage += 5.4;
            } else {
                stats.abilityPower += 9;
            }
        } else if (this.runes.statShards.offense === 'attackSpeed') {
            stats.attackSpeed *= 1.10; // 10% attack speed
        } else if (this.runes.statShards.offense === 'abilityHaste') {
            stats.abilityHaste += 8;
        }

        if (this.runes.statShards.flex === 'adaptiveForce') {
            if (stats.attackDamage > stats.abilityPower) {
                stats.attackDamage += 5.4;
            } else {
                stats.abilityPower += 9;
            }
        } else if (this.runes.statShards.flex === 'movementSpeed') {
            stats.movementSpeed += 2;
        }

        if (this.runes.statShards.defense === 'health') {
            stats.health += 15 + (140 * (this.level - 1) / 17);
        } else if (this.runes.statShards.defense === 'armor') {
            stats.armor += 6;
        } else if (this.runes.statShards.defense === 'magicResist') {
            stats.magicResist += 8;
        }

        // Apply keystone and minor runes
        // This would be expanded based on your rune data structure

        return stats;
    }

    // ========================================
    // BUFF SYSTEM
    // ========================================

    applyBuffs(stats) {
        let buffedStats = { ...stats };

        // Baron buff
        if (this.buffs.baron) {
            buffedStats.attackDamage += 25;
            buffedStats.abilityPower += 40;
        }

        // Dragon souls and stacks
        if (this.buffs.dragonStacks > 0) {
            buffedStats = this.applyDragonStats(buffedStats, this.buffs.dragonStacks);
        }

        return buffedStats;
    }

    applyDragonStats(stats, stacks) {
        // Each dragon gives different stats (simplified)
        return {
            ...stats,
            attackDamage: stats.attackDamage + (stacks * 4),
            abilityPower: stats.abilityPower + (stacks * 6),
            armor: stats.armor + (stacks * 3),
            magicResist: stats.magicResist + (stacks * 3)
        };
    }

    // ========================================
    // RUNE MANAGEMENT
    // ========================================

    setKeystone(keystoneId) {
        this.runes.keystone = keystoneId;
    }

    setPrimaryRunes(runeIds) {
        // Primary tree has 3 minor runes
        this.runes.primaryTree = runeIds.slice(0, 3);
    }

    setSecondaryRunes(runeIds) {
        // Secondary tree has 2 minor runes
        this.runes.secondaryTree = runeIds.slice(0, 2);
    }

    setStatShards(offense, flex, defense) {
        this.runes.statShards = {
            offense: offense,
            flex: flex,
            defense: defense
        };
    }

    // ========================================
    // DAMAGE CALCULATIONS
    // ========================================

    calculatePhysicalDamage(rawDamage, targetArmor = 0, targetLevel = this.level) {
        const penetration = {
            lethality: this.getLethality(),
            percentPen: this.getArmorPenPercent(),
            percentReduction: 0, // From abilities like Black Cleaver
            flatPen: 0 // From abilities
        };

        // Calculate effective armor after penetration
        let effectiveResistance = targetArmor;
        effectiveResistance *= (1 - (penetration.percentReduction || 0) / 100);
        effectiveResistance = Math.max(0, effectiveResistance);
        effectiveResistance *= (1 - (penetration.percentPen || 0) / 100);

        // Lethality scaling
        if (penetration.lethality) {
            const lethalityPen = penetration.lethality * (0.6 + 0.4 * targetLevel / 18);
            effectiveResistance = Math.max(0, effectiveResistance - lethalityPen);
        }

        effectiveResistance = Math.max(0, effectiveResistance - (penetration.flatPen || 0));

        // Damage multiplier formula
        const damageMultiplier = 100 / (100 + effectiveResistance);
        return rawDamage * damageMultiplier;
    }

    calculateMagicDamage(rawDamage, targetMR = 0, targetLevel = this.level) {
        const penetration = {
            flatPen: this.getMagicPenFlat(),
            percentPen: this.getMagicPenPercent()
        };

        // Calculate effective MR after penetration
        let effectiveResistance = targetMR;
        effectiveResistance *= (1 - (penetration.percentPen || 0) / 100);
        effectiveResistance = Math.max(0, effectiveResistance - (penetration.flatPen || 0));

        // Damage multiplier formula
        const damageMultiplier = 100 / (100 + effectiveResistance);
        return rawDamage * damageMultiplier;
    }

    calculateAutoAttackDPS(targetArmor = 0, targetLevel = this.level) {
        const stats = this.calculateFinalStats();
        const autoAttackDamage = this.calculatePhysicalDamage(
            stats.attackDamage,
            targetArmor,
            targetLevel
        );

        // Factor in critical strikes
        const critMultiplier = 1 + (stats.critChance / 100 * (stats.critDamage / 100 - 1));
        const effectiveDamage = autoAttackDamage * critMultiplier;

        return effectiveDamage * stats.attackSpeed;
    }

    // ========================================
    // PENETRATION GETTERS
    // ========================================

    getLethality() {
        return this.items.reduce((sum, item) => {
            return sum + (item.stats?.lethality || 0);
        }, 0);
    }

    getArmorPenPercent() {
        // Armor pen from items (doesn't stack additively)
        const penItems = this.items.filter(item => item.stats?.armorPenetrationPercent);
        if (penItems.length === 0) return 0;

        // Usually only one source of % pen, but if multiple, take highest
        return Math.max(...penItems.map(item => item.stats.armorPenetrationPercent));
    }

    getMagicPenFlat() {
        return this.items.reduce((sum, item) => {
            return sum + (item.stats?.magicPenetration || 0);
        }, 0);
    }

    getMagicPenPercent() {
        const penItems = this.items.filter(item => item.stats?.magicPenetrationPercent);
        if (penItems.length === 0) return 0;
        return Math.max(...penItems.map(item => item.stats.magicPenetrationPercent));
    }

    // ========================================
    // UTILITY CALCULATIONS
    // ========================================

    abilityHasteToCDR(abilityHaste) {
        return (abilityHaste / (abilityHaste + 100)) * 100;
    }

    calculateCooldown(baseCooldown, abilityHaste = null) {
        const ah = abilityHaste || this.calculateFinalStats().abilityHaste;
        return baseCooldown * (100 / (100 + ah));
    }

    calculateEffectiveHealth(stats) {
        return {
            physical: stats.health * (1 + stats.armor / 100),
            magical: stats.health * (1 + stats.magicResist / 100)
        };
    }

    calculateHealingPower(baseHeal) {
        const stats = this.calculateFinalStats();
        const healPower = stats.healAndShieldPower || 0;
        return baseHeal * (1 + healPower / 100);
    }

    // ========================================
    // DEBUG HELPERS
    // ========================================

    getDebugInfo() {
        const stats = this.calculateFinalStats();
        return {
            champion: this.champion.name,
            level: this.level,
            items: this.items.map(i => i.name),
            stats: stats,
            penetration: {
                lethality: this.getLethality(),
                armorPen: this.getArmorPenPercent(),
                magicPenFlat: this.getMagicPenFlat(),
                magicPenPercent: this.getMagicPenPercent()
            }
        };
    }
}

// ========================================
// ES6 EXPORT
// ========================================

export default ChampionCalculator;