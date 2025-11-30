import { nanoid } from "nanoid";
import { userModel } from "../../../DB/models/userModel.js";
import cloudinary from "../../utils/multerConfig.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { sendMailService } from "../../services/mailSender.js";
import { portfolioModel } from "../../../DB/models/portfolioModel.js";

//-------------- sign up --------------

export const signUp = async (req, res, next) => {
  try {
    const { username, email, password, passwordConfirmation } = req.body;

    // Validate required fields
    if (!username || !email || !password || !passwordConfirmation) {
      return next(
        new Error("Username, email, password and confirmation are required", {
          cause: 400,
        })
      );
    }

    // Password match check
    if (password !== passwordConfirmation) {
      return next(new Error("Passwords do not match", { cause: 400 }));
    }

    // Check if email or username exists
    const userMatch = await userModel.findOne({
      $or: [{ email }, { username }],
    });

    if (userMatch) {
      return next(
        new Error("Username or email already exists", { cause: 400 })
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, +process.env.HASH_LEVEL);

    // Create user
    const newUser = await userModel.create({
      username,
      email,
      password: hashedPassword,
    });

    if (!newUser) {
      return next(new Error("User not saved", { cause: 500 }));
    }

    // Create portfolio for the new user
    const savedPortfolio = await portfolioModel.create({
      user: newUser._id,
    });

    if (!savedPortfolio) {
      return next(new Error("Portfolio not created", { cause: 500 }));
    }

    // Generate token
    const userToken = jwt.sign({ id: newUser._id }, process.env.TOKEN_KEY);
    // Confirmation link
    const confirmLink = `${req.protocol}://${req.headers.host}/user/confirmEmail/${userToken}`;

    const MailMessage = `
 <!DOCTYPE html>
 <html lang="en">
 <head>
   <meta charset="UTF-8" />
   <meta name="viewport" content="width=device-width, initial-scale=1.0" />
   <title>Confirm Your Email</title>
   <style>
     body {
       font-family: Arial, sans-serif;
       background: #f3f4f6;
       display: flex;
       justify-content: center;
       align-items: center;
       height: 100vh;
       margin: 0;
     }
     .container {
       background: #fff;
       padding: 40px;
       border-radius: 16px;
       box-shadow: 0 4px 20px rgba(0,0,0,0.1);
       text-align: center;
       max-width: 400px;
     }
     h1 {
       color: #4f46e5;
       margin-bottom: 16px;
     }
     p {
       color: #374151;
       margin-bottom: 32px;
     }
     a.button {
       display: inline-block;
       padding: 12px 24px;
       background: #4f46e5;
       color: #fff;
       border-radius: 8px;
       text-decoration: none;
       font-weight: bold;
       transition: background 0.3s ease;
     }
     a.button:hover {
       background: #4338ca;
     }
   </style>
 </head>
 <body>
   <div class="container">
     <h1>Confirm Your Email</h1>
     <p>Thank you for signing up! Click the button below to activate your account.</p>
     <a href="${confirmLink}" class="button">Confirm Email</a>
   </div>
 </body>
 </html>
 `;

    // Send email
    await sendMailService({
      to: email,
      subject: "Portafolio SaaS - Confirm your email",
      message: MailMessage,
    });

    return res.status(200).json({
      msg: "user created successfully",
      token: userToken,
    });
  } catch (error) {
    return next(error);
  }
};

//-------------- Github auth --------------

export const gitHubAuth = async (req, res, next) => {
  const userData = req.userData;

  if (!userData) {
    return res.status(404).json({ error: "User not found in database" });
  }

  try {
    const { code } = req.body || {};
    if (!code) {
      return next(new Error("Authorization code is required", { cause: 400 }));
    }

    // طلب access_token من GitHub
    const tokenRes = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: "http://localhost:3000/auth/callback",
        }),
      }
    );

    const tokenData = await tokenRes.json();
    // console.log("GitHub Token Data:", tokenData);

    const access_token = tokenData.access_token;
    if (!access_token) {
      return res.status(400).json({ error: "No access token returned" });
    }

    // fetch user data from GitHub
    const userRes = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const githubUser = await userRes.json();

    if (!githubUser) {
      return next(
        new Error("Failed to fetch user data from GitHub", { cause: 500 })
      );
    }

    // console.log("GitHub User Data:", githubUser);

    //  خزن بيانات GitHub في قاعدة البيانات
    await userModel.updateOne(
      { _id: userData._id },
      {
        githubUsername: githubUser.login,
        githubToken: access_token,
        image: githubUser.avatar_url,
      }
    );

    // update portfolio with github link
    await portfolioModel.updateOne(
      { user: userData._id },
      {
        $set: {
          "socialLinks.github": githubUser.html_url,
        },
      }
    );

    // إرجاع البيانات للفرونت
    res.json({ user: githubUser, token: access_token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "GitHub auth failed" });
  }
};

//-------------- sign up Admin--------------

export const signUpAdmin = async (req, res, next) => {
  const { username, email, password, gender } = req.body;
  if (!email || !username || !password) {
    return next(
      new Error("Username, email, and password are required", { cause: 400 })
    );
  }
  const customId = nanoid(5);

  const userMatch = await userModel.findOne({
    $or: [{ email }, { username }],
  });

  if (userMatch) {
    return next(new Error("username or email duplicated", { cause: 400 }));
  }

  if (!req.file) {
    return next(new Error("please upload profile image", { cause: 400 }));
  }
  const { path } = req.file;

  const { public_id, secure_url } = await cloudinary.uploader.upload(path, {
    folder: `E-commerce/users/profilePic/${customId}`,
    unique_filename: true,
  });

  if (!email || !username) {
    return next(new Error("email and password are required", { cause: 400 }));
  }

  if (!password) {
    return next(new Error("Password is required", { cause: 400 }));
  }

  const hashedPassword = bcrypt.hashSync(password, +process.env.HASH_LEVEL);

  const userInstance = new userModel({
    username,
    email,
    password: hashedPassword,
    gender,
    customId,
    profilePic: {
      public_id,
      secure_url,
    },
    role: "admin",
  });

  const newUser = await userInstance.save();

  if (newUser) {
    const userToken = jwt.sign({ id: newUser._id }, process.env.TOKEN_KEY);

    const confirmLink = `${req.protocol}://${req.headers.host}/user/confirmEmail/${userToken}`;
    const message = `<a href=${confirmLink}>confirm email address</a>`;

    await sendMailService({
      to: email,
      subject: "bntest",
      message,
    });
    return res.status(200).json({
      msg: "user created successfully",
      token: userToken,
    });
  }
  if (!newUser) {
    await cloudinary.uploader.destroy(public_id);
    return next(new Error("User not saved", { cause: 500 }));
  }
};

//--------------- confirm email  -----------

export const confirmEmail = async (req, res, next) => {
  const { token } = req.params;

  if (!token) {
    return next(new Error("No token found !", { cause: 400 }));
  }

  const { id } = jwt.verify(token, process.env.TOKEN_KEY);

  const userCheck = await userModel.findById(id);

  if (!userCheck) {
    return next(new Error("user not found!", { cause: 404 }));
  }

  if (userCheck.isConfirmed) {
    return res.status(200).json({ message: "email already confirmed" });
  }

  const updatedUser = await userModel
    .findByIdAndUpdate(id, { isConfirmed: true }, { new: true })
    .select("username email role customId");

  if (!updatedUser) {
    return next(new Error("failed to confirm this email!", { cause: 500 }));
  }

  return res
    .status(200)
    .json({ message: "email confirmed successfully", updatedUser });
};

//-------------- login --------------

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new Error("email and password are required", { cause: 400 }));
  }

  const userCheck = await userModel.findOne({ email });

  if (!userCheck) {
    return next(
      new Error("user not exist , please sign up first", { cause: 404 })
    );
  }

  // Check portfolio
  const portfolioCheck = await portfolioModel.find({ user: userCheck._id });

  if (portfolioCheck.length === 0) {
    const savedPortfolio = await portfolioModel.create({
      user: userCheck._id,
    });

    if (!savedPortfolio) {
      return next(new Error("Portfolio not created", { cause: 500 }));
    }
  }

  // Check password
  const passwordCheck = bcrypt.compareSync(password, userCheck.password);

  if (!passwordCheck) {
    return next(new Error("incorrect email or password", { cause: 400 }));
  }

  // Create token
  const userToken = jwt.sign({ id: userCheck._id }, process.env.TOKEN_KEY, {
    expiresIn: "30d",
  });

  return res.status(200).json({ msg: "Done", token: userToken });
};

//------------ update user ------------------

export const updateUser = async (req, res, next) => {
  const {
    username,
    email,
    password,
    gender,
    name,
    role,
    country,
    image,
    vercelToken,
  } = req.body;
  const { id } = req.userData;

  const updateFields = {};

  if (username) updateFields.username = username;
  if (email) updateFields.email = email;
  if (gender) updateFields.gender = gender;
  if (name) updateFields.name = name;
  if (role) updateFields.role = role;
  if (country) updateFields.country = country;
  if (image) updateFields.image = image;
  if (vercelToken !== undefined) updateFields.vercelToken = vercelToken;
  if (password) {
    updateFields.password = bcrypt.hashSync(password, process.env.HASH_LEVEL);
  }

  const updatedUser = await userModel
    .findByIdAndUpdate(id, updateFields, {
      new: true,
    })
    .select("username email gender role ");

  if (!updatedUser) {
    return next(new Error("user not found", { cause: 400 }));
  }

  res.status(200).json({ message: "Done !", updatedUser });
};

//--------------- get all users ----------------

export const getAllUsers = async (req, res, next) => {
  const allUsers = await userModel.find().populate("products");

  if (!allUsers) {
    return next(new Error("Failed to get users", { cause: 500 }));
  }
  if (allUsers.length === 0) {
    return res.status(200).json({ message: "No users found", users: [] });
  }
  res.status(200).json({ message: "Done", allUsers });
};

//--------------- get user by id ----------------

export const getUserById = async (req, res, next) => {
  const { userId } = req.params;

  if (!userId) {
    return next(new Error("user Id not found", { cause: 404 }));
  }

  // console.log(userId);

  const user = await userModel
    .findById(userId)
    .select("username email gender role links bio country name image");

  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }

  res.status(200).json({ message: "Done", user });
};

//--------------- get user by token ----------

export const getUserByToken = async (req, res, next) => {
  const { id } = req.userData;

  if (!id) {
    return next(new Error("user Id not found", { cause: 404 }));
  }

  console.log(id);

  const user = await userModel
    .findById(id)
    .select(
      `username email gender role links bio country name image vercelToken`
    );

  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }

  res.status(200).json({ message: "Done", user });
};

//------------ users overview --------------

export const getUsersOverview = async (req, res, next) => {
  const overview = await userModel.aggregate([
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 },
    },
  ]);

  // تحويل الناتج للشكل المطلوب
  const formatted = overview.map((item) => {
    const { year, month, day } = item._id;
    const dateString = `${year}-${String(month).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;

    return {
      date: dateString,
      value: item.count,
    };
  });

  res.status(200).json({ data: formatted });
};
