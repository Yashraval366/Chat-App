import user from "../models/userModel.js";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";

export const register = async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;
    const existingUser = await user.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "User already exists" });
    
    const fullname = `${firstname} ${lastname}`;
    const newuser = new user({ email, password, name: fullname });
    const token = await newuser.generateAuthToken();
    await newuser.save();
    
    return res.status(201).json({ message: "Success", token });
  } catch (error) {
    console.error("Error in register:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const valid = await user.findOne({ email });
    if (!valid) return res.status(404).json({ message: "User does not exist" });

    const validPassword = await bcrypt.compare(password, valid.password);
    if (!validPassword) return res.status(401).json({ message: "Invalid Credentials" });

    const token = await valid.generateAuthToken();
    await valid.save();
    res.cookie("userToken", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    
    return res.status(200).json({ token, status: 200 });
  } catch (error) {
    console.error("Error in login:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

export const validUser = async (req, res) => {
  try {
    const validuser = await user.findOne({ _id: req.rootUserId }).select("-password");
    if (!validuser) return res.status(404).json({ message: "User is not valid" });
    
    return res.status(200).json({ user: validuser, token: req.token });
  } catch (error) {
    console.error("Error in validUser:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { tokenId } = req.body;
    const client = new OAuth2Client(process.env.CLIENT_ID);
    const verify = await client.verifyIdToken({ idToken: tokenId, audience: process.env.CLIENT_ID });
    const { email_verified, email, name, picture } = verify.payload;
    if (!email_verified) return res.status(400).json({ message: "Email Not Verified" });
    
    const userExist = await user.findOne({ email }).select("-password");
    if (userExist) {
      res.cookie("userToken", tokenId, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
      return res.status(200).json({ token: tokenId, user: userExist });
    }
    
    const password = email + process.env.CLIENT_ID;
    const newUser = new user({ name, profilePic: picture, password, email });
    await newUser.save();
    
    res.cookie("userToken", tokenId, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    return res.status(201).json({ message: "User registered Successfully", token: tokenId });
  } catch (error) {
    console.error("Error in googleAuth:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

export const logout = async (req, res) => {
  try {
    req.rootUser.tokens = req.rootUser.tokens.filter((e) => e.token !== req.token);
    await req.rootUser.save();
    res.clearCookie("userToken");
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error in logout:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const search = req.query.search
      ? { $or: [{ name: { $regex: req.query.search, $options: "i" } }, { email: { $regex: req.query.search, $options: "i" } }] }
      : {};
    
    const users = await user.find(search).find({ _id: { $ne: req.rootUserId } });
    return res.status(200).json(users);
  } catch (error) {
    console.error("Error in searchUsers:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const selectedUser = await user.findOne({ _id: id }).select("-password");
    if (!selectedUser) return res.status(404).json({ message: "User not found" });
    
    return res.status(200).json(selectedUser);
  } catch (error) {
    console.error("Error in getUserById:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

export const updateInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const { bio, name } = req.body;
    const updatedUser = await user.findByIdAndUpdate(id, { name, bio }, { new: true }).select("-password");
    if (!updatedUser) return res.status(404).json({ message: "User not found" });
    
    return res.status(200).json({ message: "User info updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error in updateInfo:", error);
    return res.status(500).json({ error: "Server error" });
  }
};
