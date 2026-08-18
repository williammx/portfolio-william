# Setup da Cloudflare — passo a passo

Rode tudo no **PowerShell**, dentro de `C:\Users\willi\Projetos\portfolio-william`.

Os passos 1, 2 e 6 só você pode fazer — envolvem login e permissão de conta,
e eu não mexo com credenciais. Os outros eu posso rodar por você.

---

## 1. Entrar na sua conta

```powershell
npm run cf:login
```

Abre o navegador para autorizar. Confirme com:

```powershell
npm run cf:whoami
```

> Seu token anterior expirou — por isso o login é o primeiro passo.

---

## 2. Criar o banco (D1)

```powershell
npm run cf:d1:create
```

A saída vai terminar com algo assim:

```
[[d1_databases]]
binding = "DB"
database_name = "portfolio-db"
database_id = "a1b2c3d4-...."
```

**Copie o `database_id`** e cole no `wrangler.jsonc`, no lugar de
`"PREENCHER_APOS_CRIAR"`. (Me avise que eu colo para você.)

---

## 3. Criar o bucket de imagens (R2)

```powershell
npm run cf:r2:create
```

> Se aparecer aviso pedindo para ativar o R2, entre em
> **dash.cloudflare.com → R2** e clique em ativar. É gratuito
> até 10 GB e não cobra saída de dados.

---

## 4. Aplicar o schema no banco

```powershell
npm run cf:d1:schema
npm run cf:d1:projects   # carrega as 29 marcas reais com textos e imagens
```

> `npm run cf:d1:seed` existe só como alternativa com 6 projetos genéricos.
> Se já rodou o `cf:d1:projects`, ignore.

---

## 5. Publicar

```powershell
npm run deploy
```

No fim ele mostra a URL, algo como
`https://portfolio-william.SEU-SUBDOMINIO.workers.dev`.

---

## 6. Proteger o `/admin` com Cloudflare Access

Sem isso, **qualquer pessoa consegue abrir o painel e editar seus projetos**.
O código já bloqueia por padrão (retorna 503 até o Access estar configurado),
mas configure antes de divulgar o site.

### 6.1 Criar a aplicação

1. Vá em **dash.cloudflare.com → Zero Trust → Access → Applications**
2. **Add an application → Self-hosted**
3. Preencha:
   - **Application name:** `CMS Portfólio`
   - **Session duration:** 24 horas
   - **Domain:** o domínio do seu Worker
   - **Path:** `admin`
4. Em **Policies**, crie uma política:
   - **Name:** `Só eu`
   - **Action:** Allow
   - **Include → Emails →** seu e-mail
5. Salve.

### 6.2 Pegar os dois valores

Ainda na aplicação criada, na aba **Overview**:

- **Application Audience (AUD) Tag** — uma sequência longa de letras e números
- **Team domain** — em **Zero Trust → Settings → Custom Pages**, algo como
  `suaequipe.cloudflareaccess.com`

### 6.3 Registrar no Worker

```powershell
npx wrangler secret put ACCESS_TEAM_DOMAIN
# cole: suaequipe.cloudflareaccess.com

npx wrangler secret put ACCESS_AUD
# cole: o AUD tag
```

> Esses comandos pedem o valor no terminal e **não gravam nada em arquivo** —
> eu não vejo nem tenho acesso a eles.

### 6.4 Republicar

```powershell
npm run deploy
```

Pronto: `/admin` passa a pedir seu e-mail e um código antes de abrir.

---

## Uso no dia a dia

| O que fazer | Comando |
|---|---|
| Testar local (com banco local) | `npm run dev` |
| Publicar uma vez | `npm run deploy` |
| Publicar sozinho a cada arquivo salvo | `npm run watch` |
| Ver os logs em tempo real | `npm run cf:tail` |
| Gerar os frames do vídeo | `npm run frames -- media/seu-video.mp4` |

### Modo local

```powershell
npm run dev
```

Abre em `http://localhost:8787`. Nesse modo o banco é uma cópia local
(`.wrangler/state`) e o `/admin` abre **sem Access** — é só na sua máquina.
Se for a primeira vez, rode antes:

```powershell
npm run cf:d1:schema:local
npm run cf:d1:projects:local
```

> Isso já está feito — o banco local está com as 29 marcas carregadas.

---

## Domínio próprio

Quando quiser sair do `.workers.dev`:

1. Adicione o domínio na Cloudflare (**Websites → Add a site**)
2. No `wrangler.jsonc`, acrescente:

```jsonc
"routes": [
  { "pattern": "seudominio.com.br", "custom_domain": true }
]
```

3. `npm run deploy`
4. Volte no Access e troque o **Domain** da aplicação para o novo domínio

---

## Custos

Com o uso típico de um portfólio, tudo cabe no plano gratuito:

| Serviço | Grátis por mês | Uso esperado |
|---|---|---|
| Workers | 100 mil requisições/dia | bem abaixo |
| D1 | 5 GB + 5 milhões de leituras/dia | alguns KB |
| R2 | 10 GB + saída ilimitada | dezenas de MB |
| Access | 50 usuários | 1 |
