const ZERO_OFFSET = { x: 0, y: 0 };
export function applyVisualOffset(token, offset, options = {}) {
    if (!canRender(token))
        return;
    const objects = getOffsetObjects(token);
    for (const object of objects) {
        object.x = offset.x;
        object.y = offset.y;
    }
    if (token.nameplate) {
        token.nameplate.x = token.w / 2 + offset.x;
        token.nameplate.y = token.h + 2 + offset.y;
    }
    if (token.tooltip) {
        token.tooltip.x = token.w / 2 + offset.x;
        token.tooltip.y = offset.y - 2;
    }
    if (token.turnMarker) {
        token.turnMarker.position.set(token.w / 2 + offset.x, token.h / 2 + offset.y);
    }
    if (token.levelIndicator) {
        token.levelIndicator.x = token.w / 2 + offset.x;
    }
    const center = token.center ?? {
        x: token.document.x + (token.w ?? token.scene.dimensions.size * token.document.width) / 2,
        y: token.document.y + (token.h ?? token.scene.dimensions.size * token.document.height) / 2,
    };
    token.mesh.x = center.x + offset.x;
    token.mesh.y = center.y + offset.y;
    refreshHitArea(token, offset);
    if (options.refreshBorder ?? true)
        refreshBorder(token, offset);
}
export function resetVisualOffset(token) {
    if (!canRender(token))
        return;
    applyVisualOffset(token, ZERO_OFFSET);
}
function getOffsetObjects(token) {
    return [
        token.effects,
        token.bars,
        token.targetArrows,
        token.targetPips,
    ].filter(Boolean);
}
function canRender(token) {
    return !!token && !token.destroyed && !!token.document && !!token.scene?.dimensions && !!token.mesh;
}
function refreshHitArea(token, offset) {
    const shiftedShape = getShiftedShape(token.shape, offset);
    if (shiftedShape)
        token.hitArea = shiftedShape;
}
function refreshBorder(token, offset) {
    if (typeof token._refreshBorder !== 'function' || !isDrawableBorderShape(token.shape))
        return;
    try {
        token._refreshBorder();
        if (token.border?.position?.set)
            token.border.position.set(offset.x, offset.y);
        else if (token.border) {
            token.border.x = offset.x;
            token.border.y = offset.y;
        }
    }
    catch {
    }
}
function isDrawableBorderShape(shape) {
    if (typeof shape === 'function')
        return true;
    if (!globalThis.PIXI)
        return false;
    return [
        globalThis.PIXI.Rectangle,
        globalThis.PIXI.RoundedRectangle,
        globalThis.PIXI.Circle,
        globalThis.PIXI.Ellipse,
        globalThis.PIXI.Polygon,
    ].some((shapeClass) => shape instanceof shapeClass);
}
function getShiftedShape(shape, offset) {
    if (!globalThis.PIXI || !shape)
        return undefined;
    if (!offset.x && !offset.y)
        return shape;
    const pixi = globalThis.PIXI;
    if (shape instanceof pixi.Rectangle) {
        return new pixi.Rectangle(shape.x + offset.x, shape.y + offset.y, shape.width, shape.height);
    }
    if (shape instanceof pixi.RoundedRectangle) {
        return new pixi.RoundedRectangle(shape.x + offset.x, shape.y + offset.y, shape.width, shape.height, shape.radius);
    }
    if (shape instanceof pixi.Circle) {
        return new pixi.Circle(shape.x + offset.x, shape.y + offset.y, shape.radius);
    }
    if (shape instanceof pixi.Ellipse) {
        return new pixi.Ellipse(shape.x + offset.x, shape.y + offset.y, shape.width, shape.height);
    }
    if (shape instanceof pixi.Polygon) {
        const shiftedPoints = shape.points.map((value, index) => value + (index % 2 === 0 ? offset.x : offset.y));
        return new pixi.Polygon(shiftedPoints);
    }
    return undefined;
}
