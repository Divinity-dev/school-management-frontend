import "./globals.css";
import Providers from "../components/Providers";

export const metadata = {
  title: {
    default: "SchoolPilot | Run Your School Smarter",
    template: "%s | SchoolPilot",
  },
  description:
    "SchoolPilot helps schools manage students, teachers, attendance, results, fees, and everyday school activities from one platform.",
  applicationName: "SchoolPilot",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: ["/icon.svg"],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
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
