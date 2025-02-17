import React, { useState, useEffect } from 'react';

const MemoryMonitor = () => {
    const [memoryUsage, setMemoryUsage] = useState(null);
    const [memoryHistory, setMemoryHistory] = useState([]);

    useEffect(() => {
        let timeoutId;

        const updateMemoryUsage = () => {
            if (window.performance && window.performance.memory) {
                const { usedJSHeapSize, totalJSHeapSize } = window.performance.memory;
                const currentUsage = {
                    used: Math.round(usedJSHeapSize / (1024 * 1024)),
                    total: Math.round(totalJSHeapSize / (1024 * 1024)),
                    timestamp: Date.now()
                };

                setMemoryUsage(currentUsage);

                // Only update history if we have valid data
                setMemoryHistory(prev => {
                    const newHistory = [...prev.slice(-60), currentUsage];

                    // Check for significant increases
                    if (newHistory.length > 1) {
                        const firstPoint = newHistory[0];
                        const increase = currentUsage.used - firstPoint.used;
                        if (increase > 5) {
                            console.warn(`Memory increased by ${increase}MB in the last minute`);
                            console.warn('Current memory usage:', currentUsage);
                        }
                    }

                    return newHistory;
                });
            }
            timeoutId = setTimeout(updateMemoryUsage, 1000);
        };

        updateMemoryUsage();
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, []); // Remove memoryHistory dependency to prevent unnecessary reruns

    // Add null check before rendering
    if (!memoryUsage) {
        return null; // Or return a loading state
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: 10,
            right: 10,
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            zIndex: 9999
        }}>
            Memory: {memoryUsage.used}MB / {memoryUsage.total}MB
            {memoryHistory.length > 1 && (
                <div>
                    Δ: {memoryHistory[memoryHistory.length - 1].used - memoryHistory[0].used}MB/min
                </div>
            )}
        </div>
    );
};

export default MemoryMonitor;