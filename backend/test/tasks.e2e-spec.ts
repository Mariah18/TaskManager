import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";

describe("TasksController (e2e)", () => {
  let app: INestApplication;
  let accessToken: string;
  let taskId: string;

  const testUser = {
    email: "e2euser2@example.com",
    password: "password123",
    name: "E2E User 2",
  };

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
    // Register and login user
    await request(app.getHttpServer()).post("/auth/register").send(testUser);
    const res = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: testUser.email, password: testUser.password });
    accessToken = res.body.access_token;
  });

  afterAll(async () => {
    await app.close();
    await app.get(PrismaService).$disconnect();
  });

  it("/tasks (POST) - should create a new task", async () => {
    const res = await request(app.getHttpServer())
      .post("/tasks")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ title: "E2E Task", description: "Test task" })
      .expect(201);
    expect(res.body.title).toBe("E2E Task");
    taskId = res.body.id;
  });

  it("/tasks (GET) - should return the created task", async () => {
    const res = await request(app.getHttpServer())
      .get("/tasks")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
    expect(res.body.tasks.length).toBeGreaterThan(0);
    expect(res.body.tasks[0].title).toBe("E2E Task");
  });

  it("/tasks/:id (PATCH) - should update the task", async () => {
    const res = await request(app.getHttpServer())
      .patch(`/tasks/${taskId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ title: "Updated E2E Task" })
      .expect(200);
    expect(res.body.title).toBe("Updated E2E Task");
  });

  it("/tasks/:id/complete (PATCH) - should mark the task as complete", async () => {
    const res = await request(app.getHttpServer())
      .patch(`/tasks/${taskId}/complete`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
    expect(res.body.completed).toBe(true);
  });

  it("/tasks/:id (DELETE) - should delete the task", async () => {
    await request(app.getHttpServer())
      .delete(`/tasks/${taskId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
    // Confirm deletion
    const res = await request(app.getHttpServer())
      .get("/tasks")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
    expect(res.body.tasks.find((t: any) => t.id === taskId)).toBeUndefined();
  });

  it("/tasks (POST) - should create multiple tasks for advanced tests", async () => {
    const tasks = [
      {
        title: "Task A",
        description: "Alpha",
        dueDate: "2025-12-01T00:00:00.000Z",
        priority: "high",
      },
      {
        title: "Task B",
        description: "Beta",
        dueDate: "2025-12-02T00:00:00.000Z",
        priority: "medium",
      },
      {
        title: "Task C",
        description: "Gamma",
        dueDate: "2025-12-03T00:00:00.000Z",
        priority: "low",
      },
      {
        title: "Task D",
        description: "Delta",
        dueDate: "2025-12-04T00:00:00.000Z",
        priority: "high",
      },
    ];
    for (const t of tasks) {
      await request(app.getHttpServer())
        .post("/tasks")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(t)
        .expect(201);
    }
  });

  it("/tasks (GET) - should paginate tasks", async () => {
    const res = await request(app.getHttpServer())
      .get("/tasks?page=1&limit=2")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
    expect(res.body.tasks.length).toBe(2);
    expect(res.body.pagination.total).toBeGreaterThanOrEqual(4);
  });

  it("/tasks (GET) - should filter by completed status", async () => {
    // Mark one as completed
    const resAll = await request(app.getHttpServer())
      .get("/tasks")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
    const toComplete = resAll.body.tasks.find((t: any) => !t.completed);
    await request(app.getHttpServer())
      .patch(`/tasks/${toComplete.id}/complete`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
    // Now filter
    const resCompleted = await request(app.getHttpServer())
      .get("/tasks?completed=true")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
    expect(resCompleted.body.tasks.every((t: any) => t.completed)).toBe(true);
    const resIncomplete = await request(app.getHttpServer())
      .get("/tasks?completed=false")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
    expect(resIncomplete.body.tasks.every((t: any) => !t.completed)).toBe(true);
  });

  it("/tasks (GET) - should search by keyword", async () => {
    const res = await request(app.getHttpServer())
      .get("/tasks?search=Alpha")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
    expect(
      res.body.tasks.some((t: any) => t.description.includes("Alpha"))
    ).toBe(true);
  });

  it("/tasks (GET) - should sort by dueDate ascending", async () => {
    const res = await request(app.getHttpServer())
      .get("/tasks?sortBy=dueDate")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
    const dueDates = res.body.tasks.map((t: any) => new Date(t.dueDate));
    for (let i = 1; i < dueDates.length; i++) {
      expect(dueDates[i] >= dueDates[i - 1]).toBe(true);
    }
  });

  it("/tasks (GET) - should sort by priority (high > medium > low)", async () => {
    const res = await request(app.getHttpServer())
      .get("/tasks?sortBy=priority")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
    const priorities = res.body.tasks.map((t: any) => t.priority);
    const order = { high: 3, medium: 2, low: 1 };
    for (let i = 1; i < priorities.length; i++) {
      expect(order[priorities[i - 1]] >= order[priorities[i]]).toBe(true);
    }
  });

  it("/tasks/:id (PATCH) - should return 404 for non-existent task", async () => {
    await request(app.getHttpServer())
      .patch("/tasks/nonexistentid")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ title: "Should Fail" })
      .expect(404);
  });

  it("/tasks/:id (DELETE) - should return 404 for non-existent task", async () => {
    await request(app.getHttpServer())
      .delete("/tasks/nonexistentid")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(404);
  });

  it("/tasks (POST) - should fail with missing title", async () => {
    await request(app.getHttpServer())
      .post("/tasks")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ description: "No title" })
      .expect(400);
  });

  it("/tasks (POST) - should fail with empty title", async () => {
    await request(app.getHttpServer())
      .post("/tasks")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ title: "", description: "Empty title" })
      .expect(400);
  });

  it("/tasks (POST) - should fail with invalid dueDate", async () => {
    await request(app.getHttpServer())
      .post("/tasks")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ title: "Bad Date", dueDate: "notadate" })
      .expect(400);
  });

  it("/tasks (POST) - should fail with invalid priority", async () => {
    await request(app.getHttpServer())
      .post("/tasks")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ title: "Bad Priority", priority: "urgent" })
      .expect(400);
  });

  it("/tasks/:id (PATCH) - should fail with invalid fields", async () => {
    // Create a valid task first
    const res = await request(app.getHttpServer())
      .post("/tasks")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ title: "Patch Invalid" })
      .expect(201);
    await request(app.getHttpServer())
      .patch(`/tasks/${res.body.id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ priority: "urgent" })
      .expect(400);
  });

  it("/tasks/:id (PATCH) - should fail with empty title", async () => {
    // Create a valid task first
    const res = await request(app.getHttpServer())
      .post("/tasks")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ title: "Patch Empty" })
      .expect(201);
    await request(app.getHttpServer())
      .patch(`/tasks/${res.body.id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ title: "" })
      .expect(400);
  });

  it("/tasks/:id (PATCH) - should not allow updating another user's task", async () => {
    // Register and login as a second user
    await request(app.getHttpServer()).post("/auth/register").send({
      email: "e2euser5@example.com",
      password: "password123",
      name: "E2E User 5",
    });
    const loginRes = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: "e2euser5@example.com", password: "password123" });
    const otherToken = loginRes.body.access_token;
    // Create a task as user 1
    const res = await request(app.getHttpServer())
      .post("/tasks")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ title: "User1 Task" })
      .expect(201);
    // Try to update as user 2
    await request(app.getHttpServer())
      .patch(`/tasks/${res.body.id}`)
      .set("Authorization", `Bearer ${otherToken}`)
      .send({ title: "Hacked" })
      .expect(403);
  });

  it("/tasks/:id (DELETE) - should not allow deleting another user's task", async () => {
    // Register and login as a second user
    await request(app.getHttpServer()).post("/auth/register").send({
      email: "e2euser6@example.com",
      password: "password123",
      name: "E2E User 6",
    });
    const loginRes = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: "e2euser6@example.com", password: "password123" });
    const otherToken = loginRes.body.access_token;
    // Create a task as user 1
    const res = await request(app.getHttpServer())
      .post("/tasks")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ title: "User1 Task 2" })
      .expect(201);
    // Try to delete as user 2
    await request(app.getHttpServer())
      .delete(`/tasks/${res.body.id}`)
      .set("Authorization", `Bearer ${otherToken}`)
      .expect(403);
  });

  it("/tasks (POST) - should fail with invalid JWT", async () => {
    await request(app.getHttpServer())
      .post("/tasks")
      .set("Authorization", `Bearer ${accessToken}tampered`)
      .send({ title: "Invalid JWT" })
      .expect(401);
  });
});
