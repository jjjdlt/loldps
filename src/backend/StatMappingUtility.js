// ========================================
// STAT MAPPING UTILITY
// Converts between Riot API format and Calculator format
// ========================================

class StatMappingUtility {
    // ========================================
    // STAT NAME MAPPINGS
    // ========================================

    static STAT_MAPPINGS = {
        // Basic Stats - Flat Values
        FlatPhysicalDamageMod: 'attackDamage',
        FlatMagicDamageMod: 'abilityPower',
        FlatArmorMod: 'armor',
        FlatSpellBlockMod: 'magicResist',
        FlatHPPoolMod: 'health',
        FlatMPPoolMod: 'mana',
        FlatHPRegenMod: 'healthRegen',
        FlatMPRegenMod: 'manaRegen',
        FlatMovementSpeedMod: 'movementSpeed',
        FlatEnergyPoolMod: 'energy',
        FlatEnergyRegenMod: 'energyRegen',

        // Percentage Modifiers
        PercentPhysicalDamageMod: 'attackDamagePercent',
        PercentMagicDamageMod: 'abilityPowerPercent',
        PercentHPPoolMod: 'healthPercent',
        PercentMPPoolMod: 'manaPercent',
        PercentMovementSpeedMod: 'movementSpeedPercent',
        PercentAttackSpeedMod: 'attackSpeed', // Attack speed is special - always percentage-based
        PercentArmorMod: 'armorPercent',
        PercentSpellBlockMod: 'magicResistPercent',
        PercentHPRegenMod: 'healthRegenPercent',
        PercentMPRegenMod: 'manaRegenPercent',

        // Critical Strike
        FlatCritChanceMod: 'critChance',
        FlatCritDamageMod: 'critDamage',
        PercentCritDamageMod: 'critDamagePercent',

        // Penetration and Reduction
        FlatArmorPenetrationMod: 'lethality', // Lethality in modern League
        rFlatArmorPenetrationMod: 'lethality', // Legacy naming
        rPercentArmorPenetrationMod: 'armorPenetrationPercent',
        PercentArmorPenetrationMod: 'armorPenetrationPercent',
        FlatMagicPenetrationMod: 'magicPenetration',
        rFlatMagicPenetrationMod: 'magicPenetration',
        rPercentMagicPenetrationMod: 'magicPenetrationPercent',
        PercentMagicPenetrationMod: 'magicPenetrationPercent',

        // Life Steal and Vamp
        PercentLifeStealMod: 'lifeSteal',
        PercentSpellVampMod: 'spellVamp',

        // Cooldown Reduction / Ability Haste
        rPercentCooldownMod: 'cooldownReduction',
        rPercentCooldownModPerLevel: 'cooldownReductionPerLevel',
        // Note: Ability Haste is the modern system
        FlatAbilityHasteMod: 'abilityHaste',

        // Attack Speed
        FlatAttackSpeedMod: 'attackSpeedFlat',
        rPercentAttackSpeedModPerLevel: 'attackSpeedPerLevel',

        // Gold Generation
        rFlatGoldPer10Mod: 'goldPer10',

        // Experience
        FlatEXPBonus: 'experienceFlat',
        PercentEXPBonus: 'experiencePercent',

        // Per Level Stats (Runes)
        rFlatPhysicalDamageModPerLevel: 'attackDamagePerLevel',
        rFlatMagicDamageModPerLevel: 'abilityPowerPerLevel',
        rFlatArmorModPerLevel: 'armorPerLevel',
        rFlatSpellBlockModPerLevel: 'magicResistPerLevel',
        rFlatHPModPerLevel: 'healthPerLevel',
        rFlatMPModPerLevel: 'manaPerLevel',
        rFlatHPRegenModPerLevel: 'healthRegenPerLevel',
        rFlatMPRegenModPerLevel: 'manaRegenPerLevel',
        rFlatMovementSpeedModPerLevel: 'movementSpeedPerLevel',

        // Special Stats
        FlatBlockMod: 'block',
        PercentBlockMod: 'blockPercent',
        FlatDodgeMod: 'dodge',
        PercentDodgeMod: 'dodgePercent',
        rFlatTimeDeadMod: 'timeDeadReduction',
        rPercentTimeDeadMod: 'timeDeadReductionPercent'
    };

    // ========================================
    // ITEM CONVERSION
    // ========================================

    /**
     * Converts a Riot API item object to calculator format
     * @param {Object} riotItem - Item from Riot API
     * @returns {Object} Item in calculator format
     */
    static convertItem(riotItem) {
        if (!riotItem) return null;

        const convertedItem = {
            id: riotItem.id || riotItem.itemId,
            name: riotItem.name || '',
            description: riotItem.description || '',
            plaintext: riotItem.plaintext || '',
            gold: {
                base: riotItem.gold?.base || 0,
                total: riotItem.gold?.total || 0,
                sell: riotItem.gold?.sell || 0,
                purchasable: riotItem.gold?.purchasable ?? true
            },
            stats: {},
            from: riotItem.from || [],
            into: riotItem.into || [],
            tags: riotItem.tags || [],
            maps: riotItem.maps || {},
            depth: riotItem.depth || 1
        };

        // Convert stats
        if (riotItem.stats) {
            convertedItem.stats = this.convertStats(riotItem.stats);
        }

        // Handle special item effects
        if (riotItem.effect) {
            convertedItem.effects = this.convertEffects(riotItem.effect);
        }

        // Handle unique passives/actives from description
        convertedItem.passives = this.extractPassives(riotItem.description);
        convertedItem.actives = this.extractActives(riotItem.description);

        return convertedItem;
    }

    /**
     * Converts Riot API stats object to calculator format
     * @param {Object} riotStats - Stats from Riot API
     * @returns {Object} Stats in calculator format
     */
    static convertStats(riotStats) {
        const convertedStats = {};

        for (const [riotStat, value] of Object.entries(riotStats)) {
            if (value === 0) continue; // Skip zero values

            const mappedStat = this.STAT_MAPPINGS[riotStat];
            if (mappedStat) {
                // Convert percentages properly
                if (riotStat.includes('Percent') || riotStat.includes('Crit')) {
                    // Riot uses decimals (0.15 for 15%), we might want percentages
                    convertedStats[mappedStat] = value * 100;
                } else {
                    convertedStats[mappedStat] = value;
                }
            } else {
                // Keep unmapped stats with a warning prefix
                console.warn(`Unmapped stat: ${riotStat}`);
                convertedStats[`_unmapped_${riotStat}`] = value;
            }
        }

        return convertedStats;
    }

    /**
     * Converts item effects (Effect1Amount, Effect2Amount, etc.)
     * @param {Object} effects - Effect object from Riot API
     * @returns {Array} Array of effect values
     */
    static convertEffects(effects) {
        const convertedEffects = [];

        // Riot uses Effect1Amount, Effect2Amount, etc.
        for (let i = 1; i <= 10; i++) {
            const effectKey = `Effect${i}Amount`;
            if (effects[effectKey] !== undefined) {
                convertedEffects.push({
                    index: i,
                    value: parseFloat(effects[effectKey]) || 0
                });
            }
        }

        return convertedEffects;
    }

    /**
     * Extracts passive abilities from item description
     * @param {String} description - HTML description from Riot API
     * @returns {Array} Array of passive objects
     */
    static extractPassives(description) {
        if (!description) return [];

        const passives = [];
        // Look for <passive> tags in description
        const passiveRegex = /<passive>([^<]+)<\/passive>/g;
        let match;

        while ((match = passiveRegex.exec(description)) !== null) {
            passives.push({
                name: match[1].split(':')[0].trim(),
                description: match[1]
            });
        }

        return passives;
    }

    /**
     * Extracts active abilities from item description
     * @param {String} description - HTML description from Riot API
     * @returns {Array} Array of active objects
     */
    static extractActives(description) {
        if (!description) return [];

        const actives = [];
        // Look for <active> tags in description
        const activeRegex = /<active>([^<]+)<\/active>/g;
        let match;

        while ((match = activeRegex.exec(description)) !== null) {
            actives.push({
                name: match[1].split(':')[0].trim(),
                description: match[1]
            });
        }

        return actives;
    }

    // ========================================
    // CHAMPION CONVERSION
    // ========================================

    /**
     * Converts a Riot API champion object to calculator format
     * @param {Object} riotChampion - Champion from Riot API
     * @returns {Object} Champion in calculator format
     */
    static convertChampion(riotChampion) {
        if (!riotChampion) return null;

        return {
            id: riotChampion.id,
            key: riotChampion.key,
            name: riotChampion.name,
            title: riotChampion.title,
            tags: riotChampion.tags || [],
            stats: this.convertChampionStats(riotChampion.stats),
            info: riotChampion.info || {},
            partype: riotChampion.partype || 'Mana',
            image: riotChampion.image || {}
        };
    }

    /**
     * Converts champion base stats from Riot format
     * @param {Object} riotStats - Champion stats from Riot API
     * @returns {Object} Stats in calculator format
     */
    static convertChampionStats(riotStats) {
        return {
            // Base stats
            health: riotStats.hp || 0,
            healthPerLevel: riotStats.hpperlevel || 0,
            mana: riotStats.mp || 0,
            manaPerLevel: riotStats.mpperlevel || 0,
            movementSpeed: riotStats.movespeed || 0,
            armor: riotStats.armor || 0,
            armorPerLevel: riotStats.armorperlevel || 0,
            magicResist: riotStats.spellblock || 0,
            magicResistPerLevel: riotStats.spellblockperlevel || 0,
            attackRange: riotStats.attackrange || 0,
            healthRegen: riotStats.hpregen || 0,
            healthRegenPerLevel: riotStats.hpregenperlevel || 0,
            manaRegen: riotStats.mpregen || 0,
            manaRegenPerLevel: riotStats.mpregenperlevel || 0,
            critChance: riotStats.crit || 0,
            critChancePerLevel: riotStats.critperlevel || 0,
            attackDamage: riotStats.attackdamage || 0,
            attackDamagePerLevel: riotStats.attackdamageperlevel || 0,
            attackSpeed: riotStats.attackspeed || 0.625,
            attackSpeedPerLevel: riotStats.attackspeedperlevel || 0
        };
    }

    // ========================================
    // RUNE CONVERSION
    // ========================================

    /**
     * Converts rune stats to calculator format
     * @param {Object} runeData - Rune data from various sources
     * @returns {Object} Rune stats in calculator format
     */
    static convertRune(runeData) {
        if (!runeData) return null;

        const convertedRune = {
            id: runeData.id,
            key: runeData.key,
            name: runeData.name,
            shortDesc: runeData.shortDesc || '',
            longDesc: runeData.longDesc || '',
            icon: runeData.icon || '',
            stats: {}
        };

        // Convert any stat bonuses
        if (runeData.stats) {
            convertedRune.stats = this.convertStats(runeData.stats);
        }

        return convertedRune;
    }

    // ========================================
    // STAT SHARD CONVERSION
    // ========================================

    /**
     * Converts stat shard selections to actual stat values
     * @param {String} shardType - Type of shard (offense, flex, defense)
     * @param {String} shardChoice - The chosen shard
     * @returns {Object} Stat bonuses from the shard
     */
    static convertStatShard(shardType, shardChoice) {
        const shardStats = {};

        switch(shardType) {
            case 'offense':
                switch(shardChoice) {
                    case 'adaptiveForce':
                        shardStats.adaptiveForce = 9; // Converts to AD or AP
                        break;
                    case 'attackSpeed':
                        shardStats.attackSpeed = 10;
                        break;
                    case 'abilityHaste':
                        shardStats.abilityHaste = 8;
                        break;
                }
                break;

            case 'flex':
                switch(shardChoice) {
                    case 'adaptiveForce':
                        shardStats.adaptiveForce = 9;
                        break;
                    case 'movementSpeed':
                        shardStats.movementSpeed = 2;
                        break;
                    case 'healthScaling':
                        shardStats.healthPerLevel = 10;
                        break;
                }
                break;

            case 'defense':
                switch(shardChoice) {
                    case 'health':
                        shardStats.health = 15;
                        shardStats.healthPerLevel = 140 / 18; // Scales to 140 at 18
                        break;
                    case 'armor':
                        shardStats.armor = 6;
                        break;
                    case 'magicResist':
                        shardStats.magicResist = 8;
                        break;
                }
                break;
        }

        return shardStats;
    }

    // ========================================
    // BATCH CONVERSION UTILITIES
    // ========================================

    /**
     * Converts all items from Riot format to calculator format
     * @param {Object} riotItems - Object containing all items from Riot API
     * @returns {Object} All items in calculator format
     */
    static convertAllItems(riotItems) {
        const convertedItems = {};

        for (const [itemId, itemData] of Object.entries(riotItems)) {
            // Skip certain items (like jungle items that can't be purchased)
            if (itemData.gold && !itemData.gold.purchasable) continue;
            if (itemData.hideFromAll) continue;

            convertedItems[itemId] = this.convertItem(itemData);
        }

        return convertedItems;
    }

    /**
     * Converts all champions from Riot format to calculator format
     * @param {Object} riotChampions - Object containing all champions from Riot API
     * @returns {Object} All champions in calculator format
     */
    static convertAllChampions(riotChampions) {
        const convertedChampions = {};

        for (const [championKey, championData] of Object.entries(riotChampions)) {
            convertedChampions[championKey] = this.convertChampion(championData);
        }

        return convertedChampions;
    }

    // ========================================
    // REVERSE CONVERSION (Calculator to Riot)
    // ========================================

    /**
     * Converts calculator format stats back to Riot API format
     * Useful for debugging or API calls
     * @param {Object} calculatorStats - Stats in calculator format
     * @returns {Object} Stats in Riot API format
     */
    static convertToRiotFormat(calculatorStats) {
        const riotStats = {};

        // Create reverse mapping
        const reverseMapping = {};
        for (const [riotKey, calcKey] of Object.entries(this.STAT_MAPPINGS)) {
            reverseMapping[calcKey] = riotKey;
        }

        for (const [calcStat, value] of Object.entries(calculatorStats)) {
            const riotStat = reverseMapping[calcStat];
            if (riotStat) {
                // Convert percentages back to decimals if needed
                if (riotStat.includes('Percent') || riotStat.includes('Crit')) {
                    riotStats[riotStat] = value / 100;
                } else {
                    riotStats[riotStat] = value;
                }
            }
        }

        return riotStats;
    }

    // ========================================
    // VALIDATION UTILITIES
    // ========================================

    /**
     * Validates that all required stats are present
     * @param {Object} stats - Stats object to validate
     * @returns {Object} Validation result with missing stats
     */
    static validateStats(stats) {
        const requiredStats = [
            'health', 'mana', 'attackDamage', 'abilityPower',
            'armor', 'magicResist', 'attackSpeed', 'movementSpeed'
        ];

        const missingStats = [];
        const presentStats = [];

        for (const stat of requiredStats) {
            if (stats[stat] === undefined || stats[stat] === null) {
                missingStats.push(stat);
            } else {
                presentStats.push(stat);
            }
        }

        return {
            isValid: missingStats.length === 0,
            missingStats,
            presentStats,
            statsObject: stats
        };
    }

    /**
     * Fills in missing stats with default values
     * @param {Object} stats - Stats object to fill
     * @returns {Object} Stats with defaults filled in
     */
    static fillDefaultStats(stats) {
        const defaults = {
            health: 0,
            healthPerLevel: 0,
            mana: 0,
            manaPerLevel: 0,
            attackDamage: 0,
            attackDamagePerLevel: 0,
            abilityPower: 0,
            armor: 0,
            armorPerLevel: 0,
            magicResist: 0,
            magicResistPerLevel: 0,
            attackSpeed: 0,
            attackSpeedPerLevel: 0,
            movementSpeed: 0,
            critChance: 0,
            critDamage: 0,
            lifeSteal: 0,
            spellVamp: 0,
            lethality: 0,
            armorPenetrationPercent: 0,
            magicPenetration: 0,
            magicPenetrationPercent: 0,
            cooldownReduction: 0,
            abilityHaste: 0,
            healthRegen: 0,
            healthRegenPerLevel: 0,
            manaRegen: 0,
            manaRegenPerLevel: 0,
            tenacity: 0,
            goldPer10: 0
        };

        return { ...defaults, ...stats };
    }
}

// ========================================
// EXPORT FOR USE IN OTHER MODULES
// ========================================

// ES6 export for React/modern JavaScript
export default StatMappingUtility;

// Also export individual methods for convenience
export {
    StatMappingUtility,
    StatMappingUtility as StatMapper // Alias for shorter imports
};