// BuildStorage.js - Handles all the build saving magic! ✨
class BuildStorage {
    constructor() {
        this.STORAGE_KEY = 'loldps_saved_builds';
        this.MAX_BUILDS = 50; // Reasonable limit to prevent storage bloat
    }

    // Get all saved builds from localStorage
    getAllBuilds() {
        try {
            const buildsJson = localStorage.getItem(this.STORAGE_KEY);
            if (!buildsJson) {
                return [];
            }
            const builds = JSON.parse(buildsJson);
            // Sort by timestamp, newest first
            return builds.sort((a, b) => b.timestamp - a.timestamp);
        } catch (error) {
            console.error('Error loading builds:', error);
            return [];
        }
    }

    // Save a new build
    saveBuild(buildData) {
        try {
            const builds = this.getAllBuilds();

            // Check if we've hit the max limit
            if (builds.length >= this.MAX_BUILDS) {
                console.warn(`Maximum of ${this.MAX_BUILDS} builds reached. Delete some builds to save new ones.`);
                return { success: false, error: 'Maximum builds reached' };
            }

            // Create build object with all necessary data
            const newBuild = {
                id: this.generateId(),
                name: buildData.name || `Build ${builds.length + 1}`,
                timestamp: Date.now(),

                // Champion info
                championKey: buildData.championKey,
                championName: buildData.championName,
                level: buildData.level || 1,

                // Items (store simplified version)
                items: this.simplifyItems(buildData.items || []),
                totalCost: this.calculateTotalCost(buildData.items || []),

                // Stats (final calculated stats)
                stats: buildData.stats || {},
                baseStats: buildData.baseStats || {},

                // Runes (placeholder for now)
                runes: {
                    primaryTree: buildData.runes?.primaryTree || null,
                    secondaryTree: buildData.runes?.secondaryTree || null,
                    keystone: buildData.runes?.keystone || null,
                    primaryRunes: buildData.runes?.primaryRunes || [],
                    secondaryRunes: buildData.runes?.secondaryRunes || [],
                    statShards: buildData.runes?.statShards || {
                        offense: null,
                        flex: null,
                        defense: null
                    }
                },

                // Gold efficiency (placeholder calculation)
                goldEfficiency: this.calculateGoldEfficiency(buildData.stats, buildData.items),

                // Additional metadata
                version: buildData.version || '15.18.1',
                notes: buildData.notes || ''
            };

            // Add to builds array
            builds.unshift(newBuild); // Add to beginning

            // Save to localStorage
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(builds));

            return { success: true, build: newBuild };
        } catch (error) {
            console.error('Error saving build:', error);
            return { success: false, error: error.message };
        }
    }

    // Update an existing build
    updateBuild(buildId, updates) {
        try {
            const builds = this.getAllBuilds();
            const buildIndex = builds.findIndex(b => b.id === buildId);

            if (buildIndex === -1) {
                return { success: false, error: 'Build not found' };
            }

            // Merge updates with existing build
            builds[buildIndex] = {
                ...builds[buildIndex],
                ...updates,
                lastModified: Date.now()
            };

            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(builds));
            return { success: true, build: builds[buildIndex] };
        } catch (error) {
            console.error('Error updating build:', error);
            return { success: false, error: error.message };
        }
    }

    // Delete a build
    deleteBuild(buildId) {
        try {
            const builds = this.getAllBuilds();
            const filteredBuilds = builds.filter(b => b.id !== buildId);

            if (builds.length === filteredBuilds.length) {
                return { success: false, error: 'Build not found' };
            }

            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredBuilds));
            return { success: true };
        } catch (error) {
            console.error('Error deleting build:', error);
            return { success: false, error: error.message };
        }
    }

    // Get a specific build by ID
    getBuildById(buildId) {
        const builds = this.getAllBuilds();
        return builds.find(b => b.id === buildId) || null;
    }

    // Rename a build
    renameBuild(buildId, newName) {
        return this.updateBuild(buildId, { name: newName });
    }

    // Duplicate a build
    duplicateBuild(buildId) {
        const originalBuild = this.getBuildById(buildId);
        if (!originalBuild) {
            return { success: false, error: 'Build not found' };
        }

        const duplicatedBuild = {
            ...originalBuild,
            name: `${originalBuild.name} (Copy)`,
            id: this.generateId(),
            timestamp: Date.now()
        };

        const builds = this.getAllBuilds();
        builds.unshift(duplicatedBuild);

        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(builds));
            return { success: true, build: duplicatedBuild };
        } catch (error) {
            console.error('Error duplicating build:', error);
            return { success: false, error: error.message };
        }
    }

    // Export builds to JSON (for backup)
    exportBuilds() {
        const builds = this.getAllBuilds();
        return JSON.stringify(builds, null, 2);
    }

    // Import builds from JSON
    importBuilds(jsonString, replace = false) {
        try {
            const importedBuilds = JSON.parse(jsonString);

            if (!Array.isArray(importedBuilds)) {
                return { success: false, error: 'Invalid builds format' };
            }

            let builds = replace ? [] : this.getAllBuilds();

            // Add imported builds with new IDs to avoid conflicts
            importedBuilds.forEach(build => {
                builds.push({
                    ...build,
                    id: this.generateId(),
                    imported: true,
                    importDate: Date.now()
                });
            });

            // Limit to MAX_BUILDS
            if (builds.length > this.MAX_BUILDS) {
                builds = builds.slice(0, this.MAX_BUILDS);
            }

            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(builds));
            return { success: true, count: importedBuilds.length };
        } catch (error) {
            console.error('Error importing builds:', error);
            return { success: false, error: error.message };
        }
    }

    // Clear all builds
    clearAllBuilds() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            return { success: true };
        } catch (error) {
            console.error('Error clearing builds:', error);
            return { success: false, error: error.message };
        }
    }

    // Utility function to generate unique IDs
    generateId() {
        return `build_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Simplify items for storage (reduce data size)
    simplifyItems(items) {
        return items.map(item => ({
            id: item.id,
            name: item.name,
            cost: item.gold?.total || 0,
            stats: item.stats || {}
        }));
    }

    // Calculate total cost of items
    calculateTotalCost(items) {
        return items.reduce((total, item) => {
            return total + (item.gold?.total || 0);
        }, 0);
    }

    // Placeholder for gold efficiency calculation
    calculateGoldEfficiency(stats, items) {
        // This is a simplified placeholder calculation
        // In a real implementation, you'd calculate based on:
        // - Base stat gold values (e.g., 1 AD = 35 gold)
        // - Total stat value vs total cost

        if (!items || items.length === 0) return 0;

        const totalCost = this.calculateTotalCost(items);
        if (totalCost === 0) return 0;

        // Simplified stat values (in gold)
        const statValues = {
            attackDamage: 35,
            abilityPower: 20,
            attackSpeed: 25,
            critChance: 40,
            health: 2.67,
            armor: 20,
            magicResist: 18,
            movementSpeed: 12,
            abilityHaste: 26.67,
            lethality: 50,
            lifeSteal: 37.5,
            omnivamp: 27.5
        };

        let totalStatValue = 0;

        // Calculate total stat value
        Object.entries(stats).forEach(([stat, value]) => {
            if (statValues[stat] && value > 0) {
                // For percentage stats, multiply by 100
                if (stat === 'critChance' || stat === 'lifeSteal' || stat === 'omnivamp') {
                    totalStatValue += value * 100 * statValues[stat];
                } else {
                    totalStatValue += value * statValues[stat];
                }
            }
        });

        // Calculate efficiency percentage
        const efficiency = (totalStatValue / totalCost) * 100;

        // Return rounded efficiency
        return Math.round(efficiency);
    }

    // Get storage usage info
    getStorageInfo() {
        const builds = this.getAllBuilds();
        const storageSize = new Blob([JSON.stringify(builds)]).size;

        return {
            buildCount: builds.length,
            maxBuilds: this.MAX_BUILDS,
            storageUsed: this.formatBytes(storageSize),
            percentUsed: ((builds.length / this.MAX_BUILDS) * 100).toFixed(1)
        };
    }

    // Format bytes to human-readable string
    formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    // Search builds
    searchBuilds(query) {
        const builds = this.getAllBuilds();
        const searchTerm = query.toLowerCase();

        return builds.filter(build => {
            return build.name.toLowerCase().includes(searchTerm) ||
                build.championName.toLowerCase().includes(searchTerm) ||
                build.items.some(item => item.name?.toLowerCase().includes(searchTerm));
        });
    }

    // Get builds for a specific champion
    getBuildsByChampion(championKey) {
        const builds = this.getAllBuilds();
        return builds.filter(build => build.championKey === championKey);
    }

    // Sort builds
    sortBuilds(sortBy = 'timestamp', ascending = false) {
        const builds = this.getAllBuilds();

        builds.sort((a, b) => {
            let comparison = 0;

            switch(sortBy) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'champion':
                    comparison = a.championName.localeCompare(b.championName);
                    break;
                case 'cost':
                    comparison = a.totalCost - b.totalCost;
                    break;
                case 'level':
                    comparison = a.level - b.level;
                    break;
                case 'efficiency':
                    comparison = (a.goldEfficiency || 0) - (b.goldEfficiency || 0);
                    break;
                case 'timestamp':
                default:
                    comparison = a.timestamp - b.timestamp;
            }

            return ascending ? comparison : -comparison;
        });

        return builds;
    }
}

// Create and export a singleton instance
const buildStorage = new BuildStorage();
export default buildStorage;