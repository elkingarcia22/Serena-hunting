import React from 'react';
import {
  User,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Clock,
  DollarSign,
  FileText,
  Globe,
  Target,
  CreditCard,
  Edit2,
  AlertCircle,
  Zap,
  Upload,
} from 'lucide-react';
import { cn } from '../ui/utils';
import { DatePicker } from '../ui/date-picker';
import { format, isValid } from 'date-fns';
import { parseFlexibleDate } from '../../utils/dateUtils';

interface GeneralInfoSectionProps {
  candidate?: any; // CandidateData from candidatesData
  isEditMode?: boolean;
  onDataChange?: (newData: any) => void;
  validationErrors?: string[];
}

export function GeneralInfoSection({ 
  candidate, 
  isEditMode = false,
  onDataChange,
  validationErrors = []
}: GeneralInfoSectionProps) {
  // Si no hay candidato, usar datos por defecto
  const defaultCandidate = {
    firstName: 'Nombre',
    lastName: 'Apellido',
    email: 'email@example.com',
    phone: '+57 300 000 0000',
    nationality: 'Colombiana',
    identificationType: 'Cédula de Ciudadanía',
    identificationNumber: '0000000000',
    linkedin: '',
    country: 'Colombia',
    city: 'Bogotá',
    willingToRelocate: false,
    interestedLocations: [],
    birthDate: '01/01/1990',
    yearsExperience: 0,
    availability: 'A convenir',
    noticePeriod: '0',
    noticePeriodUnit: 'Días',
    expectedSalary: 'A convenir',
    currency: 'Peso colombiano (COP)',
    description: '',
    skills: [],
    matchScore: 0,
    confidence: 'low' as const,
  };
  
  const candidateData = candidate || defaultCandidate;
  const [localEditedData, setLocalEditedData] = React.useState(candidateData);

  React.useEffect(() => {
    setLocalEditedData(candidateData);
  }, [candidateData]);

  const handleInputChange = (field: string, value: any) => {
    const newData = { ...localEditedData, [field]: value };
    setLocalEditedData(newData);
    if (onDataChange) {
      onDataChange(newData);
    }
  };

  const isFieldError = (field: string) => validationErrors.includes(field);

  // Helper para renderizar etiqueta con asterisco si es obligatorio
  const Label = ({ children, required = false, field }: { children: React.ReactNode, required?: boolean, field?: string }) => (
    <label className={cn(
      "text-xs font-medium mb-1 block transition-colors",
      isFieldError(field || '') ? "text-red-600" : "text-gray-500"
    )}>
      {children}
      {required && isEditMode && <span className="text-red-500 ml-1">*</span>}
    </label>
  );

  return (
    <div className="space-y-6">
      {/* Descripción del Candidato - Solo visible si NO está en modo edición */}
      {!isEditMode && candidateData.description && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Resumen Profesional</h3>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{candidateData.description}</p>
        </div>
      )}

      {/* Habilidades - Solo visible si NO está en modo edición */}
      {!isEditMode && candidateData.skills && (candidateData.skills.technical || candidateData.skills.soft) && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Habilidades</h3>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {[...(candidateData.skills.technical || []), ...(candidateData.skills.soft || [])].map((skill: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Información de Contacto */}
      <div className={cn(
        "bg-white rounded-lg border p-6 transition-all",
        isEditMode ? 'border-blue-300 shadow-md scale-[1.01]' : 'border-gray-200'
      )}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Información de Contacto</h3>
          {isEditMode && (
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              Campos obligatorios marcados con *
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {/* Nombre */}
          <div className="flex items-start gap-3">
            <User className={cn("w-5 h-5 mt-2", isFieldError('firstName') ? "text-red-400" : "text-gray-400")} />
            <div className="flex-1 min-w-0">
              <Label required field="firstName">Nombre</Label>
              {isEditMode ? (
                <div className="relative">
                  <input
                    type="text"
                    value={localEditedData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={cn(
                      "w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 transition-all",
                      isFieldError('firstName') 
                        ? "border-red-500 bg-red-50 focus:ring-red-200" 
                        : "border-gray-300 focus:ring-blue-500 focus:border-transparent"
                    )}
                  />
                  {isFieldError('firstName') && <AlertCircle className="w-4 h-4 text-red-500 absolute right-2 top-2" />}
                </div>
              ) : (
                <p className="text-sm text-gray-900 font-medium">{localEditedData.firstName}</p>
              )}
            </div>
          </div>

          {/* Apellido */}
          <div className="flex items-start gap-3">
            <User className={cn("w-5 h-5 mt-2", isFieldError('lastName') ? "text-red-400" : "text-gray-400")} />
            <div className="flex-1 min-w-0">
              <Label required field="lastName">Apellido</Label>
              {isEditMode ? (
                <div className="relative">
                  <input
                    type="text"
                    value={localEditedData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={cn(
                      "w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 transition-all",
                      isFieldError('lastName') 
                        ? "border-red-500 bg-red-50 focus:ring-red-200" 
                        : "border-gray-300 focus:ring-blue-500 focus:border-transparent"
                    )}
                  />
                  {isFieldError('lastName') && <AlertCircle className="w-4 h-4 text-red-500 absolute right-2 top-2" />}
                </div>
              ) : (
                <p className="text-sm text-gray-900 font-medium">{localEditedData.lastName}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-3">
            <Mail className={cn("w-5 h-5 mt-2", isFieldError('email') ? "text-red-400" : "text-gray-400")} />
            <div className="flex-1 min-w-0">
              <Label required field="email">Correo electrónico</Label>
              {isEditMode ? (
                <div className="relative">
                  <input
                    type="email"
                    value={localEditedData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={cn(
                      "w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 transition-all",
                      isFieldError('email') 
                        ? "border-red-500 bg-red-50 focus:ring-red-200" 
                        : "border-gray-300 focus:ring-blue-500 focus:border-transparent"
                    )}
                  />
                  {isFieldError('email') && <AlertCircle className="w-4 h-4 text-red-500 absolute right-2 top-2" />}
                </div>
              ) : (
                <p className="text-sm text-gray-900 truncate">{localEditedData.email}</p>
              )}
            </div>
          </div>

          {/* Teléfono */}
          <div className="flex items-start gap-3">
            <Phone className={cn("w-5 h-5 mt-2", isFieldError('phone') ? "text-red-400" : "text-gray-400")} />
            <div className="flex-1 min-w-0">
              <Label required field="phone">Teléfono</Label>
              {isEditMode ? (
                <div className="relative">
                  <input
                    type="tel"
                    value={localEditedData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={cn(
                      "w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 transition-all",
                      isFieldError('phone') 
                        ? "border-red-500 bg-red-50 focus:ring-red-200" 
                        : "border-gray-300 focus:ring-blue-500 focus:border-transparent"
                    )}
                  />
                  {isFieldError('phone') && <AlertCircle className="w-4 h-4 text-red-500 absolute right-2 top-2" />}
                </div>
              ) : (
                <p className="text-sm text-gray-900">{localEditedData.phone}</p>
              )}
            </div>
          </div>

          {/* Nacionalidad */}
          <div className="flex items-start gap-3">
            <Globe className="w-5 h-5 text-gray-400 mt-2" />
            <div className="flex-1 min-w-0">
              <Label>Nacionalidad</Label>
              {isEditMode ? (
                <input
                  type="text"
                  value={localEditedData.nationality}
                  onChange={(e) => handleInputChange('nationality', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-sm text-gray-900">{localEditedData.nationality}</p>
              )}
            </div>
          </div>

          {/* Identificación */}
          <div className="flex items-start gap-3">
            <CreditCard className={cn("w-5 h-5 mt-2", isFieldError('identificationNumber') ? "text-red-400" : "text-gray-400")} />
            <div className="flex-1 min-w-0">
              <Label required field="identificationNumber">Número de identificación</Label>
              {isEditMode ? (
                <div className="relative">
                  <input
                    id="identification-number-input"
                    type="text"
                    value={localEditedData.identificationNumber}
                    onChange={(e) => handleInputChange('identificationNumber', e.target.value)}
                    className={cn(
                      "w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 transition-all",
                      isFieldError('identificationNumber') 
                        ? "border-red-500 bg-red-50 focus:ring-red-200" 
                        : "border-gray-300 focus:ring-blue-500 focus:border-transparent"
                    )}
                    placeholder="Ej: 1234567890"
                  />
                  {isFieldError('identificationNumber') && <AlertCircle className="w-4 h-4 text-red-500 absolute right-2 top-2" />}
                </div>
              ) : (
                <p className="text-sm text-gray-900">
                  {localEditedData.identificationType} • {localEditedData.identificationNumber}
                </p>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Ubicación */}
      <div className={cn(
        "bg-white rounded-lg border p-6 transition-all",
        isEditMode ? 'border-blue-300 shadow-md scale-[1.01]' : 'border-gray-200'
      )}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Ubicación</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {/* Ciudad */}
          <div className="flex items-start gap-3">
            <MapPin className={cn("w-5 h-5 mt-2", isFieldError('city') ? "text-red-400" : "text-gray-400")} />
            <div className="flex-1 min-w-0">
              <Label required field="city">Ciudad</Label>
              {isEditMode ? (
                <div className="relative">
                  <input
                    type="text"
                    value={localEditedData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className={cn(
                      "w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 transition-all",
                      isFieldError('city') 
                        ? "border-red-500 bg-red-50 focus:ring-red-200" 
                        : "border-gray-300 focus:ring-blue-500 focus:border-transparent"
                    )}
                  />
                  {isFieldError('city') && <AlertCircle className="w-4 h-4 text-red-500 absolute right-2 top-2" />}
                </div>
              ) : (
                <p className="text-sm text-gray-900">{localEditedData.city}</p>
              )}
            </div>
          </div>

          {/* País */}
          <div className="flex items-start gap-3">
            <MapPin className={cn("w-5 h-5 mt-2", isFieldError('country') ? "text-red-400" : "text-gray-400")} />
            <div className="flex-1 min-w-0">
              <Label required field="country">País</Label>
              {isEditMode ? (
                <div className="relative">
                  <input
                    type="text"
                    value={localEditedData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className={cn(
                      "w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 transition-all",
                      isFieldError('country') 
                        ? "border-red-500 bg-red-50 focus:ring-red-200" 
                        : "border-gray-300 focus:ring-blue-500 focus:border-transparent"
                    )}
                  />
                  {isFieldError('country') && <AlertCircle className="w-4 h-4 text-red-500 absolute right-2 top-2" />}
                </div>
              ) : (
                <p className="text-sm text-gray-900">{localEditedData.country}</p>
              )}
            </div>
          </div>

          {/* Disponible para reubicarse */}
          <div className="flex items-start gap-3 col-span-2">
            <MapPin className="w-5 h-5 text-gray-400 mt-2" />
            <div className="flex-1 min-w-0">
              <Label>Disponible para reubicarse</Label>
              {isEditMode ? (
                <select
                  value={localEditedData.willingToRelocate ? 'yes' : 'no'}
                  onChange={(e) => handleInputChange('willingToRelocate', e.target.value === 'yes')}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="yes">Sí</option>
                  <option value="no">No</option>
                </select>
              ) : (
                <p className="text-sm text-gray-900">{localEditedData.willingToRelocate ? 'Sí' : 'No'}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Información Adicional */}
      <div className={cn(
        "bg-white rounded-lg border p-6 transition-all",
        isEditMode ? 'border-blue-300 shadow-md scale-[1.01]' : 'border-gray-200'
      )}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Información Adicional</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {/* Fecha de nacimiento */}
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-gray-400 mt-2" />
            <div className="flex-1 min-w-0">
              <Label>Fecha de nacimiento</Label>
              {isEditMode ? (
                <DatePicker
                  date={parseFlexibleDate(localEditedData.birthDate)}
                  onChange={(date) => {
                    if (date && isValid(date)) {
                      handleInputChange('birthDate', format(date, 'dd/MM/yyyy'));
                    }
                  }}
                  className="w-full"
                />
              ) : (
                <p className="text-sm text-gray-900">{localEditedData.birthDate}</p>
              )}
            </div>
          </div>

          {/* Edad */}
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-gray-400 mt-2" />
            <div className="flex-1 min-w-0">
              <Label>Edad</Label>
              {isEditMode ? (
                <input
                  type="number"
                  value={localEditedData.age}
                  onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                  min="0"
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-sm text-gray-900">
                  {localEditedData.age} años
                </p>
              )}
            </div>
          </div>

          {/* Años de experiencia */}
          <div className="flex items-start gap-3">
            <Briefcase className="w-5 h-5 text-gray-400 mt-2" />
            <div className="flex-1 min-w-0">
              <Label>Años de experiencia</Label>
              {isEditMode ? (
                <input
                  type="number"
                  value={localEditedData.yearsExperience}
                  onChange={(e) => handleInputChange('yearsExperience', parseInt(e.target.value))}
                  min="0"
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-sm text-gray-900">
                  {localEditedData.yearsExperience} {localEditedData.yearsExperience === 1 ? 'año' : 'años'}
                </p>
              )}
            </div>
          </div>

          {/* Disponibilidad */}
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-gray-400 mt-2" />
            <div className="flex-1 min-w-0">
              <Label>Disponibilidad</Label>
              {isEditMode ? (
                <select
                  value={localEditedData.availability}
                  onChange={(e) => handleInputChange('availability', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Tiempo completo">Tiempo completo</option>
                  <option value="Medio tiempo">Medio tiempo</option>
                  <option value="Por proyecto">Por proyecto</option>
                  <option value="Freelance">Freelance</option>
                </select>
              ) : (
                <p className="text-sm text-gray-900">{localEditedData.availability}</p>
              )}
            </div>
          </div>

          {/* Preaviso */}
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-gray-400 mt-2" />
            <div className="flex-1 min-w-0">
              <Label>Preaviso</Label>
              {isEditMode ? (
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={localEditedData.noticePeriod}
                    onChange={(e) => handleInputChange('noticePeriod', e.target.value)}
                    min="0"
                    className="w-20 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    value={localEditedData.noticePeriodUnit}
                    onChange={(e) => handleInputChange('noticePeriodUnit', e.target.value)}
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Días">Días</option>
                    <option value="Semanas">Semanas</option>
                    <option value="Meses">Meses</option>
                  </select>
                </div>
              ) : (
                <p className="text-sm text-gray-900">
                  {localEditedData.noticePeriod} {localEditedData.noticePeriodUnit}
                </p>
              )}
            </div>
          </div>

          {/* Salario esperado */}
          <div className="flex items-start gap-3">
            <DollarSign className="w-5 h-5 text-gray-400 mt-2" />
            <div className="flex-1 min-w-0">
              <Label>Salario esperado</Label>
              {isEditMode ? (
                <input
                  type="text"
                  value={localEditedData.expectedSalary}
                  onChange={(e) => handleInputChange('expectedSalary', e.target.value)}
                  placeholder="$18.000.000 - $22.000.000 COP"
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-sm text-gray-900">{localEditedData.expectedSalary}</p>
              )}
            </div>
          </div>

          {/* Moneda */}
          <div className="flex items-start gap-3">
            <DollarSign className="w-5 h-5 text-gray-400 mt-2" />
            <div className="flex-1 min-w-0">
              <Label>Moneda</Label>
              {isEditMode ? (
                <select
                  value={localEditedData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Peso colombiano (COP)">Peso colombiano (COP)</option>
                  <option value="Dólar estadounidense (USD)">Dólar estadounidense (USD)</option>
                  <option value="Euro (EUR)">Euro (EUR)</option>
                  <option value="Peso mexicano (MXN)">Peso mexicano (MXN)</option>
                  <option value="Sol peruano (PEN)">Sol peruano (PEN)</option>
                </select>
              ) : (
                <p className="text-sm text-gray-900">{localEditedData.currency}</p>
              )}
            </div>
          </div>

          {/* Origen - Solo lectura */}
          {!isEditMode && (
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-gray-400 mt-2" />
              <div className="flex-1 min-w-0">
                <Label>Origen</Label>
                <p className="text-sm text-gray-900">
                  {localEditedData.origin === 'Importado por CV' && 'Importación de CV'}
                  {localEditedData.origin === 'Serena IA' && 'Serena IA'}
                  {localEditedData.origin === 'Vacante' && 'Vacante / Web'}
                  {!localEditedData.origin && 'No especificado'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}