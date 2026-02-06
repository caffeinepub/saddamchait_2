import AccessControl "authorization/access-control";
import UserApproval "user-approval/approval";
import MixinAuthorization "authorization/MixinAuthorization";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Set "mo:core/Set";

actor {
  // New stable field for persistent admin state.
  stable var adminState = Set.empty<Principal>();

  // Initialize access control state.
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  // Initialize approval state.
  let approvalState = UserApproval.initState(accessControlState);

  // User profile type
  public type UserProfile = {
    name : Text;
  };

  // User profiles storage
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Chat request types
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

  // Chat requests storage
  var nextChatRequestId : ChatRequestId = 0;
  let chatRequests = Map.empty<ChatRequestId, ChatRequest>();

  // User profile management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Approval system
  public query ({ caller }) func isCallerApproved() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check approval status");
    };
    AccessControl.hasPermission(accessControlState, caller, #admin) or UserApproval.isApproved(approvalState, caller);
  };

  public shared ({ caller }) func requestApproval() : async () {
    if (AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Admins do not need approval");
    };
    UserApproval.requestApproval(approvalState, caller);
  };

  public shared ({ caller }) func setApproval(user : Principal, status : UserApproval.ApprovalStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.setApproval(approvalState, user, status);
  };

  public query ({ caller }) func listApprovals() : async [UserApproval.UserApprovalInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.listApprovals(approvalState);
  };

  type AdminCache = {
    admins : Set.Set<Principal>;
    timestamp : Nat;
  };

  var lastAdminCache : ?AdminCache = null;

  // Admin helpers
  public shared ({ caller }) func refreshAdmins() : async [Principal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let currentTime = getCurrentTime();
    let cacheTimeThreshold : Nat = 1_000_000_000; // 1 second in nanoseconds

    // Check cache and force refresh
    switch (lastAdminCache) {
      case (?{ admins; timestamp }) {
        if (currentTime - timestamp < cacheTimeThreshold) {
          return admins.toArray();
        };
      };
      case (null) {};
    };

    // Force update - fetch all admins
    let currentState = adminState;
    lastAdminCache := ?{
      admins = currentState;
      timestamp = currentTime;
    };

    switch (lastAdminCache) {
      case (?cache) { cache.admins.toArray() };
      case (null) { [] };
    };
  };

  func getCurrentTime() : Nat {
    // Placeholder for time management, can be replaced with a real time source.
    nextChatRequestId;
  };

  func getAdmins() : Set.Set<Principal> {
    adminState;
  };

  func addAdmin(admin : Principal) {
    switch (lastAdminCache) {
      case (?cache) {
        let cacheClone = cache.admins.clone();
        cacheClone.add(admin);
        adminState := cacheClone;
      };
      case (null) {};
    };
  };

  func removeAdmin(admin : Principal) {
    switch (lastAdminCache) {
      case (?cache) {
        let cacheClone = cache.admins.clone();
        cacheClone.remove(admin);
        adminState := cacheClone;
      };
      case (null) {};
    };
  };

  // Helper: Check if user is approved or admin
  func isUserApprovedOrAdmin(user : Principal) : Bool {
    AccessControl.hasPermission(accessControlState, user, #admin) or UserApproval.isApproved(approvalState, user);
  };

  // Chat request management
  public shared ({ caller }) func sendChatRequest(toUid : Principal) : async ChatRequestId {
    // Only approved users or admins can send chat requests
    if (not isUserApprovedOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only approved users can send chat requests");
    };

    // Cannot send request to yourself
    if (caller == toUid) {
      Runtime.trap("Cannot send chat request to yourself");
    };

    // Check if target user exists and is approved or admin
    if (not isUserApprovedOrAdmin(toUid)) {
      Runtime.trap("Target user is not approved");
    };

    let requestId = nextChatRequestId;
    nextChatRequestId += 1;

    let request : ChatRequest = {
      fromUid = caller;
      toUid = toUid;
      status = #pending;
      createdAt = getCurrentTime();
    };

    chatRequests.add(requestId, request);
    requestId;
  };

  public shared ({ caller }) func acceptChatRequest(requestId : ChatRequestId) : async () {
    // Only approved users or admins can accept requests
    if (not isUserApprovedOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only approved users can accept chat requests");
    };

    switch (chatRequests.get(requestId)) {
      case (?request) {
        // Only the recipient can accept the request
        if (request.toUid != caller) {
          Runtime.trap("Unauthorized: Only the recipient can accept this request");
        };

        // Can only accept pending requests
        switch (request.status) {
          case (#pending) {
            let updatedRequest : ChatRequest = {
              fromUid = request.fromUid;
              toUid = request.toUid;
              status = #accepted;
              createdAt = request.createdAt;
            };
            chatRequests.add(requestId, updatedRequest);
          };
          case (#accepted) {
            Runtime.trap("Request already accepted");
          };
          case (#rejected) {
            Runtime.trap("Cannot accept a rejected request");
          };
        };
      };
      case (null) {
        Runtime.trap("Chat request not found");
      };
    };
  };

  public shared ({ caller }) func rejectChatRequest(requestId : ChatRequestId) : async () {
    // Only approved users or admins can reject requests
    if (not isUserApprovedOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only approved users can reject chat requests");
    };

    switch (chatRequests.get(requestId)) {
      case (?request) {
        // Only the recipient can reject the request
        if (request.toUid != caller) {
          Runtime.trap("Unauthorized: Only the recipient can reject this request");
        };

        // Can only reject pending requests
        switch (request.status) {
          case (#pending) {
            let updatedRequest : ChatRequest = {
              fromUid = request.fromUid;
              toUid = request.toUid;
              status = #rejected;
              createdAt = request.createdAt;
            };
            chatRequests.add(requestId, updatedRequest);
          };
          case (#accepted) {
            Runtime.trap("Cannot reject an accepted request");
          };
          case (#rejected) {
            Runtime.trap("Request already rejected");
          };
        };
      };
      case (null) {
        Runtime.trap("Chat request not found");
      };
    };
  };

  public query ({ caller }) func listIncomingChatRequests() : async [(ChatRequestId, ChatRequest)] {
    // Only approved users or admins can list requests
    if (not isUserApprovedOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only approved users can list chat requests");
    };

    let results = Map.empty<ChatRequestId, ChatRequest>();
    for ((id, request) in chatRequests.entries()) {
      if (request.toUid == caller) {
        results.add(id, request);
      };
    };
    results.toArray();
  };

  public query ({ caller }) func listOutgoingChatRequests() : async [(ChatRequestId, ChatRequest)] {
    // Only approved users or admins can list requests
    if (not isUserApprovedOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only approved users can list chat requests");
    };

    let results = Map.empty<ChatRequestId, ChatRequest>();
    for ((id, request) in chatRequests.entries()) {
      if (request.fromUid == caller) {
        results.add(id, request);
      };
    };
    results.toArray();
  };

  public query ({ caller }) func getChatRequest(requestId : ChatRequestId) : async ?ChatRequest {
    // Only approved users or admins can get requests
    if (not isUserApprovedOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only approved users can access chat requests");
    };

    switch (chatRequests.get(requestId)) {
      case (?request) {
        // Only sender or recipient can view the request
        if (request.fromUid == caller or request.toUid == caller) {
          ?request;
        } else {
          Runtime.trap("Unauthorized: Can only view your own chat requests");
        };
      };
      case (null) { null };
    };
  };

  public query ({ caller }) func listAcceptedChats() : async [Principal] {
    // Only approved users or admins can list chats
    if (not isUserApprovedOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only approved users can list chats");
    };

    let chatPartners = Set.empty<Principal>();
    for ((_, request) in chatRequests.entries()) {
      switch (request.status) {
        case (#accepted) {
          if (request.fromUid == caller) {
            chatPartners.add(request.toUid);
          } else if (request.toUid == caller) {
            chatPartners.add(request.fromUid);
          };
        };
        case (_) {};
      };
    };
    chatPartners.toArray();
  };
};
