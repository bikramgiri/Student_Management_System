import React from 'react';

function Footer() {
  return (
    <footer className="bg-gray-800 dark:bg-gray-900 text-white py-2 text-center">
      <p>&copy; {new Date().getFullYear()} Student Management System</p>
    </footer>
  );
}

export default Footer;
