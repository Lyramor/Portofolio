/**
 * @copyright 2025 Muhamad Marsa Nur Jaman - Lyramor
 * @license Apache-2.0
 */
'use client'

import SkillCard from "./SkillCard";

const skillItem = [
  {
    imgSrc: '/images/skill/html5.svg',
    label: 'HTML',
    desc: 'Design Tool'
  },
  {
    imgSrc: '/images/skill/css.svg',
    label: 'CSS',
    desc: 'User Interface'
  },
  {
    imgSrc: '/images/skill/javascript.svg',
    label: 'JavaScript',
    desc: 'Interaction'
  },
  {
    imgSrc: '/images/skill/java.svg',
    label: 'Java',
    desc: 'Backend Language'
  },
  {
    imgSrc: '/images/skill/c-sharp.svg',
    label: 'C#',
    desc: 'Backend Language'
  },
  {
    imgSrc: '/images/skill/tailwind-css.svg',
    label: 'TailwindCSS',
    desc: 'User Interface'
  },
  {
    imgSrc: '/images/skill/laravel.svg',
    label: 'Laravel',
    desc: 'PHP Framework'
  },
  {
    imgSrc: '/images/skill/react-js.svg',
    label: 'ReactJS',
    desc: 'Frontend Framework'
  },
  {
    imgSrc: '/images/skill/node-js.svg',
    label: 'NodeJS',
    desc: 'Web Server'
  },
  {
    imgSrc: '/images/skill/next-js.svg',
    label: 'NextJS',
    desc: 'React Framework'
  },
  {
    imgSrc: '/images/skill/alpine-js.svg',
    label: 'AlpineJS',
    desc: 'JavaScript Framework' 
  },
  {
    imgSrc: '/images/skill/mysql.svg',
    label: 'MySQL',
    desc: 'Database'
  },
  {
    imgSrc: '/images/skill/mongodb.svg',
    label: 'MongoDB',
    desc: 'Database'
  },
  {
    imgSrc: '/images/skill/laragon.svg',
    label: 'Laragon',
    desc: 'Local Server'
  },
  {
    imgSrc: '/images/skill/docker.svg',
    label: 'Docker',
    desc: 'Containerization'
  },
  {
    imgSrc: '/images/skill/github.svg',
    label: 'GitHub',
    desc: 'Code Hosting'
  },
  {
    imgSrc: '/images/skill/git.svg',
    label: 'Git',
    desc: 'Version Control'
  },
  {
    imgSrc: '/images/skill/postman-api.svg',
    label: 'Postman',
    desc: 'API Testing'
  },
  {
    imgSrc: '/images/skill/vs-code.svg',
    label: 'VS Code',
    desc: 'Code Editor'
  },
  {
    imgSrc: '/images/skill/unity.svg',
    label: 'Unity',
    desc: 'Game Engine'
  }
];


export default function Skill() {
  return (
    <section
      id="skill"
      className="section"
    >
      <div className="container max-w-5xl mx-auto">
        <h2 className="headline-2">
          Essential Tools I use
        </h2>

        <p className="text-zinc-400 mt-3 mb-8 max-w-[50ch]">
          Discover the powerful tools and technologies I use to create exceptional, high-performing websites & applications.
        </p>

        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {
            skillItem.map(({ imgSrc, label, desc }, key) =>(
              <SkillCard 
                key={key}
                imgSrc={imgSrc}
                label={label}
                desc={desc}
              />
            ))
          }
        </div>
      </div>
    </section>
  )
}