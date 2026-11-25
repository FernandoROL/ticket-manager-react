# Support ticket manager

Aplicação React para cadastrar clientes, abrir e editar chamados e consultar o painel de atendimento. Usa Firebase Authentication para o login e Cloud Firestore para os clientes, chamados e perfis.

## Configuração

1. No console do Firebase, registre um app Web, ative **Authentication → Método de login → E-mail/senha** e crie o banco padrão do Cloud Firestore.
2. Copie `.env.example` para `.env.local` e preencha os campos com a configuração do app Web. Projetos existentes que usam a grafia antiga `VITE_FIREBASE_ATUH_DOMAIN` continuam compatíveis.
3. No projeto Firebase **dedicado a este app**, publique as regras e o índice incluídos no repositório com a Firebase CLI. Substitua `SEU_PROJECT_ID` pelo mesmo valor de `VITE_FIREBASE_PROJECT_ID`. Se o Firestore já atende outros apps, integre os blocos de regras e índices à configuração existente antes de publicar. Remova permissões genéricas que também concedam acesso a estas coleções.

   ```sh
   firebase login
   firebase deploy --only firestore:rules,firestore:indexes --project SEU_PROJECT_ID
   ```

   Aguarde o índice de `tickets` ficar pronto no console. As regras permitem que cada conta acesse seu próprio perfil por UID e apenas os clientes e chamados que possuem seu `userId`. O cadastro de um chamado exige que o cliente selecionado também pertença à conta.

4. Instale as dependências e inicie o servidor local.

   ```sh
   npm ci
   npm run dev
   ```

Para gerar a versão de produção, execute `npm run build`.

## Contas e registros existentes

- Se o Authentication aceita a senha, mas a tela mostra `permission-denied`, confira se as regras foram publicadas no mesmo projeto configurado no app. O login usa Authentication e a leitura seguinte usa o documento `users/{uid}` no Firestore. Um perfil ausente usa o e-mail como nome provisório até ser salvo em **Profile**.
- Clientes antigos não tinham `userId`. Pelo console administrativo, confirme o responsável e atribua seu UID (string) ao documento em `customers`. Chamados antigos já podem ter `userId`, mas a versão anterior o substituía pelo UID de quem editava o chamado. Confira a propriedade antes da atualização. Registros sem dono confirmado ficam fora das consultas.
- Para um cliente antes compartilhado entre contas, mantenha um documento separado por proprietário e ajuste `clientId` nos chamados correspondentes. Revise também o nome salvo em `client`. Faça backup antes de alterar dados existentes.

## Fotos de perfil no plano Spark

O Cloud Storage passou a exigir o plano Blaze. Nesta versão, a foto é redimensionada no navegador para até 256 × 256 pixels e salva no campo `avatarUrl` de `users/{uid}`. O app aceita JPEG e PNG de até 10 MiB e limita a imagem codificada a 128 KiB. Basta configurar Authentication e Firestore, dentro das cotas do seu projeto. [Mudança de cobrança do Cloud Storage](https://firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024?hl=pt-br)

Links antigos continuam sendo exibidos enquanto estiverem acessíveis. Se o bucket antigo estiver bloqueado, o app exibe a foto padrão. Para substituir a foto, escolha uma imagem em **Profile** e clique em **Submit**. Alterar apenas o nome preserva a foto existente. Se suas regras personalizadas validam o formato de `avatarUrl`, permita também o prefixo `data:image/jpeg;base64,` e o limite de 131072 caracteres para a foto do próprio usuário.

## Teste de isolamento

Com a Firebase CLI e o Java instalados, execute o teste contra os emuladores locais de Authentication e Firestore.

```sh
firebase emulators:exec --project demo-ticket --only auth,firestore "node --test tests/firestore-rules.test.mjs"
```
