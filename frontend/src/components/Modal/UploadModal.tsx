import React from 'react';
import PersonImage from '../../images/PersonImage.svg';
import BoxImages from '../../images/BoxImages.svg';
import { Button } from '../Button/Button';
import styles from './UploadModal.module.scss';

interface IUploadModal {
  onClickOutside: () => void;
}

export const UploadModal: React.FC<IUploadModal> = (props) => {
  const { onClickOutside } = props;
  
  return (
    <div className={styles.bg} onClick={() => onClickOutside()}>
      <div className={styles.box} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>Upload Video</div>
        <div className={styles.footer}>
          <Button content={"Submit"} onClick={() => {}} classname={styles.submit} />
        </div>
        <img src={PersonImage} className={styles.personImage} alt="PersonImage" />
        <img src={BoxImages} className={styles.boxImages} alt="BoxImages" />
      </div>
    </div>
  );
};
