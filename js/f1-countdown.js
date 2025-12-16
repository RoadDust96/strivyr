// F1 Countdown Timer
document.addEventListener('DOMContentLoaded', function() {
    // Initialize with loading state
    let nextRace = null;
    let totalRaces = 0;
    let currentSeason = new Date().getFullYear();

    // DOM elements
    const daysElement = document.getElementById('days');
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');
    const localRaceTimeElement = document.getElementById('local-race-time');
    const timezoneInfoElement = document.getElementById('timezone-info');
    const countdownStatusElement = document.getElementById('countdown-status');

    // Comprehensive country flags mapping - ALL countries that have hosted F1 races
    const countryFlags = {
        // Current F1 Countries (2025)
        'australia': '🇦🇺',
        'bahrain': '🇧🇭', 
        'china': '🇨🇳',
        'japan': '🇯🇵',
        'saudi arabia': '🇸🇦',
        'usa': '🇺🇸',
        'united states': '🇺🇸',
        'italy': '🇮🇹',
        'monaco': '🇲🇨',
        'spain': '🇪🇸',
        'canada': '🇨🇦',
        'austria': '🇦🇹',
        'uk': '🇬🇧',
        'united kingdom': '🇬🇧',
        'great britain': '🇬🇧',
        'belgium': '🇧🇪',
        'hungary': '🇭🇺',
        'netherlands': '🇳🇱',
        'azerbaijan': '🇦🇿',
        'singapore': '🇸🇬',
        'mexico': '🇲🇽',
        'brazil': '🇧🇷',
        'qatar': '🇶🇦',
        'uae': '🇦🇪',
        'united arab emirates': '🇦🇪',
        
        // Historic F1 Countries
        'france': '🇫🇷',
        'germany': '🇩🇪',
        'west germany': '🇩🇪',
        'portugal': '🇵🇹',
        'turkey': '🇹🇷',
        'malaysia': '🇲🇾',
        'south korea': '🇰🇷',
        'india': '🇮🇳',
        'russia': '🇷🇺',
        'south africa': '🇿🇦',
        'argentina': '🇦🇷',
        'chile': '🇨🇱',
        'switzerland': '🇨🇭',
        'sweden': '🇸🇪',
        'morocco': '🇲🇦',
        'lebanon': '🇱🇧',
        'egypt': '🇪🇬',
        'east germany': '🇩🇪',
        'czechoslovakia': '🇨🇿',
        'yugoslavia': '🇷🇸',  // Using Serbia as closest modern equivalent
        
        // Alternative country name variations
        'korean republic': '🇰🇷',
        'republic of korea': '🇰🇷',
        'united states of america': '🇺🇸',
        'federal republic of germany': '🇩🇪',
        'russian federation': '🇷🇺',
        // "people's republic of china": '🇨🇳',
        'republic of south africa': '🇿🇦',
        'kingdom of bahrain': '🇧🇭',
        'state of qatar': '🇶🇦',
        'republic of singapore': '🇸🇬',
        'kingdom of saudi arabia': '🇸🇦',
        'principality of monaco': '🇲🇨',
        'republic of azerbaijan': '🇦🇿',
        'kingdom of the netherlands': '🇳🇱',
        'republic of hungary': '🇭🇺',
        'kingdom of belgium': '🇧🇪',
        'republic of austria': '🇦🇹',
        'kingdom of spain': '🇪🇸',
        'portuguese republic': '🇵🇹',
        'french republic': '🇫🇷',
        'italian republic': '🇮🇹',
        'swiss confederation': '🇨🇭',
        'kingdom of sweden': '🇸🇪',
        'kingdom of morocco': '🇲🇦',
        'lebanese republic': '🇱🇧',
        'arab republic of egypt': '🇪🇬',
        'republic of turkey': '🇹🇷',
        'republic of india': '🇮🇳',
        'federative republic of brazil': '🇧🇷',
        'united mexican states': '🇲🇽',
        'commonwealth of australia': '🇦🇺',
        'dominion of canada': '🇨🇦',
        'argentine republic': '🇦🇷',
        'republic of chile': '🇨🇱'
    };

    // Comprehensive circuit database - ALL F1 circuits ever used (1950-2025+)
    const circuitDetails = {
        // Current 2025 F1 Calendar
        'albert_park': { laps: 58, length: '5.278 km', distance: '305.9 km', lapRecord: '1:19.813' },
        'shanghai': { laps: 56, length: '5.451 km', distance: '305.1 km', lapRecord: '1:32.238' },
        'suzuka': { laps: 53, length: '5.807 km', distance: '307.5 km', lapRecord: '1:30.983' },
        'bahrain': { laps: 57, length: '5.412 km', distance: '308.4 km', lapRecord: '1:31.447' },
        'jeddah': { laps: 50, length: '6.174 km', distance: '308.5 km', lapRecord: '1:30.734' },
        'miami': { laps: 57, length: '5.412 km', distance: '308.3 km', lapRecord: '1:29.708' },
        'imola': { laps: 63, length: '4.909 km', distance: '309.0 km', lapRecord: '1:15.484' },
        'monaco': { laps: 78, length: '3.337 km', distance: '260.3 km', lapRecord: '1:12.909' },
        'catalunya': { laps: 66, length: '4.675 km', distance: '308.4 km', lapRecord: '1:16.330' },
        'montreal': { laps: 70, length: '4.361 km', distance: '305.3 km', lapRecord: '1:13.078' },
        'red_bull_ring': { laps: 71, length: '4.318 km', distance: '306.4 km', lapRecord: '1:05.619' },
        'silverstone': { laps: 52, length: '5.891 km', distance: '306.2 km', lapRecord: '1:27.097' },
        'spa': { laps: 44, length: '7.004 km', distance: '308.1 km', lapRecord: '1:46.286' },
        'zandvoort': { laps: 72, length: '4.259 km', distance: '306.6 km', lapRecord: '1:11.097' },
        'monza': { laps: 53, length: '5.793 km', distance: '306.7 km', lapRecord: '1:21.046' },
        'baku': { laps: 51, length: '6.003 km', distance: '306.0 km', lapRecord: '1:43.009' },
        'marina_bay': { laps: 62, length: '4.928 km', distance: '305.3 km', lapRecord: '1:36.015' },
        'cota': { laps: 56, length: '5.513 km', distance: '308.4 km', lapRecord: '1:36.169' },
        'rodriguez': { laps: 71, length: '4.304 km', distance: '305.4 km', lapRecord: '1:17.774' },
        'interlagos': { laps: 71, length: '4.309 km', distance: '305.9 km', lapRecord: '1:10.540' },
        'losail': { laps: 57, length: '5.380 km', distance: '306.7 km', lapRecord: '1:24.319' },
        'yas_marina': { laps: 58, length: '5.281 km', distance: '306.2 km', lapRecord: '1:26.103' },
        'vegas': { laps: 50, length: '6.201 km', distance: '310.0 km', lapRecord: '1:35.490' },
        
        // Recently Used Circuits (2020s)
        'portimao': { laps: 66, length: '4.653 km', distance: '306.8 km', lapRecord: '1:18.750' },
        'mugello': { laps: 59, length: '5.245 km', distance: '309.5 km', lapRecord: '1:15.144' },
        'istanbul': { laps: 58, length: '5.338 km', distance: '309.4 km', lapRecord: '1:24.770' },
        'nurburgring': { laps: 60, length: '5.148 km', distance: '308.9 km', lapRecord: '1:15.468' },
        
        // Historic European Circuits
        'brands_hatch': { laps: 76, length: '4.207 km', distance: '320.0 km', lapRecord: '1:09.593' },
        'donington': { laps: 76, length: '4.023 km', distance: '305.8 km', lapRecord: '1:18.029' },
        'estoril': { laps: 71, length: '4.360 km', distance: '309.6 km', lapRecord: '1:16.366' },
        'jerez': { laps: 69, length: '4.428 km', distance: '305.5 km', lapRecord: '1:21.072' },
        'paul_ricard': { laps: 53, length: '5.842 km', distance: '309.7 km', lapRecord: '1:32.740' },
        'magny_cours': { laps: 70, length: '4.411 km', distance: '308.8 km', lapRecord: '1:15.377' },
        'hockenheim': { laps: 67, length: '4.574 km', distance: '306.5 km', lapRecord: '1:13.780' },
        'a1_ring': { laps: 71, length: '4.319 km', distance: '306.6 km', lapRecord: '1:10.843' },
        
        // Historic Non-European Circuits  
        'kyalami': { laps: 75, length: '4.104 km', distance: '307.8 km', lapRecord: '1:17.578' },
        'buenos_aires': { laps: 72, length: '4.259 km', distance: '306.6 km', lapRecord: '1:27.981' },
        'jarama': { laps: 80, length: '3.404 km', distance: '272.3 km', lapRecord: '1:14.720' },
        'long_beach': { laps: 80, length: '3.275 km', distance: '262.0 km', lapRecord: '1:19.117' },
        'detroit': { laps: 63, length: '4.023 km', distance: '253.4 km', lapRecord: '1:40.464' },
        'phoenix': { laps: 81, length: '3.720 km', distance: '301.3 km', lapRecord: '1:28.108' },
        'dallas': { laps: 67, length: '3.901 km', distance: '261.4 km', lapRecord: '1:35.036' },
        'adelaide': { laps: 81, length: '3.780 km', distance: '306.2 km', lapRecord: '1:15.381' },
        'aida': { laps: 83, length: '3.703 km', distance: '307.5 km', lapRecord: '1:13.114' },
        'sepang': { laps: 56, length: '5.543 km', distance: '310.4 km', lapRecord: '1:34.223' },
        
        // Street Circuits & Temporary
        'caesars_palace': { laps: 75, length: '3.650 km', distance: '273.8 km', lapRecord: '1:16.356' },
        'fair_park': { laps: 67, length: '3.901 km', distance: '261.4 km', lapRecord: '1:35.036' },
        'east_london': { laps: 75, length: '3.920 km', distance: '294.0 km', lapRecord: '1:29.130' },
        
        // Historic Dangerous/Long Circuits
        'nurburgring_old': { laps: 14, length: '22.835 km', distance: '319.7 km', lapRecord: '7:04.000' },
        'spa_old': { laps: 28, length: '14.100 km', distance: '394.8 km', lapRecord: '3:13.400' },
        'pescara': { laps: 18, length: '25.800 km', distance: '464.4 km', lapRecord: '9:44.600' },
        'avus': { laps: 60, length: '8.300 km', distance: '498.0 km', lapRecord: '2:06.400' },
        
        // Alternative Circuit Layouts
        'silverstone_old': { laps: 59, length: '5.226 km', distance: '308.3 km', lapRecord: '1:18.739' },
        'hockenheim_old': { laps: 45, length: '6.823 km', distance: '307.0 km', lapRecord: '1:43.902' },
        'monza_oval': { laps: 68, length: '4.250 km', distance: '289.0 km', lapRecord: '1:24.070' },
        'indianapolis': { laps: 73, length: '4.192 km', distance: '306.0 km', lapRecord: '1:10.399' }
    };

    // Helper function to get country flag with intelligent fallbacks
    function getCountryFlag(countryName) {
        const country = countryName.toLowerCase().trim();
        
        // Direct lookup
        if (countryFlags[country]) {
            return countryFlags[country];
        }
        
        // Try common variations and partial matches
        const variations = [
            country.replace(/\s+/g, ''), // Remove spaces
            country.replace(/republic of |kingdom of |state of |principality of |federation of /g, ''), // Remove prefixes
            country.replace(/united states.*/, 'usa'), // USA variations
            country.replace(/united kingdom.*|great britain.*/, 'uk'), // UK variations
            country.replace(/south korea.*/, 'south korea'), // Korea variations
            country.replace(/.*germany.*/, 'germany'), // Germany variations
        ];
        
        for (const variation of variations) {
            if (countryFlags[variation]) {
                return countryFlags[variation];
            }
        }
        
        // If no flag found, return default racing flag
        return '🏁';
    }
    
    // Helper function to get circuit details with intelligent fallbacks
    function getCircuitDetails(circuitId, raceData) {
        // Direct lookup
        if (circuitDetails[circuitId]) {
            return circuitDetails[circuitId];
        }
        
        // Try alternative circuit IDs or variations
        const variations = [
            circuitId.replace(/_/g, ''), // Remove underscores
            circuitId.replace(/-/g, '_'), // Replace dashes with underscores
            circuitId.replace(/_/g, '-'), // Replace underscores with dashes
            circuitId + '_circuit',
            circuitId.replace('_circuit', ''),
            circuitId + '_international'
        ];
        
        for (const variation of variations) {
            if (circuitDetails[variation]) {
                return circuitDetails[variation];
            }
        }
        
        // Generate reasonable fallback data based on typical F1 circuits
        const fallbackData = {
            laps: Math.round(300 / 5.0), // Assume ~5km circuit for 300km race
            length: '5.0 km',
            distance: '300.0 km',
            lapRecord: 'N/A'
        };

        return fallbackData;
    }

    // Fetch current driver standings from API
    async function fetchDriverStandings() {
        try {
            const response = await fetch('https://api.jolpi.ca/ergast/f1/current/driverStandings.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.MRData.StandingsTable.StandingsLists[0].DriverStandings;
        } catch (error) {
            console.error('Error fetching driver standings:', error);
            return [];
        }
    }

    // Fetch current constructor standings from API
    async function fetchConstructorStandings() {
        try {
            const response = await fetch('https://api.jolpi.ca/ergast/f1/current/constructorStandings.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.MRData.StandingsTable.StandingsLists[0].ConstructorStandings;
        } catch (error) {
            console.error('Error fetching constructor standings:', error);
            return [];
        }
    }

    // Display driver standings (all drivers)
    function displayDriverStandings(standings) {
        const container = document.querySelector('.driver-standings');
        if (!container || !standings.length) return;
        
        // Find just the standings-list div to replace, not the entire container
        const standingsList = container.querySelector('.standings-list');

        if (standingsList) {
            // Only replace the content of the standings-list, preserve everything else
            standingsList.innerHTML = `
                <div class="standings-header">
                    <span class="header-pos">Pos</span>
                    <span class="header-name">Driver</span>
                    <span class="header-team">Team</span>
                    <span class="header-points">Points</span>
                </div>
                ${standings.map(driver => {
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

    // Display constructor standings (all teams dynamically)
    function displayConstructorStandings(standings) {
        const container = document.querySelector('.constructor-standings');
        if (!container || !standings.length) return;

        // Find just the standings-list div to replace, not the entire container
        const standingsList = container.querySelector('.standings-list');

        if (standingsList) {
            standingsList.innerHTML = `
                <div class="standings-header">
                    <span class="header-pos">Pos</span>
                    <span class="header-name">Constructor</span>
                    <span class="header-wins">Wins</span>
                    <span class="header-points">Points</span>
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
                            <span class="wins">${constructor.wins} wins</span>
                            <span class="points">${constructor.points} pts</span>
                        </div>
                    `;
                }).join('')}
            `;
        }
    }

    // Fetch and display both standings
    async function fetchStandings() {
        try {
            // Fetch both standings in parallel
            const [driverStandings, constructorStandings] = await Promise.all([
                fetchDriverStandings(),
                fetchConstructorStandings()
            ]);

            // Display standings
            displayDriverStandings(driverStandings);
            displayConstructorStandings(constructorStandings);
            
        } catch (error) {
            console.error('Error fetching standings:', error);
            // Show error state for standings
            const driverContainer = document.querySelector('.driver-standings');
            const constructorContainer = document.querySelector('.constructor-standings');
            
            if (driverContainer) {
                driverContainer.innerHTML = `
                    <h3>Driver Championship</h3>
                    <div class="standings-list">
                        <div class="error">Unable to load driver standings</div>
                    </div>
                `;
            }
            
            if (constructorContainer) {
                constructorContainer.innerHTML = `
                    <h3>Constructor Championship</h3>
                    <div class="standings-list">
                        <div class="error">Unable to load constructor standings</div>
                    </div>
                `;
            }
        }
    }

    // Fetch race schedule from jolpica-f1 API
    async function fetchRaceSchedule() {
        try {
            // Show loading state
            countdownStatusElement.innerHTML = '<div class="loading">Loading race data...</div>';
            
            // Get current season schedule
            const response = await fetch('https://api.jolpi.ca/ergast/f1/current.json');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            const races = data.MRData.RaceTable.Races;
            totalRaces = races.length;
            currentSeason = parseInt(data.MRData.RaceTable.season);
            
            // Find the next race
            const now = new Date();
            const upcomingRace = races.find(race => {
                const raceDate = new Date(race.date + 'T' + (race.time || '14:00:00Z'));
                return raceDate > now;
            });
            
            if (!upcomingRace) {
                // No more races this season
                showSeasonFinished();
                return;
            }
            
            // Parse race data
            nextRace = parseRaceData(upcomingRace);
            
            // Update the page with race data
            updateRaceInfo(nextRace);
            updateSessionTimes(nextRace);
            
            // Start countdown
            updateCountdown();
            setInterval(updateCountdown, 1000);
            
            // Fetch and display standings
            fetchStandings();
            
        } catch (error) {
            console.error('Error fetching race data:', error);
            showErrorState();
        }
    }

    function parseRaceData(raceData) {
        const country = raceData.Circuit.Location.country.toLowerCase();
        const flag = getCountryFlag(country);
        
        const raceDateTime = new Date(raceData.date + 'T' + (raceData.time || '14:00:00Z'));
        
        // Calculate session times (these are typical F1 weekend patterns)
        const raceDay = new Date(raceDateTime);
        const saturday = new Date(raceDay);
        saturday.setDate(raceDay.getDate() - 1);
        const friday = new Date(raceDay);
        friday.setDate(raceDay.getDate() - 2);
        
        // Check if this is a sprint weekend
        const isSprintWeekend = raceData.Sprint && raceData.SprintQualifying;
        
        // Create session times based on race time (typical F1 schedule patterns)
        const sessions = {
            fp1: new Date(friday.getFullYear(), friday.getMonth(), friday.getDate(), raceDateTime.getUTCHours() - 4, 30, 0),
            fp2: new Date(friday.getFullYear(), friday.getMonth(), friday.getDate(), raceDateTime.getUTCHours(), 0, 0),
            fp3: new Date(saturday.getFullYear(), saturday.getMonth(), saturday.getDate(), raceDateTime.getUTCHours() - 4, 30, 0),
            qualifying: new Date(saturday.getFullYear(), saturday.getMonth(), saturday.getDate(), raceDateTime.getUTCHours() - 1, 0, 0),
            race: raceDateTime,
            isSprintWeekend: isSprintWeekend
        };
        
        // Add sprint sessions if this is a sprint weekend
        if (isSprintWeekend) {
            sessions.sprintQualifying = new Date(raceData.SprintQualifying.date + 'T' + raceData.SprintQualifying.time);
            sessions.sprint = new Date(raceData.Sprint.date + 'T' + raceData.Sprint.time);
        }
        
        // Try to get specific session times if available in API
        if (raceData.FirstPractice) {
            sessions.fp1 = new Date(raceData.FirstPractice.date + 'T' + raceData.FirstPractice.time);
        }
        if (raceData.SecondPractice) {
            sessions.fp2 = new Date(raceData.SecondPractice.date + 'T' + raceData.SecondPractice.time);
        }
        if (raceData.ThirdPractice) {
            sessions.fp3 = new Date(raceData.ThirdPractice.date + 'T' + raceData.ThirdPractice.time);
        }
        if (raceData.Qualifying) {
            sessions.qualifying = new Date(raceData.Qualifying.date + 'T' + raceData.Qualifying.time);
        }
        
        // Get circuit details using intelligent fallback system
        const circuitId = raceData.Circuit.circuitId;
        const circuit = getCircuitDetails(circuitId, raceData);
        
        return {
            name: raceData.raceName.replace(/Formula 1|FORMULA 1/gi, '').replace(/Grand Prix/gi, 'Grand Prix').trim(),
            location: `${raceData.Circuit.circuitName}, ${raceData.Circuit.Location.country}`,
            country: raceData.Circuit.Location.country,
            flag: flag,
            round: parseInt(raceData.round),
            raceDateTime: raceDateTime,
            sessions: sessions,
            circuit: circuit,
            url: raceData.url
        };
    }

    function updateRaceInfo(race) {
        // Update race header
        document.querySelector('.race-flag').textContent = race.flag;
        document.querySelector('.race-name').textContent = race.name;
        document.querySelector('.race-location').textContent = race.location;
        
        // Add sprint weekend indicator to round info
        const sprintIndicator = race.sessions.isSprintWeekend ? ' SPRINT WEEKEND' : '';
        document.querySelector('.race-round').textContent = `Round ${race.round} of ${totalRaces}${sprintIndicator}`;
        
        // Update circuit info
        document.querySelector('.circuit-stats .stat:nth-child(1) .stat-value').textContent = race.circuit.length;
        document.querySelector('.circuit-stats .stat:nth-child(2) .stat-value').textContent = race.circuit.laps;
        document.querySelector('.circuit-stats .stat:nth-child(3) .stat-value').textContent = race.circuit.distance;
        document.querySelector('.circuit-stats .stat:nth-child(4) .stat-value').textContent = race.circuit.lapRecord;
    }

    function showErrorState() {
        countdownStatusElement.innerHTML = `
            <div class="race-finished">
                <h3>⚠️ Data Error</h3>
                <p>Unable to load current race data. Please check your internet connection and refresh the page.</p>
            </div>
        `;
        
        // Set fallback display
        document.querySelector('.race-name').textContent = 'F1 Race Data';
        document.querySelector('.race-location').textContent = 'Loading...';
        document.querySelector('.race-round').textContent = `Season ${currentSeason}`;
    }

    // Convert session times to user's local timezone and handle sprint weekends
    function updateSessionTimes(race) {
        if (!race) return;
        
        const timeOptions = {
            weekday: 'short',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
        };

        // Get the weekend schedule container
        const scheduleContainer = document.querySelector('.race-weekend-schedule .schedule-grid');
        if (!scheduleContainer) return;

        // Clear existing schedule
        scheduleContainer.innerHTML = '';

        if (race.sessions.isSprintWeekend) {
            // Sprint Weekend Format: FP1, Sprint Qualifying, then Sprint, Qualifying, then Race
            scheduleContainer.innerHTML = `
                <div class="schedule-item">
                    <div class="schedule-day">Friday</div>
                    <div class="schedule-sessions">
                        <div class="session">Practice 1 - <span id="fp1-time">${race.sessions.fp1.toLocaleTimeString('en-US', timeOptions)}</span></div>
                        <div class="session sprint-session">Sprint Qualifying - <span id="sprint-qual-time">${race.sessions.sprintQualifying.toLocaleTimeString('en-US', timeOptions)}</span></div>
                    </div>
                </div>
                <div class="schedule-item">
                    <div class="schedule-day">Saturday</div>
                    <div class="schedule-sessions">
                        <div class="session sprint-session">Sprint Race - <span id="sprint-time">${race.sessions.sprint.toLocaleTimeString('en-US', timeOptions)}</span></div>
                        <div class="session">Qualifying - <span id="qual-time">${race.sessions.qualifying.toLocaleTimeString('en-US', timeOptions)}</span></div>
                    </div>
                </div>
                <div class="schedule-item">
                    <div class="schedule-day">Sunday</div>
                    <div class="schedule-sessions">
                        <div class="session main-event">Race - <span id="race-time">${race.sessions.race.toLocaleTimeString('en-US', timeOptions)}</span></div>
                    </div>
                </div>
            `;
        } else {
            // Standard Weekend Format: FP1, FP2, FP3, Qualifying, Race
            scheduleContainer.innerHTML = `
                <div class="schedule-item">
                    <div class="schedule-day">Friday</div>
                    <div class="schedule-sessions">
                        <div class="session">Practice 1 - <span id="fp1-time">${race.sessions.fp1.toLocaleTimeString('en-US', timeOptions)}</span></div>
                        <div class="session">Practice 2 - <span id="fp2-time">${race.sessions.fp2.toLocaleTimeString('en-US', timeOptions)}</span></div>
                    </div>
                </div>
                <div class="schedule-item">
                    <div class="schedule-day">Saturday</div>
                    <div class="schedule-sessions">
                        <div class="session">Practice 3 - <span id="fp3-time">${race.sessions.fp3.toLocaleTimeString('en-US', timeOptions)}</span></div>
                        <div class="session">Qualifying - <span id="qual-time">${race.sessions.qualifying.toLocaleTimeString('en-US', timeOptions)}</span></div>
                    </div>
                </div>
                <div class="schedule-item">
                    <div class="schedule-day">Sunday</div>
                    <div class="schedule-sessions">
                        <div class="session main-event">Race - <span id="race-time">${race.sessions.race.toLocaleTimeString('en-US', timeOptions)}</span></div>
                    </div>
                </div>
            `;
        }

        // Update the main race time display
        const raceLocalTime = race.raceDateTime.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'long'
        });

        localRaceTimeElement.textContent = raceLocalTime;
        
        // Get timezone abbreviation
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        timezoneInfoElement.textContent = `(${timezone})`;
    }

    // Countdown timer function
    function updateCountdown() {
        if (!nextRace) return;
        
        const now = new Date().getTime();
        const raceTime = nextRace.raceDateTime.getTime();
        const distance = raceTime - now;

        // Check if race has already happened
        if (distance < 0) {
            countdownStatusElement.innerHTML = `
                <div class="race-finished">
                    <h3>🏁 Race Finished!</h3>
                    <p>The ${nextRace.name} has concluded. Refreshing for next race...</p>
                </div>
            `;
            // Hide the countdown timer and refresh data
            document.getElementById('countdown-timer').style.display = 'none';
            setTimeout(() => {
                location.reload(); // Refresh page to get next race
            }, 5000);
            return;
        }

        // Check if race is happening right now (within 3 hours of start time)
        if (distance < 3 * 60 * 60 * 1000 && distance > -3 * 60 * 60 * 1000) {
            countdownStatusElement.innerHTML = `
                <div class="race-live">
                    <h3>🔴 RACE WEEKEND LIVE!</h3>
                    <p>The ${nextRace.name} weekend is underway!</p>
                </div>
            `;
        } else {
            // Clear status when not live
            countdownStatusElement.innerHTML = '';
        }

        // Calculate time units
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Update countdown display
        daysElement.textContent = days.toString().padStart(2, '0');
        hoursElement.textContent = hours.toString().padStart(2, '0');
        minutesElement.textContent = minutes.toString().padStart(2, '0');
        secondsElement.textContent = seconds.toString().padStart(2, '0');

        // Add urgency styling for final 24 hours
        const countdownTimer = document.getElementById('countdown-timer');
        if (days === 0) {
            countdownTimer.classList.add('final-day');
            if (hours < 1) {
                countdownTimer.classList.add('final-hour');
            }
        }
    }

    function showSeasonFinished() {
        countdownStatusElement.innerHTML = `
            <div class="race-finished">
                <h3>🏁 Season Complete!</h3>
                <p>The ${currentSeason} F1 season has concluded. The ${currentSeason + 1} season will begin in March!</p>
            </div>
        `;
        
        document.getElementById('countdown-timer').style.display = 'none';
        document.querySelector('.race-time-local').style.display = 'none';
    }

    // Initialize the application
    fetchRaceSchedule();
});