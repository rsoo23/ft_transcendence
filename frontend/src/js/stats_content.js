import { loadUserAvatar } from "./settings/upload_avatar.js";
import { getRequest } from "./network_utils/api_requests.js";

export async function loadStatsPage() {
    try {
        // Get match stats from your API
        // console.log("Fetching match stats...");
        const matchStats = await getRequest('/api/game_stats/match-stats/');
        // console.log("Received match stats:", matchStats);
        
        const container = document.querySelector('.scrollable-container');
        // if (!container) {
        //     console.error("Could not find .scrollable-container");
        //     return;
        // }
        
        // if (!matchStats || matchStats.length === 0) {
        //     console.log("No match stats found");
        //     container.innerHTML = '<div class="no-matches">No matches found</div>';
        //     return;
        // }
        
        container.innerHTML = ''; // Clear existing content
        
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
    const ampm = hours >= 12 ? 'pm' : 'am';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, '0');
    return `${formattedHours}:${formattedMinutes}${ampm}`;
}

function createDateSection(date, matches) {
    const section = document.createElement('div');
    section.className = 'record-section';
    
    // Add date header
    const dateDiv = document.createElement('div');
    dateDiv.className = 'date';
    dateDiv.textContent = date;
    section.appendChild(dateDiv);
    
    // Add match records
    matches.forEach(match => {
        const matchRecord = createMatchRecord(match);
        section.appendChild(matchRecord);
    });
    
    return section;
}

function createMatchRecord(match) {
    const recordDiv = document.createElement('div');
    recordDiv.className = 'match-record';
    
    // Create player 1 section
    const player1Section = createPlayerSection(match.pong_match?.player1, 'player1');
    
    // Create score section
    const scoreSection = createScoreSection(match);
    
    // Create player 2 section
    const player2Section = createPlayerSection(match.pong_match?.player2, 'player2');
    
    // Append all sections
    recordDiv.appendChild(player1Section);
    recordDiv.appendChild(scoreSection);
    recordDiv.appendChild(player2Section);
    
    return recordDiv;
}

function createPlayerSection(player, playerClass) {
    const section = document.createElement('div');
    section.className = 'avatar-section';
    
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
    name.textContent = player?.username || 'Unknown Player';
    
    section.appendChild(avatarContainer);
    section.appendChild(name);
    
    return section;
}

function createScoreSection(match) {
    const section = document.createElement('div');
    section.className = 'score-time-section';
    
    const score = document.createElement('div');
    score.className = 'score';
    score.textContent = `${match.pong_match?.p1_score || 0} - ${match.pong_match?.p2_score || 0}`;
    
    const time = document.createElement('div');
    time.className = 'time';
    time.textContent = formatTime(new Date(match.created_at));
    
    section.appendChild(score);
    section.appendChild(time);
    
    return section;
}