/**
 * @copyright 2025 Muhamad Marsa Nur Jaman - Lyramor
 * @license Apache-2.0
 */
'use client'



const aboutItems = [
  {
    label: 'Project done',
    number: 15
  },
  {
    label: 'Years of experience',
    number: 3
  }
];

export default function About() {
  return (
    <section 
      id="about"
      className="section"
    >
      <div className="container">
        <div className="flex justify-center"> 
          <div className="bg-zinc-800/50 p-7 rounded-2xl md:p-12 max-w-3xl"> 
            <p className="text-zinc-300 mb-4 md:mb-8 md:text-xl md:max-w-[60ch]">
            Welcome! I&apos;m Marsa, a junior web developer with a strong passion for building dynamic and user-friendly web applications. Currently pursuing my bachelor&apos;s degree in Computer Engineering at Pasundan University, I focus on turning ideas into interactive digital experiences by blending creativity with solid technical skills.
            </p>

            <div className="flex flex-wrap items-center gap-4 md:gap-7">
              {
                aboutItems.map(({label, number}, key)=> ( 
                  <div key={key}>
                    <div className="flex items-center md:mb-2">
                      <span className="text-2xl font-semibold md:text-4xl">{number}</span>
                      <span className="text-sky-400 font-semibold md:text-3xl">+</span>
                    </div>

                    <p className="text-sm text-zinc-400">{label}</p>
                  </div>
                ))
              }
              <img
                src="/images/icon.png"
                width={30}
                height={30}
                alt="Cylia Tech"
                className="ml-auto md:w-[40px] md:h-[40px]"
              />
            </div>
          </div>        
        </div>
      </div>
    </section>
  )
}