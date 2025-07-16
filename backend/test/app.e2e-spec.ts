import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";

describe("AppController (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const testUser = {
    email: `testuser+${Date.now()}@example.com`,
    password: "password123",
    name: "E2E User",
  };

  let accessToken: string;

  it("/auth/register (POST) - should register a new user", async () => {
    const res = await request(app.getHttpServer())
      .post("/auth/register")
      .send(testUser)
      .expect(201);
    expect(res.body).toHaveProperty("access_token");
    expect(res.body.user.email).toBe(testUser.email);
  });

  it("/auth/login (POST) - should login and return JWT", async () => {
    const res = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: testUser.email, password: testUser.password })
      .expect(200);
    expect(res.body).toHaveProperty("access_token");
    expect(res.body.user.email).toBe(testUser.email);
    accessToken = res.body.access_token;
  });

  it("/tasks (GET) - should require authentication", async () => {
    await request(app.getHttpServer()).get("/tasks").expect(401);
  });

  it("/tasks (GET) - should return empty task list for new user", async () => {
    const res = await request(app.getHttpServer())
      .get("/tasks")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
    expect(res.body.tasks).toBeInstanceOf(Array);
    expect(res.body.tasks.length).toBe(0);
  });

  it("/auth/register (POST) - should not allow duplicate registration", async () => {
    await request(app.getHttpServer())
      .post("/auth/register")
      .send(testUser)
      .expect(409); // Conflict
  });

  it("/auth/login (POST) - should fail with wrong password", async () => {
    await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: testUser.email, password: "wrongpassword" })
      .expect(401);
  });

  it("/auth/login (POST) - should fail with non-existent user", async () => {
    await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: "nouser@example.com", password: "password123" })
      .expect(401);
  });

  it("/auth/register (POST) - should fail with short password", async () => {
    await request(app.getHttpServer())
      .post("/auth/register")
      .send({ email: "shortpass@example.com", password: "123", name: "Short" })
      .expect(400);
  });

  it("/auth/register (POST) - should fail with invalid email", async () => {
    await request(app.getHttpServer())
      .post("/auth/register")
      .send({ email: "notanemail", password: "password123", name: "BadEmail" })
      .expect(400);
  });

  it("/tasks (GET) - should fail with tampered JWT", async () => {
    await request(app.getHttpServer())
      .get("/tasks")
      .set("Authorization", `Bearer ${accessToken}tampered`)
      .expect(401);
  });

  it("/auth/register (POST) - should fail with missing email", async () => {
    await request(app.getHttpServer())
      .post("/auth/register")
      .send({ password: "password123", name: "NoEmail" })
      .expect(400);
  });

  it("/auth/register (POST) - should fail with missing password", async () => {
    await request(app.getHttpServer())
      .post("/auth/register")
      .send({ email: "missingpass@example.com", name: "NoPass" })
      .expect(400);
  });

  it("/auth/login (POST) - should fail with missing email", async () => {
    await request(app.getHttpServer())
      .post("/auth/login")
      .send({ password: "password123" })
      .expect(400);
  });

  it("/auth/login (POST) - should fail with missing password", async () => {
    await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: testUser.email })
      .expect(400);
  });

  it("/auth/login (POST) - should fail with invalid email format", async () => {
    await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: "notanemail", password: "password123" })
      .expect(400);
  });
});
