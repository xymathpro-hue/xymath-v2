'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function BasePage() {
  const [profile, setProfile] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    setProfile(profile);
    setCarregando(false);

    if (profile?.role !== 'admin') {
      router.push('/dashboard');
    }
  };

  if (carregando) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h2>Carregando Método BASE...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Método BASE - Diagnóstico Pedagógico</h1>
        <button 
          onClick={() => router.push('/dashboard')}
          style={{ padding: '8px 16px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Voltar ao Dashboard
        </button>
      </div>

      {profile?.role !== 'admin' ? (
        <div style={{ background: '#ffebee', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h2>Acesso restrito</h2>
          <p>Somente administradores podem acessar o Método BASE.</p>
        </div>
      ) : (
        <div style={{ background: '#e8f5e9', padding: '30px', borderRadius: '8px', textAlign: 'center' }}>
          <h2>Método BASE Funcional!</h2>
          <p>Esta é a área exclusiva do administrador para diagnóstico pedagógico.</p>
          <p>Em breve: visualização de turmas, alunos, habilidades BNCC e relatórios.</p>
          
          <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
            <button style={{ padding: '10px 20px', background: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Ver Turmas
            </button>
            <button style={{ padding: '10px 20px', background: '#2196f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Ver Habilidades BNCC
            </button>
            <button style={{ padding: '10px 20px', background: '#ff9800', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Gerar Relatórios
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
