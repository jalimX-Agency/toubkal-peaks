"use client";

// The signed-in area itself failed (its layout reads the team member from the API on every visit, which
// (panel)/error.tsx cannot catch): same message and automatic retry, instead of an uncaught error.
export { AdminError as default } from "@/components/admin/AdminError";
