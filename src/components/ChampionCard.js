// ChampionCard.js
import React from 'react';
import '../css/ChampionCard.css';

function ChampionCard({ champion, championKey, onClick, selected }) {
    // Function to format champion name for the image URL
    // Handles special cases in Riot's naming conventions
    const formatChampionNameForImage = (championKey) => {
        // Special cases mapping
        const specialCases = {
            'MonkeyKing': 'MonkeyKing', // Wukong
            'Wukong': 'MonkeyKing',      // Just in case
            // Add more special cases if needed
        };

        // Check if it's a special case first
        if (specialCases[championKey]) {
            return specialCases[championKey];
        }

        // For most champions, the key works directly
        // Remove spaces and apostrophes for names like "Kai'Sa" -> "Kaisa"
        return championKey.replace(/['\s]/g, '');
    };

    // Construct the URL for the champion image
    const championImageName = formatChampionNameForImage(championKey);
    const imageUrl = `https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/${championImageName}.png`;

    // Extract champion info
    const championName = champion.name || 'Unknown Champion';
    const championTitle = champion.title || '';
    const championTags = champion.tags || [];

    return (
        <div
            className={`champion-card ${selected ? 'selected' : ''}`}
            onClick={onClick}
            title={`${championName} - ${championTitle}`}
        >
            <div className="champion-image-container">
                <img
                    src={imageUrl}
                    alt={championName}
                    className="champion-image"
                    onError={(e) => {
                        // Fallback to a default champion image if loading fails
                        // Using Annie as a safe fallback since she's always available
                        e.target.src = 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Annie.png';
                        console.warn(`Failed to load image for ${championName}, using fallback`);
                    }}
                />
            </div>
            <div className="champion-info">
                <span className="champion-name">{championName}</span>
                <span className="champion-role">
                    {championTags.slice(0, 2).join(' / ')}
                </span>
            </div>
        </div>
    );
}

export default ChampionCard;