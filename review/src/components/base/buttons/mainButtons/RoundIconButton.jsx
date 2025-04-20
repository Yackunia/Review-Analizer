import './ButtonsStyles.css';

export default function RoundIconButton({ 
  iconSrc, 
  onClick, 
  altText = "Кнопка",
  children,
  ...props 
}) {
  return (
    <button 
      className="round-icon-button" 
      onClick={onClick}
      {...props}
    >
      {iconSrc && <img src={iconSrc} alt={altText} className="button-icon" />}
      {children}
    </button>
  );
}