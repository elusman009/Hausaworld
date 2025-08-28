import "@/styles/globals.css";

export const metadata = {
  title: "Hausaworld",
  description: "Hausaworld — Movie store"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-hausaworldBg text-white">
        <div className="max-w-[1200px] mx-auto px-4">
          {children}
        </div>
      </body>
    </html>
  );
}
