import { redirect } from "next/navigation";

// Kirgan foydalanuvchini `middleware.ts` roliga mos bosh sahifaga yuboradi,
// shuning uchun bu yerga faqat sessiyasizlar yetib keladi.
export default function Home() {
  redirect("/login");
}
