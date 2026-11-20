import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Header } from "../components/layout/header";

export const Route = createRootRoute({
  component: () => (
    <div className="flex min-h-svh flex-col">
      <Header />
      <Outlet />
      <footer className="mt-auto flex items-center justify-end gap-2 bg-white px-4 py-4 text-[10px] text-[#8a8a8a] sm:px-14">
        <img src="/images/logos/tmdb-logo.svg" alt="TMDB" className="w-10" />
        This product uses the TMDB API but is not endorsed or certified by TMDB.
      </footer>
    </div>
  ),
  notFoundComponent: () => <main className="p-14 text-center">페이지를 찾을 수 없어요.</main>,
});
