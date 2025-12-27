import React from 'react';

interface SocialButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
}

export default function SocialButton({ icon, className = '', ...props }: SocialButtonProps) {
  return (
    <button
      type="button"
      className={`flex items-center justify-center py-3 px-4 border border-zinc-300 dark:border-zinc-600 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    >
      {icon}
    </button>
  );
}
