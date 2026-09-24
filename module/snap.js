import { snapIsActive } from './control.js';
import { buildCollisionGroups, isGridless } from './geometry.js';
import { calculateOffsets } from './layout.js';
import { applyVisualOffset, resetVisualOffset } from './render.js';
import { getSetting } from './settings.js';
const POSITION_EPSILON = 0.51;
const MOVEMENT_FIELDS = new Set(['x', 'y', 'elevation', 'width', 'height', 'shape']);
let SCATTERED_TOKENS = new Map();
let LAYOUT_REFRESH_QUEUED = false;
let QUEUED_SCENE;
export function refreshScatter(scene = canvas?.scene) {
    if (!snapIsActive()) {
        resetScatteredTokens();
        return;
    }
    queueLayoutRefresh(scene);
}
export function refreshAll(groups = [...SCATTERED_TOKENS.keys()]) {
    refreshScatter();
    for (const token of groups.flat())
        token.object?.refresh();
}
function snapToken(token, options) {
    const grid = getSceneGrid(token);
    if (isGridless(grid?.type) || !snapIsActive()) {
        resetScatteredTokens();
        return;
    }
    if (shouldRecalculateFromRefresh(token, options))
        queueLayoutRefresh(token.scene);
    const offset = SCATTERED_TOKENS.get(token.document);
    if (!offset || isMoving(token))
        return;
    applyVisualOffset(token, offset, {
        refreshBorder: !!(options.refreshBorder || options.refreshShape || options.refreshSize),
    });
}
function recalculateScene(scene) {
    const grid = getSceneGridForScene(scene);
    if (!scene || isGridless(grid?.type) || !snapIsActive()) {
        resetScatteredTokens();
        return;
    }
    const candidates = getCollisionCandidates(scene, grid);
    const groups = buildCollisionGroups(
        candidates,
        grid,
        scene.dimensions.size,
        getSetting('ignoreElevation'),
        getSetting('collideDifferentSizes'),
        getSetting('completeOverlap')
    );
    const nextOffsets = new Map();
    for (const group of groups) {
        const offsets = calculateOffsets(group, scene.dimensions.size, getSetting('scatter'));
        for (const groupToken of group) {
            const offset = offsets.get(groupToken);
            if (offset)
                nextOffsets.set(groupToken, offset);
        }
    }
    for (const oldToken of SCATTERED_TOKENS.keys()) {
        if (!nextOffsets.has(oldToken))
            resetTokenDocument(oldToken);
    }
    for (const [tokenDocument, offset] of nextOffsets) {
        const previous = SCATTERED_TOKENS.get(tokenDocument);
        const offsetChanged = !previous || !sameOffset(previous, offset);
        const object = tokenDocument.object;
        if (object && !isMoving(object))
            applyVisualOffset(object, offset, { refreshBorder: offsetChanged });
    }
    SCATTERED_TOKENS = nextOffsets;
}
function getCollisionCandidates(scene, grid) {
    const ignoreDead = getSetting('ignoreDead');
    const ignoreMisaligned = getSetting('ignoreMisaligned');
    return scene.tokens.contents.filter((token) => !!token.object &&
        !token.object.destroyed &&
        token.object.visible !== false &&
        !(ignoreDead && isTokenDefeated(token)) &&
        !(ignoreMisaligned && tokenIsMisaligned(token, grid)));
}
function getSceneGrid(token) {
    return canvas?.grid ?? token.scene?.grid ?? game.scenes.current?.grid;
}
function getSceneGridForScene(scene) {
    return canvas?.scene === scene ? canvas?.grid : scene?.grid;
}
function resetTokenDocument(token) {
    if (token.object)
        resetVisualOffset(token.object);
}
function resetScatteredTokens() {
    for (const token of SCATTERED_TOKENS.keys())
        resetTokenDocument(token);
    SCATTERED_TOKENS.clear();
}
function isMoving(token) {
    const contexts = token.animationContexts ? [...token.animationContexts.values()] : [];
    const animation = contexts.find((ctx) => ctx.to);
    return (!!animation &&
        animation.to &&
        ((animation.to.x ?? token.x) !== token.x || (animation.to.y ?? token.y) !== token.y));
}
function isTokenDefeated(token) {
    if (token.combatant?.defeated)
        return true;
    const defeatedStatus = CONFIG.specialStatusEffects?.DEFEATED ?? 'dead';
    if (token.hasStatusEffect?.(defeatedStatus))
        return true;
    return ['dead', 'dying', 'unconscious', 'incapacitated'].some((s) => token.hasStatusEffect?.(s));
}
function tokenIsMisaligned(token, grid) {
    const snapped = token.getSnappedPosition?.({
        x: token.x,
        y: token.y,
        width: token.width,
        height: token.height,
        elevation: token.elevation,
        shape: token.shape,
    });
    if (snapped)
        return !samePosition(token, snapped);
    if (!grid?.isSquare || !grid?.size)
        return false;
    const size = grid.size ?? 1;
    return !gridCoordinateIsAligned(token.x, size) || !gridCoordinateIsAligned(token.y, size);
}
function samePosition(a, b) {
    return nearlyEqual(a.x, b.x) && nearlyEqual(a.y, b.y);
}
function gridCoordinateIsAligned(value, size) {
    const remainder = ((value % size) + size) % size;
    return nearlyEqual(remainder, 0) || nearlyEqual(remainder, size);
}
function nearlyEqual(a, b, epsilon = POSITION_EPSILON) {
    return Math.abs(a - b) <= epsilon;
}
function sameOffset(a, b) {
    return nearlyEqual(a.x, b.x) && nearlyEqual(a.y, b.y);
}
function shouldRecalculateFromRefresh(token, options) {
    if (isMoving(token))
        return false;
    if (!options.refreshPosition && !options.refreshSize && !options.refreshShape && !options.refreshElevation) {
        return false;
    }
    return true;
}
function queueLayoutRefresh(scene = canvas?.scene) {
    QUEUED_SCENE = scene ?? QUEUED_SCENE;
    if (LAYOUT_REFRESH_QUEUED)
        return;
    LAYOUT_REFRESH_QUEUED = true;
    nextFrame(() => {
        LAYOUT_REFRESH_QUEUED = false;
        const scene = QUEUED_SCENE;
        QUEUED_SCENE = undefined;
        recalculateScene(scene ?? canvas?.scene);
    });
}
function afterTokenMovement(document, movement) {
    if (movement.pending?.waypoints?.length)
        return;
    const movementId = movement.id;
    nextFrame(() => {
        const object = document.object;
        const currentMovement = document.movement ?? object?.document?.movement;
        if (currentMovement?.id && currentMovement.id !== movementId)
            return;
        const animationEnded = currentMovement?.animation?.ended ??
            movement.animation?.ended ??
            object?.movementAnimationPromise ??
            Promise.resolve();
        Promise.resolve(animationEnded).finally(() => {
            nextFrame(() => {
                const latestMovement = document.movement ?? object?.document?.movement;
                if (latestMovement?.id && latestMovement.id !== movementId)
                    return;
                queueLayoutRefresh(object?.scene ?? canvas?.scene);
            });
        });
    });
}
function documentAffectsLayout(changed) {
    if (Object.keys(changed).some((key) => MOVEMENT_FIELDS.has(key)))
        return true;
    if ('hidden' in changed)
        return true;
    if ('flags' in changed)
        return true;
    return false;
}
function nextFrame(callback) {
    if (typeof requestAnimationFrame === 'function')
        requestAnimationFrame(callback);
    else
        setTimeout(callback, 0);
}
function onActiveEffectChange() {
    if (getSetting('ignoreDead'))
        queueLayoutRefresh(canvas?.scene);
}
Hooks.on('refreshToken', snapToken);
Hooks.on('moveToken', afterTokenMovement);
Hooks.on('createToken', (document) => queueLayoutRefresh(document.object?.scene ?? canvas?.scene));
Hooks.on('deleteToken', (document) => {
    resetTokenDocument(document);
    SCATTERED_TOKENS.delete(document);
    queueLayoutRefresh(canvas?.scene);
});
Hooks.on('updateToken', (document, changed, options = {}) => {
    if (options._movement?.[document.id])
        return;
    if (documentAffectsLayout(changed))
        queueLayoutRefresh(document.object?.scene ?? canvas?.scene);
});
Hooks.on('canvasReady', () => queueLayoutRefresh(canvas?.scene));
Hooks.on('createActiveEffect', onActiveEffectChange);
Hooks.on('deleteActiveEffect', onActiveEffectChange);
Hooks.on('updateActiveEffect', onActiveEffectChange);
Hooks.on('updateActor', (actor, changed) => {
    if (!getSetting('ignoreDead'))
        return;
    if ('system' in changed || 'statuses' in changed) {
        queueLayoutRefresh(canvas?.scene);
    }
});
Hooks.on('canvasTearDown', () => {
    SCATTERED_TOKENS.clear();
    QUEUED_SCENE = undefined;
    LAYOUT_REFRESH_QUEUED = false;
});
