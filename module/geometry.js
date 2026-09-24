const HEX_TYPES = new Set([
    CONST.GRID_TYPES.HEXODDR,
    CONST.GRID_TYPES.HEXEVENR,
    CONST.GRID_TYPES.HEXODDQ,
    CONST.GRID_TYPES.HEXEVENQ,
]);
export function isGridless(gridType) {
    return gridType === CONST.GRID_TYPES.GRIDLESS;
}
export function isHexagonal(gridType) {
    return HEX_TYPES.has(gridType);
}
export function getTokenRect(token, gridSize) {
    return {
        x: token.x,
        y: token.y,
        width: token.width * gridSize,
        height: token.height * gridSize,
    };
}
export function sameElevation(a, b) {
    return (a.elevation ?? 0) === (b.elevation ?? 0);
}
export function rectsOverlap(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}
export function rectsOverlapCompletely(a, b, epsilon = 0.51) {
    return (
        Math.abs(a.x - b.x) <= epsilon &&
        Math.abs(a.y - b.y) <= epsilon &&
        Math.abs(a.width - b.width) <= epsilon &&
        Math.abs(a.height - b.height) <= epsilon
    );
}
export function buildCollisionGroups(
    tokens,
    grid,
    gridSize,
    ignoreElevation = false,
    collideDifferentSizes = true,
    completeOverlap = false
) {
    const groups = [];
    const visited = new Set();
    const collisionMap = new Map();
    for (const token of tokens) {
        collisionMap.set(token, new Set());
    }
    for (let i = 0; i < tokens.length; i++) {
        for (let j = i + 1; j < tokens.length; j++) {
            if (!ignoreElevation && !sameElevation(tokens[i], tokens[j]))
                continue;
            if (!collideDifferentSizes && !sameDimensions(tokens[i], tokens[j]))
                continue;
            if (!tokensCollide(tokens[i], tokens[j], grid, gridSize, completeOverlap))
                continue;
            collisionMap.get(tokens[i]).add(tokens[j]);
            collisionMap.get(tokens[j]).add(tokens[i]);
        }
    }
    for (const token of tokens) {
        if (visited.has(token))
            continue;
        const group = [];
        const stack = [token];
        visited.add(token);
        while (stack.length) {
            const current = stack.pop();
            group.push(current);
            for (const neighbor of collisionMap.get(current) ?? []) {
                if (visited.has(neighbor))
                    continue;
                visited.add(neighbor);
                stack.push(neighbor);
            }
        }
        if (group.length > 1)
            groups.push(sortTokens(group));
    }
    return groups;
}
function sameDimensions(a, b) {
    return a.width === b.width && a.height === b.height;
}
function tokensCollide(a, b, grid, gridSize, completeOverlap = false) {
    if (isHexagonal(grid?.type)) {
        const aCells = getHexCells(a, grid);
        const bCells = getHexCells(b, grid);
        if (aCells.size && bCells.size) {
            if (completeOverlap) {
                if (aCells.size !== bCells.size)
                    return false;
                for (const cell of aCells) {
                    if (!bCells.has(cell))
                        return false;
                }
                return true;
            }
            for (const cell of aCells) {
                if (bCells.has(cell))
                    return true;
            }
            return false;
        }
    }
    const aRect = getTokenRect(a, gridSize);
    const bRect = getTokenRect(b, gridSize);
    return completeOverlap ? rectsOverlapCompletely(aRect, bRect) : rectsOverlap(aRect, bRect);
}
function getHexCells(token, grid) {
    const occupiedCells = getOccupiedHexCells(token, grid);
    if (occupiedCells.size)
        return occupiedCells;
    const cells = new Set();
    if (!grid?.getOffsetRange)
        return cells;
    try {
        const [i0, j0, i1, j1] = grid.getOffsetRange({
            x: token.x,
            y: token.y,
            width: token.width * (grid.sizeX ?? grid.size),
            height: token.height * (grid.sizeY ?? grid.size),
        });
        for (let i = i0; i < i1; i++) {
            for (let j = j0; j < j1; j++) {
                cells.add(`${i},${j}`);
            }
        }
    }
    catch {
        return new Set();
    }
    return cells;
}
function getOccupiedHexCells(token, grid) {
    const cells = new Set();
    const tokenConstructor = token.constructor;
    const getHexagonalOffsets = tokenConstructor?._getHexagonalOffsets;
    const getGridOffset = token._positionToGridOffset;
    if (typeof getHexagonalOffsets !== 'function' || typeof getGridOffset !== 'function')
        return cells;
    try {
        const width = Math.max(Math.round(token.width * 2) / 2, 0.5);
        const height = Math.max(Math.round(token.height * 2) / 2, 0.5);
        const shape = token.shape ?? CONST.TOKEN_SHAPES.ELLIPSE_1;
        const offsets = getHexagonalOffsets.call(tokenConstructor, width, height, shape, grid.columns);
        const origin = getGridOffset.call(token, {
            x: token.x,
            y: token.y,
            width,
            height,
            elevation: token.elevation,
            shape,
        });
        const isEven = ((grid.columns ? origin.j : origin.i) % 2 === 0) === grid.even;
        for (const { i, j } of (isEven ? offsets.even : offsets.odd)) {
            cells.add(`${origin.i + i},${origin.j + j}`);
        }
    }
    catch {
        return new Set();
    }
    return cells;
}
function sortTokens(tokens) {
    return [...tokens].sort((a, b) => tokenSortKey(a).localeCompare(tokenSortKey(b)));
}
function tokenSortKey(token) {
    return token.id ?? token.name ?? `${token.x},${token.y},${token.width},${token.height}`;
}
