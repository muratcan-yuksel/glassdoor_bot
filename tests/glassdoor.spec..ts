import { test, expect, firefox } from "@playwright/test";
require("dotenv").config();
const fs = require("fs");

test.describe("Logging in", () => {
  test("glassdoor login", async ({}) => {
    const browser = await firefox.launch();
    const context = await browser.newContext();

    const page = await context.newPage();
    await page.goto("https://www.glassdoor.com");

    // Start waiting for popup before clicking. Note no await.
    const popupPromise = page.waitForEvent("popup");
    await page.locator('[data-test="facebookBtn"]').click();

    const popup = await popupPromise;
    // Wait for the popup to load.
    await popup.waitForLoadState();
    // console.log(await popup.title());

    await popup.locator("#email").fill(process.env.LOGIN_EMAIL);
    await popup.locator("#pass").fill(process.env.LOGIN_PASS);
    await popup.getByLabel("Log in").click();
    // //click login by facebook
    // await page
    //   .locator("div:nth-child(2) > .q-click-wrapper > .q-relative")
    //   .click();
    // //enter email
    // await page
    //   .getByPlaceholder("Email address or phone number")
    //   .fill(process.env.LOGIN_EMAIL);
    // //enter password
    // await page.getByPlaceholder("Password").fill(process.env.LOGIN_PASS);
    // //click login button
    // await page.click("button:has-text('Log in')");

    const cookies = await context.cookies();
    const cookieJson = JSON.stringify(cookies);

    fs.writeFileSync("cookies.json", cookieJson);

    // await browser.close();
  });
});
