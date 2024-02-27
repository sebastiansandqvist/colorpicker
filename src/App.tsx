import { createSignal, type Component } from "solid-js";

export const App: Component = () => {
  const [hue, setHue] = createSignal(220);
  const [saturation, setSaturation] = createSignal(55);
  const [lum, setLum] = createSignal(50);

  return (
    <div class="bg-zinc-900 text-white font-mono p-8">
      <div class="flex gap-4 items-center">
        {/* <input type="color" /> */}
        <div class="h-16 w-16 rounded" style={{
          'background-color': `hsl(${hue()} ${saturation()}% ${lum()}%)`
        }} />
        <div>
          <label class="flex gap-2">
            H
            <input
              type="range"
              min={0}
              max={360}
              step={1}
              value={hue()}
              oninput={(e) => {
                setHue(e.currentTarget.valueAsNumber);
              }}
            />
            {hue()}
          </label>
          <label class="flex gap-2">
            S
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={saturation()}
              oninput={(e) => {
                setSaturation(e.currentTarget.valueAsNumber);
              }}
            />
            {saturation()}
          </label>
          <label class="flex gap-2">
            L
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={lum()}
              oninput={(e) => {
                setLum(e.currentTarget.valueAsNumber);
              }}
            />
            {lum()}
          </label>
        </div>
      </div>
    </div>
  );
};
