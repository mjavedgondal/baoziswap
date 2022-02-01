import React from 'react';
import classnames from 'classnames';

import s from './style.module.scss';

type TypeButtonProps = {
  children?: React.ReactElement[] | string;
  onClick?: () => void;
  secondary?: boolean;
  inverted?: boolean;
  normal?: boolean;
  disabled?: boolean;
  classNameCustom?: any;
  style?: any;
};

const Button: React.FC<TypeButtonProps> = ({
  children,
  onClick,
  secondary = false,
  normal = false,
  inverted = false,
  disabled = false,
  classNameCustom,
  style = {},
}) => {
  const className = secondary ? s.secondary : normal ? s.normal : inverted ? s.inverted : s.primary;
  const classNameDisabled = disabled ? s.disabled : null;
  // const classnames = [
  //   secondary && s.secondary,
  //   normal && s.normal,
  //   inverted && s.inverted,
  //   primary && s.primary,
  // ];

  const handleClick = () => {
    if (disabled) return;
    if (!onClick) return;
    onClick();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={() => {}}
      className={classnames(s.button, classNameCustom, className, classNameDisabled)}
      style={style}
    >
      {children}
    </div>
  );
};

export default React.memo(Button);
