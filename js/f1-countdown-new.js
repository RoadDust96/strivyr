// F1 Countdown Timer - Rebuilt
console.log('F1 countdown script starting');

document.addEventListener('DOMContentLoaded', function() {
    console.log('F1 DOM ready');
    
    // Basic standings display functions
    function displayDriverStandings(standings) {
        const container = document.querySelector('.driver-standings');
        if (!container || !standings.length) return;

        const top10 = standings.slice(0, 10);
        const standingsList = container.querySelector('.standings-list');
        
        if (standingsList) {
            console.log('Driver standings list found, updating content');
            standingsList.innerHTML = `
                <div class="standings-header" style="display: flex !important; background: #242b3a; padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; font-weight: 600; color: #94a3b8; border: 2px solid #3b82f6;">
                    <span class="header-pos" style="width: 2.5rem; margin-right: 1rem; text-align: center;">Pos</span>
                    <span class="header-name" style="flex: 1; min-width: 0;">Driver</span>
                    <span class="header-team" style="margin: 0 1rem; flex-shrink: 0;">Team</span>
                    <span class="header-points" style="min-width: 4rem; text-align: right;">Points</span>
                </div>
                ${top10.map(driver => {
                    const position = parseInt(driver.position);
                    let positionClass = '';
                    
                    if (position === 1) positionClass = 'position-1';
                    else if (position === 2) positionClass = 'position-2';  
                    else if (position === 3) positionClass = 'position-3';
                    else positionClass = 'position-other';
                    
                    return `
                        <div class="standings-item ${positionClass}">
                            <span class="position">${driver.position}</span>
                            <span class="driver-name">${driver.Driver.givenName} ${driver.Driver.familyName}</span>
                            <span class="team">${driver.Constructors[0].name}</span>
                            <span class="points">${driver.points} pts</span>
                        </div>
                    `;
                }).join('')}
            `;
        }
    }

    function displayConstructorStandings(standings) {
        const container = document.querySelector('.constructor-standings');
        if (!container || !standings.length) return;

        const standingsList = container.querySelector('.standings-list');
        
        if (standingsList) {
            console.log('Constructor standings list found, updating content');
            standingsList.innerHTML = `
                <div class="standings-header" style="display: flex !important; background: #242b3a; padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; font-weight: 600; color: #94a3b8; border: 2px solid #3b82f6;">
                    <span class="header-pos" style="width: 2.5rem; margin-right: 1rem; text-align: center;">Pos</span>
                    <span class="header-name" style="flex: 1; min-width: 0;">Constructor</span>
                    <span class="header-points" style="min-width: 4rem; text-align: right;">Points</span>
                    <span class="header-wins" style="min-width: 4rem; text-align: right;">Wins</span>
                </div>
                ${standings.map(constructor => {
                    const position = parseInt(constructor.position);
                    let positionClass = '';
                    
                    if (position === 1) positionClass = 'position-1';
                    else if (position === 2) positionClass = 'position-2';  
                    else if (position === 3) positionClass = 'position-3';
                    else positionClass = 'position-other';
                    
                    return `
                        <div class="standings-item ${positionClass}">
                            <span class="position">${constructor.position}</span>
                            <span class="constructor-name">${constructor.Constructor.name}</span>
                            <span class="points">${constructor.points} pts</span>
                            <span class="wins">${constructor.wins} wins</span>
                        </div>
                    `;
                }).join('')}
            `;
        }
    }

    // Fetch standings functions
    async function fetchDriverStandings() {
        try {
            const response = await fetch('https://api.jolpi.ca/ergast/f1/current/driverStandings.json');
            const data = await response.json();
            return data.MRData.StandingsTable.StandingsLists[0].DriverStandings;
        } catch (error) {
            console.error('Error fetching driver standings:', error);
            return [];
        }
    }

    async function fetchConstructorStandings() {
        try {
            const response = await fetch('https://api.jolpi.ca/ergast/f1/current/constructorStandings.json');
            const data = await response.json();
            return data.MRData.StandingsTable.StandingsLists[0].ConstructorStandings;
        } catch (error) {
            console.error('Error fetching constructor standings:', error);
            return [];
        }
    }

    // Fetch and display both standings
    async function fetchStandings() {
        try {
            console.log('Fetching standings...');
            const [driverStandings, constructorStandings] = await Promise.all([
                fetchDriverStandings(),
                fetchConstructorStandings()
            ]);

            console.log('Driver standings:', driverStandings.length, 'entries');
            console.log('Constructor standings:', constructorStandings.length, 'entries');

            displayDriverStandings(driverStandings);
            displayConstructorStandings(constructorStandings);
        } catch (error) {
            console.error('Error in fetchStandings:', error);
        }
    }

    // Initialize
    fetchStandings();
});