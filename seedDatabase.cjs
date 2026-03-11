const { Client, Databases, Users, ID } = require("node-appwrite");

const client = new Client()
  .setEndpoint("https://nyc.cloud.appwrite.io/v1")
  .setProject("69b04d62003030eed6bf")
  .setKey("standard_1f0033b844b10f56dcf40637bade2cb50d419f7c374d20ce5e695ab66de23e3895e6ce09e6aa4b01ec7bbacbbbaa4a1829b3518b1e63db07e566cef80cb0d6fca5da6125b93bc2544570391fda641ff3ebc089fced19c6b22f8158cd746d8ccb33b16e676f30c9a4deff6161bb49920f34f4d8680df4b3080c41e9ef88b9716f");

const databases = new Databases(client);
const authUsers = new Users(client);
const DATABASE_ID = "church_finance_db";

async function seed() {
  try {
    console.log("🌱 Iniciando o cadastro de dados iniciais...");

    // 1. Criar a Igreja de Teste
    console.log("⛪ Criando igreja-seed...");
    const church = await databases.createDocument(DATABASE_ID, "churches", ID.unique(), {
      name: "Igreja de Teste",
      slug: "igreja-seed",
      is_active: true
    });
    const churchId = church.$id;

    // 2. Lista de usuários para criar
    const usersToCreate = [
      { email: "admin@igreja.com", password: "Admin@1234", name: "Administrador", role: "admin" },
      { email: "tesoureiro@igreja.com", password: "Tesoureiro@1234", name: "Tesoureiro", role: "treasurer" },
      { email: "pastor@igreja.com", password: "Pastor@1234", name: "Pastor", role: "pastor" }
    ];

    for (const u of usersToCreate) {
      try {
        console.log(`👤 Criando usuário: ${u.email}...`);
        
        // Criar no Auth (Autenticação oficial do Appwrite)
        const authResult = await authUsers.create(ID.unique(), u.email, undefined, u.password, u.name);
        
        // Criar na tabela 'users' do banco para vincular à igreja
        await databases.createDocument(DATABASE_ID, "users", ID.unique(), {
          church_id: churchId,
          first_name: u.name,
          last_name: "Teste",
          email: u.email,
          role: u.role,
          is_active: true
        });

        console.log(`✅ ${u.name} criado com sucesso!`);
      } catch (e) {
        if (e.code === 409) console.log(`⚠️ Usuário ${u.email} já existe no Auth.`);
        else console.error(`❌ Erro ao criar ${u.email}:`, e.message);
      }
    }

    console.log("\n🚀 TUDO PRONTO! Agora você pode fazer login no navegador.");

  } catch (error) {
    console.error("❌ Erro no seed:", error.message);
  }
}

seed();