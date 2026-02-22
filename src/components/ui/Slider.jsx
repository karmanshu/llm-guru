import './Slider.css';

export default function Slider({ label, value, onChange, min = 0, max = 1, step = 0.1, unit = '' }) {
      return (
            <div className="clay-slider-group">
                  <div className="clay-slider-header">
                        <label className="clay-slider-label">{label}</label>
                        <span className="clay-slider-value">{value}{unit}</span>
                  </div>
                  <input
                        type="range"
                        className="clay-slider"
                        min={min}
                        max={max}
                        step={step}
                        value={value}
                        onChange={(e) => onChange(parseFloat(e.target.value))}
                        aria-label={label}
                  />
            </div>
      );
}
