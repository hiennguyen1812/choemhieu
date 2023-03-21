import express from "express";
import {
  getAll,
  register,
  updateUser,
  deleteUser,
  updateProfile,
  updatePassword,
  login,
  getRefreshToken,
  getSingleUser,
} from "../controllers/userController";
import { protect, admin } from "../middlewares/authMiddleware";

const router = express.Router();

router.route("/").get(protect, admin, getAll);
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/refresh-token").get(getRefreshToken);
router
  .route("/:id")
  .get(protect, getSingleUser)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);
// router.route("/update").put(protect, updateProfile);
// router.route("/update/password").put(protect, updatePassword);

export default router;
