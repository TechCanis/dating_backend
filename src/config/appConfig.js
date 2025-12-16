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
        interestOptions: [
            'Music', 'Movies', 'Travel', 'Fitness', 'Cooking',
            'Art', 'Tech', 'Books', 'Gaming', 'Outdoors'
        ],
        hobbyOptions: [
            'Photography', 'Running', 'Yoga', 'Cycling', 'Dancing',
            'Painting', 'Gardening', 'Chess', 'Coding'
        ],
        genderOptions: [
            'Male', 'Female', 'Non-binary', 'Prefer not to say'
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
        razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag'
    },

    // Default Limits
    limits: {
        ageMin: 18,
        ageMax: 60,
        searchRadiusKm: 100
    }
};

module.exports = appConfig;
