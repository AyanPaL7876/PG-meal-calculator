export interface StoreUser {
    uid: string;
    name: string;
    email: string;
    photoURL?: string;
    mealStatus: boolean;
    mealCount?: number;
    role: "user" | "admin";
    pgId?: string;
    requestedId?: RequestPgs[]
    spent?: number;
    expense?: number;
    extra?: number;
    balance?: number;
    joinedAt?: Date;
  }

export interface RequestPgs{
  pgId: string,
  status: "pending" | "accepted" | "rejected" | "",
  date : string
}  