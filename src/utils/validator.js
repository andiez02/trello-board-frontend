/* eslint-disable no-useless-escape */
export const FIELD_REQUIRED_MESSAGE = "This field is required";
export const EMAIL_RULE = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
export const EMAIL_RULE_MESSAGE = "Email is invalid.";
export const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
export const PASSWORD_RULE_MESSAGE =
  "Password must include at least 1 letter, a number, and at least 8 characters.";

//Validate File
export const LIMIT_COMMON_FILE_SIZE = 10485760;
export const ALLOW_COMMON_FILE_TYPE = ["image/jpg", "image/jpeg", "image/png"];
export const singleFileValidator = (file) => {
  if (!file || !file.name || !file.size || !file.type) {
    return "File can not be blank";
  }
  if (file.size > LIMIT_COMMON_FILE_SIZE) {
    return "Maximum file size exceeded. (10MB)";
  }
  if (!ALLOW_COMMON_FILE_TYPE.includes(file.type)) {
    return "File type is invalid. Only accept jpg, jpeg and png";
  }
  return null;
};
