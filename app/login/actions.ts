"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "../utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // ponytail: pass raw error message for direct feedback
    redirect(`/login?message=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error, data } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    // ponytail: pass raw error message for direct feedback
    redirect(`/login?message=${encodeURIComponent(error.message)}`);
  }

  // ponytail: if email confirmation is required, notify user instead of failing redirect
  if (data.user && !data.session) {
    redirect(`/login?message=${encodeURIComponent("Account created! Check your email to confirm registration or disable email confirmation in Supabase.")}`);
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
