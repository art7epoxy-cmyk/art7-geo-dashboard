import { drizzle } from "drizzle-orm/mysql2";
import { listingPortals } from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

const portals = [
  { priority: 1, name: "Google Business Profile", description: "Prioridade máxima para SEO local. O perfil é gratuito e a verificação pode variar entre vídeo, e-mail, correio, ligação ou SMS conforme o caso.", category: "Mapas / busca local", isPaid: "Não", paidPlanInfo: "N/A", smsVerification: "Pode solicitar", portalUrl: "https://business.google.com/" },
  { priority: 2, name: "Apple Business Connect", description: "Cadastro gratuito. A verificação da empresa pode exigir documentos e validação interna da Apple.", category: "Mapas / ecossistema Apple", isPaid: "Não", paidPlanInfo: "N/A", smsVerification: "Não identificado", portalUrl: "https://businessconnect.apple.com/" },
  { priority: 3, name: "Bing Places for Business", description: "Gratuito e útil como segunda camada de presença em busca e mapas.", category: "Mapas / busca local", isPaid: "Não", paidPlanInfo: "N/A", smsVerification: "Não identificado", portalUrl: "https://www.bingplaces.com/" },
  { priority: 4, name: "Yelp Business Page", description: "Página empresarial gratuita. O claim pode usar código por e-mail, SMS ou ligação em alguns fluxos.", category: "Avaliações / home services", isPaid: "Não", paidPlanInfo: "N/A para listing; anúncios sob consulta", smsVerification: "Pode solicitar", portalUrl: "https://biz.yelp.com/" },
  { priority: 5, name: "Nextdoor Business Page", description: "Business Page gratuita. Alguns casos podem exigir documentos antes de postar como negócio.", category: "Comunidade local / reputação", isPaid: "Não", paidPlanInfo: "N/A para página; anúncios sob consulta", smsVerification: "Não identificado", portalUrl: "https://business.nextdoor.com/" },
  { priority: 6, name: "Facebook Business Page", description: "A página é gratuita; autenticações adicionais podem aparecer na conta Meta por segurança.", category: "Rede social / presença local", isPaid: "Não", paidPlanInfo: "N/A para página; anúncios com orçamento livre", smsVerification: "Pode solicitar", portalUrl: "https://www.facebook.com/business/" },
  { priority: 7, name: "LinkedIn Company Page", description: "Útil para credibilidade corporativa, parcerias e recrutamento. Página básica gratuita.", category: "Rede profissional", isPaid: "Não", paidPlanInfo: "N/A para página; anúncios com orçamento livre", smsVerification: "Pode solicitar", portalUrl: "https://www.linkedin.com/company/setup/new/" },
  { priority: 8, name: "BBB Business Profile / Accreditation", description: "O BBB mantém perfis públicos; a Accreditation é paga e pode haver contato por telefone ou e-mail após solicitação.", category: "Confiança / diretório institucional", isPaid: "Opcional", paidPlanInfo: "Accreditation anual sob consulta do bureau local", smsVerification: "Não identificado", portalUrl: "https://www.bbb.org/" },
  { priority: 9, name: "Yellow Pages", description: "Diretório tradicional ainda útil para citações locais e consistência NAP.", category: "Diretório geral", isPaid: "Opcional", paidPlanInfo: "Planos comerciais sob consulta", smsVerification: "Não identificado", portalUrl: "https://www.yellowpages.com/" },
  { priority: 10, name: "ChamberofCommerce.com", description: "Diretório forte para presença empresarial geral; vale checar claim manual do listing.", category: "Diretório empresarial", isPaid: "Não identificado", paidPlanInfo: "Não identificado publicamente", smsVerification: "Não identificado", portalUrl: "https://www.chamberofcommerce.com/" },
  { priority: 11, name: "Manta", description: "Bom para citações e autoridade local. Costuma oferecer listing básico e upsells de marketing.", category: "Diretório empresarial", isPaid: "Opcional", paidPlanInfo: "Serviços pagos sob consulta", smsVerification: "Não identificado", portalUrl: "https://www.manta.com/" },
  { priority: 12, name: "MerchantCircle", description: "Útil para citações adicionais. Relevância menor que Google, Apple, Bing e Yelp, mas ainda válida.", category: "Diretório empresarial", isPaid: "Opcional", paidPlanInfo: "Serviços pagos sob consulta", smsVerification: "Não identificado", portalUrl: "https://www.merchantcircle.com/" },
  { priority: 13, name: "OpenStreetMap", description: "Dados cartográficos reaproveitados por vários serviços e aplicativos.", category: "Mapas abertos / dados", isPaid: "Não", paidPlanInfo: "N/A", smsVerification: "Não", portalUrl: "https://www.openstreetmap.org/" },
  { priority: 14, name: "TomTom MapShare", description: "Importante para navegação e correções de mapa; bom para consistência de localização.", category: "Mapas / navegação", isPaid: "Não", paidPlanInfo: "N/A", smsVerification: "Não identificado", portalUrl: "https://www.tomtom.com/mapshare/" },
  { priority: 15, name: "HERE Map Creator", description: "Base cartográfica usada em apps e soluções automotivas; melhora presença em ecossistemas menos óbvios.", category: "Mapas / navegação", isPaid: "Não", paidPlanInfo: "N/A", smsVerification: "Não identificado", portalUrl: "https://mapcreator.here.com/" },
  { priority: 16, name: "ContractorHub", description: "A página informa explicitamente que o listing é gratuito. O formulário pede telefone, mas não mostrou 2FA obrigatório.", category: "Contractors / diretório nichado", isPaid: "Não", paidPlanInfo: "N/A", smsVerification: "Não", portalUrl: "https://www.contractorhub.com/" },
  { priority: 17, name: "Houzz", description: "Muito relevante para serviços de casa e reformas. Vale pelo portfólio visual e provas sociais.", category: "Home improvement / portfólio", isPaid: "Opcional", paidPlanInfo: "Teste grátis 30 dias; valor-base público não ficou visível na página oficial consultada", smsVerification: "Não identificado", portalUrl: "https://www.houzz.com/professionals/" },
  { priority: 18, name: "Angi", description: "Alto potencial de geração de leads para serviços residenciais. Normalmente envolve modelo comercial adicional.", category: "Home services / leads", isPaid: "Opcional", paidPlanInfo: "Modelo comercial sob consulta / leads", smsVerification: "Não identificado", portalUrl: "https://www.angi.com/" },
  { priority: 19, name: "HomeAdvisor", description: "Forte no mercado de contratação residencial, mas tipicamente opera com custos comerciais e leads pagos.", category: "Home services / leads", isPaid: "Sim", paidPlanInfo: "Preço sob consulta / taxa e leads variáveis", smsVerification: "Não identificado", portalUrl: "https://www.homeadvisor.com/" },
  { priority: 20, name: "Porch", description: "Canal complementar para leads e visibilidade em serviços residenciais.", category: "Home services / parceiros", isPaid: "Opcional", paidPlanInfo: "Preço sob consulta", smsVerification: "Não identificado", portalUrl: "https://porch.com/" },
  { priority: 21, name: "Thumbtack", description: "Entrada geralmente sem mensalidade; custo aparece conforme leads, contatos ou promoções escolhidas.", category: "Marketplace de serviços", isPaid: "Opcional", paidPlanInfo: "Sem mensalidade fixa; cobrança variável por lead/contato", smsVerification: "Não identificado", portalUrl: "https://www.thumbtack.com/" },
  { priority: 22, name: "Bark", description: "Cadastro de entrada gratuito; você só paga quando decide responder ao lead usando créditos.", category: "Marketplace de serviços", isPaid: "Opcional", paidPlanInfo: "Sem mensalidade fixa; créditos variáveis por contato", smsVerification: "Não identificado", portalUrl: "https://www.bark.com/" },
  { priority: 23, name: "Epoxy Directory", description: "Diretório nichado do segmento epóxi; potencialmente útil pela aderência exata ao serviço.", category: "Nicho epóxi / diretório especializado", isPaid: "Não identificado", paidPlanInfo: "Não identificado publicamente", smsVerification: "Não identificado", portalUrl: "https://www.epoxydirectory.com/" },
  { priority: 24, name: "Greater Lowell Chamber Directory", description: "Muito relevante para networking e reputação local em Lowell. Normalmente depende de associação local.", category: "Diretório local / networking", isPaid: "Opcional", paidPlanInfo: "Membro do chamber; valor sob consulta", smsVerification: "Não identificado", portalUrl: "https://www.greaterlowellchamber.org/" },
  { priority: 25, name: "LowellBusiness.com", description: "Diretório local de Lowell com cadastro gratuito. Útil para SEO local e descoberta em Lowell, MA.", category: "Diretório local", isPaid: "Não", paidPlanInfo: "N/A", smsVerification: "Não identificado", portalUrl: "https://www.lowellbusiness.com/" },
  { priority: 26, name: "Lowell Sun", description: "Jornal local de Lowell, MA. Publicidade em jornal impresso e online. Contato: 978-970-4648 (Business).", category: "Jornal local / publicidade", isPaid: "Sim", paidPlanInfo: "Publicidade sob consulta", smsVerification: "Não identificado", portalUrl: "https://www.lowellsun.com/" },
  { priority: 27, name: "Boston Business Journal", description: "Revista de negócios regional cobrindo Boston e região. Publicidade e visibilidade em negócios.", category: "Revista de negócios regional", isPaid: "Sim", paidPlanInfo: "Publicidade sob consulta", smsVerification: "Não identificado", portalUrl: "https://www.bizjournals.com/boston/" },
  { priority: 28, name: "Worcester Business Journal", description: "Revista de negócios para Central Massachusetts. Publicidade e networking para empresas regionais.", category: "Revista de negócios regional", isPaid: "Sim", paidPlanInfo: "Publicidade sob consulta", smsVerification: "Não identificado", portalUrl: "https://www.wbjournal.com/" },
  { priority: 29, name: "Providence Business News", description: "Revista de negócios para Rhode Island e SE Massachusetts. Cobertura regional e publicidade.", category: "Revista de negócios regional", isPaid: "Sim", paidPlanInfo: "Publicidade sob consulta", smsVerification: "Não identificado", portalUrl: "https://www.pbn.com/" },
  { priority: 30, name: "Procore Network", description: "Diretório nacional de contractors e profissionais de construção. Cadastro gratuito.", category: "Diretório nacional de contractors", isPaid: "Não", paidPlanInfo: "N/A", smsVerification: "Não identificado", portalUrl: "https://www.procore.com/" },
  { priority: 31, name: "ConWize", description: "Diretório nacional de builders, specialty contractors e suppliers. Cadastro gratuito.", category: "Diretório nacional de contractors", isPaid: "Não", paidPlanInfo: "N/A", smsVerification: "Não identificado", portalUrl: "https://www.conwize.com/" },
  { priority: 32, name: "Shovels.ai", description: "Diretório nacional com dados de permits e histórico de construção. Cadastro gratuito.", category: "Diretório nacional de contractors", isPaid: "Não", paidPlanInfo: "N/A", smsVerification: "Não identificado", portalUrl: "https://www.shovels.ai/" },
  { priority: 33, name: "CityLocal Pro", description: "Diretório gratuito de negócios locais com cobertura nacional. Foco em autenticidade e reviews.", category: "Diretório nacional", isPaid: "Não", paidPlanInfo: "N/A", smsVerification: "Não identificado", portalUrl: "https://www.citylocalpro.com/" },
  { priority: 34, name: "Thumbtack (App Mobile)", description: "Aplicativo mobile popular para home services. Modelo de leads pagos. Disponível em iOS e Android.", category: "Aplicativo mobile / marketplace", isPaid: "Opcional", paidPlanInfo: "Sem mensalidade; leads com custo variável", smsVerification: "Não identificado", portalUrl: "https://www.thumbtack.com/app/" },
  { priority: 35, name: "Houzz (App Mobile)", description: "App mobile de design e reforma. Portfólio visual importante. Disponível em iOS e Android.", category: "Aplicativo mobile / home improvement", isPaid: "Opcional", paidPlanInfo: "Teste grátis 30 dias; planos pagos sob consulta", smsVerification: "Não identificado", portalUrl: "https://www.houzz.com/mobile/" },
  { priority: 36, name: "Contractors Directory (App)", description: "App de diretório de contractors. Foco em encontrar profissionais locais. Disponível em iOS.", category: "Aplicativo mobile / diretório", isPaid: "Não", paidPlanInfo: "N/A", smsVerification: "Não identificado", portalUrl: "https://apps.apple.com/" },
  { priority: 37, name: "Live Contractor Locator", description: "Localizador de contractors com app mobile. Encontrar profissionais por proximidade.", category: "Aplicativo mobile / localizador", isPaid: "Não", paidPlanInfo: "N/A", smsVerification: "Não identificado", portalUrl: "https://apps.apple.com/" },
];

async function seed() {
  console.log("Seeding 37 listing portals...");
  
  // Check if data already exists
  const existing = await db.select().from(listingPortals);
  if (existing.length > 0) {
    console.log(`Already have ${existing.length} portals. Skipping seed.`);
    process.exit(0);
  }

  for (const portal of portals) {
    await db.insert(listingPortals).values(portal);
  }
  
  console.log("Done! Seeded 37 listing portals.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
