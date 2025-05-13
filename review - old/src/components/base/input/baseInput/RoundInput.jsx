import { forwardRef } from 'react';

const RoundInput = forwardRef(({ 
  hasButton, 
  button, 
  borderRadius = 4,
  ...props 
}, ref) => {
  return (
    <div className="input-with-button-wrapper" ref={ref}>
      <input 
        className="input-field" 
        style={{ 
          borderRadius,
          paddingRight: hasButton ? '50px' : '15px'
        }}
        {...props} 
      />
      {hasButton && (
        <div className="input-button-container">
          {button}
        </div>
      )}
    </div>
  );
});

export default RoundInput;