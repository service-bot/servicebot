export function hexToRgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
}
export function componentToHex(c) {
    let hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

export function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

export function getDarkenedRGB(rgb){

    let validation = (val) => {
        return val + 20 > 255 ? 255 : val + 20;
    };

    let r = validation(rgb.r);
    let b = validation(rgb.b);
    let g = validation(rgb.g);

    return { "r": r, "g": g, "b": b};
}

export function getThemeHeaderRGB(rgb){

    let validation = (val) => {
        return val - 40 < 0 ? 0 : val - 40;
    };
    let validation2 = (val) => {
        return val + 20 > 255 ? 255 : val + 20;
    };

    let r = validation2(rgb.r);
    let g = validation(rgb.g);
    let b = (rgb.b);

    return { "r": r, "g": g, "b": b};
}

export function getThemeContentRGB(rgb){

    let validation = (val) => {
        return val - 70 < 0 ? 0 : val - 70;
    };
    let validation2 = (val) => {
        return val - 20 < 0 ? 0 : val - 20;
    };
    let validation3 = (val) => {
        return val - 40 < 0 ? 0 : val - 40;
    };

    let r = validation2(rgb.r);
    let g = validation(rgb.g);
    let b = validation3(rgb.b);

    return { "r": r, "g": g, "b": b};
}