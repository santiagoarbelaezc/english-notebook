import React from 'react';
import styles from './LoadingScreen.module.css';
import huskyLoader from '../../assets/icons/husky2.png';

const LoadingScreen: React.FC = () => {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.imageWrapper}>
                    <img src={huskyLoader} alt="Loading..." className={styles.loaderImage} />
                    <div className={styles.glow}></div>
                </div>
                <div className={styles.textContainer}>
                    <p className={styles.loadingText}>Preparing your lesson</p>
                    <div className={styles.progressBar}>
                        <div className={styles.progressFill}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;
