import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";

export default function Home() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="blueprint-header rounded-lg p-12 text-center max-w-2xl">
        <h1 className="text-5xl font-bold text-foreground text-blueprint mb-4">
          Art 7 Geo-Dashboard
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Gerenciamento profissional de páginas geolocalizadas para Massachusetts e Connecticut
        </p>

        {isAuthenticated ? (
          <Button
            onClick={() => navigate("/dashboard")}
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
          >
            Acessar Dashboard
          </Button>
        ) : (
          <Button
            onClick={() => (window.location.href = getLoginUrl())}
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
          >
            Fazer Login
          </Button>
        )}
      </div>
    </div>
  );
}
