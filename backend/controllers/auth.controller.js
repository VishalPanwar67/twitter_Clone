const login = async (req, res) => {
  res.json({
    data: "you are login ",
  });
};
const logout = async (req, res) => {
  res.json({
    data: "you are logout",
  });
};

export { login, logout };
