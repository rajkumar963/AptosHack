import React from 'react';
import clsx from 'clsx';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className, 
  hover = true,
  ...props
}) => {
  return (
    <div
      {...props}
      className={clsx(
        "backdrop-blur-lg bg-white/5 rounded-3xl p-6 shadow-xl shadow-black/30 border border-white/10",
        hover &&
          "hover:bg-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300",
        className
      )}
    >
      {children}
    </div>
  );
};
