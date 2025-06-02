import React from 'react';

interface ReportSectionCardProps {
  title: string;
  content?: string | string[] | undefined;
  contentItalic?: string; // For special messages like "insufficient data"
  icon?: string; 
}

const ReportSectionCard: React.FC<ReportSectionCardProps> = ({ title, content, contentItalic, icon }) => {
  if (!content && !contentItalic) {
    return null;
  }
  if (Array.isArray(content) && content.length === 0 && !contentItalic) {
    return null;
  }


  const renderContent = () => {
    if (contentItalic) {
      return <p className="text-lightText/70 italic whitespace-pre-wrap">{contentItalic}</p>;
    }
    if (Array.isArray(content)) {
      return (
        <ul className="list-disc list-inside space-y-1 text-lightText/90">
          {content.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );
    }
    return <p className="text-lightText/90 whitespace-pre-wrap">{content}</p>;
  };

  return (
    <div className="bg-primary p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 animate-slide-in-up">
      <h3 className="text-xl font-semibold text-accent mb-3 flex items-center">
        {icon && <i className={`${icon} mr-3 text-highlight`}></i>}
        {title}
      </h3>
      {renderContent()}
    </div>
  );
};

export default ReportSectionCard;
