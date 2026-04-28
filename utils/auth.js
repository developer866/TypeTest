"use client";
import { Auth } from "../src/app/lib/Firebase";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { useEffect, useState } from "react";


export const Auths = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  const signIn = async () => {
    if (!email || !password) {
      console.log("Email and password required");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        Auth,
        email,
        password,
      );

      console.log("User created:", userCredential.user);

      // optional: clear inputs
      setEmail("");
      setPassword("");
      router.push("/practise");
    } catch (err) {
      console.log("Error:", err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <input
        type="text"
        placeholder="Email"
        className="border border-gray-300 rounded-md px-4 py-2 mb-4 w-64"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="border border-gray-300 rounded-md px-4 py-2 mb-4 w-64"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        className="bg-blue-500 text-white rounded-md px-4 py-2 w-64"
        onClick={(e) => signIn()}
      >
        Sign In
      </button>
    </div>
  );
};

export const useAuth = () => {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(Auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);
  return user;
};
