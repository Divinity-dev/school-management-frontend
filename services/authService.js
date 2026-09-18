import api from "../lib/api";

const login = async (credentials) => {
const response = await api.post("/auth/login", credentials);

return response.data;
};

const registerSchool = async (schoolData) => {
const response = await api.post("/auth/register-school", schoolData);

return response.data;
};

const authService = {
login,
registerSchool,
};

export default authService;
