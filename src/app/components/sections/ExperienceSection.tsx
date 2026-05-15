import React, { useState, useRef, useEffect } from 'react';
import { Briefcase, MapPin, Calendar, Plus, Trash2, Edit2, X, Check, AlertCircle } from 'lucide-react';
import { cn } from '../ui/utils';
import { toast } from 'sonner';
import { DatePicker } from '../ui/date-picker';
import { format, isValid } from 'date-fns';
import { parseFlexibleDate } from '../../utils/dateUtils';

interface Experience {
  id?: string;
  company: string;
  position?: string;
  title?: string;
  location?: string;
  startDate?: string;
  endDate?: string | null;
  duration?: string;
  current?: boolean;
  description: string;
  achievements?: string[];
}

interface ExperienceSectionProps {
  experiences?: Experience[];
  isEditMode?: boolean;
  onEditingChange?: (isEditing: boolean) => void;
  isValentina?: boolean;
}

const mockExperiences: Experience[] = [
  {
    id: '1',
    title: 'UX/UI Designer',
    company: 'Habi',
    location: 'Bogotá, Colombia',
    startDate: '2023-03-01',
    endDate: null,
    current: true,
    description: 'Diseño de interfaces para plataforma de compra-venta de inmuebles. Trabajo en equipo de producto enfocado en optimizar el flujo de búsqueda y cotización de propiedades.',
    achievements: [
      'Rediseñé el flujo de búsqueda de propiedades mejorando la usabilidad',
      'Colaboré con equipos de desarrollo en implementación de nuevas features',
      'Participé en sesiones de user research para validar diseños'
    ]
  },
  {
    id: '2',
    title: 'Diseñador Digital',
    company: 'Estudio Creativo Digital',
    location: 'Bogotá, Colombia',
    startDate: '2022-01-01',
    endDate: '2023-02-28',
    current: false,
    description: 'Diseño de experiencias web y móviles para diversos clientes. Colaboración con desarrolladores y gestores de proyecto en metodología ágil.',
    achievements: [
      'Diseñé más de 10 proyectos web y móviles para diferentes clientes',
      'Implementé flujos de trabajo colaborativos con desarrollo',
      'Aprendí metodología ágil aplicada al diseño'
    ]
  }
];

// Helper para formatear fechas de YYYY-MM-DD a formato legible "Mes Año"
const formatDateString = (dateStr: string | null | undefined) => {
  if (!dateStr) return '';
  try {
    const [year, month] = dateStr.split('-');
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${months[parseInt(month) - 1]} ${year}`;
  } catch (e) {
    return dateStr;
  }
};

export function ExperienceSection({ experiences = mockExperiences, isEditMode = false, onEditingChange, isValentina = false }: ExperienceSectionProps) {
  // Defensive check to ensure experiences is an array
  const safeExperiences = Array.isArray(experiences) ? experiences : [];
  
  // Ensure all experiences have IDs
  const experiencesWithIds = safeExperiences.map((exp, index) => ({
    ...exp,
    id: exp.id || `exp-${index}-${Date.now()}`
  }));
  
  const [experienceList, setExperienceList] = useState<Experience[]>(experiencesWithIds);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Experience | null>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const editingRef = useRef<HTMLDivElement>(null);

  // Sync state with props when candidate changes
  useEffect(() => {
    setExperienceList(experiencesWithIds);
  }, [experiences]);

  // Scroll al elemento en edición cuando cambia editingId
  useEffect(() => {
    if (editingId && editingRef.current) {
      setTimeout(() => {
        editingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [editingId]);

  // Notificar al padre sobre el estado de edición local
  useEffect(() => {
    onEditingChange?.(editingId !== null);
  }, [editingId, onEditingChange]);

  const handleEdit = (exp: Experience) => {
    if (isValentina) {
      toast.error('Estamos presentando inconvenientes para editar la información laboral. Inténtalo más tarde.');
      return;
    }
    setEditingId(exp.id!);
    setEditForm({ ...exp });
    setFormErrors([]);
    setIsCreatingNew(false);
  };

  const handleCancelEdit = () => {
    if (isCreatingNew && editForm) {
      setExperienceList(prev => prev.filter(exp => exp.id !== editForm.id));
    }
    setEditingId(null);
    setEditForm(null);
    setFormErrors([]);
    setIsCreatingNew(false);
  };

  const handleSaveEdit = () => {
    if (!editForm) return;

    // Validación de campos obligatorios
    const mandatoryFields = ['title', 'company', 'location', 'startDate'];
    if (!editForm.current) {
      mandatoryFields.push('endDate');
    }

    const errors = mandatoryFields.filter(field => {
      const val = (editForm as any)[field];
      return !val || val.toString().trim() === '';
    });

    if (errors.length > 0) {
      setFormErrors(errors);
      toast.error('Por favor completa todos los campos obligatorios marcados con *');
      return;
    }

    // Si pasa la validación
    setExperienceList(prev => prev.map(exp => exp.id === editForm.id ? editForm : exp));
    setEditingId(null);
    setEditForm(null);
    setFormErrors([]);
    setIsCreatingNew(false);
    toast.success('Experiencia actualizada');
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = (id: string) => {
    setExperienceList(prev => prev.filter(exp => exp.id !== id));
    setDeletingId(null);
    toast.success('Experiencia eliminada');
  };

  const cancelDelete = () => {
    setDeletingId(null);
  };

  const handleAdd = () => {
    if (isValentina) {
      toast.error('No se ha podido habilitar la creación de una nueva experiencia. Por favor, inténtalo más tarde.');
      return;
    }
    const newExp: Experience = {
      id: Date.now().toString(),
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: null,
      current: false,
      description: '',
      achievements: []
    };
    setExperienceList(prev => [...prev, newExp]);
    setEditingId(newExp.id!);
    setEditForm(newExp);
    setFormErrors([]);
    setIsCreatingNew(true);
  };

  const updateEditForm = (field: keyof Experience, value: any) => {
    setEditForm(prev => {
      if (!prev) return null;
      return { ...prev, [field]: value };
    });
    
    // Limpiar error del campo al escribir
    if (formErrors.includes(field)) {
      setFormErrors(prevErrors => prevErrors.filter(f => f !== field));
    }
  };

  const isFieldError = (field: string) => formErrors.includes(field);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Experiencia Laboral</h2>
            <p className="text-sm text-gray-600">{experienceList.length} {experienceList.length === 1 ? 'posición' : 'posiciones'}</p>
          </div>
        </div>
      </div>

      {/* Experience Timeline */}
      <div className="space-y-4">
        {experienceList.map((exp) => (
          <div
            key={exp.id}
            className={cn(
              "bg-white rounded-lg border p-6 transition-all",
              deletingId === exp.id 
                ? 'border-red-300 bg-red-50' 
                : editingId === exp.id
                ? 'border-blue-400 bg-white shadow-xl ring-1 ring-blue-100'
                : 'border-gray-200 hover:shadow-md'
            )}
          >
            {/* Delete Confirmation Banner */}
            {deletingId === exp.id && (
              <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-red-900">
                    ¿Estás seguro de eliminar esta experiencia?
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => confirmDelete(exp.id!)}
                      className="px-3 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700"
                    >
                      Eliminar
                    </button>
                    <button
                      onClick={cancelDelete}
                      className="px-3 py-1 bg-white text-gray-700 text-xs font-medium rounded border border-gray-300 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Mode */}
            {editingId === exp.id && editForm ? (
              <div className="space-y-4" ref={editingRef}>
                {/* Edit Header */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-blue-200">
                  <h3 className="text-sm font-semibold text-blue-900">
                    {isCreatingNew ? 'Creando Nueva Experiencia' : 'Editando Experiencia'}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveEdit}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      Guardar
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-700 text-sm font-medium rounded border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Cancelar
                    </button>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 transition-colors uppercase tracking-wider">
                      Cargo <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={editForm.title || editForm.position}
                        onChange={(e) => updateEditForm('title', e.target.value)}
                        className={cn(
                          "w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all",
                          isFieldError('title') ? "border-red-500 bg-red-50 focus:ring-red-200" : "border-gray-300 focus:ring-blue-500"
                        )}
                        placeholder="ej. Senior Product Designer"
                      />
                      {isFieldError('title') && <AlertCircle className="w-4 h-4 text-red-500 absolute right-2 top-2.5" />}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 transition-colors uppercase tracking-wider">
                      Empresa <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={editForm.company}
                        onChange={(e) => updateEditForm('company', e.target.value)}
                        className={cn(
                          "w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all",
                          isFieldError('company') ? "border-red-500 bg-red-50 focus:ring-red-200" : "border-gray-300 focus:ring-blue-500"
                        )}
                        placeholder="ej. TechCorp Solutions"
                      />
                      {isFieldError('company') && <AlertCircle className="w-4 h-4 text-red-500 absolute right-2 top-2.5" />}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 transition-colors uppercase tracking-wider">
                    Ubicación <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) => updateEditForm('location', e.target.value)}
                      className={cn(
                        "w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all",
                        isFieldError('location') ? "border-red-500 bg-red-50 focus:ring-red-200" : "border-gray-300 focus:ring-blue-500"
                      )}
                      placeholder="ej. Bogotá, Colombia"
                    />
                    {isFieldError('location') && <AlertCircle className="w-4 h-4 text-red-500 absolute right-2 top-2.5" />}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 transition-colors uppercase tracking-wider">
                      Fecha de inicio <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <DatePicker
                        date={parseFlexibleDate(editForm.startDate)}
                        onChange={(date) => {
                          if (date && isValid(date)) {
                            updateEditForm('startDate', format(date, 'yyyy-MM-dd'));
                          }
                        }}
                        error={isFieldError('startDate')}
                        className="w-full"
                      />
                      {isFieldError('startDate') && <AlertCircle className="w-4 h-4 text-red-500 absolute right-8 top-2.5 z-10" />}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 transition-colors uppercase tracking-wider">
                        Fecha de fin {!editForm.current && <span className="text-red-500">*</span>}
                      </label>
                      <div className="relative">
                        <DatePicker
                          date={parseFlexibleDate(editForm.endDate)}
                          onChange={(date) => {
                            if (date && isValid(date)) {
                              updateEditForm('endDate', format(date, 'yyyy-MM-dd'));
                            } else {
                              updateEditForm('endDate', null);
                            }
                          }}
                          disabled={editForm.current}
                          error={!editForm.current && isFieldError('endDate')}
                          className="w-full"
                        />
                        {!editForm.current && isFieldError('endDate') && <AlertCircle className="w-4 h-4 text-red-500 absolute right-8 top-2.5 z-10" />}
                      </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded-md hover:bg-gray-50 transition-colors w-max">
                      <input
                        type="checkbox"
                        checked={editForm.current}
                        onChange={(e) => {
                          const isCurrent = e.target.checked;
                          setEditForm(prev => prev ? ({
                            ...prev, 
                            current: isCurrent,
                            endDate: isCurrent ? null : prev.endDate
                          }) : null);
                          
                          if (isCurrent) {
                            setFormErrors(prev => prev.filter(f => f !== 'endDate'));
                          }
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-600">Actualmente trabajo aquí</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Descripción</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => updateEditForm('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                    placeholder="Describe tus responsabilidades y rol"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Logros destacados</label>
                    <button
                      onClick={() => setEditForm(prev => prev ? ({...prev, achievements: [...(prev.achievements || []), '']}) : null)}
                      className="text-xs text-blue-600 hover:text-blue-700 font-bold"
                    >
                      + AGREGAR LOGRO
                    </button>
                  </div>
                  <div className="space-y-2">
                    {editForm.achievements?.map((achievement, i) => (
                      <div key={`achievement-${i}`} className="flex items-center gap-2 group">
                        <input
                          type="text"
                          value={achievement}
                          onChange={(e) => {
                            const newAch = [...(editForm.achievements || [])];
                            newAch[i] = e.target.value;
                            updateEditForm('achievements', newAch);
                          }}
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Describe un logro destacado"
                        />
                        <button
                          onClick={() => {
                            const newAch = editForm.achievements?.filter((_, index) => index !== i);
                            updateEditForm('achievements', newAch);
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 opacity-50 group-hover:opacity-100 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* View Mode */
              <>
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{exp.position || exp.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <span className="font-medium text-gray-900">{exp.company}</span>
                      {exp.current && (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-medium">
                          Actual
                        </span>
                      )}
                    </div>
                  </div>
                  {isEditMode && !deletingId && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(exp)}
                        disabled={editingId !== null}
                        className={cn(
                          "p-1.5 rounded transition-all",
                          editingId !== null ? "opacity-30 cursor-not-allowed" : "hover:bg-blue-50"
                        )}
                        title="Editar experiencia"
                      >
                        <Edit2 className="w-4 h-4 text-gray-500 hover:text-blue-600" />
                      </button>
                      <button
                        onClick={() => {
                          if (isValentina) {
                            toast.error('No se ha podido procesar la eliminación de este registro. Inténtalo de nuevo más tarde.');
                            return;
                          }
                          handleDelete(exp.id!);
                        }}
                        disabled={editingId !== null}
                        className={cn(
                          "p-1.5 rounded transition-all",
                          editingId !== null ? "opacity-30 cursor-not-allowed" : "hover:bg-red-50"
                        )}
                        title="Eliminar experiencia"
                      >
                        <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-600" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Location & Date */}
                <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{exp.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="capitalize">
                      {formatDateString(exp.startDate)} - {exp.current ? 'Presente' : formatDateString(exp.endDate)}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                  {exp.description}
                </p>

                {/* Achievements */}
                {exp.achievements && exp.achievements.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2 font-bold tracking-tight uppercase text-xs text-gray-500">Logros destacados:</h4>
                    <ul className="space-y-1.5">
                      {exp.achievements.map((achievement, i) => (
                        <li key={`${exp.id}-achievement-${i}`} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-blue-600 mt-1.5">•</span>
                          <span className="flex-1">{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
        {isEditMode && !editingId && (
          <button 
            onClick={handleAdd}
            className="w-full bg-white rounded-lg border-2 border-dashed border-gray-300 p-8 hover:border-gray-400 hover:bg-gray-50 transition-all group animate-in fade-in zoom-in-95"
          >
            <div className="flex flex-col items-center justify-center gap-3 text-gray-500 group-hover:text-gray-700">
              <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-white border group-hover:border-gray-200 transition-colors">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold uppercase tracking-widest">Agregar experiencia laboral</span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}