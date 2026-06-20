"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getDashboardStats() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      resumes: true,
      coverLetters: true,
      interviews: true,
    },
  });

  return {
    totalResumes: user?.resumes?.length || 0,
    totalCoverLetters: user?.coverLetters?.length || 0,
    totalInterviews: user?.interviews?.length || 0,
  };
}

export async function generateAIInsights(industry, profileData) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ industry, profileData, type: "insights" }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error generating insights:", error);
    return null;
  }
}

export async function getIndustryInsights() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: { industryInsight: true },
  });

  return user?.industryInsight || null;
}

export async function getUserOnboardingStatus() {
  const { userId } = await auth();
  if (!userId) {
    return { isOnboarded: false, user: null, isSignedIn: false };
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  return {
    isOnboarded: Boolean(user?.industry),
    user,
    isSignedIn: true,
  };
}
