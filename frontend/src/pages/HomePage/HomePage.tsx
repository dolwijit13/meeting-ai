import React, { useState } from 'react';
import OnlineMeeting from '../../images/OnlineMeeting.svg';
import { Button } from '../../components/Button/Button';
import { UploadModal } from '../../components/Modal/UploadModal';
import styles from './HomePage.module.scss';

interface IHomePage {}

export const HomePage: React.FC<IHomePage> = (props) => {
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);

  return (
    <div className={styles.bg}>
      <div className={styles.header}>
        Meeting AI
      </div>
      <img src={OnlineMeeting} className={styles.image} alt="OnlineMeetingImage" />
      <Button content={"Let's Upload"} onClick={() => setShowUploadModal(true)} />
      {showUploadModal && <UploadModal onClickOutside={() => setShowUploadModal(false)} />}
    </div>
  );
};
