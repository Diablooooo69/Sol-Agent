// Configuration for different environments
const config = {
    clientId: '495454303002-g9d5chp826hui4j6n597grrhv4rlj221.apps.googleusercontent.com',
    allowedDomains: [
        'localhost',
        '127.0.0.1',
        'netlify.app' // Add your Netlify domain here once deployed
    ]
};

// Check if the current domain is allowed
function isAllowedDomain() {
    const currentDomain = window.location.hostname;
    return config.allowedDomains.some(domain => currentDomain.includes(domain));
}

// Initialize Google Sign-In
function initializeGoogleSignIn() {
    if (!isAllowedDomain()) {
        console.error('Unauthorized domain');
        return;
    }

    try {
        google.accounts.id.initialize({
            client_id: config.clientId,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true
        });

        const buttonElement = document.getElementById("googleLoginButton");
        if (buttonElement) {
            google.accounts.id.renderButton(
                buttonElement,
                { 
                    theme: "outline", 
                    size: "large",
                    type: "standard",
                    shape: "rectangular",
                    text: "continue_with",
                    logo_alignment: "left"
                }
            );
        }

        // Check if user was previously logged in
        const storedProfile = localStorage.getItem('userProfile');
        if (storedProfile) {
            const profile = JSON.parse(storedProfile);
            updateUIWithUserProfile(profile);
        } else {
            google.accounts.id.prompt();
        }
    } catch (error) {
        console.error('Error initializing Google Sign-In:', error);
    }
}

// Update UI with user profile
function updateUIWithUserProfile(profile) {
    try {
        const nameElement = document.getElementById('userProfileName');
        const emailElement = document.getElementById('userProfileEmail');
        const imageElement = document.getElementById('userProfileImage');
        const iconElement = document.getElementById('userProfileIcon');
        const loginButton = document.getElementById('googleLoginButton');
        const profileSection = document.getElementById('userProfileSection');

        if (nameElement) nameElement.textContent = profile.name;
        if (emailElement) emailElement.textContent = profile.email;
        
        if (imageElement && profile.picture) {
            imageElement.src = profile.picture;
            imageElement.style.display = 'block';
            if (iconElement) iconElement.style.display = 'none';
        }

        if (loginButton) loginButton.style.display = 'none';
        if (profileSection) profileSection.style.display = 'block';
    } catch (error) {
        console.error('Error updating UI:', error);
    }
}

// Handle the sign-in response
function handleCredentialResponse(response) {
    try {
        const responsePayload = jwt_decode(response.credential);
        
        const profile = {
            email: responsePayload.email,
            name: responsePayload.name,
            picture: responsePayload.picture
        };

        // Store in localStorage
        localStorage.setItem('userProfile', JSON.stringify(profile));
        
        // Update UI
        updateUIWithUserProfile(profile);
    } catch (error) {
        console.error('Error handling credential response:', error);
    }
}

// Handle sign out
function handleSignOut() {
    try {
        // Clear local storage
        localStorage.removeItem('userProfile');
        
        // Reset UI
        const nameElement = document.getElementById('userProfileName');
        const emailElement = document.getElementById('userProfileEmail');
        const imageElement = document.getElementById('userProfileImage');
        const iconElement = document.getElementById('userProfileIcon');
        const loginButton = document.getElementById('googleLoginButton');
        const profileSection = document.getElementById('userProfileSection');

        if (nameElement) nameElement.textContent = 'Guest';
        if (emailElement) emailElement.textContent = 'Not logged in';
        if (imageElement) imageElement.style.display = 'none';
        if (iconElement) iconElement.style.display = 'block';
        if (loginButton) loginButton.style.display = 'block';
        if (profileSection) profileSection.style.display = 'none';

        // Sign out from Google
        google.accounts.id.disableAutoSelect();
    } catch (error) {
        console.error('Error signing out:', error);
    }
}

// Initialize when the page loads and Google API is ready
function waitForGoogleAPI() {
    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
        initializeGoogleSignIn();
    } else {
        setTimeout(waitForGoogleAPI, 100);
    }
}

// Start initialization when page loads
window.onload = waitForGoogleAPI; 