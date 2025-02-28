// "use client";
// import { useState } from "react";
// import { signUp } from "../services/authService";

// export default function SignUp() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       await signUp(email, password);
//       alert("Account created successfully!");
//     } catch (error) {
//       alert("Sign-up failed: " + (error as Error).message);
//     }
//   };

//   return (
//     <div className="p-4 bg-gray-100 rounded-md shadow-md">
//       <h2 className="text-xl font-semibold mb-3">Sign Up</h2>
//       <form onSubmit={handleSubmit} className="space-y-3">
//         <input
//           type="email"
//           placeholder="Email"
//           className="p-2 border rounded-md w-full"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           required
//         />
//         <input
//           type="password"
//           placeholder="Password"
//           className="p-2 border rounded-md w-full"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           required
//         />
//         <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-md">
//           Sign Up
//         </button>
//       </form>
//     </div>
//   );
// }
