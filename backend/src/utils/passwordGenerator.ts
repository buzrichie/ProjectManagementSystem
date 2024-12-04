/**
 * Generate a random password with the specified length.
 * @param {number} length - The length of the password.
 * @returns {Promise<string>} The generated random password.
 * @throws {Error} If the length is not provided, is not a number, or is less than 8.
 */
async function generateRandomPassword(length: number): Promise<string> {
  try {
    // Validate length parameter
    if (!length) {
      throw new Error("Length of password is required.");
    }
    if (typeof length !== "number") {
      throw new Error("Length must be a number.");
    }
    if (length < 8) {
      throw new Error(
        "Length of password must be eight (8) characters or more."
      );
    }

    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";

    // Generate random password characters
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    return password;
  } catch (error) {
    throw error;
  }
}

module.exports = generateRandomPassword;
