import Users from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { check, validationResult } from "express-validator";

export const Register = async (req, res) => {
  const { name, email, password, confPassword } = req.body;
  await Promise.all([
    check("email", "Email tidak valid").isEmail().run(req),
    check("password", "Password harus memiliki panjang minimal 8 karakter").isLength({ min: 8 }).run(req)
  ]);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  if (password !== confPassword) {
    return res.status(400).json({ msg: "Password dan Confirm Password tidak cocok" });
  }

  const existingUser = await Users.findOne({ where: { email: email } });
  if (existingUser) {
    return res.status(400).json({ msg: "Email sudah digunakan" });
  }

  const salt = await bcrypt.genSalt();
  const hashPassword = await bcrypt.hash(password, salt);
  try {
    await Users.create({
      name: name,
      email: email,
      password: hashPassword
    });
    res.json({ msg: "Register Berhasil" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Terjadi kesalahan server" });
  }
};

export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    await Promise.all([
      check("email", "Email tidak valid").isEmail().run(req),
      check("password", "Password harus diisi").notEmpty().run(req)
    ]);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await Users.findOne({ where: { email: email } });
    if (!user) {
      return res.status(404).json({ msg: "Email tidak ditemukan" });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ msg: "Wrong Password" });
    }
    const userId = user.id;
    const name = user.name;
    const accessToken = jwt.sign({ userId, name, email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '3h' });
    const refreshToken = jwt.sign({ userId, name, email }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' });
    await Users.update({ refresh_token: refreshToken }, { where: { id: userId } });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    res.json({ accessToken });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Terjadi kesalahan server" });
  }
};

export const Logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.sendStatus(204);
  }
  const user = await Users.findAll({
    where: {
      refresh_token: refreshToken
    }
  });
  if (user.length === 0) {
    return res.sendStatus(204);
  }
  const userId = user[0].id;
  await Users.update({ refresh_token: null }, {
    where: {
      id: userId
    }
  });
  res.clearCookie('refreshToken');
  return res.sendStatus(200);
};

export const DeleteAccount = async (req, res, next) => {
  const userId = req.params.id;
  try {
    if (req.user.userId !== parseInt(userId)) {
      return res.status(403).json({ msg: "Forbidden" });
    }
    const deletedUser = await Users.destroy({
      where: {
        id: userId
      }
    });
    if (deletedUser === 0) {
      return res.status(404).json({ msg: "Pengguna tidak ditemukan" });
    }
    res.json({ msg: "Akun pengguna berhasil dihapus" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Terjadi kesalahan server" });
  }
};

export const UpdateAccount = async (req, res, next) => {
  const userId = req.params.id;
  const { name, email, password } = req.body;
  
  try {
    if (req.user.userId !== parseInt(userId)) {
      return res.status(403).json({ msg: "Forbidden" });
    }
    
    const user = await Users.findByPk(userId);
    if (!user) {
      return res.status(404).json({ msg: "Pengguna tidak ditemukan" });
    }
    
    const validations = [
      check("email", "Format email tidak valid").optional().isEmail(),
      check("password", "Panjang password minimal 8 karakter").optional().isLength({ min: 8 })
    ];
    
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (email && email !== user.email) {
      const existingUser = await Users.findOne({ where: { email: email } });
      if (existingUser) {
        return res.status(400).json({ msg: "Email sudah digunakan" });
      }
      user.email = email;
    }

    if (name) {
      user.name = name;
    }

    if (password) {
      const salt = await bcrypt.genSalt();
      const hashPassword = await bcrypt.hash(password, salt);
      user.password = hashPassword;
    }

    await user.save();
    res.json({ msg: "Akun pengguna berhasil diperbarui" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Terjadi kesalahan server" });
  }
};

