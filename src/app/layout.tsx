import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import AuthModals from '@/components/AuthModals';
import DepositSheet from '@/components/DepositSheet';
import WithdrawSheet from '@/components/WithdrawSheet';
import ReferralSheet from '@/components/ReferralSheet';
import ProfileSheet from '@/components/ProfileSheet';

export const metadata: Metadata = {
  title: 'flapcash — jogue e ganhe via PIX',
  description: 'flapcash: jogue Flappy Bird, bata a meta e saque via PIX na hora.',
  icons: {
    icon: '/imagens/asset_1.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-[#050d08] text-[#eaf5ee] antialiased min-h-screen flex flex-col font-montserrat">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <AuthModals />
          <DepositSheet />
          <WithdrawSheet />
          <ReferralSheet />
          <ProfileSheet />
        </AuthProvider>
      </body>
    </html>
  );
}
