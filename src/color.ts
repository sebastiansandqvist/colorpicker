type Color = [number, number, number];

export function hexToRgb(hex: string): Color {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
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

  return [
    Math.round(h * 360),
    Math.round(s * 100),
    Math.round(l * 100),
  ];
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
