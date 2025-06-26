import sha256 from 'js-sha256';

// --- TYPE DEFINITIONS ---

/** Defines the color mode for the gradient. */
type Mode = 'light' | 'dark';

/** Defines the type of CSS gradient to generate. */
type GradientType = 'linear' | 'radial' | 'conic';

/** Defines the position for radial or conic gradients, e.g., ['25%', '75%']. */
type Position = [string, string];

/** A single hue value (0-360) or an array of hue values to influence color selection. */
type HueSkew = number | number[];

/**
 * Defines the common options applicable to all gradient types.
 */
interface BaseGradientOptions {
  mode?: Mode;
  stops?: number;
  hueSkew?: HueSkew;
}

/**
 * Specific options for linear gradients.
 */
export interface LinearGradientOptions extends BaseGradientOptions {
  angle?: string; // e.g., '135deg', 'to top right'
}

/**
 * Specific options for radial gradients.
 */
export interface RadialGradientOptions extends BaseGradientOptions {
  size?: string; // e.g., 'farthest-corner', 'circle'
  position?: Position;
}

/**
 * Specific options for conic gradients.
 */
export interface ConicGradientOptions extends BaseGradientOptions {
  angle?: string; // e.g., 'from 45deg'
  position?: Position;
}

/**
 * A union type representing all possible options for the main getCSSGradient function.
 */
type AllGradientOptions = { type?: GradientType } & LinearGradientOptions & RadialGradientOptions & ConicGradientOptions;

/**
 * The structure of the data returned by the internal color stop generator.
 */
interface GetColorStopsResult {
  stop1: string;
  stop2: string;
  nextHash: string;
}


// --- CORE FUNCTIONS ---

/**
 * Generates two pseudo-random color stops from a given input string.
 * @internal
 * @param hashInput The string to be hashed for generating colors.
 * @param mode The color mode ('light' or 'dark').
 * @param hueSkew An optional hue or array of hues to influence color generation.
 * @returns An object with two color stops and the next hash for chaining.
 */
const getColorStops = (hashInput: string, mode: Mode, hueSkew?: HueSkew): GetColorStopsResult => {
  const nextHash = sha256.create().update(hashInput).hex();
  const bytes = nextHash.match(/.{1,2}/g)!.map(h => parseInt(h, 16));
  
  let baseHue1: number;
  // If a hueSkew is provided, always use it.
  if (hueSkew !== undefined && hueSkew !== null) {
      const skewValues = Array.isArray(hueSkew) ? hueSkew : [hueSkew];
      const skewChoiceByte = bytes[10];
      const skewOffsetByte = bytes[11];

      // Choose one of the skew values and apply a small random offset
      const chosenSkew = skewValues[skewChoiceByte % skewValues.length];
      const offset = (skewOffsetByte % 30) - 15; // +/- 15 degree variance
      baseHue1 = (chosenSkew + offset + 360) % 360; // Ensure positive result
  } else {
      // Fallback to the original random hue generation
      baseHue1 = bytes[0] % 360; 
  }
  
  const sat1 = mode === 'dark' 
      ? 75 + (bytes[1] % 15) // Dark mode saturation: 75-89%
      : 60 + (bytes[1] % 30); // Light mode saturation: 60-89%
  
  const lightness1 = mode === 'dark' 
      ? 35 + (bytes[2] % 20) // Dark mode lightness: 35-54%
      : 60 + (bytes[3] % 20); // Light mode lightness: 60-79%

  const stop1 = `hsl(${baseHue1}, ${sat1}%, ${lightness1}%)`;

  const hueShift = (bytes[4] % 60) - 30;
  const satShift = (bytes[5] % 20) - 10;
  const lightnessShift = (bytes[6] % 20) - 10;
  const stop2 = `hsl(${(baseHue1 + hueShift + 360) % 360}, ${Math.max(0, Math.min(100, sat1 + satShift))}%, ${Math.max(0, Math.min(100, lightness1 + lightnessShift))}%)`;

  return { stop1, stop2, nextHash };
};

/**
 * Generates a CSS gradient string based on a given input string and a flexible set of options.
 *
 * @param input The seed string for the gradient. The same string always produces the same gradient.
 * @param options An object containing options like mode, type, stops, angle, etc.
 * @returns A string containing the full CSS gradient value.
 */
export const getCSSGradient = (
  input: string,
  options: AllGradientOptions = {}
): string => {
  const {
      mode = 'light',
      type = 'conic',
      stops = 3,
      angle,
      size,
      position,
      hueSkew,
  } = options;

  if (stops < 2) {
    console.error("Gradient must have at least 2 stops. Defaulting to 2.");
  }
  const validatedStops = Math.max(2, stops);

  const finalStops: string[] = [];
  let currentHashInput = input;
  const iterations = Math.ceil(validatedStops / 2);

  for (let i = 0; i < iterations; i++) {
      const { stop1, stop2, nextHash } = getColorStops(currentHashInput, mode, hueSkew);
      
      if (finalStops.length < validatedStops) {
          finalStops.push(stop1);
      }
      if (finalStops.length < validatedStops) {
          finalStops.push(stop2);
      }
      currentHashInput = nextHash;
  }

  const stopsString = finalStops.join(', ');

  switch (type) {
      case 'linear': {
          const prefix = angle ? `${angle}, ` : '';
          return `linear-gradient(${prefix}${stopsString})`;
      }
      case 'radial': {
          const prefixParts: string[] = [];
          if (size) {
              prefixParts.push(size);
              if (position && Array.isArray(position) && position.length === 2) {
                  prefixParts.push(`at ${position[0]} ${position[1]}`);
              }
          }
          const prefix = prefixParts.length > 0 ? prefixParts.join(' ') + ', ' : '';
          return `radial-gradient(${prefix}${stopsString})`;
      }
      case 'conic':
      default: {
          const prefixParts: string[] = [];
          if (angle) {
              prefixParts.push(angle);
          }
          if (position && Array.isArray(position) && position.length === 2) {
              prefixParts.push(`at ${position[0]} ${position[1]}`);
          }
          const prefix = prefixParts.length > 0 ? prefixParts.join(' ') + ', ' : '';
          return `conic-gradient(${prefix}${stopsString})`;
      }
  }
};


// --- QoL HELPER FUNCTIONS ---

/**
 * Generates a CSS linear-gradient.
 * @param input The seed string for the gradient.
 * @param options Specific options for a linear gradient.
 * @returns The CSS linear-gradient string.
 */
export const getCSSLinearGradient = (input: string, options: LinearGradientOptions = {}): string => {
    return getCSSGradient(input, { ...options, type: 'linear' });
}

/**
 * Generates a CSS radial-gradient.
 * @param input The seed string for the gradient.
 * @param options Specific options for a radial gradient.
 * @returns The CSS radial-gradient string.
 */
export const getCSSRadialGradient = (input: string, options: RadialGradientOptions = {}): string => {
    return getCSSGradient(input, { ...options, type: 'radial' });
}

/**
 * Generates a CSS conic-gradient.
 * @param input The seed string for the gradient.
 * @param options Specific options for a conic gradient.
 * @returns The CSS conic-gradient string.
 */
export const getCSSConicGradient = (input: string, options: ConicGradientOptions = {}): string => {
    return getCSSGradient(input, { ...options, type: 'conic' });
}