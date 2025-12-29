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
# Privacy Policy

**1. Information We Collect**
We collect information you provide directly to us, such as when you create an account, update your profile, or communicate with us. This may include your name, phone number, gender, date of birth, photos, and interests.

**2. How We Use Your Information**
We use your information to:
*   Provide, maintain, and improve our services.
*   Match you with other users.
*   Send you notifications and updates.
*   Monitor and analyze trends and usage.

**3. Sharing of Information**
We do not share your personal information with third parties except as described in this policy or with your consent. Your profile information (name, age, photos, bio) is visible to other users of the app.

**4. Security**
We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access.

**5. Contact Us**
If you have any questions about this Privacy Policy, please contact us at support@lovza.com.
        `,
        termsConditions: `
# Terms and Conditions

**1. Acceptance of Terms**
By accessing or using our app, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the Service.

**2. Eligibility**
You must be at least 18 years old to create an account on LovZa. By creating an account, you represent and warrant that you are capable of entering into a binding agreement.

**3. User Content**
You are solely responsible for the content you post. You agree not to post content that is hate speech, threatening, sexually explicit, or pornographic.

**4. Prohibited Activities**
You agree not to use the Service for any illegal purpose or to harass, abuse, or harm another person.

**5. Termination**
We reserve the right to terminate or suspend your account at any time if you violate these Terms.

**6. Disclaimer**
The Service is provided "as is" without warranties of any kind. We do not guarantee that the App will be safe or secure.
        `
    }
};

module.exports = appConfig;
