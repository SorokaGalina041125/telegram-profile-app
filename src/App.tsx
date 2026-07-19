import { useState } from 'react';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
  allows_write_to_pm?: boolean;
  added_to_attachment_menu?: boolean;
}

interface UserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
  allows_write_to_pm?: boolean;
  added_to_attachment_menu?: boolean;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: TelegramUser;
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
      };
    };
  }
}

function getSessionFromURL(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('session');
}

function App() {
  const [userData, setUserData] = useState<UserData | null>(() => {
    const savedUser = localStorage.getItem('tg_user');
    if (savedUser) {
      try { return JSON.parse(savedUser); } catch { return null; }
    }
    return null;
  });

  const [sessionId] = useState<string | null>(() => {
    return getSessionFromURL();
  });

  const [isTelegram] = useState(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return false;
    tg.ready();
    tg.expand();

    const initData = tg.initDataUnsafe;
    if (initData.user) {
      const user = initData.user;
      const userInfo: UserData = {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        language_code: user.language_code,
        is_premium: user.is_premium,
        photo_url: user.photo_url,
        allows_write_to_pm: user.allows_write_to_pm,
        added_to_attachment_menu: user.added_to_attachment_menu,
      };
      localStorage.setItem('tg_user', JSON.stringify(userInfo));
      setUserData(userInfo);
    }
    return true;
  });

  return (
    <div className="app">
      <header className="header">
        <h1>👤 Профиль пользователя</h1>
        <p>Второе Mini App</p>
        {!isTelegram && (
          <p className="warning">⚠️ Открыто вне Telegram</p>
        )}
      </header>

      <main className="main">
        <section className="card">
          <h2>👤 Данные из Telegram</h2>
          {userData ? (
            <div className="user-info">
              {userData.photo_url && (
                <img src={userData.photo_url} alt="Avatar" className="avatar" />
              )}
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">ID:</span>
                  <span className="value">{userData.id}</span>
                </div>
                <div className="info-item">
                  <span className="label">Имя:</span>
                  <span className="value">{userData.first_name} {userData.last_name || ''}</span>
                </div>
                {userData.username && (
                  <div className="info-item">
                    <span className="label">Username:</span>
                    <span className="value">@{userData.username}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="warning">⚠️ Данные недоступны</p>
          )}
        </section>

        <section className="card">
          <h2>💾 Сессия из URL</h2>
          <div className="session-info">
            <p><strong>ID сессии:</strong> {sessionId || 'Не передан'}</p>
            <p className="hint">
              ID сессии передан через URL из бота. 
              Откройте другое приложение — ID будет таким же!
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;