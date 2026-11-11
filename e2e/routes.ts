/** Every route worth checking at launch (relative to the site root). */
export const ROUTES = [
  { name: 'menu', path: './' },
  { name: 'about', path: 'about' },
  { name: 'projects', path: 'projects' },
  { name: 'project', path: 'projects/startingfive' },
  { name: 'experience', path: 'experience' },
  { name: 'role', path: 'experience/amobys-software-engineer-intern' },
  { name: 'skills', path: 'skills' },
  { name: 'education', path: 'education' },
  { name: 'certifications', path: 'certifications' },
  { name: 'contact', path: 'contact' },
  { name: 'not-found', path: 'no-such-page' },
] as const;
