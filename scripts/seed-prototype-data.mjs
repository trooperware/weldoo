import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const DEFAULT_PASSWORD = "Weldoo2026";

const env = loadEnvFile(resolve(process.cwd(), ".env.local"));
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
const demoPassword = env.WELDOO_DEMO_PASSWORD ?? process.env.WELDOO_DEMO_PASSWORD ?? DEFAULT_PASSWORD;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in app/.env.local.",
  );
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const companies = [
  {
    id: "91000000-0000-4000-8000-000000000001",
    email: "company.siemens@weldoo.test",
    name: "Siemens",
    ownerName: "Siemens Talent",
    sector: "Industrial software and digital manufacturing",
    size: "10,000+ employees",
    location: "Barcelona, Spain",
    website: "https://www.siemens.com",
    logo: logoDataUri("SIEMENS", "#009999", 9),
  },
  {
    id: "91000000-0000-4000-8000-000000000002",
    email: "company.ge@weldoo.test",
    name: "General Electric",
    ownerName: "GE Talent",
    sector: "Energy and aviation software",
    size: "10,000+ employees",
    location: "Madrid, Spain",
    website: "https://www.ge.com",
    logo: logoDataUri("GE", "#1F3A93", 18),
  },
  {
    id: "91000000-0000-4000-8000-000000000003",
    email: "company.blackdecker@weldoo.test",
    name: "Black & Decker",
    ownerName: "Black & Decker Talent",
    sector: "Tools, brand, and consumer products",
    size: "5,001-10,000 employees",
    location: "Barcelona, Spain",
    website: "https://www.blackanddecker.com",
    logo: logoDataUri("B&D", "#F4A800", 11, "#000000"),
  },
  {
    id: "91000000-0000-4000-8000-000000000004",
    email: "company.mitsubishi@weldoo.test",
    name: "Mitsubishi Electric",
    ownerName: "Mitsubishi Electric Talent",
    sector: "Industrial IoT and predictive maintenance",
    size: "10,000+ employees",
    location: "Barcelona, Spain",
    website: "https://www.mitsubishielectric.com",
    logo: logoDataUri("M", "#E60012", 20),
  },
  {
    id: "91000000-0000-4000-8000-000000000005",
    email: "company.3m@weldoo.test",
    name: "3M",
    ownerName: "3M Talent",
    sector: "Manufacturing and engineering leadership",
    size: "10,000+ employees",
    location: "Valencia, Spain",
    website: "https://www.3m.com",
    logo: logoDataUri("3M", "#FF0000", 16),
  },
  {
    id: "91000000-0000-4000-8000-000000000006",
    email: "company.philips@weldoo.test",
    name: "Philips",
    ownerName: "Philips Talent",
    sector: "Health technology and growth marketing",
    size: "10,000+ employees",
    location: "Madrid, Spain",
    website: "https://www.philips.com",
    logo: logoDataUri("Philips", "#0B5ED7", 9),
  },
  {
    id: "91000000-0000-4000-8000-000000000007",
    email: "company.bosch@weldoo.test",
    name: "Bosch",
    ownerName: "Bosch Talent",
    sector: "Connected devices and frontend engineering",
    size: "10,000+ employees",
    location: "Barcelona, Spain",
    website: "https://www.bosch.com",
    logo: logoDataUri("BOSCH", "#E20015", 9),
  },
  {
    id: "91000000-0000-4000-8000-000000000008",
    email: "company.honeywell@weldoo.test",
    name: "Honeywell",
    ownerName: "Honeywell Talent",
    sector: "Industrial automation and B2B SaaS",
    size: "10,000+ employees",
    location: "Madrid, Spain",
    website: "https://www.honeywell.com",
    logo: logoDataUri("HON", "#FC4C02", 12),
  },
];

const professionals = [
  {
    email: "demo@weldoo.net",
    name: "Demo User",
    headline: "Senior Welding Engineer · Weldoo Community",
    location: "Barcelona, Spain",
    weldingProcesses: ["TIG", "MIG/MAG", "WPS/PQR"],
    materials: ["Stainless steel", "High-strength steel"],
    positions: ["Senior Welding Engineer"],
    certifications: ["EN ISO 9606-1", "IWE"],
  },
  {
    email: "maria.gonzalez@weldoo.test",
    name: "Maria Gonzalez",
    headline: "Head of Product · Typeform",
    location: "Barcelona, Spain",
    weldingProcesses: ["Product Strategy", "Design Systems"],
    materials: ["B2B SaaS"],
    positions: ["Head of Product"],
    certifications: ["Product Discovery"],
  },
  {
    email: "jordi.roca@weldoo.test",
    name: "Jordi Roca",
    headline: "Senior Software Engineer · Glovo",
    location: "Barcelona, Spain",
    weldingProcesses: ["React", "TypeScript", "Frontend"],
    materials: ["Web platforms"],
    positions: ["Senior Software Engineer"],
    certifications: ["Cloud Architecture"],
  },
];

const jobs = [
  {
    id: "92000000-0000-4000-8000-000000000001",
    company: "Siemens",
    title: "Senior Product Designer",
    location: "Barcelona, Spain",
    workMode: "hybrid",
    contractType: "full_time",
    salaryMin: 55000,
    salaryMax: 75000,
    tags: ["Design Systems", "Figma", "UX Research"],
    area: "Design",
    description:
      "Siemens is looking for a Senior Product Designer to join our Digital Industries division in Barcelona. You will shape the interfaces used by engineers and operators across manufacturing facilities worldwide.",
    responsibilities:
      "Lead end-to-end design for industrial software products, create high-quality prototypes and production-ready designs, collaborate with engineering and product, and contribute to the shared component library.",
    requirements:
      "5+ years of product design experience, strong portfolio with complex problem-solving, experience with design systems, and fluent English.",
    benefits: ["Flexible hours", "Health insurance", "Home office allowance", "Learning budget EUR 2,000/yr"],
  },
  {
    id: "92000000-0000-4000-8000-000000000002",
    company: "General Electric",
    title: "UX Research Lead",
    location: "Madrid, Spain",
    workMode: "on_site",
    contractType: "full_time",
    salaryMin: 60000,
    salaryMax: 80000,
    tags: ["User Research", "Qualitative", "Mixed methods"],
    area: "Design",
    description:
      "At GE, we build technology that powers the world. We are looking for a UX Research Lead to guide product decisions across our energy and aviation software portfolio.",
    responsibilities:
      "Define the research strategy, run qualitative and quantitative studies, synthesise insights, and mentor junior researchers.",
    requirements:
      "6+ years of UX research experience, expert knowledge of mixed-methods research, and experience influencing product strategy.",
    benefits: ["GE stock plan", "Remote-friendly policies", "Mental health support", "Annual bonus"],
  },
  {
    id: "92000000-0000-4000-8000-000000000003",
    company: "Black & Decker",
    title: "Brand & Visual Designer",
    location: "Barcelona, Spain",
    workMode: "hybrid",
    contractType: "full_time",
    salaryMin: 38000,
    salaryMax: 52000,
    tags: ["Branding", "Motion", "Illustration"],
    area: "Design",
    description:
      "Black & Decker is looking for a Brand & Visual Designer to evolve its visual identity across digital and physical touchpoints.",
    responsibilities:
      "Design marketing assets, landing pages, ads and social content, create illustrations and motion graphics, and maintain visual brand guidelines.",
    requirements:
      "3+ years of brand or visual design experience, strong visual portfolio, and proficiency in Figma, Illustrator and After Effects.",
    benefits: ["Product discounts", "Creative budget", "Team events", "Hybrid 3 days/week"],
  },
  {
    id: "92000000-0000-4000-8000-000000000004",
    company: "Mitsubishi Electric",
    title: "Data Scientist - Predictive Maintenance",
    location: "Barcelona, Spain",
    workMode: "remote",
    contractType: "full_time",
    salaryMin: 55000,
    salaryMax: 72000,
    tags: ["Python", "ML", "Time Series"],
    area: "Data",
    description:
      "Mitsubishi Electric is building a centre of excellence in Barcelona and looking for a Data Scientist to develop predictive maintenance models for industrial equipment.",
    responsibilities:
      "Build anomaly detection and failure prediction models, analyse sensor time series data, and work with engineering teams to deploy models.",
    requirements:
      "3+ years of data science experience, strong Python skills, time series analysis, and industrial IoT knowledge as a plus.",
    benefits: ["100% remote", "Flexible hours", "Annual bonus", "Learning and development budget"],
  },
  {
    id: "92000000-0000-4000-8000-000000000005",
    company: "3M",
    title: "Engineering Manager",
    location: "Valencia, Spain",
    workMode: "on_site",
    contractType: "full_time",
    salaryMin: 70000,
    salaryMax: 90000,
    tags: ["Leadership", "Agile", "Manufacturing"],
    area: "Engineering",
    description:
      "3M is hiring an Engineering Manager to lead its software development team at the Valencia Innovation Centre.",
    responsibilities:
      "Manage a team of engineers, drive technical strategy, foster quality and inclusion, and partner with product managers on engineering roadmaps.",
    requirements:
      "5+ years in software engineering, 2+ years in management, strong full-stack background, and experience running agile teams.",
    benefits: ["3M innovation network", "Equity options", "Relocation support", "Private health"],
  },
  {
    id: "92000000-0000-4000-8000-000000000006",
    company: "Philips",
    title: "Growth Marketing Manager",
    location: "Madrid, Spain",
    workMode: "hybrid",
    contractType: "full_time",
    salaryMin: 48000,
    salaryMax: 64000,
    tags: ["Paid Media", "CRM", "Analytics"],
    area: "Marketing",
    description:
      "Philips is looking for a Growth Marketing Manager to scale digital acquisition and retention channels across Southern Europe.",
    responsibilities:
      "Own paid media channels, manage CRM campaigns, analyse performance data, and partner with brand, creative and analytics teams.",
    requirements:
      "4+ years in growth or performance marketing, data-driven mindset, and experience with Salesforce Marketing Cloud or similar platforms.",
    benefits: ["Health tech discounts", "Gym membership", "Hybrid 2 days home", "International exposure"],
  },
  {
    id: "92000000-0000-4000-8000-000000000007",
    company: "Bosch",
    title: "Frontend Engineer (React)",
    location: "Barcelona, Spain",
    workMode: "remote",
    contractType: "full_time",
    salaryMin: 48000,
    salaryMax: 65000,
    tags: ["React", "TypeScript", "IoT"],
    area: "Engineering",
    description:
      "Bosch is looking for a Frontend Engineer to build IoT dashboard products connecting millions of connected devices worldwide.",
    responsibilities:
      "Build accessible React applications, implement precise UI components, contribute to frontend architecture, and write tests.",
    requirements:
      "Strong React and TypeScript experience, Storybook familiarity, testing discipline, and experience with distributed teams.",
    benefits: ["100% remote Europe", "Flexible schedule", "Bosch innovation access", "Team retreats"],
  },
  {
    id: "92000000-0000-4000-8000-000000000008",
    company: "Honeywell",
    title: "Product Manager - Industrial Software",
    location: "Madrid, Spain",
    workMode: "hybrid",
    contractType: "full_time",
    salaryMin: 68000,
    salaryMax: 88000,
    tags: ["Product Strategy", "B2B", "SaaS"],
    area: "Product",
    description:
      "Honeywell is looking for a Product Manager to own the roadmap for its industrial automation software platform in Europe.",
    responsibilities:
      "Define and execute the product roadmap, collaborate with engineering and design, run discovery, and own key product metrics.",
    requirements:
      "4+ years of product management experience in industrial software or B2B SaaS, analytical mindset, and clear English communication.",
    benefits: ["Honeywell stock plan", "Hybrid 3/2", "Annual bonus", "Private health and dental"],
  },
];

const prototypePublishedOffsetsInDays = [2, 3, 5, 7, 7, 14, 14, 21];

async function main() {
  console.log("Seeding Weldoo prototype data...");

  const profileIdsByCompany = new Map();
  const profileIdsByProfessional = new Map();

  for (const company of companies) {
    const userId = await ensureUser(company.email, company.ownerName, "company");
    profileIdsByCompany.set(company.name, userId);

    await upsert("profiles", {
      id: userId,
      profile_type: "company",
      status: "active",
      display_name: company.ownerName,
      headline: `${company.name} recruiting team`,
      bio: `Demo company account for ${company.name}.`,
      location: company.location,
      website_url: company.website,
      avatar_url: company.logo,
      onboarding_completed: true,
    });

    await upsert("companies", {
      id: company.id,
      owner_profile_id: userId,
      name: company.name,
      sector: company.sector,
      company_size: company.size,
      location: company.location,
      description: `${company.name} demo company profile generated from the Weldoo prototype jobs data.`,
      website_url: company.website,
      contact_email: company.email,
      logo_url: company.logo,
    });
  }

  for (const professional of professionals) {
    const userId = await ensureUser(professional.email, professional.name, "professional");
    profileIdsByProfessional.set(professional.email, userId);

    await upsert("profiles", {
      id: userId,
      profile_type: "professional",
      status: "active",
      display_name: professional.name,
      headline: professional.headline,
      bio: `Demo professional account for ${professional.name}.`,
      location: professional.location,
      onboarding_completed: true,
    });

    await upsert(
      "professional_profiles",
      {
        profile_id: userId,
        years_experience: 8,
        availability: "open_to_opportunities",
        welding_processes: professional.weldingProcesses,
        materials: professional.materials,
        positions: professional.positions,
        certifications: professional.certifications,
        work_preferences: ["Hybrid", "Full-time"],
        travel_availability: true,
      },
      "profile_id",
    );
  }

  const companiesByName = new Map(companies.map((company) => [company.name, company]));

  for (const [index, job] of jobs.entries()) {
    const company = companiesByName.get(job.company);
    const ownerProfileId = profileIdsByCompany.get(job.company);

    if (!company || !ownerProfileId) {
      throw new Error(`Missing company seed for job ${job.title}`);
    }

    await upsert("jobs", {
      id: job.id,
      company_id: company.id,
      created_by_profile_id: ownerProfileId,
      title: job.title,
      description: job.description,
      responsibilities: job.responsibilities,
      requirements: job.requirements,
      location: job.location,
      work_mode: job.workMode,
      contract_type: job.contractType,
      salary_min: job.salaryMin,
      salary_max: job.salaryMax,
      salary_currency: "EUR",
      welding_processes: [job.area, ...job.tags.slice(0, 2)],
      materials: job.tags.slice(2),
      required_certifications: [],
      experience_level: job.area,
      travel_required: false,
      benefits: job.benefits,
      status: "published",
      published_at: new Date(
        Date.now() - prototypePublishedOffsetsInDays[index] * 24 * 60 * 60 * 1000,
      ).toISOString(),
    });
  }

  await seedApplications(profileIdsByProfessional);

  console.log(`Prototype seed complete: ${companies.length} companies, ${professionals.length} professionals, ${jobs.length} jobs.`);
  console.log(`Demo users use password from WELDOO_DEMO_PASSWORD, or ${DEFAULT_PASSWORD} when unset.`);
}

async function seedApplications(profileIdsByProfessional) {
  const applicantId = profileIdsByProfessional.get("demo@weldoo.net");
  if (!applicantId) return;

  const applications = [
    {
      job_id: jobs[0].id,
      applicant_profile_id: applicantId,
      message:
        "I have experience translating complex technical workflows into clear digital products and would like to discuss this role.",
      status: "submitted",
    },
    {
      job_id: jobs[6].id,
      applicant_profile_id: applicantId,
      message:
        "React, TypeScript and industrial tooling are a strong match with my current background.",
      status: "viewed",
    },
  ];

  const { error } = await supabase
    .from("job_applications")
    .upsert(applications, { onConflict: "job_id,applicant_profile_id" });

  if (error) throw new Error(`job_applications upsert failed: ${error.message}`);
}

async function ensureUser(email, displayName, profileType) {
  const existing = await findUserByEmail(email);

  if (existing) {
    const { error } = await supabase.auth.admin.updateUserById(existing.id, {
      email_confirm: true,
      user_metadata: {
        display_name: displayName,
        full_name: displayName,
        profile_type: profileType,
        seeded_by: "weldoo_prototype_seed",
      },
    });

    if (error) throw new Error(`Could not update auth user ${email}: ${error.message}`);
    return existing.id;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: demoPassword,
    email_confirm: true,
    user_metadata: {
      display_name: displayName,
      full_name: displayName,
      profile_type: profileType,
      seeded_by: "weldoo_prototype_seed",
    },
  });

  if (error) throw new Error(`Could not create auth user ${email}: ${error.message}`);
  if (!data.user?.id) throw new Error(`Supabase did not return an id for ${email}`);

  return data.user.id;
}

async function findUserByEmail(email) {
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(`Could not list auth users: ${error.message}`);

    const user = data.users.find((candidate) => candidate.email?.toLowerCase() === email.toLowerCase());
    if (user) return user;
    if (data.users.length < 1000) return null;

    page += 1;
  }
}

async function upsert(table, row, onConflict = "id") {
  const { error } = await supabase.from(table).upsert(row, { onConflict });
  if (error) throw new Error(`${table} upsert failed: ${error.message}`);
}

function loadEnvFile(path) {
  if (!existsSync(path)) return {};

  return Object.fromEntries(
    readFileSync(path, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const index = line.indexOf("=");
        if (index === -1) return [line, ""];
        const key = line.slice(0, index).trim();
        const rawValue = line.slice(index + 1).trim();
        return [key, rawValue.replace(/^["']|["']$/g, "")];
      }),
  );
}

function logoDataUri(text, background, fontSize, color = "#ffffff") {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="46" height="46" viewBox="0 0 46 46"><rect width="46" height="46" rx="9" fill="${background}"/><text x="23" y="23" text-anchor="middle" dominant-baseline="central" font-family="Arial,sans-serif" font-size="${fontSize}" font-weight="800" fill="${color}">${escapeXml(text)}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
