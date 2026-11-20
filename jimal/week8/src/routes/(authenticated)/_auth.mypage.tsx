import { createFileRoute } from "@tanstack/react-router";
import { MyPage } from "../../pages/account/my-page";

export const Route = createFileRoute("/(authenticated)/_auth/mypage")({
  validateSearch: (search): { updated?: boolean } => ({
    updated: search.updated === true || search.updated === "true" ? true : undefined,
  }),
  component: MyPage,
});
