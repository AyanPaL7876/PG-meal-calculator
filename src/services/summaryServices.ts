import { db } from "@/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { userSummarie, Expense, spent, Month, mealData } from "@/types/pg";


export const createOrUpdateSummary = async (pgId: string) => {
  try {
    if (!pgId) {
      console.error("❌ Invalid PG ID provided!");
      return false;
    }

    const pgRef = doc(db, "pgs", pgId);
    const pgSnap = await getDoc(pgRef);

    if (!pgSnap.exists()) {
      console.error("❌ PG document not found!");
      return false;
    }

    const pgData = pgSnap.data();
    const currMonth = {
      mealSheet: [],
      expenseSheet: [],
      userSpent: [],
      ...pgData.currMonth, // Ensure currMonth is properly structured
    };

    const users = pgData.users ?? [];
    const baseMeal = pgData.baseMeal ?? 0;
    let highestMeal = 0;
    let totalMeal = 0;
    let extraMeal = 0;
    const userSummaries: userSummarie[] = [];

    // 🔥 Fetch all users at once to reduce Firestore calls
    const userSnapshots = await Promise.all(
      users.map((userId : string) => getDoc(doc(db, "users", userId)))
    );

    const userDataMap = new Map();
    userSnapshots.forEach((snap, index) => {
      if (snap.exists()) {
        userDataMap.set(users[index], snap.data());
      } else {
        console.error(`❌ User ${users[index]} not found!`);
      }
    });

    // ✅ Calculate Highest Meal & Total Meal
    for (const user of users) {
      const userData = userDataMap.get(user);
      if (!userData) continue;

      const userMeals = userData.mealCount || 0;
      // console.log(`📊 User ${user} Meals: ${userMeals}`);

      totalMeal += userMeals;
      highestMeal = Math.max(highestMeal, userMeals);
    }


    const totalExpenses = currMonth.expenseSheet.reduce(
      (sum: number, exp: Expense) => sum + (Number(exp?.totalMoney) || 0),
      0
    );

    // ✅ Calculate Extra Meal
    for (const user of users) {
      const userData = userDataMap.get(user);
      if (!userData) continue;

      const userMeals = userData.mealCount || 0;

      if (userMeals > 0 && userMeals < baseMeal) {
        extraMeal += baseMeal - userMeals;
      }
    }

    const mealCharge =
      totalMeal + extraMeal > 0 ? totalExpenses / (totalMeal + extraMeal) : 0;

    // ✅ Generate User Summaries
    for (const user of users) {
      const userData = userDataMap.get(user);
      if (!userData) continue;

      const userMeals = userData.mealCount || 0;

      // 🔥 Correct way to get extraMeal for this user
      const extraMealEntry = currMonth.mealSheet.find(
        (meal : mealData) => meal.userId === user
      );
      const extraMeal = extraMealEntry ? extraMealEntry.extra : 0;

      const userSpents = currMonth.spentSheet.filter(
        (exp: spent) => exp.userId === user
      );

      const totalAmount = userSpents.reduce(
        (sum: number, exp: spent) => sum + (Number(exp?.totalMoney) || 0),
        0
      );

      let userMeal = userMeals >= baseMeal ? userMeals : baseMeal;
      userMeal = userMeals === 0 ? 0 : userMeal + extraMeal;
      // console.log(`🍽️ User ${user} Final Meals: ${userMeal}`);

      const khoroch = Number((userMeal * mealCharge).toFixed(2));
      const balanceWithoutMasi = Number((totalAmount - khoroch).toFixed(2));
      const balanceWithAnti = Number(
        userMeal > 0 ? balanceWithoutMasi - (pgData.masiCharge || 0) : balanceWithoutMasi
      );

      userData.expense = khoroch;
      userData.balance = balanceWithAnti;
      
      await updateDoc(doc(db, "users", user), userData);
      userSummaries.push({
        name: userData.name,
        userTotalMeal: userMeal,
        userTotalSpent: totalAmount,
        userTotalExpense: khoroch,
        balance: balanceWithoutMasi,
        balanceWithAnti
      });
    }

    // ✅ Update PG Document with Calculated Data
    const updateObject = {
      currMonth: {
        ...currMonth,
        totalMeal,
        baseMeal : Number((highestMeal*pgData.baseMeal).toFixed(0)),
        totalExpenses,
        extraMeal,
        mealCharge: Number(mealCharge.toFixed(2)),
        userSummaries,
        masiCharge: pgData.masiCharge || 0,
      },
    };

    await updateDoc(pgRef, updateObject);
    console.log("✅ Summary updated successfully!");
    return true;
  } catch (error) {
    console.error("❌ Error creating or updating summary:", error);
    return false;
  }
};

export const getUserSummarie = async (pgId: string, currMonth:boolean) => {
  try {
    const pgRef = doc(db, "pgs", pgId);
    const pgSnap = await getDoc(pgRef);

    if (!pgSnap.exists()) {
      console.error("❌ PG not found!");
      return false;
    }

    const pgData = pgSnap.data();
    const data:Month = currMonth ? pgData.currMonth : pgData.prevMonth;

    return data;
  } catch (error) {
    console.error("❌ Error fetching user summary:", error);
    return false;
  }
};
