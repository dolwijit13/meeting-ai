import React, { useState } from 'react';
import axios from 'axios'
import { Button } from '../Button/Button';
import styles from './Uploader.module.scss';
import { useHistory } from 'react-router';

const ENDPOINT = process.env.REACT_APP_BACKEND || 'http://localhost:10000';

interface IUploader {
}

export const Uploader: React.FC<IUploader> = (props) => {
    const [selectedFile, setSelectedFile] = useState<any>('');
    const [uploaded, setUploaded] = useState<boolean>(false);
    const history = useHistory();

    const onChangeHandler = (event: any) => {
        setSelectedFile(event.target.files[0])
        console.log(event.target.files[0]);
    };

    const handleSubmit = () => {
        setUploaded(true);
        const config = {     
            headers: { 'Content-Type': 'multipart/form-data' }
        }
        const formData = new FormData();

		formData.append('File', selectedFile);
        axios.post(`${ENDPOINT}/upload`, formData, config)
            .then((res: any) => {
                history.push(`/result`, res.data);
            })
            .catch((error: any) => {
                console.log(error)
            })
    };

    return uploaded? 
    (
        <div>
            loading
        </div>
    ):
    (
        <div>
            <label>
                Upload a file: <br /><br />
                <input type="file" name="file" onChange={onChangeHandler} />
            </label>
            <br /><br />
            <div className={styles.footer}>
                <Button content={"Submit"} onClick={handleSubmit} classname={styles.submit} />
            </div>
        </div>
    );
}