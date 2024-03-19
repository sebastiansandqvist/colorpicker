export type Color = [number, number, number];

// f00
// ff0000
export function hexToRgb(hexRaw: string): Color {
  console.log({ hexRaw });
  const hex = hexRaw.length === 4
    ? hexRaw[1]! + hexRaw[1] + hexRaw[2]! + hexRaw[2] + hexRaw[3]! + hexRaw[3]
    : hexRaw.slice(1);
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  console.log({ r, g, b });
  return [r, g, b];
}

// function rgbToLinearRgb(rgb: Color): Color {
//   return rgb.map(channel => {
//     const c = channel / 255;
//     return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
//   }) as Color;
// }

// function linearRgbToOklab(rgb: Color) {
//   TODO: maybe support OKLCH
// }

export function hexToHsl(hex: string): Color {
  const [r, g, b] = hexToRgb(hex).map((n) => n / 255) as Color;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max === min) {
    // achromatic, do nothing for hue and saturation
  } else {
    const delta = max - min;
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    switch (max) {
      case r: h = (g - b) / delta + (g < b ? 6 : 0); break;
      case g: h = (b - r) / delta + 2; break;
      case b: h = (r - g) / delta + 4; break;
    }
    h /= 6;
  }

  const result: Color = [
    Math.round(h * 360),
    Math.round(s * 100),
    Math.round(l * 100),
  ];

  console.log({
    h: result[0],
    s: result[1],
    l: result[2],
  });

  return result;
}

function hslToRgb([h, _s, _l]: Color): Color {
  const s = _s / 100;
  const l = _l / 100;

  const a = s * Math.min(l, 1 - l);

  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(255 * color);
  };

  return [f(0), f(8), f(4)];
}

function rgbToHex(rgb: Color): string {
  return rgb.map(component => component.toString(16).padStart(2, '0')).join('');;
}

export function hslToHex(hsl: Color) {
  return rgbToHex(hslToRgb(hsl));
}


function random(max: number) {
  return Math.floor(Math.random() * max);
}

export function randomHslColor(): Color {
  return [random(360), random(100), random(100)];
}

export function findColors(input: string): Color[] | undefined {
  const regex = /#(?:[0-9a-fA-F]{3}){1,2}(?:[0-9a-fA-F]{2})?/g;
  const matches = input.match(regex);
  return matches?.map((match) => hexToHsl(match));
}

export function removeDuplicateColors(colors: Color[]): Color[] {
  const uniqueTuples = new Set(colors.map((color) => JSON.stringify(color)));
  return Array.from(uniqueTuples).map(tuple => JSON.parse(tuple));
}

export function sortSimilarColors(colors: Color[]): Color[] {
  if (colors.length === 0) return [];

  const colorDistance = ([h1, s1, l1]: Color, [h2, s2, l2]: Color): number => {
    const dh = Math.min(Math.abs(h1 - h2), 360 - Math.abs(h1 - h2)) / 180; // Normalize hue difference (0-2)
    const ds = Math.abs(s1 - s2) / 100; // Normalize saturation difference (0-1)
    const dl = Math.abs(l1 - l2) / 100; // Normalize luminance difference (0-1)
    return Math.sqrt(dh * dh + ds * ds + dl * dl); // Euclidean distance
  };

  let result: Color[] = [colors[0]!];
  let remainingColors = colors.slice(1);

  while (remainingColors.length > 0) {
    let lastColor = result[result.length - 1]!;
    let closestIndex = 0;
    let closestDistance = colorDistance(lastColor, remainingColors[0]!);

    for (let i = 1; i < remainingColors.length; i++) {
      let currentDistance = colorDistance(lastColor, remainingColors[i]!);
      if (currentDistance < closestDistance) {
        closestDistance = currentDistance;
        closestIndex = i;
      }
    }

    result.push(remainingColors[closestIndex]!);
    remainingColors.splice(closestIndex, 1);
  }

  return result;
}
