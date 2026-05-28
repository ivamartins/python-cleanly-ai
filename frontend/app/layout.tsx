export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">
      <head>
        <title>Cleanly • Removedor de Objetos com IA</title>
        <meta name="description" content="Edição e restauração de fotos com IA local: remova marcas d'água, objetos indesejados e restaure fotos antigas." />
      </head>
      <body>{children}</body>
    </html>
  );
}
