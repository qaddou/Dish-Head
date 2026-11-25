// =====================================================================
//  Boot
// =====================================================================
function boot() {
  Settings.load(); fitCanvas(); Save.load(); if (Save.d.players !== 2) Save.d.players = 1;
  Film.init(); Paper.make(); Input.init();
  setScene(new TitleScene());
  try { cv.focus({ preventScroll: true }); } catch (e) { }
  requestAnimationFrame(loop);
  try {
    if (document.fonts && document.fonts.load) Promise.all([document.fonts.load('40px Ultra'), document.fonts.load('20px Limelight'), document.fonts.load('16px "Libre Baskerville"')]).then(() => { PaintCache.clear(); Portraits.clear(); }).catch(() => { });
  } catch (e) { }
  document.addEventListener('visibilitychange', () => { if (document.hidden && scene instanceof Stage && !scene.pauseMenu && (scene.state === 'play' || scene.state === 'intro')) scene.openPause(); });
  window.LO = { get scene() { return scene; }, setScene, go, startBoss, startLevel, startRush, Save, Settings, BOSSES, LEVELS, WORLDS, MapScene, ShopScene, EquipScene, PracticeScene, RushScene, SettingsScene, ControlsScene, MainMenu, TitleScene, ResultsScene, StoryScene, CreditsScene, Stage, Input, Music, AudioSys, AchievementsScene, Achieve, perf: () => perfAvg };
}
boot();
