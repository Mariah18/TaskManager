import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";

describe("UsersController (e2e)", () => {
  let app: INestApplication;
  let accessToken: string;
  let testUser: { email: string; password: string; name: string };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
      })
    );
    await app.init();
    // Use a unique email for each test run
    testUser = {
      email: `e2euser3+${Date.now()}@example.com`,
      password: "password123",
      name: "E2E User 3",
    };
    // Register and login user, assert success
    await request(app.getHttpServer())
      .post("/auth/register")
      .send(testUser)
      .expect(201);
    const res = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: testUser.email, password: testUser.password })
      .expect(200);
    accessToken = res.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it("/users/me (PATCH) - should update user name", async () => {
    const res = await request(app.getHttpServer())
      .patch("/users/me")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "Updated Name" })
      .expect(200);
    expect(res.body.name).toBe("Updated Name");
  });

  it("/users/me (PATCH) - should update user email", async () => {
    const newEmail = `e2euser3new+${Date.now()}@example.com`;
    const res = await request(app.getHttpServer())
      .patch("/users/me")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ email: newEmail })
      .expect(200);
    expect(res.body.email).toBe(newEmail);
  });

  it("/users/me (PATCH) - should update user password", async () => {
    await request(app.getHttpServer())
      .patch("/users/me")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ password: "newpassword123" })
      .expect(200);
    // Login with new password
    const res = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: "e2euser3new@example.com", password: "newpassword123" })
      .expect(200);
    expect(res.body.user.email).toBe("e2euser3new@example.com");
  });

  it("/users/me (PATCH) - should not allow updating to an already-used email", async () => {
    // Register a second user
    await request(app.getHttpServer()).post("/auth/register").send({
      email: "e2euser4@example.com",
      password: "password123",
      name: "E2E User 4",
    });
    // Try to update first user to second user's email
    await request(app.getHttpServer())
      .patch("/users/me")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ email: "e2euser4@example.com" })
      .expect(400);
  });

  it("/users/me (PATCH) - should fail with invalid email", async () => {
    await request(app.getHttpServer())
      .patch("/users/me")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ email: "notanemail" })
      .expect(400);
  });

  it("/users/me (PATCH) - should fail with short password", async () => {
    await request(app.getHttpServer())
      .patch("/users/me")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ password: "123" })
      .expect(400);
  });

  it("/users/me (PATCH) - should fail without authentication", async () => {
    await request(app.getHttpServer())
      .patch("/users/me")
      .send({ name: "NoAuth" })
      .expect(401);
  });

  it("/users/me (PATCH) - should fail with all fields missing", async () => {
    await request(app.getHttpServer())
      .patch("/users/me")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({})
      .expect(400);
  });

  it("/users/me (PATCH) - should ignore extra fields", async () => {
    const res = await request(app.getHttpServer())
      .patch("/users/me")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "Extra", extra: "field" })
      .expect(200);
    expect(res.body.name).toBe("Extra");
    expect(res.body).not.toHaveProperty("extra");
  });

  it("/users/me (PATCH) - should fail with whitespace-only name", async () => {
    await request(app.getHttpServer())
      .patch("/users/me")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "   " })
      .expect(400);
  });

  it("/users/me (PATCH) - should fail with invalid JWT", async () => {
    await request(app.getHttpServer())
      .patch("/users/me")
      .set("Authorization", `Bearer ${accessToken}tampered`)
      .send({ name: "Tampered" })
      .expect(401);
  });
});
