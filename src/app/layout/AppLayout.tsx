import { Footer } from "../components/Footer/Footer";
import { Header } from "../components/Header/Header";

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="px-24">
      <Header />
      {children}
      <Footer />
    </div>
  );
};
