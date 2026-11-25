// ========================================
// LeadLeak API Integration Tests
// ========================================

import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

// ========================================
// TEST ENVIRONMENT
// ========================================

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "leadleak_integration_test_secret_123456";
process.env.JWT_EXPIRES_IN = "1d";

let mongoServer;
let app;
let server;
let baseURL;

// ========================================
// SETUP
// ========================================

before(async () => {
  mongoServer = await MongoMemoryServer.create();

  process.env.MONGODB_URI = mongoServer.getUri();

  await mongoose.connect(process.env.MONGODB_URI);

  // Import the Express application only after test environment setup.
  const importedApp = await import("../../server.js");
  app = importedApp.app;

  server = await new Promise((resolve, reject) => {
    const instance = app.listen(0, "127.0.0.1", () => resolve(instance));
    instance.on("error", reject);
  });

  const address = server.address();
  baseURL = `http://127.0.0.1:${address.port}`;
});

// ========================================
// CLEAN DATABASE BEFORE EACH TEST
// ========================================

beforeEach(async () => {
  const collections = mongoose.connection.collections;

  for (const collection of Object.values(collections)) {
    await collection.deleteMany({});
  }
});

// ========================================
// CLEANUP
// ========================================

after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  if (mongoServer) {
    await mongoServer.stop();
  }
});

// ========================================
// REQUEST HELPER
// ========================================

async function request(path, options = {}) {
  const response = await fetch(`${baseURL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });

  let body;

  try {
    body = await response.json();
  } catch {
    body = null;
  }

  return {
    status: response.status,
    body,
  };
}

// ========================================
// REGISTER HELPER
// ========================================

async function registerUser({
  name = "Integration User",
  email = "integration@example.com",
  password = "StrongPass123",
} = {}) {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

// ========================================
// TEST 1: REGISTER
// ========================================

test("API: successfully registers a new user", async () => {
  const response = await registerUser();

  assert.equal(response.status, 201, JSON.stringify(response.body));
  assert.equal(response.body.success, true);
  assert.ok(response.body.token);
  assert.equal(response.body.user.email, "integration@example.com");
  assert.equal(response.body.user.name, "Integration User");

  // Password must never be returned.
  assert.equal(response.body.user.password, undefined);
});

// ========================================
// TEST 2: DUPLICATE REGISTRATION
// ========================================

test("API: prevents duplicate email registration", async () => {
  await registerUser();

  const duplicate = await registerUser();

  assert.equal(duplicate.status, 409);
  assert.equal(duplicate.body.success, false);
});

// ========================================
// TEST 3: REGISTRATION VALIDATION
// ========================================

test("API: rejects invalid registration data", async () => {
  const response = await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name: "A",
      email: "not-an-email",
      password: "123",
    }),
  });

  assert.equal(response.status, 400);
});

// ========================================
// TEST 4: LOGIN
// ========================================

test("API: successfully logs in a registered user", async () => {
  await registerUser();

  const response = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: "INTEGRATION@EXAMPLE.COM",
      password: "StrongPass123",
    }),
  });

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.ok(response.body.token);
  assert.equal(response.body.user.email, "integration@example.com");
});

// ========================================
// TEST 5: INVALID LOGIN
// ========================================

test("API: rejects incorrect login credentials", async () => {
  await registerUser();

  const response = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: "integration@example.com",
      password: "WrongPassword123",
    }),
  });

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

// ========================================
// TEST 6: ORGANIZATION AUTHORIZATION
// ========================================

test("API: rejects organization access without authentication", async () => {
  const response = await request("/api/organizations");

  assert.equal(response.status, 401);
});

// ========================================
// TEST 7: CREATE ORGANIZATION
// ========================================

test("API: authenticated user can create an organization", async () => {
  const registered = await registerUser();

  const response = await request("/api/organizations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${registered.body.token}`,
    },
    body: JSON.stringify({
      name: "Integration Workspace",
      type: "business",
    }),
  });

  assert.equal(response.status, 201);
  assert.equal(response.body.success, true);
});

// ========================================
// TEST 8: ORGANIZATION LIST
// ========================================

test("API: authenticated user can retrieve their organizations", async () => {
  const registered = await registerUser();

  await request("/api/organizations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${registered.body.token}`,
    },
    body: JSON.stringify({
      name: "My Workspace",
      type: "business",
    }),
  });

  const response = await request("/api/organizations", {
    headers: {
      Authorization: `Bearer ${registered.body.token}`,
    },
  });

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.ok(Array.isArray(response.body.organizations));
  assert.equal(response.body.organizations.length, 1);
});

// ========================================
// TEST 9: ORGANIZATION ISOLATION
// ========================================

test("API: one user cannot access another user's organization", async () => {
  const userA = await registerUser({
    name: "User A",
    email: "usera@example.com",
  });

  const userB = await registerUser({
    name: "User B",
    email: "userb@example.com",
  });

  const createdOrganization = await request("/api/organizations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${userA.body.token}`,
    },
    body: JSON.stringify({
      name: "User A Workspace",
      type: "business",
    }),
  });

  assert.equal(
    createdOrganization.status,
    201,
    JSON.stringify(createdOrganization.body),
  );

  const userBOrganizations = await request("/api/organizations", {
    headers: {
      Authorization: `Bearer ${userB.body.token}`,
    },
  });

  assert.equal(userBOrganizations.status, 200);
  assert.equal(userBOrganizations.body.organizations.length, 0);

  const organizationId =
    createdOrganization.body.organization?._id ||
    createdOrganization.body.organization?.id ||
    createdOrganization.body._id ||
    createdOrganization.body.id;

  // If the controller returns the created organization under a
  // different response property, this assertion will expose it.
  assert.ok(organizationId, "Organization ID must be returned");

  const accessAttempt = await request(`/api/organizations/${organizationId}`, {
    headers: {
      Authorization: `Bearer ${userB.body.token}`,
    },
  });

  assert.equal(accessAttempt.status, 404);
});

// ========================================
// TEST 10: INVALID ORGANIZATION
// ========================================

test("API: rejects invalid organization data", async () => {
  const registered = await registerUser();

  const response = await request("/api/organizations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${registered.body.token}`,
    },
    body: JSON.stringify({
      name: "A",
      type: "invalid-type",
    }),
  });

  assert.equal(response.status, 400, JSON.stringify(response.body));
});
