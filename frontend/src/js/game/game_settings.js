
export let gameScore = 5
export let ballSpeedIncrement = 25
export let isPowerupChecked = false

export function setGameSettingsInfo(pGameScore=5, pBallSpeedIncrement=25, pIsPowerupChecked=false) {
  gameScore = pGameScore
  ballSpeedIncrement = pBallSpeedIncrement
  isPowerupChecked = pIsPowerupChecked
}

export function initGameSettings() {
  setGameSettingsInfo()
  const gameScoreSlider = document.getElementById('game-score');
  const ballSpeedSlider = document.getElementById('ball-speed');
  const gameScoreValue = document.getElementById('game-score-value');
  const ballSpeedValue = document.getElementById('ball-speed-value');

  const powerupsCheckbox = document.getElementById('powerups-toggle-input');

  const resetToDefault = document.getElementById('reset-to-default');

  gameScoreSlider.addEventListener('input', () => {
    gameScoreValue.textContent = gameScoreSlider.value;
    gameScore = gameScoreSlider.value;
  });

  ballSpeedSlider.addEventListener('input', () => {
    ballSpeedValue.textContent = ballSpeedSlider.value;
    ballSpeedIncrement = ballSpeedSlider.value;
  });

  powerupsCheckbox.addEventListener('change', () => {
    isPowerupChecked = powerupsCheckbox.checked;
  });

  resetToDefault.addEventListener('click', () => {
    setGameSettingsInfo()
    gameScoreSlider.value = gameScore;
    ballSpeedSlider.value = ballSpeedIncrement;
    powerupsCheckbox.checked = isPowerupChecked;
    gameScoreValue.textContent = gameScore;
    ballSpeedValue.textContent = ballSpeedIncrement;
  });
}

export function getGameSettingsInfo() {
  return {
    game_score: gameScore,
    ball_speed_increment: ballSpeedIncrement,
    is_powerup_checked: isPowerupChecked,
  }
}
