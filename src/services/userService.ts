import axios from 'axios';

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_URL = isLocal ? 'http://localhost:3000' : 'https://krybonapi.onrender.com';
const API_URL_V2 = isLocal ? 'http://localhost:3000' : 'https://krybonapi.onrender.com';

export const getUser = async (telegramId: number) => {
  const response = await axios.get(`${API_URL_V2}/api/v2/user/getuser/${telegramId}`);
  return response.data.data;
};

export const getGlobalConfig = async () => {
  const response = await axios.get(`${API_URL_V2}/api/v2/user/globalconfig`);
  return response.data.data;
};

export const watchAdComplete = async (telegramId: number) => {
  const response = await axios.post(`${API_URL_V2}/api/v2/user/watch-ad-complete`, { telegramId });
  return response.data;
};

export const getUserHistory = async (telegramId: number, page: number = 1, limit: number = 20) => {
  const response = await axios.get(`${API_URL_V2}/api/v2/user/history/${telegramId}?page=${page}&limit=${limit}`);
  return response.data;
};

export const getMyReferrals = async (telegramId: number) => {
  const response = await axios.get(`${API_URL_V2}/api/v2/user/myreferrals/${telegramId}`);
  return response.data;
};

export const requestWithdraw = async (telegramId: number, amount: number, walletAddress: string, method: string) => {
  const response = await axios.post(`${API_URL}/api/withdrawal/request`, {
    telegramId,
    amount,
    walletAddress,
    method,
  });
  return response.data;
};

export const getWithdrawHistory = async (telegramId: number) => {
  const response = await axios.get(`${API_URL}/api/withdrawal/history/${telegramId}`);
  return response.data.data;
};

export const getTasks = async () => {
  const response = await axios.get(`${API_URL}/api/task`);
  return response.data.data;
};

export async function getuserTasks(telegramId: number) {
  const { data } = await axios.get(`${API_URL}/api/task/available/${telegramId}`);
  return data;
}

export const claimDailyReward = async (telegramId: number) => {
  const { data } = await axios.post(`${API_URL}/api/user/dailyclaim`, {
    telegramId,
  });
  return data;
};

export const registerUser = async (payload: {
  telegramId: number;
  username?: string | null;
  fullname?: string;
  photoUrl?: string;
  referredBy?: string | number | null;
  deviceFingerprint?: string | null;
}) => {
  const response = await axios.post(`${API_URL_V2}/api/v2/user/register`, payload);
  return response.data;
};

export async function completeTask(taskId: string, telegramId: number) {
  const { data } = await axios.post(`${API_URL}/api/task/complete`, {
    telegramId,
    taskId,
  });
  return data;
}

export interface CheckCountryResponse {
  success: boolean;
  allow: boolean;
  message: string;
  country?: string;
}

export async function checkCountry() {
  const { data } = await axios.get<CheckCountryResponse>(
    `${API_URL}/api/user/checkcountry`
  );
  return data;
}
