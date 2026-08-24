import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import MoviesSection from './MoviesSection';
import TheatersSection from './TheatersSection';
import ContactSection from './ContactSection';

const Homepage = () => {
  const [searchParams] = useSearchParams();
  const section = searchParams.get('section');

  useEffect(() => {
    if (!section) return;

    const timer = setTimeout(() => {
      const element = document.getElementById(section);
      if (!element) return;
      let offset = 0;
      let node = element;
      while (node) {
        offset += node.offsetTop;
        node = node.offsetParent;
      }
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      window.scrollTo({ top: Math.max(0, offset - 80), behavior: 'smooth' });
    }, 200);

    return () => clearTimeout(timer);
  }, [section]);

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <HeroSection />
      <MoviesSection />
      <TheatersSection />
      <ContactSection />
    </div>
  );
};

export default Homepage;