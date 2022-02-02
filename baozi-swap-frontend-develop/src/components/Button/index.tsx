import React from 'react';
import { observer } from 'mobx-react';

type TypeButtonProps = {
  children: any;
  onClick: () => void;
  className: any;
};

const Button: React.FC<TypeButtonProps> = observer(({ children, onClick, className }) => {
  const handleClick = () => {
    if (!onClick) return;
    onClick();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={() => {}}
      className={className}
    >
      {children}
    </div>
  );
});

export default Button;
