import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Circle, Search, Filter } from "lucide-react";

export default function Dashboard() {
  const { data: pages = [], isLoading, refetch } = trpc.geolocation.list.useQuery();
  const updateStatusMutation = trpc.geolocation.updateStatus.useMutation({
    onSuccess: () => refetch(),
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [stateFilter, setStateFilter] = useState<"all" | "MA" | "CT">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "pending">("all");

  // Filter and group pages
  const filteredPages = useMemo(() => {
    return pages.filter((page) => {
      const matchesSearch = page.city.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesState = stateFilter === "all" || page.state === stateFilter;
      const matchesStatus = statusFilter === "all" || page.status === statusFilter;
      return matchesSearch && matchesState && matchesStatus;
    });
  }, [pages, searchTerm, stateFilter, statusFilter]);

  // Group by state
  const groupedByState = useMemo(() => {
    const grouped: Record<string, typeof pages> = {};
    filteredPages.forEach((page) => {
      if (!grouped[page.state]) {
        grouped[page.state] = [];
      }
      grouped[page.state].push(page);
    });
    return grouped;
  }, [filteredPages]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = pages.length;
    const active = pages.filter((p) => p.status === "active").length;
    const pending = pages.filter((p) => p.status === "pending").length;
    const percentage = total > 0 ? Math.round((active / total) * 100) : 0;
    return { total, active, pending, percentage };
  }, [pages]);

  const handleToggleStatus = (pageId: number, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "pending" : "active";
    updateStatusMutation.mutate({ id: pageId, status: newStatus as "active" | "pending" });
  };



  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-accent text-xl font-bold">Carregando dados...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      {/* Header */}
      <div className="blueprint-header rounded-lg p-8">
        <h1 className="text-4xl font-bold text-foreground text-blueprint mb-2">
          Geo-Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">
          Gerenciamento de Páginas Geolocalizadas - Art 7 Epoxy
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Progress Card */}
        <Card className="blueprint-card col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-accent">Progresso Geral</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative w-full bg-card/50 rounded-lg h-8 border border-accent/20 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent to-accent/80 transition-all duration-500"
                style={{ width: `${stats.percentage}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-foreground">{stats.percentage}%</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">
                {stats.active} de {stats.total}
              </p>
              <p className="text-sm text-muted-foreground">páginas ativas</p>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <Card className="blueprint-card">
          <CardHeader>
            <CardTitle className="text-sm text-accent">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{stats.total}</p>
          </CardContent>
        </Card>

        <Card className="blueprint-card">
          <CardHeader>
            <CardTitle className="text-sm text-accent">Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-accent">{stats.active}</p>
          </CardContent>
        </Card>

        <Card className="blueprint-card">
          <CardHeader>
            <CardTitle className="text-sm text-accent">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-destructive">{stats.pending}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="blueprint-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-accent">
            <Filter className="w-5 h-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* State Filter */}
            <Select value={stateFilter} onValueChange={(value: any) => setStateFilter(value)}>
              <SelectTrigger className="bg-input border-border text-foreground">
                <SelectValue placeholder="Selecionar Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Estados</SelectItem>
                <SelectItem value="MA">Massachusetts</SelectItem>
                <SelectItem value="CT">Connecticut</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="bg-input border-border text-foreground">
                <SelectValue placeholder="Selecionar Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="active">Ativas</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Pages List by State */}
      <div className="space-y-6">
        {Object.entries(groupedByState).map(([state, statePages]) => (
          <Card key={state} className="blueprint-card">
            <CardHeader className="border-b border-accent/20">
              <CardTitle className="text-xl text-accent">
                {state === "MA" ? "Massachusetts" : "Connecticut"} ({statePages.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {statePages.map((page) => (
                  <div
                    key={page.id}
                    className="flex items-center justify-between p-4 border border-accent/20 rounded-lg bg-card/50 hover:bg-card/80 transition-smooth group"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <button
                        onClick={() => handleToggleStatus(page.id, page.status)}
                        disabled={updateStatusMutation.isPending}
                        className="flex-shrink-0 transition-smooth hover:scale-110"
                      >
                        {page.status === "active" ? (
                          <CheckCircle2 className="w-6 h-6 text-accent" />
                        ) : (
                          <Circle className="w-6 h-6 text-muted-foreground" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">{page.city}</p>
                        <p className="text-xs text-muted-foreground">{page.state}</p>
                      </div>
                    </div>
                    <Badge
                      variant={page.status === "active" ? "default" : "secondary"}
                      className="ml-2 flex-shrink-0"
                    >
                      {page.status === "active" ? "Ativa" : "Pendente"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredPages.length === 0 && (
          <Card className="blueprint-card">
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-muted-foreground text-lg">Nenhuma página encontrada com os filtros selecionados.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
