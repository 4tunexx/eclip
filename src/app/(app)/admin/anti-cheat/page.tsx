import { TabsContent } from "@/components/ui/tabs";
import { ReviewForm } from "./review-form";

export default function AntiCheatPage() {
  return (
    <TabsContent value="/admin/anti-cheat">
      <ReviewForm />
    </TabsContent>
  );
}
