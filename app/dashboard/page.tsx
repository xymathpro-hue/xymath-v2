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
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h2>Carregando...</h2>
      </div>
    );
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
            <div 
              style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', cursor: 'pointer' }} 
              onClick={() => router.push('/dashboard/base')}
            >
              <h3>Método BASE</h3>
              <p>Acesso completo ao sistema de diagnóstico pedagógico</p>
              <p style={{ color: '#0070f3', marginTop: '10px', fontWeight: 'bold' }}>Clique para acessar →</p>
            </div>
            
            <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
              <h3>Gestão de Professores</h3>
              <p>Visualize e gerencie todos os professores</p>
              <p style={{ color: '#666', fontSize: '14px', marginTop: '10px' }}>Em breve</p>
            </div>
            
            <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
              <h3>Relatórios Avançados</h3>
              <p>Análise completa de dados educacionais</p>
              <p style={{ color: '#666', fontSize: '14px', marginTop: '10px' }}>Em breve</p>
            </div>
            
            <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
              <h3>Configurações do Sistema</h3>
              <p>Configure períodos, notas e estruturas</p>
              <p style={{ color: '#666', fontSize: '14px', marginTop: '10px' }}>Em breve</p>
            </div>
          </div>
        </div>
      )}

      {profile?.role === 'professor' && (
        <div>
          <h2>Área do Professor</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
            <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
              <h3>Minhas Turmas</h3>
              <p>Gerencie suas turmas e alunos</p>
              <p style={{ color: '#666', fontSize: '14px', marginTop: '10px' }}>Em breve</p>
            </div>
            
            <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
              <h3>Criar Atividade</h3>
              <p>Crie atividades a partir do banco de questões</p>
              <p style={{ color: '#666', fontSize: '14px', marginTop: '10px' }}>Em breve</p>
            </div>
            
            <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
              <h3>Correção Automática</h3>
              <p>Corrija simulados com a câmera do celular</p>
              <p style={{ color: '#666', fontSize: '14px', marginTop: '10px' }}>Em breve</p>
            </div>
            
            <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
              <h3>Relatórios da Turma</h3>
              <p>Visualize desempenho e gere boletins</p>
              <p style={{ color: '#666', fontSize: '14px', marginTop: '10px' }}>Em breve</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
