import User from "../models/UserModel";
import bcrypt from "bcrypt";
// import generateJWT from "../utils/jwtGenerator";
import generateJWT from "../utils/jwtGenerator";

export const register = async (
  req: any,
  res: { status: (arg0: number) => { json: (arg0: any) => any; cookie: any } }
) => {
  try {
    const { username, password, email } = req.body;

    if (!username) {
      return res.status(500).json("username is required");
    }
    if (!password) {
      return res.status(500).json("Password is required");
    }
    if (password.length < 8) {
      return res
        .status(500)
        .json("Password should be Eight (8) characters or above");
    }
    console.log(username.toLowerCase());

    const user = await User.create({
      username: username.toLowerCase(),
      password,
      email,
      role: "student",
    });

    if (!user) {
      return res.status(500).json("Creation of user failed ");
    }

    const userWithoutPassword = { ...user._doc };
    delete userWithoutPassword.password;

    //Genete a Jwt Token
    const payload = { username: username, id: user._id, role: user.role };
    const token = generateJWT(payload, process.env.SECRET);
    const accessToken = generateJWT(payload, process.env.ACCESS_SECRET);

    // Send the user object without including the password
    res.status(201).cookie("Authorization", token, {
      expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      path: "/api/auth",
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
    });
    return res.status(200).json({ user: userWithoutPassword, accessToken });
  } catch (error: any) {
    if (error.code === 11000) {
      // Handle duplicate key error
      return res.status(409).json("username already exists");
    }

    console.error("Error adding user:", error);
    return res.status(500).json("Failed to add User");
  }
};

export const login = async (
  req: any,
  res: { status: (arg0: number) => { json: (arg0: any) => any } }
) => {
  try {
    const { username, password } = req.body;
    if (!username) {
      return res.status(400).json("username is required");
    }
    if (!password) {
      return res.status(400).json("Password is required");
    }
    const user = await User.findOne({ username: username.toLowerCase() });

    if (!user) {
      return res.status(400).json("Invalid username");
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json("Invalid password");
    }
    const userWithoutPassword = { ...user._doc };
    delete userWithoutPassword.password;

    const payload = { username: username, id: user._id, role: user.role };
    const token = generateJWT(payload, process.env.SECRET, "11d");
    const accessToken = generateJWT(payload, process.env.ACCESS_SECRET, "1d");

    req.session.authorization = token;

    return res.status(200).json({
      user: userWithoutPassword,
      accessToken,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).json("Failed to login");
  }
};

export const logout = (
  req: any,
  res: { status: (arg0: number) => { json: (arg0: any) => any } }
) => {
  try {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json("could not log out");
      }
    });
    // res.clearCookie("connect.sid");
    return res.status(201).json({ message: "Logged out succesful" });
  } catch (error) {
    console.error("Error logging out:", error);
    return res.status(500).json("Error logging out");
  }
};

export const verify = (
  req: any,
  res: { status: (arg0: number) => { json: (arg0: any) => any } }
) => {
  try {
    console.log("in verify");

    const user = req.user;
    if (!user) {
      return res.status(401).json("Authorization token is required.");
    }
    const payload = {
      username: req.user.username,
      id: req.user.id,
      role: req.user.role,
    };

    const accessToken = generateJWT(payload, process.env.ACCESS_SECRET);
    return res.status(200).json({ accessToken });
  } catch (error) {
    console.error("Error verifing user:", error);
    return res.status(500).json("Error verifing user");
  }
};
