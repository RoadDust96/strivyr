// F1 Countdown Timer
document.addEventListener('DOMContentLoaded', function() {
    // Initialize with loading state
    let nextRace = null;

    // DOM elements
    const daysElement = document.getElementById('days');
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');
    const localRaceTimeElement = document.getElementById('local-race-time');
    const timezoneInfoElement = document.getElementById('timezone-info');
    const countdownStatusElement = document.getElementById('countdown-status');

    // Country flags mapping
    const countryFlags = {
        'australia': 'AU',
        'bahrain': 'BH', 
        'china': 'CN',
        'japan': 'JP',
        'saudi arabia': 'SA',
        'miami': 'US',
        'italy': 'IT',
        'monaco': 'MC',
        'spain': 'ES',
        'canada': 'CA',
        'austria': 'AT',
        'great britain': 'GB',
        'uk': 'GB',
        'belgium': 'BE',
        'netherlands': 'NL',
        'azerbaijan': 'AZ',
        'singapore': 'SG',
        'usa': 'US',
        'united states': 'US',
        'mexico': 'MX',
        'brazil': 'BR',
        'qatar': 'QA',
        'abu dhabi': 'AE',
        'uae': 'AE'
    };

    // Circuit information mapping for additional details
    const circuitDetails = {
        'albert_park': { laps: 58, length: '5.278 km', distance: '305.9 km' },
        'shanghai': { laps: 56, length: '5.451 km', distance: '305.1 km' },
        'suzuka': { laps: 53, length: '5.807 km', distance: '307.5 km' },
        'bahrain': { laps: 57, length: '5.412 km', distance: '308.4 km' },
        'jeddah': { laps: 50, length: '6.174 km', distance: '308.5 km' },
        'miami': { laps: 57, length: '5.412 km', distance: '308.3 km' },
        'imola': { laps: 63, length: '4.909 km', distance: '309.0 km' },
        'monaco': { laps: 78, length: '3.337 km', distance: '260.3 km' },
        'catalunya': { laps: 66, length: '4.675 km', distance: '308.4 km' },
        'montreal': { laps: 70, length: '4.361 km', distance: '305.3 km' },
        'red_bull_ring': { laps: 71, length: '4.318 km', distance: '306.4 km' },
        'silverstone': { laps: 52, length: '5.891 km', distance: '306.2 km' },
        'spa': { laps: 44, length: '7.004 km', distance: '308.1 km' },
        'zandvoort': { laps: 72, length: '4.259 km', distance: '306.6 km' },
        'monza': { laps: 53, length: '5.793 km', distance: '306.7 km' },
        'baku': { laps: 51, length: '6.003 km', distance: '306.0 km' },
        'marina_bay': { laps: 62, length: '4.928 km', distance: '305.3 km' },
        'cota': { laps: 56, length: '5.513 km', distance: '308.4 km' },
        'rodriguez': { laps: 71, length: '4.304 km', distance: '305.4 km' },
        'interlagos': { laps: 71, length: '4.309 km', distance: '305.9 km' },
        'losail': { laps: 57, length: '5.380 km', distance: '306.7 km' },
        'yas_marina': { laps: 58, length: '5.281 km', distance: '306.2 km' }
    };

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
            
        } catch (error) {
            console.error('Error fetching race data:', error);
            showErrorState();
        }
    }

    function parseRaceData(raceData) {
        const country = raceData.Circuit.Location.country.toLowerCase();
        const flag = countryFlags[country] || '🏁';
        
        const raceDateTime = new Date(raceData.date + 'T' + (raceData.time || '14:00:00Z'));
        
        // Calculate session times (these are typical F1 weekend patterns)
        const raceDay = new Date(raceDateTime);
        const saturday = new Date(raceDay);
        saturday.setDate(raceDay.getDate() - 1);
        const friday = new Date(raceDay);
        friday.setDate(raceDay.getDate() - 2);
        
        // Create session times based on race time (typical F1 schedule patterns)
        const sessions = {
            fp1: new Date(friday.getFullYear(), friday.getMonth(), friday.getDate(), raceDateTime.getUTCHours() - 4, 30, 0),
            fp2: new Date(friday.getFullYear(), friday.getMonth(), friday.getDate(), raceDateTime.getUTCHours(), 0, 0),
            fp3: new Date(saturday.getFullYear(), saturday.getMonth(), saturday.getDate(), raceDateTime.getUTCHours() - 4, 30, 0),
            qualifying: new Date(saturday.getFullYear(), saturday.getMonth(), saturday.getDate(), raceDateTime.getUTCHours() - 1, 0, 0),
            race: raceDateTime
        };
        
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
        
        // Get circuit details
        const circuitId = raceData.Circuit.circuitId;
        const circuit = circuitDetails[circuitId] || {
            laps: '?',
            length: '? km', 
            distance: '? km'
        };
        
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
        document.querySelector('.race-round').textContent = `Round ${race.round} of 24`;
        
        // Update circuit info
        document.querySelector('.circuit-stats .stat:nth-child(1) .stat-value').textContent = race.circuit.length;
        document.querySelector('.circuit-stats .stat:nth-child(2) .stat-value').textContent = race.circuit.laps;
        document.querySelector('.circuit-stats .stat:nth-child(3) .stat-value').textContent = race.circuit.distance;
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
        document.querySelector('.race-round').textContent = 'Season 2025';
    }

    // Convert session times to user's local timezone
    function updateSessionTimes(race) {
        if (!race) return;
        
        const timeOptions = {
            weekday: 'short',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
        };

        // Update all session times to local timezone
        document.getElementById('fp1-time').textContent = race.sessions.fp1.toLocaleTimeString('en-US', timeOptions);
        document.getElementById('fp2-time').textContent = race.sessions.fp2.toLocaleTimeString('en-US', timeOptions);
        document.getElementById('fp3-time').textContent = race.sessions.fp3.toLocaleTimeString('en-US', timeOptions);
        document.getElementById('qual-time').textContent = race.sessions.qualifying.toLocaleTimeString('en-US', timeOptions);
        document.getElementById('race-time').textContent = race.sessions.race.toLocaleTimeString('en-US', timeOptions);

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
                <p>The 2025 F1 season has concluded. The 2026 season will begin in March!</p>
            </div>
        `;
        
        document.getElementById('countdown-timer').style.display = 'none';
        document.querySelector('.race-time-local').style.display = 'none';
    }

    // Initialize the application
    fetchRaceSchedule();
});