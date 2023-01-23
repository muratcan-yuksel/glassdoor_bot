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
    await popup.waitForLoadState();

    await page.waitForNavigation();

    const cookies = await context.cookies();
    const cookieJson = JSON.stringify(cookies);

    fs.writeFileSync("cookies.json", cookieJson);

    await browser.close();
  });
});

test.describe("navigation", () => {
  test("glassdoor navigation", async ({}) => {
    const browser = await firefox.launch();
    const context = await browser.newContext();

    const cookies = fs.readFileSync("cookies.json", "utf8");

    const deserializedCookies = JSON.parse(cookies);
    await context.addCookies(deserializedCookies);

    const page = await context.newPage();
    await page.goto("https://www.glassdoor.com");

    // await browser.close();
  });
});
