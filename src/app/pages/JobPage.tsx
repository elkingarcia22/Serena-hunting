import React, { useState } from 'react';
import { JobView } from '../components/JobView';
import { CandidateDetailDrawer } from '../components/CandidateDetailDrawer';
import { Drawer } from '../components/ui/drawer';
import { DrawerNavigation } from '../components/DrawerNavigation';
import { candidatesData } from '../data/candidatesData';

// Configuración de etapas del proceso (8 etapas del proceso + etapa final)
const stages = [
  { id: 'screening-talent', name: 'Screening Talent', order: 1 },
  { id: 'evaluacion-cv', name: 'Evaluación CV', order: 2 },
  { id: 'evaluacion-serena', name: 'Serena AI', order: 3 },
  { id: 'evaluacion-psicometrica', name: 'Test Psicométrico', order: 4 },
  { id: 'entrevista-tecnica', name: 'Entrevista Técnica', order: 5 },
  { id: 'entrevista-pm', name: 'Entrevista Product Manager', order: 6 },
  { id: 'entrevista-hiring', name: 'Entrevista Hiring Manager', order: 7 },
  { id: 'antecedentes', name: 'Verificación Antecedentes', order: 8 },
  { id: 'seleccionado', name: 'Seleccionado', order: 9 }
];

export function JobPage() {
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

  // Estado global de candidatos para esta página
  const [candidatesList, setCandidatesList] = useState<any[]>(
    candidatesData.map((c, idx) => {
      let status: 'active' | 'hired' | 'rejected' | 'action_required' = 'active';
      if (idx % 5 === 0) status = 'hired';
      else if (idx % 5 === 1) status = 'rejected';
      else if (idx % 5 === 2) status = 'action_required';
      else status = 'active';
      
      return {
        ...c,
        origin: idx % 3 === 0 ? 'Importado por CV' : (idx % 3 === 1 ? 'Serena IA' : 'Vacante'),
        stage: stages.find(s => s.id === (c.applications?.[0]?.currentStage || 'sourcing'))?.name || 'Sourcing',
        status: status,
        identification: `1.0${idx}4.56${idx}.789`,
        phone: `+57 31${idx} 456 7890`
      };
    })
  );

  // Lista de candidatos activos ordenados (usando la lista enriquecida)
  const activeCandidates = candidatesList.filter(c => 
    c.applications?.some((app: any) => app.status === 'active' || app.status === 'hired')
  );
  
  // Encontrar el índice actual del candidato seleccionado
  const currentCandidateIndex = activeCandidates.findIndex(c => c.id === selectedCandidateId);
  const currentIndex = currentCandidateIndex >= 0 ? currentCandidateIndex + 1 : 1;
  const totalCandidates = activeCandidates.length;

  const handleCandidateClick = (candidateId: string) => {
    setSelectedCandidateId(candidateId);
  };

  const handleCloseDrawer = () => {
    setSelectedCandidateId(null);
  };

  const handlePrevious = () => {
    if (currentCandidateIndex > 0) {
      const previousCandidate = activeCandidates[currentCandidateIndex - 1];
      setSelectedCandidateId(previousCandidate.id);
    }
  };

  const handleNext = () => {
    if (currentCandidateIndex < activeCandidates.length - 1) {
      const nextCandidate = activeCandidates[currentCandidateIndex + 1];
      setSelectedCandidateId(nextCandidate.id);
    }
  };

  return (
    <>
      <JobView 
        onCandidateClick={handleCandidateClick} 
        candidatesList={candidatesList}
        setCandidatesList={setCandidatesList}
      />
      
      {selectedCandidateId && (
        <Drawer
          open={!!selectedCandidateId}
          onClose={handleCloseDrawer}
          width="90%"
        >
          <CandidateDetailDrawer
            candidateId={selectedCandidateId}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onClose={handleCloseDrawer}
            totalCandidates={totalCandidates}
            currentIndex={currentIndex}
            customCandidates={candidatesList}
          />
        </Drawer>
      )}
    </>
  );
}