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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {notes.map((note) => (
          <div
            key={note._id}
            className={`border rounded-lg p-4 shadow-sm ${
              note.isDeleted ? 'bg-gray-100 opacity-70' : 'bg-white'
            }`}
          >
            <div className="mb-2 text-sm text-gray-500">
              Last updated: {new Date(note.dateUpdated).toLocaleString()}
            </div>
            <div className="mb-4 h-32 overflow-hidden">
              <p className="whitespace-pre-wrap">{note.content}</p>
            </div>
            <div className="flex justify-between mt-4">
              {!note.isDeleted ? (
                <>
                  <button
                    onClick={() => navigate(`/edit/${note._id}`)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </>
              ) : (
                <div className="text-red-500">Deleted</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotesList;
