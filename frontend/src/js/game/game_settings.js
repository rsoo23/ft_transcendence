
export let gameScore = 5
export let ballSpeedIncrement = 25
export let isPowerupChecked = false

export function initGameSettings() {
  const gameScoreSlider = document.getElementById('game-score');
  const ballSpeedSlider = document.getElementById('ball-speed');
  const gameScoreValue = document.getElementById('game-score-value');
  const ballSpeedValue = document.getElementById('ball-speed-value');

  const powerupsCheckbox = document.getElementById('powerups-toggle-input');

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
}
