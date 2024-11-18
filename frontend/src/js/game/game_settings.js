
export function initGameSettings() {
  const gameScoreSlider = document.getElementById('game-score');
  const ballSpeedSlider = document.getElementById('ball-speed');
  const gameScoreValue = document.getElementById('game-score-value');
  const ballSpeedValue = document.getElementById('ball-speed-value');

  gameScoreSlider.addEventListener('input', () => {
    gameScoreValue.textContent = gameScoreSlider.value;
  });
  ballSpeedSlider.addEventListener('input', () => {
    ballSpeedValue.textContent = ballSpeedSlider.value;
  });
}
