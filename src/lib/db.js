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
    `);

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

    console.log('Database initialized successfully');
    await migrateExperienceTechnologies();
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

// Create an admin user and seed initial data
async function seedAdminUser() {
  try {
    const [users] = await query('SELECT COUNT(*) as count FROM users');
    if (users[0].count === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('cipanas12345', salt);

      await query(
        'INSERT INTO users (email, username, password) VALUES (?, ?, ?)',
        ['mmarsa2435@gmail.com', 'mmarsa2435', hashedPassword]
      );
      console.log('✅ Default admin user created');
    }

    await seedAboutContent();
    await seedSkills();
  } catch (error) {
    console.error('❌ Failed to seed initial data:', error);
    throw error;
  }
}

async function seedAboutContent() {
  try {
    const [about] = await query('SELECT COUNT(*) as count FROM about');
    if (about[0].count === 0) {
      await query(
        'INSERT INTO about (content) VALUES (?)',
        ["Welcome! I'm Marsa, a junior web developer..."]
      );
      console.log('✅ Initial about content created');
    }
  } catch (error) {
    console.error('Error seeding about content:', error);
  }
}

async function seedSkills() {
  try {
    const [skills] = await query('SELECT COUNT(*) as count FROM skills');
    if (skills[0].count === 0) {
      const defaultSkills = [
        { label: 'JavaScript', imgSrc: '/images/skills/javascript.svg' },
        { label: 'React', imgSrc: '/images/skills/react.svg' },
        { label: 'Node.js', imgSrc: '/images/skills/nodejs.svg' },
        { label: 'MySQL', imgSrc: '/images/skills/mysql.svg' },
        { label: 'HTML', imgSrc: '/images/skills/html.svg' },
        { label: 'CSS', imgSrc: '/images/skills/css.svg' }
      ];

      for (const skill of defaultSkills) {
        await query(
          'INSERT INTO skills (label, imgSrc) VALUES (?, ?)',
          [skill.label, skill.imgSrc]
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
  return await query('SELECT * FROM projects ORDER BY created_at DESC');
}

async function getProjectById(id) {
  const projects = await query('SELECT * FROM projects WHERE id = ?', [id]);
  return projects[0];
}

async function createProject(projectData) {
  const result = await query(
    'INSERT INTO projects (title, description, image) VALUES (?, ?, ?)',
    [projectData.title, projectData.description, projectData.image]
  );
  
  if (projectData.skills?.length > 0) {
    await updateProjectSkills(result.insertId, projectData.skills);
  }
  return result.insertId;
}

async function updateProject(id, projectData) {
  await query(
    'UPDATE projects SET title = ?, description = ?, image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [projectData.title, projectData.description, projectData.image, id]
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
  const projects = await query('SELECT * FROM projects ORDER BY created_at DESC');
  return await Promise.all(
    projects.map(async project => ({
      ...project,
      skills: await getProjectSkills(project.id)
    }))
  );
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
  const experiences = await getExperiences();
  return await Promise.all(
    experiences.map(async exp => ({
      ...exp,
      skills: await getExperienceSkills(exp.id)
    }))
  );
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
  return await query('SELECT * FROM skills ORDER BY label ASC');
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

async function migrateExperienceTechnologies() {
  try {
    const [columns] = await query(`SHOW COLUMNS FROM experience LIKE 'technologies'`);
    if (columns) {
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
            if (!skill) {
              const result = await query(
                'INSERT INTO skills (label, imgSrc) VALUES (?, ?)',
                [tech, '/images/skills/default.svg']
              );
              skill = { id: result.insertId };
              console.log(`Created new skill: ${tech} with ID ${skill.id}`);
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
    console.error('Migration error:', error);
  }
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
  getAdminStats
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
  getAdminStats
};

export default db;