class Auth {
  constructor() {
    this.baseURL = CONFIG.API_BASE_URL;
    this.init();
  }

  init() {
    if (localStorage.getItem('token')) {
      window.location.href = 'index.html';
      return;
    }
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.getElementById('showRegister').addEventListener('click', (e) => {
      e.preventDefault();
      this.showRegisterForm();
    });
    document.getElementById('showLogin').addEventListener('click', (e) => {
      e.preventDefault();
      this.showLoginForm();
    });
    document.getElementById('loginFormElement').addEventListener('submit', (e) => this.handleLogin(e));
    document.getElementById('registerFormElement').addEventListener('submit', (e) => this.handleRegister(e));
  }

  async handleLogin(e) {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    // Validação básica
    if (!email || !password) {
      this.showError('Por favor, preencha todos os campos.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Entrando...';

    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        this.showSuccess('Login realizado com sucesso!');
        setTimeout(() => window.location.href = 'index.html', 1000);
      } else {
        this.showError(data.message || 'Credenciais inválidas. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      this.showError('Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Entrar';
    }
  }

  async handleRegister(e) {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;

    // Validação básica
    if (!name || !email || !password) {
      this.showError('Por favor, preencha todos os campos.');
      return;
    }

    if (password.length < 6) {
      this.showError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Criando conta...';

    try {
      const response = await fetch(`${this.baseURL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();
      if (response.ok) {
        this.showSuccess('Conta criada com sucesso! Redirecionando para login...');
        setTimeout(() => this.showLoginForm(), 2000);
      } else {
        this.showError(data.message || 'Erro ao criar conta. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro no registro:', error);
      this.showError('Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Criar conta';
    }
  }

  showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginEmail').focus();
    this.clearMessages();
  }

  showRegisterForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.getElementById('registerName').focus();
    this.clearMessages();
  }

  showError(message) {
    this.clearMessages();
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-error';
    errorDiv.textContent = message;
    errorDiv.setAttribute('role', 'alert');
    
    const activeForm = document.getElementById('loginForm').style.display !== 'none' 
      ? document.getElementById('loginForm') 
      : document.getElementById('registerForm');
    
    activeForm.insertBefore(errorDiv, activeForm.querySelector('form'));
  }

  showSuccess(message) {
    this.clearMessages();
    const successDiv = document.createElement('div');
    successDiv.className = 'alert alert-success';
    successDiv.textContent = message;
    successDiv.setAttribute('role', 'alert');
    
    const activeForm = document.getElementById('loginForm').style.display !== 'none' 
      ? document.getElementById('loginForm') 
      : document.getElementById('registerForm');
    
    activeForm.insertBefore(successDiv, activeForm.querySelector('form'));
  }

  clearMessages() {
    document.querySelectorAll('.alert').forEach(alert => alert.remove());
  }
}

new Auth();