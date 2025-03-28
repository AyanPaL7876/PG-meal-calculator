import { StoreUser } from "./user";

export interface userSummarie {
    name : string,
    userTotalMeal: number,
    userTotalSpent: number,
    userTotalExpense: number,
    balance: number,
    balanceWithAnti: number,
}

export interface UserMealStatus extends StoreUser {
    selectedForMeal: boolean;
  }

export interface Meal{
    date: string, 
    sessions: string[]
}
export interface mealData{
    userId: string,
    userName: string,
    details: Meal[],
    extra: number
}

export interface Expense {
    date: string;
    userId: string;
    userName: string;
    details: string;
    totalMoney: number;
}

export interface detail {
    date: string;
    money: number;
    isPreMonth?: boolean 
}
export interface spent {
    userId: string;
    userName : string,
    totalMoney: number;
    details: detail[]
}

export interface Month {
    month : string,
    mealSheet ?: mealData[],
    spentSheet ?: spent[],
    expenseSheet ?: Expense[],
    totalMeal : number,
    totalSpent: number,
    totalExpense: number,
    userSummaries ?: userSummarie[],
    mealCharge ?: number,
    masiCharge : number,
    baseMeal ?: number,
}

export interface PG {
    id?: string,
    name: string,
    address: string,
    masiCharge: number,
    baseMeal: number,
    users?: string[],
    request?: string[],
    currMonth?: Month,
    prevMonth?: Month,
    
}

export interface Response{
    success: boolean,
    message: string
}