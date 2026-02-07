import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useFirebaseAuthUser } from '@/hooks/useFirebaseAuthUser';
import { getApprovedUsers, getChatRequests, sendChatRequest, respondToChatRequest } from '@/lib/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Check, X, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ApprovedUsersListViewProps {
  onNavigate: (route: any) => void;
}

export default function ApprovedUsersListView({ onNavigate }: ApprovedUsersListViewProps) {
  const { authUser } = useFirebaseAuthUser();
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['approvedUsers', authUser?.uid],
    queryFn: () => getApprovedUsers(authUser?.uid || ''),
    enabled: !!authUser,
  });

  const { data: chatRequests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ['chatRequests', authUser?.uid],
    queryFn: () => getChatRequests(authUser?.uid || ''),
    enabled: !!authUser,
    refetchInterval: 5000,
  });

  const sendRequestMutation = useMutation({
    mutationFn: ({ toUserId }: { toUserId: string }) =>
      sendChatRequest(authUser?.uid || '', toUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatRequests', authUser?.uid] });
      queryClient.refetchQueries({ queryKey: ['chatRequests', authUser?.uid] });
      toast.success('Chat request sent');
      setSelectedUserId(null);
    },
    onError: (error: any) => {
      console.error('Error sending request:', error);
      toast.error(error.message || 'Failed to send chat request');
    },
  });

  const respondMutation = useMutation({
    mutationFn: ({ requestId, accept }: { requestId: string; accept: boolean }) =>
      respondToChatRequest(requestId, accept),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chatRequests', authUser?.uid] });
      queryClient.refetchQueries({ queryKey: ['chatRequests', authUser?.uid] });
      if (variables.accept) {
        toast.success('Chat request accepted');
        // Navigate to chat after accepting
        setTimeout(() => onNavigate('/chat'), 500);
      } else {
        toast.success('Chat request rejected');
      }
    },
    onError: (error) => {
      console.error('Error responding to request:', error);
      toast.error('Failed to respond to request');
    },
  });

  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  };

  // Filter incoming requests: only show pending requests where current user is the receiver
  const incomingRequests = chatRequests.filter(
    (req) => req.toUserId === authUser?.uid && req.status === 'pending'
  );
  
  const sentRequests = chatRequests.filter((req) => req.fromUserId === authUser?.uid);

  const getRequestStatus = (userId: string) => {
    const sent = sentRequests.find((req) => req.toUserId === userId);
    if (sent) {
      return sent;
    }
    return null;
  };

  const canResendAfterReject = (rejectedAt: any): boolean => {
    if (!rejectedAt) return true;
    const rejectedTime = rejectedAt.toMillis ? rejectedAt.toMillis() : rejectedAt;
    const now = Date.now();
    const hoursSinceRejection = (now - rejectedTime) / (1000 * 60 * 60);
    return hoursSinceRejection >= 24;
  };

  if (usersLoading || requestsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {incomingRequests.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Incoming Chat Requests</CardTitle>
            <CardDescription>Accept or reject chat requests from other users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {incomingRequests.map((request) => {
                const sender = users.find((u) => u.uid === request.fromUserId);
                if (!sender) return null;

                // Only show Accept/Reject if: toUserId === currentUserId AND status === pending AND fromUserId !== currentUserId
                const canRespond = 
                  request.toUserId === authUser?.uid && 
                  request.status === 'pending' && 
                  request.fromUserId !== authUser?.uid;

                return (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={sender.photoURL} alt={sender.fullName} />
                        <AvatarFallback>{getInitials(sender.fullName)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{sender.fullName}</p>
                        <p className="text-xs text-muted-foreground">wants to chat with you</p>
                      </div>
                    </div>
                    {canRespond && (
                      <div className="flex gap-2 shrink-0 ml-3">
                        <Button
                          size="sm"
                          onClick={() =>
                            respondMutation.mutate({ requestId: request.id, accept: true })
                          }
                          disabled={respondMutation.isPending}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            respondMutation.mutate({ requestId: request.id, accept: false })
                          }
                          disabled={respondMutation.isPending}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Connect with other users to start chatting</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No approved users found</p>
            ) : (
              users.map((user) => {
                const requestData = getRequestStatus(user.uid);
                const hasAcceptedChat = chatRequests.some(
                  (req) =>
                    req.status === 'accepted' &&
                    ((req.fromUserId === authUser?.uid && req.toUserId === user.uid) ||
                      (req.toUserId === authUser?.uid && req.fromUserId === user.uid))
                );
                const isSelected = selectedUserId === user.uid;

                return (
                  <div
                    key={user.uid}
                    className="border rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => setSelectedUserId(isSelected ? null : user.uid)}
                      className="w-full flex items-center justify-between p-3 hover:bg-accent/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarImage src={user.photoURL} alt={user.fullName} />
                          <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">{user.fullName}</p>
                            {user.role !== 'user' && (
                              <Badge variant="outline" className="text-xs shrink-0">
                                {user.role.replace('_', ' ')}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                    </button>
                    
                    {/* Show Send Request button only if no request exists and no accepted chat */}
                    {isSelected && !hasAcceptedChat && !requestData && (
                      <div className="px-3 pb-3 pt-0">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => sendRequestMutation.mutate({ toUserId: user.uid })}
                          disabled={sendRequestMutation.isPending}
                          className="w-full"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Send Chat Request
                        </Button>
                      </div>
                    )}
                    
                    {/* Show Open Chat button for accepted chats */}
                    {hasAcceptedChat && (
                      <div className="px-3 pb-3 pt-0">
                        <Button
                          size="sm"
                          onClick={() => {
                            const chatId = [authUser?.uid, user.uid].sort().join('_');
                            onNavigate(`/chat/${chatId}`);
                          }}
                          className="w-full"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Open Chat
                        </Button>
                      </div>
                    )}
                    
                    {/* Sender only sees "Request Sent" for pending requests */}
                    {requestData && requestData.status === 'pending' && (
                      <div className="px-3 pb-3 pt-0">
                        <Badge variant="secondary" className="w-full justify-center py-2">
                          Request Sent
                        </Badge>
                      </div>
                    )}
                    
                    {/* Show Rejected status with resend option after 24h */}
                    {requestData && requestData.status === 'rejected' && (
                      <div className="px-3 pb-3 pt-0 space-y-2">
                        <Badge variant="outline" className="w-full justify-center py-2 text-destructive border-destructive">
                          Request Rejected
                        </Badge>
                        {canResendAfterReject(requestData.rejectedAt) ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => sendRequestMutation.mutate({ toUserId: user.uid })}
                            disabled={sendRequestMutation.isPending}
                            className="w-full"
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Send New Request
                          </Button>
                        ) : (
                          <p className="text-xs text-center text-muted-foreground">
                            You can send a new request after 24 hours
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
