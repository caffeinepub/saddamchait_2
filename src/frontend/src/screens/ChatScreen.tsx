import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useFirebaseAuthUser } from '@/hooks/useFirebaseAuthUser';
import { useFirestoreUserProfile } from '@/hooks/useFirestoreUserProfile';
import { getUserChats, getChatMessages, sendMessage, getUserProfile } from '@/lib/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, ArrowLeft, MessageCircle, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface ChatScreenProps {
  onNavigate: (route: any) => void;
}

export default function ChatScreen({ onNavigate }: ChatScreenProps) {
  const { authUser } = useFirebaseAuthUser();
  const { data: userProfile } = useFirestoreUserProfile();
  const queryClient = useQueryClient();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Call all hooks at the top level before any conditional returns
  const { data: chats = [], isLoading: chatsLoading } = useQuery({
    queryKey: ['userChats', authUser?.uid],
    queryFn: () => getUserChats(authUser?.uid || ''),
    enabled: !!authUser,
    refetchInterval: 5000,
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['chatMessages', selectedChatId],
    queryFn: () => getChatMessages(selectedChatId || ''),
    enabled: !!selectedChatId,
    refetchInterval: 2000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: ({ chatId, text }: { chatId: string; text: string }) =>
      sendMessage(chatId, authUser?.uid || '', text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages', selectedChatId] });
      setMessageText('');
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedChatId) return;

    sendMessageMutation.mutate({
      chatId: selectedChatId,
      text: messageText.trim(),
    });
  };

  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  };

  const getOtherUserId = (chat: any) => {
    return chat.members.find((id: string) => id !== authUser?.uid);
  };

  if (chatsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">No Chats Yet</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Start a conversation. Tap + to find users.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Floating Action Button */}
        <Button
          onClick={() => onNavigate('/users')}
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          aria-label="Find users to chat with"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  if (!selectedChatId) {
    return (
      <div className="relative container mx-auto px-4 py-6 max-w-2xl">
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {chats.map((chat) => {
                const otherUserId = getOtherUserId(chat);
                return (
                  <ChatListItem
                    key={chat.id}
                    chatId={chat.id}
                    otherUserId={otherUserId}
                    onSelect={() => setSelectedChatId(chat.id)}
                    getInitials={getInitials}
                  />
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        {/* Floating Action Button */}
        <Button
          onClick={() => onNavigate('/users')}
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          aria-label="Find users to chat with"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  const selectedChat = chats.find((c) => c.id === selectedChatId);
  const otherUserId = selectedChat ? getOtherUserId(selectedChat) : null;

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="border-b bg-background px-4 py-3">
        <div className="container mx-auto max-w-4xl flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedChatId(null)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          {otherUserId && (
            <ChatHeader userId={otherUserId} getInitials={getInitials} />
          )}
        </div>
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="container mx-auto max-w-4xl py-4 space-y-4">
          {messagesLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.senderId === authUser?.uid}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="border-t bg-background px-4 py-3">
        <form onSubmit={handleSendMessage} className="container mx-auto max-w-4xl flex gap-2">
          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            disabled={sendMessageMutation.isPending}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!messageText.trim() || sendMessageMutation.isPending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

function ChatListItem({
  chatId,
  otherUserId,
  onSelect,
  getInitials,
}: {
  chatId: string;
  otherUserId: string;
  onSelect: () => void;
  getInitials: (fullName: string) => string;
}) {
  const { data: otherUser } = useQuery({
    queryKey: ['userProfile', otherUserId],
    queryFn: () => getUserProfile(otherUserId),
  });

  if (!otherUser) {
    return null;
  }

  return (
    <button
      onClick={onSelect}
      className="w-full p-4 flex items-center gap-3 hover:bg-accent transition-colors text-left"
    >
      <Avatar className="h-12 w-12 shrink-0">
        <AvatarImage src={otherUser.photoURL} alt={otherUser.fullName} />
        <AvatarFallback>{getInitials(otherUser.fullName)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{otherUser.fullName}</p>
        <p className="text-sm text-muted-foreground">Tap to open chat</p>
      </div>
    </button>
  );
}

function ChatHeader({
  userId,
  getInitials,
}: {
  userId: string;
  getInitials: (fullName: string) => string;
}) {
  const { data: user } = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => getUserProfile(userId),
  });

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-10 w-10">
        <AvatarImage src={user.photoURL} alt={user.fullName} />
        <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
      </Avatar>
      <div>
        <p className="font-medium">{user.fullName}</p>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  isOwn,
}: {
  message: any;
  isOwn: boolean;
}) {
  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] rounded-lg px-4 py-2 ${
          isOwn
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        }`}
      >
        <p className="text-sm break-words">{message.text}</p>
        <p className={`text-xs mt-1 ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}
