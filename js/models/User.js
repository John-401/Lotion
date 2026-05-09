class User {
    constructor(name, email, password) {
        this.name = name;
        this.email = email;
        this.password = password;
    }

    static register(name, email, password) {
        let users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Verificar si el correo ya existe
        if (users.find(u => u.email === email)) {
            alert('El correo ya está registrado.');
            return false;
        }
        
        const newUser = new User(name, email, password);
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        alert('Registro exitoso. Ahora puedes iniciar sesión.');
        return true;
    }

    static login(email, password) {
        let users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            return true;
        }
        
        alert('Credenciales incorrectas.');
        return false;
    }

    static logout() {
        localStorage.removeItem('currentUser');
    }

    static getCurrentUser() {
        return JSON.parse(localStorage.getItem('currentUser'));
    }
}