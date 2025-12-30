const http = require('http');

function testRegistration() {
    const payload = JSON.stringify({
        phoneNumber: '+919999999911', // Unique number
        name: 'Test Age Range',
        gender: 'Men',
        age: 25,
        state: 'TestState',
        city: 'TestCity',
        preferredAgeMin: 22,
        preferredAgeMax: 32,
        interestedIn: 'Women'
    });

    const options = {
        hostname: '127.0.0.1',
        port: 5004,
        path: '/api/auth/register',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': payload.length
        }
    };

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            console.log('Status:', res.statusCode);
            if (res.statusCode === 201) {
                const json = JSON.parse(data);
                console.log('User ID:', json._id);
                getProfile(json.token);
            } else {
                console.log('Response:', data);
            }
        });
    });

    req.on('error', (e) => console.error(e));
    req.write(payload);
    req.end();
}

function getProfile(token) {
    const options = {
        hostname: '127.0.0.1',
        port: 5004,
        path: '/api/users/profile',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            const json = JSON.parse(data);
            console.log('Preferences:', JSON.stringify(json.preferences, null, 2));

            if (json.preferences && json.preferences.ageRange &&
                json.preferences.ageRange.min === 22 &&
                json.preferences.ageRange.max === 32) {
                console.log('SUCCESS: Age Range preserved!');
            } else {
                console.log('FAILURE: Age Range mismatch.');
            }
        });
    });

    req.on('error', (e) => console.error(e));
    req.end();
}

testRegistration();
