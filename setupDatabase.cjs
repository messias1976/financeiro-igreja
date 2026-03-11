const { Client, Databases } = require("node-appwrite");

const client = new Client()
  .setEndpoint("https://nyc.cloud.appwrite.io/v1")
  .setProject("69b04d62003030eed6bf")
  .setKey("standard_1f0033b844b10f56dcf40637bade2cb50d419f7c374d20ce5e695ab66de23e3895e6ce09e6aa4b01ec7bbacbbbaa4a1829b3518b1e63db07e566cef80cb0d6fca5da6125b93bc2544570391fda641ff3ebc089fced19c6b22f8158cd746d8ccb33b16e676f30c9a4deff6161bb49920f34f4d8680df4b3080c41e9ef88b9716f"); // Recomendo usar variáveis de ambiente no futuro

const databases = new Databases(client);
const DATABASE_ID = "church_finance_db";

// Função para esperar um pouco entre criações (evita erro de concorrência)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Função para criar atributos de forma segura
async function safeCreate(name, callback) {
  try {
    await callback();
    console.log(`   ✅ Campo "${name}" criado.`);
  } catch (e) {
    if (e.code === 409) {
      console.log(`   ⚠️ Campo "${name}" já existe. Pulando...`);
    } else {
      console.error(`   ❌ Erro no campo "${name}":`, e.message);
    }
  }
}

async function setup() {
  try {
    console.log("🚀 Iniciando configuração do banco de dados...\n");

    // --- 1. TABELA CHURCHES ---
    console.log("📂 Processando tabela: CHURCHES");
    try {
      await databases.createCollection(DATABASE_ID, "churches", "Churches");
      console.log("   ✅ Coleção criada.");
    } catch (e) { console.log("   ⚠️ Coleção já existe."); }
    await sleep(1000);
    await safeCreate("name", () => databases.createStringAttribute(DATABASE_ID, "churches", "name", 200, true));
    await safeCreate("slug", () => databases.createStringAttribute(DATABASE_ID, "churches", "slug", 200, true));
    await safeCreate("logo_url", () => databases.createStringAttribute(DATABASE_ID, "churches", "logo_url", 500, false));
    await safeCreate("address", () => databases.createStringAttribute(DATABASE_ID, "churches", "address", 500, false));
    await safeCreate("phone", () => databases.createStringAttribute(DATABASE_ID, "churches", "phone", 50, false));
    await safeCreate("email", () => databases.createStringAttribute(DATABASE_ID, "churches", "email", 150, false));
    await safeCreate("website", () => databases.createStringAttribute(DATABASE_ID, "churches", "website", 300, false));
    await safeCreate("subscription_plan", () => databases.createStringAttribute(DATABASE_ID, "churches", "subscription_plan", 50, false));
    await safeCreate("subscription_ends", () => databases.createDatetimeAttribute(DATABASE_ID, "churches", "subscription_ends", false));
    await safeCreate("is_active", () => databases.createBooleanAttribute(DATABASE_ID, "churches", "is_active", false));

    // --- 2. TABELA USERS ---
    console.log("\n📂 Processando tabela: USERS");
    try {
      await databases.createCollection(DATABASE_ID, "users", "Users");
    } catch (e) { console.log("   ⚠️ Coleção já existe."); }
    await sleep(1000);
    await safeCreate("church_id", () => databases.createStringAttribute(DATABASE_ID, "users", "church_id", 50, true));
    await safeCreate("first_name", () => databases.createStringAttribute(DATABASE_ID, "users", "first_name", 80, true));
    await safeCreate("last_name", () => databases.createStringAttribute(DATABASE_ID, "users", "last_name", 80, true));
    await safeCreate("email", () => databases.createStringAttribute(DATABASE_ID, "users", "email", 150, true));
    await safeCreate("password_hash", () => databases.createStringAttribute(DATABASE_ID, "users", "password_hash", 255, true));
    await safeCreate("role", () => databases.createStringAttribute(DATABASE_ID, "users", "role", 50, true));
    await safeCreate("is_active", () => databases.createBooleanAttribute(DATABASE_ID, "users", "is_active", false));
    await safeCreate("last_login", () => databases.createDatetimeAttribute(DATABASE_ID, "users", "last_login", false));

    // --- 3. TABELA MEMBERS ---
    console.log("\n📂 Processando tabela: MEMBERS");
    try {
      await databases.createCollection(DATABASE_ID, "members", "Members");
    } catch (e) { console.log("   ⚠️ Coleção já existe."); }
    await sleep(1000);
    await safeCreate("church_id", () => databases.createStringAttribute(DATABASE_ID, "members", "church_id", 50, true));
    await safeCreate("first_name", () => databases.createStringAttribute(DATABASE_ID, "members", "first_name", 80, true));
    await safeCreate("last_name", () => databases.createStringAttribute(DATABASE_ID, "members", "last_name", 80, true));
    await safeCreate("email", () => databases.createStringAttribute(DATABASE_ID, "members", "email", 150, false));
    await safeCreate("phone", () => databases.createStringAttribute(DATABASE_ID, "members", "phone", 50, false));
    await safeCreate("address", () => databases.createStringAttribute(DATABASE_ID, "members", "address", 500, false));
    await safeCreate("date_of_birth", () => databases.createDatetimeAttribute(DATABASE_ID, "members", "date_of_birth", false));
    await safeCreate("gender", () => databases.createStringAttribute(DATABASE_ID, "members", "gender", 20, false));
    await safeCreate("membership_status", () => databases.createStringAttribute(DATABASE_ID, "members", "membership_status", 50, false));
    await safeCreate("join_date", () => databases.createDatetimeAttribute(DATABASE_ID, "members", "join_date", false));
    await safeCreate("tithe_number", () => databases.createStringAttribute(DATABASE_ID, "members", "tithe_number", 50, false));
    await safeCreate("photo_url", () => databases.createStringAttribute(DATABASE_ID, "members", "photo_url", 500, false));

    // --- 4. TABELA TITHES (DÍZIMOS) ---
    console.log("\n📂 Processando tabela: TITHES");
    try {
      await databases.createCollection(DATABASE_ID, "tithes", "Tithes");
    } catch (e) { console.log("   ⚠️ Coleção já existe."); }
    await sleep(1000);
    await safeCreate("church_id", () => databases.createStringAttribute(DATABASE_ID, "tithes", "church_id", 50, true));
    await safeCreate("member_id", () => databases.createStringAttribute(DATABASE_ID, "tithes", "member_id", 50, false));
    await safeCreate("amount", () => databases.createFloatAttribute(DATABASE_ID, "tithes", "amount", true));
    await safeCreate("tithe_date", () => databases.createDatetimeAttribute(DATABASE_ID, "tithes", "tithe_date", true));
    await safeCreate("payment_method", () => databases.createStringAttribute(DATABASE_ID, "tithes", "payment_method", 50, false));
    await safeCreate("reference_number", () => databases.createStringAttribute(DATABASE_ID, "tithes", "reference_number", 100, false));
    await safeCreate("notes", () => databases.createStringAttribute(DATABASE_ID, "tithes", "notes", 500, false));
    await safeCreate("recorded_by", () => databases.createStringAttribute(DATABASE_ID, "tithes", "recorded_by", 50, false));

    // --- 5. TABELA OFFERINGS (OFERTAS) ---
    console.log("\n📂 Processando tabela: OFFERINGS");
    try {
      await databases.createCollection(DATABASE_ID, "offerings", "Offerings");
    } catch (e) { console.log("   ⚠️ Coleção já existe."); }
    await sleep(1000);
    await safeCreate("church_id", () => databases.createStringAttribute(DATABASE_ID, "offerings", "church_id", 50, true));
    await safeCreate("member_id", () => databases.createStringAttribute(DATABASE_ID, "offerings", "member_id", 50, false));
    await safeCreate("amount", () => databases.createFloatAttribute(DATABASE_ID, "offerings", "amount", true));
    await safeCreate("offering_date", () => databases.createDatetimeAttribute(DATABASE_ID, "offerings", "offering_date", true));
    await safeCreate("offering_type", () => databases.createStringAttribute(DATABASE_ID, "offerings", "offering_type", 50, false));
    await safeCreate("campaign", () => databases.createStringAttribute(DATABASE_ID, "offerings", "campaign", 200, false));
    await safeCreate("payment_method", () => databases.createStringAttribute(DATABASE_ID, "offerings", "payment_method", 50, false));
    await safeCreate("notes", () => databases.createStringAttribute(DATABASE_ID, "offerings", "notes", 500, false));
    await safeCreate("recorded_by", () => databases.createStringAttribute(DATABASE_ID, "offerings", "recorded_by", 50, false));

    // --- 6. TABELA EXPENSES (DESPESAS) ---
    console.log("\n📂 Processando tabela: EXPENSES");
    try {
      await databases.createCollection(DATABASE_ID, "expenses", "Expenses");
    } catch (e) { console.log("   ⚠️ Coleção já existe."); }
    await sleep(1000);
    await safeCreate("church_id", () => databases.createStringAttribute(DATABASE_ID, "expenses", "church_id", 50, true));
    await safeCreate("description", () => databases.createStringAttribute(DATABASE_ID, "expenses", "description", 500, true));
    await safeCreate("amount", () => databases.createFloatAttribute(DATABASE_ID, "expenses", "amount", true));
    await safeCreate("expense_date", () => databases.createDatetimeAttribute(DATABASE_ID, "expenses", "expense_date", true));
    await safeCreate("category", () => databases.createStringAttribute(DATABASE_ID, "expenses", "category", 100, false));
    await safeCreate("vendor", () => databases.createStringAttribute(DATABASE_ID, "expenses", "vendor", 200, false));
    await safeCreate("payment_method", () => databases.createStringAttribute(DATABASE_ID, "expenses", "payment_method", 50, false));
    await safeCreate("receipt_url", () => databases.createStringAttribute(DATABASE_ID, "expenses", "receipt_url", 500, false));
    await safeCreate("status", () => databases.createStringAttribute(DATABASE_ID, "expenses", "status", 50, false));
    await safeCreate("approved_by", () => databases.createStringAttribute(DATABASE_ID, "expenses", "approved_by", 50, false));
    await safeCreate("approved_at", () => databases.createDatetimeAttribute(DATABASE_ID, "expenses", "approved_at", false));
    await safeCreate("notes", () => databases.createStringAttribute(DATABASE_ID, "expenses", "notes", 500, false));
    await safeCreate("created_by", () => databases.createStringAttribute(DATABASE_ID, "expenses", "created_by", 50, false));

    console.log("\n🚀 BANCO COMPLETO CRIADO COM SUCESSO!");

  } catch (error) {
    console.error("\n❌ Erro crítico no setup:", error.message);
  }
}

setup();