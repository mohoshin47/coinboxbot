import { createContext, useContext, useEffect, useState } from 'react';
import { getUser, registerUser } from '../services/userService';
import { getDeviceFingerprint } from '../utils/fingerprint';

interface UserContextType {
  user: any;
  loading: boolean;
  loadUser: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<any>>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  loadUser: async () => {},
  setUser: () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const getTelegramPayload = () => {
    const tg = window.Telegram?.WebApp;

    const telegramUser = tg?.initDataUnsafe?.user;
    const telegramId = telegramUser?.id ?? 8909616907;
    const username = telegramUser?.username ?? null;
    const Name = telegramUser ? `${telegramUser.first_name ?? ''}${telegramUser.last_name ? ` ${telegramUser.last_name}` : ''}`.trim() : '';
    const photoUrl = telegramUser?.photo_url ?? '';

    const searchParams = new URLSearchParams(window.location.search);
    const refQuery = searchParams.get('ref');
    const startParam = tg?.initDataUnsafe?.start_param;

    const referredBy = refQuery || startParam || null;

    return {
      telegramId,
      username,
      Name,
      photoUrl,
      referredBy,
    };
  };

  const loadUser = async () => {
    try {
      const { telegramId, username, Name, photoUrl, referredBy } = getTelegramPayload();

      if (!telegramId) {
        console.log('No telegramId available to load user');
        return;
      }

      try {
        const data = await getUser(telegramId);

        if (data && data.telegramId) {
          setUser(data);
          return;
        }
      } catch (error: any) {
        if (error.response?.status !== 404) {
          console.log('Could not load user:', error);
          return;
        }
      }

      const deviceFingerprint = await getDeviceFingerprint();

      const registerResponse = await registerUser({
        telegramId,
        username,
        fullname: Name || '',
        photoUrl: photoUrl || '',
        referredBy,
        deviceFingerprint,
      });

      if (registerResponse?.success || registerResponse?.exists) {
        setUser(registerResponse.user);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        loadUser,
        setUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
