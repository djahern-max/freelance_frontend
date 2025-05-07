import React, { useState } from 'react';
import styles from './ProfilePage.module.css';
import headshot from '../../images/headshot.png';

const ProfilePage = () => {
    const [showCopyTooltip, setShowCopyTooltip] = useState(false);

    const copyEmailToClipboard = () => {
        navigator.clipboard.writeText('dane@ryze.ai');
        setShowCopyTooltip(true);
        setTimeout(() => setShowCopyTooltip(false), 2000);
    };

    return (
        <div className={styles.profileContainer}>
            <div className={styles.profileHeader}>
                <div className={styles.profileImageContainer}>
                    <img
                        src={headshot}
                        alt="Dane Ahern"
                        className={styles.profileImage}
                    />
                </div>
                <div className={styles.profileHeaderContent}>
                    <h1 className={styles.name}>Dane Ahern</h1>
                    <h2 className={styles.title}>Full-Stack Developer & Finance Professional</h2>
                    <div className={styles.location}>Exeter, NH 03833</div>
                    <div className={styles.contact}>
                        <button
                            onClick={copyEmailToClipboard}
                            className={styles.emailButton}
                            aria-label="Copy email to clipboard"
                        >
                            dane@ryze.ai
                            <span className={`${styles.tooltip} ${showCopyTooltip ? styles.show : ''}`}>
                                Copied!
                            </span>
                        </button>
                        <span className={styles.separator}>|</span>
                        <a href="tel:6038125654" className={styles.contactLink}>(603) 812-5654</a>
                    </div>
                </div>
            </div>

            <section className={styles.section}>
                <h2 className={styles.sectionHeading}>Professional Summary</h2>
                <p className={styles.summaryText}>
                    Experienced accounting and finance professional with a true passion for programming and
                    technology. Blending financial expertise with self-taught programming skills in Python,
                    JavaScript, and SQL to create innovative solutions at the intersection of business and technology.
                    Experience developing analytics platforms and web applications using React, FastAPI, and
                    PostgreSQL. Seeking opportunities that leverage my unique combination of accounting
                    background and enthusiasm for technological advancement in digital solutions.
                </p>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionHeading}>Technical Experience</h2>
                <div className={styles.experienceItem}>
                    <div className={styles.experienceHeader}>
                        <h3 className={styles.positionTitle}>Founder</h3>
                        <span className={styles.company}>RYZE.ai & Analytics Hub</span>
                    </div>
                    <div className={styles.experienceSubheader}>
                        <span className={styles.dateRange}>May 2024 to Present</span>
                        <span className={styles.separator}>|</span>
                        <span className={styles.location}>Exeter, NH</span>
                    </div>
                    <ul className={styles.responsibilitiesList}>
                        <li>
                            <strong>Full-Stack Application Development:</strong> Built a complete analytics platform from the
                            ground up using Python/FastAPI backend, PostgreSQL database, and React frontend with
                            CSS Modules
                        </li>
                        <li>
                            <strong>Data Architecture Design:</strong> Implemented data tracking systems and database structures
                            to capture and analyze user behavior, pageviews, and conversion metrics on websites
                        </li>
                        <li>
                            <strong>API Integration:</strong> Developed APIs to enable seamless communication between frontend
                            and backend components, ensuring accurate data flow and reporting
                        </li>
                        <li>
                            <strong>UI/UX Implementation:</strong> Created responsive user interfaces focusing on data
                            visualization and dashboard components using React and modern CSS techniques
                        </li>
                        <li>
                            <strong>DevOps Configuration:</strong> Managed hosting environment, security implementations, and
                            deployment processes to ensure platform reliability and performance
                        </li>
                        <li>
                            <strong>Business Development:</strong> Presented technical concepts to investors in San Francisco,
                            translating complex technical capabilities into clear business value propositions
                        </li>
                    </ul>
                </div>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionHeading}>Technical Skills</h2>
                <div className={styles.skillsGrid}>
                    <div className={styles.skillRow}>
                        <div className={styles.skillBox}>
                            <h3 className={styles.skillCategoryTitle}>Languages</h3>
                            <p>Python, JavaScript, SQL, HTML, CSS</p>
                        </div>
                        <div className={styles.skillBox}>
                            <h3 className={styles.skillCategoryTitle}>Frameworks & Libraries</h3>
                            <p>React, FastAPI, PostgreSQL, Node.js</p>
                        </div>
                        <div className={styles.skillBox}>
                            <h3 className={styles.skillCategoryTitle}>Development Tools</h3>
                            <p>Git, GitHub, VS Code, Docker</p>
                        </div>
                    </div>
                    <div className={styles.skillBox} style={{ gridColumn: "1 / -1" }}>
                        <h3 className={styles.skillCategoryTitle}>Technical Specialties</h3>
                        <ul className={styles.specialtiesList}>
                            <li>Database design and optimization</li>
                            <li>API development</li>
                            <li>Analytics implementation</li>
                            <li>Data visualization</li>
                            <li>Full-stack web development</li>
                            <li>SEO-optimized code structure</li>
                        </ul>
                    </div>
                </div>
            </section>


            <section className={styles.section}>
                <h2 className={styles.sectionHeading}>Professional Experience</h2>

                <div className={styles.experienceItem}>
                    <div className={styles.experienceHeader}>
                        <h3 className={styles.positionTitle}>Controller</h3>
                        <span className={styles.company}>Severino Construction Co., Inc.</span>
                    </div>
                    <div className={styles.experienceSubheader}>
                        <span className={styles.dateRange}>December 2023 to December 2024</span>
                        <span className={styles.separator}>|</span>
                        <span className={styles.location}>Candia, NH</span>
                    </div>
                    <ul className={styles.responsibilitiesList}>
                        <li>Implemented data systems to automate financial reporting and enhance decision-making processes</li>
                        <li>Developed Excel automation solutions to streamline complex financial analysis and reporting</li>
                        <li>Created dashboard interfaces for executive teams to access real-time business metrics</li>
                        <li>Collaborated with IT teams on system integration and data flow improvements</li>
                    </ul>
                </div>

                <div className={styles.experienceItem}>
                    <div className={styles.experienceHeader}>
                        <h3 className={styles.positionTitle}>Chief Financial Officer (CFO)</h3>
                        <span className={styles.company}>CW Keller & Associates, Inc.</span>
                    </div>
                    <div className={styles.experienceSubheader}>
                        <span className={styles.dateRange}>January 2020 to November 2023</span>
                        <span className={styles.separator}>|</span>
                        <span className={styles.location}>Plaistow, NH</span>
                    </div>
                    <ul className={styles.responsibilitiesList}>
                        <li>Designed and implemented KPI dashboards using data visualization techniques to improve executive decision-making</li>
                        <li>Led digital transformation initiatives to modernize financial systems and reporting workflows</li>
                        <li>Utilized SQL queries and data analysis to support strategic decision-making during company growth</li>
                        <li>Managed implementation of new technology systems to support business expansion</li>
                    </ul>
                </div>

                <div className={styles.experienceItem}>
                    <div className={styles.experienceHeader}>
                        <h3 className={styles.positionTitle}>Controller</h3>
                        <span className={styles.company}>CW Keller & Associates, Inc.</span>
                    </div>
                    <div className={styles.experienceSubheader}>
                        <span className={styles.dateRange}>August 2014 to January 2020</span>
                        <span className={styles.separator}>|</span>
                        <span className={styles.location}>Plaistow, NH</span>
                    </div>
                    <ul className={styles.responsibilitiesList}>
                        <li>Built data systems using SQL and Excel to track performance metrics and support revenue growth</li>
                        <li>Implemented process automation to increase efficiency in financial reporting workflows</li>
                        <li>Created solutions for data analysis to improve budgeting accuracy across projects</li>
                        <li>Maintained data integrity and developed reporting systems to ensure accurate business intelligence</li>
                    </ul>
                </div>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionHeading}>Education & Certifications</h2>

                <div className={styles.educationItem}>
                    <h3 className={styles.degreeTitle}>Coding Boot Camp</h3>
                    <div className={styles.experienceSubheader}>
                        <span className={styles.dateRange}>2017-2018</span>
                        <span className={styles.separator}>|</span>
                        <span className={styles.institution}>University of New Hampshire</span>
                        <span className={styles.separator}>|</span>
                        <span className={styles.location}>Durham, NH</span>
                    </div>
                </div>

                <div className={styles.educationItem}>
                    <h3 className={styles.degreeTitle}>Master's Degree in Accounting</h3>
                    <div className={styles.experienceSubheader}>
                        <span className={styles.dateRange}>2011-2013</span>
                        <span className={styles.separator}>|</span>
                        <span className={styles.institution}>Southern New Hampshire University</span>
                        <span className={styles.separator}>|</span>
                        <span className={styles.location}>Manchester, NH</span>
                    </div>
                </div>

                <div className={styles.educationItem}>
                    <h3 className={styles.degreeTitle}>Bachelor's Degree in Business Administration</h3>
                    <div className={styles.experienceSubheader}>
                        <span className={styles.dateRange}>1997-2001</span>
                        <span className={styles.separator}>|</span>
                        <span className={styles.institution}>University of New Hampshire</span>
                    </div>
                </div>

                <div className={styles.educationItem}>
                    <h3 className={styles.degreeTitle}>CPA License</h3>
                    <div className={styles.experienceSubheader}>
                        <span className={styles.dateRange}>June 2014 to June 2025</span>
                        <span className={styles.separator}>|</span>
                        <span className={styles.location}>New Hampshire</span>
                    </div>
                </div>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionHeading}>About</h2>
                <div className={styles.videoContainer}>

                    <div className={styles.videoWrapper}>
                        <iframe
                            width="560"
                            height="315"
                            src="https://www.youtube.com/embed/msfyoHduw1U"
                            title="RYZE.ai Analytics Platform Overview"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className={styles.videoFrame}
                        ></iframe>
                    </div>
                </div>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionHeading}>Contact</h2>
                <div className={styles.contactContainer}>
                    <p className={styles.contactText}>
                        Interested in working together or learning more about my projects? Feel free to reach out!
                    </p>
                    <div className={styles.contactLinks}>
                        <button onClick={copyEmailToClipboard} className={styles.contactButton}>
                            Copy Email
                            <span className={`${styles.tooltip} ${showCopyTooltip ? styles.show : ''}`}>
                                Copied!
                            </span>
                        </button>
                        <a
                            href="https://www.linkedin.com/in/dane-j-ahern-4b5471354/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.contactButton}
                        >
                            LinkedIn
                        </a>
                        <a
                            href="https://github.com/djahern-max"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.contactButton}
                        >
                            GitHub
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ProfilePage;