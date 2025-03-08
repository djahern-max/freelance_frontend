// Add this to your utils folder as oauthDebug.js

/**
 * OAuth Debug Utility
 * 
 * This utility helps diagnose OAuth issues by displaying relevant information
 * and testing OAuth connections.
 */

/**
 * Log OAuth configuration and connection details
 * @param {string} provider - The OAuth provider (google, github, linkedin)
 * @param {string} url - The OAuth URL for this provider
 */
export const debugOAuthConnection = async (provider, url) => {
    console.group(`🔍 OAuth Debug: ${provider.toUpperCase()}`);
    console.log(`URL: ${url}`);

    try {
        // Just check if the authorization endpoint exists (don't actually authorize)
        const authUrlParts = new URL(url);
        console.log(`Protocol: ${authUrlParts.protocol}`);
        console.log(`Host: ${authUrlParts.host}`);
        console.log(`Pathname: ${authUrlParts.pathname}`);

        // Test if the endpoint is reachable
        const checkUrl = `${authUrlParts.protocol}//${authUrlParts.host}/favicon.ico`;

        // We're just checking if the domain exists and responds
        const response = await fetch(checkUrl, {
            method: 'HEAD',
            mode: 'no-cors' // This allows us to check the domain without CORS issues
        });

        console.log(`✅ Domain appears to be reachable`);
    } catch (error) {
        console.log(`❌ Error checking provider domain: ${error.message}`);
    }

    // Check backend connection for OAuth configuration
    try {
        const testEndpoint = `${process.env.REACT_APP_API_URL}/api/env-test`;
        const backendResponse = await fetch(testEndpoint);

        if (backendResponse.ok) {
            const data = await backendResponse.json();
            console.log(`Backend OAuth configuration:`);
            console.log(data);

            // Check specific provider configuration
            const clientIdExists = data[`${provider}_client_id_exists`];
            const clientSecretExists = data[`${provider}_client_secret_exists`];
            const redirectUrl = data.oauth_redirect_urls?.[provider];

            if (clientIdExists && clientSecretExists) {
                console.log(`✅ ${provider} credentials are configured`);
            } else {
                console.log(`❌ ${provider} credentials are missing: 
            Client ID: ${clientIdExists ? 'Yes' : 'No'}
            Client Secret: ${clientSecretExists ? 'Yes' : 'No'}`);
            }

            if (redirectUrl && redirectUrl !== 'Not set') {
                console.log(`✅ ${provider} redirect URL is configured: ${redirectUrl}`);
            } else {
                console.log(`❌ ${provider} redirect URL is not set or using default`);
            }
        } else {
            console.log(`❌ Could not connect to OAuth test endpoint`);
        }
    } catch (error) {
        console.log(`❌ Error checking backend OAuth configuration: ${error.message}`);
    }

    console.groupEnd();
};

/**
 * Add OAuth debug buttons to an app during development
 * This will be hidden in production
 */
export const OAuthDebugPanel = ({ googleUrl, githubUrl, linkedinUrl }) => {
    if (process.env.NODE_ENV !== 'development') return null;

    const panelStyle = {
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        zIndex: 9999,
        backgroundColor: '#f8f9fa',
        border: '1px solid #ddd',
        padding: '10px',
        borderRadius: '4px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    };

    const buttonStyle = {
        margin: '5px',
        padding: '5px 10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        cursor: 'pointer'
    };

    return (
        <div style={panelStyle}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>OAuth Debug</div>
            <button
                style={{ ...buttonStyle, backgroundColor: '#4285F4', color: 'white' }}
                onClick={() => debugOAuthConnection('google', googleUrl)}
            >
                Test Google
            </button>
            <button
                style={{ ...buttonStyle, backgroundColor: '#24292e', color: 'white' }}
                onClick={() => debugOAuthConnection('github', githubUrl)}
            >
                Test GitHub
            </button>
            <button
                style={{ ...buttonStyle, backgroundColor: '#0077B5', color: 'white' }}
                onClick={() => debugOAuthConnection('linkedin', linkedinUrl)}
            >
                Test LinkedIn
            </button>
        </div>
    );
};