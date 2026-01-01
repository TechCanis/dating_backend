const cities = require('./cities.json');

// Process cities into a map: State -> [City Names]
const citiesByState = {};
cities.forEach(city => {
    if (!citiesByState[city.state]) {
        citiesByState[city.state] = [];
    }
    citiesByState[city.state].push(city.name);
});

// Sort cities for better UX
Object.keys(citiesByState).forEach(state => {
    citiesByState[state].sort();
});

const appConfig = {
    // Dropdown Lists
    lists: {
        indianStates: [
            'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
            'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
            'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
            'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
            'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
            'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
            'Andaman and Nicobar Islands', 'Chandigarh',
            'Dadra and Nagar Haveli and Daman and Diu', 'Delhi',
            'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
        ],
        citiesByState: citiesByState,
        interestOptions: [
            'Music', 'Movies', 'Travel', 'Fitness', 'Cooking',
            'Art', 'Tech', 'Books', 'Gaming', 'Outdoors'
        ],
        hobbyOptions: [
            'Photography', 'Running', 'Yoga', 'Cycling', 'Dancing',
            'Painting', 'Gardening', 'Chess', 'Coding'
        ],
        genderOptions: [
            'Men', 'Women', 'Other'
        ],
        maritalOptions: [
            'Single', 'In a relationship', 'Divorced',
            'Separated', 'Widowed', 'Prefer not to say'
        ],
        lookingOptions: [
            'Dating', 'Friendship', 'I don’t know yet'
        ],
        interestedInOptions: ['Men', 'Women', 'Everyone']
    },

    // Subscription Plans
    subscriptionPlans: [
        {
            id: 'monthly',
            title: 'Monthly',
            price: 299,
            currencySymbol: '₹',
            durationDays: 30,
            durationLabel: '/ month',
            features: ['Unlimited Likes', 'See Who Likes You', 'Priority Showing'],
            isPopular: false
        },
        {
            id: 'quarterly',
            title: '3 Months',
            price: 599,
            currencySymbol: '₹',
            durationDays: 90,
            durationLabel: '/ 3 months',
            features: ['Save 33%', 'Unlimited Likes', 'See Who Likes You'],
            isPopular: false
        },
        {
            id: 'yearly',
            title: 'Yearly',
            price: 1999,
            currencySymbol: '₹',
            durationDays: 365,
            durationLabel: '/ year',
            features: ['Best Value', 'Save 45%', 'Travel Mode', 'No Ads Forever'],
            isPopular: true
        }
    ],

    // Global Config / Keys
    // Ideally from process.env, falling back to the test key for now as per instructions
    keys: {
        razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_RwYzTXUoFLLWp0'
    },

    // Default Limits
    limits: {
        ageMin: 18,
        ageMax: 60,
        searchRadiusKm: 100
    },

    // OTP Mode: 0=Test, 1=Firebase, 2=Otpless
    otpMode: process.env.OTP_MODE ? parseInt(process.env.OTP_MODE) : 1,

    // Legal Content (Editable from Backend)
    legal: {
        privacyPolicy: `
# PRIVACY POLICY

**Effective Date:** January 1, 2024

Welcome to **LovZa** ("we," "our," or "us"). We value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application (the "App") and our services.

By accessing or using LovZa, you agree to the terms of this Privacy Policy. If you do not agree, please do not use the App.

## 1. INFORMATION WE COLLECT

We collect information to provide and improve our services, match you with potential partners, and ensure the safety of our community.

### A. Information You Provide to Us
*   **Account Registration:** Name, phone number, email address, date of birth, gender, and password.
*   **Profile Information:** Photos, bio, interests, hobbies, job title, education, and other personal details you choose to display.
*   **User Content:** Messages, chats, and other content you send to other users.
*   **Customer Support:** Information you provide when you contact us for help.

### B. Information We Collect Automatically
*   **Usage Data:** Logs, interactions (swipes, matches), time spent on the App, features used, and crash reports.
*   **Device Information:** Device model, operating system, unique device identifiers (e.g., IMEI, advertising ID), and IP address.
*   **Location Data:** With your consent, we collect your precise geolocation to show you potential matches nearby. You can disable this in your device settings, but it may limit App functionality.

## 2. HOW WE USE YOUR INFORMATION

We use your data to:
*   **Create and Manage Accounts:** Verify your identity and manage your profile.
*   **Provide Services:** Enable matching, chatting, and other core features.
*   **Improve the App:** Analyze usage trends to enhance user experience and fix bugs.
*   **Safety & Security:** Monitor for fraud, harassment, and illegal activity; enforce our Terms and Conditions.
*   **Communications:** Send administrative updates, security alerts, and promotional offers (which you can opt-out of).
*   **Personalization:** Tailor content and recommendations based on your preferences.

## 3. SHARING OF INFORMATION

We respect your privacy and do not sell your personal data. We share information only in the following circumstances:

*   **With Other Users:** Your public profile data (photos, name, age, bio, interests) is visible to other users.
*   **Service Providers:** We engage third-party companies (e.g., cloud hosting, analytics, customer support) to help us operate the App. They are bound by confidentiality agreements.
*   **Legal Compliance:** We may disclose information if required by law, court order, or government request, or to protect our rights, safety, or property.
*   **Business Transfers:** If we are involved in a merger, acquisition, or asset sale, your information may be transferred.

## 4. YOUR RIGHTS AND CHOICES

*   **Access and Update:** You can view and edit your profile information directly within the App.
*   **Delete Account:** You can delete your account via the App settings. This will remove your profile from view and delete your personal information, subject to retention for legal or safety purposes.
*   **Location Permissions:** You can withdraw consent for location tracking in your device settings.
*   **Opt-Out:** You can unsubscribe from marketing emails at any time.

## 5. DATA SECURITY

We use administrative, technical, and physical security measures to help protect your personal information. However, no electronic transmission is 100% secure, so we cannot guarantee absolute security.

## 6. AGE REQUIREMENT

**LovZa is strictly for users aged 18 and older.** We do not knowingly collect data from minors. If we discover a user is under 18, we will delete their account and data immediately.

## 7. CHANGES TO THIS POLICY

We may update this Privacy Policy from time to time. We will notify you of any significant changes via the App or email. Your continued use of the App constitutes acceptance of the changes.

## 8. CONTACT US

If you have questions about this Privacy Policy, please contact us at:
**Email:** support@lovza.com
        `,
        termsConditions: `
# TERMS AND CONDITIONS

**Effective Date:** January 1, 2024

Please read these Terms and Conditions ("Terms") carefully before using the **LovZa** app (the "Service") operated by LovZa Team ("us", "we", or "our").

## 1. ACCEPTANCE OF TERMS

By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the Service.

## 2. ELIGIBILITY

*   **Minimum Age:** You must be at least 18 years old to create an account and use the Service.
*   **Legal Capacity:** You confirm that you have the right, authority, and capacity to enter into this agreement and to abide by all of the terms and conditions.
*   **No Previous Ban:** You represent that you have not been previously removed or banned from LovZa.

## 3. CHILD SAFETY AND ZERO TOLERANCE POLICY

**LovZa is committed to maintaining a safe environment and has a ZERO TOLERANCE policy towards Child Sexual Abuse and Exploitation (CSAE).**

*   **Strict Prohibition:** Any content depicting, promoting, or normalizing child sexual abuse or exploitation is strictly prohibited.
*   **Immediate Action:** Any user found sharing or promoting CSAM will be immediately and permanently banned.
*   **Reporting to Authorities:** We will report any instances of CSAE to the National Center for Missing & Exploited Children (NCMEC) and relevant law enforcement authorities.
*   **Automated Detection:** We employ automated scanning and moderation tools to detect and remove harmful content.

## 4. YOUR ACCOUNT

*   **Security:** You are responsible for maintaining the confidentiality of your login credentials. You account is for your personal use only.
*   **Accuracy:** You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate.
*   **Termination:** We reserve the right to terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.

## 5. SUBSCRIPTIONS AND PURCHASES

*   **Premium Features:** LovZa may offer products and services for purchase ("In-App Purchases") such as "Monthly", "Quarterly", or "Yearly" subscriptions.
*   **Payment:** Payments will be charged to your designated payment method upon confirmation of purchase.
*   **Renewal:** Subscriptions automatically renew unless auto-renew is turned off at least 24 hours before the end of the current period.
*   **Refunds:** All purchases are generally non-refundable unless required by law or at our sole discretion.

## 6. USER CONDUCT

You agree NOT to:
*   Use the Service for any illegal or unauthorized purpose.
*   Harass, bully, stalk, intimidate, assault, defame, harm, or otherwise mistreat any person.
*   Post User Content that is hate speech, threatening, sexually explicit, pornographic, violent, or contains nudity.
*   Spam, solicit money from, or defraud any members.
*   Impersonate any person or entity.
*   Create another account if we have already terminated your account, unless you have our permission.

## 7. CONTENT

*   **Your Content:** You retain ownership of the content you upload (photos, bio). By posting it, you grant us a worldwide, non-exclusive, royalty-free license to use, display, and distribute said content in connection with the Service.
*   **Monitoring:** We have the right, but not the obligation, to monitor and review User Content. We may remove any content that violates these Terms or is deemed offensive or harmful.

## 8. DISCLAIMERS

*   **"AS IS" Basis:** The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We disclaim all warranties of any kind, whether express or implied.
*   **No Guarantee of Matches:** We do not guarantee that you will find a match or that matches will be compatible.
*   **User Interactions:** You are solely responsible for your interactions with other users. We do not conduct criminal background checks on our users. **ALWAYS USE CAUTION AND COMMON SENSE WHEN INTERACTING WITH STRANGERS.**

## 9. LIMITATION OF LIABILITY

In no event shall LovZa, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.

## 10. GOVERNING LAW

These Terms shall be governed and construed in accordance with the laws of **India**, without regard to its conflict of law provisions.

## 11. CHANGES TO TERMS

We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.

## 12. CONTACT US

If you have questions about these Terms, please contact us at **support@lovza.com**.
        `
    }

};

module.exports = appConfig;
