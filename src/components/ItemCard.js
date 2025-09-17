// ItemCard.js
import React from 'react';
import '../css/ItemCard.css'; // We'll create styles for this!

function ItemCard({ item, itemId, onClick, disabled }) {
    // Construct the URL for the item image
    const imageUrl = `https://ddragon.leagueoflegends.com/cdn/15.18.1/img/item/${itemId}.png`;

    // Extract item name from the data
    const itemName = item.name || 'Unknown Item';

    // Extract item cost
    const cost = item.gold?.total || 0;

    return (
        <div
            className={`item-card ${disabled ? 'disabled' : ''}`}
            onClick={!disabled ? onClick : undefined}
            title={itemName}
        >
            <div className="item-image-container">
                <img
                    src={imageUrl}
                    alt={itemName}
                    className="item-image"
                    onError={(e) => {
                        // Fallback for missing images
                        e.target.src = 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/item/1001.png';
                    }}
                />
            </div>
            <div className="item-info">
                <span className="item-name">{itemName}</span>
                <span className="item-cost">{cost} gold</span>
            </div>
        </div>
    );
}

export default ItemCard;