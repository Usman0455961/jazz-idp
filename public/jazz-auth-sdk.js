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
          <img src="jazz-logo.png" alt="Jazz Logo" style="width: 20px; height: 20px; margin-right: 8px;" />
          ${buttonText}
        `;
        button.style.cssText = `
          display: flex; align-items: center; justify-content: center;
          background: ${buttonColor}; color: white; padding: 10px 16px;
          border-radius: 8px; border: none; font-weight: 600; cursor: pointer;
          transition: 0.2s; width: 100%; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          font-size: 16px;
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
        onLogin?.();  // Just notify
        window.location.reload();  // Force re-check
      }
    }, 500);
  }
};