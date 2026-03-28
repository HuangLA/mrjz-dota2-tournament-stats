import React from 'react';
import './CrownIcon.css';

/**
 * 王冠图标组件 - 用于标记"乐邦詹士"隐藏成就
 */
const CrownIcon = ({ size = 28, className = '' }) => {
    return (
        <div className={`crown-icon ${className}`}>
            <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* 王冠主体 */}
                <path
                    d="M3 18h18v2H3v-2zm0-7l3 3 3-6 3 6 3-3 3 6 3-6v11H3V8z"
                    fill="url(#crownGradient)"
                    stroke="#B8860B"
                    strokeWidth="0.5"
                />
                {/* 王冠宝石装饰 */}
                <circle cx="6" cy="11" r="1.5" fill="#FF6B6B" />
                <circle cx="12" cy="8" r="1.5" fill="#4ECDC4" />
                <circle cx="18" cy="11" r="1.5" fill="#FF6B6B" />
                <defs>
                    <linearGradient id="crownGradient" x1="12" y1="8" x2="12" y2="20">
                        <stop offset="0%" stopColor="#FFD700" />
                        <stop offset="50%" stopColor="#FFA500" />
                        <stop offset="100%" stopColor="#FF8C00" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
};

export default CrownIcon;
