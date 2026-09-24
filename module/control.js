import { getSetting, MODULE_ID, setSetting } from './settings.js';
export function snapIsActive() {
    return getSetting('playersBtn') ? getSetting('snapTokensLocal') : getSetting('snapTokens');
}
function addControl(sceneControls) {
    if (!getSetting('playersBtn') && !game.user?.isGM)
        return;
    if (getSetting('hideBtn'))
        return;

    let tokenLayer = null;
    if (Array.isArray(sceneControls)) {
        tokenLayer = sceneControls.find((c) => c.name === 'token' || c.name === 'tokens');
    } else if (sceneControls && typeof sceneControls === 'object') {
        tokenLayer = sceneControls.token ?? sceneControls.tokens ?? null;
    }
    if (!tokenLayer)
        return;

    const tool = {
        name: 'sizeSnap',
        title: game.i18n.localize(`${MODULE_ID}.sizeSnap.title`),
        icon: 'fas fa-diagram-venn',
        toggle: true,
        active: snapIsActive(),
        onChange: (_event, toggled) => {
            if (getSetting('playersBtn')) {
                setSetting('snapTokensLocal', toggled);
            } else {
                setSetting('snapTokens', toggled);
            }
        },
    };

    if (Array.isArray(tokenLayer.tools)) {
        const existing = tokenLayer.tools.findIndex((t) => t.name === tool.name);
        if (existing >= 0)
            tokenLayer.tools[existing] = tool;
        else
            tokenLayer.tools.push(tool);
    } else if (tokenLayer.tools && typeof tokenLayer.tools === 'object') {
        tokenLayer.tools.sizeSnap = tool;
    }
}

Hooks.once('init', () => {
    Hooks.on('getSceneControlButtons', addControl);
});
