import express from "express";
import { Register, Login, Logout, DeleteAccount, UpdateAccount } from "../controllers/Users.js";
import verifyToken from "../middleware/VerifyToken.js";
import { refreshToken } from "../controllers/RefreshToken.js";
import checkAuthorization from "../middleware/CheckAuth.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         email:
 *           type: string
 *       example:
 *         id: 1
 *         name: John Doe
 *         email: john@example.com
 */

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     description: Register a new user with name, email, password, and confirm password
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               confPassword:
 *                 type: string
 *             example:
 *               name: John Doe
 *               email: john@example.com
 *               password: password123
 *               confPassword: password123
 *     responses:
 *       200:
 *         description: User registration successful
 *       400:
 *         description: Bad request, validation errors or password mismatch
 *       500:
 *         description: Internal server error
 */
router.post('/register', Register);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: User login
 *     description: Authenticate user with email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             example:
 *               email: john@example.com
 *               password: password123
 *     responses:
 *       200:
 *         description: User login successful
 *       400:
 *         description: Bad request, validation errors or wrong password
 *       404:
 *         description: Email not found
 *       500:
 *         description: Internal server error
 */
router.post('/login', Login);

/**
 * @swagger
 * /token:
 *   get:
 *     summary: Refresh access token
 *     description: Refresh the user's access token using the refresh token stored in cookies
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: New access token generated
 *       401:
 *         description: Unauthorized, refresh token not found in cookies
 *       403:
 *         description: Forbidden, invalid or expired refresh token
 *       500:
 *         description: Internal server error
 */
router.get('/token', refreshToken);

/**
 * @swagger
 * /logout:
 *   delete:
 *     summary: User logout
 *     description: Logout the user and clear the refresh token from cookies
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: User logout successful
 *       500:
 *         description: Internal server error
 */
router.delete('/logout', Logout);

/**
 * @swagger
 * /user/:id:
 *   delete:
 *     summary: Delete a user
 *     description: Delete a user by their ID
 *     tags: [Account Manage]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user to delete
 *         schema:
 *           type: integer
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized, invalid token
 *       403:
 *         description: Forbidden, user not authorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.delete('/user/:id', verifyToken, checkAuthorization, DeleteAccount);

/**
 * @swagger
 * /user/:id:
 *   put:
 *     summary: Update a user
 *     description: Update a user's name or email by their ID
 *     tags: [Account Manage]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user to update
 *         schema:
 *           type: integer
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *             example:
 *               name: John Doe
 *               email: john@example.com
 *     responses:
 *       200:
 *         description: User updated successfully
 *       401:
 *         description: Unauthorized, invalid token
 *       403:
 *         description: Forbidden, user not authorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.put('/user/:id', verifyToken, checkAuthorization, UpdateAccount);

export default router;
