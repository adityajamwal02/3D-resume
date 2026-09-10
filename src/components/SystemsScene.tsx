import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Pause,
  Play,
  RotateCcw,
  Layers,
  Box,
} from "lucide-react";
import type { SceneController } from "../scene/createSculptureScene";

const layers = [
  {
    name: "Cloud",
    label: "01 / CLOUD INFRASTRUCTURE",
    detail: "Azure · Resource migration · .NET",
  },
  {
    name: "Systems",
    label: "02 / DISTRIBUTED SYSTEMS",
    detail: "C++ · Data pipelines · Scale",
  },
  {
    name: "Intelligence",
    label: "03 / APPLIED INTELLIGENCE",
    detail: "Agentic AI · Machine learning",
  },
];

export default function SystemsScene() {
  const host = useRef<HTMLDivElement>(null);
  const controller = useRef<SceneController | null>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [exploded, setExploded] = useState(true);

  useEffect(() => {
    const element = host.current!;
    let disposed = false;
    const preferences = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onPreference = () => setPaused(preferences.matches);
    preferences.addEventListener("change", onPreference);
    const timer = window.setTimeout(() => {
      import("../scene/createSculptureScene")
        .then(({ createSystemScene }) => {
          if (disposed) return;
          controller.current = createSystemScene(
            element,
            setActive,
            () => {
              setFailed(true);
              setReady(false);
            },
            preferences.matches,
          );
          setReady(true);
        })
        .catch(() => {
          if (!disposed) setFailed(true);
        });
    }, 120);
    return () => {
      disposed = true;
      window.clearTimeout(timer);
      preferences.removeEventListener("change", onPreference);
      controller.current?.dispose();
      controller.current = null;
    };
  }, []);

  useEffect(() => {
    controller.current?.select(active);
  }, [active, ready]);
  useEffect(() => {
    controller.current?.pause(paused);
  }, [paused, ready]);
  useEffect(() => {
    controller.current?.setExploded(exploded);
  }, [exploded, ready]);

  return (
    <div className={`systems-scene ${ready ? "scene-ready" : ""}`}>
      {!ready && (
        <div className="scene-fallback" aria-hidden="true">
          <div className="system-block block-one" />
          <div className="system-block block-two" />
          <div className="system-block block-three" />
        </div>
      )}
      <div
        className="scene-canvas"
        ref={host}
        role="img"
        aria-label="Floating glossy sculpture of three interlocking rings representing cloud, distributed systems, and applied intelligence"
      />
      <div className="scene-heading" aria-hidden="true">
        <span className="scene-cross">+</span> CONNECTED THINKING{" "}
        <span>AJ—01</span>
      </div>
      <div className="scene-interface">
        <div className="scene-caption" aria-live="polite">
          <span>{layers[active].label}</span>
          <p>{layers[active].detail}</p>
        </div>
        <div className="scene-controls">
          <div className="layer-selector" aria-label="Engineering disciplines">
            {layers.map((layer, index) => (
              <button
                key={layer.name}
                aria-pressed={active === index}
                onClick={() => setActive(index)}
              >
                {layer.name}
              </button>
            ))}
          </div>
          {ready && !failed && (
            <div className="scene-tools" aria-label="Scene controls">
              <button
                className="scene-tool"
                title={exploded ? "Assemble layers" : "Explode layers"}
                aria-label={exploded ? "Assemble layers" : "Explode layers"}
                onClick={() => setExploded(!exploded)}
              >
                {exploded ? <Box size={14} /> : <Layers size={14} />}
              </button>
              <button
                className="scene-tool"
                title="Rotate left"
                aria-label="Rotate left"
                onClick={() => controller.current?.rotate(-1)}
              >
                <ArrowLeft size={14} />
              </button>
              <button
                className="scene-tool"
                title={paused ? "Play animation" : "Pause animation"}
                aria-label={paused ? "Play animation" : "Pause animation"}
                onClick={() => setPaused(!paused)}
              >
                {paused ? <Play size={14} /> : <Pause size={14} />}
              </button>
              <button
                className="scene-tool"
                title="Rotate right"
                aria-label="Rotate right"
                onClick={() => controller.current?.rotate(1)}
              >
                <ArrowRight size={14} />
              </button>
              <button
                className="scene-tool"
                title="Reset view"
                aria-label="Reset view"
                onClick={() => {
                  controller.current?.reset();
                  setActive(0);
                  setExploded(true);
                }}
              >
                <RotateCcw size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
