import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Plus, ArrowLeft } from 'lucide-react';
import { getAcceptedChats, getUserProfile } from '@/lib/firebase';
import { useFirebaseAuthUser } from '@/hooks/useFirebaseAuthUser';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ChatRoomView from '@/components/chat/ChatRoomView';

interface ChatScreenProps {
  onNavigate: (route: any) => void;
  chatId?: string;
}

export default function ChatScreen({ onNavigate, chatId }: ChatScreenProps) {
  const { authUser } = useFirebaseAuthUser();
  const [chats, setChats] = useState<Array<{ chatId: string; otherUserId: string; otherUserName: string; otherUserPhoto: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(chatId || null);
  const [selectedOtherUser, setSelectedOtherUser] = useState<{ uid: string; name: string; photo: string } | null>(null);

  useEffect(() => {
    const loadChats = async () => {
      if (!authUser) return;

      try {
        const acceptedChats = await getAcceptedChats(authUser.uid);
        
        // Fetch user profiles for each chat
        const chatsWithNames = await Promise.all(
          acceptedChats.map(async (chat) => {
            const profile = await getUserProfile(chat.otherUserId);
            return {
              ...chat,
              otherUserName: profile?.fullName || 'Unknown User',
              otherUserPhoto: profile?.photoURL || '',
            };
          })
        );

        setChats(chatsWithNames);
        
        // If chatId is provided in props, auto-select that chat
        if (chatId) {
          const selectedChat = chatsWithNames.find(c => c.chatId === chatId);
          if (selectedChat) {
            setSelectedChatId(chatId);
            setSelectedOtherUser({
              uid: selectedChat.otherUserId,
              name: selectedChat.otherUserName,
              photo: selectedChat.otherUserPhoto,
            });
          }
        }
      } catch (error) {
        console.error('Error loading chats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadChats();
  }, [authUser, chatId]);

  const handleFindUsers = () => {
    onNavigate('/users');
  };

  const handleSelectChat = (chat: { chatId: string; otherUserId: string; otherUserName: string; otherUserPhoto: string }) => {
    setSelectedChatId(chat.chatId);
    setSelectedOtherUser({
      uid: chat.otherUserId,
      name: chat.otherUserName,
      photo: chat.otherUserPhoto,
    });
  };

  const handleBackToList = () => {
    setSelectedChatId(null);
    setSelectedOtherUser(null);
  };

  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading chats...</p>
        </div>
      </div>
    );
  }

  // If a chat is selected, show the chat room view
  if (selectedChatId && selectedOtherUser && authUser) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="border-b bg-background sticky top-0 z-10">
          <div className="container mx-auto px-4 py-3 flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackToList}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarImage src={selectedOtherUser.photo} alt={selectedOtherUser.name} />
              <AvatarFallback>{getInitials(selectedOtherUser.name)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold">{selectedOtherUser.name}</h2>
              <p className="text-xs text-muted-foreground">Online</p>
            </div>
          </div>
        </div>
        
        <ChatRoomView
          chatId={selectedChatId}
          currentUserId={authUser.uid}
          otherUserName={selectedOtherUser.name}
        />
      </div>
    );
  }

  // Otherwise, show the chat list
  return (
    <div className="flex-1 flex flex-col">
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Chats</h2>
              <p className="text-muted-foreground">Your conversations</p>
            </div>
          </div>

          {chats.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <MessageCircle className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Chats Yet</h3>
                <p className="text-sm text-muted-foreground text-center mb-6">
                  Start a conversation. Tap + to find users.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {chats.map((chat) => (
                <Card 
                  key={chat.chatId} 
                  className="hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => handleSelectChat(chat)}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={chat.otherUserPhoto} alt={chat.otherUserName} />
                      <AvatarFallback>{getInitials(chat.otherUserName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold">{chat.otherUserName}</h3>
                      <p className="text-sm text-muted-foreground">Tap to open chat</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Button
        onClick={handleFindUsers}
        size="lg"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <footer className="border-t mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          © 2026. Built with ❤️ using{' '}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
