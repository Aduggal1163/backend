import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const generateAccessAndRefreshTokens=async(userId)=>{
  try {
    const user=await User.findById(userId);  
    const accessToken=user.generateAccessToken();
    const refreshToken=user.generateRefreshToken();
    //refresh token ko db mei daalna
    user.refreshToken=refreshToken;
    await user.save({validateBeforeSave: false});
    return { accessToken,refreshToken };
  } 
  catch (error) {
    throw new ApiError(500,"Something went wrong while generating refresh and access token")
  }
}

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
  const existingUser = await User.findOne({
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

// req body->data
// validate->username or email
// find user
// password check
// access and refresh token 
// send cookie
const loginUser=asyncHandler(async(req,res)=>{
   const{email,username,password}=req.body;
   if(!email || !username || !password)
    throw ApiError(400,"All fields are mendatory");
    const user=await User.findOne({
      $or:[{email},{username}]
  })
  if(!user) throw ApiError(401,"Invalid username or email");
  const isPasswordValid=await user.isPasswordCorrect(password);
  if(!isPasswordValid) throw ApiError(401,"Invalid password");

  const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id);
  //now send to cookies
  const loggedInUser=await User.findById(user._id).select("-password -refreshToken")
  const options={
    httpOnly:true,
    secure:true
  } // it means cookies cant be modified 
  return res.status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json(
    new ApiResponse(
      200,
      {
        user:loggedInUser,
        accessToken,
        refreshToken
      },
      "User loggedIn successfully"
    )
  ) 
})

export { registerUser,
         loginUser
};
