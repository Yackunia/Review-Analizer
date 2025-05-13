import './ButtonsStyles.css';

export default function RoundButton({ children, onClick, isActive }) {
  const buttonClass = isActive ? 'main-button main-button-active' : 'main-button';
  
  return (
    <button className={buttonClass} onClick={onClick}>
      {children}
    </button>
  );
}