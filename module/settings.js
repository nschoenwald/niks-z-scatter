import { refreshScatter } from './snap.js';

export const MODULE_ID = 'niks-z-scatter';
const settings = {
    snapTokens: {
        name: 'Snap Tokens',
        scope: 'world',
        config: false,
        type: Boolean,
        default: true,
        onChange: () => {
            if (getSetting('playersBtn'))
                return;
            refreshScatter();
        },
    },
    snapTokensLocal: {
        name: 'Snap Tokens (Player Preference)',
        scope: 'client',
        config: false,
        type: Boolean,
        default: false,
        onChange: () => refreshScatter(),
    },
    completeOverlap: {
        name: `${MODULE_ID}.settings.completeOverlap.name`,
        hint: `${MODULE_ID}.settings.completeOverlap.hint`,
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
        onChange: () => refreshScatter(),
    },
    ignoreDead: {
        name: `${MODULE_ID}.settings.ignoreDead.name`,
        hint: `${MODULE_ID}.settings.ignoreDead.hint`,
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
        onChange: () => refreshScatter(),
    },
    ignoreMisaligned: {
        name: `${MODULE_ID}.settings.ignoreMisaligned.name`,
        hint: `${MODULE_ID}.settings.ignoreMisaligned.hint`,
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
        onChange: () => refreshScatter(),
    },
    ignoreElevation: {
        name: `${MODULE_ID}.settings.ignoreElevation.name`,
        hint: `${MODULE_ID}.settings.ignoreElevation.hint`,
        scope: 'world',
        config: true,
        type: Boolean,
        default: false,
        onChange: () => refreshScatter(),
    },
    collideDifferentSizes: {
        name: `${MODULE_ID}.settings.collideDifferentSizes.name`,
        hint: `${MODULE_ID}.settings.collideDifferentSizes.hint`,
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
        onChange: () => refreshScatter(),
    },
    scatter: {
        name: `${MODULE_ID}.settings.scatter.name`,
        hint: `${MODULE_ID}.settings.scatter.hint`,
        scope: 'world',
        config: true,
        type: Number,
        default: 0.3,
        range: {
            min: 0.01,
            max: 1,
            step: 0.01,
        },
        onChange: () => refreshScatter(),
    },
    hideBtn: {
        name: `${MODULE_ID}.settings.hideBtn.name`,
        hint: `${MODULE_ID}.settings.hideBtn.hint`,
        scope: 'world',
        config: true,
        type: Boolean,
        default: false,
        requiresReload: true,
    },
    playersBtn: {
        name: `${MODULE_ID}.settings.playersBtn.name`,
        hint: `${MODULE_ID}.settings.playersBtn.hint`,
        scope: 'world',
        config: true,
        type: Boolean,
        default: false,
        requiresReload: true,
    },
};
export function getSetting(name) {
    return game.settings.get(MODULE_ID, name);
}
export function setSetting(name, value) {
    return game.settings.set(MODULE_ID, name, value);
}
Hooks.once('init', () => {
    for (const [key, setting] of Object.entries(settings)) {
        game.settings.register(MODULE_ID, key, setting);
    }
});
