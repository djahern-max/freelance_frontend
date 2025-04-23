import React from 'react';
import styles from './LegalPages.module.css';

const TermsOfServicePage = () => {
    return (
        <div className={styles.legalContainer}>
            <div className={styles.legalContent}>
                <h1 className={styles.legalTitle}>Terms of Service</h1>
                <div className={styles.legalSection}>
                    <p>
                        Welcome to Freelance.wtf ("we," "us," "our"). By registering for and using our platform, you
                        ("user," "you") agree to abide by these Terms of Agreement. Please
                        read them carefully, as they define your rights, responsibilities,
                        and the limitations of our liability.
                    </p>

                    <h2>1. Platform Neutrality</h2>
                    <p>
                        Freelance.wtf serves as a neutral platform to connect individuals and
                        businesses for the purpose of collaboration, communication, and
                        service delivery. We are not responsible for enforcing agreements
                        between parties or settling disputes. Any agreements or conflicts
                        are solely the responsibility of the users involved.
                    </p>

                    <h2>2. Financial Transactions</h2>
                    <p>
                        All financial transactions and exchanges of funds between users are
                        conducted outside of the Freelance.wtf platform. Freelance.wtf does not facilitate,
                        process, or monitor payments between users. Users are fully responsible
                        for ensuring timely payment and adherence to agreed terms.
                    </p>

                    <h2>3. User Responsibilities</h2>
                    <ul>
                        <li>
                            You must provide accurate and truthful information in your
                            profile, project postings, and communications.
                        </li>
                        <li>
                            You are responsible for complying with all applicable laws and
                            regulations in your jurisdiction.
                        </li>
                        <li>
                            You agree to indemnify and hold Freelance.wtf harmless from any claims,
                            damages, or disputes arising from your use of the platform.
                        </li>
                    </ul>

                    <h2>4. Limitations of Liability</h2>
                    <p>
                        Freelance.wtf is not liable for user actions, disputes, or agreements.
                        We are also not responsible for damages resulting from the use of
                        the platform, interruptions in service, or errors.
                    </p>

                    {/* QuickBooks Integration Terms */}
                    <h2>5. Third-Party Integrations</h2>
                    <p>
                        Freelance.wtf offers integration with third-party services, including Intuit QuickBooks. By using these integrations, you agree to the following:
                    </p>
                    <ul>
                        <li>
                            You authorize Freelance.wtf to access your QuickBooks data when you connect your account.
                        </li>
                        <li>
                            You understand that Freelance.wtf will access only the data necessary to provide the services you request.
                        </li>
                        <li>
                            You acknowledge that Freelance.wtf is not affiliated with or endorsed by Intuit Inc., and that QuickBooks is a registered trademark of Intuit Inc.
                        </li>
                        <li>
                            You are responsible for maintaining your QuickBooks account and credentials.
                        </li>
                    </ul>

                    <h2>6. Data Usage and Security</h2>
                    <p>
                        When you connect your QuickBooks account to Freelance.wtf:
                    </p>
                    <ul>
                        <li>
                            We access your financial data solely to provide analysis, insights, and the services you request.
                        </li>
                        <li>
                            We implement industry-standard security measures to protect your data.
                        </li>
                        <li>
                            We do not sell or rent your QuickBooks data to third parties.
                        </li>
                        <li>
                            We retain your data only as long as necessary to provide our services or as required by law.
                        </li>
                        <li>
                            You can revoke access to your QuickBooks data at any time through your account settings or by contacting us.
                        </li>
                    </ul>

                    <h2>7. Compliance with Intuit Requirements</h2>
                    <p>
                        Freelance.wtf complies with all Intuit Developer requirements and policies, including:
                    </p>
                    <ul>
                        <li>
                            We maintain the confidentiality and security of your QuickBooks data.
                        </li>
                        <li>
                            We only use APIs and methods approved by Intuit to access your data.
                        </li>
                        <li>
                            We follow Intuit's authentication and authorization protocols.
                        </li>
                        <li>
                            We promptly address any issues related to our QuickBooks integration.
                        </li>
                    </ul>

                    <h2>8. Service Limitations</h2>
                    <p>
                        You acknowledge that:
                    </p>
                    <ul>
                        <li>
                            Our integration with QuickBooks may be subject to temporary unavailability due to maintenance or technical issues.
                        </li>
                        <li>
                            The accuracy of analyses and insights depends on the accuracy of the data in your QuickBooks account.
                        </li>
                        <li>
                            Freelance.wtf is not a substitute for professional financial advice, accounting, or tax services.
                        </li>
                    </ul>

                    <h2>9. Acceptance of Terms</h2>
                    <p>
                        By registering for and using the Freelance.wtf platform, you acknowledge
                        that you have read, understood, and agree to these Terms of
                        Agreement. If you do not agree, you may not use the platform.
                    </p>

                    <h2>10. Changes to Terms</h2>
                    <p>
                        Freelance.wtf reserves the right to modify these terms at any time. We will notify users of significant changes. Your continued use of the platform after changes constitutes acceptance of the updated terms.
                    </p>

                    <h2>11. Contact Information</h2>
                    <p>
                        If you have questions about these terms or our QuickBooks integration, please contact us at support@freelance.wtf.
                    </p>
                </div>
                <div className={styles.lastUpdated}>Last updated: February 24, 2025</div>
            </div>
        </div>
    );
};

export default TermsOfServicePage;
