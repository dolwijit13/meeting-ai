import React, { Component, useState } from 'react';
import axios from 'axios'

const ENDPOINT = process.env.REACT_APP_BACKEND || 'http://localhost:10000';

interface IUploader {
}

export const Uploader: React.FC<IUploader> = (props) => {
    const [selectedFile, setSelectedFile] = useState<any>('');

    const onChangeHandler = (event: any) => {
        setSelectedFile(event.target.files[0])
        console.log(event.target.files[0]);
    };

    const handleSubmit = (event: any) => {
        const config = {     
            headers: { 'Content-Type': 'multipart/form-data' }
        }
        const formData = new FormData();

		formData.append('File', selectedFile);
        axios.post(`${ENDPOINT}/upload`, formData, config)
            .then((res: any) => {
                console.log(res.data);
            })
            .catch((error: any) => {
                console.log(error)
            })
    };

    return (
        <div>
            <label>
                Upload a file: <br /><br />
                <input type="file" name="file" onChange={onChangeHandler} />
            </label>
            <br /><br />
            <button onClick={handleSubmit}>
                Upload
            </button>
        </div>
    );
}