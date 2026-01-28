'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function TurmasPage() {
  const [profile, setProfile] = useState<any>(null);
  const [turmas, setTurmas] = useState<any[]>([]);
  const [alunos, setAlunos] = useState<Record<string, any[]>>({});
  const [novaTurma, setNovaTurma] = useState({
    nome: '',
    ano: 8,
    turno: 'manha' as 'manha' | 'tarde' | 'noite',
    disciplina: 'matematica',
    aulas_semana: 5,
    periodo: 'bimestre' as 'bimestre' | 'trimestre',
    qtd_notas: 3
  });
  const [novoAluno, setNovoAluno] = useState({
    nome: '',
    matricula: '',
    turma_id: ''
  });
  const [importandoAlunos, setImportandoAlunos] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUser();
    carregarTurmas();
  }, []);

  const checkUser = async () => {
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
  };

  const carregarTurmas = async () => {
    setCarregando(true);
    const { data: turmasData } = await supabase
      .from('turmas')
      .select('*')
      .order('ano');

    if (turmasData) {
      setTurmas(turmasData);
      
      // Carregar alunos de cada turma
      const alunosPorTurma: Record<string, any[]> = {};
      for (const turma of turmasData) {
        const { data: alunosData } = await supabase
          .from('alunos')
          .select('*')
          .eq('turma_id', turma.id)
          .order('nome');
        
        alunosPorTurma[turma.id] = alunosData || [];
      }
      setAlunos(alunosPorTurma);
    }
    
    setCarregando(false);
  };

  const criarTurma = async () => {
    if (!novaTurma.nome.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('turmas')
      .insert([{
        ...novaTurma,
        professor_id: user.id
      }])
      .select()
      .single();

    if (error) {
      alert('Erro ao criar turma: ' + error.message);
      return;
    }

    alert('Turma criada com sucesso!');
    setNovaTurma({
      nome: '',
      ano: 8,
      turno: 'manha',
      disciplina: 'matematica',
      aulas_semana: 5,
      periodo: 'bimestre',
      qtd_notas: 3
    });
    
    carregarTurmas();
  };

  const adicionarAluno = async () => {
    if (!novoAluno.nome.trim() || !novoAluno.turma_id) return;

    // Gerar QR Code único (simplificado)
    const qrCode = `XYMATH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const { data, error } = await supabase
      .from('alunos')
      .insert([{
        nome: novoAluno.nome,
        matricula: novoAluno.matricula || null,
        turma_id: novoAluno.turma_id,
        qr_code: qrCode
      }])
      .select()
      .single();

    if (error) {
      alert('Erro ao adicionar aluno: ' + error.message);
      return;
    }

    alert('Aluno adicionado com sucesso! QR Code gerado.');
    setNovoAluno({ nome: '', matricula: '', turma_id: '' });
    
    // Recarregar alunos da turma
    const { data: alunosData } = await supabase
      .from('alunos')
      .select('*')
      .eq('turma_id', novoAluno.turma_id)
      .order('nome');
    
    setAlunos(prev => ({
      ...prev,
      [novoAluno.turma_id]: alunosData || []
    }));
  };

  const importarAlunosCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportandoAlunos(true);
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    // Formato esperado: Nome,Matrícula (opcional)
    let sucessos = 0;
    let erros = 0;

    // Precisa ter uma turma selecionada
    if (!novoAluno.turma_id && turmas.length > 0) {
      setNovoAluno(prev => ({ ...prev, turma_id: turmas[0].id }));
    }

    for (let i = 1; i < lines.length; i++) { // Pular cabeçalho
      const [nome, matricula] = lines[i].split(',').map(s => s.trim());
      
      if (nome && novoAluno.turma_id) {
        const qrCode = `XYMATH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${i}`;
        
        const { error } = await supabase
          .from('alunos')
          .insert([{
            nome,
            matricula: matricula || null,
            turma_id: novoAluno.turma_id,
            qr_code: qrCode
          }]);

        if (error) {
          console.error('Erro ao importar aluno:', error);
          erros++;
        } else {
          sucessos++;
        }
      }
    }

    setImportandoAlunos(false);
    alert(`Importação concluída: ${sucessos} sucessos, ${erros} erros.`);
    carregarTurmas();
  };

  const gerarQRCode = (qrCode: string) => {
    // Simulação - na prática usaria uma biblioteca QR
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrCode)}`;
  };

  if (carregando) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h2>Carregando gestão escolar...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Gestão Escolar</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => router.push('/dashboard')}
            style={{ padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Voltar
          </button>
        </div>
      </div>

      {/* Seção 1: Criar Nova Turma */}
      <div style={{ background: '#e8f5e9', padding: '25px', borderRadius: '8px', marginBottom: '30px' }}>
        <h2 style={{ marginTop: 0 }}>Criar Nova Turma</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
          <div>
            <label>Nome da Turma*</label>
            <input
              type="text"
              value={novaTurma.nome}
              onChange={(e) => setNovaTurma({...novaTurma, nome: e.target.value})}
              placeholder="Ex: 8º Ano A"
              style={{ width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          
          <div>
            <label>Ano/Série*</label>
            <select
              value={novaTurma.ano}
              onChange={(e) => setNovaTurma({...novaTurma, ano: parseInt(e.target.value)})}
              style={{ width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              {[6,7,8,9,1,2,3].map(ano => (
                <option key={ano} value={ano}>
                  {ano <= 9 ? `${ano}º Ano EF` : `${ano}º Ano EM`}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label>Turno*</label>
            <select
              value={novaTurma.turno}
              onChange={(e) => setNovaTurma({...novaTurma, turno: e.target.value as any})}
              style={{ width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="manha">Manhã</option>
              <option value="tarde">Tarde</option>
              <option value="noite">Noite</option>
            </select>
          </div>
          
          <div>
            <label>Período*</label>
            <select
              value={novaTurma.periodo}
              onChange={(e) => setNovaTurma({...novaTurma, periodo: e.target.value as any})}
              style={{ width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="bimestre">Bimestre</option>
              <option value="trimestre">Trimestre</option>
            </select>
          </div>
        </div>
        
        <button
          onClick={criarTurma}
          disabled={!novaTurma.nome.trim()}
          style={{ 
            padding: '12px 24px', 
            background: !novaTurma.nome.trim() ? '#ccc' : '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: !novaTurma.nome.trim() ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          Criar Turma
        </button>
      </div>

      {/* Seção 2: Lista de Turmas */}
      <div style={{ marginBottom: '40px' }}>
        <h2>Minhas Turmas ({turmas.length})</h2>
        
        {turmas.length === 0 ? (
          <div style={{ background: '#fff3cd', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
            <p>Nenhuma turma cadastrada. Crie sua primeira turma acima.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px', marginTop: '20px' }}>
            {turmas.map((turma) => (
              <div key={turma.id} style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ background: '#f8f9fa', padding: '15px', borderBottom: '1px solid #ddd' }}>
                  <h3 style={{ margin: 0 }}>{turma.nome}</h3>
                  <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
                    {turma.ano}º Ano • {turma.turno} • {turma.disciplina} • {turma.periodo}
                  </p>
                  <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>
                    <strong>Aulas/semana:</strong> {turma.aulas_semana} • 
                    <strong> Notas/{turma.periodo}:</strong> {turma.qtd_notas}
                  </p>
                </div>
                
                <div style={{ padding: '15px' }}>
                  <h4 style={{ margin: '0 0 10px 0' }}>Alunos ({alunos[turma.id]?.length || 0})</h4>
                  
                  {alunos[turma.id]?.length === 0 ? (
                    <p style={{ color: '#999', fontStyle: 'italic' }}>Nenhum aluno cadastrado</p>
                  ) : (
                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {alunos[turma.id]?.map((aluno) => (
                        <div key={aluno.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                          <div>
                            <strong>{aluno.nome}</strong>
                            {aluno.matricula && <span style={{ marginLeft: '10px', color: '#666', fontSize: '14px' }}>({aluno.matricula})</span>}
                            {aluno.tem_laudo && <span style={{ marginLeft: '10px', color: '#dc3545', fontSize: '12px' }}>⚕️ Laudo</span>}
                          </div>
                          <button
                            onClick={() => navigator.clipboard.writeText(aluno.qr_code)}
                            style={{ padding: '4px 8px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                            title="Copiar QR Code"
                          >
                            QR: {aluno.qr_code?.substring(0, 8)}...
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Formulário para adicionar aluno nesta turma */}
                  <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                      <input
                        type="text"
                        placeholder="Nome do aluno"
                        value={novoAluno.turma_id === turma.id ? novoAluno.nome : ''}
                        onChange={(e) => setNovoAluno({...novoAluno, turma_id: turma.id, nome: e.target.value})}
                        style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                      <input
                        type="text"
                        placeholder="Matrícula (opcional)"
                        value={novoAluno.turma_id === turma.id ? novoAluno.matricula : ''}
                        onChange={(e) => setNovoAluno({...novoAluno, turma_id: turma.id, matricula: e.target.value})}
                        style={{ width: '120px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                    </div>
                    <button
                      onClick={adicionarAluno}
                      disabled={!(novoAluno.turma_id === turma.id && novoAluno.nome.trim())}
                      style={{ 
                        padding: '8px 16px', 
                        background: !(novoAluno.turma_id === turma.id && novoAluno.nome.trim()) ? '#ccc' : '#17a2b8', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        cursor: !(novoAluno.turma_id === turma.id && novoAluno.nome.trim()) ? 'not-allowed' : 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Adicionar Aluno
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Seção 3: Importação em Massa */}
      <div style={{ background: '#e7f3ff', padding: '25px', borderRadius: '8px' }}>
        <h2 style={{ marginTop: 0 }}>Importação Rápida de Alunos</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div>
            <label>Selecione a turma:</label>
            <select
              value={novoAluno.turma_id}
              onChange={(e) => setNovoAluno({...novoAluno, turma_id: e.target.value})}
              style={{ padding: '10px', marginLeft: '10px', minWidth: '200px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="">Selecione uma turma</option>
              {turmas.map(turma => (
                <option key={turma.id} value={turma.id}>{turma.nome}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Importar de arquivo CSV:</strong>
              <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                Formato: Nome,Matrícula (opcional)<br/>
                Ex: João Silva,2024001
              </p>
            </label>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={importarAlunosCSV}
              disabled={!novoAluno.turma_id || importandoAlunos}
              style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }}
            />
          </div>
        </div>
        
        {importandoAlunos && (
          <div style={{ marginTop: '15px', padding: '10px', background: '#fff3cd', borderRadius: '4px' }}>
            ⏳ Importando alunos... Aguarde.
          </div>
        )}
      </div>
    </div>
  );
}
