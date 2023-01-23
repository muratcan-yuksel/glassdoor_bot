import { test, expect, firefox } from "@playwright/test";
require("dotenv").config();
const fs = require("fs");
const { setTimeout } = require("timers");

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
  test("open main page", async ({}) => {
    const browser = await firefox.launch();
    const context = await browser.newContext();

    const cookies = fs.readFileSync("cookies.json", "utf8");

    const deserializedCookies = JSON.parse(cookies);
    await context.addCookies(deserializedCookies);

    const page = await context.newPage();
    await page.goto("https://www.glassdoor.com");

    // await browser.close();
  });
  test("open jobs page", async ({}) => {
    const browser = await firefox.launch();
    const context = await browser.newContext();

    const cookies = fs.readFileSync("cookies.json", "utf8");

    const deserializedCookies = JSON.parse(cookies);
    await context.addCookies(deserializedCookies);

    const page = await context.newPage();
    await page.goto("https://www.glassdoor.com");
    //write to location bar
    await page
      .locator('[data-test="search-bar-location-input"]')
      .fill("remote");
    //click on location bar
    await page.getByText("Remote (Work From Home), US").click();

    //write to jobs bar
    await page
      .locator('[data-test="search-bar-keyword-input"]')
      .fill("full stack web developer");
    //click on jobs bar
    await page
      .getByRole("listitem")
      .filter({ hasText: "Full Stack Web Developer Jobs" })
      .locator("div")
      .nth(2)
      .click();

    //close annoying modal
    await page.locator('[data-test="modal-jobalert"] svg').click();

    //wait for the page to load
    await page.waitForLoadState();

    //configuring job search
    //click "more" button
    await page.locator('[data-test="more-filter"]').getByText("More").click();
    //easy apply only
    await page.locator('[data-test="filterAPPLICATION_TYPE"] label').click();
    //wait for it
    await page
      .locator('[data-test="filterAPPLICATION_TYPE"] label')
      .isChecked();
    await new Promise((resolve) => setTimeout(resolve, 2000));
    //work from home only
    await page.locator('[data-test="filterREMOTE_WORK_TYPE"] label').click();
    //click "more" button again to close it
    await page.locator('[data-test="more-filter"]').getByText("More").click();
    //get all job links
    const links = await page.evaluate(() => {
      const element = document.querySelector("#MainCol");
      const links = Array.from(element.querySelectorAll(".react-job-listing"));
      return links.map((el) => el.querySelector("a").getAttribute("href"));
    });
    console.log(links);
  });
  // locator('[data-test="MainColSummary"]')
  // getByRole("listitem")
  //   .filter({
  //     hasText:
  //       "One Stop Swap, Inc.Full Stack Web DeveloperRemote$20.00 Per Hour(Employer est.)E",
  //   })
  //   .locator('[data-test="job-link"]');
});
