import API from "./api";

export const submitCustomDesign = (data) =>
  API.post("/custom-design", data);

export const getMyCustomDesigns = () =>
  API.get("/custom-design/my");
