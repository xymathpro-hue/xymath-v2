'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/auth/login');
      return;
    }

    setUser(user);

    // Buscar perfil do usuário
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    setProfile(profile);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Dashboard XYMath</h1>
        <button 
          onClick={handleLogout}
          style={{ padding: '8px 16px', background: '#ff4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Sair
        </button>
      </div>

      {profile && (
        <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
          <h2>Perfil</h2>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Nome:</strong> {profile.nome || 'Não informado'}</p>
          <p><strong>Função:</strong> <span style={{ 
            color: profile.role === 'admin' ? 'green' : 'blue',
            fontWeight: 'bold'
          }}>{profile.role === 'admin' ? 'Administrador' : 'Professor'}</span></p>
        </div>
      )}

      {profile?.role === 'admin' && (
        <div>
          <h2>Área do Administrador</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
            <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
              <h3>Método BASE</h3>
              <p>Acesso completo ao sistema de diagnóstico pedagógico</p>
            </div>
            
            <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
              <h3>Gestão de Professores</h3>
              <p>Visualize e gerencie todos os professores</p>
            </div>
            
            <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
              <h3>Relatórios Avançados</h3>
              <p>Análise completa de dados educacionais</p>
            </div>
            
            <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
              <h3>Configurações do Sistema</h3>
              <p>Configure períodos, notas e estruturas</p>
            </div>
          </div>
        </div>
      )}

      {profile?.role === 'professor' && (
        <div>
          <h2>Área do Professor</h2>
          <p>Em breve: suas turmas, atividades e simulados</p>
        </div>
      )}
    </div>
  );
}
