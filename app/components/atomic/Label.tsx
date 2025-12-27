import React from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  htmlFor: string;
  children: React.ReactNode;
}

export default function Label({ htmlFor, children, className = '', ...props }: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
}
