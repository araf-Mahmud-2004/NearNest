import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Search,
  Send,
  MessageCircle,
  User,
  ArrowLeft,
  MoreVertical,
  Trash2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { useMessaging } from '@/hooks/useMessaging';
import { messagingService, Conversation, Message } from '@/services/messagingService';
import { formatRelativeTime } from '@/lib/timeUtils';
import { useNavigate } from 'react-router-dom';

const Messages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    conversations,
    messages,
    unreadCount,
    loading,
    sending,
    error,
    sendMessage,
    loadMessages,
    markAsRead,
    deleteMessage,
    searchMessages,
  } = useMessaging();

  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedConversation]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
      markAsRead(selectedConversation.id);
    }
  }, [selectedConversation, loadMessages, markAsRead]);

  // Handle search with error handling
  useEffect(() => {
    const handleSearch = async () => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        try {
          const results = await searchMessages(searchQuery);
          setSearchResults(results);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    };

    const debounceTimer = setTimeout(handleSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, searchMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    const otherParticipant = messagingService.getOtherParticipant(selectedConversation, user.id);
    
    const result = await sendMessage({
      recipient_id: otherParticipant.id,
      subject: 'Message',
      content: newMessage.trim(),
    });

    if (result.success) {
      setNewMessage('');
      // Messages will be reloaded automatically via the hook
    }
  };

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (selectedConversation) {
      await deleteMessage(messageId, selectedConversation.id);
    }
  };

  const getOtherParticipantName = (conversation: Conversation) => {
    if (!user) return 'Unknown';
    const otherParticipant = messagingService.getOtherParticipant(conversation, user.id);
    return messagingService.getDisplayName(otherParticipant.profile);
  };

  const getOtherParticipantAvatar = (conversation: Conversation) => {
    if (!user) return null;
    const otherParticipant = messagingService.getOtherParticipant(conversation, user.id);
    return otherParticipant.profile?.avatar_url;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Please log in to view messages.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Messages</h1>
          <p className="text-muted-foreground">
            Stay connected with your community
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}. The messaging tables might not be set up yet. Please run the database setup script.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Conversations
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-auto">
                    {unreadCount}
                  </Badge>
                )}
              </CardTitle>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-350px)]">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
                  </div>
                ) : error ? (
                  <div className="p-4 text-center">
                    <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">Unable to load conversations</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Database tables may not be set up
                    </p>
                  </div>
                ) : searchQuery ? (
                  // Search Results
                  <div className="p-4">
                    <h4 className="text-sm font-medium mb-3">Search Results</h4>
                    {isSearching ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : searchResults.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No messages found</p>
                    ) : (
                      <div className="space-y-2">
                        {searchResults.map((message) => (
                          <div
                            key={message.id}
                            className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                            onClick={() => {
                              // Find and select the conversation
                              const conv = conversations.find(c => 
                                c.participant_1_id === message.sender_id || 
                                c.participant_2_id === message.sender_id ||
                                c.participant_1_id === message.recipient_id || 
                                c.participant_2_id === message.recipient_id
                              );
                              if (conv) {
                                handleConversationSelect(conv);
                              }
                            }}
                          >
                            <p className="text-sm font-medium truncate">{message.subject}</p>
                            <p className="text-xs text-muted-foreground truncate">{message.content}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatRelativeTime(message.created_at)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-4 text-center">
                    <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">No conversations yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Start messaging by contacting someone from a listing or event
                    </p>
                  </div>
                ) : (
                  // Conversations List
                  <div className="space-y-1">
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                          selectedConversation?.id === conversation.id ? 'bg-muted' : ''
                        }`}
                        onClick={() => handleConversationSelect(conversation)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={getOtherParticipantAvatar(conversation) || undefined} />
                            <AvatarFallback>
                              <User className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-sm truncate">
                                {getOtherParticipantName(conversation)}
                              </p>
                              {conversation.unread_count && conversation.unread_count > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                  {conversation.unread_count}
                                </Badge>
                              )}
                            </div>
                            
                            {conversation.last_message && (
                              <p className="text-xs text-muted-foreground truncate">
                                {conversation.last_message.content}
                              </p>
                            )}
                            
                            <p className="text-xs text-muted-foreground">
                              {formatRelativeTime(conversation.last_message_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Messages View */}
          <Card className="lg:col-span-2">
            {selectedConversation ? (
              <>
                {/* Header */}
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedConversation(null)}
                        className="lg:hidden"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={getOtherParticipantAvatar(selectedConversation) || undefined} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <h3 className="font-semibold">
                          {getOtherParticipantName(selectedConversation)}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Active conversation
                        </p>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => markAsRead(selectedConversation.id)}>
                          Mark as read
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <Separator />

                {/* Messages */}
                <CardContent className="p-0">
                  <ScrollArea className="h-[calc(100vh-450px)] p-4">
                    <div className="space-y-4">
                      {messages[selectedConversation.id]?.map((message) => {
                        const isOwn = message.sender_id === user.id;
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                              <div
                                className={`p-3 rounded-lg ${
                                  isOwn
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground'
                                }`}
                              >
                                {message.subject !== 'Message' && (
                                  <p className="text-xs font-medium mb-1 opacity-80">
                                    {message.subject}
                                  </p>
                                )}
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                
                                {message.post_title && (
                                  <div className="mt-2 p-2 rounded bg-black/10 text-xs">
                                    <p className="font-medium">Re: {message.post_title}</p>
                                    <p className="opacity-80">
                                      {message.post_type === 'listing' ? 'Marketplace Listing' : 'Community Event'}
                                    </p>
                                  </div>
                                )}
                              </div>
                              
                              <div className={`flex items-center gap-2 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                <p className="text-xs text-muted-foreground">
                                  {formatRelativeTime(message.created_at)}
                                </p>
                                {isOwn && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                        <MoreVertical className="h-3 w-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() => handleDeleteMessage(message.id)}
                                        className="text-destructive"
                                      >
                                        <Trash2 className="h-3 w-3 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                </CardContent>

                <Separator />

                {/* Message Input */}
                <CardContent className="p-4">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="min-h-[60px] resize-none"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sending}
                      className="self-end"
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                  <p className="text-muted-foreground">
                    Choose a conversation from the list to start messaging
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Messages;