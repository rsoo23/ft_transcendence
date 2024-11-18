import { loadUserAvatar } from "./settings/upload_avatar.js";
import { getRequest } from "./network_utils/api_requests.js";
import { currentUserInfo } from "./global_vars.js";

export async function loadStatsPage() {
    try {
        // Get match stats from your API
        // console.log("Fetching match stats...");
        const matchStats = await getRequest('/api/game_stats/match-stats/');
        const container = document.querySelector('.scrollable-container');
        // if (!container) {
        //     console.error("Could not find .scrollable-container");
        //     return;
        // }
        
        container.innerHTML = ''; // Clear existing content

        if (!matchStats || matchStats.length === 0) {
            const noMatchesDiv = document.createElement('div');
            noMatchesDiv.className = 'no-matches';
            noMatchesDiv.style.textAlign = 'center';
            noMatchesDiv.style.padding = '2rem';
            noMatchesDiv.style.color = 'var(--charcoal-300)';
            noMatchesDiv.textContent = 'No match history found';
            container.appendChild(noMatchesDiv);
            return;
        }

        // Group matches by date
        const matchesByDate = groupMatchesByDate(matchStats);
        // console.log("Grouped matches:", matchesByDate);
        
        // Create sections for each date
        for (const [date, matches] of Object.entries(matchesByDate)) {
            const section = createDateSection(date, matches);
            container.appendChild(section);
        }
    } catch (error) {
        console.error('Error loading match history:', error);
    }
}

function groupMatchesByDate(matches) {
    const grouped = {};
    matches.forEach(match => {
        const date = new Date(match.created_at);
        const dateKey = formatDate(date);
        if (!grouped[dateKey]) {
            grouped[dateKey] = [];
        }
        grouped[dateKey].push(match);
    });
    return grouped;
}

function formatDate(date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}, ${days[date.getDay()]}`;
}

function formatTime(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
	// more than 12 is PM, less than 12 is AM
    const ampm = hours >= 12 ? 'pm' : 'am';
	// Convert to 12 hour format
    const formattedHours = hours % 12 || 12;
	// minutes always have 2 digits
    const formattedMinutes = minutes.toString().padStart(2, '0');
	// e.g. 13:05 to 1:05 PM
    return `${formattedHours}:${formattedMinutes}${ampm}`;
}

function createDateSection(date, matches) {
    const section = document.createElement('div');
    section.className = 'record-section';
    
    // Date header
    const dateDiv = document.createElement('div');
    dateDiv.className = 'date';
    dateDiv.textContent = date;
    section.appendChild(dateDiv);
    
    // Match records
    matches.forEach(match => {
        const matchRecord = createMatchRecord(match);
        section.appendChild(matchRecord);
    });
    
    return section;
}

function createMatchRecord(match) {
    const recordDiv = document.createElement('div');
    recordDiv.className = 'match-record';
    
    // Determine if current user was player1 or player2
    const isPlayer1 = match.pong_match?.player1?.id === currentUserInfo.id;
    
    // Create player sections based on whether current user was player1 or player2
    const userSection = createPlayerSection(
        isPlayer1 ? match.pong_match?.player1 : match.pong_match?.player2,
		// ?: is a ternary operator (boolean value: player 1 or player 2)
		// ?. optional chaining operator (if the value before the ?. is null or undefined, the expression after the ?. is not evaluated)
        'current-player'
    );
    
    const opponentSection = createPlayerSection(
        isPlayer1 ? match.pong_match?.player2 : match.pong_match?.player1,
        'opponent'
    );
    
    // Create score section with scores arranged based on player position
    const scoreSection = createScoreSection(match, isPlayer1);
    
    // Always show current user on the left
    recordDiv.appendChild(userSection);
    recordDiv.appendChild(scoreSection);
    recordDiv.appendChild(opponentSection);
    
    return recordDiv;
}

function createPlayerSection(player, playerClass) {
    const section = document.createElement('div');
    section.className = 'game-stats-avatar-section';
    
    const avatarContainer = document.createElement('div');
    avatarContainer.className = 'avatar-container';
    
    const avatar = document.createElement('img');
    avatar.className = 'avatar';
    avatar.alt = 'avatar';
    avatar.src = '/static/images/kirby.png'; // Default avatar
    if (player?.id) {
        loadUserAvatar(avatar, player.id);
    }
    
    const statusBadge = document.createElement('div');
    statusBadge.className = 'status-badge';
    
    avatarContainer.appendChild(avatar);
    avatarContainer.appendChild(statusBadge);
    
    const name = document.createElement('div');
    name.className = 'avatar-name';
    const playerName = player?.username || 'Unknown Player';
	name.textContent = playerName;
	name.title = playerName; // Show full name on hover, use HTML title attribute
    
    section.appendChild(avatarContainer);
    section.appendChild(name);
    
    return section;
}

function createScoreSection(match, isPlayer1) {
    const section = document.createElement('div');
    section.className = 'score-time-section';
    
    const score = document.createElement('div');
    score.className = 'score';
    
    // Display scores based on whether current user was player1 or player2
    const userScore = isPlayer1 ? match.pong_match?.p1_score : match.pong_match?.p2_score;
    const opponentScore = isPlayer1 ? match.pong_match?.p2_score : match.pong_match?.p1_score;
    score.textContent = `${userScore || 0} - ${opponentScore || 0}`;
    
    // Win/loss styling
    if (userScore > opponentScore) {
        score.style.backgroundColor = 'var(--teal-500)';
    } else {
        score.style.backgroundColor = 'var(--magenta-500)';
    }
    
    const time = document.createElement('div');
    time.className = 'time';
    time.textContent = formatTime(new Date(match.created_at));
    
    section.appendChild(score);
    section.appendChild(time);
    
    return section;
}