"use client";

import { useSelector } from "react-redux";

export default function DashboardPage() {
  const { user } = useSelector((state) => state.auth);

  return (
    <main>
      <h1>Dashboard</h1>

      {user ? (
        <div>
          <p>
            Welcome, {user.firstName} {user.lastName}
          </p>

          <p>Role: {user.role}</p>

          <p>Email: {user.email}</p>

          <p>School: {user.school?.name}</p>
        </div>
      ) : (
        <p>No authenticated user found.</p>
      )}
    </main>
  );
}