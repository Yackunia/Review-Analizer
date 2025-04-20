import { useState, useRef } from 'react';
import TextButton from '../buttons/mainButtons/TextButton';
import CircleIconButton from '../buttons/mainButtons/CircleIconButton';
import searchIcon from '../../../../public/icons/find.svg';
import './TopBarStyle.css';

export default function TopBar({ onSearch }) {
  const [inputValue, setInputValue] = useState('');
  const inputWrapperRef = useRef(null);

  const triggerSearchAnimation = () => {
    const wrapper = inputWrapperRef.current;
    if (wrapper) {
      wrapper.classList.add('input-search-trigger');
      setTimeout(() => wrapper.classList.remove('input-search-trigger'), 500);
    }
    onSearch(inputValue);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') triggerSearchAnimation();
  };

  return (
    <div className="top-bar">
      <div className="search-container">
        <div 
          className="search-input-wrapper" 
          ref={inputWrapperRef}
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Поиск..."
            className="search-input"
          />
          <div className="search-button-container">
            <CircleIconButton 
              iconSrc={searchIcon}
              onClick={triggerSearchAnimation}
            />
          </div>
        </div>
      </div>
      <div className="top-bar-action">
        <TextButton onClick={() => console.log('Справка')}>
          Справка
        </TextButton>
      </div>
    </div>
  );
}