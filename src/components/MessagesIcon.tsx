import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Simple component that doesn't depend on messaging hook to prevent crashes
export const MessagesIcon: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleClick = () => {
    navigate('/messages');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      className="relative"
      title="Messages"
    >
      <MessageCircle className="h-5 w-5" />
      {/* Remove unread badge for now to prevent crashes */}
    </Button>
  );
};