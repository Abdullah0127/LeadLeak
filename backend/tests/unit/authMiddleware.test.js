import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";

import protect from "../../middleware/authMiddleware.js";
import User from "../../models/User.js";

const runMiddleware = (authorization) =>
  new Promise((resolve) => {
    const req = { headers: authorization ? { authorization } : {} };
    const res = {
      statusCode: 200,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        resolve({ statusCode: this.statusCode, payload });
      },
    };

    protect(req, res, () => resolve({ statusCode: 200, req }));
  });

test("rejects missing JWT bearer token", async () => {
  const result = await runMiddleware();
  assert.equal(result.statusCode, 401);
  assert.equal(result.payload.success, false);
});

test("rejects invalid JWT", async () => {
  const result = await runMiddleware("Bearer definitely-invalid");
  assert.equal(result.statusCode, 401);
  assert.equal(result.payload.success, false);
});

test("rejects token for inactive user", async () => {
  const originalSecret = process.env.JWT_SECRET;
  const originalFindById = User.findById;

  process.env.JWT_SECRET = "unit-test-secret";
  User.findById = async () => null;

  try {
    const token = jwt.sign(
      { id: "507f1f77bcf86cd799439011" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );
    const result = await runMiddleware(`Bearer ${token}`);

    assert.equal(result.statusCode, 401);
  } finally {
    User.findById = originalFindById;
    if (originalSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = originalSecret;
  }
});
