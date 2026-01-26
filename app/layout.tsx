export const metadata = {
  title: 'パブリックコンテンツAPI',
  description: '記事やリポジトリなどの公開されたコンテンツを提供するAPI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}

