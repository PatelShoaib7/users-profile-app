import { useEffect, useState } from 'react';
import {
  FiCheckCircle,
  FiDownload,
  FiExternalLink,
  FiFileText,
  FiPlayCircle,
  FiX,
} from 'react-icons/fi';
import { Spinner } from '../loaders/Spinner';
import {
  getYoutubeEmbedUrl,
  resolveMaterialDownloadUrl,
  resolveMaterialViewUrl,
} from '../../utils/formatters';

export const TrainingMediaModal = ({
  open,
  mode = 'video',
  course,
  updating = false,
  onSwitchMode,
  onUpdateProgress,
  onClose,
}) => {
  const [mediaReady, setMediaReady] = useState(false);

  useEffect(() => {
    setMediaReady(false);
  }, [open, mode, course?._id]);

  if (!open || !course) return null;

  const youtubeEmbed = getYoutubeEmbedUrl(course.videoUrl);
  const pdfViewUrl = resolveMaterialViewUrl(course.pdfUrl);
  const pdfDownloadUrl = resolveMaterialDownloadUrl(course.pdfUrl, course.pdfTitle);

  const handleVideoEnded = () => {
    if (course.progress < 100 && onUpdateProgress) {
      onUpdateProgress(100);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-400">
              {course.category} • {course.provider}
            </span>
            <h3 className="text-base sm:text-lg font-bold truncate">{course.courseTitle}</h3>
          </div>

          <div className="flex items-center gap-2">
            {course.videoUrl && (
              <button
                type="button"
                onClick={() => onSwitchMode('video')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  mode === 'video'
                    ? 'bg-teal-500 text-slate-950'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
              >
                <FiPlayCircle className="h-4 w-4" />
                Watch Video
              </button>
            )}

            {course.pdfUrl && (
              <button
                type="button"
                onClick={() => onSwitchMode('pdf')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  mode === 'pdf'
                    ? 'bg-teal-500 text-slate-950'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
              >
                <FiFileText className="h-4 w-4" />
                View PDF
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
              aria-label="Close modal"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {mode === 'video' ? (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-video shadow-inner">
                {!mediaReady && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-slate-950/80 z-10 pointer-events-none">
                    <Spinner size="md" className="text-teal-400" />
                    <span className="mt-2 text-xs text-slate-300">Loading training video...</span>
                  </div>
                )}

                {youtubeEmbed ? (
                  <iframe
                    src={youtubeEmbed}
                    title={course.courseTitle}
                    onLoad={() => setMediaReady(true)}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                ) : (
                  <video
                    key={course.videoUrl}
                    src={course.videoUrl}
                    controls
                    autoPlay
                    onLoadedData={() => setMediaReady(true)}
                    onCanPlay={() => setMediaReady(true)}
                    onEnded={handleVideoEnded}
                    className="w-full h-full object-contain"
                  >
                    Your browser does not support HTML5 video playback.
                  </video>
                )}
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-700">
                    Instructor:{' '}
                    <span className="text-slate-900">
                      {course.instructor || 'PeoplePulse Learning Faculty'}
                    </span>{' '}
                    • Video Length: <span className="text-slate-900">{course.videoDuration || '15 mins'}</span>
                  </p>
                  {course.description && (
                    <p className="text-xs text-slate-600 leading-relaxed">{course.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {course.progress < 100 ? (
                    <>
                      <button
                        type="button"
                        disabled={updating}
                        onClick={() => onUpdateProgress(Math.min(100, (course.progress || 0) + 25))}
                        className="px-3 py-1.5 rounded-lg border border-teal-300 bg-white text-teal-800 text-xs font-semibold hover:bg-teal-50 disabled:opacity-50"
                      >
                        +25% Watched
                      </button>
                      <button
                        type="button"
                        disabled={updating}
                        onClick={() => onUpdateProgress(100)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 disabled:opacity-50"
                      >
                        {updating ? (
                          <Spinner size="xs" />
                        ) : (
                          <FiCheckCircle className="h-3.5 w-3.5" />
                        )}
                        Mark Completed
                      </button>
                    </>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                      <FiCheckCircle className="h-4 w-4" /> 100% Completed
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-800">
                  <FiFileText className="h-4 w-4 text-teal-600 shrink-0" />
                  <span>{course.pdfTitle || 'Session_Reference_Handbook.pdf'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={pdfViewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-100"
                  >
                    Open in New Tab <FiExternalLink className="h-3.5 w-3.5" />
                  </a>

                  <a
                    href={pdfDownloadUrl}
                    download={course.pdfTitle || true}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700"
                  >
                    <FiDownload className="h-3.5 w-3.5" />
                    Download PDF
                  </a>
                </div>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 h-[62vh]">
                {!mediaReady && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 z-10 pointer-events-none">
                    <Spinner size="md" className="text-teal-600" />
                    <span className="mt-2 text-xs text-slate-500">Rendering PDF document...</span>
                  </div>
                )}
                <iframe
                  key={pdfViewUrl}
                  src={pdfViewUrl}
                  title={course.pdfTitle || course.courseTitle}
                  onLoad={() => setMediaReady(true)}
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
