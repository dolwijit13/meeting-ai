import classnames from 'classnames';
import React, { useState } from 'react';
import styles from './ResultPage.module.scss';
import { useLocation } from "react-router";

interface IResultPage {}

export const ResultPage: React.FC<IResultPage> = (props: any) => {
  const [selectedLang, setSelectedLang] = useState<number>(0);
  const languages = ['TH', 'EN', 'JA'];
  const location = useLocation<any>();
  const { rekognition } = location.state;

  const languageChoices = languages.map((lang, idx) => (
    <div className={styles.langArea}>
      <div>{idx > 0 && '|'}</div>
      <div className={classnames(styles.langChoice, {[styles.selectedLang]: selectedLang === idx})} onClick={() => setSelectedLang(idx)}>
        {lang}
      </div>
    </div>
  ));
  
  return (
    <div className={styles.bg}>
      <div className={styles.langsArea}>
        {languageChoices}
      </div>
      <div className={styles.header}>
        Result
      </div>
      <div className={styles.emotionSection}>
        <div className={styles.label}>Emotions: {JSON.stringify(rekognition)} </div>
      </div>
      <div className={styles.recordSection}>
        <div className={styles.label}>Record:</div>
      </div>
    </div>
  );
};
