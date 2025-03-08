export interface StoreUser {
    uid: string;
    name: string;
    email: string;
    photoURL?: string;
    mealStatus: boolean;
    mealCount: number;
    role: "user" | "admin";
    pgId?: string;
    requestedId: RequestPgs[]
  }

export interface RequestPgs{
  pgId: string,
  status: "pending" | "accepted" | "rejected" | "",
  date : string
}  