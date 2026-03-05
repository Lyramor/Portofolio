// src/lib/db.js
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';

// Create a connection pool for better performance
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'portfolio_admin',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Helper function to execute SQL queries
async function query(sql, params) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Initialize database by creating necessary tables if they don't exist
async function initializeDatabase() {
  try {
    // Users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Sessions table
    await query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Skills table
    await query(`
      CREATE TABLE IF NOT EXISTS skills (
        id INT AUTO_INCREMENT PRIMARY KEY,
        label VARCHAR(100) NOT NULL UNIQUE,
        imgSrc VARCHAR(255),
        description TEXT, -- Mengubah VARCHAR ke TEXT untuk deskripsi skill
        \`order\` INT DEFAULT NULL, -- Menambahkan kolom order untuk pengurutan
        archived TINYINT(1) DEFAULT 0, -- Menambahkan kolom archived
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Experience table
    await query(`
      CREATE TABLE IF NOT EXISTS experience (
        id INT AUTO_INCREMENT PRIMARY KEY,
        period VARCHAR(100) NOT NULL,
        position VARCHAR(255) NOT NULL,
        company VARCHAR(255) NOT NULL,
        description TEXT,
        display_order INT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Experience-Skills Junction Table
    await query(`
      CREATE TABLE IF NOT EXISTS experience_skills (
        id INT AUTO_INCREMENT PRIMARY KEY,
        experience_id INT NOT NULL,
        skill_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (experience_id) REFERENCES experience(id) ON DELETE CASCADE,
        FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
        UNIQUE KEY (experience_id, skill_id)
      )
    `);

    // Projects table
    await query(`
      CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image VARCHAR(255),
        link VARCHAR(255),
        \`order\` INT DEFAULT NULL, -- Menambahkan kolom order untuk pengurutan proyek
        archived TINYINT(1) DEFAULT 0, -- Menambahkan kolom archived untuk proyek
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Projects-Skills Junction Table
    await query(`
      CREATE TABLE IF NOT EXISTS project_skills (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        skill_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
        UNIQUE KEY (project_id, skill_id)
    )`);

    // Counters table for projects
    await query(`
      CREATE TABLE IF NOT EXISTS counter_projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        number INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Counters table for experience
    await query(`
      CREATE TABLE IF NOT EXISTS counter_experience (
        id INT AUTO_INCREMENT PRIMARY KEY,
        number INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // About table
    await query(`
      CREATE TABLE IF NOT EXISTS about (
        id INT AUTO_INCREMENT PRIMARY KEY,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // CV table
    await query(`
      CREATE TABLE IF NOT EXISTS cv (
        id INT AUTO_INCREMENT PRIMARY KEY,
        link_cv TEXT NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Organizations table
    await query(`
      CREATE TABLE IF NOT EXISTS organizations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        role VARCHAR(255) NOT NULL,
        organization VARCHAR(255) NOT NULL,
        period VARCHAR(100) NOT NULL,
        description TEXT,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Speaking & Invitations table
    await query(`
      CREATE TABLE IF NOT EXISTS speaking (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event VARCHAR(255) NOT NULL,
        organizer VARCHAR(255),
        role VARCHAR(255),
        description TEXT,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Awards table
    await query(`
      CREATE TABLE IF NOT EXISTS awards (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        issuer VARCHAR(255),
        year VARCHAR(10),
        description TEXT,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);


    console.log('Database initialized successfully');
    await migrateExperienceTechnologies();
    await migrateSkillDescription(); // Panggil migrasi untuk deskripsi skill
    await addOrderAndArchivedToSkills(); // Panggil migrasi untuk kolom order dan archived di skills
    await addOrderAndArchivedToProjects(); // Panggil migrasi untuk kolom order dan archived di projects
    await migrateActivitiesImageUrl(); // Tambah image_url ke organizations & speaking
    await migrateSkillDescriptionsToEnglish(); // Update Indonesian skill descriptions to English

  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

async function migrateActivitiesImageUrl() {
  try {
    const orgCols = await query('SHOW COLUMNS FROM organizations LIKE "image_url"');
    if (orgCols.length === 0) {
      await query('ALTER TABLE organizations ADD COLUMN image_url VARCHAR(500) NULL');
      console.log('✅ Added image_url to organizations');
    }
    const spkCols = await query('SHOW COLUMNS FROM speaking LIKE "image_url"');
    if (spkCols.length === 0) {
      await query('ALTER TABLE speaking ADD COLUMN image_url VARCHAR(500) NULL');
      console.log('✅ Added image_url to speaking');
    }
  } catch (error) {
    console.error('Error migrating activities image_url:', error);
  }
}

async function migrateSkillDescriptionsToEnglish() {
  try {
    const updates = [
      { old: 'Bahasa pemrograman inti untuk web interaktif.', new: 'Core programming language for building interactive web applications.' },
      { old: 'Pustaka JavaScript untuk membangun antarmuka pengguna.', new: 'JavaScript library for building dynamic user interfaces.' },
      { old: 'Lingkungan runtime JavaScript sisi server.', new: 'Server-side JavaScript runtime environment.' },
      { old: 'Sistem manajemen database relasional populer.', new: 'Popular open-source relational database management system.' },
      { old: 'Bahasa markup standar untuk membuat halaman web.', new: 'Standard markup language for creating web pages.' },
      { old: 'Bahasa stylesheet untuk mendesain tampilan web.', new: 'Stylesheet language for designing and styling web layouts.' },
    ];
    for (const u of updates) {
      await query('UPDATE skills SET description = ? WHERE description = ?', [u.new, u.old]);
    }
    console.log('✅ Skill descriptions migrated to English');
  } catch (error) {
    console.error('Error migrating skill descriptions:', error);
  }
}

// Create an admin user and seed initial data
async function seedAdminUser() {
  try {
    const [users] = await query('SELECT COUNT(*) as count FROM users');
    if (users.count === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('cipanas12345', salt);

      await query(
        'INSERT INTO users (email, username, password) VALUES (?, ?, ?)',
        ['mmarsa2435@gmail.com', 'mmarsa2435', hashedPassword]
      );
      console.log('✅ Default admin user created');
    }

    await seedAboutContent();
    await seedExperience();
    await seedSkills();
    await seedOrganizations();
    await seedSpeaking();
    await seedAwards();
  } catch (error) {
    console.error('❌ Failed to seed initial data:', error);
    throw error;
  }
}

async function seedAboutContent() {
  try {
    const [about] = await query('SELECT COUNT(*) as count FROM about');
    if (about.count === 0) {
      await query(
        'INSERT INTO about (content) VALUES (?)',
        ["As an Informatics Engineering student with a strong interest in both web development and data science, I am dedicated to building engaging and responsive interfaces, as well as developing analytical and predictive solutions. I am committed to continuously learning and honing my skills in both of these fields, and I am actively seeking mentorship opportunities to accelerate my career development in the technology industry."]
      );
      console.log('✅ Initial about content created');
    }
  } catch (error) {
    console.error('Error seeding about content:', error);
  }
}

async function seedExperience() {
  try {
    const [row] = await query('SELECT COUNT(*) as count FROM experience');
    if (row.count === 0) {
      const experiences = [
        {
          period: 'February 2025 – Mei 2025',
          position: 'Front-End Developer',
          company: 'PT Solusi Komunikasi Terapan',
          description: '<p>Tasked with rebuilding the company website after a cyber attack. I successfully developed and launched a new, more secure version to restore operations and prevent future threats.</p><ul><li>Responsible for the frontend development of two websites within a one-week timeframe.</li><li>Performed hosting and server activity monitoring to ensure the smooth operation of both websites.</li><li>Successfully completed the project within one week timeframe.</li></ul>',
          display_order: 1,
        },
        {
          period: 'January 2025 – January 2025',
          position: 'Laboratory Assistant',
          company: 'Informatics Engineering',
          description: '<ul><li>Taught and mentored one class of students for the "Programming Practicum 1" course.</li><li>Served as a member of the grading team, responsible for evaluating assignments, quizzes, and final projects.</li><li>Assisted students with code debugging and reinforced their understanding of fundamental programming concepts.</li></ul>',
          display_order: 2,
        },
        {
          period: 'July 2025 – September 2025',
          position: 'Front-End Developer',
          company: 'Naramakna',
          description: '<ul><li>Developed the front-end architecture using React, TypeScript, and Vite, structured around the Atomic Design principles.</li><li>Designed and implemented front-end components for article management and display.</li><li>Responsible for implementing core features such as external API integrations with YouTube and TikTok, the comment system, and ad management.</li></ul>',
          display_order: 3,
        },
        {
          period: 'July 2025 – September 2025',
          position: 'Fullstack Developer',
          company: 'Faculty of Engineering, Pasundan University',
          description: '<ul><li>Developing a university website with a focus on modules.</li><li>Implementing the Whistleblower (Complaint) module, including functionalities for anonymous reporting, complaint category management, and a comment/history system.</li><li>Designing and building the Asset Management Module for Facilities and Infrastructure (Sarpra), including CRUD features for assets, buildings, and rooms.</li></ul>',
          display_order: 4,
        },
        {
          period: 'August 2025 – Present',
          position: 'Front-End Developer',
          company: 'PT Kunci',
          description: '<ul><li>Design and develop a user interface for the Student Gamification module, which includes teacher-managed features.</li><li>Created a front-end component for teachers, allowing them to manage and organize gamification, such as creating missions, awarding points, and tracking student progress.</li><li>Develop an interactive and engaging interface for students so they can view their gamification profiles, achievements, rankings, and learning progress.</li></ul>',
          display_order: 5,
        },
        {
          period: 'September 2025 – Present',
          position: 'Fullstack Developer',
          company: 'PT Titik Terang',
          description: '<ul><li>Delivered 5 web-based projects within 6 months as the sole Fullstack Developer, handling end-to-end development from system architecture design to production deployment.</li><li>Owned the DevOps lifecycle, including server configuration, CI/CD deployment, database management, version control, and ongoing system monitoring and maintenance.</li><li>Collaborated cross-functionally with UI/UX Designers and QA Testers to ensure high-quality, scalable, and user-centered solutions.</li><li>Implemented Scrum methodology, actively participating in sprint planning, daily stand-ups, backlog refinement, development cycles, and sprint retrospectives.</li></ul>',
          display_order: 6,
        },
      ];
      for (const exp of experiences) {
        await query(
          'INSERT INTO experience (period, position, company, description, display_order) VALUES (?, ?, ?, ?, ?)',
          [exp.period, exp.position, exp.company, exp.description, exp.display_order]
        );
      }
      console.log('✅ Initial experiences seeded');
    }
  } catch (error) {
    console.error('Error seeding experience:', error);
  }
}

async function seedSkills() {
  try {
    const [skills] = await query('SELECT COUNT(*) as count FROM skills');
    if (skills.count === 0) {
      const defaultSkills = [
        { label: 'JavaScript', imgSrc: '/images/skills/javascript.svg', description: 'Core programming language for building interactive web applications.' },
        { label: 'React', imgSrc: '/images/skills/react.svg', description: 'JavaScript library for building dynamic user interfaces.' },
        { label: 'Node.js', imgSrc: '/images/skills/nodejs.svg', description: 'Server-side JavaScript runtime environment.' },
        { label: 'MySQL', imgSrc: '/images/skills/mysql.svg', description: 'Popular open-source relational database management system.' },
        { label: 'HTML', imgSrc: '/images/skills/html.svg', description: 'Standard markup language for creating web pages.' },
        { label: 'CSS', imgSrc: '/images/skills/css.svg', description: 'Stylesheet language for designing and styling web layouts.' }
      ];

      for (const skill of defaultSkills) {
        await query(
          'INSERT INTO skills (label, imgSrc, description, `order`, archived) VALUES (?, ?, ?, ?, ?)',
          [skill.label, skill.imgSrc, skill.description, 0, 0] // Default order 0, not archived
        );
      }
      console.log('✅ Initial skills created');
    }
  } catch (error) {
    console.error('Error seeding skills:', error);
  }
}

// Project Management Functions
async function getProjects() {
  // Mengambil proyek dan mengurutkan berdasarkan kolom 'order'
  return await query('SELECT * FROM projects ORDER BY `order` ASC, created_at DESC');
}

async function getProjectById(id) {
  const projects = await query('SELECT * FROM projects WHERE id = ?', [id]);
  return projects[0];
}

async function createProject(projectData) {
  // Menambahkan kolom `order` dan `archived`
  const result = await query(
    'INSERT INTO projects (title, description, image, link, `order`, archived) VALUES (?, ?, ?, ?, ?, ?)',
    [projectData.title, projectData.description, projectData.image, projectData.link || null, projectData.order, projectData.archived]
  );
  
  if (projectData.skills?.length > 0) {
    await updateProjectSkills(result.insertId, projectData.skills);
  }
  return result.insertId;
}

async function updateProject(id, projectData) {
  // Menambahkan kolom `order` dan `archived`
  await query(
    'UPDATE projects SET title = ?, description = ?, image = ?, link = ?, `order` = ?, archived = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [projectData.title, projectData.description, projectData.image, projectData.link || null, projectData.order, projectData.archived, id]
  );
  
  if (projectData.skills) {
    await updateProjectSkills(id, projectData.skills);
  }
  return true;
}

async function deleteProject(id) {
  await query('DELETE FROM project_skills WHERE project_id = ?', [id]);
  await query('DELETE FROM projects WHERE id = ?', [id]);
  return true;
}

// Project Skills Management
async function getProjectSkills(projectId) {
  return await query(`
    SELECT s.* FROM skills s
    JOIN project_skills ps ON s.id = ps.skill_id
    WHERE ps.project_id = ?
  `, [projectId]);
}

async function updateProjectSkills(projectId, skillIds) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('DELETE FROM project_skills WHERE project_id = ?', [projectId]);

    if (skillIds?.length > 0) {
      const values = skillIds.map(skillId => [projectId, skillId]);
      await connection.query(
        'INSERT INTO project_skills (project_id, skill_id) VALUES ?',
        [values]
      );
    }
    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function getProjectsWithSkills() {
  // MODIFIKASI: Ambil semua proyek beserta skill terkait dalam satu query (mengatasi N+1)
  const projects = await query(`
    SELECT
      p.*,
      GROUP_CONCAT(s.id) as skill_ids,
      GROUP_CONCAT(s.label) as skill_labels
    FROM projects p
    LEFT JOIN project_skills ps ON p.id = ps.project_id
    LEFT JOIN skills s ON ps.skill_id = s.id
    WHERE p.archived = 0 -- Pastikan hanya proyek yang tidak diarsipkan
    GROUP BY p.id
    ORDER BY p.\`order\` ASC, p.created_at DESC
  `);

  return projects.map(project => ({
    ...project,
    skill_ids: project.skill_ids ? project.skill_ids.split(',').map(id => parseInt(id)) : [],
    technologies: project.skill_labels ? project.skill_labels.split(',') : []
  }));
}

// Experience Management
async function getExperiences() {
  return await query(`
    SELECT * FROM experience 
    ORDER BY display_order ASC, created_at DESC
  `);
}

async function getExperienceById(id) {
  const experiences = await query('SELECT * FROM experience WHERE id = ?', [id]);
  return experiences[0];
}

async function getExperiencesWithSkills() {
  // MODIFIKASI: Ambil semua pengalaman beserta skill terkait dalam satu query (mengatasi N+1)
  const experiences = await query(`
    SELECT
      e.*,
      GROUP_CONCAT(s.id) as skill_ids,
      GROUP_CONCAT(s.label) as skill_labels
    FROM experience e
    LEFT JOIN experience_skills es ON e.id = es.experience_id
    LEFT JOIN skills s ON es.skill_id = s.id
    GROUP BY e.id
    ORDER BY e.display_order ASC, e.created_at DESC
  `);

  return experiences.map(exp => ({
    ...exp,
    skill_ids: exp.skill_ids ? exp.skill_ids.split(',').map(id => parseInt(id)) : [],
    technologies: exp.skill_labels ? exp.skill_labels.split(',') : []
  }));
}

async function getExperienceSkills(experienceId) {
  return await query(`
    SELECT s.* FROM skills s
    JOIN experience_skills es ON s.id = es.skill_id
    WHERE es.experience_id = ?
  `, [experienceId]);
}

async function updateExperienceSkills(experienceId, skillIds) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('DELETE FROM experience_skills WHERE experience_id = ?', [experienceId]);

    if (skillIds?.length > 0) {
      const values = skillIds.map(skillId => [experienceId, skillId]);
      await connection.query(
        'INSERT INTO experience_skills (experience_id, skill_id) VALUES ?',
        [values]
      );
    }
    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Skills Management
async function getSkills() {
  return await query('SELECT * FROM skills WHERE archived = 0 ORDER BY `order` ASC, label ASC');
}

async function createSkill(skillData) {
  const result = await query(
    'INSERT INTO skills (label, imgSrc) VALUES (?, ?)',
    [skillData.label, skillData.imgSrc]
  );
  return result.insertId;
}

async function updateSkill(id, skillData) {
  await query(
    'UPDATE skills SET label = ?, imgSrc = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [skillData.label, skillData.imgSrc, id]
  );
  return true;
}

async function deleteSkill(id) {
  await query('DELETE FROM project_skills WHERE skill_id = ?', [id]);
  await query('DELETE FROM experience_skills WHERE skill_id = ?', [id]);
  await query('DELETE FROM skills WHERE id = ?', [id]);
  return true;
}

// Counters Management
async function getCounters() {
  const [projectCounter] = await query('SELECT * FROM counter_projects LIMIT 1');
  const [experienceCounter] = await query('SELECT * FROM counter_experience LIMIT 1');
  
  return {
    projects: projectCounter?.number || 0,
    experience: experienceCounter?.number || 0
  };
}

async function updateProjectCounter(number) {
  const [existing] = await query('SELECT * FROM counter_projects LIMIT 1');
  if (existing) {
    await query('UPDATE counter_projects SET number = ?, updated_at = CURRENT_TIMESTAMP', [number]);
  } else {
    await query('INSERT INTO counter_projects (number) VALUES (?)', [number]);
  }
  return true;
}

async function updateExperienceCounter(number) {
  const [existing] = await query('SELECT * FROM counter_experience LIMIT 1');
  if (existing) {
    await query('UPDATE counter_experience SET number = ?, updated_at = CURRENT_TIMESTAMP', [number]);
  } else {
    await query('INSERT INTO counter_experience (number) VALUES (?)', [number]);
  }
  return true;
}

// About Management
async function getAbout() {
  const about = await query('SELECT * FROM about LIMIT 1');
  return about[0] || null;
}

async function updateAbout(content) {
  const [existing] = await query('SELECT * FROM about LIMIT 1');
  if (existing) {
    await query('UPDATE about SET content = ?, updated_at = CURRENT_TIMESTAMP', [content]);
  } else {
    await query('INSERT INTO about (content) VALUES (?)', [content]);
  }
  return true;
}

// Admin Stats
async function getAdminStats() {
  const [
    [{ count: projects }],
    [{ count: skills }],
    [{ count: experience }],
    [{ count: about }],
    [counterProjects],
    [counterExperience],
    [{ count: users }]
  ] = await Promise.all([
    query('SELECT COUNT(*) as count FROM projects'),
    query('SELECT COUNT(*) as count FROM skills'),
    query('SELECT COUNT(*) as count FROM experience'),
    query('SELECT COUNT(*) as count FROM about'),
    query('SELECT number FROM counter_projects LIMIT 1'),
    query('SELECT number FROM counter_experience LIMIT 1'),
    query('SELECT COUNT(*) as count FROM users')
  ]);
  
  return {
    projects,
    skills,
    experience,
    about,
    counterProjects: counterProjects?.number || 0,
    counterExperience: counterExperience?.number || 0,
    users
  };
}

// --- Migrasi Database (untuk kolom baru) ---

async function migrateExperienceTechnologies() {
  try {
    const [columns] = await query(`SHOW COLUMNS FROM experience LIKE 'technologies'`);
    if (columns && columns.length > 0) { // Check if column exists
      const experiencesWithTech = await query(`
        SELECT id, technologies FROM experience 
        WHERE technologies IS NOT NULL AND technologies != ''
      `);
      
      if (experiencesWithTech.length > 0) {
        console.log(`Found ${experiencesWithTech.length} experiences with technologies to migrate`);
        
        for (const exp of experiencesWithTech) {
          const techs = exp.technologies.split(',').map(tech => tech.trim());
          
          for (const tech of techs) {
            let [skill] = await query('SELECT id FROM skills WHERE label = ?', [tech]);
            if (!skill || skill.length === 0) { // Check if skill exists
              const result = await query(
                'INSERT INTO skills (label, imgSrc) VALUES (?, ?)',
                [tech, '/images/skills/default.svg']
              );
              skill = { id: result.insertId };
              console.log(`Created new skill: ${tech} with ID ${skill.id}`);
            } else {
              skill = skill[0]; // Get the first result if it's an array
            }
            
            await query(
              'INSERT IGNORE INTO experience_skills (experience_id, skill_id) VALUES (?, ?)',
              [exp.id, skill.id]
            );
          }
        }
        
        console.log('Migration completed successfully');
        await query(`ALTER TABLE experience DROP COLUMN technologies`);
        console.log('Removed technologies column');
      }
    }
  } catch (error) {
    console.error('Migration error (migrateExperienceTechnologies):', error);
  }
}

async function migrateSkillDescription() {
  try {
    const [columns] = await query(`SHOW COLUMNS FROM skills LIKE 'description'`);
    if (columns && columns.length === 0) {
      await query(`ALTER TABLE skills ADD COLUMN description TEXT DEFAULT NULL`);
      console.log('Added description column to skills table.');
    }
  } catch (error) {
    console.error('Migration error (migrateSkillDescription):', error);
  }
}

async function addOrderAndArchivedToSkills() {
  try {
    const [orderColumn] = await query(`SHOW COLUMNS FROM skills LIKE 'order'`);
    if (orderColumn && orderColumn.length === 0) {
      await query(`ALTER TABLE skills ADD COLUMN \`order\` INT DEFAULT NULL`);
      console.log('Added `order` column to skills table.');
      // Inisialisasi order untuk skill yang sudah ada
      const existingSkills = await query('SELECT id FROM skills ORDER BY created_at ASC');
      for (let i = 0; i < existingSkills.length; i++) {
        await query('UPDATE skills SET `order` = ? WHERE id = ?', [i, existingSkills[i].id]);
      }
      console.log('Initialized `order` for existing skills.');
    }

    const [archivedColumn] = await query(`SHOW COLUMNS FROM skills LIKE 'archived'`);
    if (archivedColumn && archivedColumn.length === 0) {
      await query(`ALTER TABLE skills ADD COLUMN archived TINYINT(1) DEFAULT 0`);
      console.log('Added `archived` column to skills table.');
    }
  } catch (error) {
    console.error('Migration error (addOrderAndArchivedToSkills):', error);
  }
}

async function addOrderAndArchivedToProjects() {
  try {
    const [orderColumn] = await query(`SHOW COLUMNS FROM projects LIKE 'order'`);
    if (orderColumn && orderColumn.length === 0) {
      await query(`ALTER TABLE projects ADD COLUMN \`order\` INT DEFAULT NULL`);
      console.log('Added `order` column to projects table.');
      // Inisialisasi order untuk proyek yang sudah ada
      const existingProjects = await query('SELECT id FROM projects ORDER BY created_at ASC');
      for (let i = 0; i < existingProjects.length; i++) {
        await query('UPDATE projects SET `order` = ? WHERE id = ?', [i, existingProjects[i].id]);
      }
      console.log('Initialized `order` for existing projects.');
    }

    const [archivedColumn] = await query(`SHOW COLUMNS FROM projects LIKE 'archived'`);
    if (archivedColumn && archivedColumn.length === 0) {
      await query(`ALTER TABLE projects ADD COLUMN archived TINYINT(1) DEFAULT 0`);
      console.log('Added `archived` column to projects table.');
    }
  } catch (error) {
    console.error('Migration error (addOrderAndArchivedToProjects):', error);
  }
}


// ─── Seed functions ───────────────────────────────────────────────────────────

async function seedOrganizations() {
  try {
    const [row] = await query('SELECT COUNT(*) as count FROM organizations');
    if (row.count === 0) {
      const items = [
        {
          role: 'Creative Economy Staff',
          organization: 'HMTIF, Pasundan University',
          period: 'August 2024 – August 2025',
          description: '<ul><li>Served as Project Leader for the "Seminar Entrepreneurship and Digital Marketing 2025", successfully attracting 70+ participants from students.</li><li>Managed and executed the organization\'s fundraising (danus) program, including product planning, sales strategy, and weekly distribution.</li><li>Achieved consistently strong weekly sales performance, with products frequently reaching sold-out status due to high demand.</li></ul>',
          display_order: 1,
        },
        {
          role: 'Web Curriculum Developer',
          organization: 'GDGOC Pasundan University',
          period: 'November 2024 – Present',
          description: '<ul><li>Served as Project Leader for Creation Boost, a weekly web mentoring program attended by 100+ Universitas Pasundan students, aimed at strengthening practical development skills.</li><li>Led Creation Box, the culminating appreciation event of Creation Boost, recognizing outstanding student project submissions and top performers.</li><li>Delivered a Study Jam session as a Speaker on Basic PHP, attended by 30+ students, focusing on foundational backend development concepts and hands-on implementation.</li></ul>',
          display_order: 2,
        },
      ];
      for (const item of items) {
        await query(
          'INSERT INTO organizations (role, organization, period, description, display_order) VALUES (?, ?, ?, ?, ?)',
          [item.role, item.organization, item.period, item.description, item.display_order]
        );
      }
      console.log('✅ Initial organizations seeded');
    }
  } catch (error) {
    console.error('Error seeding organizations:', error);
  }
}

async function seedSpeaking() {
  try {
    const [row] = await query('SELECT COUNT(*) as count FROM speaking');
    if (row.count === 0) {
      const items = [
        {
          event: 'Expo Campus and Business World',
          organizer: 'SMA Negeri 1 Sukaresmi',
          role: 'Speaker',
          description: 'Representing Jabar Future Leaders Scholarship (JFLS) awardees, sharing academic journey and scholarship insights with high school students.',
          display_order: 1,
        },
        {
          event: 'TIF CAST (Teknik Informatika Podcast)',
          organizer: 'Informatics Engineering Department',
          role: 'Guest Speaker',
          description: 'Invited as a Guest Speaker as a JFLS Scholarship Recipient, discussing academic achievement, leadership experience, and scholarship opportunities.',
          display_order: 2,
        },
      ];
      for (const item of items) {
        await query(
          'INSERT INTO speaking (event, organizer, role, description, display_order) VALUES (?, ?, ?, ?, ?)',
          [item.event, item.organizer, item.role, item.description, item.display_order]
        );
      }
      console.log('✅ Initial speaking entries seeded');
    }
  } catch (error) {
    console.error('Error seeding speaking:', error);
  }
}

async function seedAwards() {
  try {
    const [row] = await query('SELECT COUNT(*) as count FROM awards');
    if (row.count === 0) {
      const items = [
        {
          title: 'Jabar Future Leader Regular Scholarship',
          issuer: 'Pemerintah Provinsi Jawa Barat',
          year: '2023',
          description: 'Recipient of the Jabar Future Leader Scholarship (JFLS), a prestigious scholarship awarded by the West Java Provincial Government to outstanding students with strong academic and leadership potential.',
          display_order: 1,
        },
        {
          title: 'Copyright – Whistleblower (Sexual Violence Prevention & Reporting System in Higher Education)',
          issuer: 'Direktorat Jenderal Kekayaan Intelektual, Kementerian Hukum Republik Indonesia',
          year: '2026',
          description: 'Registered copyright (Program Komputer) for the Whistleblower system — a web-based platform for reporting and handling sexual violence prevention in higher education environments. Registration No: 001131074 | EC002026022299, February 5, 2026. Valid for 50 years.',
          display_order: 2,
        },
      ];
      for (const item of items) {
        await query(
          'INSERT INTO awards (title, issuer, year, description, display_order) VALUES (?, ?, ?, ?, ?)',
          [item.title, item.issuer, item.year, item.description, item.display_order]
        );
      }
      console.log('✅ Initial awards seeded');
    }
  } catch (error) {
    console.error('Error seeding awards:', error);
  }
}

// ─── Organizations CRUD ───────────────────────────────────────────────────────

async function getOrganizations() {
  return await query('SELECT * FROM organizations ORDER BY display_order ASC, created_at ASC');
}

async function getOrganizationById(id) {
  const rows = await query('SELECT * FROM organizations WHERE id = ?', [id]);
  return rows[0] || null;
}

async function createOrganization(data) {
  const result = await query(
    'INSERT INTO organizations (role, organization, period, description, image_url, display_order) VALUES (?, ?, ?, ?, ?, ?)',
    [data.role, data.organization, data.period, data.description || null, data.image_url || null, data.display_order || 0]
  );
  return result.insertId;
}

async function updateOrganization(id, data) {
  await query(
    'UPDATE organizations SET role=?, organization=?, period=?, description=?, image_url=?, display_order=?, updated_at=CURRENT_TIMESTAMP WHERE id=?',
    [data.role, data.organization, data.period, data.description || null, data.image_url || null, data.display_order || 0, id]
  );
  return true;
}

async function deleteOrganization(id) {
  await query('DELETE FROM organizations WHERE id = ?', [id]);
  return true;
}

// ─── Speaking CRUD ────────────────────────────────────────────────────────────

async function getSpeaking() {
  return await query('SELECT * FROM speaking ORDER BY display_order ASC, created_at ASC');
}

async function getSpeakingById(id) {
  const rows = await query('SELECT * FROM speaking WHERE id = ?', [id]);
  return rows[0] || null;
}

async function createSpeaking(data) {
  const result = await query(
    'INSERT INTO speaking (event, organizer, role, description, image_url, display_order) VALUES (?, ?, ?, ?, ?, ?)',
    [data.event, data.organizer || null, data.role || null, data.description || null, data.image_url || null, data.display_order || 0]
  );
  return result.insertId;
}

async function updateSpeaking(id, data) {
  await query(
    'UPDATE speaking SET event=?, organizer=?, role=?, description=?, image_url=?, display_order=?, updated_at=CURRENT_TIMESTAMP WHERE id=?',
    [data.event, data.organizer || null, data.role || null, data.description || null, data.image_url || null, data.display_order || 0, id]
  );
  return true;
}

async function deleteSpeaking(id) {
  await query('DELETE FROM speaking WHERE id = ?', [id]);
  return true;
}

// ─── Awards CRUD ──────────────────────────────────────────────────────────────

async function getAwards() {
  return await query('SELECT * FROM awards ORDER BY display_order ASC, year DESC');
}

async function getAwardById(id) {
  const rows = await query('SELECT * FROM awards WHERE id = ?', [id]);
  return rows[0] || null;
}

async function createAward(data) {
  const result = await query(
    'INSERT INTO awards (title, issuer, year, description, display_order) VALUES (?, ?, ?, ?, ?)',
    [data.title, data.issuer || null, data.year || null, data.description || null, data.display_order || 0]
  );
  return result.insertId;
}

async function updateAward(id, data) {
  await query(
    'UPDATE awards SET title=?, issuer=?, year=?, description=?, display_order=?, updated_at=CURRENT_TIMESTAMP WHERE id=?',
    [data.title, data.issuer || null, data.year || null, data.description || null, data.display_order || 0, id]
  );
  return true;
}

async function deleteAward(id) {
  await query('DELETE FROM awards WHERE id = ?', [id]);
  return true;
}

// Named exports
export {
  query,
  initializeDatabase,
  seedAdminUser,
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectSkills,
  updateProjectSkills,
  getProjectsWithSkills,
  getExperiences,
  getExperienceById,
  getExperiencesWithSkills,
  getExperienceSkills, 
  updateExperienceSkills,
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  getCounters,
  updateProjectCounter,
  updateExperienceCounter,
  getAbout,
  updateAbout,
  getAdminStats,
  getOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getSpeaking,
  getSpeakingById,
  createSpeaking,
  updateSpeaking,
  deleteSpeaking,
  getAwards,
  getAwardById,
  createAward,
  updateAward,
  deleteAward,
};

// Default export
const db = {
  query,
  initializeDatabase,
  seedAdminUser,
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectSkills,
  updateProjectSkills,
  getProjectsWithSkills,
  getExperiences,
  getExperienceById,
  getExperiencesWithSkills,
  getExperienceSkills,
  updateExperienceSkills,
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  getCounters,
  updateProjectCounter,
  updateExperienceCounter,
  getAbout,
  updateAbout,
  getAdminStats,
  getOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getSpeaking,
  getSpeakingById,
  createSpeaking,
  updateSpeaking,
  deleteSpeaking,
  getAwards,
  getAwardById,
  createAward,
  updateAward,
  deleteAward,
};

export default db;