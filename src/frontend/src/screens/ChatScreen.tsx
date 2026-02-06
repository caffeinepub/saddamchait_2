import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Plus } from 'lucide-react';
import { getAcceptedChats, getUserProfile } from '@/lib/firebase';
import { useFirebaseAuthUser } from '@/hooks/useFirebaseAuthUser';

interface ChatScreenProps {
  onNavigate: (route: any) => void;
}

export default function ChatScreen({ onNavigate }: ChatScreenProps) {
  const { authUser } = useFirebaseAuthUser();
  const [chats, setChats] = useState<Array<{ chatId: string; otherUserId: string; otherUserName: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

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
            };
          })
        );

        setChats(chatsWithNames);
      } catch (error) {
        console.error('Error loading chats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadChats();
  }, [authUser]);

  const handleFindUsers = () => {
    onNavigate('/users');
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
                <Card key={chat.chatId} className="hover:bg-accent cursor-pointer transition-colors">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <MessageCircle className="h-6 w-6 text-primary" />
                    </div>
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
