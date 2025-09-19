// RuneBuilder.js
import React, { useState, useEffect } from 'react';
import '../css/RuneBuilder.css';

function RuneBuilder({ onRuneUpdate, initialRunes = {} }) {
    const [runesData, setRunesData] = useState(null);
    const [selectedRunes, setSelectedRunes] = useState({
        primaryTree: null,
        primaryKeystone: null,
        primaryRunes: [null, null, null],
        secondaryTree: null,
        secondaryRunes: [null, null],
        statShards: {
            offense: null,
            flex: null,
            defense: null
        }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Stat shard options
    const statShardOptions = {
        offense: [
            { id: 'adaptive', value: 9, icon: 'StatModsAdaptiveForceIcon', tooltip: '+9 Adaptive Force' },
            { id: 'attackspeed', value: 10, icon: 'StatModsAttackSpeedIcon', tooltip: '+10% Attack Speed' },
            { id: 'abilityhaste', value: 8, icon: 'StatModsCDRScalingIcon', tooltip: '+8 Ability Haste' }
        ],
        flex: [
            { id: 'adaptive', value: 9, icon: 'StatModsAdaptiveForceIcon', tooltip: '+9 Adaptive Force' },
            { id: 'armor', value: 6, icon: 'StatModsArmorIcon', tooltip: '+6 Armor' },
            { id: 'magicresist', value: 8, icon: 'StatModsMagicResIcon', tooltip: '+8 Magic Resist' }
        ],
        defense: [
            { id: 'health', value: 15, icon: 'StatModsHealthScalingIcon', tooltip: '+15-140 Health (based on level)' },
            { id: 'armor', value: 6, icon: 'StatModsArmorIcon', tooltip: '+6 Armor' },
            { id: 'magicresist', value: 8, icon: 'StatModsMagicResIcon', tooltip: '+8 Magic Resist' }
        ]
    };

    useEffect(() => {
        fetchRunesData();
    }, []);

    useEffect(() => {
        // Initialize with provided runes if any
        if (initialRunes && Object.keys(initialRunes).length > 0) {
            setSelectedRunes({
                ...selectedRunes,
                ...initialRunes
            });
        }
    }, [initialRunes]);

    useEffect(() => {
        // Notify parent component of rune changes
        if (onRuneUpdate) {
            onRuneUpdate(selectedRunes);
        }
    }, [selectedRunes, onRuneUpdate]);

    const fetchRunesData = async () => {
        try {
            setLoading(true);
            const response = await fetch('https://ddragon.leagueoflegends.com/cdn/15.18.1/data/en_US/runesReforged.json');

            if (!response.ok) {
                throw new Error(`Failed to fetch runes: ${response.status}`);
            }

            const data = await response.json();
            setRunesData(data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching runes:', err);
            setError(err.message);
            setLoading(false);
        }
    };

    const handlePrimaryTreeSelect = (treeId) => {
        if (selectedRunes.secondaryTree === treeId) {
            // Can't select same tree for both
            return;
        }

        setSelectedRunes({
            ...selectedRunes,
            primaryTree: treeId,
            primaryKeystone: null,
            primaryRunes: [null, null, null]
        });
    };

    const handleSecondaryTreeSelect = (treeId) => {
        if (selectedRunes.primaryTree === treeId) {
            // Can't select same tree for both
            return;
        }

        setSelectedRunes({
            ...selectedRunes,
            secondaryTree: treeId,
            secondaryRunes: [null, null]
        });
    };

    const handleKeystoneSelect = (keystoneId) => {
        setSelectedRunes({
            ...selectedRunes,
            primaryKeystone: keystoneId
        });
    };

    const handlePrimaryRuneSelect = (runeId, rowIndex) => {
        const newPrimaryRunes = [...selectedRunes.primaryRunes];
        newPrimaryRunes[rowIndex] = runeId;

        setSelectedRunes({
            ...selectedRunes,
            primaryRunes: newPrimaryRunes
        });
    };

    const handleSecondaryRuneSelect = (runeId, rowIndex) => {
        const newSecondaryRunes = [...selectedRunes.secondaryRunes];
        newSecondaryRunes[rowIndex] = runeId;

        setSelectedRunes({
            ...selectedRunes,
            secondaryRunes: newSecondaryRunes
        });
    };

    const handleStatShardSelect = (category, shardId) => {
        setSelectedRunes({
            ...selectedRunes,
            statShards: {
                ...selectedRunes.statShards,
                [category]: shardId
            }
        });
    };

    const getRuneImageUrl = (iconPath) => {
        return `https://ddragon.leagueoflegends.com/cdn/img/${iconPath}`;
    };

    const getStatShardImageUrl = (iconName) => {
        return `https://ddragon.leagueoflegends.com/cdn/img/perk-images/StatMods/${iconName}.png`;
    };

    if (loading) {
        return (
            <div className="rune-builder loading">
                <div className="loading-spinner">Loading runes...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rune-builder error">
                <p>Error loading runes: {error}</p>
            </div>
        );
    }

    const primaryTree = runesData?.find(tree => tree.id === selectedRunes.primaryTree);
    const secondaryTree = runesData?.find(tree => tree.id === selectedRunes.secondaryTree);

    return (
        <div className="rune-builder">
            <div className="runes-container">
                {/* Tree Selector Row */}
                <div className="tree-selector-row">
                    <div className="tree-selector primary-selector">
                        {runesData?.map(tree => (
                            <button
                                key={tree.id}
                                className={`tree-icon ${selectedRunes.primaryTree === tree.id ? 'selected' : ''}`}
                                onClick={() => handlePrimaryTreeSelect(tree.id)}
                                title={tree.name}
                            >
                                <img
                                    src={getRuneImageUrl(tree.icon)}
                                    alt={tree.name}
                                />
                            </button>
                        ))}
                    </div>

                    <div className="tree-selector secondary-selector">
                        {runesData?.map(tree => (
                            <button
                                key={tree.id}
                                className={`tree-icon ${selectedRunes.secondaryTree === tree.id ? 'selected' : ''} 
                                           ${selectedRunes.primaryTree === tree.id ? 'disabled' : ''}`}
                                onClick={() => handleSecondaryTreeSelect(tree.id)}
                                disabled={selectedRunes.primaryTree === tree.id}
                                title={tree.name}
                            >
                                <img
                                    src={getRuneImageUrl(tree.icon)}
                                    alt={tree.name}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Rune Selection Area */}
                <div className="runes-selection-area">
                    {/* Primary Tree Column */}
                    <div className="rune-column primary-column">
                        {primaryTree ? (
                            <>
                                {/* Keystone Row */}
                                <div className="rune-row keystone-row">
                                    {primaryTree.slots[0].runes.map(keystone => (
                                        <button
                                            key={keystone.id}
                                            className={`rune-slot keystone ${
                                                selectedRunes.primaryKeystone === keystone.id ? 'selected' : ''
                                            }`}
                                            onClick={() => handleKeystoneSelect(keystone.id)}
                                            title={keystone.name}
                                        >
                                            <img
                                                src={getRuneImageUrl(keystone.icon)}
                                                alt={keystone.name}
                                            />
                                        </button>
                                    ))}
                                </div>

                                {/* Primary Minor Rune Rows */}
                                {primaryTree.slots.slice(1, 4).map((slot, rowIndex) => (
                                    <div key={rowIndex} className="rune-row">
                                        {slot.runes.map(rune => (
                                            <button
                                                key={rune.id}
                                                className={`rune-slot ${
                                                    selectedRunes.primaryRunes[rowIndex] === rune.id ? 'selected' : ''
                                                }`}
                                                onClick={() => handlePrimaryRuneSelect(rune.id, rowIndex)}
                                                title={rune.name}
                                            >
                                                <img
                                                    src={getRuneImageUrl(rune.icon)}
                                                    alt={rune.name}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                ))}
                            </>
                        ) : (
                            <div className="tree-placeholder">
                                <p>Select a primary tree</p>
                            </div>
                        )}
                    </div>

                    {/* Right Side Container */}
                    <div className="right-side-container">
                        {/* Secondary Tree Column */}
                        <div className="rune-column secondary-column">
                            {secondaryTree ? (
                                <>
                                    {/* Secondary Minor Rune Rows - Skip keystone, select 2 from remaining 3 */}
                                    {secondaryTree.slots.slice(1, 4).map((slot, actualIndex) => {
                                        const selectedCount = selectedRunes.secondaryRunes.filter(r => r !== null).length;
                                        const isRowDisabled = selectedCount >= 2 &&
                                            !slot.runes.some(r => selectedRunes.secondaryRunes.includes(r.id));

                                        return (
                                            <div key={actualIndex} className="rune-row">
                                                {slot.runes.map(rune => {
                                                    const isSelected = selectedRunes.secondaryRunes.includes(rune.id);
                                                    const isDisabled = !isSelected && isRowDisabled;

                                                    return (
                                                        <button
                                                            key={rune.id}
                                                            className={`rune-slot ${isSelected ? 'selected' : ''} 
                                                                       ${isDisabled ? 'disabled' : ''}`}
                                                            onClick={() => {
                                                                if (isSelected) {
                                                                    // Deselect
                                                                    const newRunes = selectedRunes.secondaryRunes.map(
                                                                        r => r === rune.id ? null : r
                                                                    );
                                                                    setSelectedRunes({
                                                                        ...selectedRunes,
                                                                        secondaryRunes: newRunes
                                                                    });
                                                                } else if (!isDisabled) {
                                                                    // Select (find empty slot)
                                                                    const newRunes = [...selectedRunes.secondaryRunes];
                                                                    const emptyIndex = newRunes.indexOf(null);
                                                                    if (emptyIndex !== -1) {
                                                                        newRunes[emptyIndex] = rune.id;
                                                                        setSelectedRunes({
                                                                            ...selectedRunes,
                                                                            secondaryRunes: newRunes
                                                                        });
                                                                    }
                                                                }
                                                            }}
                                                            disabled={isDisabled}
                                                            title={rune.name}
                                                        >
                                                            <img
                                                                src={getRuneImageUrl(rune.icon)}
                                                                alt={rune.name}
                                                            />
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })}
                                </>
                            ) : (
                                <div className="tree-placeholder">
                                    <p>Select a secondary tree</p>
                                </div>
                            )}
                        </div>

                        {/* Stat Shards Column */}
                        <div className="stat-shards-column">
                            <h4 className="shards-title">Stat Shards</h4>

                            {/* Offense Row */}
                            <div className="shard-row">
                                {statShardOptions.offense.map(shard => (
                                    <button
                                        key={shard.id}
                                        className={`shard-slot ${
                                            selectedRunes.statShards.offense === shard.id ? 'selected' : ''
                                        }`}
                                        onClick={() => handleStatShardSelect('offense', shard.id)}
                                        title={shard.tooltip}
                                    >
                                        <img
                                            src={getStatShardImageUrl(shard.icon)}
                                            alt={shard.tooltip}
                                        />
                                    </button>
                                ))}
                            </div>

                            {/* Flex Row */}
                            <div className="shard-row">
                                {statShardOptions.flex.map(shard => (
                                    <button
                                        key={shard.id}
                                        className={`shard-slot ${
                                            selectedRunes.statShards.flex === shard.id ? 'selected' : ''
                                        }`}
                                        onClick={() => handleStatShardSelect('flex', shard.id)}
                                        title={shard.tooltip}
                                    >
                                        <img
                                            src={getStatShardImageUrl(shard.icon)}
                                            alt={shard.tooltip}
                                        />
                                    </button>
                                ))}
                            </div>

                            {/* Defense Row */}
                            <div className="shard-row">
                                {statShardOptions.defense.map(shard => (
                                    <button
                                        key={shard.id}
                                        className={`shard-slot ${
                                            selectedRunes.statShards.defense === shard.id ? 'selected' : ''
                                        }`}
                                        onClick={() => handleStatShardSelect('defense', shard.id)}
                                        title={shard.tooltip}
                                    >
                                        <img
                                            src={getStatShardImageUrl(shard.icon)}
                                            alt={shard.tooltip}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RuneBuilder;