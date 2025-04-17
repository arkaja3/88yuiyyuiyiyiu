'use client'

import { User } from 'lucide-react'

interface AdminHeaderProps {
  title: string;
  description?: string;
  username?: string;
}

export default function AdminHeader({ title, description, username = 'Администратор' }: AdminHeaderProps) {
  return (
    <div className="flex justify-between items-start mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex items-center mr-2">
          <User className="h-4 w-4 mr-1.5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{username}</span>
        </div>
      </div>
    </div>
  );
}
