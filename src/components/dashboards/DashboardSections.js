import { useEffect, useState } from 'react';
import styles from './DashboardSections.module.css';

const DashboardSections = ({
  sections,
  renderSection,
  showTutorial = false,
  loading = false,
}) => {
  const [expandedSections, setExpandedSections] = useState({});
  const [sectionOrder, setSectionOrder] = useState([]);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(() => {
    return localStorage.getItem('dashboardTutorialSeen') === 'true';
  });

  useEffect(() => {
    if (showTutorial && !hasSeenTutorial) {
      const timer = setTimeout(() => {
        setHasSeenTutorial(true);
        localStorage.setItem('dashboardTutorialSeen', 'true');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showTutorial, hasSeenTutorial]);

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => {
      const newState = { ...prev };
      newState[sectionId] = !prev[sectionId];
      return newState;
    });

    setSectionOrder((prev) => {
      const newOrder = prev.filter((id) => id !== sectionId);
      if (!expandedSections[sectionId]) {
        return [sectionId, ...newOrder];
      }
      return newOrder;
    });
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loading}>Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {showTutorial && !hasSeenTutorial && (
        <div className={styles.tutorialHint}>
          Click any card to view more details
        </div>
      )}

      <div className={styles.gridContainer}>
        {sections.map(({ id, icon: Icon, title, count }) => (
          <div
            key={id}
            onClick={() => toggleSection(id)}
            className={`${styles.statCard} ${
              expandedSections[id] ? styles.active : ''
            }`}
          >
            <Icon className={styles.icon} />
            <div className={styles.statInfo}>
              <h3>{title}</h3>
              <p>{count}</p>
            </div>
          </div>
        ))}
      </div>

      {sectionOrder.map(
        (sectionId) =>
          expandedSections[sectionId] && (
            <div key={sectionId} className={styles.expandedSection}>
              {renderSection(sectionId)}
            </div>
          )
      )}
    </div>
  );
};

export default DashboardSections;
