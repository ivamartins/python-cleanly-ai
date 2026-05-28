export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">
      <head>
        <title>Cleanly • Removedor de Objetos com IA</title>
        <meta name="description" content="Local AI-powered watermark removal tool using LaMa. Clean, professional, and fully offline." />
      </head>
      <body>{children}</body>
    </html>
  );
}
