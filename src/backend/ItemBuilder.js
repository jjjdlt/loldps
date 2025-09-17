// ItemBuilder.js
import React, { useState, useMemo } from 'react';
import ItemCard from '../components/ItemCard';
import '../css/ItemBuilder.css';

function ItemBuilder({ items, onAddItem, onRemoveItem, currentItems = [], maxItems = 6 }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTag, setSelectedTag] = useState('All');

    // Get all unique tags from items
    const availableTags = useMemo(() => {
        const tags = new Set(['All']);
        Object.values(items).forEach(item => {
            if (item.gold?.purchasable && item.tags) {
                item.tags.forEach(tag => tags.add(tag));
            }
        });
        return Array.from(tags).sort();
    }, [items]);

    // Filter items based on search and tags
    const filteredItems = useMemo(() => {
        return Object.entries(items).filter(([itemId, item]) => {
            // Skip items that can't be purchased
            if (!item.gold?.purchasable) return false;

            // Skip items with 0 cost (like starter items in special game modes)
            if (item.gold?.total === 0) return false;

            // Filter by search term
            if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                return false;
            }

            // Filter by tags
            if (selectedTag !== 'All' && !item.tags?.includes(selectedTag)) {
                return false;
            }

            return true;
        }).sort((a, b) => {
            // Sort by cost (descending) then by name
            const costDiff = (b[1].gold?.total || 0) - (a[1].gold?.total || 0);
            if (costDiff !== 0) return costDiff;
            return a[1].name.localeCompare(b[1].name);
        });
    }, [items, searchTerm, selectedTag]);

    const handleItemClick = (itemId) => {
        // Check if item is already in build
        if (currentItems.find(item => item.id === itemId)) {
            return; // Don't add duplicates
        }

        if (currentItems.length >= maxItems) {
            console.warn(`Cannot add more than ${maxItems} items!`);
            return;
        }

        const itemData = items[itemId];
        if (!itemData) {
            console.error('Item not found:', itemId);
            return;
        }

        // Add item to build
        onAddItem({
            id: itemId,
            ...itemData
        });
    };

    const handleRemoveItem = (itemId) => {
        if (onRemoveItem) {
            onRemoveItem(itemId);
        }
    };

    // Calculate total stats from current build
    const buildStats = useMemo(() => {
        const stats = {};
        currentItems.forEach(item => {
            if (item.stats) {
                Object.entries(item.stats).forEach(([key, value]) => {
                    stats[key] = (stats[key] || 0) + value;
                });
            }
        });
        return stats;
    }, [currentItems]);

    // Format stat names for display
    const formatStatName = (statKey) => {
        const statNames = {
            attackDamage: 'Attack Damage',
            abilityPower: 'Ability Power',
            health: 'Health',
            mana: 'Mana',
            armor: 'Armor',
            magicResist: 'Magic Resist',
            attackSpeed: 'Attack Speed',
            criticalStrikeChance: 'Critical Strike',
            movementSpeed: 'Movement Speed',
            abilityHaste: 'Ability Haste',
            lifeSteal: 'Life Steal',
            omnivamp: 'Omnivamp',
            healAndShieldPower: 'Heal & Shield Power',
            armorPenetration: 'Armor Pen',
            magicPenetration: 'Magic Pen',
            lethality: 'Lethality'
        };
        return statNames[statKey] || statKey;
    };

    return (
        <div className="item-builder-container">
            <div className="item-builder-header">
                <h3>Item Builder ({currentItems.length}/{maxItems})</h3>
            </div>

            {/* Current Build Display */}
            <div className="current-build-section">
                <div className="build-slots">
                    {[...Array(maxItems)].map((_, index) => {
                        const item = currentItems[index];
                        return (
                            <div key={index} className="build-slot">
                                {item ? (
                                    <div className="build-item" onClick={() => handleRemoveItem(item.id)}>
                                        <img
                                            src={`https://ddragon.leagueoflegends.com/cdn/15.18.1/img/item/${item.id}.png`}
                                            alt={item.name}
                                            title={`${item.name} - Click to remove`}
                                        />
                                        <span className="item-cost">{item.gold?.total || 0}g</span>
                                        <span className="remove-indicator">×</span>
                                    </div>
                                ) : (
                                    <div className="empty-slot">
                                        <span>{index + 1}</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Build Stats Summary */}
                {currentItems.length > 0 && (
                    <div className="build-stats">
                        <h4>Build Statistics</h4>
                        <div className="stats-grid">
                            {Object.entries(buildStats).map(([key, value]) => (
                                <div key={key} className="stat-item">
                                    <span className="stat-name">{formatStatName(key)}:</span>
                                    <span className="stat-value">+{value}</span>
                                </div>
                            ))}
                        </div>
                        <div className="total-cost">
                            Total Cost: {currentItems.reduce((sum, item) => sum + (item.gold?.total || 0), 0)} gold
                        </div>
                    </div>
                )}
            </div>

            {/* Item Selection Section */}
            <div className="item-selection-section">
                <div className="item-filters">
                    <input
                        type="text"
                        placeholder="Search items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="item-search"
                    />

                    <select
                        value={selectedTag}
                        onChange={(e) => setSelectedTag(e.target.value)}
                        className="tag-filter"
                    >
                        {availableTags.map(tag => (
                            <option key={tag} value={tag}>{tag}</option>
                        ))}
                    </select>
                </div>

                <div className="item-grid">
                    {filteredItems.map(([itemId, item]) => (
                        <ItemCard
                            key={itemId}
                            item={item}
                            itemId={itemId}
                            onClick={() => handleItemClick(itemId)}
                            disabled={currentItems.length >= maxItems || currentItems.find(i => i.id === itemId)}
                        />
                    ))}
                </div>

                {filteredItems.length === 0 && (
                    <div className="no-items-found">
                        No items found matching your criteria!
                    </div>
                )}
            </div>

            {/* Selected Item Details */}
            {currentItems.length > 0 && (
                <div className="item-details-section">
                    <h4>Item Details</h4>
                    <div className="item-details-grid">
                        {currentItems.map(item => (
                            <div key={item.id} className="item-detail-card">
                                <div className="item-detail-header">
                                    <img
                                        src={`https://ddragon.leagueoflegends.com/cdn/15.18.1/img/item/${item.id}.png`}
                                        alt={item.name}
                                        className="item-detail-icon"
                                    />
                                    <div>
                                        <h5>{item.name}</h5>
                                        <span className="item-detail-cost">{item.gold?.total || 0} gold</span>
                                    </div>
                                </div>

                                {/* Item Stats */}
                                {item.stats && Object.keys(item.stats).length > 0 && (
                                    <div className="item-detail-stats">
                                        {Object.entries(item.stats).map(([key, value]) => (
                                            <p key={key}>
                                                {formatStatName(key)}: +{value}
                                            </p>
                                        ))}
                                    </div>
                                )}

                                {/* Item Description (contains passives/actives) */}
                                {item.description && (
                                    <div className="item-detail-description">
                                        <p dangerouslySetInnerHTML={{
                                            __html: item.description.replace(/<[^>]*>/g, '').substring(0, 150) + '...'
                                        }} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ItemBuilder;