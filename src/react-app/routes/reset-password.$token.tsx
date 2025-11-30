import { ResetPasswordForm } from "@/components/reset-password-form";
import { AuthLayout } from "@/layouts/auth-layout";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/reset-password/$token")({
  component: RouteComponent,
});

function RouteComponent() {
  const { token } = Route.useParams();

  return (
    <AuthLayout>
      <ResetPasswordForm token={token} />
    </AuthLayout>
  );
}
