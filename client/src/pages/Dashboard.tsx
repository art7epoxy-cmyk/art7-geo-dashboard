"use client";
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
  const updateUrlMutation = trpc.geolocation.updateUrl.useMutation({ onSuccess: () => refetch() });
  
  const [searchTerm, setSearchTerm] = useState("");
  const [stateFilter, setStateFilter] = useState<"all" | "MA" | "NH">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "pending">("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingUrl, setEditingUrl] = useState<string>("");

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
    // Sort states: MA first, then NH
    const sorted: Record<string, typeof pages> = {};
    if (grouped["MA"]) sorted["MA"] = grouped["MA"];
    if (grouped["NH"]) sorted["NH"] = grouped["NH"];
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
                <SelectItem value="NH">New Hampshire</SelectItem>
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
              {state === "MA" ? "Massachusetts" : "New Hampshire"}
              <span className="text-muted-foreground text-sm font-normal ml-1">({statePages.length} cidades)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 pb-4">
            <div className="space-y-2">
              {statePages.map((page) => (
                <div
                  key={page.id}
                  className="border border-accent/15 rounded-sm bg-card/50 hover:bg-accent/5 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between p-3">
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
                    <div className="flex items-center gap-2">
                      {page.url && (
                        <a href={page.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent/80 transition-colors">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <Badge
                        variant={page.status === "active" ? "default" : "secondary"}
                        className="text-[10px] px-2 py-0.5"
                      >
                        {page.status === "active" ? "Ativa" : "Pendente"}
                      </Badge>
                    </div>
                  </div>
                  {editingId === page.id ? (
                    <div className="px-3 pb-3 border-t border-accent/10 flex gap-2">
                      <Input
                        value={editingUrl}
                        onChange={(e) => setEditingUrl(e.target.value)}
                        placeholder="https://art7epoxy.com/..."
                        className="flex-1 h-8 text-xs bg-input border-border text-foreground"
                      />
                      <button
                        onClick={() => {
                          updateUrlMutation.mutate({ id: page.id, url: editingUrl || null });
                          setEditingId(null);
                        }}
                        disabled={updateUrlMutation.isPending}
                        className="px-2 py-1 bg-accent text-background text-xs font-bold rounded-sm hover:bg-accent/90 transition-colors"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-2 py-1 bg-muted text-muted-foreground text-xs font-bold rounded-sm hover:bg-muted/80 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div className="px-3 pb-3 border-t border-accent/10">
                      {page.url ? (
                        <p className="text-xs text-muted-foreground truncate mb-1">{page.url}</p>
                      ) : (
                        <p className="text-xs text-muted-foreground italic mb-1">Sem URL adicionada</p>
                      )}
                      <button
                        onClick={() => {
                          setEditingId(page.id);
                          setEditingUrl(page.url || "");
                        }}
                        className="text-xs text-accent hover:text-accent/80 transition-colors font-semibold"
                      >
                        {page.url ? "Editar URL" : "Adicionar URL"}
                      </button>
                    </div>
                  )}
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

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><div className="text-accent text-lg font-bold animate-pulse">Carregando dados...</div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total de Portais" value={stats.total} />
        <StatCard label="Cadastrados" value={stats.completed} color="text-accent" />
        <StatCard label="Em Andamento" value={stats.inProgress} color="text-yellow-500" />
        <StatCard label="Progresso" value={`${stats.percentage}%`} color="text-accent" />
      </div>

      <ProgressBar percentage={stats.percentage} label={`${stats.completed} de ${stats.total} portais cadastrados`} />

      <Card className="blueprint-card">
        <CardContent className="pt-4 pb-4 px-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar portal..."
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
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Não">Gratuito</SelectItem>
                <SelectItem value="Opcional">Opcional</SelectItem>
                <SelectItem value="Sim">Pago</SelectItem>
              </SelectContent>
            </Select>
            <Select value={smsFilter} onValueChange={setSmsFilter}>
              <SelectTrigger className="bg-input border-border text-foreground h-10">
                <SelectValue placeholder="SMS" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Não">Não</SelectItem>
                <SelectItem value="Pode solicitar">Pode solicitar</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-input border-border text-foreground h-10">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="not_started">Não iniciado</SelectItem>
                <SelectItem value="in_progress">Em andamento</SelectItem>
                <SelectItem value="completed">Cadastrado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {filteredPortals.map((portal) => (
          <Card key={portal.id} className="blueprint-card">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-sm text-foreground">{portal.name}</h3>
                    <Badge variant="outline" className="text-[10px]">{portal.category}</Badge>
                  </div>
                  {portal.description && <p className="text-xs text-muted-foreground mb-2">{portal.description}</p>}
                  {portal.paidPlanInfo && <p className="text-xs text-accent mb-2">💰 {portal.paidPlanInfo}</p>}
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span>Custo: {portal.isPaid}</span>
                    <span>•</span>
                    <span>SMS: {portal.smsVerification}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => {
                      const nextStatus = portal.status === "not_started" ? "in_progress" : portal.status === "in_progress" ? "completed" : "not_started";
                      updateStatusMutation.mutate({ id: portal.id, status: nextStatus });
                    }}
                    disabled={updateStatusMutation.isPending}
                    className="transition-all duration-200"
                  >
                    {portal.status === "not_started" && <Circle className="w-5 h-5 text-muted-foreground hover:text-accent/50" />}
                    {portal.status === "in_progress" && <Clock className="w-5 h-5 text-yellow-500" />}
                    {portal.status === "completed" && <CheckCircle2 className="w-5 h-5 text-accent" />}
                  </button>
                  <Badge
                    variant={portal.status === "completed" ? "default" : portal.status === "in_progress" ? "secondary" : "outline"}
                    className="text-[10px]"
                  >
                    {portal.status === "not_started" && "Não iniciado"}
                    {portal.status === "in_progress" && "Em andamento"}
                    {portal.status === "completed" && "Cadastrado"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPortals.length === 0 && (
        <Card className="blueprint-card">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Nenhum portal encontrado com os filtros selecionados.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ═══════════ MAIN DASHBOARD ═══════════ */
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"geo" | "listing">("geo");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-accent/20 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-sm border-2 border-accent flex items-center justify-center">
                <Globe className="w-4 h-4 text-accent" />
              </div>
              <h1 className="text-lg font-bold text-foreground tracking-wide">ART 7 EPOXY</h1>
              <p className="text-xs text-muted-foreground tracking-widest uppercase">PAINEL DE CONTROLE</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 border-b border-accent/10">
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

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === "geo" && <GeoTab />}
        {activeTab === "listing" && <ListingTab />}
      </div>
    </div>
  );
}
