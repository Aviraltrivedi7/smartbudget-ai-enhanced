
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from '@/contexts/LanguageContext';
import { languages } from '@/utils/languages';

const LanguageSelector: React.FC = () => {
  const { currentLanguage, setLanguage, t } = useLanguage();
  const { toast } = useToast();

  const handleLanguageChange = (languageCode: string) => {
    setLanguage(languageCode);
    
    const language = languages.find(lang => lang.code === languageCode);
    
    toast({
      title: `${t('languageChanged')} 🌐`,
      description: `${t('languageChanged')}: ${language?.nativeName}`,
    });
  };

  const selectedLanguage = languages.find(lang => lang.code === currentLanguage);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">{t('language')}:</span>
      <Select value={currentLanguage} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-40">
          <SelectValue>
            {selectedLanguage && (
              <div className="flex items-center gap-2">
                <span>{selectedLanguage.flag}</span>
                <span className="truncate">{selectedLanguage.nativeName}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[300px] overflow-y-auto bg-popover">
          {languages.map((language) => (
            <SelectItem key={language.code} value={language.code}>
              <div className="flex items-center gap-2">
                <span>{language.flag}</span>
                <div className="flex flex-col">
                  <span className="font-medium">{language.nativeName}</span>
                  <span className="text-xs text-muted-foreground">{language.name}</span>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelector;
