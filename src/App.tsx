import { createSignal, type Component } from "solid-js";
import { hexToHsl } from "./color";

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
    <div
      class="relative h-4 bg-blue-400 rounded-full border-2 border-zinc-950 shadow"
      style={{
        'width': `${width}px`,
        'background-image': `linear-gradient(to right, ${gradient()})`
      }}
    >
      <input
        type="range"
        class="peer absolute inset-0 opacity-0 z-10"
        min={props.min}
        max={props.max}
        step={1}
        value={props.value}
        oninput={(e) => props.oninput(e.currentTarget.valueAsNumber ?? 0)}
      />
      <div
        class="relative h-5 w-2 rounded-full bg-white -top-1 shadow outline outline-2 outline-offset-2 outline-transparent peer-focus:outline-sky-500"
        style={{
          transform: `translateX(${props.value / scaleThumb}px)`
        }}
      />
    </div>
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
      <div class="relative h-20 w-20 rounded overflow-clip outline outline-offset-4 outline-2 outline-transparent focus-within:outline-sky-500">
        <div class="absolute w-full h-full" style={{
          'background-color': `hsl(${hue()} ${saturation()}% ${lum()}%)`
        }} />
        <input
          type="color"
          class="absolute w-full h-full opacity-0"
          onInput={(e) => {
            const [h, s, l] = hexToHsl(e.currentTarget.value);
            setHue(h);
            setSaturation(s);
            setLum(l);
          }}
        />
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
          <input
            type="number"
            class="text-white w-14 rounded shadow-inner bg-transparent focus:bg-zinc-950 border border-zinc-500 focus:border-sky-500 outline-0 px-1"
            value={hue()}
            min={0}
            max={360}
            oninput={(e) => setHue(e.currentTarget.valueAsNumber || 0)}
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
          <input
            type="number"
            class="text-white w-14 rounded shadow-inner bg-transparent focus:bg-zinc-950 border border-zinc-500 focus:border-sky-500 outline-0 px-1"
            value={saturation()}
            min={0}
            max={100}
            step={1}
            oninput={(e) => setSaturation(e.currentTarget.valueAsNumber || 0)}
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
          <input
            type="number"
            class="text-white w-14 rounded shadow-inner bg-transparent focus:bg-zinc-950 border border-zinc-500 focus:border-sky-500 outline-0 px-1"
            value={lum()}
            min={0}
            max={100}
            step={1}
            oninput={(e) => setLum(e.currentTarget.valueAsNumber || 0)}
          />
        </label>
      </div>
    </div>
  );
};

export const App: Component = () => (
  <div class="grid gap-12">
    <Hsl h={220} s={50} l={50} />
    <Hsl h={150} s={40} l={50} />
    <Hsl h={320} s={40} l={50} />
  </div>
);
