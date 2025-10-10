// TypeScript demo with various issues for AI review
interface User {
    id: number;
    name: string;
    email: string;
}

class UserService {
    private users: User[] = [];
    
    // Missing async/await, no error handling
    addUser(userData: any) {  // Should be typed properly
        // No input validation
        const user = {
            id: Math.random(), // Should use proper ID generation
            name: userData.name,
            email: userData.email
        };
        
        this.users.push(user);
        
        // Potential memory leak - no cleanup
        setTimeout(() => {
            console.log("User added:", user.name);
        }, 1000);
    }
    
    // Inefficient search
    findUserByEmail(email: string): User | undefined {
        for (let i = 0; i < this.users.length; i++) {
            if (this.users[i].email === email) {
                return this.users[i];
            }
        }
        return undefined; // Could use Array.find()
    }
    
    // No error handling for async operation
    async saveToDatabase() {
        const response = await fetch('/api/users', {
            method: 'POST',
            body: JSON.stringify(this.users)  // Missing headers
        });
        
        return response.json(); // No error checking
    }
    
    // Potential race condition
    updateUser(id: number, updates: Partial<User>) {
        const userIndex = this.users.findIndex(u => u.id === id);
        if (userIndex !== -1) {
            // Direct mutation without validation
            Object.assign(this.users[userIndex], updates);
        }
    }
}
