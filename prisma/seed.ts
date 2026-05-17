import { PrismaClient, WorkspaceRole, TaskPriority, TaskStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const hashedPassword = await bcrypt.hash("password123", 10);

  const alice = await prisma.user.create({
    data: {
      name: "Alice Johnson",
      email: "alice@taskflow.dev",
      passwordHash: hashedPassword,
    },
  });

  const bob = await prisma.user.create({
    data: {
      name: "Bob Smith",
      email: "bob@taskflow.dev",
      passwordHash: hashedPassword,
    },
  });

  const carol = await prisma.user.create({
    data: {
      name: "Carol White",
      email: "carol@taskflow.dev",
      passwordHash: hashedPassword,
    },
  });

  console.log("✅ Users created");

  // Create workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: "TaskFlow Demo",
      ownerId: alice.id,
    },
  });

  // Add members
  await prisma.workspaceMember.createMany({
    data: [
      { workspaceId: workspace.id, userId: alice.id, role: WorkspaceRole.OWNER },
      { workspaceId: workspace.id, userId: bob.id, role: WorkspaceRole.MEMBER },
      { workspaceId: workspace.id, userId: carol.id, role: WorkspaceRole.MEMBER },
    ],
  });

  console.log("✅ Workspace + members created");

  // Create projects
  const project1 = await prisma.project.create({
    data: {
      name: "Website Redesign",
      description: "Full redesign of company website",
      workspaceId: workspace.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: "Mobile App v2",
      description: "Second version of the mobile application",
      workspaceId: workspace.id,
    },
  });

  console.log("✅ Projects created");

  // Create tasks
  const task1 = await prisma.task.create({
    data: {
      title: "Design new landing page",
      description: "Create wireframes and high-fidelity mockups",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      projectId: project1.id,
      assigneeId: bob.id,
      createdById: alice.id,
      dueDate: new Date("2026-06-15"),
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: "Set up CI/CD pipeline",
      description: "Configure GitHub Actions for auto deployment",
      status: TaskStatus.TODO,
      priority: TaskPriority.URGENT,
      projectId: project1.id,
      assigneeId: alice.id,
      createdById: alice.id,
      dueDate: new Date("2026-06-01"),
    },
  });

  const task3 = await prisma.task.create({
    data: {
      title: "Write API documentation",
      description: "Document all endpoints with examples",
      status: TaskStatus.DONE,
      priority: TaskPriority.MEDIUM,
      projectId: project2.id,
      assigneeId: carol.id,
      createdById: alice.id,
    },
  });

  console.log("✅ Tasks created");

  // Create comments
  await prisma.comment.createMany({
    data: [
      {
        content: "Wireframes are ready, moving to mockups now.",
        taskId: task1.id,
        userId: bob.id,
      },
      {
        content: "Looks great! Make sure it's mobile responsive.",
        taskId: task1.id,
        userId: alice.id,
      },
      {
        content: "I'll start with the staging environment first.",
        taskId: task2.id,
        userId: alice.id,
      },
      {
        content: "Swagger docs are live at /api/docs.",
        taskId: task3.id,
        userId: carol.id,
      },
    ],
  });

  console.log("✅ Comments created");
  console.log("🎉 Seed complete!");
  console.log("─────────────────────────────");
  console.log("Demo credentials:");
  console.log("  alice@taskflow.dev / password123  (OWNER)");
  console.log("  bob@taskflow.dev   / password123  (MEMBER)");
  console.log("  carol@taskflow.dev / password123  (MEMBER)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
