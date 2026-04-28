import "./globals.css";
import { JetBrains_Mono } from "next/font/google";
import Navbar from "./components/Navbar";
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});
export const metadata = {
  title: "Typing Speed Test",
  description: "Test your WPM and accuracy. Compete on the global leaderboard.",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
