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
  const [entities, setEntities] = useState<any>({});
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

  useEffect(() => {
    if (record === '') {
      const interval = setInterval(() => {
        id && axios.get(`${ENDPOINT}/getdata/${id}`)
              .then((res: any) => {
                if(res.data.status === "COMPLETED") {
                  setTranslation(res.data.translation);
                  setEntities(res.data.entities);
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

  const entitiesDisplay = record === '' ?
    <div className={styles.loader}>Loading...</div>:
    <table id='entitries'>
      <tbody>
        {/* <tr>
          <th style={{width: "100px"}}>{'Type'}</th>
          <th>{'Text'}</th>
        </tr> */}
        {entities["Entities"].map((entity: { Text: string; Type: string; }, index: number) => {
          const { Text, Type } = entity
          if (Type === "COMMERCIAL_ITEM" || Type === "EVENT" || Type === "LOCATION" || Type === "ORGANIZATION" || Type === "TITLE") {
            return (
              <tr key={index}>
                <td style={{width: "136px"}}>{Type}</td>
                <td style={{width: "calc(100% - 136px)"}}>
                  <a href={`https://www.google.com/search?q=${Text}`} target="_blank" className={styles.link}>
                    {Text}
                    <img src={require(`../../images/external_link.svg`).default} alt="" style={{margin: "-6px 0"}} />
                  </a>
                </td>
              </tr>
            )
          } else {
            return (
              <tr key={index}>
                <td style={{width: "136px"}}>{Type}</td>
                <td style={{width: "calc(100% - 136px)"}}>{Text}</td>
              </tr>
            )
          }
        })}
      </tbody>
    </table>

  const recordDisplay = record === '' ? 
  <div className={styles.loader}>Loading...</div> : <div className={styles.recordData}>{record}</div>;
  
  return (
    <div className={styles.bg}>
      {record && <div className={styles.langsArea}>
        {languageChoices}
      </div>}
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
          {entitiesDisplay}
        </div>
      </div>
      <div className={styles.recordSection}>
        <div className={styles.label}>Record:</div>
        {recordDisplay}
      </div>
    </div>
  );
};
