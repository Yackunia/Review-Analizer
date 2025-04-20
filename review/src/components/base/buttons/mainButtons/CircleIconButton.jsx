import './ButtonsStyles.css';

export default function CircleIconButton({ iconSrc, onClick }) {
  return (
    <button 
      className="circle-icon-button" 
      onClick={onClick}
    >
      <img src={iconSrc} alt="Поиск" />
    </button>
  );
}