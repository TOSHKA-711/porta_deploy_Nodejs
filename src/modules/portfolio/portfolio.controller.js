import { portfolioModel } from "../../../DB/models/portfolioModel.js";
import { userModel } from "../../../DB/models/userModel.js";

// get portfolio by userId
export const getPortfolioByUserId = async (req, res, next) => {
  const { userId } = req.params;

  if (!userId) {
    return next(new Error("User ID is required", { cause: 400 }));
  }

  const userCheck = await userModel.findById(userId).select("name");
  if (!userCheck) {
    return next(new Error("User not found", { cause: 404 }));
  }

  const portfolio = await portfolioModel.findOne({ user: userId });
  if (!portfolio) {
    return next(new Error("Portfolio not found", { cause: 404 }));
  }
  res
    .status(200)
    .json({ message: "Portfolio found", portfolio, user: userCheck });
};
// get portfolio by token
export const getPortfolioByToken = async (req, res, next) => {
  const { id } = req.userData;

  if (!id) {
    return next(new Error("User ID is required", { cause: 400 }));
  }

  const userCheck = await userModel.findById(id).select("name");
  if (!userCheck) {
    return next(new Error("User not found", { cause: 404 }));
  }

  const portfolio = await portfolioModel.findOne({ user: id });
  if (!portfolio) {
    return next(new Error("Portfolio not found", { cause: 404 }));
  }
  res
    .status(200)
    .json({ message: "Portfolio found", portfolio, user: userCheck });
};

// update portfolio by userId
export const updatePortfolioByUserId = async (req, res, next) => {
  const { id } = req.userData;
  const { bio, about, theme, socialLinks, projects, role ,workExperience , hero , skills} = req.body;

  if (!id) {
    return next(new Error("User ID is required", { cause: 400 }));
  }

  const userCheck = await userModel.findById(id);
  if (!userCheck) {
    return next(new Error("User not found", { cause: 404 }));
  }

  const updateData = {};

  if (bio) updateData.bio = bio;
  if (about) updateData.about = about;
  if (theme) updateData.theme = theme;
  if (socialLinks) updateData.socialLinks = socialLinks;
  if (projects) updateData.projects = projects;
  if (role) updateData.role = role;
  if (workExperience) updateData.workExperience = workExperience;
  if (hero) updateData.hero = hero;
  if (skills) updateData.skills = skills;


  const updatedPortfolio = await portfolioModel.findOneAndUpdate(
    { user: id },
    updateData,
    { new: true }
  );

  if (!updatedPortfolio) {
    return next(
      new Error("Portfolio not found or update failed", { cause: 404 })
    );
  }

  res
    .status(200)
    .json({ message: "Portfolio updated successfully", updatedPortfolio });
};
