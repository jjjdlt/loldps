// SpellCard.js
import React from 'react';
import '../css/SpellCard.css';

function SpellCard({ spell, spellType, championName, onClick, selected, hotkey }) {
    // Function to get the correct image URL based on spell type and data
    const getSpellImageUrl = () => {
        if (spellType === 'passive') {
            // For passives, use the image.full property from the data
            // This handles cases like "Anivia_P.png" or "Aatrox_Passive.png"
            const passiveImage = spell.image?.full;
            if (passiveImage) {
                return `https://ddragon.leagueoflegends.com/cdn/15.18.1/img/passive/${passiveImage}`;
            }
            // Fallback for passive images
            return `https://ddragon.leagueoflegends.com/cdn/15.18.1/img/passive/${championName}_Passive.png`;
        } else {
            // For regular abilities, use the image.full property
            // This handles cases like "FlashFrost.png" or "AatroxQ.png"
            const spellImage = spell.image?.full;
            if (spellImage) {
                return `https://ddragon.leagueoflegends.com/cdn/15.18.1/img/spell/${spellImage}`;
            }
            // Fallback for spell images using the spell ID
            return `https://ddragon.leagueoflegends.com/cdn/15.18.1/img/spell/${spell.id}.png`;
        }
    };

    // Extract spell information
    const spellName = spell.name || 'Unknown Ability';
    const spellDescription = spell.description || '';

    // Clean up description for display (remove HTML tags)
    const cleanDescription = spellDescription.replace(/<[^>]*>/g, '');
    const shortDescription = cleanDescription.length > 100
        ? cleanDescription.substring(0, 97) + '...'
        : cleanDescription;

    // Get cooldown, cost, and range for tooltips
    const cooldown = spell.cooldownBurn || null;
    const cost = spell.costBurn || null;
    const range = spell.rangeBurn || null;

    const imageUrl = getSpellImageUrl();

    return (
        <div
            className={`spell-card ${selected ? 'selected' : ''} ${spellType}`}
            onClick={onClick}
            title={`${spellName}\n${shortDescription}`}
        >
            {/* Hotkey indicator */}
            <div className="spell-hotkey">{hotkey}</div>

            {/* Spell image */}
            <div className="spell-image-container">
                <img
                    src={imageUrl}
                    alt={spellName}
                    className="spell-image"
                    onError={(e) => {
                        // Fallback image if spell icon fails to load
                        console.warn(`Failed to load spell image: ${imageUrl}`);
                        // Use a generic spell icon or placeholder
                        e.target.src = 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/spell/SummonerFlash.png';
                    }}
                />

                {/* Level indicator for non-passive abilities */}
                {spellType !== 'passive' && (
                    <div className="spell-level-dots">
                        {[...Array(5)].map((_, i) => (
                            <span key={i} className="level-dot"></span>
                        ))}
                    </div>
                )}
            </div>

            {/* Spell info */}
            <div className="spell-info">
                <span className="spell-name">{spellName}</span>

                {/* Quick stats display */}
                <div className="spell-quick-stats">
                    {cooldown && (
                        <span className="spell-stat cooldown" title="Cooldown">
                            {cooldown}s
                        </span>
                    )}
                    {cost && cost !== '0' && (
                        <span className="spell-stat cost" title="Cost">
                            {cost}
                        </span>
                    )}
                </div>
            </div>

            {/* Selected indicator */}
            {selected && (
                <div className="spell-selected-indicator">
                    <span>✓</span>
                </div>
            )}
        </div>
    );
}

export default SpellCard;