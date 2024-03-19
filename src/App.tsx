import { createSignal, type Component, For, type ParentComponent, splitProps, type JSX } from "solid-js";
import { hexToHsl, hslToHex, type Color, findColors, sortSimilarColors, removeDuplicateColors, randomHslColor } from "./color";

const Slider: Component<{
  min: number;
  max: number;
  value: number;
  oninput: (value: number) => void;
  colorFn: (value: number) => string;
}> = (props) => {
  const width = 400;
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
  const color = () => `hsl(${hue()} ${saturation()}% ${lum()}%)`;
  return (
    <div class="flex gap-4 items-center border-l-[16px] pl-8 py-8" style={{ "border-color": color() }}>
      <div>
        <div class="relative p-2 shadow-inner shadow-black rounded-lg">
          <div class="relative h-20 w-20 shadow shadow-black rounded overflow-clip outline outline-offset-4 outline-2 outline-transparent focus-within:outline-sky-500">
            <div class="absolute w-full h-full" style={{
              'background-color': color(),
            }} />
            <input
              type="color"
              class="absolute opacity-0 w-full h-full"
              value={`#${hslToHex([hue(), saturation(), lum()])}`}
              onInput={(e) => {
                const [h, s, l] = hexToHsl(e.currentTarget.value);
                setHue(h);
                setSaturation(s);
                setLum(l);
              }}
            />
          </div>
          <div
            class="absolute left-0 right-0 -bottom-6 text-center opacity-50 cursor-copy hover:opacity-100 transition"
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

export const App: Component = () => {
  const [colors, setColors] = createSignal<Color[]>([[100, 50, 50]]);
  const [input, setInput] = createSignal('');

  const detectColors = () => {
    const detectedColors = findColors(input());
    if (detectedColors) {
      setColors(sortSimilarColors(removeDuplicateColors(detectedColors)));
    }
  }

  return (
    <div class="flex flex-col gap-4">
      <div class="grid">
        <For each={colors()}>
          {([h, s, l]) => <Hsl h={h} s={s} l={l} />}
        </For>
      </div>
      <div class="grid gap-4 p-12">
        <Button onclick={() => { setColors((prior) => [...prior, randomHslColor()]) }}>+</Button>
        <textarea
          class="w-full text-white rounded shadow-inner shadow-black/50 focus:shadow-black bg-transparent border border-zinc-800 hover:border-zinc-700 focus:border-sky-500 outline-0 px-2 py-1 transition"
          value={input()}
          oninput={(e) => setInput(e.currentTarget.value)}
          rows={5}
        />
        <Button onclick={detectColors}>detect colors</Button>
      </div>
    </div>
  );
};

const Button: ParentComponent<JSX.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => {
  const [{ children }, buttonProps] = splitProps(props, ['children']);
  return (
    <button
      {...buttonProps}
      class="group inline-block rounded-full w-fit px-px pb-px bg-gradient-to-b shadow-md dark:shadow-black/50 from-sky-400 to-blue-700 dark:from-sky-300 dark:to-sky-600 enabled:active:translate-y-px transition-all duration-100 focus:duration-0 active:duration-0 enabled:active:shadow-none enabled:active:from-black enabled:active:to-zinc-800 outline-offset-2 enabled:hover:outline enabled:focus:outline outline-sky-500 enabled:active:outline-sky-600 disabled:opacity-75 disabled:shadow-none disabled:cursor-not-allowed"
    >
      <div class="relative font-ui font-medium rounded-full bg-gradient-to-b from-sky-500 to-blue-600 text-white text-sm px-3 pb-0.5 border-t border-t-sky-300 group-enabled:group-active:border-t-black group-enabled:group-active:shadow-inner group-enabled:group-active:shadow-blue-950/75 group-enabled:group-active:from-sky-500 group-enabled:group-active:to-blue-700">
        <div class="transition flex gap-1 items-center whitespace-nowrap">
          {children}
        </div>
      </div>
    </button>
  );
};
