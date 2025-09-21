
// Custom hook
import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { clearCollaborators, clearUserActivity, clearUserProfile, fetchDashboard, fetchUserActivity, fetchUserProfile, fetchUsers, resetUsersState, searchPotentialCollaborators, searchUsers, updateUserStatus } from '../store/slices/usersSlice';

export const useUsers = () => {
  const dispatch = useDispatch();
  const users = useSelector((state) => state.users.users);

  // Actions
  const getUsers = useCallback((params = {}) => {
    return dispatch(fetchUsers(params));
  }, [dispatch]);

  const getUserProfile = useCallback((userId) => {
    return dispatch(fetchUserProfile(userId));
  }, [dispatch]);

  const searchUsersAction = useCallback((params) => {
    return dispatch(searchUsers(params));
  }, [dispatch]);

  const getUserActivity = useCallback((params) => {
    return dispatch(fetchUserActivity(params));
  }, [dispatch]);

  const getDashboard = useCallback(() => {
    return dispatch(fetchDashboard());
  }, [dispatch]);

  const updateStatus = useCallback((userId, isActive) => {
    return dispatch(updateUserStatus({ userId, isActive }));
  }, [dispatch]);

  const searchCollaborators = useCallback((params) => {
    return dispatch(searchPotentialCollaborators(params));
  }, [dispatch]);

  // Clear actions
  const clearSearch = useCallback(() => {
    dispatch(clearSearchResults());
  }, [dispatch]);

  const clearCollaboratorSearch = useCallback(() => {
    dispatch(clearCollaborators());
  }, [dispatch]);

  const clearProfile = useCallback(() => {
    dispatch(clearUserProfile());
  }, [dispatch]);

  const clearActivity = useCallback(() => {
    dispatch(clearUserActivity());
  }, [dispatch]);

  const resetState = useCallback(() => {
    dispatch(resetUsersState());
  }, [dispatch]);



  return {
    // State
    users,
    // Actions
    getUsers,
    getUserProfile,
    searchUsers: searchUsersAction,
    getUserActivity,
    getDashboard,
    updateStatus,
    searchCollaborators,

    // Clear actions
    clearSearch,
    clearCollaboratorSearch,
    clearProfile,
    clearActivity,
    resetState
  };
};