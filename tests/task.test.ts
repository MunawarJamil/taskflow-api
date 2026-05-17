import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { request, cleanDb, prisma, registerAndLogin } from "./helpers.js";

let accessToken: string;
let workspaceId: string;
let projectId: string;
let taskId: string;
let commentId: string;

beforeEach(async () => {
  await cleanDb();

  // Register and login
  const auth = await registerAndLogin();
  accessToken = auth.accessToken;

  // Create workspace
  const workspace = await request
    .post("/api/v1/workspaces")
    .set("Authorization", `Bearer ${accessToken}`)
    .send({ name: "Test Workspace" });
  workspaceId = workspace.body.data.workspace.id;

  // Create project
  const project = await request
    .post(`/api/v1/workspaces/${workspaceId}/projects`)
    .set("Authorization", `Bearer ${accessToken}`)
    .send({ name: "Test Project" });
  projectId = project.body.data.project.id;
});

afterAll(async () => {
  await cleanDb();
  await prisma.$disconnect();
});

describe("Task Lifecycle", () => {
  it("should create a task in a project", async () => {
    const res = await request
      .post(`/api/v1/projects/${projectId}/tasks`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        title: "Build login page",
        description: "Create login form with validation",
        priority: "HIGH",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.task.title).toBe("Build login page");
    expect(res.body.data.task.status).toBe("TODO");
    taskId = res.body.data.task.id;
  });

  it("should assign a task to a user", async () => {
    // Create task first
    const task = await request
      .post(`/api/v1/projects/${projectId}/tasks`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ title: "Task to assign", priority: "MEDIUM" });
    taskId = task.body.data.task.id;

    // Get userId
    const auth = await registerAndLogin(
      "Second User",
      "second@example.com",
      "password123",
    );

    // Invite second user to workspace
    await request
      .post(`/api/v1/workspaces/${workspaceId}/members`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ email: "second@example.com", role: "MEMBER" });

    // Assign task
    const res = await request
      .patch(`/api/v1/tasks/${taskId}/assign`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ assigneeId: auth.userId });

    expect(res.status).toBe(200);
    expect(res.body.data.task.assigneeId).toBe(auth.userId);
  });

  it("should update task status from TODO to IN_PROGRESS", async () => {
    const task = await request
      .post(`/api/v1/projects/${projectId}/tasks`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ title: "Status test task", priority: "LOW" });
    taskId = task.body.data.task.id;

    const res = await request
      .patch(`/api/v1/tasks/${taskId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ status: "IN_PROGRESS" });

    expect(res.status).toBe(200);
    expect(res.body.data.task.status).toBe("IN_PROGRESS");
  });

  it("should add a comment to a task", async () => {
    const task = await request
      .post(`/api/v1/projects/${projectId}/tasks`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ title: "Comment test task", priority: "LOW" });
    taskId = task.body.data.task.id;

    const res = await request
      .post(`/api/v1/tasks/${taskId}/comments`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ content: "This is a test comment" });

    expect(res.status).toBe(201);
    expect(res.body.data.comment.content).toBe("This is a test comment");
    commentId = res.body.data.comment.id;
  });

  it("should delete a comment (author only)", async () => {
    const task = await request
      .post(`/api/v1/projects/${projectId}/tasks`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ title: "Delete comment task", priority: "LOW" });
    taskId = task.body.data.task.id;

    const comment = await request
      .post(`/api/v1/tasks/${taskId}/comments`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ content: "Comment to delete" });
    commentId = comment.body.data.comment.id;

    const res = await request
      .delete(`/api/v1/comments/${commentId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
  });

  it("should mark a task as DONE", async () => {
    const task = await request
      .post(`/api/v1/projects/${projectId}/tasks`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ title: "Complete this task", priority: "URGENT" });
    taskId = task.body.data.task.id;

    const res = await request
      .patch(`/api/v1/tasks/${taskId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ status: "DONE" });

    expect(res.status).toBe(200);
    expect(res.body.data.task.status).toBe("DONE");
  });

  it("should delete a task", async () => {
    const task = await request
      .post(`/api/v1/projects/${projectId}/tasks`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ title: "Task to delete", priority: "LOW" });
    taskId = task.body.data.task.id;

    const res = await request
      .delete(`/api/v1/tasks/${taskId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
  });
});
