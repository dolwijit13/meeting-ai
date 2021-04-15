import classnames from 'classnames';
import React, { useState } from 'react';
import styles from './ResultPage.module.scss';
import { useLocation } from "react-router";
import { IRekognitionItem, IRekognitionObject, IRekognitionType } from '../../components/type';

interface IResultPage {}

export const ResultPage: React.FC<IResultPage> = (props: any) => {
  const [selectedLang, setSelectedLang] = useState<number>(0);
  const languages = ['TH', 'EN', 'JA'];
  const location = useLocation<any>();
  // const { rekognition } = location.state;
  const rekognition: IRekognitionObject = {
    ANGRY: 150,
    SAD: 7,
    CONFUSED: 1,
    DISGUSTED: 1,
    SURPRISED: 1,
    HAPPY: 800,
    CALM: 40,
    n: 10
  };
  const rekognitionArray: IRekognitionItem[] = Object.keys(rekognition).reduce((acc: IRekognitionItem[], key: string) => {
    if(key === 'n') return acc
    const type = key as IRekognitionType;
    const rekognitionItem: IRekognitionItem = {
      type,
      confidence: ((rekognition[type] || 0) / rekognition.n)
    };
    acc.push(rekognitionItem)
    return acc
  }, []);
  const emotionObjects = rekognitionArray
                          .sort((a, b) => b.confidence - a.confidence)
                          .map((rekognitionItem: IRekognitionItem) => {
                            return (
                              <div>{rekognitionItem.type} {rekognitionItem.confidence}%</div>
                            );
                          })
                          .slice(0,5);


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
        <div className={styles.label}>
          <span>Emotions:</span>
          <div className={styles.emotions}>{emotionObjects}</div>
        </div>
      </div>
      <div className={styles.recordSection}>
        <div className={styles.label}>Record:</div>
      </div>
    </div>
  );
};
