// Character performance styles are isolated from the Android preparation pipeline.
module.exports = function injectCharacterPerformance(html) {
  if (!html.includes('</body>')) throw new Error('Missing body for character performance styles.');
  if (html.includes('id="carthage-character-performance-style"')) {
    throw new Error('Character performance styles are already installed.');
  }
  const styles = `<style id="carthage-character-performance-style">
@keyframes carthageStageIdle{0%,100%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(0,-1px,0) scale(1.006)}}
@keyframes carthageStageGrief{0%,100%{transform:scale(1.012) translate3d(0,0,0) rotate(0)}50%{transform:scale(1.018) translate3d(-1px,1px,0) rotate(-.22deg)}}
@keyframes carthageStageTension{0%,100%{transform:scale(1.018) translate3d(0,0,0)}25%{transform:scale(1.02) translate3d(-1px,0,0)}75%{transform:scale(1.018) translate3d(1px,-1px,0)}}
@keyframes carthageStageMemory{0%,100%{transform:scale(1.012);filter:brightness(1)}50%{transform:scale(1.024);filter:brightness(1.045)}}
.stage-slide .stage-breath{animation:carthageStageIdle 4.8s ease-in-out infinite;transform-origin:50% 78%;will-change:transform}
.stage-slide:has(.tear-drop) .stage-breath{animation:carthageStageGrief 3.8s ease-in-out infinite;transform-origin:50% 76%}
.stage-slide.expression-shake .stage-breath{animation:carthageStageTension .65s ease-in-out infinite;transform-origin:50% 76%}
.stage-slide:has(.candle-flame) .stage-breath{animation:carthageStageMemory 6.2s ease-in-out infinite;transform-origin:50% 76%}
@media(prefers-reduced-motion:reduce){.stage-slide .stage-breath{animation:none!important;transform:none!important;will-change:auto}}
</style>`;
  return html.replace('</body>', styles + '</body>');
};
