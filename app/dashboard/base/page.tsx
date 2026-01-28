'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function BasePage() {
  const [profile, setProfile] = useState<any>(null);
  const [turmas, setTurmas] = useState<any[]>([]);
  const [alunos, setAlunos] = useState<any[]>([]);
  const [habilidades, setHabilidades] = useState<any[]>([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState<string>('');
  const [carregando, setCarregando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAdmin();
    carregarDados();
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

    if (profile?.role !== 'admin') {
      router.push('/dashboard');
    }
  };

  const carregarDados = async () => {
    setCarregando(true);
    
    // Carregar turmas
    const { data: turmasData } = await supabase
      .from('turmas')
      .select('*');
    
    // Carregar habilidades BNCC
    const { data: habilidadesData } = await supabase
      .from('habilidades_bncc')
      .select('*')
      .order('codigo');

    setTurmas(turmasData || []);
    setHabilidades(habilidadesData || []);
    
    if (turmasData && turmasData.length > 0) {
      setTurmaSelecionada(turmasData[0].id);
      carregarAlunos(turmasData[0].id);
    }

    setCarregando(false);
  };

  const carregarAlunos = async (turmaId: string) => {
    const { data: alunosData } = await supabase
      .from('alunos')
      .select('*')
      .eq('turma_id', turmaId)
      .order('nome');

    setAlunos(alunosData || []);
  };

  const handleTurmaChange = (turmaId: string) => {
    setTurmaSelecionada(turmaId);
    carregarAlunos(turmaId);
  };

  const calcularClassificacao = (acertos: number, total: number) => {
    const percentual = (acertos / total) * 100;
    if (percentual < 50) return { classe: 'vermelho', texto: '❌ Não consolidado' };
    if (percentual < 80) return { classe: 'amarelo', texto: '🟡 Em desenvolvimento' };
    return { classe: 'verde', texto: '✅ Consolidado' };
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
        <>
          {/* Seletor de Turma */}
          <div style={{ marginBottom: '30px', background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
            <h2>Selecionar Turma</h2>
            <select 
              value={turmaSelecionada}
              onChange={(e) => handleTurmaChange(e.target.value)}
              style={{ padding: '10px', width: '300px', marginTop: '10px' }}
            >
              {turmas.map((turma) => (
                <option key={turma.id} value={turma.id}>
                  {turma.nome} - {turma.ano}º Ano ({turma.turno})
                </option>
              ))}
            </select>
            
            {turmaSelecionada && (
              <div style={{ marginTop: '20px' }}>
                <p><strong>Turma selecionada:</strong> {turmas.find(t => t.id === turmaSelecionada)?.nome}</p>
                <p><strong>Total de alunos:</strong> {alunos.length}</p>
              </div>
            )}
          </div>

          {/* Lista de Alunos */}
          <div style={{ marginBottom: '40px' }}>
            <h2>Alunos da Turma</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
              {alunos.map((aluno) => (
                <div key={aluno.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
                  <h3>{aluno.nome}</h3>
                  <p><strong>Matrícula:</strong> {aluno.matricula || 'Não informada'}</p>
                  {aluno.tem_laudo && (
                    <p style={{ color: '#d32f2f' }}><strong>⚠️ Tem laudo:</strong> {aluno.tipo_laudo || 'Não especificado'}</p>
                  )}
                  <button 
                    onClick={() => router.push(`/dashboard/base/aluno/${aluno.id}`)}
                    style={{ marginTop: '10px', padding: '8px 16px', background: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Ver diagnóstico completo
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Habilidades BNCC */}
          <div style={{ marginBottom: '40px' }}>
            <h2>Habilidades BNCC Monitoradas</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '15px', marginTop: '20px' }}>
              {habilidades.map((habilidade) => {
                const classificacao = calcularClassificacao(0, 10);
                
                return (
                  <div key={habilidade.id} style={{ 
                    border: '1px solid #ddd', 
                    padding: '15px', 
                    borderRadius: '8px',
                    background: classificacao.classe === 'vermelho' ? '#ffebee' : 
                               classificacao.classe === 'amarelo' ? '#fff8e1' : '#e8f5e9'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ margin: '0 0 5px 0' }}>{habilidade.codigo}</h4>
                        <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>{habilidade.descricao}</p>
                      </div>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: classificacao.classe === 'vermelho' ? '#d32f2f' : 
                               classificacao.classe === 'amarelo' ? '#f57c00' : '#388e3c'
                      }}>
                        {classificacao.texto}
                      </span>
                    </div>
                    
                    <div style={{ marginTop: '15px', fontSize: '14px' }}>
                      <p><strong>Ano:</strong> {habilidade.ano?.join(', ')}</p>
                      <p><strong>Eixo:</strong> {habilidade.eixo}</p>
                      <p><strong>Nível esperado:</strong> {habilidade.nivel}</p>
                    </div>

                    <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                      <button style={{ padding: '6px 12px', background: '#2196f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}>
                        Criar diagnóstico
                      </button>
                      <button style={{ padding: '6px 12px', background: '#ff9800', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}>
                        Ver relatório
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ações Rápidas */}
          <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '8px' }}>
            <h2>Ações do Método BASE</h2>
            <div style={{ display: 'flex', gap: '15px', marginTop: '15px', flexWrap: 'wrap' }}>
              <button style={{ padding: '10px 20px', background: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Gerar diagnóstico inicial
              </button>
              <button style={{ padding: '10px 20px', background: '#2196f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Analisar evolução da turma
              </button>
              <button style={{ padding: '10px 20px', background: '#ff9800', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Gerar relatório de habilidades críticas
              </button>
              <button style={{ padding: '10px 20px', background: '#9c27b0', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Sugerir plano de intervenção
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
