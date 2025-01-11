import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
// get user details from frontend
// validation -not empty
// check if user already exists: username, email
// check for images, check for avatar
// upload them to cloudinary, avatar
// create user object - create entry in db
// remove password and refresh token field from response
// check for user creation
// return user details
const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;
  if (fullName == " " || email == " " || username == " " || password == " ") {
    throw new ApiError(400, "Fill all details");
  }
  const existingUser = User.findOne({
    $or: [{ username }, { email }],
  });
  if (existingUser) {
    throw new ApiError(409, "User with this email or username already exists");
  }
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  if (!avatarLocalPath) throw new ApiError(400, "Avatar file is required");
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }
  const createUser=await User.create({
    fullName,
    email,
    username:username.toLowerCase(),
    avatar:avatar.url,
    coverImage:coverImage?.url || "",
    password
  })
  const createdUser=await User.findById(User._id).select(
    "-password -refreshToken"
  );
  if(!createUser)  throw new ApiError(500,"Something went wrong while registering a user");
  return res.status(201).json(
    new ApiResponse(200,createdUser,"User registered successfully")
  )
});
export { registerUser };
