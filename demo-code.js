// Demo code for AI Code Review testing
function processUserData(userData) {
    // Potential security issue - no input validation
    var result = eval("(" + userData + ")");
    
    // Performance issue - nested loops
    for (var i = 0; i < result.users.length; i++) {
        for (var j = 0; j < result.users[i].permissions.length; j++) {
            console.log(result.users[i].permissions[j]);
        }
    }
    
    // Potential null reference error
    return result.users.map(user => user.name.toUpperCase());
}

// Missing error handling
function fetchUserProfile(userId) {
    var password = "admin123"; // Hardcoded password - security issue
    var apiKey = "sk-1234567890abcdef"; // Exposed API key
    
    fetch(`https://api.example.com/users/${userId}?key=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            document.innerHTML = data.profile; // XSS vulnerability
        });
}

// Inefficient database query simulation
function getUserStats() {
    var stats = [];
    for (let i = 0; i < 1000; i++) {
        stats.push(database.query("SELECT * FROM users WHERE id = " + i)); // SQL injection risk
    }
    return stats;
}
