import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Send, MessageCircle, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useMessaging } from '@/hooks/useMessaging';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface MessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string | null;
  postId?: string;
  postType?: 'listing' | 'event';
  postTitle?: string;
}

export const MessageDialog: React.FC<MessageDialogProps> = ({
  open,
  onOpenChange,
  recipientId,
  recipientName,
  recipientAvatar,
  postId,
  postType,
  postTitle,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { sendMessage, sending } = useMessaging();
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState(postTitle ? `Re: ${postTitle}` : '');

  const handleSend = async () => {
    if (!message.trim() || !user) return;

    try {
      // Send the message using the messaging service
      const result = await sendMessage({
        recipient_id: recipientId,
        subject: subject.trim() || 'Message',
        content: message.trim(),
        post_id: postId,
        post_type: postType,
        post_title: postTitle,
      });

      if (result.success) {
        // Reset form and close dialog
        setMessage('');
        setSubject(postTitle ? `Re: ${postTitle}` : '');
        onOpenChange(false);
        
        // Show success message with option to view messages
        toast({
          title: 'Message sent!',
          description: `Your message has been sent to ${recipientName}.`,
          action: (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/messages')}
              className="flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              View Messages
            </Button>
          ),
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleMentionUser = () => {
    const mention = `@${recipientName} `;
    setMessage(prev => prev + mention);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Send Message
          </DialogTitle>
          <DialogDescription>
            Send a message to {recipientName}
            {postTitle && ` about "${postTitle}"`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Recipient Info */}
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <Avatar className="h-10 w-10">
              <AvatarImage src={recipientAvatar || undefined} />
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{recipientName}</p>
              <p className="text-sm text-muted-foreground">Recipient</p>
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter subject..."
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="message">Message</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleMentionUser}
                className="text-xs"
              >
                @mention
              </Button>
            </div>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              rows={4}
              className="resize-none"
              onKeyDown={handleKeyDown}
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                {message.length}/1000 characters
              </p>
              <p className="text-xs text-muted-foreground">
                Ctrl+Enter to send
              </p>
            </div>
          </div>

          {/* Post Context */}
          {postTitle && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Regarding: {postTitle}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                {postType === 'listing' ? 'Marketplace Listing' : 'Community Event'}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={sending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={!message.trim() || sending || message.length > 1000}
            className="flex items-center gap-2"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
            {sending ? 'Sending...' : 'Send Message'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};