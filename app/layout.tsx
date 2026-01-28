export const metadata = {
  title: 'XYMath - Plataforma Educacional',
  description: 'Sistema para professores de matemática',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, fontFamily: 'Arial, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
