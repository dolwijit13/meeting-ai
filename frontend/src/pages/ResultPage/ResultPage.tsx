import classnames from 'classnames';
import React, { useState, useEffect } from 'react';
import styles from './ResultPage.module.scss';
import { useLocation } from "react-router";
import { IRekognitionItem, IRekognitionObject, IRekognitionType } from '../../components/type';
import axios from 'axios';

const ENDPOINT = process.env.REACT_APP_BACKEND || 'http://localhost:10000';

interface IResultPage {}

export const ResultPage: React.FC<IResultPage> = (props: any) => {
  const [selectedLang, setSelectedLang] = useState<number>(0);
  const lang = ['th', 'en', 'ja'];
  const location = useLocation<any>();
  const [record, setRecord] = useState<string>('');
  const [translation, setTranslation] = useState<any>({});

  const { rekognition, id } = location.state;
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

  useEffect(() => {
    if (record === '') {
      const interval = setInterval(() => {
        id && axios.get(`${ENDPOINT}/getdata/${id}`)
              .then((res: any) => {
                if(res.data.status === "COMPLETED") {
                  setTranslation(res.data.translation);
                  setRecord(res.data.translation[lang[selectedLang]].key);
                  clearInterval(interval);            
                }
              })
              .catch((error: any) => {
                  console.log(error)
              })
      }, 2000);
      return () => clearInterval(interval);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChangeLang = (idx: number) => {
    setSelectedLang(idx)
    setRecord(translation[lang[idx]].key);
  }

  const languageChoices = lang.map((lang, idx) => (
    <div className={styles.langArea}>
      <div>{idx > 0 && '|'}</div>
      <div className={classnames(styles.langChoice, {[styles.selectedLang]: selectedLang === idx})} onClick={() => onChangeLang(idx)}>
        {lang.toUpperCase()}
      </div>
    </div>
  ));

  const recordDisplay = record === '' ? 
  <div className={styles.loader}>Loading...</div> : <div className={styles.recordData}>{record}</div>;
  
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
        {recordDisplay}
      </div>
    </div>
  );
};
