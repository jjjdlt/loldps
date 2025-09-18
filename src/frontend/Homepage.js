// HomePage.js - Updated with SavedBuilds integration! *happy wiggle*
import React, { useState } from 'react';
import ChampionBuilder from '../backend/ChampionBuilder';
import SavedBuilds from '../components/SavedBuilds'; // Import the new component!
import '../css/Homepage.css';

function HomePage() {
    const [activeTab, setActiveTab] = useState('combatsim');

    return (
        <div className="homepage">
            <header className="app-header">
                <div className="header-card">
                    <h1>LoLDPS</h1>
                    <p>build your perfect champion loadout :3</p>
                </div>
            </header>

            <nav className="main-nav">
                <button
                    className={activeTab === 'combatsim' ? 'active' : ''}
                    onClick={() => setActiveTab('combatsim')}
                >
                    Combat Sim
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
                {activeTab === 'combatsim' && <ChampionBuilder />}
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

// Placeholder component for Build Comparison - still coming soon!
function BuildCompare() {
    return (
        <div className="build-compare">
            <h2>Build Comparison</h2>
            <p>Compare different builds side by side! Coming soon :3</p>
        </div>
    );
}

export default HomePage;