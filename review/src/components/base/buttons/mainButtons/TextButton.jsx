import './ButtonsStyles.css';

export default function TextButton({ children, onClick, isActive = false }) {
  return (
    <button 
      className={`text-button ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}