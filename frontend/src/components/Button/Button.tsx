import classnames from 'classnames';
import React from 'react';
import styles from './Button.module.scss';

interface IButton {
  content: string;
  onClick: () => void;
  classname?: string;
}

export const Button: React.FC<IButton> = (props) => {
  const { content, onClick, classname } = props;

  return (
    <div className={classnames(styles.bg, classname)} onClick={() => onClick()}>
      <div className={styles.content}>{content}</div>
    </div>
  )
};
