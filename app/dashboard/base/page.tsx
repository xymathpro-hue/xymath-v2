'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function BasePage() {
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [debug, setDebug] = useState<string>('');
  const [carregando, setCarregando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    setDebug('Iniciando checkAdmin...');
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    setDebug(prev => prev + '\n1. Auth getUser: ' + (user ? 'OK' : 'Falhou'));
    
    if (userError) {
      setDebug(prev => prev + '\nErro auth: ' + userError.message);
    }
    
    if (!user) {
      setDebug(prev => prev + '\n2. Nenhum usuário, redirecionando...');
      router.push('/auth/login');
      return;
    }

    setUser(user);
    setDebug(prev => prev + '\n3. Usuário encontrado: ' + user.email);

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      setDebug(prev => prev + '\n4. Erro ao buscar perfil: ' + profileError.message);
    } else {
      setDebug(prev => prev + '\n4. Perfil encontrado: ' + JSON.stringify(profile));
    }

    setProfile(profile);
    setCarregando(false);

    if (profile?.role !== 'admin') {
      setDebug(prev => prev + '\n5. PERFIL NÃO É ADMIN! Role: ' + profile?.role);
    } else {
      setDebug(prev => prev + '\n5. Perfil é ADMIN ✓');
    }
  };

  const fixAdmin = async () => {
    if (!user) return;
    
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'admin', nome: 'Admin XYMath' })
      .eq('id', user.id);
    
    if (error) {
      setDebug(prev => prev + '\nErro ao corrigir: ' + error.message);
    } else {
      setDebug(prev => prev + '\nAdmin corrigido! Recarregue a página.');
      window.location.reload();
    }
  };

  if (carregando) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h2>Carregando Método BASE...</h2>
        <pre style={{ textAlign: 'left', background: '#f5f5f5', padding: '20px', marginTop: '20px', fontSize: '12px' }}>
          {debug}
        </pre>
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

      {/* DEBUG INFO */}
      <div style={{ background: '#fff3cd', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h3>Informações de Debug</h3>
        <pre style={{ background: '#f8f9fa', padding: '15px', borderRadius: '4px', fontSize: '12px', overflow: 'auto' }}>
          {debug}
        </pre>
        
        {profile?.role !== 'admin' && (
          <div style={{ marginTop: '20px' }}>
            <button 
              onClick={fixAdmin}
              style={{ padding: '10px 20px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Corrigir: Tornar-me Admin
            </button>
            <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
              Clique para corrigir seu perfil para administrador.
            </p>
          </div>
        )}
      </div>

      {profile?.role !== 'admin' ? (
        <div style={{ background: '#ffebee', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h2>Acesso restrito</h2>
          <p>Seu perfil atual: <strong>{profile?.role || 'não encontrado'}</strong></p>
          <p>Email: <strong>{user?.email}</strong></p>
          <p>ID: <strong>{user?.id}</strong></p>
          <p style={{ marginTop: '20px' }}>Use o botão acima para corrigir.</p>
        </div>
      ) : (
        <div style={{ background: '#e8f5e9', padding: '30px', borderRadius: '8px', textAlign: 'center' }}>
          <h2>✅ Método BASE Acessível!</h2>
          <p>Você tem acesso completo como administrador.</p>
          <p>Em breve: visualização de turmas, alunos, habilidades BNCC e relatórios.</p>
        </div>
      )}
    </div>
  );
}
