import Set "mo:core/Set";
import Principal "mo:core/Principal";
import Map "mo:core/Map";

module {
  public type ChatRequestStatus = {
    #pending;
    #accepted;
    #rejected;
  };

  public type ChatRequest = {
    fromUid : Principal;
    toUid : Principal;
    status : ChatRequestStatus;
    createdAt : Nat;
  };

  public type ChatRequestId = Nat;

  // Old and new actor definitions are empty since we're adding fields, not changing them.
  type OldActor = {};
  type NewActor = {
    adminState : Set.Set<Principal>;
    nextChatRequestId : ChatRequestId;
    chatRequests : Map.Map<ChatRequestId, ChatRequest>;
  };

  public func run(_ : OldActor) : NewActor {
    {
      adminState = Set.empty<Principal>();
      nextChatRequestId = 0;
      chatRequests = Map.empty<ChatRequestId, ChatRequest>();
    };
  };
};
