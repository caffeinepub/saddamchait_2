import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserApprovalInfo {
    status: ApprovalStatus;
    principal: Principal;
}
export interface ChatRequest {
    status: ChatRequestStatus;
    toUid: Principal;
    createdAt: bigint;
    fromUid: Principal;
}
export type ChatRequestId = bigint;
export interface UserProfile {
    name: string;
}
export enum ApprovalStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum ChatRequestStatus {
    pending = "pending",
    rejected = "rejected",
    accepted = "accepted"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    acceptChatRequest(requestId: ChatRequestId): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getChatRequest(requestId: ChatRequestId): Promise<ChatRequest | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isCallerApproved(): Promise<boolean>;
    listAcceptedChats(): Promise<Array<Principal>>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    listIncomingChatRequests(): Promise<Array<[ChatRequestId, ChatRequest]>>;
    listOutgoingChatRequests(): Promise<Array<[ChatRequestId, ChatRequest]>>;
    refreshAdmins(): Promise<Array<Principal>>;
    rejectChatRequest(requestId: ChatRequestId): Promise<void>;
    requestApproval(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendChatRequest(toUid: Principal): Promise<ChatRequestId>;
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
}
