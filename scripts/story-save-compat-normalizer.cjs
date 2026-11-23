'use strict';
// Compatibility normalizer for a future production save bridge.
// Never mutates caller data. Does not replace the current game save handlers.
const ENDING_IDS = Object.freeze(['hero','survivor','sacrifice','traitor','secret','light','shadow','rebuild','guardian']);
const PART_IDS = new Set(['part1','part2','part3']);
const validEndings = new Set(ENDING_IDS);
function normalizeStorySaveFields(save) {
  if (!save || typeof save !== 'object' || Array.isArray(save)) throw new TypeError('Expected save object');
  const copy = structuredClone(save);
  if (Object.hasOwn(copy,'part') && !PART_IDS.has(copy.part)) throw new RangeError('Unknown part');
  if (Object.hasOwn(copy,'sceneIdx') && (!Number.isInteger(copy.sceneIdx) || copy.sceneIdx < 0 || copy.sceneIdx > 35)) throw new RangeError('Invalid sceneIdx');
  if (Object.hasOwn(copy,'endingsSeen')) {
    if (!Array.isArray(copy.endingsSeen)) throw new TypeError('endingsSeen must be array');
    copy.endingsSeen = [...new Set(copy.endingsSeen.filter(id=>validEndings.has(id)))];
  }
  return copy;
}
module.exports={ENDING_IDS,normalizeStorySaveFields};
