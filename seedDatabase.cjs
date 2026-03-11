const { Client, Databases, Users, ID } = require("node-appwrite");

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("69b13671000153797c67")
  .setKey("standard_602a70a0bcf1983d794dafaea6db7be033ff957350aff5f6ff73618b59107950df6263a61b37850e7a51b18d4d4eee2d426ea426effa7de9ecbb464c05966f22ac6bf6562613b17e4e9836359de0cc5f4c6422ab17d80957ec8efe5c14baa9a8f1970852fb6f93fbdedec2cd6a726611fffa317eeb5db7fcd8ba72079059bf01");

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