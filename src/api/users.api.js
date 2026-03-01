import { http } from './http';

export const getUserProfileRequest = async (userId) => {
  const { data } = await http.get(`/users/${userId}`);
  return data;
};

export const updateMyProfileRequest = async (payload) => {
  const { data } = await http.patch('/users/me', payload);
  return data;
};
