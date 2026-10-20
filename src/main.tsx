import { createRoot } from 'react-dom/client';
import App from './App';
import { RM, trackMisregistration } from './lib/motion';
import { exposeForTesting, scrollY, startSmoothScroll } from './lib/scroll';
import './styles/tokens.css';
import './styles/base.css';
import './styles/chrome.css';
import './styles/theatre.css';
import './styles/pages.css';

document.documentElement.classList.toggle('rm', RM);
history.scrollRestoration = 'manual';
startSmoothScroll();
trackMisregistration(scrollY);
exposeForTesting();

// No StrictMode: its double-mounted effects would replay the one-shot GSAP choreography (intro, page entrances).
createRoot(document.getElementById('root')!).render(<App />);
