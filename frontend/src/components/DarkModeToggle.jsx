import { useDarkMode } from '../contexts/DarkModeContext';

export default function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Button clicked! Current dark mode:', isDarkMode);
    toggleDarkMode();
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      className="relative p-2 text-slate-600 dark:text-yellow-400 hover:text-slate-900 dark:hover:text-yellow-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all duration-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
      title={isDarkMode ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
      aria-label={isDarkMode ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
    >
      {isDarkMode ? (
        <i className="fas fa-sun text-xl text-yellow-400"></i>
      ) : (
        <i className="fas fa-moon text-xl"></i>
      )}
    </button>
  );
}
