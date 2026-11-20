import { createFileRoute } from "@tanstack/react-router";
import { MyPage } from "../pages/members/member-api-demo-page";
export const Route = createFileRoute("/member-api-demo")({ component: MyPage });
