import { useState } from "react";
import { ArrowLeft, BookOpen, Droplets, Leaf, Play, Sun, Wind } from "lucide-react";
import { Card, Eyebrow } from "./ui";

const articles = [
  {
    id: 1,
    category: "Benefícios",
    Icon: Wind,
    color: "text-primary bg-primary/10",
    readTime: "4 min",
    title: "Por que cada árvore equivale a 3 aparelhos de ar?",
    full: "A evapotranspiração das árvores refresca o ambiente e reduz ilhas de calor urbanas em até 8°C. Em Cidade Tiradentes, onde a temperatura média no verão chega a 34°C, esse dado é crítico para a saúde de todos.",
  },
  {
    id: 2,
    category: "Preservação",
    Icon: Leaf,
    color: "text-success bg-success/10",
    readTime: "3 min",
    title: "Como denunciar o corte ilegal em São Paulo",
    full: "Use o +Verde para registrar ocorrências diretamente com as ONGs parceiras. Você também pode acionar o canal 156 da Prefeitura de SP para crimes ambientais urbanos. Guarde fotos com data e localização.",
  },
  {
    id: 3,
    category: "Dicas",
    Icon: Sun,
    color: "text-warning bg-warning/15",
    readTime: "6 min",
    title: "5 espécies nativas ideais para calçadas",
    full: "Ipê-amarelo, Quaresmeira, Embaúba, Pau-Jacaré e Ingá são espécies nativas adaptadas ao clima de SP. Elas exigem menos manutenção e oferecem mais benefícios ecológicos do que espécies exóticas.",
  },
  {
    id: 4,
    category: "Dados",
    Icon: Droplets,
    color: "text-info bg-info/10",
    readTime: "5 min",
    title: "CT tem o menor índice arbóreo da capital",
    full: "Com cobertura bem abaixo da recomendada pela OMS, Cidade Tiradentes precisa de ao menos 12 mil novas árvores. O bairro enfrenta temperaturas mais altas que a média e índices de enchente maiores do que as zonas arborizadas.",
  },
];

const videos = [
  { id: 1, title: "Como plantar uma muda em 7 passos", duration: "8:24", views: "12 mil" },
  { id: 2, title: "Cidade Tiradentes Verde: o projeto", duration: "14:02", views: "4,3 mil" },
  { id: 3, title: "Benefícios da arborização urbana", duration: "5:47", views: "28 mil" },
];

const facts = [
  { value: "7×", desc: "mais chuvas absorvidas em áreas arborizadas" },
  { value: "30%", desc: "menos energia consumida com sombreamento" },
  { value: "8°C", desc: "temperatura menor em ruas com árvores" },
];

type Reading = (typeof articles)[number];

export function EducationScreen() {
  const [tab, setTab] = useState<"artigos" | "videos" | "dados">("artigos");
  const [reading, setReading] = useState<Reading | null>(null);

  if (reading) {
    return (
      <div className="flex h-full flex-col overflow-y-auto bg-[var(--background)]">
        <div className={`px-5 pb-8 pt-4 ${reading.color.split(" ")[1]}`}>
          <button
            onClick={() => setReading(null)}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-foreground/70 hover:text-foreground"
          >
            <ArrowLeft size={15} /> Voltar
          </button>
          <div className="mt-8 max-w-[320px]">
            <Eyebrow>
              {reading.category} · {reading.readTime} de leitura
            </Eyebrow>
            <h1 className="mt-3 font-display text-[1.7rem] font-semibold leading-tight tracking-tight text-foreground">
              {reading.title}
            </h1>
          </div>
        </div>
        <div className="px-5 pb-10">
          <p className="text-[15px] leading-[1.75] text-foreground/80">{reading.full}</p>
          <div className="mt-6 rounded-2xl border border-primary/15 bg-primary/[0.07] p-4">
            <p className="text-sm font-semibold text-primary">Você pode ajudar</p>
            <p className="mt-1 text-[13px] leading-relaxed text-foreground/75">
              Participe dos mutirões de plantio das ONGs parceiras na aba{" "}
              <strong>ONGs e Projetos</strong>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-[var(--background)]">
      <div className="border-b border-black/[0.06] px-4 pt-4">
        <p className="mb-1 font-display text-[13px] italic text-muted-foreground">
          Aprender para reflorestar
        </p>
        <div className="flex items-center gap-2.5">
          <BookOpen size={19} className="text-primary" strokeWidth={1.9} />
          <h1 className="text-[1.35rem] text-foreground">Educação Ambiental</h1>
        </div>
        <div className="mt-3 flex">
          {[["artigos", "Artigos"], ["videos", "Vídeos"], ["dados", "Curiosidades"]].map(([k, l]) => (
            <button
              key={k}
              onClick={() => setTab(k as typeof tab)}
              className={`flex-1 border-b-2 pb-3 text-sm transition-colors ${
                tab === k
                  ? "border-primary font-semibold text-foreground"
                  : "border-transparent font-medium text-muted-foreground"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {tab === "artigos" && (
          <div className="flex flex-col gap-2.5">
            {articles.map((a) => (
              <button key={a.id} onClick={() => setReading(a)} className="text-left">
                <Card className="flex items-start gap-3.5 px-4 py-4">
                  <div className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${a.color.split(" ")[1]}`}>
                    <a.Icon size={19} strokeWidth={1.9} className={a.color.split(" ")[0]} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-[11px] font-bold uppercase tracking-[0.1em] ${a.color.split(" ")[0]}`}>
                      {a.category}
                    </p>
                    <p className="mt-1 text-sm font-semibold leading-snug text-foreground">{a.title}</p>
                    <p className="mt-1.5 text-xs text-muted-foreground">{a.readTime} de leitura</p>
                  </div>
                </Card>
              </button>
            ))}
          </div>
        )}

        {tab === "videos" && (
          <div className="flex flex-col gap-2.5">
            {videos.map((v) => (
              <Card key={v.id} className="overflow-hidden">
                <div className="relative flex h-36 items-center justify-center bg-gradient-to-br from-secondary via-[#0E4C33] to-primary">
                  <button className="flex size-13 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur">
                    <Play size={20} className="ml-0.5" fill="currentColor" />
                  </button>
                  <span className="absolute bottom-2.5 right-3 rounded-md bg-black/40 px-1.5 py-0.5 text-[11px] font-semibold text-white/85">
                    {v.duration}
                  </span>
                </div>
                <div className="px-4 py-3">
                  <p className="text-sm font-semibold text-foreground">{v.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{v.views} visualizações</p>
                </div>
              </Card>
            ))}
          </div>
        )}

        {tab === "dados" && (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2.5">
              {facts.map((f) => (
                <Card key={f.value} className="px-4 py-4">
                  <p className="font-display text-[1.7rem] font-semibold leading-none text-primary">
                    {f.value}
                  </p>
                  <p className="mt-2 text-xs leading-snug text-muted-foreground">{f.desc}</p>
                </Card>
              ))}
            </div>
            <Card className="bg-gradient-to-br from-secondary via-[#0E4C33] to-primary p-4 text-white">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/60">
                Dica da semana
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white/90">
                Ao podar uma árvore, nunca remova mais de 30% da copa. Podas severas estressam a
                planta e a deixam vulnerável a pragas.
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}