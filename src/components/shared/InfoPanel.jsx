import './InfoPanel.css';

export default function InfoPanel({ children, icon = '💡' }) {
      return (
            <div className="info-panel">
                  <span className="info-panel__icon">{icon}</span>
                  <div className="info-panel__content">{children}</div>
            </div>
      );
}
