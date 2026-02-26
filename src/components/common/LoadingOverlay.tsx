import React from 'react';
import { Loader2, Activity } from 'lucide-react';
import styles from './LoadingOverlay.module.css';

interface LoadingOverlayProps {
    message?: string;
    fullScreen?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
    message = "Preparing your experience...",
    fullScreen = true
}) => {
    return (
        <div className={`${styles.overlay} ${fullScreen ? styles.fullScreen : styles.container}`}>
            <div className={styles.content}>
                <div className={styles.animationContainer}>
                    <div className={styles.outerRing}></div>
                    <div className={styles.innerRing}></div>
                    <div className={styles.iconWrapper}>
                        <Loader2 className={styles.spinnerIcon} size={48} />
                        <Activity className={styles.activityIcon} size={24} />
                    </div>
                </div>
                <p className={styles.message}>{message}</p>
                <div className={styles.progressTrack}>
                    <div className={styles.progressBar}></div>
                </div>
            </div>
        </div>
    );
};

export default LoadingOverlay;
