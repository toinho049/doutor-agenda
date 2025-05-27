export { Button } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">
        Bem-Vindo Mateus Scopel D ambros
      </h1>
      <Button>cliqueaqui</Button>
      <p className="text-lg text-gray-700">sistema em desenvolvimento.</p>
    </div>
  );
}
