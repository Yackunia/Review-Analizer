import { useState, useRef } from 'react';
import TextButton from '../buttons/mainButtons/TextButton';
import CircleIconButton from '../buttons/mainButtons/CircleIconButton';
import RoundIconButton from '../buttons/mainButtons/RoundIconButton';
import searchIcon from '../../../../public/icons/find.svg';
import backIcon from '../../../../public/icons/back.svg'
import './TopBarStyle.css';

export default function TopBar({ onSearch,  moveToPreviousPage}) {
  const [inputValue, setInputValue] = useState('');
  const inputWrapperRef = useRef(null);

  const triggerSearchAnimation = () => {
    onSearch(inputValue);
  };

  const goBack = () => {
	moveToPreviousPage();
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') triggerSearchAnimation();
  };

  return (
    <div className="top-bar">
      <div className="search-container">
			<RoundIconButton 
              iconSrc={backIcon}
              onClick={goBack}
            />
        <div 
          className="search-input-wrapper" 
          ref={inputWrapperRef}
        >		
          <input
            type="text"
			style={{marginLeft: "45px"}}
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