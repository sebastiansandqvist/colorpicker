import { createSignal, type Component, For } from "solid-js";
import { hexToHsl, hslToHex, type Color } from "./color";

const Slider: Component<{
  min: number;
  max: number;
  value: number;
  oninput: (value: number) => void;
  colorFn: (value: number) => string;
}> = (props) => {
  const width = 300;
  const valueSteps = 30;
  const thumbWidth = 8;
  const scaleValue = props.max / valueSteps;
  const scaleThumb = props.max / (width - thumbWidth);
  const gradient = () => Array.from({ length: valueSteps }, (_n, i) => props.colorFn(i * scaleValue)).join(', ');
  return (
    <>
      <div class="p-1 shadow-inner shadow-black rounded-full">
        <div
          class="relative h-3 bg-blue-400 rounded-full shadow shadow-black"
          style={{
            'width': `${width}px`,
            'background-image': `linear-gradient(to right, ${gradient()})`
          }}
        >
          <input
            type="range"
            class="peer absolute inset-0 opacity-0 cursor-ew-resize z-10"
            min={props.min}
            max={props.max}
            step={1}
            value={props.value}
            oninput={(e) => props.oninput(e.currentTarget.valueAsNumber || 0)}
          />
          <div
            class="relative h-5 w-2 rounded-full bg-white -top-1 shadow outline outline-2 outline-offset-2 outline-transparent peer-focus:outline-sky-500"
            style={{
              transform: `translateX(${props.value / scaleThumb}px)`,
            }}
          />
        </div>
      </div>
      <input
        type="text"
        class="text-white w-12 rounded shadow-inner shadow-black bg-transparent focus:bg-zinc-950 border border-zinc-800 focus:border-sky-500 outline-0 px-1"
        value={props.value}
        min={props.min}
        max={props.max}
        oninput={(e) => props.oninput(e.currentTarget.valueAsNumber || 0)}
      />
    </>
  );
}

const Hsl: Component<{
  h: number;
  s: number;
  l: number;
}> = (props) => {
  const [hue, setHue] = createSignal(props.h);
  const [saturation, setSaturation] = createSignal(props.s);
  const [lum, setLum] = createSignal(props.l);

  return (
    <div class="flex gap-4 items-center">
      <div>
        <div class="p-2 shadow-inner shadow-black rounded-lg">
          <div class="relative h-20 w-20 shadow shadow-black rounded overflow-clip outline outline-offset-4 outline-2 outline-transparent focus-within:outline-sky-500">
            <div class="absolute w-full h-full" style={{
              'background-color': `hsl(${hue()} ${saturation()}% ${lum()}%)`
            }} />
            <input
              type="color"
              class="absolute w-full h-full opacity-0"
              value={`#${hslToHex([hue(), saturation(), lum()])}`}
              onInput={(e) => {
                const [h, s, l] = hexToHsl(e.currentTarget.value);
                setHue(h);
                setSaturation(s);
                setLum(l);
              }}
            />
          </div>
        </div>
        <div
          class="text-center opacity-50 cursor-copy hover:opacity-100 transition"
          onclick={async () => {
            const hex = `#${hslToHex([hue(), saturation(), lum()])}`;
            await navigator.clipboard.writeText(hex);
            // TODO: copied [check] text
            // then wait(1000)
            // then restore the hex value
            // TODO: tooltip
          }}
        >
          #{hslToHex([hue(), saturation(), lum()])}
        </div>
      </div>
      <div class="grid gap-0.5">
        <label class="flex items-center gap-2">
          H
          <Slider
            min={0}
            max={360}
            value={hue()}
            oninput={(value) => setHue(value)}
            colorFn={(value) => `hsl(${value} ${saturation()}% ${lum()}%)`}
          />
        </label>
        <label class="flex items-center gap-2">
          S
          <Slider
            min={0}
            max={100}
            value={saturation()}
            oninput={(value) => setSaturation(value)}
            colorFn={(value) => `hsl(${hue()} ${value}% ${lum()}%)`}
          />
        </label>
        <label class="flex items-center gap-2">
          L
          <Slider
            min={0}
            max={100}
            value={lum()}
            oninput={(value) => setLum(value)}
            colorFn={(value) => `hsl(${hue()} ${saturation()}% ${value}%)`}
          />
        </label>
      </div>
    </div>
  );
};

function random(max: number) {
  return Math.floor(Math.random() * max);
}

function randomColor(): Color {
  return [random(360), random(100), random(100)];
}

function findColors(input: string): Color[] | undefined {
  const colors: Color[] = [];
  const regex = /#(?:[0-9a-fA-F]{3}){1,2}(?:[0-9a-fA-F]{2})?/g;
  const matches = input.match(regex);
  return matches?.map((match) => hexToHsl(match));
}

function removeDuplicateColors(colors: Color[]): Color[] {
  const uniqueTuples = new Set(colors.map((color) => JSON.stringify(color)));
  return Array.from(uniqueTuples).map(tuple => JSON.parse(tuple));
}

export const App: Component = () => {
  const [colors, setColors] = createSignal<Color[]>([]);
  const [input, setInput] = createSignal('');

  const detectColors = () => {
    const detectedColors = findColors(input());
    if (detectedColors) {
      setColors(removeDuplicateColors(detectedColors));
    }
  }

  return (
    <>
      <div class="grid gap-12">
        <For each={colors()}>
          {([h, s, l]) => <Hsl h={h} s={s} l={l} />}
        </For>
      </div>
      <button
        onclick={() => {
          setColors((prior) => [...prior, randomColor()])
        }}
      >+</button>
      <textarea
        class="w-full text-white rounded shadow-inner shadow-black bg-transparent focus:bg-zinc-950 border border-zinc-800 focus:border-sky-500 outline-0 px-1"
        value={input()}
        oninput={(e) => setInput(e.currentTarget.value)}
        rows={5}
      />
      <button onclick={detectColors}>
        detect colors
      </button>
    </>
  );
};
