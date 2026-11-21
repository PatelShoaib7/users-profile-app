import { FaGithub, FaLinkedin } from 'react-icons/fa';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-white px-4 sm:px-6 py-4 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
        <p>
          © {new Date().getFullYear()} PeoplePulse • User Profile Management &amp; Insights Platform • Built by Shoaib Patel
        </p>
        <div className="flex items-center gap-4 text-slate-400">
          <a
            href="https://github.com/PatelShoaib7"
            target="_blank"
            rel="noreferrer"
            className="hover:text-slate-700 transition-colors"
            aria-label="GitHub"
          >
            <FaGithub className="h-4 w-4" />
          </a>
          <a
            href="#top"
            className="hover:text-slate-700 transition-colors"
            aria-label="LinkedIn"
          >
            <FaLinkedin className="h-4 w-4" />
          </a>
        </div>
      </div>
    </footer>
  );
};
