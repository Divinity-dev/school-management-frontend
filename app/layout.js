import "./globals.css";
import Providers from "../components/Providers";

export const metadata = {
  title: "School Management System",
  description: "School management platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}