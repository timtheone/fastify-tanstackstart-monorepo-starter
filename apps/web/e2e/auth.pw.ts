import { expect, test } from "@playwright/test";

test("a user can register, use the protected application, sign out, and sign back in", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Start with the boundaries already decided." }),
  ).toBeVisible();

  const darkTheme = page.getByRole("radio", { name: "Dark" });
  await darkTheme.click();
  await expect(page.locator("html")).toHaveClass(/dark/u);
  await darkTheme.press("ArrowLeft");
  await expect(page.locator("html")).toHaveClass(/light/u);
  await page.getByRole("radio", { name: "Light" }).press("End");
  await expect(page.locator("html")).toHaveClass(/dark/u);

  await page.getByRole("link", { name: /Create account/u }).click();
  await page.route("**/api/auth/sign-up/email", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    await route.continue();
  });
  await page.getByLabel("Name").fill("Template User");
  await page.getByLabel("Email").fill("template@example.com");
  await page.getByLabel("Password").fill("correct horse battery staple");
  const createAccount = page.getByRole("button", { name: "Create account" });
  await createAccount.click();
  await expect(page.getByRole("button", { name: "Working…" })).toBeDisabled();

  await expect(page).toHaveURL(/\/app\/?$/u);
  await expect(page.getByRole("heading", { name: "Hello, Template User" })).toBeVisible();

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/$/u);
  await page.getByRole("link", { name: "Sign in" }).click();
  await page.getByLabel("Email").fill("template@example.com");
  await page.getByLabel("Password").fill("correct horse battery staple");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/app\/?$/u);
  await expect(page.getByText("template@example.com")).not.toBeVisible();
  await expect(page.getByRole("heading", { name: "Hello, Template User" })).toBeVisible();
});
