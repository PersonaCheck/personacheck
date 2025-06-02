import React from 'react';
import { useGlobalContext } from '../contexts/GlobalContext';
import { PersonalityReport } from '../types';
import ReportSectionCard from './ReportSectionCard';
import ExportButtons from './ExportButtons';
import LoadingSpinner from './LoadingSpinner';

const ReportView: React.FC = () => {
  const { personalityReport, userName, isLoading, error, translate, reportType } = useGlobalContext();

  if (isLoading) {
    return <LoadingSpinner text={translate('generatingReport')} />;
  }

  if (error && (!personalityReport || Object.keys(personalityReport).length === 0 || (personalityReport.summary && personalityReport.summary.startsWith("Error:")))) {
    const displayError = personalityReport?.summary || error; // Prefer error in report if available
    return <div className="text-center text-red-400 text-xl p-8 bg-secondary rounded-lg shadow-xl animate-fade-in">
        <p className="font-bold text-2xl mb-3"><i className="fas fa-exclamation-triangle mr-2"></i>{translate('error')}</p>
        <p>{displayError}</p>
    </div>;
  }
  
  if (!personalityReport || Object.keys(personalityReport).length === 0) {
    return (
      <div className="text-center text-xl p-8 bg-secondary rounded-lg shadow-xl animate-fade-in">
        {translate('reportGenerationError')}
      </div>
    );
  }
  
  // Define a comprehensive order. Sections not present in the report data will be skipped.
  const reportSectionsOrder: (keyof PersonalityReport)[] = [
    'summary', 'mbti', 'iqEstimate', 'intelligenceType', 'introvertExtrovertAmbivert',
    'creativityLevel', 'learningStyle', 'emotionalIntelligence', 'empathyLevel', 
    'socialBehavior', 'confidenceLevel', 'stressManagement', 'communicationStyle', 
    'patienceConsistency', 'decisionMakingPattern', 'habitAnalysis', 'leadershipQuality', 
    'memoryAttentionSpan', 'optimismPessimismScale', 'riskTakingBehavior', 'strengths', 
    'weaknesses', 'suggestionsForImprovement', 'suggestedCareerPaths', 
    'skillsToDevelopForCareer', 'personalGrowthAdvice', 'motivationSource', 
    'funInsights', 'motivationalQuote'
  ];

  // Helper to get translated report type name
  const getTranslatedReportType = () => {
    const reportTypeKey = `reportType_${reportType}`;
    return translate(reportTypeKey);
  };


  return (
    <div className="w-full max-w-4xl p-6 bg-secondary shadow-2xl rounded-xl animate-fade-in">
      <h2 className="text-3xl md:text-4xl font-bold text-accent mb-4 text-center animate-slide-in-up">
        {translate('reportTitle')}
      </h2>
      <p className="text-center text-highlight text-lg mb-6 animate-slide-in-up" style={{animationDelay: '0.2s'}}>
        {translate('reportTypeGenerated', { reportType: getTranslatedReportType() })}
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {reportSectionsOrder.map((key) => {
          const value = personalityReport[key];
          // Skip rendering if value is undefined, null, an empty string, or an empty array
          if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0)) {
            return null;
          }
          // Special handling for error messages within report fields
          if (typeof value === 'string' && (value.startsWith("Insufficient data") || value.startsWith("This aspect was not explored"))) {
             return (
              <ReportSectionCard
                key={key}
                title={translate(`reportSection_${key}`, { defaultValue: key.toString().replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()) })}
                contentItalic={value} // Pass as italic content
              />
            );
          }

          return (
            <ReportSectionCard
              key={key}
              title={translate(`reportSection_${key}`, { defaultValue: key.toString().replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()) })}
              content={value}
            />
          );
        })}
      </div>

      <ExportButtons />

      <p className="text-center text-highlight mt-10 text-lg animate-pulse-subtle">
        {translate('thankYouMessage', { userName: userName || "Explorer" })}
      </p>
    </div>
  );
};

export default ReportView;
