// FeatureTour.js
import { AlertCircle, Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import styles from './FeatureTour.module.css';

const FeatureTour = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  const steps = [
    {
      title: 'Group Your Work Requests',
      content:
        'Organize related requests into projects for better management. Select requests using the checkboxes on the left.',
      target: "[data-tour='request-checkbox']",
    },
    {
      title: 'Create or Choose Projects',
      content:
        'Add selected requests to an existing project or create a new one using the toolbar that appears.',
      target: "[data-tour='grouping-toolbar']",
    },
    {
      title: 'Track Progress',
      content:
        'Once grouped, track your requests and their status within each project.',
      target: "[data-tour='projects-section']",
    },
  ];

  useEffect(() => {
    const tourCompleted = localStorage.getItem('projectGroupingTourCompleted');
    if (tourCompleted) {
      setIsDismissed(true);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem('projectGroupingTourCompleted', 'true');
    setIsDismissed(true);
    if (onComplete) onComplete();
  };

  if (isDismissed) return null;

  return (
    <div className={styles.tourContainer}>
      <div className={styles.tourContent}>
        <div className={styles.header}>
          <div className={styles.titleContainer}>
            <AlertCircle className={styles.icon} />
            <h3 className={styles.title}>{steps[currentStep].title}</h3>
          </div>
          <button onClick={handleComplete} className={styles.closeButton}>
            <X />
          </button>
        </div>

        <p className={styles.description}>{steps[currentStep].content}</p>

        <div className={styles.footer}>
          <div className={styles.dots}>
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`${styles.dot} ${
                  idx === currentStep ? styles.activeDot : ''
                }`}
              />
            ))}
          </div>

          <div className={styles.buttons}>
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className={styles.previousButton}
              >
                Previous
              </button>
            )}
            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className={styles.nextButton}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className={styles.completeButton}
              >
                <Check className={styles.checkIcon} />
                Got it
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureTour;
