import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { faker } from "@faker-js/faker";
import { hashSync } from "bcryptjs";
import { PrismaClient } from "../generated/prisma/client";

/** Senha usada para todos os usuários/clientes gerados pelo seed (facilita testar login). */
const SEED_PASSWORD = "Senha@123";

const RESOURCES = ["store", "user", "role", "company", "customer"] as const;
const ACTIONS = ["list", "show", "create", "update", "delete"] as const;

const RESOURCE_LABELS: Record<(typeof RESOURCES)[number], string> = {
  store: "lojas",
  user: "usuários",
  role: "perfis",
  company: "empresas",
  customer: "clientes",
};

const ACTION_LABELS: Record<(typeof ACTIONS)[number], string> = {
  list: "Permite listar",
  show: "Permite visualizar",
  create: "Permite criar",
  update: "Permite atualizar",
  delete: "Permite excluir",
};

interface UserPlan {
  email: string;
  access: string;
}

/**
 * Define o cenário de acesso de cada usuário gerado (ver requisito do seed):
 * 1 com todas as roles nas 2 lojas, 2 com todas as roles mas em 1 loja cada
 * (uma para cada loja), 1 apenas com roles de usuário, 1 sem nenhuma role.
 */
const USER_PLANS: UserPlan[] = [
  { email: "admin.todas.lojas@rr-modules.dev", access: "Todas as roles, nas 2 lojas" },
  { email: "admin.loja1@rr-modules.dev", access: "Todas as roles, apenas na loja 1" },
  { email: "admin.loja2@rr-modules.dev", access: "Todas as roles, apenas na loja 2" },
  { email: "gestor.usuarios@rr-modules.dev", access: "Apenas roles de usuários (user_*), na loja 1" },
  { email: "sem.permissao@rr-modules.dev", access: "Nenhuma role" },
];

function uniqueValues<T>(count: number, generate: () => T): T[] {
  const values = new Set<T>();
  while (values.size < count) values.add(generate());
  return Array.from(values);
}

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function resetDatabase() {
  await prisma.$transaction([
    prisma.customer.deleteMany(),
    prisma.storeUserRole.deleteMany(),
    prisma.company.deleteMany(),
    prisma.store.deleteMany(),
    prisma.role.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

async function seedRoles() {
  const definitions = RESOURCES.flatMap((resource) =>
    ACTIONS.map((action) => ({
      name: `${resource}_${action}`,
      description: `${ACTION_LABELS[action]} ${RESOURCE_LABELS[resource]}`,
    })),
  );

  const roles = [];
  for (const definition of definitions) {
    roles.push(await prisma.role.create({ data: { ...definition, isActive: true } }));
  }
  return roles;
}

async function seedStores() {
  const names = uniqueValues(2, () => `Loja ${faker.location.city()}`);
  const stores = [];
  for (const name of names) {
    stores.push(await prisma.store.create({ data: { name } }));
  }
  return stores;
}

async function seedCompaniesWithCustomers(storeIds: string[]) {
  const names = uniqueValues(5, () => faker.company.name());

  for (let i = 0; i < names.length; i++) {
    const company = await prisma.company.create({
      data: {
        name: names[i],
        storeId: storeIds[i % storeIds.length],
        isActive: true,
      },
    });

    const customerCount = faker.number.int({ min: 2, max: 3 });
    const emails = uniqueValues(customerCount, () => faker.internet.email().toLowerCase());
    for (const email of emails) {
      await prisma.customer.create({
        data: {
          companyId: company.id,
          name: faker.person.fullName(),
          email,
          password: hashSync(SEED_PASSWORD),
          isActive: true,
        },
      });
    }
  }
}

async function seedUsers() {
  const users = [];
  for (const plan of USER_PLANS) {
    users.push(
      await prisma.user.create({
        data: {
          name: faker.person.fullName(),
          email: plan.email,
          password: hashSync(SEED_PASSWORD),
          isActive: true,
        },
      }),
    );
  }
  return users;
}

async function seedStoreUserRoles(
  users: Awaited<ReturnType<typeof seedUsers>>,
  stores: Awaited<ReturnType<typeof seedStores>>,
  roles: Awaited<ReturnType<typeof seedRoles>>,
) {
  const [allStoresUser, store1User, store2User, usersManager] = users;
  const [store1, store2] = stores;
  const allRoleIds = roles.map((role) => role.id);
  const userRoleIds = roles.filter((role) => role.name.startsWith("user_")).map((role) => role.id);

  const assignments: { storeId: string; userId: string; roleId: string }[] = [];

  for (const store of stores) {
    for (const roleId of allRoleIds) {
      assignments.push({ storeId: store.id, userId: allStoresUser.id, roleId });
    }
  }

  for (const roleId of allRoleIds) {
    assignments.push({ storeId: store1.id, userId: store1User.id, roleId });
  }

  for (const roleId of allRoleIds) {
    assignments.push({ storeId: store2.id, userId: store2User.id, roleId });
  }

  for (const roleId of userRoleIds) {
    assignments.push({ storeId: store1.id, userId: usersManager.id, roleId });
  }

  // O 5º usuário (sem.permissao@rr-modules.dev) não recebe nenhuma role de propósito.

  await prisma.storeUserRole.createMany({ data: assignments });
}

async function main() {
  console.log("Resetando tabelas...");
  await resetDatabase();

  console.log("Criando roles (5 recursos x 5 ações)...");
  const roles = await seedRoles();

  console.log("Criando lojas...");
  const stores = await seedStores();

  console.log("Criando empresas e clientes...");
  await seedCompaniesWithCustomers(stores.map((store) => store.id));

  console.log("Criando usuários...");
  const users = await seedUsers();

  console.log("Atribuindo roles aos usuários...");
  await seedStoreUserRoles(users, stores, roles);

  console.log(`\nSeed concluído. Senha para todos os usuários/clientes gerados: ${SEED_PASSWORD}\n`);
  console.table(
    USER_PLANS.map((plan) => ({ email: plan.email, acesso: plan.access })),
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
