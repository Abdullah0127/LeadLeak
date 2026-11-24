import ContactFormCheck from "../models/ContactFormCheck.js";
import ContactFormMonitor from "../models/ContactFormMonitor.js";

// ==========================================
// SAVE CONTACT FORM TEST RESULT
// ==========================================

export const saveContactFormCheck = async ({
  organization,
  website,
  contactFormMonitor,
  result,
}) => {
  // ==========================================
  // SAVE TEST HISTORY
  // ==========================================

  const check = await ContactFormCheck.create({
    organization,
    website,
    contactFormMonitor,

    status: result.result === "working" ? "working" : "failed",

    responseTime: result.responseTime ?? null,

    httpStatus: result.pageStatus ?? null,

    successMessage: result.successMessage || "",

    error: result.error || null,

    testedAt: new Date(),
  });

  // ==========================================
  // UPDATE MONITOR STATUS
  // ==========================================

  await ContactFormMonitor.findByIdAndUpdate(
    contactFormMonitor,
    {
      lastCheckedAt: new Date(),

      lastStatus: result.result === "working" ? "working" : "failed",

      lastResponseTime: result.responseTime ?? null,

      lastError:
        result.result === "working"
          ? null
          : result.error || "Contact form test failed.",
    },
    { returnDocument: "after" },
  );

  // ==========================================
  // RETURN SAVED RESULT
  // ==========================================

  return check;
};
