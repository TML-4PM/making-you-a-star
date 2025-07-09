import React from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, Upload, Heart, Home, GraduationCap, FolderOpen, FileText } from 'lucide-react';
import { Button } from "@/components/ui/button";

export const AppNavigation = () => {
  const navItems = [
    { path: '/', label: 'Stories', icon: Home },
    { path: '/groups', label: 'Groups', icon: FolderOpen },
    { path: '/job-descriptions', label: 'Jobs', icon: FileText },
    { path: '/bookmarks', label: 'Bookmarks', icon: Heart },
    { path: '/study', label: 'Study', icon: GraduationCap },
    { path: '/upload', label: 'Upload', icon: Upload },
  ];

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 shadow-soft">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Make me a STAR
            </h1>
          </div>
          
          <nav className="flex items-center gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-primary text-primary-foreground shadow-soft' 
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};