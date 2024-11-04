import { Footer } from "../components/Footer/Footer";
import { Header } from "../components/Header/Header";
import VaultProvider from "../context/VaultContext";

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="px-24">
      <Header />
      <VaultProvider>{children}</VaultProvider>
      <Footer />
    </div>
  );
};
