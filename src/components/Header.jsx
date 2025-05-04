/**
 * @copyright 2025 Muhamad Marsa Nur Jaman - Lyramor
 * @license Apache-2.0
 */
'use client'

import Image from 'next/image';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faXmark } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

// component
import Navbar from './Navbar';

export default function Header() {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full h-20 flex items-center z-40 bg-gradient-to-b from-zinc-900 to-zinc-900/0">
      <div className="max-w-screen-2xl w-full mx-auto px-4 flex justify-between items-center md:px-6 md:grid md:grid-cols-[1fr,3fr,1fr]">
        <h1>
          <Link href="/" className="logo">
            <Image 
              src="/images/Logo.png"
              width={120}
              height={90}
              alt="Cylia Tech"
              priority
            />
          </Link>
        </h1>

        <div className="relative md:justify-self-center">
          <button 
            className="menu-btn md:hidden flex items-center justify-center"
            onClick={() => setNavOpen((prev) => !prev)}
            aria-label="Toggle menu">
            <span>
              {navOpen ? <FontAwesomeIcon icon={faXmark} size="lg" /> : <FontAwesomeIcon icon={faBars} size="lg" />}
            </span>
          </button>
          <Navbar navOpen={navOpen}/>
        </div>
        <a href="#contact" className="btn btn-secondary max-md:hidden md:justify-self-end">
          Contact Me
        </a>
      </div>
    </header>
  )
}
