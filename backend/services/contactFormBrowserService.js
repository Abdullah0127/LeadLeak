import { chromium } from "playwright";

// ==========================================
// CONTACT FORM BROWSER SERVICE
// ==========================================

// ==========================================
// INSPECT CONTACT FORM PAGE
// ==========================================

export const inspectContactFormPage = async (formUrl) => {
  let browser;

  try {
    browser = await chromium.launch({
      headless: true,
    });

    const page = await browser.newPage();

    page.setDefaultTimeout(10000);

    const response = await page.goto(formUrl, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });

    if (!response) {
      throw new Error("The page did not return a response.");
    }

    const formDetails = await page.locator("form").evaluateAll((forms) =>
      forms.map((form, index) => ({
        formIndex: index,
        action: form.getAttribute("action"),
        method: form.getAttribute("method") || "get",
        fields: Array.from(
          form.querySelectorAll("input, textarea, select, button"),
        ).map((field) => ({
          tag: field.tagName.toLowerCase(),
          type: field.getAttribute("type") || "",
          name: field.getAttribute("name") || "",
          id: field.id || "",
          placeholder: field.getAttribute("placeholder") || "",
        })),
      })),
    );

    return {
      success: true,
      pageStatus: response.status(),
      pageUrl: page.url(),
      title: await page.title(),
      formsFound: formDetails.length,
      forms: formDetails,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

// ==========================================
// CONTROLLED LOCAL FORM SUBMISSION TEST
// ==========================================

export const testLocalContactForm = async (formUrl) => {
  let browser;

  try {
    // ==========================================
    // RESTRICT TEST TO OUR LOCAL TEST SERVER
    // ==========================================

    const parsedUrl = new URL(formUrl);

    const isAllowedLocalTest =
      (parsedUrl.hostname === "127.0.0.1" ||
        parsedUrl.hostname === "localhost") &&
      parsedUrl.port === "4179";

    if (!isAllowedLocalTest) {
      throw new Error("This test is restricted to our local test page.");
    }

    // ==========================================
    // LAUNCH BROWSER
    // ==========================================

    browser = await chromium.launch({
      headless: true,
    });

    const page = await browser.newPage();

    page.setDefaultTimeout(10000);

    // ==========================================
    // OPEN LOCAL TEST FORM
    // ==========================================

    const response = await page.goto(formUrl, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });

    if (!response || response.status() !== 200) {
      throw new Error("Local test page failed to load.");
    }

    // ==========================================
    // FILL FORM FIELDS
    // ==========================================

    await page.locator('[name="name"]').fill("LeadLeak Test User");

    await page.locator('[name="email"]').fill("leadleak-test@example.com");

    await page
      .locator('[name="message"]')
      .fill("This is a controlled LeadLeak test submission.");

    await page.locator('[name="subject"]').selectOption("support");

    // ==========================================
    // START RESPONSE TIME MEASUREMENT
    // ==========================================

    const startTime = Date.now();

    // ==========================================
    // SUBMIT FORM
    // ==========================================

    await page.locator('button[type="submit"]').click();

    // ==========================================
    // WAIT FOR SUCCESS MESSAGE
    // ==========================================

    const successMessage = page.locator("#form-result");

    await successMessage.waitFor({
      state: "visible",
      timeout: 10000,
    });

    // ==========================================
    // CALCULATE RESPONSE TIME
    // ==========================================

    const responseTime = Date.now() - startTime;

    const messageText = await successMessage.textContent();

    const isSuccessful = messageText
      ?.trim()
      .includes("Message sent successfully!");

    // ==========================================
    // RETURN TEST RESULT
    // ==========================================

    return {
      success: Boolean(isSuccessful),
      pageStatus: response.status(),
      pageUrl: page.url(),
      formSubmitted: true,
      responseTime,
      successMessage: messageText?.trim() || "",
      result: isSuccessful ? "working" : "failed",
    };
  } catch (error) {
    return {
      success: false,
      formSubmitted: false,
      responseTime: null,
      result: "failed",
      error: error.message,
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
