// authUtils.js
export const isUserLoggedIn = () => {
  return localStorage.getItem("token") !== null;
};
