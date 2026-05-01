import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CheckCircle2, Circle, Search, Filter, MapPin, Building2,
  ExternalLink, Clock, Globe, Layers
} from "lucide-react";

/* ─────────── TAB BUTTON ─────────── */
function TabButton({ active, onClick, icon: Icon, label, count }: {
  active: boolean; onClick: () => void; icon: any; label: string; count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 px-6 py-3.5 text-sm font-bold tracking-wider uppercase transition-all duration-300 border-b-2 ${
        active
          ? "border-accent text-accent bg-accent/10"
          : "border-transparent text-muted-foreground hover:text-foreground hover:border-accent/30"
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
      {count !== undefined && (
        <span className={`text-xs px-2 py-0.5 rounded-sm ${active ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"}`}>
          {count}
        </span>
      )}
    </button>
  );
}

/* ─────────── STAT CARD ─────────── */
function StatCard({ label, value, sub, color = "text-foreground" }: {
  label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <Card className="blueprint-card">
      <CardContent className="pt-5 pb-4 px-5">
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground mb-1">{label}</p>
        <p className={`text-3xl font-bold ${color}`}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

/* ─────────── PROGRESS BAR ─────────── */
function ProgressBar({ percentage, label }: { percentage: number; label: string }) {
  return (
    <Card className="blueprint-card col-span-full">
      <CardContent className="pt-5 pb-4 px-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground">Progresso Geral</p>
          <p className="text-sm font-bold text-accent">{percentage}%</p>
        </div>
        <div className="relative w-full bg-muted/50 rounded-sm h-3 border border-accent/20 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent to-accent/70 transition-all duration-700 ease-out"
            style={{ width: `${percentage}%` }}
          />
          {/* CAD-style tick marks */}
          {[25, 50, 75].map((tick) => (
            <div key={tick} className="absolute top-0 bottom-0 w-px bg-accent/20" style={{ left: `${tick}%` }} />
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">{label}</p>
      </CardContent>
    </Card>
  );
}

/* ═══════════ GEO PAGES TAB ═══════════ */
function GeoTab() {
  const { data: pages = [], isLoading, refetch } = trpc.geolocation.list.useQuery();
  const updateStatusMutation = trpc.geolocation.updateStatus.useMutation({ onSuccess: () => refetch() });

  const [searchTerm, setSearchTerm] = useState("");
  const [stateFilter, setStateFilter] = useState<"all" | "MA" | "CT">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "pending">("all");

  const filteredPages = useMemo(() => {
    return pages.filter((page) => {
      const matchesSearch = page.city.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesState = stateFilter === "all" || page.state === stateFilter;
      const matchesStatus = statusFilter === "all" || page.status === statusFilter;
      return matchesSearch && matchesState && matchesStatus;
    });
  }, [pages, searchTerm, stateFilter, statusFilter]);

  const groupedByState = useMemo(() => {
    const grouped: Record<string, typeof pages> = {};
    filteredPages.forEach((page) => {
      if (!grouped[page.state]) grouped[page.state] = [];
      grouped[page.state].push(page);
    });
    // Sort states: MA first, then CT
    const sorted: Record<string, typeof pages> = {};
    if (grouped["MA"]) sorted["MA"] = grouped["MA"];
    if (grouped["CT"]) sorted["CT"] = grouped["CT"];
    return sorted;
  }, [filteredPages]);

  const stats = useMemo(() => {
    const total = pages.length;
    const active = pages.filter((p) => p.status === "active").length;
    const pending = pages.filter((p) => p.status === "pending").length;
    const percentage = total > 0 ? Math.round((active / total) * 100) : 0;
    return { total, active, pending, percentage };
  }, [pages]);

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><div className="text-accent text-lg font-bold animate-pulse">Carregando dados...</div></div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total de Páginas" value={stats.total} />
        <StatCard label="Ativas" value={stats.active} color="text-accent" />
        <StatCard label="Pendentes" value={stats.pending} color="text-destructive" />
        <StatCard label="Conclusão" value={`${stats.percentage}%`} color="text-accent" />
      </div>

      <ProgressBar percentage={stats.percentage} label={`${stats.active} de ${stats.total} páginas geolocalizadas concluídas`} />

      {/* Filters */}
      <Card className="blueprint-card">
        <CardContent className="pt-4 pb-4 px-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground h-10"
              />
            </div>
            <Select value={stateFilter} onValueChange={(v: any) => setStateFilter(v)}>
              <SelectTrigger className="bg-input border-border text-foreground h-10">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Estados</SelectItem>
                <SelectItem value="MA">Massachusetts</SelectItem>
                <SelectItem value="CT">Connecticut</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
              <SelectTrigger className="bg-input border-border text-foreground h-10">
                <SelectValue placeholder="Status" />
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

      {/* Grouped Pages */}
      {Object.entries(groupedByState).map(([state, statePages]) => (
        <Card key={state} className="blueprint-card">
          <CardHeader className="border-b border-accent/20 py-4">
            <CardTitle className="flex items-center gap-2 text-accent text-base">
              <MapPin className="w-4 h-4" />
              {state === "MA" ? "Massachusetts" : "Connecticut"}
              <span className="text-muted-foreground text-sm font-normal ml-1">({statePages.length} cidades)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 pb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {statePages.map((page) => (
                <div
                  key={page.id}
                  className="flex items-center justify-between p-3 border border-accent/15 rounded-sm bg-card/50 hover:bg-accent/5 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <button
                      onClick={() => updateStatusMutation.mutate({ id: page.id, status: page.status === "active" ? "pending" : "active" })}
                      disabled={updateStatusMutation.isPending}
                      className="flex-shrink-0 transition-all duration-200 hover:scale-110"
                    >
                      {page.status === "active"
                        ? <CheckCircle2 className="w-5 h-5 text-accent" />
                        : <Circle className="w-5 h-5 text-muted-foreground group-hover:text-accent/50" />
                      }
                    </button>
                    <span className="font-semibold text-sm text-foreground truncate">{page.city}</span>
                  </div>
                  <Badge
                    variant={page.status === "active" ? "default" : "secondary"}
                    className="ml-2 flex-shrink-0 text-[10px] px-2 py-0.5"
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
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Nenhuma página encontrada com os filtros selecionados.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ═══════════ LISTING PORTALS TAB ═══════════ */
function ListingTab() {
  const { data: portals = [], isLoading, refetch } = trpc.listing.list.useQuery();
  const updateStatusMutation = trpc.listing.updateStatus.useMutation({ onSuccess: () => refetch() });

  const [searchTerm, setSearchTerm] = useState("");
  const [costFilter, setCostFilter] = useState<string>("all");
  const [smsFilter, setSmsFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredPortals = useMemo(() => {
    return portals.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCost = costFilter === "all" || p.isPaid === costFilter;
      const matchesSms = smsFilter === "all" || p.smsVerification === smsFilter;
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      return matchesSearch && matchesCost && matchesSms && matchesStatus;
    });
  }, [portals, searchTerm, costFilter, smsFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = portals.length;
    const completed = portals.filter((p) => p.status === "completed").length;
    const inProgress = portals.filter((p) => p.status === "in_progress").length;
    const notStarted = portals.filter((p) => p.status === "not_started").length;
    const free = portals.filter((p) => p.isPaid === "Não").length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, inProgress, notStarted, free, percentage };
  }, [portals]);

  const statusLabels: Record<string, string> = {
    not_started: "Não iniciado",
    in_progress: "Em andamento",
    completed: "Cadastrado",
  };

  const nextStatus = (current: string) => {
    if (current === "not_started") return "in_progress";
    if (current === "in_progress") return "completed";
    return "not_started";
  };

  const statusColors: Record<string, string> = {
    not_started: "bg-muted text-muted-foreground",
    in_progress: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    completed: "bg-accent/20 text-accent border-accent/30",
  };

  const statusIcons: Record<string, any> = {
    not_started: Circle,
    in_progress: Clock,
    completed: CheckCircle2,
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><div className="text-accent text-lg font-bold animate-pulse">Carregando portais...</div></div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Total Mapeados" value={stats.total} />
        <StatCard label="Cadastrados" value={stats.completed} color="text-accent" />
        <StatCard label="Em Andamento" value={stats.inProgress} color="text-yellow-400" />
        <StatCard label="Pendentes" value={stats.notStarted} color="text-destructive" />
        <StatCard label="Gratuitos" value={stats.free} color="text-accent" sub={`de ${stats.total} portais`} />
      </div>

      <ProgressBar percentage={stats.percentage} label={`${stats.completed} de ${stats.total} portais cadastrados`} />

      {/* Filters */}
      <Card className="blueprint-card">
        <CardContent className="pt-4 pb-4 px-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar portal, categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground h-10"
              />
            </div>
            <Select value={costFilter} onValueChange={setCostFilter}>
              <SelectTrigger className="bg-input border-border text-foreground h-10">
                <SelectValue placeholder="Custo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os custos</SelectItem>
                <SelectItem value="Não">Gratuito</SelectItem>
                <SelectItem value="Opcional">Opcional</SelectItem>
                <SelectItem value="Sim">Pago</SelectItem>
                <SelectItem value="Não identificado">Não identificado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={smsFilter} onValueChange={setSmsFilter}>
              <SelectTrigger className="bg-input border-border text-foreground h-10">
                <SelectValue placeholder="SMS/Ligação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as verificações</SelectItem>
                <SelectItem value="Não">Sem verificação</SelectItem>
                <SelectItem value="Pode solicitar">Pode solicitar</SelectItem>
                <SelectItem value="Não identificado">Não identificado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-input border-border text-foreground h-10">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="not_started">Não iniciado</SelectItem>
                <SelectItem value="in_progress">Em andamento</SelectItem>
                <SelectItem value="completed">Cadastrado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Portals Table */}
      <Card className="blueprint-card overflow-hidden">
        <CardHeader className="border-b border-accent/20 py-3 px-5">
          <CardTitle className="flex items-center gap-2 text-accent text-sm">
            <Layers className="w-4 h-4" />
            Portais de Listing
            <span className="text-muted-foreground font-normal ml-1">({filteredPortals.length} de {stats.total})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-accent/20 bg-muted/20">
                  <th className="text-left py-3 px-4 text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground w-12">#</th>
                  <th className="text-left py-3 px-4 text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground">Portal</th>
                  <th className="text-left py-3 px-4 text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground">Categoria</th>
                  <th className="text-left py-3 px-4 text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground w-24">Pago?</th>
                  <th className="text-left py-3 px-4 text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground w-28">SMS/Ligação</th>
                  <th className="text-left py-3 px-4 text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground w-36">Status</th>
                  <th className="text-center py-3 px-4 text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground w-16">Link</th>
                </tr>
              </thead>
              <tbody>
                {filteredPortals.map((portal) => {
                  const StatusIcon = statusIcons[portal.status];
                  return (
                    <tr key={portal.id} className="border-b border-accent/10 hover:bg-accent/5 transition-colors">
                      <td className="py-3 px-4 text-muted-foreground font-mono text-xs">{portal.priority}</td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-foreground">{portal.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{portal.description}</p>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">{portal.category}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${
                          portal.isPaid === "Não" ? "border-accent/30 text-accent" :
                          portal.isPaid === "Sim" ? "border-destructive/30 text-destructive" :
                          portal.isPaid === "Opcional" ? "border-yellow-500/30 text-yellow-400" :
                          "border-muted text-muted-foreground"
                        }`}>
                          {portal.isPaid}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs ${
                          portal.smsVerification === "Pode solicitar" ? "text-yellow-400" :
                          portal.smsVerification === "Não" ? "text-accent" : "text-muted-foreground"
                        }`}>
                          {portal.smsVerification}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => updateStatusMutation.mutate({ id: portal.id, status: nextStatus(portal.status) as any })}
                          disabled={updateStatusMutation.isPending}
                          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-sm border transition-all duration-200 hover:scale-105 ${statusColors[portal.status]}`}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusLabels[portal.status]}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {portal.portalUrl && (
                          <a
                            href={portal.portalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:text-accent/80 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4 mx-auto" />
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden p-4 space-y-3">
            {filteredPortals.map((portal) => {
              const StatusIcon = statusIcons[portal.status];
              return (
                <div key={portal.id} className="border border-accent/15 rounded-sm p-4 bg-card/50 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-mono">#{portal.priority}</span>
                        <p className="font-semibold text-foreground text-sm truncate">{portal.name}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{portal.category}</p>
                    </div>
                    {portal.portalUrl && (
                      <a href={portal.portalUrl} target="_blank" rel="noopener noreferrer" className="text-accent flex-shrink-0">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className={`text-[10px] ${
                      portal.isPaid === "Não" ? "border-accent/30 text-accent" :
                      portal.isPaid === "Sim" ? "border-destructive/30 text-destructive" :
                      portal.isPaid === "Opcional" ? "border-yellow-500/30 text-yellow-400" :
                      "border-muted text-muted-foreground"
                    }`}>
                      {portal.isPaid}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">SMS: {portal.smsVerification}</span>
                  </div>
                  <button
                    onClick={() => updateStatusMutation.mutate({ id: portal.id, status: nextStatus(portal.status) as any })}
                    disabled={updateStatusMutation.isPending}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-sm border transition-all duration-200 w-full justify-center ${statusColors[portal.status]}`}
                  >
                    <StatusIcon className="w-3.5 h-3.5" />
                    {statusLabels[portal.status]}
                  </button>
                </div>
              );
            })}
          </div>

          {filteredPortals.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">Nenhum portal encontrado com os filtros selecionados.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ═══════════ MAIN DASHBOARD ═══════════ */
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"geo" | "listing">("geo");

  return (
    <div className="min-h-screen bg-background relative z-1">
      {/* Top Header */}
      <div className="border-b border-accent/20 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Title Row */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-sm bg-accent/20 border border-accent/30 flex items-center justify-center">
                <Globe className="w-4 h-4 text-accent" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground tracking-wide">ART 7 EPOXY</h1>
                <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Painel de Controle</p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-0 -mb-px overflow-x-auto">
            <TabButton
              active={activeTab === "geo"}
              onClick={() => setActiveTab("geo")}
              icon={MapPin}
              label="Páginas Geolocalizadas"
            />
            <TabButton
              active={activeTab === "listing"}
              onClick={() => setActiveTab("listing")}
              icon={Building2}
              label="Portais de Listing"
            />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {activeTab === "geo" ? <GeoTab /> : <ListingTab />}
      </div>
    </div>
  );
}
