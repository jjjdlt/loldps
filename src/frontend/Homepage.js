// HomePage.js - The main interface! *excited wiggle*
import React, { useState } from 'react';
import ChampionBuilder from '../backend/ChampionBuilder';

function HomePage() {
    const [activeTab, setActiveTab] = useState('builder');

    return (
        <div className="homepage">
            <header className="app-header">
                <h1>⚔️ League of Legends Stat Calculator ⚔️</h1>
                <p>Build your perfect champion loadout! :3</p>
            </header>

            <nav className="main-nav">
                <button
                    className={activeTab === 'builder' ? 'active' : ''}
                    onClick={() => setActiveTab('builder')}
                >
                    Champion Builder
                </button>
                <button
                    className={activeTab === 'compare' ? 'active' : ''}
                    onClick={() => setActiveTab('compare')}
                >
                    Build Comparison
                </button>
                <button
                    className={activeTab === 'saved' ? 'active' : ''}
                    onClick={() => setActiveTab('saved')}
                >
                    Saved Builds
                </button>
            </nav>

            <main className="main-content">
                {activeTab === 'builder' && <ChampionBuilder />}
                {activeTab === 'compare' && <BuildCompare />}
                {activeTab === 'saved' && <SavedBuilds />}
            </main>

            <footer className="app-footer">
                <p>Made with 💜 using Riot Games API data</p>
                <p>Not affiliated with Riot Games</p>
            </footer>
        </div>
    );
}

// Placeholder components - expand these as needed!
function BuildCompare() {
    return (
        <div className="build-compare">
            <h2>Build Comparison (Coming Soon!)</h2>
            <p>Compare different builds side by side!</p>
        </div>
    );
}

function SavedBuilds() {
    return (
        <div className="saved-builds">
            <h2>Saved Builds (Coming Soon!)</h2>
            <p>Save and load your favorite builds!</p>
        </div>
    );
}

export default HomePage;