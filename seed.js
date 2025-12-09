const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const Match = require('./src/models/Match');

dotenv.config();

const users = [
    {
        phoneNumber: '+15550101',
        name: 'Valentina',
        gender: 'Women',
        age: 24,
        bio: 'Architect in the making. Love to travel and explore new cultures.',
        interests: ['Travel', 'Architecture', 'Design', 'Art'],
        profileImages: [
            'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80'
        ],
        location: { type: 'Point', coordinates: [-73.935242, 40.730610] } // NYC
    },
    {
        phoneNumber: '+15550102',
        name: 'Maya',
        gender: 'Women',
        age: 26,
        bio: 'Digital nomad & coffee enthusiast. I love hiking, reading sci-fi, and trying new cuisines.',
        interests: ['Hiking', 'Coffee', 'Sci-Fi', 'Foodie'],
        profileImages: [
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'
        ],
        location: { type: 'Point', coordinates: [-118.243683, 34.052235] } // LA
    },
    {
        phoneNumber: '+15550103',
        name: 'Amelia',
        gender: 'Women',
        age: 23,
        bio: 'Bookworm and sunset lover. Always down for a deep conversation.',
        interests: ['Reading', 'Writing', 'Nature', 'Philosophy'],
        profileImages: [
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80'
        ],
        location: { type: 'Point', coordinates: [-0.127758, 51.507351] } // London
    },
    {
        phoneNumber: '+15550104',
        name: 'Elena',
        gender: 'Women',
        age: 25,
        bio: 'Fitness junkie and dog mom. Let’s go for a run!',
        interests: ['Fitness', 'Dogs', 'Running', 'Health'],
        profileImages: [
            'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80'
        ],
        location: { type: 'Point', coordinates: [2.352222, 48.856613] } // Paris
    },
    {
        phoneNumber: '+15550105',
        name: 'Sophia',
        gender: 'Women',
        age: 27,
        bio: 'Musician and dreamer. Music is my life.',
        interests: ['Music', 'Guitar', 'Concerts', 'Vinyl'],
        profileImages: [
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80'
        ],
        location: { type: 'Point', coordinates: [13.404954, 52.520008] } // Berlin
    },
    {
        phoneNumber: '+15550106',
        name: 'Liam',
        gender: 'Men',
        age: 28,
        bio: 'Tech entrepreneur and surfer. Chasing waves and startups.',
        interests: ['Tech', 'Surfing', 'Startups', 'Travel'],
        profileImages: [
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80'
        ],
        location: { type: 'Point', coordinates: [-122.419416, 37.774929] } // SF
    },
    {
        phoneNumber: '+15550107',
        name: 'Noah',
        gender: 'Men',
        age: 26,
        bio: 'Photographer and adventurer. Capturing moments.',
        interests: ['Photography', 'Adventure', 'Hiking', 'Cameras'],
        profileImages: [
            'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80'
        ],
        location: { type: 'Point', coordinates: [-87.629799, 41.878113] } // Chicago
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Clear existing data
        await User.deleteMany({});
        await Match.deleteMany({});
        console.log('Cleared existing Users and Matches');

        // Insert new users
        await User.insertMany(users);
        console.log('Seeded Users');

        process.exit();
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDB();
