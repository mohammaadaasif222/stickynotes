import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchNoteHistory } from '../../store/slices/noteSlice';
import { Calendar, User, Clock, XIcon } from 'lucide-react';

const NoteHistory = ({ noteId, onClose }) => {
  const dispatch = useDispatch();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      try {
        const result = await dispatch(fetchNoteHistory({ noteId, limit: 10 })).unwrap();
        
        setHistory(result);
      } catch (error) {
        console.error('Failed to load note history:', error);
      } finally {
        setLoading(false);
      }
    };

    if (noteId) {
      loadHistory();
    }
  }, [noteId, dispatch]);

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  if (!noteId) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Note History</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : history.length > 0 ? (
          <div className="space-y-4">
            {history?.map((entry) => (
              <div
                key={entry._id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {entry?.userId?.firstName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{formatDate(entry?.timestamp)}</span>
                  </div>
                </div>

                <div className="ml-6">
                  {entry.changeType === 'major' ? (
                    <span className="text-amber-600 text-xs font-medium px-2 py-1 bg-amber-50 rounded-full">
                      Major Change
                    </span>
                  ) : (
                    <span className="text-blue-600 text-xs font-medium px-2 py-1 bg-blue-50 rounded-full">
                      Minor Change
                    </span>
                  )}
                  
                  <div className="mt-2 text-gray-600">
                    {entry.changes && Object.entries(entry.changes).map(([field, change]) => (
                      <div key={field} className="text-sm">
                        <span className="font-medium">{field}:</span>{' '}
                        {typeof change === 'object' ? (
                          <>
                            <span className="line-through text-red-500">{JSON.stringify(change.old)}</span>
                            {' → '}
                            <span className="text-green-500">{JSON.stringify(change.new)}</span>
                          </>
                        ) : (
                          <span>{JSON.stringify(change)}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No history entries found for this note.
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteHistory;