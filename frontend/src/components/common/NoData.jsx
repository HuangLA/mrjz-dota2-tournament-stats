import React from 'react';
import { Empty } from 'antd';
import './NoData.css';

const NoData = ({ message = '暂无数据' }) => {
    return (
        <div className="no-data-container">
            <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                    <span className="no-data-text">{message}</span>
                }
            />
        </div>
    );
};

export default NoData;
