window.JazzAuth = {
  init: function (options) {
    const {
      clientId,
      onLogin,
      containerId = 'jazz-auth-container',
      buttonText = 'Continue with Jazz',
      buttonColor = '#1d4ed8',
    } = options;

    const tryInject = () => {
      const container = document.getElementById(containerId);
      if (container) {
        const button = document.createElement('button');
        button.innerHTML = `
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          ${buttonText}
        `;
        button.style.cssText = `
          display: flex; align-items: center; justify-content: center;
          background: ${buttonColor}; color: white; padding: 10px 16px;
          border-radius: 8px; border: none; font-weight: 600; cursor: pointer;
          transition: 0.2s; width: 100%;
        `;
        button.onmouseover = () => button.style.opacity = '0.9';
        button.onmouseout = () => button.style.opacity = '1';
        button.onclick = () => this.login({ clientId, onLogin });
        container.appendChild(button);
      } else {
        setTimeout(tryInject, 100);
      }
    };
    tryInject();
  },

  login: function ({ clientId, onLogin }) {
    const redirectUri = `${window.location.origin}/callback`;
    const popup = window.open(
      `http://localhost:4000/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`,
      'jazz-login',
      'width=500,height=600'
    );

    const poll = setInterval(() => {
      if (popup?.closed) {
        clearInterval(poll);
        const token = localStorage.getItem('jazz_token');
        if (token) {
          onLogin(token);
          window.location.reload();
        }
      }
    }, 500);
  }
};