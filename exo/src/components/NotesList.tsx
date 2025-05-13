import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { useUser } from '@clerk/clerk-react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

interface Note {
  _id: Id<'notes'>;
  content: string;
  dateCreated: number;
  dateUpdated: number;
  isDeleted: boolean;
  userId: string;
}

const NotesList: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [showDeleted, setShowDeleted] = useState(false);

  const notes = useQuery(api.notes.list, { showDeleted }) as Note[] | undefined;

  const removeNote = useMutation(api.notes.remove);

  const handleDeleteNote = async (noteId: Id<'notes'>) => {
    try {
      await removeNote({ id: noteId });
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note. Please try again.');
    }
  };

  if (!notes) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading notes...</div>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-semibold mb-4">No Notes Found</h2>
        <p className="text-gray-600 mb-4">
          You don't have any notes yet. Create your first note!
        </p>
        <button
          onClick={() => navigate('/new')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Create Note
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Your Notes</h2>
        <div className="flex items-center">
          <label className="flex items-center mr-4">
            <input
              type="checkbox"
              checked={showDeleted}
              onChange={() => setShowDeleted(!showDeleted)}
              className="mr-2"
            />
            Show Deleted Notes
          </label>
          <button
            onClick={() => navigate('/new')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            New Note
          </button>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {notes.map((note) => (
          <div
            key={note._id}
            className={`relative overflow-hidden rounded-xl p-5 transition-all duration-300 hover:shadow-lg ${
              note.isDeleted 
                ? 'bg-gray-50 border border-gray-200' 
                : 'bg-white border border-gray-100 hover:border-blue-200'
            }`}
          >
            {/* Status indicator dot */}
            <div className={`absolute top-3 right-3 h-2 w-2 rounded-full ${note.isDeleted ? 'bg-gray-300' : 'bg-green-400'}`}></div>
            
            {/* Date badge */}
            <div className="flex items-center mb-3 text-xs font-medium text-gray-500">
              <svg className="mr-1 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(note.dateUpdated).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            
            {/* Note content with truncation */}
            <div className="mb-4">
              <p className="text-gray-700 whitespace-pre-wrap">
                {note.content.length > 100 
                  ? `${note.content.substring(0, 100)}...` 
                  : note.content
                }
              </p>
            </div>
            
            {/* Action buttons */}
            <div className={`mt-4 pt-3 border-t border-gray-100 flex ${note.isDeleted ? 'justify-end' : 'justify-between'}`}>
              {!note.isDeleted ? (
                <>
                  <button
                    onClick={() => navigate(`/edit/${note._id}`)}
                    className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note._id)}
                    className="inline-flex items-center text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
                  >
                    <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </>
              ) : (
                <div className="inline-flex items-center text-sm font-medium text-red-500">
                  <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Deleted
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotesList;
