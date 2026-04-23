import React, { useState } from 'react';
import { User } from '../types';

interface PastExamsProps {
  user: User;
  onBack: () => void;
}

const GRADES = [
  { id: '5', name: '5. Sınıf' },
  { id: '6', name: '6. Sınıf' },
  { id: '7', name: '7. Sınıf' },
  { id: '8', name: '8. Sınıf (LGS)' },
  { id: '9', name: '9. Sınıf' },
  { id: '10', name: '10. Sınıf' },
  { id: '11', name: '11. Sınıf' },
  { id: '12', name: '12. Sınıf (YKS)' },
];

const EXAM_DATA: Record<string, { title: string; pdfUrl: string; year: string; type: string }[]> = {
  '8': [
    { title: '2026 LGS Sayısal Bölüm Çıkmış Sorular', pdfUrl: 'https://odsgm.meb.gov.tr/', year: '2026', type: 'LGS' },
    { title: '2026 LGS Sözel Bölüm Çıkmış Sorular', pdfUrl: 'https://odsgm.meb.gov.tr/', year: '2026', type: 'LGS' },
    { title: '2026 LGS Hazır Deneme Sınavı 1', pdfUrl: 'https://odsgm.meb.gov.tr/', year: '2026', type: 'Deneme' },
    { title: '2026 LGS Hazır Deneme Sınavı 2', pdfUrl: 'https://odsgm.meb.gov.tr/', year: '2026', type: 'Deneme' },
    { title: '2026 MEB Kazanım Kavrama Testleri', pdfUrl: 'https://odsgm.meb.gov.tr/', year: '2026', type: 'Test' },
  ],
  '12': [
    { title: '2026 YKS TYT Çıkmış Sorular', pdfUrl: 'https://www.osym.gov.tr/', year: '2026', type: 'TYT' },
    { title: '2026 YKS AYT Çıkmış Sorular', pdfUrl: 'https://www.osym.gov.tr/', year: '2026', type: 'AYT' },
    { title: '2026 YKS YDT Çıkmış Sorular', pdfUrl: 'https://www.osym.gov.tr/', year: '2026', type: 'YDT' },
    { title: '2026 TYT Hazır Deneme Sınavı 1', pdfUrl: 'https://www.osym.gov.tr/', year: '2026', type: 'Deneme' },
    { title: '2026 AYT Hazır Deneme Sınavı 1', pdfUrl: 'https://www.osym.gov.tr/', year: '2026', type: 'Deneme' },
  ]
};

const VIDEO_DATA: Record<string, { title: string; videoUrl: string; duration: string; type: string; category: string }[]> = {
  '8': [
    // Çıkmış Soru Çözümleri
    { title: 'LGS Matematik Çıkmış Soru Çözümleri', videoUrl: 'https://www.youtube.com/results?search_query=lgs+matematik+cikmis+sorular', duration: '45:20', type: 'Soru Çözümü', category: 'Çıkmış Soru Çözümleri' },
    { title: 'LGS Fen Bilimleri Çıkmış Soru Çözümleri', videoUrl: 'https://www.youtube.com/results?search_query=lgs+fen+cikmis+sorular', duration: '38:15', type: 'Soru Çözümü', category: 'Çıkmış Soru Çözümleri' },
    { title: 'LGS Türkçe Çıkmış Soru Çözümleri', videoUrl: 'https://www.youtube.com/results?search_query=lgs+turkce+cikmis+sorular', duration: '42:10', type: 'Soru Çözümü', category: 'Çıkmış Soru Çözümleri' },
    
    // Çıkabilecek Sorular & Testler
    { title: 'LGS Matematik Kesin Çıkacak Soru Tipleri', videoUrl: 'https://www.youtube.com/results?search_query=lgs+matematik+cikabilecek+sorular', duration: '25:00', type: 'Tahmin', category: 'Çıkabilecek Sorular & Testler' },
    { title: 'LGS Fen Bilimleri Deneme Testi Çözümü', videoUrl: 'https://www.youtube.com/results?search_query=lgs+fen+deneme+cozumu', duration: '30:45', type: 'Test Çözümü', category: 'Çıkabilecek Sorular & Testler' },
    { title: 'LGS İnkılap Tarihi MEB Örnek Sorular Testi', videoUrl: 'https://www.youtube.com/results?search_query=lgs+inkilap+ornek+sorular', duration: '22:15', type: 'Test Çözümü', category: 'Çıkabilecek Sorular & Testler' },
    
    // Konu Anlatımı & Tekrar
    { title: 'LGS Matematik Çarpanlar ve Katlar Konu Anlatımı', videoUrl: 'https://www.youtube.com/results?search_query=lgs+matematik+carpanlar+ve+katlar', duration: '18:30', type: 'Konu Anlatımı', category: 'Konu Anlatımı & Tekrar' },
    { title: 'LGS Fen Bilimleri DNA ve Genetik Kod Full Tekrar', videoUrl: 'https://www.youtube.com/results?search_query=lgs+fen+dna+genetik+kod', duration: '45:00', type: 'Genel Tekrar', category: 'Konu Anlatımı & Tekrar' },
    { title: 'LGS Türkçe Fiilimsiler Konu Anlatımı', videoUrl: 'https://www.youtube.com/results?search_query=lgs+turkce+fiilimsiler', duration: '28:10', type: 'Konu Anlatımı', category: 'Konu Anlatımı & Tekrar' },
  ],
  '12': [
    // Çıkmış Soru Çözümleri
    { title: 'TYT Matematik Çıkmış Soru Çözümleri', videoUrl: 'https://www.youtube.com/results?search_query=tyt+matematik+cikmis+sorular', duration: '55:10', type: 'Soru Çözümü', category: 'Çıkmış Soru Çözümleri' },
    { title: 'AYT Matematik Çıkmış Soru Çözümleri', videoUrl: 'https://www.youtube.com/results?search_query=ayt+matematik+cikmis+sorular', duration: '1:10:05', type: 'Soru Çözümü', category: 'Çıkmış Soru Çözümleri' },
    { title: 'TYT Türkçe Çıkmış Paragraf Soruları', videoUrl: 'https://www.youtube.com/results?search_query=tyt+turkce+cikmis+paragraf', duration: '40:20', type: 'Soru Çözümü', category: 'Çıkmış Soru Çözümleri' },
    { title: 'AYT Fizik Çıkmış Soru Çözümleri', videoUrl: 'https://www.youtube.com/results?search_query=ayt+fizik+cikmis+sorular', duration: '48:15', type: 'Soru Çözümü', category: 'Çıkmış Soru Çözümleri' },
    
    // Çıkabilecek Sorular & Testler
    { title: 'TYT Matematik İlk 10 Soru Kesin Çıkacaklar', videoUrl: 'https://www.youtube.com/results?search_query=tyt+matematik+ilk+10+soru', duration: '32:40', type: 'Tahmin', category: 'Çıkabilecek Sorular & Testler' },
    { title: 'AYT Kimya Organik Kimya Test Çözümü', videoUrl: 'https://www.youtube.com/results?search_query=ayt+kimya+organik+test+cozumu', duration: '45:00', type: 'Test Çözümü', category: 'Çıkabilecek Sorular & Testler' },
    { title: 'TYT Sosyal Bilimler Türkiye Geneli Deneme Çözümü', videoUrl: 'https://www.youtube.com/results?search_query=tyt+sosyal+deneme+cozumu', duration: '50:15', type: 'Test Çözümü', category: 'Çıkabilecek Sorular & Testler' },
    { title: 'AYT Biyoloji Sistemler Çıkabilecek Soru Tipleri', videoUrl: 'https://www.youtube.com/results?search_query=ayt+biyoloji+sistemler+soru+tipleri', duration: '35:20', type: 'Tahmin', category: 'Çıkabilecek Sorular & Testler' },
    
    // Konu Anlatımı & Tekrar
    { title: 'TYT Matematik Problemler Full Tekrar', videoUrl: 'https://www.youtube.com/results?search_query=tyt+matematik+problemler+tekrar', duration: '1:45:00', type: 'Genel Tekrar', category: 'Konu Anlatımı & Tekrar' },
    { title: 'AYT Edebiyat Cumhuriyet Dönemi Konu Anlatımı', videoUrl: 'https://www.youtube.com/results?search_query=ayt+edebiyat+cumhuriyet+donemi', duration: '1:20:00', type: 'Konu Anlatımı', category: 'Konu Anlatımı & Tekrar' },
    { title: 'TYT Fen Bilimleri Sınav Öncesi Son Tekrar', videoUrl: 'https://www.youtube.com/results?search_query=tyt+fen+son+tekrar', duration: '2:15:00', type: 'Genel Tekrar', category: 'Konu Anlatımı & Tekrar' },
  ]
};

// Fallback data for other grades
const getExamsForGrade = (gradeId: string) => {
  if (EXAM_DATA[gradeId]) return EXAM_DATA[gradeId];
  
  return [
    { title: `${gradeId}. Sınıf 1. Dönem 1. Ortak Sınav Soruları`, pdfUrl: 'https://odsgm.meb.gov.tr/', year: '2026', type: 'MEB Ortak' },
    { title: `${gradeId}. Sınıf 1. Dönem 2. Ortak Sınav Soruları`, pdfUrl: 'https://odsgm.meb.gov.tr/', year: '2026', type: 'MEB Ortak' },
    { title: `${gradeId}. Sınıf 2. Dönem 1. Ortak Sınav Soruları`, pdfUrl: 'https://odsgm.meb.gov.tr/', year: '2026', type: 'MEB Ortak' },
    { title: `${gradeId}. Sınıf Hazır Kazanım Kavrama Testleri`, pdfUrl: 'https://odsgm.meb.gov.tr/', year: '2026', type: 'Test' },
    { title: `${gradeId}. Sınıf Hazır Deneme Sınavı 1`, pdfUrl: 'https://odsgm.meb.gov.tr/', year: '2026', type: 'Deneme' },
    { title: `${gradeId}. Sınıf Hazır Deneme Sınavı 2`, pdfUrl: 'https://odsgm.meb.gov.tr/', year: '2026', type: 'Deneme' },
  ];
};

const getVideosForGrade = (gradeId: string) => {
  if (VIDEO_DATA[gradeId]) return VIDEO_DATA[gradeId];
  
  return [
    { title: `${gradeId}. Sınıf Matematik Çıkmış Soru Çözümleri`, videoUrl: `https://www.youtube.com/results?search_query=${gradeId}.sinif+matematik+cikmis+sorular`, duration: '25:00', type: 'Soru Çözümü', category: 'Çıkmış Soru Çözümleri' },
    { title: `${gradeId}. Sınıf 1. Dönem 1. Yazılı Çıkabilecek Sorular`, videoUrl: `https://www.youtube.com/results?search_query=${gradeId}.sinif+1.donem+1.yazili`, duration: '20:00', type: 'Yazılı Hazırlık', category: 'Çıkabilecek Sorular & Testler' },
    { title: `${gradeId}. Sınıf 1. Dönem 2. Yazılı Test Çözümü`, videoUrl: `https://www.youtube.com/results?search_query=${gradeId}.sinif+1.donem+2.yazili+test`, duration: '22:15', type: 'Test Çözümü', category: 'Çıkabilecek Sorular & Testler' },
    { title: `${gradeId}. Sınıf Matematik Genel Tekrar ve Konu Anlatımı`, videoUrl: `https://www.youtube.com/results?search_query=${gradeId}.sinif+matematik+genel+tekrar`, duration: '35:20', type: 'Genel Tekrar', category: 'Konu Anlatımı & Tekrar' },
  ];
};

export const PastExams: React.FC<PastExamsProps> = ({ user, onBack }) => {
  const [selectedGrade, setSelectedGrade] = useState<string>(user.grade ? user.grade.toString() : '8');
  const [activeTab, setActiveTab] = useState<'pdf' | 'video'>('pdf');
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const exams = getExamsForGrade(selectedGrade);
  const videos = getVideosForGrade(selectedGrade);

  const handleDownload = (url: string, idx: number) => {
    if (downloadingId !== null) return;
    setDownloadingId(idx);
    
    // Simulate download animation delay (1.5 seconds)
    setTimeout(() => {
      window.open(url, '_blank');
      setDownloadingId(null);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white font-display flex flex-col">
      <header className="p-6 flex items-center gap-4 border-b border-white/5 shrink-0">
        <button onClick={onBack} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center active:scale-90 transition-transform">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 className="text-2xl font-black italic uppercase tracking-tighter leading-none">ÇIKMIŞ SORULAR</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">ARŞİV VE VİDEOLAR</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32">
        
        {/* Sınıf Seçimi */}
        <div className="bg-[#1e293b] p-4 rounded-3xl border border-white/5">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">SINIF SEÇİMİ</h2>
          <div className="grid grid-cols-4 gap-2">
            {GRADES.map(grade => (
              <button
                key={grade.id}
                onClick={() => setSelectedGrade(grade.id)}
                className={`px-3 py-3 rounded-2xl font-black text-[10px] uppercase transition-all border-2 ${
                  selectedGrade === grade.id 
                    ? 'bg-primary border-primary text-white shadow-glow' 
                    : 'bg-black/20 border-white/5 text-slate-400 hover:border-white/20'
                }`}
              >
                {grade.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Seçimi */}
        <div className="flex bg-[#1e293b] p-1 rounded-2xl border border-white/5">
          <button 
            onClick={() => setActiveTab('pdf')}
            className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'pdf' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            PDF DÖKÜMANLARI
          </button>
          <button 
            onClick={() => setActiveTab('video')}
            className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'video' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-slate-400 hover:text-white'}`}
          >
            VİDEO ÇÖZÜMLERİ
          </button>
        </div>

        {/* Sınav Listesi */}
        {activeTab === 'pdf' && (
          <div className="animate-in fade-in zoom-in-95 duration-10000">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                {GRADES.find(g => g.id === selectedGrade)?.name} DÖKÜMANLARI
              </h2>
              <span className="text-[10px] font-black text-primary bg-primary/20 px-3 py-1 rounded-full">
                {exams.length} BELGE
              </span>
            </div>

            <div className="grid gap-4">
              {exams.map((exam, idx) => (
                <div key={idx} className="bg-[#1e293b] p-5 rounded-[2rem] border border-white/5 flex items-center gap-4 group hover:border-primary/50 transition-all">
                  <div className="w-14 h-14 bg-red-500/20 rounded-2xl flex items-center justify-center text-red-500 shrink-0">
                    <span className="material-symbols-outlined text-3xl">picture_as_pdf</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-sm uppercase italic truncate">{exam.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-md">{exam.year}</span>
                      <span className="text-[9px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-md">{exam.type}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDownload(exam.pdfUrl, idx)}
                    disabled={downloadingId !== null}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-glow active:scale-90 transition-all shrink-0 ${
                      downloadingId === idx 
                        ? 'bg-green-500 text-white scale-95 shadow-green-500/30' 
                        : 'bg-primary text-white'
                    }`}
                  >
                    {downloadingId === idx ? (
                      <span className="material-symbols-outlined animate-spin">autorenew</span>
                    ) : (
                      <span className="material-symbols-outlined">download</span>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Video Listesi */}
        {activeTab === 'video' && (
          <div className="animate-in fade-in zoom-in-95 duration-10000 space-y-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                {GRADES.find(g => g.id === selectedGrade)?.name} VİDEOLARI
              </h2>
              <span className="text-[10px] font-black text-red-500 bg-red-500/20 px-3 py-1 rounded-full">
                {videos.length} VİDEO
              </span>
            </div>

            {Object.entries(
              videos.reduce((acc, video) => {
                if (!acc[video.category]) acc[video.category] = [];
                acc[video.category].push(video);
                return acc;
              }, {} as Record<string, typeof videos>)
            ).map(([category, catVideos]) => (
              <div key={category} className="space-y-4">
                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
                  <span className="material-symbols-outlined text-red-500">play_circle</span>
                  {category}
                </h3>
                <div className="grid gap-4">
                  {catVideos.map((video, idx) => (
                    <div key={idx} className="bg-[#1e293b] p-5 rounded-[2rem] border border-white/5 flex items-center gap-4 group hover:border-red-500/50 transition-all">
                      <div className="w-14 h-14 bg-red-500/20 rounded-2xl flex items-center justify-center text-red-500 shrink-0 relative overflow-hidden">
                        <span className="material-symbols-outlined text-3xl relative z-10">play_arrow</span>
                        <div className="absolute inset-0 bg-red-500/20 blur-xl group-hover:bg-red-500/40 transition-colors"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-sm uppercase italic truncate">{video.title}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <span className="material-symbols-outlined text-[10px]">schedule</span>
                            {video.duration}
                          </span>
                          <span className="text-[9px] font-black text-red-400 uppercase tracking-widest bg-red-500/10 px-2 py-0.5 rounded-md">{video.type}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleDownload(video.videoUrl, idx + 2000)}
                          disabled={downloadingId !== null}
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/30 active:scale-90 transition-transform shrink-0 ${
                            downloadingId === idx + 2000
                              ? 'bg-green-500 text-white scale-95 shadow-green-500/30' 
                              : 'bg-red-500 text-white'
                          }`}
                        >
                          {downloadingId === idx + 2000 ? (
                            <span className="material-symbols-outlined animate-spin">autorenew</span>
                          ) : (
                            <span className="material-symbols-outlined">smart_display</span>
                          )}
                        </button>
                        <button 
                          onClick={() => handleDownload(video.videoUrl, idx + 1000)}
                          disabled={downloadingId !== null}
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-glow active:scale-90 transition-all shrink-0 ${
                            downloadingId === idx + 1000
                              ? 'bg-green-500 text-white scale-95 shadow-green-500/30' 
                              : 'bg-white/10 text-white hover:bg-white/20'
                          }`}
                        >
                          {downloadingId === idx + 1000 ? (
                            <span className="material-symbols-outlined animate-spin">autorenew</span>
                          ) : (
                            <span className="material-symbols-outlined">download</span>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
