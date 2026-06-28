import { Suspense } from "react";
import { PageLoader } from "@/components/ui/page-loader";
import DashboardNavbar from "./_components/navbar";
import DashboardFooter from "./_components/footer";
import DashboardNavbar from "./_components/navbar";

export default function Layout({ children }) {
  return (
    <>
      <DashboardNavbar />
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
      <DashboardFooter />
    </>
  );
}
