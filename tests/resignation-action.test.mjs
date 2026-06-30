import { describe, expect, it, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  findUniqueUser: vi.fn(),
  resignationLetterCreate: vi.fn(),
  generateGeminiContent: vi.fn(),
  checkRateLimit: vi.fn(),
  formatResetTime: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: mocks.auth,
}));

vi.mock("@/lib/prisma", () => ({
  db: {
    user: {
      findUnique: mocks.findUniqueUser,
    },
    resignationLetter: {
      create: mocks.resignationLetterCreate,
    },
  },
}));

vi.mock("@/lib/gemini", () => ({
  generateGeminiContent: mocks.generateGeminiContent,
}));

vi.mock("@/lib/rate-limit-actions", () => ({
  checkRateLimit: mocks.checkRateLimit,
  formatResetTime: mocks.formatResetTime,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { generateResignationLetter } from "../actions/resignation.js";

describe("generateResignationLetter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.formatResetTime.mockReturnValue("60 minutes");
  });

  it("successfully generates letter when within rate limits and date is valid", async () => {
    mocks.auth.mockResolvedValue({ userId: "user-1" });
    mocks.checkRateLimit.mockResolvedValue({ allowed: true });
    mocks.findUniqueUser.mockResolvedValue({ id: "db-user-1", clerkUserId: "user-1" });
    mocks.generateGeminiContent.mockResolvedValue({
      response: {
        text: () => "I resign.",
      },
    });
    mocks.resignationLetterCreate.mockResolvedValue({ id: "letter-1" });

    // Use tomorrow's date to bypass the unnormalized date validation on main
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const result = await generateResignationLetter("New opportunity", tomorrowStr);

    expect(result.success).toBe(true);
    expect(mocks.checkRateLimit).toHaveBeenCalledWith("user-1", "resignation");
    expect(mocks.resignationLetterCreate).toHaveBeenCalled();
  });

  it("fails when rate limit is exceeded", async () => {
    mocks.auth.mockResolvedValue({ userId: "user-1" });
    mocks.checkRateLimit.mockResolvedValue({ allowed: false, resetAt: new Date() });
    mocks.findUniqueUser.mockResolvedValue({ id: "db-user-1", clerkUserId: "user-1" });

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const result = await generateResignationLetter("New opportunity", tomorrowStr);

    expect(result.success).toBe(false);
    expect(result.errors._form[0]).toContain("limit reached");
    expect(mocks.resignationLetterCreate).not.toHaveBeenCalled();
  });
});
