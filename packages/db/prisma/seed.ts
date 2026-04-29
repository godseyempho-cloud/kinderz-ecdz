import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const saGeography = {
  'Gauteng': ['City of Johannesburg', 'City of Tshwane', 'Ekurhuleni', 'Sedibeng', 'West Rand'],
  'Northern Cape': ['ZF Mgcawu', 'Namakwa', 'Pixley ka Seme', 'Frances Baard', 'John Taolo Gaetsewe'],
  'Western Cape': ['City of Cape Town', 'West Coast', 'Cape Winelands', 'Overberg', 'Garden Route', 'Central Karoo'],
  'Eastern Cape': ['Nelson Mandela Bay', 'Buffalo City', 'Sarah Baartman', 'Amatole', 'Chris Hani', 'Joe Gqabi', 'OR Tambo', 'Alfred Nzo'],
  'Free State': ['Mangaung', 'Xhariep', 'Lejweleputswa', 'Thabo Mofutsanyana', 'Fezile Dabi'],
  'KwaZulu-Natal': ['eThekwini', 'Ugu', 'uMgungundlovu', 'uThukela', 'uMzinyathi', 'Amajuba', 'Zululand', 'uMkhanyakude', 'King Cetshwayo', 'iLembe', 'Harry Gwala'],
  'Limpopo': ['Mopani', 'Vhembe', 'Capricorn', 'Waterberg', 'Sekhukhune'],
  'Mpumalanga': ['Gert Sibande', 'Nkangala', 'Ehlanzeni'],
  'North West': ['Bojanala Platinum', 'Ngaka Modiri Molema', 'Dr Ruth Segomotsi Mompati', 'Dr Kenneth Kaunda']
};

/**
 * Helper to create URL-friendly slugs
 */
const slugify = (text: string) => 
  text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

async function main() {
  const adminPassword = "Admin123!";
  const hashedPassword = await hash(adminPassword, 12);

  console.log("🚀 Starting Optimized Nuclear Seed...");

  await prisma.$transaction(async (tx) => {
    
    // --- 1. CLEANUP ---
    console.log("🧹 Cleaning up old data...");
    await tx.account.deleteMany({});
    await tx.invite.deleteMany({}); // Added cleanup for invites
    await tx.user.deleteMany({});
    await tx.district.deleteMany({});
    await tx.province.deleteMany({});

    // --- 2. SEED GEOGRAPHY ---
    console.log("📍 Mapping 9 Provinces and 52 Districts...");
    
    for (const [provinceName, districts] of Object.entries(saGeography)) {
      const provinceSlug = slugify(provinceName);

      const province = await tx.province.create({
        data: { 
          id: provinceSlug, 
          name: provinceName 
        }
      });

      for (const districtName of districts) {
        const districtSlug = slugify(districtName);
        // ID format example: 'gauteng-city-of-johannesburg'
        const districtId = `${provinceSlug}-${districtSlug}`;
        
        await tx.district.create({
          data: {
            id: districtId,
            name: districtName,
            provinceId: province.id,
          }
        });
      }
    }

    // --- 3. SETUP BOOTSTRAP ACCOUNTS ---
    const accountsToSeed = [
      {
        email: "godseyempho@gmail.com",
        name: "System Admin",
        role: "ADMIN" as Role,
        provinceId: null,
      },
      {
        email: "mpholincoln@gmail.com",
        name: "Mpho Lincoln",
        role: "PROVINCIAL" as Role,
        provinceId: "northern-cape", 
      }
    ];

    console.log("👤 Provisioning System Accounts...");
    for (const acc of accountsToSeed) {
      const user = await tx.user.create({
        data: {
          email: acc.email,
          name: acc.name,
          role: acc.role,
          provinceId: acc.provinceId,
          isActive: true,
          emailVerified: true,
        },
      });

      await tx.account.create({
        data: {
          userId: user.id,
          providerId: "credential",
          accountId: acc.email,
          password: hashedPassword,
        },
      });
    }

  }, {
    maxWait: 20000,
    timeout: 90000 
  });

  console.log("✅ National Seed Successful! Slugs generated for all regions.");
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });