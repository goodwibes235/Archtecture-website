/**
 * ATELIER — App Root
 * Initializes Lenis + GSAP on mount.
 * One Lenis instance, one RAF loop per theme.md §14.
 */

import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Nav } from './components/Nav';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Works } from './pages/Works';
import { Contact } from './pages/Contact';
import { Studio } from './pages/Studio';
import { NotFound } from './pages/NotFound';
import { initLenis, destroyLenis, ScrollTrigger } from './lib/scroll';

function App() {
  const location = useLocation();

  // Initialize Lenis once
  useEffect(() => {
    initLenis();
    return () => {
      destroyLenis();
    };
  }, []);

  // On route change: scroll to top, refresh ScrollTrigger
  useEffect(() => {
    window.scrollTo(0, 0);
    // Small delay to let DOM settle before refreshing
    const t = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);
    return () => clearTimeout(t);
  }, [location.pathname]);

  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/works" element={<Works />} />
        <Route path="/works/:id" element={<Works />} />
        <Route path="/architecture" element={<Works />} />
        <Route path="/interiors" element={<Works />} />
        <Route path="/studio" element={<Studio />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/journal" element={<NotFound />} />
        <Route path="/process" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
