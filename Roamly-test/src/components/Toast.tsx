import React from 'react';

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
    const styles: Record<string, React.CSSProperties> = {
        success: { background: '#E6FFFA', borderLeft: '4px solid #10B981' },
        error:   { background: '#FEF2F2', borderLeft: '4px solid #EF4444' },
        info:    { background: '#EEF2FF', borderLeft: '4px solid #2563EB' },
    };

    return (
        <div className={`toast toast-${type}`} style={styles[type]}>
            <span style={{ flex: 1, fontSize: '14px', fontWeight: 500 }}>{message}</span>
            <button className="toast-close" onClick={onClose}>&times;</button>
        </div>
    );
};

export default Toast;
