import sha256 from 'js-sha256';

type Mode = 'light' | 'dark';
type GradientType = 'linear' | 'radial' | 'conic';

export const getCSSGradient = (
  input: string,
  mode: Mode = 'light',
  type: GradientType = 'conic'
): string => {
  const hex = sha256.create().update(input).hex();
  const bytes = hex.match(/.{1,2}/g)!.map(h => parseInt(h, 16));

  const baseHue = bytes[0] % 360;
  const hueShift = (bytes[1] % 30) + 10;
  const sat = 60 + (bytes[2] % 30); // 60–89%
  const lightnessBase = mode === 'dark'
    ? 20 + (bytes[3] % 20)
    : 60 + (bytes[3] % 20);

  const stop1 = `hsl(${baseHue}, ${sat}%, ${lightnessBase}%)`;
  const stop2 = `hsl(${(baseHue + hueShift) % 360}, ${sat - 10}%, ${Math.max(0, Math.min(100, lightnessBase + (mode === 'dark' ? -10 : 10)))}%)`;

  switch (type) {
    case 'linear':
      return `linear-gradient(135deg, ${stop1}, ${stop2})`;
    case 'radial':
      return `radial-gradient(circle at center, ${stop1}, ${stop2})`;
    case 'conic':
    default:
      return `conic-gradient(from 0deg at center, ${stop1}, ${stop2})`;
  }
};