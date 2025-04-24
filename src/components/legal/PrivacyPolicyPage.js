import React from 'react';
import styles from './LegalPages.module.css';

const PrivacyPolicyPage = () => {
    return (
        <div className={styles.legalContainer}>
            <div className={styles.legalContent}>
                <h1 className={styles.legalTitle}>Privacy Policy</h1>
                <div className={styles.legalSection}>
                    <p>
                        At Freelance.wtf ("we," "us," "our"), we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform. Please read this privacy policy carefully.
                    </p>

                    <h2>1. Information We Collect</h2>
                    <p>We may collect information about you in various ways, including:</p>
                    <ul>
                        <li>
                            <strong>Personal Information:</strong> Name, email address, phone number, and other contact details you provide when registering.
                        </li>
                        <li>
                            <strong>Account Information:</strong> Login credentials and profile information.
                        </li>
                        <li>
                            <strong>Financial Data:</strong> When you connect your QuickBooks account, we access financial data necessary to provide our services.
                        </li>
                        <li>
                            <strong>Usage Data:</strong> Information about how you use our platform, including log data and analytics.
                        </li>
                    </ul>

                    <h2>2. QuickBooks Data Collection</h2>
                    <p>
                        When you connect your QuickBooks account to Freelance.wtf, we collect the following types of data:
                    </p>
                    <ul>
                        <li>
                            Company information and profile details
                        </li>
                        <li>
                            Account data (chart of accounts, balances)
                        </li>
                        <li>
                            Transaction data (invoices, bills, payments)
                        </li>
                        <li>
                            Customer and vendor information
                        </li>
                        <li>
                            Financial statements and reports
                        </li>
                    </ul>
                    <p>
                        This data is collected through Intuit's secure OAuth authentication process. You explicitly authorize this access when connecting your QuickBooks account to our platform.
                    </p>

                    <h2>3. How We Use Your Information</h2>
                    <p>We may use the information we collect for various purposes, including:</p>
                    <ul>
                        <li>
                            Providing, operating, and maintaining our platform
                        </li>
                        <li>
                            Analyzing your financial data to provide insights and recommendations
                        </li>
                        <li>
                            Improving our services and user experience
                        </li>
                        <li>
                            Communicating with you about our services
                        </li>
                        <li>
                            Ensuring the security of our platform
                        </li>
                        <li>
                            Complying with legal obligations
                        </li>
                    </ul>

                    <h2>4. Data Security</h2>
                    <p>
                        We implement appropriate technical and organizational measures to protect your personal and financial data, including:
                    </p>
                    <ul>
                        <li>
                            Encryption of sensitive data in transit and at rest
                        </li>
                        <li>
                            Secure authentication protocols
                        </li>
                        <li>
                            Regular security assessments and testing
                        </li>
                        <li>
                            Access controls and monitoring
                        </li>
                        <li>
                            Compliance with industry security standards
                        </li>
                    </ul>
                    <p>
                        We maintain a comprehensive security program specifically designed to protect QuickBooks financial data in accordance with Intuit's security requirements.
                    </p>

                    <h2>5. Data Sharing and Disclosure</h2>
                    <p>
                        We may share your information with:
                    </p>
                    <ul>
                        <li>
                            <strong>Service Providers:</strong> Third-party vendors who assist us in providing our services
                        </li>
                        <li>
                            <strong>Legal Requirements:</strong> When required by law, court order, or governmental authority
                        </li>
                        <li>
                            <strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets
                        </li>
                    </ul>
                    <p>
                        <strong>We do not sell, rent, or trade your QuickBooks financial data to third parties for marketing purposes.</strong>
                    </p>

                    <h2>6. Data Retention</h2>
                    <p>
                        We retain your QuickBooks data only as long as necessary to provide our services or as required by law. You can request deletion of your data at any time by contacting us.
                    </p>

                    <h2>7. Your Rights and Choices</h2>
                    <p>
                        You have certain rights regarding your personal information:
                    </p>
                    <ul>
                        <li>
                            <strong>Access:</strong> You can request access to your personal information
                        </li>
                        <li>
                            <strong>Correction:</strong> You can request correction of inaccurate information
                        </li>
                        <li>
                            <strong>Deletion:</strong> You can request deletion of your information
                        </li>
                        <li>
                            <strong>Restriction:</strong> You can request restriction of processing
                        </li>
                        <li>
                            <strong>Objection:</strong> You can object to certain types of processing
                        </li>
                        <li>
                            <strong>Data Portability:</strong> You can request transfer of your information
                        </li>
                    </ul>
                    <p>
                        You can disconnect your QuickBooks account at any time through your account settings.
                    </p>

                    <h2>8. Third-Party Services</h2>
                    <p>
                        Our platform integrates with Intuit QuickBooks. When you use this integration, you are also subject to Intuit's privacy policy, which can be found on their website.
                    </p>

                    <h2>9. Children's Privacy</h2>
                    <p>
                        Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children.
                    </p>

                    <h2>10. Changes to Privacy Policy</h2>
                    <p>
                        We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "last updated" date.
                    </p>

                    <h2>11. Contact Us</h2>
                    <p>
                        If you have questions or concerns about this Privacy Policy, please contact us at privacy@Freelance.wtf.
                    </p>
                </div>
                <div className={styles.lastUpdated}>Last updated: February 24, 2025</div>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;