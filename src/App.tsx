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
        CloudStorage: {
          getItem: (key: string, callback: (err: Error | null, value?: string) => void) => void;
          setItem: (key: string, value: string, callback?: (err: Error | null, success?: boolean) => void) => void;
          getItems: (keys: string[], callback: (err: Error | null, values?: Record<string, string>) => void) => void;
          removeItem: (key: string, callback?: (err: Error | null, success?: boolean) => void) => void;
        };
      };
    };
  }
}

function App() {
  const [userData, setUserData] = useState<UserData | null>(() => {
    const savedUser = localStorage.getItem('tg_user');
    if (savedUser) {
      try { return JSON.parse(savedUser); } catch { return null; }
    }
    return null;
  });

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [cloudSessionId, setCloudSessionId] = useState<string | null>(null);
  const [storageType, setStorageType] = useState<'local' | 'cloud'>('local');
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

    // Пробуем загрузить сессию из Cloud Storage
    if (tg.CloudStorage) {
      tg.CloudStorage.getItem('shared_session', (getErr, value) => {
        if (!getErr && value) {
          setCloudSessionId(value);
          setStorageType('cloud');
        }
      });
    }

    return true;
  });

  // При первом рендере загружаем сессию из localStorage
  if (!sessionId && !cloudSessionId) {
    const savedSession = localStorage.getItem('shared_session');
    if (savedSession) {
      setSessionId(savedSession);
    }
  }

  const handleSaveToCloud = () => {
    const tg = window.Telegram?.WebApp;
    if (!tg?.CloudStorage) return;

    const sharedSession = sessionId || `shared_session_${Date.now()}`;
    tg.CloudStorage.setItem('shared_session', sharedSession, (setErr, success) => {
      if (!setErr && success) {
        setCloudSessionId(sharedSession);
        setStorageType('cloud');
        alert('✅ Сессия сохранена в Telegram Cloud Storage!');
      } else {
        alert('❌ Ошибка сохранения в Cloud Storage');
      }
    });
  };

  const handleLoadFromCloud = () => {
    const tg = window.Telegram?.WebApp;
    if (!tg?.CloudStorage) return;

    tg.CloudStorage.getItem('shared_session', (getErr, value) => {
      if (!getErr && value) {
        setCloudSessionId(value);
        setStorageType('cloud');
        alert(`📥 Сессия загружена из Cloud: ${value}`);
      } else {
        alert('❌ Сессия не найдена в Cloud Storage');
      }
    });
  };

  const displaySessionId = storageType === 'cloud' ? cloudSessionId : sessionId;

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
          <h2>💾 Общая сессия</h2>
          <div className="session-info">
            <p><strong>Тип хранилища:</strong> {storageType === 'cloud' ? '☁️ Cloud Storage' : '💻 Local Storage'}</p>
            <p><strong>ID сессии:</strong> {displaySessionId || 'Не создана'}</p>
            <p className="hint">
              {storageType === 'cloud'
                ? 'Сессия хранится в Telegram Cloud — доступна из любого Mini App!'
                : 'Сохраните сессию в Cloud, чтобы она была доступна из первого приложения.'}
            </p>
          </div>
          <div className="actions">
            <button onClick={handleSaveToCloud} className="btn btn-primary">
              ☁️ Сохранить в Cloud
            </button>
            <button onClick={handleLoadFromCloud} className="btn btn-secondary">
              📥 Загрузить из Cloud
            </button>
          </div>
        </section>

        <section className="card">
          <h2>📋 Как работает</h2>
          <ol style={{ paddingLeft: '20px', lineHeight: '2' }}>
            <li>Откройте первое приложение (Каталог) — создаётся сессия</li>
            <li>Нажмите "Сохранить в Cloud"</li>
            <li>Откройте это приложение (Профиль)</li>
            <li>Нажмите "Загрузить из Cloud" — сессия восстановится!</li>
          </ol>
        </section>
      </main>
    </div>
  );
}

export default App;