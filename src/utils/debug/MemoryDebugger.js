// File: src/utils/debug/MemoryDebugger.js
import React, { useEffect, useState } from 'react';
import styles from './MemoryDebugger.module.css';

const withMemoryDebug = (WrappedComponent, componentName = 'Component') => {
    return function MemoryDebugger(props) {
        const [mountCount, setMountCount] = useState(0);
        const [renderCount, setRenderCount] = useState(0);
        const [memoryUsage, setMemoryUsage] = useState(null);

        useEffect(() => {
            const debugInfo = {
                componentName,
                mountTime: new Date().toISOString(),
                props: Object.keys(props)
            };

            console.log(`[MemoryDebug] Mount - ${componentName}:`, debugInfo);
            setMountCount(prev => prev + 1);

            // Check memory usage if available
            if (window.performance && window.performance.memory) {
                setMemoryUsage(window.performance.memory.usedJSHeapSize / (1024 * 1024));
            }

            // Track event listeners
            const eventListeners = [];
            const originalAddEventListener = window.addEventListener;
            window.addEventListener = function (type, listener, options) {
                eventListeners.push({ type, listener });
                originalAddEventListener.call(window, type, listener, options);
            };

            return () => {
                console.log(`[MemoryDebug] Unmount - ${componentName}`, {
                    mountDuration: new Date() - new Date(debugInfo.mountTime),
                    eventListenersCount: eventListeners.length
                });

                // Restore original addEventListener
                window.addEventListener = originalAddEventListener;

                // Clean up event listeners
                eventListeners.forEach(({ type, listener }) => {
                    window.removeEventListener(type, listener);
                });
            };
        }, []);

        useEffect(() => {
            setRenderCount(prev => prev + 1);
        });

        return (
            <div className={styles.container}>
                <WrappedComponent {...props} />
                {process.env.NODE_ENV === 'development' && (
                    <div className={styles.debugPanel}>
                        <div className={styles.debugItem}>Component: {componentName}</div>
                        <div className={styles.debugItem}>Mounts: {mountCount}</div>
                        <div className={styles.debugItem}>Renders: {renderCount}</div>
                        {memoryUsage && <div className={styles.debugItem}>Memory: {memoryUsage.toFixed(2)} MB</div>}
                    </div>
                )}
            </div>
        );
    };
};

export default withMemoryDebug;