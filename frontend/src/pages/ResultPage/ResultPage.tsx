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

  const { rekognition } = location.state;
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
                              <div className={styles.emotion}>
                                <img src={require(`../../images/${rekognitionItem.type}.svg`).default} className={styles.emotionIcon} alt="a" />
                                <br />
                                {rekognitionItem.type}
                                <br />
                                {Math.round(rekognitionItem.confidence * 100) / 100}%
                              </div>
                            );
                          })
                          .slice(0,5);

  const entities = {
    "Entities": [
      {
        "Text": "today",
        "Score": 0.97,
        "Type": "DATE",
        "BeginOffset": 14,
        "EndOffset": 19
      },
      {
        "Text": "Seattle",
        "Score": 0.95,
        "Type": "LOCATION",
        "BeginOffset": 23,
        "EndOffset": 30
      }
    ],
    "LanguageCode": "en"
  };

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
      <div className={styles.entitiesSection}>
        <div className={styles.label}>
          Entities:
          <table id='entitries'>
            <tbody>
              <tr>
                <th style={{width: "100px"}}>{'Type'}</th>
                <th>{'Text'}</th>
              </tr>
              {entities["Entities"].map((entity, index) => {
                const { Text, Type } = entity
                return (
                  <tr key={index}>
                    <td>{Type}</td>
                    <td>{Text}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className={styles.recordSection}>
        <div className={styles.label}>Record:</div>
      </div>
    </div>
  );
};
