import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Revisar dados fiscais | Emissão de NF-e" },
      {
        name: "description",
        content:
          "Revise NCM, CFOP, quantidades e valores dos produtos antes de confirmar e emitir a NF-e.",
      },
      { property: "og:title", content: "Revisar dados fiscais | Emissão de NF-e" },
      {
        property: "og:description",
        content: "Confira os produtos da nota e emita a NF-e com os dados corretos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const CFOP_OPTIONS = [
  { code: "5102", label: "Venda de mercadoria adquirida de terceiros" },
  { code: "6102", label: "Venda de mercadoria adquirida de terceiros (fora do estado)" },
  { code: "5405", label: "Venda de mercadoria com substituição tributária" },
  { code: "5949", label: "Outra saída de mercadoria não especificada" },
];

type Item = {
  id: number;
  nome: string;
  novo?: boolean;
  ncm: string;
  cfop: string;
  qtd: number;
  valor: number;
};

const NCM_SUGESTOES = [
  { code: "2106.90.90", label: "Outras preparações alimentícias" },
  { code: "1905.90.90", label: "Outros produtos de padaria" },
  { code: "2202.10.00", label: "Águas com açúcar ou aromatizadas" },
  { code: "0402.21.10", label: "Leite em pó integral" },
];

const ORIGEM_OPTIONS = [
  "0 — Nacional",
  "1 — Estrangeira (importação direta)",
  "2 — Estrangeira (mercado interno)",
];

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

let nextId = 3;

function Index() {
  const [itens, setItens] = useState<Item[]>([
    { id: 1, nome: "Produto Teste Gerar Venda", ncm: "", cfop: "6102", qtd: 1, valor: 49.9 },
    {
      id: 2,
      nome: "Produto Teste Gerar Venda",
      novo: true,
      ncm: "",
      cfop: "5102",
      qtd: 1,
      valor: 49.9,
    },
  ]);

  const update = (id: number, patch: Partial<Item>) =>
    setItens((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const [editandoId, setEditandoId] = useState<number | null>(null);
  const editandoIndex = itens.findIndex((i) => i.id === editandoId);
  const editando = editandoIndex >= 0 ? itens[editandoIndex] : null;

  const navegar = (delta: number) => {
    const prox = itens[editandoIndex + delta];
    if (prox) setEditandoId(prox.id);
  };

  const total = useMemo(
    () => itens.reduce((acc, i) => acc + i.qtd * i.valor, 0),
    [itens],
  );
  const semNcm = itens.filter((i) => i.ncm.trim().length < 8).length;

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <Toaster />
      <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl border bg-card shadow-xl">
        {/* Cabeçalho */}
        <header className="flex items-start justify-between gap-4 border-b px-6 py-5">
          <div className="flex gap-4">
            <span className="flex size-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <FileText className="size-6" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">Revisar dados fiscais</h1>
                <span className="inline-flex items-center gap-2 rounded-full bg-success-soft px-3 py-1 text-xs font-medium text-success">
                  <span className="size-2 rounded-full bg-success" />
                  Pronta para revisão
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                NF-e 10/1 • ROBERIO JOSE DOS SANTOS • 16952477870
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" aria-label="Fechar">
            <X className="size-5" />
          </Button>
        </header>

        <div className="space-y-8 px-6 py-6">
          {/* Dados do cliente */}
          <section className="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-3">
            {[
              { label: "Cliente", value: "ROBERIO JOSE DOS SANTOS" },
              { label: "CPF/CNPJ", value: "16952477870" },
              { label: "Natureza da operação", value: "Venda", strong: true },
            ].map((f) => (
              <div key={f.label} className="bg-card px-5 py-4">
                <p className="text-sm text-muted-foreground">{f.label}</p>
                <p className={`mt-1 ${f.strong ? "font-semibold" : ""}`}>{f.value}</p>
              </div>
            ))}
          </section>

          {/* Produtos */}
          <section>
            <div className="mb-4 flex items-center gap-3">
              <h2 className="text-xl font-bold tracking-tight">Produtos da nota</h2>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                {itens.length} {itens.length === 1 ? "item" : "itens"}
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full min-w-[900px] text-sm">
                <thead className="bg-muted/60 text-muted-foreground">
                  <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:text-left [&>th]:font-medium">
                    <th>Produto</th>
                    <th>NCM</th>
                    <th>CFOP</th>
                    <th>Qtd.</th>
                    <th>Valor unit.</th>
                    <th>Total</th>
                    <th className="text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {itens.map((item) => {
                    const invalido = item.ncm.trim().length < 8;
                    return (
                      <tr key={item.id} className="border-t align-middle [&>td]:px-4 [&>td]:py-3">
                        <td>
                          <p className="font-medium">{item.nome}</p>
                          {item.novo && (
                            <span className="mt-1 inline-block rounded-md bg-success-soft px-2 py-0.5 text-xs font-medium text-success">
                              Novo
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="relative">
                            <Input
                              inputMode="numeric"
                              maxLength={8}
                              value={item.ncm}
                              onChange={(e) =>
                                update(item.id, { ncm: e.target.value.replace(/\D/g, "") })
                              }
                              placeholder={invalido ? "Informe o NCM" : ""}
                              aria-label={`NCM de ${item.nome}`}
                              className={
                                invalido
                                  ? "w-44 border-destructive bg-danger-soft pl-9 placeholder:text-destructive"
                                  : "w-44"
                              }
                            />
                            {invalido && (
                              <AlertTriangle className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-destructive" />
                            )}
                          </div>
                        </td>
                        <td>
                          <Select
                            value={item.cfop}
                            onValueChange={(cfop) => update(item.id, { cfop })}
                          >
                            <SelectTrigger className="h-auto w-[22rem] py-2 text-left">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CFOP_OPTIONS.map((o) => (
                                <SelectItem key={o.code} value={o.code}>
                                  {o.code} — {o.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td>
                          <Input
                            type="number"
                            min={1}
                            value={item.qtd}
                            aria-label={`Quantidade de ${item.nome}`}
                            onChange={(e) =>
                              update(item.id, { qtd: Math.max(1, Number(e.target.value) || 1) })
                            }
                            className="w-20"
                          />
                        </td>
                        <td>
                          <Input
                            type="number"
                            step="0.01"
                            min={0}
                            value={item.valor}
                            aria-label={`Valor unitário de ${item.nome}`}
                            onChange={(e) =>
                              update(item.id, { valor: Math.max(0, Number(e.target.value) || 0) })
                            }
                            className="w-28"
                          />
                        </td>
                        <td className="font-semibold whitespace-nowrap">
                          {brl(item.qtd * item.valor)}
                        </td>
                        <td>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              aria-label="Dados fiscais do produto"
                              onClick={() => setEditandoId(item.id)}
                            >
                              <SlidersHorizontal className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Remover produto"
                              className="text-destructive hover:bg-danger-soft hover:text-destructive"
                              onClick={() =>
                                setItens((prev) => prev.filter((i) => i.id !== item.id))
                              }
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {itens.length === 0 && (
                    <tr className="border-t">
                      <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                        Nenhum produto na nota.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <button
                type="button"
                onClick={() =>
                  setItens((prev) => [
                    ...prev,
                    {
                      id: nextId++,
                      nome: "Novo produto",
                      novo: true,
                      ncm: "",
                      cfop: "5102",
                      qtd: 1,
                      valor: 0,
                    },
                  ])
                }
                className="flex h-16 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/40 text-sm font-semibold text-primary transition-colors hover:bg-accent"
              >
                <Plus className="size-5" /> Adicionar produto
              </button>

              <div className="rounded-xl border bg-muted/40 p-5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-semibold">
                    <FileText className="size-5 text-primary" /> Resumo da nota
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {itens.length} produtos
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total dos produtos</span>
                  <span className="font-semibold">{brl(total)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t pt-3">
                  <span className="font-semibold">Total da NF-e</span>
                  <span className="text-xl font-bold">{brl(total)}</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Rodapé */}
        <footer className="flex flex-wrap items-center justify-between gap-4 border-t bg-muted/30 px-6 py-5">
          <div className="flex items-start gap-3">
            {semNcm > 0 ? (
              <>
                <AlertTriangle className="mt-0.5 size-6 text-destructive" />
                <div>
                  <p className="font-semibold text-destructive">
                    {semNcm} {semNcm === 1 ? "produto precisa" : "produtos precisam"} do NCM
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Informe o NCM para todos os produtos antes de emitir a NF-e.
                  </p>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Tudo certo. Você pode confirmar e emitir a NF-e.
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="lg" onClick={() => toast("Emissão cancelada")}>
              Cancelar <kbd className="ml-2 rounded bg-muted px-2 py-0.5 text-xs">Esc</kbd>
            </Button>
            <Button
              size="lg"
              disabled={semNcm > 0 || itens.length === 0}
              className="bg-success text-success-foreground hover:bg-success/90"
              onClick={() => toast.success("NF-e enviada para emissão")}
            >
              Confirmar e emitir NF-e
              <kbd className="ml-2 rounded bg-black/15 px-2 py-0.5 text-xs">Enter</kbd>
            </Button>
          </div>
        </footer>
      </div>

      {/* Modal de dados fiscais do produto */}
      <Dialog
        open={editando !== null}
        onOpenChange={(open) => !open && setEditandoId(null)}
      >
        {editando && (
          <DialogContent
            className="flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-3xl flex-col gap-0 overflow-hidden p-0"
            showCloseButton={false}
          >
            <DialogTitle className="sr-only">
              Dados fiscais de {editando.nome}
            </DialogTitle>

            {/* Cabeçalho do modal */}
            <div className="flex items-start justify-between gap-4 border-b px-6 pt-5 pb-4">
              <div className="flex gap-3">
                <span className="flex size-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <SlidersHorizontal className="size-5" />
                </span>
                <div>
                  <h3 className="text-xl font-bold tracking-tight">
                    Dados fiscais do produto
                  </h3>
                  <p className="text-sm text-muted-foreground">{editando.nome}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="mr-1 text-sm text-muted-foreground">
                  Item {editandoIndex + 1} de {itens.length}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Produto anterior"
                  disabled={editandoIndex <= 0}
                  onClick={() => navegar(-1)}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Próximo produto"
                  disabled={editandoIndex >= itens.length - 1}
                  onClick={() => navegar(1)}
                >
                  <ChevronRight className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Fechar"
                  onClick={() => setEditandoId(null)}
                >
                  <X className="size-5" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6">
              {editando.ncm.trim().length < 8 && (
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-danger-soft px-4 py-3 text-sm font-medium text-destructive">
                  <AlertTriangle className="size-4 shrink-0" />
                  Preencha o NCM para emitir esta NF-e.
                </div>
              )}

              <Tabs defaultValue="fiscais" className="mt-4">
                <TabsList variant="line" className="w-full justify-start gap-4">
                  <TabsTrigger value="fiscais">Dados fiscais</TabsTrigger>
                  <TabsTrigger value="icms">ICMS</TabsTrigger>
                  <TabsTrigger value="pis">PIS</TabsTrigger>
                  <TabsTrigger value="cofins">COFINS</TabsTrigger>
                  <TabsTrigger value="ipi">IPI</TabsTrigger>
                </TabsList>

                <TabsContent value="fiscais" className="mt-5 space-y-4">
                  <DadosFiscaisForm
                    item={editando}
                    onChange={(patch) => update(editando.id, patch)}
                  />
                </TabsContent>
                {(["icms", "pis", "cofins", "ipi"] as const).map((tab) => (
                  <TabsContent key={tab} value={tab} className="mt-5">
                    <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                      As alíquotas de {tab.toUpperCase()} são calculadas
                      automaticamente a partir do NCM e do CFOP informados.
                    </p>
                  </TabsContent>
                ))}
              </Tabs>
            </div>

            {/* Rodapé do modal */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t px-6 py-4">
              <button
                type="button"
                className="text-sm font-medium text-primary hover:underline"
                onClick={() =>
                  update(editando.id, { ncm: "", cfop: "6102" })
                }
              >
                Restaurar padrão
              </button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setEditandoId(null)}>
                  Cancelar <kbd className="ml-2 rounded bg-muted px-2 py-0.5 text-xs">Esc</kbd>
                </Button>
                <Button
                  onClick={() => {
                    setEditandoId(null);
                    toast.success("Dados fiscais aplicados ao produto");
                  }}
                >
                  Aplicar alterações
                  <kbd className="ml-2 rounded bg-black/15 px-2 py-0.5 text-xs">Enter</kbd>
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </main>
  );
}

function DadosFiscaisForm({
  item,
  onChange,
}: {
  item: Item;
  onChange: (patch: Partial<Item>) => void;
}) {
  const [buscaNcm, setBuscaNcm] = useState("");
  const [aberto, setAberto] = useState(false);
  const [salvarCadastro, setSalvarCadastro] = useState(true);

  useEffect(() => {
    setBuscaNcm(item.ncm);
  }, [item.id, item.ncm]);

  const sugestoes = NCM_SUGESTOES.filter(
    (s) =>
      buscaNcm.trim() === "" ||
      s.code.includes(buscaNcm.replace(/\D/g, "")) ||
      s.label.toLowerCase().includes(buscaNcm.toLowerCase()),
  );

  const selecionar = (code: string) => {
    const digits = code.replace(/\D/g, "");
    setBuscaNcm(code);
    onChange({ ncm: digits });
    setAberto(false);
  };

  const invalido = item.ncm.trim().length < 8;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {/* NCM com busca */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            NCM <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={buscaNcm}
              onChange={(e) => {
                setBuscaNcm(e.target.value);
                setAberto(true);
                onChange({ ncm: e.target.value.replace(/\D/g, "").slice(0, 8) });
              }}
              onFocus={() => setAberto(true)}
              onBlur={() => setTimeout(() => setAberto(false), 150)}
              placeholder="Digite o código ou descrição do NCM"
              aria-invalid={invalido}
              className={invalido ? "pl-9 border-destructive" : "pl-9"}
            />
            {aberto && sugestoes.length > 0 && (
              <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border bg-popover shadow-lg">
                {sugestoes.map((s) => (
                  <button
                    key={s.code}
                    type="button"
                    onMouseDown={() => selecionar(s.code)}
                    className="block w-full px-4 py-2.5 text-left hover:bg-accent"
                  >
                    <p className="font-semibold">{s.code}</p>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CFOP */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            CFOP <span className="text-destructive">*</span>
          </label>
          <Select value={item.cfop} onValueChange={(cfop) => onChange({ cfop })}>
            <SelectTrigger className="h-auto py-2 text-left">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CFOP_OPTIONS.map((o) => (
                <SelectItem key={o.code} value={o.code}>
                  {o.code} — {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Origem */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Origem da mercadoria <span className="text-destructive">*</span>
          </label>
          <Select defaultValue={ORIGEM_OPTIONS[0]}>
            <SelectTrigger className="h-auto py-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ORIGEM_OPTIONS.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Unidade tributável */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Unidade tributável
          </label>
          <Input defaultValue="UN" />
        </div>

        {/* CEST */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">CEST</label>
          <Input placeholder="Opcional" />
        </div>

        {/* Benefício fiscal */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Código de benefício fiscal
          </label>
          <Input placeholder="Opcional" />
        </div>
      </div>

      <label className="mt-5 flex cursor-pointer items-center gap-2.5 text-sm font-medium">
        <Checkbox
          checked={salvarCadastro}
          onCheckedChange={(v) => setSalvarCadastro(v === true)}
        />
        Salvar estes dados no cadastro do produto para as próximas notas
      </label>
    </>
  );
}
