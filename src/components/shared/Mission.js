import React from 'react';
import { Sparkles, Users, Rocket, Building2 } from 'lucide-react';
import styles from './Mission.module.css';

const Mission = () => {
    return (
        <div className={styles.missionContainer}>
            <div className={styles.missionHeader}>Our Mission</div>


            <div className={styles.missionGrid}>
                <div className={styles.missionCard}>
                    <div className={styles.iconWrapper}>
                        <Sparkles className={styles.icon} />
                    </div>
                    <h2>Democratizing AI Development</h2>
                    <p>
                        We're creating a space where independent AI developers can showcase their talents,
                        connecting directly with those who need their expertise. No middlemen, no barriers
                        - just pure innovation.
                    </p>
                </div>

                <div className={styles.missionCard}>
                    <div className={styles.iconWrapper}>
                        <Users className={styles.icon} />
                    </div>
                    <h2>Supporting Independent Creators</h2>
                    <p>
                        Join a growing community of AI developers using their skills to make a real
                        difference. While big tech focuses on scale, we focus on individual impact
                        and personalized solutions.
                    </p>
                </div>

                <div className={styles.missionCard}>
                    <div className={styles.iconWrapper}>
                        <Building2 className={styles.icon} />
                    </div>
                    <h2>Transforming Workplaces</h2>
                    <p>
                        Helping small and mid-sized businesses break free from routine tasks.
                        Let AI handle the paperwork while your team focuses on growth, innovation,
                        and what truly matters.
                    </p>
                </div>

                <div className={styles.missionCard}>
                    <div className={styles.iconWrapper}>
                        <Rocket className={styles.icon} />
                    </div>
                    <h2>Rising Together</h2>
                    <p>
                        RYZE.ai is more than a platform - it's a movement. We believe in the power
                        of individual creators to shape the future of AI, making it more accessible,
                        personal, and impactful for everyone.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Mission;