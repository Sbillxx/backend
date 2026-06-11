import React, { useState, useRef, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface User {
  id: number;
  name: string;
  email: string;
}

interface MultiSelectProps {
  users: User[];
  selectedUsers: number[];
  onSelectionChange: (selectedIds: number[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  users,
  selectedUsers,
  onSelectionChange,
  placeholder = "Select users...",
  className
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedUserObjects = users.filter(user => selectedUsers.includes(user.id));

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (userId: number) => {
    const newSelection = selectedUsers.includes(userId)
      ? selectedUsers.filter(id => id !== userId)
      : [...selectedUsers, userId];

    onSelectionChange(newSelection);
  };

  const handleRemove = (userId: number) => {
    onSelectionChange(selectedUsers.filter(id => id !== userId));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="w-full justify-between min-h-[40px] h-auto text-left"
      >
        <div className="flex flex-wrap gap-1 max-w-full overflow-hidden">
          {selectedUserObjects.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : (
            selectedUserObjects.map((user) => (
              <Badge
                key={user.id}
                variant="secondary"
                className="text-xs max-w-[200px] truncate"
              >
                {user.name}
                <X
                  className="ml-1 h-3 w-3 hover:bg-muted rounded-full p-0.5 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(user.id);
                  }}
                />
              </Badge>
            ))
          )}
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border rounded-md shadow-md">
          <div className="p-2 border-b">
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8"
            />
          </div>

          <div className="max-h-64 overflow-auto">
            {filteredUsers.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No users found.
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center space-x-2 px-2 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                  onClick={() => handleSelect(user.id)}
                >
                  <div className="flex items-center justify-center w-4 h-4">
                    {selectedUsers.includes(user.id) && (
                      <Check className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-medium truncate">{user.name}</span>
                    <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
