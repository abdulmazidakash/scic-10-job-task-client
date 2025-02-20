import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthProviders';

export const useAuth = () => useContext(AuthContext);