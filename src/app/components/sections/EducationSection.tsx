import React, { useState, useRef, useEffect } from 'react';
import { GraduationCap, Calendar, Award, BookOpen, Plus, Trash2, Edit2, X, Check, AlertCircle } from 'lucide-react';
import { cn } from '../ui/utils';
import { toast } from 'sonner';
import { DatePicker } from '../ui/date-picker';
import { YearPicker } from '../ui/year-picker';
import { format, isValid } from 'date-fns';
import { parseFlexibleDate } from '../../utils/dateUtils';

interface Education {
  id: string;
  degree: string;
  institution: string;
  field: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  gpa?: string;
  honors?: string;
  description?: string;
}

interface Certificate {
  id: string;
  name: string;
  issuer: string;
  date: string;
  endDate?: string | null;
  current?: boolean;
  credentialId?: string;
  url?: string;
}

interface EducationSectionProps {
  education?: Array<{
    institution: string;
    degree: string;
    year: string;
    current?: boolean;
    description?: string;
  }>;
  certificates?: Certificate[];
  isEditMode?: boolean;
  onEditingChange?: (isEditing: boolean) => void;
  isValentina?: boolean;
}

const mockEducation: Education[] = [
  {
    id: '1',
    degree: 'Diseño Gráfico',
    institution: 'Universidad Nacional de Colombia',
    field: 'Diseño Visual',
    startDate: '2017',
    endDate: '2021',
    current: false,
    gpa: '3.8/5.0',
    description: 'Formación en diseño gráfico, diseño de marca, diseño editorial y fundamentos de diseño de interfaces digitales.'
  }
];

const mockCertificates: Certificate[] = [
  {
    id: '1',
    name: 'Curso de UX/UI Design',
    issuer: 'Platzi',
    date: '2022-05-01',
    endDate: '2024-05-01',
    current: false,
    credentialId: 'PLTZ-UX-2022-4567'
  }
];

export function EducationSection({ 
  education, 
  certificates = mockCertificates,
  isEditMode = false,
  onEditingChange,
  isValentina = false
}: EducationSectionProps) {
  // ... existing code ...
  // Convertir education simple a formato completo
  const convertedEducation: Education[] = React.useMemo(() => {
    if (!education || education.length === 0) return mockEducation;
    
    return education.map((edu, index) => ({
      id: `edu-${index}`,
      degree: edu.degree,
      institution: edu.institution,
      field: edu.degree, 
      startDate: edu.year.split(' - ')[0] || edu.year,
      endDate: edu.year.split(' - ')[1] || null,
      current: edu.current || false,
      description: edu.description
    }));
  }, [education]);
  
  const [educationList, setEducationList] = useState<Education[]>(convertedEducation);
  const [certificateList, setCertificateList] = useState<Certificate[]>(certificates);
  
  const [editingEducationId, setEditingEducationId] = useState<string | null>(null);
  const [editingCertId, setEditingCertId] = useState<string | null>(null);
  const [deletingEducationId, setDeletingEducationId] = useState<string | null>(null);
  const [deletingCertId, setDeletingCertId] = useState<string | null>(null);
  
  const [editEducationForm, setEditEducationForm] = useState<Education | null>(null);
  const [editCertForm, setEditCertForm] = useState<Certificate | null>(null);
  
  const [eduFormErrors, setEduFormErrors] = useState<string[]>([]);
  const [certFormErrors, setCertFormErrors] = useState<string[]>([]);
  
  const [isCreatingNewEducation, setIsCreatingNewEducation] = useState(false);
  const [isCreatingNewCert, setIsCreatingNewCert] = useState(false);
  
  const editingEducationRef = useRef<HTMLDivElement>(null);
  const editingCertRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setEducationList(convertedEducation); }, [convertedEducation]);
  useEffect(() => { setCertificateList(certificates); }, [certificates]);

  // Scroll logic
  useEffect(() => {
    if (editingEducationId && editingEducationRef.current) {
      setTimeout(() => editingEducationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    }
  }, [editingEducationId]);

  useEffect(() => {
    if (editingCertId && editingCertRef.current) {
      setTimeout(() => editingCertRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    }
  }, [editingCertId]);

  // Notificar al padre sobre el estado de edición local (Educación o Certificados)
  useEffect(() => {
    onEditingChange?.(editingEducationId !== null || editingCertId !== null);
  }, [editingEducationId, editingCertId, onEditingChange]);

  // Education Handlers
  const handleEditEducation = (edu: Education) => {
    if (isValentina) {
      toast.error('Estamos presentando inconvenientes para editar la información académica. Inténtalo más tarde.');
      return;
    }
    setEditingEducationId(edu.id);
    setEditEducationForm({ ...edu });
    setEduFormErrors([]);
    setIsCreatingNewEducation(false);
  };

  const handleSaveEducation = () => {
    if (!editEducationForm) return;
    const mandatory = ['degree', 'institution', 'field', 'startDate', 'endDate'];
    const errors = mandatory.filter(f => !(editEducationForm as any)[f]);

    if (errors.length > 0) {
      setEduFormErrors(errors);
      toast.error('Completa los campos obligatorios de formación');
      return;
    }

    setEducationList(prev => prev.map(edu => edu.id === editEducationForm.id ? editEducationForm : edu));
    setEditingEducationId(null);
    setEditEducationForm(null);
    setEduFormErrors([]);
    setIsCreatingNewEducation(false);
    toast.success('Formación académica actualizada');
  };

  const handleAddEducation = () => {
    if (isValentina) {
      toast.error('No se ha podido habilitar la creación de un nuevo registro académico. Por favor, inténtalo más tarde.');
      return;
    }
    const newEdu: Education = {
      id: Date.now().toString(),
      degree: '', institution: '', field: '', startDate: '', endDate: null, current: false, description: ''
    };
    setEducationList(prev => [...prev, newEdu]);
    setEditingEducationId(newEdu.id);
    setEditEducationForm(newEdu);
    setEduFormErrors([]);
    setIsCreatingNewEducation(true);
  };

  // Certificate Handlers
  const handleEditCertificate = (cert: Certificate) => {
    if (isValentina) {
      toast.error('Estamos presentando inconvenientes para acceder a la edición de certificados. Inténtalo de nuevo en unos minutos.');
      return;
    }
    setEditingCertId(cert.id);
    setEditCertForm({ ...cert });
    setCertFormErrors([]);
    setIsCreatingNewCert(false);
  };

  const handleSaveCertificate = () => {
    if (!editCertForm) return;
    const mandatory = ['name', 'issuer', 'date', 'endDate'];
    const errors = mandatory.filter(f => !(editCertForm as any)[f]);

    if (errors.length > 0) {
      setCertFormErrors(errors);
      toast.error('Completa los campos obligatorios de certificación');
      return;
    }

    setCertificateList(prev => prev.map(c => c.id === editCertForm.id ? editCertForm : c));
    setEditingCertId(null);
    setEditCertForm(null);
    setCertFormErrors([]);
    setIsCreatingNewCert(false);
    toast.success('Certificación actualizada');
  };

  const handleAddCertificate = () => {
    if (isValentina) {
      toast.error('Por el momento no podemos registrar nuevas certificaciones. Inténtalo más tarde.');
      return;
    }
    const newCert: Certificate = {
      id: Date.now().toString(),
      name: '', issuer: '', date: '', endDate: null, current: false
    };
    setCertificateList(prev => [...prev, newCert]);
    setEditingCertId(newCert.id);
    setEditCertForm(newCert);
    setCertFormErrors([]);
    setIsCreatingNewCert(true);
  };

  const isEduError = (f: string) => eduFormErrors.includes(f);
  const isCertError = (f: string) => certFormErrors.includes(f);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Educación y Certificaciones</h2>
            <p className="text-sm text-gray-600">
              {educationList.length} títulos • {certificateList.length} certificaciones
            </p>
          </div>
        </div>
      </div>

      {/* Formación Académica */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Formación Académica</h3>
        {educationList.map((edu) => (
          <div
            key={edu.id}
            ref={editingEducationId === edu.id ? editingEducationRef : null}
            className={cn(
              "bg-white rounded-lg border p-6 transition-all",
              editingEducationId === edu.id ? "border-blue-400 shadow-xl ring-1 ring-blue-100 scale-[1.01]" : "border-gray-200 hover:shadow-md",
              deletingEducationId === edu.id && "border-red-300 bg-red-50"
            )}
          >
            {editingEducationId === edu.id && editEducationForm ? (
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <h4 className="text-sm font-bold text-gray-800">{isCreatingNewEducation ? 'NUEVA FORMACIÓN' : 'EDITAR FORMACIÓN'}</h4>
                  <div className="flex gap-2">
                    <button onClick={handleSaveEducation} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700">
                      <Check className="w-4 h-4" /> GUARDAR
                    </button>
                    <button onClick={() => {
                       if (isCreatingNewEducation) setEducationList(prev => prev.filter(e => e.id !== edu.id));
                       setEditingEducationId(null);
                    }} className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-600 text-sm font-bold rounded-lg border border-gray-200 hover:bg-gray-50">
                      <X className="w-4 h-4" /> CANCELAR
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Título <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input type="text" value={editEducationForm.degree} onChange={e => setEditEducationForm({...editEducationForm, degree: e.target.value})} className={cn("w-full px-3 py-2 text-sm border rounded-lg focus:ring-2", isEduError('degree') ? "border-red-500 bg-red-50" : "border-gray-200 focus:ring-blue-500")} />
                      {isEduError('degree') && <AlertCircle className="w-4 h-4 text-red-500 absolute right-2 top-2.5" />}
                    </div>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Institución <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input type="text" value={editEducationForm.institution} onChange={e => setEditEducationForm({...editEducationForm, institution: e.target.value})} className={cn("w-full px-3 py-2 text-sm border rounded-lg focus:ring-2", isEduError('institution') ? "border-red-500 bg-red-50" : "border-gray-200 focus:ring-blue-500")} />
                      {isEduError('institution') && <AlertCircle className="w-4 h-4 text-red-500 absolute right-2 top-2.5" />}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Campo de estudio <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input type="text" value={editEducationForm.field} onChange={e => setEditEducationForm({...editEducationForm, field: e.target.value})} className={cn("w-full px-3 py-2 text-sm border rounded-lg focus:ring-2", isEduError('field') ? "border-red-500 bg-red-50" : "border-gray-200 focus:ring-blue-500")} />
                      {isEduError('field') && <AlertCircle className="w-4 h-4 text-red-500 absolute right-2 top-2.5" />}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Año Inicio <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <YearPicker
                        value={editEducationForm.startDate}
                        onChange={val => setEditEducationForm({...editEducationForm, startDate: val})}
                        error={isEduError('startDate')}
                        className="w-full"
                      />
                      {isEduError('startDate') && <AlertCircle className="w-4 h-4 text-red-500 absolute right-8 top-2.5 z-10" />}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Año Finalización <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <YearPicker
                          value={editEducationForm.endDate || ''}
                          onChange={val => setEditEducationForm({...editEducationForm, endDate: val})}
                          error={isEduError('endDate')}
                          disabled={editEducationForm.current}
                          className="w-full"
                        />
                        {isEduError('endDate') && <AlertCircle className="w-4 h-4 text-red-500 absolute right-8 top-2.5 z-10" />}
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded-md hover:bg-gray-50 transition-colors w-max">
                      <input type="checkbox" checked={editEducationForm.current} onChange={e => setEditEducationForm({...editEducationForm, current: e.target.checked})} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      <span className="text-sm font-medium text-gray-600">Actualmente estudio aquí</span>
                    </label>
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">GPA / Promedio (Opcional)</label>
                    <input type="text" value={editEducationForm.gpa || ''} onChange={e => setEditEducationForm({...editEducationForm, gpa: e.target.value})} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="ej. 4.5/5.0" />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Honores (Opcional)</label>
                    <input type="text" value={editEducationForm.honors || ''} onChange={e => setEditEducationForm({...editEducationForm, honors: e.target.value})} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="ej. Summa Cum Laude" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Descripción (Opcional)</label>
                    <textarea value={editEducationForm.description || ''} onChange={e => setEditEducationForm({...editEducationForm, description: e.target.value})} rows={3} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Describe tu especialización o logros académicos" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-gray-900 mb-1">{edu.degree}</h4>
                  <p className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2 italic">
                    <GraduationCap className="w-4 h-4" /> {edu.institution}
                  </p>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {edu.startDate} - {edu.current ? (edu.endDate ? `Proyectado ${edu.endDate}` : 'Presente') : (edu.endDate || 'N/A')}</span>
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-bold text-gray-600 uppercase tracking-tight">{edu.field}</span>
                  </div>
                </div>
                {isEditMode && (
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleEditEducation(edu)} 
                      disabled={editingEducationId !== null || editingCertId !== null}
                      className={cn(
                        "p-2 rounded-lg transition-all",
                        (editingEducationId !== null || editingCertId !== null) ? "opacity-30 cursor-not-allowed" : "hover:bg-gray-100 text-gray-400 hover:text-blue-600"
                      )}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                      <button 
                        onClick={() => {
                          if (isValentina) {
                            toast.error('No ha sido posible procesar la eliminación del registro de formación. Inténtalo más tarde.');
                            return;
                          }
                          setDeletingEducationId(edu.id);
                        }}
                        disabled={editingEducationId !== null || editingCertId !== null}
                      className={cn(
                        "p-2 rounded-lg transition-all",
                        (editingEducationId !== null || editingCertId !== null) ? "opacity-30 cursor-not-allowed" : "hover:bg-red-50 text-gray-400 hover:text-red-600"
                      )}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {isEditMode && !editingEducationId && !editingCertId && (
          <button onClick={handleAddEducation} className="w-full bg-white rounded-lg border-2 border-dashed border-gray-200 p-8 hover:border-gray-400 hover:bg-gray-50 transition-all group flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-white border group-hover:border-gray-200 transition-colors">
              <Plus className="w-6 h-6 text-gray-400 group-hover:text-gray-600" />
            </div>
            <span className="text-xs font-bold text-gray-400 group-hover:text-gray-600 uppercase tracking-widest">AGREGAR FORMACIÓN</span>
          </button>
        )}
      </div>

      {/* Certificaciones */}
      <div className="space-y-4 pt-4 border-t border-gray-100">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Certificaciones y Licencias</h3>
        {certificateList.map((cert) => (
          <div
            key={cert.id}
            ref={editingCertId === cert.id ? editingCertRef : null}
            className={cn(
              "bg-white rounded-lg border p-6 transition-all",
              editingCertId === cert.id ? "border-blue-400 shadow-xl ring-1 ring-blue-100 scale-[1.01]" : "border-gray-200 hover:shadow-md",
              deletingCertId === cert.id && "border-red-300 bg-red-50"
            )}
          >
            {editingCertId === cert.id && editCertForm ? (
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <h4 className="text-sm font-bold text-gray-800">{isCreatingNewCert ? 'NUEVA CERTIFICACIÓN' : 'EDITAR CERTIFICACIÓN'}</h4>
                  <div className="flex gap-2">
                    <button onClick={handleSaveCertificate} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700">
                      <Check className="w-4 h-4" /> GUARDAR
                    </button>
                    <button onClick={() => {
                       if (isCreatingNewCert) setCertificateList(prev => prev.filter(c => c.id !== cert.id));
                       setEditingCertId(null);
                    }} className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-600 text-sm font-bold rounded-lg border border-gray-200 hover:bg-gray-50">
                      <X className="w-4 h-4" /> CANCELAR
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Nombre <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input type="text" value={editCertForm.name} onChange={e => setEditCertForm({...editCertForm, name: e.target.value})} className={cn("w-full px-3 py-2 text-sm border rounded-lg focus:ring-2", isCertError('name') ? "border-red-500 bg-red-50" : "border-gray-200 focus:ring-blue-500")} />
                      {isCertError('name') && <AlertCircle className="w-4 h-4 text-red-500 absolute right-2 top-2.5" />}
                    </div>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Emisor <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input type="text" value={editCertForm.issuer} onChange={e => setEditCertForm({...editCertForm, issuer: e.target.value})} className={cn("w-full px-3 py-2 text-sm border rounded-lg focus:ring-2", isCertError('issuer') ? "border-red-500 bg-red-50" : "border-gray-200 focus:ring-blue-500")} />
                      {isCertError('issuer') && <AlertCircle className="w-4 h-4 text-red-500 absolute right-2 top-2.5" />}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Obtención <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <DatePicker
                        date={parseFlexibleDate(editCertForm.date)}
                        onChange={(date) => {
                          if (date && isValid(date)) {
                            setEditCertForm({...editCertForm, date: format(date, 'yyyy-MM-dd')});
                          }
                        }}
                        error={isCertError('date')}
                        className="w-full"
                      />
                      {isCertError('date') && <AlertCircle className="w-4 h-4 text-red-500 absolute right-8 top-2.5 z-10" />}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Finalización <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <DatePicker
                          date={parseFlexibleDate(editCertForm.endDate)}
                          onChange={(date) => {
                            if (date && isValid(date)) {
                              setEditCertForm({...editCertForm, endDate: format(date, 'yyyy-MM-dd')});
                            } else {
                              setEditCertForm({...editCertForm, endDate: null});
                            }
                          }}
                          disabled={editCertForm.current}
                          error={isCertError('endDate')}
                          className="w-full"
                        />
                        {isCertError('endDate') && <AlertCircle className="w-4 h-4 text-red-500 absolute right-8 top-2.5 z-10" />}
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded-md hover:bg-gray-50 transition-colors w-max">
                      <input type="checkbox" checked={editCertForm.current} onChange={e => setEditCertForm({...editCertForm, current: e.target.checked})} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      <span className="text-sm font-medium text-gray-600">Actualmente realizando</span>
                    </label>
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">ID de Credencial (Opcional)</label>
                    <input type="text" value={editCertForm.credentialId || ''} onChange={e => setEditCertForm({...editCertForm, credentialId: e.target.value})} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="ej. ABC-123-XYZ" />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">URL del Certificado (Opcional)</label>
                    <input type="text" value={editCertForm.url || ''} onChange={e => setEditCertForm({...editCertForm, url: e.target.value})} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="ej. https://ejemplo.com/cert" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-base font-bold text-gray-900 mb-1">{cert.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{cert.issuer}</p>
                  <div className="flex gap-4 text-xs text-gray-400 font-medium">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {cert.date} - {cert.current ? (cert.endDate ? `Estimado ${cert.endDate}` : 'Presente') : (cert.endDate || 'N/A')}</span>
                    {cert.credentialId && <span className="text-gray-300 font-mono">ID: {cert.credentialId}</span>}
                  </div>
                </div>
                {isEditMode && (
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleEditCertificate(cert)}
                      disabled={editingEducationId !== null || editingCertId !== null}
                      className={cn(
                        "p-2 rounded-lg transition-all",
                        (editingEducationId !== null || editingCertId !== null) ? "opacity-30 cursor-not-allowed" : "hover:bg-gray-100 text-gray-400 hover:text-blue-600"
                      )}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        if (isValentina) {
                          toast.error('Estamos presentando inconvenientes para eliminar certificados del perfil. Por favor, inténtalo más tarde.');
                          return;
                        }
                        setDeletingCertId(cert.id);
                      }}
                      disabled={editingEducationId !== null || editingCertId !== null}
                      className={cn(
                        "p-2 rounded-lg transition-all",
                        (editingEducationId !== null || editingCertId !== null) ? "opacity-30 cursor-not-allowed" : "hover:bg-red-50 text-gray-400 hover:text-red-600"
                      )}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {isEditMode && !editingCertId && !editingEducationId && (
          <button onClick={handleAddCertificate} className="w-full bg-white rounded-lg border-2 border-dashed border-gray-200 p-8 hover:border-gray-400 hover:bg-gray-50 transition-all group flex flex-col items-center justify-center gap-3">
             <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-white border group-hover:border-gray-200 transition-colors">
              <Plus className="w-6 h-6 text-gray-400 group-hover:text-gray-600" />
            </div>
            <span className="text-xs font-bold text-gray-400 group-hover:text-gray-600 uppercase tracking-widest">AGREGAR CERTIFICACIÓN</span>
          </button>
        )}
      </div>
    </div>
  );
}