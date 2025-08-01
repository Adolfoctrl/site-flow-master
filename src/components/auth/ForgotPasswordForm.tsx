import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
});

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordFormProps {
  onBack: () => void;
}

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [userEmail, setUserEmail] = useState('');
  const { toast } = useToast();

  const form = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const resetForm = useForm({
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmitEmail = async (data: ForgotPasswordData) => {
    setIsLoading(true);
    
    // Simular delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Verificar se o email existe
    const users = JSON.parse(localStorage.getItem('tecnobra_users') || '[]');
    const userExists = users.find((u: any) => u.email === data.email);
    
    if (!userExists) {
      toast({
        variant: "destructive",
        title: "Email não encontrado",
        description: "Este email não está cadastrado no sistema.",
      });
      setIsLoading(false);
      return;
    }
    
    setUserEmail(data.email);
    setStep('reset');
    setIsLoading(false);
    
    toast({
      title: "Email encontrado!",
      description: "Agora você pode redefinir sua senha.",
    });
  };

  const onSubmitReset = async (data: any) => {
    if (data.newPassword !== data.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Senhas não coincidem",
        description: "As senhas digitadas não são iguais.",
      });
      return;
    }

    if (data.newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
      });
      return;
    }

    setIsLoading(true);
    
    // Simular delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Atualizar a senha do usuário
    const users = JSON.parse(localStorage.getItem('tecnobra_users') || '[]');
    const updatedUsers = users.map((u: any) => 
      u.email === userEmail 
        ? { ...u, password: data.newPassword }
        : u
    );
    
    localStorage.setItem('tecnobra_users', JSON.stringify(updatedUsers));
    
    setIsLoading(false);
    
    toast({
      title: "Senha alterada!",
      description: "Sua senha foi redefinida com sucesso. Faça login com a nova senha.",
    });
    
    onBack();
  };

  if (step === 'reset') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Redefinir Senha</CardTitle>
          <CardDescription>
            Digite sua nova senha para o email: {userEmail}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={resetForm.handleSubmit(onSubmitReset)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium">
                Nova Senha
              </label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Digite sua nova senha"
                {...resetForm.register("newPassword")}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirmar Senha
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirme sua nova senha"
                {...resetForm.register("confirmPassword")}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Alterando..." : "Alterar Senha"}
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={onBack}>
                Voltar para Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Esqueceu a Senha?</CardTitle>
        <CardDescription>
          Digite seu email para redefinir sua senha
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitEmail)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite seu email"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-2">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Verificando..." : "Continuar"}
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={onBack}>
                Voltar para Login
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}