// ChampionSelector.js
import React, { useState, useMemo } from 'react';
import ChampionCard from './ChampionCard'; // Import our new component!
import '../css/ChampionSelector.css';

function ChampionSelector({ champions, onSelect, selectedChampion }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');

    // Get unique roles from all champions
    const availableRoles = useMemo(() => {
        const roles = new Set(['All']);
        Object.values(champions).forEach(champion => {
            champion.tags?.forEach(tag => roles.add(tag));
        });
        return Array.from(roles);
    }, [champions]);

    // Filter champions based on search and role
    const filteredChampions = useMemo(() => {
        return Object.entries(champions).filter(([key, champion]) => {
            // Filter by search term
            if (searchTerm && !champion.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                return false;
            }

            // Filter by role
            if (roleFilter !== 'All' && !champion.tags?.includes(roleFilter)) {
                return false;
            }

            return true;
        }).sort((a, b) => a[1].name.localeCompare(b[1].name));
    }, [champions, searchTerm, roleFilter]);

    return (
        <div className="champion-selector">
            <h3>Select a Champion</h3>

            <div className="champion-filters">
                <input
                    type="text"
                    placeholder="Search champions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="champion-search"
                />

                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="role-filter"
                >
                    {availableRoles.map(role => (
                        <option key={role} value={role}>{role}</option>
                    ))}
                </select>
            </div>

            <div className="champion-grid">
                {filteredChampions.map(([key, champion]) => (
                    <ChampionCard
                        key={key}
                        champion={champion}
                        championKey={key}
                        onClick={() => onSelect(key)}
                        selected={selectedChampion === key}
                    />
                ))}
            </div>

            {filteredChampions.length === 0 && (
                <div className="no-champions">
                    No champions found! Try a different search.
                </div>
            )}
        </div>
    );
}

export default ChampionSelector;