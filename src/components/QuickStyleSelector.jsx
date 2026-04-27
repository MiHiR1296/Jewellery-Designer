import React from 'react';
import { Sparkles } from 'lucide-react';
import {
  getMaterialSwatches,
  getStylePresetsForModel,
} from '../config/jewelleryUi';

const swatchColors = {
  gold: '#d9a629',
  silver: '#d7dce1',
  platinum: '#c8ccd1',
  'rose-gold': '#d9a08a',
  bronze: '#a7692b',
  copper: '#b86a32',
  diamond: '#f8fbff',
  ruby: '#b61d48',
  sapphire: '#2354b8',
  emerald: '#2f9d69',
  amethyst: '#8c58c6',
  topaz: '#e8a94b',
};

const QuickStyleSelector = ({
  selectedModel,
  selectedStyleId,
  onStyleSelect,
}) => {
  const presets = getStylePresetsForModel(selectedModel);

  if (!presets.length) return null;

  return (
    <section className="jewellery-control-section">
      <div className="jewellery-section-title">
        <Sparkles className="h-4 w-4" />
        <span>Styles</span>
      </div>

      <div className="jewellery-style-grid">
        {presets.map((style) => {
          const selected = selectedStyleId === style.id;
          const swatches = getMaterialSwatches(style);

          return (
            <button
              key={style.id}
              type="button"
              onClick={() => onStyleSelect(style.id)}
              className={`jewellery-style-card ${selected ? 'is-selected' : ''}`}
              aria-pressed={selected}
            >
              <span>{style.name}</span>
              <span className="jewellery-style-swatches" aria-hidden="true">
                {swatches.map((swatch) => (
                  <span
                    key={swatch}
                    className="jewellery-mini-swatch"
                    style={{ backgroundColor: swatchColors[swatch] || '#ddd6cc' }}
                  />
                ))}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default QuickStyleSelector;
